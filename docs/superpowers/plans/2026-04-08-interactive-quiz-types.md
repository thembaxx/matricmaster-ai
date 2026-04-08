# Interactive Question Types Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `DIAGRAM_FILL` and `CHRONOLOGICAL_SORT` interactive question types for the quiz system.

**Architecture:** 
- Update core quiz types to support new interaction modes.
- Create specialized components using `@dnd-kit` for drag-and-drop interactions.
- Extend `quizReducer` and `useQuizState` to handle structured answer data (mappings for diagrams, arrays for sorting) instead of just single strings.
- Update the `QuizContent` rendering logic to dispatch the correct component based on the question type.

**Tech Stack:** React, Next.js, Tailwind CSS, Framer Motion, @dnd-kit.

---

### Task 1: Type Definitions and State Extension

**Files:**
- Modify: `src/types/quiz.ts`
- Modify: `src/lib/quiz-reducer.ts`
- Modify: `src/components/Quiz/useQuizState.ts`

- [ ] **Step 1: Update `QuizAction` and `QuizState` in `src/types/quiz.ts`**
    - Add `DIAGRAM_FILL` and `CHRONOLOGICAL_SORT` to question type unions (if applicable, though they are currently defined in `AnyQuizQuestion` in `content/questions/quiz/types`).
    - Update `QuizState` to include `interactiveAnswer: any` (or a more specific union like `Record<<stringstring, string> | string[]`) to handle non-string answers.
    - Add `SET_INTERACTIVE_ANSWER` action to `QuizAction`.
- [ ] **Step 2: Update `quizReducer` in `src/lib/quiz-reducer.ts`**
    - Implement `SET_INTERACTIVE_ANSWER` to update the new state field.
    - Update `RESET_ANSWER_STATE` to clear `interactiveAnswer`.
- [ ] **Step 3: Update `useQuizState.ts` to handle interactive answer updates**
    - Create a helper `handleInteractiveSelect` that dispatches `SET_INTERACTIVE_ANSWER`.
- [ ] **Step 4: Commit**
    ```bash
    git add src/types/quiz.ts src/lib/quiz-reducer.ts src/components/Quiz/useQuizState.ts
    git commit -m "feat(quiz): add state support for interactive question types"
    ```

### Task 2: DraggableDiagram Component

**Files:**
- Create: `src/components/Quiz/DraggableDiagram.tsx`

- [ ] **Step 1: Implement `DraggableDiagram`**
    - Use `@dnd-kit/core` for `DndContext`, `useDraggable`, and `useDroppable`.
    - Implement a layout with a "Pool" of draggable labels and several "Zones" (droppable areas).
    - Support snapping labels to zones and moving them back to the pool.
    - Style with Tailwind CSS to match the "liquid glass" and "Tiimo" aesthetic.
    - Use Framer Motion for smooth entry animations.
- [ ] **Step 2: Commit**
    ```bash
    git add src/components/Quiz/DraggableDiagram.tsx
    git commit -m "feat(quiz): implement DraggableDiagram component"
    ```

### Task 3: TimelineSorter Component

**Files:**
- Create: `src/components/Quiz/TimelineSorter.tsx`

- [ ] **Step 1: Implement `TimelineSorter`**
    - Use `@dnd-kit/sortable` and `SortableContext` for vertical or horizontal sorting.
    - Implement a list of events that can be reordered by the user.
    - Add visual cues for the "timeline" (e.g., a vertical line or connector).
    - Ensure high-quality interaction feedback using Tailwind and Framer Motion.
- [ ] **Step 2: Commit**
    ```bash
    git add src/components/Quiz/TimelineSorter.tsx
    git commit -m "feat(quiz): implement TimelineSorter component"
    ```

### Task 4: Integration into Quiz Flow

**Files:**
- Modify: `src/components/Quiz/QuizContent.tsx`
- Modify: `src/components/Quiz/QuestionCardV2.tsx` (or create a wrapper)

- [ ] **Step 1: Update `QuizContent.tsx` rendering logic**
    - Add checks for `currentQuestion.type === 'DIAGRAM_FILL'` and `currentQuestion.type === 'CHRONOLOGICAL_SORT'`.
    - Render `DraggableDiagram` or `TimelineSorter` respectively.
    - Pass necessary props: `selectedOption` (as `interactiveAnswer`), `onSelectOption` (as `handleInteractiveSelect`), and `isChecked`.
- [ ] **Step 2: Update `handleCheck` in `useQuizState.ts`**
    - Implement validation logic for these types:
        - `DIAGRAM_FILL`: Compare the `interactiveAnswer` mapping against `currentQuestion.correctAnswer` (mapping).
        - `CHRONOLOGICAL_SORT`: Compare the sorted array against `currentQuestion.correctAnswer` (array).
    - Ensure `INCREMENT_CORRECT`/`INCREMENT_INCORRECT` are called based on the result.
- [ ] **Step 3: Commit**
    ```bash
    git add src/components/Quiz/QuizContent.tsx src/components/Quiz/useQuizState.ts
    git commit -m "feat(quiz): integrate interactive components into quiz flow"
    ```

### Task 5: Final Polish and Verification

- [ ] **Step 1: Visual Audit**
    - Verify that components follow the iOS HIG and project typography (Geist/Playfair Display).
    - Ensure no uppercase text in UI.
- [ ] **Step 2: Run Lint/Typecheck**
    - Run `bun run lint:fix`.
- [ ] **Step 3: Final Commit**
    ```bash
    git add .
    git commit -m "style(quiz): polish interactive question types"
    ```
