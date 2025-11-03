import { PrismaClient, Role, Locale } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eliana.beauty' },
    update: {},
    create: {
      email: 'admin@eliana.beauty',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.ADMIN,
      locale: Locale.en,
      active: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create staff member
  const staff = await prisma.staff.upsert({
    where: { id: 'staff-1' },
    update: {},
    create: {
      id: 'staff-1',
      name: 'Eliana',
      bio: 'Experienced beauty professional specializing in nails and brows',
      active: true,
    },
  });
  console.log('✅ Staff member created:', staff.name);

  // Create categories
  const categories = [
    { name: 'Nails', slug: 'nails', order: 1, imageUrl: 'https://placehold.co/400x300/pink/white?text=Nails' },
    { name: 'Lashes', slug: 'lashes', order: 2, imageUrl: 'https://placehold.co/400x300/purple/white?text=Lashes' },
    { name: 'Brows', slug: 'brows', order: 3, imageUrl: 'https://placehold.co/400x300/brown/white?text=Brows' },
    { name: 'Waxing', slug: 'waxing', order: 4, imageUrl: 'https://placehold.co/400x300/blue/white?text=Waxing' },
    { name: 'Makeup', slug: 'makeup', order: 5, imageUrl: 'https://placehold.co/400x300/red/white?text=Makeup' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories created');

  // Create services
  const nailsCategory = await prisma.category.findUnique({ where: { slug: 'nails' } });
  const browsCategory = await prisma.category.findUnique({ where: { slug: 'brows' } });

  if (nailsCategory) {
    const services = [
      {
        categoryId: nailsCategory.id,
        name: 'Manicure',
        description: 'Classic manicure with nail shaping and polish',
        durationMin: 30,
        priceIls: 50,
        imageUrl: 'https://placehold.co/400x300/pink/white?text=Manicure',
      },
      {
        categoryId: nailsCategory.id,
        name: 'Gel Nails',
        description: 'Long-lasting gel polish application',
        durationMin: 120,
        priceIls: 230,
        imageUrl: 'https://placehold.co/400x300/pink/white?text=Gel+Nails',
      },
      {
        categoryId: nailsCategory.id,
        name: 'Gel Extension',
        description: 'Gel nail extensions for length and strength',
        durationMin: 120,
        priceIls: 230,
        imageUrl: 'https://placehold.co/400x300/pink/white?text=Gel+Extension',
      },
    ];

    for (const service of services) {
      const created = await prisma.service.create({ data: service });
      await prisma.staffService.create({
        data: {
          staffId: staff.id,
          serviceId: created.id,
        },
      });
    }
    console.log('✅ Nails services created');
  }

  if (browsCategory) {
    const browService = await prisma.service.create({
      data: {
        categoryId: browsCategory.id,
        name: 'Brow Design',
        description: 'Professional brow shaping and tinting',
        durationMin: 30,
        priceIls: 60,
        imageUrl: 'https://placehold.co/400x300/brown/white?text=Brow+Design',
      },
    });
    await prisma.staffService.create({
      data: {
        staffId: staff.id,
        serviceId: browService.id,
      },
    });
    console.log('✅ Brows service created');
  }

  // Create working hours (Sunday to Thursday: 9:00-18:00)
  const workingDays = [0, 1, 2, 3, 4]; // Sunday to Thursday
  for (const day of workingDays) {
    await prisma.workingHours.create({
      data: {
        staffId: staff.id,
        weekday: day,
        startHhmm: '09:00',
        endHhmm: '18:00',
      },
    });
  }
  console.log('✅ Working hours created (Sun-Thu, 9:00-18:00)');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
