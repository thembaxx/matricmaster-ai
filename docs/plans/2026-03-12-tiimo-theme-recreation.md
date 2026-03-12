# Tiimo-Theme Recreation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Recreate the Tiimo theme as an exact copy of the Tiimo 3.0 app (2025/2026 design), including light and dark modes, fonts, and interaction patterns.

**Architecture:** Utilize Tailwind CSS v4 variables and custom utility classes to define the "Exact Tiimo" design system. Update Next.js font configuration to include Sora.

**Tech Stack:** Tailwind CSS v4, Next.js, Google Fonts (Outfit, Sora, Space Grotesk)

---

### Task 1: Update Fonts Configuration

**Files:**
- Modify: `src/app/fonts.ts`
- Modify: `src/app/layout.tsx`

**Step 1: Add Sora font to `src/app/fonts.ts`**

```typescript
import { GeistMono, GeistSans } from 'geist/font';
import { Inter, Lexend, Outfit, Sora, Space_Grotesk } from 'next/font/google';

// ... existing code ...

export const sora = Sora({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-sora',
	preload: true,
});
```

**Step 2: Update `RootLayout` in `src/app/layout.tsx` to include Sora**

```typescript
import { geistMono, inter, lexend, outfit, sora, spaceGrotesk } from './fonts';

// ... in RootLayout return ...
<html
	lang="en"
	suppressHydrationWarning
	className={`${geistMono.variable} ${inter.variable} ${lexend.variable} ${outfit.variable} ${sora.variable} ${spaceGrotesk.variable}`}
>
```

### Task 2: Create Exact Tiimo 3.0 CSS Theme

**Files:**
- Create: `src/styles/tiimo-theme.css`
- Modify: `src/styles/index.css`

**Step 1: Define Tiimo 3.0 variables in `src/styles/tiimo-theme.css`**

```css
@theme inline {
  /* Exact Tiimo 3.0 Palette */
  --color-tiimo-lavender: #9F85FF;
  --color-tiimo-cream: #FAF8F5;
  --color-tiimo-green: #5CB587;
  --color-tiimo-gray: #464644;
  
  /* Semantic Mappings */
  --color-primary: var(--color-tiimo-lavender);
  --color-background: var(--color-tiimo-cream);
  --color-foreground: var(--color-tiimo-gray);
  
  /* ... more variables ... */
}

/* Base Styles & Interaction Patterns */
@layer base {
  body {
    font-family: var(--font-sora);
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-outfit);
  }
}

@layer utilities {
  .tiimo-press {
    @apply transition-transform duration-200;
    transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .tiimo-press:active {
    transform: scale(0.95);
  }
}
```

**Step 2: Update `src/styles/index.css` to import `tiimo-theme.css` or replace content.**

### Task 3: Refine Components & Verification

**Files:**
- Modify: `src/components/Layout/Navbar.tsx` (if exists)
- Modify: `src/components/Dashboard/TaskCard.tsx` (if exists)

**Step 1: Ensure components use the new variables correctly.**
**Step 2: Verify light/dark mode transitions.**

---
