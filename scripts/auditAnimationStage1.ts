import { writeFileSync, mkdirSync } from 'node:fs'
import { lessons, type AlgorithmLesson, type Frame } from '../src/algorithms'
import { foundationLessons } from '../src/foundationLessons'
import { graphTreeLessons } from '../src/graphTreeLessons'
import { dataDpLessons } from '../src/dataDpLessons'
import { advancedLessons } from '../src/advancedLessons'
import { completionFoundationLessons } from '../src/completionFoundationLessons'
import { completionGraphLessons } from '../src/completionGraphLessons'
import { completionDataDpLessons } from '../src/completionDataDpLessons'
import { completionAdvancedLessons } from '../src/completionAdvancedLessons'

type SourceType =
  | 'core-authored'
  | 'foundation'
  | 'graph-tree'
  | 'data-dp'
  | 'advanced'
  | 'completion-factory'

type AuditRow = {
  id: string
  title: string
  zhTitle: string
  categoryId: string
  visual: string
  visualModel: string
  sourceType: SourceType
  originallyAnimationV2: boolean
  expandedByGenericPipeline: boolean
  rawFrameCount: number
  finalFrameCount: number
  expansionFactor: number
  meaningfulCodeLines: number
  mappedCodeLines: number
  codeCoveragePct: number
  genericTextFrames: number
  genericTextRatio: number
  rawGenericFocusFrames: number
  dataNoOpTransitions: number
  renderedNoOpTransitions: number
  focusOnlyTransitions: number
  codeOnlyTransitions: number
  repeatedCodeTransitions: number
  uniqueDataStates: number
  dataStateRatio: number
  structuralRisk: number
  flags: string[]
}

const coreIds = new Set(['binary-search', 'bfs', 'dijkstra', 'segment-tree', 'convex-hull'])
const sourceById = new Map<string, { sourceType: SourceType; raw: AlgorithmLesson }>()

const register = (sourceType: SourceType, rawLessons: AlgorithmLesson[]) => {
  for (const lesson of rawLessons) sourceById.set(lesson.id, { sourceType, raw: lesson })
}

register('foundation', foundationLessons)
register('graph-tree', graphTreeLessons)
register('data-dp', dataDpLessons)
register('advanced', advancedLessons)
register('completion-factory', [
  ...completionFoundationLessons,
  ...completionGraphLessons,
  ...completionDataDpLessons,
  ...completionAdvancedLessons,
])

for (const id of coreIds) {
  const finalLesson = lessons.find((lesson) => lesson.id === id)
  if (!finalLesson) throw new Error(`Missing core lesson: ${id}`)
  sourceById.set(id, { sourceType: 'core-authored', raw: finalLesson })
}

const pedagogicalStateKeys = new Set([
  'algorithm', 'goal', 'before', 'condition', 'operation', 'after',
  'rationale', 'invariant', 'timelineStep', 'phase', 'microStep', 'microPhase',
])

const cleanState = (frame: Frame) => Object.fromEntries(
  Object.entries(frame.state ?? {}).filter(([key]) => !pedagogicalStateKeys.has(key)),
)

const dataSnapshot = (frame: Frame) => JSON.stringify({
  values: frame.values,
  low: frame.low,
  high: frame.high,
  mid: frame.mid,
  queue: frame.queue,
  priorityQueue: frame.priorityQueue,
  distances: frame.distances,
  hull: frame.hull,
  segmentStep: frame.segmentStep,
  state: cleanState(frame),
})

const renderedSnapshot = (frame: Frame) => JSON.stringify({
  data: JSON.parse(dataSnapshot(frame)),
  active: frame.active,
  accepted: frame.accepted,
  muted: frame.muted,
})

const codeSnapshot = (frame: Frame) => JSON.stringify([...new Set(frame.codeLines)].sort((a, b) => a - b))

const meaningfulLines = (lesson: AlgorithmLesson) => lesson.code
  .map((line, index) => ({ line: line.trim(), number: index + 1 }))
  .filter(({ line }) =>
    line &&
    !/^[{}]+$/.test(line) &&
    !line.startsWith('//') &&
    !line.startsWith('#include') &&
    !/^using namespace\b/.test(line)
  )

