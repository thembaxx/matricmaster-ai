# Past Paper Architecture

<cite>
**Referenced Files in This Document**
- [PastPapers.tsx](file://src/screens/PastPapers.tsx)
- [PastPaperViewer.tsx](file://src/screens/PastPaperViewer.tsx)
- [mock-data.ts](file://src/constants/mock-data.ts)
- [page.tsx (Past Papers)](file://src/app/past-papers/page.tsx)
- [page.tsx (Past Paper Viewer)](file://src/app/past-paper/page.tsx)
- [scroll-area.tsx](file://src/components/ui/scroll-area.tsx)
- [button.tsx](file://src/components/ui/button.tsx)
- [card.tsx](file://src/components/ui/card.tsx)
- [input.tsx](file://src/components/ui/input.tsx)
- [badge.tsx](file://src/components/ui/badge.tsx)
- [layout.tsx](file://src/app/layout.tsx)
- [theme-provider.tsx](file://src/components/theme-provider.tsx)
- [MobileFrame.tsx](file://src/components/Layout/MobileFrame.tsx)
- [index.css](file://src/styles/index.css)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains the past paper system architecture, focusing on the PastPapers listing and filtering screen, the PastPaperViewer individual paper display, and the mock data management. It documents data flow from mock sources to UI components, state management patterns for search and filtering, routing mechanisms between pages, responsive design and scroll handling, mobile optimization strategies, component composition patterns, and performance considerations for large datasets. The integration with Next.js App Router and client-side navigation is also covered.

## Project Structure
The past paper feature is organized under the Next.js App Router with dedicated pages and client-side screens:
- Pages define metadata and render the client components
- Screens implement client-side logic and UI
- Constants provide mock data
- UI primitives encapsulate reusable components
- Layout and theme provider manage global styles and theme switching
- Styles define responsive and platform-specific design tokens

```mermaid
graph TB
subgraph "App Router"
PPL["src/app/past-papers/page.tsx"]
PPV["src/app/past-paper/page.tsx"]
end
subgraph "Screens"
SPP["src/screens/PastPapers.tsx"]
SPV["src/screens/PastPaperViewer.tsx"]
end
subgraph "Constants"
MD["src/constants/mock-data.ts"]
end
subgraph "UI Primitives"
BTN["src/components/ui/button.tsx"]
CARD["src/components/ui/card.tsx"]
INPUT["src/components/ui/input.tsx"]
BADGE["src/components/ui/badge.tsx"]
SCROLL["src/components/ui/scroll-area.tsx"]
end
subgraph "Layout & Theme"
LAYOUT["src/app/layout.tsx"]
THEME["src/components/theme-provider.tsx"]
MOBILE["src/components/Layout/MobileFrame.tsx"]
CSS["src/styles/index.css"]
end
PPL --> SPP
PPV --> SPV
SPP --> MD
SPV --> MD
SPP --> SCROLL
SPV --> SCROLL
SPP --> BTN
SPV --> BTN
SPP --> CARD
SPV --> CARD
SPP --> INPUT
SPV --> INPUT
SPP --> BADGE
SPV --> BADGE
LAYOUT --> THEME
LAYOUT --> MOBILE
MOBILE --> BTN
MOBILE --> CSS
```

**Diagram sources**
- [page.tsx (Past Papers)](file://src/app/past-papers/page.tsx#L1-L12)
- [page.tsx (Past Paper Viewer)](file://src/app/past-paper/page.tsx#L1-L17)
- [PastPapers.tsx](file://src/screens/PastPapers.tsx#L1-L179)
- [PastPaperViewer.tsx](file://src/screens/PastPaperViewer.tsx#L1-L281)
- [mock-data.ts](file://src/constants/mock-data.ts#L48-L240)
- [scroll-area.tsx](file://src/components/ui/scroll-area.tsx#L1-L45)
- [button.tsx](file://src/components/ui/button.tsx#L1-L52)
- [card.tsx](file://src/components/ui/card.tsx#L1-L59)
- [input.tsx](file://src/components/ui/input.tsx#L1-L23)
- [badge.tsx](file://src/components/ui/badge.tsx#L1-L34)
- [layout.tsx](file://src/app/layout.tsx#L1-L108)
- [theme-provider.tsx](file://src/components/theme-provider.tsx#L1-L84)
- [MobileFrame.tsx](file://src/components/Layout/MobileFrame.tsx#L1-L319)
- [index.css](file://src/styles/index.css#L1-L286)

**Section sources**
- [page.tsx (Past Papers)](file://src/app/past-papers/page.tsx#L1-L12)
- [page.tsx (Past Paper Viewer)](file://src/app/past-paper/page.tsx#L1-L17)
- [PastPapers.tsx](file://src/screens/PastPapers.tsx#L1-L179)
- [PastPaperViewer.tsx](file://src/screens/PastPaperViewer.tsx#L1-L281)
- [mock-data.ts](file://src/constants/mock-data.ts#L48-L240)
- [layout.tsx](file://src/app/layout.tsx#L84-L107)
- [MobileFrame.tsx](file://src/components/Layout/MobileFrame.tsx#L43-L319)
- [index.css](file://src/styles/index.css#L1-L286)

## Core Components
- PastPapers listing screen:
  - Client component with local state for search and year filter
  - Filters mock data and renders cards with action buttons
  - Uses Next.js router for navigation to viewer
- PastPaperViewer:
  - Client component with URL query param retrieval and local state for zoom, rotation, tabs, and save status
  - Renders paper content with scroll area and bottom toolbar
  - Integrates with interactive quiz conversion
- Mock data:
  - Centralized array of past papers with subject, paper, month, year, marks, time, and download URL
- UI primitives:
  - ScrollArea, Button, Card, Input, Badge provide consistent behavior and styling
- Layout and theme:
  - Root layout manages metadata, theme provider, and mobile frame wrapper
  - MobileFrame provides responsive navigation and safe-area handling

**Section sources**
- [PastPapers.tsx](file://src/screens/PastPapers.tsx#L13-L179)
- [PastPaperViewer.tsx](file://src/screens/PastPaperViewer.tsx#L35-L281)
- [mock-data.ts](file://src/constants/mock-data.ts#L48-L240)
- [scroll-area.tsx](file://src/components/ui/scroll-area.tsx#L1-L45)
- [button.tsx](file://src/components/ui/button.tsx#L1-L52)
- [card.tsx](file://src/components/ui/card.tsx#L1-L59)
- [input.tsx](file://src/components/ui/input.tsx#L1-L23)
- [badge.tsx](file://src/components/ui/badge.tsx#L1-L34)
- [layout.tsx](file://src/app/layout.tsx#L84-L107)
- [theme-provider.tsx](file://src/components/theme-provider.tsx#L25-L84)
- [MobileFrame.tsx](file://src/components/Layout/MobileFrame.tsx#L43-L319)

## Architecture Overview
The system follows a clear separation of concerns:
- Pages define metadata and wrap client components with suspense for the viewer
- Screens own UI state and data filtering/localization
- Constants provide deterministic mock data
- UI primitives encapsulate cross-cutting behaviors (scrolling, theming)
- Layout composes theme provider and mobile frame around children

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant Router as "Next.js App Router"
participant PagePapers as "Past Papers Page"
participant ScreenPapers as "PastPapers Screen"
participant PageViewer as "Past Paper Viewer Page"
participant ScreenViewer as "PastPaperViewer Screen"
Browser->>Router : Navigate to "/past-papers"
Router->>PagePapers : Render
PagePapers->>ScreenPapers : Render client component
ScreenPapers->>ScreenPapers : Load PAST_PAPERS from mock-data
ScreenPapers->>Browser : Render list with search/year filters
Browser->>Router : Click "View" on a paper card
Router->>PageViewer : Render with Suspense
PageViewer->>ScreenViewer : Render client component
ScreenViewer->>ScreenViewer : Read "id" from URL params
ScreenViewer->>ScreenViewer : Find matching paper from mock-data
ScreenViewer->>Browser : Render viewer with zoom/rotation/save controls
```

**Diagram sources**
- [page.tsx (Past Papers)](file://src/app/past-papers/page.tsx#L1-L12)
- [PastPapers.tsx](file://src/screens/PastPapers.tsx#L13-L179)
- [page.tsx (Past Paper Viewer)](file://src/app/past-paper/page.tsx#L1-L17)
- [PastPaperViewer.tsx](file://src/screens/PastPaperViewer.tsx#L35-L281)
- [mock-data.ts](file://src/constants/mock-data.ts#L48-L240)

## Detailed Component Analysis

### PastPapers Listing and Filtering
- State management:
  - Local state for search query and selected year filter
  - Computed filtered list derived from mock data
- Filtering logic:
  - Case-insensitive subject/paper search
  - Year filter supports "All" or specific year selection
- Rendering:
  - Sticky header with search input and year chips
  - Scrollable main content area
  - Grid of cards with metadata and action buttons
  - Navigation to viewer via Next.js router push with query param
- Responsive design:
  - Safe-area insets applied to header and bottom padding
  - Year chips horizontally scrollable with custom scrollbar hiding
  - Cards use rounded corners and subtle shadows for depth

```mermaid
flowchart TD
Start(["Render PastPapers"]) --> LoadMock["Load PAST_PAPERS"]
LoadMock --> InitState["Initialize searchQuery and selectedYear"]
InitState --> ComputeFilters["Compute filteredPapers"]
ComputeFilters --> HasResults{"Any results?"}
HasResults --> |Yes| RenderGrid["Render grid of cards"]
HasResults --> |No| RenderEmpty["Render empty state"]
RenderGrid --> Actions["Attach click handlers"]
Actions --> ViewAction["router.push('/past-paper?id=...')"]
Actions --> DownloadAction["window.open(downloadUrl)"]
RenderEmpty --> End(["Done"])
ViewAction --> End
DownloadAction --> End
```

**Diagram sources**
- [PastPapers.tsx](file://src/screens/PastPapers.tsx#L13-L179)
- [mock-data.ts](file://src/constants/mock-data.ts#L48-L240)

**Section sources**
- [PastPapers.tsx](file://src/screens/PastPapers.tsx#L13-L179)
- [input.tsx](file://src/components/ui/input.tsx#L1-L23)
- [scroll-area.tsx](file://src/components/ui/scroll-area.tsx#L1-L45)
- [button.tsx](file://src/components/ui/button.tsx#L1-L52)
- [card.tsx](file://src/components/ui/card.tsx#L1-L59)
- [badge.tsx](file://src/components/ui/badge.tsx#L1-L34)

### PastPaperViewer Individual Paper Display
- State management:
  - URL query param parsing for paper ID
  - Local state for zoom level, rotation, active tab, and saved status
  - Effect to load paper when ID changes
- Rendering:
  - Sticky header with back button, title, zoom controls, rotate, and download
  - Scrollable main content with transform-based zoom and rotation
  - Conversion banner to interactive quiz
  - Instructions and sample question content
  - Bottom toolbar with tab navigation
- Routing:
  - Back navigation via router.back()
  - Navigation to interactive quiz with paper ID

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant Page as "Past Paper Viewer Page"
participant Screen as "PastPaperViewer Screen"
participant Data as "PAST_PAPERS"
Browser->>Page : Render with Suspense
Page->>Screen : Render client component
Screen->>Screen : Read "id" from URL params
Screen->>Data : Find paper by id
Data-->>Screen : Return paper object
Screen->>Screen : Set local state (zoom, rotation, saved)
Screen->>Browser : Render viewer UI
Browser->>Screen : User clicks "Convert to Interactive"
Screen->>Browser : router.push("/interactive-quiz?id=...")
```

**Diagram sources**
- [page.tsx (Past Paper Viewer)](file://src/app/past-paper/page.tsx#L1-L17)
- [PastPaperViewer.tsx](file://src/screens/PastPaperViewer.tsx#L35-L281)
- [mock-data.ts](file://src/constants/mock-data.ts#L48-L240)

**Section sources**
- [PastPaperViewer.tsx](file://src/screens/PastPaperViewer.tsx#L35-L281)
- [scroll-area.tsx](file://src/components/ui/scroll-area.tsx#L1-L45)
- [button.tsx](file://src/components/ui/button.tsx#L1-L52)
- [card.tsx](file://src/components/ui/card.tsx#L1-L59)
- [badge.tsx](file://src/components/ui/badge.tsx#L1-L34)

### Mock Data Management
- Data model:
  - Array of past papers with fields: id, year, subject, paper, month, marks, time, downloadUrl
- Usage:
  - PastPapers filters this array locally
  - PastPaperViewer selects a single paper by ID
- Extensibility:
  - Additional fields can be added without changing consumers
  - Central location simplifies updates and testing

```mermaid
erDiagram
PAST_PAPER {
string id PK
number year
string subject
string paper
string month
number marks
string time
string downloadUrl
}
```

**Diagram sources**
- [mock-data.ts](file://src/constants/mock-data.ts#L48-L240)

**Section sources**
- [mock-data.ts](file://src/constants/mock-data.ts#L48-L240)

### UI Primitives and Composition Patterns
- ScrollArea:
  - Provides native-like scrolling with custom scrollbar
  - Used in both listing and viewer for content areas
- Button, Card, Input, Badge:
  - Consistent variants and sizes across screens
  - Encapsulate styling and behavior for reuse
- Composition:
  - Screens compose primitives to build complex layouts
  - Props are passed down to maintain cohesion while avoiding deep drilling

```mermaid
classDiagram
class ScrollArea {
+viewport
+scrollbar
+corner
}
class Button {
+variants
+sizes
}
class Card {
+rounded corners
+shadow
}
class Input {
+placeholder
+focus styles
}
class Badge {
+variants
}
class PastPapers {
+filters
+renders cards
}
class PastPaperViewer {
+zoom/rotate
+tabs
}
PastPapers --> ScrollArea : "uses"
PastPapers --> Button : "uses"
PastPapers --> Card : "uses"
PastPapers --> Input : "uses"
PastPapers --> Badge : "uses"
PastPaperViewer --> ScrollArea : "uses"
PastPaperViewer --> Button : "uses"
PastPaperViewer --> Card : "uses"
PastPaperViewer --> Badge : "uses"
```

**Diagram sources**
- [scroll-area.tsx](file://src/components/ui/scroll-area.tsx#L1-L45)
- [button.tsx](file://src/components/ui/button.tsx#L1-L52)
- [card.tsx](file://src/components/ui/card.tsx#L1-L59)
- [input.tsx](file://src/components/ui/input.tsx#L1-L23)
- [badge.tsx](file://src/components/ui/badge.tsx#L1-L34)
- [PastPapers.tsx](file://src/screens/PastPapers.tsx#L13-L179)
- [PastPaperViewer.tsx](file://src/screens/PastPaperViewer.tsx#L35-L281)

**Section sources**
- [scroll-area.tsx](file://src/components/ui/scroll-area.tsx#L1-L45)
- [button.tsx](file://src/components/ui/button.tsx#L1-L52)
- [card.tsx](file://src/components/ui/card.tsx#L1-L59)
- [input.tsx](file://src/components/ui/input.tsx#L1-L23)
- [badge.tsx](file://src/components/ui/badge.tsx#L1-L34)

### Responsive Design and Mobile Optimization
- Safe-area handling:
  - Header and bottom paddings use env(safe-area-inset-*) to accommodate device insets
- Mobile navigation:
  - MobileFrame provides top bar, side sheet menu, and floating bottom navigation
  - Bottom navigation hides on specific routes and applies iOS-style glass effect
- Scroll behavior:
  - Custom scrollbar hiding for cleaner appearance
  - Smooth scrolling enabled globally
- Typography and spacing:
  - Platform-appropriate font stacks and letter-spacing
  - Consistent spacing and rounded corners for mobile touch targets

```mermaid
flowchart TD
Device["Device with safe-area insets"] --> Layout["Root Layout"]
Layout --> Theme["Theme Provider"]
Theme --> Mobile["MobileFrame"]
Mobile --> Header["Top bar with menu"]
Mobile --> Content["Main content area"]
Mobile --> BottomNav["Floating bottom navigation"]
Content --> Scroll["ScrollAreas in screens"]
```

**Diagram sources**
- [layout.tsx](file://src/app/layout.tsx#L84-L107)
- [theme-provider.tsx](file://src/components/theme-provider.tsx#L25-L84)
- [MobileFrame.tsx](file://src/components/Layout/MobileFrame.tsx#L43-L319)
- [index.css](file://src/styles/index.css#L22-L28)

**Section sources**
- [MobileFrame.tsx](file://src/components/Layout/MobileFrame.tsx#L43-L319)
- [index.css](file://src/styles/index.css#L1-L286)
- [layout.tsx](file://src/app/layout.tsx#L78-L82)

## Dependency Analysis
- Pages depend on screens:
  - Past Papers page renders PastPapers screen
  - Past Paper Viewer page renders PastPaperViewer screen with suspense
- Screens depend on constants:
  - Both screens import PAST_PAPERS from mock-data
- UI primitives are shared dependencies:
  - Screens import Button, Card, Input, Badge, ScrollArea
- Layout and theme:
  - Root layout wraps children with ThemeProvider and MobileFrame
  - MobileFrame depends on theme context and router

```mermaid
graph LR
PPL["past-papers/page.tsx"] --> SPP["PastPapers.tsx"]
PPV["past-paper/page.tsx"] --> SPV["PastPaperViewer.tsx"]
SPP --> MD["mock-data.ts"]
SPV --> MD
SPP --> BTN["button.tsx"]
SPP --> CARD["card.tsx"]
SPP --> INPUT["input.tsx"]
SPP --> BADGE["badge.tsx"]
SPP --> SCROLL["scroll-area.tsx"]
SPV --> BTN
SPV --> CARD
SPV --> BADGE
SPV --> SCROLL
LAYOUT["layout.tsx"] --> THEME["theme-provider.tsx"]
LAYOUT --> MOBILE["MobileFrame.tsx"]
MOBILE --> BTN
MOBILE --> CSS["index.css"]
```

**Diagram sources**
- [page.tsx (Past Papers)](file://src/app/past-papers/page.tsx#L1-L12)
- [page.tsx (Past Paper Viewer)](file://src/app/past-paper/page.tsx#L1-L17)
- [PastPapers.tsx](file://src/screens/PastPapers.tsx#L1-L179)
- [PastPaperViewer.tsx](file://src/screens/PastPaperViewer.tsx#L1-L281)
- [mock-data.ts](file://src/constants/mock-data.ts#L48-L240)
- [button.tsx](file://src/components/ui/button.tsx#L1-L52)
- [card.tsx](file://src/components/ui/card.tsx#L1-L59)
- [input.tsx](file://src/components/ui/input.tsx#L1-L23)
- [badge.tsx](file://src/components/ui/badge.tsx#L1-L34)
- [scroll-area.tsx](file://src/components/ui/scroll-area.tsx#L1-L45)
- [layout.tsx](file://src/app/layout.tsx#L84-L107)
- [theme-provider.tsx](file://src/components/theme-provider.tsx#L25-L84)
- [MobileFrame.tsx](file://src/components/Layout/MobileFrame.tsx#L43-L319)
- [index.css](file://src/styles/index.css#L1-L286)

**Section sources**
- [page.tsx (Past Papers)](file://src/app/past-papers/page.tsx#L1-L12)
- [page.tsx (Past Paper Viewer)](file://src/app/past-paper/page.tsx#L1-L17)
- [PastPapers.tsx](file://src/screens/PastPapers.tsx#L1-L179)
- [PastPaperViewer.tsx](file://src/screens/PastPaperViewer.tsx#L1-L281)
- [mock-data.ts](file://src/constants/mock-data.ts#L48-L240)
- [layout.tsx](file://src/app/layout.tsx#L84-L107)
- [MobileFrame.tsx](file://src/components/Layout/MobileFrame.tsx#L43-L319)

## Performance Considerations
- Filtering performance:
  - Current implementation filters a small mock dataset in memory
  - For larger datasets, consider virtualizing lists and debounced search
- Rendering optimizations:
  - Memoize computed filtered lists if props are stable
  - Lazy-load images and defer non-critical resources
- State management:
  - Keep local state minimal; avoid unnecessary re-renders by isolating state per component
- Scroll performance:
  - Use transform-based zoom/rotation judiciously; test on low-end devices
  - Prefer CSS transforms over layout-affecting styles for animations
- Bundle size:
  - Ensure UI primitives are tree-shaken; avoid importing unused variants
- Accessibility:
  - Provide skip links and keyboard navigation for bottom toolbar and filters

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- No papers found:
  - Verify mock data contains entries matching search terms and year filter
  - Confirm filter logic includes case-insensitive matching
- Navigation issues:
  - Ensure query param "id" is present when navigating to viewer
  - Check router.push usage and trailing slashes
- Theme mismatches:
  - Confirm ThemeProvider is wrapping the application and hydration is suppressed at the HTML level
- Scrollbars and safe-area:
  - Validate env(safe-area-inset-*) usage and custom scrollbar CSS
- Mobile navigation:
  - Confirm MobileFrame hides bottom navigation on specific routes and applies correct z-index stacking

**Section sources**
- [PastPapers.tsx](file://src/screens/PastPapers.tsx#L20-L26)
- [PastPaperViewer.tsx](file://src/screens/PastPaperViewer.tsx#L46-L51)
- [layout.tsx](file://src/app/layout.tsx#L86-L106)
- [MobileFrame.tsx](file://src/components/Layout/MobileFrame.tsx#L52-L57)
- [index.css](file://src/styles/index.css#L28-L314)

## Conclusion
The past paper system is structured around clean separation of concerns: pages define metadata and suspense boundaries, screens manage client state and UI composition, and constants provide deterministic mock data. Filtering and viewer navigation are handled via Next.js App Router and client-side state. Responsive design leverages safe-area insets, custom scrollbars, and a mobile-first navigation pattern. For production scaling, consider virtualization, debounced search, and memoization to optimize performance with larger datasets.