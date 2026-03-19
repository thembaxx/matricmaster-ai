# Workspace Memory - MatricMaster AI

Persistent lessons and observations about this project and your preferences.

## Project-Specific Conventions

- Navigation uses floating liquid glass bar with hamburger menu in `AppLayout.tsx`
- Main content needs `pb-40` for navbar spacing
- Prefer `clsx` + `tailwind-merge` via `cn()` utility for className composition
- Use `appConfig` from `src/app.config.ts` for app metadata

## Your Preferences

- Plan before coding (formal plan for complex, mental check for simple)
- Learn from corrections - adaptive memory
- Verify before shipping (lint:fix + typecheck)
- Fix bugs end-to-end, not just symptoms
- Simplest solution first (KISS)
- Avoid useEffect - prefer RSC, event handlers, or state libraries
- Ask if unsure about requirements

## Tech Stack (Key Points)

- Bun for all package operations
- Biome for linting/formatting
- shadcn/ui components + custom in `src/components/ui/`
- Google Gemini for AI features
- Zustand + React Query for state
- Drizzle + SQLite for database

## Code Patterns

- `React.forwardRef` pattern for DOM components
- Single quotes in JS, semicolons required
- No uppercase in UI text
- Geist body, Playfair Display headings, Geist Mono for numbers
- Font weights: 400, 500, 700 only

## Commands to Remember

- `bun run lint:fix` - Format + lint
- `bun run typecheck` - TypeScript check
- `bun run test:unit` - Unit tests
- `bun run test` - E2E tests

## Lessons Learned

<!-- Add lessons here with /remember >workspace [lesson] [clue] -->
