# AI Study Buddy Chat Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-featured conversational AI chat with persistence, personalization, and floating widget

**Architecture:** 
- Next.js app router with API routes for chat
- Drizzle ORM for database operations
- Zustand for client-side state
- Gemini API for AI responses with personalized context

**Tech Stack:** Next.js 16, Drizzle ORM, Zustand, Gemini API, shadcn/ui

---

## File Structure

### New Files to Create

1. **Database Schema:** `src/lib/db/schema-ai-chat.ts`
   - `aiChatSessions` table: id, userId, title, subject, createdAt, updatedAt
   - `aiChatMessages` table: id, sessionId, role, content, createdAt

2. **Database Export:** Modify `src/lib/db/index.ts` to export new schema

3. **Zustand Store:** `src/stores/useChatStore.ts`
   - Current session state
   - Message list
   - Loading states
   - Widget open/close state

4. **API Routes:**
   - `src/app/api/chat/sessions/route.ts` - CRUD for sessions
   - `src/app/api/chat/messages/route.ts` - CRUD for messages
   - `src/app/api/ai-chat/route.ts` - Send message, get AI response

5. **Chat Service:** `src/services/chatService.ts`
   - getUserContext() - fetch weak areas, confidence scores, mistakes
   - buildSystemPrompt() - construct personalized system prompt
   - sendMessage() - call Gemini with context

6. **Chat Components:**
   - `src/components/Chat/ChatPage.tsx` - Main chat page
   - `src/components/Chat/ChatWindow.tsx` - Message display
   - `src/components/Chat/ChatInput.tsx` - Input with subject selector
   - `src/components/Chat/ChatHistory.tsx` - Past conversations
   - `src/components/Chat/FloatingWidget.tsx` - Floating mini chat

7. **Page Route:** `src/app/chat/page.tsx`

---

## Implementation Tasks

### Phase 1: Database Schema

#### Task 1: Create AI Chat Schema

**Files:**
- Create: `src/lib/db/schema-ai-chat.ts`

- [ ] **Step 1: Create the schema file**

```typescript
import { relations } from 'drizzle-orm';
import { pgTable, uuid, text, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './schema';

export const aiChatSessions = pgTable(
  'ai_chat_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 200 }).notNull(),
    subject: varchar('subject', { length: 50 }).notNull().default('general'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('ai_chat_sessions_user_id_idx').on(table.userId),
    updatedAtIdx: index('ai_chat_sessions_updated_at_idx').on(table.updatedAt),
  })
);

export const aiChatMessages = pgTable(
  'ai_chat_messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => aiChatSessions.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 20 }).notNull(), // 'user' | 'assistant'
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    sessionIdIdx: index('ai_chat_messages_session_id_idx').on(table.sessionId),
    createdAtIdx: index('ai_chat_messages_created_at_idx').on(table.createdAt),
  })
);

export const aiChatSessionsRelations = relations(aiChatSessions, ({ many }) => ({
  messages: many(aiChatMessages),
}));

export const aiChatMessagesRelations = relations(aiChatMessages, ({ one }) => ({
  session: one(aiChatSessions, {
    fields: [aiChatMessages.sessionId],
    references: [aiChatSessions.id],
  }),
}));

export type AiChatSession = typeof aiChatSessions.$inferSelect;
export type NewAiChatSession = typeof aiChatSessions.$inferInsert;
export type AiChatMessage = typeof aiChatMessages.$inferSelect;
export type NewAiChatMessage = typeof aiChatMessages.$inferInsert;
```

- [ ] **Step 2: Export from db index**

Modify: `src/lib/db/index.ts` - add exports for new schema

---

### Phase 2: Chat Service

#### Task 2: Create Chat Service

**Files:**
- Create: `src/services/chatService.ts`

- [ ] **Step 1: Write chat service with personalization**

