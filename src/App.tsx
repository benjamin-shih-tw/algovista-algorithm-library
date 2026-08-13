import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowLeft, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Eye, ExternalLink, Layers3, Lightbulb, Pause, Play, RotateCcw, Search, ShieldCheck, Sparkles, Target, Zap } from 'lucide-react'
import { categories, lessons, segmentNodes, segmentValues, type AlgorithmCategory, type AlgorithmLesson, type Frame, type VisualKind } from './algorithms'
import { CppCode } from './CppCode'
import { ArrayAdaptiveScene, DPAdaptiveScene, FlowAdaptiveScene, GeometryAdaptiveScene, GraphAdaptiveScene, LinearAdaptiveScene, MathAdaptiveScene, RangeAdaptiveScene, StringAdaptiveScene, TransformAdaptiveScene, TreeAdaptiveScene } from './AdaptiveScenes'
import DotPattern from '@/components/ui/dot-pattern-1'
import { clipSegmentToNodeRadii, edgeLabelPosition } from './visualGeometry'
import { humanizeStateKey, humanizeStateValue } from './pedagogy'

const INTERVAL = 5200

const BEGINNER_PATH = [
  { id: 'linear-search', step: '01', reason: '先學會逐格讀值、比較條件與排除候選。' },
  { id: 'binary-search', step: '02', reason: '接著理解「為什麼能安全丟掉一半」。' },
  { id: 'prefix-sum', step: '03', reason: '第一次體驗用預處理換取更快查詢。' },
  { id: 'bfs', step: '04', reason: '把陣列思維擴展到圖，學會 queue 與逐層搜尋。' },
  { id: 'segment-tree', step: '05', reason: '最後組合遞迴、區間分解與資料結構。' },
] as const

const beginnerRank = new Map<string,string>(BEGINNER_PATH.map((item) => [item.id, item.step]))

function GraphScene({ lesson, frame }: { lesson: AlgorithmLesson; frame: Frame }) {
  const adaptive = GraphAdaptiveScene({ lesson, frame })
  if (adaptive) return adaptive
  const points = lesson.points?.length ? lesson.points : [
    { id: 'A', x: 14, y: 48, label: 'A' }, { id: 'B', x: 34, y: 22, label: 'B' },
    { id: 'C', x: 34, y: 74, label: 'C' }, { id: 'D', x: 58, y: 22, label: 'D' },
    { id: 'E', x: 60, y: 70, label: 'E' }, { id: 'F', x: 84, y: 46, label: 'F' },
  ]
  const edges = lesson.edges?.length ? lesson.edges : [
    { from: 'A', to: 'B' }, { from: 'A', to: 'C' }, { from: 'B', to: 'D' },
    { from: 'B', to: 'E' }, { from: 'C', to: 'E' }, { from: 'D', to: 'F' }, { from: 'E', to: 'F' },
  ]
  const point = (id: string) => points.find((item) => item.id === id)!
  const frontier = frame.priorityQueue ?? frame.queue
  const frontierLabel = frame.priorityQueue ? 'MIN-PRIORITY QUEUE' : 'QUEUE'
  return <div className="scene graph-scene">
    <svg viewBox="0 0 1000 430" aria-label={`${lesson.title} graph`}>
      {edges.map((edge, index) => {
        const from = point(edge.from), to = point(edge.to)
        const lit = frame.active?.includes(edge.from) && frame.active?.includes(edge.to)
        return <g key={`${edge.from}-${edge.to}-${index}`}>
          <motion.line x1={from.x * 10} y1={from.y * 4.3} x2={to.x * 10} y2={to.y * 4.3} className={lit ? 'graph-edge lit' : 'graph-edge'} animate={{ opacity: lit ? 1 : .25 }} />
          {edge.weight !== undefined && <text x={(from.x + to.x) * 5} y={(from.y + to.y) * 2.15 - 9} className="edge-weight">{edge.weight}</text>}
        </g>
      })}
      {points.map((node) => {
        const active = frame.active?.includes(node.id), accepted = frame.accepted?.includes(node.id)
        return <motion.g key={node.id} animate={{ scale: active ? 1.08 : 1 }} style={{ transformOrigin: `${node.x * 10}px ${node.y * 4.3}px` }}>
          <circle cx={node.x * 10} cy={node.y * 4.3} r="33" className={`graph-node ${active ? 'active' : ''} ${accepted ? 'accepted' : ''}`} style={{ '--lesson-accent': lesson.accent } as React.CSSProperties} />
          <text x={node.x * 10} y={node.y * 4.3 + 5} className="graph-label">{node.label}</text>
          {frame.distances && <text x={node.x * 10} y={node.y * 4.3 + 54} className="distance-label">{frame.distances[node.id]}</text>}
        </motion.g>
      })}
    </svg>
    {frontier && <div className={`queue ${frame.priorityQueue?'priority-queue':''}`}><span>{frontierLabel}</span>{frontier.length ? frontier.map((item,index) => <motion.i layout key={`${item}-${index}`}>{item}</motion.i>) : <em>empty</em>}</div>}
  </div>
}

