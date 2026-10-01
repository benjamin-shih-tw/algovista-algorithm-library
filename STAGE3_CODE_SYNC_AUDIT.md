# Stage 3 — Animation ↔ Code Synchronization

Stage 3 is complete for the 15 S0 lessons.

## Goal

Every animation step must highlight the source statement that owns the visible event. Source-code coverage is no longer allowed to inject unrelated lines into animation frames.

## Architecture fixes

- Removed forced uncovered-line injection from animation frames.
- Separated animation event ownership from whole-template code-guide coverage.
- The code panel now highlights one primary event line, not every line attached to a frame.
- Primary source selection now uses event semantics, with algorithm-specific ownership rules where multiple lines are plausible.
- Segment Tree labels are consistently zero-based, matching the C++ implementation.
- Convex Hull now contains a real explicit upper-chain loop instead of a comment pretending that the loop exists.

## Verified S0 set

Binary Search, BFS, Dijkstra, Segment Tree, Linear Search, Sliding Window, Prefix Sum, Two Pointers, Difference Array, Coordinate Compression, Kadane, Selection Sort, Bubble Sort, Quick Sort, Convex Hull.

## Final CI result

| Metric | Result |
|---|---:|
| S0 lessons | 15 |
| Frames checked | 215 |
| Unresolved primary source lines | **0** |
| Generic function/for headers selected despite a more specific owned line | **0** |

The Stage 3 audit is now a blocking CI gate.

## Key examples fixed

- Binary Search `22 < target` highlights the `a[mid] < target` branch.
- BFS discovery highlights the concrete distance/discovery mutation instead of the visited guard.
- Dijkstra relaxation highlights `dist[v] = d + w`.
- Stale Dijkstra heap entries highlight the stale-entry guard.
- Bubble Sort comparisons highlight the comparison branch, while pass-boundary frames intentionally highlight `n-pass`.
- Convex Hull upper-chain pop/push events map to actual upper-chain code.
