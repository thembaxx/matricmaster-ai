# Subject Map (Knowledge Graph) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an interactive Knowledge Graph using `reactflow` to visualize subject dependencies, track mastery, and implement a "Fog of War" for prerequisites.

**Architecture:**
- A `SubjectMap` component that transforms `TOPIC_PREREQUISITES` into ReactFlow nodes and edges.
- Integration with a mastery store/service to determine node state (Unknown, Learning, Mastered).
- Logic to filter visible nodes based on prerequisites (Fog of War).
- Custom node components for distinct styling based on mastery.

**Tech Stack:** React, `reactflow`, Tailwind CSS, TypeScript.

---

### Task 1: Types and Data Structure

**Files:**
- Create: `src/components/SubjectMap/types.ts`
- Modify: `src/services/topicPrerequisites.ts`

- [ ] **Step 1: Define SubjectMap types**
  Define `MasteryState` ('unknown' | 'learning' | 'mastered'), `MapNode`, and `MapEdge`.
- [ ] **Step 2: Export TOPIC_PREREQUISITES from service**
  Ensure the constants are exported so the component can build the graph.
- [ ] **Step 3: Commit**

### Task 2: SubjectMap Base Implementation

**Files:**
- Create: `src/components/SubjectMap/SubjectMap.tsx`
- Create: `src/components/SubjectMap/MapNode.tsx` (Custom Node)

- [ ] **Step 1: Install `reactflow`**
  Run `bun add reactflow` (or equivalent if already present, verify in package.json).
- [ ] **Step 2: Implement basic graph generation**
  Write a utility to convert `TOPIC_PREREQUISITES` into `reactflow` nodes and edges.
- [ ] **Step 3: Implement `MapNode` custom component**
  Create a node that displays the topic name and handles the "clickable" requirement.
- [ ] **Step 4: Build the `SubjectMap` wrapper**
  Implement the `ReactFlow` component with basic settings (zoom, pan).
- [ ] **Step 5: Commit**

### Task 3: Dynamic Styling and Mastery Integration

**Files:**
- Modify: `src/components/SubjectMap/MapNode.tsx`
- Modify: `src/components/SubjectMap/SubjectMap.tsx`

- [ ] **Step 1: Implement mastery-based styling**
  Update `MapNode` to accept a `mastery` prop and apply Tailwind classes (e.g., grayscale for unknown, glowing for learning, gold for mastered).
- [ ] **Step 2: Connect to mastery state**
  Mock or integrate with `progressService.ts` to pass the actual user mastery to nodes.
- [ ] **Step 3: Commit**

### Task 4: Fog of War Logic

**Files:**
- Modify: `src/components/SubjectMap/SubjectMap.tsx`

- [ ] **Step 1: Implement visibility logic**
  Create a function that checks if all `prerequisites` of a node are 'mastered'.
- [ ] **Step 2: Filter nodes and edges**
  Hide nodes (or mark as "locked") whose prerequisites are not met.
- [ ] **Step 3: Commit**

### Task 5: Navigation and App Integration

**Files:**
- Modify: `src/components/SubjectMap/MapNode.tsx`
- Create: `src/screens/SubjectMapScreen.tsx` (or similar)

- [ ] **Step 1: Implement node click handler**
  Use `useRouter` from `next/navigation` to navigate to `/lessons/[topic]` or equivalent when a node is clicked.
- [ ] **Step 2: Create a full-page screen for the map**
  Wrap `SubjectMap` in a screen component with proper padding (`pb-40` for navbar).
- [ ] **Step 3: Add to app navigation**
  Register the new screen in the main navigation menu.
- [ ] **Step 4: Commit**

### Task 6: Final Polish and Verification

- [ ] **Step 1: Run `bun run lint:fix`**
- [ ] **Step 2: Verify "Fog of War" transitions when mastery changes**
- [ ] **Step 3: Final Commit**
