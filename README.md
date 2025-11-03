# Eliana Beauty - Booking System

A modern, mobile-first booking system for beauty services built with a fullstack TypeScript monorepo architecture.

## Features

- **Mobile-First PWA**: Progressive Web App optimized for mobile devices
- **Bilingual Support**: English (default) and Hebrew with RTL support
- **User Roles**: ADMIN, STAFF, and CLIENT with role-based access
- **Service Management**: Categories, services, staff, and scheduling
- **Smart Booking**: 15-minute time slots with anti-overlap validation
- **Appointment Management**: Create, view, and cancel appointments
- **Responsive Design**: Tailwind CSS with mobile-first approach

## Tech Stack

### Monorepo
- **pnpm** + **Turborepo** for workspace management
- Shared packages for types and utilities

### Backend (API)
- **NestJS** - Scalable Node.js framework
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Zod** - Schema validation (via class-validator)

### Frontend (Web)
- **React 18** - UI library
- **Vite** - Fast build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Routing
- **Vite PWA** - Progressive Web App support

## Project Structure

```
eliana-beauty/
├── apps/
│   ├── api/                    # NestJS API
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema
│   │   │   └── seed.ts         # Seed data
│   │   └── src/
│   │       ├── auth/           # Authentication module
│   │       ├── services/       # Services module
│   │       ├── staff/          # Staff module
│   │       ├── availability/   # Availability & slots
│   │       ├── appointments/   # Appointments module
│   │       └── prisma/         # Prisma service
│   └── web/                    # React Web App
│       └── src/
│           ├── components/     # Reusable components
│           ├── pages/          # Page components
│           ├── i18n/           # Internationalization
│           ├── lib/            # API client
│           └── store/          # Zustand stores
├── packages/                   # Shared packages (future)
├── SPECS/                      # Specification documents
├── docker-compose.yml          # PostgreSQL setup
└── turbo.json                  # Turborepo config
```

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Docker** (for PostgreSQL)

### Installation

1. **Clone the repository**
```bash
cd eliana-beauty
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup environment variables**
```bash
# Copy example env files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit the `.env` files with your configuration.

4. **Start PostgreSQL**
```bash
pnpm db:up
```

5. **Setup database**
```bash
# Generate Prisma client
cd apps/api
pnpm prisma:generate

# Push schema to database
pnpm db:push

# Seed initial data
pnpm db:seed
```

### Development

Run both API and Web in development mode:

```bash
# Run all apps
pnpm dev

# Or run individually
pnpm api:dev    # API on http://localhost:3001
pnpm web:dev    # Web on http://localhost:5173
```

### Build

```bash
# Build all apps
pnpm build

# Build individually
pnpm --filter api build
pnpm --filter web build
```

### Testing

```bash
# Run all tests
pnpm test

# Run API tests
pnpm --filter api test

# Run tests with coverage
pnpm --filter api test:cov
```

### Code Quality

```bash
# Lint all packages
pnpm lint

# Type check
pnpm typecheck

# Format code
pnpm format
```

## Database Schema

### Key Models

- **User**: Authentication and user management (CLIENT, STAFF, ADMIN)
- **Category**: Service categories (Nails, Lashes, Brows, etc.)
- **Service**: Individual services with duration and pricing
- **Staff**: Staff members who provide services
- **WorkingHours**: Recurring weekly schedules for staff
- **TimeOff**: Staff absences and holidays
- **Appointment**: Bookings with status tracking

### Appointment Statuses
- `PENDING`: Initial state
- `CONFIRMED`: Approved by staff/admin
- `CANCELLED`: Cancelled by user or admin
- `COMPLETED`: Service completed
- `NO_SHOW`: Client didn't show up

## API Endpoints

### Public
- `GET /health` - Health check
- `GET /services/public` - List active services
- `GET /staff/public?serviceId=...` - List compatible staff
- `GET /availability?staffId=...&date=YYYY-MM-DD` - Get available slots

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (requires JWT)

### Appointments (Protected)
- `POST /appointments` - Create appointment
- `GET /appointments` - Get user's appointments
- `PATCH /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Cancel appointment

## Default Credentials

After running the seed:

**Admin User:**
- Email: `admin@eliana.beauty`
- Password: `admin123`

## Features in Detail

### Internationalization (i18n)
- Supports English (en) and Hebrew (he)
- RTL support for Hebrew
- Language switcher in header
- Persistent locale preference

### Availability System
- 15-minute time slots
- Checks staff working hours
- Validates against time-off periods
- Anti-overlap validation
- Real-time slot availability

### PWA Support
- Offline-ready shell
- App manifest for install prompt
- Service worker caching
- Mobile-optimized icons

### Security
- JWT-based authentication
- Password hashing with bcryptjs
- CORS configuration
- Input validation (class-validator)
- Protected routes

## Environment Variables

### API (.env)
```env
DATABASE_URL="postgresql://eliana:eliana_dev_pass@localhost:5432/eliana_beauty"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Web (.env)
```env
VITE_API_URL=http://localhost:3001
```

## Database Commands

```bash
# Start PostgreSQL
pnpm db:up

# Stop PostgreSQL
pnpm db:down

# Push schema changes
pnpm db:push

# Create migration
pnpm db:migrate

# Seed database
pnpm db:seed
```

## Deployment

### Production Build

```bash
# Build all apps
pnpm build

# API will output to apps/api/dist
# Web will output to apps/web/dist
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Update `DATABASE_URL` with production database
3. Change `JWT_SECRET` to a strong random key
4. Configure `CORS_ORIGIN` with production URLs
5. Update `VITE_API_URL` with production API URL

### Recommended Hosting
- **API**: Railway, Render, or any Node.js hosting
- **Database**: Railway, Supabase, or managed PostgreSQL
- **Web**: Vercel, Netlify, or Cloudflare Pages

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps

# View logs
docker logs eliana-beauty-db

# Restart database
pnpm db:down && pnpm db:up
```

### Port Already in Use
```bash
# Change ports in .env files
# API: PORT=3002
# Web: Update vite.config.ts server.port
```

### Prisma Issues
```bash
# Regenerate Prisma client
cd apps/api
pnpm prisma:generate

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

Private project - All rights reserved.

## Support

For issues and questions, please contact the development team.
