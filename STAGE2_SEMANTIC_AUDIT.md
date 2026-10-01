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


---

## Calibration batch 2 — cross-category semantic review

The second batch broadens the calibration across linear structures, DAG processing, tree queries, lazy propagation, string automata, cost flow, number theory, geometry, and transforms.

| Lesson | Animation | Code Sync | Main finding | Repair class |
|---|:---:|:---:|---|:---:|
| Monotonic Stack | C | C | Has real stack/incoming-value snapshots, but they jump between examples and many code steps repeat the same stack state. | S1 |
| Topological Sort | C | C | Initial indegrees and queue are concrete, but the trace jumps from processing A directly to final output count instead of showing edge-by-edge indegree decrements. | S1 |
| LCA Binary Lifting | C | C | Query has concrete u/v/depth/jump state, but skips the actual jump-table logic and several code steps repeat unchanged state. | S1 |
| Lazy Segment Tree | C | C | Knows covered intervals and pending tags, but a 20-step code walk is built from only three semantic snapshots. | S1 |
| LIS | C | C | Concrete tails examples exist, but frames jump between unrelated snapshots rather than executing one input sequence from start to finish. | S1 |
| Aho–Corasick | D | D | Only phase labels “Trie + failure links / fallback / reported matches” remain; no actual trie nodes, fail links, text index, or outputs are executed. | S2 |
| Min-Cost Max-Flow | D | D | No concrete capacities, costs, shortest residual path, bottleneck, reverse edge, or cumulative flow/cost values. | S3 |
| Extended Euclid | D | D | Correct concept names, but no concrete recursive pair (a,b), quotient, gcd, or coefficient back-substitution is shown. | S2 |
| Rotating Calipers | D | D | No concrete convex polygon, i/j pair, area comparison, or monotonic pointer motion is visible in the execution trace. | S2 |
| FFT | D | D | Mentions split/butterfly/inverse, but no coefficients, roots of unity, butterfly values, or stage-by-stage transform values are executed. | S2 |

### Monotonic Stack

There is useful algorithm-specific state:

```text
stack = [2,1]
incoming = 5
decision = pop 1
```

and later:

```text
stack = [2]
decision = pop 2
```

This is valuable and should be preserved.

However the trace then jumps to:

```text
stack = [5,3]
incoming = 4
```

without showing the push of 5, subsequent input consumption, or how 3 entered the stack.

The lesson is therefore not fake from scratch, but it is not one continuous execution. It belongs in S1: reconstruct a coherent input sequence around the existing semantic snapshots.

### Topological Sort

The raw state correctly contains:

```text
indegree: A=0,B=1,C=1,D=1,E=2,F=2
queue: [A]
```

and then:

```text
order: [A]
queue: [B,C]
newZero: [B,C]
```

The missing teaching content is the most important part:

```text
pop A
A→B: indegree[B] 1→0 → push B
A→C: indegree[C] 1→0 → push C
```

Instead, several frames merely advance through source lines.

This is another S1 case: the necessary data model is already known, but the execution timeline is missing.

### LCA Binary Lifting

The trace has meaningful query state:

```text
u=F(depth3)
v=C(depth1)
jump 2^1: F→B
```

then:

```text
u=B
v=C
parent=A
LCA=A
```

That is enough to recover a good animation.

What is missing:

- the relevant binary-lifting table entries;
- why the selected power of two is legal;
- the descending-k scan;
- the simultaneous upward movement before returning parent.

The existing tree/path renderer is probably sufficient. This is S1, not a full renderer rewrite.

### Lazy Segment Tree

The lesson has correct high-level state:

```text
update [2,6] += 3
covered nodes [3,4], [5,6]
pending tags ...
```

But 20 final frames are spread across only three real semantic snapshots.

The student does not actually see:

```text
full cover
→ apply tag to node
→ update node sum
→ stop descending
→ later query reaches parent
→ push tag to children
→ clear parent tag
```

Because the existing Segment Tree renderer already has a strong node/interval model, this should be an S1 extension of that model.

### LIS

The lesson knows the right invariant and has examples such as:

```text
incoming 4
replace 5→4
tails [2,4]
```

But the next major state becomes `tails=[1,3,7]` without executing the intermediate input values.

A good LIS lesson should choose one array and animate every `lower_bound`, replace, or append operation on the same tails array.

This is S1.

### Aho–Corasick

The current trace never materializes the automaton.

A student needs to see at least:

- the trie for a small pattern set;
- fail links;
- BFS construction order;
- current text character;
- current automaton node;
- fallback via fail;
- output/report nodes.

The current “Trie + failure links → fallback transition → multiple patterns reported” is a conceptual outline, not an animation.

This is S2: the visual model can remain a string automaton, but the lesson needs concrete execution data.

### Min-Cost Max-Flow

The current flow lesson lacks every numeric object needed to understand the algorithm:

- residual capacity;
- edge cost;
- reverse edge cost;
- shortest-path distance;
- chosen augmenting path;
- bottleneck;
- path cost;
- cumulative flow;
- cumulative total cost.

Because the existing flow scene will need richer edge labels/state than a simple generic network, this is classified S3.

### Extended Euclid

The important learning event is back-substitution.

A useful execution could use a concrete pair such as:

