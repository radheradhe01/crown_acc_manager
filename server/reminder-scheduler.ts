import { storage } from './storage';
import { emailService, type PaymentReminderData } from './email-service';
import { eq, and, lte, gte } from 'drizzle-orm';

export interface ReminderRule {
  id: number;
  companyId: number;
  name: string;
  daysAfterDue: number; // Send reminder X days after due date
  isActive: boolean;
  emailTemplate?: string;
  createdAt: Date;
}

export class ReminderScheduler {
  async processPaymentReminders(companyId: number): Promise<void> {
    try {
      console.log(`Processing payment reminders for company ${companyId}`);
      
      // Get customers with outstanding balances
      const customersWithBalance = await this.getCustomersWithOutstandingBalance(companyId);
      
      if (customersWithBalance.length === 0) {
        console.log('No customers with outstanding balances found');
        return;
      }

      console.log(`Found ${customersWithBalance.length} customers with outstanding balances`);

      for (const customerData of customersWithBalance) {
        await this.sendReminderIfDue(customerData);
      }
    } catch (error) {
      console.error('Error processing payment reminders:', error);
    }
  }

  private async getCustomersWithOutstandingBalance(companyId: number): Promise<PaymentReminderData[]> {
    // Get customers with outstanding invoices
    const customers = await storage.getCustomers(companyId);
    const reminderData: PaymentReminderData[] = [];

    for (const customer of customers) {
      if (!customer.email) continue; // Skip customers without email

      // Get outstanding invoices for this customer
      const invoices = await storage.getInvoices(companyId);
      const customerInvoices = invoices.filter(inv => 
        inv.customerId === customer.id && 
        inv.status === 'sent' &&
        inv.amountDue > 0
      );

      if (customerInvoices.length === 0) continue;

      const totalDue = customerInvoices.reduce((sum, inv) => sum + inv.amountDue, 0);
      const oldestInvoice = customerInvoices.sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )[0];

      const daysOverdue = this.calculateDaysOverdue(oldestInvoice.dueDate);
      
      reminderData.push({
        customer,
        balanceDue: totalDue,
        daysOverdue: Math.max(0, daysOverdue),
        invoiceNumbers: customerInvoices.map(inv => inv.invoiceNumber),
        dueDate: new Date(oldestInvoice.dueDate)
      });
    }

    return reminderData;
  }

  private calculateDaysOverdue(dueDate: Date): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private async sendReminderIfDue(data: PaymentReminderData): Promise<void> {
    try {
      // Check if reminder should be sent based on days overdue
      const shouldSend = this.shouldSendReminder(data.daysOverdue);
      
      if (!shouldSend) {
        return;
      }

      // Check if we've already sent a reminder recently (avoid spam)
      const lastReminderSent = await this.getLastReminderSent(data.customer.id);
      if (lastReminderSent && this.isRecentlySent(lastReminderSent)) {
        console.log(`Skipping reminder for ${data.customer.name} - recently sent`);
        return;
      }

      // Send the reminder
      const success = await emailService.sendPaymentReminder(data);
      
      if (success) {
        await this.recordReminderSent(data.customer.id);
        console.log(`Payment reminder sent to ${data.customer.name} (${data.customer.email})`);
      } else {
        console.error(`Failed to send reminder to ${data.customer.name}`);
      }
    } catch (error) {
      console.error(`Error sending reminder to ${data.customer.name}:`, error);
    }
  }

  private shouldSendReminder(daysOverdue: number): boolean {
    // Send reminders at specific intervals:
    // - On due date (0 days)
    // - 7 days overdue
    // - 15 days overdue
    // - 30 days overdue
    // - Then every 30 days
    
    if (daysOverdue === 0) return true; // Due today
    if (daysOverdue === 7) return true; // 1 week overdue
    if (daysOverdue === 15) return true; // 2 weeks overdue
    if (daysOverdue === 30) return true; // 1 month overdue
    if (daysOverdue > 30 && daysOverdue % 30 === 0) return true; // Every 30 days after that
    
    return false;
  }

  private async getLastReminderSent(customerId: number): Promise<Date | null> {
    // This would typically be stored in a reminder_logs table
    // For now, we'll implement a simple check
    // TODO: Implement proper reminder logging
    return null;
  }

  private isRecentlySent(lastSent: Date): boolean {
    const daysSinceLastReminder = this.calculateDaysOverdue(lastSent);
    return daysSinceLastReminder < 5; // Don't send more than once every 5 days
  }

  private async recordReminderSent(customerId: number): Promise<void> {
    // TODO: Implement reminder logging to track when reminders were sent
    // This would insert into a reminder_logs table
    console.log(`Recorded reminder sent for customer ${customerId}`);
  }

  async scheduleAutomaticReminders(): Promise<void> {
    // This would be called by a cron job or scheduled task
    console.log('Starting automatic payment reminder processing...');
    
    const companies = await storage.getCompanies();
    
    for (const company of companies) {
      await this.processPaymentReminders(company.id);
    }
    
    console.log('Automatic payment reminder processing completed');
  }
}

export const reminderScheduler = new ReminderScheduler();