import { mkdirSync, writeFileSync } from 'node:fs'
import { lessons, type Frame } from '../src/algorithms'

const targets = [
  'binary-search',
  'bfs',
  'dijkstra',
  'segment-tree',
  'prefix-xor',
  'fenwick-tree',
  'kmp',
  'knapsack-01',
  'tarjan-scc',
  'digit-dp',
  'dinic',
  'meet-in-the-middle',
  'monotonic-stack',
  'topological-sort',
  'lca-binary-lifting',
  'lazy-segment-tree',
  'longest-increasing-subsequence',
  'aho-corasick',
  'min-cost-max-flow',
  'extended-euclid',
  'rotating-calipers',
  'fft',
  'linear-search',
  'sliding-window',
  'dsu',
  'floyd-warshall',
  'heavy-light-decomposition',
  'persistent-segment-tree',
  'sparse-table',
  'bitmask-dp',
  'suffix-array',
  'manacher',
  'kuhn-matching',
  'miller-rabin',
  'chinese-remainder-theorem',
  'sweep-line',
  'ntt',
  'prefix-sum',
  'two-pointers',
  'merge-sort',
  'zero-one-bfs',
  'bellman-ford',
  'euler-circuit',
  'tree-diameter',
  'centroid-decomposition',
  'fenwick-tree-2d',
  'segment-tree-beats',
  'longest-common-subsequence',
  'edit-distance',
  'tree-dp',
  'divide-conquer-dp',
  'trie',
  'suffix-automaton',
  'palindromic-tree',
  'minimum-cut',
  'euclidean-algorithm',
  'modular-inverse',
  'point-in-polygon',
  'closest-pair',
  'lagrange-interpolation',
  'berlekamp-massey',
  'difference-array',
  'coordinate-compression',
  'kadane',
  'selection-sort',
  'bubble-sort',
  'quick-sort',
  'quickselect',
  'stack',
  'parentheses-matching',
  'queue',
  'deque',
  'binary-heap',
  'monotonic-queue',
  'flood-fill',
  'multi-source-bfs',
  'dfs',
  'kruskal',
  'prim',
  'bridges',
  'articulation-points',
  'euler-tour-flattening',
  'tree-centroid',
  'small-to-large',
  'sqrt-decomposition',
  'treap',
  'coin-change',
  'tsp-dp',
  'rerooting-dp',
  'knuth-optimization',
  'rolling-hash',
]

const hiddenStateKeys = new Set([
  'algorithm', 'goal', 'before', 'condition', 'operation', 'after',
  'rationale', 'invariant', 'timelineStep', 'phase', 'microStep', 'microPhase',
])

const compactState = (frame: Frame) => Object.fromEntries(
  Object.entries(frame.state ?? {}).filter(([key]) => !hiddenStateKeys.has(key)),
)

const snap = (frame: Frame) => JSON.stringify({
  values: frame.values,
  low: frame.low,
  high: frame.high,
  mid: frame.mid,
  active: frame.active,
  accepted: frame.accepted,
  muted: frame.muted,
  queue: frame.queue,
  priorityQueue: frame.priorityQueue,
  distances: frame.distances,
  hull: frame.hull,
  segmentStep: frame.segmentStep,
  state: compactState(frame),
})

const result = targets.map((id) => {
  const lesson = lessons.find((candidate) => candidate.id === id)
  if (!lesson) throw new Error(`Missing lesson ${id}`)
  return {
    id,
    title: lesson.title,
    zhTitle: lesson.zhTitle,
    categoryId: lesson.categoryId,
    visual: lesson.visual,
    visualModel: lesson.visualModel,
    frameCount: lesson.frames.length,
    codeLines: lesson.code.length,
    frames: lesson.frames.map((frame, index) => ({
      step: index + 1,
      title: frame.title,
      explanation: frame.explanation,
      codeLine: frame.codeLine,
      codeLines: frame.codeLines,
      state: compactState(frame),
      active: frame.active,
      accepted: frame.accepted,
      muted: frame.muted,
      queue: frame.queue,
      priorityQueue: frame.priorityQueue,
      distances: frame.distances,
      changedFromPrevious: index === 0 ? true : snap(frame) !== snap(lesson.frames[index - 1]),
    })),
  }
})

mkdirSync('.tmp', { recursive: true })
writeFileSync('.tmp/stage2-semantic-probe.json', JSON.stringify(result, null, 2))

for (const lesson of result) {
  console.log(`=== STAGE2 ${lesson.id} | ${lesson.visualModel} | ${lesson.frameCount} frames ===`)
  for (const frame of lesson.frames) {
    console.log(JSON.stringify({
      step: frame.step,
      title: frame.title,
      changed: frame.changedFromPrevious,
      code: frame.codeLine,
      state: frame.state,
      active: frame.active,
      queue: frame.queue,
      pq: frame.priorityQueue,
    }))
  }
}
console.log('Detailed file: .tmp/stage2-semantic-probe.json')
