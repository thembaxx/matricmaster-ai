# Local PostgreSQL Setup for Development

Since network connectivity to Neon is blocked, here's how to set up a local PostgreSQL database:

## Option 1: Install PostgreSQL (Recommended)

### Download & Install
1. Go to: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 16 or 17 installer
3. Run installer AS ADMINISTRATOR
4. During installation:
   - Password: `postgres` (remember this!)
   - Port: `5432` (default)
   - Database: `postgres` (default)
   - Create a new database called `matricmaster`

### After Installation
```bash
# Open pgAdmin or psql and run:
CREATE DATABASE matricmaster;
```

### Update .env.local (already configured):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/matricmaster"
```

## Option 2: Use Docker (If Docker is installed)

```bash
# Create and run PostgreSQL container
docker run --name local-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=matricmaster \
  -p 5432:5432 \
  -d postgres:latest

# Stop/Start commands
docker stop local-postgres
docker start local-postgres
```

## Option 3: Use SQLite (Quickest - No Installation)

If you just want to test without PostgreSQL, I can configure Drizzle to use SQLite:

```bash
npm install better-sqlite3 drizzle-orm drizzle-kit
```

Then update the configuration to use SQLite instead.