function ArrayScene({ lesson, frame }: { lesson: AlgorithmLesson; frame: Frame }) {
  const adaptive = ArrayAdaptiveScene({ lesson, frame })
  if (adaptive) return adaptive
  const state=frame.state??{}
  const valueCount=frame.values!.length
  const rangeLow=Math.max(0,Math.min(valueCount-1,frame.low??0))
  const rangeHigh=Math.max(rangeLow,Math.min(valueCount-1,frame.high??valueCount-1))
  const rangeSpan=rangeHigh-rangeLow+1
  const sceneCopy: Record<string, { label: string; range: string; focus: string; low: string; high: string }> = {
    'binary-search': { label: 'SORTED SEARCH SPACE', range: 'CANDIDATE', focus: 'TARGET', low: 'LOW', high: 'HIGH' },
    'linear-search': { label: 'UNSORTED LINEAR SCAN', range: 'UNCHECKED', focus: 'TARGET', low: 'SCAN', high: 'END' },
    'two-pointers': { label: 'SORTED PAIR SEARCH', range: 'ACTIVE INTERVAL', focus: 'TARGET SUM', low: 'L', high: 'R' },
    'sliding-window': { label: 'POSITIVE SLIDING WINDOW', range: 'CURRENT WINDOW', focus: 'TARGET SUM', low: 'L', high: 'R' },
    'prefix-sum': { label: 'PREFIX BUILD & RANGE QUERY', range: 'FOCUS RANGE', focus: 'QUERY', low: 'L', high: 'R' },
    'difference-array': { label: 'DIFFERENCE EVENTS & RESTORE', range: 'UPDATE RANGE', focus: 'RANGE ADD', low: 'START', high: 'END' },
    'coordinate-compression': { label: 'VALUE → DENSE RANK MAPPING', range: 'MAPPING FOCUS', focus: 'ORDER RULE', low: 'FIRST', high: 'LAST' },
    'kadane': { label: 'ENDING SUM / GLOBAL BEST', range: 'CURRENT SUBARRAY', focus: 'BEST SUM', low: 'START', high: 'END' },
    'selection-sort': { label: 'MINIMUM SELECTION PER PASS', range: 'UNSORTED SUFFIX', focus: 'CURRENT MIN', low: 'BOUNDARY', high: 'END' },
    'bubble-sort': { label: 'ADJACENT INVERSION SWAPS', range: 'UNFIXED PREFIX', focus: 'PASS', low: 'START', high: 'FIXED EDGE' },
    'merge-sort': { label: 'DIVIDE → MERGE → WRITE BACK', range: 'ACTIVE CALL', focus: 'BUFFER', low: 'L', high: 'R−1' },
    'quick-sort': { label: 'PARTITION AROUND PIVOT', range: 'ACTIVE CALL', focus: 'PIVOT', low: 'L', high: 'R' },
  }
  const copy=sceneCopy[lesson.id]??{label:'ARRAY STATE',range:'ACTIVE RANGE',focus:'FOCUS',low:'LEFT',high:'RIGHT'}
  const focusValue=lesson.id==='difference-array'?'[1,4] += 2':
    lesson.id==='prefix-sum'?(state.query??'[1,4]'):
    lesson.id==='coordinate-compression'?(state.mapping??state.mustPreserve??'< and =='):
    lesson.id==='kadane'?(state.best??state.result??'not computed'):
    lesson.id==='selection-sort'?(state.minValue??state.mn??'scanning'):
    lesson.id==='bubble-sort'?(state.pass??0):
    lesson.id==='merge-sort'?(state.buffer??state.result??state.split??state.call??'divide'):
    lesson.id==='quick-sort'?(state.pivot??state.result??'choose pivot'):
    (state.target??state.pivot??state.query??state.window??lesson.zhTitle)
  const insightEntry=Object.entries(state).find(([key])=>['comparison','calculation','condition','update','decision','result','invariant','prerequisite'].includes(key))
  return <div className="scene array-scene">
    <div className="array-scene-head"><span>{copy.label}</span><b>{copy.range} {String(state.candidate??state.window??`[${frame.low}, ${frame.high}]`)}</b></div>
    <div className="target-chip">{copy.focus} <strong>{Array.isArray(focusValue)?focusValue.join(' · '):focusValue}</strong></div>
    <div className="big-array" style={{gridTemplateColumns:`repeat(${valueCount}, minmax(0, 1fr))`}}>
      {frame.values!.map((value, index) => {
        const muted = frame.muted?.includes(String(index)), active = frame.mid === index || frame.active?.includes(String(index)), accepted = frame.accepted?.includes(String(index)), candidate=index>=(frame.low??0)&&index<=(frame.high??frame.values!.length-1)
        const pointers=[frame.low===index?copy.low:'',frame.mid===index?'MID':'',frame.high===index?copy.high:''].filter(Boolean)
        return <motion.div key={index} className={`big-cell ${candidate?'candidate':''} ${active?'active':''} ${accepted?'accepted':''} ${muted?'eliminated':''}`} animate={{ opacity: muted ? .13 : 1, y: active ? -8 : 0, scale: accepted ? 1.08 : 1 }} transition={{type:'spring',stiffness:260,damping:22}} style={{ '--lesson-accent': lesson.accent } as React.CSSProperties}>
          <span>{index}</span><strong>{value}</strong>{pointers.length>0&&<small>{pointers.join(' · ')}</small>}
        </motion.div>
      })}
    </div>
    <div className="range-track"><motion.div className="range-fill" animate={{ left: `calc((100% + var(--array-gap)) * ${rangeLow} / ${valueCount})`, width: `calc((100% + var(--array-gap)) * ${rangeSpan} / ${valueCount} - var(--array-gap))` }} style={{ background: lesson.accent }} /></div>
    {insightEntry&&<motion.div key={`${frame.title}-${insightEntry[0]}`} className="array-insight" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}><span>{insightEntry[0]}</span><strong>{Array.isArray(insightEntry[1])?insightEntry[1].join(' · '):insightEntry[1]}</strong></motion.div>}
  </div>
}

