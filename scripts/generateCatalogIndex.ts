import { mkdirSync, writeFileSync } from 'node:fs'
import { categories, lessons } from '../src/algorithms'

const byId=new Map(lessons.map((lesson)=>[lesson.id,lesson]))
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
console.log(`catalog index: ${payload.lessons.length} lessons, ${payload.categories.length} categories`)
