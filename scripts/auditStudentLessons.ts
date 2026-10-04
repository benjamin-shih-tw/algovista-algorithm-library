import assert from 'node:assert/strict'
import { lessons } from '../src/algorithms'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { kmpLesson, zLesson, rollingLesson, rabinLesson } from '../src/studentStringLessons'
import { lowlinkLesson, tarjanLesson } from '../src/studentGraphLessons'
import { centroidLesson, digitLesson } from '../src/studentTreeDpLessons'
import type { StudentLesson } from '../src/studentTrace'

const ids = ['kmp', 'z-algorithm', 'rolling-hash', 'rabin-karp', 'tarjan-scc', 'bridges', 'articulation-points', 'tree-centroid', 'centroid-decomposition', 'digit-dp']
assert.equal(lessons.find((item)=>item.id==='kmp')!.complexity,'O(n)','Prefix-table lesson must not claim text-search complexity')
assert.ok(lessons.find((item)=>item.id==='rabin-karp')!.complexity.includes('O(nm)'),'Exact collision verification needs its worst-case bound')
for (const id of ids) {
  const lesson = lessons.find((item) => item.id === id)!
  assert.ok(lesson.studentGuide, `${id}: missing authored student guide`)
  assert.ok(lesson.studentGuide.terms.length >= 3, `${id}: define the actual variables`)
  assert.ok(lesson.studentGuide.reasoning.length >= 3, `${id}: explain correctness`)
  for (const [index, frame] of lesson.frames.entries()) {
    assert.ok(frame.executionView, `${id}/${index}: missing data-driven scene`)
    assert.ok(frame.teaching && Object.values(frame.teaching).every(Boolean), `${id}/${index}: missing step reasoning`)
    assert.ok(frame.codeLines.some((line) => lesson.code[line - 1]?.trim() === frame.codeLine), `${id}/${index}: code mismatch`)
  }
}
console.log(`Student teaching contracts: ${ids.length}/${ids.length}`)
for (const frame of [kmpLesson().frames[0], kmpLesson().frames.at(-1)!]) {
  const view=frame.executionView!
  assert.ok(view.kind==='table'&&view.rows.every((row)=>row[3]==='—'),'KMP must not display a comparison pointer before it exists or after the loop ends')
}

const last = (lesson: StudentLesson) => lesson.frames.at(-1)!.state!
const words = (max: number) => Array.from({length: 2 ** (max + 1) - 1}, (_, index) => (index + 1).toString(2).slice(1).replaceAll('0','a').replaceAll('1','b'))
let cases = 0
for (const s of words(5)) {
  const pi = [...s].map((_, i) => {
    let best=0
    for(let length=1;length<=i;length++)if(s.slice(0,length)===s.slice(i-length+1,i+1))best=length
    return String(best)
  })
  const z = [...s].map((_, i) => {
    if(i===0)return '0'
    let length=0
    while(i+length<s.length&&s[length]===s[i+length])length++
    return String(length)
  })
  assert.deepEqual(last(kmpLesson(s)).pi,pi,`KMP ${s}`)
  assert.deepEqual(last(zLesson(s)).z,z,`Z ${s}`)
  for (const p of words(3)) {
    const expected = p.length ? [...s].flatMap((_,i)=>s.slice(i,i+p.length)===p?[String(i)]:[]) : []
    assert.deepEqual(last(rabinLesson(s,p)).matches,expected,`Rabin–Karp ${s}/${p}`)
    cases++
  }
  for(let l=0;l<=s.length;l++)for(let r=l;r<=s.length;r++) {
    const expected=[...s.slice(l,r)].reduce((hash,c)=>(hash*31+c.charCodeAt(0)-96)%101,0)
    assert.equal(last(rollingLesson(s,l,r)).result,expected,`Hash ${s}[${l},${r})`)
    cases++
  }
}
// Deliberate collision: different strings, same hash. Verification must reject it.
const alphabet='abcdefghijklmnopqrstuvwxyz'
const hashBuckets=new Map<number,string>()
let collision:[string,string]|undefined
for(const a of alphabet)for(const b of alphabet){const s=a+b,h=[...s].reduce((x,c)=>(x*31+c.charCodeAt(0)-96)%101,0);const other=hashBuckets.get(h);if(other&&other!==s)collision=[other,s];hashBuckets.set(h,s)}
assert.ok(collision)
const collided=rabinLesson(collision[0],collision[1])
assert.ok(collided.frames.some((frame)=>frame.state?.verified==='collision'))
assert.deepEqual(last(collided).matches,[])