function GeometryScene({ lesson, frame }: { lesson: AlgorithmLesson; frame: Frame }) {
  const adaptive = GeometryAdaptiveScene({ lesson, frame })
  if (adaptive) return adaptive
  const points = lesson.points?.length ? lesson.points : [
    { id: 'P1', x: 12, y: 70, label: '1' }, { id: 'P2', x: 20, y: 28, label: '2' },
    { id: 'P3', x: 40, y: 48, label: '3' }, { id: 'P4', x: 50, y: 16, label: '4' },
    { id: 'P5', x: 62, y: 62, label: '5' }, { id: 'P6', x: 80, y: 24, label: '6' },
    { id: 'P7', x: 90, y: 70, label: '7' }, { id: 'P8', x: 44, y: 82, label: '8' },
  ]
  const phase=framePhase(frame),progress=frame.visualProgress??0,sceneCursor=progressIndex(frame,points.length-1)
  if(lesson.id.includes('circle')) { const focusX=520+25*progress,focusY=220-95*Math.max(0,(progress-.45)/.55); return <div className="scene geometry-scene circle-scene"><div className="scene-badge">CIRCLE GEOMETRY · {lesson.zhTitle}</div><svg viewBox="0 0 1000 430"><motion.circle cx="385" cy="220" r="130" className="geo-circle" initial={false} animate={{scale:.96+progress*.08}} style={{transformOrigin:'385px 220px'}}/><motion.circle cx="625" cy="220" r="105" className="geo-circle secondary" initial={false} animate={{x:30-progress*30}}/><motion.line x1="385" y1="220" x2={focusX} y2={focusY} className="geo-construction"/><motion.line x1="625" y1="220" x2={focusX} y2={focusY} className="geo-construction"/><circle cx={focusX} cy={focusY} r="8" className="geo-focus active"/><text x="385" y="225" className="geo-center">C₁</text><text x="625" y="225" className="geo-center">C₂</text></svg></div> }
  if(!/sweep|closest|voronoi|delaunay/.test(lesson.id)&&/line|segment|dot|cross|polar|distance/.test(lesson.id)) return <div className="scene geometry-scene line-scene"><div className="scene-badge">VECTOR PREDICATES · {lesson.zhTitle}</div><svg viewBox="0 0 1000 430"><motion.line x1="120" y1="330" x2="850" y2="90" className="geo-main-line"/><motion.line x1="160" y1="85" x2="820" y2="350" className="geo-main-line secondary" animate={{opacity:.2+progress*.8}}/><motion.path d="M 475 213 L 520 325 L 585 177" className="geo-angle active" animate={{pathLength:Math.max(.08,progress)}}/><circle cx="520" cy="325" r="8" className="geo-focus active"/><text x="540" y="350" className="geo-label">orientation / projection</text></svg></div>
  if(/sweep|closest|voronoi|delaunay/.test(lesson.id)) return <div className="scene geometry-scene field-scene"><div className="scene-badge">SPATIAL STRUCTURE · {lesson.zhTitle}</div><svg viewBox="0 0 1000 430">{points.map((item)=><circle key={item.id} cx={item.x*10} cy={item.y*4.3} r="9" className="geo-point"/>)}{points.slice(0,-1).map((item,i)=><motion.line key={item.id} x1={item.x*10} y1={item.y*4.3} x2={points[(i+3)%points.length].x*10} y2={points[(i+3)%points.length].y*4.3} className="geo-mesh" animate={{opacity:i<=sceneCursor ? .75 : .08}}/>)}<motion.line x1={80+progress*840} y1="20" x2={80+progress*840} y2="410" className="sweep-cursor active"/></svg></div>
  const byId = (id: string) => points.find((item) => item.id === id)!
  const hull = frame.hull ?? ['P1','P2','P4','P6','P7','P8'].slice(0,Math.max(2,phase*2+2))
  const path = hull.map((id, index) => `${index ? 'L' : 'M'} ${byId(id).x * 10} ${byId(id).y * 4.3}`).join(' ') + (hull.length > 4 && frame.accepted ? ' Z' : '')
  return <div className="scene geometry-scene"><svg viewBox="0 0 1000 430">
    <motion.path d={path} className="hull-path" animate={{ pathLength: 1 }} transition={{ duration: .55 }} style={{ stroke: lesson.accent }} />
    {points.map((item) => <motion.g key={item.id} animate={{ opacity: frame.muted?.includes(item.id) ? .18 : 1, scale: frame.active?.includes(item.id) ? 1.25 : 1 }} style={{ transformOrigin: `${item.x * 10}px ${item.y * 4.3}px` }}>
      <circle cx={item.x * 10} cy={item.y * 4.3} r="12" className="geo-point" style={{ fill: frame.accepted?.includes(item.id) ? lesson.accent : undefined }} />
      <text x={item.x * 10 + 18} y={item.y * 4.3 - 15} className="geo-label">P{item.label}</text>
    </motion.g>)}
  </svg></div>
}

function SegmentScene({ frame }: { frame: Frame }) {
  const step = frame.segmentStep!
  return <div className="scene segment-scene">
    <div className="mini-array">{segmentValues.map((value, index) => <span key={index} className={index >= 1 && index <= 5 ? 'selected' : ''}>{value}</span>)}</div>
    <svg viewBox="0 0 1000 430">
      {segmentNodes.filter((node) => node.parentId).map((node) => { const parent = segmentNodes.find((item) => item.id === node.parentId)!; return <line key={node.id} x1={parent.x*10} y1={parent.y*4} x2={node.x*10} y2={node.y*4} className={`seg-edge ${step.statuses[node.id]}`} /> })}
      {segmentNodes.map((node) => <g key={node.id}><rect x={node.x*10-42} y={node.y*4-21} width="84" height="42" rx="13" className={`seg-node ${step.statuses[node.id]}`} /><text x={node.x*10} y={node.y*4-2} className="seg-range">[{node.left+1},{node.right+1}]</text><text x={node.x*10} y={node.y*4+12} className="seg-sum">Σ {node.sum}</text></g>)}
    </svg>
  </div>
}

const framePhase = (frame: Frame) => Math.min(2, Math.floor(Math.min(.999999, frame.visualProgress ?? 0) * 3))
const progressIndex = (frame: Frame, max: number) => Math.min(max, Math.max(0, Math.round((frame.visualProgress ?? 0) * max)))
const stateWords = (frame: Frame) => Object.entries(frame.state ?? {}).slice(0, 4).map(([key, value]) => ({ key, value: Array.isArray(value) ? value.join(' · ') : String(value) }))

type DiagramPoint = { x: number; y: number }
const horizontalPoints: DiagramPoint[] = [{x:15,y:52},{x:50,y:52},{x:85,y:52}]
const semanticLayouts: Partial<Record<VisualKind, DiagramPoint[]>> = {
  linear: horizontalPoints,
  graph: [{x:17,y:70},{x:50,y:25},{x:83,y:70}],
  tree: [{x:50,y:20},{x:22,y:76},{x:78,y:76}],
  'segment-tree': [{x:50,y:20},{x:22,y:76},{x:78,y:76}],
  range: [{x:50,y:18},{x:25,y:74},{x:75,y:74}],
  dp: [{x:18,y:18},{x:50,y:50},{x:82,y:82}],
  flow: [{x:14,y:52},{x:50,y:52},{x:86,y:52}],
  geometry: [{x:50,y:18},{x:20,y:78},{x:80,y:78}],
  transform: [{x:14,y:52},{x:50,y:52},{x:86,y:52}],
}
const semanticLinks = (visual: VisualKind) => /graph|geometry/.test(visual) ? [[0,1],[1,2],[2,0]] : /tree|range|segment-tree/.test(visual) ? [[0,1],[0,2]] : [[0,1],[1,2]]
const clippedConnector = (from: DiagramPoint, to: DiagramPoint) => {
  const dx=to.x-from.x,dy=to.y-from.y
  const boundaryScale=Math.min(12.5/Math.max(Math.abs(dx),.001),16/Math.max(Math.abs(dy),.001))
  return {x1:from.x+dx*boundaryScale,y1:from.y+dy*boundaryScale,x2:to.x-dx*boundaryScale,y2:to.y-dy*boundaryScale}
}

