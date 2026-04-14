# UI Enhancements Documentation

Documentation for all new UI components added as part of the enriched app prototype (Phase 5). All components live in `src/components/EnrichedDashboard/`.

---

## Design System Conventions

| Token | Value | Usage |
|-------|-------|-------|
| Font: Body | Geist (normal 400, medium 500, bold 700) | All body text, labels, descriptions |
| Font: Headings | Playfair Display | Section headings, card titles |
| Font: Numeric | Geist Mono | Numbers, statistics, percentages, dates |
| Color: primary | `--primary` | Primary actions, active states |
| Color: muted-foreground | `--muted-foreground` | Secondary text, labels |
| Color: tiimo-green | `--tiimo-green` | Positive indicators (improvement, success) |
| Color: tiimo-orange | `--tiimo-orange` | Warning indicators, hot streaks |
| Color: tiimo-yellow | `--tiimo-yellow` | Achievement highlights |
| Color: tiimo-lavender | `--tiimo-lavender` | Study session highlights |
| Color: destructive | `--destructive` | Negative indicators, weak topics |
| Color: border | `--border/50` | Subtle dividers and card borders |

All components use `Card`, `CardHeader`, `CardTitle`, and `CardContent` from `@/components/ui/card` as their structural wrapper. Motion animations use `framer-motion` (`m` import). All components respect `prefers-reduced-motion`.

---

## 1. ActivityHeatmap

**File:** `src/components/EnrichedDashboard/ActivityHeatmap.tsx`

### Purpose
GitHub-style contribution grid showing 6 months of daily study activity. Provides a visual density map of when the user studies most frequently.

### Props
```typescript
interface ActivityHeatmapProps {
  timeline: { date: string; count: number }[];
  totalDays: number;
}
```

| Prop | Type | Description |
|------|------|-------------|
| `timeline` | Array of `{date, count}` | Daily activity counts. Dates in `YYYY-MM-DD` format. |
| `totalDays` | number | Number of days with any activity (for display in header). |

### Responsive Behavior
- **Desktop (sm+):** Full 7-row grid with individual day cells (11px each). Month labels above columns. Tooltip on hover showing date and count.
- **Mobile (<640px):** Collapses to last 12 weeks only, with larger 20px cells aggregated per week. Tooltip shows weekly total.

### Accessibility
- `role="img"` with `aria-label` describing total activity count and period.
- Tooltips use shadcn `Tooltip` component with keyboard accessibility.
- Color scale uses 4 levels (empty, light, medium, full) with sufficient contrast against card background.
- Legend row ("Less" to "More") at bottom for color scale reference.

### Animation
- Each cell fades in with staggered delay (`weekIdx * 0.01s`) using `initial={{ opacity: 0, scale: 0.8 }}` -> `animate={{ opacity: 1, scale: 1 }}`.
- Respects `prefers-reduced-motion` (not applied in current implementation -- should be added).

### Color Palette
| Activity Count | Class | Visual |
|----------------|-------|--------|
| 0 | `bg-muted/40` | Muted gray (empty) |
| 1-2 | `bg-primary/30` | Light primary |
| 3-5 | `bg-primary/60` | Medium primary |
| 6+ | `bg-primary` | Full primary |

---

## 2. ProgressRings

**File:** `src/components/EnrichedDashboard/ProgressRings.tsx`

### Purpose
Circular progress indicators for each subject showing completion percentage, attempted count, and target. Tappable/clickable to expand for details.

### Props
```typescript
interface ProgressRingsProps {
  subjects: {
    name: string;
    color: string;
    progress: number;
    attempted: number;
    target: number;
  }[];
}
```

| Prop | Type | Description |
|------|------|-------------|
| `subjects` | Array of subject objects | Each subject has name, display color, progress percentage (0-100), attempted count, and target count. |

