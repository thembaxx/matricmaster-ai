---
description: UI/UX design patterns and best practices for creating polished, delightful interfaces using motion, typography, and spacing techniques.
applyTo: "**/*.{tsx,jsx,ts,js,css}"
---

# UI/UX Memory

Techniques for making interfaces feel better through thoughtful motion, typography, and spacing.

## Typography

- Use `tabular-nums` for numerical content to ensure consistent width and readability in stats, data displays, and codes. Example: `className="tabular-nums"`.
- Use `antialiased` (`-webkit-font-smoothing: antialiased`) for crisp text rendering on macOS. Apply to the body/layout for global effect.
- Use `text-wrap: balance` to distribute text evenly across lines, preventing orphaned words. Use `text-wrap: pretty` as an alternative.
- Avoid large font sizes; keep text compact and readable.
- Use Geist for body text and Playfair Display for headings (hero, section, page headings).

## Motion

- Use the `motion` package for animations (not Framer Motion — the package is named `motion`).
- Make animations interruptible: use CSS transitions for interactions, keyframe animations for staged sequences.
- Apply purposeful animations that guide user attention and provide feedback.
- Keep animations subtle and purposeful, not flashy.
- Use spring-based animations for natural feel.
- Animate icons contextually: animate `opacity`, `scale`, and `blur` when showing/hiding icons.
- Split and stagger entering elements: use staggered delays (e.g., 80-100ms) between components, animate `opacity`, `blur`, and `translateY`.
- Make exit animations subtle: use smaller y values (e.g., `-12px`) compared to enter animations to reduce visual disruption.

## Spacing

- Use consistent spacing scales throughout the interface.
- Apply `pb-40` to main content areas to account for navbar height when using floating navigation.

## Border Radius

- Use concentric border radius: outer radius = inner radius + padding. This creates balanced visual hierarchy for nested elements.

## Alignment

- Align optically, not geometrically. For buttons with icons, use smaller padding on the icon side to visually center content.
- Fix optical alignment in the SVG itself when possible.

## Visual Depth

- Use subtle box-shadows instead of borders for depth. Example: `box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.06), 0px 1px 2px -1px rgba(0, 0, 0, 0.06), 0px 2px 4px 0px rgba(0, 0, 0, 0.04)`.
- Add 1px outline to images for consistent depth: `outline: 1px solid rgba(0, 0, 0, 0.1); outline-offset: -1px`. Use white in dark mode.

## Component Design

- Use liquid glass effects for navigation bars.
- Follow iOS Human Interface Guidelines for UI/UX patterns.
- Use shadcn/ui components as the foundation for building interfaces.