function SemanticDiagram({lesson,frame}:{lesson:AlgorithmLesson;frame:Frame}) {
  const trace=frame.trace!
  const activeIndex=trace.phase==='prepare'?0:trace.phase==='execute'?1:2
  const points=semanticLayouts[lesson.visual]??horizontalPoints
  const links=semanticLinks(lesson.visual)
  const connectorId=`semantic-arrow-${lesson.id}`
  return <div className={`semantic-diagram diagram-${lesson.visual}`} role="img" aria-label={`${lesson.zhTitle} 第 ${trace.step+1} 步圖解`}>
    <div className="diagram-motif" aria-hidden="true"/>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs><marker id={connectorId} markerUnits="userSpaceOnUse" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto"><path d="M0,0 L0,4 L4,2 z"/></marker></defs>
      {links.map(([from,to],index)=>{const connector=clippedConnector(points[from],points[to]);return <motion.line key={`${from}-${to}`} {...connector} className={index<activeIndex?'complete':index===activeIndex?'active':''} markerEnd={`url(#${connectorId})`} initial={{pathLength:0,opacity:.15}} animate={{pathLength:1,opacity:index<=activeIndex?1:.18}} transition={{duration:.55,delay:index*.08}}/>})}
    </svg>
    {trace.nodes.map((node,index)=><div key={`${trace.signature}-${node.role}`} className={`semantic-node-position node-${index}`} style={{left:`${points[index].x}%`,top:`${points[index].y}%`}}><motion.article className={`${node.role} ${index===activeIndex?'active':''} ${index<activeIndex?'complete':''}`} initial={{opacity:0,scale:.72,y:12}} animate={{opacity:index<=activeIndex?1:.28,scale:index===activeIndex?1.08:1,y:0}} transition={{type:'spring',stiffness:260,damping:22,delay:index*.08}}>
      <span>{String(index+1).padStart(2,'0')}</span><small>{node.label}</small><strong>{node.value}</strong><em>{index===0?'STATE':index===1?'ACTION':'RESULT'}</em>
      {index===activeIndex&&<motion.i initial={{scale:.7,opacity:.7}} animate={{scale:1.55,opacity:0}} transition={{duration:1.35,repeat:Infinity}}/>}
    </motion.article></div>)}
  </div>
}

function SemanticScene({lesson,frame}:{lesson:AlgorithmLesson;frame:Frame}) {
  const trace=frame.trace!
  return <div className={`scene semantic-scene semantic-${lesson.visual}`}>
    <div className="semantic-grid" aria-hidden="true">{Array.from({length:12},(_,index)=><i key={index}/>)}</div>
    <header><span>DETERMINISTIC TRACE · {lesson.zhTitle}</span><b>{String(trace.step+1).padStart(2,'0')} / {String(trace.totalSteps).padStart(2,'0')}</b></header>
    <SemanticDiagram lesson={lesson} frame={frame}/>
    <footer><span>ACTIVE CODE</span><code><CppCode line={trace.activeCode}/></code>{trace.focus.length>0&&<div>{trace.focus.slice(0,6).map((item)=><b key={item}>{item}</b>)}</div>}</footer>
  </div>
}

function LinearScene({ lesson, frame }: { lesson: AlgorithmLesson; frame: Frame }) {
  const adaptive = LinearAdaptiveScene({ lesson, frame })
  if (adaptive) return adaptive
  const values = frame.values ?? [2, 5, 1, 4, 7, 3]
  const phase = framePhase(frame),cursor=progressIndex(frame,6)
  const isHeap = /heap|priority/i.test(`${lesson.title} ${lesson.description}`)
  const isStack = /stack|括號|histogram|expression|shunting/i.test(`${lesson.title} ${lesson.zhTitle}`)
  if (isHeap) return <div className="scene structure-scene heap-scene"><div className="structure-title">BINARY HEAP · EXTREME AT ROOT</div><svg viewBox="0 0 1000 430">
    {[[500,80],[300,190],[700,190],[190,315],[410,315],[590,315],[810,315]].slice(1).map(([x,y],i)=>{const p=i<2?[500,80]:i<4?[300,190]:[700,190];return <motion.line key={i} x1={p[0]} y1={p[1]} x2={x} y2={y} className={`structure-link ${i<=cursor?'lit':''}`} animate={{opacity:i<=cursor?1:.2}}/>})}
    {[[500,80],[300,190],[700,190],[190,315],[410,315],[590,315],[810,315]].map(([x,y],i)=><motion.g key={i} animate={{scale:i===cursor?1.12:1}} style={{transformOrigin:`${x}px ${y}px`}}><rect x={x-45} y={y-28} width="90" height="56" rx="16" className={`structure-node ${i===cursor?'active':''}`}/><text x={x} y={y+6} className="structure-value">{values[i%values.length]}</text></motion.g>)}
  </svg></div>
  return <div className={`scene structure-scene ${isStack?'stack-layout':'queue-layout'}`}><div className="structure-title">{isStack?'LIFO · TOP':'FIFO · FRONT → BACK'}</div><div className="structure-items">{values.slice(0,Math.max(1,values.length-phase)).map((value,index)=><motion.div layout key={`${index}-${value}`} className={`structure-card ${frame.active?.includes(String(index))?'active':''} ${frame.accepted?.includes(String(index))?'accepted':''}`} initial={{opacity:0,scale:.85}} animate={{opacity:1,scale:1}}><small>{isStack&&index===values.length-phase-1?'TOP':String(index).padStart(2,'0')}</small><strong>{value}</strong></motion.div>)}</div><div className="motion-arrow"><i/><span>{phase===0?'PUSH / ENQUEUE':phase===1?'INSPECT FRONTIER':'POP / DEQUEUE'}</span></div></div>
}

const treeLayout = [
  {id:'A',x:500,y:65},{id:'B',x:285,y:170},{id:'C',x:715,y:170},
  {id:'D',x:170,y:305},{id:'E',x:400,y:305},{id:'F',x:600,y:305},{id:'G',x:830,y:305},
]
const treeLinks = [['A','B'],['A','C'],['B','D'],['B','E'],['C','F'],['C','G']]
function TreeScene({ lesson, frame }: { lesson: AlgorithmLesson; frame: Frame }) {
  const adaptive = TreeAdaptiveScene({ lesson, frame })
  if (adaptive) return adaptive
  const node = (id:string)=>treeLayout.find((item)=>item.id===id)!
  const phase=framePhase(frame),cursor=progressIndex(frame,treeLayout.length-1)
  return <div className="scene tree-scene"><div className="scene-badge">ROOTED TREE · {lesson.zhTitle}</div><svg viewBox="0 0 1000 430">
    {treeLinks.map(([a,b],i)=><motion.path key={`${a}${b}`} d={`M ${node(a).x} ${node(a).y+28} C ${node(a).x} ${(node(a).y+node(b).y)/2}, ${node(b).x} ${(node(a).y+node(b).y)/2}, ${node(b).x} ${node(b).y-28}`} className={`tree-link ${i<cursor?'lit':''}`} animate={{pathLength:i<cursor?1:.25}}/>)}
    {treeLayout.map((item,i)=>{const active=frame.active?.includes(item.id)||i===cursor;const accepted=frame.accepted?.includes(item.id)||i<cursor;return <motion.g key={item.id} animate={{y:active?-5:0,scale:active?1.08:1}} style={{transformOrigin:`${item.x}px ${item.y}px`}}><rect x={item.x-48} y={item.y-28} width="96" height="56" rx="17" className={`tree-node ${active?'active':''} ${accepted?'accepted':''}`}/><text x={item.x} y={item.y+5} className="tree-label">{item.id}</text><text x={item.x} y={item.y+46} className="tree-meta">{i===0?'depth 0':i<3?'depth 1':'depth 2'}</text></motion.g>})}
  </svg></div>
}

