# Sentinel Journal - Critical Security Learnings

## 2025-05-20 - [Lack of Authorization in Server Actions]
**Vulnerability:** Numerous server actions in `src/lib/db/actions.ts` (including user management, content modification, and database seeding) lacked authorization checks, making them callable by any authenticated (or sometimes unauthenticated) user if the action ID was known.
**Learning:** Next.js server actions are public endpoints by default. Relying solely on client-side UI visibility for security is insufficient. Defense in depth requires authorization checks within each server action.
**Prevention:** Use a centralized helper like `ensureAdmin()` at the beginning of sensitive server actions to verify user roles. Always pass `headers()` to `getSession()` in server contexts to ensure correct authentication.
