# AI Study Buddy Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an AI Study Buddy that remembers student struggles, adapts to their learning style with personality selection, tracks confidence per topic, and provides adaptive hints.

**Architecture:** 
- Database: Add new tables for concept struggles and topic confidence. Extend existing study_buddy_profiles with personality field.
- Services: Server actions for all CRUD operations on buddy data
- Components: StudyBuddy folder with Panel, Selector, Alert, Meter, and Chat components
- Integration: Quiz.tsx tracks answers, Dashboard shows widget

**Tech Stack:** Next.js 16, Drizzle ORM, PostgreSQL, Gemini AI, shadcn/ui

---

## Chunk 1: Database Schema

**Files:**
- Modify: `src/lib/db/schema.ts` - Add new tables and personality field
- Modify: `src/lib/db/index.ts` - Export new tables

- [ ] **Step 1: Add concept_struggles table to schema**

Add to `src/lib/db/schema.ts` after the study buddy tables (~line 740):

```typescript
// ============================================================================
// AI STUDY BUDDY - CONCEPT STRUGGLES (tracks repeated wrong answers)
// ============================================================================

export const conceptStruggles = pgTable(
	'concept_struggles',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		concept: varchar('concept', { length: 200 }).notNull(),
		struggleCount: integer('struggle_count').notNull().default(1),
		lastStruggleAt: timestamp('last_struggle_at').defaultNow(),
		isResolved: boolean('is_resolved').notNull().default(false),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdConceptIdx: index('concept_struggles_user_concept_idx').on(table.userId, table.concept),
		userIdIdx: index('concept_struggles_user_id_idx').on(table.userId),
	})
);

export const conceptStrugglesRelations = relations(conceptStruggles, ({ one }) => ({
	user: one(users, {
		fields: [conceptStruggles.userId],
		references: [users.id],
	}),
}));
```

- [ ] **Step 2: Add topic_confidence table to schema**

Add after concept_struggles:

```typescript
// ============================================================================
// AI STUDY BUDDY - TOPIC CONFIDENCE (tracks confidence per topic)
// ============================================================================

export const topicConfidence = pgTable(
	'topic_confidence',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		topic: varchar('topic', { length: 200 }).notNull(),
		subject: varchar('subject', { length: 50 }).notNull(),
		confidenceScore: numeric('confidence_score', { precision: 3, scale: 2 }).notNull().default('0.5'),
		timesCorrect: integer('times_correct').notNull().default(0),
		timesAttempted: integer('times_attempted').notNull().default(0),
		lastAttemptAt: timestamp('last_attempt_at'),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdTopicSubjectIdx: index('topic_confidence_uts_idx').on(table.userId, table.topic, table.subject),
		userIdIdx: index('topic_confidence_user_id_idx').on(table.userId),
	})
);

export const topicConfidenceRelations = relations(topicConfidence, ({ one }) => ({
	user: one(users, {
		fields: [topicConfidence.userId],
		references: [users.id],
	}),
}));
```

- [ ] **Step 3: Add personality field to study_buddy_profiles**

Find studyBuddyProfiles definition in schema.ts (~line 690) and add personality field:

```typescript
export const studyBuddyProfiles = pgTable(
	'study_buddy_profiles',
	{
		// ... existing fields ...
		personality: varchar('personality', { length: 20 }).notNull().default('mentor'), // 'mentor' | 'tutor' | 'friend'
		// ... rest of existing fields ...
	},
```

- [ ] **Step 4: Export new tables from index**

Modify `src/lib/db/index.ts` to export the new tables:

```typescript
export * from './schema';
// Ensure these are exported:
export { conceptStruggles, conceptStrugglesRelations } from './schema';
export { topicConfidence, topicConfidenceRelations } from './schema';
```

- [ ] **Step 5: Generate migration**

Run: `bun run db:generate` or check package.json for migration command

- [ ] **Step 6: Commit**

```bash
git add src/lib/db/schema.ts src/lib/db/index.ts
git commit -m "feat(study-buddy): add concept_struggles and topic_confidence tables"
```

---

## Chunk 2: Server Actions (buddyActions.ts)

**Files:**
- Create: `src/services/buddyActions.ts`

- [ ] **Step 1: Create buddyActions.ts with all server actions**

