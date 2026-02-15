# MatricMaster AI - Technical Specification

> Comprehensive technical documentation covering industry best practices across all technology areas.

---

## Table of Contents

1. [Project Architecture Overview](#1-project-architecture-overview)
2. [Next.js 16 App Router Best Practices](#2-nextjs-16-app-router-best-practices)
3. [Better-Auth Security Configuration](#3-better-auth-security-configuration)
4. [Frontend Design & Accessibility (WCAG 2.1 AA)](#4-frontend-design--accessibility-wcag-21-aa)
5. [React Patterns & Performance](#5-react-patterns--performance)
6. [PostgreSQL Database Design](#6-postgresql-database-design)
7. [Tailwind CSS 4 Patterns](#7-tailwind-css-4-patterns)
8. [SEO Fundamentals](#8-seo-fundamentals)
9. [PDF Extraction Architecture](#9-pdf-extraction-architecture)
10. [shadcn/ui Component Usage](#10-shadcnui-component-usage)
11. [Drizzle ORM Query Optimization](#11-drizzle-orm-query-optimization)

---

## 1. Project Architecture Overview

### Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.1.6 |
| Language | TypeScript | 5.9.3 |
| Database | PostgreSQL | 15+ |
| ORM | Drizzle ORM | 0.45.1 |
| Authentication | Better-Auth | 1.4.18 |
| Styling | Tailwind CSS | 4.1.18 |
| UI Components | Radix UI + shadcn/ui patterns | Latest |
| PDF Processing | pdfjs-dist + Gemini AI | 5.4.624 / 1.41.0 |
| Linting | Biome | 2.3.15 |
| Testing | Playwright | 1.58.2 |

### Project Structure

```
matricmaster/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth route group
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Better-Auth endpoints
│   │   │   ├── db/             # Database API
│   │   │   ├── extract-questions/ # PDF extraction
│   │   │   └── uploadthing/    # File uploads
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── sitemap.ts          # Dynamic sitemap
│   │   └── robots.ts           # Robots.txt
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── Layout/              # Layout components
│   │   └── Transition/         # Animation components
│   ├── lib/
│   │   ├── auth.ts             # Better-Auth setup
│   │   ├── db/                 # Database layer
│   │   │   ├── schema.ts       # Drizzle schema
│   │   │   ├── queries.ts      # Query functions
│   │   │   ├── repository.ts   # Data repository
│   │   │   └── index.ts        # DB manager
│   │   ├── env.ts              # Environment validation
│   │   └── utils.ts            # Utility functions
│   ├── screens/                # Page-level components
│   ├── services/               # External services
│   │   ├── pdfExtractor.ts     # PDF extraction service
│   │   └── geminiService.ts    # Gemini AI client
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types
│   ├── constants/              # App constants
│   └── styles/                 # Global styles
├── drizzle/                    # Drizzle migrations
├── e2e/                       # Playwright tests
└── public/                    # Static assets
```

---

## 2. Next.js 16 App Router Best Practices

### 2.1 Project Configuration

```typescript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' 
      ? { exclude: ['error', 'warn'] } 
      : false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'ufs.sh' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};
```

**Best Practices Applied:**
- ✅ `reactStrictMode` enabled for development error detection
- ✅ Console removal in production for smaller bundles
- ✅ Image optimization with remote patterns
- ✅ Package import optimization for tree-shaking

### 2.2 Route Structure

```
src/app/
├── (auth)/                    # Route group for auth pages
│   ├── sign-in/
│   └── sign-up/
├── api/                       # API routes
│   ├── auth/[...better-auth]/
│   ├── db/
│   ├── extract-questions/
│   └── uploadthing/
├── dashboard/
├── past-papers/
├── profile/
├── achievements/
├── leaderboard/
└── search/
```

**Best Practices:**
- Use route groups `(auth)` to organize related pages
- Colocate API routes with their functionality
- Keep pages shallow (max 2-3 levels deep)

### 2.3 Server Components vs Client Components

**Server Components (Default):**
- Layouts: `src/app/layout.tsx`
- Pages: `src/app/page.tsx`
- API Routes: `src/app/api/*/route.ts`

**Client Components (Marked with `'use client'`):**
- Interactive UI: 49 components use `'use client'`
- Components requiring browser APIs
- Components with event handlers

**Optimization Strategy:**
```typescript
// Prefer this pattern: Server Component wrapping Client Component
// src/app/dashboard/page.tsx (Server)
import Dashboard from '@/screens/Dashboard';

export default function Page() {
  return <Dashboard />;
}

// src/screens/Dashboard.tsx (Client)
'use client';
import { useState } from 'react';
```

### 2.4 Layout Pattern

```typescript
// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/theme-provider';
import '@/styles/index.css';

export const metadata: Metadata = {
  title: {
    default: 'MatricMaster AI',
    template: '%s | MatricMaster AI',
  },
  // ... full metadata
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ErrorBoundary>
          <ThemeProvider defaultTheme="light" storageKey="matric-master-theme">
            {children}
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

---

## 3. Better-Auth Security Configuration

### 3.1 Authentication Setup

```typescript
// src/lib/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { dbManager } from './db';
import * as schema from './db/schema';

function createAuth() {
  const db = dbManager.isConnectedToDatabase() ? dbManager.getDb() : null;

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: db
      ? drizzleAdapter(db, { provider: 'pg', schema })
      : undefined,
    
    // Email/Password Configuration
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    
    // Social Providers
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_SECRET_KEY ?? '',
      },
      // Twitter conditionally added
    },
    
    // Session Configuration
    session: {
      expiresIn: 60 * 60 * 24 * 7,        // 7 days
      updateAge: 60 * 60 * 24,            // 24 hours
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,                    // 5 minutes
      },
    },
    
    // Trusted Origins
    trustedOrigins: [
      process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
    ].filter(Boolean),
    
    // Rate Limiting
    rateLimit: {
      enabled: true,
      window: 60,                          // 60 seconds
      max: 10,                             // 10 requests per window
    },
    
    // Advanced Security
    advanced: {
      useSecureCookies: process.env.NODE_ENV === 'production',
      crossSubDomainCookies: {
        enabled: process.env.NODE_ENV === 'production',
      },
      ipAddress: {
        ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
      },
    },
    
    // Database Hooks
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            console.log(`✅ New user created: ${user.id}`);
          },
        },
        update: {
          before: async (user) => {
            if (user.isBlocked) {
              throw new Error('Account has been blocked');
            }
            return { data: user };
          },
        },
      },
    },
    
    plugins: [nextCookies()],
  });
}
```

### 3.2 Security Features Implemented

| Feature | Status | Implementation |
|---------|--------|----------------|
| Secure Cookies | ✅ | `useSecureCookies: true` in production |
| Rate Limiting | ✅ | 10 requests per 60 seconds |
| Session Expiration | ✅ | 7 days with 24-hour update |
| IP Address Tracking | ✅ | Via `x-forwarded-for`, `x-real-ip` |
| Cross-Subdomain Cookies | ✅ | Enabled in production |
| Email Verification | ⚠️ | Configurable but disabled |
| Account Blocking | ✅ | Via database hooks |
| CSRF Protection | ✅ | Built into Better-Auth |
| Trusted Origins | ✅ | Configured for production URLs |

### 3.3 Recommended Additions

```typescript
// Recommended: Add 2FA support
// src/lib/auth.ts additions
import { twoFactorPlugin } from 'better-auth/plugins/two-factor';

// In betterAuth config:
plugins: [
  nextCookies(),
  twoFactorPlugin({
    issuer: 'MatricMaster AI',
  }),
],
```

---

## 4. Frontend Design & Accessibility (WCAG 2.1 AA)

### 4.1 Design System - Apple HIG Inspired

```css
/* src/styles/index.css - Color System */
:root {
  /* Core Colors using OKLCH for perceptual uniformity */
  --background: oklch(0.98 0 0);
  --foreground: oklch(0.15 0 0);
  --primary: oklch(0.55 0.22 260);
  --primary-foreground: oklch(0.99 0 0);
  
  /* Semantic Colors */
  --destructive: oklch(0.55 0.22 25);
  --border: oklch(0.9 0 0);
  --input: oklch(0.9 0 0);
  --ring: oklch(0.55 0.22 260);
  
  /* Brand Colors */
  --color-brand-blue: #2563eb;
  --color-brand-amber: #f59e0b;
  --color-brand-purple: #7c3aed;
  
  /* Surface Colors (Apple HIG) */
  --surface-base: oklch(0.98 0 0);
  --surface-elevated: oklch(1 0 0);
  --surface-overlay: oklch(1 0 0);
  
  /* Typography Scale */
  --font-size-1: 0.6875rem;
  --font-size-5: 1rem;
  --font-size-9: 2rem;
  --font-size-10: 2.5rem;
}

/* Dark Mode */
.dark {
  --background: oklch(0.15 0 0);
  --foreground: oklch(0.98 0 0);
  --surface-base: oklch(0.15 0 0);
  --surface-elevated: oklch(0.22 0 0);
}
```

### 4.2 Typography System

```css
/* Apple HIG Typography */
body {
  font-family: var(--font-inter), var(--font-system);
  font-size: 17px;
  line-height: 1.47059;
  letter-spacing: -0.022em;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-outfit), var(--font-lexend);
  letter-spacing: -0.03em;
  line-height: 1.2;
}

/* Dynamic Type Scale */
--font-size-1: 0.6875rem;  /* Caption */
--font-size-3: 0.8125rem;  /* Footnote */
--font-size-5: 1rem;       /* Body */
--font-size-7: 1.375rem;   /* Heading 5 */
--font-size-9: 2rem;       /* Heading 3 */
--font-size-10: 2.5rem;    /* Heading 1 */
```

### 4.3 WCAG 2.1 AA Compliance Checklist

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Color Contrast (4.5:1) | OKLCH colors tuned for contrast | ✅ |
| Focus Indicators | `focus-visible:ring-1 focus-visible:ring-ring` | ✅ |
| Skip Navigation | `<a href="#main-content" class="sr-only focus:not-sr-only...">` | ✅ |
| Keyboard Navigation | All interactive elements focusable | ✅ |
| Screen Reader Support | Semantic HTML, ARIA labels | ✅ |
| Text Scaling | `max-scale: 5`, responsive units | ✅ |
| Reduced Motion | `prefers-reduced-motion` hook | ✅ |
| Error Identification | Error boundaries with clear messaging | ✅ |

### 4.4 Skip Navigation Implementation

```typescript
// src/app/layout.tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:outline-none"
>
  Skip to main content
</a>
```

### 4.5 Reduced Motion Hook

```typescript
// src/hooks/use-reduced-motion.ts
'use client';
import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}
```

---

## 5. React Patterns & Performance

### 5.1 Component Patterns

**Pattern 1: Forward Ref with Display Name**
```typescript
// src/components/ui/button.tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        {...props} 
      />
    );
  }
);
Button.displayName = 'Button';
```

**Pattern 2: Class Variance Authority (CVA)**
```typescript
// Button variants example
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-[17px] font-bold transition-all focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        ios: 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 rounded-xl px-4 text-sm',
        lg: 'h-14 rounded-[2rem] px-10 text-lg',
        icon: 'h-12 w-12 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

