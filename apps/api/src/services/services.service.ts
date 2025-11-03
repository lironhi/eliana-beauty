import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async getPublicServices() {
    const services = await this.prisma.service.findMany({
      where: { active: true },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
          },
        },
      },
      orderBy: [{ category: { order: 'asc' } }, { name: 'asc' }],
    });

    return services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      durationMin: service.durationMin,
      priceIls: service.priceIls,
      imageUrl: service.imageUrl,
      category: service.category,
    }));
  }

  async getServiceById(id: string) {
    return this.prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async getAllServices(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        include: {
          category: true,
        },
        orderBy: [{ category: { order: 'asc' } }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.service.count(),
    ]);

    return {
      data: services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createService(data: {
    name: string;
    description?: string;
    categoryId: string;
    durationMin: number;
    priceIls: number;
    imageUrl?: string;
    active?: boolean;
  }) {
    return this.prisma.service.create({
      data,
      include: { category: true },
    });
  }

  async updateService(
    id: string,
    data: {
      name?: string;
      description?: string;
      categoryId?: string;
      durationMin?: number;
      priceIls?: number;
      imageUrl?: string;
      active?: boolean;
    },
  ) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.prisma.service.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async deleteService(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    await this.prisma.service.delete({ where: { id } });
    return { message: 'Service deleted successfully' };
  }

  async getAllCategories() {
    return this.prisma.category.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async createCategory(data: {
    name: string;
    slug: string;
    imageUrl?: string;
    order?: number;
    active?: boolean;
  }) {
    return this.prisma.category.create({ data });
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      slug?: string;
      imageUrl?: string;
      order?: number;
      active?: boolean;
    },
  ) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    await this.prisma.category.delete({ where: { id } });
    return { message: 'Category deleted successfully' };
  }
}
