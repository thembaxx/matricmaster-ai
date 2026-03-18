# Deep Personalization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Growth Map (visual weakness chart) and Adaptive Schedule (auto-reschedule when goals missed/struggling) for South African NSC students.

**Architecture:** Use existing mistake tracking and questionAttempts schema. Create new components for Growth Map visualization and adaptive scheduling service. Use Recharts for visualization.

**Tech Stack:** Recharts, existing DB schema, Zustand for state

---

## File Structure

### New Files
- `src/components/Dashboard/GrowthMap.tsx` - Visual weakness chart component
- `src/lib/adaptive-schedule.ts` - Service for detecting missed goals and rescheduling
- `src/components/Dashboard/AdaptiveScheduleBanner.tsx` - Notification when schedule adapts

### Modified Files
- `src/screens/Dashboard.tsx` - Add GrowthMap component
- `src/lib/db/study-plan-actions.ts` - Add adaptive scheduling functions

---

## Task 1: Growth Map Component

**Files:**
- Create: `src/components/Dashboard/GrowthMap.tsx`
- Modify: `src/screens/Dashboard.tsx`
- Test: Visual verification

- [ ] **Step 1: Create GrowthMap.tsx component**

```typescript
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface WeaknessData {
	topic: string;
	mistakeCount: number;
	subject: string;
}

interface GrowthMapProps {
	data: WeaknessData[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

export function GrowthMap({ data }: GrowthMapProps) {
	const sortedData = [...data]
		.sort((a, b) => b.mistakeCount - a.mistakeCount)
		.slice(0, 8);

	if (sortedData.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				No weakness data yet. Complete some quizzes to see your Growth Map.
			</div>
		);
	}

	return (
		<div className="h-64">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={sortedData} layout="vertical" margin={{ left: 100 }}>
					<XAxis type="number" hide />
					<YAxis
						type="category"
						dataKey="topic"
						width={100}
						tick={{ fontSize: 12 }}
					/>
					<Tooltip
						content={({ active, payload }) => {
							if (active && payload && payload.length) {
								const item = payload[0].payload;
								return (
									<div className="bg-background border rounded-lg p-2 shadow-lg">
										<p className="font-medium">{item.topic}</p>
										<p className="text-sm text-muted-foreground">
											{item.mistakeCount} mistakes
										</p>
									</div>
								);
							}
							return null;
						}}
					/>
					<Bar dataKey="mistakeCount" radius={[0, 4, 4, 0]}>
						{sortedData.map((_, index) => (
							<Cell
								key={`cell-${index}`}
								fill={COLORS[index % COLORS.length]}
							/>
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
```

- [ ] **Step 2: Add API route for weakness data**

Create `src/app/api/growth-map/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { questionAttempts, questions } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

export async function GET(request: Request) {
	const auth = await getAuth();
	const session = await auth.api.getSession({ headers: request.headers });
	
	if (!session?.user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	await dbManager.initialize();
	const db = dbManager.getDb();

	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const mistakeCounts = await db
		.select({
			topic: questions.topic,
			subject: questions.subject,
			mistakeCount: sql<number>`count(*)::int`,
		})
		.from(questionAttempts)
		.innerJoin(questions, eq(questions.id, questionAttempts.questionId))
		.where(
			and(
				eq(questionAttempts.userId, session.user.id),
				eq(questionAttempts.isCorrect, false),
				gte(questionAttempts.attemptedAt, thirtyDaysAgo)
			)
		)
		.groupBy(questions.topic, questions.subject)
		.orderBy(sql`count(*) desc`)
		.limit(10);

	return NextResponse.json(mistakeCounts);
}
```

- [ ] **Step 3: Add GrowthMap to Dashboard**

In `src/screens/Dashboard.tsx`, add:
```typescript
import { GrowthMap } from '@/components/Dashboard/GrowthMap';

// Add state for weakness data:
// const [weaknessData, setWeaknessData] = useState<WeaknessData[]>([]);

// Fetch on mount:
// useEffect(() => {
//   fetch('/api/growth-map')
//     .then(res => res.json())
//     .then(data => setWeaknessData(data));
// }, []);

// Add GrowthMap to render:
// {weaknessData.length > 0 && (
//   <GrowthMap data={weaknessData} />
// )}
```

