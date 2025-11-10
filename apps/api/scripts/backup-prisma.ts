import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const BACKUP_DIR = path.join(__dirname, '../backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
const backupFile = path.join(BACKUP_DIR, `backup_${timestamp}.json`);

async function backup() {
  console.log('🔄 Starting database backup...');

  try {
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log('✅ Created backups directory');
    }

    // Fetch all data from all tables
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
      appointments: await prisma.appointment.findMany(),
      timestamp: new Date().toISOString(),
    };

    // Write to file
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));

    const stats = fs.statSync(backupFile);
    console.log(`✅ Backup completed successfully!`);
    console.log(`📊 Backup size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`📁 Location: ${backupFile}`);
    console.log(`📅 Timestamp: ${data.timestamp}`);

    // Summary
    console.log('\n📊 Data Summary:');
    console.log(`   Users: ${data.users.length}`);
    console.log(`   Categories: ${data.categories.length}`);
    console.log(`   Services: ${data.services.length}`);
    console.log(`   Staff: ${data.staff.length}`);
    console.log(`   Appointments: ${data.appointments.length}`);

    // Clean up old backups (keep last 10)
    cleanOldBackups();
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function cleanOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
    .map(f => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length > 10) {
    const toDelete = files.slice(10);
    toDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`🗑️  Deleted old backup: ${file.name}`);
    });
  }
}

backup();
