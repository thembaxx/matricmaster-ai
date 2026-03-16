# Deep AI-Driven Integration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan.

**Goal:** Integrate Snap & Solve, AI Tutor, Voice Tutor, and Flashcards into a seamless learning loop. Make the Glass Orb context-aware based on current page. Enable voice-to-knowledge conversion.

**Architecture:**
- Create a unified AI context system that tracks current learning activity
- Add learning loop actions after Snap & Solve problem solving
- Enhance Glass Orb to be context-aware
- Add voice-to-flashcard/notes conversion

**Tech Stack:** Next.js 16, React, Gemini AI, shadcn/ui, Web Speech API

---

## File Structure

- **Create:** `src/stores/useAiContextStore.ts` - Track current AI context
- **Create:** `src/services/learningLoopEngine.ts` - Learning loop actions
- **Modify:** `src/components/AI/GlassOrb.tsx` - Make context-aware
- **Modify:** `src/screens/SnapAndSolve.tsx` - Add learning loop actions
- **Create:** `src/components/Flashcard/VoiceToFlashcard.tsx` - Voice conversion

---

## Chunk 1: AI Context System

### Task 1: Create AI Context Store

**Files:**
- Create: `src/stores/useAiContextStore.ts`

- [ ] **Step 1: Create the context store**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AiContextType = 
  | 'idle'
  | 'quiz'
  | 'pastPaper'
  | 'lesson'
  | 'flashcard'
  | 'snapAndSolve'
  | 'voiceTutor'
  | 'curriculumMap';

export interface AiContext {
  type: AiContextType;
  subject?: string;
  topic?: string;
  paperId?: string;
  lessonId?: string;
  questionId?: string;
  relatedTopics?: string[];
  lastUpdated: number;
}

interface AiContextStore {
  context: AiContext;
  setContext: (context: Partial<AiContext>) => void;
  clearContext: () => void;
  pushToHistory: (context: AiContext) => void;
  history: AiContext[];
}

const initialContext: AiContext = {
  type: 'idle',
  lastUpdated: Date.now(),
};

export const useAiContextStore = create<AiContextStore>()(
  persist(
    (set, get) => ({
      context: initialContext,
      
      setContext: (newContext) => {
        set((state) => ({
          context: {
            ...state.context,
            ...newContext,
            lastUpdated: Date.now(),
          },
        }));
      },
      
      clearContext: () => {
        set({ context: initialContext });
      },
      
      pushToHistory: (context) => {
        set((state) => ({
          history: [context, ...state.history].slice(0, 10), // Keep last 10
        }));
      },
      
      history: [],
    }),
    {
      name: 'ai-context-storage',
    }
  )
);

// Helper hooks for specific contexts
export const useQuizContext = (subject?: string, topic?: string) => {
  const setContext = useAiContextStore((s) => s.setContext);
  
  return {
    enterQuiz: (quizId: string, qId?: string) => {
      setContext({ 
        type: 'quiz', 
        subject, 
        topic,
        questionId: qId,
      });
    },
    exitQuiz: () => useAiContextStore.getState().clearContext(),
  };
};

export const usePastPaperContext = (paperId: string, subject?: string) => {
  const setContext = useAiContextStore((s) => s.setContext);
  
  return {
    openPaper: (pId: string, topic?: string) => {
      setContext({ 
        type: 'pastPaper', 
        paperId: pId, 
        subject,
        topic,
      });
    },
    exitPaper: () => useAiContextStore.getState().clearContext(),
  };
};

