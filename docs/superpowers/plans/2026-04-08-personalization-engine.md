# Personalization Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive personalization engine for MatricMaster that adapts learning content and difficulty based on user preferences and performance data.

**Architecture:** Extend existing database schema with personalization tables, create adaptive learning services, implement user preference management, and build React components for onboarding and personalized recommendations.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, PostgreSQL, React, shadcn/ui, Google Gemini AI

---

## Prerequisites
- Existing database schema with userProgress, topicMastery, and accessibility_preferences tables
- User authentication via better-auth
- Quiz system with questions and quizResults tables
- Next.js 16 with App Router

---

### Task 1: Extend Database Schema for Personalization

**Files:**
- Modify: `src/lib/db/schema.ts` (add personalization tables)
- Create: `src/lib/db/personalization-actions.ts` (CRUD operations)

**Context:** Extend the existing schema with tables for user learning preferences, adaptive learning metrics, and personalized study plans.

- [ ] **Step 1: Add user learning preferences table**

```typescript
// Add after topicMastery table in schema.ts
export const userLearningPreferences = pgTable(
  'user_learning_preferences',
  {
    userId: text('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    preferredDifficulty: varchar('preferred_difficulty', { length: 20 }).notNull().default('medium'),
    learningStyle: varchar('learning_style', { length: 20 }).notNull().default('visual'),
    preferredPace: varchar('preferred_pace', { length: 20 }).notNull().default('moderate'),
    sessionDuration: integer('session_duration').notNull().default(30), // minutes
    preferredSubjects: text('preferred_subjects'), // JSON array
    contentTypes: text('content_types'), // JSON array of preferred content types
    avoidTopics: text('avoid_topics'), // JSON array of topics to avoid
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  }
);
```

- [ ] **Step 2: Add adaptive learning metrics table**

```typescript
export const adaptiveLearningMetrics = pgTable(
  'adaptive_learning_metrics',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    subjectId: integer('subject_id')
      .references(() => subjects.id, { onDelete: 'set null' }),
    topic: varchar('topic', { length: 100 }),
    difficulty: varchar('difficulty', { length: 20 }).notNull(),
    performanceScore: numeric('performance_score', { precision: 5, scale: 2 }).notNull(),
    timeSpent: integer('time_spent').notNull(), // seconds
    correctAnswers: integer('correct_answers').notNull(),
    totalQuestions: integer('total_questions').notNull(),
    knowledgeGaps: text('knowledge_gaps'), // JSON array of identified gaps
    recommendedActions: text('recommended_actions'), // JSON array of recommendations
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('adaptive_metrics_user_id_idx').on(table.userId),
    subjectTopicIdx: index('adaptive_metrics_subject_topic_idx').on(table.subjectId, table.topic),
  })
);
```

- [ ] **Step 3: Add personalized study plans table**

```typescript
export const personalizedStudyPlans = pgTable(
  'personalized_study_plans',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    planName: varchar('plan_name', { length: 100 }).notNull(),
    description: text('description'),
    targetDate: timestamp('target_date'),
    subjects: text('subjects'), // JSON array
    weeklySchedule: text('weekly_schedule'), // JSON schedule
    currentPhase: varchar('current_phase', { length: 50 }),
    progressPercentage: numeric('progress_percentage', { precision: 5, scale: 2 }).default('0'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('study_plans_user_id_idx').on(table.userId),
    activeIdx: index('study_plans_active_idx').on(table.isActive),
  })
);
```

- [ ] **Step 4: Create personalization actions file**

Create `src/lib/db/personalization-actions.ts` with basic CRUD operations for the new tables.

- [ ] **Step 5: Run database migration**

Run `bun run db:push` to apply schema changes.

- [ ] **Step 6: Commit changes**

```bash
git add src/lib/db/schema.ts src/lib/db/personalization-actions.ts
git commit -m "feat: extend database schema for personalization engine"
```

---

### Task 2: Create Learning Profile Types and Utilities

**Files:**
- Modify: `src/types/learning-profile.ts` (extend existing types)
- Create: `src/types/personalization.ts` (new types)
- Create: `src/lib/personalization/profile-utils.ts` (utility functions)

**Context:** Extend the existing learning profile types and create utilities for profile management.

- [ ] **Step 1: Extend learning profile types**

Add new fields to existing `UserLearningProfile` interface in `src/types/learning-profile.ts`.

- [ ] **Step 2: Create personalization types**

