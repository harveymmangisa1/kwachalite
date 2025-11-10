// Simple email service for group invitations
// In a real application, this would integrate with an email service like SendGrid, AWS SES, or Resend

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface InvitationEmailData {
  groupName: string;
  groupDescription?: string;
  targetAmount: number;
  currency: string;
  invitedBy: string;
  invitationToken: string;
  customMessage?: string;
  expiryDays?: number;
}

class EmailService {
  private baseUrl: string;

  constructor() {
    // Get the base URL from environment or use default
    this.baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.VITE_APP_URL || 'http://localhost:5173';
  }

  /**
   * Send invitation email for group savings
   */
  async sendGroupInvitation(email: string, data: InvitationEmailData): Promise<boolean> {
    try {
      const joinUrl = `${this.baseUrl}/join-group/${data.invitationToken}`;
      const signupUrl = `${this.baseUrl}/signup?group=${data.invitationToken}`;
      
      const subject = `You're invited to join "${data.groupName}" savings group!`;
      
      const html = this.generateInvitationHTML(email, data, joinUrl, signupUrl);
      const text = this.generateInvitationText(email, data, joinUrl, signupUrl);

      // In development, log the email instead of sending
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email Service - Group Invitation');
        console.log('To:', email);
        console.log('Subject:', subject);
        console.log('Join URL:', joinUrl);
        console.log('Signup URL:', signupUrl);
        console.log('HTML:', html);
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }

      // In production, integrate with actual email service
      return await this.sendEmail({
        to: email,
        subject,
        html,
        text,
        from: 'noreply@kwachalite.com'
      });

    } catch (error) {
      console.error('Failed to send group invitation email:', error);
      return false;
    }
  }

  /**
   * Generate HTML for invitation email
   */
  private generateInvitationHTML(
    email: string, 
    data: InvitationEmailData, 
    joinUrl: string, 
    signupUrl: string
  ): string {
    const currencySymbol = this.getCurrencySymbol(data.currency);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Group Savings Invitation</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .button:hover { background: #5a6fd8; }
          .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Group Savings Invitation</h1>
            <p>You're invited to save together!</p>
          </div>
          
          <div class="content">
            <h2>Hi there!</h2>
            
            <p><strong>${data.invitedBy}</strong> has invited you to join the savings group <strong>"${data.groupName}"</strong>.</p>
            
            ${data.groupDescription ? `<p>${data.groupDescription}</p>` : ''}
            
            <div class="info-box">
              <h3>📊 Group Details</h3>
              <ul>
                <li><strong>Target Amount:</strong> ${currencySymbol}${data.targetAmount.toLocaleString()}</li>
                <li><strong>Currency:</strong> ${data.currency}</li>
                ${data.expiryDays ? `<li><strong>Invitation expires in:</strong> ${data.expiryDays} days</li>` : ''}
              </ul>
            </div>
            
            ${data.customMessage ? `
              <div class="info-box">
                <h3>📝 Personal Message</h3>
                <p>"${data.customMessage}"</p>
              </div>
            ` : ''}
            
            <div style="text-align: center;">
              <a href="${joinUrl}" class="button">Accept Invitation</a>
              <p style="font-size: 14px; color: #666; margin-top: 10px;">
                Don't have an account? <a href="${signupUrl}" style="color: #667eea;">Sign up first</a>
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              This invitation will expire in ${data.expiryDays || 7} days. If you need help, contact support.
            </p>
          </div>
          
          <div class="footer">
            <p>Powered by KwachaLite - Smart Financial Management</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text for invitation email
   */
  private generateInvitationText(
    email: string, 
    data: InvitationEmailData, 
    joinUrl: string, 
    signupUrl: string
  ): string {
    const currencySymbol = this.getCurrencySymbol(data.currency);
    
    return `
GROUP SAVINGS INVITATION

Hi there!

${data.invitedBy} has invited you to join the savings group "${data.groupName}".

${data.groupDescription ? `\n${data.groupDescription}` : ''}

GROUP DETAILS:
- Target Amount: ${currencySymbol}${data.targetAmount.toLocaleString()}
- Currency: ${data.currency}
${data.expiryDays ? `- Invitation expires in: ${data.expiryDays} days` : ''}

${data.customMessage ? `\nPERSONAL MESSAGE:\n"${data.customMessage}"\n` : ''}

To accept this invitation, visit:
${joinUrl}

If you don't have an account yet, sign up first:
${signupUrl}

This invitation will expire in ${data.expiryDays || 7} days.

Powered by KwachaLite - Smart Financial Management
    `.trim();
  }

  /**
   * Send email using email service
   * In production, integrate with actual email service API
   */
  private async sendEmail(options: EmailOptions): Promise<boolean> {
    // This is where you would integrate with:
    // - SendGrid
    // - AWS SES
    // - Resend
    // - Mailgun
    // - Or any other email service

    try {
      // Example with a generic email service:
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      return response.ok;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  /**
   * Get currency symbol for display
   */
  private getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'MWK': 'MK',
      'ZAR': 'R',
      'KES': 'KSh',
      'NGN': '₦',
      'GHS': '₵'
    };
    
    return symbols[currency] || currency;
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test email service connectivity
      const testEmail: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>This is a test email from KwachaLite</p>',
        text: 'This is a test email from KwachaLite'
      };

      return await this.sendEmail(testEmail);
    } catch (error) {
      console.error('Email service test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();