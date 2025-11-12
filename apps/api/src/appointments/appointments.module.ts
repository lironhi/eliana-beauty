import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentRemindersService } from './appointment-reminders.service';
import { AvailabilityModule } from '../availability/availability.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [AvailabilityModule, EmailModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentRemindersService],
})
export class AppointmentsModule {}
