import { categories, lessons } from '../src/algorithms'
import { visualKindForModel, visualModelById, visualModelGroups } from '../src/lessonMeta'

const errors: string[] = []
const ids = new Set<string>()
const traceSignatures = new Set<string>()
const semanticTraces = new Map<string, string>()
const categoryById = new Map(categories.map((category) => [category.id, category]))
const allowedSourceHosts = new Set(['pingchungchang.github.io', 'app.notion.com', 'usaco.guide'])
const allowedPracticeHosts = new Set(['cses.fi', 'atcoder.jp', 'codeforces.com'])
const assignedVisualIds = Object.values(visualModelGroups).flat()
const visualAssignmentCounts = new Map<string, number>()
for (const id of assignedVisualIds) visualAssignmentCounts.set(id, (visualAssignmentCounts.get(id) ?? 0) + 1)

for (const lesson of lessons) {
  if (ids.has(lesson.id)) errors.push(`duplicate id: ${lesson.id}`)
  ids.add(lesson.id)
  const category = categoryById.get(lesson.categoryId)
  if (!category) errors.push(`${lesson.id}: unknown category ${lesson.categoryId}`)
  else if (!category.subcategories.includes(lesson.subcategory)) errors.push(`${lesson.id}: unlisted subcategory ${lesson.subcategory}`)
  if (lesson.frames.length < 3) errors.push(`${lesson.id}: fewer than 3 frames`)
  if (!lesson.code.length) errors.push(`${lesson.id}: empty code`)
  if (lesson.animationVersion === 2) {
    if (lesson.frames.length < 10 || lesson.frames.length > 20) errors.push(`${lesson.id}: guided animation must contain 10–20 frames`)
    if (!lesson.sources?.length) errors.push(`${lesson.id}: guided animation has no content source`)
  }
  for (const source of lesson.sources ?? []) {
    let host = ''
    try { host = new URL(source.url).hostname } catch { errors.push(`${lesson.id}: invalid source URL`) }
    if (host && !allowedSourceHosts.has(host)) errors.push(`${lesson.id}: source is outside CPPBook, Notion, or USACO`)
  }
  if (!lesson.fidelity) errors.push(`${lesson.id}: missing visual fidelity`)
  if (!lesson.visualModel) errors.push(`${lesson.id}: missing algorithm-specific visual model`)
  if (visualModelById[lesson.id] !== lesson.visualModel) errors.push(`${lesson.id}: visual model assignment mismatch`)
  if (visualAssignmentCounts.get(lesson.id) !== 1) errors.push(`${lesson.id}: visual model must be assigned exactly once`)
  if (lesson.visualModel) {
    const expectedVisual = lesson.id === 'segment-tree' ? 'segment-tree' : visualKindForModel(lesson.visualModel)
    if (lesson.visual !== expectedVisual) errors.push(`${lesson.id}: visual family ${lesson.visual} does not match ${lesson.visualModel}`)
  }
  if (!lesson.usage || lesson.usage.length < 2 || lesson.usage.some((item) => item.length < 12)) errors.push(`${lesson.id}: incomplete usage guidance`)
  if (!lesson.practice?.length) errors.push(`${lesson.id}: missing practice problem`)
  for (const problem of lesson.practice ?? []) {
    let host = ''
    try { host = new URL(problem.url).hostname } catch { errors.push(`${lesson.id}: invalid practice URL`) }
    if (host && !allowedPracticeHosts.has(host)) errors.push(`${lesson.id}: practice problem is not from CSES, AtCoder, or Codeforces`)
    if (!problem.title || !problem.note) errors.push(`${lesson.id}: incomplete practice problem metadata`)
  }
  if (lesson.animationVersion === 2 && lesson.fidelity !== 'concrete') errors.push(`${lesson.id}: guided simulator is not concrete`)
  if (lesson.animationVersion !== 2 && lesson.fidelity === 'concrete') errors.push(`${lesson.id}: semantic lesson marked concrete`)
  lesson.frames.forEach((frame, frameIndex) => {
    if (frame.explanation.length < 28) errors.push(`${lesson.id} frame ${frameIndex + 1}: explanation too short`)
    if (!frame.codeLines.length) errors.push(`${lesson.id} frame ${frameIndex + 1}: no active code line`)
    if (!frame.codeLine.trim() || /^[{}]+;?$/.test(frame.codeLine.trim()) || frame.codeLine.trim().startsWith('//')) errors.push(`${lesson.id} frame ${frameIndex + 1}: active code is not an executable teaching line`)
    for (const line of frame.codeLines) if (line < 1 || line > lesson.code.length) errors.push(`${lesson.id} frame ${frameIndex + 1}: code line ${line} out of range`)
    if (!frame.trace) errors.push(`${lesson.id} frame ${frameIndex + 1}: missing dedicated visual trace`)
    else {
      if (traceSignatures.has(frame.trace.signature)) errors.push(`${lesson.id} frame ${frameIndex + 1}: duplicate visual signature`)
      traceSignatures.add(frame.trace.signature)
      if (frame.trace.step !== frameIndex || frame.trace.totalSteps !== lesson.frames.length) errors.push(`${lesson.id} frame ${frameIndex + 1}: trace timeline mismatch`)
      if (frame.trace.activeCode !== frame.codeLine) errors.push(`${lesson.id} frame ${frameIndex + 1}: trace and code are not synchronized`)
      if (frame.trace.nodes.length !== 3 || frame.trace.nodes.some((node) => !node.label || !node.value)) errors.push(`${lesson.id} frame ${frameIndex + 1}: incomplete visual nodes`)
      if (new Set(frame.trace.nodes.map((node) => node.value)).size !== frame.trace.nodes.length) errors.push(`${lesson.id} frame ${frameIndex + 1}: repeated visual node value`)
      const semanticKey = frame.trace.nodes.map((node) => `${node.label}:${node.value}`).join('|')
      const owner = semanticTraces.get(semanticKey)
      if (owner && owner !== lesson.id) errors.push(`${lesson.id} frame ${frameIndex + 1}: visual state duplicates ${owner}`)
      semanticTraces.set(semanticKey, lesson.id)
    }
    if (frame.visualStep !== frameIndex) errors.push(`${lesson.id} frame ${frameIndex + 1}: visual step is not deterministic`)
    const expectedProgress = lesson.frames.length <= 1 ? 1 : frameIndex / (lesson.frames.length - 1)
    if (frame.visualProgress === undefined || Math.abs(frame.visualProgress - expectedProgress) > 0.0001) errors.push(`${lesson.id} frame ${frameIndex + 1}: visual progress mismatch`)
    if (!frame.visualCue) errors.push(`${lesson.id} frame ${frameIndex + 1}: missing visible micro-animation cue`)
    else if (frame.visualCue.progress !== frame.visualProgress || !frame.visualCue.label) errors.push(`${lesson.id} frame ${frameIndex + 1}: visual cue is not synchronized`)
    if (!frame.beginner) errors.push(`${lesson.id} frame ${frameIndex + 1}: missing beginner explanation`)
    else {
      for (const [key, value] of Object.entries(frame.beginner)) {
        if (key !== 'pitfall' && value.length < 18) errors.push(`${lesson.id} frame ${frameIndex + 1}: beginner ${key} is too short`)
      }
      if (new Set([frame.beginner.observe, frame.beginner.action, frame.beginner.reason, frame.beginner.result]).size !== 4) errors.push(`${lesson.id} frame ${frameIndex + 1}: beginner reasoning cards repeat each other`)
      const activeSource = frame.codeLines.map((line) => lesson.code[line - 1] ?? '').join(' ')
      const hasCondition = Boolean(frame.state?.condition) || /\b(if|while|for)\s*\(/.test(activeSource)
      if (!hasCondition && frame.beginner.action.includes('代入「高亮程式行')) errors.push(`${lesson.id} frame ${frameIndex + 1}: non-conditional line is explained as a condition`)
    }
    if (['math','range','dp','transform'].includes(lesson.visual) && frame.active?.some((item) => /^[A-D]$/.test(item))) errors.push(`${lesson.id} frame ${frameIndex + 1}: visual focus belongs to an unrelated graph template`)
  })
  if (!lesson.beginnerGuide) errors.push(`${lesson.id}: missing beginner guide`)
  else {
    if (lesson.beginnerGuide.walkthrough.length < 3) errors.push(`${lesson.id}: beginner walkthrough is incomplete`)
    if (lesson.beginnerGuide.pitfalls.length < 2) errors.push(`${lesson.id}: beginner pitfalls are incomplete`)
    if (lesson.beginnerGuide.glossary.length < 3 || new Set(lesson.beginnerGuide.glossary.map((item) => item.term)).size !== lesson.beginnerGuide.glossary.length) errors.push(`${lesson.id}: beginner glossary is incomplete`)
  }
  const meaningfulLines = lesson.code
    .map((line, index) => ({ line: line.trim(), number: index + 1 }))
    .filter(({ line }) => line && !/^[{}]+$/.test(line) && !line.startsWith('//'))
  for (const { line, number } of meaningfulLines) if (/\.\.\.|for each|write n-1|random c|childContaining/.test(line)) errors.push(`${lesson.id}: code line ${number} still contains pseudocode placeholder text`)
  const explainedLines = new Set(lesson.frames.flatMap((frame) => frame.codeLines))
  for (const { number } of meaningfulLines) if (!explainedLines.has(number)) errors.push(`${lesson.id}: code line ${number} is never explained`)
  const guidedLines = new Set(lesson.codeGuide?.map((item) => item.lineNumber) ?? [])
  for (const { number } of meaningfulLines) if (!guidedLines.has(number)) errors.push(`${lesson.id}: code line ${number} has no line-by-line guide`)
  if (lesson.codeGuide?.some((item) => !item.syntax || !item.purpose || !item.effect)) errors.push(`${lesson.id}: incomplete line-by-line code guide`)
  if (new Set(lesson.frames.map((frame) => frame.title)).size !== lesson.frames.length) errors.push(`${lesson.id}: repeated step title`)
  const teachingStates = lesson.frames.map((frame) => JSON.stringify({ code: frame.codeLine, state: Object.fromEntries(Object.entries(frame.state ?? {}).filter(([key]) => key !== 'timelineStep')), active: frame.active, accepted: frame.accepted }))
  if (new Set(teachingStates).size !== teachingStates.length) errors.push(`${lesson.id}: repeated teaching state does not create a real new step`)
}

lessons.forEach((lesson, index) => {
  const expected = String(index + 1).padStart(3, '0')
  if (lesson.index !== expected) errors.push(`${lesson.id}: expected index ${expected}, got ${lesson.index}`)
})

for (const category of categories) {
  for (const subcategory of category.subcategories) {
    if (!lessons.some((lesson) => lesson.categoryId === category.id && lesson.subcategory === subcategory)) errors.push(`empty subcategory: ${category.id}/${subcategory}`)
  }
}

const counts = Object.fromEntries(categories.map((category) => [category.id, lessons.filter((lesson) => lesson.categoryId === category.id).length]))
const fidelity = {
  concrete: lessons.filter((lesson) => lesson.fidelity === 'concrete').length,
  semantic: lessons.filter((lesson) => lesson.fidelity === 'semantic').length,
}
const guidedAnimations = lessons.filter((lesson) => lesson.animationVersion === 2).length
const visualModels = new Set(lessons.map((lesson) => lesson.visualModel)).size
console.log(JSON.stringify({ total: lessons.length, visualTraces: traceSignatures.size, fidelity, guidedAnimations, visualModels, counts, errors }, null, 2))
if (errors.length) process.exitCode = 1
