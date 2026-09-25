import { lessons } from '../src/algorithms'
import { spawnSync } from 'node:child_process'
const pass: string[] = []
const fail: { id: string; err: string }[] = []
for (const lesson of lessons) {
  const code = lesson.code.join('\n')
  const r = spawnSync('c++', ['-x', 'c++', '-std=c++17', '-fsyntax-only', '-'], { input: code, encoding: 'utf8' })
  if (r.status === 0) pass.push(lesson.id)
  else fail.push({ id: lesson.id, err: (r.stderr.split('\n').find((l) => l.includes('error')) ?? '').trim() })
}
console.log('PASS', pass.length, JSON.stringify(pass))
const byErr: Record<string, string[]> = {}
for (const f of fail) {
  const key = f.err.replace(/:\d+:\d+:/, ':L:C:').replace(/'[^']*'/g, "'X'")
  ;(byErr[key] ??= []).push(f.id)
}
console.log('FAIL', fail.length)
for (const [k, ids] of Object.entries(byErr).sort((a, b) => b[1].length - a[1].length).slice(0, 12)) {
  console.log(`${ids.length}\t${k}\t${ids.slice(0, 8).join(',')}${ids.length > 8 ? '…' : ''}`)
}