- [ ] **Step 4: Commit**
```
git add src/components/Dashboard/GrowthMap.tsx src/app/api/growth-map/route.ts
git commit -m "feat(personalization): add Growth Map weakness visualization"
```

---

## Task 2: Adaptive Schedule Service

**Files:**
- Create: `src/lib/adaptive-schedule.ts`
- Modify: `src/lib/db/study-plan-actions.ts`
- Test: Manual verification

- [ ] **Step 1: Create adaptive-schedule.ts**

```typescript
import { dbManager } from '@/lib/db';
import { calendarEvents, questionAttempts, questions } from '@/lib/db/schema';
import { eq, and, gte, sql, lt } from 'drizzle-orm';

const STRUGGLE_THRESHOLD = 0.6; // 60% score = struggling
const MISTAKE_COUNT_THRESHOLD = 3;

export interface ScheduleChange {
	originalEventId: string;
	newDate: Date;
	reason: 'missed_goal' | 'struggling_topic';
}

export async function detectMissedGoals(userId: string): Promise<string[]> {
	await dbManager.initialize();
	const db = dbManager.getDb();

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const missedEvents = await db
		.select({ id: calendarEvents.id })
		.from(calendarEvents)
		.where(
			and(
				eq(calendarEvents.userId, userId),
				eq(calendarEvents.completed, false),
				lt(calendarEvents.startTime, today)
			)
		);

	return missedEvents.map((e) => e.id);
}

export async function detectStrugglingTopics(userId: string): Promise<string[]> {
	await dbManager.initialize();
	const db = dbManager.getDb();

	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	const topicScores = await db
		.select({
			topic: questions.topic,
			totalAttempts: sql<number>`count(*)::int`,
			correctAttempts: sql<number>`count(case when ${questionAttempts.isCorrect} = true then 1 end)::int`,
		})
		.from(questionAttempts)
		.innerJoin(questions, eq(questions.id, questionAttempts.questionId))
		.where(
			and(
				eq(questionAttempts.userId, userId),
				gte(questionAttempts.attemptedAt, sevenDaysAgo)
			)
		)
		.groupBy(questions.topic);

	const strugglingTopics = topicScores
		.filter(
			(t) => t.totalAttempts >= 3 && t.correctAttempts / t.totalAttempts < STRUGGLE_THRESHOLD
		)
		.map((t) => t.topic);

	return strugglingTopics;
}

export async function rescheduleMissedGoals(userId: string): Promise<ScheduleChange[]> {
	const missedGoalIds = await detectMissedGoals(userId);
	
	if (missedGoalIds.length === 0) return [];

	await dbManager.initialize();
	const db = dbManager.getDb();

	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(9, 0, 0, 0);

	const changes: ScheduleChange[] = [];

	for (const eventId of missedGoalIds) {
		const event = await db.query.calendarEvents.findFirst({
			where: eq(calendarEvents.id, eventId),
		});

		if (event) {
			await db
				.update(calendarEvents)
				.set({
					startTime: tomorrow,
					endTime: new Date(tomorrow.getTime() + (event.endTime.getTime() - event.startTime.getTime())),
				})
				.where(eq(calendarEvents.id, eventId));

			changes.push({
				originalEventId: eventId,
				newDate: tomorrow,
				reason: 'missed_goal',
			});

			tomorrow.setDate(tomorrow.getDate() + 1);
		}
	}

	return changes;
}

export async function addExtraPracticeForStruggling(
	userId: string,
	topics: string[]
): Promise<number> {
	if (topics.length === 0) return 0;

	await dbManager.initialize();
	const db = dbManager.getDb();

	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(14, 0, 0, 0);

	let added = 0;
	for (const topic of topics.slice(0, 3)) {
		await db.insert(calendarEvents).values({
			userId,
			title: `Extra Practice: ${topic}`,
			description: `Auto-generated: You struggled with this topic recently`,
			startTime: tomorrow,
			endTime: new Date(tomorrow.getTime() + 30 * 60 * 1000),
			subject: 'general',
			eventType: 'practice',
			completed: false,
			recurring: false,
		});

		tomorrow.setHours(tomorrow.getHours() + 2);
		added++;
	}

	return added;
}
```

