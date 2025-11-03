import { Controller, Get, Query, Param, Post, Put, Delete, Body, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('staff')
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get('public')
  getPublicStaff(@Query('serviceId') serviceId?: string) {
    return this.staffService.getPublicStaff(serviceId);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAllStaff(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.staffService.getAllStaff(pageNum, limitNum);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createStaff(@Body() data: { name: string; bio?: string; active?: boolean }) {
    return this.staffService.createStaff(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateStaff(
    @Param('id') id: string,
    @Body() data: { name?: string; bio?: string; active?: boolean },
  ) {
    return this.staffService.updateStaff(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  deleteStaff(@Param('id') id: string) {
    return this.staffService.deleteStaff(id);
  }

  @Put(':id/services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateStaffServices(
    @Param('id') id: string,
    @Body() data: { serviceIds: string[] },
  ) {
    return this.staffService.updateStaffServices(id, data.serviceIds);
  }

  @Put(':id/working-hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateWorkingHours(
    @Param('id') id: string,
    @Body() data: {
      workingHours: Array<{
        weekday: number;
        startHhmm: string;
        endHhmm: string;
      }>;
    },
  ) {
    return this.staffService.updateWorkingHours(id, data.workingHours);
  }

  @Get(':id')
  getStaffById(@Param('id') id: string) {
    return this.staffService.getStaffById(id);
  }

  @Post(':id/time-off')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createTimeOff(
    @Param('id') staffId: string,
    @Body() data: {
      type: string;
      startsAt: string;
      endsAt: string;
      reason?: string;
    },
  ) {
    return this.staffService.createTimeOff(staffId, {
      ...data,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
    });
  }

  @Get(':id/time-off')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getTimeOffs(@Param('id') staffId: string) {
    return this.staffService.getTimeOffs(staffId);
  }

  @Put('time-off/:timeOffId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateTimeOff(
    @Param('timeOffId') timeOffId: string,
    @Body() data: {
      type?: string;
      startsAt?: string;
      endsAt?: string;
      reason?: string;
    },
  ) {
    return this.staffService.updateTimeOff(timeOffId, {
      ...data,
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
    });
  }

  @Delete('time-off/:timeOffId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  deleteTimeOff(@Param('timeOffId') timeOffId: string) {
    return this.staffService.deleteTimeOff(timeOffId);
  }
}
