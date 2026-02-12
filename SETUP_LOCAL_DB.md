# Local PostgreSQL Setup for Development

Since network connectivity to Neon is blocked, here's how to set up a local PostgreSQL database:

## Option 1: Install PostgreSQL (Recommended)

### Download & Install
1. Go to: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 16 or 17 installer
3. Run installer AS ADMINISTRATOR
4. During installation:
   - Password: `postgres` (choose a unique local password and update DATABASE_URL accordingly)
   - Port: `5432` (default)
   - Database: `postgres` (default)

### After Installation
```bash
# Open pgAdmin or psql and run:
CREATE DATABASE matricmaster;
```

### Update .env.local (already configured):
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/matricmaster"
```

> **Security Note:** Never commit `.env.local` to version control. Ensure `.env.local` is listed in `.gitignore` so sensitive credentials are not checked in.

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

If you just want to test without PostgreSQL, you can configure Drizzle to use SQLite:

### Step 1: Install Dependencies
```bash
npm install better-sqlite3 drizzle-orm drizzle-kit
```

### Step 2: Update Drizzle Configuration
Update your `drizzle.config.ts` (or `drizzle.config.mjs`) to use SQLite:

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './dev.sqlite', // or './dev.sqlite3'
  },
} satisfies Config;
```

### Step 3: Update Database Client
Update your database client initialization (e.g., the file that exports `createClient` or `getDb`) to use SQLite:

```typescript
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

const sqlite = new Database('./dev.sqlite');
export const db = drizzle(sqlite);
```

Update any use of `process.env.DATABASE_URL` to point to `sqlite://./dev.sqlite` or just use the file path directly.

### Step 4: Run Migrations
```bash
# Generate migrations
npm run db:generate

# Push schema to SQLite
npm run db:push
```

> **Note:** SQLite is recommended for local development only. For production, use PostgreSQL.