```typescript
'use server';

import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { aiChatSessions, aiChatMessages } from '@/lib/db/schema-ai-chat';
import { topicConfidence, conceptStruggles, mistakeBank } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getBuddyProfile } from './buddyActions';

async function getDb() {
  const connected = await dbManager.waitForConnection(3, 2000);
  if (!connected) throw new Error('Database not available');
  return dbManager.getDb();
}

export interface UserContext {
  weakAreas: string[];
  confidenceScores: { topic: string; subject: string; score: number }[];
  personality: string;
  recentMistakes: string[];
}

async function getUserContext(): Promise<UserContext> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');

  const db = await getDb();

  // Get weak areas (struggling concepts)
  const struggles = await db.query.conceptStruggles.findMany({
    where: eq(conceptStruggles.userId, session.user.id),
    limit: 10,
  });

  // Get confidence scores
  const confidence = await db.query.topicConfidence.findMany({
    where: eq(topicConfidence.userId, session.user.id),
    limit: 20,
  });

  // Get personality
  const buddyProfile = await getBuddyProfile();

  // Get recent mistakes from mistake bank
  const mistakes = await db.query.mistakeBank.findMany({
    where: eq(mistakeBank.userId, session.user.id),
    orderBy: [desc(mistakeBank.createdAt)],
    limit: 10,
  });

  return {
    weakAreas: struggles.map(s => s.concept),
    confidenceScores: confidence.map(c => ({
      topic: c.topic,
      subject: c.subject,
      score: Number.parseFloat(String(c.confidenceScore)),
    })),
    personality: buddyProfile?.personality || 'mentor',
    recentMistakes: mistakes.map(m => m.question),
  };
}

export function buildSystemPrompt(userContext: UserContext, subject: string): string {
  const personalityPrompts: Record<string, string> = {
    mentor: 'You are a patient, experienced mentor who guides students to discover answers themselves.',
    tutor: 'You are a knowledgeable tutor who provides clear, structured explanations.',
    friend: 'You are a friendly study buddy who explains things in a casual, relatable way.',
  };

  const personalityPrompt = personalityPrompts[userContext.personality] || personalityPrompts.mentor;

  const weakAreasContext = userContext.weakAreas.length > 0
    ? `\nThe student is currently struggling with: ${userContext.weakAreas.join(', ')}`
    : '';

  const confidenceContext = userContext.confidenceScores
    .filter(c => c.score < 0.5)
    .slice(0, 5)
    .map(c => `${c.topic} (${c.subject}): ${Math.round(c.score * 100)}% confidence`)
    .join(', ');

  const lowConfidenceContext = confidenceContext
    ? `\nTopics where confidence is low: ${confidenceContext}`
    : '';

  const recentMistakesContext = userContext.recentMistakes.length > 0
    ? `\nRecent mistakes to address: ${userContext.recentMistakes.slice(0, 3).join('; ')}`
    : '';

  return `You are an AI Study Buddy for South African NSC Grade 12 students.
${personalityPrompt}
Current subject focus: ${subject}
${weakAreasContext}
${lowConfidenceContext}
${recentMistakesContext}

Guidelines:
- Use the student's weak areas to provide targeted explanations
- For low-confidence topics, explain more foundational concepts first
- Support all NSC subjects: Mathematics, Physical Sciences, Life Sciences, Geography, History, English, Afrikaans, etc.
- When explaining, use examples from the South African curriculum
- Keep explanations concise but thorough
- If the student asks about something outside academic topics, politely redirect
- Format math and science clearly using markdown`;
}

export async function createSession(subject: string = 'general'): Promise<{ id: string; title: string }> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');

  const db = await getDb();
  const [newSession] = await db.insert(aiChatSessions).values({
    userId: session.user.id,
    title: 'New Conversation',
    subject,
  }).returning();

  return { id: newSession.id, title: newSession.title };
}

export async function getSessions(): Promise<{ id: string; title: string; subject: string; updatedAt: Date }[]> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');

  const db = await getDb();
  const results = await db.query.aiChatSessions.findMany({
    where: eq(aiChatSessions.userId, session.user.id),
    orderBy: [desc(aiChatSessions.updatedAt)],
    limit: 20,
  });

  return results.map(r => ({
    id: r.id,
    title: r.title,
    subject: r.subject,
    updatedAt: r.updatedAt,
  }));
}

export async function getSessionMessages(sessionId: string): Promise<{ id: string; role: string; content: string; createdAt: Date }[]> {
  const auth = await getAuth();
  const authSession = await auth.api.getSession();
  if (!authSession?.user) throw new Error('Unauthorized');

  const db = await getDb();
  const messages = await db.query.aiChatMessages.findMany({
    where: eq(aiChatMessages.sessionId, sessionId),
    orderBy: [aiChatMessages.createdAt],
  });

  return messages.map(m => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt,
  }));
}

export async function saveMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<void> {
  const auth = await getAuth();
  const authSession = await auth.api.getSession();
  if (!authSession?.user) throw new Error('Unauthorized');

  const db = await getDb();
  await db.insert(aiChatMessages).values({ sessionId, role, content });

  // Update session timestamp
  await db.update(aiChatSessions)
    .set({ updatedAt: new Date() })
    .where(eq(aiChatSessions.id, sessionId));
}

export async function updateSessionTitle(sessionId: string, title: string): Promise<void> {
  const db = await getDb();
  await db.update(aiChatSessions)
    .set({ title, updatedAt: new Date() })
    .where(eq(aiChatSessions.id, sessionId));
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = await getDb();
  await db.delete(aiChatSessions).where(eq(aiChatSessions.id, sessionId));
}
```