Create `src/types/personalization.ts` with interfaces for adaptive learning, recommendations, etc.

- [ ] **Step 3: Create profile utilities**

Create `src/lib/personalization/profile-utils.ts` with functions to calculate learning metrics, update profiles, etc.

- [ ] **Step 4: Add profile validation**

Create Zod schemas for validating personalization data.

- [ ] **Step 5: Commit changes**

```bash
git add src/types/learning-profile.ts src/types/personalization.ts src/lib/personalization/profile-utils.ts
git commit -m "feat: create learning profile types and utilities"
```

---

### Task 3: Implement Adaptive Learning Algorithm Service

**Files:**
- Create: `src/lib/personalization/adaptive-learning.ts` (main algorithm)
- Create: `src/lib/personalization/recommendation-engine.ts` (recommendation logic)
- Create: `src/lib/personalization/difficulty-adjustment.ts` (difficulty logic)

**Context:** Create the core adaptive learning algorithm that analyzes user performance and generates recommendations.

- [ ] **Step 1: Implement mastery calculation**

Create functions to calculate topic mastery levels based on performance data.

- [ ] **Step 2: Implement knowledge gap identification**

Create logic to identify topics where users struggle based on performance patterns.

- [ ] **Step 3: Create recommendation engine**

Build logic to recommend next content based on current mastery, preferences, and gaps.

- [ ] **Step 4: Implement difficulty adjustment**

Create algorithm to adjust question difficulty based on user performance.

- [ ] **Step 5: Add spaced repetition logic**

Integrate spaced repetition principles for review scheduling.

- [ ] **Step 6: Create tests for algorithms**

Write unit tests for the adaptive learning functions.

- [ ] **Step 7: Commit changes**

```bash
git add src/lib/personalization/adaptive-learning.ts src/lib/personalization/recommendation-engine.ts src/lib/personalization/difficulty-adjustment.ts
git commit -m "feat: implement adaptive learning algorithm service"
```

---

### Task 4: Create User Onboarding Flow Components

**Files:**
- Create: `src/screens/Onboarding.tsx` (main onboarding screen)
- Create: `src/components/onboarding/LearningStyleQuiz.tsx` (learning style assessment)
- Create: `src/components/onboarding/PreferenceSetup.tsx` (preference setup)
- Create: `src/hooks/useOnboarding.ts` (onboarding logic)

**Context:** Build a comprehensive onboarding flow to capture initial user learning preferences.

- [ ] **Step 1: Create learning style quiz component**

Build interactive quiz to determine visual/auditory/kinesthetic preferences.

- [ ] **Step 2: Create preference setup component**

Build form for difficulty level, pace, subject preferences, etc.

- [ ] **Step 3: Create main onboarding screen**

Orchestrate the onboarding flow with progress tracking.

- [ ] **Step 4: Add onboarding hook**

Create hook to manage onboarding state and persistence.

- [ ] **Step 5: Integrate with user profile**

Connect onboarding data to user learning preferences.

- [ ] **Step 6: Add accessibility features**

Ensure onboarding is accessible and follows HIG guidelines.

- [ ] **Step 7: Commit changes**

```bash
git add src/screens/Onboarding.tsx src/components/onboarding/ src/hooks/useOnboarding.ts
git commit -m "feat: create user onboarding flow components"
```

---

### Task 5: Build Personalized Study Plan Generation

**Files:**
- Create: `src/lib/personalization/study-plan-generator.ts` (plan generation logic)
- Create: `src/screens/StudyPlanWizard.tsx` (plan creation UI)
- Create: `src/components/personalization/StudyPlanCard.tsx` (plan display)
- Modify: `src/lib/db/study-plan-actions.ts` (extend existing)

**Context:** Create system to generate personalized study plans based on user goals and performance.

- [ ] **Step 1: Create study plan generator**

Build algorithm to generate study plans based on user preferences and performance.

- [ ] **Step 2: Create plan creation wizard**

Build UI for users to customize generated study plans.

- [ ] **Step 3: Create plan display components**

Build components to show and manage study plans.

- [ ] **Step 4: Extend study plan database actions**

Add functions for personalized plan CRUD operations.

- [ ] **Step 5: Add plan progress tracking**

Implement logic to track and update plan progress.

- [ ] **Step 6: Create tests**

Write tests for study plan generation and progress tracking.

- [ ] **Step 7: Commit changes**

