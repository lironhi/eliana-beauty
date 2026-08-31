import { Role, Locale } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createPrismaClient } from '../src/prisma/create-prisma-client';
import { CATALOG } from './catalog';

const prisma = createPrismaClient();

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

  // ---------------------------------------------------------------- catalogue
  //
  // Tout passe par des upsert sur des identifiants stables : relancer le seed
  // met les tarifs à jour au lieu de créer une deuxième fiche par prestation.

  // Les anciens seeds remplissaient `imageUrl` avec des vignettes placehold.co.
  // Ce champ est prioritaire sur les photos livrées dans le front : tant qu'il
  // porte une URL de démonstration, les vraies photos restent invisibles. On ne
  // vide que celles-là, jamais une image réellement téléversée.
  const placeholders = { imageUrl: { contains: 'placehold.co' } };
  const [clearedCategories, clearedServices] = await Promise.all([
    prisma.category.updateMany({ where: placeholders, data: { imageUrl: null } }),
    prisma.service.updateMany({ where: placeholders, data: { imageUrl: null } }),
  ]);

  if (clearedCategories.count + clearedServices.count > 0) {
    console.log(
      `🧽 ${clearedCategories.count} catégorie(s) et ${clearedServices.count} prestation(s) débarrassées d'une vignette de démonstration`,
    );
  }

  const keptServiceIds: string[] = [];

  for (const category of CATALOG) {
    const { services, ...categoryData } = category;

    const savedCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: categoryData,
      create: { ...categoryData, active: true },
    });

    for (const service of services) {
      const data = {
        categoryId: savedCategory.id,
        name: service.name,
        nameHe: service.nameHe,
        durationMin: service.durationMin,
        priceIls: service.priceIls,
        priceFrom: service.priceFrom ?? false,
        active: true,
      };

      await prisma.service.upsert({
        where: { id: service.id },
        update: data,
        create: { id: service.id, ...data },
      });

      // Eliana réalise toutes les prestations : sans cette liaison, aucun
      // créneau n'est proposé à la réservation.
      await prisma.staffService.upsert({
        where: { staffId_serviceId: { staffId: staff.id, serviceId: service.id } },
        update: {},
        create: { staffId: staff.id, serviceId: service.id },
      });

      keptServiceIds.push(service.id);
    }
  }

  const servicesCount = CATALOG.reduce((total, c) => total + c.services.length, 0);
  console.log(`✅ ${CATALOG.length} catégories et ${servicesCount} prestations à jour`);

  // Ménage des fiches de démonstration laissées par les anciens seeds. On ne
  // touche pas à celles qui portent un rendez-vous : la suppression est en
  // cascade et effacerait l'historique de la cliente.
  const obsolete = await prisma.service.findMany({
    where: { id: { notIn: keptServiceIds } },
    include: { _count: { select: { appointments: true } } },
  });

  const deletable = obsolete.filter((s) => s._count.appointments === 0);
  const booked = obsolete.filter((s) => s._count.appointments > 0);

  if (deletable.length > 0) {
    await prisma.service.deleteMany({ where: { id: { in: deletable.map((s) => s.id) } } });
    console.log(`🧹 ${deletable.length} prestation(s) obsolète(s) supprimée(s)`);
  }

  for (const service of booked) {
    await prisma.service.update({ where: { id: service.id }, data: { active: false } });
    console.log(
      `⚠️  « ${service.name} » hors catalogue mais porte ${service._count.appointments} rendez-vous : désactivée, pas supprimée`,
    );
  }

  // ------------------------------------------------------------------ horaires
  //
  // Dimanche à jeudi, 9h-18h. Un create sec dupliquerait les lignes à chaque
  // exécution du seed, d'où le nettoyage préalable.
  const workingDays = [0, 1, 2, 3, 4];
  await prisma.workingHours.deleteMany({ where: { staffId: staff.id } });
  await prisma.workingHours.createMany({
    data: workingDays.map((weekday) => ({
      staffId: staff.id,
      weekday,
      startHhmm: '09:00',
      endHhmm: '18:00',
    })),
  });
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
