# Eliana Beauty - Booking System

A comprehensive, mobile-first booking and CRM system for beauty salons built with modern fullstack TypeScript architecture.

## Overview

Eliana Beauty is a complete business management solution designed for beauty salons and independent beauty professionals. The system combines client-facing booking capabilities with powerful CRM tools for managing appointments, staff schedules, services, and analytics.
## Screenshots
<p align="center">
  <img src="Screenshot_1.png" width="300">
  <img src="Screenshot_6.png" width="300">
  <img src="Screenshot_3.png" width="300">
  <img src="Screenshot_4.png" width="300">
  <img src="Screenshot_5.png" width="300">
  <img src="Screenshot_2.png" width="300">
</p>

## Key Features

### Client Features
- **Smart Booking System**: Book appointments with intelligent time slot availability
- **Service Catalog**: Browse services by categories with detailed descriptions
- **Staff Selection**: Choose specific staff members or let the system assign one
- **Appointment Management**: View upcoming appointments, history, and cancel bookings
- **Profile Management**: Update personal information and preferences
- **Bilingual Interface**: Full support for English and Hebrew with RTL layout

### Admin/Staff CRM Features
- **Dashboard Analytics**:
  - Today's appointments overview
  - Weekly and monthly statistics
  - Revenue tracking with completed appointments
  - Client count and active services monitoring

- **Advanced Appointment Management**:
  - Calendar and table view modes
  - Status tracking (Pending, Confirmed, Completed, Cancelled, No Show, Reschedule)
  - **Edit appointment prices** individually
  - **Reschedule appointments** with automatic conflict detection
  - Export appointments to CSV and PDF
  - Advanced filtering (date range, status, client name, service, staff, price range)
  - Sorting by date, client, service, staff, or status

- **Service Management**:
  - Create/edit services with multiple languages
  - Category organization
  - Duration and pricing configuration
  - **"From" price indicator** for variable pricing
  - Service images and descriptions
  - Active/inactive status control

- **Staff Management**:
  - Staff profiles with bio and contact info
  - Service assignments per staff member
  - Working hours configuration (recurring weekly schedule)
  - Time-off management (vacation, sick leave, breaks)
  - Individual staff performance tracking

- **Client Management**:
  - Client database with contact information
  - Appointment history per client
  - Edit client details
  - Client activity tracking

### Advanced Booking Intelligence
- **Duration-Aware Scheduling**:
  - Red time slots indicate insufficient time before next appointment
  - Grey slots show already booked times
  - Green slots are fully available

- **Working Hours Filtering**:
  - Only shows dates when selected staff works
  - Respects staff time-off periods

- **Booking Limits**:
  - Maximum 1-month advance booking
  - Prevents past date bookings

- **Conflict Prevention**:
  - Real-time overlap detection
  - Service duration consideration
  - Multi-appointment validation

## Tech Stack

### Monorepo Architecture
- **pnpm** + **Turborepo** - Efficient workspace management
- Shared configurations across packages

### Backend (API)
- **NestJS 10** - Enterprise-grade Node.js framework
- **Prisma 5** - Type-safe database ORM
- **PostgreSQL** - Robust relational database
- **JWT** - Secure authentication with refresh tokens
- **bcryptjs** - Password hashing (10 rounds)
- **class-validator** - Request validation
- **@nestjs/passport** - Authentication strategies

### Frontend (Web)
- **React 18** - Modern UI library with hooks
- **Vite 5** - Lightning-fast development server
- **TypeScript 5** - Full type safety
- **Tailwind CSS 3** - Utility-first styling
- **Zustand** - Lightweight state management
- **React Router 6** - Client-side routing
- **Vite PWA** - Progressive Web App capabilities
- **react-hot-toast** - Beautiful notifications
- **Recharts** - Data visualization

## Project Structure

