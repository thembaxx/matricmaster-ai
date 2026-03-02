## 2025-02-21 - [Accessibility: Form Labels & Icon Buttons]
**Learning:** Found a pattern where form labels used `htmlFor` but the associated inputs lacked matching `id` attributes. Also identified several icon-only buttons in the global layout and core screens (Search, Quiz) missing `aria-label` attributes.
**Action:** Always verify that React Hook Form's `register` or manual input components have an `id` that matches the label's `htmlFor`. Ensure all `Button` components with `size="icon"` have a descriptive `aria-label`.
## 2026-02-22 - [Accessibility Audit and Nested Button Fix]
**Learning:** Nested interactive elements (buttons inside buttons) are a major accessibility violation and cause issues with screen readers and keyboard navigation. Additionally, missing aria-current and aria-pressed attributes make it difficult for assistive technology users to understand the current state of the application.
**Action:** Always check for nested interactive elements when reviewing list-like components with multiple actions. Ensure all navigation links have aria-current and toggle buttons have aria-pressed.
## 2026-02-23 - [Heading Hierarchy and Dynamic ARIA Labels]
**Learning:** In screens where multiple components are composed, it's easy to end up with multiple `h1` tags, which is an accessibility violation. Changing component-level headers to `h2` ensures a proper document outline. Additionally, dynamic ARIA labels (e.g., including unread count in a bell icon's label) provide much better context than static ones.
**Action:** Always check for existing `h1` tags on the parent screen before adding one in a sub-component. Use template literals for ARIA labels when they represent stateful information.
## 2026-02-24 - [AI Tutor Accessibility & Search UX]
**Learning:** AI interaction components like AIPrompt and BookmarkButton are critical for the user experience but often lack the necessary ARIA attributes (label, pressed, expanded) for screen reader users. Adding a "Clear search" button to inputs significantly improves the "search and refine" loop.
**Action:** Ensure all AI Tutor components have explicit ARIA labels. Implement animated clear buttons in search inputs using AnimatePresence for a polished, responsive feel.
