## 2026-02-23 - [Fix IDOR in Search History Server Actions]
**Vulnerability:** Insecure Direct Object Reference (IDOR) in Search History management. Server actions (`addSearchHistoryAction`, `getSearchHistoryAction`, etc.) accepted `userId` as a parameter from the client and used it in database queries without verifying it against the authenticated session.
**Learning:** In Next.js Server Actions, parameters are user-controlled input. Trusting `userId` passed from the client allows malicious users to impersonate others by providing their IDs.
**Prevention:** Always retrieve the user ID from the authenticated session on the server side using utilities like `getAuth().api.getSession` and never trust a `userId` passed as an argument to a public-facing server action.

## 2026-02-24 - [Fix IDOR in Bookmark Server Actions]
**Vulnerability:** Insecure Direct Object Reference (IDOR) in Bookmark management. All exported actions in `bookmark-actions.ts` accepted `userId` as a parameter and used it without verifying it against the authenticated session.
**Learning:** Even when using centralized authentication helpers, developers must remember to apply them across all related action files, not just the main `actions.ts`. Exporting these helpers allows for a consistent security model.
**Prevention:** Centralize authentication and authorization helpers (like `ensureAuthenticated`) and export them for use in all server action files. Always verify client-provided IDs against the session ID.
