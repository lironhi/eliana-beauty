# Next Steps - Eliana Beauty

## 🚀 Immediate Steps to Run the Project

### 1. Install Dependencies (Required)
```bash
pnpm install
```

### 2. Start Database (Required)
```bash
pnpm db:up
```

### 3. Initialize Database (First Time Only)
```bash
cd apps/api
pnpm prisma:generate
pnpm db:push
pnpm db:seed
cd ../..
```

### 4. Start Development Servers
```bash
pnpm dev
```

**Access the application:**
- Web: http://localhost:5173
- API: http://localhost:3001

---

## ✅ What's Already Done

### Backend (API)
✅ Complete NestJS project structure
✅ Prisma schema with all models
✅ Authentication module (JWT)
✅ Services module (CRUD)
✅ Staff module (management)
✅ Availability module (slot calculation)
✅ Appointments module (booking logic)
✅ Anti-overlap validation
✅ Seed script with sample data
✅ Unit tests for availability
✅ Docker Compose for PostgreSQL

### Frontend (Web)
✅ React + Vite setup
✅ Tailwind CSS configuration
✅ PWA support
✅ Bilingual support (EN/HE)
✅ RTL support for Hebrew
✅ All main pages implemented
✅ Responsive mobile-first design
✅ Authentication flow
✅ Booking flow
✅ API client integration
✅ State management (Zustand)

### Infrastructure
✅ Monorepo with pnpm + Turborepo
✅ ESLint + Prettier configuration
✅ TypeScript strict mode
✅ Environment variables setup
✅ Git ignore configuration
✅ Complete documentation

---

## 🎯 Recommended Customizations

### 1. Branding & Design (Optional)
```javascript
// apps/web/tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-brand-color',
        // ... customize other shades
      },
    },
  },
}
```

### 2. Add Your Services (Recommended)
Edit `apps/api/prisma/seed.ts` to add your actual services, categories, and staff.

### 3. Update Images (Recommended)
Replace placeholder images with real images:
- Service images
- Category images
- PWA icons (apps/web/public/icon-*.png)

### 4. Configure Email (Future)
For booking confirmations and reminders:
- Add email service (Nodemailer, SendGrid, etc.)
- Create email templates
- Update appointment creation to send emails

---

## 📋 Testing Checklist

### Basic Functionality
- [ ] Home page loads
- [ ] Services page shows all services
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can select a service
- [ ] Can see available time slots
- [ ] Can create a booking
- [ ] Can view bookings
- [ ] Can cancel a booking
- [ ] Language switcher works
- [ ] RTL layout works in Hebrew

### API Endpoints
- [ ] GET /health returns OK
- [ ] GET /services/public returns services
- [ ] POST /auth/register creates user
- [ ] POST /auth/login returns token
- [ ] POST /appointments creates booking
- [ ] Overlapping bookings are prevented

---

## 🔧 Common Customization Tasks

### Add a New Service Category

```typescript
// In apps/api/prisma/seed.ts
await prisma.category.create({
  data: {
    name: 'Your Category',
    slug: 'your-category',
    active: true,
    order: 6,
    imageUrl: 'https://your-image-url.com',
  },
});
```

### Add a New Service

```typescript
await prisma.service.create({
  data: {
    categoryId: 'category-id',
    name: 'Your Service',
    description: 'Service description',
    durationMin: 60,
    priceIls: 100,
    active: true,
    imageUrl: 'https://your-service-image.com',
  },
});
```

### Add a New Staff Member

```typescript
const newStaff = await prisma.staff.create({
  data: {
    name: 'Staff Name',
    bio: 'Bio description',
    active: true,
  },
});

// Add working hours
await prisma.workingHours.createMany({
  data: [
    { staffId: newStaff.id, weekday: 0, startHhmm: '09:00', endHhmm: '18:00' },
    { staffId: newStaff.id, weekday: 1, startHhmm: '09:00', endHhmm: '18:00' },
    // ... more days
  ],
});
```

### Change Theme Colors

```javascript
// apps/web/tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        50: '#fef2f2',   // lightest
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',  // main color
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',  // darkest
      },
    },
  },
}
```

---

## 📚 Important Files to Know