```
eliana-beauty/
├── apps/
│   ├── api/                          # NestJS Backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Database schema
│   │   │   └── seed.ts               # Seed data with demo accounts
│   │   └── src/
│   │       ├── auth/                 # Authentication & authorization
│   │       │   ├── guards/           # JWT & role guards
│   │       │   ├── strategies/       # Passport strategies
│   │       │   └── decorators/       # Custom decorators
│   │       ├── admin/                # Admin CRM endpoints
│   │       ├── services/             # Service management
│   │       ├── staff/                # Staff & working hours
│   │       ├── availability/         # Time slot generation
│   │       ├── appointments/         # Booking management
│   │       ├── email/                # Email service
│   │       └── prisma/               # Prisma service
│   │
│   └── web/                          # React Frontend
│       └── src/
│           ├── components/
│           │   ├── admin/            # Admin-specific components
│           │   │   ├── AdminLayout.tsx
│           │   │   ├── Calendar.tsx
│           │   │   ├── BarChart.tsx
│           │   │   └── DeleteConfirmationModal.tsx
│           │   ├── Layout.tsx        # Main layout wrapper
│           │   ├── ProtectedRoute.tsx
│           │   └── MobileBottomNav.tsx
│           │
│           ├── pages/
│           │   ├── Home.tsx          # Landing page
│           │   ├── Services.tsx      # Service catalog
│           │   ├── ServiceDetail.tsx # Individual service page
│           │   ├── Booking.tsx       # Booking flow
│           │   ├── MyBookings.tsx    # User appointments
│           │   ├── Profile.tsx       # User profile
│           │   ├── Login.tsx         # Authentication
│           │   ├── Register.tsx      # User registration
│           │   └── admin/            # Admin pages
│           │       ├── Dashboard.tsx
│           │       ├── Appointments.tsx
│           │       ├── Services.tsx
│           │       ├── Staff.tsx
│           │       ├── StaffProfile.tsx
│           │       └── Clients.tsx
│           │
│           ├── i18n/                 # Internationalization
│           │   ├── locales/
│           │   │   ├── en.ts         # English translations
│           │   │   └── he.ts         # Hebrew translations
│           │   └── i18nStore.ts      # Language state
│           │
│           ├── lib/
│           │   ├── api.ts            # API client with typed methods
│           │   └── export.ts         # CSV/PDF export utilities
│           │
│           └── store/
│               └── authStore.ts      # Authentication state
│
├── SPECS/                            # Project specifications
├── docker-compose.yml                # PostgreSQL containerization
├── turbo.json                        # Turborepo configuration
└── package.json                      # Root workspace config
```

## Database Schema

### Core Models

#### User
- Authentication and profile management
- Roles: `CLIENT`, `STAFF`, `ADMIN`
- Fields: name, email, phone, password (hashed), locale preference

#### Category
- Service categorization (multilingual)
- Fields: name, nameHe (Hebrew), displayOrder, active status

#### Service
- Individual service offerings (multilingual)
- Fields: name, nameHe, description, descriptionHe, duration, price, **priceFrom** flag, image URL
- Relations: belongs to Category, performed by Staff

#### Staff
- Staff member profiles
- Fields: name, email, bio, bioHe, active status
- Relations: provides Services, has WorkingHours, has TimeOff, manages Appointments

#### WorkingHours
- Recurring weekly schedules
- Fields: staffId, weekday (0=Sunday, 6=Saturday), startHhmm, endHhmm

#### TimeOff
- Staff absences and holidays
- Fields: staffId, type (VACATION, SICK, BREAK, HOLIDAY), startsAt, endsAt, reason

#### Appointment
- Booking records with full audit trail
- Fields: clientId, serviceId, staffId, startsAt, endsAt, status, **priceIls**, notes, source
- Status tracking: PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULE, RESCHEDULE_PENDING

### Key Features
- **Soft deletes** for data integrity
- **Timestamp tracking** (createdAt, updatedAt)
- **Cascading deletes** where appropriate
- **Index optimization** for performance
- **Price preservation** - stores appointment price at booking time

## API Endpoints

### Public Endpoints

#### Health & Services
```http
GET  /health                                    # Health check
GET  /services/public                           # Active services (multilingual)
GET  /services/:id                              # Service details
GET  /services/categories/all                   # All categories
```

