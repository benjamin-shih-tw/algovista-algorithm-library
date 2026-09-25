import { lessons } from '../src/algorithms'
import { writeFileSync } from 'node:fs'

interface Issue { lessonId: string; frame?: number; kind: string; detail: string }
const issues: Issue[] = []
const add = (lessonId: string, kind: string, detail: string, frame?: number) => issues.push({ lessonId, kind, detail, frame })

const genericPhrases: [string, string][] = [
  ['執行 二分搜尋 的目前操作', 'generic explainCppLine fallback text leaking into binary-search'],
  ['的函式入口', 'misclassifies if/while/for lines as function entry (explainCppLine bug)'],
  ['先不要看結果', 'observe line tells user to evaluate a condition even when frame has no condition'],
  ['演算法收到的資料', 'generic entry-line explanation'],
  ['這一行本身不會偷偷修改其他狀態', 'generic if-line explanation'],
  ['避免重做已能證明的工作', 'templated motivation.why'],
  ['通常是指數級', 'category-level naive text'],
  ['維持答案區間不變量，每次安全排除一半。', 'invariant repeated from description'],
]

for (const lesson of lessons) {
  // 1. code frame sync: frame.codeLine must exist in code
  lesson.frames.forEach((frame, i) => {
    if (frame.codeLine && !lesson.code.some((l) => l.trim() === frame.codeLine.trim())) {
      add(lesson.id, 'code-line-mismatch', `frame codeLine "${frame.codeLine.slice(0, 60)}" not found in code`, i + 1)
    }
    // explanation mentions a line number - check consistency
    const m = frame.explanation.match(/第 (\d+) 行/)
    if (m) {
      const n = Number(m[1])
      const line = lesson.code[n - 1]?.trim()
      if (line && frame.codeLine && line !== frame.codeLine.trim()) {
        add(lesson.id, 'explanation-line-mismatch', `explanation says 第 ${n} 行 but frame.codeLine is different line`, i + 1)
      }
    }
  })

  // 2. beginner.action misclassification check
  lesson.frames.forEach((frame, i) => {
    const b = frame.beginner
    if (!b) return
    const activeSource = frame.codeLines.map((n) => lesson.code[n - 1] ?? '').join(' ')
    // 函式入口的宣稱是逐句的（「第 N 行「...」是 ... 的函式入口」），必須解析出 N
    // 並對「該行」驗證；對整個 action 對 join 後的多行程式碼做單行正則會把跨行函式頭誤報。
    // 注意引號是全形「」：半形 [^"]+ 會吞進後面的敘述造成大量誤報。
    const fnEntryClaim = /第 (\d+) 行「([^」]+)」是 .{0,40}?的函式入口/.exec(b.action)
    if (fnEntryClaim) {
      const claimedLine = Number(fnEntryClaim[1])
      const claimedCode = lesson.code[claimedLine - 1]?.trim() ?? ''
      const singleLineEntry = /^(?!(\bif|else|while|for|do|switch)\b)[\w:<>,&*\s]+\w+\s*\([^;]*\)\s*\{/.test(claimedCode)
      const isMultiLineHeader = frame.codeLines.includes(claimedLine) && frame.codeLines.length > 1
        && /[\w:<>]*\w\s*\([^;)]*$/.test(claimedCode.replace(/\/\/.*$/, '').trim())
      if (claimedCode !== fnEntryClaim[2].trim() || (!singleLineEntry && !isMultiLineHeader)) {
        add(lesson.id, 'beginner-action-misclassify', `beginner.action claims 第 ${claimedLine} 行是函式入口 but it is: ${claimedCode.slice(0, 70)}`, i + 1)
      }
    }
    if (b.action.includes('把目前數值代入「高亮程式行括號內的條件」') && !/\b(if|while|for)\s*\(/.test(activeSource)) {
      add(lesson.id, 'beginner-condition-fake', `observe/action claims a condition but active code has no if/while/for`, i + 1)
    }
  })

  // 3. generic filler in explanations of AUTHORED lessons (not expanded)
  if (lesson.animationVersion === 2 && !lesson.id.startsWith('completion')) {
    // all authored lessons are expanded; skip
  }

  // 4. practice problem relevance: compare practice title with lesson zhTitle similarity is hard;
  // check the known-suspicious ones by model sharing
  const sharedModels = new Map<string, string[]>()
  for (const l of lessons) {
    const model = l.visualModel ?? ''
    sharedModels.set(model, [...(sharedModels.get(model) ?? []), l.id])
  }
}

// collect model-sharing practice collisions
const byModel: Record<string, string[]> = {}
for (const l of lessons) {
  const model = l.visualModel ?? 'none'
  ;(byModel[model] ??= []).push(l.id)
}
const modelLessons = Object.entries(byModel).filter(([, ids]) => ids.length > 1)

// count lessons whose practice is shared via model (i.e., not in practiceById override)
const authoredIds = new Set(['linear-search', 'binary-search', 'bfs'])
let sharedPracticeCount = 0
const sharedPracticeExamples: string[] = []
for (const l of lessons) {
  if (authoredIds.has(l.id)) continue
  sharedPracticeCount++
  if (sharedPracticeExamples.length < 12) sharedPracticeExamples.push(`${l.id} -> ${(l.practice?.[0]?.title) ?? 'none'}`)
}

// 5. usage text: usageById only has 4 entries; all others templated
let templatedUsage = 0
for (const l of lessons) {
  if (!authoredIds.has(l.id) && l.usage?.[0]?.startsWith('題目要求')) templatedUsage++
}

// 6. segmentStep rendering for segment-tree: check all frames have it
const st = lessons.find((l) => l.id === 'segment-tree')
if (st) {
  st.frames.forEach((f, i) => {
    if (!f.segmentStep) add('segment-tree', 'missing-segment-step', `frame ${i + 1} lacks segmentStep`, i + 1)
  })
}

// 7. count how many lessons use category-generic knowledge.naive
let genericNaive = 0
for (const l of lessons) {
  const naive = l.knowledge?.motivation?.naive ?? ''
  if (naive.length < 120) genericNaive++
}

const summary = {
  totalIssues: issues.length,
  totalLessons: lessons.length,
  issueKinds: issues.reduce<Record<string, number>>((acc, i) => { acc[i.kind] = (acc[i.kind] ?? 0) + 1; return acc }, {}),
  lessonsAffected: new Set(issues.map((i) => i.lessonId)).size,
  sharedModelGroups: modelLessons.map(([m, ids]) => ({ model: m, count: ids.length, ids })),
  sharedPracticeCount,
  sharedPracticeExamples,
  templatedUsageCount: templagedUsageFix(templatedUsage),
  genericNaiveCount: genericNaive,
  sampleIssues: issues.slice(0, 60),
}
function templagedUsageFix(n: number) { return n }

writeFileSync('.tmp/semanticAudit.json', JSON.stringify(summary, null, 2))
console.log(JSON.stringify({
  totalIssues: summary.totalIssues,
  issueKinds: summary.issueKinds,
  lessonsAffected: summary.lessonsAffected,
  sharedPracticeCount,
  templatedUsageCount: templatedUsage,
  genericNaiveCount: genericNaive,
}, null, 2))
