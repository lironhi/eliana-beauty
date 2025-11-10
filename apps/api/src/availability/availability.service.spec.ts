import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityService } from './availability.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: PrismaService,
          useValue: {
            workingHours: {
              findFirst: jest.fn(),
            },
            timeOff: {
              findFirst: jest.fn(),
            },
            appointment: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkOverlap', () => {
    it('should return true if appointments overlap', async () => {
      const staffId = 'staff-1';
      const startsAt = new Date('2024-01-15T10:00:00Z');
      const endsAt = new Date('2024-01-15T11:00:00Z');

      jest.spyOn(prisma.appointment, 'findFirst').mockResolvedValue({
        id: 'apt-1',
        clientId: 'client-1',
        serviceId: 'service-1',
        staffId,
        startsAt: new Date('2024-01-15T10:30:00Z'),
        endsAt: new Date('2024-01-15T11:30:00Z'),
        status: 'CONFIRMED',
        priceIls: null,
        notes: null,
        source: 'web',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.checkOverlap(staffId, startsAt, endsAt);
      expect(result).toBe(true);
    });

    it('should return false if no overlap', async () => {
      const staffId = 'staff-1';
      const startsAt = new Date('2024-01-15T10:00:00Z');
      const endsAt = new Date('2024-01-15T11:00:00Z');

      jest.spyOn(prisma.appointment, 'findFirst').mockResolvedValue(null);

      const result = await service.checkOverlap(staffId, startsAt, endsAt);
      expect(result).toBe(false);
    });
  });

  describe('getAvailability', () => {
    it('should return unavailable if no working hours', async () => {
      jest.spyOn(prisma.workingHours, 'findFirst').mockResolvedValue(null);

      const result = await service.getAvailability('staff-1', '2024-01-15');
      expect(result.available).toBe(false);
      expect(result.reason).toBe('Staff not working on this day');
    });

    it('should return unavailable if staff has time off', async () => {
      jest.spyOn(prisma.workingHours, 'findFirst').mockResolvedValue({
        id: 'wh-1',
        staffId: 'staff-1',
        weekday: 1,
        startHhmm: '09:00',
        endHhmm: '18:00',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest.spyOn(prisma.timeOff, 'findFirst').mockResolvedValue({
        id: 'to-1',
        staffId: 'staff-1',
        type: 'VACATION',
        startsAt: new Date('2024-01-15T00:00:00Z'),
        endsAt: new Date('2024-01-15T23:59:59Z'),
        reason: 'Vacation',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.getAvailability('staff-1', '2024-01-15');
      expect(result.available).toBe(false);
      expect(result.reason).toBe('Staff has time off');
    });
  });
});
