import { invoiceAutomationService } from './invoice-automation';
import { storage } from './storage';

interface PaymentReminderSettings {
  enableDailyReminders: boolean;
  reminderTimes: number[]; // Days overdue when to send reminders (e.g., [0, 7, 15, 30])
  recurringAfter: number; // Days after which to send recurring reminders (e.g., 30)
  dailyReminderTime: string; // Time of day to send reminders (e.g., "09:00")
}

class SchedulerService {
  private intervalId: NodeJS.Timeout | null = null;
  private reminderIntervalId: NodeJS.Timeout | null = null;
  private readonly INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  private readonly REMINDER_CHECK_MS = 60 * 60 * 1000; // Check every hour for daily reminders
  
  private defaultReminderSettings: PaymentReminderSettings = {
    enableDailyReminders: false,
    reminderTimes: [0, 7, 15, 30],
    recurringAfter: 30,
    dailyReminderTime: "09:00"
  };

  start() {
    if (this.intervalId) {
      console.log('Scheduler already running');
      return;
    }

    console.log('Starting automated scheduler...');
    
    // Run immediately on start
    this.processJobs();
    
    // Process invoice automation every hour
    this.intervalId = setInterval(() => {
      this.processJobs();
    }, this.INTERVAL_MS);

    // Check for daily payment reminders every hour
    this.reminderIntervalId = setInterval(() => {
      this.checkDailyPaymentReminders();
    }, this.REMINDER_CHECK_MS);

    console.log(`Scheduler started - will process jobs every ${this.INTERVAL_MS / 1000 / 60} minutes`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.reminderIntervalId) {
      clearInterval(this.reminderIntervalId);
      this.reminderIntervalId = null;
    }
    console.log('Scheduler stopped');
  }

  private async processJobs() {
    try {
      console.log('Processing automated jobs...');
      
      // Process recurring invoice generation
      await invoiceAutomationService.processRecurringInvoices();
      
      // Process pending email jobs
      await invoiceAutomationService.processPendingEmailJobs();
      
      console.log('Automated jobs processing completed');
    } catch (error) {
      console.error('Error processing automated jobs:', error);
    }
  }

  private async checkDailyPaymentReminders() {
    try {
      const companies = await storage.getCompanies();
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      
      for (const company of companies) {
        // Check if daily reminders are enabled for this company
        const settings = await this.getCompanyReminderSettings(company.id);
        
        if (!settings.enableDailyReminders) {
          continue;
        }
        
        // Check if it's the right time to send reminders
        if (currentTime === settings.dailyReminderTime) {
          console.log(`Processing daily payment reminders for company ${company.id} at ${currentTime}`);
          await this.processPaymentRemindersInternal(company.id, settings);
        }
      }
    } catch (error) {
      console.error('Error checking daily payment reminders:', error);
    }
  }

  private async getCompanyReminderSettings(companyId: number): Promise<PaymentReminderSettings> {
    try {
      // For now, return default settings. This could be enhanced to store per-company settings in database
      return this.defaultReminderSettings;
    } catch (error) {
      console.error('Error getting reminder settings:', error);
      return this.defaultReminderSettings;
    }
  }

  private async processPaymentRemindersInternal(companyId: number, settings: PaymentReminderSettings) {
    try {
      const customers = await storage.getCustomers(companyId);
      
      for (const customer of customers) {
        // Skip customers without email or reminders disabled
        if (!customer.email || !customer.enablePaymentReminders) continue;
        
        // Calculate actual outstanding balance
        const customerSummary = await storage.getCustomerStatementSummary(companyId, customer.id);
        const totalDue = customerSummary.closingBalance;
        
        if (totalDue <= 0) continue; // Skip customers with no outstanding balance
        
        // Calculate days overdue
        const daysOverdue = await this.calculateDaysOverdue(companyId, customer.id);
        
        // Use customer-specific reminder settings
        const customerReminderDays = customer.reminderDays 
          ? customer.reminderDays.split(',').map(d => parseInt(d.trim()))
          : settings.reminderTimes;
        
        const customerFrequency = customer.reminderFrequency || settings.recurringAfter;
        
        // Check if we should send a reminder today using customer-specific settings
        const shouldSendReminder = this.shouldSendReminderTodayForCustomer(
          daysOverdue, 
          customerReminderDays, 
          customerFrequency,
          customer.lastReminderSent
        );
        
        if (shouldSendReminder) {
          console.log(`Sending automated payment reminder to ${customer.email} (${daysOverdue} days overdue, $${totalDue} due)`);
          await this.sendPaymentReminder(companyId, customer.id);
          
          // Update last reminder sent timestamp
          await storage.updateCustomer(customer.id, {
            lastReminderSent: new Date()
          });
        }
      }
    } catch (error) {
      console.error(`Error processing payment reminders for company ${companyId}:`, error);
    }
  }

