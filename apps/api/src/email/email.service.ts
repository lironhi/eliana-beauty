import { Injectable, Logger } from '@nestjs/common';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Send email notification
   * NOTE: This is a mock implementation. In production, integrate with:
   * - SendGrid, Mailgun, AWS SES, or similar
   * - Configure SMTP server
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    this.logger.log(`[MOCK EMAIL] Sending email to: ${options.to}`);
    this.logger.log(`[MOCK EMAIL] Subject: ${options.subject}`);
    this.logger.log(`[MOCK EMAIL] Content: ${options.text || 'HTML content'}`);

    // In production, implement actual email sending here
    // Example with nodemailer:
    // await this.transporter.sendMail({
    //   from: process.env.EMAIL_FROM,
    //   to: options.to,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text,
    // });

    return Promise.resolve();
  }

  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation(
    userEmail: string,
    userName: string,
    appointmentDetails: {
      serviceName: string;
      staffName?: string;
      startsAt: Date;
      durationMin: number;
      priceIls: number;
    },
  ): Promise<void> {
    const { serviceName, staffName, startsAt, durationMin, priceIls } = appointmentDetails;

    const formattedDate = startsAt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = startsAt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .detail-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ec4899; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #1f2937; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Confirmed!</h1>
            <p>Your beauty treatment is booked</p>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Your appointment has been successfully confirmed. We look forward to seeing you!</p>

            <div class="detail-box">
              <div class="detail-row">
                <span class="label">Service:</span>
                <span class="value">${serviceName}</span>
              </div>
              ${
                staffName
                  ? `
              <div class="detail-row">
                <span class="label">Staff:</span>
                <span class="value">${staffName}</span>
              </div>
              `
                  : ''
              }
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${formattedTime}</span>
              </div>
              <div class="detail-row">
                <span class="label">Duration:</span>
                <span class="value">${durationMin} minutes</span>
              </div>
              <div class="detail-row">
                <span class="label">Price:</span>
                <span class="value">₪${priceIls}</span>
              </div>
            </div>

            <p><strong>Important:</strong> Please arrive 5-10 minutes before your appointment time.</p>
            <p>If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>

            <div class="footer">
              <p>Eliana Beauty</p>
              <p>Thank you for choosing our services!</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Appointment Confirmed!

Hi ${userName},

Your appointment has been successfully confirmed:

Service: ${serviceName}
${staffName ? `Staff: ${staffName}` : ''}
Date: ${formattedDate}
Time: ${formattedTime}
Duration: ${durationMin} minutes
Price: ₪${priceIls}

Please arrive 5-10 minutes before your appointment time.

Thank you for choosing Eliana Beauty!
    `;

    await this.sendEmail({
      to: userEmail,
      subject: 'Appointment Confirmation - Eliana Beauty',
      html,
      text,
    });
  }

  /**
   * Send appointment reminder email (e.g., 24 hours before)
   */
  async sendAppointmentReminder(
    userEmail: string,
    userName: string,
    appointmentDetails: {
      serviceName: string;
      startsAt: Date;
    },
  ): Promise<void> {
    const { serviceName, startsAt } = appointmentDetails;

    const formattedDate = startsAt.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = startsAt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8b5cf6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .reminder-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Appointment Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>This is a friendly reminder about your upcoming appointment:</p>

            <div class="reminder-box">
              <p><strong>${serviceName}</strong></p>
              <p>${formattedDate} at ${formattedTime}</p>
            </div>

            <p>We look forward to seeing you!</p>
            <p style="color: #6b7280; font-size: 14px;">Eliana Beauty</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: userEmail,
      subject: 'Reminder: Your Appointment Tomorrow - Eliana Beauty',
      html,
      text: `Reminder: Your appointment for ${serviceName} is tomorrow at ${formattedTime}.`,
    });
  }

  /**
   * Send the password reset link.
   *
   * The link carries a single-use token that expires; the body deliberately
   * says so, and tells the reader to ignore the message if they did not ask --
   * that is what turns an unexpected reset mail into a non-event rather than
   * an alarm.
   */
  async sendPasswordReset(
    userEmail: string,
    userName: string,
    resetUrl: string,
    expiresInMinutes: number,
    locale: 'en' | 'he' = 'en',
  ): Promise<void> {
    const isHebrew = locale === 'he';

    const copy = isHebrew
      ? {
          dir: 'rtl',
          subject: 'איפוס הסיסמה שלך - Eliana Beauty',
          title: 'איפוס סיסמה',
          greeting: `שלום ${userName},`,
          intro: 'קיבלנו בקשה לאיפוס הסיסמה שלך. לחצי על הכפתור כדי לבחור סיסמה חדשה.',
          cta: 'בחירת סיסמה חדשה',
          expiry: `הקישור תקף ${expiresInMinutes} דקות וניתן לשימוש פעם אחת בלבד.`,
          ignore: 'אם לא ביקשת לאפס את הסיסמה, אפשר להתעלם מההודעה — הסיסמה שלך לא תשתנה.',
          fallback: 'אם הכפתור לא עובד, העתיקי את הכתובת הבאה לדפדפן:',
        }
      : {
          dir: 'ltr',
          subject: 'Reset your password - Eliana Beauty',
          title: 'Password reset',
          greeting: `Hi ${userName},`,
          intro:
            'We received a request to reset your password. Use the button below to choose a new one.',
          cta: 'Choose a new password',
          expiry: `This link is valid for ${expiresInMinutes} minutes and can only be used once.`,
          ignore:
            'If you did not ask for this, you can ignore this email — your password will not change.',
          fallback: 'If the button does not work, copy this address into your browser:',
        };

    const html = `
      <!DOCTYPE html>
      <html dir="${copy.dir}">
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ec4899; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-weight: bold; }
          .muted { color: #6b7280; font-size: 14px; }
          .url { word-break: break-all; color: #6b7280; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${copy.title}</h1>
          </div>
          <div class="content">
            <p>${copy.greeting}</p>
            <p>${copy.intro}</p>
            <p style="text-align: center; margin: 30px 0;">
              <a class="button" href="${resetUrl}">${copy.cta}</a>
            </p>
            <p class="muted">${copy.expiry}</p>
            <p class="muted">${copy.ignore}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p class="muted">${copy.fallback}</p>
            <p class="url">${resetUrl}</p>
            <p class="muted">Eliana Beauty</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: userEmail,
      subject: copy.subject,
      html,
      text: `${copy.greeting}\n\n${copy.intro}\n\n${resetUrl}\n\n${copy.expiry}\n${copy.ignore}`,
    });
  }

  /**
   * Send appointment cancellation email
   */
  async sendAppointmentCancellation(
    userEmail: string,
    userName: string,
    serviceName: string,
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Cancelled</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Your appointment for <strong>${serviceName}</strong> has been cancelled.</p>
            <p>If you'd like to book another appointment, please visit our website or contact us.</p>
            <p>We hope to see you again soon!</p>
            <p style="color: #6b7280; font-size: 14px;">Eliana Beauty</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: userEmail,
      subject: 'Appointment Cancelled - Eliana Beauty',
      html,
      text: `Your appointment for ${serviceName} has been cancelled.`,
    });
  }
}