const genericTextRe = /這一行負責|執行前是|完成這行後應得到|讀取輸入，準備|代入實際值，判斷是否|執行目前敘述，開始|比較執行前後，確認|核對結果，完成/

const genericFocusPatterns: Record<string, string[][]> = {
  array: [['0','1'],['2','3'],['4','5']],
  linear: [['0','1'],['2','3'],['4','5']],
  graph: [['節點 A','邊 A→B'],['節點 B','邊 B→D'],['節點 D','答案邊']],
  tree: [['根節點','第一層'],['目前子樹','父子邊'],['合併後的根','答案路徑']],
  'segment-tree': [['區間 [0,7]','根節點'],['區間 [0,3]','區間 [4,7]'],['被接受區間','合併答案']],
  range: [['完整資料範圍','查詢端點'],['目前區塊','局部節點'],['已合併區塊','查詢答案']],
  dp: [['初始狀態','邊界格'],['依賴狀態','目前 dp 格'],['最終狀態','重建答案']],
  string: [['文字索引 0','模式前綴'],['目前字元','匹配狀態'],['接受狀態','完整匹配']],
  flow: [['來源 S','第一條殘餘邊'],['增廣路','瓶頸容量'],['匯點 T','更新後殘餘網路']],
  math: [['輸入 n','初始等式'],['目前運算值','中間結果'],['已驗證因子／答案','停止條件']],
  geometry: [['輸入點／圖形','基準方向'],['目前幾何關係','判定量'],['構造結果','答案圖形']],
  transform: [['原始係數','第 0 層'],['目前蝶形／轉換層','合併值'],['轉換結果','逆轉換答案']],
}

const sameList = (a: string[] | undefined, b: string[]) =>
  JSON.stringify(a ?? []) === JSON.stringify(b)

const countRawGenericFocus = (lesson: AlgorithmLesson) => {
  const expected = genericFocusPatterns[lesson.visual]
  if (!expected) return 0
  return lesson.frames.reduce((count, frame, index) =>
    count + (expected[index] && sameList(frame.active, expected[index]) ? 1 : 0), 0)
}

const pct = (value: number) => Math.round(value * 1000) / 10
const ratio = (value: number, total: number) => total ? value / total : 0

