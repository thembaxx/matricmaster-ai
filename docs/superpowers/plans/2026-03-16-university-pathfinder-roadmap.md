# University Pathfinder Roadmap Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan.

**Goal:** Create an AI-driven roadmap for target universities with topic prioritization, milestones, and mini-goals that contribute to APS.

**Architecture:**
- Extend universityTargets with required subjects and recommended study paths
- Create AI service to generate personalized study roadmaps
- Generate "Mini-Goals" tied to APS improvement
- Connect roadmap to Study Plan and Curriculum Map

**Tech Stack:** Next.js 16, PostgreSQL (Drizzle), React, Gemini AI, shadcn/ui

---

## File Structure

- **Modify:** `src/lib/db/schema.ts` - Add roadmap fields to universityTargets
- **Create:** `src/services/universityPathfinder.ts` - AI-driven roadmap generation
- **Create:** `src/components/Dashboard/UniversityPathfinderCard.tsx` - New dashboard card
- **Create:** `src/components/StudyPlan/RoadmapView.tsx` - Visual roadmap component
- **Modify:** `src/screens/Dashboard.tsx` - Add Pathfinder card

---

## Chunk 1: Schema & Data Models

### Task 1: Extend universityTargets with roadmap data

**Files:**
- Modify: `src/lib/db/schema.ts`

- [ ] **Step 1: Add roadmap fields to universityTargets table**

```typescript
// In the universityTargets table, add these fields:
{
  // ... existing fields
  requiredSubjects: text('required_subjects'), // JSON array of required subjects
  recommendedStudyPath: text('recommended_study_path'), // JSON of prioritized topics
  roadMapGeneratedAt: timestamp('roadmap_generated_at'),
  lastMilestoneId: varchar('last_milestone_id', { length: 50 }),
}

// Create new table for milestones
export const apsMilestones = pgTable(
  'aps_milestones',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    universityTargetId: uuid('university_target_id')
      .references(() => universityTargets.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    subject: varchar('subject', { length: 50 }),
    topic: varchar('topic', { length: 100 }),
    apsPotentialPoints: integer('aps_potential_points').notNull().default(1), // How much APS this can add
    status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, in_progress, completed
    completedAt: timestamp('completed_at'),
    dueDate: timestamp('due_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('aps_milestones_user_id_idx').on(table.userId),
    statusIdx: index('aps_milestones_status_idx').on(table.status),
  })
);

export const apsMilestonesRelations = relations(apsMilestones, ({ one }) => ({
  user: one(users, { fields: [apsMilestones.userId], references: [users.id] }),
  universityTarget: one(universityTargets, { 
    fields: [apsMilestones.universityTargetId], 
    references: [universityTargets.id] 
  }),
}));
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat: add roadmap fields and milestones table"
```

---

## Chunk 2: University Pathfinder Service

### Task 2: Create AI-driven roadmap generation service

**Files:**
- Create: `src/services/universityPathfinder.ts`

- [ ] **Step 1: Create the University Pathfinder service**

```typescript
import { generateObject } from 'ai';
import { geminiModel } from '@/services/geminiService';
import { getDb } from '@/lib/db';
import { universityTargets, apsMilestones } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface StudyMilestone {
  title: string;
  description: string;
  subject: string;
  topic: string;
  apsPotentialPoints: number;
  estimatedHours: number;
}

interface UniversityPath {
  targetUniversity: string;
  targetFaculty: string;
  currentAps: number;
  targetAps: number;
  gap: number;
  prioritizedSubjects: string[];
  milestones: StudyMilestone[];
  weeklyPlan: Array<{
    week: number;
    focusSubject: string;
    topics: string[];
    targetMilestones: string[];
  }>;
}

const SOUTH_AFRICAN_UNIVERSITIES = {
  'University of Cape Town': {
    'Engineering': { minAps: 42, required: ['Mathematics', 'Physical Sciences'], recommended: ['Calculus', 'Mechanics', 'Electricity'] },
    'Health Sciences': { minAps: 45, required: ['Mathematics', 'Physical Sciences', 'Life Sciences'], recommended: ['Chemistry', 'Biology'] },
    'Commerce': { minAps: 38, required: ['Mathematics'], recommended: ['Accounting', 'Economics'] },
  },
  'University of Pretoria': {
    'Engineering': { minAps: 40, required: ['Mathematics', 'Physical Sciences'], recommended: ['Calculus', 'Mechanics'] },
    'Medicine': { minAps: 43, required: ['Mathematics', 'Physical Sciences', 'Life Sciences'], recommended: ['Biochemistry'] },
  },
  'Wits': {
    'Engineering': { minAps: 42, required: ['Mathematics', 'Physical Sciences'], recommended: ['Calculus', 'Physics'] },
    'Health Sciences': { minAps: 44, required: ['Mathematics', 'Physical Sciences', 'Life Sciences'], recommended: [] },
  },
  'Stellenbosch University': {
    'Engineering': { minAps: 38, required: ['Mathematics', 'Physical Sciences'], recommended: ['Math', 'Physics'] },
  },
};

// Generate AI-driven roadmap
export async function generateUniversityPath(
  userId: string,
  universityName: string,
  faculty: string,
  currentAps: number,
  currentStrengths: string[], // Subjects user is good at
  weakTopics: Array<{ subject: string; topic: string }>
): Promise<UniversityPath> {
  const uniRequirements = SOUTH_AFRICAN_UNIVERSITIES[universityName]?.[faculty];
  
  if (!uniRequirements) {
    throw new Error(`Unknown university/faculty: ${universityName}/${faculty}`);
  }
  
  const targetAps = uniRequirements.minAps;
  const gap = targetAps - currentAps;
  
  // Generate roadmap using Gemini
  const prompt = `
