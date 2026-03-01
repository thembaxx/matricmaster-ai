## 2026-02-24 - [Memoizing Multi-Filter Screen Logic]
**Learning:** Filter screens with multiple state dependencies (search, checkboxes, toggles) frequently trigger expensive O(N) array operations on every render, even for unrelated UI state changes (like opening a drawer). Wrapping derived data in `useMemo` and sub-components in `memo` with stable `useCallback` handlers is a standard but high-impact optimization for these patterns.
**Action:** Identify screens with `list.filter(...)` or `[...new Set(list.map(...))]` in the render body and apply memoization clusters (data + handlers + component memo).

## 2026-02-26 - [Optimizing CMS Filter & Lookup Complexity]
**Learning:** O(N) array operations inside render loops (like filtering) or inside mapping (like name lookups) create exponential slowdowns as datasets grow. Converting array searches to Map lookups ((S) \to O(1)$) and lowercasing search queries once outside loops significantly reduces CPU cycles during renders, especially when triggered by unrelated UI state changes (like drawer toggles).
**Action:** Always check if a repeated lookup in a map/list can be converted to a memoized Map, and ensure string normalizations in filters happen before the iteration begins.

## 2026-02-28 - [Memoizing Search Screen & Sub-components]
**Learning:** In a search interface, typing triggers high-frequency state updates in the parent. Without memoization, every child component (even static ones like 'SuggestedCards') re-renders on every keystroke. Combining 'useMemo' for the O(N) filter and 'React.memo' for all sub-components with 'useCallback' handlers ensures that only the relevant parts of the UI update, significantly reducing the main thread load during active searching.
**Action:** For search/filter screens, always apply a triple-layer memoization: 'useMemo' for data derivation, 'useCallback' for event handlers, and 'React.memo' for sub-components.

## 2026-03-01 - [Memoizing Dashboard Sub-components]
**Learning:** Root level context consumers (like notifications) trigger full-screen re-renders on state updates (e.g., receiving a notification). In complex screens like the Dashboard, this causes all sub-widgets (charts, lists, goal trackers) to re-render even if their internal data hasn't changed. Memoizing these sub-components ensures the UI remains responsive and avoids expensive DOM updates during background data synchronization.
**Action:** Identify main entry screens with global context dependencies and wrap all child widgets in `React.memo`, ensuring all passed callbacks are stabilized with `useCallback`.
