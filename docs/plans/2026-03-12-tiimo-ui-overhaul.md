# Tiimo-Theme Exact Recreation & UI Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Recreate the Tiimo 3.0 design system as an exact copy and overhaul the entire MatricMaster UI to match its aesthetics, layouts, and interaction patterns.

**Architecture:** 
- Centralized `tiimo-theme.css` with exact HEX codes and typography.
- Refactored UI components using Tiimo's "Visual Planning" layout principles.
- Consistent use of "Bouncy" transitions and "Soft-Vibrant" color coding.

**Tech Stack:** Tailwind CSS v4, Next.js, Framer Motion (for Tiimo-like animations), Lucide/Hugeicons (carefully selected to match Tiimo's style).

---

### Task 1: Foundation (Fonts & Global CSS)

**Files:**
- Modify: `src/app/fonts.ts` - Add **Sora** and **Outfit** (if not exact).
- Modify: `src/app/layout.tsx` - Apply new font variables.
- Create: `src/styles/tiimo-theme.css` - The "Source of Truth" for Tiimo 3.0.

**Step 1: Update Fonts**
Ensure **Outfit** (Display), **Sora** (UI/Body), and **Space Grotesk** (Data) are correctly configured.

**Step 2: Rewrite `src/styles/index.css`**
Remove all "Tiimo-inspired" legacy code and replace with a clean import of the new exact theme.

### Task 2: Core UI Overhaul - Layout & Navigation

**Files:**
- Modify: `src/components/Layout/Navbar.tsx` (or equivalent mobile nav).
- Modify: `src/components/Layout/Sidebar.tsx` (if exists).

**Step 1: Redesign Navigation**
Tiimo 3.0 uses a distinctive bottom tab bar on mobile and a very clean sidebar on desktop.
- Implement the "Floating" bottom nav with large, rounded active states.
- Use Tiimo's "Lavendar" accent for active items.

### Task 3: Component Overhaul - Cards & Lists

**Files:**
- Modify: `src/components/Dashboard/SubjectCards.tsx`
- Modify: `src/components/Dashboard/DailyGoals.tsx`
- Modify: `src/components/Dashboard/StatsCards.tsx`

**Step 1: Re-style Subject Cards**
- Use Tiimo's "Soft Pastel" background colors for each subject.
- Add large, rounded icons (24px+ radius).
- Implement the "Bouncy" press effect on all cards.

**Step 2: Re-style Task/Goal Cards**
- Use the "Visual Timeline" approach: vertical color strip on the left.
- Large checkboxes (rounded-full).

### Task 4: Screen Overhaul - Dashboard & Quiz

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/quiz/page.tsx`

**Step 1: Dashboard Layout**
- Implement the "Today's Focus" hero section.
- Use Tiimo's "Visual Timeline" for the daily schedule.

**Step 2: Quiz UI**
- Soft, large question cards.
- Progress ring that matches Tiimo's "Visual Timer" style.

### Task 5: Dark Mode & Interaction Polish

**Files:**
- Modify: `src/styles/tiimo-theme.css` (Dark Mode section).
- Modify: `src/components/theme-provider.tsx` (Ensure seamless transition).

**Step 1: Exact Dark Mode**
- Background: `#1A1A1B` (Charcoal).
- Desaturated accents for accessibility.

**Step 2: Animation Refinement**
- Use `framer-motion` to match Tiimo's "Staggered Reveal" and "Elastic Bounces".

---
