# Animation & Feedback System - Design Spec

**Date:** 2026-03-18  
**Status:** Approved  
**Type:** Feature Enhancement

---

## Overview

Add three interconnected systems to Lumni-AI that enhance the learning experience through visual delight and tactile feedback:

1. **Dynamic Subject Backgrounds** - Animated gradient backgrounds that change based on the active subject
2. **Micro-interactions** - Rewarding confetti animations for achievements and milestones
3. **Haptic Feedback** - Mobile device vibration patterns for interactions

---

## 1. Dynamic Subject Backgrounds

### Concept
Subtle, animated gradient backgrounds that reinforce the learning context. Each NSC subject has a unique color palette that shifts subtly over time.

### Subject Color Palettes

| Subject | Primary | Secondary | Accent |
|---------|---------|-----------|--------|
| Mathematics | `#667eea` | `#764ba2` | `#a855f7` |
| Physics | `#11998e` | `#38ef7d` | `#34d399` |
| Chemistry | `#fc4a1a` | `#f7b733` | `#fb923c` |
| Life Sciences | `#56ab2f` | `#a8e063` | `#84cc16` |
| English | `#c9d6ff` | `#e2e2e2` | `#94a3b8` |
| Geography | `#8e2de2` | `#4a00e0` | `#a855f7` |
| History | `#cb2d3e` | `#ef473a` | `#f87171` |
| Accounting | `#0f4c75` | `#3282b8` | `#60a5fa` |
| Economics | `#f59e0b` | `#d97706` | `#fbbf24` |

### Animation Behavior

- **Gradient Shimmer**: A diagonal light sweep (45deg) with `rgba(255,255,255,0.15)` opacity
- **Duration**: 4-6 seconds per cycle, infinite loop
- **Position**: Fixed overlay at 10-15% opacity so it doesn't interfere with content
- **Transition**: When subject changes, gradient cross-fades over 500ms

### Implementation

```css
.subject-bg {
  background: linear-gradient(135deg, var(--subject-primary), var(--subject-secondary));
  position: relative;
}

.subject-bg::before {
  content: '';
  position: absolute;
  inset: -50%;
  background: linear-gradient(
    45deg, 
    transparent 40%, 
    rgba(255,255,255,0.15) 50%, 
    transparent 60%
  );
  animation: shimmer 4s linear infinite;
  pointer-events: none;
}
```

### Accessibility
- Respects `prefers-reduced-motion` - static gradient when enabled
- Content contrast must maintain WCAG AA (4.5:1) on all backgrounds
- User can disable in settings

---

## 2. Micro-interactions: Confetti System

### Triggers
| Event | Confetti Style | Particle Count | Duration |
|-------|---------------|----------------|----------|
| Lesson Complete | Subject colors | 50 | 2s |
| Quiz Perfect Score | Gold + subject | 100 | 3s |
| Streak Milestone (7, 14, 30 days) | Fire colors | 75 | 2.5s |
| First Lesson of Day | Subject colors | 30 | 1.5s |

### Animation Specs
- **Easing**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (easeOutQuart)
- **Gravity**: Simulated with CSS, Y-axis acceleration
- **Rotation**: Random 0-720deg per particle
- **Colors**: 5 colors from subject palette
- **Shapes**: Mix of rectangles (70%) and circles (30%)
- **Size**: 6-12px width, 6-10px height

### Implementation
Use `@/components/ui/Confetti.tsx` component with Framer Motion:

```tsx
<Confetti
  active={trigger}
  colors={subjectColors}
  particleCount={50}
  duration={2000}
/>
```

### Streak Fire Variant
For streak milestones, add flame icon that:
- Scales from 1x to 1.3x with spring animation
- Emits 5-8 ember particles (small orange/red circles)
- Displays streak count below

---

## 3. Haptic Feedback System

### Vibration Patterns
| Action | Pattern | Duration | Intensity |
|--------|---------|----------|-----------|
| Button Tap | `[10]` | 10ms | Light |
| Selection Change | `[15]` | 15ms | Light |
| Success/Complete | `[30, 50, 30]` | 110ms total | Medium |
| Achievement/Confetti | `[50, 100, 50, 100, 100]` | 400ms total | Strong |

### Implementation
```ts
// @/hooks/useHaptics.ts
export const useHaptics = () => {
  const trigger = (pattern: number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  return {
    light: () => trigger([10]),
    medium: () => trigger([30, 50, 30]),
    heavy: () => trigger([50, 100, 50, 100, 100]),
  };
};
```

### Settings Integration
- Default: Enabled on mobile, disabled on desktop
- User toggle in Settings > Accessibility
- Respects system-level haptic preferences

---

## Technical Architecture

### New Files

```
src/
├── components/
│   └── ui/
│       ├── Confetti.tsx          # Confetti particle system
│       ├── SubjectBackground.tsx  # Dynamic gradient wrapper
│       └── HapticProvider.tsx    # Haptic context provider
├── hooks/
│   ├── useHaptics.ts             # Haptic feedback hook
│   ├── useConfetti.ts            # Confetti trigger hook
│   └── useSubjectGradient.ts     # Subject-aware gradient hook
├── lib/
│   └── animations.ts            # Animation variants & configs
└── styles/
    └── animations.css            # CSS keyframes for gradients
```

### Integration Points

1. **AppLayout.tsx** - Wrap content with `SubjectBackground` component
2. **LessonComplete** - Trigger confetti via `useConfetti()`
3. **StreakCounter** - Trigger fire variant + heavy haptic
4. **Button components** - Integrate light haptic on press
5. **Settings** - Add haptic toggle to accessibility section

---

## Testing Checklist

- [ ] Gradient renders correctly for all 9 subjects
- [ ] Gradient transition is smooth (no flicker)
- [ ] Confetti triggers on lesson completion
- [ ] Confetti cleans up after animation (no memory leak)
- [ ] Haptics fire on mobile devices
- [ ] Haptics gracefully degrade on desktop (no errors)
- [ ] Reduced motion preference is respected
- [ ] Performance: 60fps maintained during animations
- [ ] Battery: < 5% additional drain during active use

---

## Dependencies

No new npm packages required. Uses:
- `framer-motion` (already installed)
- CSS animations (no library)
- Web Vibration API (native, no polyfill needed)

---

## File Changes

| File | Change |
|------|--------|
| `src/styles/tiimo-theme.css` | Add gradient animation keyframes |
| `src/components/ui/` | Add Confetti, SubjectBackground components |
| `src/hooks/` | Add useHaptics, useConfetti hooks |
| `src/components/Layout/AppLayout.tsx` | Integrate SubjectBackground |
| `src/constants/subjects.ts` | Add gradient colors to subject config |
| `src/app/settings/page.tsx` | Add haptic toggle |

---

## Success Metrics

- User reports feeling "rewarded" for achievements
- Reduced bounce rate on lesson completion screens
- > 80% of mobile users keep haptics enabled
- No performance regression on low-end devices
