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
  })
  if (new Set(lesson.frames.map((frame) => frame.title)).size !== lesson.frames.length) errors.push(`${lesson.id}: repeated step title`)
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
