# Getting Started - Eliana Beauty

Quick guide to get the Eliana Beauty booking system up and running.

## Prerequisites Check

Before starting, ensure you have:

- [x] **Node.js** v18+ installed (`node --version`)
- [x] **pnpm** v8+ installed (`pnpm --version`)
- [x] **Docker** installed and running (`docker --version`)

If you don't have pnpm:
```bash
npm install -g pnpm
```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the monorepo (API + Web).

### 2. Setup Environment Variables

```bash
# Copy environment example files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

The default values work for local development. No changes needed!

### 3. Start PostgreSQL Database

```bash
pnpm db:up
```

This starts PostgreSQL in Docker. Wait for it to be healthy (about 10 seconds).

### 4. Setup Database Schema

```bash
cd apps/api
pnpm prisma:generate
pnpm db:push
pnpm db:seed
cd ../..
```

This will:
- Generate Prisma client
- Create database tables
- Seed initial data (categories, services, staff, admin user)

### 5. Start Development Servers

```bash
pnpm dev
```

This starts both API and Web servers:
- **API**: http://localhost:3001
- **Web**: http://localhost:5173

## Test the Application

### 1. Open Web App
Navigate to http://localhost:5173

### 2. Explore Services
- Click "Book Now" or "Services" in navigation
- Browse available services

### 3. Create a Booking
- Select a service
- Choose a staff member
- Pick a date (today or future)
- Select a time slot
- You'll be prompted to login/register

### 4. Login as Admin (Optional)
- Email: `admin@eliana.beauty`
- Password: `admin123`

### 5. Create User Account
- Click "Register" in navigation
- Fill in your details
- After registration, you can create bookings

## API Testing

### Health Check
```bash
curl http://localhost:3001/health
```

### Get Services
```bash
curl http://localhost:3001/services/public
```

### Get Staff
```bash
curl http://localhost:3001/staff/public
```

## Common Commands

### Development
```bash
pnpm dev              # Start both API and Web
pnpm api:dev          # Start only API
pnpm web:dev          # Start only Web
```

### Database
```bash
pnpm db:up            # Start PostgreSQL
pnpm db:down          # Stop PostgreSQL
pnpm db:seed          # Seed data
```

### Build
```bash
pnpm build            # Build all apps
pnpm typecheck        # Check TypeScript
pnpm lint             # Lint code
```

### Testing
```bash
pnpm test             # Run all tests
```

## Project Structure Overview

```
eliana-beauty/
├── apps/
│   ├── api/              # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/     # Authentication
│   │   │   ├── services/ # Services CRUD
│   │   │   ├── staff/    # Staff management
│   │   │   ├── availability/ # Time slots
│   │   │   └── appointments/ # Bookings
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── seed.ts
│   └── web/              # React Frontend
│       └── src/
│           ├── pages/    # Home, Services, Login, etc.
│           ├── components/ # Reusable UI
│           ├── i18n/     # EN/HE translations
│           └── store/    # Zustand state
└── SPECS/                # Requirements docs
```

## Key Features Implemented

✅ **Monorepo with pnpm + Turborepo**
- Shared workspace configuration
- Parallel builds and caching

✅ **NestJS API**
- RESTful endpoints
- JWT authentication
- Anti-overlap booking validation
- Role-based access (ADMIN/STAFF/CLIENT)

✅ **Prisma Database**
- Complete schema with relationships
- UTC timestamps
- Indexed queries for performance

✅ **React + Vite Web App**
- Mobile-first responsive design
- PWA support
- Tailwind CSS styling

✅ **Bilingual Support**
- English (default)
- Hebrew with RTL support
- Language switcher

✅ **Booking System**
- 15-minute time slots
- Staff working hours
- Time-off management
- Appointment statuses

✅ **Quality Tools**
- ESLint + Prettier
- TypeScript strict mode
- Jest testing
- Type-safe API client

## Next Steps

1. **Explore the codebase**
   - Check [apps/api/src](apps/api/src) for backend logic
   - Check [apps/web/src](apps/web/src) for frontend code

2. **Read the documentation**
   - [README.md](README.md) - Main documentation
   - [DEVELOPMENT.md](DEVELOPMENT.md) - Developer guide
   - [SPECS/](SPECS/) - Requirements specifications

3. **Customize the application**
   - Update branding and colors in [apps/web/tailwind.config.js](apps/web/tailwind.config.js)
   - Modify services and categories in seed script
   - Add your own images and assets

4. **Add features**
   - Implement email notifications
   - Add admin dashboard
   - Create staff mobile app
   - Integrate payment processing

## Troubleshooting

### Database won't start?
```bash
# Check Docker is running
docker ps

# View database logs
docker logs eliana-beauty-db

# Restart database
pnpm db:down && pnpm db:up
```

### API won't start?
```bash
# Check if port 3001 is available
npx kill-port 3001

# Regenerate Prisma client
cd apps/api && pnpm prisma:generate
```

### Web won't start?
```bash
# Check if port 5173 is available
npx kill-port 5173

# Clear Vite cache
rm -rf apps/web/node_modules/.vite
```

### TypeScript errors?
```bash
# Clean and reinstall
pnpm clean
rm -rf node_modules
pnpm install
```

## Need Help?

- Check the [README.md](README.md) for detailed documentation
- Review [DEVELOPMENT.md](DEVELOPMENT.md) for development guides
- Check the [SPECS/](SPECS/) folder for requirements
- Review the code comments

## What's Included?

### Seeded Data
- 5 categories (Nails, Lashes, Brows, Waxing, Makeup)
- 4 services (Manicure, Gel Nails, Gel Extension, Brow Design)
- 1 staff member (Eliana)
- Working hours (Sun-Thu, 9:00-18:00)
- 1 admin user (admin@eliana.beauty)

### Pages
- **Home**: Categories showcase
- **Services**: Service listing
- **Service Detail**: Booking flow
- **Login/Register**: Authentication
- **My Bookings**: Appointment management

### API Modules
- Health check
- Authentication (JWT)
- Services (public + CRUD)
- Staff (public + CRUD)
- Availability (slot calculation)
- Appointments (CRUD + validation)

## Production Deployment

When ready to deploy:

1. Build the project: `pnpm build`
2. Update environment variables for production
3. Deploy API to Node.js hosting (Railway, Render, etc.)
4. Deploy Web to static hosting (Vercel, Netlify, etc.)
5. Setup production PostgreSQL database

See [README.md](README.md) deployment section for details.

---

**Happy Coding! 🚀**