- [ ] **Step 2: Add Gemini API call to service**

Add to `src/services/chatService.ts`:

```typescript
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';

export async function getAIResponse(
  messages: { role: string; content: string }[],
  userContext: UserContext,
  subject: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt(userContext, subject);

  const conversationHistory = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' as const : 'user' as const,
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: conversationHistory,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
}
```

---

### Phase 3: Zustand Store

#### Task 3: Create Chat Store

**Files:**
- Create: `src/stores/useChatStore.ts`

- [ ] **Step 1: Write Zustand store**

```typescript
import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface ChatState {
  // Current session
  currentSessionId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  
  // Widget state
  isWidgetOpen: boolean;
  
  // Actions
  setCurrentSession: (id: string | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  toggleWidget: () => void;
  setWidgetOpen: (open: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentSessionId: null,
  messages: [],
  isLoading: false,
  isWidgetOpen: false,

  setCurrentSession: (id) => set({ currentSessionId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (loading) => set({ isLoading: loading }),
  toggleWidget: () => set((state) => ({ isWidgetOpen: !state.isWidgetOpen })),
  setWidgetOpen: (open) => set({ isWidgetOpen: open }),
  clearChat: () => set({ currentSessionId: null, messages: [] }),
}));
```

---

### Phase 4: API Routes

#### Task 4: Create API Routes

**Files:**
- Create: `src/app/api/chat/sessions/route.ts`
- Create: `src/app/api/chat/messages/route.ts`
- Create: `src/app/api/ai-chat/route.ts`

- [ ] **Step 1: Sessions API**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createSession, getSessions, deleteSession } from '@/services/chatService';

export async function GET() {
  try {
    const sessions = await getSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const subject = body.subject || 'general';
    const session = await createSession(subject);
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }
    await deleteSession(sessionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Messages API**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSessionMessages, getSessions } from '@/services/chatService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (sessionId) {
      const messages = await getSessionMessages(sessionId);
      return NextResponse.json(messages);
    }
    
    const sessions = await getSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
```

- [ ] **Step 3: AI Chat API**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUserContext, saveMessage, getSessionMessages, updateSessionTitle } from '@/services/chatService';
import { getAIResponse } from '@/services/chatService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, subject } = body;

    if (!sessionId || !message) {
      return NextResponse.json({ error: 'Session ID and message required' }, { status: 400 });
    }

    // Save user message
    await saveMessage(sessionId, 'user', message);

    // Get conversation history
    const history = await getSessionMessages(sessionId);
    
    // Get user context for personalization
    const userContext = await getUserContext();

    // Get AI response
    const aiResponse = await getAIResponse(
      [...history, { role: 'user', content: message }],
      userContext,
      subject || 'general'
    );

    // Save AI response
    await saveMessage(sessionId, 'assistant', aiResponse);

    // Update session title if first message
    if (history.length === 0) {
      const title = message.slice(0, 50) + (message.length > 50 ? '...' : '');
      await updateSessionTitle(sessionId, title);
    }

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
  }
}
```

---

### Phase 5: Chat Components

#### Task 5: Create Chat UI Components

**Files:**
- Create: `src/components/Chat/ChatPage.tsx`
- Create: `src/components/Chat/ChatWindow.tsx`
- Create: `src/components/Chat/ChatInput.tsx`
- Create: `src/components/Chat/ChatHistory.tsx`
- Create: `src/components/Chat/FloatingWidget.tsx`

