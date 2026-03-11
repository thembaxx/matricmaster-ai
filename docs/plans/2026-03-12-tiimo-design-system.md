# Tiimo-Inspired Design System for MatricMaster

## Overview
This document outlines the adaptation of Tiimo's clean, minimal, neurodivergent-friendly design language for the MatricMaster application.

## Core Principles Applied
1. **Visual Simplicity** - Reduced visual noise, increased whitespace
2. **Neurodivergent-Friendly** - Soft colors, clear hierarchies, reduced cognitive load
3. **Consistent Interaction** - Predictable animations and feedback
4. **Accessibility** - High contrast options, readable typography
5. **Calming Aesthetics** - Muted palette with gentle accents

## Design Specifications

### Color Palette
#### Light Mode
- **Background**: `#FAF8F5` (Warm off-white)
- **Primary**: `#A855F7` (Soft Lavender)
- **Secondary**: `#F3F4F6` (Light Gray)
- **Accent**: `#E9D5FF` (Lavender 200)
- **Text Primary**: `#1F2937` (Dark Gray)
- **Text Secondary**: `#6B7280` (Medium Gray)

#### Dark Mode
- **Background**: `#1A1A2E` (Deep Midnight Blue)
- **Primary**: `#C084FC` (Soft Lavender)
- **Secondary**: `#0F3460` (Deep Blue)
- **Accent**: `rgba(168, 85, 247, 0.15)` (Lavender with transparency)
- **Text Primary**: `#EAEAEA` (Light Gray)
- **Text Secondary**: `#94A3B8` (Slate Gray)

### Subject Colors (Adapted for both modes)
- **Mathematics**: `#FBBF24` (Amber) / `#FEF3C7` (Amber 50)
- **Physics**: `#60A5FA` (Blue) / `#DBEAFE` (Blue 50)
- **Life Sciences**: `#34D399` (Emerald) / `#D1FAE5` (Emerald 50)
- **Accounting**: `#F472B6` (Rose) / `#FCE7F3` (Rose 50)
- **English**: `#818CF8` (Indigo) / `#E0E7FF` (Indigo 50)
- **Geography**: `#2DD4BF` (Teal) / `#CCFBF1` (Teal 50)
- **History**: `#FB923C` (Orange) / `#FFEDD5` (Orange 50)

### Typography
- **Headings**: Outfit (Display font)
- **Body Text**: Space Grotesk (Body font)
- **Scale**: 
  - Display: 4xl (3rem), 3xl (2.25rem), 2xl (1.875rem), xl (1.5rem)
  - Body: lg (1.125rem), base (1rem), sm (0.875rem), xs (0.75rem)

### Spacing & Layout
- **Base Unit**: 4px increments
- **Card Padding**: 24px (mobile), 32px (desktop)
- **Border Radius**: 16px (cards), 24px (large elements), 9999px (pills)
- **Section Spacing**: 32px minimum between sections

### Component Styles

#### Cards
- **Base**: `tiimo-card` - white background, rounded-2xl, subtle shadow, border
- **Hover**: Slight elevation (shadow-md), border-primary/20
- **Pressed**: Scale 0.98 with bouncy transition
- **Glass Variant**: Background with backdrop blur for overlays

#### Buttons
- **Primary**: Filled with primary color, rounded-full, px-8 py-3
- **Secondary**: Outline with primary color, transparent background
- **Icon**: Circular background with soft color, centered icon
- **Sizes**: 
  - Small: h-10 px-4
  - Medium: h-12 px-6
  - Large: h-14 px-8

#### Inputs & Fields
- **Background**: Input color with subtle border
- **Focus**: Ring with primary color, 2px outline
- **Error**: Border with error-accent, background with error-soft
- **Padding**: px-4 py-3 minimum

#### Icons & Emojis
- **Emoji Containers**: Circular backgrounds with soft subject colors
- **Size Scale**: 
  - xl: 16px (w-16 h-16)
  - 2xl: 20px (w-20 h-20)
  - 3xl: 24px (w-24 h-24)
- **Animation**: Subtle hover scale (1.05) with smooth transition

### Priority Indicators
- **High**: Error-accent (`#EF4444`) with soft background
- **Medium**: Warning-accent (`#F59E0B`) with soft background
- **Low**: Info-accent (`#3B82F6`) with soft background
- **Display**: Small pill or left border on cards

### Animations & Transitions
- **Duration**: 
  - Fast: 150ms
  - Normal: 300ms (default)
  - Slow: 500ms
- **Easing**:
  - Smooth: cubic-bezier(0.16, 1, 0.3, 1)
  - Bouncy: cubic-bezier(0.34, 1.56, 0.64, 1)
