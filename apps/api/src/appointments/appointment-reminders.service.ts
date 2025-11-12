import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { addHours, subHours, isAfter, isBefore } from 'date-fns';

@Injectable()
export class AppointmentRemindersService {
  private readonly logger = new Logger(AppointmentRemindersService.name);

  constructor(private prisma: PrismaService) {}

  // Run every 30 minutes
  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkAndSendReminders() {
    this.logger.log('Checking for appointment reminders...');

    const now = new Date();
    const in24Hours = addHours(now, 24);
    const in2Hours = addHours(now, 2);

    try {
      // Find appointments that need 24h reminders
      await this.send24HourReminders(now, in24Hours);

      // Find appointments that need 2h reminders
      await this.send2HourReminders(now, in2Hours);
    } catch (error) {
      this.logger.error('Error sending reminders:', error);
    }
  }

  private async send24HourReminders(now: Date, in24Hours: Date) {
    // Find appointments starting in ~24 hours that haven't received a 24h reminder
    const appointments = await this.prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: in24Hours,
          lte: addHours(in24Hours, 1), // 24-25 hours window
        },
        status: 'CONFIRMED',
      },
      include: {
        client: true,
        service: true,
        staff: true,
      },
    });

    for (const appointment of appointments) {
      // Check if 24h reminder already sent (check for both English and Hebrew)
      const existingReminder = await this.prisma.message.findFirst({
        where: {
          type: 'REMINDER',
          recipientId: appointment.clientId,
          appointmentId: appointment.id,
          OR: [
            { subject: { contains: '24 hours' } },
            { subject: { contains: '24 שעות' } },
          ],
        },
      });

      if (!existingReminder) {
        await this.sendReminder(appointment, '24h');
      }
    }

    if (appointments.length > 0) {
      this.logger.log(`Sent ${appointments.length} 24-hour reminders`);
    }
  }

  private async send2HourReminders(now: Date, in2Hours: Date) {
    // Find appointments starting in ~2 hours that haven't received a 2h reminder
    const appointments = await this.prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: in2Hours,
          lte: addHours(in2Hours, 0.5), // 2-2.5 hours window
        },
        status: 'CONFIRMED',
      },
      include: {
        client: true,
        service: true,
        staff: true,
      },
    });

    for (const appointment of appointments) {
      // Check if 2h reminder already sent (check for both English and Hebrew)
      const existingReminder = await this.prisma.message.findFirst({
        where: {
          type: 'REMINDER',
          recipientId: appointment.clientId,
          appointmentId: appointment.id,
          OR: [
            { subject: { contains: '2 hours' } },
            { subject: { contains: 'שעתיים' } },
          ],
        },
      });

      if (!existingReminder) {
        await this.sendReminder(appointment, '2h');
      }
    }

    if (appointments.length > 0) {
      this.logger.log(`Sent ${appointments.length} 2-hour reminders`);
    }
  }

  private async sendReminder(appointment: any, type: '24h' | '2h') {
    const locale = appointment.client.locale || 'en';
    const isHebrew = locale === 'he';

    // Prepare localized content
    let subject: string;
    let content: string;

    if (isHebrew) {
      // Hebrew content
      const timeText = type === '24h' ? '24 שעות' : 'שעתיים';
      const date = appointment.startsAt.toLocaleDateString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const time = appointment.startsAt.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit',
      });

      subject = `תזכורת: תור בעוד ${timeText}`;
      content = `שלום ${appointment.client.name},

זוהי תזכורת ידידותית שיש לך תור מתוזמן בעוד ${timeText}.

שירות: ${appointment.service.nameHe || appointment.service.name}
תאריך: ${date}
שעה: ${time}
${appointment.staff ? `מטפל/ת: ${appointment.staff.name}` : ''}
${appointment.notes ? `הערות: ${appointment.notes}` : ''}

אם את/ה צריך/ה לבטל או לשנות את התור, אנא צור/י קשר בהקדם האפשרי.

תודה רבה!`;
    } else {
      // English content
      const timeText = type === '24h' ? '24 hours' : '2 hours';
      const date = appointment.startsAt.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const time = appointment.startsAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      subject = `Reminder: Appointment in ${timeText}`;
      content = `Hello ${appointment.client.name},

This is a friendly reminder that you have an appointment scheduled in ${timeText}.

Service: ${appointment.service.name}
Date: ${date}
Time: ${time}
${appointment.staff ? `Staff: ${appointment.staff.name}` : ''}
${appointment.notes ? `Notes: ${appointment.notes}` : ''}

If you need to cancel or reschedule, please contact us as soon as possible.

Thank you!`;
    }

    try {
      // Create the reminder message
      await this.prisma.message.create({
        data: {
          type: 'REMINDER',
          subject,
          content,
          senderId: appointment.clientId, // System message, use client as sender
          recipientId: appointment.clientId,
          appointmentId: appointment.id,
          sentAt: new Date(),
        },
      });

      this.logger.log(
        `Sent ${type} reminder for appointment ${appointment.id} to ${appointment.client.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send ${type} reminder for appointment ${appointment.id}:`,
        error,
      );
    }
  }

  // Manual trigger for testing
  async sendTestReminders() {
    this.logger.log('Manually triggering reminder check...');
    await this.checkAndSendReminders();
  }
}