```bash
git add src/lib/personalization/study-plan-generator.ts src/screens/StudyPlanWizard.tsx src/components/personalization/StudyPlanCard.tsx src/lib/db/study-plan-actions.ts
git commit -m "feat: build personalized study plan generation"
```

---

### Task 6: Implement Dynamic Difficulty Adjustment

**Files:**
- Modify: `src/lib/personalization/difficulty-adjustment.ts` (enhance existing)
- Create: `src/hooks/useDynamicDifficulty.ts` (difficulty hook)
- Modify: `src/hooks/useQuestionManager.ts` (integrate difficulty)

**Context:** Implement real-time difficulty adjustment for quiz questions based on user performance.

- [ ] **Step 1: Enhance difficulty adjustment algorithm**

Improve the difficulty adjustment logic with more sophisticated metrics.

- [ ] **Step 2: Create dynamic difficulty hook**

Build hook to manage difficulty state and adjustments.

- [ ] **Step 3: Integrate with question manager**

Modify question manager to use dynamic difficulty.

- [ ] **Step 4: Add difficulty calibration**

Create system to calibrate difficulty based on user performance patterns.

- [ ] **Step 5: Add difficulty feedback loop**

Implement feedback mechanism to refine difficulty adjustments.

- [ ] **Step 6: Create tests**

Write tests for difficulty adjustment logic.

- [ ] **Step 7: Commit changes**

```bash
git add src/lib/personalization/difficulty-adjustment.ts src/hooks/useDynamicDifficulty.ts src/hooks/useQuestionManager.ts
git commit -m "feat: implement dynamic difficulty adjustment"
```

---

### Task 7: Create Personalized Recommendations UI

**Files:**
- Create: `src/components/personalization/RecommendationsPanel.tsx` (recommendations display)
- Create: `src/components/personalization/PerformanceInsights.tsx` (insights component)
- Create: `src/hooks/usePersonalizedRecommendations.ts` (recommendations hook)

**Context:** Build UI components to display personalized recommendations and insights.

- [ ] **Step 1: Create recommendations panel**

Build component to show personalized content recommendations.

- [ ] **Step 2: Create performance insights component**

Build component to display learning analytics and insights.

- [ ] **Step 3: Create recommendations hook**

Build hook to fetch and manage personalized recommendations.

- [ ] **Step 4: Add recommendation actions**

Implement actions for users to interact with recommendations.

- [ ] **Step 5: Integrate with existing screens**

Add recommendation components to relevant screens (Dashboard, Study Center).

- [ ] **Step 6: Add loading and error states**

Ensure good UX with loading states and error handling.

- [ ] **Step 7: Commit changes**

```bash
git add src/components/personalization/ src/hooks/usePersonalizedRecommendations.ts
git commit -m "feat: create personalized recommendations UI"
```

---

### Task 8: Integrate Personalization with Existing Quiz System

**Files:**
- Modify: `src/hooks/useQuizSubmission.ts` (add personalization tracking)
- Modify: `src/lib/db/quiz-results-actions.ts` (extend with personalization data)
- Create: `src/lib/personalization/quiz-integration.ts` (integration logic)

**Context:** Integrate personalization engine with the existing quiz system to track performance and adjust recommendations.

- [ ] **Step 1: Extend quiz submission tracking**

Add personalization metrics tracking to quiz submissions.

- [ ] **Step 2: Update quiz results actions**

Extend database actions to store personalization data.

- [ ] **Step 3: Create quiz integration module**

Build module to bridge quiz system with personalization engine.

- [ ] **Step 4: Add performance analysis**

Implement analysis of quiz performance for personalization.

- [ ] **Step 5: Update quiz flow**

Modify quiz flow to use dynamic difficulty and recommendations.

- [ ] **Step 6: Create integration tests**

Write tests for quiz-personalization integration.

- [ ] **Step 7: Commit changes**

```bash
git add src/hooks/useQuizSubmission.ts src/lib/db/quiz-results-actions.ts src/lib/personalization/quiz-integration.ts
git commit -m "feat: integrate personalization with quiz system"
```

---

### Task 9: Add Personalization Settings and Profile Management

**Files:**
- Create: `src/screens/PersonalizationSettings.tsx` (settings screen)
- Create: `src/components/personalization/ProfileManager.tsx` (profile management)
- Modify: `src/hooks/useProfile.ts` (extend for personalization)

**Context:** Create UI for users to manage their personalization settings and learning profiles.

