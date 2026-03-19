# Bolt's Journal

## 2026-03-19 - Landing page eagerly loads 5 below-fold sections
**Learning:** The landing page (`src/screens/Landing.tsx`) eagerly imports all 6 landing sections via a barrel export from `@/components/Landing`. Only `HeroSection` is above the fold. The other 5 sections (~30-50KB of JS including framer-motion and hugeicons) are bundled into the initial page load even though users need to scroll to see them.
**Action:** Applied `next/dynamic` to code-split the 5 below-fold sections (`FeaturesSection`, `StatsSection`, `SubjectsSection`, `TestimonialsSection`, `FinalCTASection`). SSR is preserved for SEO. This defers their JS chunk loading until the browser is ready, reducing Time to Interactive and initial parse/compile cost.

## 2026-03-19 - `next/dynamic` collides with Next.js `export const dynamic`
**Learning:** In Next.js App Router, `export const dynamic = 'force-dynamic'` is a route segment config. When importing `dynamic` from `next/dynamic` in the same file, there's a naming collision. In `src/app/onboarding/page.tsx`, the agent had to alias the import: `import { dynamic as dynamicImport } from 'next/dynamic'`.
**Action:** When converting Server Component pages that use `export const dynamic`, alias the `next/dynamic` import to avoid collision. Alternatively, move screen components to separate files when the page has route segment configs.
