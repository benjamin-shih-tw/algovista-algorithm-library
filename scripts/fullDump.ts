import { lessons } from '../src/algorithms'
import { writeFileSync } from 'node:fs'

const out: string[] = []
for (const lesson of lessons) {
  out.push('#'.repeat(100))
  out.push(`LESSON ${lesson.index} | id=${lesson.id} | cat=${lesson.categoryId}/${lesson.subcategory} | visual=${lesson.visual} | model=${lesson.visualModel}`)
  out.push(`TITLE: ${lesson.title} / ${lesson.zhTitle}`)
  out.push(`DESC: ${lesson.description}`)
  out.push(`COMPLEXITY: ${lesson.complexity}`)
  out.push(`USAGE: ${JSON.stringify(lesson.usage)}`)
  out.push(`PRACTICE: ${JSON.stringify(lesson.practice)}`)
  out.push(`SOURCES: ${JSON.stringify(lesson.sources?.map((s) => s.label + ' :: ' + s.title))}`)
  out.push(`--- CODE (${lesson.code.length} lines) ---`)
  lesson.code.forEach((line, i) => out.push(`${String(i + 1).padStart(3, ' ')}| ${line}`))
  out.push(`--- FRAMES (${lesson.frames.length}) ---`)
  lesson.frames.forEach((frame, i) => {
    out.push(`[F${i + 1}] ${frame.title}`)
    out.push(`  explain: ${frame.explanation}`)
    out.push(`  codeLine: ${frame.codeLine} | codeLines: [${frame.codeLines.join(',')}]`)
    out.push(`  state: ${JSON.stringify(frame.state ?? {})}`)
    if (frame.values) out.push(`  values: [${frame.values.join(',')}]`)
    if (frame.active) out.push(`  active: [${frame.active.join(',')}]`)
    if (frame.accepted) out.push(`  accepted: [${frame.accepted.join(',')}]`)
    if (frame.muted) out.push(`  muted: [${frame.muted.join(',')}]`)
    if (frame.queue) out.push(`  queue: [${frame.queue.join(',')}]`)
    if (frame.priorityQueue) out.push(`  priorityQueue: [${frame.priorityQueue.join(',')}]`)
    if (frame.distances) out.push(`  distances: ${JSON.stringify(frame.distances)}`)
    if (frame.hull) out.push(`  hull: [${frame.hull.join(',')}]`)
    if (frame.low !== undefined) out.push(`  low=${frame.low} high=${frame.high ?? '?'} mid=${frame.mid ?? '-'}`)
    if (frame.trace) out.push(`  trace: sig=${frame.trace.signature} nodes=${JSON.stringify(frame.trace.nodes.map((n) => n.label + '=' + n.value))} focus=[${frame.trace.focus.join(',')}]`)
    if (frame.beginner) out.push(`  beginner.observe: ${frame.beginner.observe}\n  beginner.action: ${frame.beginner.action}\n  beginner.reason: ${frame.beginner.reason}\n  beginner.result: ${frame.beginner.result}`)
    if (frame.visualCue) out.push(`  cue: ${frame.visualCue.mode}/${frame.visualCue.label}`)
  })
  if (lesson.beginnerGuide) {
    out.push(`--- BEGINNER GUIDE ---`)
    out.push(`mentalModel: ${lesson.beginnerGuide.mentalModel}`)
    out.push(`prerequisite: ${lesson.beginnerGuide.prerequisite}`)
    out.push(`invariant: ${lesson.beginnerGuide.invariant}`)
    lesson.beginnerGuide.walkthrough.forEach((w) => out.push(`walk: ${w}`))
    lesson.beginnerGuide.pitfalls.forEach((p) => out.push(`pitfall: ${p}`))
    lesson.beginnerGuide.glossary.forEach((g) => out.push(`glossary: ${g.term} = ${g.meaning}`))
  }
  if (lesson.knowledge) {
    const k = lesson.knowledge
    out.push(`--- KNOWLEDGE (scope=${k.implementation.scope}) ---`)
    out.push(`prereq: ${k.prerequisites.map((p) => p.lessonId).join(',') || '(none)'}`)
    out.push(`motivation.why: ${k.motivation.why}`)
    out.push(`motivation.naive: ${k.motivation.naive}`)
    out.push(`coreIdea: ${k.coreIdea}`)
    out.push(`initialization: ${k.initialization.goal} | ${k.initialization.result}`)
    out.push(`operations: ${k.operations.map((o) => `[${o.name}] reads=${o.reads} writes=${o.writes} cx=${o.complexity}`).join(' || ')}`)
    out.push(`complexity: pre=${k.complexity.preprocessing} query=${k.complexity.query} update=${k.complexity.update} mem=${k.complexity.memory} note=${k.complexity.note}`)
    out.push(`implementation: in=${k.implementation.input} out=${k.implementation.output}`)
    out.push(`example.in: ${k.example.input}`)
    out.push(`example.out: ${k.example.output}`)
    out.push(`mistakes: ${k.mistakes.join(' / ')}`)
    out.push(`edgeCases: ${k.edgeCases.join(' / ')}`)
    out.push(`extensions: ${k.extensions.slice(0, 8).map((e) => e.lessonId).join(',') || '(none)'}`)
  }
  if (lesson.codeGuide) {
    out.push(`--- CODE GUIDE (${lesson.codeGuide.length}) ---`)
    lesson.codeGuide.forEach((g) => out.push(`L${g.lineNumber} [${g.role}] ${g.code}\n  purpose: ${g.purpose}\n  effect: ${g.effect}`))
  }
}
writeFileSync('.tmp/fullDump.txt', out.join('\n'))
console.log(`dumped ${lessons.length} lessons, ${out.length} lines`)
