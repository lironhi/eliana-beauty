import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AvailabilityService } from '../availability/availability.service';
import { EmailService } from '../email/email.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private availabilityService: AvailabilityService,
    private emailService: EmailService,
  ) {}

  async create(userId: string, dto: CreateAppointmentDto) {
    // Get service to calculate duration
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service || !service.active) {
      throw new BadRequestException('Service not found or inactive');
    }

    // Calculate end time
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(startsAt.getTime() + service.durationMin * 60 * 1000);

    // Check if staff is provided and valid
    let staffId = dto.staffId;
    if (staffId) {
      const staff = await this.prisma.staff.findUnique({
        where: { id: staffId },
        include: {
          staffServices: {
            where: { serviceId: dto.serviceId },
          },
        },
      });

      if (!staff || !staff.active) {
        throw new BadRequestException('Staff not found or inactive');
      }

      if (staff.staffServices.length === 0) {
        throw new BadRequestException('Staff does not provide this service');
      }

      // Check for overlaps
      const hasOverlap = await this.availabilityService.checkOverlap(staffId, startsAt, endsAt);
      if (hasOverlap) {
        throw new BadRequestException('Time slot not available - overlaps with existing appointment');
      }
    }

    // Create appointment
    const appointment = await this.prisma.appointment.create({
      data: {
        clientId: userId,
        serviceId: dto.serviceId,
        staffId,
        startsAt,
        endsAt,
        status: 'PENDING',
        notes: dto.notes,
        source: 'web',
      },
      include: {
        service: true,
        staff: true,
      },
    });

    // Send confirmation email
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (user && user.email) {
        await this.emailService.sendAppointmentConfirmation(
          user.email,
          user.name,
          {
            serviceName: service.name,
            staffName: appointment.staff?.name,
            startsAt: appointment.startsAt,
            durationMin: service.durationMin,
            priceIls: service.priceIls,
          },
        );
      }
    } catch (error) {
      // Log error but don't fail the appointment creation
      console.error('Failed to send confirmation email:', error);
    }

    return appointment;
  }

  async getMyAppointments(userId: string) {
    return this.prisma.appointment.findMany({
      where: { clientId: userId },
      include: {
        service: {
          include: { category: true },
        },
        staff: true,
      },
      orderBy: { startsAt: 'desc' },
    });
  }

  async getById(id: string, userId?: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
        staff: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // If user is provided, check ownership
    if (userId && appointment.clientId !== userId) {
      throw new BadRequestException('Not authorized to view this appointment');
    }

    return appointment;
  }

  async update(id: string, userId: string, dto: UpdateAppointmentDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.clientId !== userId) {
      throw new BadRequestException('Not authorized to update this appointment');
    }

    if (dto.status === 'CANCELLED') {
      return this.prisma.appointment.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        notes: dto.notes,
      },
    });
  }

  async delete(id: string, userId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
        client: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.clientId !== userId) {
      throw new BadRequestException('Not authorized to delete this appointment');
    }

    await this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Send cancellation email
    try {
      if (appointment.client && appointment.client.email) {
        await this.emailService.sendAppointmentCancellation(
          appointment.client.email,
          appointment.client.name,
          appointment.service.name,
        );
      }
    } catch (error) {
      console.error('Failed to send cancellation email:', error);
    }

    return { message: 'Appointment cancelled successfully' };
  }
}
