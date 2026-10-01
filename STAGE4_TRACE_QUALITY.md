# Stage 4 — Trace Quality Reset

Stage 4 removes the mechanism that created synthetic animation steps.

## Production change

The old pipeline used code-line count to expand a small number of conceptual frames into 10–20 apparent animation steps. That generator is no longer part of production and its implementation has been deleted.

Lessons now declare one of two trace modes:

- `execution`: concrete step-by-step execution that may be presented as a real animation.
- `semantic`: honest conceptual snapshots while the lesson is waiting for a real execution trace.

Semantic lessons are no longer mislabeled as concrete.

## Before → after

| Metric | Old baseline | Stage 4 |
|---|---:|---:|
| Final frames | 2147 | 818 |
| Legacy generic-expanded lessons | 186 | **0** |
| Generic generated-text frames | 1912 | **0** |
| Data no-op transitions | 1354 | **1** |
| Render no-op transitions | 1217 | **1** |
| Code-only transitions | 822 | **1** |
| Focus-only transitions | 137 | **0** |

The remaining single repeated transition is in an authored Binary Search trace and is not caused by the deleted generator.

## Important interpretation

This does **not** mean all 202 lessons are finished.

It means unfinished lessons now tell the truth: they show a small semantic outline instead of pretending that a generated timeline is real execution.

Stage 5 is responsible for upgrading semantic lessons to execution traces.

## CI gate

Deployment now fails if:

- any lesson is again expanded by the retired generic pipeline; or
- generic generated filler text reappears.

This keeps the codebase from regressing while execution traces are rebuilt.
