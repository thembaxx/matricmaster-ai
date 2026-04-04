# Design Analysis & Improvement Guide: MatricMaster AI (Lumni)

## Executive Summary

This document analyzes the current state of MatricMaster AI's landing page against award-winning design standards and provides actionable recommendations for dramatic UI/UX improvements. The goal is to transform the current design from "good enough" to "world-class" by implementing proven patterns from industry-leading websites.

---

## Change Log and Maintenance

This section documents the versioning strategy, update procedures, and maintenance practices for the MatricMaster AI design system. All stakeholders (designers, developers, product managers) should follow these guidelines to ensure consistency and proper communication of changes.

### 1. Document Versioning

The DESIGN.md document uses semantic versioning aligned with git tags to track design system changes.

#### Version Format

| Format | Example | Usage |
|--------|---------|-------|
| **Date-based** | `2026-04-03` | Incremental updates, token changes |
| **Semantic** | `v1.0.0` | Major releases, breaking changes |

#### Version Tag Alignment

```
Git Tag → DESIGN.md Version
────────────────────────────
design/v1.0.0 → v1.0.0 (Initial release)
design/v1.1.0 → 2026-04-03 (Token updates)
design/v2.0.0 → v2.0.0 (Major redesign)
```

#### Version Header Template

```markdown
## [Version] - YYYY-MM-DD

**Author:** [Name]
**Git Tag:** design/[version]
**Status:** [Draft / Review / Published]
```

#### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0.0 | 2026-01-15 | Design Team | Initial design system documentation |
| 2026-03-01 | 2026-03-01 | Design Team | Added new subject colors, updated spacing tokens |
| 2026-04-03 | 2026-04-03 | Design Team | Color palette update, added animation tokens |
| v2.0.0 | 2026-04-04 | UI/UX Engineering | Modern Rounded aesthetic - squircle corners, soft shadows, spring animations |

---

## [v2.0.0] - 2026-04-04

**Author:** UI/UX Engineering Team
**Git Tag:** design/v2.0.0
**Summary:** Modern Rounded aesthetic update - squircle corners, soft shadows, and spring animations

### ✨ Added
- **New Token:** `--radius-full` → `9999px` (Pill/CTA buttons)
- **New Shadow System:** `shadow-soft-sm`, `shadow-soft-md`, `shadow-soft-lg` for Apple/Linear-style soft shadows
- **New Animation Tokens:** `--ease-spring`, `--ease-out-back` for tactile interactions
- **Glassmorphism:** `backdrop-blur-md` for floating elements

### 🔄 Changed
- **Token:** `--radius` changed from `12px` to `16px` (base rounded-xl)
- **Token:** `--radius-sm` changed to `12px`
- **Token:** `--radius-md` changed to `16px`
- **Token:** `--radius-lg` changed to `20px`
- **Token:** `--radius-xl` changed to `24px`
- **Token:** `--radius-2xl` changed to `28px`

### 📝 Notes
- Primary buttons now use `rounded-full` for pill shape
- Cards/Modals use `rounded-2xl` (24px) for app-like feel
- Input fields use `rounded-xl` (16px) with increased horizontal padding
- All interactive elements have `active:scale-95` for tactile feedback
- Glassmorphism applied to floating elements with `backdrop-blur-md`

---

### 1.5 Modern Rounded Design System (v2.0.0)

The Modern Rounded design system brings a tactile, friendly aesthetic inspired by Apple iOS, Linear, Material You, and Duolingo. This update emphasizes softer curves, diffused shadows, and spring-based animations.

#### Border Radius Architecture (The "Squircle" Effect)

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | `8px` | Inline badges, chips |
| `--radius-sm` | `12px` | Small inputs, badges |
| `--radius-md` | `16px` | Standard inputs, small buttons |
| `--radius-lg` | `20px` | Medium buttons, cards |
| `--radius-xl` | `24px` | Large buttons, cards, modals |
| `--radius-2xl` | `28px` | Drawers, large containers |
| `--radius-3xl` | `32px` | Page containers |
| `--radius-full` | `9999px` | Pill buttons, avatars, CTAs |

#### Depth, Shadows, and Glassmorphism

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-soft-sm` | `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)` | Subtle elevation |
| `--shadow-soft-md` | `0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)` | Cards, dropdowns |
| `--shadow-soft-lg` | `0 8px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.06)` | Modals, popovers |
| `--shadow-soft-xl` | `0 12px 40px rgba(0,0,0,0.1), 0 6px 12px rgba(0,0,0,0.08)` | Floating navs |

#### Micro-Interactions & Spring Animations

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | `150ms` | Quick hover states |
| `--duration-normal` | `300ms` | Standard transitions |
| `--ease-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Bouncy interactions |
| `--ease-out-back` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Overshoot on enter |

#### Implementation Guidelines

- **Buttons/Inputs:** Use `rounded-xl` to `rounded-2xl` (12px-16px)
- **Pills & Primary CTAs:** Use `rounded-full`
- **Cards/Modals/Drawers:** Use `rounded-2xl` to `rounded-3xl` (16px-24px)
- **Inner nesting:** Proportionately smaller radius for geometric harmony
- **All interactive elements:** Add `active:scale-95` for tactile feedback
- **Floating elements:** Use `bg-background/80 backdrop-blur-md` for glassmorphism

---

### 2. Update Categories

All design system changes must be categorized to ensure proper tracking and communication.

#### Category Definitions

| Category | Description | Impact Level |
|----------|-------------|--------------|
| **Token Added** | New design token introduced | Medium |
| **Token Value Changed** | Existing token value modified | High |
| **Token Removed** | Deprecated token removed | High |
| **Component Spec Modified** | Component behavior or styling updated | Medium-High |
| **New Screen Added** | New page or screen specification | High |
| **Breaking Change** | Change requiring developer intervention | Critical |

#### Change Severity Guidelines

- **Critical**: Requires immediate developer attention, may break existing implementations
- **High**: Should be addressed in next release cycle
- **Medium**: Nice to have, can be deferred
- **Low**: Documentation updates, clarifications

---

### 3. Update Template

Use the following template when documenting changes to the design system.

```markdown
## [Version] - YYYY-MM-DD

**Author:** [Name]
**Git Tag:** design/[version]
**Summary:** [Brief description of changes]

### 🚨 Breaking Changes
- [Description of breaking change and migration path]

### ✨ Added
- **New Token:** `[token-name]` → `[value]` (Use case)
- **New Component:** `[ComponentName]` (Description)
- **New Screen:** `[ScreenName]` at `[route]` (Purpose)

### 🔄 Changed
- **Token:** `[token-name]` changed from `[old-value]` to `[new-value]`
- **Component:** `[ComponentName]` - [Description of change]
- **Screen:** `[ScreenName]` - [Description of change]

### 🗑️ Removed
- **Deprecated Token:** `[token-name]` (Use `[replacement-token]` instead)
- **Removed Component:** `[ComponentName]` (Was used for [use case])

### 📝 Notes
- [Any additional context, migration instructions, or known issues]
```

#### Example Entry

```markdown
## 2026-04-03 - 2026-04-03

**Author:** Design Team
**Git Tag:** design/2026-04-03
**Summary:** Color palette modernization and animation system addition

### ✨ Added
- **New Token:** `--ease-spring` → `cubic-bezier(0.175, 0.885, 0.32, 1.275)` (Toggle/switch animations)
- **New Component:** ToggleSwitch (Interactive boolean control)
- **New Tokens:** `--duration-fast` (150ms), `--duration-normal` (300ms), `--duration-slow` (500ms)

### 🔄 Changed
- **Token:** `--color-primary` changed from `#6366F1` to `#3B82F6`
- **Token:** `--radius-md` changed from `12px` to `16px`

### 🗑️ Removed
- **Legacy Token:** `--radius-pill` (Use `--radius-full` instead)
- **Deprecated Token:** `--shadow-card-lg` (Use `--shadow-lg` with updated values)

### 📝 Notes
- Primary color change aligns with iOS 18 Design Language
- All buttons must be updated to use new border-radius within 2 releases
- Run `bun run lint:fix` after updating component implementations
```

---

### 4. Re-validation Process

Before and after any design system update, follow this re-validation process to ensure consistency.

#### Pre-Update Validation

1. **Take Reference Screenshots**
   ```bash
   # Screenshot tools: Use browser devtools or dedicated tools
   # Capture: All affected screens at desktop, tablet, mobile breakpoints
   # Location: /docs/screenshots/v{version}/
   ```

2. **Document Current State**
   - Token values in use
   - Component implementations
   - Known issues or inconsistencies

#### Post-Update Validation

1. **Compare Implementation**
   - Verify token changes applied correctly
   - Check component behavior matches specification
   - Test across breakpoints (320px, 768px, 1024px, 1440px)

2. **Update Reference Images**
   ```bash
   # Replace outdated screenshots in:
   # /docs/screenshots/before/ → Before changes
   # /docs/screenshots/after/  → After changes
   ```

3. **Document Intentional Deviations**
   ```markdown
   ### Deviations from Design

   | Component | Deviation | Reason | Approved By |
   |-----------|-----------|--------|-------------|
   | Button padding | 12px vs 16px spec | Accessibility adjustment | Design Lead |
   | Card shadow | lighter than spec | Performance optimization | Tech Lead |
   ```

#### Validation Checklist

- [ ] Reference screenshots captured
- [ ] Token changes applied in code
- [ ] Components updated to match new specs
- [ ] Visual comparison completed
- [ ] New reference screenshots captured
- [ ] Intentional deviations documented
- [ ] Review approved by Design Lead

---

### 5. Design Token Review Cadence

Regular reviews ensure the design system remains consistent and up-to-date.

#### Monthly Review (Consistency Check)

**Frequency:** First week of each month  
**Participants:** Design Lead, Frontend Lead

| Task | Description |
|------|-------------|
| Token usage audit | Check for hardcoded values replacing tokens |
| Inconsistency scan | Identify components not following specs |
| Performance check | Review CSS bundle size impact |
| Documentation review | Ensure docs match implementation |

```markdown
### Monthly Report - [Month] [Year]

**Token Compliance:** [X]% of components using design tokens
**Issues Found:** [Number]
**Resolutions:** [Number] resolved, [Number] pending
```

#### Quarterly Review (Full Audit)

**Frequency:** End of each quarter  
**Participants:** Full design team, Engineering representative

| Task | Description |
|------|-------------|
| Token value validation | Verify all token values still appropriate |
| Component audit | Review all components for consistency |
| Usage analytics | Analyze token usage patterns |
| Roadmap planning | Plan next quarter's design improvements |

#### Annual Review (Major Version)

**Frequency:** Annually in January  
**Participants:** Stakeholders, Product, Engineering

| Task | Description |
|------|-------------|
| Brand alignment | Ensure design reflects current brand direction |
| Accessibility review | WCAG compliance audit |
| Technology updates | Review for new frameworks, tools |
| Strategic planning | Major version bump planning |

---

### 6. Communication with Developers

Effective communication ensures smooth implementation of design changes.

#### Communication Channels

| Channel | Use Case | Response Time |
|---------|----------|---------------|
| **Slack** (#design-system) | Quick questions, discussions | Within 4 hours |
| **PR Comments** | Token changes, component updates | During code review |
| **Design Review** | Major changes, new components | Scheduled weekly |
| **Email** | Formal requests, escalations | Within 24 hours |

#### PR Description Template

```markdown
## Design System Changes

### Summary
[Brief description of changes]

### Tokens Changed
| Token | Old Value | New Value | Components Affected |
|-------|-----------|-----------|---------------------|
| --color-primary | #6366F1 | #3B82F6 | Button, Link, Toggle |

### Components Updated
- [ ] Button - border-radius updated
- [ ] Card - shadow values adjusted

### Breaking Changes
- [ ] None
- [ ] [Description] - migration required

### Screenshots
- Before: [link]
- After: [link]

### Testing Notes
[Any specific testing requirements]
```

#### Design Review in Code Review

1. **Tag design team** on PRs affecting design system
2. **Include visual diff** when changing tokens or components
3. **Reference issue/ticket** for context
4. **Request specific review** for breaking changes

---

### 7. Deprecation Process

When a design token or component needs to be removed, follow this process to give developers time to migrate.

#### Deprecation Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│  DEPRECATION TIMELINE                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Release N     Release N+1    Release N+2    Release N+3        │
│     │              │               │               │              │
│     ▼              ▼               ▼               ▼              │
│  ┌──────┐      ┌──────┐       ┌──────┐       ┌──────┐           │
│  │Mark  │ ───► │Warn  │ ───►  │Remove│ ───►  │Final │           │
│  │Deprecated│  │ in   │       │ from │       │Cleanup│          │
│  └──────┘      │ Docs │       │ Code │       └──────┘          │
│                └──────┘       └──────┘                          │
│                                                                  │
│  Timeline: 2 major releases (approximately 6 months)             │
└─────────────────────────────────────────────────────────────────┘
```

#### Step 1: Mark as Deprecated

```markdown
### Deprecation Notice

**Token:** `--radius-pill`
**Status:** Deprecated
**Replacement:** `--radius-full`
**Removal Date:** [Release N+2]
**Migration:** Replace all instances of `--radius-pill` with `--radius-full`
```

#### Step 2: Add Deprecation Warnings

```css
/* Mark deprecated token with warning in documentation */
:root {
  /**
   * @deprecated Use --radius-full instead (will be removed in v2.0)
   * @see https://design.matricmaster.ai/tokens/radius
   */
  --radius-pill: 9999px;
}
```

#### Step 3: Provide Migration Path

```markdown
### Migration Guide

#### From `--radius-pill` to `--radius-full`

**Before:**
```css
.card {
  border-radius: var(--radius-pill);
}
```

**After:**
```css
.card {
  border-radius: var(--radius-full);
}
```

**Affected Components:**
- [ ] Button (pill variant)
- [ ] Badge (pill variant)
- [ ] Avatar (grouped)
```

#### Step 4: Remove After 2 Releases

- Update DESIGN.md to remove deprecated token
- Update component implementations
- Run full test suite
- Update any remaining documentation

---

### 8. Questions Section

Capture ambiguous items, questions, and known issues for tracking and resolution.

#### Question Template

```markdown
### Question: [Brief Title]

**Priority:** [high / medium / low]
**Status:** [Open / In Progress / Resolved]
**Created:** YYYY-MM-DD
**Created By:** [Name]

#### Description
[Detailed description of the question or ambiguity]

#### Context
- Where found: [Component / Token / Screen]
- Current behavior: [What happens now]
- Expected behavior: [What should happen]

#### Discussion
[Thread of comments and clarifications]

#### Resolution
**Status:** Resolved
**Resolved By:** [Name]
**Resolution Date:** YYYY-MM-DD
**Action:** [What was decided / implemented]
```

#### Questions Log

| ID | Question | Priority | Status | Created | Resolution |
|----|-----------|----------|--------|---------|-------------|
| Q-001 | Should `--shadow-tiimo` be renamed to `--shadow-md`? | Medium | Open | 2026-04-03 | - |
| Q-002 | Is `Geist Mono` appropriate for all numeric content? | Low | Resolved | 2026-03-15 | Yes, confirmed by Design Lead |
| Q-003 | Dark mode toggle should appear in navbar? | High | In Progress | 2026-04-01 | Awaiting UX review |

#### Priority Guidelines

| Priority | Criteria | Response Time |
|----------|----------|---------------|
| **High** | Blocks development, inconsistent behavior | 24 hours |
| **Medium** | Causes confusion, needs clarification | 1 week |
| **Low** | Enhancement idea, future consideration | Monthly review |

---

### 9. Quick Reference

#### Change Log Entry Checklist

- [ ] Version number assigned
- [ ] Date recorded
- [ ] Author identified
- [ ] Git tag created
- [ ] Categories identified (token/component/screen/breaking)
- [ ] Tokens listed with old/new values
- [ ] Components affected documented
- [ ] Breaking changes highlighted with migration path
- [ ] Screenshots updated
- [ ] Review approved

#### Communication Checklist

- [ ] Slack notification sent
- [ ] PR description complete
- [ ] Design review scheduled (if needed)
- [ ] Developer questions answered

#### Deprecation Checklist

- [ ] Deprecated status documented
- [ ] Replacement token identified
- [ ] Migration guide written
- [ ] Timeline communicated
- [ ] Removal completed after 2 releases

---

*Change Log and Maintenance section added 2026-04-03*

---

## Part 1: Best Designed Apps & Web Apps Analysis

### 1.1 Award-Winning Design Examples & Why They Excel

#### **Linear (linear.app)** 🏆
**What Makes It Exceptional:**
- **Dark mode by default**: Creates an immersive, premium developer-focused atmosphere
- **Typography hierarchy**: Massive, confident headlines (64px+) with perfect line-height
- **Negative space mastery**: Content breathes with generous padding (80-120px vertical)
- **Subtle animations**: Elements fade and slide with 300-600ms ease curves
- **Single-column focus**: No visual distractions from the core message
- **Glow effects**: Purple/cyan accent glows add depth without clutter

**Key Takeaway**: Confidence through restraint. Every element earns its place.

---

#### **Apple (apple.com)** 🏆
**What Makes It Exceptional:**
- **Product-first photography**: Images extend beyond containers for dynamic feel
- **Ultra-clean navigation**: Minimal top bar with clear hierarchy
- **Consistent spacing system**: 8px grid throughout maintains visual rhythm
- **Color psychology**: Light backgrounds create approachability and trust
- **CTA clarity**: Single primary action per section (usually blue button)
- **Typography**: San Francisco font family, tight letter-spacing on headlines

**Key Takeaway**: Let the product speak. Remove everything that doesn't serve the user.

---

#### **Stripe (stripe.com)** 🏆
**What Makes It Exceptional:**
- **Gradient artistry**: Subtle mesh gradients (pink/purple/orange) create visual interest
- **Social proof placement**: "Global GDP running on Stripe" counter builds credibility
- **Dual CTA strategy**: Primary (purple) + Secondary (white outline) buttons
- **Logo bar**: Trusted company logos immediately establish legitimacy
- **Animated elements**: Counter animates on load, gradients subtly shift
- **Information density**: Multiple sections without feeling cluttered

**Key Takeaway**: Balance aesthetics with trust-building elements.

---

#### **Notion (notion.so)** 🏆
**What Makes It Exceptional:**
- **Illustrative personality**: Hand-drawn style creates warmth and approachability
- **Bold headline treatment**: "One workspace. Zero busywork." - punchy and memorable
- **Clear value proposition**: Immediately explains what it does and who it's for
- **Color confidence**: White background with strategic blue CTAs
- **Character illustrations**: Faces create emotional connection

**Key Takeaway**: Personality differentiates. Don't be afraid to show character.

---

#### **Figma (figma.com)** 🏆
**What Makes It Exceptional:**
- **Dynamic hero**: Full-bleed creative showcase (auto-rotating design examples)
- **Typography contrast**: Bold headlines + light body text
- **Interactive elements**: UI mockups respond to hover states
- **Bold CTA**: "Get started for free" - clear, no-friction language
- **Navigation clarity**: Product, Solutions, Community, Resources, Pricing

**Key Takeaway**: Show, don't just tell. Demonstrate the product in the hero.

---

#### **Vercel (vercel.com)** 🏆
**What Makes It Exceptional:**
- **Developer-focused aesthetic**: Clean, technical, but not cold
- **Grid background**: Subtle technical feel without being distracting
- **Announcement banner**: Events bar at top for timely communication
- **Dual CTAs**: "Start Deploying" (black, primary) + "Get a Demo" (white, secondary)
- **Gradient accents**: Soft rainbow gradient at bottom adds warmth

**Key Takeaway**: Know your audience. Design language matches user expectations.

---

### 1.2 Common Patterns Across Award-Winning Sites

| Element | Implementation | Frequency |
|---------|---------------|-----------|
| **Hero Headline** | 48-72px, tight leading, max 2 lines | 100% |
| **Subheadline** | 18-20px, muted color, max 2 lines | 95% |
| **Primary CTA** | High contrast, rounded corners (8-12px) | 100% |
| **Secondary CTA** | Outline style or ghost button | 85% |
| **Social Proof** | Logos, testimonials, or stats above fold | 90% |
| **Navigation** | Minimal, 5-7 items max, sticky on scroll | 95% |
| **Spacing** | 80-120px between major sections | 90% |
| **Animation** | Fade-in, slide-up, subtle parallax | 80% |

---

## Part 2: MatricMaster AI (Lumni) Current State Analysis

### 2.1 Visual Audit

**Current URL**: https://matricmaster-ai.vercel.app/

**Strengths:**
1. ✅ Clear brand name "lumni" (modern, memorable)
2. ✅ Good color foundation (cream background, purple accents)
3. ✅ Social proof with avatar stack (50,000+ students)
4. ✅ Feature cards provide clear value proposition
5. ✅ Subject grid is comprehensive
6. ✅ Mobile-first responsive approach

**Critical Issues:**
1. ❌ **Excessive whitespace**: 60% of full-page screenshot is empty beige space
2. ❌ **Weak visual hierarchy**: Features section nearly invisible (low contrast)
3. ❌ **Missing product demonstration**: No screenshot or demo of the actual app
4. ❌ **Low-contrast text**: Light gray on cream background fails accessibility
5. ❌ **Generic stock imagery**: Students photo doesn't differentiate the brand
6. ❌ **Navigation confusion**: "dashboard, schedule, planner, focus, profile" links on landing page?
7. ❌ **No testimonial section**: "Proven by thousands" has no supporting quotes/reviews
8. ❌ **Button inconsistency**: "try free" vs "Join free" vs "Get Started Free"
9. ❌ **Missing trust signals**: No security badges, no "free forever" messaging
10. ❌ **Footer overload**: 4-column footer competes with main content

---

### 2.2 Typography Analysis

**Current:**
- Headline: "stop guessing. start passing." (serif font, mixed weight)
- Subhead: "ai answers to any past paper question..." (lowercase, low contrast)
- Feature headers: "homework helper" etc. (lowercase, weak presence)

**Problems:**
- Serif + lowercase creates weak visual authority
- Text contrast ratio likely below WCAG 2.1 AA standards
- No clear type scale (H1, H2, H3 hierarchy is muddy)

---

### 2.3 Color Palette Analysis