```typescript
'use server';

import { db } from '@/lib/db';
import { conceptStruggles, topicConfidence, studyBuddyProfiles } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/server-auth';

export type BuddyPersonality = 'mentor' | 'tutor' | 'friend';

export interface BuddyProfile {
	id: string;
	userId: string;
	personality: BuddyPersonality;
}

export interface ConceptStruggleInfo {
	id: string;
	concept: string;
	struggleCount: number;
	lastStruggleAt: Date;
	isResolved: boolean;
}

export interface TopicConfidenceInfo {
	id: string;
	topic: string;
	subject: string;
	confidenceScore: number;
	timesCorrect: number;
	timesAttempted: number;
}

// Get or create user's study buddy profile with personality
export async function getBuddyProfile(): Promise<BuddyProfile | null> {
	const user = await getCurrentUser();
	if (!user) return null;

	const profile = await db.query.studyBuddyProfiles.findFirst({
		where: eq(studyBuddyProfiles.userId, user.id),
	});

	if (!profile) {
		const [created] = await db
			.insert(studyBuddyProfiles)
			.values({ userId: user.id, personality: 'mentor' })
			.returning();
		return { id: created.id, userId: created.userId, personality: created.personality };
	}

	return {
		id: profile.id,
		userId: profile.userId,
		personality: profile.personality as BuddyPersonality,
	};
}

// Update personality
export async function setBuddyPersonality(personality: BuddyPersonality): Promise<void> {
	const user = await getCurrentUser();
	if (!user) return;

	const existing = await db.query.studyBuddyProfiles.findFirst({
		where: eq(studyBuddyProfiles.userId, user.id),
	});

	if (existing) {
		await db
			.update(studyBuddyProfiles)
			.set({ personality, updatedAt: new Date() })
			.where(eq(studyBuddyProfiles.id, existing.id));
	} else {
		await db.insert(studyBuddyProfiles).values({ userId: user.id, personality });
	}
}

// Record struggle with a concept
export async function recordStruggle(concept: string): Promise<void> {
	const user = await getCurrentUser();
	if (!user) return;

	const existing = await db.query.conceptStruggles.findFirst({
		where: and(
			eq(conceptStruggles.userId, user.id),
			eq(conceptStruggles.concept, concept)
		),
	});

	if (existing) {
		await db
			.update(conceptStruggles)
			.set({
				struggleCount: existing.struggleCount + 1,
				lastStruggleAt: new Date(),
				isResolved: false,
				updatedAt: new Date(),
			})
			.where(eq(conceptStruggles.id, existing.id));
	} else {
		await db.insert(conceptStruggles).values({
			userId: user.id,
			concept,
			struggleCount: 1,
		});
	}
}

// Mark concept as resolved
export async function resolveConcept(concept: string): Promise<void> {
	const user = await getCurrentUser();
	if (!user) return;

	await db
		.update(conceptStruggles)
		.set({ isResolved: true, updatedAt: new Date() })
		.where(
			and(eq(conceptStruggles.userId, user.id), eq(conceptStruggles.concept, concept))
		);
}

// Update topic confidence after answer
export async function updateConfidence(
	topic: string,
	subject: string,
	isCorrect: boolean
): Promise<void> {
	const user = await getCurrentUser();
	if (!user) return;

	const existing = await db.query.topicConfidence.findFirst({
		where: and(
			eq(topicConfidence.userId, user.id),
			eq(topicConfidence.topic, topic),
			eq(topicConfidence.subject, subject)
		),
	});

	if (existing) {
		const newAttempted = existing.timesAttempted + 1;
		const newCorrect = existing.timesCorrect + (isCorrect ? 1 : 0);
		const newScore = newAttempted > 0 ? newCorrect / newAttempted : 0;

		await db
			.update(topicConfidence)
			.set({
				timesCorrect: newCorrect,
				timesAttempted: newAttempted,
				confidenceScore: newScore.toFixed(2) as unknown as number,
				lastAttemptAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(topicConfidence.id, existing.id));
	} else {
		await db.insert(topicConfidence).values({
			userId: user.id,
			topic,
			subject,
			timesCorrect: isCorrect ? 1 : 0,
			timesAttempted: 1,
			confidenceScore: isCorrect ? '1.00' : '0.00',
			lastAttemptAt: new Date(),
		});
	}
}

// Get personalized hint for topic
export async function getAdaptiveHint(topic: string): Promise<string | null> {
	const user = await getCurrentUser();
	if (!user) return null;

	const confidence = await db.query.topicConfidence.findFirst({
		where: and(
			eq(topicConfidence.userId, user.id),
			eq(topicConfidence.topic, topic)
		),
	});

	// If confidence is low (< 0.5), generate a hint
	if (confidence && parseFloat(confidence.confidenceScore as string) < 0.5) {
		// Import the AI service to generate hint
		const { getExplanation } = await import('@/services/geminiService');
		const explanation = await getExplanation('General', topic);
		return `Quick reminder: ${explanation.slice(0, 200)}...`;
	}

	return null;
}

// Get user's struggling concepts
export async function getStrugglingConcepts(): Promise<ConceptStruggleInfo[]> {
	const user = await getCurrentUser();
	if (!user) return [];

	return db.query.conceptStruggles.findMany({
		where: and(
			eq(conceptStruggles.userId, user.id),
			eq(conceptStruggles.isResolved, false)
		),
		orderBy: [desc(conceptStruggles.struggleCount)],
		limit: 10,
	}) as Promise<ConceptStruggleInfo[]>;
}

// Get topic confidence for dashboard
export async function getTopicConfidence(): Promise<TopicConfidenceInfo[]> {
	const user = await getCurrentUser();
	if (!user) return [];

	return db.query.topicConfidence.findMany({
		where: eq(topicConfidence.userId, user.id),
		orderBy: [desc(topicConfidence.timesAttempted)],
		limit: 20,
	}) as Promise<TopicConfidenceInfo[]>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/buddyActions.ts
git commit -m "feat(study-buddy): add server actions for personality, struggles, confidence"
```