#### Staff & Availability
```http
GET  /staff/public?serviceId=...                # Staff for service (with working hours)
GET  /availability?staffId=...&date=YYYY-MM-DD&durationMin=... # Available slots
```

### Authentication
```http
POST /auth/register                             # New user registration
POST /auth/login                                # User login (JWT)
POST /auth/refresh                              # Refresh access token
POST /auth/logout                               # Logout (invalidate refresh token)
GET  /auth/me                                   # Current user info
PATCH /auth/profile                             # Update profile
PATCH /auth/password                            # Change password
```

### Client Endpoints (Protected)
```http
POST   /appointments                            # Create appointment
GET    /appointments                            # User's appointments
GET    /appointments/:id                        # Appointment details
PATCH  /appointments/:id                        # Update appointment
DELETE /appointments/:id                        # Cancel appointment
```

### Admin/Staff Endpoints (Protected - Role-based)

#### Dashboard
```http
GET /admin/dashboard                            # Analytics & statistics
```

#### Appointment Management
```http
GET   /admin/appointments?status=...&staffId=...&date=...  # List appointments (paginated)
PATCH /admin/appointments/:id/status            # Update status
PATCH /admin/appointments/:id/price             # Edit price [ADMIN only]
PATCH /admin/appointments/:id/reschedule        # Reschedule appointment
DELETE /admin/appointments/:id                  # Delete appointment [ADMIN only]
```

#### Service Management
```http
GET    /services/admin/all?page=...&limit=...   # All services (paginated)
POST   /services                                # Create service [ADMIN only]
PUT    /services/:id                            # Update service [ADMIN only]
DELETE /services/:id                            # Delete service [ADMIN only]
POST   /services/categories                     # Create category [ADMIN only]
PUT    /services/categories/:id                 # Update category [ADMIN only]
DELETE /services/categories/:id                 # Delete category [ADMIN only]
```

#### Staff Management
```http
GET    /staff/admin/all?page=...&limit=...      # All staff (paginated)
GET    /staff/:id                               # Staff profile with details
POST   /staff                                   # Create staff [ADMIN only]
PUT    /staff/:id                               # Update staff [ADMIN only]
DELETE /staff/:id                               # Delete staff [ADMIN only]
PUT    /staff/:id/services                      # Assign services to staff
PUT    /staff/:id/working-hours                 # Update working hours
POST   /staff/:id/time-off                      # Add time-off
GET    /staff/:id/time-off                      # Get time-off list
PUT    /staff/time-off/:timeOffId               # Update time-off
DELETE /staff/time-off/:timeOffId               # Delete time-off
```

#### Client Management
```http
GET    /admin/clients?page=...&limit=...        # All clients (paginated)
PATCH  /admin/clients/:id                       # Update client [ADMIN only]
DELETE /admin/clients/:id                       # Delete client [ADMIN only]
```

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Docker** & **Docker Compose** (for PostgreSQL)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd eliana-beauty
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup environment variables**

Create `.env` files from examples:
```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

**API Environment Variables** (`apps/api/.env`):
```env
DATABASE_URL="postgresql://eliana:eliana_dev_pass@localhost:5432/eliana_beauty"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-in-production
REFRESH_TOKEN_EXPIRES_IN=30d
CORS_ORIGIN=http://localhost:5173
```

**Web Environment Variables** (`apps/web/.env`):
```env
VITE_API_URL=http://localhost:3001
```

4. **Start PostgreSQL**
```bash
pnpm db:up
```

5. **Setup database**
```bash
cd apps/api

# Generate Prisma client
pnpm prisma:generate

# Push schema to database
pnpm db:push

# Seed initial data (creates demo accounts)
pnpm db:seed
```

### Development

**Option 1: Run all services together**
```bash
pnpm dev
```

**Option 2: Run individually**
```bash
# Terminal 1 - API
pnpm api:dev    # http://localhost:3001