- **Effects**:
  - Float: Gentle vertical movement
  - Pulse-soft: Subtle opacity variation
  - Slide-up: Entrance from below
  - Ring: Expanding circle (for emphasis)

## Implementation Roadmap

### Phase 1: Foundation (Completed)
- [x] Updated global CSS with Tiimo-inspired variables
- [x] Configured Outfit and Space Grotesk fonts
- [x] Created utility classes (.tiimo-card, .tiimo-transition, etc.)

### Phase 2: Core Screens (Completed)
- [x] Landing.tsx - Applied card styles, updated buttons, improved spacing
- [x] Dashboard.tsx - Redesigned task cards, priority sections, subject grid

### Phase 3: Quiz Screens (Completed)
- [x] Quiz.tsx - Applied consistent card styling, improved question presentation
- [x] MathematicsQuiz.tsx - Subject-specific styling with math color accents
- [x] PhysicsQuiz.tsx - Subject-specific styling with physics color accents
- [x] InteractiveQuiz.tsx - Enhanced interactive elements with Tiimo touch
- [x] PracticeQuiz.tsx - Consistent styling with clear progress indicators
- [x] EnhancedTestQuiz.tsx - Premium feel for test simulations

### Phase 4: Supporting Screens (Completed)
- [x] StudyPlanWizard.tsx - Streamlined multi-step form with clear progress
- [x] Profile.tsx - Card-based sections, avatar emphasis
- [x] Achievements.tsx - Card grid with subtle animations
- [x] Leaderboard.tsx - Clean list with highlight for current user
- [x] Bookmarks.tsx - Card list with subject color indicators
- [x] Lessons.tsx - Consistent lesson card design
- [x] PastPapers.tsx - Paper cards with subject coloring
- [x] Onboarding.tsx - Welcome experience with Tiimo aesthetic
- [x] LanguageSelect.tsx - Simple, clear language selection
- [x] Search.tsx - Prominent search bar with instant results
- [x] StudyPath.tsx - Visual path progression with cards

### Phase 5: Polish & Optimization (Completed)
- [x] Review all screens for consistency
- [x] Build verification successful

## Files Modified
1. `src/styles/index.css` - Complete design system with colors, typography, spacing, utility classes
2. `src/app/fonts.ts` - Configured Outfit and Space Grotesk
3. `src/app/layout.tsx` - Added font variables to root class
4. `src/screens/Landing.tsx` - Applied Tiimo card styles, updated buttons, improved typography
5. `src/screens/Dashboard.tsx` - Redesigned task cards, priority sections, subject grid
6. `src/screens/Quiz.tsx` - Consistent card styling, question presentation
7. `src/screens/MathematicsQuiz.tsx` - Math color accents
8. `src/screens/PhysicsQuiz.tsx` - Physics color accents
9. `src/screens/InteractiveQuiz.tsx` - Interactive Tiimo styling
10. `src/screens/PracticeQuiz.tsx` - Progress indicators
11. `src/screens/EnhancedTestQuiz.tsx` - Premium feel
12. `src/screens/StudyPlanWizard.tsx` - Clear progress
13. `src/screens/Profile.tsx` - Card-based sections
14. `src/screens/Achievements.tsx` - Card grid with animations
15. `src/screens/Leaderboard.tsx` - Clean list styling
16. `src/screens/Bookmarks.tsx` - Subject color indicators
17. `src/screens/Lessons.tsx` - Consistent lesson cards
18. `src/screens/PastPapers.tsx` - Subject coloring
19. `src/screens/Onboarding.tsx` - Tiimo aesthetic
20. `src/screens/LanguageSelect.tsx` - Clear selection
21. `src/screens/Search.tsx` - Prominent search
22. `src/screens/StudyPath.tsx` - Visual progression
23. `src/stores/useScheduleStore.tsx` - Fixed JSX bug

## Tiimo Research Summary

Based on research from Tiimo's website (https://www.tiimoapp.com/product):

### Key Design Elements Identified
1. **Visual Planning** - Color-coded tasks, customizable views, icon-based navigation
2. **Large Touch Targets** - Easy-to-tap buttons and cards
3. **Soft Shadows** - Subtle depth without harsh edges
4. **Rounded Corners** - Friendly, approachable feel (16px-24px radius)
5. **Clear Typography** - Good hierarchy with clear headings
6. **Visual Timers** - Progress rings and countdown displays
7. **Priority System** - High/Medium/Low with distinct colors
8. **AI Co-Planning** - Chat interface for task management
9. **Focus Mode** - Distraction-free interface with timer
10. **Mood Tracking** - Emotional state indicators

### Color Usage
- Lavender/purple as primary brand color
- Soft pastels for subject categories
- High contrast text for readability
- Background colors that reduce eye strain

## Implementation Complete

The Tiimo-inspired design system has been fully implemented across all screens. The build passes successfully.
