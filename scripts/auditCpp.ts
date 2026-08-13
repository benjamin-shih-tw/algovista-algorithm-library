import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { lessons } from '../src/algorithms'

const targets = ['segment-tree']
const errors: string[] = []

for (const id of targets) {
  const lesson = lessons.find((item) => item.id === id)
  if (!lesson) { errors.push(`${id}: missing lesson`); continue }
  const result = spawnSync('c++', ['-x', 'c++', '-std=c++17', '-c', '-o', join(tmpdir(), `algovista-${id}.o`), '-'], {
    input: lesson.code.join('\n'),
    encoding: 'utf8',
  })
  if (result.status !== 0) errors.push(`${id}: ${result.stderr.trim() || 'C++ compilation failed'}`)
}

console.log(JSON.stringify({ compiled: targets.length - errors.length, targets, errors }, null, 2))
if (errors.length) process.exitCode = 1
