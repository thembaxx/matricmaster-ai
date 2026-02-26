## 2026-02-23 - [Fix IDOR in Search History Server Actions]
**Vulnerability:** Insecure Direct Object Reference (IDOR) in Search History management. Server actions (`addSearchHistoryAction`, `getSearchHistoryAction`, etc.) accepted `userId` as a parameter from the client and used it in database queries without verifying it against the authenticated session.
**Learning:** In Next.js Server Actions, parameters are user-controlled input. Trusting `userId` passed from the client allows malicious users to impersonate others by providing their IDs.
**Prevention:** Always retrieve the user ID from the authenticated session on the server side using utilities like `getAuth().api.getSession` and never trust a `userId` passed as an argument to a public-facing server action.

## 2026-02-24 - [Fix IDOR in Bookmark Server Actions]
**Vulnerability:** Insecure Direct Object Reference (IDOR) in Bookmark management. All exported actions in `bookmark-actions.ts` accepted `userId` as a parameter and used it without verifying it against the authenticated session.
**Learning:** Even when using centralized authentication helpers, developers must remember to apply them across all related action files, not just the main `actions.ts`. Exporting these helpers allows for a consistent security model.
**Prevention:** Centralize authentication and authorization helpers (like `ensureAuthenticated`) and export them for use in all server action files. Always verify client-provided IDs against the session ID.

## 2026-03-05 - [Fix IDOR in Comment Server Actions]
**Vulnerability:** Insecure Direct Object Reference (IDOR) and unauthenticated access in Comment management. Exported server functions (`createComment`, `updateComment`, `deleteComment`, `voteOnComment`, `getUserVote`, `flagComment`) in `comment-actions.ts` either accepted `userId` from the client without verification or lacked authentication altogether (in the case of `flagComment`).
**Learning:** When fixing IDOR in existing server functions with many potential callers, it's safer to maintain the function signature for backward compatibility but ignore the client-provided `userId` in favor of a session-derived ID obtained via `ensureAuthenticated()`.
**Prevention:** Always use `ensureAuthenticated()` to retrieve the user's ID on the server side. If a function already has a `userId` parameter, prefix it with an underscore (e.g., `_userId`) to indicate it's intentionally ignored for security reasons, while avoiding breaking changes to the API contract.
