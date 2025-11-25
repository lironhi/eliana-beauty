import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  async saveUploadedImage(
    file: Express.Multer.File,
    type: 'service' | 'category',
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${type}-${timestamp}${extension}`;
    const relativePath = `/${type}s/${filename}`;
    const fullPath = path.join(this.uploadsDir, type + 's', filename);

    // Save file
    await fs.writeFile(fullPath, file.buffer);

    // Store in database
    const uploadedImage = await this.prisma.uploadedImage.create({
      data: {
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: relativePath,
        type,
      },
    });

    return {
      id: uploadedImage.id,
      url: `/uploads${relativePath}`,
      filename: uploadedImage.filename,
      originalName: uploadedImage.originalName,
      size: uploadedImage.size,
    };
  }

  async getImageLibrary(type?: 'service' | 'category') {
    const where = type ? { type } : {};
    const images = await this.prisma.uploadedImage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return images.map((img) => ({
      id: img.id,
      url: `/uploads${img.path}`,
      filename: img.filename,
      originalName: img.originalName,
      size: img.size,
      type: img.type,
      createdAt: img.createdAt,
    }));
  }

  async deleteImage(id: string) {
    const image = await this.prisma.uploadedImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new BadRequestException('Image not found');
    }

    // Delete file from disk
    const fullPath = path.join(this.uploadsDir, image.type + 's', image.filename);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      // File might not exist, continue with database deletion
      console.warn(`Could not delete file: ${fullPath}`, error);
    }

    // Delete from database
    await this.prisma.uploadedImage.delete({
      where: { id },
    });

    return { success: true };
  }

  async getImageStats() {
    const totalImages = await this.prisma.uploadedImage.count();
    const serviceImages = await this.prisma.uploadedImage.count({
      where: { type: 'service' },
    });
    const categoryImages = await this.prisma.uploadedImage.count({
      where: { type: 'category' },
    });

    const sizeResult = await this.prisma.uploadedImage.aggregate({
      _sum: {
        size: true,
      },
    });

    return {
      totalImages,
      serviceImages,
      categoryImages,
      totalSize: sizeResult._sum.size || 0,
    };
  }
}
