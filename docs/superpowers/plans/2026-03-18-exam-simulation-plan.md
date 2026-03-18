# Exam Simulation - Focus Mode Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement exam focus mode that hides all UI distractions, integrates with existing timer, and soft-blocks AI features until exam completion.

**Architecture:** Use React Context (FocusModeProvider) to manage exam session state. Full-screen overlay layout that conditionally hides AppLayout components. Hook to check focus state before allowing AI access.

**Tech Stack:** React Context, existing exam-timer, existing AI components

---

## File Structure

### New Files
- `src/contexts/FocusModeContext.tsx` - Exam session state management
- `src/components/FocusMode/FocusLayout.tsx` - Full-screen focus overlay
- `src/components/FocusMode/AIFeatureBlock.tsx` - Blocked AI tooltip component
- `src/components/FocusMode/ExamCompleteModal.tsx` - Completion screen

### Modified Files
- `src/components/Layout/ClientProviders.tsx` - Add FocusModeProvider
- `src/app/exam-timer/page.tsx` - Add "Start Focus Mode" button
- `src/components/AI/*.tsx` - Block AI features when focus active
- `src/components/Layout/AppLayout.tsx` - Hide when focus mode active

---

## Task 1: Focus Mode Context

**Files:**
- Create: `src/contexts/FocusModeContext.tsx`
- Modify: `src/components/Layout/ClientProviders.tsx`
- Test: Manual verification

- [ ] **Step 1: Create FocusModeContext.tsx**

```typescript
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type FocusModeState = 'inactive' | 'active' | 'completed';

interface FocusModeContextType {
	state: FocusModeState;
	isFocusMode: boolean;
	startFocusMode: () => void;
	endFocusMode: () => void;
	completeExam: () => void;
}

const FocusModeContext = createContext<FocusModeContextType>({
	state: 'inactive',
	isFocusMode: false,
	startFocusMode: () => {},
	endFocusMode: () => {},
	completeExam: () => {},
});

export function FocusModeProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<FocusModeState>('inactive');

	const startFocusMode = useCallback(() => {
		setState('active');
	}, []);

	const endFocusMode = useCallback(() => {
		setState('inactive');
	}, []);

	const completeExam = useCallback(() => {
		setState('completed');
	}, []);

	return (
		<FocusModeContext.Provider
			value={{
				state,
				isFocusMode: state === 'active',
				startFocusMode,
				endFocusMode,
				completeExam,
			}}
		>
			{children}
		</FocusModeContext.Provider>
	);
}

export const useFocusMode = () => useContext(FocusModeContext);
```

- [ ] **Step 2: Add FocusModeProvider to ClientProviders**

In `src/components/Layout/ClientProviders.tsx`:
```typescript
import { FocusModeProvider } from '@/contexts/FocusModeContext';

// Wrap children with FocusModeProvider
<FocusModeProvider>
	<AppLayout>{children}</AppLayout>
</FocusModeProvider>
```

- [ ] **Step 3: Commit**
```
git add src/contexts/FocusModeContext.tsx src/components/Layout/ClientProviders.tsx
git commit -m "feat(exam): add focus mode context and provider"
```

---

## Task 2: Focus Layout Component

**Files:**
- Create: `src/components/FocusMode/FocusLayout.tsx`
- Modify: `src/app/exam-timer/page.tsx`
- Test: Verify full-screen mode works

- [ ] **Step 1: Create FocusLayout.tsx**

```typescript
'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { CloseIcon } from '@hugeicons/core-free-icons';
import { useFocusMode } from '@/contexts/FocusModeContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface FocusLayoutProps {
	children: React.ReactNode;
	timeRemaining: number;
	totalTime: number;
}

export function FocusLayout({ children, timeRemaining, totalTime }: FocusLayoutProps) {
	const { endFocusMode, completeExam } = useFocusMode();
	const router = useRouter();

	const progress = ((totalTime - timeRemaining) / totalTime) * 100;
	const isLowTime = timeRemaining < 600; // Less than 10 minutes

	const handleExit = () => {
		endFocusMode();
		router.push('/dashboard');
	};

	const handleComplete = () => {
		completeExam();
	};

	// Timer at 0 = exam complete
	if (timeRemaining === 0) {
		handleComplete();
	}

	return (
		<div className="fixed inset-0 z-[100] bg-background">
			{/* Timer Bar */}
			<div className="fixed top-0 left-0 right-0 h-12 bg-secondary flex items-center px-4 gap-4">
				<div className="flex-1 h-2 bg-primary/20 rounded-full overflow-hidden">
					<div
						className={`h-full transition-all duration-1000 ${
							isLowTime ? 'bg-red-500' : 'bg-primary'
						}`}
						style={{ width: `${progress}%` }}
					/>
				</div>
				<span className={`font-mono text-lg ${isLowTime ? 'text-red-500' : ''}`}>
					{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
				</span>
				<Button variant="ghost" size="sm" onClick={handleExit}>
					<HugeiconsIcon icon={CloseIcon} className="w-4 h-4" />
				</Button>
			</div>

			{/* Content */}
			<div className="pt-12 h-full overflow-auto">
				{children}
			</div>
		</div>
	);
}
```

- [ ] **Step 2: Update exam-timer to support focus mode**

In `src/app/exam-timer/page.tsx`, add a "Start Focus Mode" button:

```typescript
import { useFocusMode } from '@/contexts/FocusModeContext';

// In component:
const { startFocusMode, isFocusMode } = useFocusMode();

// Add button after "Start" button:
<Button 
	onClick={() => startFocusMode()} 
	disabled={isRunning}
	className="ml-2"
>
	Focus Mode
</Button>
```

