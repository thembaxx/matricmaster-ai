# Animation & Feedback System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dynamic subject backgrounds, confetti micro-interactions, and haptic feedback to MatricMaster-AI

**Architecture:** Three independent systems that integrate into existing layout and components. SubjectBackground wraps content, Confetti uses Framer Motion particles, and Haptics use Web Vibration API with React Context.

**Tech Stack:** Framer Motion (existing), CSS animations, Web Vibration API, React Context

---

## File Structure

```
src/
├── components/ui/
│   ├── Confetti.tsx              # Confetti particle system
│   └── SubjectBackground.tsx      # Dynamic gradient wrapper
├── hooks/
│   ├── useHaptics.ts              # Haptic feedback hook
│   └── useConfetti.ts             # Confetti trigger hook
├── lib/
│   └── subject-gradients.ts       # Subject color palettes
└── styles/
    └── tiimo-theme.css            # Add gradient animations

Integration points:
- src/components/Layout/AppLayout.tsx     # Add SubjectBackground
- src/constants/subjects.ts               # Add gradient colors
- src/app/settings/page.tsx              # Add haptic toggle
```

---

## Task 1: Subject Gradient System

**Files:**
- Create: `src/lib/subject-gradients.ts`
- Modify: `src/constants/subjects.ts`
- Modify: `src/styles/tiimo-theme.css`

- [ ] **Step 1: Create subject gradients module**

```typescript
// src/lib/subject-gradients.ts

export const SUBJECT_GRADIENTS: Record<string, { primary: string; secondary: string; accent: string }> = {
  mathematics: { primary: '#667eea', secondary: '#764ba2', accent: '#a855f7' },
  physics: { primary: '#11998e', secondary: '#38ef7d', accent: '#34d399' },
  chemistry: { primary: '#fc4a1a', secondary: '#f7b733', accent: '#fb923c' },
  life_sciences: { primary: '#56ab2f', secondary: '#a8e063', accent: '#84cc16' },
  english: { primary: '#c9d6ff', secondary: '#e2e2e2', accent: '#94a3b8' },
  geography: { primary: '#8e2de2', secondary: '#4a00e0', accent: '#a855f7' },
  history: { primary: '#cb2d3e', secondary: '#ef473a', accent: '#f87171' },
  accounting: { primary: '#0f4c75', secondary: '#3282b8', accent: '#60a5fa' },
  economics: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
};

export const getGradientColors = (subjectId: string) => {
  return SUBJECT_GRADIENTS[subjectId] || SUBJECT_GRADIENTS.mathematics;
};
```

- [ ] **Step 2: Update subjects.ts to include gradient colors**

Add `gradient` field to each subject in `src/constants/subjects.ts`

- [ ] **Step 3: Add CSS keyframes to tiimo-theme.css**

```css
/* Add to src/styles/tiimo-theme.css */
@keyframes gradient-shimmer {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(200%) rotate(45deg); }
}

.animate-gradient-shimmer {
  animation: gradient-shimmer 4s linear infinite;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/subject-gradients.ts src/constants/subjects.ts src/styles/tiimo-theme.css
git commit -m "feat: add subject gradient color palettes"
```

---

## Task 2: SubjectBackground Component

**Files:**
- Create: `src/components/ui/SubjectBackground.tsx`
- Modify: `src/components/Layout/AppLayout.tsx`

- [ ] **Step 1: Create SubjectBackground component**

