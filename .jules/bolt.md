## 2026-02-24 - [Memoizing Multi-Filter Screen Logic]
**Learning:** Filter screens with multiple state dependencies (search, checkboxes, toggles) frequently trigger expensive O(N) array operations on every render, even for unrelated UI state changes (like opening a drawer). Wrapping derived data in `useMemo` and sub-components in `memo` with stable `useCallback` handlers is a standard but high-impact optimization for these patterns.
**Action:** Identify screens with `list.filter(...)` or `[...new Set(list.map(...))]` in the render body and apply memoization clusters (data + handlers + component memo).

## 2026-02-26 - [Optimizing CMS Filter & Lookup Complexity]
**Learning:** O(N) array operations inside render loops (like filtering) or inside mapping (like name lookups) create exponential slowdowns as datasets grow. Converting array searches to Map lookups ((S) \to O(1)$) and lowercasing search queries once outside loops significantly reduces CPU cycles during renders, especially when triggered by unrelated UI state changes (like drawer toggles).
**Action:** Always check if a repeated lookup in a map/list can be converted to a memoized Map, and ensure string normalizations in filters happen before the iteration begins.
