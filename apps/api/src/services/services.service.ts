import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  // Helper method to localize service data
  private localizeService(service: any, locale?: string) {
    if (locale === 'he') {
      return {
        ...service,
        name: service.nameHe || service.name,
        description: service.descriptionHe || service.description,
      };
    }
    return service;
  }

  // Helper method to localize category data
  private localizeCategory(category: any, locale?: string) {
    if (locale === 'he') {
      return {
        ...category,
        name: category.nameHe || category.name,
        description: category.descriptionHe || category.description,
      };
    }
    return category;
  }

  async getPublicServices(locale?: string) {
    const services = await this.prisma.service.findMany({
      where: { active: true },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameHe: true,
            description: true,
            descriptionHe: true,
            slug: true,
            imageUrl: true,
          },
        },
      },
      orderBy: [{ category: { order: 'asc' } }, { name: 'asc' }],
    });

    return services.map((service) => {
      const localizedService = this.localizeService(service, locale);
      const localizedCategory = this.localizeCategory(service.category, locale);

      return {
        id: localizedService.id,
        name: localizedService.name,
        description: localizedService.description,
        durationMin: localizedService.durationMin,
        priceIls: localizedService.priceIls,
        priceFrom: localizedService.priceFrom,
        imageUrl: localizedService.imageUrl,
        category: localizedCategory,
      };
    });
  }

  async getServiceById(id: string, locale?: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!service) return null;

    const localizedService = this.localizeService(service, locale);
    const localizedCategory = this.localizeCategory(service.category, locale);

    return {
      ...localizedService,
      category: localizedCategory,
    };
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
    nameHe?: string;
    description?: string;
    descriptionHe?: string;
    categoryId: string;
    durationMin: number;
    priceIls: number;
    priceFrom?: boolean;
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
      nameHe?: string;
      description?: string;
      descriptionHe?: string;
      categoryId?: string;
      durationMin?: number;
      priceIls?: number;
      priceFrom?: boolean;
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
    nameHe?: string;
    description?: string;
    descriptionHe?: string;
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
      nameHe?: string;
      description?: string;
      descriptionHe?: string;
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
