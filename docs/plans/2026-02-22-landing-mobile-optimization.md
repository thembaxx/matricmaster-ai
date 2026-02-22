# Landing Page Mobile Optimization Implementation Plan

> **For Claude:** This plan focuses on comprehensive mobile responsiveness improvements following iOS HIG guidelines and web best practices.

**Goal:** Transform the Landing page (`src/screens/Landing.tsx`) into a fully responsive, mobile-first experience that looks exceptional on screens from 320px to 1920px+ while maintaining the existing premium aesthetic.

**Architecture:** Use fluid typography with clamp(), responsive breakpoints, touch-optimized component sizing, and proper spacing systems. Leverage Tailwind's responsive utilities with intermediate breakpoints for smoother scaling.

**Tech Stack:** Next.js 16, Tailwind CSS v4, framer-motion, shadcn/ui components, Lexend + System font stack

---

## Current State Analysis

The existing Landing page has several mobile responsiveness issues:

1. **Typography**: H1 jumps from 5xl to 8xl (too aggressive), body text oversized on mobile
2. **Touch Targets**: Buttons use `h-18!` (72px) causing scroll issues, cards lack proper touch targets
3. **Hero Section**: Illustration at `w-64 h-64` (256px) too large, floating badges excessive
4. **Spacing**: Inconsistent padding between mobile/desktop breakpoints
5. **Layout Risk**: Potential horizontal overflow on very small screens (320px)

---

## Task 1: Typography System Overhaul

**Files:**

- Modify: `src/screens/Landing.tsx` - Hero section text elements
- Modify: `src/screens/Landing.tsx` - Section headings and body text
- Reference: `src/styles/index.css` - Font configuration

**Step 1: Update Hero H1 typography**

Replace current H1:

```tsx
// OLD
<SmoothWords
  as="h1"
  text="Master your Matrics through practice."
  className="text-5xl md:text-6xl lg:text-8xl font-black text-foreground leading-[1.05] tracking-tighter"
  stagger={0.08}
/>

// NEW - with fluid typography
<SmoothWords
  as="h1"
  text="Master your Matrics through practice."
  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-foreground leading-[1.05] tracking-tighter"
  stagger={0.08}
/>
```

**Step 2: Update subtitle/body text**

```tsx
// OLD
<SmoothText
  text="Interactive past papers and step-by-step guides for South African Grade 12 students."
  className="text-lg md:text-xl font-medium text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed pt-4"
  delay={0.5}
/>

// NEW
<SmoothText
  text="Interactive past papers and step-by-step guides for South African Grade 12 students."
  className="text-base md:text-lg lg:text-xl font-medium text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed pt-4"
  delay={0.5}
/>
```

**Step 3: Update section headings**

```tsx
// OLD - Subjects section heading
<h2 className="text-sm font-black text-muted-foreground uppercase tracking-[0.4em] whitespace-nowrap lg:text-base">

// NEW - Better scaling
<h2 className="text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-[0.3em] lg:tracking-[0.4em] whitespace-nowrap">
```

**Step 4: Verify font rendering**

Run: `bun run lint:fix` to ensure no formatting issues
Expected: Clean build, proper font rendering at all breakpoints

---

## Task 2: Touch Target Optimization

**Files:**

- Modify: `src/screens/Landing.tsx` - Hero buttons, subject cards, CTA buttons
- Reference: shadcn/ui Button component for consistent sizing

**Step 1: Fix Hero primary button**

```tsx
// OLD
<Button
  size="lg"
  className="lg:flex-none lg:w-72 rounded-2xl shrink-0 h-18! lg:h-20 text-xl font-black shadow-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-primary/20 bg-primary"
>
  Start Learning
  <ChevronRight className="w-6 h-6 ml-2" />
</Button>

// NEW - iOS HIG compliant
<Button
  size="lg"
  className="w-full sm:w-auto lg:flex-none lg:w-72 rounded-2xl shrink-0 h-12 lg:h-14 xl:h-16 text-base lg:text-lg xl:text-xl font-black shadow-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-primary/20 bg-primary"
>
  Start Learning
  <ChevronRight className="w-5 h-5 ml-2" />
</Button>
```

**Step 2: Fix Hero secondary button**

