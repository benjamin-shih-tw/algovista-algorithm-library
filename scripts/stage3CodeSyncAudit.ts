import { mkdirSync, writeFileSync } from 'node:fs'
import { lessons } from '../src/algorithms'

const s0 = new Set([
  'binary-search','bfs','dijkstra','segment-tree','linear-search',
  'sliding-window','prefix-sum','two-pointers','difference-array',
  'coordinate-compression','kadane','selection-sort','bubble-sort',
  'quick-sort','convex-hull',
])

const mutationRe = /交換|swap|寫回|更新|加入|移除|push|pop|前進|縮小|擴張|歸位|固定|relax|鬆弛|assign|set/i
const compareRe = /比較|判斷|<|>|≤|≥|==|命中|左轉|右轉|cross/i
const sourceMutationRe = /\b(swap|push|pop|insert|erase|relax)\b|\+\+|--|\+=|-=|\*=|\/=|=[^=]/i
const sourceDecisionRe = /\b(if|while|for)\b|<|>|==|<=|>=|cross/i

const rows = []
for (const lesson of lessons.filter((lesson) => s0.has(lesson.id))) {
  for (let i=0;i<lesson.frames.length;++i) {
    const frame=lesson.frames[i]
    const primaryLineNumber=frame.codeLines.find((number)=>lesson.code[number-1]?.trim()===frame.codeLine.trim()) ?? -1
    const unresolved=primaryLineNumber<0
    const eventText=`${frame.title} ${frame.explanation}`
    const wantsMutation=mutationRe.test(eventText)
    const wantsDecision=compareRe.test(eventText)
    const line=frame.codeLine.trim()
    const mutationMismatch=wantsMutation && !sourceMutationRe.test(line) && !sourceDecisionRe.test(line)
    const decisionMismatch=wantsDecision && !sourceDecisionRe.test(line) && !sourceMutationRe.test(line)
    rows.push({
      lessonId:lesson.id,
      step:i+1,
      title:frame.title,
      primaryLineNumber,
      primaryCode:line,
      ownedCodeLines:frame.codeLines,
      unresolved,
      mutationMismatch,
      decisionMismatch,
    })
  }
}

const summary={
  lessons:s0.size,
  frames:rows.length,
  unresolvedPrimary:rows.filter((r)=>r.unresolved).length,
  heuristicMutationMismatch:rows.filter((r)=>r.mutationMismatch).length,
  heuristicDecisionMismatch:rows.filter((r)=>r.decisionMismatch).length,
}

mkdirSync('.tmp',{recursive:true})
writeFileSync('.tmp/stage3-code-sync-audit.json',JSON.stringify({summary,rows},null,2))
console.log(JSON.stringify(summary,null,2))
for (const row of rows) {
  console.log(JSON.stringify(row))
}