- [ ] **Step 2: Create adaptive schedule API route**

Create `src/app/api/adaptive-schedule/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { rescheduleMissedGoals, addExtraPracticeForStruggling, detectStrugglingTopics } from '@/lib/adaptive-schedule';

export async function POST(request: Request) {
	const auth = await getAuth();
	const session = await auth.api.getSession({ headers: request.headers });
	
	if (!session?.user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const rescheduleChanges = await rescheduleMissedGoals(session.user.id);
	const strugglingTopics = await detectStrugglingTopics(session.user.id);
	const extraPracticeAdded = await addExtraPracticeForStruggling(session.user.id, strugglingTopics);

	return NextResponse.json({
		rescheduledGoals: rescheduleChanges.length,
		extraPracticeAdded,
		strugglingTopics,
	});
}
```

- [ ] **Step 3: Commit**
```
git add src/lib/adaptive-schedule.ts src/app/api/adaptive-schedule/route.ts
git commit -m "feat(personalization): add adaptive schedule service"
```

---

## Task 3: Integration & Notifications

**Files:**
- Modify: `src/screens/Dashboard.tsx`
- Create: `src/components/Dashboard/AdaptiveScheduleBanner.tsx`
- Test: Manual verification

- [ ] **Step 1: Create AdaptiveScheduleBanner**

```typescript
'use client';

import { CalendarCheckIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface AdaptiveScheduleBannerProps {
	changes: {
		rescheduledGoals: number;
		extraPracticeAdded: number;
	};
}

export function AdaptiveScheduleBanner({ changes }: AdaptiveScheduleBannerProps) {
	if (changes.rescheduledGoals === 0 && changes.extraPracticeAdded === 0) {
		return null;
	}

	return (
		<div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
			<div className="flex items-start gap-3">
				<HugeiconsIcon icon={CalendarCheckIcon} className="w-5 h-5 text-blue-600 mt-0.5" />
				<div>
					<p className="font-medium text-blue-900 dark:text-blue-100">
						Your study plan has been adjusted
					</p>
					<p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
						{changes.rescheduledGoals > 0 && (
							<span>{changes.rescheduledGoals} missed goal(s) rescheduled. </span>
						)}
						{changes.extraPracticeAdded > 0 && (
							<span>{changes.extraPracticeAdded} extra practice session(s) added.</span>
						)}
					</p>
				</div>
			</div>
		</div>
	);
}
```

- [ ] **Step 2: Trigger adaptive schedule on dashboard load**

In Dashboard, add:
```typescript
// On mount, trigger adaptive schedule check
useEffect(() => {
	fetch('/api/adaptive-schedule', { method: 'POST' })
		.then(res => res.json())
		.then(data => {
			if (data.rescheduledGoals > 0 || data.extraPracticeAdded > 0) {
				setScheduleChanges(data);
			}
		})
		.catch(console.error);
}, []);

// Render banner if there were changes:
// {scheduleChanges && <AdaptiveScheduleBanner changes={scheduleChanges} />}
```

- [ ] **Step 3: Commit**
```
git add src/components/Dashboard/AdaptiveScheduleBanner.tsx
git commit -m "feat(personalization): add adaptive schedule notifications"
```

---

## Task 4: Final Verification

**Files:**
- Test: Full flow

- [ ] **Step 1: Test the complete flow**
1. Complete some quizzes with mistakes
2. Open Dashboard
3. Verify Growth Map shows topics with mistakes
4. Miss a scheduled study goal (or mock it)
5. Refresh dashboard
6. Verify schedule adaptation notification appears

- [ ] **Step 2: Run typecheck and lint**
```
bun run typecheck
bun run lint
```

- [ ] **Step 3: Final commit**
```
git add -A
git commit -m "feat(personalization): implement Growth Map and Adaptive Schedule"
```

---

## Summary

This plan implements:
1. **Growth Map** - Visual bar chart showing weakness topics from quiz mistakes
2. **Adaptive Schedule Service** - Detects missed goals and struggling topics
3. **Auto-Reschedule** - Moves missed goals to next available day
4. **Extra Practice** - Adds practice sessions for struggling topics
5. **Notification Banner** - Informs students of schedule changes

**Estimated total tasks:** 4 major tasks, ~12 steps
