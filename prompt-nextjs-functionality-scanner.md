# Next.js App: Unimplemented Functionality Scanner & Implementation Planner

## Role
You are a senior full-stack engineer tasked with conducting a comprehensive audit of a Next.js 16 (App Router) application to identify all unimplemented, incomplete, or placeholder functionality. Your goal is to create a detailed, actionable implementation plan.

## Objective
Scan the entire Next.js application systematically and produce a structured report identifying:
1. **Unimplemented features** - Pages, routes, or components that exist but lack functionality
2. **Placeholder implementations** - Code with TODO comments, mock data, or stub logic
3. **Broken/incomplete user flows** - Buttons, links, or navigation that lead nowhere or trigger incomplete actions
4. **Missing API endpoints** - Frontend features that call non-existent or incomplete backend routes
5. **Disconnected integrations** - Features that reference external services but lack proper setup

## Scanning Methodology

### Phase 1: Route & Page Inventory
- Enumerate ALL routes in `src/app/` (both page routes and API routes)
- Cross-reference with navigation components (sidebar, bottom nav, headers, menus)
- Identify routes that exist but are NOT linked from any navigation
- Identify navigation links that point to non-existent routes (404s)
- Check for dynamic routes (`[id]`, `[slug]`) and verify they handle edge cases

### Phase 2: Component Implementation Audit
For each component in `src/components/`:
- Search for TODO, FIXME, HACK, XXX, PLACEHOLDER, COMING SOON comments
- Identify components that render empty states or "coming soon" messages
- Check for disabled UI elements (`disabled={true}`, `opacity-50`, `pointer-events-none`)
- Look for conditional rendering that always shows fallback states
- Verify props are properly passed vs. using hardcoded/mock values

### Phase 3: Interactive Element Validation
- Extract ALL buttons, links, and clickable elements
- Trace `onClick` handlers and `href` props to their destinations
- Identify `router.push()` calls to routes that don't exist
- Check for `#` hrefs or `javascript:void(0)` placeholders
- Verify form submissions have proper action handlers
- Check for event handlers that are defined but contain empty functions

### Phase 4: API & Server Action Completeness
For each API route in `src/app/api/`:
- Verify it handles all HTTP methods it should support (GET, POST, PUT, DELETE, PATCH)
- Check for proper error handling and validation
- Identify routes that return hardcoded/mock data
- Verify routes are properly secured with authentication/authorization
- Check for proper response types and status codes

For each server action in `src/actions/` and `src/services/`:
- Verify complete implementation (not just function signatures)
- Check for placeholder return values
- Ensure proper error boundaries and fallback logic

### Phase 5: State & Data Flow Analysis
- Review Zustand stores in `src/stores/` for uninitialized state
- Check hooks in `src/hooks/` for incomplete logic
- Verify data fetching patterns (React Query, SWR, or native fetching)
- Identify missing data dependencies or undefined initial states
- Check for localStorage/sessionStorage usage that should use persistent storage

### Phase 6: Integration Points
- Verify external service integrations (APIs, SDKs, third-party tools)
- Check environment variable usage and fallback behavior
- Identify features gated behind feature flags that are never toggled
- Verify webhook handlers and callback URLs are implemented
- Check for CORS configurations and security headers

## Output Format

Generate a comprehensive report structured as follows:

### Executive Summary
- Total features audited: [count]
- Fully implemented: [count] ([percentage]%)
- Partially implemented: [count] ([percentage]%)
- Not implemented: [count] ([percentage]%)
- Critical issues: [count]

### Detailed Findings

For each identified issue, provide:

#### [Feature Name]
- **Location**: `src/path/to/file.tsx` (line numbers if applicable)
- **Type**: Page | Component | API Route | Server Action | Hook | Store | Integration
- **Severity**: Critical | High | Medium | Low
- **Current State**: Brief description of what currently exists
- **Expected Behavior**: What the feature should do based on its context and naming
- **Impact**: Who/what is affected by this incomplete implementation
- **Dependencies**: What other features/services this depends on

