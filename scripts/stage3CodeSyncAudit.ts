import { mkdirSync, writeFileSync } from 'node:fs'
import { lessons } from '../src/algorithms'

const s0 = new Set([
  'binary-search','bfs','dijkstra','segment-tree','linear-search',
  'sliding-window','prefix-sum','two-pointers','difference-array',
  'coordinate-compression','kadane','selection-sort','bubble-sort',
  'quick-sort','convex-hull',
])

const specificSourceRe = /\b(if|else|return|swap|push|push_back|push_front|pop|pop_back|pop_front|insert|erase)\b|\bdist\s*\[|\bvisited\s*\[|\btree\s*\[|\+=|-=|\+\+|--|=[^=]|\bcross\s*\(/
const genericHeaderRe = /^(?:for\s*\(|[\w:<>, &*]+\s+[A-Za-z_]\w*\s*\([^;]*\)\s*\{?$)/

const rows = []
for (const lesson of lessons.filter((lesson) => s0.has(lesson.id))) {
  for (let i=0;i<lesson.frames.length;++i) {
    const frame=lesson.frames[i]
    const primaryLineNumber=frame.codeLines.find((number)=>lesson.code[number-1]?.trim()===frame.codeLine.trim()) ?? -1
    const unresolved=primaryLineNumber<0
    const line=frame.codeLine.trim()
    const specificCandidates=frame.codeLines
      .map((number)=>({number,line:(lesson.code[number-1]??'').trim()}))
      .filter((candidate)=>candidate.line && specificSourceRe.test(candidate.line))
    const genericHeaderPrimary=genericHeaderRe.test(line) &&
      specificCandidates.some((candidate)=>candidate.number!==primaryLineNumber) &&
      !/檢查|開始.*迭代|建立|確認.*設定|問題設定|函式|呼叫|理解|複雜度|成本|排序完成|完成.*成本|第.*輪|不再碰/.test(frame.title)
    rows.push({
      lessonId:lesson.id,
      step:i+1,
      title:frame.title,
      primaryLineNumber,
      primaryCode:line,
      ownedCodeLines:frame.codeLines,
      unresolved,
      genericHeaderPrimary,
      specificCandidates,
    })
  }
}

const summary={
  lessons:s0.size,
  frames:rows.length,
  unresolvedPrimary:rows.filter((r)=>r.unresolved).length,
  genericHeaderPrimary:rows.filter((r)=>r.genericHeaderPrimary).length,
  framesWithSpecificCandidates:rows.filter((r)=>r.specificCandidates.length>0).length,
}

mkdirSync('.tmp',{recursive:true})
writeFileSync('.tmp/stage3-code-sync-audit.json',JSON.stringify({summary,rows},null,2))
console.log(JSON.stringify(summary,null,2))
for (const row of rows) {
  console.log(JSON.stringify(row))
}
