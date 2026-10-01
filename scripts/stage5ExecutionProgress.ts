import { mkdirSync, writeFileSync } from 'node:fs'
import { lessons } from '../src/algorithms'

const rows=lessons.map((lesson)=>({
  id:lesson.id,
  categoryId:lesson.categoryId,
  traceMode:lesson.traceMode??'semantic',
  fidelity:lesson.fidelity??'semantic',
  frames:lesson.frames.length,
  visualModel:lesson.visualModel??'none',
}))

const execution=rows.filter((row)=>row.traceMode==='execution')
const semantic=rows.filter((row)=>row.traceMode!=='execution')
const summary={
  total:rows.length,
  execution:execution.length,
  semantic:semantic.length,
  executionPct:Math.round(execution.length/rows.length*1000)/10,
  byCategory:Object.fromEntries([...new Set(rows.map((row)=>row.categoryId))].map((category)=>[
    category,
    {
      total:rows.filter((row)=>row.categoryId===category).length,
      execution:rows.filter((row)=>row.categoryId===category&&row.traceMode==='execution').length,
    },
  ])),
}

mkdirSync('.tmp',{recursive:true})
writeFileSync('.tmp/stage5-execution-progress.json',JSON.stringify({summary,rows},null,2))
console.log(JSON.stringify(summary,null,2))
console.log('SEMANTIC REMAINING')
for(const row of semantic) console.log(row.id)