export const useSnapAndSolveContext = () => {
  const setContext = useAiContextStore((s) => s.setContext);
  
  return {
    startSolving: (subject: string, topic?: string, relatedTopics?: string[]) => {
      setContext({
        type: 'snapAndSolve',
        subject,
        topic,
        relatedTopics,
      });
    },
    finishSolving: () => useAiContextStore.getState().clearContext(),
  };
};
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/useAiContextStore.ts
git commit -m "feat: add AI context store"
```

---

## Chunk 2: Learning Loop Engine

### Task 2: Create Learning Loop Engine Service

**Files:**
- Create: `src/services/learningLoopEngine.ts`

- [ ] **Step 1: Create the learning loop engine**

```typescript
import { generateObject } from 'ai';
import { geminiModel } from '@/services/geminiService';
import { saveFlashcard } from '@/lib/db/flashcard-actions';
import { addToStudyPlan } from '@/lib/db/study-plan-actions';
import { z } from 'zod';

export interface LearningLoopAction {
  type: 'generateFlashcard' | 'addToStudyPlan' | 'findSimilarQuestions' | 'generateNotes';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}

// Analyze solved problem and suggest learning actions
export async function analyzeSolvedProblem(
  problemText: string,
  solution: string,
  subject: string,
  topic: string
): Promise<LearningLoopAction[]> {
  const prompt = `
Analyze this solved problem and suggest follow-up learning actions:

Problem: ${problemText}
Solution: ${solution}
Subject: ${subject}
Topic: ${topic}

Return 2-4 learning actions the student should take next. Each action should be one of these types:
- "generateFlashcard": Create a flashcard for key concept
- "addToStudyPlan": Add this topic to study schedule
- "findSimilarQuestions": Find similar past paper questions
- "generateNotes": Create study notes from this problem

For each action, include:
- type: one of the above
- priority: "high", "medium", or "low"
- title: short actionable title
- description: why this action is valuable

Return as JSON array:
[
  {
    "type": "generateFlashcard",
    "priority": "high", 
    "title": "Create flashcard for [concept]",
    "description": "This concept frequently appears in exams"
  }
]
`;

  const { object } = await generateObject({
    model: geminiModel,
    schema: z.array(z.object({
      type: z.enum(['generateFlashcard', 'addToStudyPlan', 'findSimilarQuestions', 'generateNotes']),
      priority: z.enum(['high', 'medium', 'low']),
      title: z.string(),
      description: z.string(),
    })),
    prompt,
  });

  return object.map(item => ({
    ...item,
    metadata: { subject, topic },
  }));
}

// Generate flashcard from problem
export async function generateFlashcardFromProblem(
  problemText: string,
  solution: string,
  subject: string,
  topic: string,
  userId: string
): Promise<{ id: string }> {
  const prompt = `
Extract the key concept from this problem and create a flashcard:

Problem: ${problemText}
Solution: ${solution}
Subject: ${subject}
Topic: ${topic}

Create a front/back flashcard that tests understanding of the core concept.
Front should be a question, back should be the answer.

Return as JSON:
{
  "front": "Question about the concept",
  "back": "Answer/explanation"
}
`;

  const { object } = await generateObject({
    model: geminiModel,
    schema: z.object({
      front: z.string(),
      back: z.string(),
    }),
    prompt,
  });

  return saveFlashcard({
    userId,
    subject,
    topic,
    front: object.front,
    back: object.back,
    source: 'ai-generated',
  });
}

// Add topic to study plan
export async function addProblemToStudyPlan(
  subject: string,
  topic: string,
  userId: string,
  priority: 'high' | 'medium' | 'low' = 'medium'
): Promise<void> {
  await addToStudyPlan({
    userId,
    subject,
    topic,
    priority,
    scheduledDate: new Date().toISOString(),
    duration: 30, // 30 minutes
    type: 'review',
  });
}

// Find similar questions from past papers
export async function findSimilarQuestions(
  subject: string,
  topic: string,
  limit: number = 5
): Promise<Array<{
  question: string;
  answer: string;
  paper: string;
  year: number;
}>> {
  // This would query the past papers database
  // For now, return empty - would integrate with existing past paper search
  return [];
}