### 5.2 Error Boundary Pattern

```typescript
// src/components/ErrorBoundary.tsx
'use client';
import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### 5.3 Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| Optimize Package Imports | `experimental.optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']` |
| Image Optimization | `next/image` with remotePatterns |
| Font Optimization | `next/font` with variable fonts |
| Bundle Size | Console removal in production |
| Client Components | 49 marked with `'use client'` |

### 5.4 Environment Validation Pattern

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment variables');
    }
  }
  
  return result.data;
}
```

---

## 6. PostgreSQL Database Design

### 6.1 Schema Overview

```typescript
// src/lib/db/schema.ts
import { relations } from 'drizzle-orm';
import {
  bigint, boolean, index, integer,
  pgTable, text, timestamp, uuid, varchar,
} from 'drizzle-orm/pg-core';

// Better-Auth Tables (imported)
import { users, sessions, accounts, verifications } from './better-auth-schema';

// Custom Tables
export const subjects = pgTable('subjects', {
  id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  curriculumCode: varchar('curriculum_code', { length: 20 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  subjectId: integer('subject_id')
    .notNull()
    .references(() => subjects.id, { onDelete: 'cascade' }),
  questionText: text('question_text').notNull(),
  imageUrl: text('image_url'),
  gradeLevel: integer('grade_level').notNull(),
  topic: varchar('topic', { length: 100 }).notNull(),
  difficulty: varchar('difficulty', { length: 20 }).notNull().default('medium'),
  marks: integer('marks').notNull().default(2),
  hint: text('hint'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  subjectIdIdx: index('questions_subject_id_idx').on(table.subjectId),
  gradeLevelIdx: index('questions_grade_level_idx').on(table.gradeLevel),
  topicIdx: index('questions_topic_idx').on(table.topic),
  difficultyIdx: index('questions_difficulty_idx').on(table.difficulty),
  isActiveIdx: index('questions_is_active_idx').on(table.isActive),
  subjectActiveIdx: index('questions_subject_active_idx').on(table.subjectId, table.isActive),
}));

export const options = pgTable('options', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id')
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  optionText: text('option_text').notNull(),
  isCorrect: boolean('is_correct').notNull().default(false),
  optionLetter: varchar('option_letter', { length: 1 }).notNull(),
  explanation: text('explanation'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const searchHistory = pgTable('search_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  query: text('query').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('search_history_user_id_idx').on(table.userId),
  createdAtIdx: index('search_history_created_at_idx').on(table.createdAt),
}));
```

### 6.2 Indexing Strategy

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| questions | `questions_subject_id_idx` | BTree | Filter by subject |
| questions | `questions_grade_level_idx` | BTree | Filter by grade |
| questions | `questions_topic_idx` | BTree | Filter by topic |
| questions | `questions_difficulty_idx` | BTree | Filter by difficulty |
| questions | `questions_is_active_idx` | BTree | Soft delete queries |
| questions | `questions_subject_active_idx` | Composite | Combined filter |
| sessions | `sessions_token_idx` | BTree | Session lookup |
| sessions | `sessions_user_id_idx` | BTree | User sessions |
| search_history | `search_history_user_id_idx` | BTree | User search history |
| search_history | `search_history_created_at_idx` | BTree | Time-based queries |

### 6.3 Relationships

```typescript
// Relations Definition
export const subjectsRelations = relations(subjects, ({ many }) => ({
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [questions.subjectId],
    references: [subjects.id],
  }),
  options: many(options),
}));

