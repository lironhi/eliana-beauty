import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');
  private readonly metadataFile = path.join(this.backupDir, 'metadata.json');

  constructor(private prisma: PrismaService) {
    this.ensureBackupDir();
  }

  private async ensureBackupDir() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      this.logger.error('Failed to create backup directory:', error);
    }
  }

  async backupDatabase(tables?: string[]) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.json`;
      const filepath = path.join(this.backupDir, filename);

      // Map display names to Prisma model names
      const tableMapping: Record<string, string> = {
        'User': 'user',
        'Service': 'service',
        'Category': 'category',
        'Appointment': 'appointment',
        'Message': 'message',
        'MessageRecipient': 'messageRecipient',
        'FcmToken': 'fcmToken',
        'Staff': 'staff',
        'RefreshToken': 'refreshToken',
      };

      const availableTables = Object.keys(tableMapping);

      // Determine which tables to backup
      const tablesToBackup = tables && tables.length > 0 ? tables : availableTables;

      // Collect data from all tables
      const backupData: Record<string, any[]> = {};

      for (const tableName of tablesToBackup) {
        if (!availableTables.includes(tableName)) {
          this.logger.warn(`Table ${tableName} not found, skipping...`);
          continue;
        }

        try {
          // Use Prisma to fetch data from each table
          const modelName = tableMapping[tableName];
          const data = await (this.prisma as any)[modelName].findMany();
          backupData[tableName] = data;
          this.logger.log(`Backed up ${data.length} records from ${tableName}`);
        } catch (error) {
          this.logger.error(`Failed to backup table ${tableName}:`, error);
        }
      }

      // Write backup to file
      await fs.writeFile(filepath, JSON.stringify(backupData, null, 2), 'utf-8');

      // Update metadata
      await this.updateMetadata({
        lastBackupDate: new Date().toISOString(),
        lastBackupFile: filename,
        tables: tablesToBackup,
      });

      this.logger.log(`Database backup completed: ${filename}`);
      return {
        success: true,
        message: 'Database backup completed successfully',
        filename,
      };
    } catch (error) {
      this.logger.error('Database backup failed:', error);
      throw error;
    }
  }

  async restoreDatabase(tables?: string[]) {
    try {
      // Get the latest backup file
      const metadata = await this.getMetadata();
      if (!metadata?.lastBackupFile) {
        throw new Error('No backup file found');
      }

      const filepath = path.join(this.backupDir, metadata.lastBackupFile);
      const backupContent = await fs.readFile(filepath, 'utf-8');
      const backupData = JSON.parse(backupContent);

      // Map display names to Prisma model names
      const tableMapping: Record<string, string> = {
        'User': 'user',
        'Service': 'service',
        'Category': 'category',
        'Appointment': 'appointment',
        'Message': 'message',
        'MessageRecipient': 'messageRecipient',
        'FcmToken': 'fcmToken',
        'Staff': 'staff',
        'RefreshToken': 'refreshToken',
      };

      // Determine which tables to restore
      const tablesToRestore = tables && tables.length > 0 ? tables : Object.keys(backupData);
      const restoredTables: string[] = [];

      // Restore data to each table (in specific order to respect foreign key constraints)
      const orderedTables = [
        'User',
        'Category',
        'Service',
        'Staff',
        'Appointment',
        'Message',
        'MessageRecipient',
        'FcmToken',
        'RefreshToken',
      ];

      for (const tableName of orderedTables) {
        if (!tablesToRestore.includes(tableName) || !backupData[tableName]) {
          continue;
        }

        try {
          const modelName = tableMapping[tableName];
          if (!modelName) {
            this.logger.warn(`No mapping found for table ${tableName}, skipping...`);
            continue;
          }

          const records = backupData[tableName];

          // Delete existing records
          await (this.prisma as any)[modelName].deleteMany({});

          // Insert backup records
          if (records.length > 0) {
            await (this.prisma as any)[modelName].createMany({
              data: records,
              skipDuplicates: true,
            });
          }

          restoredTables.push(tableName);
          this.logger.log(`Restored ${records.length} records to ${tableName}`);
        } catch (error) {
          this.logger.error(`Failed to restore table ${tableName}:`, error);
        }
      }

      this.logger.log(`Database restore completed`);
      return {
        success: true,
        message: 'Database restored successfully',
        restoredTables,
      };
    } catch (error) {
      this.logger.error('Database restore failed:', error);
      throw error;
    }
  }

  async getLastBackupDate(): Promise<{ date: string | null }> {
    try {
      const metadata = await this.getMetadata();
      return {
        date: metadata?.lastBackupDate || null,
      };
    } catch (error) {
      return { date: null };
    }
  }

  private async getMetadata() {
    try {
      const content = await fs.readFile(this.metadataFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  private async updateMetadata(data: {
    lastBackupDate: string;
    lastBackupFile: string;
    tables: string[];
  }) {
    try {
      await fs.writeFile(this.metadataFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      this.logger.error('Failed to update metadata:', error);
    }
  }
}
