import { createTransporter } from './email-config';
import nodemailer from 'nodemailer';
import type { Customer, Company } from '@shared/schema';
import { storage } from './storage';

export interface PaymentReminderData {
  customer: Customer;
  balanceDue: number;
  daysOverdue: number;
  invoiceNumbers?: string[];
  dueDate?: Date;
  companyId: number;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {

  private transporter: any;

  constructor() {
    this.transporter = createTransporter();
  }

  async sendPaymentReminder(data: PaymentReminderData, template?: EmailTemplate): Promise<boolean> {
    try {
      // Get company-specific SMTP configuration
      const company = await storage.getCompany(data.companyId);
      if (!company) {
        console.error('Company not found for payment reminder');
        return false;
      }

      // Create transporter with company SMTP settings or fallback to default
      const transporter = await this.createCompanyTransporter(company);
      
      const emailTemplate = template || this.getPaymentReminderTemplate(data, company);
      
      const fromEmail = (company as any).smtpFromEmail || process.env.SMTP_FROM_EMAIL || process.env.GOOGLE_WORKSPACE_EMAIL || 'noreply@yourcompany.com';
      const fromName = (company as any).smtpFromName || company.name || 'Accounts Team';
      
      const mailOptions = {
        from: `${fromName} <${fromEmail}>`,
        to: data.customer.email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      };

      console.log(`Sending payment reminder to ${data.customer.email} from ${mailOptions.from}`);
      const result = await transporter.sendMail(mailOptions);
      console.log('Payment reminder email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send payment reminder email:', error);
      return false;
    }
  }

  private async createCompanyTransporter(company: Company) {
    // Use company SMTP settings if configured
    if ((company as any).smtpHost && (company as any).smtpUser && (company as any).smtpPassword) {
      return nodemailer.createTransport({
        host: (company as any).smtpHost,
        port: (company as any).smtpPort || 587,
        secure: (company as any).smtpSecure || false,
        auth: {
          user: (company as any).smtpUser,
          pass: (company as any).smtpPassword,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }
    
    // Fallback to default system configuration
    return this.transporter;
  }

  private getPaymentReminderTemplate(data: PaymentReminderData, company: Company): EmailTemplate {
    // Use company custom template if available
    const customSubject = (company as any).paymentReminderSubject;
    const customTemplate = (company as any).paymentReminderTemplate;
    
    if (customSubject && customTemplate) {
      // Replace placeholders in custom template
      const subject = this.replacePlaceholders(customSubject, data, company);
      const text = this.replacePlaceholders(customTemplate, data, company);
      const html = this.convertTextToHtml(text);
      
      return { subject, text, html };
    }
    
    // Fallback to default template
    return this.getDefaultPaymentReminderTemplate(data);
  }

  private replacePlaceholders(template: string, data: PaymentReminderData, company: Company): string {
    return template
      .replace(/\[CUSTOMER_NAME\]/g, data.customer.name)
      .replace(/\[COMPANY_NAME\]/g, company.name)
      .replace(/\[AMOUNT_DUE\]/g, data.balanceDue.toFixed(2))
      .replace(/\[DAYS_OVERDUE\]/g, data.daysOverdue.toString())
      .replace(/\[DUE_DATE\]/g, data.dueDate ? data.dueDate.toLocaleDateString() : 'N/A')
      .replace(/\[INVOICE_NUMBERS\]/g, data.invoiceNumbers?.join(', ') || 'N/A');
  }

  private convertTextToHtml(text: string): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        ${text.split('\n').map(line => `<p>${line}</p>`).join('')}
    </div>
</body>
</html>`;
  }

  private getDefaultPaymentReminderTemplate(data: PaymentReminderData): EmailTemplate {
    const { customer, balanceDue, daysOverdue, invoiceNumbers } = data;
    
    const subject = `Payment Reminder - Outstanding Balance $${balanceDue.toFixed(2)}`;
    
    const invoiceText = invoiceNumbers && invoiceNumbers.length > 0 
      ? `for invoice(s) ${invoiceNumbers.join(', ')}` 
      : '';
    
    const text = `
Dear ${customer.name},

This is a friendly reminder that you have an outstanding balance of $${balanceDue.toFixed(2)} ${invoiceText}.

${daysOverdue > 0 ? `This payment is ${daysOverdue} days overdue.` : 'This payment is now due.'}

Please process this payment at your earliest convenience. If you have any questions or concerns, please don't hesitate to contact us.

Thank you for your business.

Best regards,
Accounts Receivable Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .amount { font-size: 1.2em; font-weight: bold; color: #dc3545; }
        .overdue { color: #dc3545; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Payment Reminder</h2>
        </div>
        
        <p>Dear ${customer.name},</p>
        
        <p>This is a friendly reminder that you have an outstanding balance of 
        <span class="amount">$${balanceDue.toFixed(2)}</span> ${invoiceText}.</p>
        
        ${daysOverdue > 0 ? 
          `<p class="overdue">This payment is ${daysOverdue} days overdue.</p>` : 
          '<p>This payment is now due.</p>'
        }
        
        <p>Please process this payment at your earliest convenience. If you have any questions or concerns, please don't hesitate to contact us.</p>
        
        <p>Thank you for your business.</p>
        
        <div class="footer">
            <p>Best regards,<br>
            Accounts Receivable Team</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    return { subject, text, html };
  }

  async testEmailConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email server connection verified');
      return true;
    } catch (error) {
      console.error('Email server connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();