```tsx
// OLD
<Button
  variant="outline"
  size="lg"
  className="lg:flex-none lg:w-64 rounded-2xl h-18 lg:h-20 text-lg font-black border-2 hover:bg-muted active:scale-95 transition-all"
>

// NEW
<Button
  variant="outline"
  size="lg"
  className="w-full sm:w-auto lg:flex-none lg:w-64 rounded-2xl h-12 lg:h-14 xl:h-16 text-base lg:text-lg font-black border-2 hover:bg-muted active:scale-95 transition-all"
>
```

**Step 3: Fix Email subscription button**

```tsx
// OLD
<Button
  type="submit"
  size="lg"
  disabled={isSubmitting}
  className="h-14 px-8 rounded-2xl font-black shrink-0"
>

// NEW
<Button
  type="submit"
  size="lg"
  disabled={isSubmitting}
  className="h-12 px-6 lg:h-14 lg:px-8 rounded-2xl font-black shrink-0"
>
```

**Step 4: Fix CTA section button**

```tsx
// OLD
<Button
  size="lg"
  className="bg-white text-primary hover:bg-zinc-100 rounded-[2rem] h-20 px-12 text-2xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95"
>

// NEW
<Button
  size="lg"
  className="w-full sm:w-auto bg-white text-primary hover:bg-zinc-100 rounded-[2rem] h-12 sm:h-14 lg:h-16 px-8 lg:px-12 text-lg lg:text-xl xl:text-2xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95"
>
```

**Step 5: Verify touch target sizes**

Run: Manual test on mobile device or browser DevTools
Expected: All buttons minimum 44x44px, primary actions 48x48px+

---

## Task 3: Hero Illustration Redesign

**Files:**

- Modify: `src/screens/Landing.tsx` - Hero illustration container and SVG

**Step 1: Update illustration container sizing**

```tsx
// OLD
<m.div
  initial={{ opacity: 0, x: 50, rotate: 5 }}
  animate={{ opacity: 1, x: 0, rotate: 0 }}
  transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
  className="relative flex-1 w-full max-w-[500px] flex items-center justify-center lg:max-w-none"
>

// NEW - Better responsive sizing
<m.div
  initial={{ opacity: 0, x: 50, rotate: 5 }}
  animate={{ opacity: 1, x: 0, rotate: 0 }}
  transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
  className="relative flex-1 w-full max-w-[320px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-none flex items-center justify-center"
>
```

**Step 2: Update SVG illustration size**

```tsx
// OLD
<svg viewBox="0 0 100 100" className="w-64 h-64 relative z-10 opacity-80">

// NEW - Responsive sizing
<svg viewBox="0 0 100 100" className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 relative z-10 opacity-80">
```

**Step 3: Update floating badges**

```tsx
// OLD - Top badge
<m.div
  animate={{ y: [0, -15, 0] }}
  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
  className="absolute -top-4 right-0 w-24 h-24 bg-brand-amber rounded-3xl shadow-2xl flex items-center justify-center -rotate-12 z-20"
>
  <Sparkles className="w-12 h-12 text-white fill-white" />
</m.div>

// NEW - Scaled for mobile
<m.div
  animate={{ y: [0, -15, 0] }}
  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
  className="absolute -top-3 sm:-top-4 right-0 sm:right-2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-brand-amber rounded-2xl sm:rounded-3xl shadow-2xl flex items-center justify-center -rotate-12 z-20"
>
  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white fill-white" />
</m.div>

// OLD - Bottom badge
<m.div
  animate={{ y: [0, 20, 0], rotate: [12, 18, 12] }}
  transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
  className="absolute -bottom-6 left-0 w-28 h-28 bg-brand-green rounded-[2.5rem] shadow-2xl flex items-center justify-center z-20"
>
  <Atom className="w-14 h-14 text-white" />
</m.div>

// NEW - Scaled for mobile
<m.div
  animate={{ y: [0, 20, 0], rotate: [12, 18, 12] }}
  transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
  className="absolute -bottom-4 sm:-bottom-6 left-0 sm:left-2 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-brand-green rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex items-center justify-center z-20"
>
  <Atom className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
</m.div>
```

**Step 4: Test illustration rendering**

Run: Open browser DevTools, toggle device toolbar, test at 320px, 375px, 414px widths
Expected: Illustration scales smoothly without overflow, badges don't overlap content

---

## Task 4: Subject Cards Grid Optimization

**Files:**

- Modify: `src/screens/Landing.tsx` - Subject cards section
- Reference: shadcn/ui Card component

**Step 1: Update grid layout with intermediate breakpoints**

