import { lessons } from '../src/algorithms'
import { writeFileSync } from 'node:fs'

const out: string[] = []
const push = (s: string) => out.push(s)

// 1. Lessons whose frames carry graph-style active ids ('A','B'...) but visual is not graph, and vice versa
for (const l of lessons) {
  const frameActives = l.frames.map((f) => f.active ?? [])
  const usesLetters = frameActives.some((a) => a.some((x) => /^[A-Z]$/.test(x)))
  if (l.visual !== 'graph' && usesLetters && !['tree', 'geometry', 'segment-tree'].includes(l.visual)) {
    // expanded completion frames use Chinese text actives, authored dataDp use '0','1'
    const kinds = new Set(frameActives.flat().map((x) => /^[A-Z]$/.test(x) ? 'letter' : /^\d+$/.test(x) ? 'digit' : 'text'))
    if (kinds.has('letter') && kinds.size === 1) push(`${l.id}: visual=${l.visual} but frames use letter-node actives (graph template leftover)`)
  }
}

// 2. adaptive scene data coverage: does the visual model have a real scene, or fall back to generic engine?
const modelsWithAdaptive = new Set<string>([
  'interval-scheduling','interval-covering','interval-merging','job-timeline','prefix-2d','parallel-search','counting-buckets','meet-in-middle','fractional-choice',
  'heap-merge','histogram-stack','expression-stack','monotonic-stack','monotonic-queue',
  'grid-traversal','all-pairs-matrix','disjoint-sets','dynamic-connectivity','scc-clusters','functional-graph','dag-order','dag-dp','two-sat','lowlink','mst-growth','euler-trail',
  'tree-centroid','tree-decomposition','tree-path','tree-merging','tree-encoding','reconstruction-tree',
  'fenwick-2d','segment-tree-2d','dynamic-segment-tree','merge-sort-tree','segment-tree-beats','fenwick-tree','sparse-table','sqrt-blocks','line-container','balanced-bst','spatial-tree','dynamic-tree','wavelet','persistent-tree','persistent-dsu','lazy-tree','segment-tree',
  'dp-grid','dp-2d','dp-bitmask','dp-interval','dp-tree','dp-lines','dp-optimization','dp-digit',
  'string-automaton','suffix-tree','suffix-automaton','palindromic-tree','trie','suffix-order','palindrome',
  'assignment','stable-matching','general-matching',
])
// note: many AdaptiveScenes checks are lesson-id based for kmp, rolling-hash, rabin-karp, z-algorithm, pollard-rho, miller-rabin
const idsWithAdaptive = new Set(['kmp','rolling-hash','rabin-karp','z-algorithm','pollard-rho','miller-rabin'])
const genericOnly: string[] = []
for (const l of lessons) {
  const m = l.visualModel ?? ''
  if (m === 'segment-tree') continue
  const hasScene = modelsWithAdaptive.has(m) || idsWithAdaptive.has(l.id)
  if (!hasScene) genericOnly.push(`${l.id} (${m} → ${l.visual})`)
}
push(`--- ${genericOnly.length} lessons fall back to the GENERIC engine (no dedicated adaptive scene) ---`)
genericOnly.forEach(push)

// 3. CircleScene dead branch: AdaptiveScenes GeometryAdaptiveScene returns null for circle-geometry
const circleLessons = lessons.filter((l) => l.visualModel === 'circle-geometry')
push(`--- circle-geometry lessons (AdaptiveScenes returns null → falls to GeometryScene circle branch): ${circleLessons.map((l) => l.id).join(', ')}`)

// 4. Flow: FlowAdaptiveScene handles only 3 models; flow-network + bipartite-matching use generic FlowScene
const flowModels = new Set(lessons.filter((l) => l.visual === 'flow').map((l) => l.visualModel))
push(`--- flow visual models in catalog: ${[...flowModels].join(', ')} (FlowAdaptiveScene only handles assignment/stable-matching/general-matching)`)

// 5. Math: MathAdaptiveScene has no branch for matrix-power / matrix-algebra / xor-basis etc? check
const mathModels = new Set(lessons.filter((l) => l.visual === 'math').map((l) => l.visualModel))
push(`--- math visual models: ${[...mathModels].join(', ')} (MathAdaptiveScene branches: euclid, sieve, primality, factorization, exponentiation, xor-basis, impartial-game, congruence, discrete-log)`)

// 6. Geometry models vs branches
const geoModels = new Set(lessons.filter((l) => l.visual === 'geometry').map((l) => l.visualModel))
push(`--- geometry visual models: ${[...geoModels].join(', ')} (GeometryAdaptiveScene branches: polygon, minkowski-sum, circle-geometry(null), polar-sort, spatial-partition)`)

// 7. String models vs branches
const strModels = new Set(lessons.filter((l) => l.visual === 'string').map((l) => l.visualModel))
push(`--- string visual models: ${[...strModels].join(', ')}`)

// 8. Linear models
const linModels = new Set(lessons.filter((l) => l.visual === 'linear').map((l) => l.visualModel))
push(`--- linear visual models: ${[...linModels].join(', ')} (LinearAdaptiveScene branches: heap-merge, histogram-stack, expression-stack, monotonic-stack, monotonic-queue)`)

// 9. Tree models
const treeModels = new Set(lessons.filter((l) => l.visual === 'tree').map((l) => l.visualModel))
push(`--- tree visual models: ${[...treeModels].join(', ')} (TreeAdaptiveScene branches: tree-centroid, tree-decomposition, tree-path, tree-merging, tree-encoding, reconstruction-tree)`)

// 10. array models
const arrModels = new Set(lessons.filter((l) => l.visual === 'array').map((l) => l.visualModel))
push(`--- array visual models: ${[...arrModels].join(', ')} (ArrayAdaptiveScene branches: interval-*, prefix-2d, parallel-search, counting-buckets, meet-in-middle, fractional-choice)`)

writeFileSync('.tmp/frameCueCheck.txt', out.join('\n'))
console.log(out.join('\n'))