export const optionsRelations = relations(options, ({ one }) => ({
  question: one(questions, {
    fields: [options.questionId],
    references: [questions.id],
  }),
}));

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  user: one(users, {
    fields: [searchHistory.userId],
    references: [users.id],
  }),
}));
```

### 6.4 Drizzle Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/lib/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  casing: 'snake_case',
});
```

---

## 7. Tailwind CSS 4 Patterns

### 7.1 Configuration with CSS-First Approach

```css
/* src/styles/index.css */
@import "tailwindcss";

@plugin "tailwindcss-animate";

@custom-variant dark (&:is(.dark *));

/* Tailwind CSS 4 Theme Variables */
@theme inline {
  /* Radius */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  
  /* Colors */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-muted: var(--muted);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  
  /* Brand Colors */
  --color-brand-blue: #2563eb;
  --color-brand-amber: #f59e0b;
  --color-brand-purple: #7c3aed;
  --color-brand-green: #059669;
  --color-brand-red: #dc2626;
  
  /* Subject Colors */
  --color-math: #3b82f6;
  --color-physics: #8b5cf6;
  --color-life-sci: #10b981;
  --color-accounting: #f59e0b;
  --color-english: #ec4899;
  --color-geography: #06b6d4;
  --color-history: #f97316;
  
  /* Fonts */
  --font-lexend: var(--font-lexend);
  --font-inter: var(--font-inter);
  --font-jakarta: var(--font-jakarta);
  --font-outfit: var(--font-outfit);
}

/* Custom Utilities */
@layer utilities {
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  .math-serif {
    font-family: "Latin Modern Math", "STIX Two Math", serif;
    font-style: italic;
    font-variant-numeric: lining-nums tabular-nums;
  }
  
  .ios-glass {
    @apply bg-surface-base/70 backdrop-blur-2xl border border-border/50;
  }
  
  .premium-glass {
    @apply bg-surface-base/60 backdrop-blur-3xl border border-border/30 shadow-2xl;
  }
  
  .mesh-gradient-blue {
    background: radial-gradient(at 0% 0%, hsla(217,100%,70%,1) 0, transparent 50%),
                radial-gradient(at 50% 0%, hsla(225,100%,60%,1) 0, transparent 50%),
                radial-gradient(at 100% 0%, hsla(230,100%,50%,1) 0, transparent 50%);
  }
}
```

