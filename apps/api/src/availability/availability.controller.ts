import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @Get()
  getAvailability(
    @Query('staffId') staffId?: string,
    @Query('date') date?: string,
    @Query('durationMin') durationMin?: string,
  ) {
    if (!staffId || !date) {
      throw new BadRequestException('staffId and date are required');
    }

    const duration = durationMin ? parseInt(durationMin, 10) : undefined;

    return this.availabilityService.getAvailability(staffId, date, duration);
  }
}