**Implementation Plan**:
1. [Step-by-step action item with specific files to modify]
2. [Next action item]
3. [Continue as needed]

**Estimated Complexity**: Low | Medium | High
**Suggested Priority**: P0 (Blocker) | P1 (High) | P2 (Medium) | P3 (Nice-to-have)

### Quick Wins
List features that can be implemented with minimal effort (< 30 minutes each):
- [Feature] - [What needs to be done]

### Critical Path
List features that MUST be implemented first due to dependencies or user impact:
- [Feature] - [Why it's critical]

### Recommendations
1. [Strategic recommendation for architecture or approach]
2. [Another recommendation]
3. [Continue as needed]

## Specific Checks for This App

Given the known structure of this application (Lumni - SA NSC Grade 12 exam prep platform), pay special attention to:

### Known Placeholders & Incomplete Areas
1. **Google Maps integration** - Falls back to Leaflet, "coming soon" message
2. **Mock data infrastructure** - Many features rely on mock data vs. production APIs
3. **Question Bank Service** - Returns placeholder structures for AI pipeline
4. **Model Management Service** - Contains explicit placeholder implementation
5. **Hint Management System** - Hardcoded `totalHintsUsed = 0`
6. **Monitoring integration** - Placeholder for external logging
7. **Onboarding API calls** - TODO for saving learning preferences
8. **Security headers** - CSP and HSTS headers commented out in `next.config.mjs`
9. **Marketplace API** - Monolithic route handling multiple actions via query params (needs proper RESTful design)
10. **Boss Fight & Team Goals pages** - Exist but not in navigation
11. **Tutor route mismatch** - Marketplace navigates to `/tutor/[id]` but route is `/tutoring/[id]`
12. **CSP report endpoint** - Exists but CSP headers are disabled

### Feature Categories to Validate
- **Learning Features**: Lessons, quizzes, flashcards, study paths, curriculum maps
- **AI Features**: AI tutor, study companion, essay grader, snap & solve, voice tutor
- **Social Features**: Study buddies, channels, comments, leaderboard, focus rooms, duels
- **Practice Tools**: Past papers, quiz generation, spaced repetition, review queues
- **Productivity**: Smart scheduler, focus timer, calendar integration, exam timer
- **Admin/CMS**: Content management, moderation, admin panel
- **Gamification**: XP system, achievements, daily challenges, boss fights
- **Payments**: Subscription management, Paystack integration
- **Parent Features**: Parent dashboard, insights, notifications
- **Offline/PWA**: Offline mode, service worker caching, local AI

## Constraints & Guidelines

- **DO NOT** suggest removing features that are intentionally feature-flagged
- **DO** provide specific file paths and line numbers for all findings
- **DO** consider the SA NSC Grade 12 curriculum context when evaluating features
- **DO NOT** break existing functionality - all recommendations should be additive or improvements
- **DO** prioritize user-facing features that impact students preparing for exams
- **DO** identify security vulnerabilities (commented-out CSP, exposed API keys, etc.)
- **DO** suggest proper RESTful API design where query-param-based routing is used

## Enhancement Requests

After the audit, suggest:
1. **Missing features** that would benefit this platform but don't exist
2. **UX improvements** for existing features
3. **Performance optimizations** for slow-loading routes
4. **Accessibility gaps** based on WCAG 2.1 AA standards
5. **Security hardening** opportunities

## Execution Instructions

1. Start with a full directory tree scan
2. Read navigation configuration to understand intended user flows
3. Systematically audit each route and component
4. Cross-reference frontend calls with backend implementations
5. Search for all TODO/FIXME/PLACEHOLDER comments
6. Compile findings into the output format above
7. Prioritize recommendations by impact and effort
8. Provide code snippets or pseudocode for complex implementations

Begin the scan now and produce the comprehensive report.
