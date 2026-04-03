# MatricMaster AI Design System

> Comprehensive design tokens, components, and animation guidelines for the MatricMaster AI application. Built on Tiimo 3.0 Design System principles with South African NSC Grade 12 curriculum focus.

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Component Library](#component-library)
5. [Animation System](#animation-system)
6. [Spacing & Layout](#spacing--layout)
7. [Accessibility](#accessibility)
8. [Usage Examples](#usage-examples)

---

## Brand Identity

### Application Name
**MatricMaster AI** - AI-powered learning companion for South African NSC Grade 12 students

### Brand Values
- **Accessible**: Every student can succeed
- **Intelligent**: AI adapts to individual learning needs  
- **Engaging**: Making revision interactive and rewarding
- **Academic**: Built for the NSC curriculum

### Design Philosophy
Tiimo 3.0 Design System - A unified design language focusing on clarity, consistency, and delight. Built with accessibility at the core.

---

## Color System

### Core Palette

```css
/* Primary Brand (Implemented April 2026) */
--primary-blue: #3B82F6;         /* Primary actions, highlights */
--secondary-navy: #0F172A;       /* Background (dark mode), primary text */
--tertiary-orange: #D16900;      /* Contrast highlights, alerts */
--neutral-offwhite: #F8FAFC;     /* Background (light mode) */

--tiimo-lavender: var(--primary-blue);
--tiimo-cream: var(--neutral-offwhite);
--tiimo-green: #5CB587;
--tiimo-gray-dark: var(--secondary-navy);
--tiimo-gray-muted: #64748B;
--tiimo-gray-subtle: #E2E8F0;
--tiimo-white: #FFFFFF;
```

### Extended Colors

```css
--tiimo-yellow: #F2C945;        /* Math, warnings */
--tiimo-blue: #48A7DE;          /* Physics, information */
--tiimo-orange: #F97316;        /* History, alerts */
--tiimo-pink: #EC4899;          /* Accounting */
--tiimo-teal: #14B8A6;          /* Chemistry */
```

### Subject Pastels

```css
/* Light Mode */
--subject-math: #F2C945;
--subject-math-soft: rgba(242, 201, 69, 0.12);

--subject-physics: #48A7DE;
--subject-physics-soft: rgba(72, 167, 222, 0.12);

--subject-life: #5CB587;
--subject-life-soft: rgba(92, 181, 135, 0.12);

--subject-chemistry: #14B8A6;
--subject-chemistry-soft: rgba(20, 184, 166, 0.12);

--subject-accounting: #F472B6;
--subject-accounting-soft: rgba(244, 114, 182, 0.12);

--subject-english: #818CF8;
--subject-english-soft: rgba(129, 140, 248, 0.12);

--subject-geography: #2DD4BF;
--subject-geography-soft: rgba(45, 212, 191, 0.12);

--subject-history: #FB923C;
--subject-history-soft: rgba(251, 146, 60, 0.12);
```

### Semantic Mappings

```css
/* Backgrounds */
--background: var(--neutral-offwhite);     /* Page background */
--foreground: var(--secondary-navy);       /* Primary text */

/* Primary Actions */
--primary: var(--primary-blue);
--primary-foreground: var(--tiimo-white);

/* Secondary Elements */
--secondary: #E2E8F0;
--secondary-foreground: var(--secondary-navy);

/* Accent & Highlights */
--accent: rgba(59, 130, 246, 0.12);
--accent-foreground: var(--primary-blue);

/* Muted Elements */
--muted: #F1F5F9;
--muted-foreground: var(--tiimo-gray-muted);

/* Cards & Surfaces */
--card: var(--tiimo-white);
--card-foreground: var(--tiimo-gray-dark);

/* Borders & Inputs */
--border: #E8E4DE;
--input: #E8E4DE;
--ring: var(--tiimo-lavender);

/* Feedback States */
--success: var(--tiimo-green);
--success-soft: rgba(92, 181, 135, 0.12);
--destructive: #FF5C5C;
--destructive-soft: rgba(255, 92, 92, 0.12);
--warning: var(--subject-math);
--warning-soft: var(--subject-math-soft);
--info: var(--subject-physics);
--info-soft: var(--subject-physics-soft);
```

### Dark Mode

```css
.dark {
  /* Premium Dark Blue Scale */
  --tiimo-gray-bg: #0F172A;
  --tiimo-gray-elevated: #1E293B;
  --tiimo-gray-border: #334155;
  
  /* Adjusted Colors */
  --background: var(--tiimo-gray-bg);
  --foreground: #F8FAFC;
  
  --primary: #3B82F6;
  --primary-foreground: #FFFFFF;
  
  --card: #1E293B;
  --card-foreground: #F8FAFC;
}
```

### Tailwind Color References

```css
/* Available as Tailwind utilities */
.bg-math { @apply bg-subject-math-soft text-subject-math; }
.bg-physics { @apply bg-subject-physics-soft text-subject-physics; }
.bg-life { @apply bg-subject-life-soft text-subject-life; }
.bg-chemistry { @apply bg-subject-chemistry-soft text-subject-chemistry; }
.bg-accounting { @apply bg-subject-accounting-soft text-subject-accounting; }
.bg-english { @apply bg-subject-english-soft text-subject-english; }
.bg-geography { @apply bg-subject-geography-soft text-subject-geography; }
.bg-history { @apply bg-subject-history-soft text-subject-history; }
```

---

## Typography

### Font Families

```css
/* Display & Headings */
--font-display: var(--font-playfair), Georgia, serif;

/* Body Text */
--font-body: var(--font-geist-sans), system-ui, sans-serif;

/* Code & Numeric Data */
--font-mono: var(--font-geist-mono), ui-monospace, monospace;

/* Subject-Specific */
--font-math: var(--font-noto-sans-math), sans-serif;
--font-science: var(--font-noto-sans-math), sans-serif;
--font-literary: var(--font-playfair), Georgia, serif;
--font-academic: var(--font-playfair), Georgia, serif;
--font-data: var(--font-geist-sans), system-ui, sans-serif;
--font-numeric: var(--font-geist-mono), ui-monospace, monospace;
```

### Type Scale (Major Third - 1.25 ratio)

```css
--text-xs: 0.64rem;      /* 10.24px - captions, labels */
--text-sm: 0.8rem;       /* 12.8px - secondary UI, metadata */
--text-base: 1rem;       /* 16px - body text (minimum) */
--text-lg: 1.25rem;      /* 20px - lead text, subheadings */
--text-xl: 1.563rem;     /* 25px - small headings */
--text-2xl: 1.953rem;    /* 31.25px - section headings */
--text-3xl: 2.441rem;    /* 39px - page headings */
--text-4xl: 3.052rem;    /* 48.8px - display headings */
--text-5xl: 3.815rem;    /* 61px - hero headings */
--text-6xl: 4.768rem;    /* 76.3px - large hero */
```

### Fluid Typography

```css
/* Responsive scaling with clamp() */
--text-display: clamp(2.5rem, 5vw + 1.5rem, 4.5rem);
--text-hero: clamp(3rem, 8vw + 1rem, 6rem);
```

### Font Weights

```css
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

### Line Heights

```css
--leading-tight: 1.1;
--leading-snug: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 1.75;
```

### Usage in Components

```tsx
// Heading with Playfair Display
<h1 className="heading-1">Section Title</h1>

// Body with Geist
<p className="body-md">Learning content goes here.</p>

// Numeric data with Geist Mono
<span className="font-numeric tabular-nums">92%</span>

// Math equations with Noto Sans Math
<span className="font-math">E = mc²</span>

// Literary text with Playfair italic
<span className="font-literary">To be, or not to be...</span>
```

---

## Component Library

### Button Component

**Location:** `src/components/ui/button.tsx`

```tsx
import { Button, buttonVariants } from '@/components/ui/button';

// Variants available
<Button variant="default">Primary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Secondary</Button>
<Button variant="secondary">Alt</Button>
<Button variant="ghost">Subtle</Button>
<Button variant="link">Underline</Button>
<Button variant="gradient">Fancy</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

**CVA Configuration:**
```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow hover:shadow-xl hover:shadow-primary/20',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
  }
);
```

### Card Component

**Location:** `src/components/ui/card.tsx`

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Achievement Unlocked!</CardTitle>
    <CardDescription>You've completed 7 days of study</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Keep up the great work!</p>
  </CardContent>
  <CardFooter>
    <Button>Continue</Button>
  </CardFooter>
</Card>
```

**CSS Behavior:**
```css
.tiimo-card {
  @apply bg-card border border-border/50 transition-all duration-200;
  border-radius: var(--radius-lg);
}
.tiimo-card:hover {
  @apply shadow-tiimo-lg border-primary/20;
}
```

### Interactive States

```tsx
// Press effect (bouncy)
<button className="tiimo-press">Press Me</button>

// Hover lift
<div className="tiimo-card hover-lift">Hover to lift</div>

// Hover glow
<div className="hover-glow">Glow on hover</div>

// Scale on hover
<div className="hover-scale">Scale on hover</div>
```

---

## Animation System

### CSS Keyframe Animations

#### Quiz Correct Pulse
```css
@keyframes quiz-correct-pulse {
  0% { box-shadow: 0 0 0 0 rgba(92, 181, 135, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(92, 181, 135, 0); }
  100% { box-shadow: 0 0 0 0 rgba(92, 181, 135, 0); }
}
```

#### Quiz Wrong Shake
```css
@keyframes quiz-wrong-shake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-6px); }
  30% { transform: translateX(5px); }
  45% { transform: translateX(-4px); }
  60% { transform: translateX(3px); }
  75% { transform: translateX(-2px); }
  90% { transform: translateX(1px); }
}
```

#### Shimmer Loading
```css
@keyframes tiimo-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-tiimo-shimmer {
  background: linear-gradient(90deg, var(--muted) 25%, var(--card) 50%, var(--muted) 75%);
  background-size: 200% 100%;
  animation: tiimo-shimmer 1.5s ease-in-out infinite;
}
```

#### Confetti Celebration
```css
@keyframes confetti-fall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
```

#### Streak Ember Rise
```css
@keyframes ember-rise {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-30px) scale(0); opacity: 0; }
}
```

### Framer Motion Variants

#### Question Transition
```tsx
const questionVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(3px)' },
};