const components=(n:number,edges:number[][],removed=-1)=>{
  const seen=new Set<number>();let count=0
  const visit=(u:number)=>{seen.add(u);for(const [a,b] of edges){const v=a===u?b:b===u?a:-1;if(v>=0&&v!==removed&&!seen.has(v))visit(v)}}
  for(let u=0;u<n;u++)if(u!==removed&&!seen.has(u)){count++;visit(u)}
  return count
}
const allEdges=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]
const name=(u:number)=>String.fromCharCode(65+u)
const edgeName=([a,b]:number[])=>[name(a),name(b)].sort().join('-')
for(let mask=0;mask<64;mask++) {
  const edges=allEdges.filter((_,i)=>mask&(1<<i)),base=components(4,edges)
  const result=last(lowlinkLesson('bridges',4,edges))
  const expectedBridges=edges.filter((_,i)=>components(4,edges.filter((_,j)=>j!==i))>base).map(edgeName).sort()
  const actualBridges=(result.bridges as string[]).map((s)=>s.split('-').sort().join('-')).sort()
  assert.deepEqual(actualBridges,expectedBridges,`Bridges mask ${mask}`)
  const cuts=[0,1,2,3].filter((v)=>components(4,edges,v)>base).map(name)
  assert.deepEqual(result.cuts,cuts,`Cuts mask ${mask}`)
  cases++
}
assert.deepEqual(last(lowlinkLesson('bridges',2,[[0,1],[0,1]])).bridges,[],'Parallel edges are not bridges')
const directed=[[0,1],[1,0],[0,2],[2,0],[1,2],[2,1]]
for(let mask=0;mask<64;mask++) {
  const edges=directed.filter((_,i)=>mask&(1<<i)),reach=Array.from({length:3},(_,i)=>Array.from({length:3},(_,j)=>i===j||edges.some(([u,v])=>u===i&&v===j)))
  for(let k=0;k<3;k++)for(let i=0;i<3;i++)for(let j=0;j<3;j++)reach[i][j] ||= reach[i][k]&&reach[k][j]
  const result=last(tarjanLesson(3,edges)).component as string[]
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)assert.equal(result[i]===result[j],reach[i][j]&&reach[j][i],`SCC ${mask}: ${i},${j}`)
  cases++
}
for(const edges of [[],[[0,1]],[[0,1],[1,2],[2,3],[3,4],[4,5]],[[0,1],[0,2],[0,3],[0,4],[0,5]],[[0,1],[0,2],[1,3],[1,4],[3,5]]]) {
  const n=edges.length+1,c=Number(last(centroidLesson(false,edges,n)).result)
  const seen=new Set<number>([c])
  const size=(u:number):number=>{seen.add(u);let result=1;for(const [a,b] of edges){const v=a===u?b:b===u?a:-1;if(v>=0&&!seen.has(v))result+=size(v)}return result}
  for(let u=0;u<n;u++)if(!seen.has(u))assert.ok(size(u)<=n/2,`Centroid balance n=${n}`)
  const decomposition=last(centroidLesson(true,edges,n)),parents=(decomposition.parent as string[]).map(Number)
  assert.equal(parents.filter((p)=>p===-1).length,1)
  assert.deepEqual(decomposition.removed,Array(n).fill('1'))
  for(let u=0;u<n;u++){const path=new Set<number>();for(let v=u;v!==-1;v=parents[v]){assert.ok(!path.has(v),'Centroid parent cycle');path.add(v)}}
  cases++
}
for(let bound=0;bound<=100;bound++) {
  const lesson=digitLesson(String(bound))
  const expected=Array.from({length:bound},(_,i)=>i+1).filter((value)=>[...String(value)].reduce((sum,d)=>sum+Number(d),0)%3===0).length
  assert.equal(last(lesson).result,expected,`Digit DP ${bound}`)
  for(const frame of lesson.frames)if(frame.state?.nextCount!==undefined)assert.equal(frame.state.nextCount,Number(frame.state.previous)+Number(frame.state.ways),'Digit count must accumulate, not overwrite')
  cases++
}
console.log(`Independent reference cases: ${cases}, plus collision / parallel-edge / transition checks`)

const cppCases: Record<string,[string,string]> = {
  kmp: ['for(int v:prefixFunction("ababaca")) cout<<v<<",";', '0,0,1,2,3,0,1,'],
  'z-algorithm': ['for(int v:zFunction("ababa")) cout<<v<<",";', '0,0,3,0,1,'],
  'rolling-hash': ['cout<<substringHash("abca",1,3);','65'],
  'rabin-karp': ['for(int v:rabinKarp("abacaba","aba")) cout<<v<<",";','0,4,'],
  'tarjan-scc': ['for(int v:tarjan(6,{{0,1},{1,2},{2,0},{2,3},{3,4},{4,3},{4,5}})) cout<<v<<",";', '2,2,2,1,1,0,'],
  bridges: ['auto result=lowlink(6,{{0,1},{1,2},{2,0},{1,3},{3,4},{4,5},{5,3}}); for(auto [u,v]:result.first)cout<<u<<"-"<<v;', '1-3'],
  'articulation-points': ['auto result=lowlink(6,{{0,1},{1,2},{2,0},{1,3},{3,4},{4,5},{5,3}}); for(int v:result.second)cout<<v<<",";', '0,1,0,1,0,0,'],
  'tree-centroid': ['CentroidSolver solver({{1,2},{0,3,4},{0},{1,5},{1},{3}}); cout<<solver.findCentroid(0);','1'],
  'centroid-decomposition': ['CentroidSolver solver({{1,2},{0,3,4},{0},{1,5},{1},{3}}); for(int v:solver.build())cout<<v<<",";','1,-1,0,1,1,3,'],
  'digit-dp': ['cout<<countDigitSumMultipleOf3("25");','8'],
}
const temporary=mkdtempSync(join(tmpdir(),'algovista-student-cpp-'))
try {
  for(const [id,[main,expected]] of Object.entries(cppCases)) {
    const lesson=lessons.find((item)=>item.id===id)!,file=join(temporary,`${id}.cpp`),executable=join(temporary,id)
    writeFileSync(file,`${lesson.code.join('\n')}\nint main() { ${main} }\n`)
    const compile=spawnSync('c++',['-std=c++17',file,'-o',executable],{encoding:'utf8',timeout:20000})
    assert.equal(compile.status,0,`${id}: ${compile.stderr}`)
    const result=spawnSync(executable,[],{encoding:'utf8',timeout:5000})
    assert.equal(result.status,0,`${id}: ${result.stderr}`)
    assert.equal(result.stdout,expected,`${id}: actual C++ output`)
  }
} finally { rmSync(temporary,{recursive:true,force:true}) }
console.log('Actual displayed C++ compiled and executed: 10/10')
