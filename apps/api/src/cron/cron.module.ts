import { Module } from '@nestjs/common';
import { CronController } from './cron.controller';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
  imports: [AppointmentsModule],
  controllers: [CronController],
})
export class CronModule {}
