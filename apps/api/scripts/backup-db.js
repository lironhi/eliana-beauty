const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BACKUP_DIR = path.join(__dirname, '../backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
const backupFile = path.join(BACKUP_DIR, `eliana_beauty_backup_${timestamp}.sql`);

// Parse DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

// Extract database connection info from URL
// Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!urlMatch) {
  console.error('❌ Invalid DATABASE_URL format');
  process.exit(1);
}

const [, user, password, host, port, database] = urlMatch;

// Create backups directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('✅ Created backups directory');
}

console.log('🔄 Starting database backup...');
console.log(`📁 Backup file: ${backupFile}`);

// Set PGPASSWORD environment variable for pg_dump
const env = { ...process.env, PGPASSWORD: password };

// Execute pg_dump command
const command = `pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -F p -f "${backupFile}"`;

exec(command, { env }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Backup failed:', error.message);
    if (stderr) console.error('Error details:', stderr);
    process.exit(1);
  }

  // Check if backup file was created and has content
  if (fs.existsSync(backupFile)) {
    const stats = fs.statSync(backupFile);
    console.log(`✅ Backup completed successfully!`);
    console.log(`📊 Backup size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`📁 Location: ${backupFile}`);

    // Clean up old backups (keep last 10)
    cleanOldBackups();
  } else {
    console.error('❌ Backup file was not created');
    process.exit(1);
  }
});

function cleanOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('eliana_beauty_backup_') && f.endsWith('.sql'))
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