### 7.2 Animation Utilities

```css
/* Custom Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes slide-up {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.animate-float { animation: float 6s ease-in-out infinite; }
.animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
.animate-slide-up { animation: slide-up 0.3s ease-out; }
.animate-fade-in { animation: fade-in 0.3s ease-out; }
.animate-shake { animation: shake 0.5s ease-in-out; }
```

### 7.3 Base Layer Styles

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
    -webkit-tap-highlight-color: transparent;
  }
  
  body {
    @apply bg-background text-foreground antialiased;
    font-family: var(--font-inter), var(--font-system);
    font-feature-settings: "rlig" 1, "calt" 1;
    font-size: 17px;
    line-height: 1.47059;
    letter-spacing: -0.022em;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-outfit), var(--font-lexend);
    letter-spacing: -0.03em;
    line-height: 1.2;
  }
  
  html {
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
  }
}
```

---

## 8. SEO Fundamentals

### 8.1 Metadata Configuration

```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'MatricMaster AI',
    template: '%s | MatricMaster AI',
  },
  description:
    'Master your Matric exams through interactive practice. Access past papers, step-by-step guides, and AI-powered explanations for South African Grade 12 students.',
  keywords: [
    'matric', 'grade 12', 'south africa', 'past papers',
    'study guide', 'education', 'math', 'physics', 'chemistry', 'NSC',
  ],
  authors: [{ name: 'MatricMaster AI' }],
  creator: 'MatricMaster AI',
  publisher: 'MatricMaster AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: '/',
    title: 'MatricMaster AI - Master Your Matric Exams',
    description: 'Interactive past papers and step-by-step guides...',
    siteName: 'MatricMaster AI',
    images: [{
      url: '/api/og?title=MatricMaster+AI&description=Master+your+Matric+exams',
      width: 1200,
      height: 630,
      alt: 'MatricMaster AI',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MatricMaster AI',
    description: 'Master your Matric exams through interactive practice.',
    images: ['/api/og?title=MatricMaster+AI&description=Master+your+Matric+exams'],
    creator: '@matricmaster',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
};
```

### 8.2 Sitemap

```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/dashboard`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/past-papers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/lessons`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/study-plan`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/leaderboard`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${baseUrl}/achievements`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/profile`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'always', priority: 0.5 },
    { url: `${baseUrl}/sign-in`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/sign-up`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];
}
```

### 8.3 Robots.txt

```typescript
// src/app/robots.ts
import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/_next/', '/private/'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/api/', '/_next/'] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
```

---

## 9. PDF Extraction Architecture

### 9.1 Three-Tier Caching Strategy

```typescript
// src/services/pdfExtractor.ts
export async function extractQuestionsFromPDF(
  paperId: string,
  pdfUrl: string,
  subject: string,
  paper: string,
  year: number,
  month: string
): Promise<ExtractedPaper> {
  // Step 1: Check memory cache (fastest)
  const memCached = memoryCache.get(paperId);
  if (memCached) {
    console.log(`[PDF Extractor] Using memory cache for ${paperId}`);
    return { ...memCached, extractedFromDb: false };
  }

  // Step 2: Check database
  const dbRecord = await checkDbForPaper(paperId);
  if (dbRecord?.is_extracted && dbRecord.extracted_questions) {
    console.log(`[PDF Extractor] Using database cache for ${paperId}`);
    memoryCache.set(paperId, dbRecord.extracted_questions);
    return {
      ...dbRecord.extracted_questions,
      extractedFromDb: true,
      storedPdfUrl: dbRecord.stored_pdf_url || undefined,
    };
  }

  // Step 3: Extract using Gemini API
  console.log(`[PDF Extractor] Extracting questions from PDF: ${paperId}`);
  const extractedData = await performPdfExtraction(paperId, pdfUrl, subject, paper, year, month);

  // Validate extracted data
  if (!extractedData.questions || extractedData.questions.length === 0) {
    throw new Error('Failed to extract questions from PDF');
  }

  // Step 4: Upload and save
  const storedPdfUrl = await uploadPdfToUploadThing(pdfUrl);
  await savePaperToDb(paperId, pdfUrl, subject, paper, year, month, extractedData, storedPdfUrl);

  // Step 5: Update memory cache
  memoryCache.set(paperId, extractedData);

  return { ...extractedData, extractedFromDb: false, storedPdfUrl: storedPdfUrl || undefined };
}
```

### 9.2 Extraction Process

```typescript
async function performPdfExtraction(
  paperId: string,
  pdfUrl: string,
  subject: string,
  paper: string,
  year: number,
  month: string
): Promise<ExtractedPaper> {
  const client = getAI();
  if (!client) {
    throw new Error('AI service not configured');
  }

  // Fetch PDF
  const response = await fetch(pdfUrl);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  // Use Gemini for extraction
  const result = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: extractionPrompt },
          { inlineData: { mimeType: 'application/pdf', data: base64 } },
        ],
      },
    ],
    config: { responseMimeType: 'application/json' },
  });

  // Parse and validate
  const cleaned = cleanJson(result.text);
  const parsed = JSON.parse(cleaned);
  const validated = extractedPaperSchema.parse(parsed);

  return validated;
}
```

### 9.3 Validation Schemas

```typescript
import { z } from 'zod';

const extractedQuestionSchema = z.object({
  id: z.string(),
  questionNumber: z.string(),
  questionText: z.string(),
  subQuestions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    marks: z.number().optional(),
  })).optional(),
  marks: z.number(),
  topic: z.string().optional(),
});

const extractedPaperSchema = z.object({
  paperId: z.string(),
  subject: z.string(),
  paper: z.string(),
  year: z.number(),
  month: z.string(),
  instructions: z.string().optional(),
  questions: z.array(extractedQuestionSchema),
});
```

---

## 10. shadcn/ui Component Usage

### 10.1 Button Component Pattern

```typescript
// src/components/ui/button.tsx
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-[17px] font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97] duration-200',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        ios: 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 rounded-xl px-4 text-sm',
        lg: 'h-14 rounded-[2rem] px-10 text-lg',
        icon: 'h-12 w-12 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

### 10.2 Components Implemented

| Component | Location | Features |
|-----------|----------|----------|
| Button | `src/components/ui/button.tsx` | CVA variants, asChild pattern |
| Card | `src/components/ui/card.tsx` | Content, header, footer sections |
| Input | `src/components/ui/input.tsx` | Form input with label support |
| Label | `src/components/ui/label.tsx` | Radix-based accessibility |
| Dialog | `src/components/ui/dialog.tsx` | Modal with animations |
| DropdownMenu | `src/components/ui/dropdown-menu.tsx` | Accessible dropdown |
| Avatar | `src/components/ui/avatar.tsx` | Image fallback |
| Badge | `src/components/ui/badge.tsx` | Status indicators |
| Checkbox | `src/components/ui/checkbox.tsx` | Radix-based |
| Progress | `src/components/ui/progress.tsx` | Linear progress |
| Slider | `src/components/ui/slider.tsx` | Range input |
| Switch | `src/components/ui/switch.tsx` | Toggle control |
| Tabs | `src/components/ui/tabs.tsx` | Content organization |
| Chart | `src/components/ui/chart.tsx` | Recharts integration |
| Drawer | `src/components/ui/drawer.tsx` | Mobile slide-out |

### 10.3 Utility Function (cn)

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 11. Drizzle ORM Query Optimization

### 11.1 Query Patterns

```typescript
// src/lib/db/queries.ts
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { dbManager } from './index';
import { options, questions, subjects } from './schema';

// Transaction for atomic operations
export async function createQuestion(
  questionData: NewQuestion,
  optionsData: Omit<NewOption, 'questionId'>[]
): Promise<Question & { options: Option[] }> {
  const db = await getDb();
  
  return await db.transaction(async (tx) => {
    const [question] = await tx.insert(questions).values(questionData).returning();

    const opts = await Promise.all(
      optionsData.map((opt) =>
        tx.insert(options).values({ ...opt, questionId: question.id }).returning()
      )
    );

    return { ...question, options: opts.flat() };
  });
}

// Soft delete pattern
export async function softDeleteQuestion(id: string): Promise<boolean> {
  const db = await getDb();
  await db.transaction(async (tx) => {
    await tx
      .update(questions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(questions.id, id));

    await tx.update(options).set({ isActive: false }).where(eq(options.questionId, id));
  });
  return true;
}

// Filtered queries with indexes
export async function getQuestions(filters: QuestionFilters = {}): Promise<Question[]> {
  const db = await getDb();
  const conditions = [];

  if (filters.subjectId !== undefined) {
    conditions.push(eq(questions.subjectId, filters.subjectId));
  }
  if (filters.difficulty !== undefined) {
    conditions.push(eq(questions.difficulty, filters.difficulty));
  }
  if (filters.gradeLevel !== undefined) {
    conditions.push(eq(questions.gradeLevel, filters.gradeLevel));
  }
  if (filters.topic !== undefined) {
    conditions.push(eq(questions.topic, filters.topic));
  }
  conditions.push(eq(questions.isActive, filters.isActive ?? true));

  return db
    .select()
    .from(questions)
    .where(and(...conditions))
    .orderBy(desc(questions.createdAt));
}

// Random selection (use sparingly - not index optimized)
export async function getRandomQuestions(
  subjectId: number,
  count: number,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<Question[]> {
  const db = await getDb();
  const conditions = [eq(questions.subjectId, subjectId), eq(questions.isActive, true)];

  if (difficulty) {
    conditions.push(eq(questions.difficulty, difficulty));
  }

  return db
    .select()
    .from(questions)
    .where(and(...conditions))
    .orderBy(sql`random()`)
    .limit(count);
}

// Eager loading pattern
export async function getQuestionWithOptions(
  id: string
): Promise<(Question & { options: Option[] }) | null> {
  const db = await getDb();
  const [question] = await db
    .select()
    .from(questions)
    .where(and(eq(questions.id, id), eq(questions.isActive, true)))
    .limit(1);

  if (!question) return null;

  const opts = await db
    .select()
    .from(options)
    .where(and(eq(options.questionId, id), eq(options.isActive, true)))
    .orderBy(asc(options.optionLetter));

  return { ...question, options: opts };
}
```

### 11.2 Query Optimization Guidelines

| Pattern | Recommendation |
|---------|----------------|
| Select specific columns | Use `.select({ id: questions.id, text: questions.questionText })` |
| Use indexes | Filters should use indexed columns first |
| Pagination | Always use `.limit()` and `.offset()` for large datasets |
| Soft delete | Use `isActive` flag instead of hard deletes |
| Transactions | Wrap related operations in `db.transaction()` |
| Avoid `*` | Specify exact columns needed |
| Batch inserts | Use `Promise.all()` for independent inserts |
| Eager loading | Fetch related data in separate optimized queries |

### 11.3 Database Connection Management

```typescript
// src/lib/db/index.ts
class DatabaseManager {
  private static instance: DatabaseManager;
  private _db: DbType | null = null;
  private isConnected = false;

  public async initialize(): Promise<void> {
    const postgresConnected = await pgManager.waitForConnection(5, 5000);
    if (postgresConnected) {
      this._db = pgManager.getDb();
      this.isConnected = true;
    }
  }

  public async waitForConnection(maxRetries = 3, delay = 1000): Promise<boolean> {
    if (this.isConnected) return true;
    await this.initialize();
    return this.isConnected;
  }
}

const dbManager = DatabaseManager.getInstance();
export { dbManager };
```

---

## Appendix: Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
npm run db:seed      # Seed database
npm run db:reset     # Reset database

# Code Quality
npm run lint         # Check code with Biome
npm run lint:fix     # Fix linting issues
npm run format       # Format code
npm run typecheck    # TypeScript type checking

# Testing
npm run test         # Run Playwright tests
npm run test:ui      # Run tests with UI
npm run test:debug   # Debug tests
npm run test:headed  # Run in headed browser
npm run test:report  # View test report
npm run test:install # Install Playwright browsers
```

---

## Summary

This technical specification documents the comprehensive architecture of MatricMaster AI, covering:

- ✅ **Next.js 16 App Router** - Modern routing with server/client component patterns
- ✅ **Better-Auth Security** - Production-ready authentication with rate limiting, secure cookies, and session management
- ✅ **Frontend Design** - Apple HIG-inspired design system with WCAG 2.1 AA accessibility
- ✅ **React Patterns** - Forward refs, CVA, error boundaries, and hooks
- ✅ **PostgreSQL Database** - Proper schema with indexes, relations, and soft deletes
- ✅ **Tailwind CSS 4** - CSS-first configuration with custom utilities
- ✅ **SEO** - Complete metadata, sitemap, and robots configuration
- ✅ **PDF Extraction** - Three-tier caching architecture
- ✅ **shadcn/ui** - Component patterns with Radix primitives
- ✅ **Drizzle ORM** - Optimized query patterns and transactions

> Last Updated: 2026-02-15
> Version: 1.0.0
