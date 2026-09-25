import { lessons } from '../src/algorithms'
import { writeFileSync } from 'node:fs'
const out: string[] = []
for (const lesson of lessons) {
  lesson.frames.forEach((frame, i) => {
    const m = frame.explanation.match(/第 (\d+) 行負責/)
    if (!m) return
    const n = Number(m[1])
    const actual = lesson.code[n - 1]?.trim()
    const claimed = frame.codeLine?.trim()
    if (actual && claimed && actual !== claimed) {
      out.push(`${lesson.id} F${i + 1}: explanation says line ${n} = "${actual.slice(0, 50)}" but frame highlights "${claimed.slice(0, 50)}"`)
    }
  })
}
writeFileSync('.tmp/explainMismatches.txt', out.join('\n'))
console.log('total explain-vs-highlight mismatches:', out.length)
console.log(out.slice(0, 15).join('\n'))
