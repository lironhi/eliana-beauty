import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AvailabilityService } from '../availability/availability.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private availabilityService: AvailabilityService,
  ) {}

  async getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Today's appointments
    const todayAppointments = await this.prisma.appointment.count({
      where: {
        startsAt: { gte: startOfToday },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    // This week's appointments
    const weekAppointments = await this.prisma.appointment.count({
      where: {
        startsAt: { gte: startOfWeek },
      },
    });

    // This month's appointments
    const monthAppointments = await this.prisma.appointment.count({
      where: {
        startsAt: { gte: startOfMonth },
      },
    });

    // Total revenue (completed appointments)
    const completedAppointments = await this.prisma.appointment.findMany({
      where: {
        status: 'COMPLETED',
        startsAt: { gte: startOfMonth },
      },
      include: {
        service: true,
      },
    });

    const monthRevenue = completedAppointments.reduce(
      (sum, apt) => sum + (apt.priceIls ?? apt.service.priceIls),
      0,
    );

    // Total clients
    const totalClients = await this.prisma.user.count({
      where: { role: 'CLIENT' },
    });

    // Active staff
    const activeStaff = await this.prisma.staff.count({
      where: { active: true },
    });

    // Recent appointments
    const recentAppointments = await this.prisma.appointment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: true,
        staff: true,
      },
    });

    // Popular services
    const popularServices = await this.prisma.appointment.groupBy({
      by: ['serviceId'],
      _count: {
        serviceId: true,
      },
      orderBy: {
        _count: {
          serviceId: 'desc',
        },
      },
      take: 5,
    });

    const servicesWithDetails = await Promise.all(
      popularServices.map(async (item) => {
        const service = await this.prisma.service.findUnique({
          where: { id: item.serviceId },
        });
        return {
          ...service,
          bookingCount: item._count.serviceId,
        };
      }),
    );

    // Appointments trend for last 30 days (for chart)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const appointmentsByDay = await this.prisma.appointment.groupBy({
      by: ['startsAt'],
      where: {
        startsAt: { gte: thirtyDaysAgo },
      },
      _count: {
        id: true,
      },
    });

    // Create a map of appointments per day
    const appointmentsMap = new Map<string, number>();
    appointmentsByDay.forEach((item) => {
      const dateKey = new Date(item.startsAt).toISOString().split('T')[0];
      appointmentsMap.set(dateKey, (appointmentsMap.get(dateKey) || 0) + item._count.id);
    });

    // Generate array with all 30 days (including days with 0 appointments)
    const appointmentsTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toISOString().split('T')[0];

      appointmentsTrend.push({
        date: date.toISOString(),
        label: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        value: appointmentsMap.get(dateKey) || 0,
      });
    }

    return {
      stats: {
        todayAppointments,
        weekAppointments,
        monthAppointments,
        monthRevenue,
        totalClients,
        activeStaff,
      },
      recentAppointments,
      popularServices: servicesWithDetails,
      appointmentsTrend,
    };
  }

  async getAllAppointments(
    filters?: {
      status?: string;
      staffId?: string;
      date?: string;
    },
    page: number = 1,
    limit: number = 10,
  ) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.staffId) {
      where.staffId = filters.staffId;
    }

    if (filters?.date) {
      const date = new Date(filters.date);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      where.startsAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          service: true,
          staff: true,
        },
        orderBy: { startsAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateAppointmentStatus(id: string, status: string) {
    return this.prisma.appointment.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async updateAppointmentPrice(id: string, priceIls: number) {
    return this.prisma.appointment.update({
      where: { id },
      data: { priceIls },
      include: {
        client: true,
        service: true,
        staff: true,
      },
    });
  }

  async rescheduleAppointment(id: string, startsAt: string) {
    // Get the existing appointment with service details
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!appointment) {
      throw new BadRequestException('Appointment not found');
    }

    if (!appointment.staffId) {
      throw new BadRequestException('Appointment has no assigned staff member');
    }

    // Parse the new start time
    const newStartsAt = new Date(startsAt);
    if (isNaN(newStartsAt.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    // Calculate end time based on service duration
    const newEndsAt = new Date(newStartsAt.getTime() + appointment.service.durationMin * 60 * 1000);

    // Check if the new time slot overlaps with any other appointments (excluding this one)
    const hasOverlap = await this.availabilityService.checkOverlap(
      appointment.staffId,
      newStartsAt,
      newEndsAt,
      id,
    );

    if (hasOverlap) {
      throw new BadRequestException('The selected time slot is not available');
    }

    // Update the appointment
    return this.prisma.appointment.update({
      where: { id },
      data: {
        startsAt: newStartsAt,
        endsAt: newEndsAt,
      },
      include: {
        client: true,
        service: true,
        staff: true,
      },
    });
  }

  async deleteAppointment(id: string) {
    await this.prisma.appointment.delete({ where: { id } });
    return { message: 'Appointment deleted successfully' };
  }

  async getAllClients(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: 'CLIENT' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          locale: true,
          active: true,
          createdAt: true,
          appointments: {
            select: {
              id: true,
              status: true,
              startsAt: true,
            },
            orderBy: { startsAt: 'desc' },
            take: 5,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: { role: 'CLIENT' } }),
    ]);

    return {
      data: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateClient(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      locale?: string;
      active?: boolean;
    },
  ) {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.locale !== undefined && { locale: data.locale as any }),
        ...(data.active !== undefined && { active: data.active }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        locale: true,
        active: true,
        createdAt: true,
      },
    });
  }

  async deleteClient(id: string) {
    // Update all future appointments with this client to CANCELLED
    const now = new Date();
    const updatedAppointments = await this.prisma.appointment.updateMany({
      where: {
        clientId: id,
        startsAt: { gte: now },
        status: { in: ['PENDING', 'CONFIRMED', 'RESCHEDULE_PENDING'] },
      },
      data: {
        status: 'CANCELLED',
      },
    });

    // Delete the client (this will cascade delete appointments due to onDelete: Cascade in schema)
    await this.prisma.user.delete({ where: { id } });

    return {
      message: 'Client deleted successfully',
      affectedAppointments: updatedAppointments.count,
    };
  }
}
