# Sentinel Journal - Critical Security Learnings

## 2025-05-20 - [Lack of Authorization in Server Actions]
**Vulnerability:** Numerous server actions in `src/lib/db/actions.ts` (including user management, content modification, and database seeding) lacked authorization checks, making them callable by any authenticated (or sometimes unauthenticated) user if the action ID was known.
**Learning:** Next.js server actions are public endpoints by default. Relying solely on client-side UI visibility for security is insufficient. Defense in depth requires authorization checks within each server action.
**Prevention:** Use a centralized helper like `ensureAdmin()` at the beginning of sensitive server actions to verify user roles. Always pass `headers()` to `getSession()` in server contexts to ensure correct authentication.

## 2025-05-24 - [IDOR in Legacy Server Actions]
**Vulnerability:** Several legacy server actions in `src/lib/db/actions.ts` (content flagging and buddy requests) accepted user IDs as arguments and used them directly in database queries without verification against the authenticated session.
**Learning:** Even if an action requires authentication, it is vulnerable to IDOR (Insecure Direct Object Reference) if it trusts client-provided user IDs. Server actions must always derive user identity from the session.
**Prevention:** Deriving user identity from `ensureAuthenticated()` or `ensureAdmin()` within the server action itself and using those verified IDs for database operations. Rename unused client-provided ID parameters (e.g., `_userId`) to maintain function signatures while signaling they are ignored for security.