```tsx
// OLD
<m.div
  variants={STAGGER_CONTAINER}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: '-100px' }}
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
>

// NEW - Better responsive breakpoints
<m.div
  variants={STAGGER_CONTAINER}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: '-100px' }}
  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
>
```

**Step 2: Update card padding for better mobile fit**

```tsx
// OLD
<Card
  className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative h-full flex flex-col justify-between"
>

// NEW - Responsive padding
<Card
  className="bg-card p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-border shadow-sm group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative h-full flex flex-col justify-between"
>
```

**Step 3: Update card icon container**

```tsx
// OLD
<m.div
  whileHover={{ scale: 1.1, rotate: 5 }}
  className={`w-20 h-20 rounded-[2rem] ${subject.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 relative overflow-hidden`}
>

// NEW - Responsive icon size
<m.div
  whileHover={{ scale: 1.1, rotate: 5 }}
  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-[2rem] ${subject.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 relative overflow-hidden`}
>
```

**Step 4: Update icon sizing**

```tsx
// OLD
<Icon
  className={`w-10 h-10 ${subject.color} relative z-10`}
  aria-hidden="true"
/>

// NEW
<Icon
  className={`w-8 h-8 sm:w-10 sm:h-10 ${subject.color} relative z-10`}
  aria-hidden="true"
/>
```

**Step 5: Test grid responsiveness**

Run: Browser DevTools, test grid at 320px, 375px, 768px, 1024px
Expected: Single column at 320-374px, 2 columns at 375-767px, 3 columns at 768px+

---

## Task 5: CTA Section Optimization

**Files:**

- Modify: `src/screens/Landing.tsx` - Final CTA section

**Step 1: Update CTA card padding**

```tsx
// OLD
<Card className="bg-primary p-12 lg:p-24 rounded-[4rem] text-center space-y-12 relative overflow-hidden group">

// NEW
<Card className="bg-primary p-8 sm:p-12 lg:p-16 xl:p-24 rounded-2xl sm:rounded-[3rem] lg:rounded-[4rem] text-center space-y-8 sm:space-y-12 relative overflow-hidden group">
```

**Step 2: Update CTA heading**

```tsx
// OLD
<h2 className="text-4xl lg:text-7xl font-black text-primary-foreground tracking-tighter leading-none">

// NEW
<h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-primary-foreground tracking-tighter leading-none">
```

**Step 3: Update CTA subtitle**

```tsx
// OLD
<p className="text-xl lg:text-2xl font-bold text-primary-foreground/80 max-w-2xl mx-auto">

// NEW
<p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-primary-foreground/80 max-w-xl sm:max-w-2xl mx-auto">
```

**Step 4: Test CTA responsiveness**

Run: Browser DevTools, test at 320px, 375px, 768px
Expected: Card fits viewport, no horizontal scroll, text readable

---

## Task 6: Footer & Email Form Optimization

**Files:**

- Modify: `src/screens/Landing.tsx` - Footer section, EmailSubscriptionForm component

**Step 1: Update footer grid**

```tsx
// OLD
<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

// NEW
<div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 xl:gap-24">
```

**Step 2: Update email form layout**

```tsx
// OLD
<div className="flex flex-col sm:flex-row gap-3">
  <Input
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="h-14 px-6 rounded-2xl text-base border-border bg-background flex-1"
    required
  />

// NEW
<div className="flex flex-col sm:flex-row gap-3">
  <Input
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="h-12 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-base border-border bg-background flex-1"
    required
  />
```

**Step 3: Update social icons for touch**

```tsx
// OLD
<a
  href={social.href}
  target="_blank"
  rel="noopener noreferrer"
  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
>

// NEW
<a
  href={social.href}
  target="_blank"
  rel="noopener noreferrer"
  className="w-11 h-11 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
>
```

**Step 4: Test footer at all breakpoints**

Run: Browser DevTools, test at 320px, 375px, 768px
Expected: Form stacks properly, social icons meet 44x44px minimum

---

## Task 7: Global Layout & Overflow Prevention

**Files:**

- Modify: `src/screens/Landing.tsx` - Main container, sections

**Step 1: Add overflow protection to main container**

```tsx
// OLD
<div className="flex flex-col h-full w-full bg-background overflow-hidden relative">

