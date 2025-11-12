import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DatabaseService } from './database.service';
import { AvailabilityModule } from '../availability/availability.module';

@Module({
  imports: [AvailabilityModule],
  controllers: [AdminController],
  providers: [AdminService, DatabaseService],
})
export class AdminModule {}
