# Setwork Library Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development (if subagents available) or execute plan in current session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive literature study hub for NSC Grade 12 English students with setwork summaries, character analysis, flashcards, quizzes, and AI essay feedback

**Architecture:** 
- Static JSON data files for setwork content (following existing `src/data/` pattern)
- Reuse existing AI tutor endpoint for essay feedback
- Extend existing flashcard system for study tools
- Next.js App Router with dynamic routes

**Tech Stack:** 
- Next.js 16, TypeScript, Tailwind, shadcn/ui
- Existing: Zustand, Framer Motion
- JSON data files (no new database tables needed)

---

# Part 1: Data Setup

## Task 1: Create Setwork Data Files

**Files:**
- Create: `src/data/setworks/index.ts` - Main data file with all setworks
- Create: `src/data/setworks/types.ts` - TypeScript interfaces
- Create: `src/data/setworks/quiz-questions.ts` - Quiz questions

- [ ] **Step 1: Create type definitions**

```typescript
// src/data/setworks/types.ts
export interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting';
  description: string;
  relationships: { characterId: string; relationship: string }[];
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  examples: string[];
}

export interface Quote {
  id: string;
  text: string;
  speaker: string;
  context: string;
  pageNumber?: number;
  themeIds: string[];
}

export interface Setwork {
  id: string;
  title: string;
  author: string;
  genre: 'novel' | 'drama' | 'poetry' | 'short-story';
  year: number;
  targetLevel: 'HL' | 'FAL';
  synopsis: string;
  context: string;
  characters: Character[];
  themes: Theme[];
  quotes: Quote[];
}

export interface QuizQuestion {
  id: string;
  setworkId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
```

- [ ] **Step 2: Create main data file with 3 setworks**