Generate a study roadmap for a South African NSC student targeting ${universityName} - ${faculty}.

Current Status:
- Current APS: ${currentAps}
- Target APS: ${targetAps}
- APS Gap: ${gap}
- Strong subjects: ${currentStrengths.join(', ') || 'None specified'}
- Weak topics: ${weakTopics.map(t => `${t.subject}: ${t.topic}`).join(', ') || 'None specified'}

Required subjects for this program: ${uniRequirements.required.join(', ')}

Generate a detailed roadmap with:
1. Prioritized subjects to focus on (ranked by APS impact)
2. 5-8 specific milestones that each contribute to APS improvement
3. A 12-week study plan

For each milestone, include:
- Title (actionable, e.g., "Master Calculus Derivatives")
- Subject
- Specific topic
- APS potential (1-3 points)
- Estimated hours needed

Return as JSON with this structure:
{
  "prioritizedSubjects": ["Mathematics", "Physical Sciences", ...],
  "milestones": [
    {
      "title": "string",
      "description": "string", 
      "subject": "string",
      "topic": "string",
      "apsPotentialPoints": number,
      "estimatedHours": number
    }
  ],
  "weeklyPlan": [
    {
      "week": 1,
      "focusSubject": "string",
      "topics": ["string"],
      "targetMilestones": ["string"]
    }
  ]
}
`;

  const { object } = await generateObject({
    model: geminiModel,
    schema: z.object({
      prioritizedSubjects: z.array(z.string()),
      milestones: z.array(z.object({
        title: z.string(),
        description: z.string(),
        subject: z.string(),
        topic: z.string(),
        apsPotentialPoints: z.number(),
        estimatedHours: z.number(),
      })),
      weeklyPlan: z.array(z.object({
        week: z.number(),
        focusSubject: z.string(),
        topics: z.array(z.string()),
        targetMilestones: z.array(z.string()),
      })),
    }),
    prompt,
  });
  
  return {
    targetUniversity: universityName,
    targetFaculty: faculty,
    currentAps,
    targetAps,
    gap,
    prioritizedSubjects: object.prioritizedSubjects,
    milestones: object.milestones,
    weeklyPlan: object.weeklyPlan,
  };
}

// Save roadmap to database
export async function saveRoadmapToDatabase(
  userId: string,
  universityTargetId: string,
  roadmap: UniversityPath
): Promise<void> {
  const db = await getDb();
  
  // Save milestones
  for (const milestone of roadmap.milestones) {
    await db.insert(apsMilestones).values({
      userId,
      universityTargetId,
      title: milestone.title,
      description: milestone.description,
      subject: milestone.subject,
      topic: milestone.topic,
      apsPotentialPoints: milestone.apsPotentialPoints,
      status: 'pending',
    });
  }
  
  // Update university target with generated timestamp
  await db.update(universityTargets)
    .set({ roadMapGeneratedAt: new Date() })
    .where(eq(universityTargets.id, universityTargetId));
}

// Get user's active roadmap
export async function getUserRoadmap(userId: string) {
  const db = await getDb();
  
  const activeTarget = await db.query.universityTargets.findFirst({
    where: and(
      eq(universityTargets.userId, userId),
      eq(universityTargets.isActive, true)
    ),
  });
  
  if (!activeTarget) return null;
  
  const milestones = await db.query.apsMilestones.findMany({
    where: eq(apsMilestones.userId, userId),
  });
  
  return {
    target: activeTarget,
    milestones,
    completedCount: milestones.filter(m => m.status === 'completed').length,
    totalMilestones: milestones.length,
    potentialApsGain: milestones
      .filter(m => m.status !== 'completed')
      .reduce((sum, m) => sum + m.apsPotentialPoints, 0),
  };
}

// Mark milestone as complete
export async function completeMilestone(milestoneId: string): Promise<void> {
  const db = await getDb();
  await db.update(apsMilestones)
    .set({ 
      status: 'completed',
      completedAt: new Date(),
    })
    .where(eq(apsMilestones.id, milestoneId));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/universityPathfinder.ts
git commit -m "feat: add University Pathfinder AI service"
```