function RangeScene({ lesson, frame }: { lesson: AlgorithmLesson; frame: Frame }) {
  const adaptive = RangeAdaptiveScene({ lesson, frame })
  if (adaptive) return adaptive
  const values=frame.values??[2,5,1,4,9,3,7,6]
  const phase=framePhase(frame), cursor=progressIndex(frame,values.length-1),end=Math.min(values.length-1,Math.max(2,cursor))
  return <div className="scene range-scene"><div className="scene-badge">RANGE DECOMPOSITION · {lesson.zhTitle}</div><div className="range-levels"><div className="range-band root">[0, {values.length-1}]</div><div className="range-band left">[0, 3]</div><div className="range-band right">[4, 7]</div></div><div className="range-array">{values.map((value,i)=><motion.div key={i} className={`${i<=end&&i>=phase?'active':''} ${frame.accepted?.includes(String(i))?'accepted':''}`} animate={{y:i>=phase&&i<=end?-9:0}}><small>{i}</small><strong>{value}</strong></motion.div>)}</div><div className="range-operation"><span>{phase===0?'BUILD / INDEX':phase===1?'SPLIT / UPDATE':'MERGE / ANSWER'}</span><i style={{width:`${32+phase*28}%`}}/></div></div>
}

function DPScene({ lesson, frame }: { lesson: AlgorithmLesson; frame: Frame }) {
  const adaptive = DPAdaptiveScene({ lesson, frame })
  if (adaptive) return adaptive
  const phase=framePhase(frame), limit=Math.max(1,progressIndex(frame,39)+1)
  return <div className="scene dp-scene"><div className="scene-badge">STATE TABLE · {lesson.zhTitle}</div><div className="dp-axis"><span>STATE</span><span>TRANSITION ORDER →</span></div><div className="dp-grid">{Array.from({length:40},(_,i)=><motion.div key={i} className={`${i<limit?'filled':''} ${i===limit-1?'current':''}`} animate={{opacity:i<limit?1:.2,scale:i===limit-1?1.08:1}}><small>{Math.floor(i/8)},{i%8}</small>{i<limit&&<b>{(i*3+phase*5)%17}</b>}</motion.div>)}</div><div className="dp-formula"><span>DEPENDENCIES</span><strong>{stateWords(frame)[phase%Math.max(1,stateWords(frame).length)]?.value??frame.codeLine}</strong></div></div>
}

const stringExample=(id:string)=>id.includes('suffix')||id.includes('lcp')?'BANANA$':id.includes('pal')||id.includes('manacher')?'ABACABA':id.includes('aho')||id.includes('trie')?'SHEHERS':'ABABACA'
function StringScene({ lesson, frame }: { lesson: AlgorithmLesson; frame: Frame }) {
  const adaptive = StringAdaptiveScene({ lesson, frame })
  if (adaptive) return adaptive
  const text=stringExample(lesson.id),phase=framePhase(frame),cursor=progressIndex(frame,text.length-1)
  return <div className="scene string-scene"><div className="scene-badge">TEXT PROCESSING · {lesson.zhTitle}</div><div className="string-tape">{[...text].map((char,i)=><motion.div key={i} className={`${i===cursor?'active':''} ${i<cursor?'accepted':''}`} animate={{y:i===cursor?-9:0}}><small>{i}</small><strong>{char}</strong></motion.div>)}</div><div className="string-links">{[...text].slice(0,-1).map((_,i)=><motion.i key={i} animate={{opacity:i<cursor?1:.15,scaleX:i<cursor?1:.35}}/> )}</div><div className="automaton-row"><span>{phase===0?'PREFIX / STATE 0':phase===1?'FOLLOW TRANSITION':'FALLBACK / ACCEPT'}</span>{stateWords(frame).map((item,i)=><motion.b key={item.key} animate={{opacity:i<=phase?1:.25}}>{item.key}: {item.value}</motion.b>)}</div></div>
}