```typescript
// src/data/setworks/index.ts
import type { Setwork, QuizQuestion } from './types';

export const setworks: Setwork[] = [
  {
    id: 'things-fall-apart',
    title: 'Things Fall Apart',
    author: 'Chinua Achebe',
    genre: 'novel',
    year: 1958,
    targetLevel: 'HL',
    synopsis: 'The story follows Okonkwo, a respected warrior in the Igbo community of Umuofia, whose tragic flaw leads to his downfall. Set in pre-colonial Nigeria, the novel explores themes of masculinity, tradition, and the clash between Igbo and Western cultures.',
    context: 'Achebe wrote this novel as a response to Western portrayals of African societies as primitive. It is widely regarded as one of the most important works of African literature.',
    characters: [
      { id: 'okonkwo', name: 'Okonkwo', role: 'protagonist', description: 'A proud, ambitious warrior who fears failure. Strong but inflexible.', relationships: [{ characterId: 'ezinma', relationship: 'daughter' }, { characterId: 'ikemefuna', relationship: 'adopted son' }] },
      { id: 'ezinma', name: 'Ezinma', role: 'supporting', description: 'Okonkwo\'s favourite daughter, strong-willed and intelligent.', relationships: [] },
      { id: 'ikemefuna', name: 'Ikemefuna', role: 'supporting', description: 'A young boy taken as a peace offering, raised by Okonkwo.', relationships: [{ characterId: 'okonkwo', relationship: 'father figure' }] },
      { id: 'nwoye', name: 'Nwoye', role: 'supporting', description: 'Okonkwo\'s son, gentle and sensitive.', relationships: [{ characterId: 'okonkwo', relationship: 'son' }] },
      { id: 'obierika', name: 'Obierika', role: 'supporting', description: 'Okonkwo\'s best friend, wise and moderate.', relationships: [{ characterId: 'okonkwo', relationship: 'friend' }] },
    ],
    themes: [
      { id: 'masculinity', name: 'Masculinity', description: 'The novel examines what it means to be a man in Igbo society.', examples: ['Okonkwo\'s fear of being seen as weak', 'The banishment of Ikemefuna'] },
      { id: 'tradition', name: 'Tradition vs Change', description: 'Clash between traditional Igbo values and Christian missionary influence.', examples: ['The introduction of the missionaries', 'The breaking of the Week of Peace'] },
      { id: 'fate', name: 'Fate vs Free Will', description: 'Whether characters control their destinies or are bound by fate.', examples: ['Okonkwo\'s belief in chi', 'The village seer\'s predictions'] },
    ],
    quotes: [
      { id: 'q1', text: 'Among the Ibo the art of conversation is regarded very highly, and proverbs are the palm-oil with which words are eaten.', speaker: 'Narrator', context: 'Opening line, establishing the importance of language', themeIds: ['tradition'] },
      { id: 'q2', text: 'Okonkwo\'s whole life was dominated by fear, the fear of failure and of weakness.', speaker: 'Narrator', context: 'Describing Okonkwo\'s inner turmoil', themeIds: ['masculinity'] },
    ],
  },
  {
    id: 'cry-beloved-country',
    title: 'Cry, the Beloved Country',
    author: 'Alan Paton',
    genre: 'novel',
    year: 1948,
    targetLevel: 'HL',
    synopsis: 'The story of Reverend Stephen Kumalo, a Zulu priest who travels from his rural village to Johannesburg to find his sister and son, only to discover the harsh realities of apartheid South Africa.',
    context: 'Written during apartheid, the novel is a plea for reconciliation and understanding between South Africa\'s divided communities.',
    characters: [
      { id: 'kumalo', name: 'Stephen Kumalo', role: 'protagonist', description: 'A dedicated parish priest from Ndotsheni.', relationships: [] },
      { id: 'absalom', name: 'Absalom Kumalo', role: 'supporting', description: 'Stephen\'s son who moves to Johannesburg.', relationships: [{ characterId: 'kumalo', relationship: 'son' }] },
      { id: 'jarvis', name: 'Arthur Jarvis', role: 'supporting', description: 'A white South African activist working for reform.', relationships: [] },
    ],
    themes: [
      { id: 'apartheid', name: 'Apartheid and Segregation', description: 'The destructive effects of racial division.', examples: ['Johannesburg\'s contrast to Ndotsheni', 'The racial tension throughout'] },
      { id: 'reconciliation', name: 'Reconciliation', description: 'The possibility of healing through understanding.', examples: [' Jarvis Sr\'s forgiveness', 'Kumalo\'s speech at the trial'] },
      { id: 'fear', name: 'Fear', description: 'How fear drives both black and white communities.', examples: ['Fear in Ndotsheni', 'Fear in Johannesburg'] },
    ],
    quotes: [
      { id: 'q1', text: 'Cry, the beloved country, for the unborn child that\'s drawn to the yonder passed.', speaker: 'Poem/Song', context: 'The opening poem that frames the novel', themeIds: ['apartheid'] },
    ],
  },
  {
    id: 'merchant-venice',
    title: 'The Merchant of Venice',
    author: 'William Shakespeare',
    genre: 'drama',
    year: 1598,
    targetLevel: 'FAL',
    synopsis: 'A comedy exploring themes of mercy, justice, and prejudice through the story of Antonio, a merchant who borrows money from Shylock, a Jewish moneylender.',
    context: 'Written in Elizabethan England, the play reflects antisemitic attitudes of the time while also challenging them through its portrayal of Shylock.',
    characters: [
      { id: 'shylock', name: 'Shylock', role: 'antagonist', description: 'A Jewish moneylender seeking revenge.', relationships: [] },
      { id: 'portia', name: 'Portia', role: 'protagonist', description: 'A wealthy heiress who tests her suitors.', relationships: [] },
      { id: 'antonio', name: 'Antonio', role: 'supporting', description: 'The merchant who borrows from Shylock.', relationships: [] },
    ],
    themes: [
      { id: 'prejudice', name: 'Prejudice and Antisemitism', description: 'The treatment of Jews in Christian society.', examples: ['Antonio\'s abuse of Shylock', 'The trial scene'] },
      { id: 'mercy', name: 'Mercy', description: 'The virtue of forgiveness and compassion.', examples: ['Portia\'s speech on mercy', 'Antonio\'s plea for mercy'] },
      { id: 'justice', name: 'Justice', description: 'The law and its application.', examples: ['The bond', 'The court scene'] },
    ],
    quotes: [
      { id: 'q1', text: 'The quality of mercy is not strain\'d, it droppeth as the gentle rain from heaven.', speaker: 'Portia', context: 'Her famous speech on mercy', themeIds: ['mercy'] },
    ],
  },
];

export const quizQuestions: QuizQuestion[] = [
  // Things Fall Apart
  { id: 'tfa-q1', setworkId: 'things-fall-apart', question: 'What is Okonkwo\'s greatest fear?', options: ['Failure', 'Death', 'Losing his wealth', 'The gods'], correctAnswer: 0, explanation: 'Okonkwo fears failure above all else, believing it to be the greatest shame.', difficulty: 'easy' },
  { id: 'tfa-q2', setworkId: 'things-fall-apart', question: 'Who is Ikemefuna?', options: ['Okonkwo\'s brother', 'Okonkwo\'s adopted son', 'A tribal elder', 'A missionary'], correctAnswer: 1, explanation: 'Ikemefuna is a young boy taken as a peace offering from another clan.', difficulty: 'easy' },
  { id: 'tfa-q3', setworkId: 'things-fall-apart', question: 'What triggers Okonkwo\'s downfall?', options: ['Killing his son', 'Killing Ikemefuna', 'Losing his wealth', 'Converting to Christianity'], correctAnswer: 1, explanation: 'Being forced to kill Ikemefuna haunts Okonkwo and contributes to his mental breakdown.', difficulty: 'medium' },
  
  // Cry, the Beloved Country
  { id: 'cbq-q1', setworkId: 'cry-beloved-country', question: 'Where does the main setting shift to in Part 2?', options: ['Durban', 'Johannesburg', 'Cape Town', 'Pretoria'], correctAnswer: 1, explanation: 'Kumalo travels to Johannesburg to find his sister and son.', difficulty: 'easy' },
  { id: 'cbq-q2', setworkId: 'cry-beloved-country', question: 'What crime does Absalom commit?', options: ['Theft', 'Murder', 'Fraud', 'Assault'], correctAnswer: 1, explanation: 'Absalom kills Arthur Jarvis during a robbery.', difficulty: 'medium' },
  
  // Merchant of Venice
  { id: 'mv-q1', setworkId: 'merchant-venice', question: 'What does Shylock demand if Antonio defaults?', options: ['His ships', 'His home', 'A pound of flesh', 'His fortune'], correctAnswer: 2, explanation: 'The bond specifies a pound of Antonio\'s flesh if he defaults.', difficulty: 'easy' },
  { id: 'mv-q2', setworkId: 'merchant-venice', question: 'How does Portia save Antonio?', options: ['By paying the debt', 'By finding a legal loophole', 'By convincing Shylock', 'By revealing herself'], correctAnswer: 1, explanation: 'Portia argues that Shylock can take flesh but not blood, making the contract void.', difficulty: 'medium' },
];

export function getSetworkById(id: string): Setwork | undefined {
  return setworks.find(s => s.id === id);
}

export function getQuizBySetwork(setworkId: string): QuizQuestion[] {
  return quizQuestions.filter(q => q.setworkId === setworkId);
}
```

