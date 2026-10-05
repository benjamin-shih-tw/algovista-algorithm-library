import { lessons } from '../src/algorithms'

const errors: string[] = []
const lesson = (id: string) => {
  const found = lessons.find((item) => item.id === id)
  if (!found) throw new Error(`missing lesson: ${id}`)
  return found
}
const segment = lesson('segment-tree')
for (const id of ['expression-evaluation', 'shunting-yard']) {
  const parser = lesson(id)
  const push = parser.frames.find((frame) => frame.state?.operation === 'push left paren')!
  const pushLine = push.codeLines.find((line) => parser.code[line - 1]?.trim() === push.codeLine)!
  if (push.codeLine !== 'ops.push_back(t);' || !parser.code.slice(Math.max(0, pushLine - 3), pushLine - 1).some((line) => line.includes('if(t=="(")'))) {
    errors.push(`${id}: left parenthesis push highlights the operator branch instead of the parenthesis branch`)
  }
  const pop = parser.frames.find((frame) => frame.state?.operation === 'discard left paren')!
  const popLine = pop.codeLines.find((line) => parser.code[line - 1]?.trim() === pop.codeLine)!
  if (pop.codeLine !== 'ops.pop_back();' || parser.code[popLine]?.trim() !== 'continue;') {
    errors.push(`${id}: discard-parenthesis highlight does not belong to the closing-parenthesis branch`)
  }
}
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
if (
  fenwick.frames.length !== 13 ||
  fenwick.frames.at(-1)?.state?.result !== 5 ||
  JSON.stringify(fenwick.frames.at(-1)?.values) !== JSON.stringify(expectedBitValues) ||
  !fenwick.frames[1].codeLines.some((line)=>fenwick.code[line-1]?.trim()==='bit[i] += delta;') ||
  !fenwick.frames[2].codeLines.some((line)=>fenwick.code[line-1]?.trim()==='i += i & -i;') ||
  !fenwick.frames[8].codeLines.some((line)=>fenwick.code[line-1]?.trim()==='s += bit[i];') ||
  !fenwick.frames[9].codeLines.some((line)=>fenwick.code[line-1]?.trim()==='i -= i & -i;') ||
  !fenwick.code.some((line)=>line.includes('struct Fenwick'))
) {
  errors.push('fenwick-tree: update/query mutations, index moves, snapshots, or return value disagree')
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
const hasBadge = (frame: typeof evaluation.frames[number], expected: string) => frame.executionView?.badges?.some((badge) => badge.replaceAll(' ', '') === expected.replaceAll(' ', ''))
const evaluationRows = evaluation.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (
  evaluation.frames.length !== 15 ||
  evaluationRows.some((rows) => !rows || rows.map((row) => row[1]).join(',') !== '3,+,4,*,(,2,-,1,)') ||
  evaluation.frames[9].executionView?.kind !== 'table' || !hasBadge(evaluation.frames[9], 'values = [3,4,1]') ||
  evaluation.frames[13].executionView?.kind !== 'table' || !hasBadge(evaluation.frames[13], 'values = [7]') ||
  evaluation.frames.at(-1)?.state?.result !== 7 ||
  !evaluation.code.some((line) => line.includes('long long evaluateExpression(')) ||
  !evaluation.frames[9].codeLines.some((line)=>evaluation.code[line-1]?.trim()==='values.push_back(r);')
) {
  errors.push('expression-evaluation: parenthesis barrier, operator/value stacks, reductions, or result differ from the 3+4*(2-1) execution')
}
const shunting = lesson('shunting-yard')
const shuntingRows = shunting.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (
  shunting.frames.length !== 14 ||
  shuntingRows.some((rows) => !rows || rows.map((row) => row[1]).join(',') !== '3,+,4,*,(,2,-,1,)') ||
  shunting.frames[9].executionView?.kind !== 'table' || !hasBadge(shunting.frames[9], 'output = [3,4,2,1,-]') ||
  shunting.frames[12].executionView?.kind !== 'table' || !hasBadge(shunting.frames[12], 'output = [3,4,2,1,-,*,+]') ||
  shunting.frames.at(-1)?.state?.result !== '3 4 2 1 - * +' ||
  !shunting.code.some((line) => line.includes('vector<string> toPostfix(')) ||
  !shunting.frames[9].codeLines.some((line)=>shunting.code[line-1]?.trim()==='output.push_back(ops.back());')
) {
  errors.push('shunting-yard: parentheses, operator stack, postfix output, or code ownership disagree')
}
const monotonicStack = lesson('monotonic-stack')
const monotonicStackRows = monotonicStack.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (monotonicStackRows.some((rows) => !rows || rows.length !== 6 || rows.map((row) => row[1]).join(',') !== '2,1,5,3,4,7') ||
    monotonicStack.frames[3].executionView?.kind !== 'table' || !monotonicStack.frames[3].executionView.badges?.includes('stack = []') ||
    monotonicStack.frames[4].executionView?.kind !== 'table' || !monotonicStack.frames[4].executionView.badges?.includes('stack = [5]') ||
    monotonicStack.frames[9].executionView?.kind !== 'table' || !monotonicStack.frames[9].executionView.badges?.includes('stack = [7]') ||
    !monotonicStack.code.some((line) => line.includes('stack<int> decreasingCandidates(')) || monotonicStack.code.some((line) => line.includes('競賽環境')) ||
    !monotonicStack.description.includes('不計算題目答案') || !monotonicStack.frames[9].explanation.includes('不是題目答案') ||
    monotonicStack.practice?.[0]?.url !== 'https://leetcode.com/problems/next-greater-element-i/') {
  errors.push('monotonic-stack: displayed input or pop/push stack snapshots differ from the six-value example')
}
const nextGreater = lesson('next-greater-element')
const nextGreaterRows = nextGreater.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (nextGreaterRows.some((rows) => !rows || rows.length !== 5 || rows.map((row) => row[1]).join(',') !== '2,1,5,3,4') ||
    nextGreaterRows[0]?.map((row) => row[2]).join(',') !== '-1,-1,-1,-1,-1' ||
    nextGreaterRows[2]?.[1][2] !== '5' || nextGreaterRows[4]?.[0][2] !== '5' ||
    nextGreaterRows[7]?.[3][2] !== '4' || nextGreaterRows[8]?.map((row) => row[2]).join(',') !== '5,5,-1,4,-1' ||
    !nextGreater.code.some((line) => line.includes('vector<int> answer(n,-1)')) || nextGreater.code.some((line) => line.includes('競賽環境')) ||
    nextGreater.practice?.[0]?.url !== 'https://leetcode.com/problems/next-greater-element-i/') {
  errors.push('next-greater-element: input, resolved answers, or final NGE array differ from the narrated trace')
}
const monotonicQueue = lesson('monotonic-queue')
const monotonicQueueRows = monotonicQueue.frames.map((frame) => frame.executionView?.kind === 'table' ? frame.executionView.rows : undefined)
if (monotonicQueueRows.some((rows) => !rows || rows.length !== 8 || rows.map((row) => row[1]).join(',') !== '1,3,-1,-3,5,3,6,7') ||
    monotonicQueue.frames.length !== 15 ||
    monotonicQueue.frames[6].executionView?.kind !== 'table' || !monotonicQueue.frames[6].executionView.badges?.includes('output = [3,3]') ||
    monotonicQueue.frames[9].executionView?.kind !== 'table' || !monotonicQueue.frames[9].executionView.badges?.includes('output = [3,3,5]') ||
    monotonicQueue.frames[10].executionView?.kind !== 'table' || !monotonicQueue.frames[10].executionView.badges?.includes('output = [3,3,5,5]') ||
    monotonicQueue.frames[12].executionView?.kind !== 'table' || !monotonicQueue.frames[12].executionView.badges?.includes('output = [3,3,5,5,6]') ||
    monotonicQueue.frames[14].executionView?.kind !== 'table' || !monotonicQueue.frames[14].executionView.badges?.includes('output = [3,3,5,5,6,7]') ||
    [9,10,12,14].some((step) => monotonicQueue.frames[step].state?.highlightCodeLines !== 'all' || !monotonicQueue.frames[step].codeLines.some((line) => monotonicQueue.code[line - 1]?.includes('answer.push_back'))) ||
    !monotonicQueue.code.some((line) => line.includes('vector<int> monotonicWindowMaximum(')) || monotonicQueue.code.some((line) => line.includes('競賽環境')) ||
    monotonicQueue.practice?.[0]?.url !== 'https://leetcode.com/problems/sliding-window-maximum/' ||
    windowMax.practice?.[0]?.url !== 'https://leetcode.com/problems/sliding-window-maximum/') {
  errors.push('monotonic-queue: input, missing second window, deque, or emitted maxima differ from the example')
}
const huffman = lesson('huffman-coding')
const huffmanHeaps = [
  '5,9,12,13,16,45', '12,13,14,16,45', '14,16,25,45',
  '25,30,45', '45,55', '100',
]
if (huffman.frames.length !== 6 || huffman.frames.some((frame, step) =>
    frame.executionView?.kind !== 'table' ||
    frame.executionView.rows.map((row) => row[1]).join(',') !== huffmanHeaps[step] ||
    frame.executionView.badges?.includes(`cost = ${[0,14,39,69,124,224][step]}`) !== true) ||
    !huffman.code.some((line) => line.includes('long long huffmanMergeCost(')) ||
    !huffman.code.some((line) => line.includes('return cost;')) ||
    huffman.code.some((line) => line.includes('競賽環境')) ||
    !huffman.description.includes('本動畫只計算') ||
    huffman.knowledge?.localPrerequisites.map((item) => item.term).join(',') !== '最小堆,加權路徑長' ||
    !huffman.usage?.[0]?.includes('合併成本') ||
    huffman.frames.slice(1).some((frame) => frame.state?.highlightCodeLines !== 'all' ||
      !frame.codeLines.some((line) => huffman.code[line - 1]?.includes('pq.push(a+b)')))) {
  errors.push('huffman-coding: visible heap, accumulated merge cost, code, or lesson scope differs from the six-frequency example')
}
const inversions = lesson('inversion-counting')
const inversionBuffers = ['', '', '1', '1,2', '1,2,3', '1,2,3,4,5', '1,2,3,4,5']
if (inversions.frames.length !== 7 || inversions.frames.some((frame, step) =>
    frame.executionView?.kind !== 'table' ||
    frame.executionView.rows[2]?.[1] !== (inversionBuffers[step] ? `[${inversionBuffers[step]}]` : '∅') ||
    frame.executionView.rows[3]?.[1] !== String([0,0,2,2,3,3,3][step])) ||
    !inversions.code.some((line) => line.includes('long long countInversions(')) ||
    inversions.knowledge?.localPrerequisites.map((item) => item.term).join(',') !== '半開區間,合併緩衝區' ||
    !inversions.usage?.[0]?.includes('逆序對')) {
  errors.push('inversion-counting: merge buffer and inversion total are missing or inconsistent across seven frames')
}
const functional = lesson('functional-graph')
const functionalStates = [
  '0,0,0,0,0,0',
  '1,1,1,0,0,0',
  '1,1,1,0,0,0',
  '1,1,1,0,0,0',
  '1,1,1,0,0,0',
  '-1,-1,-1,0,0,0',
  '-1,-1,-1,0,0,0',
  '-1,-1,-1,4,0,0',
  '-1,-1,-1,-1,0,0',
  '-1,-1,-1,-1,0,0',
  '-1,-1,-1,-1,5,5',
  '-1,-1,-1,-1,5,5',
  '-1,-1,-1,-1,5,5',
  '-1,-1,-1,-1,5,5',
  '-1,-1,-1,-1,-1,-1',
  '-1,-1,-1,-1,-1,-1',
]
const functionalViewMismatch = functional.frames.some((frame, step) =>
    frame.executionView?.kind !== 'table' ||
    frame.executionView.rows.map((row) => row[2]).join(',') !== functionalStates[step] ||
    frame.executionView.rows.map((row) => row[1]).join(',') !== 'B,C,B,C,F,F')
if (functional.frames.length !== 16 || functionalViewMismatch ||
    functional.frames[3].executionView?.badges?.includes('cycle = B→C→B') !== true ||
    functional.frames.at(-1)?.executionView?.badges?.includes('cycles = [B,C], [F]') !== true ||
    !functional.code.some((line) => line.includes('findFunctionalCycles(')) ||
    !functional.code.some((line) => line.trim() === 'state[u]=s+1;') ||
    !functional.code.some((line) => line.trim() === 'u=next[u];') ||
    !functional.code.some((line) => line.trim() === 'state[u]=-1;') ||
    functional.code.some((line) => line.includes('recordCycle(') || line.includes('競賽環境')) ||
    !functional.description.includes('不計算跳躍查詢') ||
    !functional.practice?.[0]?.note.includes('進階延伸') ||
    functional.knowledge?.localPrerequisites.map((item) => item.term).join(',') !== '唯一出邊,走訪標記') {
  errors.push('functional-graph: 16-step walk, visit marks, cycles, code, or scope disagree')
}

const graphTreeCases = [
  ['kruskal', 6, 'structure', 'cost = 13'],
  ['prim', 20, 'structure', 'cost = 13'],
  ['boruvka', 6, 'structure', 'cost = 13'],
  ['dag-shortest-path', 6, 'network', 'E = 4'],
  ['negative-cycle-reconstruction', 5, 'network', 'weight = -2'],
  ['kosaraju-scc', 6, 'network', '3 SCC'],
  ['condensation-graph', 5, 'network', '0 → 1 → 2'],
  ['bridge-tree', 5, 'structure', 'ABC — DEF'],
  ['tree-center', 3, 'structure', 'center = B'],
  ['prufer-code', 6, 'structure', '[1,2,2,4]'],
] as const
for (const [id, count, kind, result] of graphTreeCases) {
  const item = lesson(id)
  if (item.frames.length !== count || item.frames.some((frame) => frame.executionView?.kind !== kind ||
      !frame.codeLines.some((line) => line > 0 && Boolean(item.code[line - 1])))) {
    errors.push(`${id}: every narrated step must show its actual graph/tree state and valid code line`)
  }
  if (!item.frames.at(-1)?.executionView?.badges?.includes(result)) {
    errors.push(`${id}: final visual result must agree with the narration (${result})`)
  }
}
for (const id of ['kruskal','prim','boruvka']) {
  const final = lesson(id).frames.at(-1)?.executionView
  if (final?.kind !== 'structure' || final.edges.filter((edge) => edge.active).length !== 5 ||
      final.edges.filter((edge) => edge.active).reduce((sum,edge) => sum + Number(edge.label),0) !== 13) {
    errors.push(`${id}: five visible MST edges must weigh 13`)
  }
}
const dagFinal = lesson('dag-shortest-path').frames.at(-1)?.executionView
if (dagFinal?.kind !== 'network' || dagFinal.nodes.map((node) => node.value).join(',') !== 'dist 0,dist 2,dist 1,dist 3,dist 4') {
  errors.push('dag-shortest-path: displayed distances must follow all seven relaxations')
}
const negative = lesson('negative-cycle-reconstruction')
if (negative.frames[1].state?.x !== 'D' || negative.frames[2].state?.x !== 'B' ||
    negative.frames.at(-1)?.executionView?.kind !== 'network' ||
    !negative.code.some((line) => line.includes('dist[u]!=INF')) ||
    !negative.code.some((line) => line.trim() === 'x=-1;')) {
  errors.push('negative-cycle-reconstruction: last updated node, parent walk, and unreachable guard disagree')
}
const sccFinal = lesson('kosaraju-scc').frames.at(-1)?.executionView
if (sccFinal?.kind !== 'network' || sccFinal.nodes.map((node) => node.value).join(',') !== 'SCC 0,SCC 0,SCC 0,SCC 1,SCC 1,SCC 2') {
  errors.push('kosaraju-scc: visible component labels differ from the two DFS passes')
}
const condensationFinal = lesson('condensation-graph').frames.at(-1)?.executionView
if (condensationFinal?.kind !== 'network' || condensationFinal.edges.map((edge) => `${edge.from}${edge.to}`).join(',') !== '01,12') {
  errors.push('condensation-graph: DAG must contain only the two cross-component edges')
}
const bridgeFinal = lesson('bridge-tree').frames.at(-1)?.executionView
if (bridgeFinal?.kind !== 'structure' || bridgeFinal.edges.map((edge) => edge.label).join(',') !== 'B—D') {
  errors.push('bridge-tree: the contracted tree must preserve the unique bridge B—D')
}
const centerFinal = lesson('tree-center').frames.at(-1)?.executionView
if (centerFinal?.kind !== 'structure' || centerFinal.nodes.filter((node) => node.active).map((node) => node.id).join(',') !== 'B') {
  errors.push('tree-center: the visual center must be B')
}
const pruferFinal = lesson('prufer-code').frames.at(-1)?.executionView
if (pruferFinal?.kind !== 'structure' || pruferFinal.sequence?.join(',') !== '1,2,2,4' ||
    pruferFinal.edges.map((edge) => `${edge.from}${edge.to}`).join(',') !== 'DF') {
  errors.push('prufer-code: four removals must leave edge D—F and output [1,2,2,4]')
}
if (!lesson('kruskal').code.some((line) => line.includes('auto [u,v,w]:edges')) ||
    !lesson('kruskal').code.some((line) => line.includes('get<2>(a)<get<2>(b)'))) {
  errors.push('kruskal: sorting and tuple unpacking must use the declared {u,v,w} edge layout')
}


const mergeSort = lesson('merge-sort')
if (
  mergeSort.frames.length !== 16 ||
  mergeSort.values?.join(',') !== '7,2,9,4' ||
  mergeSort.frames[3].state?.tmp?.join(',') !== '2' ||
  mergeSort.frames[5].values?.join(',') !== '2,7,9,4' ||
  mergeSort.frames[10].values?.join(',') !== '2,7,4,9' ||
  mergeSort.frames.at(-1)?.values?.join(',') !== '2,4,7,9' ||
  !mergeSort.code.some((line)=>line.trim()==='tmp.push_back(a[i]);') ||
  !mergeSort.code.some((line)=>line.trim()==='tmp.push_back(a[j]);') ||
  !mergeSort.frames[3].codeLines.some((line)=>mergeSort.code[line-1]?.includes('tmp.push_back(a[j])')) ||
  !mergeSort.frames[11].codeLines.some((line)=>mergeSort.code[line-1]?.includes('tmp.push_back(a[i])'))
) {
  errors.push('merge-sort: recursive calls, merge mutations, or visible array states no longer match the full four-value execution')
}

const treeDp = lesson('tree-dp')
const treeDpFinal = treeDp.frames.at(-1)?.executionView
if (
  treeDp.frames.length !== 16 ||
  treeDpFinal?.kind !== 'network' ||
  treeDpFinal.nodes.map((node)=>node.value).join(',') !== 'dp 6,dp 4,dp 1,dp 2,dp 1,dp 1' ||
  !treeDp.frames[7].codeLines.some((line)=>treeDp.code[line-1]?.includes('dp[u]+=dp[v]')) ||
  !treeDp.frames[8].codeLines.some((line)=>treeDp.code[line-1]?.includes('dp[u]+=dp[v]')) ||
  !treeDp.frames[11].codeLines.some((line)=>treeDp.code[line-1]?.includes('dp[u]+=dp[v]')) ||
  !treeDp.frames[12].codeLines.some((line)=>treeDp.code[line-1]?.includes('dp[u]+=dp[v]')) ||
  !treeDp.frames[15].codeLines.some((line)=>treeDp.code[line-1]?.includes('dp[u]+=dp[v]')) ||
  treeDp.frames[1].state?.call !== 'A→B' ||
  treeDp.frames[5].state?.call !== 'D→F' ||
  treeDp.frames[13].state?.call !== 'A→C'
) {
  errors.push('tree-dp: DFS call order, child returns, per-child merges, or final subtree sizes disagree')
}


const xorBasis = lesson('xor-linear-basis')
if (
  xorBasis.frames.length !== 13 ||
  xorBasis.frames[1].state?.rank !== 1 ||
  xorBasis.frames[3].state?.rank !== 2 ||
  xorBasis.frames[7].state?.after !== '000' ||
  xorBasis.frames[8].state?.result !== 'false' ||
  xorBasis.frames.at(-1)?.state?.result !== 6 ||
  !xorBasis.frames[1].codeLines.some((line)=>xorBasis.code[line-1]?.trim()==='basis[b]=x;') ||
  !xorBasis.frames[5].codeLines.some((line)=>xorBasis.code[line-1]?.trim()==='x^=basis[b];') ||
  !xorBasis.frames[10].codeLines.some((line)=>xorBasis.code[line-1]?.includes('ans^=basis[b]'))
) {
  errors.push('xor-linear-basis: pivot insertion, elimination, dependence detection, or max-XOR code sync disagrees')
}

const closestPair = lesson('closest-pair')
const closestFinal = closestPair.frames.at(-1)?.executionView
if (
  closestPair.frames.length !== 19 ||
  closestPair.frames[2].state?.best !== '√17' ||
  closestPair.frames[4].state?.best !== '√5' ||
  closestPair.frames[7].state?.removed !== 'A' ||
  closestPair.frames[9].state?.removed !== 'B' ||
  closestPair.frames[13].state?.removed !== 'C' ||
  closestPair.frames[15].state?.removed !== 'D' ||
  closestPair.frames.at(-1)?.state?.distance2 !== 5 ||
  closestFinal?.kind !== 'geometry' ||
  !closestPair.frames[7].codeLines.some((line)=>closestPair.code[line-1]?.includes('active.erase')) ||
  !closestPair.frames[8].codeLines.some((line)=>closestPair.code[line-1]?.trim()==='++left;') ||
  !closestPair.frames.at(-1)?.codeLines.some((line)=>closestPair.code[line-1]?.trim()==='return best;')
) {
  errors.push('closest-pair: active-set eviction order, left-pointer movement, best distance, or code ownership disagrees')
}


for (const item of lessons) {
  for (const [step, frame] of item.frames.entries()) {
    const needle=frame.codeLine?.trim()
    if(!needle) continue
    const matches=item.code.filter((line)=>line.trim()===needle).length
    const authoredWithAnchor=Boolean(frame.codeAnchor)
    const occurrence=frame.state?.sourceOccurrence
    if(matches>1 && authoredWithAnchor && occurrence===undefined) {
      errors.push(`${item.id} frame ${step + 1}: auto-located code line is ambiguous because "${needle}" occurs ${matches} times; set sourceOccurrence`)
    }
  }
}

const mutationOperation = /(write|push|pop|merge|relax|add |add$|remove|color|mark|emit|append|store|attach|grow|insert|delete|swap|pull|apply|update (?:left|right|root|cell|state)|compress|relink|redirect|reduce|discard)/i
for (const item of lessons) {
  for (const [step, frame] of item.frames.entries()) {
    const operation = typeof frame.state?.operation === 'string' ? frame.state.operation : ''
    if (!mutationOperation.test(operation)) continue
    const primary = frame.codeLine.trim()
    if (/^(if|for|while)\b.*(?:\)\s*\{?|&&)\s*$/.test(primary)) {
      errors.push(`${item.id} frame ${step + 1}: mutation "${operation}" is still owned by control-flow code "${primary}"`)
    }
  }
}

if (errors.length) {
  for (const error of errors) console.error(error)
  process.exitCode = 1
} else {
  console.log('Animation semantics: prior covered lessons plus 10 graph/tree execution views and code links OK')
}
