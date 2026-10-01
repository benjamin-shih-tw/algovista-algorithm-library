# Stage 2 — Semantic Animation Audit

This stage evaluates whether the animation actually represents the algorithm, not merely whether the data schema is complete.

Stage 1 found structural risk. Stage 2 performs human semantic review against the final enriched frames that students actually see.

## Grading rubric

Each lesson is reviewed on separate dimensions.

### Animation semantics

- **A — Execution-driven:** each important step represents a concrete algorithm event with real changing values/structures.
- **B — Mostly execution-driven:** core trace is real, but one or more steps, labels, or necessary state details are incomplete/inconsistent.
- **C — Conceptual trace:** the page shows some algorithm-specific state, but not enough concrete execution for a student to follow the algorithm step by step.
- **D — Generic / non-execution trace:** steps are mainly generated from code position or abstract phase labels rather than actual execution.

### Code synchronization

- **A:** highlighted code is the statement causing the visible state transition.
- **B:** usually correct, with some overly broad or nearby-line mappings.
- **C:** several important steps highlight a related but semantically different line.
- **D:** code position changes independently of the animation state; mapping is mainly structural coverage rather than execution sync.

A repeated frame is not automatically wrong. A deliberate pause can be useful, but it must have an explicit teaching purpose and must not pretend that the algorithm state advanced.

---

## Calibration batch — 12 representative lessons

| Lesson | Animation | Code Sync | Main finding | Required direction |
|---|:---:|:---:|---|---|
| Binary Search | A | B | Real candidate interval, midpoint, comparisons, and boundary movement. One comparison frame ends up highlighting the equality branch even though the visible state is `22 < 29`. | Preserve trace; fix event→code ownership. |
| BFS | A | B | Queue, distances, discovered nodes, and layer progression are concrete. Some discovery frames choose a nearby control-flow line rather than the exact mutation line. | Preserve trace; split pop/check/discover events and map each to exact lines. |
| Dijkstra | A | B | Priority queue, stale entries, distances, and relaxations form a real execution trace. Some relaxation frames highlight the loop/header instead of the mutation that changed `dist`. | Preserve trace; bind relax event to condition/update/push lines explicitly. |
| Segment Tree | B | A/B | Build/query/update lifecycle is concrete and is the best current model. However one query title says `[2,6]` while the actual state/query trace uses `[1,5]`. | Use as gold standard after fixing interval consistency and a few code-line details. |
| Prefix XOR | D | D | 10 steps contain no concrete prefix XOR execution. The same abstract state is repeated while code lines advance. No actual `px[i]`, `a[i]`, or XOR result is shown. | Rebuild from actual array values and per-iteration prefix updates. |
| Fenwick Tree | C | C | Contains useful concepts such as lowbit and path `3→4→8`, but most steps do not execute an update/query with changing BIT values. | Add concrete BIT array, lowbit calculation, update path mutations, prefix accumulation. |
| KMP | D | D | Final trace mostly changes labels such as “pi border length” → “fallback” → “match”. No concrete pattern characters, `i`, `j`, or `pi[]` evolution. | Rebuild with a real pattern and explicit fallback chain. |
| 0/1 Knapsack | D | D | Mentions capacity 7 and the reverse direction, but does not show a real DP row/array changing across capacities/items. | Show item-by-item DP mutation and why reverse iteration prevents reuse. |
| Tarjan SCC | C | C | Raw data contains meaningful `disc`, `low`, stack, back-edge, and component information, but generic expansion repeats phases and breaks exact code ownership. | Keep algorithm-specific raw states; replace expansion with DFS events. |
| Digit DP | D | D | The screen has abstract labels for pos/tight/started but no actual upper bound digits, state tuple, choices, memo hits, or counts. | Use one numeric bound and trace real recursive states/transitions. |
| Dinic | D | D | Mentions residual network / level graph / blocking flow only as phase labels. No capacities, levels, augmenting path, bottleneck, or residual update is executed. | Build a concrete flow network and trace BFS levels + DFS pushes. |
| Meet in the Middle | D | D | 3 conceptual frames are expanded to 20 code-position steps; 17 transitions do not advance algorithm data. No subset-sum lists or binary-search complement values are shown. | Show actual left/right subset sums, sort, one or more complement searches, and answer update. |

