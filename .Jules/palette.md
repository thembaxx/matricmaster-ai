## 2025-02-21 - [Accessibility: Form Labels & Icon Buttons]
**Learning:** Found a pattern where form labels used `htmlFor` but the associated inputs lacked matching `id` attributes. Also identified several icon-only buttons in the global layout and core screens (Search, Quiz) missing `aria-label` attributes.
**Action:** Always verify that React Hook Form's `register` or manual input components have an `id` that matches the label's `htmlFor`. Ensure all `Button` components with `size="icon"` have a descriptive `aria-label`.
