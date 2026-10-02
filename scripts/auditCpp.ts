import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { lessons } from '../src/algorithms'

type Result={id:string;ok:boolean;err:string}

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
const failed=completed.filter((item)=>!item.ok).map(({id,err})=>({id,err}))
const report={
  total:lessons.length,
  compiled:compiled.length,
  snippet:failed.length,
  compiledIds:compiled,
  failed,
}
mkdirSync('.tmp',{recursive:true})
writeFileSync('.tmp/cppAuditReport.json',JSON.stringify(report,null,2))

console.log(`compile-verified: ${compiled.length}/${lessons.length}`)
console.log(`remaining snippets: ${failed.length}`)
if(process.env.CPP_AUDIT_VERBOSE){
  for(const {id,err} of failed.slice(0,60)) console.log(`  ${id}: ${err}`)
}