const rows: AuditRow[] = lessons.map((lesson) => {
  const source = sourceById.get(lesson.id)
  if (!source) throw new Error(`No raw source registered for ${lesson.id}`)
  const raw = source.raw
  const originallyAnimationV2 = raw.animationVersion === 2 || source.sourceType === 'core-authored'
  const expandedByGenericPipeline = !originallyAnimationV2
  const rawFrameCount = raw.frames.length
  const finalFrameCount = lesson.frames.length

  const meaningful = meaningfulLines(lesson)
  const meaningfulNumbers = new Set(meaningful.map((line) => line.number))
  const mapped = new Set(
    lesson.frames.flatMap((frame) => frame.codeLines).filter((line) => meaningfulNumbers.has(line)),
  )

  let dataNoOpTransitions = 0
  let renderedNoOpTransitions = 0
  let focusOnlyTransitions = 0
  let codeOnlyTransitions = 0
  let repeatedCodeTransitions = 0

  for (let i = 1; i < lesson.frames.length; ++i) {
    const prev = lesson.frames[i - 1]
    const cur = lesson.frames[i]
    const sameData = dataSnapshot(prev) === dataSnapshot(cur)
    const sameRendered = renderedSnapshot(prev) === renderedSnapshot(cur)
    const sameCode = codeSnapshot(prev) === codeSnapshot(cur)

    if (sameData) dataNoOpTransitions++
    if (sameRendered) renderedNoOpTransitions++
    if (sameData && !sameRendered) focusOnlyTransitions++
    if (sameRendered && !sameCode) codeOnlyTransitions++
    if (!sameData && sameCode) repeatedCodeTransitions++
  }

  const genericTextFrames = lesson.frames.filter((frame) =>
    genericTextRe.test(frame.title) || genericTextRe.test(frame.explanation),
  ).length
  const rawGenericFocusFrames = source.sourceType === 'completion-factory'
    ? countRawGenericFocus(raw)
    : 0
  const uniqueDataStates = new Set(lesson.frames.map(dataSnapshot)).size
  const transitions = Math.max(0, finalFrameCount - 1)

  const flags: string[] = []
  if (expandedByGenericPipeline) flags.push('GENERIC_EXPANSION')
  if (source.sourceType === 'completion-factory') flags.push('FACTORY_3_PHASE_SOURCE')
  if (rawGenericFocusFrames > 0) flags.push('GENERIC_RAW_FOCUS')
  if (ratio(dataNoOpTransitions, transitions) >= 0.35) flags.push('HIGH_DATA_NOOP')
  if (ratio(focusOnlyTransitions, transitions) >= 0.25) flags.push('FOCUS_ONLY_STEPS')
  if (ratio(codeOnlyTransitions, transitions) >= 0.2) flags.push('CODE_ONLY_STEPS')
  if (ratio(genericTextFrames, finalFrameCount) >= 0.5) flags.push('GENERIC_TEXT')
  if (mapped.size < meaningful.length) flags.push('CODE_COVERAGE_GAP')

  const structuralRisk =
    (expandedByGenericPipeline ? 2 : 0) +
    (source.sourceType === 'completion-factory' ? 3 : 0) +
    Math.min(3, rawGenericFocusFrames) +
    Math.round(ratio(dataNoOpTransitions, transitions) * 4) +
    Math.round(ratio(focusOnlyTransitions, transitions) * 3) +
    Math.round(ratio(codeOnlyTransitions, transitions) * 3) +
    Math.round(ratio(genericTextFrames, finalFrameCount) * 3)

  return {
    id: lesson.id,
    title: lesson.title,
    zhTitle: lesson.zhTitle,
    categoryId: lesson.categoryId,
    visual: lesson.visual,
    visualModel: lesson.visualModel ?? 'none',
    sourceType: source.sourceType,
    originallyAnimationV2,
    expandedByGenericPipeline,
    rawFrameCount,
    finalFrameCount,
    expansionFactor: Math.round((finalFrameCount / Math.max(1, rawFrameCount)) * 100) / 100,
    meaningfulCodeLines: meaningful.length,
    mappedCodeLines: mapped.size,
    codeCoveragePct: pct(ratio(mapped.size, meaningful.length)),
    genericTextFrames,
    genericTextRatio: pct(ratio(genericTextFrames, finalFrameCount)),
    rawGenericFocusFrames,
    dataNoOpTransitions,
    renderedNoOpTransitions,
    focusOnlyTransitions,
    codeOnlyTransitions,
    repeatedCodeTransitions,
    uniqueDataStates,
    dataStateRatio: pct(ratio(uniqueDataStates, finalFrameCount)),
    structuralRisk,
    flags,
  }
})

const sum = (key: keyof AuditRow) => rows.reduce((total, row) => {
  const value = row[key]
  return total + (typeof value === 'number' ? value : 0)
}, 0)

const flagCounts = [...new Set(rows.flatMap((row) => row.flags))]
  .map((flag) => ({ flag, lessons: rows.filter((row) => row.flags.includes(flag)).length }))
  .sort((a, b) => b.lessons - a.lessons)

const sourceCounts = [...new Set(rows.map((row) => row.sourceType))].map((sourceType) => ({
  sourceType,
  lessons: rows.filter((row) => row.sourceType === sourceType).length,
}))

const categoryCounts = [...new Set(rows.map((row) => row.categoryId))].map((categoryId) => ({
  categoryId,
  lessons: rows.filter((row) => row.categoryId === categoryId).length,
  averageRisk: Math.round(
    rows.filter((row) => row.categoryId === categoryId)
      .reduce((acc, row) => acc + row.structuralRisk, 0)
    / rows.filter((row) => row.categoryId === categoryId).length * 10,
  ) / 10,
})).sort((a, b) => b.averageRisk - a.averageRisk)

const topStructuralRisk = [...rows]
  .sort((a, b) => b.structuralRisk - a.structuralRisk || b.dataNoOpTransitions - a.dataNoOpTransitions || a.id.localeCompare(b.id))
  .slice(0, 40)