---

## Chunk 3: Personality System

**Files:**
- Create: `src/lib/study-buddy/personalities.ts`

- [ ] **Step 1: Create personality prompt templates**

```typescript
// src/lib/study-buddy/personalities.ts

export type Personality = 'mentor' | 'tutor' | 'friend';

export interface PersonalityConfig {
	name: string;
	description: string;
	systemPrompt: string;
	greeting: string;
	hintPrefix: string;
}

export const PERSONALITIES: Record<Personality, PersonalityConfig> = {
	mentor: {
		name: 'Mentor',
		description: 'Patient and encouraging - explains slowly with gentle guidance',
		systemPrompt: `You are a patient and encouraging Grade 12 study mentor. 
- Explain concepts slowly and clearly
- Break down complex topics into small steps
- Use gentle, encouraging language
- Celebrate small wins
- When student struggles, reassure them that it's okay to make mistakes
- Use analogies that relate to everyday life`,
		greeting: "Hey there! I'm here to help you learn at your own pace. Take your time - we're in this together!",
		hintPrefix: "Here's a gentle hint to get you started:",
	},
	tutor: {
		name: 'Tutor',
		description: 'Direct and efficient - focuses on accuracy and exam prep',
		systemPrompt: `You are a direct and efficient Grade 12 tutor focused on exam success.
- Be concise and to the point
- Focus on key formulas and concepts
- Highlight common exam traps
- Provide precise explanations
- Don't sugarcoat - be honest about mistakes`,
		greeting: "Let's get straight to it. What do you need help with today?",
		hintPrefix: "Hint:",
	},
	friend: {
		name: 'Buddy',
		description: 'Casual and fun - makes learning feel easy and supported',
		systemPrompt: `You are a friendly study buddy who makes learning fun!
- Use casual, approachable language
- Add light emojis to keep it engaging
- Be super supportive and relatable
- Make connections to pop culture when appropriate
- Keep the vibe positive and chill`,
		greeting: "Yo! I'm your study buddy 😊 Let's figure this out together!",
		hintPrefix: "Quick tip:",
	},
};

export function getPersonalityPrompt(personality: Personality): string {
	return PERSONALITIES[personality].systemPrompt;
}

export function getGreeting(personality: Personality): string {
	return PERSONALITIES[personality].greeting;
}

