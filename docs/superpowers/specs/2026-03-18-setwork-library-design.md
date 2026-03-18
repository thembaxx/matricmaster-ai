# Setwork Library Design Specification

**Version:** 1.0  
**Date:** 2026-03-18  
**Feature:** Setwork Library

---

## Overview

A comprehensive literature study hub for NSC Grade 12 English students. Provides summaries, character analysis, theme exploration, and study tools for prescribed setworks, plus general literary analysis features.

---

## Goals

- Provide easy access to setwork summaries and analysis for NSC prescribed texts
- Enable active study through flashcards and quizzes
- Support essay writing practice with templates and AI feedback
- Build on existing AI tutor infrastructure

---

## Core Features

### 1. Setwork Library

**Location:** `/setwork-library`

**Initial Setworks (3 core texts):**
1. **Things Fall Apart** - Chinua Achebe (Novel)
2. **Cry, the Beloved Country** - Alan Paton (Novel)
3. **The Merchant of Venice** - William Shakespeare (Drama)

**Per Setwork:**
- Synopsis/Summary (short and detailed)
- Character profiles with descriptions
- Character relationship map
- Key themes with examples
- Important quotes with context
- Historical/cultural context

### 2. Analysis Tools

- **Character Explorer** - Browse all characters across setworks
- **Theme Comparator** - Compare themes across different texts
- **Quote Bank** - Searchable database of important quotes
- **Literary Devices Reference** - Glossary of literary terms with examples

### 3. Study Tools

- **Flashcards** - Auto-generated from characters, quotes, themes
- **Quiz Mode** - Multiple choice questions on plot, characters, themes
- **Essay Templates** - Structured templates for different essay types (literary analysis, comparative essay, contextual question)

### 4. AI Essay Practice

- **Essay Prompt Generator** - Generate practice essay questions
- **AI Feedback** - Submit practice essays for AI-powered feedback (uses existing AI tutor)
- **Essay Examples** - Sample essays with annotations

---

## Data Structure

```typescript
interface Setwork {
  id: string;
  title: string;
  author: string;
  genre: 'novel' | 'drama' | 'poetry' | 'short-story';
  year: number;
  targetLevel: 'HL' | 'FAL'; // Home Language or First Additional Language
  synopsis: string;
  context: string;
  characters: Character[];
  themes: Theme[];
  quotes: Quote[];
}

interface QuizQuestion {
  id: string;
  setworkId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting';
  description: string;
  relationships: { characterId: string; relationship: string }[];
}

interface Theme {
  id: string;
  name: string;
  description: string;
  examples: string[];
}

interface Quote {
  id: string;
  text: string;
  speaker: string;
  context: string;
  pageNumber?: number;
  themeIds: string[];
}
```

---

## Pages & Routes

```
/setwork-library
  /setwork-library          - Main hub with setwork cards
  /setwork-library/[id]    - Individual setwork detail
  /setwork-library/analysis - Analysis tools
  /setwork-library/quiz    - Quiz mode
  /setwork-library/essays  - Essay practice
```

---

## UI Components

1. **SetworkCard** - Card with cover, title, author, quick stats
2. **CharacterMap** - Interactive relationship visualization
3. **ThemeCard** - Expandable theme with examples
4. **QuoteCard** - Quote with speaker, context, tags
5. **FlashcardDeck** - Reviewable flashcards
6. **QuizEngine** - Multiple choice quiz component
7. **EssayEditor** - Rich text editor for essays
8. **AIFeedbackPanel** - AI feedback display

---

## Integration Points

- **AI Tutor**: Reuse existing `/ai-tutor` endpoint for essay feedback
- **Flashcards**: Extend existing flashcard system (`/flashcards`)
- **Database**: Store setwork data in existing database or JSON files

---

## Acceptance Criteria

- [ ] User can browse 3 setworks with summaries
- [ ] User can view character profiles and relationships
- [ ] User can explore themes with examples
- [ ] User can view and filter quotes
- [ ] User can generate flashcards from setwork content
- [ ] User can take quizzes on setwork content
- [ ] User can write practice essays and get AI feedback
- [ ] Responsive on mobile devices
- [ ] Works offline for reading summaries (after initial load)

---

## Files to Create/Modify

### New Files

- `src/app/setwork-library/page.tsx` - Main library page
- `src/app/setwork-library/[id]/page.tsx` - Individual setwork detail
- `src/app/setwork-library/analysis/page.tsx` - Analysis tools
- `src/app/setwork-library/quiz/page.tsx` - Quiz mode
- `src/app/setwork-library/essays/page.tsx` - Essay practice
- `src/data/setworks/*.json` - JSON data files for setworks
- `src/components/SetworkLibrary/*` - UI components

### Modified Files

- `src/components/Dashboard/SubjectGridV2.tsx` - Add quick link

---

## Technical Notes

### Flashcard Generation
Pre-generated JSON data in `src/data/setworks/` with character, quote, and theme flashcards. Each flashcard tagged with setwork ID for filtering.

### AI Essay Feedback
Reuse existing `/api/ai-tutor` endpoint with custom prompt:
- Input: Essay text + setwork topic
- Prompt: "Analyze this essay on [setwork] focusing on [question]. Provide feedback on: 1) Understanding of text, 2) Argument development, 3) Use of evidence, 4) Language and structure."
- Output: Structured feedback object

### Offline Support
Use Next.js static generation (SSG) for setwork pages. Add service worker for offline reading of cached content.

### Character Relationships
Use simple SVG-based relationship diagram with lines connecting related characters. No external library needed for basic implementation.
