import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronRight, Layers3, RotateCcw, Search, Sparkles, Workflow } from 'lucide-react'
import type { AlgorithmCategory, AlgorithmLesson } from './algorithms'
import DotPattern from '@/components/ui/dot-pattern-1'
import { ThemeControls, themeStyle, useThemeSettings } from './ThemeControls'

interface CatalogLesson {
  id:string
  index:string
  category:string
  categoryId:AlgorithmCategory['id']
  subcategory:string
  title:string
  zhTitle:string
  description:string
  complexity:string
  accent:string
  prerequisiteCount:number
  depth:number
  visualModel:string
  steps:number
}
interface CatalogPayload {
  generatedAt:string
  total:number
  categories:AlgorithmCategory[]
  lessons:CatalogLesson[]
}
let fullLessonMapPromise:Promise<Map<string,AlgorithmLesson>>|null=null
const loadFullLessonMap=()=>fullLessonMapPromise??=import('./algorithms').then((module)=>new Map(module.lessons.map((lesson)=>[lesson.id,lesson])))
const LazyLessonPlayer=lazy(()=>import('./LessonPlayer'))
const warmLessonExperience=()=>{void Promise.all([loadFullLessonMap(),import('./LessonPlayer')]).catch(()=>{fullLessonMapPromise=null})}

const BEGINNER_PATH = [
  { id: 'linear-search', step: '01', reason: '先學會逐格讀值、比較條件與排除候選。' },
  { id: 'binary-search', step: '02', reason: '接著理解「為什麼能安全丟掉一半」。' },
  { id: 'prefix-sum', step: '03', reason: '第一次體驗用預處理換取更快查詢。' },
  { id: 'queue', step: '04', reason: '先掌握 FIFO，才不會在 BFS 中突然遇到未定義容器。' },
  { id: 'bfs', step: '05', reason: '把 Queue 套到圖上，按距離逐層搜尋。' },
  { id: 'segment-tree', step: '06', reason: '最後組合遞迴、區間分解與可修改資料結構。' },
] as const

const beginnerRank = new Map<string,string>(BEGINNER_PATH.map((item) => [item.id, item.step]))

function LessonCard({lesson,onSelect}:{lesson:CatalogLesson;onSelect:(lesson:CatalogLesson)=>void}) { const rank=beginnerRank.get(lesson.id);return <button className="lesson-card compact" onPointerEnter={warmLessonExperience} onFocus={warmLessonExperience} onClick={()=>onSelect(lesson)} style={{'--lesson-accent':lesson.accent} as React.CSSProperties}><span className="card-index">{lesson.index}</span>{rank&&<span className="beginner-rank">新手路線 {rank}</span>}<span className="card-category">{lesson.category}</span><h2>{lesson.title}</h2><p>{lesson.zhTitle} · {lesson.description}</p><div className="card-dependency"><Workflow/>{lesson.prerequisiteCount?`${lesson.prerequisiteCount} 堂先備 · 深度 ${lesson.depth}`:'基礎單元'}</div><footer><span>{lesson.complexity}</span><b>開始學習 <ChevronRight size={15}/></b></footer></button> }

function CategoryDetail({category,lessons,onBack,onSelect}:{category:AlgorithmCategory;lessons:CatalogLesson[];onBack:()=>void;onSelect:(lesson:CatalogLesson)=>void}) {
  const categoryLessons=lessons.filter((lesson)=>lesson.categoryId===category.id).sort((a,b)=>a.depth-b.depth||Number(a.index)-Number(b.index))
  return <main className="library-page"><header className="site-header"><button className="back-button" onClick={onBack}><ArrowLeft size={16}/> 所有分類</button><div className="wordmark"><Sparkles size={14}/> ALGOVISTA</div><span className="header-count">CATEGORY {category.index}</span></header>
    <section className="category-heading" style={{'--category-accent':category.accent} as React.CSSProperties}><span>{category.index} · ALGORITHM DOMAIN</span><h1>{category.title}</h1><p>{category.zhTitle} · {category.description}</p></section>
    <section className="subcategory-list">{category.subcategories.map((subcategory)=>{const items=categoryLessons.filter((lesson)=>lesson.subcategory===subcategory);if(!items.length)return null;return <div className="subcategory" key={subcategory}><header><span>{subcategory}</span><b>{String(items.length).padStart(2,'0')} ALGORITHMS</b></header><div className="subcategory-grid">{items.map((lesson)=><LessonCard key={lesson.id} lesson={lesson} onSelect={onSelect}/>)}</div></div>})}</section>
  </main>
}