const questionTransition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

// Usage
<m.div
  variants={questionVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={questionTransition}
>
  <QuestionCard />
</m.div>
```

### Custom Easing

```css
--ease-tiimo: cubic-bezier(0.34, 1.56, 0.64, 1);  /* Bouncy overshoot */
--ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);    /* Smooth ease-out */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);  /* Exponential decay */
```

### Duration Tokens

```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

### View Transitions (CSS)

```css
/* Slide Right Navigation */
::view-transition-new(.vt-slide-from-right) {
  --slide-offset: 60px;
  animation: var(--duration-enter) ease-out var(--duration-exit) both vt-fade,
             var(--duration-move) ease-in-out both vt-slide;
}

/* Scale Up Modal */
::view-transition-old(.vt-scale-out) {
  animation: var(--duration-exit) ease-in vt-scale-down;
}
::view-transition-new(.vt-scale-in) {
  animation: var(--duration-enter) ease-out var(--duration-exit) both vt-scale-up;
}

/* Fade */
::view-transition-old(.vt-fade-out) {
  animation: var(--duration-exit) ease-in vt-fade reverse;
}
::view-transition-new(.vt-fade-in) {
  animation: var(--duration-enter) ease-out var(--duration-exit) both vt-fade;
}
```

### Animation Utility Classes

