import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  create(@GetUser('id') userId: string, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(userId, dto);
  }

  @Get()
  getMyAppointments(@GetUser('id') userId: string) {
    return this.appointmentsService.getMyAppointments(userId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.appointmentsService.getById(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @GetUser('id') userId: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, userId, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.appointmentsService.delete(id, userId);
  }
}
