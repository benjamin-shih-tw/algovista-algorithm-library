import { lessons, categories } from '../src/algorithms'
import { spawnSync } from 'node:child_process'

interface BugReport {
  lessonId: string
  category: string
  title: string
  type: 'CRITICAL_CRASH' | 'RENDER_BUG' | 'CODE_COMPILATION' | 'BEGINNER_STUCK_POINT' | 'METADATA_ISSUE'
  description: string
  details?: any
}

const bugs: BugReport[] = []
const lessonMap = new Map(lessons.map((l) => [l.id, l]))
const categoryMap = new Map(categories.map((c) => [c.id, c]))

for (const lesson of lessons) {
  const { id, title, category, frames, code, visual, visualModel } = lesson

  // 1. Check Scene Rendering Safety across all frames
  frames.forEach((frame, idx) => {
    const stepNum = idx + 1

    // Check codeLines bounds
    for (const line of frame.codeLines) {
      if (line < 1 || line > code.length) {
        bugs.push({
          lessonId: id,
          category,
          title,
          type: 'CRITICAL_CRASH',
          description: `第 ${stepNum} 步的 codeLine ${line} 超出程式碼總行數 (${code.length} 行)`,
        })
      }
    }

    // Check GraphScene points & edges
    if (visual === 'graph') {
      const points = lesson.points?.length ? lesson.points : [
        { id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }, { id: 'E' }, { id: 'F' }
      ]
      const pointIds = new Set(points.map((p) => p.id))
      const edges = lesson.edges?.length ? lesson.edges : [
        { from: 'A', to: 'B' }, { from: 'A', to: 'C' }, { from: 'B', to: 'D' },
        { from: 'B', to: 'E' }, { from: 'C', to: 'E' }, { from: 'D', to: 'F' }, { from: 'E', to: 'F' }
      ]
      for (const edge of edges) {
        if (!pointIds.has(edge.from) || !pointIds.has(edge.to)) {
          bugs.push({
            lessonId: id,
            category,
            title,
            type: 'CRITICAL_CRASH',
            description: `GraphScene 邊緣 (${edge.from} -> ${edge.to}) 參照了不存在的節點 ID，會導致渲染崩潰！`,
          })
        }
      }
      if (frame.active) {
        for (const act of frame.active) {
          if (!pointIds.has(act) && !/^\d+$/.test(act)) {
            bugs.push({
              lessonId: id,
              category,
              title,
              type: 'RENDER_BUG',
              description: `第 ${stepNum} 步 active 節點 "${act}" 不在 points 清單中`,
            })
          }
        }
      }
    }

    // Check GeometryScene Hull
    if (visual === 'geometry') {
      const points = lesson.points?.length ? lesson.points : [
        { id: 'P1' }, { id: 'P2' }, { id: 'P3' }, { id: 'P4' }, { id: 'P5' }, { id: 'P6' }, { id: 'P7' }, { id: 'P8' }
      ]
      const pointIds = new Set(points.map((p) => p.id))
      if (frame.hull) {
        for (const hid of frame.hull) {
          if (!pointIds.has(hid)) {
            bugs.push({
              lessonId: id,
              category,
              title,
              type: 'CRITICAL_CRASH',
              description: `GeometryScene 第 ${stepNum} 步 hull 參照了不存在的頂點 "${hid}"，會導致 byId() 噴出 null pointer crash！`,
            })
          }
        }
      }
    }

    // Check SegmentScene
    if (id === 'segment-tree' && !frame.segmentStep) {
      bugs.push({
        lessonId: id,
        category,
        title,
        type: 'CRITICAL_CRASH',
        description: `線段樹第 ${stepNum} 步缺少 segmentStep，會導致 SegmentScene 崩潰`,
      })
    }

    // Check Semantic Trace
    if (!frame.trace) {
      bugs.push({
        lessonId: id,
        category,
        title,
        type: 'RENDER_BUG',
        description: `第 ${stepNum} 步缺少 frame.trace`,
      })
    } else if (frame.trace.nodes.length !== 3) {
      bugs.push({
        lessonId: id,
        category,
        title,
        type: 'RENDER_BUG',
        description: `第 ${stepNum} 步 frame.trace.nodes 數量不是 3 (現為 ${frame.trace.nodes.length})`,
      })
    }

    // Check Text formatting / Placeholders
    if (frame.explanation.includes('undefined') || frame.explanation.includes('[object Object]')) {
      bugs.push({
        lessonId: id,
        category,
        title,
        type: 'BEGINNER_STUCK_POINT',
        description: `第 ${stepNum} 步解說文字包含未初始化的變數 (undefined 或 [object Object])`,
      })
    }
  })

  // 2. Beginner Usability / Stuck Points
  const meaningfulLines = code
    .map((line, index) => ({ line: line.trim(), number: index + 1 }))
    .filter(({ line }) => line && !/^[{}]+;?$/.test(line) && !line.startsWith('//') && !line.startsWith('#include') && !/^using namespace\b/.test(line))

  const explainedLines = new Set(frames.flatMap((f) => f.codeLines))
  const uncoveredLines = meaningfulLines.filter((l) => !explainedLines.has(l.number))
  if (uncoveredLines.length > 0) {
    bugs.push({
      lessonId: id,
      category,
      title,
      type: 'BEGINNER_STUCK_POINT',
      description: `有 ${uncoveredLines.length} 行有效程式碼在動畫中從未被高亮或解釋 (例如第 ${uncoveredLines.slice(0, 3).map((l) => l.number).join(', ')} 行)，新手點擊該行不會跳轉`,
      details: uncoveredLines.map((l) => l.number),
    })
  }

  // Check code placeholders
  const placeholderPatterns = [
    /\.\.\./,
    /for each/i,
    /write n-1/i,
    /random c/i,
    /childContaining/i,
    /merge pointers/i,
    /solve\(points sorted/i,
  ]
  code.forEach((line, idx) => {
    for (const pat of placeholderPatterns) {
      if (pat.test(line)) {
        bugs.push({
          lessonId: id,
          category,
          title,
          type: 'CODE_COMPILATION',
          description: `第 ${idx + 1} 行包含未實作的偽代碼/佔位符: "${line.trim()}"`,
        })
      }
    }
  })

  // Check prerequisites validity
  for (const prereq of lesson.knowledge?.prerequisites ?? []) {
    if (!lessonMap.has(prereq.lessonId)) {
      bugs.push({
        lessonId: id,
        category,
        title,
        type: 'METADATA_ISSUE',
        description: `先備課程連結指向不存在的課程 ID: "${prereq.lessonId}"`,
      })
    }
  }

  // Check practice links
  if (!lesson.practice || lesson.practice.length === 0) {
    bugs.push({
      lessonId: id,
      category,
      title,
      type: 'BEGINNER_STUCK_POINT',
      description: `缺少精選例題 (Practice Problem)，新手學完後無處練習`,
    })
  }
}

// 3. Run C++ Compilation Audit on all lessons
let cppSuccess = 0
let cppFailed = 0
const failedCpp: { id: string; error: string }[] = []

for (const lesson of lessons) {
  const codeText = lesson.code.join('\n')
  const result = spawnSync('c++', ['-x', 'c++', '-std=c++17', '-fsyntax-only', '-'], {
    input: codeText,
    encoding: 'utf8',
  })
  if (result.status === 0) {
    cppSuccess++
  } else {
    cppFailed++
    failedCpp.push({
      id: lesson.id,
      error: result.stderr.split('\n')[0] || 'Compilation error',
    })
  }
}

console.log(JSON.stringify({
  totalLessons: lessons.length,
  totalBugsFound: bugs.length,
  bugsByType: {
    CRITICAL_CRASH: bugs.filter((b) => b.type === 'CRITICAL_CRASH').length,
    RENDER_BUG: bugs.filter((b) => b.type === 'RENDER_BUG').length,
    CODE_COMPILATION: bugs.filter((b) => b.type === 'CODE_COMPILATION').length,
    BEGINNER_STUCK_POINT: bugs.filter((b) => b.type === 'BEGINNER_STUCK_POINT').length,
    METADATA_ISSUE: bugs.filter((b) => b.type === 'METADATA_ISSUE').length,
  },
  cppCompilation: {
    success: cppSuccess,
    failed: cppFailed,
  },
  bugs: bugs.slice(0, 30),
  failedCppSummary: failedCpp.slice(0, 15),
}, null, 2))