---

## Chunk 3: UI Components

### Task 3: Create UniversityPathfinderCard component

**Files:**
- Create: `src/components/Dashboard/UniversityPathfinderCard.tsx`

- [ ] **Step 1: Create the Pathfinder card component**

```typescript
'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import { TargetIcon, CheckCircle2, Circle, TrendingUp, SparklesIcon } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Map01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UniversityPathfinderDialog } from './UniversityPathfinderDialog';

interface UniversityPathfinderCardProps {
  universityName?: string;
  faculty?: string;
  currentAps: number;
  targetAps: number;
  completedMilestones?: number;
  totalMilestones?: number;
  potentialApsGain?: number;
  onGenerateRoadmap?: () => void;
}

export function UniversityPathfinderCard({
  universityName = 'No target set',
  faculty = '',
  currentAps = 0,
  targetAps = 42,
  completedMilestones = 0,
  totalMilestones = 0,
  potentialApsGain = 0,
  onGenerateRoadmap,
}: UniversityPathfinderCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  
  const progress = totalMilestones > 0 
    ? (completedMilestones / totalMilestones) * 100 
    : 0;
  
  const apsGap = targetAps - currentAps;
  
  if (!universityName || universityName === 'No target set') {
    return (
      <m.div
        whileHover={{ y: -4 }}
        className="tiimo-card p-6 relative group overflow-hidden"
      >
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-tiimo-lavender/10 rounded-full blur-2xl" />
        
        <div className="flex items-start gap-4">
          <div className="p-3 bg-tiimo-lavender/10 rounded-xl">
            <HugeiconsIcon icon={Map01Icon} className="w-6 h-6 text-tiimo-lavender" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg">University Pathfinder</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Set your university goal to get a personalized study roadmap
            </p>
            
            <Button 
              onClick={() => setShowDialog(true)}
              className="mt-4 bg-tiimo-lavender hover:bg-tiimo-lavender/90"
            >
              <SparklesIcon className="w-4 h-4 mr-2" />
              Set Goal & Generate Roadmap
            </Button>
          </div>
        </div>
        
        <UniversityPathfinderDialog open={showDialog} onOpenChange={setShowDialog} />
      </m.div>
    );
  }
  
  return (
    <m.div
      whileHover={{ y: -4 }}
      className="tiimo-card p-6 relative group overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-tiimo-lavender/10 rounded-full blur-2xl" />
      
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-tiimo-lavender/10 rounded-xl">
            <HugeiconsIcon icon={Map01Icon} className="w-6 h-6 text-tiimo-lavender" />
          </div>
          
          <div>
            <h3 className="font-bold text-lg">University Pathfinder</h3>
            <p className="text-sm text-muted-foreground">
              {universityName} • {faculty}
            </p>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" onClick={() => setShowDialog(true)}>
          View
          <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-1" />
        </Button>
      </div>
      
      <div className="mt-6 space-y-4">
        {/* APS Progress */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">APS Progress</span>
          <span className="font-bold">
            {currentAps} <span className="text-muted-foreground">/ {targetAps}</span>
          </span>
        </div>
        
        <Progress value={Math.min((currentAps / targetAps) * 100, 100)} className="h-2" />
        
        <p className="text-xs text-muted-foreground">
          {apsGap > 0 
            ? `${apsGap} more points needed to reach your goal`
            : '🎉 You\'ve reached your APS target!'}
        </p>
        
        {/* Milestones Progress */}
        {totalMilestones > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="flex items-center gap-2">
                <TargetIcon className="w-4 h-4 text-tiimo-lavender" />
                Milestones
              </span>
              <span className="font-bold">
                {completedMilestones}/{totalMilestones}
              </span>
            </div>
            
            <Progress value={progress} className="h-1.5" />
            
            {potentialApsGain > 0 && (
              <p className="text-xs text-tiimo-green mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Complete all milestones for +{potentialApsGain} APS potential
              </p>
            )}
          </div>
        )}
      </div>
      
      <UniversityPathfinderDialog 
        open={showDialog} 
        onOpenChange={setShowDialog}
        initialUniversity={universityName}
        initialFaculty={faculty}
      />
    </m.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Dashboard/UniversityPathfinderCard.tsx
git commit -m "feat: add University Pathfinder card component"
```

---

### Task 4: Create UniversityPathfinderDialog component

**Files:**
- Create: `src/components/Dashboard/UniversityPathfinderDialog.tsx`

