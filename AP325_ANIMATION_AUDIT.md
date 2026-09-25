# AP325 × AlgoVista Animation Audit

This document records the semantic audit for the AP325 Guide integration.

## Automated guarantees

`npm run audit:ap325` checks before every Pages deployment:

- exactly 38 AP325 curriculum modules
- exactly 122 AP325 P/Q problems
- every module has detailed lesson content
- every problem maps to a valid module
- every configured Boss problem exists
- every referenced AlgoVista lesson ID exists
- AP325 runtime wiring is present
- `ap325Curriculum.js`, `lessonContent.js`, and `app.js` pass `node --check`

## Semantic mapping policy

A visualization is included only when it directly demonstrates the module's algorithm or a clearly-labeled supporting idea. A visualization is removed when it could teach the wrong mental model.

### Removed during audit

- `1-enumeration → meet-in-the-middle`: MITM is an optimization of subset enumeration, not the basic recursion tree itself.
- `1-backtracking → dfs`: graph DFS is related, but it is not an N-Queen/backtracking visualization and could imply the wrong state model.
- `4-sweep-line → kadane`: Kadane is not a sweep-line visualization.
- `5-divide-patterns → kadane`: Kadane solves max-subarray with a different linear invariant, not divide-and-conquer.
- `6-1d1d → subset-sum`: subset-sum is useful DP, but it is not the 1D1D transition pattern being taught here.

### Exact / strong mappings retained

- binary search → `binary-search`
- fast power → `fast-exponentiation`
- Fibonacci acceleration → `matrix-exponentiation`
- queue / stack / deque → matching data-structure lessons
- expression stack → parentheses / evaluation / shunting-yard
- monotonic structures → monotonic stack / queue lessons
- sliding window → sliding-window / two-pointers
- greedy scheduling → interval / job scheduling
- priority queue → binary heap
- sweep line → sweep-line / interval merging / closest pair
- merge-sort / inversion counting → matching lessons
- DP → Fibonacci, grid, LCS, LIS, interval, matrix-chain, bitmask, TSP
- graph → BFS, DFS/topological, Dijkstra, DSU, Kruskal, Prim
- tree → traversal, Euler-tour flattening, tree DP, rerooting, LCA / distance

## Product behavior

AP325 Guide now embeds AlgoVista directly inside a module lesson. The same visualization can also be opened full-screen. This keeps the learning flow:

**Concept → Derivation → Invariant → C++ Template → Visualization → AP325 Practice → Quick Check → Review**

instead of forcing the learner to context-switch between a PDF, a judge, and a separate animation site.
