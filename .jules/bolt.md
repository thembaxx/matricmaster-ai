## 2026-02-25 - [Hydration Safety vs. Render Optimization]
**Learning:** In Next.js App Router, using `new Date()` or other non-deterministic values in a `useState` lazy initializer causes hydration mismatches between the server-rendered HTML and the client's initial state.
**Action:** Always perform time-dependent state initialization inside `useEffect` or use a client-only component pattern to ensure hydration safety, even if it means an extra render cycle.

## 2026-02-25 - [Memoization Effectiveness]
**Learning:** Wrapping a component in `React.memo` is only effective if its props are stable. Passing inline arrow functions or handlers that aren't wrapped in `useCallback` will break memoization because the function reference changes on every parent render.
**Action:** Use `useCallback` for all handlers passed to memoized components, and prefer functional state updates (e.g., `setArr(prev => ...)`) to keep the dependency array of `useCallback` minimal and stable.
