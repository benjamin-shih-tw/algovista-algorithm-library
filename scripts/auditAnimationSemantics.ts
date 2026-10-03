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
const edit = lesson('edit-distance')
const editCells = edit.frames.map((frame) => frame.executionView?.kind === 'matrix' ? frame.executionView.cells : undefined)
if (editCells.some((cells) => !cells || cells.length !== 3 || cells.some((row) => row.length !== 4)) ||
    editCells[0]?.[2][3] !== '—' || editCells[6]?.[2][3] !== '1' ||
    !edit.code.some((line) => line.includes('vector<vector<int>> dp(n + 1')) || !edit.code.some((line) => line.includes('return dp[n][m]'))) {
  errors.push('edit-distance: matrix writes or complete function differ from the narrated trace')
}
const grid = lesson('grid-dp')
const gridCells = grid.frames.map((frame) => frame.executionView?.kind === 'matrix' ? frame.executionView.cells : undefined)
if (gridCells.some((cells) => !cells || cells.length !== 3 || cells.some((row) => row.length !== 3)) ||
    gridCells[1]?.[0][2] !== '5' || gridCells[1]?.[1][0] !== '—' || gridCells[2]?.[1][0] !== '2' ||
    gridCells[4]?.[2][2] !== '7' || !grid.frames[1].title.includes('第 0 列') ||
    !grid.code.some((line) => line.includes('vector<vector<int>> dp(h,')) || !grid.code.some((line) => line.includes('return dp[h-1][w-1]'))) {
  errors.push('grid-dp: matrix state, row-major order, or code differs from the narrated trace')
}
const lcs = lesson('longest-common-subsequence')
const lcsCells = lcs.frames.map((frame) => frame.executionView?.kind === 'matrix' ? frame.executionView.cells : undefined)
if (lcsCells.some((cells) => !cells || cells.length !== 4 || cells.some((row) => row.length !== 4)) ||
    lcsCells[0]?.[3][3] !== '—' || lcsCells[7]?.[3][3] !== '2' || lcsCells[8]?.[3][3] !== '2' ||
    !lcs.code.some((line) => line.includes('vector<vector<int>> dp(n + 1')) || !lcs.code.some((line) => line.includes('return dp[n][m]'))) {
  errors.push('longest-common-subsequence: state table or code differs from the narrated trace')
}
const chain = lesson('matrix-chain-multiplication')
const chainCells = chain.frames.map((frame) => frame.executionView?.kind === 'matrix' ? frame.executionView.cells : undefined)
if (chainCells.some((cells) => !cells || cells.length !== 3 || cells.some((row) => row.length !== 4)) ||
    chainCells[0]?.[0][3] !== '—' || chainCells[1]?.[0][2] !== '1500' || chainCells[1]?.[1][3] !== '9000' ||
    chainCells[3]?.[0][3] !== '27000' || chainCells[4]?.[0][3] !== '4500' ||
    !chain.code.some((line) => line.includes('vector<vector<long long>> dp(n + 1')) || !chain.code.some((line) => line.includes('return dp[0][n]'))) {
  errors.push('matrix-chain-multiplication: interval costs or code differ from the narrated trace')
}
const fenwick2d = lesson('fenwick-tree-2d')
const fenwick2dCells = fenwick2d.frames.map((frame) => frame.executionView?.kind === 'matrix' ? frame.executionView.cells : undefined)
if (fenwick2dCells.some((cells) => !cells || cells.length !== 4 || cells.some((row) => row.length !== 4)) ||
    fenwick2dCells[1]?.[1][2] !== '5' || fenwick2dCells[1]?.[3][3] !== '0' ||
    fenwick2dCells[3]?.[3][3] !== '5' || fenwick2dCells[6]?.[1][2] !== '5' ||
    !fenwick2d.code.some((line) => line.includes('vector<vector<long long>> bit;')) ||
    !fenwick2d.code.some((line) => line.includes('long long prefix(int x,int y) const'))) {
  errors.push('fenwick-tree-2d: BIT updates, query snapshot, or code differ from the narrated trace')
}
const interval = lesson('interval-dp')
const intervalCells = interval.frames.map((frame) => frame.executionView?.kind === 'matrix' ? frame.executionView.cells : undefined)
if (intervalCells.some((cells) => !cells || cells.length !== 4 || cells.some((row) => row.length !== 4)) ||
    intervalCells[0]?.[0][3] !== '—' || intervalCells[1]?.[3][3] !== '9' ||
    intervalCells[2]?.[0][1] !== '3' || intervalCells[2]?.[1][2] !== '—' ||
    intervalCells[3]?.[1][2] !== '5' || intervalCells[3]?.[2][3] !== '7' ||
    intervalCells[4]?.[0][2] !== '-1' || intervalCells[4]?.[1][3] !== '4' || intervalCells[5]?.[0][3] !== '10' ||
    !interval.frames[5].codeLines.some((line) => interval.code[line - 1]?.includes('return dp[0][n-1]')) ||
    !interval.code.some((line) => line.includes('vector<vector<long long>> dp(n,'))) {
  errors.push('interval-dp: interval table, execution order, return highlight, or code differs from the narrated trace')
}
const parallel = lesson('parallel-binary-search')
const parallelRows = parallel.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (parallelRows.some((rows) => !rows || rows.length !== 3 || rows.some((row) => row.length !== 5)) ||
    parallelRows[1]?.[0].join(',') !== 'q0,3,0,4,2' ||
    parallelRows[2]?.[2].join(',') !== 'q2,10,3,4,2' ||
    parallelRows[4]?.[1].join(',') !== 'q1,6,2,2,1' ||
    parallelRows[5]?.[2].join(',') !== 'q2,10,4,4,3' ||
    parallelRows[6]?.[0].join(',') !== 'q0,3,1,1,0') {
  errors.push('parallel-binary-search: per-query bounds do not follow the narrated event sweeps')
}
const bitmask = lesson('bitmask-dp')
const bitmaskRows = bitmask.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (bitmaskRows.some((rows) => !rows || rows.length !== 8 || rows.some((row) => row.length !== 3)) ||
    bitmaskRows[0]?.[0][2] !== '0' || bitmaskRows[0]?.[7][2] !== '∞' ||
    bitmaskRows[2]?.[1][2] !== '4' || bitmaskRows[3]?.[2][2] !== '2' ||
    bitmaskRows[4]?.[3][2] !== '6' || bitmaskRows[4]?.[6][2] !== '3' ||
    bitmaskRows[5]?.[7][2] !== '7' || bitmaskRows[6]?.[7][2] !== '4' ||
    !bitmask.code.some((line) => line.includes('vector<long long> dp(1 << n, INF)')) ||
    !bitmask.frames[7].codeLines.some((line) => bitmask.code[line - 1]?.includes('return dp[(1<<n)-1]'))) {
  errors.push('bitmask-dp: subset DP snapshots, initialization, or return highlight differ from the trace')
}
const tsp = lesson('tsp-dp')
const tspRows = tsp.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
const weights = [[0,2,9,10],[2,0,12,4],[9,12,0,3],[10,4,3,0]]
const tours = [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
const optimum = Math.min(...tours.map(([a,b,c]) => weights[0][a] + weights[a][b] + weights[b][c] + weights[c][0]))
if (tspRows.some((rows) => !rows || rows.some((row) => row.length !== 4)) ||
    tspRows[0]?.[0].join(',') !== '0001,0,0,0' || tspRows[4]?.[4].join(',') !== '1011,3,0→1→3,6' ||
    tspRows[5]?.[5].join(',') !== '1111,2,0→1→3→2,9' ||
    tspRows[7]?.[6].join(',') !== 'tour,0,return 2→0,18' || optimum !== 18 ||
    !tsp.code.some((line) => line.includes('vector<vector<long long>> dp(1 << n')) ||
    !tsp.frames[7].codeLines.some((line) => tsp.code[line - 1]?.includes('return answer'))) {
  errors.push('tsp-dp: selected path costs, tour optimum, or complete code differ from the trace')
}
const scheduling = lesson('interval-scheduling')
const schedulingRows = scheduling.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (schedulingRows.some((rows) => !rows || rows.length !== 8 || rows.some((row) => row.length !== 3)) ||
    schedulingRows[0]?.[1].join(',') !== '3,5,待檢查' ||
    schedulingRows[2]?.[0][2] !== '接受' || schedulingRows[3]?.[2][2] !== '跳過' ||
    schedulingRows[4]?.[3][2] !== '接受' || schedulingRows[5]?.[6][2] !== '跳過' ||
    schedulingRows[6]?.[7][2] !== '接受' ||
    !scheduling.code.some((line) => line.includes('int maxNonOverlapping(')) ||
    !scheduling.code.some((line) => line.includes('return answer;'))) {
  errors.push('interval-scheduling: sorted intervals, greedy choices, or code differ from the narrated trace')
}
const jobs = lesson('job-scheduling')
const jobRows = jobs.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (jobRows.some((rows) => !rows || rows.length !== 4 || rows.some((row) => row.length !== 3)) ||
    jobRows[0]?.[0].join(',') !== '3,3,待處理' || jobRows[3]?.[2][2] !== '暫收' ||
    jobRows[4]?.[0][2] !== '移除' || jobRows[4]?.[2][2] !== '保留' ||
    jobRows[5]?.[3][2] !== '保留' ||
    !jobs.description.includes('最多件') || !jobs.code.some((line) => line.includes('return durations.size()'))) {
  errors.push('job-scheduling: deadline order, longest-job removal, objective, or code differ from the trace')
}
const covering = lesson('interval-covering')
const coveringRows = covering.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (coveringRows.some((rows) => !rows || rows.length !== 6 || rows.some((row) => row.length !== 3)) ||
    coveringRows[0]?.[0].join(',') !== '-1,3,待檢查' || coveringRows[2]?.[1][2] !== '最遠' ||
    coveringRows[3]?.[1][2] !== '選用' || coveringRows[4]?.[2][2] !== '最遠' ||
    coveringRows[5]?.[2][2] !== '選用' || coveringRows[6]?.[5][2] !== '最遠' ||
    coveringRows[7]?.[5][2] !== '選用' ||
    !covering.code.some((line) => line.includes('int minIntervalsToCover('))) {
  errors.push('interval-covering: candidate scans or selected reaches differ from the narrated trace')
}
const merging = lesson('interval-merging')
const mergingRows = merging.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (mergingRows.some((rows) => !rows || rows.length !== 5 || rows.some((row) => row.length !== 3)) ||
    mergingRows[1]?.[0][2] !== '新段' || mergingRows[2]?.[1][2] !== '合併' ||
    mergingRows[3]?.[2][2] !== '新段' || mergingRows[4]?.[3][2] !== '合併' ||
    mergingRows[5]?.[4][2] !== '新段' ||
    !merging.code.some((line) => line.includes('return out;'))) {
  errors.push('interval-merging: union components or return code differ from the narrated trace')
}
const counting = lesson('counting-sort')
const countRows = counting.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (countRows.some((rows) => !rows || rows.length !== 6 || rows.some((row) => row.length !== 3)) ||
    countRows[0]?.[2].join(',') !== '2,0,0' || countRows[1]?.[2].join(',') !== '2,2,0' ||
    countRows[2]?.[2].join(',') !== '2,3,0' || countRows[3]?.[1].join(',') !== '1,1,1' ||
    countRows[4]?.[2].join(',') !== '2,3,3' || countRows[5]?.[5].join(',') !== '5,1,1' ||
    !counting.frames[0].codeLine.includes('vector<int> count(K+1') ||
    !counting.code.some((line) => line.includes('vector<int> countingSort(')) ||
    !counting.code.some((line) => line.includes('return a;'))) {
  errors.push('counting-sort: bucket counts, emitted values, or complete code do not match the six-step example')
}
const middle = lesson('meet-in-the-middle')
const middleRows = middle.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (middleRows.some((rows) => !rows || rows.length !== 4 || rows.some((row) => row.length !== 4)) ||
    middleRows[1]?.[3][1] !== '8' || middleRows[2]?.[3][3] !== '13' ||
    middleRows[6]?.[2].join(',') !== '10,5,10,7' ||
    !middle.frames[6].codeLine.includes('binary_search')) {
  errors.push('meet-in-the-middle: four subset sums per half or binary-search match are not shown')
}
const fractional = lesson('fractional-knapsack')
const fractionalRows = fractional.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (fractionalRows.some((rows) => !rows || rows.length !== 3 || rows.some((row) => row.length !== 4)) ||
    fractionalRows[0]?.map((row) => row[2]).join(',') !== '6,5,4' ||
    fractionalRows[2]?.[0][3] !== '預計 10' || fractionalRows[3]?.[0][3] !== '10' ||
    fractionalRows[4]?.[1][3] !== '20' || fractionalRows[5]?.[2][3] !== '預計 20/30' ||
    fractionalRows[6]?.[2][3] !== '20/30' ||
    !fractional.code.some((line) => line.includes('double fractionalKnapsack(')) ||
    !fractional.frames[4].codeLine.includes('answer+=take*item.value') ||
    [3,4,6].some((step) => fractional.frames[step].state?.highlightCodeLines !== 'all' || !fractional.frames[step].codeLines.some((line) => fractional.code[line - 1]?.includes('capacity-=take;')))) {
  errors.push('fractional-knapsack: density, take/commit phases, or code highlights differ from the example')
}
const histogram = lesson('largest-rectangle-histogram')
const histogramRows = histogram.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (histogramRows.some((rows) => !rows || rows.length !== 6 || rows.map((row) => row[1]).join(',') !== '2,1,5,6,2,3') ||
    histogram.frames[5].executionView?.kind !== 'table' || !histogram.frames[5].executionView.badges?.includes('area = 6 × 1 = 6') ||
    histogram.frames[6].executionView?.kind !== 'table' || !histogram.frames[6].executionView.badges?.includes('area = 5 × 2 = 10') ||
    !histogram.code.some((line) => line.includes('int largestRectangleArea(')) ||
    histogram.code.some((line) => line.includes('競賽環境'))) {
  errors.push('largest-rectangle-histogram: six bar heights, pop areas, or complete code differ from the narrated example')
}
const windowMax = lesson('sliding-window-maximum')
const windowRows = windowMax.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (windowRows.some((rows) => !rows || rows.length !== 8 || rows.map((row) => row[1]).join(',') !== '1,3,-1,-3,5,3,6,7') ||
    windowMax.frames[2].executionView?.kind !== 'table' || !windowMax.frames[2].executionView.badges?.includes('output = [3]') ||
    windowMax.frames[3].executionView?.kind !== 'table' || !windowMax.frames[3].executionView.badges?.includes('window = [1,3]') ||
    windowMax.frames[6].executionView?.kind !== 'table' || !windowMax.frames[6].executionView.badges?.includes('output = [3,3,5]') ||
    windowMax.frames[7].executionView?.kind !== 'table' || !windowMax.frames[7].executionView.badges?.includes('output = [3,3,5,5,6,7]') ||
    !windowMax.code.some((line) => line.includes('vector<int> slidingWindowMaximum(')) ||
    windowMax.code.some((line) => line.includes('競賽環境'))) {
  errors.push('sliding-window-maximum: actual array, deque checkpoints, outputs, or complete code differ from the narrated example')
}
const evaluation = lesson('expression-evaluation')
const evaluationRows = evaluation.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (evaluationRows.some((rows) => !rows || rows.map((row) => row[1]).join(',') !== '3,+,4,*,2') ||
    evaluation.frames[5].executionView?.kind !== 'table' || !evaluation.frames[5].executionView.badges?.includes('values = [3,4,2]') ||
    evaluation.frames[7].executionView?.kind !== 'table' || !evaluation.frames[7].executionView.badges?.includes('values = [11]') ||
    !evaluation.code.some((line) => line.includes('long long evaluateExpression(')) || evaluation.code.some((line) => line.includes('競賽環境'))) {
  errors.push('expression-evaluation: tokens, value/operator stacks, result, or complete code differ from the example')
}
const shunting = lesson('shunting-yard')
const shuntingRows = shunting.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (shuntingRows.some((rows) => !rows || rows.map((row) => row[1]).join(',') !== '3,+,4,*,2') ||
    shunting.frames[5].executionView?.kind !== 'table' || !shunting.frames[5].executionView.badges?.includes('output = [3,4,2]') ||
    shunting.frames[6].executionView?.kind !== 'table' || !shunting.frames[6].executionView.badges?.includes('output = [3,4,2,*,+]') ||
    !shunting.code.some((line) => line.includes('vector<string> toPostfix(')) || shunting.code.some((line) => line.includes('競賽環境'))) {
  errors.push('shunting-yard: tokens, operator stack, postfix output, or complete code differ from the example')
}

if (errors.length) {
  for (const error of errors) console.error(error)
  process.exitCode = 1
} else {
  console.log('Animation semantics: segment tree, Dijkstra, BFS, Fenwick 1D/2D, 2D prefix, Floyd–Warshall, edit distance, grid DP, LCS, matrix chain, interval DP, parallel binary search, bitmask DP, TSP DP, interval scheduling/covering/merging, job scheduling, counting sort, meet-in-the-middle, fractional knapsack, histogram rectangle, window maximum, expression evaluation, shunting yard OK')
}