**New Palette (Implemented April 2026):**
- Primary: Bright Blue (#3B82F6) - confident, modern, ed-tech standard
- Secondary: Deep Navy (#0F172A) - provides premium anchor for text
- Tertiary: Vibrant Orange (#D16900) - for highlights and urgent actions
- Neutral: Off-white (#F8FAFC) - clean, low-strain reading surface

**Opportunities:**
- Transitioning from lavender to bright blue provides a more authoritative "expert" feel.
- Dark mode is fully supported with navy backgrounds.
- High contrast compliant (#3B82F6 on white/navy).

---

### 2.4 Conversion Flow Issues

**Current Journey:**
1. Hero with two CTAs ("try free" / "find your papers")
2. Large whitespace gap
3. Features section (nearly invisible)
4. More whitespace
5. Subjects grid
6. More whitespace
7. Footer CTA ("Get Started Free")

**Problems:**
- No clear single action for users to take
- Features section is "buried" visually
- No pricing information visible
- No FAQ section to handle objections
- No urgency or scarcity elements

---

## Part 3: Actionable Design Improvements

### 3.1 Hero Section Transformation

**Current:**
```
[Top nav: lumni | dashboard | schedule | planner | focus | profile]
                                    [Sign in] [Join free]

[50,000+ students scored higher badge]

stop guessing.
start passing.

ai answers to any past paper question. find your weak
spots. pass matric the first time.

[try free →]  [find your papers 📄]

[avatar stack] 50,000+ passed
                    join them today

[image: students at laptop with floating stats cards]
```

**Recommended:**
```
[Top nav: Logo | Features | Subjects | Pricing | For Schools] [Log in] [Start Free]

🎓 Trusted by 50,000+ South African students

# Finally, a study tool
# that actually works

Get instant AI answers to any past paper question. 
Identify your weak spots. Pass matric the first time.

[Start Studying Free →]  [See How It Works]

[Animated product demo or screenshot showing AI chat]
```

**Changes:**
1. **Headline**: More emotional, punchy, sentence case
2. **Badge**: More prominent, emoji adds personality
3. **CTA**: Single primary action, clearer language
4. **Product demo**: Replace stock photo with actual UI
5. **Navigation**: Remove app-specific links from landing page

---

### 3.2 Color Palette Upgrade

**New Global Palette:**

```css
/* Primary Colors */
--color-primary: #3B82F6;          /* Bright Blue - brand core */
--color-primary-dark: #2563EB;     /* Deeper blue for hover */

/* Secondary & Tertiary */
--color-secondary: #0F172A;        /* Dark Navy - text & headers */
--color-tertiary: #D16900;         /* Vibrant Orange - accent highlights */

/* Neutral & Backgrounds */
--color-bg-primary: #F8FAFC;       /* Off-white - content area */
--color-bg-secondary: #F1F5F9;     /* Ultra light blue gray - cards */
--color-bg-dark: #0F172A;          /* Navy - dark mode core */

/* Text Colors */
--color-text-primary: #0F172A;     /* Slate 950 - headings */
--color-text-secondary: #475569;   /* Slate 600 - body */
--color-text-muted: #64748B;       /* Slate 500 - captions */
```

**Why This Works:**
- Blue is the universal color of intelligence and trust (Perfect for AI).
- Navy secondary provides extreme contrast for typography (Essential for study tools).
- Orange tertiary adds a "bubbly" but professional spark.
- Aligns with iOS 18 Design Language (Liquid glass + vibrant accents).

---

### 3.3 Typography System

> **Font Stack (as per AGENTS.md):**
> - **Headings & Display**: Playfair Display (serif) - bold, confident, editorial
> - **Body Text**: Geist (sans-serif) - clean, modern, highly readable
> - **Numeric & Stats**: Geist Mono (monospace) - technical, precise, data-focused
> - **Subject-Specific**: Noto Sans Math for mathematics/science content

---

## Typography Specification

### 3.3.1 Font Families

#### CSS Variables

```css
/* Font Family Variables */
--font-display: 'Playfair Display', Georgia, serif;
--font-body: 'Geist', system-ui, -apple-system, sans-serif;
--font-mono: 'Geist Mono', 'SF Mono', ui-monospace, monospace;
--font-math: 'Noto Sans Math', 'Times New Roman', serif;

/* Semantic Mappings */
--font-heading: var(--font-display);
--font-body: var(--font-body);
--font-numeric: var(--font-mono);
--font-code: var(--font-mono);
```

#### Tailwind Configuration

```js
// tailwind.config.ts
theme: {
  extend: {
    fontFamily: {
      display: ['Playfair Display', 'Georgia', 'serif'],
      body: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['Geist Mono', 'SF Mono', 'ui-monospace', 'monospace'],
      math: ['Noto Sans Math', 'Times New Roman', 'serif'],
    },
  },
}
```

#### Import in globals.css

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Noto+Sans+Math&display=swap');
```

---

### 3.3.2 Type Scale (Major Third - 1.25 Ratio)

| Token | REM | PX | Usage |
|-------|-----|-----|-------|
| `--text-xs` | 0.64rem | 10.24px | Captions, badges, timestamps |
| `--text-sm` | 0.8rem | 12.8px | Secondary UI, metadata |
| `--text-base` | 1rem | 16px | Body text (minimum accessible) |
| `--text-lg` | 1.25rem | 20px | Lead text, subheadings |
| `--text-xl` | 1.563rem | 25px | Small headings, card titles |
| `--text-2xl` | 1.953rem | 31.25px | Section headings |
| `--text-3xl` | 2.441rem | 39px | Page headings |
| `--text-4xl` | 3.052rem | 48.8px | Display headings |
| `--text-5xl` | 3.815rem | 61px | Hero headings |
| `--text-6xl` | 4.768rem | 76.3px | Large hero, impact text |

#### CSS Variables

```css
:root {
  /* Type Scale */
  --text-xs: 0.64rem;
  --text-sm: 0.8rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.563rem;
  --text-2xl: 1.953rem;
  --text-3xl: 2.441rem;
  --text-4xl: 3.052rem;
  --text-5xl: 3.815rem;
  --text-6xl: 4.768rem;
}
```

#### Tailwind Type Scale Mapping

```js
// tailwind.config.ts
theme: {
  extend: {
    fontSize: {
      'xs': ['0.64rem', { lineHeight: '1.5' }],
      'sm': ['0.8rem', { lineHeight: '1.5' }],
      'base': ['1rem', { lineHeight: '1.6' }],
      'lg': ['1.25rem', { lineHeight: '1.6' }],
      'xl': ['1.563rem', { lineHeight: '1.4' }],
      '2xl': ['1.953rem', { lineHeight: '1.3' }],
      '3xl': ['2.441rem', { lineHeight: '1.25' }],
      '4xl': ['3.052rem', { lineHeight: '1.2' }],
      '5xl': ['3.815rem', { lineHeight: '1.15' }],
      '6xl': ['4.768rem', { lineHeight: '1.1' }],
    },
  },
}
```

---

### 3.3.3 Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--weight-normal` | 400 | Body text, paragraphs |
| `--weight-medium` | 500 | UI elements, labels |
| `--weight-semibold` | 600 | Emphasis, subheadings |
| `--weight-bold` | 700 | Headlines, important text |

#### CSS Variables

```css
:root {
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
}
```

#### Tailwind Weight Mapping

```js
// Already available via default Tailwind:
// font-normal: 400
// font-medium: 500
// font-semibold: 600
// font-bold: 700
```

---

### 3.3.4 Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `--leading-tight` | 1.1 | Large headlines, hero text |
| `--leading-snug` | 1.25 | Headings, card titles |
| `--leading-normal` | 1.5 | Body text (default) |
| `--leading-relaxed` | 1.625 | Long-form content, captions |
| `--leading-loose` | 1.75 | Large blocks, quotes |

#### CSS Variables

```css
:root {
  --leading-tight: 1.1;
  --leading-snug: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 1.75;
}
```

#### Tailwind Line Height Mapping

```js
theme: {
  extend: {
    lineHeight: {
      'tight': '1.1',
      'snug': '1.25',
      'normal': '1.5',
      'relaxed': '1.625',
      'loose': '1.75',
    },
  },
}
```

---

### 3.3.5 Usage by Context

#### Hero Headlines
```css
.hero-headline {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
}

/* Tailwind */
.hero-headline {
  @apply font-display text-5xl font-bold leading-tight tracking-tight;
}
```

#### Section Headings
```css
.section-heading {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--weight-bold);
  line-height: var(--leading-snug);
}

/* Tailwind */
.section-heading {
  @apply font-display text-3xl font-bold leading-snug;
}
```

#### Body Text
```css
.body-text {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-normal);
  line-height: var(--leading-normal);
}

/* Tailwind */
.body-text {
  @apply font-body text-base font-normal leading-normal;
}
```

#### Lead Paragraph
```css
.lead-text {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-normal);
  line-height: var(--leading-relaxed);
}

/* Tailwind */
.lead-text {
  @apply font-body text-lg leading-relaxed;
}
```

#### Captions & Labels
```css
.caption {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  line-height: var(--leading-normal);
}

/* Tailwind */
.caption {
  @apply font-body text-sm font-medium;
}
```

#### Stats & Numbers
```css
.stat-number {
  font-family: var(--font-mono);
  font-size: var(--text-4xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
  font-variant-numeric: tabular-nums;
}

/* Tailwind */
.stat-number {
  @apply font-mono text-4xl font-semibold leading-tight tabular-nums;
}
```

#### Math & Scientific Content
```css
.math-content {
  font-family: var(--font-math);
  font-size: var(--text-lg);
  line-height: var(--leading-normal);
}

/* Tailwind */
.math-content {
  @apply font-math text-lg;
}
```

#### Code & Technical
```css
.code-text {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
}

/* Tailwind */
.code-text {
  @apply font-mono text-sm;
}
```

---

### 3.3.6 Responsive Fluid Typography

#### CSS Variables with clamp()

```css
:root {
  /* Fluid typography for hero text - scales between 3rem and 6rem */
  --text-fluid-hero: clamp(3rem, 8vw + 1rem, 6rem);
  
  /* Fluid for section headings */
  --text-fluid-display: clamp(2.5rem, 5vw + 1rem, 4.5rem);
  
  /* Fluid for mobile */
  --text-fluid-lg: clamp(1.125rem, 2vw + 0.875rem, 1.375rem);
}
```

#### Tailwind Extended Configuration

```js
// tailwind.config.ts
theme: {
  extend: {
    fontSize: {
      'fluid-hero': 'clamp(3rem, 8vw + 1rem, 6rem)',
      'fluid-display': 'clamp(2.5rem, 5vw + 1rem, 4.5rem)',
      'fluid-lg': 'clamp(1.125rem, 2vw + 0.875rem, 1.375rem)',
    },
  },
}
```

#### Usage

```tsx
// Hero component
<div className="font-display text-fluid-hero font-bold leading-tight">
  Finally, a study tool that actually works
</div>

// Section heading
<h2 className="font-display text-fluid-display font-bold">
  Loved by students
</h2>
```

---

### 3.3.7 Component Typography Classes

#### Complete CSS Utility Classes

```css
/* Display / Headings */
.heading-1 {
  font-family: var(--font-display);
  font-size: var(--text-6xl);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
}

.heading-2 {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.01em;
}

.heading-3 {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--weight-bold);
  line-height: var(--leading-snug);
}

.heading-4 {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
}

/* Body */
.body-lg {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-normal);
  line-height: var(--leading-relaxed);
}

.body-md {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-normal);
  line-height: var(--leading-normal);
}

.body-sm {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-normal);
  line-height: var(--leading-normal);
}

/* Labels & UI */
.label {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.caption {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--weight-normal);
  line-height: var(--leading-normal);
}

/* Numeric */
.stat {
  font-family: var(--font-mono);
  font-size: var(--text-4xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
  font-variant-numeric: tabular-nums;
}

.score {
  font-family: var(--font-mono);
  font-size: var(--text-3xl);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  font-variant-numeric: tabular-nums;
}
```

---

### 3.3.8 Quick Reference Table

| Context | Font Family | Size | Weight | Line Height |
|---------|-------------|------|--------|--------------|
| Hero H1 | Playfair Display | 5xl-6xl | Bold (700) | tight (1.1) |
| Section H2 | Playfair Display | 3xl-4xl | Bold (700) | snug (1.25) |
| Section H3 | Playfair Display | 2xl-3xl | Semibold (600) | snug (1.25) |
| Card Title | Geist | xl-lg | Semibold (600) | snug (1.25) |
| Body Large | Geist | lg | Normal (400) | relaxed (1.625) |
| Body | Geist | base | Normal (400) | normal (1.5) |
| Body Small | Geist | sm | Normal (400) | normal (1.5) |
| Caption | Geist | xs-sm | Medium (500) | normal (1.5) |
| Stat/Number | Geist Mono | 4xl-6xl | Semibold (600) | tight (1.1) |
| Math/Science | Noto Sans Math | base-lg | Normal (400) | normal (1.5) |
| Code | Geist Mono | sm | Normal (400) | normal (1.5) |

---

### 3.3.9 Accessibility Requirements

1. **Minimum font size**: 16px (1rem) for body text
2. **Line height**: Minimum 1.5 for body text
3. **Letter spacing**: -0.02em maximum for headlines
4. **Contrast**: Body text must meet WCAG AA (4.5:1 ratio)
5. **Fluid typography**: Ensure readability at all viewport sizes

---

### 3.3.10 Implementation Checklist

- [ ] Add Google Fonts import to globals.css
- [ ] Configure tailwind.config.ts with font families and type scale
- [ ] Create typography utility classes
- [ ] Apply font-family to all heading components
- [ ] Apply font-mono to stats, scores, and numeric content
- [ ] Test responsive fluid typography on all breakpoints
- [ ] Verify WCAG AA contrast compliance
- [ ] Test reduced motion preferences

---

### 3.4 Spacing & Layout System

#### Spacing Scale (4px base)

```css
/* Core spacing tokens */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;

/* Semantic aliases */
--space-xs: var(--space-1);   /* 4px  - tight spacing, badges */
--space-sm: var(--space-2);   /* 8px  - compact elements */
--space-md: var(--space-4);   /* 16px - standard spacing */
--space-lg: var(--space-6);   /* 24px - generous spacing */
--space-xl: var(--space-8);   /* 32px - section gaps */
--space-2xl: var(--space-12); /* 48px - large gaps */
--space-3xl: var(--space-16); /* 64px - major sections */
--space-4xl: var(--space-24); /* 96px - hero spacing */
```

#### Section Spacing

```css
/* Vertical section padding */
--section-padding-y: 120px;    /* Major sections (hero, features, testimonials) */
--section-padding-y-sm: 80px;   /* Minor sections (call-to-action, compact) */

/* Container constraints */
--container-max: 1200px;       /* Maximum content width */
--container-padding: 24px;     /* Horizontal padding (mobile: 16px) */

/* Content width */
--content-max-width: 720px;     /* Optimal reading width for body text */
```

#### Border Radius

```css
/* Radius scale */
--radius-xs: 6px;      /* Badges, tiny elements */
--radius-sm: 10px;      /* Inputs, small cards */
--radius-md: 16px;      /* Cards, buttons (primary) */
--radius-lg: 20px;      /* Large cards, feature sections */
--radius-xl: 24px;      /* Hero sections, overlays */
--radius-2xl: 36px;    /* Large containers */
--radius-full: 9999px;  /* Pills, circular elements */

/* Semantic aliases */
--radius-button: var(--radius-md);
--radius-card: var(--radius-lg);
--radius-input: var(--radius-sm);
```

#### Shadows

```css
/* Elevation scale */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 8px 32px -4px rgba(70, 70, 68, 0.08);
--shadow-lg: 0 16px 48px -8px rgba(70, 70, 68, 0.12);
--shadow-xl: 0 24px 64px -12px rgba(70, 70, 68, 0.16);

/* Usage */
--shadow-card: var(--shadow-md);
--shadow-elevated: var(--shadow-lg);
--shadow-hero: var(--shadow-xl);
```

#### Responsive Breakpoints

```css
/* Mobile-first breakpoints */
--breakpoint-sm: 640px;   /* Large phones */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

#### Layout Utilities

**Navbar (Floating Liquid Glass):**
```css
/* Fixed navbar with glass effect */
.navbar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* Content area padding for navbar */
.main-content {
  padding-top: 80px;      /* Navbar height */
  padding-bottom: 160px;  /* Space for floating nav (pb-40 = 160px) */
}

/* Mobile hamburger menu trigger */
.mobile-menu-trigger {
  display: none; /* Hidden on desktop */
}
@media (max-width: 768px) {
  .mobile-menu-trigger { display: block; }
}
```

**Tailwind Classes Reference:**
```html
<!-- Spacing -->
<div class="p-4 md:p-6 lg:p-8">        <!-- padding -->
<div class="m-4 md:m-6 lg:m-8">        <!-- margin -->
<div class="gap-2 gap-4 gap-6">        <!-- flex gap -->
<div class="space-y-4 space-y-6">      <!-- stack spacing -->

<!-- Layout -->
<div class="container mx-auto px-6">  <!-- 1200px max, 24px sides -->
<div class="max-w-7xl mx-auto">       <!-- 1280px max -->
<div class="min-h-screen pt-20 pb-40"> <!-- navbar + floating nav space -->

<!-- Section spacing -->
<section class="py-20 lg:py-30">     <!-- 80px mobile, 120px desktop -->
<section class="py-12 lg:py-20">      <!-- 48px mobile, 80px desktop -->

<!-- Radius -->
<button class="rounded-2xl">          <!-- 16px -->
<button class="rounded-3xl">           <!-- 20px -->
<button class="rounded-full">          <!-- pill -->
```

#### Tailwind Configuration

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },
      borderRadius: {
        'xs': '6px',
        'sm': '10px',
        'md': '16px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '36px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 8px 32px -4px rgba(70, 70, 68, 0.08)',
        'lg': '0 16px 48px -8px rgba(70, 70, 68, 0.12)',
        'xl': '0 24px 64px -12px rgba(70, 70, 68, 0.16)',
      },
      screens: {
        'xs': '640px',
        'sm': '768px',
        'md': '1024px',
        'lg': '1280px',
        'xl': '1536px',
      },
    },
  },
}
```

#### CSS Variables (Complete)

```css
:root {
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* Semantic aliases */
  --space-xs: var(--space-1);
  --space-sm: var(--space-2);
  --space-md: var(--space-4);
  --space-lg: var(--space-6);
  --space-xl: var(--space-8);
  --space-2xl: var(--space-12);
  --space-3xl: var(--space-16);
  --space-4xl: var(--space-24);

  /* Section spacing */
  --section-padding-y: 120px;
  --section-padding-y-sm: 80px;
  --container-max: 1200px;
  --container-padding: 24px;

  /* Border radius */
  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;
  --radius-2xl: 36px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 8px 32px -4px rgba(70, 70, 68, 0.08);
  --shadow-lg: 0 16px 48px -8px rgba(70, 70, 68, 0.12);
  --shadow-xl: 0 24px 64px -12px rgba(70, 70, 68, 0.16);
}
```

#### Usage Guidelines

| Context | Spacing | Radius | Shadow |
|---------|---------|--------|--------|
| Buttons | p-3 (12px) | rounded-md (16px) | shadow-sm |
| Cards | p-6 (24px) | rounded-lg (20px) | shadow-md |
| Sections | py-20/30 (80/120px) | rounded-xl (24px) | - |
| Hero | py-24 (96px) | rounded-2xl (36px) | shadow-xl |
| Input | p-3 (12px) | rounded-sm (10px) | shadow-sm |
| Badge | px-2 py-1 (8px/4px) | rounded-xs (6px) | - |

---

### 3.5 Feature Cards Redesign

**Current Issues:**
- Icons are too small (24px)
- Low contrast text
- No hover states
- Missing visual hierarchy

**Recommended Card Design:**

```
┌─────────────────────────────────────┐
│  ┌──────┐                           │
│  │  📚  │  Homework Helper          │
│  └──────┘                           │
│                                     │
│  Stuck on a problem? Upload it and  │
│  get step-by-step explanations in   │
│  seconds.                           │
│                                     │
│  Learn more →                       │
└─────────────────────────────────────┘
```

**Card Specs:**
- Background: White with subtle border (#E2E8F0)
- Border radius: 16px
- Padding: 32px
- Shadow on hover: 0 4px 20px rgba(0,0,0,0.08)
- Icon: 48px, contained in 56px circular background
- Title: 20px, font-weight 600
- Description: 16px, color text-secondary

---

### 3.6 Subject Grid Improvements

**Current:** Simple emoji + text buttons

**Recommended:** Visual subject cards

```
┌────────────┐ ┌────────────┐ ┌────────────┐
│    ∑       │ │    ⚛️       │ │    🧬       │
│            │ │            │ │            │
│Mathematics │ │  Physical  │ │   Life     │
│            │ │  Sciences  │ │  Sciences  │
│ Grades 10-12│ │ Grades 10-12│ │ Grades 10-12│
│            │ │            │ │            │
│ [Explore]  │ │ [Explore]  │ │ [Explore]  │
└────────────┘ └────────────┘ └────────────┘
```

**Specs:**
- Card size: ~200px width
- Gradient backgrounds unique to each subject
- Icon: 64px, centered
- Hover: Scale 1.02, shadow increase
- CTA: Outline button, full width

---

### 3.7 Social Proof Section (New)

Add this section between Hero and Features:

```
# Loved by students across South Africa

"I went from failing math to getting 78% in my final exam. 
Lumni explained everything in a way my teacher never could."
— Sarah M., Grade 12, Cape Town ⭐⭐⭐⭐⭐

[Avatar] [Avatar] [Avatar] [Avatar] [Avatar]
Join 50,000+ students who've improved their marks

[View Success Stories →]
```

---

### 3.8 New Sections to Add

#### **How It Works** (Step-by-step)

```
# How Lumni works

1️⃣ Upload your question
   Snap a photo or type any past paper question

2️⃣ Get instant help  
   Our AI explains the solution step-by-step

3️⃣ Track your progress
   See which topics you've mastered and what needs work

[Try It Free →]
```

#### **Pricing Preview** (Before footer)

```
# Simple, student-friendly pricing

Start free. Upgrade when you're ready.

┌──────────────┐ ┌──────────────┐
│    FREE      │ │    PRO       │
│    R0/mo     │ │   R99/mo     │
│              │ │              │
│ ✓ 10 questions│ │ ✓ Unlimited  │
│   per day    │ │   questions  │
│ ✓ Basic help │ │ ✓ Priority   │
│              │ │   responses  │
│              │ │ ✓ Essay      │
│              │ │   feedback   │
│              │ │              │
│ [Get Started]│ │ [Go Pro →]   │
└──────────────┘ └──────────────┘
```

#### **FAQ Section**

```
# Frequently asked questions

[Q] Is it really free?
[A] Yes! You can ask up to 10 questions per day on the free plan.

[Q] Which subjects do you cover?
[A] All major NSC subjects including Mathematics, Physics, Life Sciences...

[Q] How accurate are the answers?
[A] Our AI is trained specifically on the South African curriculum...
```

---

### 3.9 Animation & Interaction Guidelines

**Scroll Animations:**
```css
/* Fade up on scroll */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger children */
.stagger-children > * {
  animation: fadeUp 0.6s ease-out forwards;
}
.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 100ms; }
.stagger-children > *:nth-child(3) { animation-delay: 200ms; }
```

**Hover States:**
```css
/* Cards */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12);
}

/* Buttons */
.btn-primary {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btn-primary:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(99,102,241,0.4);
}
```

---

### 3.10 Interaction and Motion

This section defines the complete animation and interaction system for MatricMaster AI, following iOS 18 Human Interface Guidelines and Tiimo 3.0 Design System principles. All animations should feel natural, purposeful, and responsive to user input.

---

### 3.10.1 Animation Tokens

#### Duration Tokens

```css
:root {
  /* Core duration tokens */
  --duration-fast: 150ms;        /* Micro-interactions, immediate feedback */
  --duration-normal: 300ms;      /* Standard transitions, hover states */
  --duration-slow: 500ms;        /* Complex animations, page transitions */
  
  /* Specific animation durations */
  --duration-enter: 300ms;       /* Elements entering viewport */
  --duration-exit: 200ms;        /* Elements leaving viewport */
  --duration-move: 350ms;        /* Position changes */
  --duration-scale: 200ms;       /* Scale transformations */
}
```

#### Easing Curves

```css
:root {
  /* Bouncy overshoot - buttons, toggles, modal opens */
  --ease-tiimo: cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* Smooth ease-out - fades, slides, scroll animations */
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  
  /* Exponential decay - decelerating movements */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  
  /* Spring-like for interactive elements */
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

#### Tailwind Configuration

```javascript
// tailwind.config.ts
theme: {
  extend: {
    transitionDuration: {
      'fast': '150ms',
      'normal': '300ms',
      'slow': '500ms',
      'enter': '300ms',
      'exit': '200ms',
    },
    transitionTimingFunction: {
      'tiimo': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    animation: {
      'fade-in': 'fadeIn 300ms ease-out forwards',
      'fade-up': 'fadeUp 400ms ease-out forwards',
      'slide-in-right': 'slideInRight 300ms ease-out forwards',
      'scale-in': 'scaleIn 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      'pulse-correct': 'quizCorrectPulse 600ms ease-out 1',
      'shake-wrong': 'quizWrongShake 500ms ease-out 1',
      'shimmer': 'shimmer 1.5s ease-in-out infinite',
    },
  },
}
```

---

### 3.10.2 Keyframe Animations

#### Fade In

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### Fade Up (Scroll Animation)

```css
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Slide In From Right (Navigation)

```css
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(60px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

#### Scale In (Modal/Overlay)

```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

#### Quiz: Correct Answer Pulse

```css
@keyframes quizCorrectPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(92, 181, 135, 0.4);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(92, 181, 135, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(92, 181, 135, 0);
  }
}
```

#### Quiz: Wrong Answer Shake

```css
@keyframes quizWrongShake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-8px); }
  30% { transform: translateX(6px); }
  45% { transform: translateX(-5px); }
  60% { transform: translateX(4px); }
  75% { transform: translateX(-2px); }
  90% { transform: translateX(1px); }
}
```

#### Confetti Celebration

```css
@keyframes confettiFall {
  0% {
    transform: translateY(-10px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
```

#### Streak Ember Rise

```css
@keyframes emberRise {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-40px) scale(0);
    opacity: 0;
  }
}
```

#### Shimmer Loading

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    var(--color-muted) 25%,
    var(--color-card) 50%,
    var(--color-muted) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

---

### 3.10.3 Micro-interactions

#### Button Hover

```css
.btn-interactive {
  transition: transform 150ms var(--ease-tiimo), 
              box-shadow 150ms var(--ease-tiimo);
}

.btn-interactive:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25);
}

.btn-interactive:active {
  transform: scale(0.98);
  transition-duration: 100ms;
}
```

**Tailwind:**
```html
<button className="transition-transform duration-150 hover:scale-[1.02] hover:shadow-lg">
  Action
</button>
```

#### Card Hover Lift

```css
.card-lift {
  transition: transform 200ms var(--ease-smooth), 
              box-shadow 200ms var(--ease-smooth);
}

.card-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px -8px rgba(70, 70, 68, 0.12);
}
```

**Tailwind:**
```html
<div className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
  Card Content
</div>
```

#### Input Focus Ring

```css
.input-focus {
  transition: border-color 200ms var(--ease-smooth), 
              box-shadow 200ms var(--ease-smooth);
}

.input-focus:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
```

**Tailwind:**
```html
<input className="transition-all duration-200 focus:ring-2 focus:ring-primary/30" />
```

#### Toggle Switch (Spring Animation)

```css
.toggle-thumb {
  transition: transform 300ms var(--ease-spring);
}

.toggle-thumb.on {
  transform: translateX(20px);
}
```

---

### 3.10.4 Scroll Animations

#### Fade Up on Scroll

```css
.scroll-fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 400ms var(--ease-smooth), 
              transform 400ms var(--ease-smooth);
}

.scroll-fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}
```

**Usage with Intersection Observer:**
```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

export function ScrollAnimation({ children, delay = 0 }: { 
  children: React.ReactNode; 
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`scroll-fade-up ${isVisible ? 'visible' : ''}`}>
      {children}
    </div>
  );
}
```

#### Stagger Children Animation

```css
.stagger-children > * {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 400ms var(--ease-smooth) forwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 100ms; }
.stagger-children > *:nth-child(3) { animation-delay: 200ms; }
.stagger-children > *:nth-child(4) { animation-delay: 300ms; }
.stagger-children > *:nth-child(5) { animation-delay: 400ms; }
.stagger-children > *:nth-child(6) { animation-delay: 500ms; }
```

**Tailwind:**
```html
<div className="space-y-4">
  <div className="animate-fade-up [animation-delay:0ms]">Item 1</div>
  <div className="animate-fade-up [animation-delay:100ms]">Item 2</div>
  <div className="animate-fade-up [animation-delay:200ms]">Item 3</div>
</div>
```

#### Parallax Background

```css
.parallax-bg {
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

/* Subtle parallax via transform (more performant) */
@media (prefers-reduced-motion: no-preference) {
  .parallax-element {
    transform: translateY(calc(var(--scroll-y) * 0.3));
  }
}
```

---

### 3.10.5 Quiz Animations

#### Correct Answer Feedback

```tsx
import { m } from 'framer-motion';

interface QuizOptionProps {
  isCorrect: boolean;
  isSelected: boolean;
  isChecked: boolean;
  children: React.ReactNode;
}

export function QuizOption({ isCorrect, isSelected, isChecked, children }: QuizOptionProps) {
  return (
    <m.button
      className={cn(
        'border-2 p-4 rounded-lg transition-all',
        isChecked && isSelected && isCorrect && 
          'border-success bg-success-soft quiz-correct-pulse',
        isChecked && isSelected && !isCorrect && 
          'border-destructive bg-destructive-soft quiz-wrong-shake',
      )}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </m.button>
  );
}
```

#### Confetti Celebration Component

```tsx
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  active: boolean;
}

export function ConfettiCelebration({ active }: ConfettiProps) {
  useEffect(() => {
    if (!active) return;

    const duration = 2500;
    const end = Date.now() + duration;

    const colors = ['#3B82F6', '#5CB587', '#F2C945', '#48A7DE', '#F472B6'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    return () => {};
  }, [active]);

  return null;
}
```

#### Streak Animation Component

```tsx
import { m } from 'framer-motion';

interface StreakEmberProps {
  count: number;
}

export function StreakEmber({ count }: StreakEmberProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <m.span
          key={i}
          className="inline-block w-2 h-2 rounded-full bg-orange-500"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [1, 1, 0],
            scale: [1, 1.2, 0],
            y: [0, -20, -30],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.2,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      ))}
    </div>
  );
}
```

---

### 3.10.6 View Transitions

View Transitions API provides native page transition effects with smooth navigation.

#### CSS View Transition Definitions

```css
/* Slide from right (forward navigation) */
@keyframes vt-slide-from-right {
  from { transform: translateX(30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes vt-slide-to-right {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-30px); opacity: 0; }
}

::view-transition-old(vt-slide-from-right) {
  animation: 200ms ease-out vt-slide-to-right both;
}

::view-transition-new(vt-slide-from-right) {
  animation: 300ms ease-out vt-slide-from-right both;
}

/* Scale up (modal/open) */
@keyframes vt-scale-up {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes vt-scale-down {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.95); opacity: 0; }
}

::view-transition-old(vt-scale-in) {
  animation: 200ms ease-in vt-scale-down both;
}

::view-transition-new(vt-scale-in) {
  animation: 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275) vt-scale-up both;
}

/* Fade */
@keyframes vt-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes vt-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

::view-transition-old(vt-fade-in) {
  animation: 200ms ease-in vt-fade-out both;
}

::view-transition-new(vt-fade-in) {
  animation: 300ms ease-out vt-fade-in both;
}
```

#### JavaScript View Transition Helper

```tsx
type TransitionType = 'slide-right' | 'slide-left' | 'scale' | 'fade';

export function viewTransition(
  callback: () => void | Promise<void>,
  type: TransitionType = 'slide-right'
) {
  if (!document.startViewTransition) {
    callback();
    return;
  }

  const transition = document.startViewTransition(() => {
    callback();
  });

  transition.ready.then(() => {
    document.documentElement.dataset.viewTransition = type;
  });
}

// Usage
function navigateToQuiz(quizId: string) {
  viewTransition(() => {
    router.push(`/quiz/${quizId}`);
  }, 'slide-right');
}
```

#### Tailwind View Transition Classes

```css
.view-transition-slide {
  view-transition-name: vt-slide-from-right;
}

.view-transition-scale {
  view-transition-name: vt-scale-in;
}

.view-transition-fade {
  view-transition-name: vt-fade-in;
}
```

---

### 3.10.7 Reduced Motion Support

Per WCAG guidelines, automatically disable animations when users prefer reduced motion.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Disable specific animations */
  .scroll-fade-up {
    opacity: 1;
    transform: none;
  }

  .parallax-element {
    transform: none !important;
  }

  .quiz-correct-pulse {
    animation: none !important;
  }

  .quiz-wrong-shake {
    animation: none !important;
  }
}
```

#### React Reduced Motion Hook

```tsx
import { useReducedMotion } from 'framer-motion';

export function useAnimationSettings() {
  const prefersReducedMotion = useReducedMotion();

  return {
    shouldAnimate: !prefersReducedMotion,
    duration: prefersReducedMotion ? 0 : undefined,
    ease: prefersReducedMotion ? 'linear' : undefined,
  };
}

// Usage
const { shouldAnimate } = useAnimationSettings();

{motion.div(
  { 
    animate: shouldAnimate ? { opacity: 1 } : { opacity: 1 },
    transition: shouldAnimate ? { duration: 0.3 } : { duration: 0 }
  }
)}
```

---

### 3.10.8 Implementation Checklist

- [ ] Add duration tokens to CSS variables
- [ ] Add easing curves to CSS variables
- [ ] Configure Tailwind with animation utilities
- [ ] Implement keyframe animations in globals.css
- [ ] Add hover states to buttons (scale, shadow)
- [ ] Add hover states to cards (lift, shadow)
- [ ] Add focus states to inputs (ring)
- [ ] Implement scroll animation component
- [ ] Implement stagger children utility
- [ ] Add quiz feedback animations (pulse, shake)
- [ ] Add confetti celebration component
- [ ] Add streak ember animation component
- [ ] Implement view transition helpers
- [ ] Add reduced motion media query
- [ ] Test animations on all interactive elements
- [ ] Verify reduced motion works correctly
- [ ] Run performance audit on animations

---

### 3.10.9 Animation Quick Reference

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Button hover, toggle, quick feedback |
| `--duration-normal` | 300ms | Card hover, modal open, fade transitions |
| `--duration-slow` | 500ms | Page transitions, complex animations |
| `--duration-enter` | 300ms | Elements entering viewport |
| `--duration-exit` | 200ms | Elements leaving viewport |
| `--ease-tiimo` | cubic-bezier(0.34, 1.56, 0.64, 1) | Bouncy/overshoot |
| `--ease-smooth` | cubic-bezier(0.16, 1, 0.3, 1) | Smooth ease-out |
| `--ease-spring` | cubic-bezier(0.175, 0.885, 0.32, 1.275) | Spring-like |

| Animation | Trigger | Duration | Easing |
|-----------|---------|----------|--------|
| Button hover | Mouse enter | 150ms | tiimo |
| Card hover | Mouse enter | 200ms | smooth |
| Input focus | Focus event | 200ms | smooth |
| Fade up scroll | Intersection | 400ms | smooth |
| Modal open | Open state | 300ms | spring |
| Quiz correct | Answer check | 600ms | ease-out |
| Quiz wrong | Answer check | 500ms | ease-out |

---

## Part 6: Validation and QA

This section establishes comprehensive validation procedures to ensure pixel-perfect implementation of the MatricMaster AI design system. All QA activities must be documented and tracked throughout the development lifecycle.

---

### 6.1 Visual Diff Testing

Visual regression testing ensures UI consistency across updates. Run visual tests before and after any UI changes.

#### 6.1.1 Tool Configuration

| Tool | Purpose | Use Case |
|------|---------|----------|
| `pixelmatch` | Pixel-level comparison | CI/CD pipelines, automated tests |
| `Percy` | Managed visual testing | Visual regression tracking, baselines |
| `Chromatic` | Storybook visual testing | Component-level verification |
| `Playwright` | E2E visual testing | Full page comparisons |

**Installation:**
```bash
# Playwright with visual comparison
bun add -D @playwright/test playwright-visual-regression

# pixelmatch for CLI comparisons
bun add -D pixelmatch
```

#### 6.1.2 Tolerance Thresholds

| Comparison Type | Tolerance | Description |
|-----------------|-----------|-------------|
| **Identical** | 0.1% (0.001) | Exact match - hero sections, brand elements |
| **Similar** | 0.5% (0.005) | Minor differences - shadows, anti-aliasing |
| **Components** | 0.3% (0.003) | Interactive elements - buttons, inputs |
| **Content** | 1.0% (0.01) | Dynamic content - text, images |

#### 6.1.3 Theme-Specific Testing

Test light and dark modes separately:

```
tests/
├── visual/
│   ├── landing/
│   │   ├── hero.light.png
│   │   ├── hero.dark.png
│   │   ├── features.light.png
│   │   └── features.dark.png
│   ├── quiz/
│   │   ├── quiz-start.light.png
│   │   └── quiz-start.dark.png
│   └── dashboard/
│       ├── dashboard.light.png
│       └── dashboard.dark.png
```

#### 6.1.4 Visual Test Procedure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Landing Page Visual Regression', () => {
  test('hero section - light mode', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1280, height: 720 });
    
    const hero = page.locator('[data-testid="hero-section"]');
    await expect(hero).toHaveScreenshot('hero-light.png', {
      maxDiffPixelRatio: 0.001,
    });
  });

  test('hero section - dark mode', async ({ page }) => {
    await page.goto('/?theme=dark');
    await page.setViewportSize({ width: 1280, height: 720 });
    
    const hero = page.locator('[data-testid="hero-section"]');
    await expect(hero).toHaveScreenshot('hero-dark.png', {
      maxDiffPixelRatio: 0.001,
    });
  });
});
```

---

### 6.2 Reference Image Comparison

Reference images serve as the source of truth for visual validation.

#### 6.2.1 Reference Image Checklist

**Landing Page:**

| Screen | Reference File | Tolerance |
|--------|---------------|-----------|
| Hero (Desktop) | `refs/landing/hero-desktop.png` | 0.1% |
| Hero (Mobile) | `refs/landing/hero-mobile.png` | 0.5% |
| Features Grid | `refs/landing/features.png` | 0.3% |
| Subjects Grid | `refs/landing/subjects.png` | 0.3% |
| Footer CTA | `refs/landing/footer-cta.png` | 0.3% |

**Quiz Interface:**

| Screen | Reference File | Tolerance |
|--------|---------------|-----------|
| Quiz Start | `refs/quiz/quiz-start.png` | 0.1% |
| Question View | `refs/quiz/question-view.png` | 0.3% |
| Correct Answer | `refs/quiz/correct.png` | 0.3% |
| Wrong Answer | `refs/quiz/wrong.png` | 0.3% |
| Results Screen | `refs/quiz/results.png` | 0.3% |

**Dashboard:**

| Screen | Reference File | Tolerance |
|--------|---------------|-----------|
| Dashboard Home | `refs/dashboard/home.png` | 0.3% |
| Progress View | `refs/dashboard/progress.png` | 0.3% |
| Subject Detail | `refs/dashboard/subject.png` | 0.5% |

#### 6.2.2 Overlay Comparison Technique

```typescript
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import fs from 'fs';

export function compareImages(actual: string, expected: string, threshold = 0.001) {
  const imgA = PNG.sync.read(fs.readFileSync(actual));
  const imgB = PNG.sync.read(fs.readFileSync(expected));
  
  const diff = pixelmatch(
    imgA.data, imgB.data, imgA.width, imgA.height,
    { threshold, diffColor: [255, 0, 0], alpha: 0.5 }
  );
  
  return { diff, match: diff <= threshold * imgA.width * imgA.height };
}
```

#### 6.2.3 Tolerance by Element Type

| Element Category | Threshold | Rationale |
|-----------------|-----------|------------|
| **Brand Elements** | 0.1% | Logo, colors, typography must be exact |
| **Primary CTAs** | 0.1% | Critical conversion elements |
| **Cards & Containers** | 0.3% | Layout consistency |
| **Text Content** | 0.5% | Font rendering varies by OS |
| **Shadows & Blurs** | 0.5% | Anti-aliasing differences |

---

### 6.3 Pixel-Perfect Checklist

#### 6.3.1 Color Verification

- [ ] **Primary color** matches token exactly (#3B82F6)
  - DevTools: `getComputedStyle(element).color`
  
- [ ] **Secondary color** (#0F172A) verified
- [ ] **Background colors** match spec (#F8FAFC light / #0F172A dark)
- [ ] **Text colors** meet WCAG AA (4.5:1 ratio minimum)
  - Headings: #0F172A
  - Body: #475569
  - Captions: #64748B
- [ ] **Dark mode** renders all colors correctly
- [ ] **Hover states** have correct color shifts

**DevTools Verification:**
```javascript
getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
// Returns: rgb(59, 130, 246) or #3B82F6
```

#### 6.3.2 Typography Verification

- [ ] **Font families** match spec
  - Headings: Playfair Display
  - Body: Geist
  - Numbers: Geist Mono
  
- [ ] **Font sizes** match type scale (16px minimum body)
- [ ] **Font weights** match spec (700 bold, 500 medium, 400 normal)
- [ ] **Line heights** match spec (1.5 minimum body)
- [ ] **Letter spacing** correct (-0.02em max for headlines)

#### 6.3.3 Spacing Verification

- [ ] **Padding** matches spacing scale (4px base)
- [ ] **Margins** between sections match spec (80-120px)
- [ ] **Gap** in grids/flex matches spec
- [ ] **Container** max-width is correct (1200px)
- [ ] **Mobile padding** correct (16px minimum)

#### 6.3.4 Border Radius Verification

- [ ] **Buttons**: radius-md (16px)
- [ ] **Cards**: radius-lg (20px)
- [ ] **Inputs**: radius-sm (10px)
- [ ] **Badges**: radius-xs (6px)
- [ ] **Hero sections**: radius-2xl (36px)

#### 6.3.5 Shadow Verification

- [ ] **Cards**: shadow-md (0 8px 32px -4px rgba(70,70,68,0.08))
- [ ] **Elevated elements**: shadow-lg
- [ ] **Hero**: shadow-xl
- [ ] **Hover states** add shadow correctly
- [ ] **Dark mode** shadows adjust correctly

#### 6.3.6 Interactive States Verification

- [ ] **Hover** - Elements respond to mouse hover
  - Buttons: scale(1.02), shadow appears
  - Cards: translateY(-4px), shadow increases
- [ ] **Focus** - Keyboard focus visible (2px ring)
- [ ] **Active** - Click/tap states work (scale 0.98)
- [ ] **Disabled** - 50% opacity, cursor not-allowed

#### 6.3.7 Responsive Behavior Verification

- [ ] **Mobile** (375px) - Layout adapts correctly
- [ ] **Tablet** (768px) - Grid switches appropriately
- [ ] **Desktop** (1024px+) - Full layout displays
- [ ] **Breakpoints** - All breakpoints function (640px, 768px, 1024px, 1280px, 1536px)

#### 6.3.8 Dark Mode Verification

- [ ] **Background** switches to dark (#0F172A)
- [ ] **Text** colors invert correctly
- [ ] **Cards** have dark backgrounds
- [ ] **Shadows** adjust for dark mode
- [ ] **System preference** respected (prefers-color-scheme)

---

### 6.4 Acceptance Criteria by Component

#### 6.4.1 Button Component

**Primary Button:**
- [ ] Background: #3B82F6
- [ ] Text: White, Geist font
- [ ] Padding: 12px 24px
- [ ] Radius: 16px
- [ ] Hover: scale(1.02), shadow-md
- [ ] Active: scale(0.98)
- [ ] Focus: ring-2 ring-primary/50

**Secondary Button:**
- [ ] Background: Transparent
- [ ] Border: 2px solid #3B82F6
- [ ] Hover: background #3B82F6/10

**Sizes:** Small (10px 16px), Medium (12px 24px), Large (14px 28px)

**States:** Default, Hover, Focus, Active, Disabled, Loading

#### 6.4.2 Card Component

- [ ] Background: White (#FFFFFF)
- [ ] Border: 1px solid #E2E8F0
- [ ] Radius: 20px
- [ ] Padding: 24px
- [ ] Shadow: shadow-md
- [ ] Hover: translateY(-4px), shadow-lg
- [ ] Title: Geist, 20px, weight 600
- [ ] Description: Geist, 16px, slate-600

#### 6.4.3 Input Component

- [ ] Background: White
- [ ] Border: 1px solid #E2E8F0
- [ ] Radius: 10px
- [ ] Focus: border-primary, ring-2 ring-primary/30
- [ ] Error: border-destructive
- [ ] Success: border-success
- [ ] Disabled: bg-slate-100

#### 6.4.4 Navigation Component

**Desktop:**
- [ ] Fixed, glass effect
- [ ] Logo displays
- [ ] Nav links (32px gap)
- [ ] Mobile menu hidden

**Mobile:**
- [ ] Hamburger visible <768px
- [ ] Full-screen overlay
- [ ] All items accessible

**Floating Nav:**
- [ ] Bottom position
- [ ] Glass effect
- [ ] 5 items: Home, Subjects, Quiz, Progress, Profile

#### 6.4.5 Quiz Component

- [ ] Question text renders clearly
- [ ] Options selectable
- [ ] Selected highlight works
- [ ] Correct: green + pulse (600ms)
- [ ] Wrong: red + shake (500ms)
- [ ] Confetti triggers (2.5s)
- [ ] Progress updates
- [ ] Reduced motion disabled

---

### 6.5 Testing Tools

#### 6.5.1 Playwright

```bash
bun add -D @playwright/test
bunx playwright install chromium
```

#### 6.5.2 Axe Accessibility

```bash
bun add -D @axe-core/playwright
```

```typescript
import Axe from '@axe-core/playwright';

test('no accessibility violations', async ({ page }) => {
  await page.goto('/');
  const accessibilityScanner = new Axe({ browser: page });
  const results = await accessibilityScanner.analyze();
  expect(results.violations).toHaveLength(0);
});
```

#### 6.5.3 Test Commands

```json
{
  "scripts": {
    "test": "bun test",
    "test:visual": "bunx playwright test --ui",
    "test:accessibility": "bunx playwright test tests/accessibility.spec.ts",
    "test:update": "bunx playwright test --update-snapshots",
    "lint": "bunx biome lint .",
    "lint:fix": "bunx biome lint . --write"
  }
}
```

---

### 6.6 Issue Tracking

#### 6.6.1 Severity Levels

| Level | Description | Examples | Response |
|-------|-------------|-----------|----------|
| **Critical** | Blocks release | Black screen, broken nav | Immediate |
| **Major** | Significant impact | Wrong colors, broken hover | 24 hours |
| **Minor** | Noticeable | Slight mismatch, spacing | 1 week |
| **Trivial** | Cosmetic | 1px offset | Next sprint |

#### 6.6.2 Issue Categories

| Category | Examples |
|----------|----------|
| **Color** | Token mismatch, contrast < 4.5:1 |
| **Typography** | Wrong font, size, weight |
| **Spacing** | Padding, margin, gaps |
| **Border Radius** | Incorrect corners |
| **Shadow** | Wrong elevation |
| **Interaction** | Hover, focus, active states |
| **Accessibility** | Missing labels, keyboard nav |
| **Responsive** | Layout broken at breakpoints |
| **Animation** | Missing, wrong timing |
| **Dark Mode** | Colors don't invert |

#### 6.6.3 Issue Template

```markdown
## QA Issue: [Title]

**Issue ID:** QA-####
**Severity:** [Critical / Major / Minor / Trivial]
**Category:** [Color / Typography / ...]
**Status:** [Open / In Progress / Verified / Closed]

### Description
[Clear description]

### Expected Behavior
[What should happen]

### Actual Behavior
[What's happening]

### Environment
- Browser: [Chrome/Firefox/Safari]
- Viewport: [375x812 / 768x1024 / 1280x720]
- Theme: [Light / Dark / System]

### Evidence
[Screenshot REQUIRED]

### Steps to Reproduce
1. 
2. 
3. 

### Related Spec
[Reference to DESIGN.md section]
```

#### 6.6.4 Screenshot Requirements

| Issue Type | Screenshots |
|------------|-------------|
| Color | Current, Expected, DevTools |
| Layout | Full, Zoomed, Box model |
| Animation | Before, During, After |
| Responsive | Mobile, Tablet, Desktop |
| Dark Mode | Light mode, Dark mode |

**Naming:** `qa-[ID]-[viewport]-[description].png`

---

### 6.7 QA Implementation Checklist

- [ ] Set up Playwright with visual regression
- [ ] Configure baseline screenshots
- [ ] Set up axe-core accessibility testing
- [ ] Create DevTools bookmarklet for token verification
- [ ] Document reference images
- [ ] Establish issue tracking template
- [ ] Run visual tests in CI/CD
- [ ] Schedule visual audit reviews

---

### 6.8 Quick Reference Cards

**Daily QA:**
```
□ New features render correctly
□ All interactive states work
□ No console errors
□ Accessibility passes
□ Mobile layout verified
□ Dark mode verified
□ Run: bun test:visual
```

**Pre-Release QA:**
```
□ All pixel-perfect checklist items
□ Visual diff tests pass
□ Accessibility tests pass
□ Responsive at all breakpoints
□ Dark mode fully tested
□ No critical/major issues open
□ Reference images updated
□ Product team sign-off
```

---

## Part 4: Implementation Priority

### Phase 1: Quick Wins (Week 1)
- [ ] Change background from cream to white
- [ ] Fix text contrast (all text must be WCAG AA compliant)
- [ ] Update headline to sentence case
- [ ] Fix navigation (remove app-specific links)
- [ ] Standardize CTA buttons (one primary action)

### Phase 2: Visual Upgrade (Week 2)
- [ ] Implement new color palette
- [ ] Redesign feature cards with proper hierarchy
- [ ] Add hover states and micro-interactions
- [ ] Redesign subject grid

### Phase 3: Content & Structure (Week 3)
- [ ] Add "How It Works" section
- [ ] Add testimonials/social proof section
- [ ] Add FAQ section
- [ ] Add pricing preview

### Phase 4: Polish (Week 4)
- [ ] Add scroll animations
- [ ] Implement dark mode toggle
- [ ] Optimize images (WebP format)
- [ ] Performance audit

---

## Part 5: Detailed Prompt for AI Implementation

### Prompt for Landing Page Redesign

```
Redesign the MatricMaster AI (Lumni) landing page with the following specifications:

BRAND FOUNDATION:
- Company: Lumni - AI-powered study assistant for South African matric students
- Target audience: Grades 10-12 students in South Africa preparing for NSC exams
- Brand personality: Helpful, smart, friendly, trustworthy, modern
- Existing assets: Keep the name "lumni" and purple accent color

DESIGN SYSTEM:
- Background: Off-white (#F8FAFC) primary, Navy-900 (#0F172A) for dark sections
- Primary color: Blue-500 (#3B82F6) for buttons and links
- Text: Navy-900 for headings, Slate-600 for body
- Font: Playfair Display (Headings), Geist (Body), Geist Mono (Numerical)
- Border radius: 16px for cards, 12px for buttons, 24px for containers (iOS Style)
- Spacing: 8px base grid, 120px between major sections

SECTIONS TO INCLUDE:

1. NAVIGATION:
   - Logo (left): "lumni" wordmark
   - Links (center): Features, Subjects, Pricing, For Schools
   - Actions (right): Log in (text), Start Free (filled button)

2. HERO SECTION:
   - Badge: "🎓 Trusted by 50,000+ South African students"
   - Headline: "Finally, a study tool that actually works" (56px, bold)
   - Subheadline: "Get instant AI answers to any past paper question. Identify your weak spots. Pass matric the first time." (20px, muted)
   - CTAs: "Start Studying Free" (primary), "See How It Works" (secondary/outline)
   - Visual: Product screenshot or animated demo showing AI chat interface
   - Social proof: Avatar stack + "Join 50,000+ students"

3. FEATURES SECTION (6 cards in 3x2 grid):
   Each card contains:
   - 48px icon in colored circle background
   - Title (20px, semibold)
   - Description (16px, muted)
   
   Features:
   - Homework Helper: Stuck on a problem? Get step-by-step explanations
   - Real Exam Practice: Practice with actual NSC past papers
   - Progress Tracking: See your growth with detailed analytics
   - Audio Explanations: Listen to explanations while commuting
   - Photo Solve: Snap a picture, get instant answers
   - Essay Feedback: Submit essays for AI-powered feedback

4. HOW IT WORKS (3 steps):
   - Step 1: Upload Question (icon + description)
   - Step 2: Get AI Help (icon + description)
   - Step 3: Track Progress (icon + description)
   - CTA: "Try It Free" button at bottom

5. SUBJECTS SECTION:
   - Headline: "All your subjects, covered"
   - Grid of 12 subject cards (3 columns on desktop)
   - Each card: Subject icon, name, grade range, "Explore" button
   - Subjects: Mathematics, Physical Sciences, Life Sciences, English, Afrikaans, Geography, History, Accounting, Economics, Life Orientation, Business Studies, Chemistry

6. TESTIMONIALS SECTION:
   - Headline: "Loved by students across South Africa"
   - 3 testimonial cards with:
     - Quote text
     - Avatar
     - Name, Grade, Location
     - Star rating

7. PRICING SECTION:
   - Headline: "Simple, student-friendly pricing"
   - Two cards side by side:
     - Free: R0/month, 10 questions/day, basic features
     - Pro: R99/month, unlimited, all features
   - Highlight Pro as "Most Popular"

8. FAQ SECTION:
   - Headline: "Frequently asked questions"
   - 5-6 accordion items with common questions
   - Questions about free tier, accuracy, subjects, privacy, cancellation

9. CTA SECTION:
   - Headline: "Ready to pass matric?"
   - Subheadline: "Join 50,000+ students already studying smarter"
   - Button: "Start Studying Free"
   - Background: Indigo gradient or pattern

10. FOOTER:
    - 4 columns: Product, Resources, Company, Legal
    - Newsletter signup (email + subscribe)
    - Social icons: Facebook, Twitter, Instagram, LinkedIn
    - Copyright: © 2025 Lumni. All rights reserved.

INTERACTIONS:
- All buttons have hover scale (1.02) and shadow
- Cards lift on hover (translateY -4px)
- Fade up animation on scroll for each section
- Smooth scroll behavior
- Mobile-responsive (hamburger menu on mobile)

TECHNICAL:
- Use Tailwind CSS classes
- Optimize images (WebP)
- Lazy load below-fold content
- Ensure WCAG AA contrast compliance
```

---

## Part 7: A/B Testing Recommendations

Once implemented, test these variations:

1. **Headline**: 
   - A: "Finally, a study tool that actually works"
   - B: "Stop guessing. Start passing." (current)
   - C: "Your AI tutor for matric success"

2. **CTA Color**:
   - A: Indigo (professional)
   - B: Purple (current brand)
   - C: Green (success association)

3. **Social Proof Placement**:
   - A: Below headline (current)
   - B: Above headline
   - C: Both above and below

4. **Hero Visual**:
   - A: Product screenshot
   - B: Student photography
   - C: Abstract illustration

---

## Part 8: Components

This section documents the complete component library for MatricMaster AI, built on shadcn/ui conventions with Tiimo 3.0 Design System token mappings.

### 7.1 Button Component

The Button component is the primary interactive element for user actions. It supports multiple variants, sizes, and states.

#### Variants

| Variant | Token Mapping | Use Case |
|---------|--------------|----------|
| **default** | `bg-primary` + `text-primary-foreground` + `shadow` | Primary CTAs, main actions |
| **destructive** | `bg-destructive` + `text-destructive-foreground` | Delete, remove, cancel actions |
| **outline** | `border border-input` + `bg-background` | Secondary actions |
| **secondary** | `bg-secondary` + `text-secondary-foreground` | Alternative actions |
| **ghost** | `hover:bg-accent` | Subtle, tertiary actions |
| **link** | `text-primary` + underline | Inline text links |
| **gradient** | `bg-gradient-to-r from-primary to-primary/80` | Promotional/highlight actions |

```tsx
// shadcn/ui Button implementation
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow hover:shadow-xl hover:shadow-primary/20',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

#### Sizes

| Size | Token Mapping | Height | Padding |
|------|---------------|--------|---------|
| **sm** | `h-8` | 32px | `px-3` |
| **default** | `h-9` | 36px | `px-4 py-2` |
| **lg** | `h-10` | 40px | `px-8` |
| **icon** | `h-9 w-9` | 36px | Square |

#### States

**Default State:**
```css
.button-default {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
```

**Hover State:**
```css
.button-default:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-lg);
}
```

**Focus State:**
```css
.button:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}
```

**Active State:**
```css
.button:active {
  transform: scale(0.98);
}
```

**Disabled State:**
```css
.button:disabled {
  opacity: 0.5;
  pointer-events: none;
}
```

#### Token Reference

| Property | Token | Value |
|----------|-------|-------|
| Background | `--color-primary` | #3B82F6 |
| Text | `--color-primary-foreground` | #FFFFFF |
| Border Radius | `--radius-md` | 16px |
| Shadow | `--shadow-md` | 0 8px 32px -4px |
| Focus Ring | `--color-ring` | #3B82F6 |

#### Usage Examples

```tsx
// Primary action
<Button variant="default">Start Studying Free</Button>

// Secondary action
<Button variant="outline">See How It Works</Button>

// Danger action
<Button variant="destructive">Delete Account</Button>

// Promotional
<Button variant="gradient">Upgrade to Pro</Button>

// Icon button
<Button size="icon" variant="ghost">
  <IconChevronRight />
</Button>
```

---

### 7.2 Card Component

The Card component is a versatile container for grouping related content. It follows a compound component pattern with header, content, and footer sections.

#### Component Parts

```
┌─────────────────────────────────────────────┐
│  CardHeader                                │
│    ┌─────────────────────────────────────┐  │
│    │ CardTitle                          │  │
│    │ CardDescription                    │  │
│    └─────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  CardContent                               │
│    (Main content area)                      │
├─────────────────────────────────────────────┤
│  CardFooter                                │
│    (Actions, metadata)                      │
└─────────────────────────────────────────────┘
```

#### Component Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `--color-card` | #FFFFFF |
| Border | `--color-border` | #E8E4DE |
| Border Radius | `--radius-lg` | 20px |
| Shadow Default | `--shadow-tiimo` | 0 8px 32px -4px |
| Shadow Hover | `--shadow-tiimo-lg` | 0 16px 48px -8px |

#### CSS Implementation

```css
.tiimo-card {
  background-color: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
}

.tiimo-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-tiimo-lg);
  border-color: rgba(59, 130, 246, 0.2); /* primary/20 */
}
```

#### Usage Examples

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Subject card
<Card className="hover-lift cursor-pointer">
  <CardHeader>
    <div className="w-12 h-12 rounded-lg bg-math-soft flex items-center justify-center">
      <IconMath />
    </div>
    <CardTitle>Mathematics</CardTitle>
    <CardDescription>Grades 10-12</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Master algebra, geometry, calculus and more with AI-powered explanations.</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline" className="w-full">Explore</Button>
  </CardFooter>
</Card>

// Achievement card
<Card>
  <CardHeader>
    <CardTitle>Achievement Unlocked!</CardTitle>
    <CardDescription>7-day study streak</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex items-center gap-4">
      <IconTrophy className="text-warning" />
      <span className="font-semibold">Keep it up!</span>
    </div>
  </CardContent>
</Card>
```

#### Hover Effects

```css
/* Lift effect */
.card-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-tiimo-lg);
}

/* Glow effect */
.card-glow:hover {
  box-shadow: 0 0 20px var(--color-primary);
}
```

---

### 7.3 Input & Select Components

Form inputs follow iOS human interface guidelines with smooth focus transitions.

#### Token Mapping

| Property | Token | Value |
|----------|-------|-------|
| Background | `--color-input` | #FFFFFF |
| Border | `--color-border` | #E8E4DE |
| Border Radius | `--radius-sm` | 10px |
| Focus Ring | `--color-ring` | #3B82F6 |
| Text | `--color-foreground` | #0F172A |
| Placeholder | `--color-muted-foreground` | #64748B |

#### CSS

```css
.input {
  background-color: var(--color-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-ring);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input::placeholder {
  color: var(--color-muted-foreground);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### Usage

```tsx
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Text input
<Input 
  type="text" 
  placeholder="Search subjects..." 
/>

// With label
<div className="space-y-2">
  <Label>Email Address</Label>
  <Input type="email" placeholder="you@school.co.za" />
</div>

// Select dropdown
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select subject" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="math">Mathematics</SelectItem>
    <SelectItem value="physics">Physical Sciences</SelectItem>
    <SelectItem value="life">Life Sciences</SelectItem>
  </SelectContent>
</Select>
```

---

### 7.4 Navigation (Floating Liquid Glass Navbar)

The navigation uses a floating glassmorphism design with backdrop blur, following iOS design principles.

#### Structure

```tsx
// Fixed position navbar
<nav className="fixed top-0 left-0 right-0 z-50">
  <div className="mx-auto max-w-7xl">
    {/* Glass container */}
    <div className="rounded-2xl my-4 border border-white/20 backdrop-blur-xl bg-white/70 shadow-lg">
      {/* Nav content */}
    </div>
  </div>
</nav>
```

#### Token Mapping

| Property | Token | Value |
|----------|-------|-------|
| Background | `--color-surface` with transparency | rgba(255,255,255,0.7) |
| Backdrop Blur | `backdrop-blur-xl` | 24px blur |
| Border | `border-white/20` | 20% white |
| Shadow | `--shadow-tiimo` | 0 8px 32px -4px |
| Content Padding | `pb-40` on main area | 160px bottom |

#### CSS

```css
.nav-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-tiimo);
}

.nav-item {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  transition: background-color 0.2s;
}

.nav-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.nav-item.active {
  color: var(--color-primary);
  background-color: rgba(59, 130, 246, 0.1);
}
```

#### Mobile Considerations

- Hamburger menu triggers slide-out drawer
- Drawer: fixed left, full height, backdrop blur
- Content areas use `pb-40` to account for navbar

#### Usage

```tsx
// Navigation wrapper
<div className="min-h-screen pb-40">
  <AppNav />  {/* Fixed navbar */}
  <main className="pt-8">
    {/* Page content */}
  </main>
</div>
```

---

### 7.5 Modal / Dialog Component

Modal dialogs use an overlay with centered content, animated with scale transitions.

#### Token Mapping

| Property | Token | Value |
|----------|-------|-------|
| Overlay | `bg-black/50` | rgba(0,0,0,0.5) |
| Content Background | `--color-card` | #FFFFFF |
| Content Border Radius | `--radius-xl` | 24px |
| Animation | Scale up | transform: scale(0.95) → scale(1) |

#### CSS

```css
.dialog-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  animation: fadeIn 0.2s ease;
}

.dialog-content {
  background-color: var(--color-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-tiimo-xl);
  max-width: 500px;
  margin: auto;
  animation: scaleIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}
```

#### Usage

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this item?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### 7.6 Avatar Component

Avatar displays user images or initials with consistent sizing.

#### Token Mapping

| Property | Token | Value |
|----------|-------|-------|
| Border Radius | `--radius-full` | 9999px |
| Border | `--color-border` | #E8E4DE |

#### Size Variants

| Size | Token | Dimensions |
|------|-------|------------|
| **sm** | `h-8 w-8` | 32px |
| **md** | `h-10 w-10` | 40px |
| **lg** | `h-12 w-12` | 48px |
| **xl** | `h-16 w-16` | 64px |

#### CSS

```css
.avatar {
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border);
  object-fit: cover;
}

.avatar-initials {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
```

#### Usage

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

<Avatar size="lg">
  <AvatarImage src="/avatars/user.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

// Avatar group (stacked)
<div className="flex -space-x-2">
  <Avatar size="sm"><AvatarImage src="/avatars/1.jpg" /></Avatar>
  <Avatar size="sm"><AvatarImage src="/avatars/2.jpg" /></Avatar>
  <Avatar size="sm"><AvatarImage src="/avatars/3.jpg" /></Avatar>
</div>
```

---

### 7.7 Badge / Chip Component

Badges are compact status indicators or labels.

#### Token Mapping

| Property | Token | Value |
|----------|-------|-------|
| Border Radius | `--radius-xs` | 6px |
| Border Radius (pill) | `--radius-full` | 9999px |
| Padding | `px-2.5 py-0.5` | 10px 2px |

#### Variants

| Variant | Token Mapping | Use |
|---------|--------------|-----|
| **default** | `bg-primary/10 text-primary` | Primary status |
| **secondary** | `bg-secondary text-secondary-foreground` | Neutral |
| **success** | `bg-success-soft text-success` | Success states |
| **warning** | `bg-warning-soft text-warning` | Warnings |
| **destructive** | `bg-destructive-soft text-destructive` | Errors |

#### CSS

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: var(--radius-xs);
  line-height: 1;
}

.badge-pill {
  border-radius: var(--radius-full);
}
```

#### Usage

```tsx
import { Badge } from '@/components/ui/badge';

// Status badges
<Badge variant="success">Completed</Badge>
<Badge variant="warning">In Progress</Badge>
<Badge variant="destructive">Failed</Badge>

// Subject badges
<Badge variant="default" className="bg-math-soft text-math">Mathematics</Badge>
<Badge variant="secondary">Grade 12</Badge>

// Pill style
<Badge variant="outline" className="rounded-full">New</Badge>
```

---

### 7.8 Tabs Component

Tabs allow content organization with an underline active indicator.

#### Token Mapping

| Property | Token | Value |
|----------|-------|-------|
| Inactive Text | `--color-muted-foreground` | #64748B |
| Active Text | `--color-primary` | #3B82F6 |
| Active Indicator | `bg-primary` | #3B82F6 |
| Hover Background | `--color-accent` | rgba(59,130,246,0.12) |

#### CSS

```css
.tabs-list {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  gap: 1rem;
}

.tabs-trigger {
  padding: 0.75rem 0;
  color: var(--color-muted-foreground);
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}

.tabs-trigger:hover {
  color: var(--color-foreground);
  background-color: var(--color-accent);
}

.tabs-trigger[data-state="active"] {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tabs-content {
  padding-top: 1rem;
}
```

#### Usage

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="math">
  <TabsList>
    <TabsTrigger value="math">Mathematics</TabsTrigger>
    <TabsTrigger value="physics">Physics</TabsTrigger>
    <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
  </TabsList>
  <TabsContent value="math">
    <p>Mathematics content here...</p>
  </TabsContent>
  <TabsContent value="physics">
    <p>Physics content here...</p>
  </TabsContent>
</Tabs>
```

---

### 7.9 Toggle / Switch Component

Toggle switches for boolean settings with smooth thumb animation.

#### Token Mapping

| Property | Token | Value |
|----------|-------|-------|
| Track Off | `--color-muted` | #F1F5F9 |
| Track On | `--color-primary` | #3B82F6 |
| Thumb | `bg-white` | #FFFFFF |
| Thumb Size | 4px smaller than track | - |

#### CSS

```css
.toggle {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: var(--color-muted);
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle[data-state="checked"] {
  background-color: var(--color-primary);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 9999px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.toggle[data-state="checked"] .toggle-thumb {
  transform: translateX(20px);
}
```

#### Usage

```tsx
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

<div className="flex items-center space-x-2">
  <Switch id="notifications" />
  <Label htmlFor="notifications">Enable notifications</Label>
</div>
```

---

### 7.10 Progress Component

Progress indicators show completion status or loading states.

#### Token Mapping

| Property | Token | Value |
|----------|-------|-------|
| Track | `--color-muted` | #F1F5F9 |
| Fill Default | `--color-primary` | #3B82F6 |
| Border Radius | `--radius-full` | 9999px |

#### Variants

| Variant | Use Case |
|---------|----------|
| **default** | Primary brand color |
| **subject** | Uses subject-specific colors (math, physics, etc.) |
| **success** | Completion states |

#### CSS

```css
.progress {
  background-color: var(--color-muted);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

/* Subject colors */
.progress-math { background-color: var(--subject-math); }
.progress-physics { background-color: var(--subject-physics); }
.progress-life { background-color: var(--subject-life); }
```

#### Usage

```tsx
import { Progress } from '@/components/ui/progress';

// Default progress
<Progress value={75} />

// Subject-colored
<Progress value={60} className="bg-math-soft" indicatorClassName="bg-math" />

// With label
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Progress</span>
    <span className="font-numeric">75%</span>
  </div>
  <Progress value={75} />
</div>
```

---

### 7.11 Tooltip Component

Tooltips provide contextual information on hover with an arrow pointer.

#### Token Mapping

| Property | Token | Value |
|----------|-------|-------|
| Background | `--color-secondary-navy` | #0F172A |
| Text | `--color-white` | #FFFFFF |
| Arrow Radius | `--radius-full` | 9999px |
| Padding | `px-3 py-1.5` | 12px 6px |

#### CSS

```css
.tooltip-content {
  background-color: var(--color-secondary-navy);
  color: var(--color-white);
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-xs);
  font-size: 0.75rem;
  box-shadow: var(--shadow-tiimo);
  animation: fadeIn 0.15s ease;
}

.tooltip-arrow {
  fill: var(--color-secondary-navy);
}

.tooltip-arrow[data-side="top"] {
  transform: rotate(45deg);
}
```

#### Usage

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <IconInfo />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Additional information here</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### 7.12 Component Token Summary

| Token | CSS Variable | Value | Components Used |
|-------|--------------|-------|-----------------|
| `--color-primary` | `--primary-blue` | #3B82F6 | Button, Tabs, Switch, Progress |
| `--color-primary-foreground` | -- | #FFFFFF | Button, Badge |
| `--color-card` | -- | #FFFFFF | Card, Dialog |
| `--color-border` | -- | #E8E4DE | Card, Input, Tabs |
| `--color-input` | -- | #FFFFFF | Input, Select |
| `--color-muted` | -- | #F1F5F9 | Progress, Switch |
| `--color-destructive` | -- | #FF5C5C | Button, Badge |
| `--color-success` | -- | #5CB587 | Badge, Progress |
| `--color-warning` | -- | #F2C945 | Badge |
| `--radius-xs` | -- | 6px | Badge, Tooltip |
| `--radius-sm` | -- | 10px | Input, Select |
| `--radius-md` | -- | 16px | Button |
| `--radius-lg` | -- | 20px | Card |
| `--radius-xl` | -- | 24px | Dialog |
| `--radius-full` | -- | 9999px | Avatar, Toggle, Progress |

---

### 7.13 Best Practices

1. **Consistency**: Always use token variables instead of hardcoded values
2. **Accessibility**: Ensure all interactive elements have focus states
3. **Responsiveness**: Test components across all breakpoints
4. **Dark Mode**: Components should support both light and dark themes via CSS variables
5. **Animation**: Use `duration-normal` (300ms) for transitions, respect `prefers-reduced-motion`

---

## Part 9: Theme Tokens

> Design system token definitions with explicit Light and Dark theme values. This section provides a complete reference for CSS variables and their semantic mappings.

---

### 8.1 Memory Map

#### designTokens (Base Colors)
```
┌─────────────────────────────────────────────────────────────┐
│                    designTokens                              │
├─────────────────────────────────────────────────────────────┤
│  primary:      #3B82F6  (bright blue)                       │
│  secondary:    #0F172A  (deep navy)                         │
│  tertiary:     #D16900  (vibrant orange)                    │
│  background:   #F8FAFC  (off-white)                         │
│  surface:      #FFFFFF  (white)                             │
│  text-primary: #0F172A  (deep navy)                         │
│  text-secondary:#475569 (slate 600)                        │
│  text_muted:   #64748B  (slate 500)                        │
│  border:       #E2E8F0  (slate 200)                        │
│  success:      #5CB587  (green)                             │
│  warning:      #F2C945  (yellow)                            │
│  error:        #FF5C5C  (red)                               │
│  info:         #48A7DE  (sky blue)                          │
└─────────────────────────────────────────────────────────────┘
```

#### themeOverrides (Dark Mode)
```
┌─────────────────────────────────────────────────────────────┐
│                   themeOverrides                             │
├─────────────────────────────────────────────────────────────┤
│  background:   #0F172A  (override from #F8FAFC)           │
│  surface:      #1E293B  (override from #FFFFFF)           │
│  border:       #334155  (override from #E2E8F0)           │
│  text_primary: #F8FAFC  (override - lighter for contrast) │
│  text_secondary:#CBD5E1 (adjusted from #475569)           │
│  text_muted:   #94A3B8  (adjusted from #64748B)           │
└─────────────────────────────────────────────────────────────┘
```

---

### 8.2 Light Theme CSS Variables

```css
/* Light Theme CSS Variables */
:root {
  /* ═══════════════════════════════════════════════════════ */
  /* PRIMARY COLORS                                            */
  /* ═══════════════════════════════════════════════════════ */
  --color-primary: #3B82F6;        /* Bright Blue - brand core, CTAs */
  --color-primary-hover: #2563EB;  /* Deeper blue for hover states */
  --color-primary-foreground: #FFFFFF;

  /* ═══════════════════════════════════════════════════════ */
  /* SECONDARY & TERTIARY                                      */
  /* ═══════════════════════════════════════════════════════ */
  --color-secondary: #0F172A;       /* Deep Navy - headings, text */
  --color-secondary-foreground: #F8FAFC;
  --color-tertiary: #D16900;       /* Vibrant Orange - accents */
  --color-tertiary-foreground: #FFFFFF;

  /* ═══════════════════════════════════════════════════════ */
  /* BACKGROUND & SURFACE                                      */
  /* ═══════════════════════════════════════════════════════ */
  --color-background: #F8FAFC;     /* Off-white - page background */
  --color-surface: #FFFFFF;        /* White - cards, elevated */
  --color-surface-elevated: #FFFFFF;

  /* ═══════════════════════════════════════════════════════ */
  /* TEXT COLORS                                               */
  /* ═══════════════════════════════════════════════════════ */
  --color-text-primary: #0F172A;   /* Deep Navy - headings */
  --color-text-secondary: #475569; /* Slate 600 - body text */
  --color-text-muted: #64748B;     /* Slate 500 - captions */

  /* ═══════════════════════════════════════════════════════ */
  /* BORDER & INPUT                                            */
  /* ═══════════════════════════════════════════════════════ */
  --color-border: #E2E8F0;          /* Slate 200 - borders */
  --color-input: #E2E8F0;          /* Input backgrounds */
  --color-ring: #3B82F6;           /* Focus ring */

  /* ═══════════════════════════════════════════════════════ */
  /* FEEDBACK STATES                                           */
  /* ═══════════════════════════════════════════════════════ */
  --color-success: #5CB587;        /* Green - correct answers */
  --color-success-soft: rgba(92, 181, 135, 0.12);
  --color-success-foreground: #FFFFFF;

  --color-warning: #F2C945;        /* Yellow - warnings */
  --color-warning-soft: rgba(242, 201, 69, 0.12);
  --color-warning-foreground: #0F172A;

  --color-error: #FF5C5C;         /* Red - incorrect, errors */
  --color-error-soft: rgba(255, 92, 92, 0.12);
  --color-error-foreground: #FFFFFF;

  --color-info: #48A7DE;          /* Sky Blue - information */
  --color-info-soft: rgba(72, 167, 222, 0.12);
  --color-info-foreground: #FFFFFF;

  /* ═══════════════════════════════════════════════════════ */
  /* MUTED & ACCENT                                            */
  /* ═══════════════════════════════════════════════════════ */
  --color-muted: #F1F5F9;         /* Slate 100 - muted backgrounds */
  --color-muted-foreground: #64748B;
  --color-accent: rgba(59, 130, 246, 0.12);
  --color-accent-foreground: #3B82F6;

  /* ═══════════════════════════════════════════════════════ */
  /* CARD & POPOVER                                            */
  /* ═══════════════════════════════════════════════════════ */
  --color-card: #FFFFFF;
  --color-card-foreground: #0F172A;
  --color-popover: #FFFFFF;
  --color-popover-foreground: #0F172A;
}
```

---

### 8.3 Dark Theme CSS Variables

```css
/* Dark Theme CSS Variables */
.dark {
  /* ═══════════════════════════════════════════════════════ */
  /* PRIMARY COLORS (Preserved)                               */
  /* ═══════════════════════════════════════════════════════ */
  --color-primary: #3B82F6;        /* Bright Blue - remains same */
  --color-primary-hover: #60A5FA;  /* Lighter for dark mode */
  --color-primary-foreground: #FFFFFF;

  /* ═══════════════════════════════════════════════════════ */
  /* SECONDARY & TERTIARY                                      */
  /* ═══════════════════════════════════════════════════════ */
  --color-secondary: #F8FAFC;    /* Light text on dark */
  --color-secondary-foreground: #0F172A;
  --color-tertiary: #FB923C;      /* Lighter orange for dark */
  --color-tertiary-foreground: #0F172A;

  /* ═══════════════════════════════════════════════════════ */
  /* BACKGROUND & SURFACE - OVERRIDDEN                        */
  /* ═══════════════════════════════════════════════════════ */
  --color-background: #0F172A;    /* Deep Navy - page bg (was #F8FAFC) */
  --color-surface: #1E293B;        /* Slate 800 - cards (was #FFFFFF) */
  --color-surface-elevated: #334155;

  /* ═══════════════════════════════════════════════════════ */
  /* TEXT COLORS - ADJUSTED FOR CONTRAST                      */
  /* ═══════════════════════════════════════════════════════ */
  --color-text-primary: #F8FAFC;   /* Off-white - headings (was #0F172A) */
  --color-text-secondary: #CBD5E1;/* Slate 300 - body (was #475569) */
  --color-text-muted: #94A3B8;     /* Slate 400 - captions (was #64748B) */

  /* ═══════════════════════════════════════════════════════ */
  /* BORDER & INPUT - OVERRIDDEN                              */
  /* ═══════════════════════════════════════════════════════ */
  --color-border: #334155;        /* Slate 700 (was #E2E8F0) */
  --color-input: #334155;
  --color-ring: #3B82F6;

  /* ═══════════════════════════════════════════════════════ */
  /* FEEDBACK STATES (Preserved or adjusted)                  */
  /* ═══════════════════════════════════════════════════════ */
  --color-success: #5CB587;
  --color-success-soft: rgba(92, 181, 135, 0.2);
  --color-success-foreground: #FFFFFF;

  --color-warning: #F2C945;
  --color-warning-soft: rgba(242, 201, 69, 0.2);
  --color-warning-foreground: #0F172A;

  --color-error: #FF5C5C;
  --color-error-soft: rgba(255, 92, 92, 0.2);
  --color-error-foreground: #FFFFFF;

  --color-info: #48A7DE;
  --color-info-soft: rgba(72, 167, 222, 0.2);
  --color-info-foreground: #FFFFFF;

  /* ═══════════════════════════════════════════════════════ */
  /* MUTED & ACCENT                                            */
  /* ═══════════════════════════════════════════════════════ */
  --color-muted: #1E293B;
  --color-muted-foreground: #94A3B8;
  --color-accent: rgba(59, 130, 246, 0.2);
  --color-accent-foreground: #60A5FA;

  /* ═══════════════════════════════════════════════════════ */
  /* CARD & POPOVER                                            */
  /* ═══════════════════════════════════════════════════════ */
  --color-card: #1E293B;
  --color-card-foreground: #F8FAFC;
  --color-popover: #1E293B;
  --color-popover-foreground: #F8FAFC;
}
```

---

### 8.4 Subject-Specific Colors

> Preserved from design-system.md for curriculum-specific theming

```css
/* ═══════════════════════════════════════════════════════════════ */
/* SUBJECT PRIMARY COLORS                                        */
/* ═══════════════════════════════════════════════════════════════ */

:root {
  /* Core Subjects */
  --subject-math: #F2C945;         /* Yellow - Mathematics */
  --subject-physics: #48A7DE;      /* Sky Blue - Physical Sciences */
  --subject-life-sciences: #5CB587; /* Green - Life Sciences */
  --subject-chemistry: #14B8A6;    /* Teal - Chemistry */

  /* Additional Subjects */
  --subject-accounting: #F472B6;   /* Pink - Accounting */
  --subject-english: #818CF8;      /* Violet - English */
  --subject-geography: #2DD4BF;    /* Emerald - Geography */
  --subject-history: #FB923C;      /* Orange - History */

  /* ═══════════════════════════════════════════════════════════════ */
  /* SUBJECT SOFT BACKGROUNDS                                    */
  /* ═══════════════════════════════════════════════════════════════ */
  --subject-math-soft: rgba(242, 201, 69, 0.12);
  --subject-physics-soft: rgba(72, 167, 222, 0.12);
  --subject-life-sciences-soft: rgba(92, 181, 135, 0.12);
  --subject-chemistry-soft: rgba(20, 184, 166, 0.12);
  --subject-accounting-soft: rgba(244, 114, 182, 0.12);
  --subject-english-soft: rgba(129, 140, 248, 0.12);
  --subject-geography-soft: rgba(45, 212, 191, 0.12);
  --subject-history-soft: rgba(251, 146, 60, 0.12);
}

/* Dark Mode Subject Colors (Preserved) */
.dark {
  --subject-math-soft: rgba(242, 201, 69, 0.2);
  --subject-physics-soft: rgba(72, 167, 222, 0.2);
  --subject-life-sciences-soft: rgba(92, 181, 135, 0.2);
  --subject-chemistry-soft: rgba(20, 184, 166, 0.2);
  --subject-accounting-soft: rgba(244, 114, 182, 0.2);
  --subject-english-soft: rgba(129, 140, 248, 0.2);
  --subject-geography-soft: rgba(45, 212, 191, 0.2);
  --subject-history-soft: rgba(251, 146, 60, 0.2);
}
```

---

### 8.5 Semantic Mapping

> Mapping design tokens to CSS variable names for consistent usage

| Semantic Role | CSS Variable | Light Value | Dark Value | Usage |
|--------------|--------------|-------------|------------|-------|
| **Page Background** | `--color-background` | `#F8FAFC` | `#0F172A` | `body`, main containers |
| **Card Surface** | `--color-surface` | `#FFFFFF` | `#1E293B` | Cards, modals |
| **Elevated Surface** | `--color-surface-elevated` | `#FFFFFF` | `#334155` | Dropdowns, tooltips |
| **Primary Action** | `--color-primary` | `#3B82F6` | `#3B82F6` | Buttons, links |
| **Primary Text** | `--color-text-primary` | `#0F172A` | `#F8FAFC` | Headings, important |
| **Body Text** | `--color-text-secondary` | `#475569` | `#CBD5E1` | Paragraphs |
| **Caption Text** | `--color-text-muted` | `#64748B` | `#94A3B8` | Labels, hints |
| **Border** | `--color-border` | `#E2E8F0` | `#334155` | Dividers, inputs |
| **Success/Correct** | `--color-success` | `#5CB587` | `#5CB587` | Correct answers |
| **Error/Incorrect** | `--color-error` | `#FF5C5C` | `#FF5C5C` | Wrong answers |
| **Warning** | `--color-warning` | `#F2C945` | `#F2C945` | Alerts, caution |
| **Info** | `--color-info` | `#48A7DE` | `#48A7DE` | Information |
| **Math Subject** | `--subject-math` | `#F2C945` | `#F2C945` | Math-specific UI |
| **Physics Subject** | `--subject-physics` | `#48A7DE` | `#48A7DE` | Physics-specific UI |
| **Life Sciences** | `--subject-life-sciences` | `#5CB587` | `#5CB587` | Biology UI |
| **Chemistry** | `--subject-chemistry` | `#14B8A6` | `#14B8A6` | Chemistry UI |

---

### 8.6 Usage in Tailwind CSS

```css
/* tailwind.config.ts extension */
export default {
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-text-primary)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--color-accent-foreground)',
        },
        card: {
          DEFAULT: 'var(--color-card)',
          foreground: 'var(--color-card-foreground)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-warning-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--color-error)',
          foreground: 'var(--color-error-foreground)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          foreground: 'var(--color-info-foreground)',
        },
        // Subject colors
        subject: {
          math: 'var(--subject-math)',
          physics: 'var(--subject-physics)',
          'life-sciences': 'var(--subject-life-sciences)',
          chemistry: 'var(--subject-chemistry)',
          accounting: 'var(--subject-accounting)',
          english: 'var(--subject-english)',
          geography: 'var(--subject-geography)',
          history: 'var(--subject-history)',
        },
      },
    },
  },
}
```

---

### 8.7 Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                    THEME TOKENS QUICK REFERENCE                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LIGHT THEME                    DARK THEME                      │
│  ─────────────                 ────────────                      │
│  background: #F8FAFC    →      background: #0F172A             │
│  surface: #FFFFFF       →      surface: #1E293B               │
│  border: #E2E8F0        →      border: #334155                 │
│  text-primary: #0F172A  →      text_primary: #F8FAFC           │
│  text-secondary: #475569 →      text_secondary: #CBD5E1       │
│                                                                  │
│  PRIMARY ACTIONS:                                                 │
│  ───────────────                                                │
│  --color-primary: #3B82F6 (both themes)                         │
│  --color-primary-hover: #2563EB (light) / #60A5FA (dark)       │
│                                                                  │
│  SUBJECTS (same both themes):                                    │
│  ──────────────────────────                                     │
│  Math: #F2C945   │ Physics: #48A7DE  │ Life: #5CB587           │
│  Chem: #14B8A6   │ Accnt: #F472B6    │ Eng: #818CF8            │
│  Geo: #2DD4BF    │ Hist: #FB923C                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

*Theme tokens defined April 2026*

---

## Part 10: Screens and Pages Mapping

This section provides a comprehensive mapping between design tokens, components, and all application screens. Use this as a reference when building or modifying any screen in the application.

---

### 9.1 Landing Page Structure (matricmaster-ai.vercel.app)

The public landing page is the first touchpoint for users. All sections must maintain visual consistency and follow the spacing rules defined below.

#### Landing Page Sections

| Section | Components Used | Spacing | Alignment |
|---------|-----------------|---------|-----------|
| **Navigation** | AppNav, Logo, NavLinks, CTA Buttons | `py-4` (navbar height: 64px) | Centered, max-w-7xl |
| **Hero** | Badge, Headline, Subhead, CTAs, Visual, Social Proof | `py-24 lg:py-32` (96-128px) | Centered, max-w-4xl |
| **Features** | FeatureCard (6x) | `py-20 lg:py-30` (80-120px) | Grid 3x2 |
| **How It Works** | StepCard (3x) | `py-16 lg:py-24` (64-96px) | Flex row, centered |
| **Subjects** | SubjectCard (12x) | `py-20 lg:py-30` (80-120px) | Grid 3x4 responsive |
| **Testimonials** | TestimonialCard (3x) | `py-16 lg:py-24` (64-96px) | Grid 3x1 |
| **Pricing** | PricingCard (2x) | `py-16 lg:py-24` (64-96px) | Flex row, centered |
| **FAQ** | Accordion | `py-16 lg:py-24` (64-96px) | Max-w-3xl centered |
| **Final CTA** | CTA Section | `py-20` (80px) | Centered |
| **Footer** | FooterLinks, Newsletter, Socials | `py-12` (48px) | 4-column grid |

---

### 9.2 App Pages (Authenticated)

After authentication, users access the authenticated app area with a floating navigation bar. All authenticated pages require `pb-40` (160px) bottom padding to account for the floating nav.

#### App Page Structure

| Page | Route | Key Components | Spacing |
|------|-------|----------------|---------|
| **Dashboard** | `/dashboard` | SubjectCards, ProgressRing, StreakCounter, QuickActions, WeeklyChart | `pt-8 pb-40 px-4` |
| **Quiz** | `/quiz` | QuestionCard, QuizOptions, ProgressBar, Timer, ExplanationCard | Full-screen, no container |
| **Study** | `/study` | FlashcardDisplay, SubjectSelector, FlashcardProgress | `pt-8 pb-40` |
| **Schedule** | `/schedule` | CalendarGrid, CalendarEventSidebar, AddEventDialog | `pt-8 pb-40` |
| **Focus** | `/focus` | FocusTimer, SessionTracker, FocusRoomList | `pt-8 pb-40` |
| **Profile** | `/profile` | UserAvatar, SettingsPanel, AchievementsList | `pt-8 pb-40` |

---

### 9.3 Component-Level Mapping

#### Dashboard Components

| Component | Tokens Used | Spacing Rules | Alignment |
|-----------|------------|---------------|------------|
| `SubjectCard` | `--color-card`, `--radius-lg`, `--shadow-tiimo` | `p-4` internal, `gap-4` | Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` |
| `ProgressRing` | `--color-primary`, `--radius-full` | `p-2` | Centered in card |
| `StreakCounter` | `--color-warning`, `--font-mono` | `px-3 py-1` | Inline with stats |
| `WeeklyChartCard` | `--color-card`, `--color-muted` | `p-6` | Full width, max-w-md |
| `QuickActionButton` | `--color-primary`, `--radius-md` | `p-3` | Grid: `grid-cols-4` |
| `TodayTab` | `--color-accent` | `p-4` | Tab container |

#### Quiz Components

| Component | Tokens Used | Spacing Rules | Alignment |
|-----------|------------|---------------|------------|
| `QuestionCard` | `--color-card`, `--radius-xl` | `p-6 lg:p-8` | Centered, max-w-2xl |
| `QuizOption` | `--color-border`, `--radius-md` | `p-4` | Full width, stacked |
| `ProgressBar` | `--color-primary`, `--color-muted` | `h-2` | Full width |
| `Timer` | `--font-mono`, `--color-tertiary` | `px-4 py-2` | Fixed position top-right |
| `ExplanationCard` | `--color-accent`, `--radius-lg` | `p-4` | Below question |
| `PracticeNavigation` | `--color-secondary` | `p-2` | Bottom fixed |

#### Study/Flashcard Components

| Component | Tokens Used | Spacing Rules | Alignment |
|-----------|------------|---------------|------------|
| `FlashcardDisplay` | `--color-card`, `--radius-xl`, `--shadow-tiimo` | `p-8` | Centered, max-w-lg |
| `FlashcardNavigation` | `--color-primary` | `gap-2` | Centered row |
| `FlashcardProgress` | `--color-muted` | `h-1` | Below card |
| `FlashcardRatingButtons` | `--color-success`, `--color-warning` | `gap-3` | Bottom row |
| `FlashcardModal` | `--radius-2xl` | `p-6` | Centered overlay |

#### Schedule Components

| Component | Tokens Used | Spacing Rules | Alignment |
|-----------|------------|---------------|------------|
| `CalendarHeader` | `--color-foreground` | `p-4` | Flex row, space-between |
| `CalendarGrid` | `--color-muted` | `p-2` | 7-column grid |
| `CalendarEventSidebar` | `--color-card` | `p-4` | Fixed right |
| `AddEventDialog` | `--radius-xl` | `p-6` | Modal centered |

#### Focus Components

| Component | Tokens Used | Spacing Rules | Alignment |
|-----------|------------|---------------|------------|
| `FocusTimer` | `--font-mono`, `--color-primary` | `p-8` | Centered, large display |
| `SessionTracker` | `--color-muted` | `p-4` | Below timer |
| `FocusRoomList` | `--color-card` | `p-4` | Grid or list |

#### Profile Components

| Component | Tokens Used | Spacing Rules | Alignment |
|-----------|------------|---------------|------------|
| `UserAvatar` | `--radius-full`, `--color-border` | `p-1` | Centered |
| `SettingsPanel` | `--color-card`, `--radius-lg` | `p-6` | Vertical stack |
| `AchievementsList` | `--color-warning`, `--radius-md` | `gap-4` | Grid 3x2 |
| `ProfileStats` | `--font-mono` | `gap-6` | Flex row |

---

### 9.4 Token-to-Screen Mapping Table

#### Hero Section Tokens

| Element | Token | Value | CSS Property |
|---------|-------|-------|--------------|
| Badge Background | `--color-accent` | `rgba(59, 130, 246, 0.12)` | `background` |
| Badge Text | `--color-primary` | `#3B82F6` | `color` |
| Headline Font | `--font-display` | `Playfair Display` | `font-family` |
| Headline Size | `--text-5xl` | `3.815rem` | `font-size` |
| Headline Weight | `--weight-bold` | `700` | `font-weight` |
| Headline Color | `--color-secondary` | `#0F172A` | `color` |
| Subhead Font | `--font-body` | `Geist` | `font-family` |
| Subhead Size | `--text-lg` | `1.25rem` | `font-size` |
| Subhead Color | `--color-muted-foreground` | `#64748B` | `color` |
| Section Padding Y | `--section-padding-y` | `120px` | `padding-top/bottom` |
| CTA Primary BG | `--color-primary` | `#3B82F6` | `background` |
| CTA Primary Radius | `--radius-md` | `16px` | `border-radius` |
| CTA Secondary Border | `--color-border` | `#E8E4DE` | `border` |

#### Feature Card Tokens

| Element | Token | Value | CSS Property |
|---------|-------|-------|--------------|
| Card Background | `--color-card` | `#FFFFFF` | `background` |
| Card Border | `--color-border` | `#E8E4DE` | `border` |
| Card Radius | `--radius-lg` | `20px` | `border-radius` |
| Card Shadow Default | `--shadow-tiimo` | `0 8px 32px -4px` | `box-shadow` |
| Card Shadow Hover | `--shadow-tiimo-lg` | `0 16px 48px -8px` | `box-shadow` |
| Icon Container BG | `--color-accent` | `rgba(59, 130, 246, 0.12)` | `background` |
| Icon Size | `48px` | - | `width/height` |
| Title Font | `--font-body` | `Geist` | `font-family` |
| Title Size | `--text-xl` | `1.563rem` | `font-size` |
| Title Weight | `--weight-semibold` | `600` | `font-weight` |
| Description Font | `--font-body` | `Geist` | `font-family` |
| Description Size | `--text-base` | `1rem` | `font-size` |
| Description Color | `--color-muted-foreground` | `#64748B` | `color` |
| Card Padding | `--space-lg` | `24px` | `padding` |

#### Subject Card Tokens

| Element | Token | Value | CSS Property |
|---------|-------|-------|--------------|
| Card Background | `--color-card` | `#FFFFFF` | `background` |
| Card Radius | `--radius-md` | `16px` | `border-radius` |
| Card Hover Transform | `translateY(-4px)` | - | `transform` |
| Icon Size | `64px` | - | `width/height` |
| Title Font | `--font-body` | `Geist` | `font-family` |
| Title Weight | `--weight-semibold` | `600` | `font-weight` |
| Caption Font | `--font-body` | `Geist` | `font-family` |
| Caption Size | `--text-sm` | `0.8rem` | `font-size` |
| Caption Color | `--color-muted-foreground` | `#64748B` | `color` |
| CTA Button | `variant="outline"` | - | `border` |
| Subject Colors | See design-system.md | Subject Pastels | Per subject |

#### Testimonial Card Tokens

| Element | Token | Value | CSS Property |
|---------|-------|-------|--------------|
| Card Background | `--color-card` | `#FFFFFF` | `background` |
| Card Radius | `--radius-lg` | `20px` | `border-radius` |
| Quote Font | `--font-display` | `Playfair Display` | `font-family` |
| Quote Style | `italic` | - | `font-style` |
| Quote Size | `--text-lg` | `1.25rem` | `font-size` |
| Author Name Font | `--font-body` | `Geist` | `font-family` |
| Author Name Weight | `--weight-medium` | `500` | `font-weight` |
| Avatar Size | `48px` | - | `width/height` |
| Avatar Radius | `--radius-full` | `9999px` | `border-radius` |
| Star Color | `--color-warning` | `#F2C945` | `color` |

#### Pricing Card Tokens

| Element | Token | Value | CSS Property |
|---------|-------|-------|--------------|
| Card Background | `--color-card` | `#FFFFFF` | `background` |
| Card Border | `--color-border` | `#E8E4DE` | `border` |
| Card Radius | `--radius-xl` | `24px` | `border-radius` |
| Popular Badge BG | `--color-primary` | `#3B82F6` | `background` |
| Price Font | `--font-mono` | `Geist Mono` | `font-family` |
| Price Size | `--text-4xl` | `3.052rem` | `font-size` |
| Price Weight | `--weight-bold` | `700` | `font-weight` |
| Feature List Spacing | `--space-sm` | `8px` | `gap` |
| CTA Width | `100%` | - | `width` |

#### Quiz Screen Tokens

| Element | Token | Value | CSS Property |
|---------|-------|-------|--------------|
| Question Container | `--color-card` | `#FFFFFF` | `background` |
| Question Radius | `--radius-xl` | `24px` | `border-radius` |
| Question Shadow | `--shadow-tiimo` | - | `box-shadow` |
| Option Border Default | `--color-border` | `#E8E4DE` | `border` |
| Option Border Selected | `--color-primary` | `#3B82F6` | `border` |
| Option Border Correct | `--color-success` | `#5CB587` | `border` |
| Option Border Wrong | `--color-destructive` | `#FF5C5C` | `border` |
| Option BG Correct | `--color-success-soft` | `rgba(92, 181, 135, 0.12)` | `background` |
| Option BG Wrong | `--color-destructive-soft` | `rgba(255, 92, 92, 0.12)` | `background` |
| Progress Bar BG | `--color-muted` | `#F1F5F9` | `background` |
| Progress Bar Fill | `--color-primary` | `#3B82F6` | `background` |
| Timer Font | `--font-mono` | `Geist Mono` | `font-family` |
| Timer Size | `--text-2xl` | `1.953rem` | `font-size` |
| Timer Warning | `--color-tertiary` | `#D16900` | `color` |

#### Dashboard Tokens

| Element | Token | Value | CSS Property |
|---------|-------|-------|--------------|
| Grid Gap | `--space-md` | `16px` | `gap` |
| Section Margin | `--space-xl` | `32px` | `margin-bottom` |
| Stat Number Font | `--font-mono` | `Geist Mono` | `font-family` |
| Stat Number Size | `--text-4xl` | `3.052rem` | `font-size` |
| Card Lift Effect | `translateY(-4px)` | - | `transform` |
| Card Shadow Hover | `--shadow-tiimo-lg` | - | `box-shadow` |

---

### 9.5 Spacing Rules by Screen Type

#### Landing Page Sections

```css
/* Hero Section */
.hero-section {
  padding: var(--space-24) var(--container-padding); /* 96px vertical */
}

/* Feature Section */
.feature-section {
  padding: var(--space-20) var(--container-padding);   /* 80px vertical */
}

.feature-grid {
  gap: var(--space-6);  /* 24px gap between cards */
  grid-template-columns: repeat(3, 1fr);
}

/* Subject Grid */
.subject-section {
  padding: var(--space-20) var(--container-padding);
}

.subject-grid {
  gap: var(--space-4);  /* 16px gap */
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
}
```

#### Authenticated App Pages

```css
/* Standard page layout */
.app-page {
  padding-top: var(--space-8);   /* 32px - below navbar */
  padding-bottom: 160px;        /* pb-40 - above floating nav */
  padding-left: var(--container-padding);
  padding-right: var(--container-padding);
}

/* Dashboard grid */
.dashboard-grid {
  gap: var(--space-4);
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Full-width sections */
.full-width-section {
  margin-left: calc(-1 * var(--container-padding));
  margin-right: calc(-1 * var(--container-padding));
  padding-left: var(--container-padding);
  padding-right: var(--container-padding);
}
```

---

### 9.6 Alignment Requirements

#### Container Alignment

| Context | Max Width | Padding (Mobile) | Padding (Desktop) |
|---------|-----------|------------------|-------------------|
| Hero Headline | `max-w-4xl` | `px-4` | `px-6` |
| Feature Grid | `max-w-7xl` | `px-4` | `px-6` |
| Subject Grid | `max-w-7xl` | `px-4` | `px-6` |
| Card Content | `max-w-lg` | `px-4` | `px-8` |
| Footer | `max-w-7xl` | `px-4` | `px-6` |

#### Grid Specifications

| Grid | Columns (Mobile) | Columns (Tablet) | Columns (Desktop) | Gap |
|------|------------------|------------------|-------------------|-----|
| **Features** | 1 | 2 | 3 | `gap-6` |
| **Subjects** | 2 | 3 | 4 | `gap-4` |
| **Testimonials** | 1 | 1 | 3 | `gap-6` |
| **Pricing** | 1 | 2 | 2 | `gap-6` |
| **Dashboard Stats** | 2 | 2 | 4 | `gap-4` |
| **Dashboard Cards** | 1 | 2 | 3 | `gap-4` |

#### Flexbox Alignment

| Context | Flex Direction | Justify | Align |
|---------|----------------|---------|-------|
| Hero Content | `column` | `center` | `center` |
| Nav Items | `row` | `start` | `center` |
| Feature Card | `column` | `start` | `stretch` |
| Subject Card | `column` | `center` | `center` |
| Button Group | `row` | `center` | `center` |
| Footer Columns | `row` | `space-between` | `start` |

---

### 9.7 Complete Token Reference by Screen

#### Landing Page Full Token List

```css
/* Navigation */
--nav-height: 64px;
--nav-bg: rgba(255, 255, 255, 0.7);
--nav-blur: 24px;
--nav-border: rgba(255, 255, 255, 0.2);
--nav-shadow: var(--shadow-tiimo);

/* Hero */
--hero-badge-bg: var(--color-accent);
--hero-badge-color: var(--color-primary);
--hero-title-font: var(--font-display);
--hero-title-size: var(--text-5xl);
--hero-title-weight: var(--weight-bold);
--hero-title-color: var(--color-secondary);
--hero-subtitle-font: var(--font-body);
--hero-subtitle-size: var(--text-lg);
--hero-subtitle-color: var(--tiimo-gray-muted);
--hero-cta-primary-bg: var(--color-primary);
--hero-cta-primary-radius: var(--radius-md);
--hero-cta-secondary-border: var(--color-border);
--hero-social-proof-gap: var(--space-4);

/* Features */
--feature-section-padding: 120px;
--feature-grid-gap: var(--space-6);
--feature-card-bg: var(--color-card);
--feature-card-border: var(--color-border);
--feature-card-radius: var(--radius-lg);
--feature-card-shadow: var(--shadow-tiimo);
--feature-card-shadow-hover: var(--shadow-tiimo-lg);
--feature-icon-size: 48px;
--feature-icon-bg: var(--color-accent);
--feature-title-font: var(--font-body);
--feature-title-size: var(--text-xl);
--feature-title-weight: var(--weight-semibold);
--feature-desc-font: var(--font-body);
--feature-desc-size: var(--text-base);
--feature-desc-color: var(--tiimo-gray-muted);

/* How It Works */
--steps-section-padding: 96px;
--step-number-size: 40px;
--step-number-bg: var(--color-primary);
--step-number-color: var(--color-primary-foreground);
--step-title-font: var(--font-body);
--step-title-size: var(--text-lg);
--step-title-weight: var(--weight-semibold);
--step-desc-font: var(--font-body);
--step-desc-size: var(--text-base);
--step-desc-color: var(--tiimo-gray-muted);

/* Subjects */
--subject-section-padding: 120px;
--subject-card-size: 200px;
--subject-icon-size: 64px;
--subject-card-radius: var(--radius-md);
--subject-card-bg: var(--color-card);
--subject-card-shadow: var(--shadow-tiimo);
--subject-title-font: var(--font-body);
--subject-title-weight: var(--weight-semibold);
--subject-caption-size: var(--text-sm);
--subject-caption-color: var(--tiimo-gray-muted);

/* Testimonials */
--testimonial-section-padding: 96px;
--testimonial-card-bg: var(--color-card);
--testimonial-card-radius: var(--radius-lg);
--testimonial-quote-font: var(--font-display);
--testimonial-quote-size: var(--text-lg);
--testimonial-quote-style: italic;
--testimonial-avatar-size: 48px;
--testimonial-star-color: var(--color-warning);

/* Pricing */
--pricing-section-padding: 96px;
--pricing-card-bg: var(--color-card);
--pricing-card-border: var(--color-border);
--pricing-card-radius: var(--radius-xl);
--pricing-card-popular-border: var(--color-primary);
--pricing-price-font: var(--font-mono);
--pricing-price-size: var(--text-4xl);
--pricing-price-weight: var(--weight-bold);
--pricing-feature-gap: var(--space-sm);

/* FAQ */
--faq-section-padding: 96px;
--faq-max-width: 800px;
--faq-item-border: var(--color-border);
--faq-question-font: var(--font-body);
--faq-question-size: var(--text-lg);
--faq-question-weight: var(--weight-medium);
--faq-answer-font: var(--font-body);
--faq-answer-size: var(--text-base);

/* Final CTA */
--cta-section-padding: 80px;
--cta-bg: linear-gradient(135deg, var(--color-primary) 0%, #6366f1 100%);
--cta-title-font: var(--font-display);
--cta-title-size: var(--text-3xl);
--cta-title-color: var(--color-primary-foreground);
--cta-subtitle-color: rgba(255, 255, 255, 0.9);

/* Footer */
--footer-section-padding: 48px;
--footer-bg: var(--color-secondary);
--footer-text-color: rgba(255, 255, 255, 0.7);
--footer-link-color: rgba(255, 255, 255, 0.9);
--footer-column-gap: var(--space-8);
```

#### Authenticated App Full Token List

```css
/* Page Layout */
--app-page-padding-top: 32px;     /* pt-8 */
--app-page-padding-bottom: 160px; /* pb-40 */
--app-page-padding-side: 24px;

/* Floating Nav */
--floating-nav-height: 72px;
--floating-nav-bottom: 24px;
--floating-nav-radius: 9999px;
--floating-nav-blur: 24px;
--floating-nav-bg: rgba(255, 255, 255, 0.8);

/* Dashboard */
--dashboard-grid-gap: var(--space-4);
--stat-number-font: var(--font-mono);
--stat-number-size: var(--text-4xl);
--stat-number-weight: var(--weight-semibold);
--streak-icon-color: var(--color-warning);
--progress-ring-size: 80px;
--progress-ring-stroke: 8px;
--subject-card-min-height: 120px;

/* Quiz */
--quiz-container-max-width: 800px;
--question-card-radius: var(--radius-xl);
--question-card-padding: 32px;
--quiz-option-height: 56px;
--quiz-option-radius: var(--radius-md);
--quiz-option-gap: var(--space-3);
--progress-bar-height: 8px;
--timer-size: var(--text-2xl);
--timer-warning-color: var(--color-tertiary);
--explanation-card-radius: var(--radius-lg);
--explanation-card-bg: var(--color-accent);

/* Study/Flashcards */
--flashcard-width: 400px;
--flashcard-height: 280px;
--flashcard-radius: var(--radius-xl);
--flashcard-shadow: var(--shadow-tiimo-lg);
--flashcard-front-bg: var(--color-card);
--flashcard-back-bg: var(--color-accent);
--flashcard-nav-gap: var(--space-2);
--flashcard-progress-height: 4px;

/* Schedule */
--calendar-grid-columns: 7;
--calendar-cell-size: 48px;
--calendar-header-height: 40px;
--event-chip-radius: var(--radius-xs);
--event-chip-padding: 4px 8px;
--sidebar-width: 320px;

/* Focus */
--timer-display-size: 200px;
--timer-font-size: var(--text-6xl);
--timer-font: var(--font-mono);
--session-card-radius: var(--radius-lg);
--focus-room-card-size: 280px;

/* Profile */
--profile-header-height: 200px;
--avatar-size-xl: 96px;
--avatar-size-lg: 64px;
--achievement-badge-size: 56px;
--settings-section-gap: var(--space-6);
--settings-item-height: 56px;
```

---

### 9.8 Implementation Checklist

When building a new screen, verify:

- [ ] All color tokens from design-system.md are used correctly
- [ ] Typography follows the font family rules (Playfair Display for headings, Geist for body, Geist Mono for numbers)
- [ ] Spacing uses the 4px base scale
- [ ] Border radius matches the semantic tokens (button = md, card = lg, hero = xl)
- [ ] Shadows follow the elevation system
- [ ] Hover states include transform and shadow changes
- [ ] Mobile responsive breakpoints are respected
- [ ] Floating nav spacing (pb-40) is applied to authenticated pages
- [ ] Grid/flex alignment matches the specifications above
- [ ] WCAG AA color contrast is maintained

---

## Part 11: Layout and Templates

This section documents the complete page layouts, scaffold structures, and reusable template patterns for MatricMaster AI. All layouts follow the floating liquid glass navigation pattern and iOS Human Interface Guidelines.

---

### 10.1 Page Scaffolds

#### Landing Page Layout

The landing page follows a vertical scroll pattern with distinct sections:

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVIGATION BAR                            │
│                    (Floating Glass)                         │
├─────────────────────────────────────────────────────────────┤
│  HERO SECTION                                                │
│  - Trust badge (80-120px top padding)                        │
│  - Headline + Subheadline                                    │
│  - CTAs + Visual                                             │
│  - Social proof                                              │
├─────────────────────────────────────────────────────────────┤
│  FEATURES SECTION (3x2 Grid)                                 │
├─────────────────────────────────────────────────────────────┤
│  HOW IT WORKS (3 Steps)                                      │
├─────────────────────────────────────────────────────────────┤
│  SUBJECTS GRID (12 Cards)                                    │
├─────────────────────────────────────────────────────────────┤
│  TESTIMONIALS (3 Columns)                                    │
├─────────────────────────────────────────────────────────────┤
│  PRICING (2 Columns)                                        │
├─────────────────────────────────────────────────────────────┤
│  FAQ (Accordion)                                             │
├─────────────────────────────────────────────────────────────┤
│  CTA SECTION (Gradient Background)                          │
├─────────────────────────────────────────────────────────────┤
│  FOOTER (4 Columns + Newsletter)                            │
└─────────────────────────────────────────────────────────────┘
```

**Tailwind Scaffold:**

```tsx
// Landing page scaffold
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed navbar - renders on top */}
      <AppNav />
      
      {/* Main content with navbar height padding */}
      <main className="pt-20">
        {/* Hero - 96px top padding, 120px bottom */}
        <HeroSection className="py-24 lg:py-30" />
        
        {/* Features - 80px vertical */}
        <FeaturesSection className="py-20 lg:py-24" />
        
        {/* How It Works */}
        <HowItWorksSection className="py-20 lg:py-24" />
        
        {/* Subjects Grid */}
        <SubjectsSection className="py-20 lg:py-24" />
        
        {/* Testimonials */}
        <TestimonialsSection className="py-20 lg:py-24" />
        
        {/* Pricing */}
        <PricingSection className="py-20 lg:py-24" />
        
        {/* FAQ */}
        <FAQSection className="py-20 lg:py-24" />
        
        {/* CTA Banner */}
        <CTASection className="py-20" />
      </main>
      
      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
```

---

#### App Layout (Authenticated)

The app layout includes the floating navbar with additional user controls:

```tsx
// Authenticated app layout
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Floating glass navbar */}
      <AppNav />
      
      {/* Main content - pb-40 accounts for floating nav */}
      <main className="pt-8 pb-40">
        {children}
      </main>
      
      {/* Optional: Contextual sidebar or panel */}
      <StudyCompanionPanel />
    </div>
  )
}
```

**Key Padding Requirements:**

| Context | Padding | Token |
|---------|---------|-------|
| Navbar height | 80px | `pt-20` |
| Floating nav clearance | 160px | `pb-40` |
| Content top offset | 32px | `pt-8` |
| Page bottom margin | 160px | `pb-40` |

---

#### Content Pages

All content pages (subjects, results, past-papers, etc.) follow the same scaffold:

```tsx
// Generic content page scaffold
export default function ContentPage({ 
  title, 
  subtitle, 
  children 
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      
      <main className="pt-8 pb-40">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Page header */}
          <header className="mb-8">
            <h1 className="font-display text-4xl font-bold text-text-primary">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-lg text-text-secondary">
                {subtitle}
              </p>
            )}
          </header>
          
          {/* Page content */}
          {children}
        </div>
      </main>
    </div>
  )
}
```

---

### 10.2 Header Behavior

#### Floating Liquid Glass Navbar

The navbar uses a glassmorphism effect with backdrop blur, following iOS design principles.

**Structure:**

```tsx
// AppNav component structure
export function AppNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Glass container */}
        <div className="
          rounded-2xl 
          my-4 
          border border-white/20 
          backdrop-blur-xl 
          bg-white/70 
          shadow-lg
        ">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Logo - Left */}
            <Logo />
            
            {/* Navigation - Center (desktop) */}
            <NavLinks className="hidden md:flex" />
            
            {/* Actions - Right */}
            <div className="flex items-center gap-4">
              <NavActions />
              
              {/* Mobile menu trigger */}
              <MobileMenuTrigger className="md:hidden" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

