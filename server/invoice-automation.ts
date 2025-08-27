import { storage } from './storage';
import { emailService } from './email-service';
import type { 
  RecurringInvoiceTemplate, 
  InsertInvoice, 
  InsertAutomatedJob, 
  Customer,
  Company 
} from '@shared/schema';

export class InvoiceAutomationService {
  
  // Generate invoice from recurring template
  async generateInvoiceFromTemplate(templateId: number): Promise<number | null> {
    try {
      const template = await storage.getRecurringInvoiceTemplate(templateId);
      if (!template || !template.isActive) {
        console.log(`Template ${templateId} not found or inactive`);
        return null;
      }

      const customer = await storage.getCustomer(template.customerId);
      if (!customer) {
        console.error(`Customer ${template.customerId} not found for template ${templateId}`);
        return null;
      }

      // Generate next invoice number
      const invoiceNumber = await this.generateInvoiceNumber(template.companyId);
      
      // Calculate dates
      const invoiceDate = new Date().toISOString().split('T')[0];
      const dueDate = this.calculateDueDate(invoiceDate, template.paymentTerms);

      // Create invoice data
      const invoiceData: InsertInvoice = {
        companyId: template.companyId,
        customerId: template.customerId,
        invoiceNumber,
        invoiceDate,
        dueDate,
        amount: template.totalAmount,
        paidAmount: "0.00",
        status: "draft",
        notes: template.description || `Generated from recurring template: ${template.templateName}`,
        lineItems: template.lineItems,
        taxRate: template.taxRate,
        taxAmount: template.taxAmount,
        subtotal: template.subtotal,
        emailSent: false,
        recurringTemplateId: template.id
      };

      const invoiceId = await storage.createInvoice(invoiceData);
      
      // Update template's last generation date and next generation date
      await this.updateTemplateGenerationDates(template);

      // Schedule email sending if auto-send is enabled
      if (template.autoSendEmail && invoiceId) {
        await this.scheduleEmailJob(invoiceId, template.companyId);
      }

      console.log(`Invoice ${invoiceNumber} generated from template ${template.templateName}`);
      return invoiceId;
    } catch (error) {
      console.error(`Error generating invoice from template ${templateId}:`, error);
      return null;
    }
  }

  // Send invoice email
  async sendInvoiceEmail(invoiceId: number): Promise<boolean> {
    try {
      const invoice = await storage.getInvoice(invoiceId);
      if (!invoice) {
        console.error(`Invoice ${invoiceId} not found`);
        return false;
      }

      const customer = await storage.getCustomer(invoice.customerId);
      const company = await storage.getCompany(invoice.companyId);
      
      if (!customer?.email || !company) {
        console.error(`Missing customer email or company for invoice ${invoiceId}`);
        return false;
      }

      // Get template for custom email content
      let emailSubject = `Invoice ${invoice.invoiceNumber} from ${company.name}`;
      let emailBody = this.getDefaultInvoiceEmailBody(invoice, customer, company);

      if (invoice.recurringTemplateId) {
        const template = await storage.getRecurringInvoiceTemplate(invoice.recurringTemplateId);
        if (template?.emailSubject) emailSubject = template.emailSubject;
        if (template?.emailBody) emailBody = template.emailBody;
      }

      // Replace placeholders
      emailSubject = this.replacePlaceholders(emailSubject, invoice, customer, company);
      emailBody = this.replacePlaceholders(emailBody, invoice, customer, company);

      // Send email using company's SMTP settings
      const success = await emailService.sendInvoiceEmail({
        invoice,
        customer,
        company,
        subject: emailSubject,
        body: emailBody
      });

      if (success) {
        // Mark invoice as sent and update email sent status
        await storage.updateInvoice(invoiceId, {
          status: "sent",
          emailSent: true,
          emailSentAt: new Date()
        });
        console.log(`Invoice email sent for ${invoice.invoiceNumber}`);
      }

      return success;
    } catch (error) {
      console.error(`Error sending invoice email for ${invoiceId}:`, error);
      return false;
    }
  }

  // Process due invoice generation jobs
  async processRecurringInvoices(companyId?: number): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const templates = await storage.getRecurringInvoiceTemplatesDue(today, companyId);
      
      console.log(`Found ${templates.length} recurring templates due for generation`);

