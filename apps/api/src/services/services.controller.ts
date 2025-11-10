import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query, Headers } from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Get('public')
  getPublicServices(@Headers('accept-language') acceptLanguage?: string) {
    const locale = acceptLanguage?.startsWith('he') ? 'he' : 'en';
    return this.servicesService.getPublicServices(locale);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAllServices(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.servicesService.getAllServices(pageNum, limitNum);
  }

  @Get(':id')
  getServiceById(@Param('id') id: string, @Headers('accept-language') acceptLanguage?: string) {
    const locale = acceptLanguage?.startsWith('he') ? 'he' : 'en';
    return this.servicesService.getServiceById(id, locale);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createService(@Body() data: any) {
    return this.servicesService.createService(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateService(@Param('id') id: string, @Body() data: any) {
    return this.servicesService.updateService(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  deleteService(@Param('id') id: string) {
    return this.servicesService.deleteService(id);
  }

  @Get('categories/all')
  getAllCategories() {
    return this.servicesService.getAllCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createCategory(@Body() data: any) {
    return this.servicesService.createCategory(data);
  }

  @Put('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.servicesService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  deleteCategory(@Param('id') id: string) {
    return this.servicesService.deleteCategory(id);
  }
}