**CSS Variables & Tailwind:**

```css
/* Glass navbar base */
.navbar-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px -4px rgba(70, 70, 68, 0.08);
}

/* Dark mode */
.dark .navbar-glass {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

**Tailwind Classes Reference:**

```tsx
// Navbar container
<div className="
  fixed top-0 left-0 right-0 z-50
  rounded-2xl my-4
  border border-white/20
  backdrop-blur-xl
  bg-white/70
  shadow-lg
" />

// Nav items
<nav className="hidden md:flex items-center gap-1">
  <NavLink href="/features">Features</NavLink>
  <NavLink href="/subjects">Subjects</NavLink>
  <NavLink href="/pricing">Pricing</NavLink>
  <NavLink href="/schools">For Schools</NavLink>
</nav>

// Nav link styling
.nav-link {
  @apply px-4 py-2 rounded-lg text-sm font-medium text-text-secondary transition-colors;
}
.nav-link:hover {
  @apply bg-accent text-accent-foreground;
}
.nav-link.active {
  @apply bg-primary/10 text-primary;
}
```

---

#### Navbar States

**Default State (Top of Page):**

```tsx
// Initial - more transparent
<div className="bg-white/50 backdrop-blur-md border-white/10">
  {/* Content */}
</div>
```

**Scrolled State (After 50px scroll):**

```tsx
// Scrolled - more opaque
const [scrolled, setScrolled] = useState(false)

useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 50)
  }
  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])

<div className={scrolled 
  ? 'bg-white/90 backdrop-blur-xl border-white/40' 
  : 'bg-white/50 backdrop-blur-md border-white/10'
}>
  {/* Content */}
</div>
```

**Expanded/Active State:**

```tsx
// When mobile menu is open or dropdown is active
<div className="
  bg-white/95 
  backdrop-blur-2xl 
  border-primary/20
  shadow-xl
">
  {/* Content */}
</div>
```

**Full CSS for State Transitions:**

```css
.navbar {
  transition: all 0.3s ease;
}

.navbar-default {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  border-color: rgba(255, 255, 255, 0.1);
}

.navbar-scrolled {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(24px);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px -4px rgba(70, 70, 68, 0.12);
}

.navbar-expanded {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(32px);
  border-color: rgba(59, 130, 246, 0.2);
  box-shadow: 0 16px 48px -8px rgba(70, 70, 68, 0.16);
}
```

---

#### Mobile Hamburger Menu

```tsx
// Mobile menu trigger
<button 
  className="md:hidden p-2 rounded-lg hover:bg-accent"
  onClick={() => setMobileMenuOpen(true)}
>
  <IconMenu className="w-6 h-6" />
</button>

// Mobile drawer
<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
  <SheetContent side="left" className="w-72">
    <div className="flex flex-col gap-4 mt-8">
      <NavLink href="/features">Features</NavLink>
      <NavLink href="/subjects">Subjects</NavLink>
      <NavLink href="/pricing">Pricing</NavLink>
      <div className="h-px bg-border my-2" />
      <Button variant="outline" className="w-full">Log in</Button>
      <Button className="w-full">Start Free</Button>
    </div>
  </SheetContent>