---

## Detailed findings

### 1. Binary Search — real animation, imperfect code ownership

The semantic trace is strong:

- candidate interval starts at `[0,8]`
- midpoint becomes 4
- `a[4]=22<29`
- low moves to 5
- midpoint becomes 6
- `a[6]=34>29`
- high moves to 5
- final midpoint 5 matches 29

This is what an execution-driven lesson should look like.

However the final enriched frame for the first comparison reports:

```text
state: a[4] = 22 < 29
decision: discard 0…4
highlighted primary code: if (a[mid] == target)
```

The animation is semantically correct; the code owner is not.

This confirms that code coverage must never be allowed to rewrite the primary event line.

### 2. BFS — correct data story, line mapping sometimes too broad

The animation correctly shows:

- queue contents
- first discovery
- distances
- current node
- already-visited skip
- final layer distances

But a frame whose semantic event is “discover B, set distance, push B” can choose `if (visited[v]) continue;` as its primary displayed line.

The lesson should represent that discovery as multiple atomic events or explicitly group the exact lines:

```text
check unvisited
→ mark visited
→ dist[v] = dist[u] + 1
→ q.push(v)
```

### 3. Dijkstra — strong model for priority-queue algorithms

This lesson already contains the key structures students need:

- tentative distances
- heap contents
- stale heap entries
- fixed/latest nodes
- concrete edge relaxations

Examples include:

```text
C→B: 2+1 < 4
B: 4→3
heap: (3,B), (4,B stale), (6,E)
```

This is a strong reference for future graph animations.

The main remaining issue is exact code binding: some edge-relaxation state changes are mapped to `for (...)` instead of the comparison/update statement that produced the change.

### 4. Segment Tree — strongest current lifecycle model, but internal consistency still matters

This page correctly separates:

- build
- split
- leaf write
- pull
- range query
- complete-overlap acceptance
- result merging
- point update
- pull back to root
- verification

This is the best current structural reference.

However Stage 2 found a direct content inconsistency:

```text
frame title: Query [2, 6]
frame state: query [1,5]
```

A gold-standard lesson cannot contain two different examples in the same frame.

### 5. Prefix XOR — the screenshot problem reproduced exactly

The final trace is not a Prefix XOR execution.

The sequence is effectively:

```text
abstract prefix state
→ same state
→ same state
→ move generic focus
→ rename phase
→ same state
→ ...
```

There is no concrete sequence such as:

```text
px[0] = 0
a[0] = 5
px[1] = 0 XOR 5 = 5

a[1] = 3
px[2] = 5 XOR 3 = 6
```

and no concrete query such as:

```text
xor [1,3] = px[4] XOR px[1]
```

This lesson should be rebuilt, not patched.

### 6. Fenwick Tree — useful raw ideas trapped inside a generic timeline

The lesson already knows several correct ideas:

- `lowbit = i & -i`
- update path such as `3→4→8`
- range sum as two prefixes

But the final 12 frames spend many steps on declarations and function headers while BIT values remain unchanged.

A good Fenwick animation must show, for example:

```text
add(3,+5)
bit[3] += 5
lowbit(3)=1 → i=4
bit[4] += 5
lowbit(4)=4 → i=8
bit[8] += 5
```

and then a prefix query accumulating concrete values in reverse.

### 7. KMP — algorithm-specific prose, generic animation

The raw lesson explanation correctly understands KMP:

- `pi[i]`
- border
- fallback `j=pi[j-1]`
- no text-index rollback

But the final animation does not show the things required to understand that rule.

Missing concrete state:

- pattern string
- `i`
- `j`
- compared characters
- `pi[]`
- fallback chain

Therefore good source prose alone does not make a good animation.

### 8. 0/1 Knapsack — knows the theorem, does not execute the DP

The lesson correctly states that capacity must run backwards.

But the animation does not concretely show why.

A student should see:

```text
item = (w=3, value=5)
before: dp[7] = ...
source: dp[4] = ...
candidate = dp[4] + 5
after: dp[7] = ...
```

