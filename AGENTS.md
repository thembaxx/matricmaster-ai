# Agent Instructions

## Package Manager
- This project strictly requires the use of **Bun** as the package manager.
- `npm`, `yarn`, and `pnpm` must **not** be used for installation, scripts, or any other package-related operations.
- Always use `bun install` to add packages and `bun run <script>` to execute scripts.

## Coding Standards
- Use **Biome** for linting and formatting. Run `bun run lint:fix` to resolve formatting issues.
- Follow iOS Human Interface Guidelines (HIG) for UI/UX.
- Use **Playfair Display** for headings (font-display) and **Inter** for body text.
- Use `shadcn/ui` components for building the UI.

## Navigation
- The application uses a floating liquid glass navigation bar.
- Ensure main content areas have `pb-40` to account for the navbar height.
- Global hamburger menu is in `MobileFrame.tsx`. (Wait, I checked and didn't find `MobileFrame.tsx` earlier, it was `AppLayout.tsx`).

## Core Directives
- South African NSC Grade 12 curriculum focus.
- Next.js 16 with App Router.
- AI features powered by Google Gemini.
