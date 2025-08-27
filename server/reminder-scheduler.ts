import { invoiceAutomationService } from './invoice-automation';

class SchedulerService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  start() {
    if (this.intervalId) {
      console.log('Scheduler already running');
      return;
    }

    console.log('Starting automated invoice scheduler...');
    
    // Run immediately on start
    this.processJobs();
    
    // Then run every hour
    this.intervalId = setInterval(() => {
      this.processJobs();
    }, this.INTERVAL_MS);

    console.log(`Scheduler started - will process jobs every ${this.INTERVAL_MS / 1000 / 60} minutes`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Scheduler stopped');
    }
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
}

export const schedulerService = new SchedulerService();