```css
.quiz-correct-pulse { animation: quiz-correct-pulse 600ms ease-out 1; }
.quiz-wrong-shake { animation: quiz-wrong-shake 500ms ease-out 1; }
.timer-urgency { animation: timer-pulse 1200ms ease-in-out infinite; }
.breakdown-enter { animation: breakdown-enter 400ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
```

---

## Spacing & Layout

### Spacing Scale (4pt base)

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;

/* Semantic Aliases */
--space-xs: var(--space-1);
--space-sm: var(--space-2);
--space-md: var(--space-4);
--space-lg: var(--space-6);
--space-xl: var(--space-8);
--space-2xl: var(--space-12);
--space-3xl: var(--space-16);
--space-4xl: var(--space-24);
```

### Border Radius

```css
--radius-xs: 6px;    /* Small elements, badges */
--radius-sm: 10px;   /* Inputs, small cards */
--radius-md: 16px;   /* Cards, buttons */
--radius-lg: 20px;   /* Large cards, sections */
--radius-xl: 24px;   /* Hero sections */
--radius-2xl: 36px;  /* Large containers */
--radius-full: 9999px;

/* Legacy Aliases */
--radius-card: var(--radius-lg);
--radius-button: var(--radius-md);
--radius-input: var(--radius-sm);
```

### Shadows

```css
--shadow-tiimo: 0 8px 32px -4px rgba(70, 70, 68, 0.08);
--shadow-tiimo-lg: 0 16px 48px -8px rgba(70, 70, 68, 0.12);
--shadow-tiimo-xl: 0 24px 64px -12px rgba(70, 70, 68, 0.16);
```

### Layout Utilities

```css
.section-padding { @apply py-8 lg:py-12 px-4 sm:px-6 lg:px-8; }
.tiimo-container { @apply max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8; }
```

---

## Accessibility

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast Mode

```css
.high-contrast {
  --background: #000000 !important;
  --foreground: #ffffff !important;
  --primary: #ffffff !important;
  --primary-foreground: #000000 !important;
  --border: #ffffff !important;
}