</Sheet>
```

---

### 10.3 Footer Behavior

#### Site Footer Structure

The footer uses a 4-column layout with newsletter signup and social links.

```tsx
// SiteFooter component
export function SiteFooter() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Column 1: Product */}
          <FooterColumn title="Product">
            <FooterLink href="/features">Features</FooterLink>
            <FooterLink href="/subjects">Subjects</FooterLink>
            <FooterLink href="/pricing">Pricing</FooterLink>
            <FooterLink href="/schools">For Schools</FooterLink>
            <FooterLink href="/app">App</FooterLink>
          </FooterColumn>
          
          {/* Column 2: Resources */}
          <FooterColumn title="Resources">
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/guides">Study Guides</FooterLink>
            <FooterLink href="/past-papers">Past Papers</FooterLink>
            <FooterLink href="/help">Help Center</FooterLink>
          </FooterColumn>
          
          {/* Column 3: Company */}
          <FooterColumn title="Company">
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/careers">Careers</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/press">Press Kit</FooterLink>
          </FooterColumn>
          
          {/* Column 4: Legal */}
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/legal/terms">Terms of Service</FooterLink>
            <FooterLink href="/legal/cookies">Cookie Policy</FooterLink>
            <FooterLink href="/legal/child-protection">Child Protection</FooterLink>
          </FooterColumn>
        </div>
        
        {/* Newsletter signup */}
        <div className="border-t border-border pt-8 mb-8">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div>
              <h4 className="font-semibold text-text-primary">Stay updated</h4>
              <p className="text-sm text-text-muted">Get study tips and product updates</p>
            </div>
            <form className="flex gap-2">
              <Input 
                type="email" 
                placeholder="your@email.com" 
                className="w-64"
              />
              <Button type="submit" size="sm">Subscribe</Button>
            </form>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-8 border-t border-border">
          {/* Logo */}
          <span className="font-display font-bold text-lg">lumni</span>
          
          {/* Social icons */}
          <div className="flex items-center gap-4">
            <SocialIcon href="https://facebook.com" icon={IconFacebook} />
            <SocialIcon href="https://twitter.com" icon={IconTwitter} />
            <SocialIcon href="https://instagram.com" icon={IconInstagram} />
            <SocialIcon href="https://linkedin.com" icon={IconLinkedIn} />
          </div>
          
          {/* Copyright */}
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} Lumni. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
```

**Footer CSS Variables:**

```css
.footer {
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.footer-column-title {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

.footer-link {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--color-primary);
}
```

**Tailwind Grid:**

```tsx
// 4-column grid
<div className="
  grid 
  grid-cols-2    /* Mobile: 2x2 */
  md:grid-cols-4 /* Desktop: 4 columns */
  gap-8 
  lg:gap-12
">
  {/* Columns */}
</div>

// Responsive newsletter
<div className="
  flex 
  flex-col         /* Mobile: stacked */
  md:flex-row      /* Desktop: inline */
  gap-4 
  md:items-center
">
```

---

### 10.4 Content Regions

#### Hero Section

The hero section is the primary conversion area with 80-120px top padding.

**Structure:**

```tsx
// HeroSection component
export function HeroSection({ className }: { className?: string }) {
  return (
    <section className={cn('py-24 lg:py-30', className)}>
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Trust badge */}
        <div className="flex justify-center mb-8">
          <Badge variant="secondary" className="gap-2">
            <IconGraduation />
            Trusted by 50,000+ South African students
          </Badge>
        </div>
        
        {/* Headline */}
        <h1 className="
          font-display 
          text-5xl md:text-6xl lg:text-7xl 
          font-bold 
          leading-tight 
          text-center 
          text-text-primary
        ">
          Finally, a study tool
          <span className="block text-primary">that actually works</span>
        </h1>
        
        {/* Subheadline */}
        <p className="
          mt-6 
          text-lg md:text-xl 
          text-center 
          max-w-2xl 
          mx-auto 
          text-text-secondary
        ">
          Get instant AI answers to any past paper question. 
          Identify your weak spots. Pass matric the first time.
        </p>
        
        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="gap-2">
            Start Studying Free
            <IconArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="lg">
            See How It Works
          </Button>
        </div>
        
        {/* Visual / Product demo */}
        <div className="mt-16 relative">
          <div className="
            rounded-2xl 
            border border-border 
            bg-surface 
            shadow-xl 
            overflow-hidden
          ">
            {/* Product screenshot or demo */}
            <ProductDemo />
          </div>
        </div>
        
        {/* Social proof */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="flex -space-x-2">
            <Avatar><AvatarImage src="/avatars/1.jpg" /></Avatar>
            <Avatar><AvatarImage src="/avatars/2.jpg" /></Avatar>
            <Avatar><AvatarImage src="/avatars/3.jpg" /></Avatar>
            <Avatar><AvatarImage src="/avatars/4.jpg" /></Avatar>
            <Avatar><AvatarImage src="/avatars/5.jpg" /></Avatar>
          </div>
          <span className="text-sm text-text-muted">
            Join 50,000+ students who've improved their marks
          </span>
        </div>
        
      </div>
    </section>
  )
}
```

**Hero CSS Variables:**

```css
.hero-section {
  padding-top: 96px;    /* py-24 */
  padding-bottom: 120px; /* py-30 */
}

.hero-headline {
  font-family: var(--font-display);
  font-size: clamp(3rem, 8vw + 1rem, 6rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hero-subheadline {
  font-family: var(--font-body);
  font-size: 1.25rem;
  line-height: 1.625;
  color: var(--color-text-secondary);
  max-width: 42rem;
}
```

---

#### Features Section (3x2 Grid)

```tsx
// FeaturesSection
const features = [
  {
    icon: IconBook,
    title: 'Homework Helper',
    description: 'Stuck on a problem? Upload it and get step-by-step explanations in seconds.'
  },
  {
    icon: IconClipboard,
    title: 'Real Exam Practice',
    description: 'Practice with actual NSC past papers from all provinces.'
  },
  {
    icon: IconChart,
    title: 'Progress Tracking',
    description: 'See your growth with detailed analytics and insights.'
  },
  {
    icon: IconHeadphones,
    title: 'Audio Explanations',
    description: 'Listen to explanations while commuting or multitasking.'
  },
  {
    icon: IconCamera,
    title: 'Photo Solve',
    description: 'Snap a picture of any question and get instant answers.'
  },
  {
    icon: IconPencil,
    title: 'Essay Feedback',
    description: 'Submit essays for AI-powered feedback and improvement tips.'
  }
]

export function FeaturesSection({ className }: { className?: string }) {
  return (
    <section className={className}>
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
            Everything you need to succeed
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            Powerful features designed specifically for South African matric students.
          </p>
        </div>
        
        {/* 3x2 Grid */}
        <div className="
          grid 
          grid-cols-1        /* Mobile: 1 column */
          md:grid-cols-2      /* Tablet: 2 columns */
          lg:grid-cols-3      /* Desktop: 3 columns */
          gap-6 
          lg:gap-8
        ">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Feature Card
function FeatureCard({ icon: Icon, title, description }: Feature) {
  return (
    <Card className="p-6 lg:p-8 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-display text-xl font-semibold text-text-primary">
        {title}
      </h3>
      <p className="mt-2 text-text-secondary">
        {description}
      </p>
    </Card>
  )
}
```

---

#### Subjects Grid (12 Cards)

```tsx
// SubjectsGrid
const subjects = [
  { id: 'math', name: 'Mathematics', icon: IconMath, grades: '10-12' },
  { id: 'physics', name: 'Physical Sciences', icon: IconAtom, grades: '10-12' },
  { id: 'life-sciences', name: 'Life Sciences', icon: IconDna, grades: '10-12' },
  { id: 'chemistry', name: 'Chemistry', icon: IconFlask, grades: '10-12' },
  { id: 'english', name: 'English', icon: IconBookOpen, grades: '10-12' },
  { id: 'afrikaans', name: 'Afrikaans', icon: IconLanguage, grades: '10-12' },
  { id: 'geography', name: 'Geography', icon: IconGlobe, grades: '10-12' },
  { id: 'history', name: 'History', icon: IconClock, grades: '10-12' },
  { id: 'accounting', name: 'Accounting', icon: IconCalculator, grades: '10-12' },
  { id: 'economics', name: 'Economics', icon: IconTrendingUp, grades: '10-12' },
  { id: 'life-orientation', name: 'Life Orientation', icon: IconHeart, grades: '10-12' },
  { id: 'business', name: 'Business Studies', icon: IconBriefcase, grades: '10-12' }
]

export function SubjectsSection({ className }: { className?: string }) {
  return (
    <section className={className}>
      <div className="container mx-auto px-6 max-w-7xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-text-primary">
          All your subjects, covered
        </h2>
        
        <div className="
          mt-10
          grid 
          grid-cols-2        /* Mobile: 2 columns */
          sm:grid-cols-3      /* Small: 3 columns */
          md:grid-cols-4      /* Tablet: 4 columns */
          lg:grid-cols-6      /* Desktop: 6 columns */
          gap-4 
          lg:gap-6
        ">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} {...subject} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Subject Card
function SubjectCard({ name, icon: Icon, grades }: Subject) {
  return (
    <Card className="
      p-4 
      text-center 
      hover:shadow-lg 
      hover:border-primary/20 
      transition-all
      cursor-pointer
    ">
      <div className="
        w-16 h-16 mx-auto 
        rounded-xl 
        bg-subject-soft
        flex items-center justify-center
      ">
        <Icon className="w-8 h-8 text-subject" />
      </div>
      <h3 className="mt-3 font-semibold text-text-primary">{name}</h3>
      <p className="text-xs text-text-muted mt-1">Grades {grades}</p>
    </Card>
  )
}
```

---

#### Testimonials (3-Column Cards)

```tsx
// TestimonialsSection
const testimonials = [
  {
    quote: "I went from failing math to getting 78% in my final exam. Lumni explained everything in a way my teacher never could.",
    name: 'Sarah M.',
    grade: 'Grade 12',
    location: 'Cape Town',
    rating: 5
  },
  {
    quote: "The past paper practice helped me understand exactly what examiners are looking for. My marks improved dramatically.",
    name: 'Thabo K.',
    grade: 'Grade 11',
    location: 'Johannesburg',
    rating: 5
  },
  {
    quote: "Being able to snap a photo of homework questions and get instant answers has been a game changer for my studies.",
    name: 'Amara J.',
    grade: 'Grade 10',
    location: 'Durban',
    rating: 5
  }
]

export function TestimonialsSection({ className }: { className?: string }) {
  return (
    <section className={className}>
      <div className="container mx-auto px-6 max-w-7xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-text-primary">
          Loved by students across South Africa
        </h2>
        
        <div className="
          mt-12
          grid 
          grid-cols-1        /* Mobile: 1 column */
          md:grid-cols-3      /* Desktop: 3 columns */
          gap-6 
          lg:gap-8
        ">
          {testimonials.map((testimonial, i) => (
            <TestimonialCard key={i} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Testimonial Card
function TestimonialCard({ quote, name, grade, location, rating }: Testimonial) {
  return (
    <Card className="p-6">
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <IconStar key={i} className="w-4 h-4 fill-warning text-warning" />
        ))}
      </div>
      
      {/* Quote */}
      <p className="text-text-secondary italic">"{quote}"</p>
      
      {/* Author */}
      <div className="mt-6 flex items-center gap-3">
        <Avatar>
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-text-primary">{name}</p>
          <p className="text-sm text-text-muted">{grade}, {location}</p>
        </div>
      </div>
    </Card>
  )
}
```

---

#### Pricing Section (2-Column)

```tsx
// PricingSection
const plans = [
  {
    name: 'Free',
    price: 'R0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '10 questions per day',
      'Basic AI explanations',
      'Subject exploration',
      'Basic progress tracking'
    ],
    cta: 'Get Started',
    variant: 'outline'
  },
  {
    name: 'Pro',
    price: 'R99',
    period: '/month',
    description: 'For serious students',
    features: [
      'Unlimited questions',
      'Priority AI responses',
      'Essay feedback & grading',
      'Advanced analytics',
      'Offline access',
      'Priority support'
    ],
    cta: 'Go Pro',
    variant: 'default',
    popular: true
  }
]

export function PricingSection({ className }: { className?: string }) {
  return (
    <section className={className}>
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-text-primary">
          Simple, student-friendly pricing
        </h2>
        <p className="mt-4 text-lg text-text-secondary text-center">
          Start free. Upgrade when you're ready.
        </p>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Pricing Card
function PricingCard({ name, price, period, description, features, cta, variant, popular }: Plan) {
  return (
    <Card className={cn(
      'p-8 relative',
      popular && 'border-primary shadow-lg shadow-primary/10'
    )}>
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      
      <h3 className="font-display text-2xl font-bold">{name}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="font-mono text-4xl font-bold">{price}</span>
        <span className="text-text-muted">{period}</span>
      </div>
      <p className="mt-2 text-text-secondary">{description}</p>
      
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <IconCheck className="w-4 h-4 text-success" />
            <span className="text-text-secondary">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button className="w-full mt-8" variant={variant as any}>
        {cta}
      </Button>
    </Card>
  )
}
```

---

#### FAQ Section (Accordion)

```tsx
// FAQSection
const faqs = [
  {
    question: 'Is it really free?',
    answer: 'Yes! You can ask up to 10 questions per day on the free plan with no time limit. Upgrade to Pro for unlimited access.'
  },
  {
    question: 'Which subjects do you cover?',
    answer: 'We cover all major NSC subjects including Mathematics, Physical Sciences, Life Sciences, Chemistry, English, Afrikaans, Geography, History, Accounting, Economics, Life Orientation, and Business Studies.'
  },
  {
    question: 'How accurate are the answers?',
    answer: 'Our AI is trained specifically on the South African curriculum and NSC past papers. Answers are reviewed for accuracy, but we always recommend checking with your teacher for important assignments.'
  },
  {
    question: 'Is my data safe?',
    answer: 'Absolutely. We take privacy seriously and comply with POPIA. Your data is encrypted and never shared with third parties. Students under 18 have protected accounts.'
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your Pro subscription at any time. Your access will continue until the end of your billing period.'
  }
]

export function FAQSection({ className }: { className?: string }) {
  return (
    <section className={className}>
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-text-primary">
          Frequently asked questions
        </h2>
        
        <div className="mt-12 space-y-4">
          {faqs.map((faq, i) => (
            <Accordion key={i} type="single" collapsible>
              <AccordionItem value={`item-${i}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-text-secondary">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

#### CTA Section (Gradient Background)

```tsx
// CTASection
export function CTASection({ className }: { className?: string }) {
  return (
    <section className={cn('py-20', className)}>
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="
          rounded-3xl 
          bg-gradient-to-br 
          from-primary 
          to-primary/80 
          px-8 py-16 
          text-center
        ">
          <h2 className="
            font-display 
            text-3xl md:text-4xl 
            font-bold 
            text-white
          ">
            Ready to pass matric?
          </h2>
          <p className="
            mt-4 
            text-lg 
            text-white/80
          ">
            Join 50,000+ students already studying smarter
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="mt-8"
          >
            Start Studying Free
          </Button>
        </div>
      </div>
    </section>
  )
}
```

---

### 10.5 Reusable Templates

#### Section Template

Base template for all page sections:

```tsx
// Section template
interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section 
      id={id}
      className={cn(
        'py-20 lg:py-24',  // Default vertical padding
        className
      )}
    >
      <div className="container mx-auto px-6 max-w-7xl">
        {children}
      </div>
    </section>
  )
}

// Section with header
interface SectionWithHeaderProps extends SectionProps {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}

export function SectionWithHeader({ 
  title, 
  subtitle, 
  align = 'center',
  children, 
  className 
}: SectionWithHeaderProps) {
  return (
    <Section className={className}>
      <div className={cn(
        align === 'center' && 'text-center',
        align === 'left' && 'text-left'
      )}>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
      <div className="mt-10">
        {children}
      </div>
    </Section>
  )
}

// Usage
<SectionWithHeader 
  title="Features" 
  subtitle="Everything you need"
>
  <div className="grid grid-cols-3 gap-6">
    {/* Content */}
  </div>
</SectionWithHeader>
```

**Section CSS:**

```css
.section {
  padding-top: 80px;    /* py-20 */
  padding-bottom: 96px; /* py-24 */
}

.section-sm {
  padding-top: 48px;    /* py-12 */
  padding-bottom: 64px; /* py-16 */
}

@media (min-width: 1024px) {
  .section {
    padding-top: 96px;  /* lg:py-24 */
    padding-bottom: 96px;
  }
}
```

---

#### Card Grid Template

Reusable grid pattern for card layouts:

```tsx
// CardGrid template
interface CardGridProps {
  children: React.ReactNode[]
  columns?: {
    default?: 1 | 2 | 3 | 4 | 6
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 4 | 6 | 8
}

export function CardGrid({ 
  children, 
  columns = { default: 1, md: 2, lg: 3 },
  gap = 6 
}: CardGridProps) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6'
  }
  
  const gapClasses = {
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  }
  
  return (
    <div className={cn(
      'grid',
      colClasses[columns.default || 1],
      columns.sm && `sm:grid-cols-${columns.sm}`,
      columns.md && `md:grid-cols-${columns.md}`,
      columns.lg && `lg:grid-cols-${columns.lg}`,
      columns.xl && `xl:grid-cols-${columns.xl}`,
      gapClasses[gap]
    )}>
      {children}
    </div>
  )
}

// Usage examples
// 3 columns (mobile 1, tablet 2, desktop 3)
<CardGrid columns={{ default: 1, sm: 2, md: 3 }} gap={6}>
  {cards}
</CardGrid>

// 6 columns for subjects
<CardGrid columns={{ default: 2, sm: 3, md: 4, lg: 6 }} gap={4}>
  {subjects}
</CardGrid>

// 2 columns for pricing
<CardGrid columns={{ default: 1, md: 2 }} gap={6}>
  {plans}
</CardGrid>
```

---

#### Form Layout Template

```tsx
// FormLayout template
interface FormLayoutProps {
  children: React.ReactNode
}

export function FormLayout({ children }: FormLayoutProps) {
  return (
    <form className="space-y-6">
      {children}
    </form>
  )
}

interface FormFieldProps {
  label: string
  error?: string
  children: React.ReactNode
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

interface FormRowProps {
  children: React.ReactNode
  columns?: number
}

export function FormRow({ children, columns = 2 }: FormRowProps) {
  return (
    <div className={cn(
      'grid gap-6',
      columns === 2 && 'md:grid-cols-2',
      columns === 3 && 'md:grid-cols-3'
    )}>
      {children}
    </div>
  )
}

// Usage
<FormLayout>
  <FormRow columns={2}>
    <FormField label="First Name">
      <Input placeholder="John" />
    </FormField>
    <FormField label="Last Name">
      <Input placeholder="Doe" />
    </FormField>
  </FormRow>
  
  <FormField label="Email">
    <Input type="email" placeholder="john@school.co.za" />
  </FormField>
  
  <Button type="submit">Submit</Button>
</FormLayout>
```

**Form CSS Variables:**

```css
.form-field-label {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-input {
  background-color: var(--color-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-ring);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-error {
  font-size: 0.875rem;
  color: var(--color-error);
}
```

---

### 10.6 Layout Quick Reference

| Pattern | Tailwind Classes | Use Case |
|---------|-----------------|----------|
| **Section padding** | `py-20 lg:py-24` | Standard section |
| **Container** | `container mx-auto px-6 max-w-7xl` | Main content wrapper |
| **Card grid** | `grid grid-cols-1 md:grid-cols-3 gap-6` | 3-column card layout |
| **2-column** | `grid grid-cols-1 md:grid-cols-2 gap-6` | Pricing, split content |
| **4-column footer** | `grid grid-cols-2 md:grid-cols-4 gap-8` | Footer columns |
| **Navbar wrapper** | `fixed top-0 left-0 right-0 z-50` | Fixed header |
| **Glass navbar** | `backdrop-blur-xl bg-white/70 border` | Liquid glass effect |
| **Content area** | `pt-8 pb-40` | App page main content |
| **Hero padding** | `py-24 lg:py-30` | Landing hero section |

---

### 10.7 Implementation Checklist

- [ ] Implement floating liquid glass navbar in AppNav component
- [ ] Add navbar state handling (scrolled/expanded)
- [ ] Create SiteFooter with 4-column layout
- [ ] Build landing page with all sections
- [ ] Add pb-40 padding to all content pages
- [ ] Implement mobile hamburger menu
- [ ] Create reusable Section, CardGrid, and FormLayout templates
- [ ] Test responsive layouts at all breakpoints
- [ ] Verify glass effect on dark mode

---

*Layout and Templates section added April 2026*
*Based on iOS Human Interface Guidelines and NSC Grade 12 curriculum requirements*

*Layout and Templates section added April 2026*
*Based on iOS Human Interface Guidelines and NSC Grade 12 curriculum requirements*

---

## Part 12: Accessibility & Internationalization

> WCAG 2.1 AA compliance guidelines with South African locale support. All components must meet minimum accessibility standards while supporting the diverse linguistic and numeric formatting needs of South African users.

---

### 11.1 Color Contrast Requirements

All text and UI components must meet WCAG 2.1 AA contrast ratios. The design system enforces these requirements through CSS variable validation and automated testing.

#### Contrast Ratios

| Context | Minimum Ratio | Example | Token Reference |
|---------|--------------|---------|-----------------|
| **Body Text** (16px regular) | 4.5:1 | Primary text on background | `--color-text-primary` on `--color-background` |
| **Large Text** (18px+ or 14px bold) | 3:1 | Headings, section titles | `--color-text-primary` |
| **UI Components** | 3:1 | Buttons, inputs, icons | `--color-primary` on `--color-surface` |
| **Decorative Elements** | No requirement | Background patterns, dividers | - |

#### Light Mode Token Contrast Values

```css
:root {
  /* Primary Text (#0F172A) on Background (#F8FAFC) = 15.4:1 */
  --contrast-primary-on-bg: 15.4;
  
  /* Secondary Text (#475569) on Background (#F8FAFC) = 7.2:1 */
  --contrast-secondary-on-bg: 7.2;
  
  /* Muted Text (#64748B) on Background (#F8FAFC) = 5.4:1 */
  --contrast-muted-on-bg: 5.4;
  
  /* Primary (#3B82F6) on White (#FFFFFF) = 4.6:1 */
  --contrast-primary-on-surface: 4.6;
  
  /* Primary Foreground (#FFFFFF) on Primary (#3B82F6) = 4.5:1 */
  --contrast-primary-fg-on-primary: 4.5;
  
  /* Success (#5CB587) on White = 3.3:1 */
  --contrast-success-on-surface: 3.3;
  
  /* Warning (#F2C945) on White = 1.9:1 - Use dark text */
  --contrast-warning-on-surface: 1.9;
  
  /* Error (#FF5C5C) on White = 3.9:1 */
  --contrast-error-on-surface: 3.9;
}
```

#### Dark Mode Token Contrast Values

```css
.dark {
  /* Primary Text (#F8FAFC) on Background (#0F172A) = 15.4:1 */
  --contrast-primary-on-bg: 15.4;
  
  /* Secondary Text (#CBD5E1) on Background (#0F172A) = 10.1:1 */
  --contrast-secondary-on-bg: 10.1;
  
  /* Muted Text (#94A3B8) on Background (#0F172A) = 6.3:1 */
  --contrast-muted-on-bg: 6.3;
  
  /* Primary (#3B82F6) on Surface (#1E293B) = 4.4:1 */
  --contrast-primary-on-surface: 4.4;
}
```

#### CSS Utility Classes

```css
.text-contrast-primary {
  color: var(--color-text-primary);
}

.text-contrast-large {
  font-size: 1.125rem;
  font-weight: 600;
}

.btn-contrast {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
}

.input-contrast {
  background-color: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text-primary);
}
```

#### Tailwind Usage

```tsx
// Body text - 4.5:1 minimum
<p className="text-foreground">Main content</p>

// Large text - 3:1 minimum
<h1 className="text-3xl font-bold text-foreground">Section Title</h1>

// Button - 4.5:1 minimum
<Button>Primary Action</Button>

// Warning with correct contrast
<span className="text-warning-foreground bg-warning-soft">
  Warning message
</span>
```

---

### 11.2 Focus Indicators

All interactive elements must have visible focus states that meet WCAG 2.1 Success Criterion 2.4.7 (Focus Visible).

#### Focus Ring Specifications

| Property | Value | CSS Token |
|----------|-------|-----------|
| **Outline Width** | 3px | - |
| **Outline Offset** | 2px | - |
| **Ring Shadow** | 5px spread | - |
| **Color** | #3B82F6 | `--color-primary` |

#### CSS Implementation

```css
:root {
  --focus-ring-width: 3px;
  --focus-ring-offset: 2px;
  --focus-ring-shadow: 0 0 0 5px rgba(59, 130, 246, 0.4);
  --focus-ring-color: var(--color-primary);
}

*:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
  box-shadow: var(--focus-ring-shadow);
}

input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
  box-shadow: var(--focus-ring-shadow);
}

button:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}

a:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
  border-radius: var(--radius-xs);
}

.skip-link:focus-visible {
  outline: 4px solid var(--color-primary);
  outline-offset: 0;
  box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3);
}
```

#### Tailwind Implementation

```tsx
<Button className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
  Primary Action
</Button>

<button className="focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
  Interactive Element
</button>
```

#### Skip Link Implementation

```tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:ring-2 focus:ring-primary"
    >
      Skip to main content
    </a>
  );
}
```

---

### 11.3 Keyboard Navigation

All functionality must be operable through keyboard alone.

#### Keyboard Navigation Requirements

| Requirement | Implementation | WCAG SC |
|-------------|----------------|---------|
| **Logical Tab Order** | `tabindex` management, source order | 2.4.3 |
| **Skip Links** | "Skip to main content" link | 2.4.1 |
| **Focus Trap** | Trap focus in modals/dialogs | 2.4.3 |
| **Visible Focus** | All interactive elements | 2.4.7 |
| **Keyboard Shortcuts** | Escape to close, Enter to activate | 2.1.1 |
| **No Keyboard Traps** | Focus can always move forward/back | 2.1.2 |

#### Tab Order Guidelines

```tsx
export function PageLayout() {
  return (
    <>
      <SkipLink />
      <AppNav />
      <main id="main-content">
        <h1>Page Title</h1>
        <Button>Primary Action</Button>
        <form>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" />
          <Button type="submit">Sign In</Button>
        </form>
      </main>
    </>
  );
}
```

#### Focus Trap in Modals

```tsx
import { useEffect, useRef } from 'react';

export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const previousActiveElement = document.activeElement;
    
    firstElement?.focus();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      (previousActiveElement as HTMLElement)?.focus();
    };
  }, [isOpen]);
  
  return containerRef;
}
```

---

### 11.4 ARIA Guidance

Proper ARIA implementation ensures screen reader users can understand and interact with the interface.

#### Landmark Roles

```tsx
export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <header role="banner">
        <AppNav />
      </header>
      <main role="main" id="main-content">
        {children}
      </main>
      <aside role="complementary">
        <RelatedContent />
      </aside>
      <footer role="contentinfo">
        <Footer />
      </footer>
    </>
  );
}
```

#### Landmark Role Reference

| Role | Element | Usage |
|------|---------|-------|
| `banner` | `<header>` | Site-level navigation, logo |
| `main` | `<main>` | Primary page content (one per page) |
| `navigation` | `<nav>` | Navigation menus |
| `complementary` | `<aside>` | Supporting content, sidebars |
| `contentinfo` | `<footer>` | Footer information |
| `form` | `<form>` | Form with accessible name |
| `search` | `<form role="search">` | Search functionality |
| `dialog` | Modal container | Focusable dialogs |

#### Button vs Link Semantics

```tsx
// BUTTON - performs an action on the current page
<Button onClick={handleOpenModal}>Open Settings</Button>
<Button onClick={handleSubmit}>Save Changes</Button>
<Button onClick={handleToggle}>Toggle Theme</Button>

// LINK - navigates to a different page/view
<Link href="/dashboard">Go to Dashboard</Link>
<Link href="/subjects/math">View Math Subjects</Link>
```

#### Form Labels and Error Messages

```tsx
<>
  <Label htmlFor="email">Email Address</Label>
  <Input 
    id="email" 
    type="email" 
    aria-describedby="email-hint email-error"
    placeholder="you@school.co.za"
  />
  <p id="email-hint" className="text-sm text-muted-foreground">
    We'll send a verification code to this email.
  </p>
  <ErrorMessage id="email-error">
    Please enter a valid email address
  </ErrorMessage>
</>

// Form with aria-invalid
<form aria-label="Sign up form">
  <Label htmlFor="name">Full Name</Label>
  <Input 
    id="name" 
    aria-required="true"
    aria-invalid={hasError ? 'true' : 'false'}
    aria-describedby={hasError ? 'name-error' : undefined}
  />
  {hasError && (
    <ErrorMessage id="name-error" role="alert">
      Name is required
    </ErrorMessage>
  )}
</form>
```

#### Live Regions for Dynamic Content

```tsx
// Announce content changes to screen readers
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// For errors - use role="alert" with assertive
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>

// Form validation
<form aria-describedby="form-instructions">
  <p id="form-instructions" className="sr-only">
    Fill in all required fields to create your account.
  </p>
</form>

// Quiz answer feedback
<button
  aria-pressed={isSelected}
  onClick={handleSelect}
>
  <span aria-hidden="true">{isSelected ? '✓' : '○'}</span>
  {optionText}
</button>
```

#### ARIA Reference Table

| Pattern | ARIA | Example |
|---------|------|---------|
| Current page | `aria-current="page"` | Nav link to current page |
| Disabled button | `aria-disabled="true"` | Dimmed but focusable |
| Expanded state | `aria-expanded` | Accordion, dropdown |
| Selected state | `aria-selected"` | Tab panel, list item |
| Invalid input | `aria-invalid="true"` | Form validation |
| Required field | `aria-required="true"` | Required form fields |
| Hidden label | `aria-label` | Icon-only buttons |
| Described by | `aria-describedby` | Help text, errors |

---

### 11.5 Reduced Motion

Respect user preferences for reduced motion to accommodate users with vestibular disorders or motion sensitivity.

#### CSS Implementation

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .scroll-animate {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}

.transition-instant {
  transition: none !important;
}

@media (prefers-reduced-transparency) {
  .glass-effect {
    backdrop-filter: none !important;
    background: var(--color-surface) !important;
  }
}
```

#### React Implementation

```tsx
import { useReducedMotion } from 'framer-motion';

export function AnimatedComponent({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div 
      animate={shouldReduceMotion ? {} : { opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

---

### 11.6 Text Scaling Support

Ensure the application remains functional and readable when users increase their browser's text size up to 200% (WCAG 1.4.4).

#### Layout Requirements

| Zoom Level | Behavior | Test |
|------------|----------|------|
| 100% (default) | Normal layout | - |
| 150% | No horizontal scroll | Visual check |
| 200% | No horizontal scroll | Visual check |
| 400% | Content reflows, no horizontal scroll | Test all pages |

#### CSS for Text Scaling

```css
html {
  font-size: 100%;
}

.scaled-text {
  font-size: 1rem;
}

.scaled-container {
  overflow-wrap: break-word;
  word-wrap: break-word;
  max-width: 100vw;
  overflow-x: hidden;
}

.flexible-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.breaking-element {
  max-width: 60ch;
  min-width: 0;
}
```

#### Responsive Text at High Zoom

```tsx
export function ResponsiveTextContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-w-0">
      {children}
    </div>
  );
}

export function ReadingContent() {
  return (
    <article className="prose max-w-[65ch]">
    </article>
  );
}
```

#### Testing Checklist

```markdown
- [ ] 100% zoom - page renders correctly
- [ ] 150% zoom - no horizontal scrollbar appears
- [ ] 200% zoom - all content visible, no horizontal scroll
- [ ] 400% zoom - content reflows to single column
- [ ] Navigation remains usable at all zoom levels
- [ ] Forms remain functional at all zoom levels
- [ ] Modal dialogs fit within viewport at high zoom
```

---

### 11.7 Internationalization (i18n)

The application targets the South African market and supports locale-specific formatting while not requiring RTL (Right-to-Left) layout support.

#### South African Locale Support

| Aspect | Locale | Format | Example |
|--------|--------|--------|---------|
| **Numbers** | en-ZA | 1 234,56 | R 1 234,56 |
| **Currency** | en-ZA | R 1,234.56 | R 499.99 |
| **Dates** | en-ZA | DD MMM YYYY | 15 Apr 2026 |
| **Time** | en-ZA | HH:mm | 14:30 |
| **Decimal** | en-ZA | 75.5% | 75.5% |

#### Number Formatting

```tsx
import { formatNumber, formatCurrency, formatPercent } from '@/lib/intl';

const formattedNumber = formatNumber(1234.56, 'en-ZA');
// Output: "1 234,56"

const formattedPrice = formatCurrency(499.99, 'en-ZA');
// Output: "R 499,99"

const formattedPercent = formatPercent(75.5, 'en-ZA');
// Output: "75,5 %"
```

#### CSS for Numeric Display

```css
.numeric {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.score-display {
  font-family: var(--font-mono);
  font-size: var(--text-4xl);
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
}

.stat-value {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.currency-value {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-weight: var(--weight-medium);
}
```

#### Date & Time Formatting

```tsx
import { format, formatDistanceToNow } from 'date-fns';
import { enZA } from 'date-fns/locale';

const examDate = new Date('2026-11-15');

format(examDate, 'd MMM yyyy', { locale: enZA });
// Output: "15 Nov 2026"

format(examDate, 'd MMMM yyyy', { locale: enZA });
// Output: "15 November 2026"

format(examDate, 'EEEE, d MMMM yyyy', { locale: enZA });
// Output: "Saturday, 15 November 2026"

formatDistanceToNow(new Date(), { locale: enZA });
// Output: "2 days ago"

format(new Date(), 'HH:mm', { locale: enZA });
// Output: "14:30"
```

#### Font Coverage for Special Characters

```css
/* Geist covers English, Basic Latin, Common punctuation */
/* Noto Sans Math covers mathematical symbols: ∑, ∫, ∞, ≤, ≥, ≠, ±, √, π */
/* Greek letters: α, β, γ, δ, θ, λ, μ, π, σ, φ, ω */
/* Superscripts/subscripts: x², H₂O */

body {
  font-family: 'Geist', system-ui, -apple-system, 
    'Noto Sans', 'Noto Sans SC', sans-serif;
}

.math-content {
  font-family: var(--font-math);
}

.scientific {
  font-family: var(--font-mono);
  font-variant-numeric: slashed-zero;
}
```

#### Tailwind Internationalization Classes

```tsx
// Numbers with Geist Mono
<span className="font-mono tabular-nums">1 234,56</span>

// Currency
<span className="font-mono tabular-nums font-medium">R 499,99</span>

// Date
<time className="text-sm text-muted-foreground">
  15 Nov 2026
</time>

// Percentage
<span className="font-mono tabular-nums">75,5%</span>

// Large numbers (statistics)
<div className="font-mono text-4xl font-semibold tabular-nums">
  50 000+
</div>
```

---

### 11.8 Accessibility Implementation Checklist

```markdown
## Accessibility Checklist - WCAG 2.1 AA

### Perceivable
- [ ] Text alternatives for images (alt text)
- [ ] Captions for audio/video content
- [ ] Color is not sole means of conveying information
- [ ] Contrast ratio 4.5:1 for normal text
- [ ] Contrast ratio 3:1 for large text
- [ ] Resize text up to 200%
- [ ] No horizontal scrolling at 400%

### Operable
- [ ] Keyboard accessible (all functionality)
- [ ] No keyboard traps
- [ ] Skip links for navigation
- [ ] Page titles are descriptive
- [ ] Focus order is logical
- [ ] Focus is visible on all elements
- [ ] Sufficient time for reading/interacting
- [ ] No content that flashes more than 3 times/second

### Understandable
- [ ] Language is specified in HTML
- [ ] On focus, no context changes
- [ ] On input, no context changes
- [ ] Error identification is clear
- [ ] Labels or instructions are provided
- [ ] Error suggestions are helpful

### Robust
- [ ] Valid HTML
- [ ] Name, role, value for all UI components
- [ ] Status messages are programmatically determined

### Internationalization
- [ ] Numbers formatted for en-ZA locale
- [ ] Dates formatted for South African context
- [ ] Currency uses R (Rand) symbol
- [ ] Font supports special characters
- [ ] No RTL layout required (SA market)
```

---

### 11.9 Testing Tools & Resources

```tsx
// Automated testing with axe-core
import { useEffect } from 'react';

export function AccessibilityChecker() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('@axe-core/react').then(({ default: axe }) => {
        axe.default(document, 1000);
      });
    }
  }, []);
  
  return null;
}
```

---

*Accessibility implementation follows WCAG 2.1 AA guidelines*
*Internationalization supports South African English (en-ZA) locale*
*Last updated: April 2026*

---

## Implementation Guidance

This section provides comprehensive guidance for implementing design tokens in the MatricMaster AI codebase, following the tech stack: Next.js 16 with App Router, shadcn/ui, Tailwind CSS, and Framer Motion.

### 1. Token Consumption Formats

The design system supports multiple token formats for different use cases:

#### 1.1 CSS Variables (Primary Format)

CSS variables are the primary format for theming and provide the best runtime flexibility.

```css
/* src/app/globals.css */
:root {
  /* Colors */
  --color-primary: #3B82F6;
  --color-primary-dark: #2563EB;
  --color-secondary: #0F172A;
  --color-tertiary: #D16900;
  
  /* Backgrounds */
  --color-bg-primary: #F8FAFC;
  --color-bg-secondary: #F1F5F9;
  --color-bg-dark: #0F172A;
  
  /* Text */
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted: #64748B;
  
  /* Semantic */
  --color-surface: #FFFFFF;
  --color-border: #E2E8F0;
  --color-success: #5CB587;
  --color-destructive: #DC2626;
}

/* Dark mode */
[data-theme="dark"] {
  --color-bg-primary: #0F172A;
  --color-bg-secondary: #1E293B;
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #CBD5E1;
  --color-text-muted: #94A3B8;
  --color-surface: #1E293B;
  --color-border: #334155;
}
```

#### 1.2 CSS-in-JS (Dynamic Values)

For component-specific dynamic values, use CSS Modules or inline styles:

```tsx
/* Using CSS Modules - src/components/Button/Button.module.css */
.button {
  background-color: var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-6);
  transition: transform var(--duration-fast) var(--ease-tiimo);
}

.button:hover {
  transform: scale(1.02);
}

.button--variant-secondary {
  background-color: transparent;
  border: 2px solid var(--color-border);
  color: var(--color-text-primary);
}

/* Component - src/components/Button/Button.tsx */
import styles from './Button.module.css';
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className }: ButtonProps) {
  return (
    <button className={cn(styles.button, variant === 'secondary' && styles['button--variant-secondary'], className)}>
      {children}
    </button>
  );
}
```

#### 1.3 JSON/YAML (Design Tokens Export)

Export tokens for use in external tools (Style Dictionary, Figma plugins, etc.):

```json
// src/styles/tokens.json
{
  "color": {
    "primary": { "value": "#3B82F6" },
    "primary-dark": { "value": "#2563EB" },
    "secondary": { "value": "#0F172A" },
    "tertiary": { "value": "#D16900" },
    "background": {
      "primary": { "value": "#F8FAFC" },
      "secondary": { "value": "#F1F5F9" },
      "dark": { "value": "#0F172A" }
    },
    "text": {
      "primary": { "value": "#0F172A" },
      "secondary": { "value": "#475569" },
      "muted": { "value": "#64748B" }
    },
    "surface": { "value": "#FFFFFF" },
    "border": { "value": "#E2E8F0" }
  },
  "spacing": {
    "1": { "value": "4px" },
    "2": { "value": "8px" },
    "3": { "value": "12px" },
    "4": { "value": "16px" },
    "6": { "value": "24px" },
    "8": { "value": "32px" },
    "12": { "value": "48px" },
    "16": { "value": "64px" },
    "20": { "value": "80px" },
    "24": { "value": "96px" }
  },
  "radius": {
    "xs": { "value": "6px" },
    "sm": { "value": "10px" },
    "md": { "value": "16px" },
    "lg": { "value": "20px" },
    "xl": { "value": "24px" },
    "2xl": { "value": "36px" }
  },
  "font": {
    "display": { "value": "Playfair Display, Georgia, serif" },
    "body": { "value": "Geist, system-ui, sans-serif" },
    "mono": { "value": "Geist Mono, SF Mono, monospace" }
  }
}
```

```yaml
# src/styles/tokens.yaml
# Alternative YAML format for tooling
color:
  primary:
    value: "#3B82F6"
  secondary:
    value: "#0F172A"
  background:
    primary:
      value: "#F8FAFC"
spacing:
  4:
    value: "16px"
radius:
  md:
    value: "16px"
```

#### 1.4 Tailwind Configuration (Direct Integration)

Extend Tailwind config with token values:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: 'var(--color-secondary)',
        tertiary: 'var(--color-tertiary)',
        background: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          dark: 'var(--color-bg-dark)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        destructive: 'var(--color-destructive)',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'SF Mono', 'ui-monospace', 'monospace'],
        math: ['Noto Sans Math', 'Times New Roman', 'serif'],
      },
      spacing: {
        '18': '72px',
        '22': '88px',
        '26': '104px',
        '30': '120px',
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '36px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 8px 32px -4px rgba(70, 70, 68, 0.08)',
        lg: '0 16px 48px -8px rgba(70, 70, 68, 0.12)',
        xl: '0 24px 64px -12px rgba(70, 70, 68, 0.16)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      transitionTimingFunction: {
        tiimo: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out forwards',
        'fade-up': 'fadeUp 400ms ease-out forwards',
        'slide-in-right': 'slideInRight 300ms ease-out forwards',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### 2. Recommended File Structure

```
src/
├── app/
│   ├── globals.css          # CSS variables + base styles
│   ├── layout.tsx          # Root layout
│   └── [locale]/
│       └── layout.tsx      # Locale layouts
├── components/
│   ├── ui/                # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   └── features/           # Feature components
│       ├── hero/
│       ├── features/
│       └── ...
├── styles/
│   ├── tokens.css         # CSS custom properties (imported in globals.css)
│   ├── tokens.json        # JSON token export
│   ├── tokens.yaml        # YAML token export
│   └── theme.css          # Theme-specific classes
├── lib/
│   ├── tokens.ts          # Token constants (TypeScript)
│   ├── theme.ts          # Theme utilities
│   └── utils.ts          # cn(), cva() utilities
├── hooks/
│   └── use-theme.ts      # Theme management hook
└── tailwind.config.ts    # Tailwind configuration
```

#### Token Files Explained

| File | Purpose | Format |
|------|---------|--------|
| `tokens.css` | CSS custom properties | CSS |
| `tokens.ts` | TypeScript constants | TypeScript |
| `tokens.json` | Design tokens export | JSON |
| `tokens.yaml` | Design tokens export | YAML |
| `theme.ts` | Theme utilities | TypeScript |
| `tailwind.config.ts` | Tailwind extension | TypeScript |

---

### 3. Naming Conventions

#### 3.1 CSS Variables (kebab-case)

```css
:root {
  /* Colors */
  --color-primary: #3B82F6;
  --color-background-primary: #F8FAFC;
  --color-text-secondary: #475569;
  
  /* Spacing */
  --space-4: 16px;
  --spacing-section-y: 120px;
  
  /* Border radius */
  --radius-md: 16px;
  
  /* Typography */
  --font-heading: 'Playfair Display', serif;
  --text-lg: 1.25rem;
  
  /* Shadows */
  --shadow-card: 0 8px 32px -4px rgba(70, 70, 68, 0.08);
}
```

#### 3.2 TypeScript (camelCase)

```typescript
// src/lib/tokens.ts
export const tokens = {
  color: {
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    secondary: '#0F172A',
    tertiary: '#D16900',
  },
  background: {
    primary: '#F8FAFC',
    secondary: '#F1F5F9',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
  },
  radius: {
    xs: '6px',
    sm: '10px',
    md: '16px',
  },
  font: {
    display: 'Playfair Display',
    body: 'Geist',
    mono: 'Geist Mono',
  },
};

export const semanticTokens = {
  color: {
    surface: tokens.color.surface,
    border: tokens.color.border,
    success: '#5CB587',
    destructive: '#DC2626',
  },
  shadow: {
    card: '0 8px 32px -4px rgba(70, 70, 68, 0.08)',
    elevated: '0 16px 48px -8px rgba(70, 70, 68, 0.12)',
  },
};
```

#### 3.3 Component Props (PascalCase for Variants)

```typescript
// Using cva for variant definitions
import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-150',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-dark hover:scale-[1.02]',
        secondary: 'bg-transparent border-2 border-border text-text-primary hover:bg-background-secondary',
        ghost: 'bg-transparent hover:bg-background-secondary',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

// Usage
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export function Button({ variant, size, className, children, ...props }: ButtonProps) {
  return (
    <button 
      className={cn(buttonVariants({ variant, size }), className)} 
      {...props}
    >
      {children}
    </button>
  );
}
```

#### 3.4 Tokens: Semantic Over Descriptive

Prefer semantic naming over descriptive color names:

```css
/* ❌ Descriptive (avoid) */
--color-gray-100: #F1F5F9;
--color-blue-500: #3B82F6;
--color-purple-600: #7C3AED;

/* ✅ Semantic (preferred) */
--color-background-primary: #F8FAFC;
--color-primary: #3B82F6;
--color-accent: #7C3AED;

/* For specific component tokens */
--color-surface: #FFFFFF;
--color-surface-elevated: #F8FAFC;
--color-interactive: var(--color-primary);
```

---

### 4. Wiring Tokens Into Code

Follow this step-by-step process to integrate design tokens:

#### Step 1: Define CSS Variables in globals.css

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Color tokens */
  --color-primary: #3B82F6;
  --color-primary-dark: #2563EB;
  --color-secondary: #0F172A;
  --color-tertiary: #D16900;
  
  /* Background tokens */
  --color-bg-primary: #F8FAFC;
  --color-bg-secondary: #F1F5F9;
  --color-bg-dark: #0F172A;
  
  /* Text tokens */
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted: #64748B;
  
  /* Surface tokens */
  --color-surface: #FFFFFF;
  --color-border: #E2E8F0;
  --color-success: #5CB587;
  --color-destructive: #DC2626;
  
  /* Spacing tokens */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  
  /* Radius tokens */
  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;
  --radius-2xl: 36px;
  --radius-full: 9999px;
  
  /* Typography tokens */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Geist', system-ui, -apple-system, sans-serif;
  --font-mono: 'Geist Mono', 'SF Mono', ui-monospace, monospace;
  
  /* Shadow tokens */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 8px 32px -4px rgba(70, 70, 68, 0.08);
  --shadow-lg: 0 16px 48px -8px rgba(70, 70, 68, 0.12);
  --shadow-xl: 0 24px 64px -12px rgba(70, 70, 68, 0.16);
  
  /* Animation tokens */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --ease-tiimo: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
}

/* Dark mode */
[data-theme="dark"] {
  --color-bg-primary: #0F172A;
  --color-bg-secondary: #1E293B;
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #CBD5E1;
  --color-text-muted: #94A3B8;
  --color-surface: #1E293B;
  --color-border: #334155;
}
```

#### Step 2: Extend Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
        },
        secondary: '#0F172A',
        tertiary: '#D16900',
        background: {
          primary: '#F8FAFC',
          secondary: '#F1F5F9',
          dark: '#0F172A',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
        },
        surface: '#FFFFFF',
        border: '#E2E8F0',
        success: '#5CB587',
        destructive: '#DC2626',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'SF Mono', 'ui-monospace', 'monospace'],
        math: ['Noto Sans Math', 'Times New Roman', 'serif'],
      },
      spacing: {
        '18': '72px',
        '22': '88px',
        '26': '104px',
        '30': '120px',
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '36px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 8px 32px -4px rgba(70, 70, 68, 0.08)',
        lg: '0 16px 48px -8px rgba(70, 70, 68, 0.12)',
        xl: '0 24px 64px -12px rgba(70, 70, 68, 0.16)',
      },
    },
  },
  plugins: [],
};

export default config;
```

#### Step 3: Create Token Constants in TypeScript

```typescript
// src/lib/tokens.ts
export const colors = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  secondary: '#0F172A',
  tertiary: '#D16900',
  background: {
    primary: '#F8FAFC',
    secondary: '#F1F5F9',
    dark: '#0F172A',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#64748B',
  },
  surface: '#FFFFFF',
  border: '#E2E8F0',
  success: '#5CB587',
  destructive: '#DC2626',
} as const;

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const radius = {
  xs: '6px',
  sm: '10px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '36px',
  full: '9999px',
} as const;

export const fonts = {
  display: 'Playfair Display, Georgia, serif',
  body: 'Geist, system-ui, -apple-system, sans-serif',
  mono: 'Geist Mono, SF Mono, ui-monospace, monospace',
} as const;

export type ColorKey = keyof typeof colors;
export type SpacingKey = keyof typeof spacing;
export type RadiusKey = keyof typeof radius;
```

#### Step 4: Use Tokens in Components via clsx/cn

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// src/components/FeatureCard.tsx
import { cn } from '@/lib/utils';
import { colors, spacing, radius, fonts } from '@/lib/tokens';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

export function FeatureCard({ 
  title, 
  description, 
  icon, 
  className 
}: FeatureCardProps) {
  return (
    <div 
      className={cn(
        'p-6 rounded-lg border border-border bg-surface transition-all duration-200 hover:shadow-md hover:-translate-y-1',
        className
      )}
      style={{
        fontFamily: fonts.body,
        borderRadius: radius.lg,
      }}
    >
      <div className="text-primary mb-4">{icon}</div>
      <h3 
        className="text-xl font-semibold mb-2"
        style={{ 
          fontFamily: fonts.body,
          color: colors.text.primary,
        }}
      >
        {title}
      </h3>
      <p 
        className="text-base"
        style={{ 
          fontFamily: fonts.body,
          color: colors.text.secondary,
        }}
      >
        {description}
      </p>
    </div>
  );
}
```

---

### 5. Pixel-Precision Guidelines

#### 5.1 Fractional Pixels

Use fractional pixels for hairlines and subtle borders:

```css
/* Fine borders */
.border-hairline {
  border-width: 0.5px;
  border-color: var(--color-border);
}

/* Slight emphasis */
.border-subtle {
  border-width: 1.5px;
}
```

```typescript
// Tailwind utility for fractional borders
<div className="border-[0.5px] border-border">
```

#### 5.2 Device Pixel Ratio

```typescript
// Detect device pixel ratio
function get DPR(): number {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
}

// Use for high-DPI displays
function getBorderWidth(): string {
  const dpr = get DPR();
  if (dpr >= 2) return '0.5px';
  return '1px';
}
```

#### 5.3 Testing Checklist

- [ ] Test on iPhone SE (1x), iPhone 13/14 (2x), iPhone Pro Max (3x)
- [ ] Test on Android devices with various DPIs
- [ ] Verify all borders render crisply
- [ ] Check font rendering at different scales
- [ ] Validate touch targets meet 44px minimum

---

### 6. Migration Path from Design Tokens

#### 6.1 From Figma (Token Studio Plugin)

1. Install Token Studio plugin in Figma
2. Export tokens to JSON format
3. Transform using Style Dictionary:

```javascript
// build-tokens.js
const StyleDictionary = require('style-dictionary');
const config = {
  source: ['src/styles/tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/styles/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
      }],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'src/lib/',
      files: [{
        destination: 'tokens.ts',
        format: 'typescript',
      }],
    },
  },
};

const sd = StyleDictionary.extend(config);
sd.buildAllPlatforms();
```

#### 6.2 From Style Dictionary

```json
// token-transforms.json
{
  "transforms": [
    "name/cti/kebab",
    "color/hex",
    "size/rem",
    "typography/font FAMILY"
  ]
}
```

Run transformation:

```bash
npx style-dictionary build --config config.json
```

#### 6.3 From Design Tokens (Step by Step)

1. **Export from Figma/Token Studio**:
   ```bash
   npm install -D style-dictionary
   ```

2. **Create token source files**:
   ```
   tokens/
   ├── colors.json
   ├── typography.json
   └── spacing.json
   ```

3. **Build CSS variables**:
   ```bash
   npx style-dictionary build --config style-dictionary.config.js
   ```

4. **Verify output**:
   - Check `src/styles/tokens.css`
   - Validate CSS custom properties

---

### 7. Code Examples

#### 7.1 CSS Variable Definition

```css
/* Complete token system */
:root {
  /* ===== COLORS ===== */
  /* Primary palette */
  --color-primary: #3B82F6;
  --color-primary-light: #60A5FA;
  --color-primary-dark: #2563EB;
  --color-primary-foreground: #FFFFFF;
  
  /* Secondary palette */
  --color-secondary: #0F172A;
  --color-secondary-light: #334155;
  --color-secondary-foreground: #F8FAFC;
  
  /* Accent/Tertiary */
  --color-tertiary: #D16900;
  --color-tertiary-light: #F59E0B;
  
  /* Backgrounds */
  --color-bg-primary: #F8FAFC;
  --color-bg-secondary: #F1F5F9;
  --color-bg-tertiary: #E2E8F0;
  --color-bg-dark: #0F172A;
  --color-surface: #FFFFFF;
  --color-surface-elevated: #FFFFFF;
  
  /* Text */
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-tertiary: #64748B;
  --color-text-muted: #94A3B8;
  --color-text-inverse: #F8FAFC;
  
  /* Borders */
  --color-border: #E2E8F0;
  --color-border-light: #F1F5F9;
  --color-border-dark: #CBD5E1;
  
  /* Semantic */
  --color-success: #5CB587;
  --color-success-bg: #ECFDF5;
  --color-warning: #F59E0B;
  --color-warning-bg: #FFFBEB;
  --color-destructive: #DC2626;
  --color-destructive-bg: #FEF2F2;
  --color-info: #3B82F6;
  --color-info-bg: #EFF6FF;
  
  /* ===== TYPOGRAPHY ===== */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Geist', system-ui, -apple-system, sans-serif;
  --font-mono: 'Geist Mono', 'SF Mono', ui-monospace, monospace;
  --font-math: 'Noto Sans Math', 'Times New Roman', serif;
  
  /* ===== SPACING ===== */
  --space-0: 0px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  
  /* ===== RADIUS ===== */
  --radius-none: 0px;
  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;
  --radius-2xl: 36px;
  --radius-full: 9999px;
  
  /* ===== SHADOWS ===== */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 8px 32px -4px rgba(70, 70, 68, 0.08);
  --shadow-lg: 0 16px 48px -8px rgba(70, 70, 68, 0.12);
  --shadow-xl: 0 24px 64px -12px rgba(70, 70, 68, 0.16);
  
  /* ===== ANIMATION ===== */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --ease-tiimo: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

#### 7.2 Tailwind Config Extension

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
          foreground: 'var(--color-primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          light: 'var(--color-secondary-light)',
          foreground: 'var(--color-secondary-foreground)',
        },
        tertiary: {
          DEFAULT: 'var(--color-tertiary)',
          light: 'var(--color-tertiary-light)',
        },
        background: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          dark: 'var(--color-bg-dark)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          light: 'var(--color-border-light)',
          dark: 'var(--color-border-dark)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          bg: 'var(--color-success-bg)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          bg: 'var(--color-warning-bg)',
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)',
          bg: 'var(--color-destructive-bg)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
        math: ['var(--font-math)'],
      },
      spacing: {
        '18': 'var(--space-18)',
        '22': 'var(--space-22)',
        '26': 'var(--space-26)',
        '30': 'var(--space-30)',
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
    },
  },
};

