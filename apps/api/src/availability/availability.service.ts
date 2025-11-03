import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async getAvailability(staffId: string, date: string) {
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
  ) {
    const slots: { time: string; available: boolean }[] = [];
    const [startHour, startMin] = startHhmm.split(':').map(Number);
    const [endHour, endMin] = endHhmm.split(':').map(Number);

    let current = new Date(date);
    current.setUTCHours(startHour, startMin, 0, 0);

    const end = new Date(date);
    end.setUTCHours(endHour, endMin, 0, 0);

    while (current < end) {
      const slotTime = current.toISOString();
      const slotEnd = new Date(current.getTime() + 15 * 60 * 1000);

      // Check if slot overlaps with any appointment
      const isBooked = appointments.some((apt) => {
        const aptStart = new Date(apt.startsAt);
        const aptEnd = new Date(apt.endsAt);
        return current < aptEnd && slotEnd > aptStart;
      });

      slots.push({
        time: slotTime,
        available: !isBooked,
      });

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