.high-contrast button {
  border: 2px solid #ffffff !important;
}
```

### Text Scaling

```css
.text-scale-125 { font-size: calc(1em * 1.25); }
.text-scale-150 { font-size: calc(1em * 1.5); }
.text-scale-200 { font-size: calc(1em * 2); }
```

### Larger Click Targets

```css
/* 40% increase */
.larger-targets button,
.larger-targets [role="button"] {
  min-height: 56px !important;
  min-width: 56px !important;
}
```

### Focus Indicators

```css
.enhanced-focus *:focus-visible {
  outline: 3px solid #6366f1 !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.3) !important;
}
```

---

## Usage Examples

### Quiz Option with Animation

```tsx
import { m } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuizOptionProps {
  label: string;
  isSelected: boolean;
  isCorrect?: boolean;
  isChecked: boolean;
  onSelect: () => void;
}

export function QuizOption({ label, isSelected, isCorrect, isChecked, onSelect }: QuizOptionProps) {
  return (
    <m.button
      className={cn(
        'w-full p-4 rounded-lg border-2 transition-all text-left',
        isSelected && !isChecked && 'border-primary bg-primary/10',
        isChecked && isSelected && isCorrect && 'border-success bg-success-soft quiz-correct-pulse',
        isChecked && isSelected && !isCorrect && 'border-destructive bg-destructive-soft quiz-wrong-shake',
        !isSelected && !isChecked && 'border-border hover:border-primary/50'
      )}
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
    >
      {label}
    </m.button>
  );
}
```

### Progress Ring Animation

```tsx
import { m, useSpring, useTransform } from 'framer-motion';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function ProgressRing({ progress, size = 80, strokeWidth = 8, color = '#9F85FF' }: ProgressRingProps) {
  const spring = useSpring(0, { stiffness: 100, damping: 20 });
  const strokeDashoffset = useTransform(spring, [0, 100], [0, 2 * Math.PI * (size / 2 - strokeWidth / 2)]);
  
  // Animate on mount
  useEffect(() => {
    spring.set(progress);
  }, [progress, spring]);

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        stroke="#E8E4DE"
        fill="none"
        strokeWidth={strokeWidth}
        r={size / 2 - strokeWidth / 2}
      />
      <m.circle
        stroke={color}
        fill="none"
        strokeWidth={strokeWidth}
        r={size / 2 - strokeWidth / 2}
        style={{ strokeDasharray: 2 * Math.PI * (size / 2 - strokeWidth / 2), strokeDashoffset }}
      />
    </svg>
  );
}
```

### Confetti Celebration

```tsx
import canvasConfetti from 'canvas-confetti';

interface ConfettiProps {
  active: boolean;
}

export function ConfettiCelebration({ active }: ConfettiProps) {
  useEffect(() => {
    if (!active) return;
    
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      canvasConfetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#9F85FF', '#5CB587', '#F2C945', '#48A7DE'],
      });
      canvasConfetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#9F85FF', '#5CB587', '#F2C945', '#48A7DE'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [active]);

  return null;
}
```

### Card with Hover Effects

```tsx
import { m } from 'framer-motion';

interface SubjectCardProps {
  title: string;
  icon: ReactNode;
  color: string;
  progress: number;
}

export function SubjectCard({ title, icon, color, progress }: SubjectCardProps) {
  return (
    <m.div
      className="tiimo-card p-4 cursor-pointer"
      whileHover={{ y: -4, boxShadow: '0 16px 48px -8px rgba(70, 70, 68, 0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
            <m.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </m.div>
  );
}
```

### View Transition Navigation

```tsx
'use client';

import { useRouter } from 'next/navigation';

export function navigateTo(path: string, transition: 'slide-right' | 'slide-left' | 'scale' | 'fade' = 'slide-right') {
  if (!document.startViewTransition) {
    return router.push(path);
  }

  document.startViewTransition(() => {
    router.push(path);
  });
}

// Usage in component
const router = useRouter();

<button 
  onClick={() => {
    document.startViewTransition(() => {
      router.push('/quiz?id=math-p1-2023');
    });
  }}
>
  Start Quiz
</button>
```

---

## Design Tokens Quick Reference

| Token | Value | Usage |
|-------|-------|-------|
| `--tiimo-lavender` | #9F85FF | Primary actions, CTAs |
| `--tiimo-cream` | #FAF8F5 | Background |
| `--tiimo-green` | #5CB587 | Success, correct |
| `--tiimo-gray-dark` | #464644 | Text |
| `--radius-md` | 16px | Cards, buttons |
| `--ease-tiimo` | cubic-bezier(0.34,1.56,0.64,1) | Bouncy animations |
| `--duration-normal` | 300ms | Standard transitions |

---

## Related Files

- `src/styles/tiimo-theme.css` - Complete design system CSS
- `src/styles/index.css` - Global styles and animations
- `src/components/ui/` - shadcn/ui components with Tiimo styling
- `src/components/Quiz/` - Quiz-specific animations
- `src/components/MotionGraphics/` - Remotion motion graphics

---

*Generated from MatricMaster AI - Tiimo 3.0 Design System*