export default config;
```

#### 7.3 TypeScript Token Usage

```typescript
// src/lib/tokens.ts
export const colorTokens = {
  primary: {
    DEFAULT: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    foreground: '#FFFFFF',
  },
  secondary: {
    DEFAULT: '#0F172A',
    light: '#334155',
    foreground: '#F8FAFC',
  },
  tertiary: {
    DEFAULT: '#D16900',
    light: '#F59E0B',
  },
  background: {
    primary: '#F8FAFC',
    secondary: '#F1F5F9',
    tertiary: '#E2E8F0',
    dark: '#0F172A',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#64748B',
    muted: '#94A3B8',
    inverse: '#F8FAFC',
  },
  surface: {
    DEFAULT: '#FFFFFF',
    elevated: '#FFFFFF',
  },
  border: {
    DEFAULT: '#E2E8F0',
    light: '#F1F5F9',
    dark: '#CBD5E1',
  },
} as const;

export const spacingTokens = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const radiusTokens = {
  xs: '6px',
  sm: '10px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '36px',
  full: '9999px',
} as const;

export const shadowTokens = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
  md: '0 8px 32px -4px rgba(70, 70, 68, 0.08)',
  lg: '0 16px 48px -8px rgba(70, 70, 68, 0.12)',
  xl: '0 24px 64px -12px rgba(70, 70, 68, 0.16)',
} as const;

