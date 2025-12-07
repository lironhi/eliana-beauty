import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async getPublicStaff(serviceId?: string) {
    const where: any = { active: true };

    if (serviceId) {
      where.staffServices = {
        some: { serviceId },
      };
    }

    const staff = await this.prisma.staff.findMany({
      where,
      select: {
        id: true,
        name: true,
        bio: true,
        workingHours: {
          orderBy: { weekday: 'asc' },
        },
      },
    });

    return staff;
  }

  async getStaffById(id: string) {
    return this.prisma.staff.findUnique({
      where: { id },
      include: {
        staffServices: {
          include: {
            service: {
              include: {
                category: true,
              },
            },
          },
        },
        workingHours: {
          orderBy: { weekday: 'asc' },
        },
        timeOffs: {
          orderBy: { startsAt: 'desc' },
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });
  }

  // Admin endpoints
  async getAllStaff(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [staff, total] = await Promise.all([
      this.prisma.staff.findMany({
        include: {
          staffServices: {
            include: {
              service: {
                include: {
                  category: true,
                },
              },
            },
          },
          workingHours: {
            orderBy: { weekday: 'asc' },
          },
          _count: {
            select: {
              appointments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.staff.count(),
    ]);

    return {
      data: staff,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createStaff(data: { name: string; bio?: string; active?: boolean }) {
    return this.prisma.staff.create({
      data: {
        name: data.name,
        bio: data.bio,
        active: data.active ?? true,
      },
      include: {
        staffServices: {
          include: {
            service: true,
          },
        },
        workingHours: true,
      },
    });
  }

  async updateStaff(
    id: string,
    data: { name?: string; bio?: string; active?: boolean },
  ) {
    return this.prisma.staff.update({
      where: { id },
      data,
      include: {
        staffServices: {
          include: {
            service: true,
          },
        },
        workingHours: true,
      },
    });
  }

  async deleteStaff(id: string) {
    // Update all future appointments with this staff member to RESCHEDULE_PENDING
    const now = new Date();
    const updatedAppointments = await this.prisma.appointment.updateMany({
      where: {
        staffId: id,
        startsAt: { gte: now },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      data: {
        status: 'RESCHEDULE_PENDING',
        staffId: null, // Remove staff assignment
      },
    });

    // Delete the staff member
    await this.prisma.staff.delete({ where: { id } });

    return {
      message: 'Staff member deleted successfully',
      affectedAppointments: updatedAppointments.count,
    };
  }

  async updateStaffServices(id: string, serviceIds: string[]) {
    // Delete existing staff services
    await this.prisma.staffService.deleteMany({
      where: { staffId: id },
    });

    // Create new staff services
    if (serviceIds.length > 0) {
      await this.prisma.staffService.createMany({
        data: serviceIds.map((serviceId) => ({
          staffId: id,
          serviceId,
        })),
      });
    }

    return this.getStaffById(id);
  }

  async updateWorkingHours(
    id: string,
    workingHours: Array<{
      weekday: number;
      startHhmm: string;
      endHhmm: string;
    }>,
  ) {
    // Delete existing working hours
    await this.prisma.workingHours.deleteMany({
      where: { staffId: id },
    });

    // Create new working hours
    if (workingHours.length > 0) {
      await this.prisma.workingHours.createMany({
        data: workingHours.map((wh) => ({
          staffId: id,
          ...wh,
        })),
      });
    }

    return this.getStaffById(id);
  }

  async createTimeOff(
    staffId: string,
    data: {
      type: string;
      startsAt: Date;
      endsAt: Date;
      reason?: string;
    },
  ) {
    // Convert dates to start and end of day
    const startOfDay = new Date(data.startsAt);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(data.endsAt);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all conflicting appointments for this staff member
    const conflictingAppointments = await this.prisma.appointment.findMany({
      where: {
        staffId,
        startsAt: {
          gte: startOfDay,
        },
        endsAt: {
          lte: endOfDay,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      include: {
        client: true,
        service: true,
      },
    });

    // Create the time off
    const timeOff = await this.prisma.timeOff.create({
      data: {
        staffId,
        type: data.type as any,
        startsAt: startOfDay,
        endsAt: endOfDay,
        reason: data.reason,
      },
    });

    // Update conflicting appointments to RESCHEDULE_PENDING
    if (conflictingAppointments.length > 0) {
      await this.prisma.appointment.updateMany({
        where: {
          id: {
            in: conflictingAppointments.map((apt) => apt.id),
          },
        },
        data: {
          status: 'RESCHEDULE_PENDING',
        },
      });
    }

    return {
      timeOff,
      affectedAppointments: conflictingAppointments.length,
    };
  }

  async getTimeOffs(staffId: string) {
    return this.prisma.timeOff.findMany({
      where: { staffId },
      orderBy: { startsAt: 'desc' },
    });
  }

  async updateTimeOff(
    id: string,
    data: {
      type?: string;
      startsAt?: Date;
      endsAt?: Date;
      reason?: string;
    },
  ) {
    return this.prisma.timeOff.update({
      where: { id },
      data: {
        ...(data.type && { type: data.type as any }),
        ...(data.startsAt && { startsAt: data.startsAt }),
        ...(data.endsAt && { endsAt: data.endsAt }),
        ...(data.reason !== undefined && { reason: data.reason }),
      },
    });
  }

  async deleteTimeOff(id: string) {
    await this.prisma.timeOff.delete({ where: { id } });
    return { message: 'Time off deleted successfully' };
  }

  // Hour Blocks
  async createHourBlock(
    staffId: string,
    data: {
      date: Date;
      startHhmm: string;
      endHhmm: string;
      reason?: string;
    },
  ) {
    // Normalize the date to midnight
    const normalizedDate = new Date(data.date);
    normalizedDate.setHours(0, 0, 0, 0);

    // Find conflicting appointments on this specific day and time range
    const dayStart = new Date(normalizedDate);
    const dayEnd = new Date(normalizedDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Convert HH:MM to minutes for comparison
    const [startHour, startMin] = data.startHhmm.split(':').map(Number);
    const [endHour, endMin] = data.endHhmm.split(':').map(Number);
    const blockStartMinutes = startHour * 60 + startMin;
    const blockEndMinutes = endHour * 60 + endMin;

    const appointments = await this.prisma.appointment.findMany({
      where: {
        staffId,
        startsAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          notIn: ['CANCELLED', 'COMPLETED', 'RESCHEDULE_PENDING'],
        },
      },
    });

    // Filter appointments that overlap with the blocked time
    const conflictingAppointments = appointments.filter((apt) => {
      const aptStart = new Date(apt.startsAt);
      const aptEnd = new Date(apt.endsAt);
      const aptStartMinutes = aptStart.getHours() * 60 + aptStart.getMinutes();
      const aptEndMinutes = aptEnd.getHours() * 60 + aptEnd.getMinutes();

      return (
        (aptStartMinutes >= blockStartMinutes && aptStartMinutes < blockEndMinutes) ||
        (aptEndMinutes > blockStartMinutes && aptEndMinutes <= blockEndMinutes) ||
        (aptStartMinutes <= blockStartMinutes && aptEndMinutes >= blockEndMinutes)
      );
    });

    // Create the hour block
    const hourBlock = await this.prisma.hourBlock.create({
      data: {
        staffId,
        date: normalizedDate,
        startHhmm: data.startHhmm,
        endHhmm: data.endHhmm,
        reason: data.reason,
      },
    });

    // Update conflicting appointments to RESCHEDULE_PENDING
    if (conflictingAppointments.length > 0) {
      await this.prisma.appointment.updateMany({
        where: {
          id: {
            in: conflictingAppointments.map((apt) => apt.id),
          },
        },
        data: {
          status: 'RESCHEDULE_PENDING',
        },
      });
    }

    return {
      hourBlock,
      affectedAppointments: conflictingAppointments.length,
    };
  }

  async getHourBlocks(staffId: string) {
    return this.prisma.hourBlock.findMany({
      where: { staffId },
      orderBy: { date: 'desc' },
    });
  }

  async updateHourBlock(
    id: string,
    data: {
      date?: Date;
      startHhmm?: string;
      endHhmm?: string;
      reason?: string;
    },
  ) {
    const updateData: any = {};

    if (data.date) {
      const normalizedDate = new Date(data.date);
      normalizedDate.setHours(0, 0, 0, 0);
      updateData.date = normalizedDate;
    }

    if (data.startHhmm) updateData.startHhmm = data.startHhmm;
    if (data.endHhmm) updateData.endHhmm = data.endHhmm;
    if (data.reason !== undefined) updateData.reason = data.reason;

    return this.prisma.hourBlock.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteHourBlock(id: string) {
    await this.prisma.hourBlock.delete({ where: { id } });
    return { message: 'Hour block deleted successfully' };
  }
}
