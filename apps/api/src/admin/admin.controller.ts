import { Controller, Get, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
export class AdminController {
  constructor(private adminService: AdminService) {}


  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('appointments')
  getAllAppointments(
    @Query('status') status?: string,
    @Query('staffId') staffId?: string,
    @Query('date') date?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getAllAppointments({ status, staffId, date }, pageNum, limitNum);
  }

  @Patch('appointments/:id/status')
  updateAppointmentStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateAppointmentStatus(id, status);
  }

  @Delete('appointments/:id')
  @Roles('ADMIN')
  deleteAppointment(@Param('id') id: string) {
    return this.adminService.deleteAppointment(id);
  }

  @Get('clients')
  getAllClients(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getAllClients(pageNum, limitNum);
  }

  @Patch('clients/:id')
  @Roles('ADMIN')
  updateClient(
    @Param('id') id: string,
    @Body() data: {
      name?: string;
      email?: string;
      phone?: string;
      locale?: string;
      active?: boolean;
    },
  ) {
    return this.adminService.updateClient(id, data);
  }

  @Delete('clients/:id')
  @Roles('ADMIN')
  deleteClient(@Param('id') id: string) {
    return this.adminService.deleteClient(id);
  }
}
