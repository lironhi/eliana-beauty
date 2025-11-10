import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async getAvailability(staffId: string, date: string, durationMin?: number) {
    // Parse date (YYYY-MM-DD)
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    // Get weekday (0=Sunday, 6=Saturday)
    const weekday = targetDate.getUTCDay();

    // Get working hours for this staff on this weekday
    const workingHours = await this.prisma.workingHours.findFirst({
      where: {
        staffId,
        weekday,
      },
    });

    if (!workingHours) {
      return { available: false, slots: [], reason: 'Staff not working on this day' };
    }

    // Check time off
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const timeOff = await this.prisma.timeOff.findFirst({
      where: {
        staffId,
        startsAt: { lte: endOfDay },
        endsAt: { gte: startOfDay },
      },
    });

    if (timeOff) {
      return {
        available: false,
        slots: [],
        reason: 'Staff has time off',
        timeOff: {
          type: timeOff.type,
          startsAt: timeOff.startsAt,
          endsAt: timeOff.endsAt,
        }
      };
    }

    // Get existing appointments for this day
    const appointments = await this.prisma.appointment.findMany({
      where: {
        staffId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        startsAt: { gte: startOfDay, lt: endOfDay },
      },
      orderBy: { startsAt: 'asc' },
    });

    // Generate 15-minute slots
    const slots = this.generateTimeSlots(
      targetDate,
      workingHours.startHhmm,
      workingHours.endHhmm,
      appointments,
      durationMin,
    );

    return {
      available: true,
      date,
      staffId,
      slots,
    };
  }

  private generateTimeSlots(
    date: Date,
    startHhmm: string,
    endHhmm: string,
    appointments: any[],
    durationMin?: number,
  ) {
    const slots: { time: string; available: boolean; reason?: string }[] = [];
    const [startHour, startMin] = startHhmm.split(':').map(Number);
    const [endHour, endMin] = endHhmm.split(':').map(Number);

    let current = new Date(date);
    current.setUTCHours(startHour, startMin, 0, 0);

    const end = new Date(date);
    end.setUTCHours(endHour, endMin, 0, 0);

    while (current < end) {
      const slotTime = current.toISOString();
      const slotEnd = new Date(current.getTime() + 15 * 60 * 1000);

      // Check if slot overlaps with any appointment (slot is booked)
      const overlappingAppointment = appointments.find((apt) => {
        const aptStart = new Date(apt.startsAt);
        const aptEnd = new Date(apt.endsAt);
        return current < aptEnd && slotEnd > aptStart;
      });

      if (overlappingAppointment) {
        // Slot is directly booked
        slots.push({
          time: slotTime,
          available: false,
          reason: 'booked',
        });
      } else if (durationMin) {
        // Check if there's enough consecutive time for the service duration
        const serviceEnd = new Date(current.getTime() + durationMin * 60 * 1000);

        // Find if any appointment starts before our service would end
        const blockingAppointment = appointments.find((apt) => {
          const aptStart = new Date(apt.startsAt);
          return aptStart < serviceEnd && aptStart > current;
        });

        if (blockingAppointment) {
          // Not enough time to complete service before next appointment
          slots.push({
            time: slotTime,
            available: false,
            reason: 'insufficient_time',
          });
        } else {
          // Enough time available
          slots.push({
            time: slotTime,
            available: true,
          });
        }
      } else {
        // No duration specified, just mark as available
        slots.push({
          time: slotTime,
          available: true,
        });
      }

      current = new Date(current.getTime() + 15 * 60 * 1000);
    }

    return slots;
  }

  async checkOverlap(staffId: string, startsAt: Date, endsAt: Date, excludeId?: string) {
    const where: any = {
      staffId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      OR: [
        // New appointment starts during existing
        { startsAt: { lt: endsAt }, endsAt: { gt: startsAt } },
      ],
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const overlapping = await this.prisma.appointment.findFirst({ where });
    return !!overlapping;
  }
}