```tsx
// src/components/ui/SubjectBackground.tsx
'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface SubjectBackgroundProps {
  subjectId: string;
  children: React.ReactNode;
  intensity?: number; // 0.1 to 0.2
}

export function SubjectBackground({ 
  subjectId, 
  children, 
  intensity = 0.1 
}: SubjectBackgroundProps) {
  const { prefersReducedMotion } = useReducedMotion();
  const [gradient, setGradient] = useState({ primary: '#667eea', secondary: '#764ba2' });
  
  useEffect(() => {
    const loadGradient = async () => {
      const { getGradientColors } = await import('@/lib/subject-gradients');
      setGradient(getGradientColors(subjectId));
    };
    loadGradient();
  }, [subjectId]);

  const backgroundStyle = {
    background: `linear-gradient(135deg, ${gradient.primary}, ${gradient.secondary})`,
  };

  return (
    <div className="relative min-h-screen">
      {/* Gradient overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
        style={{ 
          ...backgroundStyle,
          opacity: prefersReducedMotion ? 0 : intensity 
        }}
      >
        {!prefersReducedMotion && (
          <div 
            className="absolute inset-[-50%] animate-gradient-shimmer"
            style={{
              background: `linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)`
            }}
          />
        )}
      </div>
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Integrate into AppLayout**

Add SubjectBackground wrapper to main content area in `src/components/Layout/AppLayout.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/SubjectBackground.tsx src/components/Layout/AppLayout.tsx
git commit -m "feat: add SubjectBackground component with animated gradients"
```

---

## Task 3: Confetti System

**Files:**
- Create: `src/components/ui/Confetti.tsx`
- Create: `src/hooks/useConfetti.ts`
- Modify: `src/app/lesson/[id]/page.tsx` (or wherever lesson completion occurs)

- [ ] **Step 1: Create useConfetti hook**

```typescript
// src/hooks/useConfetti.ts
import { useCallback, useState } from 'react';

type ConfettiType = 'lesson-complete' | 'quiz-perfect' | 'streak-milestone' | 'daily-first';

interface ConfettiConfig {
  type: ConfettiType;
  colors?: string[];
}

const CONFETTI_CONFIGS: Record<ConfettiType, { particleCount: number; duration: number; colors: string[] }> = {
  'lesson-complete': { particleCount: 50, duration: 2000, colors: [] }, // uses subject colors
  'quiz-perfect': { particleCount: 100, duration: 3000, colors: ['#fbbf24', '#f59e0b', '#d97706', '#fff', '#a855f7'] },
  'streak-milestone': { particleCount: 75, duration: 2500, colors: ['#ef4444', '#f97316', '#fbbf24', '#fef3c7', '#fed7aa'] },
  'daily-first': { particleCount: 30, duration: 1500, colors: [] }, // uses subject colors
};

export function useConfetti() {
  const [active, setActive] = useState(false);
  const [config, setConfig] = useState<ConfettiConfig>({ type: 'lesson-complete' });

  const trigger = useCallback((type: ConfettiType, colors?: string[]) => {
    setConfig({ type, colors });
    setActive(true);
  }, []);

  const stop = useCallback(() => {
    setActive(false);
  }, []);

  return { active, config, trigger, stop, getConfig: (type: ConfettiType) => CONFETTI_CONFIGS[type] };
}
```

- [ ] **Step 2: Create Confetti component**

```tsx
// src/components/ui/Confetti.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ConfettiProps {
  active: boolean;
  colors?: string[];
  particleCount?: number;
  duration?: number;
  onComplete?: () => void;
}

const DEFAULT_COLORS = ['#667eea', '#764ba2', '#a855f7', '#f59e0b', '#22c55e'];