  private async calculateDaysOverdue(companyId: number, customerId: number): Promise<number> {
    try {
      // Get customer's invoices to find oldest due date
      const invoices = await storage.getInvoices(companyId);
      const customerInvoices = invoices.filter(inv => 
        inv.customerId === customerId && 
        inv.status === 'sent' &&
        parseFloat(inv.amount) > parseFloat(inv.paidAmount || '0')
      );
      
      if (customerInvoices.length > 0) {
        // Use oldest unpaid invoice
        const oldestInvoice = customerInvoices.sort((a, b) => 
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        )[0];
        
        const today = new Date();
        const dueDate = new Date(oldestInvoice.dueDate);
        return Math.max(0, Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
      } else {
        // Use opening balance date if no invoices
        const customer = await storage.getCustomer(customerId);
        if (customer?.openingBalanceDate) {
          const today = new Date();
          const openingDate = new Date(customer.openingBalanceDate);
          return Math.max(0, Math.ceil((today.getTime() - openingDate.getTime()) / (1000 * 60 * 60 * 24)));
        }
        return 30; // Default for customers with balance but no specific date
      }
    } catch (error) {
      console.error('Error calculating days overdue:', error);
      return 0;
    }
  }

  private shouldSendReminderToday(daysOverdue: number, settings: PaymentReminderSettings): boolean {
    // Check if today matches any of the reminder times
    if (settings.reminderTimes.includes(daysOverdue)) {
      return true;
    }
    
    // Check for recurring reminders after the specified period
    if (daysOverdue > settings.recurringAfter && 
        daysOverdue % settings.recurringAfter === 0) {
      return true;
    }
    
    return false;
  }

  private shouldSendReminderTodayForCustomer(
    daysOverdue: number, 
    reminderDays: number[], 
    frequencyDays: number,
    lastReminderSent?: Date | null
  ): boolean {
    // Check if today matches any of the customer's reminder days
    if (reminderDays.includes(daysOverdue)) {
      return true;
    }
    
    // Check for recurring reminders based on customer frequency
    if (daysOverdue > frequencyDays && daysOverdue % frequencyDays === 0) {
      // If we have a last reminder date, ensure we don't send too frequently
      if (lastReminderSent) {
        const daysSinceLastReminder = Math.floor(
          (new Date().getTime() - new Date(lastReminderSent).getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSinceLastReminder >= frequencyDays;
      }
      return true;
    }
    
    return false;
  }

  async processPaymentReminders(companyId: number): Promise<void> {
    // This method is called from the API endpoint for manual reminders
    try {
      const customers = await storage.getCustomers(companyId);
      
      for (const customer of customers) {
        if (!customer.email) continue;
        
        const customerSummary = await storage.getCustomerStatementSummary(companyId, customer.id);
        const totalDue = customerSummary.closingBalance;
        
        if (totalDue > 0) {
          await this.sendPaymentReminder(companyId, customer.id);
        }
      }
    } catch (error) {
      console.error('Error processing payment reminders:', error);
      throw error;
    }
  }

  private async sendPaymentReminder(companyId: number, customerId: number): Promise<void> {
    try {
      const { emailService } = await import('./email-service');
      const customer = await storage.getCustomer(customerId);
      const company = await storage.getCompany(companyId);
      
      if (!customer || !company || !customer.email) {
        return;
      }
      
      const customerSummary = await storage.getCustomerStatementSummary(companyId, customerId);
      const balanceDue = customerSummary.closingBalance;
      
      await emailService.sendPaymentReminder({
        to: customer.email,
        customerName: customer.name,
        companyName: company.name,
        balanceDue: balanceDue,
        subject: `Payment Reminder - Outstanding Balance $${balanceDue.toFixed(2)}`,
      });
    } catch (error) {
      console.error(`Error sending payment reminder to customer ${customerId}:`, error);
    }
  }

  // Public methods for managing reminder settings
  async updateReminderSettings(companyId: number, settings: Partial<PaymentReminderSettings>): Promise<void> {
    // This could be enhanced to store settings in database
    console.log(`Updated reminder settings for company ${companyId}:`, settings);
  }

  async getReminderSettings(companyId: number): Promise<PaymentReminderSettings> {
    return this.getCompanyReminderSettings(companyId);
  }
}

export const schedulerService = new SchedulerService();