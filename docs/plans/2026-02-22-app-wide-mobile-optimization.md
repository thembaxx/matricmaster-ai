# App-Wide Mobile Optimization Plan

> **For Claude:** Apply the same mobile responsiveness patterns from Landing.tsx to all other screens in the application.

**Goal:** Apply consistent mobile responsiveness improvements across all screens using the same patterns implemented in Landing.tsx, ensuring no new errors are introduced.

**Architecture:** Create a systematic approach to apply the proven mobile patterns to all screens while maintaining existing functionality.

---

## Target Screens

The following screens need mobile optimization:

| Priority | Screen            | Path                               | Key Components                  |
| -------- | ----------------- | ---------------------------------- | ------------------------------- |
| 1        | Dashboard         | `src/screens/Dashboard.tsx`        | Stats cards, navigation, charts |
| 2        | Profile           | `src/screens/Profile.tsx`          | Form fields, avatar, settings   |
| 3        | Past Papers       | `src/screens/PastPapers.tsx`       | Grid/list, filters, search      |
| 4        | Lessons           | `src/screens/Lessons.tsx`          | Video player, content cards     |
| 5        | Leaderboard       | `src/screens/Leaderboard.tsx`      | Table, rankings                 |
| 6        | Achievements      | `src/screens/Achievements.tsx`     | Badges, progress, cards         |
| 7        | Bookmarks         | `src/screens/Bookmarks.tsx`        | Card list, actions              |
| 8        | Interactive Quiz  | `src/screens/InteractiveQuiz.tsx`  | Questions, options, timer       |
| 9        | Practice Quiz     | `src/screens/PracticeQuiz.tsx`     | Quiz interface                  |
| 10       | Math Quiz         | `src/screens/MathematicsQuiz.tsx`  | Math interface                  |
| 11       | Physics Quiz      | `src/screens/PhysicsQuiz.tsx`      | Physics interface               |
| 12       | Physical Sciences | `src/screens/PhysicalSciences.tsx` | Content, diagrams               |
| 13       | Other screens     | Various                            | Various components              |

---

## Pattern Reference: Landing.tsx Changes

Use these exact patterns from Landing.tsx:

### Typography

```tsx
// H1: text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl
// H2: text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl
// H3: text-xl sm:text-2xl
// Body: text-base (never text-lg on mobile)
```

### Buttons

```tsx
// Primary: h-12 lg:h-14 xl:h-16 text-base lg:text-lg
// Full width mobile: w-full sm:w-auto
// Rounded: rounded-2xl or rounded-xl
```

### Cards/Containers

```tsx
// Padding: p-6 sm:p-8
// Border radius: rounded-2xl sm:rounded-[2.5rem]
// Shadow: shadow-sm hover:shadow-2xl
```

### Grids

```tsx
// Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
// Gap: gap-4 sm:gap-6 lg:gap-8
```

### Touch Targets

```tsx
// Minimum: 44x44px (h-11 or larger)
// Social icons: w-11 h-11
```

### Layout

```tsx
// Main container: min-w-0 overflow-x-hidden
// Section padding: pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-24 lg:pb-32
// Page padding: px-4 sm:px-6
```

---

## Implementation Tasks

### Task 1: Dashboard Screen

**Files:**

- Modify: `src/screens/Dashboard.tsx`

Apply:

- Responsive grid for stats cards (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4)
- Button sizing (h-12 for actions)
- Card padding (p-6 sm:p-8)
- Navigation responsive behavior

### Task 2: Profile Screen

**Files:**

- Modify: `src/screens/Profile.tsx`

Apply:

- Form field responsiveness (h-12 for inputs)
- Avatar sizing (w-20 h-20 mobile, larger desktop)
- Settings list responsive spacing
- Button sizing

### Task 3: Past Papers Screen

**Files:**

- Modify: `src/screens/PastPapers.tsx`

Apply:

- Paper list/grid responsive (grid-cols-1 sm:grid-cols-2)
- Filter panel mobile-friendly
- Search input sizing
- Action buttons (download, view)

### Task 4: Lessons Screen

**Files:**

- Modify: `src/screens/Lessons.tsx`

Apply:

- Lesson card grid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3)
- Video player responsive width
- Content spacing mobile-friendly
- Progress indicators

### Task 5: Leaderboard Screen

**Files:**

- Modify: `src/screens/Leaderboard.tsx`

Apply:

- Table/list responsive (horizontal scroll or card view on mobile)
- User row touch targets (h-12 minimum)
- Filter/sort responsive

### Task 6: Achievements Screen

**Files:**

- Modify: `src/screens/Achievements.tsx`

Apply:

- Badge grid (grid-cols-3 sm:grid-cols-4 lg:grid-cols-6)
- Progress bars responsive width
- Card hover states preserved

### Task 7: Bookmarks Screen

**Files:**

- Modify: `src/screens/Bookmarks.tsx`

Apply:

- Bookmark cards responsive grid
- Action buttons touch-friendly
- Swipe actions on mobile

### Task 8: Quiz Screens (Interactive, Practice, Math, Physics)

**Files:**

- Modify: `src/screens/InteractiveQuiz.tsx`
- Modify: `src/screens/PracticeQuiz.tsx`
- Modify: `src/screens/MathematicsQuiz.tsx`
- Modify: `src/screens/PhysicsQuiz.tsx`

Apply:

- Question options (h-12 minimum, full width on mobile)
- Timer display responsive
- Progress bar mobile-friendly
- Next/Submit buttons (h-12)

### Task 9: Remaining Screens

**Files:**

- Modify: `src/screens/Channels.tsx`
- Modify: `src/screens/CMS.tsx`
- Modify: `src/screens/LanguageSelect.tsx`
- Modify: `src/screens/LessonComplete.tsx`
- Modify: `src/screens/ErrorHint.tsx`
- Modify: `src/screens/EnhancedTestQuiz.tsx`

Apply:

- Screen-specific component responsiveness
- Ensure all buttons meet 44x44px minimum
- Form inputs h-12 on mobile

---

## Common Components to Review

These shared components should be checked for mobile-friendliness:

1. **Buttons** - All button components in `src/components/ui/`
2. **Cards** - Card components used across screens
3. **Inputs** - Form input components
4. **Navigation** - Bottom nav, headers, sidebars

---

## Testing Checklist

After implementing changes to each screen:

1. Run: `bun run lint:fix` - Verify no linting errors
2. Test at 320px, 375px, 768px breakpoints
3. Verify no horizontal overflow
4. Check all touch targets ≥44x44px
5. Verify text readable at all sizes

---

## Success Criteria

After implementation, all screens will:

- ✅ Render properly at 320px - 1920px
- ✅ Have touch targets ≥44x44px
- ✅ Have readable typography (16px body minimum)
- ✅ No horizontal overflow
- ✅ Follow consistent responsive patterns
- ✅ Pass linting without errors
- ✅ Maintain existing functionality

---

**Plan saved to `docs/plans/2026-02-22-app-wide-mobile-optimization.md`**

Ready for implementation when user toggles to Act Mode.
