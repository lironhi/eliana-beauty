import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Prisma 7 no longer reads the connection URL from schema.prisma.
// Migrations and introspection get it here; the runtime client gets it
// through the pg driver adapter (see src/prisma/create-prisma-client.ts).
//
// `generate` does not need a database at all, and CI builds (Vercel, Render)
// run it without a .env file. Prisma's `env()` helper throws on a missing
// variable, which would break those builds, so the datasource is only declared
// when the URL is actually present. Commands that do need it -- migrate,
// db push, db pull -- still fail loudly with Prisma's own error.
const connectionString = process.env.DATABASE_URL;

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'ts-node prisma/seed.ts',
  },
  ...(connectionString ? { datasource: { url: connectionString } } : {}),
});