- [ ] **Step 3: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

---

# Part 2: Components

## Task 2: Create Setwork Card Component

**Files:**
- Create: `src/components/SetworkLibrary/SetworkCard.tsx`

- [ ] **Step 1: Create SetworkCard component**

```tsx
// src/components/SetworkLibrary/SetworkCard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { type Setwork } from '@/data/setworks/types';
import { Card } from '@/components/ui/card';
import { BookOpenIcon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface SetworkCardProps {
  setwork: Setwork;
}

export function SetworkCard({ setwork }: SetworkCardProps) {
  const router = useRouter();

  return (
    <Card 
      className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/setwork-library/${setwork.id}`)}
    >
      <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl mb-4 flex items-center justify-center">
        <HugeiconsIcon icon={BookOpenIcon} className="w-16 h-16 text-primary/30" />
      </div>
      
      <h3 className="font-black text-lg mb-1">{setwork.title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{setwork.author}</p>
      
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <HugeiconsIcon icon={UserIcon} className="w-3 h-3" />
          {setwork.characters.length} characters
        </span>
        <span>{setwork.themes.length} themes</span>
      </div>
      
      <div className="mt-3 flex gap-2">
        <span className="text-xs px-2 py-1 bg-secondary rounded-full capitalize">
          {setwork.genre}
        </span>
        <span className="text-xs px-2 py-1 bg-secondary rounded-full">
          {setwork.targetLevel}
        </span>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

---

## Task 3: Create Setwork Detail Page Components

**Files:**
- Create: `src/components/SetworkLibrary/CharacterList.tsx`
- Create: `src/components/SetworkLibrary/ThemeCard.tsx`
- Create: `src/components/SetworkLibrary/QuoteCard.tsx`

- [ ] **Step 1: Create CharacterList component**

```tsx
// src/components/SetworkLibrary/CharacterList.tsx
'use client';

import { type Character } from '@/data/setworks/types';
import { Card } from '@/components/ui/card';

interface CharacterListProps {
  characters: Character[];
}

export function CharacterList({ characters }: CharacterListProps) {
  return (
    <div className="grid gap-4">
      {characters.map((char) => (
        <Card key={char.id} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold">{char.name}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                char.role === 'protagonist' ? 'bg-green-100 text-green-700' :
                char.role === 'antagonist' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {char.role}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{char.description}</p>
          {char.relationships.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {char.relationships.map((rel, i) => (
                <span key={i} className="text-xs bg-secondary px-2 py-1 rounded">
                  {rel.relationship}
                </span>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create ThemeCard component**

```tsx
// src/components/SetworkLibrary/ThemeCard.tsx
'use client';

import { type Theme } from '@/data/setworks/types';
import { Card } from '@/components/ui/card';

interface ThemeCardProps {
  theme: Theme;
}

export function ThemeCard({ theme }: ThemeCardProps) {
  return (
    <Card className="p-4">
      <h4 className="font-bold mb-2">{theme.name}</h4>
      <p className="text-sm text-muted-foreground mb-3">{theme.description}</p>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Examples:</p>
        {theme.examples.map((example, i) => (
          <p key={i} className="text-sm bg-secondary/50 p-2 rounded">• {example}</p>
        ))}
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: Create QuoteCard component**

```tsx
// src/components/SetworkLibrary/QuoteCard.tsx
'use client';

import { type Quote } from '@/data/setworks/types';
import { Card } from '@/components/ui/card';
import { QuoteIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface QuoteCardProps {
  quote: Quote;
}

export function QuoteCard({ quote }: QuoteCardProps) {
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <HugeiconsIcon icon={QuoteIcon} className="w-5 h-5 text-primary shrink-0 mt-1" />
        <div>
          <p className="font-medium italic">"{quote.text}"</p>
          <p className="text-sm text-muted-foreground mt-2">— {quote.speaker}</p>
          <p className="text-xs text-muted-foreground mt-1">{quote.context}</p>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

---

## Task 4: Create Quiz Component

**Files:**
- Create: `src/components/SetworkLibrary/QuizEngine.tsx`

- [ ] **Step 1: Create QuizEngine component**

```tsx
// src/components/SetworkLibrary/QuizEngine.tsx
'use client';

import { useState } from 'react';
import { type QuizQuestion } from '@/data/setworks/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuizEngineProps {
  questions: QuizQuestion[];
}

export function QuizEngine({ questions }: QuizEngineProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const question = questions[current];
  const isCorrect = selected === question.correctAnswer;

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelected(index);
  };

  const handleCheck = () => {
    setShowResult(true);
  };

  const handleNext = () => {
    setSelected(null);
    setShowResult(false);
    setCurrent((c) => (c + 1) % questions.length);
  };

  if (questions.length === 0) {
    return <p className="text-muted-foreground">No quiz questions available.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Question {current + 1} of {questions.length}</span>
        <span className="capitalize">{question.difficulty}</span>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">{question.question}</h3>
        
        <div className="space-y-2">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showResult}
              className={`w-full p-3 text-left rounded-lg border transition-colors ${
                selected === i 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              } ${
                showResult && i === question.correctAnswer
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : ''
              } ${
                showResult && selected === i && !isCorrect
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : ''
              }
            `}
            >
              {option}
            </button>
          ))}
        </div>

        {showResult && (
          <div className={`mt-4 p-3 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <p className="font-semibold mb-1">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
            <p className="text-sm">{question.explanation}</p>
          </div>
        )}
      </Card>

      <div className="flex gap-2">
        {!showResult ? (
          <Button onClick={handleCheck} disabled={selected === null}>
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

---

# Part 3: Pages

## Task 5: Create Main Library Page

**Files:**
- Create: `src/app/setwork-library/page.tsx`

- [ ] **Step 1: Create main library page**

```tsx
// src/app/setwork-library/page.tsx
import type { Metadata } from 'next';
import { appConfig } from '@/app.config';
import { setworks } from '@/data/setworks';
import { SetworkCard } from '@/components/SetworkLibrary/SetworkCard';

export const metadata: Metadata = {
  title: `Setwork Library | ${appConfig.name} AI`,
  description: 'Study guides, summaries, and analysis for NSC prescribed literature.',
};

export default function SetworkLibraryPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="px-6 pt-12 pb-40 bg-card border-b border-border">
        <h1 className="text-xl font-black">Setwork Library</h1>
        <p className="text-muted-foreground mt-2">
          Study guides, summaries, and analysis for NSC Grade 12 prescribed literature
        </p>
      </header>

      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {setworks.map((setwork) => (
            <SetworkCard key={setwork.id} setwork={setwork} />
          ))}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

---

## Task 6: Create Setwork Detail Page

**Files:**
- Create: `src/app/setwork-library/[id]/page.tsx`

- [ ] **Step 1: Create setwork detail page**

```tsx
// src/app/setwork-library/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getSetworkById } from '@/data/setworks';
import { CharacterList } from '@/components/SetworkLibrary/CharacterList';
import { ThemeCard } from '@/components/SetworkLibrary/ThemeCard';
import { QuoteCard } from '@/components/SetworkLibrary/QuoteCard';
import { Card } from '@/components/ui/card';
import { ArrowLeftIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SetworkDetailPage({ params }: PageProps) {
  const { id } = await params;
  const setwork = getSetworkById(id);

  if (!setwork) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-6 pt-12 pb-40 bg-card border-b border-border">
        <Link href="/setwork-library" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <HugeiconsIcon icon={ArrowLeftIcon} className="w-4 h-4" />
          Back to Library
        </Link>
        <h1 className="text-2xl font-black">{setwork.title}</h1>
        <p className="text-muted-foreground">{setwork.author} ({setwork.year})</p>
      </header>

      <main className="flex-1 p-6 overflow-y-auto space-y-8">
        {/* Synopsis */}
        <section>
          <h2 className="font-bold text-lg mb-3">Synopsis</h2>
          <Card className="p-4">
            <p>{setwork.synopsis}</p>
          </Card>
        </section>

        {/* Context */}
        <section>
          <h2 className="font-bold text-lg mb-3">Historical & Cultural Context</h2>
          <Card className="p-4">
            <p>{setwork.context}</p>
          </Card>
        </section>

        {/* Characters */}
        <section>
          <h2 className="font-bold text-lg mb-3">Characters</h2>
          <CharacterList characters={setwork.characters} />
        </section>

        {/* Themes */}
        <section>
          <h2 className="font-bold text-lg mb-3">Themes</h2>
          <div className="grid gap-4">
            {setwork.themes.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        </section>

        {/* Quotes */}
        <section>
          <h2 className="font-bold text-lg mb-3">Key Quotes</h2>
          <div className="space-y-3">
            {setwork.quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

---

## Task 7: Create Quiz Page

**Files:**
- Create: `src/app/setwork-library/quiz/page.tsx`

- [ ] **Step 1: Create quiz page**

```tsx
// src/app/setwork-library/quiz/page.tsx
import type { Metadata } from 'next';
import { appConfig } from '@/app.config';
import { setworks, quizQuestions } from '@/data/setworks';
import { QuizEngine } from '@/components/SetworkLibrary/QuizEngine';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: `Setwork Quiz | ${appConfig.name} AI`,
  description: 'Test your knowledge of prescribed setworks.',
};

export default function QuizPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="px-6 pt-12 pb-40 bg-card border-b border-border">
        <h1 className="text-xl font-black">Setwork Quiz</h1>
        <p className="text-muted-foreground mt-2">
          Test your knowledge of characters, themes, and plot
        </p>
      </header>

      <main className="flex-1 p-6">
        <QuizEngine questions={quizQuestions} />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

---

## Task 8: Integration with Dashboard

**Files:**
- Modify: `src/screens/Dashboard.tsx`

- [ ] **Step 1: Add quick link to dashboard**

Add BookOpen01Icon import and add "Setwork Library" quick link similar to Science Lab and Math Graphing

- [ ] **Step 2: Run typecheck and lint**

Run: `bun run typecheck && bun run lint`
Expected: PASS

---

## Summary

- [ ] Task 1: Create setwork data files
- [ ] Task 2: Create SetworkCard component
- [ ] Task 3: Create detail page components
- [ ] Task 4: Create Quiz component
- [ ] Task 5: Create main library page
- [ ] Task 6: Create setwork detail page
- [ ] Task 7: Create quiz page
- [ ] Task 8: Integration with dashboard

**Total: 8 tasks**
