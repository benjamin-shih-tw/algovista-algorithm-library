import { mkdirSync, writeFileSync } from 'node:fs'
import { lessons } from '../src/algorithms'

type Severity='CRITICAL_CRASH'|'RENDER_BUG'|'METADATA_ISSUE'
interface BugReport {
  lessonId:string
  type:Severity
  description:string
  frame?:number
}

const bugs:BugReport[]=[]
const lessonMap=new Map(lessons.map((lesson)=>[lesson.id,lesson]))

const duplicateIds=(ids:string[])=>{
  const seen=new Set<string>(),duplicates=new Set<string>()
  for(const id of ids){ if(seen.has(id)) duplicates.add(id); seen.add(id) }
  return [...duplicates]
}

for(const lesson of lessons){
  const {id,frames,code,visual}=lesson

  frames.forEach((frame,index)=>{
    const step=index+1
    if(visual==='array'&&lesson.fidelity!=='semantic'&&!frame.executionView&&!frame.values) bugs.push({
      lessonId:id,type:'CRITICAL_CRASH',frame:step,
      description:'ArrayScene requires frame.values when no rich execution view is present',
    })
    for(const line of frame.codeLines){
      if(line<1||line>code.length) bugs.push({
        lessonId:id,type:'CRITICAL_CRASH',frame:step,
        description:`codeLines contains out-of-range line ${line}; template has ${code.length} lines`,
      })
    }

    if(visual==='graph'&&!frame.executionView){
      const points=lesson.points?.length?lesson.points:[
        {id:'A'},{id:'B'},{id:'C'},{id:'D'},{id:'E'},{id:'F'},
      ]
      const pointIds=new Set(points.map((point)=>point.id))
      const edges=lesson.edges?.length?lesson.edges:[
        {from:'A',to:'B'},{from:'A',to:'C'},{from:'B',to:'D'},
        {from:'B',to:'E'},{from:'C',to:'E'},{from:'D',to:'F'},{from:'E',to:'F'},
      ]
      for(const edge of edges){
        if(!pointIds.has(edge.from)||!pointIds.has(edge.to)) bugs.push({
          lessonId:id,type:'CRITICAL_CRASH',frame:step,
          description:`GraphScene edge ${edge.from}->${edge.to} references a missing point`,
        })
      }
    }

    if(visual==='geometry'&&!frame.executionView&&frame.hull){
      const pointIds=new Set((lesson.points?.length?lesson.points:[
        {id:'P1'},{id:'P2'},{id:'P3'},{id:'P4'},{id:'P5'},{id:'P6'},{id:'P7'},{id:'P8'},
      ]).map((point)=>point.id))
      for(const hullId of frame.hull){
        if(!pointIds.has(hullId)) bugs.push({
          lessonId:id,type:'CRITICAL_CRASH',frame:step,
          description:`GeometryScene hull references missing point ${hullId}`,
        })
      }
    }

    if(id==='segment-tree'&&!frame.segmentStep) bugs.push({
      lessonId:id,type:'CRITICAL_CRASH',frame:step,
      description:'SegmentScene frame is missing segmentStep',
    })

    if(!frame.trace||frame.trace.nodes.length!==3) bugs.push({
      lessonId:id,type:'RENDER_BUG',frame:step,
      description:!frame.trace?'frame.trace is missing':`frame.trace must contain 3 nodes, got ${frame.trace.nodes.length}`,
    })

    const view=frame.executionView
    if(view){
      if(view.kind==='network'){
        const ids=view.nodes.map((node)=>node.id)
        const idSet=new Set(ids)
        for(const duplicate of duplicateIds(ids)) bugs.push({
          lessonId:id,type:'RENDER_BUG',frame:step,
          description:`executionView network duplicates node id ${duplicate}`,
        })
        for(const edge of view.edges){
          if(!idSet.has(edge.from)||!idSet.has(edge.to)) bugs.push({
            lessonId:id,type:'CRITICAL_CRASH',frame:step,
            description:`executionView network edge ${edge.from}->${edge.to} references a missing node`,
          })
        }
        for(const pathId of view.path??[]){
          if(!idSet.has(pathId)) bugs.push({
            lessonId:id,type:'CRITICAL_CRASH',frame:step,
            description:`executionView path references missing node ${pathId}`,
          })
        }
      } else if(view.kind==='structure'){
        const ids=view.nodes.map((node)=>node.id)
        const idSet=new Set(ids)
        for(const duplicate of duplicateIds(ids)) bugs.push({
          lessonId:id,type:'RENDER_BUG',frame:step,
          description:`executionView structure duplicates node id ${duplicate}`,
        })
        for(const edge of view.edges){
          if(!idSet.has(edge.from)||!idSet.has(edge.to)) bugs.push({
            lessonId:id,type:'CRITICAL_CRASH',frame:step,
            description:`executionView structure edge ${edge.from}->${edge.to} references a missing node`,
          })
        }
      } else if(view.kind==='geometry'){
        const ids=view.points.map((point)=>point.id)
        const idSet=new Set(ids)
        for(const duplicate of duplicateIds(ids)) bugs.push({
          lessonId:id,type:'RENDER_BUG',frame:step,
          description:`executionView geometry duplicates point id ${duplicate}`,
        })
        for(const segment of view.segments??[]){
          if(!idSet.has(segment.from)||!idSet.has(segment.to)) bugs.push({
            lessonId:id,type:'CRITICAL_CRASH',frame:step,
            description:`executionView geometry segment ${segment.from}->${segment.to} references a missing point`,
          })
        }
        for(const polygonId of view.polygon??[]){
          if(!idSet.has(polygonId)) bugs.push({
            lessonId:id,type:'CRITICAL_CRASH',frame:step,
            description:`executionView polygon references missing point ${polygonId}`,
          })
        }
      } else if(view.kind==='matrix'){
        const width=view.cells[0]?.length??0
        if(!width||view.cells.some((row)=>row.length!==width)) bugs.push({
          lessonId:id,type:'RENDER_BUG',frame:step,
          description:'executionView matrix rows have inconsistent widths',
        })
        if(view.colLabels&&view.colLabels.length!==width) bugs.push({
          lessonId:id,type:'RENDER_BUG',frame:step,
          description:`matrix colLabels has ${view.colLabels.length} entries for width ${width}`,
        })
        if(view.rowLabels&&view.rowLabels.length!==view.cells.length) bugs.push({
          lessonId:id,type:'RENDER_BUG',frame:step,
          description:`matrix rowLabels has ${view.rowLabels.length} entries for ${view.cells.length} rows`,
        })
      } else if(view.kind==='table'){
        if(view.rows.some((row)=>row.length!==view.columns.length)) bugs.push({
          lessonId:id,type:'RENDER_BUG',frame:step,
          description:'executionView table row width does not match columns',
        })
        if(view.activeRow!==undefined&&(view.activeRow<0||view.activeRow>=view.rows.length)) bugs.push({
          lessonId:id,type:'RENDER_BUG',frame:step,
          description:`executionView activeRow ${view.activeRow} is out of range`,
        })
      }
    }

    if(frame.explanation.includes('undefined')||frame.explanation.includes('[object Object]')) bugs.push({
      lessonId:id,type:'RENDER_BUG',frame:step,
      description:'explanation contains an unresolved value',
    })
  })

  for(const prerequisite of lesson.knowledge?.prerequisites??[]){
    if(!lessonMap.has(prerequisite.lessonId)) bugs.push({
      lessonId:id,type:'METADATA_ISSUE',
      description:`prerequisite points to missing lesson ${prerequisite.lessonId}`,
    })
  }
}

const summary={
  totalLessons:lessons.length,
  totalFrames:lessons.reduce((sum,lesson)=>sum+lesson.frames.length,0),
  totalBugs:bugs.length,
  byType:{
    CRITICAL_CRASH:bugs.filter((bug)=>bug.type==='CRITICAL_CRASH').length,
    RENDER_BUG:bugs.filter((bug)=>bug.type==='RENDER_BUG').length,
    METADATA_ISSUE:bugs.filter((bug)=>bug.type==='METADATA_ISSUE').length,
  },
}

mkdirSync('.tmp',{recursive:true})
writeFileSync('.tmp/deep-scan.json',JSON.stringify({summary,bugs},null,2))
console.log(JSON.stringify(summary,null,2))
if(bugs.length){
  for(const bug of bugs.slice(0,100)) console.error(`${bug.lessonId}${bug.frame?` frame ${bug.frame}`:''}: [${bug.type}] ${bug.description}`)
  process.exitCode=1
}
