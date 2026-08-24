import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../prisma/prisma.service';
import { AvailabilityService } from '../availability/availability.service';
import { EmailService } from '../email/email.service';

const SERVICE_ID = 'service-1';
const STAFF_ID = 'staff-1';
const USER_ID = 'user-1';

/** A date `days` from now at noon, so tests never straddle a midnight boundary. */
const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(12, 0, 0, 0);
  return date;
};

const activeService = {
  id: SERVICE_ID,
  name: 'Manucure',
  durationMin: 60,
  priceIls: 150,
  active: true,
};

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: {
    service: { findUnique: jest.Mock };
    staff: { findUnique: jest.Mock };
    appointment: { create: jest.Mock };
    user: { findUnique: jest.Mock };
  };
  let availability: { checkOverlap: jest.Mock };
  let email: { sendAppointmentConfirmation: jest.Mock };

  beforeEach(async () => {
    prisma = {
      service: { findUnique: jest.fn().mockResolvedValue(activeService) },
      staff: { findUnique: jest.fn() },
      appointment: { create: jest.fn() },
      user: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    availability = { checkOverlap: jest.fn().mockResolvedValue(false) };
    email = { sendAppointmentConfirmation: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AvailabilityService, useValue: availability },
        { provide: EmailService, useValue: email },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  const bookableStaff = () =>
    prisma.staff.findUnique.mockResolvedValue({
      id: STAFF_ID,
      active: true,
      staffServices: [{ staffId: STAFF_ID, serviceId: SERVICE_ID }],
    });

  describe('create', () => {
    it('rejects an unknown service', async () => {
      prisma.service.findUnique.mockResolvedValue(null);

      await expect(
        service.create(USER_ID, { serviceId: 'ghost', startsAt: daysFromNow(1).toISOString() }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects an inactive service', async () => {
      prisma.service.findUnique.mockResolvedValue({ ...activeService, active: false });

      await expect(
        service.create(USER_ID, { serviceId: SERVICE_ID, startsAt: daysFromNow(1).toISOString() }),
      ).rejects.toThrow('Service not found or inactive');
    });

    it('rejects a booking in the past', async () => {
      await expect(
        service.create(USER_ID, { serviceId: SERVICE_ID, startsAt: daysFromNow(-1).toISOString() }),
      ).rejects.toThrow('Cannot book appointments in the past');
    });

    // Eliana's rule: clients may only book up to one month ahead.
    it('rejects a booking more than one month ahead', async () => {
      await expect(
        service.create(USER_ID, { serviceId: SERVICE_ID, startsAt: daysFromNow(40).toISOString() }),
      ).rejects.toThrow('Cannot book appointments more than 1 month in advance');
    });

    it('accepts a booking just inside the one-month window', async () => {
      prisma.appointment.create.mockResolvedValue({ id: 'apt-1', staff: null });

      await service.create(USER_ID, {
        serviceId: SERVICE_ID,
        startsAt: daysFromNow(25).toISOString(),
      });

      expect(prisma.appointment.create).toHaveBeenCalledTimes(1);
    });

    it('rejects an inactive staff member', async () => {
      prisma.staff.findUnique.mockResolvedValue({ id: STAFF_ID, active: false, staffServices: [] });

      await expect(
        service.create(USER_ID, {
          serviceId: SERVICE_ID,
          staffId: STAFF_ID,
          startsAt: daysFromNow(1).toISOString(),
        }),
      ).rejects.toThrow('Staff not found or inactive');
    });

    it('rejects a staff member who does not provide the service', async () => {
      prisma.staff.findUnique.mockResolvedValue({ id: STAFF_ID, active: true, staffServices: [] });

      await expect(
        service.create(USER_ID, {
          serviceId: SERVICE_ID,
          staffId: STAFF_ID,
          startsAt: daysFromNow(1).toISOString(),
        }),
      ).rejects.toThrow('Staff does not provide this service');
    });

    it('rejects a slot that overlaps an existing appointment', async () => {
      bookableStaff();
      availability.checkOverlap.mockResolvedValue(true);

      await expect(
        service.create(USER_ID, {
          serviceId: SERVICE_ID,
          staffId: STAFF_ID,
          startsAt: daysFromNow(1).toISOString(),
        }),
      ).rejects.toThrow('Time slot not available - overlaps with existing appointment');
      expect(prisma.appointment.create).not.toHaveBeenCalled();
    });

    it('derives endsAt from the service duration and snapshots the price', async () => {
      bookableStaff();
      prisma.appointment.create.mockResolvedValue({ id: 'apt-1', staff: null });
      const startsAt = daysFromNow(1);

      await service.create(USER_ID, {
        serviceId: SERVICE_ID,
        staffId: STAFF_ID,
        startsAt: startsAt.toISOString(),
      });

      const { data } = prisma.appointment.create.mock.calls[0][0];
      expect(data.endsAt.getTime() - data.startsAt.getTime()).toBe(60 * 60 * 1000);
      expect(data.priceIls).toBe(150);
      expect(data.status).toBe('PENDING');
      expect(data.clientId).toBe(USER_ID);
    });

    it('still creates the appointment when the confirmation email fails', async () => {
      bookableStaff();
      prisma.appointment.create.mockResolvedValue({ id: 'apt-1', staff: null });
      prisma.user.findUnique.mockResolvedValue({ id: USER_ID, email: 'a@b.co', name: 'A' });
      email.sendAppointmentConfirmation.mockRejectedValue(new Error('SMTP down'));
      // The service logs the failure on purpose; keep it out of the test output.
      const logged = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        service.create(USER_ID, {
          serviceId: SERVICE_ID,
          staffId: STAFF_ID,
          startsAt: daysFromNow(1).toISOString(),
        }),
      ).resolves.toMatchObject({ id: 'apt-1' });

      expect(logged).toHaveBeenCalled();
      logged.mockRestore();
    });
  });
});
