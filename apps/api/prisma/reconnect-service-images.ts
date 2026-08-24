import * as fs from 'fs';
import * as path from 'path';
import { createPrismaClient } from '../src/prisma/create-prisma-client';

const prisma = createPrismaClient();

async function reconnectServiceImages() {
  try {
    console.log('🔍 Starting service image reconnection...\n');

    // Get all services from database
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'asc' },
    });

    console.log(`Found ${services.length} services in database\n`);

    // Get all image files from uploads/services directory
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'services');
    const imageFiles = fs.readdirSync(uploadsDir).filter(file =>
      file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
    );

    console.log(`Found ${imageFiles.length} image files in uploads/services/\n`);
    imageFiles.forEach(file => console.log(`  - ${file}`));
    console.log();

    // Sort image files by their timestamp (in filename)
    imageFiles.sort((a, b) => {
      const aTime = parseInt(a.match(/\d+/)?.[0] || '0');
      const bTime = parseInt(b.match(/\d+/)?.[0] || '0');
      return aTime - bTime;
    });

    // Match services to images
    let updatedCount = 0;
    for (let i = 0; i < Math.min(services.length, imageFiles.length); i++) {
      const service = services[i];
      const imagePath = `/uploads/services/${imageFiles[i]}`;

      // Check if service already has this image
      if (service.imageUrl !== imagePath) {
        await prisma.service.update({
          where: { id: service.id },
          data: { imageUrl: imagePath },
        });

        console.log(`✅ Updated "${service.name}" with image: ${imagePath}`);
        updatedCount++;
      } else {
        console.log(`⏭️  "${service.name}" already has correct image: ${imagePath}`);
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} service(s)`);
    console.log(`✨ All service images have been reconnected!\n`);

  } catch (error) {
    console.error('❌ Error reconnecting service images:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

reconnectServiceImages();
