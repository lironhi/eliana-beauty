# Development Guide

## Quick Start

```bash
# Install dependencies
pnpm install

# Start database
pnpm db:up

# Setup database (first time only)
cd apps/api
pnpm prisma:generate
pnpm db:push
pnpm db:seed
cd ../..

# Start development
pnpm dev
```

Access:
- Web App: http://localhost:5173
- API: http://localhost:3001
- API Health: http://localhost:3001/health

## Architecture

### Monorepo Structure
- **apps/api**: NestJS REST API
- **apps/web**: React + Vite web application
- **packages/**: Shared code (future expansion)

### Database
- PostgreSQL running in Docker
- Prisma ORM for type-safe database access
- UTC timestamps stored in database
- Timezone conversion handled on frontend

### Authentication
- JWT-based authentication
- Tokens stored in localStorage
- Protected routes with guards
- Role-based access control

## Development Workflow

### Adding a New Feature

1. **Update Prisma Schema** (if needed)
```bash
cd apps/api
# Edit prisma/schema.prisma
pnpm db:push
pnpm prisma:generate
```

2. **Create API Endpoint**
```bash
# Create module
nest g module feature-name
nest g service feature-name
nest g controller feature-name
```

3. **Add Frontend UI**
```tsx
// Create page in apps/web/src/pages/
// Add route in App.tsx
// Create components in apps/web/src/components/
```

4. **Update i18n**
```typescript
// Add translations to apps/web/src/i18n/locales/en.ts
// Add translations to apps/web/src/i18n/locales/he.ts
```

### Code Style

- Use ESLint and Prettier
- TypeScript strict mode enabled
- Functional components with hooks (React)
- Dependency injection (NestJS)

### Testing

```bash
# Run all tests
pnpm test

# Test specific package
pnpm --filter api test

# Watch mode
pnpm --filter api test:watch

# Coverage
pnpm --filter api test:cov
```

## Common Tasks

### Adding a New Language

1. Create translation file: `apps/web/src/i18n/locales/{locale}.ts`
2. Update `Locale` type in `apps/web/src/i18n/index.ts`
3. Add locale to User model in Prisma schema
4. Update translation loader

### Adding a New Service Category

Use the seed script or create via API:

```typescript
await prisma.category.create({
  data: {
    name: 'Category Name',
    slug: 'category-slug',
    active: true,
    order: 6,
    imageUrl: 'https://...',
  },
});
```

### Managing Staff Working Hours

```typescript
// Create working hours for a staff member
await prisma.workingHours.create({
  data: {
    staffId: 'staff-id',
    weekday: 0, // 0=Sunday, 6=Saturday
    startHhmm: '09:00',
    endHhmm: '18:00',
  },
});
```

### Adding Time Off

```typescript
await prisma.timeOff.create({
  data: {
    staffId: 'staff-id',
    startsAt: new Date('2024-12-25T00:00:00Z'),
    endsAt: new Date('2024-12-25T23:59:59Z'),
    reason: 'Holiday',
  },
});
```

## Troubleshooting

### Prisma Client Out of Sync
```bash
cd apps/api
pnpm prisma:generate
```

### Database Connection Failed
```bash
# Check if database is running
docker ps

# Restart database
pnpm db:down
pnpm db:up

# Check connection string in .env
```

### Port Already in Use
```bash
# Kill process on port 3001 (API)
npx kill-port 3001

# Kill process on port 5173 (Web)
npx kill-port 5173
```

### TypeScript Errors
```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

## Performance Optimization

### Database Queries
- Use `include` selectively to avoid over-fetching
- Add indexes for frequently queried fields
- Use pagination for large datasets

### Frontend
- Lazy load components and routes
- Optimize images with proper sizing
- Use React.memo for expensive components
- Implement virtual scrolling for long lists

## Security Best Practices

1. **Never commit secrets** - Use .env files
2. **Validate all inputs** - Use DTOs and class-validator
3. **Sanitize user input** - Prevent SQL injection via Prisma
4. **Use HTTPS in production**
5. **Implement rate limiting** (future enhancement)
6. **Regular dependency updates**

## Deployment Checklist

- [ ] Update environment variables
- [ ] Change JWT secret to secure random string
- [ ] Configure CORS for production domains
- [ ] Set NODE_ENV=production
- [ ] Run database migrations
- [ ] Build all applications
- [ ] Test production build locally
- [ ] Setup monitoring and logging
- [ ] Configure SSL certificates
- [ ] Setup automatic backups

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
