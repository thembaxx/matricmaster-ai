# Lumni AI - Repository Index

This file documents the codebase structure for fast navigation and context.

## Quick Navigation

### Core Features
- **AI Tutor**: `src/components/AiTutor/`, `src/services/geminiService.ts`
- **Flashcards**: `src/components/Flashcards/`, `src/services/flashcardDeckService.ts`
- **Past Papers**: `src/app/past-papers/`, `src/components/PastPaperViewer/`
- **Study Plan**: `src/app/study-plan/`, `src/lib/db/study-plan-actions.ts`
- **Quiz**: `src/components/Quiz/`, `src/services/spacedRepetition.ts`

### Services
- `src/services/geminiService.ts` - AI/Gemini integration
- `src/services/chatService.ts` - Chat functionality
- `src/services/flashcardDeckService.ts` - Flashcard deck management
- `src/services/spacedRepetition.ts` - Spaced repetition algorithm
- `src/services/adaptiveLearningService.ts` - Adaptive learning engine
- `src/services/pdfExtractor.ts` - PDF text extraction
- `src/services/markdownExtractor.ts` - Markdown parsing
- `src/services/progressService.ts` - Progress tracking

### State Management (Zustand)
- `src/stores/useProgressStore.ts`
- `src/stores/useGamificationStore.ts`
- `src/stores/useOfflineStore.ts`
- `src/stores/useChatStore.ts`
- `src/stores/useSubscriptionStore.ts`
- `src/stores/useThemeStore.ts`

### Database (Drizzle + SQLite)
- `src/lib/db/schema.ts` - Main schema
- `src/lib/db/schema-chat.ts` - Chat schema
- `src/lib/db/schema-ai-chat.ts` - AI chat schema
- `src/lib/db/sqlite-manager.ts` - SQLite connection

### UI Components
- `src/components/ui/` - shadcn/ui base components
- `src/components/ui/states/` - Empty/loading/error states
- `src/components/Landing/` - Landing page
- `src/components/Dashboard/` - Dashboard components
- `src/components/Quiz/` - Quiz components
- `src/components/Math/` - Math-specific components

### App Pages
- `src/app/page.tsx` - Home/landing
- `src/app/dashboard/` - Main dashboard
- `src/app/ai-tutor/` - AI tutor
- `src/app/flashcards/` - Flashcards
- `src/app/past-papers/` - Past papers
- `src/app/study-plan/` - Study planner
- `src/app/achievements/` - Achievements
- `src/app/settings/` - Settings
- `src/app/subscription/` - Subscription

### Configuration
- `biome.json` - Linting/formatting rules
- `AGENTS.md` - Agent instructions
- `app.config.ts` - App configuration
- `drizzle.config.ts` - Drizzle ORM config

## Key Patterns

### Database Actions Pattern
```typescript
// src/lib/db/[feature]-actions.ts
export async function getFeature(id: string) {
  // Implementation
}
```

### Service Pattern
```typescript
// src/services/[feature]Service.ts
export class FeatureService {
  // Methods
}
```

### Store Pattern
```typescript
// src/stores/use[Feature]Store.ts
import { create } from 'zustand';

interface State {
  // State
}

export const useFeatureStore = create<State>((set) => ({
  // Implementation
}));
```

### Component Pattern
```tsx
// src/components/[Feature]/Component.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Props {
  // Props
}

export function Component({ className, ...props }: Props) {
  return <div className={cn('', className)} {...props} />;
}
```

## Important Files

### Utilities
- `src/lib/utils.ts` - `cn()` helper (clsx + twMerge)
- `src/lib/validations.ts` - Zod schemas

### Auth
- `src/lib/server-auth.ts` - Server-side auth
- `auth.config.ts` - Auth configuration

### External Integrations
- Google Gemini: `@google/genai`
- Ably (real-time): `@ably/chat`, `ably`
- Better Auth: `better-auth`
- Vercel: `@vercel/analytics`, `@vercel/speed-insights`
- Sentry: `@sentry/nextjs`

## Curriculum Context

South African NSC Grade 12 focused. Key subjects:
- Mathematics
- Physical Sciences
- Languages (English, Afrikaans)
- Life Sciences
- Geography
- History

## Database Tables (Drizzle Schema)

See `src/lib/db/schema.ts` for full schema including:
- users
- progress
- achievements
- quizzes
- flashcards
- study_plans
- subscriptions
- etc.
