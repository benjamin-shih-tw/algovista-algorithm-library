import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { lessons } from '../src/algorithms'

// A3 fix：auditCpp 不再只驗 6 課。對全部課程做真實 C++17 語法編譯，並分級：
//   compiled — lesson.code（含 pedagogy 的競賽環境宣告）可獨立通過編譯
//   snippet  — 無法編譯；列出錯誤供後續批次升級
const compiled: string[] = []
const failed: { id: string; err: string }[] = []

for (const lesson of lessons) {
  const codeContent = lesson.code.join('\n')
  const fullCode = codeContent.includes('#include') ? codeContent : `#include <bits/stdc++.h>\nusing namespace std;\n${codeContent}\n`
  const result = spawnSync('c++', ['-x', 'c++', '-std=c++17', '-fsyntax-only', '-'], {
    input: fullCode,
    encoding: 'utf8',
  })
  if (result.status === 0) compiled.push(lesson.id)
  else {
    const firstError = (result.stderr.split('\n').find((line) => line.includes('error')) ?? '').trim()
    failed.push({ id: lesson.id, err: firstError || 'C++ compilation failed' })
  }
}

const report = {
  total: lessons.length,
  compiled: compiled.length,
  snippet: failed.length,
  compiledIds: compiled,
  failed,
}
writeFileSync('.tmp/cppAuditReport.json', JSON.stringify(report, null, 2))

console.log(`compile-verified: ${compiled.length}/${lessons.length}`)
console.log(`remaining snippets: ${failed.length}`)
if (process.env.CPP_AUDIT_VERBOSE) {
  for (const { id, err } of failed.slice(0, 40)) console.log(`  ${id}: ${err}`)
}
