# AI Study Buddy Chat - Design Specification

**Date:** 2026-03-18  
**Feature:** AI Study Buddy Chat  
**Status:** Approved

---

## Overview

A full-featured conversational AI chat interface that provides personalized tutoring based on the user's learning data (weak areas, confidence scores, mistakes). The chat persists conversations and supports all NSC subjects.

---

## Core Features

### 1. Chat Page (`/chat`)
- Full-page chat interface with message history
- Subject selector dropdown
- New chat / continue past chat functionality
- Suggested questions based on user's weak areas

### 2. Message Persistence
- Store all conversations in database
- Chat sessions with title, subject, timestamps
- Chat messages with role (user/assistant), content, timestamps

### 3. Full Personalization
- Include user's weak areas in AI context
- Reference confidence scores for topic explanations
- Include recent mistakes in explanations when relevant

### 4. Floating Widget
- Quick-access mini chat on any page
- Toggle open/close
- Uses same backend as full page

---

## Data Model

### New Database Tables

```typescript
// ChatSession
{
  id: string;
  userId: string;
  title: string;
  subject: string;
  createdAt: Date;
  updatedAt: Date;
}

// ChatMessage
{
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}
```

### Integration with Existing
- `topicConfidence` - Get user's confidence scores
- `conceptStruggles` - Get user's weak areas
- `studyBuddyProfiles` - Get buddy personality
- `buddyActions` - Existing service functions

---

## Architecture

### Frontend
- `src/app/chat/page.tsx` - Main chat page
- `src/components/Chat/ChatWindow.tsx` - Chat message display
- `src/components/Chat/ChatInput.tsx` - Input with subject selector
- `src/components/Chat/ChatHistory.tsx` - Past conversations sidebar
- `src/components/Chat/FloatingWidget.tsx` - Mini floating chat
- `src/stores/useChatStore.ts` - Zustand store for chat state

### Backend
- `src/app/api/chat/route.ts` - Send message, get AI response
- `src/app/api/chat/sessions/route.ts` - CRUD for chat sessions
- `src/app/api/chat/messages/route.ts` - CRUD for messages

### AI Integration
- Enhanced system prompt with user context
- Subject-specific tutoring
- Adaptive explanations based on confidence levels

---

## UI/UX Specification

### Chat Page Layout
- Left sidebar: Chat history (collapsible on mobile)
- Main area: Chat messages + input
- Header: Subject selector, new chat button

### Message Bubbles
- User messages: Right-aligned, primary color background
- Assistant messages: Left-aligned, neutral background
- Timestamp on hover
- Markdown support for code/math

### Input Area
- Multi-line text input
- Subject dropdown selector
- Send button
- Suggested questions chips

### Floating Widget
- Bottom-right corner, above navbar
- Expandable to show chat
- Minimized: Buddy avatar icon
- Expanded: Mini chat interface

---

## Personalization Context

The AI receives this context about the user:

```typescript
{
  weakAreas: string[];           // From conceptStruggles
  confidenceScores: {            // From topicConfidence
    topic: string;
    score: number;
  }[];
  recentMistakes: string[];     // From mistakeBank
  personality: 'mentor' | 'tutor' | 'friend';
  preferredSubjects: string[];  // From user preferences
}
```

---

## Acceptance Criteria

1. ✅ User can start a new chat session
2. ✅ User can continue past conversations
3. ✅ Chat messages persist across sessions
4. ✅ AI responds with personalized context
5. ✅ User can switch subjects mid-chat
6. ✅ Suggested questions based on weak areas
7. ✅ Floating widget provides quick access
8. ✅ Works offline with cached data

---

## Implementation Priority

1. Create database tables
2. Build chat API endpoints
3. Create chat page UI
4. Add floating widget
5. Integrate personalization context
6. Add suggested questions