and then see the next capacities moving downward.

Without concrete values, the important “do not reuse this item in the same round” idea remains verbal.

### 9. Tarjan SCC — salvageable

Unlike many generic lessons, the raw Tarjan data is genuinely algorithm-specific:

- `disc`
- `low`
- stack
- back edge `D→B`
- low update `2→1`
- SCC root
- popped component

The problem is mostly the expansion layer. It repeats these few meaningful states across unrelated code lines.

This is a good example of a lesson that should **not** be rewritten from zero: preserve the semantic data, replace the generic timeline with explicit DFS events.

### 10. Digit DP — state names are not state execution

The lesson lists the correct dimensions:

```text
pos / tight / started / constraint
```

but a student never sees a real tuple evolve.

A proper animation needs a concrete upper bound, for example `N=327`:

```text
(pos=0, tight=1, started=0)
choose d=2
→ (pos=1, tight=0, started=1)

memo[(1,0,1,state)] ...
```

Without this, the current DP boxes are labels rather than an explanation.

### 11. Dinic — missing the entire visual proof mechanism

For Dinic, the important animation is not merely “flow network”.

Students need to see:

- edge capacities
- residual capacities
- BFS level of every node
- allowed level edges
- current pointer
- DFS path
- bottleneck
- forward/reverse residual update
- blocking flow
- next BFS

The current three concepts do not provide those structures.

This requires a dedicated flow execution trace.

### 12. Meet in the Middle — clearest example of synthetic steps

The raw lesson has three ideas; the final lesson has 20 steps.

The first seven steps all belong to “enumerate one half”, but the subset-sum list itself never changes on screen.

Then another long block walks through source lines while keeping the same abstract state.

This is exactly the anti-pattern Stage 1 was designed to detect.

---

## New Stage 2 root causes

Stage 2 confirms four separate failure modes.

### R1 — synthetic timeline

`expandGuidedFrames()` turns conceptual phases into steps even when no execution event exists.

### R2 — code coverage can override event ownership

`ensureCodeCoverage()` successfully reaches 100% code coverage, but that metric is not sufficient.

A code line must belong to the event it causes; “nearest frame” is not a semantic relationship.

### R3 — correct prose can coexist with a bad animation

KMP, Dinic, Digit DP, and other lessons often have technically good invariant/transition prose.

The problem is that the renderer never receives enough concrete per-step state to visualize those ideas.

### R4 — some lessons are recoverable without full rewrite

Not every C/D lesson requires the same treatment.

- Prefix XOR / Digit DP / Dinic / Meet-in-the-Middle need substantial execution traces.
- Tarjan SCC / Fenwick already contain useful algorithm-specific semantic material that can be preserved and expanded correctly.
- Authored lessons mainly need synchronization cleanup rather than reconstruction.

---

## Stage 2 reconstruction classes

For the remaining 202-lesson review, use these repair classes:

- **S0 — Sync cleanup only:** execution trace exists; fix labels or exact code lines.
- **S1 — Enrich existing trace:** good algorithm-specific states exist; add missing concrete events/values.
- **S2 — Rebuild execution trace:** current frames are mostly conceptual/generic and need real execution data.
- **S3 — Dedicated renderer/state model required:** the algorithm cannot be taught faithfully with the current visual representation.

Current calibration:

| Lesson | Repair class |
|---|---|
| Binary Search | S0 |
| BFS | S0 |
| Dijkstra | S0 |
| Segment Tree | S0 |
| Fenwick Tree | S1 |
| Tarjan SCC | S1 |
| Prefix XOR | S2 |
| KMP | S2 |
| 0/1 Knapsack | S2 |
| Digit DP | S2 |
| Meet in the Middle | S2 |
| Dinic | S3 |

---

## Next Stage 2 pass

The next semantic pass should expand beyond calibration and classify all lessons by:

1. whether the current visual model is appropriate;
2. whether concrete execution state exists;
3. whether the necessary algorithm-specific structures are present;
4. whether code ownership matches state transitions;
5. repair class S0/S1/S2/S3.

The end product of Stage 2 should be a 202-row semantic remediation matrix, not just a list of examples.
