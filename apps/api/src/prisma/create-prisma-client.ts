import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Since Prisma 7 the connection URL lives outside schema.prisma and the client
 * connects through a driver adapter instead of reading DATABASE_URL itself.
 * Every entry point (Nest app, seeds, maintenance scripts) goes through here so
 * they all share the same connection setup.
 */
export function createPrismaAdapter(): PrismaPg {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Check apps/api/.env');
  }

  return new PrismaPg({ connectionString });
}

export function createPrismaClient(): PrismaClient {
  return new PrismaClient({ adapter: createPrismaAdapter() });
}