export function Confetti({ 
  active, 
  colors = DEFAULT_COLORS,
  particleCount = 50, 
  duration = 2000,
  onComplete 
}: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    color: string;
    rotation: number;
    size: number;
    shape: 'rect' | 'circle';
  }>>([]);

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 720,
        size: 6 + Math.random() * 6,
        shape: Math.random() > 0.7 ? 'circle' as const : 'rect' as const,
      }));
      setParticles(newParticles);
      
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [active, colors, particleCount, duration, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          exit={{ opacity: 0 }}
        >
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute"
              style={{
                left: `${particle.x}%`,
                top: '40%',
              }}
              initial={{ 
                y: 0, 
                rotate: 0, 
                opacity: 1,
                scale: 1
              }}
              animate={{
                y: 400,
                rotate: particle.rotation,
                opacity: [1, 1, 0],
                x: (particle.x - 50) * 2, // spread
              }}
              transition={{
                duration: duration / 1000,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <div
                className={particle.shape === 'circle' ? 'rounded-full' : 'rounded-sm'}
                style={{
                  width: particle.size,
                  height: particle.shape === 'circle' ? particle.size : particle.size * 0.6,
                  backgroundColor: particle.color,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Create ConfettiProvider context**

```tsx
// src/components/ui/ConfettiProvider.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Confetti } from './Confetti';
import { useConfetti } from '@/hooks/useConfetti';

const ConfettiContext = createContext<ReturnType<typeof useConfetti> | null>(null);

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const confetti = useConfetti();
  
  return (
    <ConfettiContext.Provider value={confetti}>
      <Confetti 
        active={confetti.active}
        colors={confetti.config.colors}
        particleCount={confetti.getConfig(confetti.config.type).particleCount}
        duration={confetti.getConfig(confetti.config.type).duration}
        onComplete={confetti.stop}
      />
      {children}
    </ConfettiContext.Provider>
  );
}

export const useConfettiContext = () => {
  const context = useContext(ConfettiContext);
  if (!context) throw new Error('useConfettiContext must be used within ConfettiProvider');
  return context;
};
```

- [ ] **Step 4: Add ConfettiProvider to AppLayout**

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Confetti.tsx src/components/ui/ConfettiProvider.tsx src/hooks/useConfetti.ts src/components/Layout/AppLayout.tsx
git commit -m "feat: add confetti celebration system"
```

---

## Task 4: Haptic Feedback System

**Files:**
- Create: `src/hooks/useHaptics.ts`
- Create: `src/components/ui/HapticProvider.tsx`
- Modify: `src/app/settings/page.tsx`
- Modify: `src/stores/` (add haptic preference to settings store)

- [ ] **Step 1: Create useHaptics hook**

```typescript
// src/hooks/useHaptics.ts
import { useCallback, useEffect, useState } from 'react';

const HAPTIC_PATTERNS = {
  light: [10],
  medium: [15],
  success: [30, 50, 30],
  achievement: [50, 100, 50, 100, 100],
} as const;

export function useHaptics() {
  const [enabled, setEnabled] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('vibrate' in navigator);
    // Load preference from localStorage
    const stored = localStorage.getItem('haptics-enabled');
    if (stored !== null) setEnabled(stored === 'true');
  }, []);

  const setPreference = useCallback((value: boolean) => {
    setEnabled(value);
    localStorage.setItem('haptics-enabled', String(value));
  }, []);

  const trigger = useCallback((type: keyof typeof HAPTIC_PATTERNS) => {
    if (!enabled || !isSupported) return;
    navigator.vibrate(HAPTIC_PATTERNS[type]);
  }, [enabled, isSupported]);

  return {
    trigger,
    enabled,
    setEnabled: setPreference,
    isSupported,
  };
}
```

- [ ] **Step 2: Add haptic toggle to settings page**

Add to `src/app/settings/page.tsx` in the accessibility section:
```tsx
<div className="flex items-center justify-between">
  <div>
    <p className="font-medium">Haptic Feedback</p>
    <p className="text-sm text-muted-foreground">Vibration on interactions</p>
  </div>
  <Switch 
    checked={haptics.enabled} 
    onCheckedChange={haptics.setEnabled}
    disabled={!haptics.isSupported}
  />
</div>
```

- [ ] **Step 3: Integrate haptics into Button component**

Add to existing Button component in `src/components/ui/button.tsx`:
```tsx
const { trigger: triggerHaptic } = useHaptics();

// In onClick handler
if (variant === 'default' || variant === 'destructive') {
  triggerHaptic('light');
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useHaptics.ts src/app/settings/page.tsx src/components/ui/button.tsx
git commit -m "feat: add haptic feedback system"
```

---

## Task 5: Integration - Achievement Triggers

**Files:**
- Modify: `src/components/lessons/LessonComplete.tsx` (or wherever completion occurs)
- Modify: `src/components/streak/StreakCounter.tsx`
- Modify: `src/components/quiz/QuizComplete.tsx`

- [ ] **Step 1: Add confetti to lesson complete component**

```tsx
const { trigger: triggerConfetti } = useConfettiContext();
const { trigger: triggerHaptic } = useHaptics();

const handleComplete = () => {
  // existing logic...
  triggerConfetti('lesson-complete', subjectColors);
  triggerHaptic('success');
};
```

- [ ] **Step 2: Add fire confetti to streak milestones**

Trigger confetti + heavy haptic for 7, 14, 30 day streaks.

- [ ] **Step 3: Commit**

```bash
git add src/components/lessons/LessonComplete.tsx src/components/streak/StreakCounter.tsx src/components/quiz/QuizComplete.tsx
git commit -m "feat: integrate confetti and haptics into achievements"
```

---

## Task 6: Testing

**Files:**
- Create: `src/__tests__/hooks/useHaptics.test.ts`
- Create: `src/__tests__/hooks/useConfetti.test.ts`

- [ ] **Step 1: Write useHaptics test**

```typescript
// src/__tests__/hooks/useHaptics.test.ts
import { renderHook, act } from '@testing-library/react';
import { useHaptics } from '@/hooks/useHaptics';

describe('useHaptics', () => {
  it('should return isSupported based on navigator.vibrate', () => {
    const { result } = renderHook(() => useHaptics());
    expect(typeof result.current.isSupported).toBe('boolean');
  });

  it('should trigger vibration when enabled', () => {
    const vibrateMock = jest.fn();
    Object.assign(navigator, { vibrate: vibrateMock });
    
    const { result } = renderHook(() => useHaptics());
    act(() => result.current.trigger('success'));
    
    expect(vibrateMock).toHaveBeenCalledWith([30, 50, 30]);
  });

  it('should not trigger when disabled', () => {
    const vibrateMock = jest.fn();
    Object.assign(navigator, { vibrate: vibrateMock });
    
    const { result } = renderHook(() => useHaptics());
    act(() => result.current.setEnabled(false));
    act(() => result.current.trigger('success'));
    
    expect(vibrateMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Write useConfetti test**

```typescript
// src/__tests__/hooks/useConfetti.test.ts
import { renderHook, act } from '@testing-library/react';
import { useConfetti } from '@/hooks/useConfetti';

describe('useConfetti', () => {
  it('should start inactive', () => {
    const { result } = renderHook(() => useConfetti());
    expect(result.current.active).toBe(false);
  });

  it('should activate on trigger', () => {
    const { result } = renderHook(() => useConfetti());
    act(() => result.current.trigger('lesson-complete'));
    expect(result.current.active).toBe(true);
  });

  it('should stop on stop call', () => {
    const { result } = renderHook(() => useConfetti());
    act(() => result.current.trigger('lesson-complete'));
    act(() => result.current.stop());
    expect(result.current.active).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
bun run test -- --run src/__tests__/hooks/useHaptics.test.ts src/__tests__/hooks/useConfetti.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/hooks/useHaptics.test.ts src/__tests__/hooks/useConfetti.test.ts
git commit -m "test: add tests for haptics and confetti hooks"
```

---

## Task 7: Final Integration & Polish

**Files:**
- Modify: `src/styles/tiimo-theme.css`
- Modify: `src/app/layout.tsx` (add providers)

- [ ] **Step 1: Ensure providers wrap app**

Add ConfettiProvider and verify SubjectBackground integration in layout.

- [ ] **Step 2: Add final CSS polish**

Add any missing gradient transition animations and ensure reduced-motion support.

- [ ] **Step 3: Run lint check**

```bash
bun run lint:fix
```

- [ ] **Step 4: Final commit**

```bash
git add -A && git commit -m "feat: complete animation and feedback system"
```

---

## Verification Checklist

- [ ] Subject backgrounds render for all 9 subjects
- [ ] Gradient shimmer animation runs smoothly at 60fps
- [ ] Confetti triggers on lesson completion
- [ ] Confetti particles clean up after animation
- [ ] Haptics fire on mobile devices
- [ ] Haptics gracefully fail on desktop (no errors)
- [ ] Reduced motion preference disables animations
- [ ] Settings toggle persists haptic preference
- [ ] Tests pass
- [ ] No lint errors
