import { lessons } from '../src/algorithms'

const errors: string[] = []
const warnings: string[] = []
const ids = new Set(lessons.map((lesson) => lesson.id))
const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]))

const requiredTerms: Record<string, string[]> = {
  'fenwick-tree': ['lowbit'],
  'lazy-segment-tree': ['lazy'],
  dsu: ['parent', 'rank'],
  'lca-binary-lifting': ['parent'],
  kmp: ['prefix'],
  'topological-sort': ['indegree'],
  dijkstra: ['relax'],
  'fibonacci-dp': ['state'],
  'digit-dp': ['memoization', 'tight'],
  'sprague-grundy': ['memoization'],
  'aho-corasick': ['failure link'],
  bridges: ['low-link'],
  'min-cost-max-flow': ['potential'],
  'heavy-light-decomposition': ['heavy child'],
}

for (const lesson of lessons) {
  const unit = lesson.knowledge
  if (!unit) { errors.push(`${lesson.id}: missing knowledge unit`); continue }
  if (!unit.motivation.problem || !unit.motivation.why || !unit.motivation.naive) errors.push(`${lesson.id}: incomplete motivation`)
  if (!unit.coreIdea || !unit.mentalModel) errors.push(`${lesson.id}: missing core idea or mental model`)
  if (unit.localPrerequisites.length < 2) errors.push(`${lesson.id}: fewer than two locally defined prerequisites`)
  if (unit.structure.length < 3) errors.push(`${lesson.id}: incomplete state/structure definitions`)
  if (unit.initialization.steps.length < 2 || !unit.initialization.result) errors.push(`${lesson.id}: incomplete initialization/build`)
  if (unit.operations.length < 3) errors.push(`${lesson.id}: incomplete operation lifecycle`)
  if (unit.operationFlow.length !== unit.operations.length) errors.push(`${lesson.id}: operation relationship mismatch`)
  if (Object.values(unit.complexity).some((value) => !value)) errors.push(`${lesson.id}: incomplete complexity profile`)
  if (!unit.implementation.input || !unit.implementation.output || unit.implementation.assumptions.length < 2 || !unit.implementation.relationship) errors.push(`${lesson.id}: incomplete implementation contract`)
  if (unit.example.steps.length < 3 || !unit.example.input || !unit.example.output) errors.push(`${lesson.id}: incomplete execution example`)
  if (unit.mistakes.length < 2 || unit.edgeCases.length < 2) errors.push(`${lesson.id}: incomplete mistakes or edge cases`)
  for (const dependency of unit.prerequisites) {
    if (!ids.has(dependency.lessonId)) errors.push(`${lesson.id}: unknown prerequisite ${dependency.lessonId}`)
    if (dependency.lessonId === lesson.id) errors.push(`${lesson.id}: self dependency`)
    if (!dependency.reason) errors.push(`${lesson.id}: prerequisite ${dependency.lessonId} has no reason`)
  }
  for (const term of requiredTerms[lesson.id] ?? []) {
    const vocabulary = [...unit.localPrerequisites, ...unit.structure].map((item) => `${item.term} ${item.meaning}`).join(' ').toLowerCase()
    if (!vocabulary.includes(term)) errors.push(`${lesson.id}: required term "${term}" is not defined`)
  }
}

const visiting = new Set<string>()
const visited = new Set<string>()
const visit = (id: string, path: string[]) => {
  if (visiting.has(id)) { errors.push(`dependency cycle: ${[...path, id].join(' -> ')}`); return }
  if (visited.has(id)) return
  visiting.add(id)
  for (const dependency of lessonById.get(id)?.knowledge?.prerequisites ?? []) visit(dependency.lessonId, [...path, id])
  visiting.delete(id)
  visited.add(id)
}
for (const lesson of lessons) visit(lesson.id, [])

const knowledgeSignatures = new Map<string, string>()
for (const lesson of lessons) {
  const unit = lesson.knowledge!
  const signature = JSON.stringify({ motivation: unit.motivation, coreIdea: unit.coreIdea, operations: unit.operations })
  const owner = knowledgeSignatures.get(signature)
  if (owner) errors.push(`${lesson.id}: knowledge unit duplicates ${owner}`)
  knowledgeSignatures.set(signature, lesson.id)
  for (const extension of unit.extensions) {
    const target = lessonById.get(extension.lessonId)
    if (!target?.knowledge?.prerequisites.some((dependency) => dependency.lessonId === lesson.id)) errors.push(`${lesson.id}: extension back-reference mismatch for ${extension.lessonId}`)
  }
}

const isolated = lessons.filter((lesson) => !lesson.knowledge?.prerequisites.length && !lesson.knowledge?.extensions.length)
for (const lesson of isolated) warnings.push(`${lesson.id}: standalone foundation; verify that this is intentional`)

const counts = Object.fromEntries([...new Set(lessons.map((lesson) => lesson.categoryId))].map((categoryId) => [categoryId, lessons.filter((lesson) => lesson.categoryId === categoryId).length]))
console.log(JSON.stringify({
  total: lessons.length,
  completeUnits: lessons.filter((lesson) => lesson.knowledge).length,
  dependencyEdges: lessons.reduce((sum, lesson) => sum + (lesson.knowledge?.prerequisites.length ?? 0), 0),
  linkedExtensions: lessons.reduce((sum, lesson) => sum + (lesson.knowledge?.extensions.length ?? 0), 0),
  isolatedFoundations: isolated.length,
  counts,
  warnings,
  errors,
}, null, 2))
if (errors.length) process.exitCode = 1