// Generate study notes from voice tutor conversation
export async function generateNotesFromConversation(
  transcript: string,
  subject?: string
): Promise<{
  title: string;
  summary: string;
  keyPoints: string[];
  topics: string[];
}> {
  const prompt = `
Convert this voice tutor conversation into structured study notes:

Transcript:
${transcript}

${subject ? `Subject: ${subject}` : ''}

Return as JSON:
{
  "title": "Study notes title",
  "summary": "2-3 sentence summary of key learning",
  "keyPoints": ["Point 1", "Point 2", ...],
  "topics": ["topic1", "topic2", ...]
}
`;

  const { object } = await generateObject({
    model: geminiModel,
    schema: z.object({
      title: z.string(),
      summary: z.string(),
      keyPoints: z.array(z.string()),
      topics: z.array(z.string()),
    }),
    prompt,
  });

  return object;
}

// Generate flashcards from voice notes
export async function generateFlashcardsFromVoice(
  transcript: string,
  subject?: string,
  userId?: string
): Promise<Array<{ front: string; back: string }>> {
  const prompt = `
Convert this voice note into flashcards. Extract key concepts and create Q&A pairs:

Transcript:
${transcript}

${subject ? `Subject: ${subject}` : ''}

Return as JSON array (3-6 flashcards):
[
  { "front": "Question 1", "back": "Answer 1" },
  { "front": "Question 2", "back": "Answer 2" }
]
`;

  const { object } = await generateObject({
    model: geminiModel,
    schema: z.array(z.object({
      front: z.string(),
      back: z.string(),
    })),
    prompt,
  });

  return object;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/learningLoopEngine.ts
git commit -m "feat: add learning loop engine service"
```

---

## Chunk 3: Context-Aware Glass Orb

### Task 3: Enhance Glass Orb with Context Awareness

**Files:**
- Modify: `src/components/AI/GlassOrb.tsx`

- [ ] **Step 1: Update Glass Orb to use context**

```typescript
'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { Send, X, BookOpenIcon, FileQuestion, Calculator, Mic } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAiContextStore } from '@/stores/useAiContextStore';

// Context-aware prompt suggestions
const CONTEXT_PROMPTS: Record<string, string[]> = {
  quiz: [
    'Explain this question',
    'Give me a hint',
    'Similar question',
  ],
  pastPaper: [
    'Explain this answer',
    'Find more like this',
    'Mark my answer',
  ],
  snapAndSolve: [
    'Show me the steps',
    'More practice problems',
    'Create a flashcard',
  ],
  lesson: [
    'Summarize this',
    'Quiz me',
    'Add to study plan',
  ],
  curriculumMap: [
    'What topics are next?',
    'Find practice for this',
    'Show related concepts',
  ],
  idle: [
    'Help me study',
    'Quiz me',
    'Explain a concept',
  ],
};

export function GlassOrb() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(CONTEXT_PROMPTS.idle);
  
  const pathname = usePathname();
  const router = useRouter();
  const context = useAiContextStore((s) => s.context);
  
  // Hide on pages that already have intense AI focus
  const hideOnPages = ['/study-companion', '/onboarding', '/sign-in', '/sign-up'];
  const shouldHide = hideOnPages.some((path) => pathname?.startsWith(path));
  
  // Update suggested prompts based on context
  useEffect(() => {
    const prompts = CONTEXT_PROMPTS[context.type] || CONTEXT_PROMPTS.idle;
    setSuggestedPrompts(prompts);
  }, [context.type]);
  
  // Get context-aware greeting
  const getContextGreeting = () => {
    switch (context.type) {
      case 'quiz':
        return `Need help with ${context.topic || 'this question'}?`;
      case 'pastPaper':
        return `Working on ${context.subject || 'past paper'}`;
      case 'snapAndSolve':
        return `Solving ${context.subject || 'math problem'}`;
      case 'lesson':
        return `Learning about ${context.topic || context.subject || 'this'}`;
      case 'curriculumMap':
        return `Exploring ${context.subject || 'curriculum'}`;
      default:
        return 'Hi! How can I help you study?';
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  if (shouldHide || !isVisible) return null;
  
  return (
    <>
      {/* ... existing overlay ... */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
      
      <div className="fixed bottom-32 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <m.div
              initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'mb-4 w-[calc(100vw-2rem)] md:w-80 shadow-2xl rounded-3xl overflow-hidden border flex flex-col',
                'bg-background/80 backdrop-blur-xl border-border/50 text-foreground'
              )}
            >
              {/* Context indicator */}
              {context.type !== 'idle' && (
                <div className="px-4 py-2 bg-violet-50 dark:bg-violet-950/30 border-b border-violet-100 dark:border-violet-900">
                  <p className="text-xs text-violet-700 dark:text-violet-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                    {getContextGreeting()}
                  </p>
                </div>
              )}
              
              {/* ... rest of chat UI ... */}
              <div className="p-4 border-b border-border/50 bg-secondary/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={SparklesIcon}
                      className="w-4 h-4 text-violet-600 dark:text-violet-400"
                    />
                  </div>
                  <h3 className="font-lexend font-bold text-sm">AI Companion</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 text-tiimo-gray-muted hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Suggested prompts based on context */}
              <div className="px-4 py-2 border-b border-border/30 flex gap-2 overflow-x-auto">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.push(`/study-companion?prompt=${encodeURIComponent(prompt)}`);
                    }}
                    className="whitespace-nowrap px-3 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              
              <div className="p-4 flex-1 min-h-[200px] flex flex-col bg-gradient-to-b from-transparent to-secondary/20">
                <div className="flex-1 space-y-4">
                  <div className="bg-card border border-border/50 rounded-2xl p-3 shadow-sm inline-block max-w-[90%]">
                    <p className="text-sm">{getContextGreeting()}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 border-t border-border/50 bg-card">
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    placeholder="Ask anything..."
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/study-companion');
                    }}
                    className="w-full bg-secondary/50 border border-border/50 focus:border-violet-500 rounded-full py-2.5 pl-4 pr-10 text-sm outline-none transition-all cursor-pointer"
                  />
                  <button
                    type="button"
                    className="absolute right-1 top-1 w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-md hover:bg-violet-700 transition"
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/study-companion');
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
        
        {/* ... existing orb button ... */}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AI/GlassOrb.tsx