### Configuration Files
- `package.json` - Root dependencies and scripts
- `turbo.json` - Monorepo build configuration
- `docker-compose.yml` - Database setup
- `.env` - Environment variables

### Backend Files
- `apps/api/prisma/schema.prisma` - Database schema
- `apps/api/src/app.module.ts` - Main API module
- `apps/api/src/main.ts` - API entry point
- `apps/api/prisma/seed.ts` - Seed data

### Frontend Files
- `apps/web/src/App.tsx` - Main app component
- `apps/web/src/main.tsx` - Entry point
- `apps/web/src/lib/api.ts` - API client
- `apps/web/src/i18n/` - Translations

### Documentation Files
- `README.md` - Main documentation
- `GETTING_STARTED.md` - Quick start guide
- `DEVELOPMENT.md` - Developer guide
- `PROJECT_SUMMARY.md` - Project overview

---

## 🐛 Troubleshooting Guide

### Issue: Database won't start
```bash
docker ps  # Check if running
docker logs eliana-beauty-db  # Check logs
pnpm db:down && pnpm db:up  # Restart
```

### Issue: Port already in use
```bash
npx kill-port 3001  # Kill API port
npx kill-port 5173  # Kill Web port
```

### Issue: Prisma client errors
```bash
cd apps/api
pnpm prisma:generate
cd ../..
```

### Issue: TypeScript errors
```bash
pnpm clean
rm -rf node_modules
pnpm install
pnpm build
```

### Issue: Cannot connect to database
Check `.env` files:
```env
DATABASE_URL="postgresql://eliana:eliana_dev_pass@localhost:5432/eliana_beauty"
```

---

## 🎓 Learning the Codebase

### Start Here (Recommended Order)
1. Read `GETTING_STARTED.md`
2. Browse `SPECS/` folder for requirements
3. Explore `apps/api/prisma/schema.prisma` for data model
4. Check `apps/api/src/` for API structure
5. Review `apps/web/src/pages/` for UI flow
6. Read `DEVELOPMENT.md` for advanced topics

### Key Concepts to Understand
- **Monorepo**: How pnpm workspace + Turborepo work
- **Prisma**: How to define models and relationships
- **NestJS**: Modules, services, controllers pattern
- **React Hooks**: useState, useEffect usage
- **Zustand**: State management pattern
- **JWT Auth**: How authentication flow works

---

## 🚀 Deployment Preparation

When ready to deploy to production:

### 1. Environment Variables
```bash
# Production API .env
NODE_ENV=production
DATABASE_URL="your-production-db-url"
JWT_SECRET="strong-random-secret-here"
CORS_ORIGIN="https://yourdomain.com"
```

```bash
# Production Web .env
VITE_API_URL="https://api.yourdomain.com"
```

### 2. Build for Production
```bash
pnpm build
```

### 3. Deploy API
- Upload `apps/api/dist/` to Node.js hosting
- Run database migrations
- Set environment variables
- Start with: `node dist/main.js`

### 4. Deploy Web
- Upload `apps/web/dist/` to static hosting
- Configure redirects for SPA
- Set environment variables

### Recommended Hosting
- **API**: Railway, Render, Fly.io, Heroku
- **Database**: Railway, Supabase, Neon, AWS RDS
- **Web**: Vercel, Netlify, Cloudflare Pages

---

## 📞 Support

### Resources
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### File Issues
Check existing files for similar issues first:
- API issues: Check `apps/api/src/`
- UI issues: Check `apps/web/src/`
- Database issues: Check `apps/api/prisma/`

---

## ✨ Quick Commands Reference

```bash
# Development
pnpm dev              # Start everything
pnpm api:dev          # API only
pnpm web:dev          # Web only

# Database
pnpm db:up            # Start DB
pnpm db:seed          # Add sample data
pnpm db:down          # Stop DB

# Quality
pnpm lint             # Check code
pnpm typecheck        # Check types
pnpm test             # Run tests

# Build
pnpm build            # Build all
pnpm clean            # Clean build files
```

---

## 🎉 You're Ready!

Everything is set up and ready to go. Just run:

```bash
pnpm install
pnpm db:up
cd apps/api && pnpm prisma:generate && pnpm db:push && pnpm db:seed && cd ../..
pnpm dev
```

Then open http://localhost:5173 in your browser!

**Happy coding! 🚀**