# Terminal 2 - Web
pnpm web:dev    # http://localhost:5173
```

### Default Credentials

After seeding, you can login with:

**Admin Account:**
- Email: `admin@eliana.beauty`
- Password: `admin123`

**Staff Account:**
- Email: `eliana@eliana.beauty`
- Password: `staff123`

**Client Account:**
- Email: `test@example.com`
- Password: `test123`

## Advanced Features

### Internationalization (i18n)

The system supports full bilingual operation:
- **English** (default) - Left-to-right
- **Hebrew** - Right-to-left with automatic layout adjustment
- Language switcher in header
- Persistent preference stored in Zustand
- All content (UI, services, categories) available in both languages

### Smart Availability System

The booking system uses intelligent slot generation:

1. **15-minute intervals** - Optimal balance between flexibility and efficiency
2. **Working hours respect** - Only shows times when staff is working
3. **Time-off filtering** - Blocks out vacation/sick days automatically
4. **Duration-aware blocking**:
   - **Red slots**: Insufficient time to complete service before next appointment
   - **Grey slots**: Already booked
   - **Green slots**: Available with enough time
5. **Real-time validation** - Prevents double-booking and conflicts

### Appointment Rescheduling

Admins and staff can reschedule appointments with:
- Date and time picker modal
- Automatic conflict detection
- Service duration consideration
- Validation against staff availability
- Error messaging for unavailable slots

### Price Management

Flexible pricing system:
- Set base service prices
- Mark services as "From X price" for variable pricing
- Edit individual appointment prices in CRM
- Price stored at booking time (historical accuracy)
- Revenue tracking uses actual appointment prices

### Export Capabilities

Export appointment data to:
- **CSV** - For spreadsheet analysis
- **PDF** - For printing and archiving
- Includes all relevant fields (client, service, staff, date, price, status)

### Progressive Web App (PWA)

The web app is installable on mobile devices:
- Offline-capable shell
- App manifest for home screen installation
- Service worker caching
- Mobile-optimized icons (192x192, 512x512)
- Standalone display mode

## Security Features

### Authentication
- JWT-based with access and refresh tokens
- Password hashing with bcryptjs (10 rounds)
- Token expiration and rotation
- Secure logout (token invalidation)

### Authorization
- Role-based access control (RBAC)
- Protected routes with guards
- Granular permissions (ADMIN > STAFF > CLIENT)
- Route-level and action-level protection

### Input Validation
- class-validator decorators on DTOs
- Schema validation before database operations
- SQL injection prevention via Prisma ORM
- XSS protection through React's escaping

### API Security
- CORS configuration
- Rate limiting ready (add middleware)
- Environment variable secrets
- No sensitive data in responses

## Build & Deployment

### Production Build

```bash
# Build all applications
pnpm build

# Build individually
pnpm --filter api build     # outputs to apps/api/dist
pnpm --filter web build     # outputs to apps/web/dist
```

### Environment Setup for Production

1. **Database**: Set up production PostgreSQL instance
2. **Environment Variables**: Update all `.env` files with production values
3. **Secrets**: Generate strong random secrets (minimum 32 characters)
4. **CORS**: Configure allowed origins
5. **Domain**: Update API URL in web app

**Production Environment Variables:**
```env
# API
NODE_ENV=production
DATABASE_URL=<production-database-url>
JWT_SECRET=<strong-random-secret-min-32-chars>
REFRESH_TOKEN_SECRET=<strong-random-secret-min-32-chars>
CORS_ORIGIN=https://yourdomain.com