- [ ] **Step 1: ChatPage component**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { ChatWindow } from './ChatWindow';
import { ChatInput } from './ChatInput';
import { ChatHistory } from './ChatHistory';
import { useChatStore } from '@/stores/useChatStore';
import { createSession, getSessions, getSessionMessages } from '@/services/chatService';
import { Card } from '@/components/ui/card';

const SUBJECTS = [
  { value: 'general', label: 'General' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'physical-sciences', label: 'Physical Sciences' },
  { value: 'life-sciences', label: 'Life Sciences' },
  { value: 'geography', label: 'Geography' },
  { value: 'history', label: 'History' },
  { value: 'english', label: 'English' },
  { value: 'afrikaans', label: 'Afrikaans' },
];

export function ChatPage() {
  const { currentSessionId, setCurrentSession, messages, setMessages, isLoading, setLoading } = useChatStore();
  const [subject, setSubject] = useState('general');
  const [sessions, setSessions] = useState<{ id: string; title: string; subject: string; updatedAt: Date }[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      const data = await fetch('/api/chat/messages').then(r => r.json());
      if (data.sessions) setSessions(data.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }

  async function startNewChat() {
    setLoading(true);
    try {
      const session = await createSession(subject);
      setCurrentSession(session.id);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadSession(sessionId: string) {
    setLoading(true);
    try {
      const data = await fetch(`/api/chat/messages?sessionId=${sessionId}`).then(r => r.json());
      setCurrentSession(sessionId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4">
      {/* Sidebar - History */}
      <div className={`${showHistory ? 'w-64' : 'w-0'} transition-all overflow-hidden`}>
        <ChatHistory 
          sessions={sessions} 
          currentSessionId={currentSessionId}
          onSelectSession={loadSession}
          onNewChat={startNewChat}
        />
      </div>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-muted rounded-lg"
            >
              ☰
            </button>
            <h1 className="font-display text-xl font-bold">Study Buddy</h1>
          </div>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-1.5 rounded-lg border bg-background text-sm"
          >
            {SUBJECTS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Messages */}
        <ChatWindow messages={messages} isLoading={isLoading} />

        {/* Input */}
        <ChatInput 
          sessionId={currentSessionId}
          subject={subject}
          onMessageSent={loadSessions}
        />
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: ChatWindow component**

```typescript
'use client';

import { useRef, useEffect } from 'react';
import { useChatStore, type ChatMessage } from '@/stores/useChatStore';
import { cn } from '@/lib/utils';

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md'
        )}
      >
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        <div className={cn(
          'text-xs mt-1 opacity-60',
          isUser ? 'text-right' : 'text-left'
        )}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export function ChatWindow({ messages, isLoading }: { messages: ChatMessage[]; isLoading: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages.length && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-2">👋 Start a conversation</p>
          <p className="text-sm">Ask me anything about your studies!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
```

- [ ] **Step 3: ChatInput component with Suggested Questions**

```typescript
'use client';

import { useState } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SendIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface ChatInputProps {
  sessionId: string | null;
  subject: string;
  onMessageSent: () => void;
  suggestedQuestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  "Help me understand this concept",
  "Give me a practice question",
  "Explain this in a different way",
  "What are the key points to remember?",
];

export function ChatInput({ sessionId, subject, onMessageSent, suggestedQuestions = DEFAULT_SUGGESTIONS }: ChatInputProps) {
  const [input, setInput] = useState('');
  const { addMessage, setLoading, messages } = useChatStore();

  async function handleSend(overrideMessage?: string) {
    const messageToSend = overrideMessage || input.trim();
    if (!messageToSend || !sessionId) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: messageToSend,
      createdAt: new Date(),
    };

    addMessage(userMessage);
    if (!overrideMessage) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMessage.content,
          subject,
        }),
      });

      const data = await response.json();
      
      if (data.response) {
        addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          createdAt: new Date(),
        });
        onMessageSent();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  }

  const showSuggestions = messages.length === 0;

  return (
    <div className="p-4 border-t space-y-3">
      {showSuggestions && (
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="min-h-[44px] max-h-32 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={() => handleSend()} disabled={!input.trim() || !sessionId} size="icon">
          <HugeiconsIcon icon={SendIcon} className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: ChatHistory component**

```typescript
'use client';

import { formatDistanceToNow } from 'date-fns';

interface Session {
  id: string;
  title: string;
  subject: string;
  updatedAt: Date;
}

interface ChatHistoryProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

export function ChatHistory({ sessions, currentSessionId, onSelectSession, onNewChat }: ChatHistoryProps) {
  return (
    <div className="h-full bg-muted/30 rounded-lg p-3">
      <button
        onClick={onNewChat}
        className="w-full mb-4 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        + New Chat
      </button>

      <div className="space-y-1">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
              currentSessionId === session.id
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted'
            }`}
          >
            <div className="font-medium truncate">{session.title}</div>
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>{session.subject}</span>
              <span>{formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: FloatingWidget component**

```typescript
'use client';

import { useState } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { XIcon, MessageIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { ChatWindow } from './ChatWindow';
import { ChatInput } from './ChatInput';

export function FloatingWidget() {
  const { isWidgetOpen, toggleWidget, messages, isLoading } = useChatStore();
  const [sessionId, setSessionId] = useState<string | null>(null);

  async function startChat() {
    try {
      const res = await fetch('/api/chat/sessions', { method: 'POST' });
      const data = await res.json();
      setSessionId(data.id);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  }

  if (!isWidgetOpen) {
    return (
      <button
        onClick={toggleWidget}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-50"
      >
        <HugeiconsIcon icon={MessageIcon} className="w-6 h-6" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-20 right-4 w-80 h-96 flex flex-col shadow-xl z-50 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium">Study Buddy</h3>
        <button onClick={toggleWidget} className="p-1 hover:bg-muted rounded">
          <HugeiconsIcon icon={XIcon} className="w-4 h-4" />
        </button>
      </div>

      {!sessionId ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <Button onClick={startChat}>Start Chat</Button>
        </div>
      ) : (
        <>
          <ChatWindow messages={messages} isLoading={isLoading} />
          <ChatInput
            sessionId={sessionId}
            subject="general"
            onMessageSent={() => {}}
          />
        </>
      )}
    </Card>
  );
}
```

- [ ] **Step 6: Commit all chat components**

---

### Phase 6: Page Route & Integration

#### Task 6: Create Page and Integrate

**Files:**
- Create: `src/app/chat/page.tsx`

- [ ] **Step 1: Create chat page**

```typescript
import { ChatPage } from '@/components/Chat/ChatPage';

export default function Chat() {
  return <ChatPage />;
}
```

- [ ] **Step 2: Add navigation link**

Modify: `src/components/Layout/AppLayout.tsx`

Add a nav item for the chat page in the sidebar navigation:

```tsx
// Add import
import { FloatingWidget } from '@/components/Chat/FloatingWidget';

// Add nav item (find existing nav items and add near other features)
<NavItem href="/chat" icon={MessageIcon}>Study Buddy</NavItem>

// Add FloatingWidget before the closing tag
<FloatingWidget />
```

Example nav item addition (insert after existing nav items):
```tsx
<div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer">
  <HugeiconsIcon icon={MessageIcon01Icon} className="w-5 h-5" />
  <Link href="/chat" className="text-sm font-medium">Study Buddy</Link>
</div>
```

- [ ] **Step 3: Add FloatingWidget to layout**

Modify: `src/components/Layout/AppLayout.tsx`

```tsx
import { FloatingWidget } from '@/components/Chat/FloatingWidget';

// Add inside the main layout component, before the closing </div>
<div className="relative min-h-screen">
  {/* ... existing layout content ... */}
  <FloatingWidget />
</div>
```

Or if using a portal/overlay pattern, add to the overlay layer at the bottom of the layout.

---

### Phase 7: Testing & Verification

- [ ] **Step 1: Run typecheck**
```
bun run typecheck
```

- [ ] **Step 2: Run lint**
```
bun run lint
```

- [ ] **Step 3: Test in browser**
- Navigate to /chat
- Start new conversation
- Send a message
- Verify AI responds
- Check messages persist on refresh
- Test floating widget

---

## Summary

This plan implements a full-featured AI Study Buddy Chat with:

1. ✅ Database schema for sessions and messages
2. ✅ Personalized AI responses based on user context
3. ✅ Chat history and persistence
4. ✅ Subject selection
5. ✅ Floating widget for quick access
6. ✅ All backed by existing infrastructure (buddyActions, confidence tracking)
