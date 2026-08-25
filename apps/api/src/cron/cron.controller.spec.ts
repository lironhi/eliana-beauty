import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ServiceUnavailableException } from '@nestjs/common';
import { CronController } from './cron.controller';
import { AppointmentRemindersService } from '../appointments/appointment-reminders.service';

describe('CronController', () => {
  let controller: CronController;
  let reminders: { checkAndSendReminders: jest.Mock };
  const SECRET = 'secret-de-test-123';

  beforeEach(async () => {
    reminders = { checkAndSendReminders: jest.fn().mockResolvedValue({ sent24h: 2, sent2h: 1 }) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CronController],
      providers: [{ provide: AppointmentRemindersService, useValue: reminders }],
    }).compile();

    controller = module.get<CronController>(CronController);
    process.env.CRON_SECRET = SECRET;
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it('refuse un appel sans secret', async () => {
    await expect(controller.runReminders(undefined)).rejects.toThrow(UnauthorizedException);
    expect(reminders.checkAndSendReminders).not.toHaveBeenCalled();
  });

  it('refuse un mauvais secret', async () => {
    await expect(controller.runReminders('mauvais-secret')).rejects.toThrow(UnauthorizedException);
    expect(reminders.checkAndSendReminders).not.toHaveBeenCalled();
  });

  // Un secret de longueur differente ne doit pas faire planter timingSafeEqual.
  it('refuse un secret de longueur differente sans lever d erreur technique', async () => {
    await expect(controller.runReminders('court')).rejects.toThrow(UnauthorizedException);
  });

  // Sans CRON_SECRET, la route serait ouverte a tous : elle doit se fermer.
  it('se ferme si CRON_SECRET n est pas configure', async () => {
    delete process.env.CRON_SECRET;

    await expect(controller.runReminders(SECRET)).rejects.toThrow(ServiceUnavailableException);
    expect(reminders.checkAndSendReminders).not.toHaveBeenCalled();
  });

  it('declenche les rappels et renvoie le bilan avec le bon secret', async () => {
    const result = await controller.runReminders(SECRET);

    expect(reminders.checkAndSendReminders).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ ok: true, sent24h: 2, sent2h: 1 });
    expect(result.at).toEqual(expect.any(String));
  });
});