- [ ] **Step 1: Create the dialog component**

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { generateUniversityPath, saveRoadmapToDatabase } from '@/services/universityPathfinder';
import { useRouter } from 'next/navigation';

interface UniversityPathfinderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUniversity?: string;
  initialFaculty?: string;
}

const UNIVERSITIES = [
  'University of Cape Town',
  'University of Pretoria',
  'University of the Witwatersrand',
  'Stellenbosch University',
  'University of Johannesburg',
  'University of KwaZulu-Natal',
  'University of the Free State',
  'University of the Western Cape',
];

const FACULTIES: Record<string, string[]> = {
  'University of Cape Town': ['Engineering', 'Health Sciences', 'Commerce', 'Science', 'Arts'],
  'University of Pretoria': ['Engineering', 'Medicine', 'Commerce', 'Science'],
  'University of the Witwatersrand': ['Engineering', 'Health Sciences', 'Commerce', 'Science'],
  'Stellenbosch University': ['Engineering', 'Medicine', 'Commerce', 'Science'],
  'University of Johannesburg': ['Engineering', 'Health Sciences', 'Commerce'],
  'University of KwaZulu-Natal': ['Engineering', 'Health Sciences', 'Commerce'],
  'University of the Free State': ['Engineering', 'Health Sciences', 'Commerce'],
  'University of the Western Cape': ['Dentistry', 'Science', 'Arts'],
};

export function UniversityPathfinderDialog({
  open,
  onOpenChange,
  initialUniversity,
  initialFaculty,
}: UniversityPathfinderDialogProps) {
  const router = useRouter();
  const [university, setUniversity] = useState(initialUniversity || '');
  const [faculty, setFaculty] = useState(initialFaculty || '');
  const [loading, setLoading] = useState(false);
  
  const faculties = UNIVERSITIES.includes(university) ? FACULTIES[university] : [];
  
  const handleGenerate = async () => {
    if (!university || !faculty) return;
    
    setLoading(true);
    try {
      // TODO: Get actual userId and current data
      const roadmap = await generateUniversityPath(
        'user-id', // TODO: Get from auth
        university,
        faculty,
        32, // TODO: Get current APS
        ['English'], // TODO: Get from user data
        [] // TODO: Get weak topics
      );
      
      // Save to database
      // TODO: Get universityTargetId
      
      // Show success
      onOpenChange(false);
      router.push('/study-plan?view=roadmap');
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set University Goal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">University</label>
            <Select value={university} onValueChange={setUniversity}>
              <SelectTrigger>
                <SelectValue placeholder="Select university" />
              </SelectTrigger>
              <SelectContent>
                {UNIVERSITIES.map((uni) => (
                  <SelectItem key={uni} value={uni}>
                    {uni}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Faculty</label>
            <Select 
              value={faculty} 
              onValueChange={setFaculty}
              disabled={!university}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select faculty" />
              </SelectTrigger>
              <SelectContent>
                {faculties.map((fac) => (
                  <SelectItem key={fac} value={fac}>
                    {fac}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {university && faculty && (
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">
                This will generate a personalized study roadmap with milestones 
                to help you reach your {university} goal.
              </p>
            </div>
          )}
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={!university || !faculty || loading}
            >
              {loading ? 'Generating...' : 'Generate Roadmap'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Dashboard/UniversityPathfinderDialog.tsx
git commit -m "feat: add University Pathfinder dialog"
```

---

## Chunk 4: Integration

### Task 5: Add Pathfinder card to Dashboard

**Files:**
- Modify: `src/screens/Dashboard.tsx`

- [ ] **Step 1: Import the new component**

```typescript
import { UniversityPathfinderCard } from '@/components/Dashboard/UniversityPathfinderCard';
```

- [ ] **Step 2: Replace or add to the dashboard grid**

In the dashboard grid where UniversityGoalCard appears, add UniversityPathfinderCard:

```tsx
{/* Replace UniversityGoalCard with UniversityPathfinderCard */}
<UniversityPathfinderCard
  universityName="University of Cape Town"
  faculty="BSc Computer Science"
  currentAps={32}
  targetAps={42}
  completedMilestones={2}
  totalMilestones={8}
  potentialApsGain={5}
/>
```

- [ ] **Step 3: Commit**

```bash
git add src/screens/Dashboard.tsx
git commit -m "feat: add University Pathfinder to dashboard"
```

---

## Verification

- [ ] Test university selection in dialog
- [ ] Verify AI roadmap generation (with mock data)
- [ ] Check milestone display on dashboard card
- [ ] Test milestone completion flow
- [ ] Verify APS progress message updates

---

## Future Enhancements (Out of Scope)

- Full APS engine integration (see separate plan)
- Calendar integration for milestones
- Push notifications for milestone deadlines
- Group/friend leaderboards for roadmap progress
- AI tutor integration for milestone topics
