import { lessons, categories } from '../src/algorithms'
import { visualModelById, visualKindForModel, visualModelGroups } from '../src/lessonMeta'
import { spawnSync } from 'node:child_process'

interface LessonAuditResult {
  id: string
  title: string
  zhTitle: string
  category: string
  subcategory: string
  
  // Code dimension
  code: {
    totalLines: number
    compiles: boolean
    compileError?: string
    isFullTemplate: boolean // has struct/class or complete function with types
    hasIncludes: boolean
    placeholderCount: number
    placeholders: string[]
    unmappedTeachingLines: number[]
    codeGuideCoverage: number // percentage of teaching lines covered
  }

  // Animation dimension
  animation: {
    frameCount: number
    animationVersion: number
    visual: string
    visualModel: string
    fidelity: string
    hasDedicatedAdaptiveScene: boolean
    hasActiveNodeIssues: boolean
    activeNodeIssues: string[]
    visualCueCoverage: number
    hasSemanticDiagramFallback: boolean
  }

  // Knowledge & Pedagogy dimension
  pedagogy: {
    prereqCount: number
    extensionCount: number
    hasGenericBoilerplate: boolean
    practiceProblemCount: number
    practiceProblems: { judge: string; title: string }[]
    usageCount: number
  }
}

const placeholderPatterns = [
  /\.\.\./,
  /for each/i,
  /write n-1/i,
  /random c/i,
  /childContaining/i,
  /merge pointers/i,
  /solve\(points sorted/i,
  /takeLeft\(\)/i,
  /takeRight\(\)/i,
  /copyMergedBack\(\)/i,
  /fft\(/i,
]

const results: LessonAuditResult[] = []

for (const lesson of lessons) {
  const { id, title, zhTitle, category, subcategory, code, frames, visual, visualModel, fidelity, animationVersion, knowledge, practice, usage } = lesson

  // --- 1. CODE AUDIT ---
  const codeText = code.join('\n')
  const compileCheck = spawnSync('c++', ['-x', 'c++', '-std=c++17', '-fsyntax-only', '-'], {
    input: codeText,
    encoding: 'utf8',
  })
  const compiles = compileCheck.status === 0
  const compileError = compiles ? undefined : compileCheck.stderr.split('\n')[0]

  const hasIncludes = code.some((l) => l.trim().startsWith('#include'))
  const isFullTemplate = (codeText.includes('struct ') || codeText.includes('class ') || codeText.includes('main(')) && hasIncludes

  const foundPlaceholders: string[] = []
  code.forEach((line) => {
    for (const pat of placeholderPatterns) {
      if (pat.test(line)) foundPlaceholders.push(line.trim())
    }
  })

  const teachingLines = code
    .map((line, idx) => ({ line: line.trim(), num: idx + 1 }))
    .filter(({ line }) => line && !/^[{}]+;?$/.test(line) && !line.startsWith('//') && !line.startsWith('#include') && !/^using namespace\b/.test(line))

  const explainedLineNums = new Set(frames.flatMap((f) => f.codeLines))
  const unmappedTeachingLines = teachingLines.filter((l) => !explainedLineNums.has(l.num)).map((l) => l.num)

  const guidedLineNums = new Set((lesson.codeGuide ?? []).map((g) => g.lineNumber))
  const guidedCount = teachingLines.filter((l) => guidedLineNums.has(l.num)).length
  const codeGuideCoverage = teachingLines.length ? Math.round((guidedCount / teachingLines.length) * 100) : 100

  // --- 2. ANIMATION AUDIT ---
  const activeNodeIssues: string[] = []
  if (visual === 'graph') {
    frames.forEach((f, i) => {
      if (f.active) {
        for (const act of f.active) {
          if (!/^[A-Z0-9]$/.test(act) && (act.includes('節點') || act.includes('邊') || act.includes('答案'))) {
            activeNodeIssues.push(`frame ${i + 1}: ${act}`)
          }
        }
      }
    })
  }

  const cuesCount = frames.filter((f) => Boolean(f.visualCue)).length
  const visualCueCoverage = Math.round((cuesCount / frames.length) * 100)

  // Dedicated scene check
  const hasDedicated = Boolean(visualModel && visualModelById[id])

  // --- 3. PEDAGOGY & METADATA ---
  const boilerplateKeywords = ['建立正確性不變量', '尚未執行這個階段', '依目前資料執行這一行']
  const hasGenericBoilerplate = frames.some((f) => 
    boilerplateKeywords.some((kw) => f.explanation?.includes(kw) || JSON.stringify(f.state ?? {}).includes(kw))
  )

  results.push({
    id,
    title,
    zhTitle,
    category,
    subcategory,
    code: {
      totalLines: code.length,
      compiles,
      compileError,
      isFullTemplate,
      hasIncludes,
      placeholderCount: foundPlaceholders.length,
      placeholders: foundPlaceholders,
      unmappedTeachingLines,
      codeGuideCoverage,
    },
    animation: {
      frameCount: frames.length,
      animationVersion: animationVersion ?? 1,
      visual,
      visualModel: visualModel ?? 'none',
      fidelity: fidelity ?? 'semantic',
      hasDedicatedAdaptiveScene: hasDedicated,
      hasActiveNodeIssues: activeNodeIssues.length > 0,
      activeNodeIssues: activeNodeIssues.slice(0, 3),
      visualCueCoverage,
      hasSemanticDiagramFallback: !hasDedicated,
    },
    pedagogy: {
      prereqCount: knowledge?.prerequisites.length ?? 0,
      extensionCount: knowledge?.extensions.length ?? 0,
      hasGenericBoilerplate,
      practiceProblemCount: practice?.length ?? 0,
      practiceProblems: (practice ?? []).map((p) => ({ judge: p.judge, title: p.title })),
      usageCount: usage?.length ?? 0,
    },
  })
}

// Summary Statistics
const total = results.length
const compilingCount = results.filter((r) => r.code.compiles).length
const fullTemplateCount = results.filter((r) => r.code.isFullTemplate).length
const placeholderLessons = results.filter((r) => r.code.placeholderCount > 0)
const unmappedLineLessons = results.filter((r) => r.code.unmappedTeachingLines.length > 0)
const activeBugLessons = results.filter((r) => r.animation.hasActiveNodeIssues)
const boilerplateLessons = results.filter((r) => r.pedagogy.hasGenericBoilerplate)
const animationCoverageSummary = {
  v2Guided: results.filter((r) => r.animation.animationVersion === 2).length,
  concreteFidelity: results.filter((r) => r.animation.fidelity === 'concrete').length,
  avgFrames: Math.round(results.reduce((acc, r) => acc + r.animation.frameCount, 0) / total),
}

console.log(JSON.stringify({
  totalLessons: total,
  summary: {
    code: {
      compiling: `${compilingCount} / ${total} (${Math.round(compilingCount / total * 100)}%)`,
      fullTemplates: `${fullTemplateCount} / ${total} (${Math.round(fullTemplateCount / total * 100)}%)`,
      withPlaceholders: placeholderLessons.length,
      withUnmappedLines: unmappedLineLessons.length,
    },
    animation: {
      v2Guided: `${animationCoverageSummary.v2Guided} / ${total}`,
      concreteFidelity: `${animationCoverageSummary.concreteFidelity} / ${total}`,
      avgFrames: animationCoverageSummary.avgFrames,
      lessonsWithActiveNodeBugs: activeBugLessons.length,
    },
    pedagogy: {
      lessonsWithGenericBoilerplate: `${boilerplateLessons.length} / ${total} (${Math.round(boilerplateLessons.length / total * 100)}%)`,
    }
  },
  placeholderLessons: placeholderLessons.map((l) => ({ id: l.id, placeholders: l.code.placeholders })),
  activeBugLessons: activeBugLessons.map((l) => ({ id: l.id, sampleIssues: l.animation.activeNodeIssues })),
  compilingLessons: results.filter((r) => r.code.compiles).map((l) => l.id),
  categoryBreakdown: categories.map((c) => {
    const inCat = results.filter((r) => r.category === c.title)
    return {
      category: c.title,
      total: inCat.length,
      compiling: inCat.filter((r) => r.code.compiles).length,
      fullTemplates: inCat.filter((r) => r.code.isFullTemplate).length,
      boilerplateCount: inCat.filter((r) => r.pedagogy.hasGenericBoilerplate).length,
    }
  }),
}, null, 2))