      for (const template of templates) {
        const invoiceId = await this.generateInvoiceFromTemplate(template.id);
        if (invoiceId) {
          console.log(`Generated invoice ${invoiceId} from template ${template.templateName}`);
        }
      }
    } catch (error) {
      console.error('Error processing recurring invoices:', error);
    }
  }

  // Process pending email jobs
  async processPendingEmailJobs(companyId?: number): Promise<void> {
    try {
      const pendingJobs = await storage.getPendingEmailJobs(companyId);
      
      console.log(`Found ${pendingJobs.length} pending email jobs`);

      for (const job of pendingJobs) {
        try {
          await storage.updateAutomatedJob(job.id, { status: "processing" });
          
          let success = false;
          if (job.jobType === "send_invoice_email") {
            success = await this.sendInvoiceEmail(job.relatedId);
          }

          await storage.updateAutomatedJob(job.id, {
            status: success ? "completed" : "failed",
            processedAt: new Date(),
            errorMessage: success ? undefined : "Email sending failed"
          });
        } catch (error: any) {
          await storage.updateAutomatedJob(job.id, {
            status: "failed",
            processedAt: new Date(),
            errorMessage: error.message,
            retryCount: (job.retryCount || 0) + 1
          });
        }
      }
    } catch (error) {
      console.error('Error processing pending email jobs:', error);
    }
  }

  // Helper methods
  private async generateInvoiceNumber(companyId: number): Promise<string> {
    const currentYear = new Date().getFullYear();
    const invoiceCount = await storage.getInvoiceCountForYear(companyId, currentYear);
    return `INV-${currentYear}-${String(invoiceCount + 1).padStart(4, '0')}`;
  }

  private calculateDueDate(invoiceDate: string, paymentTerms: string): string {
    const date = new Date(invoiceDate);
    
    // Parse payment terms (e.g., "Net 30", "Net 15", "Due on receipt")
    const termMatch = paymentTerms.match(/Net (\d+)/i);
    const days = termMatch ? parseInt(termMatch[1]) : 30;
    
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  private async updateTemplateGenerationDates(template: RecurringInvoiceTemplate): Promise<void> {
    const today = new Date();
    const nextDate = this.calculateNextGenerationDate(today, template.frequency);
    
    await storage.updateRecurringInvoiceTemplate(template.id, {
      lastGeneratedDate: today.toISOString().split('T')[0],
      nextGenerationDate: nextDate.toISOString().split('T')[0]
    });
  }

  private calculateNextGenerationDate(currentDate: Date, frequency: string): Date {
    const nextDate = new Date(currentDate);
    
    switch (frequency.toLowerCase()) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 1); // Default to monthly
    }
    
    return nextDate;
  }

  private async scheduleEmailJob(invoiceId: number, companyId: number): Promise<void> {
    const jobData: InsertAutomatedJob = {
      companyId,
      jobType: "send_invoice_email",
      status: "pending",
      scheduledFor: new Date(), // Send immediately
      relatedId: invoiceId,
      payload: { invoiceId }
    };

    await storage.createAutomatedJob(jobData);
  }

  private getDefaultInvoiceEmailBody(invoice: any, customer: Customer, company: Company): string {
    return `Dear ${customer.name},

Please find attached your invoice ${invoice.invoiceNumber} for the amount of $${parseFloat(invoice.amount).toFixed(2)}.

Invoice Details:
- Invoice Number: ${invoice.invoiceNumber}
- Invoice Date: ${invoice.invoiceDate}
- Due Date: ${invoice.dueDate}
- Amount Due: $${parseFloat(invoice.amount).toFixed(2)}

Payment terms: ${invoice.paymentTerms || 'Net 30'}

Please remit payment by the due date to avoid any late fees.

If you have any questions about this invoice, please contact us.

Thank you for your business.

Best regards,
${company.name}`;
  }

  private replacePlaceholders(text: string, invoice: any, customer: Customer, company: Company): string {
    return text
      .replace(/\[CUSTOMER_NAME\]/g, customer.name)
      .replace(/\[COMPANY_NAME\]/g, company.name)
      .replace(/\[INVOICE_NUMBER\]/g, invoice.invoiceNumber)
      .replace(/\[INVOICE_DATE\]/g, invoice.invoiceDate)
      .replace(/\[DUE_DATE\]/g, invoice.dueDate)
      .replace(/\[AMOUNT_DUE\]/g, parseFloat(invoice.amount).toFixed(2))
      .replace(/\[SUBTOTAL\]/g, parseFloat(invoice.subtotal || invoice.amount).toFixed(2))
      .replace(/\[TAX_AMOUNT\]/g, parseFloat(invoice.taxAmount || '0').toFixed(2));
  }
}

export const invoiceAutomationService = new InvoiceAutomationService();