# UI/UX Pro Max Audit Implementation Tasks

- [x] **Typography & Case Fixes**
    - [x] Purge all `uppercase` Tailwind classes from codebase (Systematic cleanup of Dashboard, Profile, and Analytics)
    - [x] Ensure all digit displays use `.font-numeric` (Geist Mono) in key components
    - [x] Update stat labels to `label-xs` or `label-sm` for accessibility and consistent sizing
    - [x] Standardize heading uses to use semantic classes (`heading-1`, `text-display`, etc.)
    - [x] Lowercase all UI text in content files (`landing.ts`, `subjects.json`, `exam-dates.ts`, `achievements.ts`)

- [ ] **Spacing & Layout Consistency**
    - [ ] Standardize section paddings using `--space-*` tokens
    - [ ] Align card paddings to the 4px-base system
    - [ ] Fix potential horizontal overflow from `GlassOrb` and other decorations
    - [ ] Ensure `pb-40` or equivalent safe-area padding on all main screens

- [ ] **Responsive Refinements**
    - [ ] Audit grid layouts for better fluid scaling (using `auto-fit`/`auto-fill`)
    - [ ] Ensure mobile nav drawer content clears the bottom navigation

- [x] **Interactive States & Micro-interactions**
    - [x] Add `tiimo-press` and `hover-lift` to all interactive cards and buttons in Dashboard, Profile, and Analytics
    - [x] Standardize focus states for custom components
    - [x] Replace hardcoded shadows and colors with design tokens (e.g., `NavigationProgress.tsx`, `UnifiedDashboard.tsx`)

- [x] **Verification**
    - [x] Run `bun run lint:fix` to ensure Biome compliance
    - [ ] Visual check of key screens (Landing, Dashboard, Profile)