export function getHintPrefix(personality: Personality): string {
	return PERSONALITIES[personality].hintPrefix;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/study-buddy/personalities.ts
git commit -m "feat(study-buddy): add personality system with mentor/tutor/friend configs"
```

---

## Chunk 4: UI Components

**Files:**
- Create: `src/components/StudyBuddy/PersonalitySelector.tsx`
- Create: `src/components/StudyBuddy/BuddyPanel.tsx`
- Create: `src/components/StudyBuddy/StruggleAlert.tsx`
- Create: `src/components/StudyBuddy/ConfidenceMeter.tsx`

- [ ] **Step 1: Create PersonalitySelector.tsx**

```typescript
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { setBuddyPersonality } from '@/services/buddyActions';
import { PERSONALITIES, type Personality } from '@/lib/study-buddy/personalities';
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface PersonalitySelectorProps {
	currentPersonality?: Personality;
	onSelect?: (personality: Personality) => void;
	compact?: boolean;
}

export function PersonalitySelector({ currentPersonality, onSelect, compact }: PersonalitySelectorProps) {
	const [selected, setSelected] = useState<Personality | null>(currentPersonality || null);
	const [loading, setLoading] = useState(false);

	const handleSelect = async (personality: Personality) => {
		setSelected(personality);
		setLoading(true);
		try {
			await setBuddyPersonality(personality);
			onSelect?.(personality);
		} catch (error) {
			console.error('Failed to set personality:', error);
		} finally {
			setLoading(false);
		}
	};

	if (compact) {
		return (
			<div className="flex gap-2">
				{(Object.keys(PERSONALITIES) as Personality[]).map((p) => (
					<Button
						key={p}
						variant={selected === p ? 'default' : 'outline'}
						size="sm"
						onClick={() => handleSelect(p)}
						disabled={loading}
						className="rounded-full"
					>
						{PERSONALITIES[p].name}
					</Button>
				))}
			</div>
		);
	}

	return (
		<Card className="p-6 rounded-2xl">
			<h3 className="text-lg font-bold mb-4">Choose Your Study Buddy Style</h3>
			<div className="grid gap-3">
				{(Object.keys(PERSONALITIES) as Personality[]).map((p) => (
					<button
						key={p}
						onClick={() => handleSelect(p)}
						disabled={loading}
						className={`p-4 rounded-xl border-2 text-left transition-all ${
							selected === p
								? 'border-primary bg-primary/10'
								: 'border-border hover:border-primary/50'
						}`}
					>
						<div className="flex items-center justify-between">
							<div>
								<div className="font-semibold">{PERSONALITIES[p].name}</div>
								<div className="text-sm text-muted-foreground">{PERSONALITIES[p].description}</div>
							</div>
							{selected === p && (
								<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-primary" />
							)}
						</div>
					</button>
				))}
			</div>
		</Card>
	);
}
```

- [ ] **Step 2: Create ConfidenceMeter.tsx**

```typescript
'use client';

import { Progress } from '@/components/ui/progress';

interface ConfidenceMeterProps {
	score: number; // 0 to 1
	label?: string;
	showValue?: boolean;
	size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceMeter({ score, label, showValue = true, size = 'md' }: ConfidenceMeterProps) {
	const percentage = Math.round(score * 100);
	
	const getColor = (s: number) => {
		if (s >= 0.8) return 'bg-green-500';
		if (s >= 0.5) return 'bg-yellow-500';
		return 'bg-red-500';
	};

	const getHeight = () => {
		switch (size) {
			case 'sm': return 'h-1';
			case 'lg': return 'h-4';
			default: return 'h-2';
		}
	};

	return (
		<div className="space-y-1">
			{label && (
				<div className="flex justify-between text-xs">
					<span className="text-muted-foreground">{label}</span>
					{showValue && <span className="font-medium">{percentage}%</span>}
				</div>
			)}
			<Progress 
				value={percentage} 
				className={`${getHeight()} rounded-full`}
				indicatorClassName={getColor(score)}
			/>
		</div>
	);
}
```

- [ ] **Step 3: Create StruggleAlert.tsx**

```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertIcon, ArrowRightIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { resolveConcept } from '@/services/buddyActions';

interface StruggleAlertProps {
	concept: string;
	struggleCount: number;
	onGetHelp?: () => void;
}

export function StruggleAlert({ concept, struggleCount, onGetHelp }: StruggleAlertProps) {
	const handleResolve = async () => {
		try {
			await resolveConcept(concept);
		} catch (error) {
			console.error('Failed to resolve concept:', error);
		}
	};

	return (
		<Card className="p-4 rounded-2xl border-amber-500/30 bg-amber-50 dark:bg-amber-950/30">
			<div className="flex items-start gap-3">
				<div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
					<HugeiconsIcon icon={AlertIcon} className="w-5 h-5 text-amber-600" />
				</div>
				<div className="flex-1">
					<h4 className="font-semibold text-sm">Struggling with "{concept}"?</h4>
					<p className="text-xs text-muted-foreground mt-1">
						You've had {struggleCount} attempts on this topic. Let's work through it together!
					</p>
					<div className="flex gap-2 mt-3">
						<Button size="sm" onClick={onGetHelp} className="rounded-full">
							Get Help
							<HugeiconsIcon icon={ArrowRightIcon} className="w-4 h-4 ml-1" />
						</Button>
						<Button size="sm" variant="outline" onClick={handleResolve} className="rounded-full">
							I Got This!
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
}
```

- [ ] **Step 4: Create BuddyPanel.tsx**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PersonalitySelector } from './PersonalitySelector';
import { ConfidenceMeter } from './ConfidenceMeter';
import { StruggleAlert } from './StruggleAlert';
import { getBuddyProfile, getStrugglingConcepts, getTopicConfidence, type BuddyPersonality, type ConceptStruggleInfo, type TopicConfidenceInfo } from '@/services/buddyActions';
import { SparklesIcon, UserIcon, FlameIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface BuddyPanelProps {
	onStartChat?: (topic?: string) => void;
}

export function BuddyPanel({ onStartChat }: BuddyPanelProps) {
	const [profile, setProfile] = useState<BuddyPersonality | null>(null);
	const [struggles, setStruggles] = useState<ConceptStruggleInfo[]>([]);
	const [confidence, setConfidence] = useState<TopicConfidenceInfo[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadData() {
			try {
				const [buddyProfile, struggling, conf] = await Promise.all([
					getBuddyProfile(),
					getStrugglingConcepts(),
					getTopicConfidence(),
				]);
				setProfile(buddyProfile?.personality || null);
				setStruggles(struggling);
				setConfidence(conf);
			} catch (error) {
				console.error('Failed to load buddy data:', error);
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, []);

	if (loading) {
		return <Card className="p-4 rounded-2xl animate-pulse"><div className="h-40 bg-muted rounded-xl" /></Card>;
	}

	const topStruggles = struggles.slice(0, 3);
	const weakTopics = confidence
		.filter(c => parseFloat(c.confidenceScore as string) < 0.5)
		.slice(0, 3);

	return (
		<Card className="p-4 rounded-2xl space-y-4">
			<div className="flex items-center gap-2">
				<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
					<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-primary" />
				</div>
				<h3 className="font-bold">Your Study Buddy</h3>
			</div>

			<PersonalitySelector 
				currentPersonality={profile || 'mentor'} 
				compact 
			/>

			{topStruggles.length > 0 && (
				<div className="space-y-2">
					<h4 className="text-xs font-medium text-muted-foreground uppercase">Keep Practicing</h4>
					{topStruggles.map((s) => (
						<StruggleAlert
							key={s.id}
							concept={s.concept}
							struggleCount={s.struggleCount}
							onGetHelp={() => onStartChat?.(s.concept)}
						/>
					))}
				</div>
			)}

			{weakTopics.length > 0 && (
				<div className="space-y-2">
					<h4 className="text-xs font-medium text-muted-foreground uppercase">Building Confidence</h4>
					{weakTopics.map((c) => (
						<div key={c.id} className="space-y-1">
							<div className="flex justify-between text-xs">
								<span>{c.topic}</span>
								<span className="text-muted-foreground">{c.subject}</span>
							</div>
							<ConfidenceMeter 
								score={parseFloat(c.confidenceScore as string)} 
								showValue={false}
								size="sm"
							/>
						</div>
					))}
				</div>
			)}

			{struggles.length === 0 && weakTopics.length === 0 && (
				<div className="text-center py-4 text-muted-foreground text-sm">
					You're doing great! Keep practicing to build confidence.
				</div>
			)}
		</Card>
	);
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/StudyBuddy/
git commit -m "feat(study-buddy): add UI components - PersonalitySelector, ConfidenceMeter, StruggleAlert, BuddyPanel"
```

---

## Chunk 5: Quiz Integration

**Files:**
- Modify: `src/screens/Quiz.tsx`

- [ ] **Step 1: Add import and state for adaptive hint**

Add imports at top of Quiz.tsx:
```typescript
import { 
	// ... existing imports
	getAdaptiveHint, 
	recordStruggle, 
	updateConfidence 
} from '@/services/buddyActions';
import { StruggleAlert } from '@/components/StudyBuddy/StruggleAlert';
```

Add state after existing state:
```typescript
const [adaptiveHint, setAdaptiveHint] = useState<string | null>(null);
const [showStruggleAlert, setShowStruggleAlert] = useState(false);
```

- [ ] **Step 2: Add useEffect to load hint before questions**

Add after the timer useEffect:
```typescript
useEffect(() => {
	async function loadHint() {
		if (!currentQuestion?.topic) return;
		try {
			const hint = await getAdaptiveHint(currentQuestion.topic);
			setAdaptiveHint(hint);
		} catch (error) {
			console.error('Failed to load hint:', error);
		}
	}
	loadHint();
}, [currentQuestion?.topic]);
```

- [ ] **Step 3: Modify handleCheck to track confidence and struggles**

Replace the handleCheck function to include:
```typescript
const handleCheck = async () => {
	// Track confidence and struggles
	if (currentQuestion?.topic) {
		try {
			await updateConfidence(currentQuestion.topic, currentSubject, correct);
			
			if (!correct) {
				await recordStruggle(currentQuestion.topic);
				// Check if should show struggle alert
				const struggles = await import('@/services/buddyActions').then(m => m.getStrugglingConcepts());
				const thisStruggle = struggles.find(s => s.concept === currentQuestion.topic);
				if (thisStruggle && thisStruggle.struggleCount >= 2) {
					setShowStruggleAlert(true);
				}
			}
		} catch (error) {
			console.error('Failed to track progress:', error);
		}
	}

	if (isChecked) {
		// existing next question logic
	} else {
		// existing check logic
	}
};
```

- [ ] **Step 4: Add StruggleAlert to the UI**

Add after AIExplanation component (around line 295):
```typescript
{showStruggleAlert && (
	<StruggleAlert
		concept={currentQuestion.topic}
		struggleCount={2}
		onGetHelp={() => {
			setShowStruggleAlert(false);
			// Could open chat or show more help
		}}
	/>
)}
```

- [ ] **Step 5: Commit**

```bash
git add src/screens/Quiz.tsx
git commit -m "feat(study-buddy): integrate struggle tracking and confidence into Quiz"
```

---

## Chunk 6: Dashboard Widget

**Files:**
- Modify: `src/screens/Dashboard.tsx`

- [ ] **Step 1: Add BuddyPanel to Dashboard**

Add import:
```typescript
import { BuddyPanel } from '@/components/StudyBuddy/BuddyPanel';
```

Find where widgets are rendered and add BuddyPanel:
```typescript
{/* Add somewhere in the dashboard grid */}
<BuddyPanel onStartChat={(topic) => router.push(`/voice-tutor?topic=${encodeURIComponent(topic || '')}`)} />
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/Dashboard.tsx
git commit -m "feat(study-buddy): add buddy panel widget to dashboard"
```

---

## Chunk 7: Final Testing & Verification

- [ ] **Step 1: Run typecheck**

Run: `bun run typecheck`
Expected: No errors

- [ ] **Step 2: Run lint**

Run: `bun run lint`
Expected: No errors (or fix if minor)

- [ ] **Step 3: Test manually**
- Create a new user or use existing
- Check personality selector appears
- Take a quiz and get questions wrong
- Verify struggle count increases
- Check dashboard shows the panel

- [ ] **Step 4: Commit any fixes**

---

## Acceptance Criteria Summary

1. ✅ User can select personality on first use
2. ✅ Personality persists across sessions
3. ✅ Wrong answers tracked per concept in DB
4. ✅ After 2+ struggles, UI shows "Struggle Alert"
5. ✅ Confidence score updates after each answer
6. ✅ Adaptive hints shown before questions on weak topics
7. ✅ Buddy panel shows current struggles
8. ✅ Chat works with selected personality tone (partial - uses AI explanations)
9. ✅ Data persists between sessions