# Web
VITE_API_URL=https://api.yourdomain.com
```

### Recommended Hosting

**API Backend:**
- Railway (recommended - easy setup)
- Render (free tier available)
- Heroku
- DigitalOcean App Platform
- AWS ECS / Elastic Beanstalk

**Database:**
- Railway PostgreSQL (recommended)
- Supabase
- Heroku Postgres
- AWS RDS
- DigitalOcean Managed Databases

**Frontend:**
- Vercel (recommended - optimized for Vite)
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

### Deployment Steps

1. **Database Setup:**
   ```bash
   # Run migrations on production database
   cd apps/api
   DATABASE_URL=<production-url> pnpm db:push
   DATABASE_URL=<production-url> pnpm db:seed
   ```

2. **API Deployment:**
   - Build: `pnpm --filter api build`
   - Start: `cd apps/api && node dist/main.js`
   - Ensure PORT environment variable is set

3. **Web Deployment:**
   - Build: `pnpm --filter web build`
   - Deploy `apps/web/dist` folder to static hosting
   - Configure environment variables in hosting dashboard

## Database Management

### Common Commands

```bash
# Start database
pnpm db:up

# Stop database
pnpm db:down

# View logs
docker logs eliana-beauty-db

# Access PostgreSQL CLI
docker exec -it eliana-beauty-db psql -U eliana -d eliana_beauty
```

### Schema Management

```bash
cd apps/api

# Generate Prisma client after schema changes
pnpm prisma:generate

# Push schema changes (development)
pnpm db:push

# Create migration (production-ready)
pnpm db:migrate

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# Seed database
pnpm db:seed
```

### Backup & Restore

```bash
# Backup database
docker exec eliana-beauty-db pg_dump -U eliana eliana_beauty > backup.sql

# Restore database
docker exec -i eliana-beauty-db psql -U eliana eliana_beauty < backup.sql
```

## Testing

### Run Tests

```bash
# All tests
pnpm test

# API tests with coverage
pnpm --filter api test:cov

# Watch mode
pnpm --filter api test:watch
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

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to database

**Solutions:**
```bash
# Check if PostgreSQL container is running
docker ps

# View container logs
docker logs eliana-beauty-db

# Restart database
pnpm db:down && pnpm db:up

# Verify connection string in .env
echo $DATABASE_URL
```

### Port Already in Use

**Problem:** `EADDRINUSE: address already in use`

**Solutions:**
```bash
# Find process using the port
# Windows:
netstat -ano | findstr :3001
taskkill /PID <process-id> /F

# Linux/Mac:
lsof -i :3001
kill -9 <process-id>

# Or change port in .env
PORT=3002  # in apps/api/.env
```

### Prisma Client Issues

**Problem:** Prisma client not found or outdated

**Solutions:**
```bash
cd apps/api

# Regenerate Prisma client
pnpm prisma:generate

# If schema changed, push to database
pnpm db:push
```

### Build Errors

**Problem:** TypeScript or build errors

**Solutions:**
```bash
# Clean node_modules and reinstall
rm -rf node_modules apps/*/node_modules
pnpm install

# Clean build cache
pnpm --filter api clean
pnpm --filter web clean

# Rebuild
pnpm build
```

### Authentication Issues

**Problem:** JWT tokens not working

**Solutions:**
1. Verify JWT_SECRET is set and matches across restarts
2. Check token expiration (default 7 days)
3. Clear browser localStorage and re-login
4. Ensure CORS_ORIGIN matches frontend URL

## Performance Optimization

### Database
- Indexes on frequently queried fields (email, dates, foreign keys)
- Connection pooling via Prisma
- Efficient queries with proper includes/selects

### API
- Pagination on list endpoints (default 10 items)
- Lazy loading with offset pagination
- Response caching ready (add Redis)

### Frontend
- Code splitting via React.lazy
- Image optimization recommendations
- Tailwind CSS purging in production
- Vite's optimized production builds

## Future Enhancements

Planned features for future releases:
- [ ] Email notifications for appointments
- [ ] SMS reminders via Twilio
- [ ] Payment integration (Stripe/PayPal)
- [ ] Customer reviews and ratings
- [ ] Loyalty points system
- [ ] Multi-location support
- [ ] Advanced reporting and analytics
- [ ] Calendar integrations (Google Calendar, iCal)
- [ ] Automated appointment reminders
- [ ] Waitlist management

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`pnpm test && pnpm lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

Private project - All rights reserved.

## Support

For issues, questions, or feature requests, please contact the development team or open an issue in the repository.

---

**Built with ❤️ for beauty professionals**