const cohortSummary = [
  {
    cohort: 'authored-v2',
    rows: rows.filter((row) => !row.expandedByGenericPipeline),
  },
  {
    cohort: 'expanded-non-factory',
    rows: rows.filter((row) => row.expandedByGenericPipeline && row.sourceType !== 'completion-factory'),
  },
  {
    cohort: 'completion-factory',
    rows: rows.filter((row) => row.sourceType === 'completion-factory'),
  },
].map(({ cohort, rows: cohortRows }) => {
  const transitions = cohortRows.reduce((acc, row) => acc + Math.max(0, row.finalFrameCount - 1), 0)
  const finalFrames = cohortRows.reduce((acc, row) => acc + row.finalFrameCount, 0)
  const rawFrames = cohortRows.reduce((acc, row) => acc + row.rawFrameCount, 0)
  const dataNoOp = cohortRows.reduce((acc, row) => acc + row.dataNoOpTransitions, 0)
  const renderedNoOp = cohortRows.reduce((acc, row) => acc + row.renderedNoOpTransitions, 0)
  const codeOnly = cohortRows.reduce((acc, row) => acc + row.codeOnlyTransitions, 0)
  const genericText = cohortRows.reduce((acc, row) => acc + row.genericTextFrames, 0)
  return {
    cohort,
    lessons: cohortRows.length,
    rawFrames,
    finalFrames,
    expansion: Math.round((finalFrames / Math.max(1, rawFrames)) * 100) / 100,
    dataNoOpPct: pct(ratio(dataNoOp, transitions)),
    renderedNoOpPct: pct(ratio(renderedNoOp, transitions)),
    codeOnlyPct: pct(ratio(codeOnly, transitions)),
    genericTextPct: pct(ratio(genericText, finalFrames)),
    averageRisk: Math.round(cohortRows.reduce((acc, row) => acc + row.structuralRisk, 0) / Math.max(1, cohortRows.length) * 10) / 10,
  }
})

const authoredAnomalies = rows
  .filter((row) => !row.expandedByGenericPipeline && (row.dataNoOpTransitions > 0 || row.codeOnlyTransitions > 0))
  .map((row) => ({
    id: row.id,
    dataNoOpTransitions: row.dataNoOpTransitions,
    codeOnlyTransitions: row.codeOnlyTransitions,
    genericTextFrames: row.genericTextFrames,
  }))

const summary = {
  generatedAt: new Date().toISOString(),
  totalLessons: rows.length,
  uniqueLessonIds: new Set(rows.map((row) => row.id)).size,
  originallyAnimationV2: rows.filter((row) => row.originallyAnimationV2).length,
  expandedByGenericPipeline: rows.filter((row) => row.expandedByGenericPipeline).length,
  completionFactoryLessons: rows.filter((row) => row.sourceType === 'completion-factory').length,
  totalRawFrames: sum('rawFrameCount'),
  totalFinalFrames: sum('finalFrameCount'),
  totalDataNoOpTransitions: sum('dataNoOpTransitions'),
  totalRenderedNoOpTransitions: sum('renderedNoOpTransitions'),
  totalFocusOnlyTransitions: sum('focusOnlyTransitions'),
  totalCodeOnlyTransitions: sum('codeOnlyTransitions'),
  totalGenericTextFrames: sum('genericTextFrames'),
  lessonsWithDataNoOp: rows.filter((row) => row.dataNoOpTransitions > 0).length,
  lessonsWithFocusOnlySteps: rows.filter((row) => row.focusOnlyTransitions > 0).length,
  lessonsWithCodeOnlySteps: rows.filter((row) => row.codeOnlyTransitions > 0).length,
  lessonsWithGenericText: rows.filter((row) => row.genericTextFrames > 0).length,
  averageCodeCoveragePct: Math.round(rows.reduce((acc, row) => acc + row.codeCoveragePct, 0) / rows.length * 10) / 10,
  sourceCounts,
  cohortSummary,
  authoredAnomalies,
  categoryCounts,
  flagCounts,
}

