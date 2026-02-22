## 2025-02-21 - [Accessibility: Form Labels & Icon Buttons]
**Learning:** Found a pattern where form labels used `htmlFor` but the associated inputs lacked matching `id` attributes. Also identified several icon-only buttons in the global layout and core screens (Search, Quiz) missing `aria-label` attributes.
**Action:** Always verify that React Hook Form's `register` or manual input components have an `id` that matches the label's `htmlFor`. Ensure all `Button` components with `size="icon"` have a descriptive `aria-label`.
## 2026-02-22 - [Accessibility Audit and Nested Button Fix]
**Learning:** Nested interactive elements (buttons inside buttons) are a major accessibility violation and cause issues with screen readers and keyboard navigation. Additionally, missing aria-current and aria-pressed attributes make it difficult for assistive technology users to understand the current state of the application.
**Action:** Always check for nested interactive elements when reviewing list-like components with multiple actions. Ensure all navigation links have aria-current and toggle buttons have aria-pressed.