function Library({ catalog,onSelect }: { catalog:CatalogPayload;onSelect: (lesson: CatalogLesson) => void }) {
  const [category,setCategory]=useState<AlgorithmCategory|null>(null)
  const [query,setQuery]=useState('')
  const lessons=catalog.lessons
  const matched=query.trim()?lessons.filter((lesson)=>`${lesson.title} ${lesson.zhTitle} ${lesson.category} ${lesson.subcategory}`.toLowerCase().includes(query.trim().toLowerCase())):[]
  const beginnerLessons=BEGINNER_PATH.map((item)=>({...item,lesson:lessons.find((lesson)=>lesson.id===item.id)!}))
  if(category) return <CategoryDetail category={category} lessons={lessons} onBack={()=>setCategory(null)} onSelect={onSelect}/>
  return <main className="library-page"><header className="site-header"><div className="wordmark"><Sparkles size={14}/> ALGOVISTA</div><span className="header-note">COMPETITIVE PROGRAMMING · VISUALIZED</span></header>
    <section className="library-hero relative overflow-hidden"><DotPattern width={18} height={18} cr={0.65} className="opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"/><span className="relative z-10">STRUCTURED ALGORITHM LIBRARY</span><h1 className="relative z-10">先建立地圖，<br/><em>再理解細節。</em></h1><p className="relative z-10">從演算法領域進入子分類，再學習具體演算法。動畫、資料結構狀態與 C++ 程式碼在每一步保持同步。</p></section>
    <section className="beginner-path"><header><div><span>第一次來？</span><h2>照這 6 堂建立第一張演算法地圖</h2></div><p>每堂都會先教你看畫面，再讓動畫、變數與 C++ 程式碼逐步同步。</p></header><div>{beginnerLessons.map(({lesson,step,reason})=><button key={lesson.id} onPointerEnter={warmLessonExperience} onFocus={warmLessonExperience} onClick={()=>onSelect(lesson)} style={{'--lesson-accent':lesson.accent} as React.CSSProperties}><span>{step}</span><div><b>{lesson.zhTitle}</b><small>{lesson.title}</small><p>{reason}</p></div><ChevronRight size={15}/></button>)}</div></section>
    <label className="library-search"><Search/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="搜尋演算法、分類或中文名稱"/><span>{query?`${matched.length} RESULTS`:`${lessons.length} ALGORITHMS`}</span></label>
    {query?<section className="search-results">{matched.length?matched.map((lesson)=><LessonCard key={lesson.id} lesson={lesson} onSelect={onSelect}/>):<p>找不到符合的演算法。</p>}</section>:<section className="category-grid">{catalog.categories.map((category)=><button key={category.id} className="category-card" onClick={()=>setCategory(category)} style={{'--category-accent':category.accent} as React.CSSProperties}><span>{category.index}</span><Layers3/><small>{category.subcategories.length} SUBCATEGORIES</small><h2>{category.title}</h2><p>{category.zhTitle} · {category.description}</p><footer><b>{lessons.filter((lesson)=>lesson.categoryId===category.id).length} 個演算法</b><ChevronRight/></footer></button>)}</section>}
  </main>
}

