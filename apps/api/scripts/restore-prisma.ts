import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();
const BACKUP_DIR = path.join(__dirname, '../backups');

async function restore() {
  // Get list of available backups
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error('❌ No backups directory found');
    process.exit(1);
  }

  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
    .map(f => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime
    }))
    .sort((a, b) => b.time.getTime() - a.time.getTime());

  if (backups.length === 0) {
    console.error('❌ No backup files found');
    process.exit(1);
  }

  console.log('📋 Available backups:');
  backups.forEach((backup, index) => {
    const size = (fs.statSync(backup.path).size / 1024).toFixed(2);
    console.log(`  ${index + 1}. ${backup.name} (${size} KB) - ${backup.time.toLocaleString()}`);
  });

  // Get backup file from command line argument or use the most recent
  const args = process.argv.slice(2);
  let backupFile: string;

  if (args.length > 0) {
    const index = parseInt(args[0]) - 1;
    if (index >= 0 && index < backups.length) {
      backupFile = backups[index].path;
    } else {
      console.error('❌ Invalid backup number');
      process.exit(1);
    }
  } else {
    backupFile = backups[0].path;
    console.log(`\n⚠️  No backup specified, using most recent: ${backups[0].name}`);
  }

  // Confirm before restoring
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\n⚠️  WARNING: This will DELETE all current data and restore from backup.\nAre you sure? (yes/no): ', async (answer) => {
    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Restore cancelled');
      await prisma.$disconnect();
      process.exit(0);
    }

    try {
      console.log('\n🔄 Starting database restore...');
      console.log(`📁 Restoring from: ${path.basename(backupFile)}`);

      // Read backup file
      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));

      console.log('\n📊 Backup contains:');
      console.log(`   Users: ${backupData.users?.length || 0}`);
      console.log(`   Categories: ${backupData.categories?.length || 0}`);
      console.log(`   Services: ${backupData.services?.length || 0}`);
      console.log(`   Staff: ${backupData.staff?.length || 0}`);
      console.log(`   Appointments: ${backupData.appointments?.length || 0}`);
      console.log(`   Created at: ${backupData.timestamp}`);

      // Delete all existing data (in reverse order of dependencies)
      console.log('\n🗑️  Deleting existing data...');
      await prisma.appointment.deleteMany({});
      await prisma.timeOff.deleteMany({});
      await prisma.workingHours.deleteMany({});
      await prisma.staffService.deleteMany({});
      await prisma.serviceImage.deleteMany({});
      await prisma.service.deleteMany({});
      await prisma.staff.deleteMany({});
      await prisma.category.deleteMany({});
      await prisma.refreshToken.deleteMany({});
      await prisma.user.deleteMany({});

      // Restore data (in order of dependencies)
      console.log('\n📥 Restoring data...');

      if (backupData.users?.length > 0) {
        await prisma.user.createMany({ data: backupData.users });
        console.log(`✅ Restored ${backupData.users.length} users`);
      }

      if (backupData.refreshTokens?.length > 0) {
        await prisma.refreshToken.createMany({ data: backupData.refreshTokens });
        console.log(`✅ Restored ${backupData.refreshTokens.length} refresh tokens`);
      }

      if (backupData.categories?.length > 0) {
        await prisma.category.createMany({ data: backupData.categories });
        console.log(`✅ Restored ${backupData.categories.length} categories`);
      }

      if (backupData.staff?.length > 0) {
        await prisma.staff.createMany({ data: backupData.staff });
        console.log(`✅ Restored ${backupData.staff.length} staff members`);
      }

      if (backupData.services?.length > 0) {
        await prisma.service.createMany({ data: backupData.services });
        console.log(`✅ Restored ${backupData.services.length} services`);
      }

      if (backupData.serviceImages?.length > 0) {
        await prisma.serviceImage.createMany({ data: backupData.serviceImages });
        console.log(`✅ Restored ${backupData.serviceImages.length} service images`);
      }

      if (backupData.staffServices?.length > 0) {
        await prisma.staffService.createMany({ data: backupData.staffServices });
        console.log(`✅ Restored ${backupData.staffServices.length} staff-service relations`);
      }

      if (backupData.workingHours?.length > 0) {
        await prisma.workingHours.createMany({ data: backupData.workingHours });
        console.log(`✅ Restored ${backupData.workingHours.length} working hours`);
      }

      if (backupData.timeOffs?.length > 0) {
        await prisma.timeOff.createMany({ data: backupData.timeOffs });
        console.log(`✅ Restored ${backupData.timeOffs.length} time-offs`);
      }

      if (backupData.appointments?.length > 0) {
        await prisma.appointment.createMany({ data: backupData.appointments });
        console.log(`✅ Restored ${backupData.appointments.length} appointments`);
      }

      console.log('\n✅ Database restored successfully!');
      console.log('💡 You may need to restart your application server');
    } catch (error) {
      console.error('\n❌ Restore failed:', error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  });
}

restore();
