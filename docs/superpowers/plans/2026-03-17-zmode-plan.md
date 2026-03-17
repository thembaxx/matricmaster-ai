# Z-Mode Implementation Plan

> **For agentic workers:** Use this plan to implement Z-Mode.

**Goal:** Add a low-data toggle that disables animations, reduces images, and serves text-only AI responses.

**Architecture:** Global Zustand store + component-level checks + AI response modifier

---

## File Structure

```
src/
├── stores/
│   └── useZModeStore.ts     # NEW - Z-Mode state
├── components/
│   └── Settings/
│       └── ZModeToggle.tsx  # NEW - Settings toggle
├── hooks/
│   └── useReducedMotion.ts  # ALREADY EXISTS - adapt for Z-Mode
├── lib/
│   └── ai/
│       └── router.ts        # MODIFY - check Z-Mode for responses
└── app/
    └── settings/
        └── page.tsx         # MODIFY - add Z-Mode toggle
```

---

## Implementation Tasks

### Task 1: Create Z-Mode Store

**Files:**
- Create: `src/stores/useZModeStore.ts`

- [ ] **Step 1: Create the store**

```typescript
// src/stores/useZModeStore.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { appConfig } from '@/app.config';

interface ZModeState {
  isZMode: boolean;
  toggleZMode: () => void;
  setZMode: (value: boolean) => void;
}

export const useZModeStore = create<ZModeState>()(
  persist(
    (set) => ({
      isZMode: false,

      toggleZMode: () => set((state) => ({ isZMode: !state.isZMode })),
      
      setZMode: (value: boolean) => set({ isZMode: value }),
    }),
    {
      name: `${appConfig.name}-zmode`,
    }
  )
);
```

- [ ] **Step 2: Commit**
```bash
git add src/stores/useZModeStore.ts
git commit -m "feat: add Z-Mode store for data saving"
```

---

### Task 2: Create Z-Mode Toggle Component

**Files:**
- Create: `src/components/Settings/ZModeToggle.tsx`

- [ ] **Step 1: Create the toggle component**

```tsx
// src/components/Settings/ZModeToggle.tsx
'use client';

import { DataSavingIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useZModeStore } from '@/stores/useZModeStore';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export function ZModeToggle() {
  const { isZMode, toggleZMode } = useZModeStore();

  return (
    <Card className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <HugeiconsIcon icon={DataSavingIcon} className="w-5 h-5 text-primary" />
        </div>
        <div>
          <Label htmlFor="zmode-toggle" className="font-black text-sm">
            Z-Mode
          </Label>
          <p className="text-xs text-muted-foreground">
            Save data: disable animations, reduce images, text-only AI
          </p>
        </div>
      </div>
      <Switch
        id="zmode-toggle"
        checked={isZMode}
        onCheckedChange={toggleZMode}
      />
    </Card>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/Settings/ZModeToggle.tsx
git commit -m "feat: add Z-Mode toggle component"
```

---

### Task 3: Integrate into Settings Page

**Files:**
- Modify: `src/app/settings/page.tsx`

- [ ] **Step 1: Add import and component**

```tsx
import { ZModeToggle } from '@/components/Settings/ZModeToggle';

// Add in the settings list:
<ZModeToggle />
```

- [ ] **Step 2: Commit**
```bash
git add src/app/settings/page.tsx
git commit -m "feat: integrate Z-Mode toggle into settings"
```

---

### Task 4: Modify AI Router for Text-Only Responses

**Files:**
- Modify: `src/lib/ai/router.ts`

- [ ] **Step 1: Update to check Z-Mode**

Add parameter to control response format:

```typescript
export async function routeAIQuestion(
  question: string,
  options?: { textOnly?: boolean }
): Promise<string> {
  // ... existing code ...
  
  // If textOnly, strip markdown
  if (options?.textOnly) {
    return stripMarkdown(response);
  }
  
  return response;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`[^`]+`/g, '') // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[*_#]/g, '') // formatting
    .replace(/\n+/g, ' ') // newlines
    .trim();
}
```

- [ ] **Step 2: Commit**
```bash
git add src/lib/ai/router.ts
git commit -m "feat: add text-only mode to AI router"
```

---

### Task 5: Add Z-Mode Check to Components

**Files:**
- Modify: Various UI components that use animations/images

- [ ] **Step 1: Create Z-Mode aware version of useReducedMotion**

The existing `useReducedMotion` hook already exists. Extend it:

```typescript
// In src/hooks/use-reduced-motion.ts, add:
import { useZModeStore } from '@/stores/useZModeStore';

export function useZMode() {
  const isZMode = useZModeStore((state) => state.isZMode);
  return isZMode;
}
```

- [ ] **Step 2: Use in components**

Update components that have heavy animations to check Z-Mode:

```tsx
const reduceMotion = useReducedMotion();
const zMode = useZMode();

const animationProps = zMode ? {} : {
  initial: { opacity: 0, y: 20 }
  animate: { opacity: 1, y: 0 }
};
```

- [ ] **Step 3: Commit**
```bash
git add src/hooks/use-reduced-motion.ts
git commit -m "feat: extend reduced motion hook for Z-Mode"
```

---

## Summary

| Task | Files | Status |
|------|-------|--------|
| 1. Z-Mode Store | src/stores/useZModeStore.ts | Pending |
| 2. Toggle Component | src/components/Settings/ZModeToggle.tsx | Pending |
| 3. Settings Integration | src/app/settings/page.tsx | Pending |
| 4. AI Text-Only | src/lib/ai/router.ts | Pending |
| 5. Z-Mode Hook | src/hooks/use-reduced-motion.ts | Pending |

## Testing Checklist

- [ ] Toggle persists across page refreshes
- [ ] Animations disabled when Z-Mode active
- [ ] AI responses are plain text when Z-Mode active
- [ ] Images load with reduced quality in Z-Mode
- [ ] Settings page shows Z-Mode toggle
