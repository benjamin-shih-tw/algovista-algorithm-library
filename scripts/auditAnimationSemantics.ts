import { lessons } from '../src/algorithms'

const errors: string[] = []
const lesson = (id: string) => {
  const found = lessons.find((item) => item.id === id)
  if (!found) throw new Error(`missing lesson: ${id}`)
  return found
}
const segment = lesson('segment-tree')
const snapshot = (id: string) => segment.frames.find((frame) => frame.segmentStep?.id === id)?.segmentNodeValues
const expectSum = (step: string, node: string, expected: number | undefined) => {
  const actual = snapshot(step)?.[node]
  if (actual !== expected) errors.push(`segment-tree ${step} ${node}: expected ${expected ?? 'unwritten'}, got ${actual ?? 'unwritten'}`)
}

for (const step of ['build-structure', 'build-init', 'build-split']) expectSum(step, '0-7', undefined)
expectSum('build-leaves', '0-0', 2)
expectSum('build-leaves', '0-7', undefined)
expectSum('build-pull', '0-1', 7)
expectSum('build-pull', '0-7', undefined)
expectSum('build-complete', '0-7', 37)
for (const [step, leaf, parent, root] of [
  ['update-descend', 9, 12, 37],
  ['update-leaf', 10, 12, 37],
  ['update-pull-1', 10, 13, 37],
  ['update-pull-root', 10, 13, 38],
] as const) {
  expectSum(step, '4-4', leaf)
  expectSum(step, '4-5', parent)
  expectSum(step, '0-7', root)
}

const dijkstra = lesson('dijkstra')
const init = dijkstra.frames.find((frame) => frame.title === '把所有距離設為無限大')
if (init?.codeLine !== 'dist.assign(graph.size(), INF);' || !init.codeLines.some((line) => dijkstra.code[line - 1]?.trim() === init.codeLine)) {
  errors.push('dijkstra initialization does not highlight the distance initialization line')
}
const bfs = lesson('bfs')
if (!bfs.code.some((line) => line.includes('vector<int> dist(n, -1)')) || !bfs.code.some((line) => line.includes('if (dist[v] != -1)'))) {
  errors.push('bfs code does not use the initialized distance array to guard first discovery')
}
const fenwick = lesson('fenwick-tree')
const expectedBitValues = [0, 0, 5, 5, 0, 0, 0, 5]
for (const frame of fenwick.frames.slice(3)) {
  if (JSON.stringify(frame.values) !== JSON.stringify(expectedBitValues)) errors.push(`fenwick-tree ${frame.title}: BIT snapshot is not preserved through the query`)
}
for (const [index, expected] of [[1, 3], [2, 4], [3, 8], [5, 6], [6, 4]] as const) {
  if (fenwick.frames[index].state?.i !== expected) errors.push(`fenwick-tree frame ${index + 1}: highlighted index differs from the narrated operation`)
}
const prefix2d = lesson('prefix-sum-2d')
const prefixViews = prefix2d.frames.map((frame) => frame.executionView)
if (prefixViews.some((view) => view?.kind !== 'matrix' || view.cells.length !== 4 || view.cells.some((row) => row.length !== 4))) {
  errors.push('prefix-sum-2d: a frame is not backed by the actual 4×4 prefix matrix')
} else {
  const final = prefixViews[5]!
  if (final.kind === 'matrix') {
    if (final.cells[3][3] !== '45' || final.cells[1][3] !== '6' || final.cells[3][1] !== '12' || final.cells[1][1] !== '1') {
      errors.push('prefix-sum-2d: rectangle query corners differ from its 45-6-12+1 explanation')
    }
    if (final.activeCells?.length !== 4 || Number(final.cells[3][3]) - Number(final.cells[1][3]) - Number(final.cells[3][1]) + Number(final.cells[1][1]) !== prefix2d.frames[5].state?.result) {
      errors.push('prefix-sum-2d: highlighted corners do not produce the stated answer')
    }
  }
}
if (!prefix2d.code.some((line) => line.includes('vector<vector<long long>> pref(')) || !prefix2d.code.some((line) => line.includes('return pref;'))) {
  errors.push('prefix-sum-2d: code omits the prefix matrix definition or return value')
}
const floyd = lesson('floyd-warshall')
const floydCells = floyd.frames.map((frame) => frame.executionView?.kind === 'matrix' ? frame.executionView.cells : undefined)
if (floydCells.some((cells) => !cells || cells.length !== 4 || cells.some((row) => row.length !== 4))) {
  errors.push('floyd-warshall: a step does not show the actual four-node distance matrix')
} else if (floydCells[3]![0][3] !== '6' || floydCells[3]![1][3] !== '8' || floydCells[4]![1][3] !== '3' || floyd.frames[3].state?.pair !== 'A→D' || floyd.frames[4].state?.pair !== 'B→D') {
  errors.push('floyd-warshall: k=C transitions do not follow the displayed k/i/j loop order')
}

if (errors.length) {
  for (const error of errors) console.error(error)
  process.exitCode = 1
} else {
  console.log('Animation semantics: segment tree, Dijkstra, BFS, Fenwick, 2D prefix, Floyd–Warshall OK')
}
