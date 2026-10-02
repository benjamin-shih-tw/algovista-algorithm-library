import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { categories, lessons } from '../src/algorithms'

const byId=new Map(lessons.map((lesson)=>[lesson.id,lesson]))
const assertJsonSafe=(value:unknown,path:string)=>{
  if(typeof value==='number'&&!Number.isFinite(value)) throw new Error(`non-finite number at ${path}`)
  if(typeof value==='bigint'||typeof value==='function'||typeof value==='symbol') throw new Error(`non-JSON value at ${path}: ${typeof value}`)
  if(Array.isArray(value)){value.forEach((item,index)=>assertJsonSafe(item,`${path}[${index}]`));return}
  if(value&&typeof value==='object'){
    for(const [key,item] of Object.entries(value)) assertJsonSafe(item,`${path}.${key}`)
  }
}
const depthCache=new Map<string,number>()
const visiting=new Set<string>()
const depthOf=(id:string):number=>{
  const cached=depthCache.get(id)
  if(cached!==undefined)return cached
  if(visiting.has(id))return 0
  visiting.add(id)
  const lesson=byId.get(id)
  const prerequisites=lesson?.knowledge?.prerequisites??[]
  const depth=prerequisites.length
    ? 1+Math.max(...prerequisites.map((item)=>depthOf(item.lessonId)))
    : 0
  visiting.delete(id)
  depthCache.set(id,depth)
  return depth
}

const payload={
  generatedAt:new Date().toISOString(),
  total:lessons.length,
  categories:categories.map((category)=>({
    id:category.id,index:category.index,title:category.title,zhTitle:category.zhTitle,
    description:category.description,accent:category.accent,subcategories:category.subcategories,
  })),
  lessons:lessons.map((lesson)=>({
    id:lesson.id,
    index:lesson.index,
    category:lesson.category,
    categoryId:lesson.categoryId,
    subcategory:lesson.subcategory,
    title:lesson.title,
    zhTitle:lesson.zhTitle,
    description:lesson.description,
    complexity:lesson.complexity,
    accent:lesson.accent,
    prerequisiteCount:lesson.knowledge?.prerequisites.length??0,
    depth:depthOf(lesson.id),
    visualModel:lesson.visualModel??'',
    steps:lesson.frames.length,
  })),
}

mkdirSync('public',{recursive:true})
writeFileSync('public/catalog-index.json',JSON.stringify(payload))

const lessonDir='public/lessons'
rmSync(lessonDir,{recursive:true,force:true})
mkdirSync(lessonDir,{recursive:true})
const lessonPayloadSizes:{id:string;bytes:number}[]=[]
for(const lesson of lessons){
  assertJsonSafe(lesson,`lesson.${lesson.id}`)
  const serialized=JSON.stringify(lesson)
  const restored=JSON.parse(serialized) as {id?:string;frames?:unknown[]}
  if(restored.id!==lesson.id||restored.frames?.length!==lesson.frames.length){
    throw new Error(`lesson serialization mismatch: ${lesson.id}`)
  }
  lessonPayloadSizes.push({id:lesson.id,bytes:Buffer.byteLength(serialized,'utf8')})
  writeFileSync(`${lessonDir}/${lesson.id}.json`,serialized)
}
const sortedSizes=[...lessonPayloadSizes].sort((a,b)=>a.bytes-b.bytes)
const totalBytes=sortedSizes.reduce((sum,item)=>sum+item.bytes,0)
const p95=sortedSizes[Math.max(0,Math.ceil(sortedSizes.length*.95)-1)]
const largest=sortedSizes.at(-1)!
const average=Math.round(totalBytes/Math.max(1,sortedSizes.length))
mkdirSync('.tmp',{recursive:true})
writeFileSync('.tmp/lesson-payload-sizes.json',JSON.stringify({
  totalLessons:sortedSizes.length,totalBytes,averageBytes:average,p95Bytes:p95.bytes,maxBytes:largest.bytes,maxLesson:largest.id,
  lessons:sortedSizes,
},null,2))

console.log(`catalog index: ${payload.lessons.length} lessons, ${payload.categories.length} categories`)
console.log(`lesson payloads: ${lessons.length} files in ${lessonDir}`)
console.log(`lesson payload size: avg ${average} B · p95 ${p95.bytes} B · max ${largest.bytes} B (${largest.id})`)
if(largest.bytes>150_000) throw new Error(`lesson payload too large: ${largest.id} is ${largest.bytes} bytes`)
