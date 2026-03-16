# Mock Data Integration & Demo Page Implementation Plan

> **For agentic workers:** REQUIRED: Execute each chunk sequentially. Use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate mock data into the app, create demo page, add real curriculum data, and build API layer with mock/real switching

**Architecture:** Create a data abstraction layer that switches between mock and real data based on environment/config

**Tech Stack:** Next.js, React, TypeScript, shadcn/ui

---

## Chunk 1: Add Real Curriculum Data to Mock Data

**Files:**
- Modify: `src/data/mock-data.json`

- [ ] **Step 1: Add more questions for each subject**

Based on NSC CAPS curriculum, add:
- Mathematics: 30+ questions covering Algebra, Calculus, Geometry, Trigonometry, Statistics
- Physical Sciences: 20+ questions covering Mechanics, Waves, Matter, Chemical bonding
- Life Sciences: 20+ questions covering Cells, Genetics, Evolution
- Other subjects: 10+ each

- [ ] **Step 2: Add topic structure matching CAPS curriculum**

```json
"topics": {
  "Mathematics": [
    "Functions and Graphs",
    "Exponents and Logarithms",
    "Number Patterns and Sequences",
    "Finance, Growth and Decay",
    "Differential Calculus",
    "Analytical Geometry",
    "Euclidean Geometry",
    "Trigonometry",
    "Statistics",
    "Probability"
  ],
  "Physical Sciences": [
    "Motion in One Dimension",
    "Newton's Laws",
    "Work, Energy and Power",
    "Waves, Sound and Light",
    "Matter and Materials",
    "Chemical Bonding",
    "Chemical Reactions",
    "Acids and Bases"
  ]
}
```

- [ ] **Step 3: Add more past papers (2019-2024)**

```json
"pastPapers": [
  {"subject": "Mathematics", "year": 2024, "month": "November", "paper": "Paper 1"},
  {"subject": "Mathematics", "year": 2024, "month": "November", "paper": "Paper 2"},
  // ... more papers
]
```

---

## Chunk 2: Create Data API Layer

**Files:**
- Create: `src/lib/api/data-source.ts`
- Create: `src/hooks/use-data.ts`

- [ ] **Step 1: Create data source configuration**

```typescript
// src/lib/api/data-source.ts
export type DataSource = 'mock' | 'real';

export interface DataSourceConfig {
  source: DataSource;
  apiBaseUrl?: string;
}

export const dataConfig = {
  source: process.env.NEXT_PUBLIC_DATA_SOURCE as DataSource || 'mock',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
};
```

- [ ] **Step 2: Create data abstraction functions**

```typescript
// src/lib/api/data-source.ts
import { mockSubjects, mockQuestions, ... } from '@/data';
import { dataConfig } from './data-source';

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${dataConfig.apiBaseUrl}${endpoint}`);
  return response.json();
}

export const getSubjects = async () => {
  if (dataConfig.source === 'mock') {
    return mockSubjects;
  }
  return fetchFromAPI('/api/subjects');
};
```

- [ ] **Step 3: Create useData hook**

```typescript
// src/hooks/use-data.ts
import { useState, useEffect } from 'react';
import { dataConfig } from '@/lib/api/data-source';

export function useData<T>(fetchFn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchFn();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, deps);

  return { data, loading, error, isMock: dataConfig.source === 'mock' };
}
```

---

## Chunk 3: Integrate Mock Data into Existing Screens

**Files:**
- Modify: Various screen components in `src/screens/`

- [ ] **Step 1: Create Subjects screen with mock data**

- [ ] **Step 2: Create Quiz screen with mock questions**

- [ ] **Step 3: Update Flashcards screen with mock decks**

- [ ] **Step 4: Update Leaderboard with mock data**

- [ ] **Step 5: Update Notifications with mock data**

---

## Chunk 4: Create Demo Page

**Files:**
- Create: `src/app/demo/page.tsx`

- [ ] **Step 1: Create demo page layout**

```tsx
// src/app/demo/page.tsx
'use client';

import { DataLoader, DataSection, DataEmpty } from '@/components/ui/data-loader';
import { mockSubjects, mockQuestions, mockLeaderboardUsers, ... } from '@/data';

export default function DemoPage() {
  return (
    <div className="container py-8 space-y-8">
      <h1>Mock Data Demo</h1>
      
      <DataSection title="Subjects" description="Available subjects">
        {/* Subjects grid */}
      </DataSection>
      
      <DataSection title="Sample Questions" description="Quiz questions">
        {/* Questions list */}
      </DataSection>
      
      <DataSection title="Leaderboard" description="Top learners">
        {/* Leaderboard table */}
      </DataSection>
    </div>
  );
}
```

- [ ] **Step 2: Add navigation to demo page**

- [ ] **Step 3: Style the demo page with app theme**

---

## Chunk 5: Testing & Verification

**Files:**
- Test: Various components

- [ ] **Step 1: Run build to verify no errors**

```bash
bun run build
```

- [ ] **Step 2: Test demo page renders correctly**

- [ ] **Step 3: Test data switching works**

---

## Dependencies

- @hugeicons/core-free-icons
- @hugeicons/react
- shadcn/ui components
- existing mock data structure