function FlowScene({ lesson, frame }: { lesson: AlgorithmLesson; frame: Frame }) {
  const adaptive = FlowAdaptiveScene({ lesson, frame })
  if (adaptive) return adaptive
  const phase=framePhase(frame),cursor=progressIndex(frame,7),matching=lesson.subcategory==='匹配'
  if(matching) return <div className="scene flow-scene matching-scene"><div className="scene-badge">BIPARTITE MATCHING · ALTERNATING PATH</div><svg viewBox="0 0 1000 430">{[0,1,2,3].map((i)=><g key={`l${i}`}><circle cx="220" cy={75+i*88} r="27" className="flow-node"/><text x="220" y={80+i*88} className="flow-label">L{i+1}</text><circle cx="780" cy={75+i*88} r="27" className="flow-node"/><text x="780" y={80+i*88} className="flow-label">R{i+1}</text></g>)}{[[0,0],[0,1],[1,1],[1,2],[2,0],[2,3],[3,2]].map(([a,b],i)=><motion.line key={i} x1="247" y1={75+a*88} x2="753" y2={75+b*88} className={`flow-edge ${i<=cursor?'lit':''}`} animate={{pathLength:i<=cursor?1:.2}}/>)}</svg></div>
  return <div className="scene flow-scene"><div className="scene-badge">RESIDUAL NETWORK · FLOW / CAPACITY</div><svg viewBox="0 0 1000 430"><defs><marker id="flowArrow" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" className="arrow-head"/></marker></defs>{[[150,215,380,100],[150,215,380,330],[380,100,650,100],[380,100,650,330],[380,330,650,100],[380,330,650,330],[650,100,860,215],[650,330,860,215]].map(([x1,y1,x2,y2],i)=>{const edge=clipSegmentToNodeRadii(x1,y1,x2,y2,34,42),label=edgeLabelPosition(x1,y1,x2,y2,i===4?-18:18);return <g key={i}><motion.line {...edge} className={`flow-edge ${i<=cursor?'lit':''}`} markerEnd="url(#flowArrow)" animate={{opacity:i<=cursor?1:.18}}/><text x={label.x} y={label.y} className="flow-cap">{Math.min(i+phase,5)}/{i%4+3}</text></g>})}{[[150,215,'S'],[380,100,'A'],[380,330,'B'],[650,100,'C'],[650,330,'D'],[860,215,'T']].map(([x,y,label])=><g key={String(label)}><circle cx={Number(x)} cy={Number(y)} r="30" className="flow-node"/><text x={Number(x)} y={Number(y)+5} className="flow-label">{label}</text></g>)}</svg></div>
}

function MathScene({ lesson, frame }: { lesson: AlgorithmLesson; frame: Frame }) {
  const adaptive = MathAdaptiveScene({ lesson, frame })
  if (adaptive) return adaptive
  const phase=framePhase(frame),cursor=progressIndex(frame,11), matrix=/matrix|gaussian|linear/i.test(`${lesson.title} ${lesson.category}`)
  return <div className="scene math-scene"><div className="scene-badge">{matrix?'MATRIX OPERATIONS':'NUMBER STATE'} · {lesson.zhTitle}</div>{matrix?<div className="matrix-visual">{Array.from({length:16},(_,i)=><motion.div key={i} className={`${i===progressIndex(frame,15)?'pivot active':''}`} animate={{opacity:i<=progressIndex(frame,15)?1:.35}}>{(i*2+3)%11}</motion.div>)}</div>:<><div className="bit-rail">{Array.from({length:12},(_,i)=><motion.div key={i} className={i===cursor?'active':i<cursor?'accepted':''} animate={{height:35+((i*17)%6)*12,opacity:i<=cursor?1:.2}}><span>{i+1}</span></motion.div>)}</div><div className="math-equation">{stateWords(frame).map((item,i)=><motion.span key={item.key} animate={{opacity:i<=phase?1:.25}}>{item.value}</motion.span>)}</div></>}</div>
}

function TransformScene({ lesson, frame }: { lesson: AlgorithmLesson; frame: Frame }) {
  const adaptive = TransformAdaptiveScene({ lesson, frame })
  if (adaptive) return adaptive
  const phase=framePhase(frame), xs=[100,360,640,900]
  return <div className="scene transform-scene"><div className="scene-badge">BUTTERFLY / DECOMPOSITION · {lesson.zhTitle}</div><svg viewBox="0 0 1000 430">{xs.slice(0,-1).flatMap((x,col)=>Array.from({length:8},(_,row)=>[row,row^(2**Math.min(col,2))].map((to,k)=><motion.line key={`${col}-${row}-${k}`} x1={x} y1={45+row*46} x2={xs[col+1]} y2={45+to*46} className={`transform-link ${col<=phase?'lit':''}`} animate={{opacity:col<=phase ? .72 : .08}}/>)))}{xs.flatMap((x,col)=>Array.from({length:8},(_,row)=><motion.circle key={`${col}-${row}`} cx={x} cy={45+row*46} r={col===phase+1?8:5} className={`transform-dot ${col<=phase+1?'lit':''}`}/>))}</svg></div>
}

function AlgorithmScene({lesson,frame}:{lesson:AlgorithmLesson;frame:Frame}) {
  if(lesson.fidelity==='semantic') return <div className="algorithm-scene-wrap" data-visual-model={lesson.visualModel}><SemanticScene lesson={lesson} frame={frame}/></div>
  const scene=lesson.visual==='array'?<ArrayScene lesson={lesson} frame={frame}/>:
    lesson.visual==='linear'?<LinearScene lesson={lesson} frame={frame}/>:
    lesson.visual==='graph'?<GraphScene lesson={lesson} frame={frame}/>:
    lesson.visual==='tree'?<TreeScene lesson={lesson} frame={frame}/>:
    lesson.visual==='segment-tree'?<SegmentScene frame={frame}/>:
    lesson.visual==='range'?<RangeScene lesson={lesson} frame={frame}/>:
    lesson.visual==='dp'?<DPScene lesson={lesson} frame={frame}/>:
    lesson.visual==='string'?<StringScene lesson={lesson} frame={frame}/>:
    lesson.visual==='flow'?<FlowScene lesson={lesson} frame={frame}/>:
    lesson.visual==='math'?<MathScene lesson={lesson} frame={frame}/>:
    lesson.visual==='transform'?<TransformScene lesson={lesson} frame={frame}/>:
    <GeometryScene lesson={lesson} frame={frame}/>
  return <div className="algorithm-scene-wrap" data-visual-model={lesson.visualModel} data-visual-step={frame.visualStep} data-cue-mode={frame.visualCue?.mode}>{scene}</div>
}

function BeginnerGuidePanel({lesson,onStart}:{lesson:AlgorithmLesson;onStart:()=>void}) {
  const guide=lesson.beginnerGuide!
  return <section className="beginner-guide">
    <header><Lightbulb size={17}/><div><span>BEGINNER FIRST</span><h2>播放前，先建立理解地圖</h2></div></header>
    <div className="guide-foundation">
      <article><Eye size={17}/><span>畫面要怎麼看</span><p>{guide.mentalModel}</p></article>
      <article><Target size={17}/><span>使用前提</span><p>{guide.prerequisite}</p></article>
      <article><ShieldCheck size={17}/><span>全程不變量</span><p>{guide.invariant}</p></article>
    </div>
    <div className="guide-glossary"><span>先懂名詞</span><div>{guide.glossary.map((item)=><article key={item.term}><b>{item.term}</b><p>{item.meaning}</p></article>)}</div></div>
    <div className="guide-route">
      <div><span>完整路線</span><ol>{guide.walkthrough.map((item,index)=><li key={item}><b>{index+1}</b><p>{item}</p></li>)}</ol></div>
      <aside><span><AlertTriangle size={14}/> 初學者最常錯</span>{guide.pitfalls.map((item)=><p key={item}>{item}</p>)}</aside>
    </div>
    <button className="guide-start" onClick={onStart}><Play size={15}/> 從第 1 步開始看動畫 <ChevronRight size={15}/></button>
  </section>
}

function VisualStepStrip({lesson,frame}:{lesson:AlgorithmLesson;frame:Frame}) {
  const step=frame.visualStep??0
  return <motion.div className="visual-step-strip" key={`${lesson.id}-visual-${step}`} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
    <div><span><Eye size={13}/> 畫面正在表示</span><p>{frame.beginner!.observe}</p></div>
    <div className="visual-step-progress" aria-label={`動畫第 ${step+1} 步，共 ${lesson.frames.length} 步`}>
      {lesson.frames.map((_,index)=><i key={index} className={index===step?'active':index<step?'complete':''}/>) }
    </div>
  </motion.div>
}

function LessonPlayer({ lesson, onBack }: { lesson: AlgorithmLesson; onBack: () => void }) {
  const requestedStep=Number(new URLSearchParams(window.location.search).get('step') ?? 1)
  const initialStep=Number.isFinite(requestedStep)?Math.max(0,Math.min(lesson.frames.length-1,Math.floor(requestedStep)-1)):0
  const [index, setIndex] = useState(initialStep), [playing, setPlaying] = useState(false)
  const [stageVisible,setStageVisible]=useState(false)
  const stageRef=useRef<HTMLElement|null>(null)
  const frame = lesson.frames[index]
  useEffect(() => { setIndex(initialStep); setPlaying(false) }, [lesson.id, initialStep])
  useEffect(() => { if (!playing) return; if (index === lesson.frames.length - 1) { setPlaying(false); return } const timer = setTimeout(() => setIndex((value) => value + 1), INTERVAL); return () => clearTimeout(timer) }, [playing, index, lesson.frames.length])
  useEffect(()=>{const stage=stageRef.current;if(!stage)return;const observer=new IntersectionObserver(([entry])=>setStageVisible(entry.isIntersecting),{threshold:.04});observer.observe(stage);return()=>observer.disconnect()},[lesson.id])
  const restart = () => { setIndex(0); setPlaying(true) }
  const beginLesson=()=>{setIndex(0);setPlaying(false);stageRef.current?.scrollIntoView({behavior:'smooth',block:'start'})}
  return <main className="player-page" style={{ '--lesson-accent': lesson.accent } as React.CSSProperties}>
    <header className="site-header"><button className="back-button" onClick={onBack}><ArrowLeft size={16}/> 所有演算法</button><div className="wordmark"><Sparkles size={14}/> ALGOVISTA</div><span className="header-count">{lesson.index} / {String(lessons.length).padStart(3,'0')}</span></header>
    <section className="lesson-heading relative overflow-hidden"><DotPattern width={18} height={18} cr={0.65} className="opacity-25 [mask-image:linear-gradient(to_right,black,transparent_86%)]"/><div className="relative z-10"><span>{lesson.category}</span><h1>{lesson.title}</h1><p>{lesson.zhTitle} · {lesson.description}</p>{lesson.sources&&<div className="lesson-sources"><span>CONTENT SOURCE</span>{lesson.sources.map((source)=><a key={source.url} href={source.url} target="_blank" rel="noreferrer"><b>{source.label}</b>{source.title}</a>)}</div>}</div><div className="complexity relative z-10"><span>TIME COMPLEXITY</span><strong>{lesson.complexity}</strong></div></section>
    <section className="lesson-context">
      <article><header><Target size={15}/><span>什麼時候使用</span></header><ul>{lesson.usage?.map((item)=><li key={item}>{item}</li>)}</ul></article>
      <article><header><BookOpen size={15}/><span>精選例題</span></header><div>{lesson.practice?.map((problem)=><a key={problem.url} href={problem.url} target="_blank" rel="noreferrer"><b>{problem.judge}</b><span><strong>{problem.title}</strong><small>{problem.note}</small></span><ExternalLink size={14}/></a>)}</div></article>
    </section>
    <BeginnerGuidePanel lesson={lesson} onStart={beginLesson}/>
    <section className="lesson-stage" ref={stageRef}>
      <div className="stage-top"><span>LIVE VISUALIZATION</span><span className={playing ? 'playing' : ''}>{playing ? 'PLAYING' : 'PAUSED'}</span></div>
      <div className="learning-workspace">
        <div className="visual-column">
          <AlgorithmScene lesson={lesson} frame={frame}/>
          <VisualStepStrip lesson={lesson} frame={frame}/>
          <div className="state-inspector"><span>ALGORITHM STATE · 目前變數</span><div>{Object.entries(frame.state ?? {}).filter(([key])=>!['phase','algorithm','rationale','invariant','timelineStep'].includes(key)).slice(0,6).map(([key,value])=><dl key={key}><dt>{humanizeStateKey(key)}</dt><dd>{humanizeStateValue(value)}</dd></dl>)}</div></div>
        </div>
        <aside className="code-panel"><header><div><i/><i/><i/><span>C++17</span></div><b>STEP-SYNCED SOURCE</b></header><pre>{lesson.code.map((line,lineIndex)=>{const lineNumber=lineIndex+1,active=frame.codeLines.includes(lineNumber),guide=lesson.codeGuide?.find((item)=>item.lineNumber===lineNumber),stepRole=humanizeStateValue(frame.state?.operation??guide?.role??'目前操作');return <div key={lineIndex} className="code-source-row"><div className={active?'code-line active':'code-line'} aria-current={active?'step':undefined}><span>{String(lineNumber).padStart(2,'0')}</span><code><CppCode line={line}/></code></div>{active&&guide&&<motion.div className="inline-code-guide" key={`${index}-${lineNumber}`} initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}}><span>{stepRole}</span><p>本步用途：{stepRole}；這行在整個演算法中的角色是「{guide.role}」。</p><p>{guide.syntax}</p><p>{frame.beginner!.result}</p></motion.div>}</div>})}</pre><motion.div className="code-teacher" key={`${lesson.id}-code-${index}`} initial={{opacity:0}} animate={{opacity:1}}><span><BookOpen size={13}/> 這一步的程式碼總結</span><p>{frame.beginner!.codeMeaning}</p></motion.div></aside>
      </div>
      <div className="explanation-card detailed"><span className="step-number">{String(index + 1).padStart(2,'0')}</span><AnimatePresence mode="wait"><motion.div key={`${lesson.id}-${index}`} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}><span className="reasoning-label">STEP-BY-STEP REASONING</span><h2>{frame.title}</h2><p className="step-summary">{frame.explanation}</p><div className="reasoning-grid"><article><span><Eye size={14}/> 先看哪裡</span><p>{frame.beginner!.observe}</p></article><article><span><Zap size={14}/> 現在執行</span><p>{frame.beginner!.action}</p></article><article><span><ShieldCheck size={14}/> 為什麼正確</span><p>{frame.beginner!.reason}</p></article><article><span><CheckCircle2 size={14}/> 執行後得到</span><p>{frame.beginner!.result}</p></article></div><aside className="step-pitfall"><AlertTriangle size={14}/><span>這一步要避免：</span><p>{frame.beginner!.pitfall}</p></aside><code><CppCode line={frame.codeLine}/></code></motion.div></AnimatePresence></div>
    </section>
    <footer className={`player-controls ${stageVisible?'visible':''}`} aria-hidden={!stageVisible}><div className="progress"><motion.i animate={{width:`${index/(lesson.frames.length-1)*100}%`}} /></div><span>{index+1} / {lesson.frames.length}</span><div><button aria-label="上一步" title="上一步" disabled={index===0} onClick={()=>{setPlaying(false);setIndex(index-1)}}><ChevronLeft/></button><button aria-label={playing?'暫停':'播放'} title={playing?'暫停':'播放'} className="play" onClick={()=>index===lesson.frames.length-1?restart():setPlaying(!playing)}>{playing?<Pause/>:<Play/>}</button><button aria-label="下一步" title="下一步" disabled={index===lesson.frames.length-1} onClick={()=>{setPlaying(false);setIndex(index+1)}}><ChevronRight/></button><button aria-label="重新播放" title="重新播放" onClick={restart}><RotateCcw/></button></div></footer>
  </main>
}

