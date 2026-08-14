import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { lessons } from '../src/algorithms'

const targets = ['segment-tree', 'fenwick-tree', 'lazy-segment-tree', 'persistent-segment-tree', 'sparse-table', 'dsu']
const errors: string[] = []

for (const id of targets) {
  const lesson = lessons.find((item) => item.id === id)
  if (!lesson) { errors.push(`${id}: missing lesson`); continue }
  const codeContent = lesson.code.join('\n')
  const fullCode = codeContent.includes('#include') ? codeContent : `#include <bits/stdc++.h>\nusing namespace std;\n${codeContent}\n`
  const result = spawnSync('c++', ['-x', 'c++', '-std=c++17', '-fsyntax-only', '-'], {
    input: fullCode,
    encoding: 'utf8',
  })
  if (result.status !== 0) errors.push(`${id}: ${result.stderr.trim() || 'C++ compilation failed'}`)
}

console.log(JSON.stringify({ compiled: targets.length - errors.length, targets, errors }, null, 2))
if (errors.length) process.exitCode = 1