- [ ] **Step 1: Create personalization settings screen**

Build comprehensive settings screen for learning preferences.

- [ ] **Step 2: Create profile manager component**

Build component to view and edit learning profiles.

- [ ] **Step 3: Extend profile hook**

Add personalization management to existing profile hook.

- [ ] **Step 4: Add settings validation**

Implement validation for personalization settings.

- [ ] **Step 5: Add profile analytics**

Show analytics about user's learning patterns.

- [ ] **Step 6: Integrate with navigation**

Add personalization settings to app navigation.

- [ ] **Step 7: Commit changes**

```bash
git add src/screens/PersonalizationSettings.tsx src/components/personalization/ProfileManager.tsx src/hooks/useProfile.ts
git commit -m "feat: add personalization settings and profile management"
```

---

### Task 10: Implement Analytics and Reporting

**Files:**
- Create: `src/lib/personalization/analytics.ts` (analytics functions)
- Create: `src/components/personalization/LearningAnalytics.tsx` (analytics UI)
- Create: `src/screens/LearningReport.tsx` (reports screen)

**Context:** Create analytics system to track personalization effectiveness and provide insights.

- [ ] **Step 1: Create analytics functions**

Build functions to analyze personalization data and effectiveness.

- [ ] **Step 2: Create learning analytics component**

Build component to display learning progress and trends.

- [ ] **Step 3: Create learning report screen**

Build comprehensive report screen for learning analytics.

- [ ] **Step 4: Add data visualization**

Implement charts and graphs for personalization metrics.

- [ ] **Step 5: Add export functionality**

Allow users to export their learning reports.

- [ ] **Step 6: Create analytics tests**

Write tests for analytics functions.

- [ ] **Step 7: Commit changes**

```bash
git add src/lib/personalization/analytics.ts src/components/personalization/LearningAnalytics.tsx src/screens/LearningReport.tsx
git commit -m "feat: implement analytics and reporting"
```

---

### Task 11: Add AI-Powered Personalization Features

**Files:**
- Create: `src/lib/personalization/ai-recommendations.ts` (AI recommendations)
- Modify: `src/lib/personalization/recommendation-engine.ts` (integrate AI)
- Create: `src/components/personalization/AIInsights.tsx` (AI insights UI)

**Context:** Integrate Google Gemini AI for advanced personalization and insights.

- [ ] **Step 1: Create AI recommendations module**

Build module to use Gemini AI for personalized recommendations.

- [ ] **Step 2: Integrate AI with recommendation engine**

Enhance recommendation engine with AI-powered insights.

- [ ] **Step 3: Create AI insights component**

Build UI to display AI-generated learning insights.

- [ ] **Step 4: Add AI-powered study tips**

Implement AI-generated personalized study tips.

- [ ] **Step 5: Add learning pattern analysis**

Use AI to analyze and explain learning patterns.

- [ ] **Step 6: Create AI integration tests**

Write tests for AI-powered features.

- [ ] **Step 7: Commit changes**

```bash
git add src/lib/personalization/ai-recommendations.ts src/lib/personalization/recommendation-engine.ts src/components/personalization/AIInsights.tsx
git commit -m "feat: add AI-powered personalization features"
```

---

### Task 12: Final Integration and Testing

**Files:**
- Create: `src/lib/personalization/index.ts` (main export)
- Modify: `src/app/layout.tsx` (add personalization provider)
- Create: `src/__tests__/integration/personalization.test.ts` (integration tests)

**Context:** Integrate all personalization components and create comprehensive tests.

- [ ] **Step 1: Create main personalization export**

Create index file to export all personalization functionality.

- [ ] **Step 2: Add personalization context provider**

Create and add React context provider for personalization state.

- [ ] **Step 3: Integrate with app layout**

Add personalization provider to the main app layout.

- [ ] **Step 4: Create end-to-end tests**

Write comprehensive integration tests for the personalization engine.

- [ ] **Step 5: Add performance tests**

Test personalization performance with realistic data.

- [ ] **Step 6: Update documentation**

Add documentation for personalization features.

- [ ] **Step 7: Final commit**

```bash
git add src/lib/personalization/index.ts src/app/layout.tsx src/__tests__/integration/personalization.test.ts
git commit -m "feat: final integration and testing of personalization engine"
```</content>
<parameter name="filePath">docs/superpowers/plans/2026-04-08-personalization-engine.md