## 2026-02-23 - [Fix IDOR in Search History Server Actions]
**Vulnerability:** Insecure Direct Object Reference (IDOR) in Search History management. Server actions (`addSearchHistoryAction`, `getSearchHistoryAction`, etc.) accepted `userId` as a parameter from the client and used it in database queries without verifying it against the authenticated session.
**Learning:** In Next.js Server Actions, parameters are user-controlled input. Trusting `userId` passed from the client allows malicious users to impersonate others by providing their IDs.
**Prevention:** Always retrieve the user ID from the authenticated session on the server side using utilities like `getAuth().api.getSession` and never trust a `userId` passed as an argument to a public-facing server action.

## 2026-02-24 - [Centralized Auth Utilities for Server Actions]
**Vulnerability:** Recurring IDOR patterns across multiple action files (`bookmark-actions.ts`, `buddy-actions.ts`, etc.) where `userId` was accepted as a parameter.
**Learning:** Having authentication logic duplicated or missing in various action files leads to inconsistent security coverage.
**Prevention:** Centralize `ensureAuthenticated` and `ensureAdmin` helpers in a shared utility (e.g., `src/lib/db/auth-utils.ts`) and use them consistently across all Server Actions to retrieve the user identity from the session rather than trusting client-provided parameters.