function LessonCard({lesson,onSelect}:{lesson:AlgorithmLesson;onSelect:(lesson:AlgorithmLesson)=>void}) { const rank=beginnerRank.get(lesson.id);return <button className="lesson-card compact" onClick={()=>onSelect(lesson)} style={{'--lesson-accent':lesson.accent} as React.CSSProperties}><span className="card-index">{lesson.index}</span>{rank&&<span className="beginner-rank">新手路線 {rank}</span>}<span className="card-category">{lesson.category}</span><h2>{lesson.title}</h2><p>{lesson.zhTitle} · {lesson.description}</p><footer><span>{lesson.complexity}</span><b>開始學習 <ChevronRight size={15}/></b></footer></button> }

function CategoryDetail({category,onBack,onSelect}:{category:AlgorithmCategory;onBack:()=>void;onSelect:(lesson:AlgorithmLesson)=>void}) {
  const categoryLessons=lessons.filter((lesson)=>lesson.categoryId===category.id)
  return <main className="library-page"><header className="site-header"><button className="back-button" onClick={onBack}><ArrowLeft size={16}/> 所有分類</button><div className="wordmark"><Sparkles size={14}/> ALGOVISTA</div><span className="header-count">CATEGORY {category.index}</span></header>
    <section className="category-heading" style={{'--category-accent':category.accent} as React.CSSProperties}><span>{category.index} · ALGORITHM DOMAIN</span><h1>{category.title}</h1><p>{category.zhTitle} · {category.description}</p></section>
    <section className="subcategory-list">{category.subcategories.map((subcategory)=>{const items=categoryLessons.filter((lesson)=>lesson.subcategory===subcategory);if(!items.length)return null;return <div className="subcategory" key={subcategory}><header><span>{subcategory}</span><b>{String(items.length).padStart(2,'0')} ALGORITHMS</b></header><div className="subcategory-grid">{items.map((lesson)=><LessonCard key={lesson.id} lesson={lesson} onSelect={onSelect}/>)}</div></div>})}</section>
  </main>
}

