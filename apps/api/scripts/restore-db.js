const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BACKUP_DIR = path.join(__dirname, '../backups');

// Parse DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

// Extract database connection info from URL
const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!urlMatch) {
  console.error('❌ Invalid DATABASE_URL format');
  process.exit(1);
}

const [, user, password, host, port, database] = urlMatch;

// Get list of available backups
if (!fs.existsSync(BACKUP_DIR)) {
  console.error('❌ No backups directory found');
  process.exit(1);
}

const backups = fs.readdirSync(BACKUP_DIR)
  .filter(f => f.startsWith('eliana_beauty_backup_') && f.endsWith('.sql'))
  .map(f => ({
    name: f,
    path: path.join(BACKUP_DIR, f),
    time: fs.statSync(path.join(BACKUP_DIR, f)).mtime
  }))
  .sort((a, b) => b.time - a.time);

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
let backupFile;

if (args.length > 0) {
  const index = parseInt(args[0]) - 1;
  if (index >= 0 && index < backups.length) {
    backupFile = backups[index].path;
  } else {
    console.error('❌ Invalid backup number');
    process.exit(1);
  }
} else {
  // Use most recent backup
  backupFile = backups[0].path;
  console.log(`\n⚠️  No backup specified, using most recent: ${backups[0].name}`);
}

// Confirm before restoring
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\n⚠️  WARNING: This will DELETE all current data and restore from backup.\nAre you sure? (yes/no): ', (answer) => {
  rl.close();

  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Restore cancelled');
    process.exit(0);
  }

  console.log('\n🔄 Starting database restore...');
  console.log(`📁 Restoring from: ${path.basename(backupFile)}`);

  // Set PGPASSWORD environment variable
  const env = { ...process.env, PGPASSWORD: password };

  // First drop and recreate the database (optional, for clean restore)
  // const dropCommand = `psql -h ${host} -p ${port} -U ${user} -d postgres -c "DROP DATABASE IF EXISTS ${database}; CREATE DATABASE ${database};"`;

  // Execute psql command to restore
  const command = `psql -h ${host} -p ${port} -U ${user} -d ${database} -f "${backupFile}"`;

  exec(command, { env }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Restore failed:', error.message);
      if (stderr) console.error('Error details:', stderr);
      process.exit(1);
    }

    console.log('✅ Database restored successfully!');
    console.log('💡 You may need to restart your application server');
  });
});