- [ ] **Step 3: Commit**
```
git add src/components/FocusMode/FocusLayout.tsx src/app/exam-timer/page.tsx
git commit -m "feat(exam): add focus layout and integrate with timer"
```

---

## Task 3: AI Feature Blocking

**Files:**
- Create: `src/components/FocusMode/AIFeatureBlock.tsx`
- Modify: Key AI components
- Test: Verify AI blocked during focus

- [ ] **Step 1: Create AIFeatureBlock.tsx**

```typescript
'use client';

import { LockIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFocusMode } from '@/contexts/FocusModeContext';

interface AIFeatureBlockProps {
	children: React.ReactNode;
	featureName?: string;
}

export function AIFeatureBlock({ children, featureName = 'AI Feature' }: AIFeatureBlockProps) {
	const { isFocusMode, state } = useFocusMode();

	if (!isFocusMode || state === 'completed') {
		return <>{children}</>;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="relative cursor-not-allowed opacity-50">
					{children}
					<div className="absolute inset-0 flex items-center justify-center">
						<HugeiconsIcon icon={LockIcon} className="w-4 h-4" />
					</div>
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<p className="flex items-center gap-2">
					<HugeiconsIcon icon={LockIcon} className="w-4 h-4" />
					Focus Mode Active
					<br />
					Available after exam ends
				</p>
			</TooltipContent>
		</Tooltip>
	);
}
```

- [ ] **Step 2: Create useAIAccess hook**

```typescript
// src/hooks/useAIAccess.ts
import { useFocusMode } from '@/contexts/FocusModeContext';

export function useAIAccess() {
	const { isFocusMode, state } = useFocusMode();
	
	return {
		canAccessAI: !isFocusMode || state === 'completed',
		isBlocked: isFocusMode && state !== 'completed',
	};
}
```

- [ ] **Step 3: Add blocking to key AI components**

In `src/components/AI/AIPrompt.tsx`:
```typescript
import { useAIAccess } from '@/hooks/useAIAccess';

export function AIPrompt() {
	const { canAccessAI, isBlocked } = useAIAccess();
	
	if (isBlocked) {
		return (
			<div className="p-4 text-center text-muted-foreground">
				Focus Mode Active - AI available after exam
			</div>
		);
	}
	// existing component
}
```

- [ ] **Step 4: Commit**
```
git add src/components/FocusMode/ src/hooks/useAIAccess.ts
git commit -m "feat(exam): add AI blocking during focus mode"
```

---

## Task 4: Exam Complete Screen

**Files:**
- Create: `src/components/FocusMode/ExamCompleteModal.tsx`
- Test: Verify completion screen

- [ ] **Step 1: Create ExamCompleteModal.tsx**

```typescript
'use client';

import { CheckmarkCircle02Icon, EmojiReactionIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useFocusMode } from '@/contexts/FocusModeContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function ExamCompleteModal() {
	const { state, endFocusMode } = useFocusMode();
	const router = useRouter();

	if (state !== 'completed') return null;

	const handleReview = () => {
		endFocusMode();
		// Navigate to review
	};

	const handleExit = () => {
		endFocusMode();
		router.push('/dashboard');
	};

	return (
		<div className="fixed inset-0 z-[100] bg-background/95 flex items-center justify-center">
			<div className="text-center space-y-6 max-w-md">
				<div className="inline-flex items-center justify-center p-4 rounded-full bg-green-100 dark:bg-green-900">
					<HugeiconsIcon
						icon={CheckmarkCircle02Icon}
						className="w-12 h-12 text-green-600 dark:text-green-400"
					/>
				</div>
				
				<h1 className="text-3xl font-bold">Exam Complete!</h1>
				<p className="text-muted-foreground">
					Great job! You can now review your answers with AI assistance.
				</p>

				<div className="flex gap-4 justify-center">
					<Button onClick={handleReview}>
						Review Answers
					</Button>
					<Button variant="outline" onClick={handleExit}>
						Exit Focus Mode
					</Button>
				</div>
			</div>
		</div>
	);
}
```

- [ ] **Step 2: Add to AppLayout or FocusLayout**

Add `<ExamCompleteModal />` to the app so it renders when state is 'completed'.

- [ ] **Step 3: Commit**
```
git add src/components/FocusMode/ExamCompleteModal.tsx
git commit -m "feat(exam): add exam completion screen"
```

---

## Task 5: Integration & Final Touches

**Files:**
- Modify: `src/app/exam-timer/page.tsx`
- Test: Full flow

- [ ] **Step 1: Wire up timer to auto-complete exam**

When timer reaches 0 in focus mode, trigger completion:
```typescript
useEffect(() => {
	if (isRunning && timeRemaining === 0 && isFocusMode) {
		completeExam();
	}
}, [timeRemaining, isRunning, isFocusMode]);
```

- [ ] **Step 2: Test the complete flow**
1. Open exam timer
2. Select preset, click "Focus Mode"
3. Verify full-screen, hidden UI
4. Try to access AI features - should see blocked state
5. Wait for timer or click "Exit Focus Mode"
6. If timer ends, see completion screen

- [ ] **Step 3: Run typecheck and lint**
```
bun run typecheck
bun run lint
```

- [ ] **Step 4: Final commit**
```
git add -A
git commit -m "feat(exam): implement focus mode exam simulation"
```

---

## Summary

This plan implements:
1. FocusModeContext for exam session state
2. FocusLayout full-screen overlay
3. AI feature blocking with tooltips
4. Exam completion screen

**Estimated total tasks:** 5 major tasks, ~15 steps