git commit -m "feat: make Glass Orb context-aware"
```

---

## Chunk 4: Snap & Solve Learning Loop

### Task 4: Add Learning Loop Actions to SnapAndSolve

**Files:**
- Modify: `src/screens/SnapAndSolve.tsx`

- [ ] **Step 1: Import learning loop engine**

```typescript
import { 
  analyzeSolvedProblem, 
  generateFlashcardFromProblem,
  addProblemToStudyPlan,
  type LearningLoopAction 
} from '@/services/learningLoopEngine';
import { useSnapAndSolveContext } from '@/stores/useAiContextStore';
```

- [ ] **Step 2: Add action buttons after solving**

In the SnapAndSolve component, after a problem is solved, add:

```typescript
// After solution is shown
const [suggestedActions, setSuggestedActions] = useState<LearningLoopAction[]>([]);
const { startSolving, finishSolving } = useSnapAndSolveContext();

// When problem is solved
useEffect(() => {
  if (solution && subject) {
    analyzeSolvedProblem(problemText, solution, subject, topic || '')
      .then(setSuggestedActions)
      .catch(console.error);
    
    startSolving(subject, topic);
  }
  
  return () => finishSolving();
}, [solution]);

// Action handlers
const handleGenerateFlashcard = async () => {
  const card = await generateFlashcardFromProblem(
    problemText, 
    solution, 
    subject, 
    topic || '',
    userId
  );
  toast.success('Flashcard created!');
};

const handleAddToStudyPlan = async () => {
  await addProblemToStudyPlan(subject, topic || '', userId, 'medium');
  toast.success('Added to study plan!');
};

