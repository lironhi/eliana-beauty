import * as fs from 'fs';
import * as path from 'path';
import { createPrismaClient } from '../src/prisma/create-prisma-client';

const prisma = createPrismaClient();

async function exportData() {
  try {
    console.log('🔄 Exporting data from current database...\n');

    const data = {
      users: await prisma.user.findMany(),
      refreshTokens: await prisma.refreshToken.findMany(),
      categories: await prisma.category.findMany(),
      services: await prisma.service.findMany(),
      serviceImages: await prisma.serviceImage.findMany(),
      staff: await prisma.staff.findMany(),
      staffServices: await prisma.staffService.findMany(),
      workingHours: await prisma.workingHours.findMany(),
      timeOffs: await prisma.timeOff.findMany(),
      hourBlocks: await prisma.hourBlock.findMany(),
      appointments: await prisma.appointment.findMany(),
      messages: await prisma.message.findMany(),
      messageRecipients: await prisma.messageRecipient.findMany(),
      fcmTokens: await prisma.fcmToken.findMany(),
      uploadedImages: await prisma.uploadedImage.findMany(),
      paymentMethodConfigs: await prisma.paymentMethodConfig.findMany(),
    };

    const exportDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `data-export-${timestamp}.json`;
    const filepath = path.join(exportDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

    console.log('✅ Data exported successfully!');
    console.log(`📁 File: ${filepath}`);
    console.log(`\n📊 Statistics:`);
    console.log(`   Users: ${data.users.length}`);
    console.log(`   Categories: ${data.categories.length}`);
    console.log(`   Services: ${data.services.length}`);
    console.log(`   Staff: ${data.staff.length}`);
    console.log(`   Appointments: ${data.appointments.length}`);
    console.log(`   Messages: ${data.messages.length}`);

  } catch (error) {
    console.error('❌ Error exporting data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