```text
exgcd(30,18)
→ exgcd(18,12)
→ exgcd(12,6)
→ exgcd(6,0)

6 = 6·1 + 0·0
6 = 12·? + 6·?
...
30x + 18y = 6
```

The current trace only names “Bézout identity” and “back substitute coefficients”.

This is S2.

### Rotating Calipers

The required picture is geometric, not textual:

- an actual convex polygon;
- current edge `(i,i+1)`;
- current antipodal point `j`;
- area comparison for `j` vs `j+1`;
- movement of `j`;
- current best distance.

The current trace contains none of those concrete values, so it is S2.

### FFT

A butterfly is only understandable when values move.

A good small example should show, for example, an n=4 or n=8 transform:

```text
coefficients
→ even / odd split
→ smaller DFT results
→ omega^k
→ E + omega^k O
→ E - omega^k O
```

The current frames walk through the C++ statements while the semantic state remains “butterfly combine”.

This is S2.

---

## Updated Stage 2 pattern

After 22 manually reviewed lessons, two broad failure families are now clear.

### Family A — useful raw semantic data, bad timeline

Examples:

- Fenwick Tree
- Tarjan SCC
- Monotonic Stack
- Topological Sort
- LCA
- Lazy Segment Tree
- LIS

These lessons often already contain the important algorithm-specific nouns and one or more meaningful snapshots.

Their main problem is that `expandGuidedFrames()` stretches those snapshots across code lines.

**Recommended treatment: S1.** Preserve the algorithm-specific raw material and reconstruct a continuous event timeline.

### Family B — concept labels without executable state

Examples:

- Prefix XOR
- KMP
- 0/1 Knapsack
- Digit DP
- Dinic
- Meet in the Middle
- Aho–Corasick
- Min-Cost Max-Flow
- Extended Euclid
- Rotating Calipers
- FFT

These lessons do not currently contain enough concrete per-step data to recover an animation merely by changing the timeline.

**Recommended treatment: S2/S3.** Add real examples, state values, and algorithm events; add richer renderer/state support where the domain requires it.

This distinction is important because it prevents wasting time rewriting lessons that already contain salvageable semantic material.


---

## Calibration batch 3 — common algorithm families and advanced structures

| Lesson | Animation | Code Sync | Main finding | Repair class |
|---|:---:|:---:|---|:---:|
| Linear Search | A | A | One continuous input, one moving index, concrete comparisons, and direct return. | S0 |
| Sliding Window | A | B | Concrete l/r/sum/answer evolution; a few mutations still map to loop headers. | S0 |
| DSU | C | C | Useful parent/find/merge snapshots, but path compression and union are not executed continuously. | S1 |
| Floyd–Warshall | C | C | One concrete B→E via C relaxation exists; the matrix does not evolve across k. | S1 |
| Heavy-Light Decomposition | C | C | Heavy/light edges and path segments are meaningful, but chain jumps are only snapshots. | S1 |
| Persistent Segment Tree | C | C | Version roots and copied path are useful; copied nodes/shared subtrees are not animated step by step. | S1 |
| Sparse Table | C | C | Real input, one build cell, and one RMQ block decomposition exist; table construction is not continuous. | S1 |
| Bitmask DP | C | C | Real mask and one transition exist; dp values and mask-DAG progression are not executed. | S1 |
| Suffix Array | D | D | Only abstract rank phases; no string, suffixes, rank pairs, sorted order, or rank updates. | S2 |
| Manacher | D | D | Only conceptual phases; no concrete string, mirror, radius, center, or [l,r] progression. | S2 |
| Kuhn Matching | D | D | No actual bipartite graph or alternating-path flip. | S3 |
| Miller–Rabin | D | D | No concrete n, d, s, base, modular power, or squaring chain. | S2 |
| Chinese Remainder Theorem | D | D | No concrete congruences, gcd compatibility arithmetic, or final residue construction. | S2 |
| Sweep Line | D | D | No concrete events, active intervals, covered length, strip width, or accumulated answer. | S3 |
| NTT | D | D | No modular coefficient values, root powers, or butterfly arithmetic. | S2 |

### What batch 3 changes in the diagnosis

Stage 2 has now manually reviewed **37 lessons**.

The strongest pattern is no longer just “authored vs generated”. There are now three practical content states:

1. **Continuous execution already exists**  
   Examples: Linear Search, Sliding Window, Binary Search, BFS, Dijkstra, Segment Tree.  
   Work is mainly synchronization and cleanup.

2. **Correct algorithm-specific snapshots exist, but they are not a timeline**  
   Examples: DSU, Fenwick, Tarjan SCC, LCA, HLD, Sparse Table, Persistent Segment Tree, LIS.  
   These should preserve their raw semantic material and be rebuilt as continuous events.

3. **Only algorithm concepts are present, not executable state**  
   Examples: KMP, Digit DP, Dinic, Aho–Corasick, Suffix Array, Manacher, Miller–Rabin, CRT, FFT/NTT.  
   These need concrete examples and per-step values before the animation can become useful.

A fourth special case is emerging:

4. **The domain needs richer dedicated visuals**  
   Examples: Dinic / Min-Cost Max-Flow / Kuhn Matching / Sweep Line.  
   Merely adding more state fields to a generic graph or geometry scene will not be enough if the scene cannot distinguish residual edges, matching states, event lines, or active interval structures.

This is the main Stage 2 planning split for the remaining lessons.