// NEW - Ensure no horizontal overflow
<div className="flex flex-col h-full min-w-0 w-full bg-background overflow-x-hidden relative">
```

**Step 2: Update section padding consistency**

```tsx
// OLD
<main className="pb-40 px-6 max-w-7xl mx-auto w-full lg:px-0 lg:pb-24">

// NEW - More consistent responsive padding
<main className="pb-32 sm:pb-40 px-4 sm:px-6 max-w-7xl mx-auto w-full lg:px-0 lg:pb-24">
```

**Step 3: Update section spacing**

```tsx
// OLD
<section className="pt-12 pb-24 lg:pt-24 lg:pb-32 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

// NEW
<section className="pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-24 lg:pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 xl:gap-24">
```

**Step 4: Test for horizontal scroll**

Run: `bun run dev`, open browser, manually scroll horizontally at 320px width
Expected: No horizontal scrollbar appears, content fits viewport

---

## Task 8: Final Testing & Verification

**Files:**

- Test: All breakpoints using browser DevTools
- Verify: Touch targets, typography, spacing, accessibility

**Step 1: Test at 320px (smallest common mobile)**

Run: Browser DevTools, iPhone SE / Pixel 4a emulation
Expected:

- No horizontal scroll
- All text readable (minimum 16px body)
- Touch targets 44x44px minimum
- No content overflow

**Step 2: Test at 375px (iPhone 12/13/14)**

Run: Browser DevTools, iPhone 12/13/14 emulation
Expected:

- Hero illustration displays properly
- Buttons fully visible and tappable
- Grid shows 2 columns for subjects

**Step 3: Test at 768px (tablet portrait)**

Run: Browser DevTools, iPad mini / iPad Air emulation
Expected:

- Desktop sidebar does not appear (not logged in)
- Grid shows 2-3 columns
- All sections properly spaced

**Step 4: Test at 1024px+ (desktop)**

Run: Browser DevTools, MacBook Pro 14" emulation
Expected:

- Full desktop layout displays
- Floating navbar works correctly
- All animations smooth

**Step 5: Run linting**

Run: `bun run lint:fix`
Expected: Clean build, no errors

**Step 6: Commit changes**

Run: `git add src/screens/Landing.tsx && git commit -m "feat: comprehensive mobile responsiveness improvements for Landing page"`
Expected: Clean commit with descriptive message

---

## Implementation Summary

| Task | Component         | Key Changes                                                                              |
| ---- | ----------------- | ---------------------------------------------------------------------------------------- |
| 1    | Typography        | H1: 4xl→8xl fluid scaling, body: base→xl, section headings with intermediate breakpoints |
| 2    | Touch Targets     | Buttons: 18→12-14, all meet 44x44px minimum                                              |
| 3    | Hero Illustration | Container: 320px→unlimited, SVG: 48→64px, badges scaled proportionally                   |
| 4    | Subject Cards     | Grid: 1→2→3 columns, padding: 6-8px responsive                                           |
| 5    | CTA Section       | Padding: 8→24px fluid, text scales appropriately                                         |
| 6    | Footer/Form       | Grid: 1→2 columns, inputs: 12-14px height                                                |
| 7    | Global Layout     | Overflow prevention, consistent padding                                                  |
| 8    | Testing           | Full responsive testing at all breakpoints                                               |

---

## Dependencies & References

- **@ui/card**: shadcn/ui Card component
- **@ui/button**: shadcn/ui Button component
- **@ui/input**: shadcn/ui Input component
- **framer-motion**: Animation library for smooth transitions
- **lucide-react**: Icon library (Sparkles, Atom, ChevronRight, etc.)
- **Lexend font**: Already configured in `src/app/fonts.ts`
- **Tailwind v4**: Using @theme inline for custom properties

---

## Success Criteria

After implementation, the Landing page will:

1. ✅ Render flawlessly at 320px, 375px, 414px, 768px, 1024px, 1440px, 1920px
2. ✅ All touch targets minimum 44x44px (iOS HIG compliant)
3. ✅ Typography readable at all sizes (16px body minimum)
4. ✅ No horizontal overflow at any breakpoint
5. ✅ Smooth responsive transitions between breakpoints
6. ✅ Maintain premium aesthetic and brand identity
7. ✅ Pass accessibility guidelines (color contrast, focus states)
8. ✅ Maintain animations but respect prefers-reduced-motion

---

**Plan complete and saved to `docs/plans/2026-02-22-landing-mobile-optimization.md`.**

Two execution options:

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach would you prefer?