// Render action buttons
{suggestedActions.length > 0 && (
  <div className="mt-4 p-4 bg-secondary/50 rounded-xl">
    <p className="text-sm font-semibold mb-3">Continue Learning</p>
    <div className="flex flex-wrap gap-2">
      {suggestedActions.map((action, i) => (
        <Button
          key={i}
          variant="outline"
          size="sm"
          onClick={() => {
            switch (action.type) {
              case 'generateFlashcard':
                handleGenerateFlashcard();
                break;
              case 'addToStudyPlan':
                handleAddToStudyPlan();
                break;
              case 'findSimilarQuestions':
                router.push(`/past-papers?subject=${subject}&topic=${topic}`);
                break;
            }
          }}
        >
          {action.type === 'generateFlashcard' && <LayersIcon className="w-4 h-4 mr-1" />}
          {action.type === 'addToStudyPlan' && <CalendarIcon className="w-4 h-4 mr-1" />}
          {action.type === 'findSimilarQuestions' && <FileQuestionIcon className="w-4 h-4 mr-1" />}
          {action.title}
        </Button>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/screens/SnapAndSolve.tsx
git commit -m "feat: add learning loop actions to Snap & Solve"
```

---

## Chunk 5: Voice to Knowledge

### Task 5: Create Voice to Flashcard/Notes component

**Files:**
- Create: `src/components/Flashcard/VoiceToFlashcard.tsx`

- [ ] **Step 1: Create the voice to flashcard component**

```typescript
'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff, Wand2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { generateFlashcardsFromVoice, generateNotesFromConversation } from '@/services/learningLoopEngine';
import { toast } from 'sonner';

interface VoiceToFlashcardProps {
  subject?: string;
  onFlashcardsGenerated?: (cards: Array<{ front: string; back: string }>) => void;
}

export function VoiceToFlashcard({ subject, onFlashcardsGenerated }: VoiceToFlashcardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState<'flashcard' | 'notes'>('flashcard');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setTranscript(transcript);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };
  
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const processVoice = async () => {
    if (!transcript.trim()) {
      toast.error('No speech recorded');
      return;
    }
    
    setProcessing(true);
    
    try {
      if (mode === 'flashcard') {
        const cards = await generateFlashcardsFromVoice(transcript, subject);
        onFlashcardsGenerated?.(cards);
        toast.success(`Generated ${cards.length} flashcards!`);
      } else {
        const notes = await generateNotesFromConversation(transcript, subject);
        // Could open a dialog to show notes
        toast.success('Notes generated!');
      }
      
      setTranscript('');
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process voice');
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Voice to Knowledge</h3>
        <div className="flex gap-2">
          <Button
            variant={mode === 'flashcard' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('flashcard')}
          >
            <Wand2 className="w-4 h-4 mr-1" />
            Flashcards
          </Button>
          <Button
            variant={mode === 'notes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('notes')}
          >
            <FileText className="w-4 h-4 mr-1" />
            Notes
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </>
          )}
        </Button>
        
        {transcript && (
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">{transcript}</p>
          </div>
        )}
      </div>
      
      {transcript && (
        <Button 
          onClick={processVoice} 
          disabled={processing}
          className="w-full"
        >
          {processing ? 'Processing...' : `Generate ${mode === 'flashcard' ? 'Flashcards' : 'Notes'}`}
        </Button>
      )}
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Flashcard/VoiceToFlashcard.tsx
git commit -m "feat: add voice to knowledge conversion"
```

---

## Verification

- [ ] Test AI context updates when navigating between pages
- [ ] Verify Glass Orb shows context-specific prompts
- [ ] Test learning loop actions after Snap & Solve
- [ ] Test voice recording and flashcard generation
- [ ] Verify all components work together in the learning flow

---

## Future Enhancements (Out of Scope)

- Full integration with Voice Tutor page
- Push notifications for learning loop suggestions
- Analytics on learning loop engagement
- Collaborative study sessions with context sharing
