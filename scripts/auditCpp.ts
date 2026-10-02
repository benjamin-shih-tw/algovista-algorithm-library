import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { lessons } from '../src/algorithms'

type Result={id:string;ok:boolean;err:string}
type SnippetReason='missing-external-context'|'declaration-conflict'|'type-or-signature-mismatch'|'syntax-or-other'

const snippetReason=(diagnostic:string):SnippetReason=>{
  if(/undeclared identifier|unknown type name|no member named|has no member named|was not declared in this scope|does not name a type|variable or field .* declared void/.test(diagnostic))return 'missing-external-context'
  if(/redefinition|ambiguous/.test(diagnostic))return 'declaration-conflict'
  if(/no matching function|no viable conversion|reference to overloaded function|too many arguments|conversion from .* to non-scalar type|invalid conversion|cannot convert|invalid types .* for array subscript|no match for/.test(diagnostic))return 'type-or-signature-mismatch'
  return 'syntax-or-other'
}

const classifierFixtures:[string,SnippetReason][]=[
  ["error: use of undeclared identifier 'timer'",'missing-external-context'],
  ['error: ‘timer’ was not declared in this scope','missing-external-context'],
  ["error: no viable conversion from 'vector<long long>' to 'vector<int>'",'type-or-signature-mismatch'],
  ['error: conversion from ‘vector<long long int>’ to non-scalar type ‘vector<int>’ requested','type-or-signature-mismatch'],
  ["error: redefinition of 'prefix'",'declaration-conflict'],
]
for(const [diagnostic,expected] of classifierFixtures){
  if(snippetReason(diagnostic)!==expected)throw new Error(`C++ diagnostic classifier mismatch: ${diagnostic}`)
}

const compileLesson=(lesson:(typeof lessons)[number])=>new Promise<Result>((resolve)=>{
  const codeContent=lesson.code.join('\n')
  const fullCode=codeContent.includes('#include')
    ? codeContent
    : `#include <bits/stdc++.h>\nusing namespace std;\n${codeContent}\n`

  const child=spawn('c++',['-x','c++','-std=c++17','-fsyntax-only','-'],{
    stdio:['pipe','ignore','pipe'],
  })
  let stderr=''
  let settled=false
  const finish=(result:Result)=>{
    if(settled)return
    settled=true
    clearTimeout(timer)
    resolve(result)
  }
  child.stderr.on('data',(chunk)=>{ stderr+=String(chunk) })
  child.on('error',(error)=>finish({id:lesson.id,ok:false,err:error.message}))
  child.on('close',(status)=>{
    if(status===0) finish({id:lesson.id,ok:true,err:''})
    else {
      const firstError=stderr.split('\n').find((line)=>line.includes('error'))?.trim()
      finish({id:lesson.id,ok:false,err:firstError||`C++ compilation failed (exit ${status})`})
    }
  })
  const timer=setTimeout(()=>{
    child.kill('SIGKILL')
    finish({id:lesson.id,ok:false,err:'C++ compilation timed out after 10s'})
  },10_000)
  child.stdin.end(fullCode)
})

const results:Array<Result|undefined>=new Array(lessons.length)
let next=0
const worker=async()=>{
  while(true){
    const index=next++
    if(index>=lessons.length)return
    results[index]=await compileLesson(lessons[index])
  }
}
const concurrency=Math.min(8,lessons.length)
await Promise.all(Array.from({length:concurrency},()=>worker()))

const completed=results.filter((item):item is Result=>Boolean(item))
const compiled=completed.filter((item)=>item.ok).map((item)=>item.id)
const failed=completed.filter((item)=>!item.ok).map(({id,err})=>({id,err,reason:snippetReason(err)}))
const reasonCounts=Object.fromEntries(failed.reduce((counts,{reason})=>counts.set(reason,(counts.get(reason)??0)+1),new Map<SnippetReason,number>()))
const report={
  schemaVersion:2,
  total:lessons.length,
  compiled:compiled.length,
  snippet:failed.length,
  summary:{standalone:compiled.length,snippet:failed.length,snippetReasons:reasonCounts},
  compiledIds:compiled,
  failed,
  lessons:completed.map(({id,ok,err})=>ok
    ? {id,status:'standalone' as const}
    : {id,status:'snippet' as const,reason:snippetReason(err),diagnostic:err}),
}
mkdirSync('.tmp',{recursive:true})
writeFileSync('.tmp/cppAuditReport.json',JSON.stringify(report,null,2))
const markdown=[
  '# C++17 Compilation Coverage',
  '',
  `- Standalone syntax-verified: **${compiled.length} / ${lessons.length}**`,
  `- Teaching snippets requiring lesson/problem context: **${failed.length} / ${lessons.length}**`,
  '',
  'A snippet result is a classification, not a release failure. The audit does not invent judge I/O, domain helpers, or fake APIs to force standalone compilation.',
  '',
  '## Snippet reasons',
  '',
  '| Reason | Count |',
  '|---|---:|',
  ...Object.entries(reasonCounts).map(([reason,count])=>`| ${reason} | ${count} |`),
  '',
  '## Teaching snippets',
  '',
  '| Lesson | Reason | First compiler diagnostic |',
  '|---|---|---|',
  ...failed.map(({id,reason,err})=>`| ${id} | ${reason} | ${err.replace(/\|/g,'\\|')} |`),
  '',
]
writeFileSync('.tmp/cppAuditReport.md',markdown.join('\n'))

console.log(`compile-verified: ${compiled.length}/${lessons.length}`)
console.log(`remaining snippets: ${failed.length}`)
if(process.env.CPP_AUDIT_VERBOSE){
  for(const {id,err} of failed.slice(0,60)) console.log(`  ${id}: ${err}`)
}
