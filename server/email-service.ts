import { createTransporter } from './email-config';
import type { Customer } from '@shared/schema';

export interface PaymentReminderData {
  customer: Customer;
  balanceDue: number;
  daysOverdue: number;
  invoiceNumbers?: string[];
  dueDate?: Date;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = createTransporter();
  }

  async sendPaymentReminder(data: PaymentReminderData, template?: EmailTemplate): Promise<boolean> {
    try {
      const emailTemplate = template || this.getDefaultPaymentReminderTemplate(data);
      
      const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL || 'noreply@yourcompany.com',
        to: data.customer.email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Payment reminder email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send payment reminder email:', error);
      return false;
    }
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