export default function App() {
  const [theme,setTheme]=useThemeSettings()
  const [catalog,setCatalog]=useState<CatalogPayload|null>(null)
  const [catalogError,setCatalogError]=useState('')
  const [selected,setSelected]=useState<AlgorithmLesson|null>(null)
  const [lessonLoading,setLessonLoading]=useState(false)
  const [lessonError,setLessonError]=useState('')
  const requestRef=useRef(0)

  const showLesson=async(lessonId:string|null)=>{
    const request=++requestRef.current
    setLessonError('')
    if(!lessonId){
      setLessonLoading(false)
      setSelected(null)
      return
    }
    setLessonLoading(true)
    try{
      const map=await loadFullLessonMap()
      const lesson=map.get(lessonId)
      if(request===requestRef.current){
        setSelected(lesson??null)
        if(!lesson)setLessonError(`找不到課程：${lessonId}`)
      }
    }catch(error){
      fullLessonMapPromise=null
      if(request===requestRef.current){
        setSelected(null)
        setLessonError(error instanceof Error?error.message:'lesson chunk load failed')
      }
    }finally{
      if(request===requestRef.current)setLessonLoading(false)
    }
  }

  useEffect(()=>{
    let cancelled=false
    fetch('./catalog-index.json',{cache:'force-cache'})
      .then((response)=>{if(!response.ok)throw new Error(`catalog HTTP ${response.status}`);return response.json() as Promise<CatalogPayload>})
      .then((payload)=>{if(!cancelled){setCatalog(payload);setCatalogError('')}})
      .catch((error)=>{if(!cancelled)setCatalogError(error instanceof Error?error.message:'catalog load failed')})
    void showLesson(new URLSearchParams(window.location.search).get('lesson'))
    const syncFromLocation=()=>void showLesson(new URLSearchParams(window.location.search).get('lesson'))
    window.addEventListener('popstate',syncFromLocation)
    return()=>{cancelled=true;window.removeEventListener('popstate',syncFromLocation)}
  },[])

  const selectLesson=(lessonId:string)=>{
    const url=new URL(window.location.href)
    url.searchParams.set('lesson',lessonId)
    url.searchParams.delete('step')
    window.history.pushState({algovista:'lesson',lessonId},'',url.pathname+`?${url.searchParams.toString()}`)
    void showLesson(lessonId)
  }
  const clearLesson=()=>{
    window.history.pushState({algovista:'library'},'',window.location.pathname)
    void showLesson(null)
  }
  const catalogById=new Map((catalog?.lessons??[]).map((lesson)=>[lesson.id,lesson]))
  const catalogManifest=JSON.stringify((catalog?.lessons??[]).map(({id,visualModel,steps})=>({id,visualModel,steps})))
  const content=selected
    ? <Suspense fallback={<main className="library-page"><header className="site-header"><div className="wordmark"><Sparkles size={14}/> ALGOVISTA</div></header><section className="library-hero"><span>LOADING PLAYER</span><h1>正在載入動畫播放器…</h1><p>課程資料已就緒，正在載入動畫與互動介面。</p></section></main>}><LazyLessonPlayer lesson={selected} onBack={clearLesson} onNavigate={selectLesson} catalogById={catalogById} totalLessons={catalog?.total??202}/></Suspense>
    : lessonLoading
      ? <main className="library-page"><header className="site-header"><div className="wordmark"><Sparkles size={14}/> ALGOVISTA</div></header><section className="library-hero"><span>LOADING LESSON</span><h1>正在載入演算法內容…</h1><p>首頁目錄維持輕量；完整動畫、程式碼與教學資料只在進入課程時載入。</p></section></main>
      : lessonError
        ? <main className="library-page"><header className="site-header"><button className="back-button" onClick={clearLesson}><ArrowLeft size={16}/> 回演算法目錄</button><div className="wordmark"><Sparkles size={14}/> ALGOVISTA</div></header><section className="library-hero"><span>LESSON LOAD ERROR</span><h1>課程載入失敗</h1><p>{lessonError}</p><button className="back-button" onClick={()=>void showLesson(new URLSearchParams(window.location.search).get('lesson'))}><RotateCcw size={14}/>重新載入課程</button></section></main>
        : catalog
          ? <Library catalog={catalog} onSelect={(lesson)=>selectLesson(lesson.id)}/>
          : <main className="library-page"><header className="site-header"><div className="wordmark"><Sparkles size={14}/> ALGOVISTA</div></header><section className="library-hero"><span>{catalogError?'CATALOG ERROR':'LOADING CATALOG'}</span><h1>{catalogError?'目錄載入失敗':'正在載入演算法目錄…'}</h1><p>{catalogError||'只載入課程索引，不載入 202 課完整動畫資料。'}</p>{catalogError&&<button className="back-button" onClick={()=>window.location.reload()}><RotateCcw size={14}/>重新載入目錄</button>}</section></main>
  return <div className="app-shell" data-accent-mode={theme.accentMode} style={themeStyle(theme)}><script id="catalog-manifest" type="application/json">{catalogManifest}</script><ThemeControls theme={theme} onChange={setTheme}/>{content}</div>
}
