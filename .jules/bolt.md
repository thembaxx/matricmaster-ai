# Bolt's Journal - Performance Learnings

## 2026-04-18 - Missing React.memo on Dashboard Components
**Learning:** SubjectCards.tsx lacked memoization despite being a pure presentational component that re-renders on every parent state change. Added React.memo() wrapper.

**Impact:** Prevents unnecessary re-renders when parent Dashboard component state changes (e.g., streak updates, accuracy changes, etc.)

**Action:** Check other dashboard components for missing memo - StatsCards.tsx, TopicMasteryCard.tsx also likely candidates.

---

## 2026-04-18 - Search Already Debounced  
**Learning:** Search.tsx already has 800ms debounce for API calls (line 74-97). No optimization needed there.

**Action:** Don't assume - always verify existing implementations first.

---

## 2026-04-18 - Component Memo Coverage Good
**Learning:** 81 components already use React.memo() - well covered.

**Action:** Focus on other optimization categories: virtualization for long lists, early returns, database indexes.