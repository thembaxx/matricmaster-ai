# Palette Agent Journal - Critical UX/Accessibility Learnings

## 2025-05-15 - Search Input Padding and Text Overlap
**Learning:** In UIs that use absolutely positioned "clear" or "action" buttons inside an input field (e.g., at `right-5`), the input must have corresponding right padding (e.g., `pr-14`) to prevent text overlap. This ensures that long user queries remain readable and don't slide under the interactive element.
**Action:** Always check for internal action buttons in `Input` components and ensure sufficient padding is applied to the side where the button resides.

## 2025-05-15 - Document Outline and Reusable Components
**Learning:** Reusable components like `SearchHeader` should maintain their own semantic structure (e.g., using `h2` for titles) even if they appear "redundant" when used in specific parent views. Removing these headers to satisfy a single view's document outline can negatively impact screen reader navigation and general accessibility for that component when used elsewhere or when navigating by landmarks.
**Action:** Prioritize semantic structure and component-level context over "minimalist" parent-view-specific visual optimizations.