function Library({ onSelect }: { onSelect: (lesson: AlgorithmLesson) => void }) {
  const [category,setCategory]=useState<AlgorithmCategory|null>(null)
  const [query,setQuery]=useState('')
  const matched=query.trim()?lessons.filter((lesson)=>`${lesson.title} ${lesson.zhTitle} ${lesson.category} ${lesson.subcategory}`.toLowerCase().includes(query.trim().toLowerCase())):[]
  const beginnerLessons=BEGINNER_PATH.map((item)=>({...item,lesson:lessons.find((lesson)=>lesson.id===item.id)!}))
  if(category) return <CategoryDetail category={category} onBack={()=>setCategory(null)} onSelect={onSelect}/>
  return <main className="library-page"><header className="site-header"><div className="wordmark"><Sparkles size={14}/> ALGOVISTA</div><span className="header-note">COMPETITIVE PROGRAMMING · VISUALIZED</span></header>
    <section className="library-hero relative overflow-hidden"><DotPattern width={18} height={18} cr={0.65} className="opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"/><span className="relative z-10">STRUCTURED ALGORITHM LIBRARY</span><h1 className="relative z-10">先建立地圖，<br/><em>再理解細節。</em></h1><p className="relative z-10">從演算法領域進入子分類，再學習具體演算法。動畫、資料結構狀態與 C++ 程式碼在每一步保持同步。</p></section>
    <section className="beginner-path"><header><div><span>第一次來？</span><h2>照這 5 堂建立第一張演算法地圖</h2></div><p>每堂都會先教你看畫面，再讓動畫、變數與 C++ 程式碼逐步同步。</p></header><div>{beginnerLessons.map(({lesson,step,reason})=><button key={lesson.id} onClick={()=>onSelect(lesson)} style={{'--lesson-accent':lesson.accent} as React.CSSProperties}><span>{step}</span><div><b>{lesson.zhTitle}</b><small>{lesson.title}</small><p>{reason}</p></div><ChevronRight size={15}/></button>)}</div></section>
    <label className="library-search"><Search/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="搜尋演算法、分類或中文名稱"/><span>{query?`${matched.length} RESULTS`:`${lessons.length} ALGORITHMS`}</span></label>
    {query?<section className="search-results">{matched.length?matched.map((lesson)=><LessonCard key={lesson.id} lesson={lesson} onSelect={onSelect}/>):<p>找不到符合的演算法。</p>}</section>:<section className="category-grid">{categories.map((category)=><button key={category.id} className="category-card" onClick={()=>setCategory(category)} style={{'--category-accent':category.accent} as React.CSSProperties}><span>{category.index}</span><Layers3/><small>{category.subcategories.length} SUBCATEGORIES</small><h2>{category.title}</h2><p>{category.zhTitle} · {category.description}</p><footer><b>{lessons.filter((lesson)=>lesson.categoryId===category.id).length} 個演算法</b><ChevronRight/></footer></button>)}</section>}
  </main>
}

export default function App() {
  const directLessonId=new URLSearchParams(window.location.search).get('lesson')
  const [selected,setSelected]=useState<AlgorithmLesson|null>(()=>lessons.find((lesson)=>lesson.id===directLessonId)??null)
  const selectLesson=(lesson:AlgorithmLesson)=>{window.history.replaceState(null,'',`?lesson=${lesson.id}`);setSelected(lesson)}
  const clearLesson=()=>{window.history.replaceState(null,'',window.location.pathname);setSelected(null)}
  const catalogManifest=JSON.stringify(lessons.map(({id,visualModel,frames})=>({id,visualModel,steps:frames.length})))
  return <><script id="catalog-manifest" type="application/json">{catalogManifest}</script>{selected?<LessonPlayer lesson={selected} onBack={clearLesson}/>:<Library onSelect={selectLesson}/>}</>
}
