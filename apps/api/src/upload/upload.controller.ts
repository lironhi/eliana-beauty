import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @Roles('ADMIN', 'STAFF')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: 'service' | 'category',
  ) {
    if (!type || !['service', 'category'].includes(type)) {
      throw new BadRequestException('Type must be "service" or "category"');
    }

    return this.uploadService.saveUploadedImage(file, type);
  }

  @Get('library')
  @Roles('ADMIN', 'STAFF')
  async getImageLibrary(@Query('type') type?: 'service' | 'category') {
    return this.uploadService.getImageLibrary(type);
  }

  @Get('stats')
  @Roles('ADMIN', 'STAFF')
  async getImageStats() {
    return this.uploadService.getImageStats();
  }

  @Delete(':id')
  @Roles('ADMIN')
  async deleteImage(@Param('id') id: string) {
    return this.uploadService.deleteImage(id);
  }
}
