# Eliana Beauty API

NestJS-based REST API for the Eliana Beauty booking system.

## Setup

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Generate Prisma client
pnpm prisma:generate

# Push schema to database
pnpm db:push

# Seed database
pnpm db:seed
```

## Development

```bash
# Run in development mode
pnpm dev

# Build
pnpm build

# Start production
pnpm start
```

## Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:cov

# Run tests in watch mode
pnpm test:watch
```

## API Documentation

See main README for endpoint documentation.

## Database

### Schema Management

```bash
# Push schema changes
pnpm db:push

# Create migration
pnpm db:migrate

# Seed database
pnpm db:seed
```

### Prisma Studio

```bash
npx prisma studio
```

Opens Prisma Studio on http://localhost:5555