const markdown = [
  '# Stage 1 Animation Structural Audit',
  '',
  '> This report measures structural risk. It is not a human quality grade.',
  '',
  `Generated: ${summary.generatedAt}`,
  '',
  '## Summary',
  '',
  `- Lessons: **${summary.totalLessons}**`,
  `- Originally authored as animationVersion 2: **${summary.originallyAnimationV2}**`,
  `- Expanded by generic pipeline: **${summary.expandedByGenericPipeline}**`,
  `- Completion-factory lessons: **${summary.completionFactoryLessons}**`,
  `- Raw frames → final frames: **${summary.totalRawFrames} → ${summary.totalFinalFrames}**`,
  `- Lessons containing data no-op transitions: **${summary.lessonsWithDataNoOp}**`,
  `- Lessons containing focus-only transitions: **${summary.lessonsWithFocusOnlySteps}**`,
  `- Lessons containing code-only transitions: **${summary.lessonsWithCodeOnlySteps}**`,
  `- Lessons containing generated/generic step wording: **${summary.lessonsWithGenericText}**`,
  `- Average meaningful-code mapping coverage: **${summary.averageCodeCoveragePct}%**`,
  '',
  '## Cohorts',
  '',
  '| Cohort | Lessons | Raw→Final frames | Data no-op | Render no-op | Code-only | Generic text | Avg risk |',
  '|---|---:|---:|---:|---:|---:|---:|---:|',
  ...cohortSummary.map((item) => `| ${item.cohort} | ${item.lessons} | ${item.rawFrames}→${item.finalFrames} (×${item.expansion}) | ${item.dataNoOpPct}% | ${item.renderedNoOpPct}% | ${item.codeOnlyPct}% | ${item.genericTextPct}% | ${item.averageRisk} |`),
  '',
  '## Authored-v2 anomalies',
  '',
  ...(authoredAnomalies.length
    ? authoredAnomalies.map((item) => `- ${item.id}: dataNoOp=${item.dataNoOpTransitions}, codeOnly=${item.codeOnlyTransitions}, genericText=${item.genericTextFrames}`)
    : ['- None']),
  '',
  '## Structural flags',
  '',
  '| Flag | Lessons |',
  '|---|---:|',
  ...flagCounts.map((item) => `| ${item.flag} | ${item.lessons} |`),
  '',
  '## Highest structural risk (first 40)',
  '',
  '| Lesson | Source | Raw→Final | Data no-op | Focus-only | Code-only | Generic text | Risk |',
  '|---|---|---:|---:|---:|---:|---:|---:|',
  ...topStructuralRisk.map((row) =>
    `| ${row.id} | ${row.sourceType} | ${row.rawFrameCount}→${row.finalFrameCount} | ${row.dataNoOpTransitions} | ${row.focusOnlyTransitions} | ${row.codeOnlyTransitions} | ${row.genericTextFrames}/${row.finalFrameCount} | ${row.structuralRisk} |`,
  ),
  '',
  '## Interpretation',
  '',
  '- **DATA NO-OP**: the underlying algorithm data snapshot does not change between adjacent steps.',
  '- **FOCUS ONLY**: underlying data is unchanged and only visual focus/highlight changes.',
  '- **CODE ONLY**: rendered animation snapshot is unchanged while mapped code lines change.',
  '- **GENERIC TEXT**: step title/explanation contains wording produced by the current generic frame-expansion template.',
  '- These signals identify where human semantic review should start; some repeated states can be pedagogically valid.',
  '',
].join('\n')

mkdirSync('.tmp', { recursive: true })
writeFileSync('.tmp/stage1-animation-audit.json', JSON.stringify({ summary, rows }, null, 2))
writeFileSync('.tmp/stage1-animation-audit.md', markdown)

console.log('=== STAGE 1 ANIMATION STRUCTURAL AUDIT ===')
console.log(JSON.stringify(summary, null, 2))
console.log('=== TOP STRUCTURAL RISK ===')
console.log(JSON.stringify(topStructuralRisk.slice(0, 20).map((row) => ({
  id: row.id,
  source: row.sourceType,
  rawToFinal: `${row.rawFrameCount}->${row.finalFrameCount}`,
  dataNoOp: row.dataNoOpTransitions,
  focusOnly: row.focusOnlyTransitions,
  codeOnly: row.codeOnlyTransitions,
  genericText: `${row.genericTextFrames}/${row.finalFrameCount}`,
  risk: row.structuralRisk,
  flags: row.flags,
})), null, 2))
console.log('Detailed files: .tmp/stage1-animation-audit.json and .tmp/stage1-animation-audit.md')
