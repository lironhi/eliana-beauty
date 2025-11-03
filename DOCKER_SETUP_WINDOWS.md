# Docker Setup for Windows - Eliana Beauty

## ❌ Error: Docker Desktop Not Running

If you see this error:
```
unable to get image 'postgres:15-alpine': error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/images/postgres:15-alpine/json": open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

This means **Docker Desktop is not running**.

---

## 🔧 Solution 1: Start Docker Desktop (Recommended)

### Step 1: Launch Docker Desktop
1. Press `Windows Key` and type "Docker Desktop"
2. Click on "Docker Desktop" to launch it
3. Wait for Docker to start (you'll see the Docker icon in the system tray)
4. The icon should turn **solid** (not animated) when ready

### Step 2: Verify Docker is Running
```powershell
docker --version
docker ps
```

You should see Docker version info and an empty list of containers.

### Step 3: Retry the Database Setup
```powershell
pnpm db:up
```

---

## 🔧 Solution 2: Install PostgreSQL Directly (Without Docker)

If you don't have Docker or prefer not to use it:

### Step 1: Download PostgreSQL
- Go to: https://www.postgresql.org/download/windows/
- Download the installer (version 15 or higher)
- Run the installer

### Step 2: Install PostgreSQL
1. During installation:
   - Default port: `5432` ✅
   - Set a password for user `postgres` (remember this!)
   - Install pgAdmin 4 ✅
   - Install Stack Builder (optional)

### Step 3: Create Database and User

#### Option A: Using pgAdmin 4
1. Open pgAdmin 4
2. Connect to PostgreSQL server
3. Right-click "Login/Group Roles" → Create → Login/Group Role
   - Name: `eliana`
   - Password: `eliana_dev_pass`
   - Privileges: Check "Can login?"
4. Right-click "Databases" → Create → Database
   - Name: `eliana_beauty`
   - Owner: `eliana`

#### Option B: Using psql Command Line
```sql
-- Open psql from Start Menu or Command Prompt
-- Enter postgres password when prompted

CREATE USER eliana WITH PASSWORD 'eliana_dev_pass';
CREATE DATABASE eliana_beauty OWNER eliana;
GRANT ALL PRIVILEGES ON DATABASE eliana_beauty TO eliana;
```

### Step 4: Update Environment Variables
Create `.env` file in project root (if not exists):
```env
DATABASE_URL="postgresql://eliana:eliana_dev_pass@localhost:5432/eliana_beauty"
```

Create `apps/api/.env`:
```env
DATABASE_URL="postgresql://eliana:eliana_dev_pass@localhost:5432/eliana_beauty"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Step 5: Skip Docker, Go Directly to Prisma Setup
```powershell
cd apps/api
pnpm prisma:generate
pnpm db:push
pnpm db:seed
cd ..\..
```

---

## 🔧 Solution 3: Install Docker Desktop (If Not Installed)

### Download Docker Desktop for Windows
1. Go to: https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Windows
3. Run the installer
4. **Important**: Enable WSL 2 if prompted
5. Restart your computer if required

### First Time Setup
1. Launch Docker Desktop
2. Accept the terms
3. Skip the tutorial (optional)
4. Wait for Docker Engine to start
5. Verify in system tray: Docker icon should be solid

### Enable WSL 2 (If Required)
```powershell
# Run PowerShell as Administrator
wsl --install
wsl --set-default-version 2
```

Restart your computer, then launch Docker Desktop.

---

## ✅ Verification Steps

### Check Docker is Running
```powershell
# Should show Docker version
docker --version

# Should show empty list (no errors)
docker ps

# Should show Docker Compose version
docker-compose --version
```

### Start PostgreSQL Container
```powershell
pnpm db:up
```

Expected output:
```
Creating network "eliana-beauty_default" with the default driver
Creating eliana-beauty-db ... done
```

### Verify Container is Running
```powershell
docker ps
```

You should see `eliana-beauty-db` in the list.

### Check Container Logs
```powershell
docker logs eliana-beauty-db
```

Should show PostgreSQL startup messages and "ready to accept connections".

---

## 🆘 Troubleshooting

### Docker Desktop Won't Start
1. **Check System Requirements**:
   - Windows 10 64-bit: Pro, Enterprise, or Education (Build 19041 or higher)
   - OR Windows 11
   - Hyper-V and WSL 2 features enabled

2. **Enable Virtualization in BIOS**:
   - Restart computer
   - Enter BIOS/UEFI (usually F2, F10, or Del key)
   - Enable Intel VT-x or AMD-V
   - Save and exit

3. **Enable Windows Features**:
   ```powershell
   # Run as Administrator
   Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
   Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform
   ```

### Port 5432 Already in Use
If you have PostgreSQL already installed:

```powershell
# Find what's using port 5432
netstat -ano | findstr :5432

# Option 1: Stop existing PostgreSQL service
# Services → PostgreSQL → Stop

# Option 2: Change Docker port in docker-compose.yml
ports:
  - '5433:5432'  # Change 5432 to 5433

# Update DATABASE_URL
DATABASE_URL="postgresql://eliana:eliana_dev_pass@localhost:5433/eliana_beauty"
```

### Docker Compose Version Warning
The warning about `version` being obsolete is harmless. You can remove the `version:` line from `docker-compose.yml` if you want.

---

## 📝 Quick Command Reference

```powershell
# Start database
pnpm db:up

# Stop database
pnpm db:down

# View logs
docker logs eliana-beauty-db

# Access PostgreSQL CLI
docker exec -it eliana-beauty-db psql -U eliana -d eliana_beauty

# Remove container and volume (nuclear option)
docker-compose down -v
pnpm db:up
```

---

## 🎯 Next Steps After Database is Running

Once your database is running (either Docker or local PostgreSQL):

```powershell
# 1. Generate Prisma client
cd apps\api
pnpm prisma:generate

# 2. Push schema to database
pnpm db:push

# 3. Seed initial data
pnpm db:seed

# 4. Go back to root
cd ..\..

# 5. Start development servers
pnpm dev
```

Access the application at http://localhost:5173

---

## 💡 Recommendation

For development on Windows, I recommend:
- ✅ **Docker Desktop** (easiest, isolated, matches production)
- ⚠️ Local PostgreSQL (works but need to manage services)

For this project, Docker is configured and ready to use. Just need to start Docker Desktop!