export const fontTokens = {
  display: 'Playfair Display, Georgia, serif',
  body: 'Geist, system-ui, -apple-system, sans-serif',
  mono: 'Geist Mono, SF Mono, ui-monospace, monospace',
  math: 'Noto Sans Math, Times New Roman, serif',
} as const;
```

#### 7.4 Component with Tokens

```tsx
// src/components/Button.tsx
'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { colorTokens, radiusTokens, spacingTokens } from '@/lib/tokens';

const buttonVariants = cva(
  // Base styles using tokens
  `inline-flex items-center justify-center font-body font-medium transition-all duration-fast`,
  {
    variants: {
      variant: {
        primary: `
          bg-primary text-white 
          hover:bg-primary-dark 
          hover:shadow-md 
          hover:scale-[1.02]
          active:scale-[0.98]
        `,
        secondary: `
          bg-transparent border-2 border-border text-text-primary
          hover:bg-background-secondary hover:border-border-dark
          active:bg-background-tertiary
        `,
        ghost: `
          bg-transparent text-text-primary
          hover:bg-background-secondary active:bg-background-tertiary
        `,
        destructive: `
          bg-destructive text-white
          hover:bg-destructive/90
        `,
      },
      size: {
        sm: `h-9 px-3 text-xs rounded-sm`,
        md: `h-10 px-4 text-sm rounded-md`,
        lg: `h-12 px-6 text-base rounded-md`,
        icon: `h-10 w-10 rounded-md`,
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

```tsx
// src/components/FeatureCard.tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { colorTokens, radiusTokens, spacingTokens, shadowTokens, fontTokens } from '@/lib/tokens';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

export function FeatureCard({ 
  title, 
  description, 
  icon, 
  className 
}: FeatureCardProps) {
  return (
    <motion.div
      className={cn(
        'p-6 bg-surface border border-border transition-all duration-normal hover:shadow-lg hover:-translate-y-1',
        className
      )}
      style={{
        backgroundColor: colorTokens.surface.DEFAULT,
        borderColor: colorTokens.border.DEFAULT,
        borderRadius: radiusTokens.lg,
        padding: spacingTokens[6],
        boxShadow: shadowTokens.xs,
      }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div 
        className="mb-4 text-primary"
        style={{ color: colorTokens.primary.DEFAULT }}
      >
        {icon}
      </div>
      <h3 
        className="text-xl font-semibold mb-2"
        style={{ 
          fontFamily: fontTokens.body,
          fontWeight: 600,
          color: colorTokens.text.primary,
          fontSize: '1.25rem',
          lineHeight: 1.25,
        }}
      >
        {title}
      </h3>
      <p 
        className="text-base"
        style={{ 
          fontFamily: fontTokens.body,
          color: colorTokens.text.secondary,
          fontSize: '1rem',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
    </motion.div>
  );
}
```

---

### 8. Integration with Shadcn/ui

#### 8.1 Override CSS Variables

Shadcn/ui uses CSS variables for theming. Override in `globals.css`:

```css
/* src/app/globals.css - add to existing :root */
@layer base {
  :root {
    /* Shadcn/ui variable overrides */
    --background: var(--color-bg-primary);
    --foreground: var(--color-text-primary);
    
    --card: var(--color-surface);
    --card-foreground: var(--color-text-primary);
    
    --popover: var(--color-surface);
    --popover-foreground: var(--color-text-primary);
    
    --primary: var(--color-primary);
    --primary-foreground: #FFFFFF;
    
    --secondary: var(--color-bg-secondary);
    --secondary-foreground: var(--color-text-primary);
    
    --muted: var(--color-bg-tertiary);
    --muted-foreground: var(--color-text-secondary);
    
    --accent: var(--color-bg-secondary);
    --accent-foreground: var(--color-text-primary);
    
    --destructive: var(--color-destructive);
    --destructive-foreground: #FFFFFF;
    
    --border: var(--color-border);
    --input: var(--color-border);
    --ring: var(--color-primary);
    
    --radius: var(--radius-md);
  }
  
  [data-theme="dark"] {
    --background: var(--color-bg-dark);
    --foreground: var(--color-text-inverse);
    
    --card: var(--color-secondary);
    --card-foreground: var(--color-text-inverse);
    
    --primary: var(--color-primary);
    --primary-foreground: #FFFFFF;
    
    --secondary: var(--color-secondary-light);
    --secondary-foreground: var(--color-text-inverse);
    
    --muted: var(--color-secondary-light);
    --muted-foreground: var(--color-text-muted);
    
    --accent: var(--color-secondary-light);
    --accent-foreground: var(--color-text-inverse);
    
    --destructive: #DC2626;
    --destructive-foreground: #FFFFFF;
    
    --border: var(--color-border-dark);
    --input: var(--color-border-dark);
  }
}
```

#### 8.2 Use cva for Variant Definitions

```typescript
// src/components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

#### 8.3 Keep Tokens in One Place

Centralize all token references:

```typescript
// src/lib/theme.ts
import { colorTokens, spacingTokens, radiusTokens, fontTokens } from './tokens';

export const theme = {
  colors: colorTokens,
  spacing: spacingTokens,
  radius: radiusTokens,
  fonts: fontTokens,
} as const;

// Helper for creating CSS variables from tokens
export function createCssVariables(obj: Record<string, unknown>, prefix: string): string {
  const entries = Object.entries(obj);
  return entries
    .map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return createCssVariables(value as Record<string, unknown>, `${prefix}-${key}`);
      }
      return `--${prefix}-${key}: ${value};`;
    })
    .join('\n');
}

// Usage: Generate CSS variables string
export const cssVariables = createCssVariables(theme.colors, 'color');
// Output: --color-primary: #3B82F6; --color-secondary: #0F172A; ...
```

---

### 9. Quick Reference Checklist

- [ ] Add tokens to `src/app/globals.css`
- [ ] Extend Tailwind config in `tailwind.config.ts`
- [ ] Create TypeScript constants in `src/lib/tokens.ts`
- [ ] Implement `cn()` utility in `src/lib/utils.ts`
- [ ] Create component variants with `cva()`
- [ ] Override shadcn/ui CSS variables
- [ ] Test dark mode support
- [ ] Verify accessibility (color contrast)
- [ ] Check responsive breakpoints
- [ ] Run performance audit

---

*Implementation follows Next.js 16 App Router, shadcn/ui, Tailwind CSS, and Framer Motion best practices.*
*Last updated: April 2026*

---

## Questions to Resolve

This section captures ambiguities and design decisions that cannot be resolved from the provided imagery. Each question is prioritized to guide resolution effort.

### 1. Project Framework & UI Library

| Priority | Question | Context / Why It Matters | Suggested Resolution |
|----------|----------|-------------------------|---------------------|
| **High** | Confirm Next.js 16 with App Router usage | The current design spec references Next.js patterns, but version confirmation needed for implementation | Verify package.json or check Next.js documentation for version-specific features needed |
| **High** | Confirm shadcn/ui component library | Design references shadcn/ui conventions for accessibility and patterns | Verify component installation status via `npx shadcn@latest status` |
| **High** | Confirm Tailwind CSS for styling | Design uses Tailwind token system extensively | Confirm Tailwind version matches config patterns in this document |
| **Medium** | Confirm Framer Motion for animations | Animation specs reference Framer Motion but not explicitly confirmed | Verify `@framer-motion` is in dependencies; consider View Transitions API as alternative |

### 2. Token Conventions

| Priority | Question | Context / Why It Matters | Suggested Resolution |
|----------|----------|-------------------------|---------------------|
| **High** | Confirm semantic naming (e.g., color-primary, not color-blue-500) | Section 3.3 uses semantic tokens like `--color-primary` and `--color-bg-primary` | Confirm with design team; ensure no color-blue-500 patterns exist in codebase |
| **High** | Confirm CSS variable format (kebab-case) | All CSS variables use kebab-case throughout document | Run grep for camelCase CSS vars to ensure no inconsistencies |
| **High** | Confirm TypeScript token exports (camelCase) | Section 9.6.3 shows camelCase exports: `colorPrimary`, `spacingMd` | Verify with linting rules; ensure consistency between CSS (kebab) and TS (camel) |

### 3. Token Format Preference

| Priority | Question | Context / Why It Matters | Suggested Resolution |
|----------|----------|-------------------------|---------------------|
| **High** | Confirm CSS Variables as primary format | globals.css already contains CSS variables; design extends this pattern | No change needed; standardize all new tokens as CSS variables |
| **Medium** | Confirm JSON/YAML for design tokens export | Section mentions JSON/YAML export but implementation not visible | Decide if export needed for design system tools (Figma, etc.) |
| **Medium** | Confirm Tailwind config extension for theme | Design shows Tailwind theme extension pattern | Verify tailwind.config.ts has all specified extensions |

### 4. Screens Not Covered by Imagery

| Priority | Question | Context / Why It Matters | Suggested Resolution |
|----------|----------|-------------------------|---------------------|
| **High** | Onboarding - Welcome screen | User first entry point; sets tone for app | Create wireframe; define key messaging and CTA flow |
| **High** | Onboarding - Quiz screen | Initial knowledge assessment; affects personalization | Define quiz structure, question types, and scoring |
| **High** | Onboarding - Progress screen | Shows user's starting point based on quiz | Define metrics displayed and visual representation |
| **High** | Onboarding - Focus screen | Sets study priorities based on quiz results | Define focus areas and user action items |
| **Medium** | Settings page | User preferences, account management, app configuration | Define settings categories: Account, Notifications, Privacy, Accessibility |
| **Medium** | Subject-specific deep-dive pages | Individual subject areas (Math, Physics, etc.) with detailed content | Define per-subject layouts, content types, and navigation patterns |

### 5. Target Platform Resolution

| Priority | Question | Context / Why It Matters | Suggested Resolution |
|----------|----------|-------------------------|---------------------|
| **High** | Confirm mobile range (320px-428px) | Covers iPhone SE to large Android devices | Ensure responsive design works at extremes |
| **High** | Confirm tablet range (768px-1024px) | iPad and similar tablets | Verify touch targets meet 44px minimum |
| **High** | Confirm desktop range (1280px-2560px) | Standard laptop to ultrawide monitors | Test at 1280px, 1920px, 2560px breakpoints |
| **Medium** | High DPI display support | Modern phones/tablets have 2x/3x pixel density | Ensure images and icons render crisply; use SVG where possible |

### 6. Accessibility Constraints

| Priority | Question | Context / Why It Matters | Suggested Resolution |
|----------|----------|-------------------------|---------------------|
| **High** | Confirm motion reduction via prefers-reduced-motion | Section 3.10.7 shows reduced motion support but need confirmation | Verify implementation covers all animations (scroll, hover, quiz feedback) |
| **High** | Confirm focus ring style: 3px solid primary with offset | Critical for keyboard navigation accessibility | Add to global CSS: `:focus-visible { outline: 3px solid var(--color-primary); outline-offset: 2px; }` |
| **Medium** | Confirm ARIA roles follow shadcn/ui conventions | Ensures consistent screen reader experience | Audit components; verify shadcn/ui defaults are sufficient |

---

### Question Tracking

| ID | Category | Question | Priority | Status | Created |
|----|----------|----------|----------|--------|---------|
| Q-004 | Framework | Next.js 16 with App Router confirmed? | High | Open | 2026-04-03 |
| Q-005 | Framework | shadcn/ui component library confirmed? | High | Open | 2026-04-03 |
| Q-006 | Framework | Tailwind CSS for styling confirmed? | High | Open | 2026-04-03 |
| Q-007 | Framework | Framer Motion for animations confirmed? | Medium | Open | 2026-04-03 |
| Q-008 | Tokens | Semantic naming convention confirmed? | High | Open | 2026-04-03 |
| Q-009 | Tokens | CSS variable format (kebab-case) confirmed? | High | Open | 2026-04-03 |
| Q-010 | Tokens | TypeScript token exports (camelCase) confirmed? | High | Open | 2026-04-03 |
| Q-011 | Format | CSS Variables as primary format? | High | Open | 2026-04-03 |
| Q-012 | Format | JSON/YAML export needed? | Medium | Open | 2026-04-03 |
| Q-013 | Format | Tailwind config extension pattern? | Medium | Open | 2026-04-03 |
| Q-014 | Screens | Onboarding flow screens needed | High | Open | 2026-04-03 |
| Q-015 | Screens | Settings page needed | Medium | Open | 2026-04-03 |
| Q-016 | Screens | Subject deep-dive pages needed | Medium | Open | 2026-04-03 |
| Q-017 | Platform | Mobile range 320px-428px confirmed? | High | Open | 2026-04-03 |
| Q-018 | Platform | Tablet range 768px-1024px confirmed? | High | Open | 2026-04-03 |
| Q-019 | Platform | Desktop range 1280px-2560px confirmed? | High | Open | 2026-04-03 |
| Q-020 | Platform | High DPI display support needed? | Medium | Open | 2026-04-03 |
| Q-021 | Accessibility | prefers-reduced-motion implementation complete? | High | Open | 2026-04-03 |
| Q-022 | Accessibility | Focus ring style (3px solid primary + offset) implemented? | High | Open | 2026-04-03 |
| Q-023 | Accessibility | ARIA roles follow shadcn/ui conventions? | Medium | Open | 2026-04-03 |

---

*Questions section added 2026-04-03*

## Conclusion