### Internal Components
- `Ring`: SVG-based circular progress with animated `stroke-dashoffset` via Framer Motion `useSpring` and `useTransform`.
- `SubjectRing`: Wrapper that handles compact (mobile) vs expanded (desktop) display modes.

### Responsive Behavior
- **Desktop (sm+):** Grid layout (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`). Each ring is 80px with expanded details on click.
- **Mobile (<640px):** Flex wrap with compact 56px rings. Tap to expand details inline.

### Accessibility
- Compact rings use `m.button` with `aria-label` reading "{name}: {progress}% complete, {attempted} of {target} attempted".
- `aria-expanded` toggles on expanded state.
- Keyboard support: Enter and Space trigger expand/collapse.
- Focus-visible ring with `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`.

### Animation
- SVG ring uses `useSpring(stiffness: 80, damping: 16)` for smooth animated progress.
- Expanded panel animates `opacity` and `height` on open.
- Respects `prefers-reduced-motion`.

### Typography
- Subject name: Playfair Display, small, bold, truncated.
- Attempted/target: Geist Mono, extra-small, muted.
- Progress percentage: Geist Mono, 10px, muted (compact mode).

---

## 3. ActivityStream

**File:** `src/components/EnrichedDashboard/ActivityStream.tsx`

### Purpose
Chronological feed of recent user activity grouped by date (Today, Yesterday, Last Week, or specific date). Shows quiz completions, flashcard reviews, study sessions, and achievements.

### Props
```typescript
interface ActivityStreamProps {
  activities: {
    type: 'quiz' | 'flashcard' | 'study' | 'achievement';
    title: string;
    detail: string;
    timestamp: Date;
    icon: string;
  }[];
}
```

| Prop | Type | Description |
|------|------|-------------|
| `activities` | Array of activity objects | Sorted by timestamp (newest first internally, but grouped by date in display). |

### Activity Types and Colors
| Type | Icon | Color Class |
|------|------|-------------|
| `quiz` | HelpCircleIcon | `bg-primary/10 text-primary` |
| `flashcard` | Layers02Icon | `bg-tiimo-green/10 text-tiimo-green` |
| `study` | BookOpen01Icon | `bg-tiimo-lavender/10 text-tiimo-lavender` |
| `achievement` | Medal01Icon | `bg-tiimo-yellow/10 text-tiimo-yellow` |

### Responsive Behavior
- Same layout on all breakpoints: vertical list with icon, text, and timestamp.
- Text truncation via `truncate` class on title and detail to prevent overflow.
- On empty state, shows centered illustration with "Your story begins here" message.

### Accessibility
- Icon containers have sufficient size for touch targets (8x8 = 32px).
- Time displayed in 12-hour format with AM/PM (South African locale `en-ZA`).
- Empty state has descriptive text for screen readers.
- `ActivityStreamSkeleton` exported for loading states.

### Animation
- Groups fade in with staggered delay (`groupIdx * 0.05s`).
- Individual items slide in from left (`x: -8` to `x: 0`) with additional stagger (`idx * 0.04s`).
- Uses `AnimatePresence` for enter/exit transitions.
- Respects `prefers-reduced-motion`.

---

## 4. AccuracyTrend

**File:** `src/components/EnrichedDashboard/AccuracyTrend.tsx`

### Purpose
Area chart showing accuracy percentage over time for a specific subject. Includes a change badge indicating improvement or decline, and a large current accuracy display.

### Props
```typescript
interface AccuracyTrendProps {
  data: { date: string; accuracy: number }[];
  subject: string;
  color: string;
}
```

| Prop | Type | Description |
|------|------|-------------|
| `data` | Array of `{date, accuracy}` | Time-series accuracy data. Dates in `YYYY-MM-DD` format. Accuracy as 0-100 percentage. |
| `subject` | string | Subject display name for title. |
| `color` | string | CSS color for chart line, gradient fill, and accuracy number. |

### Exports
- `AccuracyTrend`: Full card with area chart, badge, and large accuracy number.
- `AccuracySparkline`: Compact variant -- small area chart (48px height) suitable for subject headers or list items.

### Responsive Behavior
- **Full variant:** Chart takes available width with fixed 80px height. Large accuracy number on the right.
- **Sparkline variant:** Fixed 48px height, subject name and change indicator above, accuracy number below.

### Accessibility
- Recharts `ChartTooltip` with formatted labels (date + accuracy percentage).
- Change badge uses arrow icons (ArrowUp01Icon / ArrowDown01Icon) plus color for dual encoding.
- X-axis tick labels formatted as "13 Apr" style via `en-ZA` locale.
- Y-axis shows percentage suffix.

### Color Palette
- Chart gradient: `stopColor={color}` with opacity 0.3 at top fading to 0 at bottom.
- Improvement badge: `text-tiimo-green` with green border.
- Decline badge: `text-destructive` with red border.

### Animation
- Area chart `animationDuration={prefersReducedMotion ? 0 : 800}` for full, `600` for sparkline.

---

## 5. StreakCounter

**File:** `src/components/EnrichedDashboard/StreakCounter.tsx`

### Purpose
Displays the user's current study streak with a flame icon, best streak record, and contextual messaging to encourage continued study.

### Props
```typescript
interface StreakCounterProps {
  currentStreak: number;
  bestStreak: number;
  lastStudiedAt: Date;
}
```

| Prop | Type | Description |
|------|------|-------------|
| `currentStreak` | number | Consecutive days studied (0 = no streak yet). |
| `bestStreak` | number | Highest streak ever achieved. |
| `lastStudiedAt` | Date | Date of most recent activity. |

### State Logic
| Condition | Flame Color | Message | Animation |
|-----------|-------------|---------|-----------|
| `currentStreak === 0` | Muted gray | "Start your streak today!" | None |
| `daysSinceLastStudied > 1` (warning) | Muted gray | "Don't break the chain!" | None |
| `currentStreak > 7` and active | Orange (filled) | "You are on fire!" | Pulsing glow |
| Active streak (1-7 days) | Muted gray | "Keep it going!" | None |

### Animation
- Hot streak (7+ days, active): Flame icon pulses `scale: [1, 1.08, 1]` on infinite loop (2s duration).
- Two concentric glow rings pulse outward with staggered 0.75s delay.
- Streak increment triggers `scale: [1, 1.3, 1]` bounce on flame icon (600ms).
- Respects `prefers-reduced-motion`.

### Typography
- Streak number: Geist Mono, 3xl (text-3xl), bold.
- "days" label: Geist, sm, muted.
- Best streak: Geist Mono, xs, muted.
- Message: Geist, sm, medium weight, color varies (destructive for warning, tiimo-orange for hot streak).

---

## 6. WeakTopicHighlights

**File:** `src/components/EnrichedDashboard/WeakTopicHighlights.tsx`

### Purpose
Highlights up to 5 weakest topics sorted by accuracy, each with a progress bar and "Practice Now" CTA that navigates to the quiz for that topic.

### Props
```typescript
interface WeakTopicHighlightsProps {
  topics: {
    name: string;
    accuracy: number;
    attempted: number;
    suggestedAction: string;
  }[];
}
```

| Prop | Type | Description |
|------|------|-------------|
| `topics` | Array of topic objects | Each topic has name, accuracy percentage, attempted count, and suggested action string. |

### Rendering Logic
- Sorts topics by accuracy ascending, takes top 5.
- If more than 5 topics exist, shows "View All" button linking to `/curriculum-map`.
- Returns `null` if no topics provided.

### Gradient Backgrounds by Accuracy
| Accuracy Range | Gradient Class | Progress Bar Color |
|----------------|----------------|-------------------|
| < 30% | `from-destructive/20 to-destructive/5` | `bg-destructive` |
| 30-49% | `from-tiimo-orange/20 to-tiimo-orange/5` | `bg-tiimo-orange` |
| 50%+ | `from-muted/20 to-muted/5` | Default |

### Responsive Behavior
- Single column vertical stack on all breakpoints.
- Each topic card: topic name + accuracy badge on top row, progress bar + CTA on second row, suggested action text below.
- "Practice Now" button navigates to `/quiz?topic={encoded topic name}`.
- "View All" button navigates to `/curriculum-map`.

### Accessibility
- Target01Icon in header for visual identification.
- Progress bars use shadcn `Progress` component (has built-in ARIA roles).
- CTA buttons are real `Button` elements with proper click handlers.
- Suggested action text provides actionable context for screen readers.

### Animation
- Each topic card fades in and slides from left with staggered delay (`idx * 0.06s`).
- Respects `prefers-reduced-motion`.

---

## 7. CohortComparison

**File:** `src/components/EnrichedDashboard/CohortComparison.tsx`

### Purpose
Bar chart comparing the user's accuracy to the cohort average, with percentile ranking and contextual messaging.

### Props
```typescript
interface CohortComparisonProps {
  userAccuracy: number;
  cohortAverage: number;
  percentile: number;
}
```

| Prop | Type | Description |
|------|------|-------------|
| `userAccuracy` | number | User's overall accuracy percentage (0-100). |
| `cohortAverage` | number | Average accuracy across the peer cohort (0-100). |
| `percentile` | number | User's percentile rank within the cohort (0-100). |

### Chart Data
```typescript
const data = [
  { label: 'You', value: userAccuracy, fill: '#3B82F6' },
  { label: 'Average', value: cohortAverage, fill: '#94A3B8' },
];
```

### Percentile Messaging
| Percentile | Message |
|------------|---------|
| >= 90 | "You're in the top 10%! Outstanding work." |
| 75-89 | "You're in the top 25%! Keep pushing forward." |
| 50-74 | "You're above average. Great progress!" |
| < 50 | "Keep studying - you are improving every day." |

### Visual Elements
- Bar chart with two bars: user (blue `#3B82F6`) and average (slate `#94A3B8`).
- Reference line at cohort average level with dashed stroke and label.
- Summary panel showing user accuracy (large, primary color) and percentile (large, numeric font).
- Difference indicator with trend icon (rotates 180 degrees if below average).

### Responsive Behavior
- Chart uses `ResponsiveContainer` from Recharts -- adapts to parent width.
- Fixed 96px chart height.
- Summary panel and difference indicator stack vertically.

### Accessibility
- TrendIcon rotation (180 degrees for below average) provides dual encoding with text.
- Difference shown with `+` prefix for above average, no prefix for below.
- All numbers use Geist Mono font for consistent rendering.

### Animation
- Bar chart `animationDuration={prefersReducedMotion ? 0 : 800}`.

---

## Component Composition on Dashboard

```
Dashboard Page
+-- ActivityHeatmap (full width)
+-- StreakCounter (1/3 width) + ProgressRings (2/3 width) [side by side on desktop, stacked on mobile]
+-- ActivityStream (full width)

Subject Detail Page
+-- AccuracyTrend (full width)
+-- WeakTopicHighlights (full width)
+-- CohortComparison (full width)
```

## Shared Patterns

| Pattern | Implementation |
|---------|---------------|
| Card wrapper | All components use `Card > CardHeader > CardContent` |
| Title style | `text-base font-bold` on `CardTitle` |
| Numeric font | `font-numeric` class (Geist Mono) on all numbers |
| Heading font | `var(--font-playfair)` on subject names |
| Motion | `m.div`, `m.button` from framer-motion with `prefers-reduced-motion` guard |
| Color utilities | `cn()` from `@/lib/utils` for conditional class merging |
| Icon library | `@hugeicons/core-free-icons` + `@hugeicons/react` |
| Chart library | `recharts` with `ChartContainer` from shadcn/ui |
