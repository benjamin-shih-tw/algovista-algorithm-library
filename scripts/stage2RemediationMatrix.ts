import { mkdirSync, writeFileSync } from 'node:fs'
import { lessons } from '../src/algorithms'

type Grade = 'A'|'B'|'C'|'D'
type Repair = 'S0'|'S1'|'S2'|'S3'

const reviewed: Record<string,{animation:Grade;codeSync:Grade;repair:Repair;note:string}> = {
  'binary-search': {animation:'A',codeSync:'B',repair:'S0',note:'Concrete interval/midpoint trace; comparison frame can own the wrong primary code line.'},
  'bfs': {animation:'A',codeSync:'B',repair:'S0',note:'Concrete queue/distances; some discovery events map to nearby control-flow lines.'},
  'dijkstra': {animation:'A',codeSync:'B',repair:'S0',note:'Concrete heap/stale/relax trace; some relax events map to loop/header lines.'},
  'segment-tree': {animation:'B',codeSync:'B',repair:'S0',note:'Strong lifecycle; fix query-label/state inconsistency and exact code ownership.'},
  'prefix-xor': {animation:'D',codeSync:'D',repair:'S2',note:'No concrete px/a/XOR evolution; generic 10-step expansion.'},
  'fenwick-tree': {animation:'C',codeSync:'C',repair:'S1',note:'Useful lowbit/path states exist but BIT values do not execute continuously.'},
  'kmp': {animation:'D',codeSync:'D',repair:'S2',note:'No concrete pattern, i, j, pi evolution or fallback chain.'},
  'knapsack-01': {animation:'D',codeSync:'D',repair:'S2',note:'No real dp array mutation across items/capacities.'},
  'tarjan-scc': {animation:'C',codeSync:'C',repair:'S1',note:'Good disc/low/stack snapshots; generic expansion breaks continuous DFS execution.'},
  'digit-dp': {animation:'D',codeSync:'D',repair:'S2',note:'State dimensions are named but no concrete digit-state recursion is executed.'},
  'dinic': {animation:'D',codeSync:'D',repair:'S3',note:'Missing capacities, levels, blocking-flow paths and residual updates.'},
  'meet-in-the-middle': {animation:'D',codeSync:'D',repair:'S2',note:'20 code-position steps from 3 concepts; subset-sum lists never execute.'},
  'monotonic-stack': {animation:'C',codeSync:'C',repair:'S1',note:'Real stack snapshots exist but jump between examples without one continuous input.'},
  'topological-sort': {animation:'C',codeSync:'C',repair:'S1',note:'Concrete indegree/queue exists; missing edge-by-edge decrements and pushes.'},
  'lca-binary-lifting': {animation:'C',codeSync:'C',repair:'S1',note:'Concrete u/v/jump states; missing jump-table reasoning and continuous k scan.'},
  'lazy-segment-tree': {animation:'C',codeSync:'C',repair:'S1',note:'Covered intervals/tags known; 20 code steps spread across only a few semantic states.'},
  'longest-increasing-subsequence': {animation:'C',codeSync:'C',repair:'S1',note:'Concrete tails snapshots exist but do not execute one sequence continuously.'},
  'aho-corasick': {animation:'D',codeSync:'D',repair:'S2',note:'No concrete trie nodes, fail links, text cursor, fallback or reports.'},
  'min-cost-max-flow': {animation:'D',codeSync:'D',repair:'S3',note:'No concrete capacities/costs/path/bottleneck/reverse-edge/cumulative cost state.'},
  'extended-euclid': {animation:'D',codeSync:'D',repair:'S2',note:'No concrete recursion or Bézout coefficient back-substitution.'},
  'rotating-calipers': {animation:'D',codeSync:'D',repair:'S2',note:'No polygon, antipodal pair, area comparison or pointer movement.'},
  'fft': {animation:'D',codeSync:'D',repair:'S2',note:'No concrete coefficients, roots, butterfly values or transform stages.'},
}

const rows=lessons.map((lesson)=>({
  id:lesson.id,
  categoryId:lesson.categoryId,
  visualModel:lesson.visualModel??'none',
  animation:reviewed[lesson.id]?.animation??'UNREVIEWED',
  codeSync:reviewed[lesson.id]?.codeSync??'UNREVIEWED',
  repair:reviewed[lesson.id]?.repair??'UNREVIEWED',
  note:reviewed[lesson.id]?.note??'',
}))

const reviewedRows=rows.filter((row)=>row.animation!=='UNREVIEWED')
const summary={
  total:rows.length,
  reviewed:reviewedRows.length,
  remaining:rows.length-reviewedRows.length,
  animationGrades:Object.fromEntries(['A','B','C','D'].map((grade)=>[grade,reviewedRows.filter((row)=>row.animation===grade).length])),
  repairClasses:Object.fromEntries(['S0','S1','S2','S3'].map((repair)=>[repair,reviewedRows.filter((row)=>row.repair===repair).length])),
}

const md=[
  '# Stage 2 Remediation Matrix',
  '',
  `Reviewed **${summary.reviewed}/${summary.total}** lessons; **${summary.remaining}** remain.`,
  '',
  'This file tracks human semantic review. UNREVIEWED means no A/B/C/D claim has been made yet.',
  '',
  '| Lesson | Category | Visual model | Animation | Code sync | Repair | Note |',
  '|---|---|---|:---:|:---:|:---:|---|',
  ...rows.map((row)=>`| ${row.id} | ${row.categoryId} | ${row.visualModel} | ${row.animation} | ${row.codeSync} | ${row.repair} | ${row.note.replaceAll('|','\\|')} |`),
  '',
].join('\n')

mkdirSync('.tmp',{recursive:true})
writeFileSync('.tmp/stage2-remediation-matrix.json',JSON.stringify({summary,rows},null,2))
writeFileSync('.tmp/stage2-remediation-matrix.md',md)
console.log(JSON.stringify(summary,null,2))
