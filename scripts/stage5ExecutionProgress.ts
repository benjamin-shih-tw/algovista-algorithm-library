import { mkdirSync, writeFileSync } from 'node:fs'
import { lessons } from '../src/algorithms'

const s1Ids = [
  'fenwick-tree','tarjan-scc','monotonic-stack','topological-sort','lca-binary-lifting',
  'lazy-segment-tree','longest-increasing-subsequence','dsu','floyd-warshall',
  'heavy-light-decomposition','persistent-segment-tree','sparse-table','bitmask-dp',
  'merge-sort','zero-one-bfs','bellman-ford','euler-circuit','tree-diameter',
  'centroid-decomposition','longest-common-subsequence','edit-distance','quickselect',
  'stack','parentheses-matching','queue','deque','binary-heap','monotonic-queue',
  'flood-fill','multi-source-bfs','dfs','bridges','articulation-points',
  'euler-tour-flattening','tree-centroid','sqrt-decomposition','coin-change','tsp-dp',
  'next-greater-element','tree-isomorphism','mo-algorithm','li-chao-tree',
  'connected-components','bipartite-coloring','cycle-detection',
] as const

const s2Ids = [
  'prefix-xor','kmp','knapsack-01','digit-dp','meet-in-the-middle','aho-corasick',
  'extended-euclid','rotating-calipers','fft','suffix-array','manacher','miller-rabin',
  'chinese-remainder-theorem','ntt','fenwick-tree-2d','tree-dp','divide-conquer-dp',
  'trie','euclidean-algorithm','modular-inverse','point-in-polygon','lagrange-interpolation',
  'kruskal','prim','small-to-large','treap','rerooting-dp','knuth-optimization',
  'rolling-hash','z-algorithm','lcp-array','prime-sieve','fast-exponentiation',
  'matrix-exponentiation','xor-linear-basis','nim','sprague-grundy','segment-intersection',
  'polygon-area','prefix-sum-2d','counting-sort','inversion-counting','parallel-binary-search',
  'interval-scheduling','interval-covering','interval-merging','job-scheduling','huffman-coding',
  'fractional-knapsack','largest-rectangle-histogram','sliding-window-maximum',
  'expression-evaluation','shunting-yard','functional-graph','dag-shortest-path',
  'negative-cycle-reconstruction','boruvka','kosaraju-scc','condensation-graph','bridge-tree',
  'two-sat','weighted-dsu','rollback-dsu','tree-center','tree-distance-queries','dsu-on-tree',
  'virtual-tree','prufer-code','kruskal-reconstruction-tree','stable-matching',
  'iterative-segment-tree','dynamic-segment-tree','merge-sort-tree','disjoint-sparse-table',
  'cartesian-tree','fibonacci-dp','unbounded-knapsack','subset-sum','grid-dp',
  'matrix-chain-multiplication','interval-dp','dag-dp','probability-dp','dp-reconstruction',
  'monotone-queue-optimization','aliens-optimization','rabin-karp','duval-lyndon',
  'minimum-string-rotation','linear-sieve','prime-factorization','euler-totient','pollard-rho',
  'baby-step-giant-step','dot-cross-product','line-intersection','point-line-distance',
  'polar-sort','circle-intersection','fast-walsh-hadamard-transform',
] as const

const rows=lessons.map((lesson)=>({
  id:lesson.id,
  categoryId:lesson.categoryId,
  traceMode:lesson.traceMode??'semantic',
  fidelity:lesson.fidelity??'semantic',
  frames:lesson.frames.length,
  visualModel:lesson.visualModel??'none',
}))

const execution=rows.filter((row)=>row.traceMode==='execution')
const semantic=rows.filter((row)=>row.traceMode!=='execution')
const s1Remaining=s1Ids.filter((id)=>rows.find((row)=>row.id===id)?.traceMode!=='execution')
const s2Remaining=s2Ids.filter((id)=>rows.find((row)=>row.id===id)?.traceMode!=='execution')

const summary={
  total:rows.length,
  execution:execution.length,
  semantic:semantic.length,
  executionPct:Math.round(execution.length/rows.length*1000)/10,
  s1Target:s1Ids.length,
  s1Execution:s1Ids.length-s1Remaining.length,
  s1Remaining,
  s2Target:s2Ids.length,
  s2Execution:s2Ids.length-s2Remaining.length,
  s2RemainingCount:s2Remaining.length,
  byCategory:Object.fromEntries([...new Set(rows.map((row)=>row.categoryId))].map((category)=>[
    category,
    {
      total:rows.filter((row)=>row.categoryId===category).length,
      execution:rows.filter((row)=>row.categoryId===category&&row.traceMode==='execution').length,
    },
  ])),
}

mkdirSync('.tmp',{recursive:true})
writeFileSync('.tmp/stage5-execution-progress.json',JSON.stringify({summary,rows},null,2))
console.log(JSON.stringify(summary,null,2))
console.log('SEMANTIC REMAINING')
for(const row of semantic) console.log(row.id)

if (s1Remaining.length) {
  console.error('Stage 5 S1 execution gate failed:', s1Remaining)
  process.exitCode = 1
}
