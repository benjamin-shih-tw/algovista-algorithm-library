import {
  AP325_PDF, AP325_JUDGE, worlds, modules, problems,
  moduleById, problemsByModule, getProblemLabel, getProblemTone, getPdfUrl
} from './ap325Curriculum.js'
import { guideByModule } from './guides/index.js'
import { pdfSupplements } from './pdfSupplements.js'
import { getTcircProblemUrl } from './judgeLinks.js'

const STORAGE_KEY='ap325-guide-progress-v1'
const $=(s,r=document)=>r.querySelector(s)
const $$=(s,r=document)=>[...r.querySelectorAll(s)]
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const rich=v=>esc(v)
  .replace(/`([^`]+)`/g,'<code class="inline-code">$1</code>')
  .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')

const chapterTitles={
  0:'教材說明與預備知識',
  1:'遞迴',
  2:'排序與二分搜',
  3:'佇列與堆疊',
  4:'貪心演算法與掃描線演算法',
  5:'分治演算法',
  6:'動態規劃',
  7:'基本圖論演算法',
  8:'樹上演算法'
}

const params=new URLSearchParams(location.search)
const legacyModule=params.get('module')
const legacyChapter=legacyModule&&moduleById.get(legacyModule)?.world
const initialChapter=params.has('chapter')?Number(params.get('chapter')):legacyChapter
const state={
  view:params.get('view')||'path',
  chapter:Number.isInteger(initialChapter)&&worlds.some(w=>w.id===initialChapter)?initialChapter:null,
  query:'',
  chapterFilter:'all',
  status:'all'
}
const empty={solvedProblems:[],solvedAt:{},completedModules:[],readModules:[],exploredVisuals:[],quizPassed:[],notes:{}}
function load(){try{return {...empty,...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}}catch{return {...empty}}}
let progress=load()
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(progress))}
function toggle(arr,key){return arr.includes(key)?arr.filter(x=>x!==key):[...arr,key]}
function toggleProblem(code){
  const solved=progress.solvedProblems.includes(code)
  progress.solvedProblems=toggle(progress.solvedProblems,code)
  if(solved) delete progress.solvedAt[code]
  else progress.solvedAt[code]=new Date().toISOString()
  save(); render(false)
}
function chapterModules(id){return modules.filter(m=>m.world===id).sort((a,b)=>a.order-b.order)}
function chapterProblems(id){
  const ids=new Set(chapterModules(id).map(m=>m.id))
  return problems.filter(p=>ids.has(p.module))
}
function syncUrl(){
  const u=new URL(location.href)
  u.searchParams.delete('module')
  if(state.chapter!==null){
    u.searchParams.set('chapter',String(state.chapter))
    u.searchParams.delete('view')
  }else{
    u.searchParams.delete('chapter')
    if(state.view==='path')u.searchParams.delete('view')
    else u.searchParams.set('view',state.view)
  }
  history.replaceState(null,'',u)
}
function openChapter(id,anchor){
  state.chapter=Number(id)
  state.view='path'
  render()
  if(anchor) requestAnimationFrame(()=>document.getElementById(anchor)?.scrollIntoView({block:'start'}))
}
function topbar(){
  return `<header class="topbar"><div class="topbar-inner">
    <button class="brand" data-action="home">AP325 Guide</button>
    <nav>
      <button data-action="home">Chapters</button>
      <button data-action="view" data-view="practice">Problems</button>
      <a href="${AP325_PDF}" target="_blank" rel="noreferrer">AP325 PDF</a>
      <a href="${AP325_JUDGE}" target="_blank" rel="noreferrer">Judge</a>
    </nav>
  </div></header>`
}
function homeView(){
  const solved=progress.solvedProblems.length
  return `<main class="home page">
    <header class="home-header">
      <h1>AP325</h1>
      <p>依 AP325 v1.3 原章節順序閱讀。</p>
      <span>${solved} / ${problems.length} problems solved</span>
    </header>
    <div class="chapter-list">
      ${worlds.map(w=>{
        const ms=chapterModules(w.id),ps=chapterProblems(w.id),done=ps.filter(p=>progress.solvedProblems.includes(p.code)).length
        return `<button class="chapter-row" data-action="chapter" data-id="${w.id}">
          <span class="chapter-no">${w.id}</span>
          <div><h2>${esc(chapterTitles[w.id]||w.title)}</h2><p>${ms.length} sections · ${ps.length} problems</p></div>
          <span class="chapter-progress">${done}/${ps.length}</span>
          <span class="arrow">›</span>
        </button>`
      }).join('')}
    </div>
  </main>`
}
function problemRowsForModule(m){
  const g=guideByModule[m.id]
  const ordered=[]
  const seen=new Set()
  for(const item of g?.practice||[]){
    const p=problems.find(x=>x.code===item.code)
    if(p&&!seen.has(p.code)){ordered.push(p);seen.add(p.code)}
  }
  for(const p of problemsByModule.get(m.id)||[]){
    if(!seen.has(p.code)){ordered.push(p);seen.add(p.code)}
  }
  if(!ordered.length)return ''
  return `<div class="topic-problems">
    <h3>題目</h3>
    <div class="problem-table">
      ${ordered.map(p=>{
        const solved=progress.solvedProblems.includes(p.code)
        return `<div class="problem-row ${solved?'solved':''}">
          <button class="solve-toggle" data-action="problem" data-code="${esc(p.code)}" title="標記完成">${solved?'✓':'○'}</button>
          <div class="problem-name"><code>${esc(p.code)}</code><strong>${esc(p.title)}</strong><small>PDF p.${p.page}${p.source?' · '+esc(p.source):''}</small></div>
          <span class="difficulty ${getProblemTone(p)}">${esc(getProblemLabel(p))}</span>
          <div class="problem-links"><a href="${getPdfUrl(p.page)}" target="_blank" rel="noreferrer">PDF</a>${getTcircProblemUrl(p.code)?`<a href="${getTcircProblemUrl(p.code)}" target="_blank" rel="noreferrer">Judge</a>`:''}</div>
        </div>`
      }).join('')}
    </div>
  </div>`
}
function renderBlock(block){
  if(!block)return''
  if(block.type==='text')return `<section id="${esc(block.id||'')}" class="lesson-block">
    <h3>${rich(block.title)}</h3>
    ${(block.paragraphs||[]).map(p=>`<p>${rich(p)}</p>`).join('')}
    ${block.bullets?.length?`<ul>${block.bullets.map(x=>`<li>${rich(x)}</li>`).join('')}</ul>`:''}
  </section>`
  if(block.type==='steps')return `<section id="${esc(block.id||'')}" class="lesson-block">
    <h3>${rich(block.title)}</h3>
    ${block.intro?`<p>${rich(block.intro)}</p>`:''}
    <ol class="steps">${(block.steps||[]).map(x=>`<li><strong>${rich(x.title)}</strong><p>${rich(x.body)}</p></li>`).join('')}</ol>
  </section>`
  if(block.type==='example')return `<section id="${esc(block.id||'')}" class="lesson-block example">
    <h3>${rich(block.title)}</h3>
    ${block.problem?`<p class="example-problem">${rich(block.problem)}</p>`:''}
    <ol>${(block.steps||[]).map(x=>`<li>${rich(x)}</li>`).join('')}</ol>
    ${block.conclusion?`<p class="example-result">${rich(block.conclusion)}</p>`:''}
  </section>`
  if(block.type==='callout')return `<aside id="${esc(block.id||'')}" class="note ${esc(block.tone||'info')}"><strong>${rich(block.title)}</strong><p>${rich(block.body)}</p></aside>`
  if(block.type==='code')return `<section id="${esc(block.id||'')}" class="lesson-block">
    <h3>${rich(block.title)}</h3>
    ${block.intro?`<p>${rich(block.intro)}</p>`:''}
    <div class="code-wrap"><button data-action="copy-code" data-code="${encodeURIComponent(block.code||'')}">Copy</button><pre><code class="language-cpp">${esc(block.code||'')}</code></pre></div>
    ${block.notes?.length?`<ul class="code-notes">${block.notes.map(x=>`<li>${rich(x)}</li>`).join('')}</ul>`:''}
  </section>`
  if(block.type==='table')return `<section id="${esc(block.id||'')}" class="lesson-block">
    <h3>${rich(block.title)}</h3>
    <div class="table-wrap"><table><thead><tr>${(block.headers||[]).map(h=>`<th>${rich(h)}</th>`).join('')}</tr></thead><tbody>${(block.rows||[]).map(r=>`<tr>${r.map(c=>`<td>${rich(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
  </section>`
  return''
}
function supplementBlocks(m){
  return (pdfSupplements[m.id]||[]).map((x,i)=>`<section id="${m.id}-supp-${i}" class="lesson-block">
    <h3>${rich(x.title)}</h3>
    ${(x.paragraphs||[]).map(p=>`<p>${rich(p)}</p>`).join('')}
    ${x.bullets?.length?`<ul>${x.bullets.map(b=>`<li>${rich(b)}</li>`).join('')}</ul>`:''}
  </section>`).join('')
}
function topicStartPage(m){
  const ps=problemsByModule.get(m.id)||[]
  return ps.length?Math.min(...ps.map(p=>p.page)):1
}
function topicSection(m){
  return `<section class="topic source-topic" id="${m.id}">
    <header class="topic-header source-topic-header">
      <span>AP325 ${esc(m.chapter)}</span>
      <h2>AP325 ${esc(m.chapter)}</h2>
      <a href="${getPdfUrl(topicStartPage(m))}" target="_blank" rel="noreferrer">開啟原教材對應頁 ↗</a>
    </header>
    ${problemRowsForModule(m)}
  </section>`
}
function chapterView(id){
  const w=worlds.find(x=>x.id===id)
  const ms=chapterModules(id)
  const ps=chapterProblems(id)
  const done=ps.filter(p=>progress.solvedProblems.includes(p.code)).length
  const prev=worlds.find(x=>x.id===id-1),next=worlds.find(x=>x.id===id+1)
  const startPage=ps.length?Math.min(...ps.map(p=>p.page)):1
  return `<main class="chapter-page">
    <div class="breadcrumb"><button data-action="home">AP325</button><span>›</span><b>${id}. ${esc(chapterTitles[id]||w?.title||'')}</b></div>
    <div class="chapter-layout">
      <aside class="chapter-toc">
        <strong>${id}. ${esc(chapterTitles[id]||w?.title||'')}</strong>
        ${ms.map(m=>`<a href="#${m.id}"><span>${esc(m.chapter)}</span>AP325 ${esc(m.chapter)}</a>`).join('')}
        <div class="toc-links"><a href="${AP325_PDF}" target="_blank" rel="noreferrer">原教材 PDF</a><a href="${AP325_JUDGE}" target="_blank" rel="noreferrer">AP325 題庫</a></div>
      </aside>
      <article class="chapter-article">
        <header class="chapter-header">
          <span>Chapter ${id}</span>
          <h1>${esc(chapterTitles[id]||w?.title||'')}</h1>
          <p>${done} / ${ps.length} problems solved</p>
        </header>
        <section class="pdf-preview">
          <div class="pdf-preview-head"><div><b>AP325 v1.3 原教材</b><span>從第 ${startPage} 頁開始；內容直接顯示原始 PDF，不改寫。</span></div><a href="${getPdfUrl(startPage)}" target="_blank" rel="noreferrer">新分頁開啟 ↗</a></div>
          <iframe src="${AP325_PDF}#page=${startPage}&zoom=page-width" title="AP325 v1.3 Chapter ${id}"></iframe>
        </section>
        ${ms.map(topicSection).join('')}
        <nav class="chapter-nav">
          ${prev?`<button data-action="chapter" data-id="${prev.id}"><small>上一章</small><b>${prev.id}. ${esc(chapterTitles[prev.id]||prev.title)}</b></button>`:'<span></span>'}
          ${next?`<button data-action="chapter" data-id="${next.id}"><small>下一章</small><b>${next.id}. ${esc(chapterTitles[next.id]||next.title)}</b></button>`:'<span></span>'}
        </nav>
      </article>
    </div>
  </main>`
}
function practiceView(){
  let list=problems.filter(p=>{
    const m=moduleById.get(p.module)
    const q=(p.code+' '+p.title+' '+(p.source||'')).toLowerCase().includes(state.query.toLowerCase())
    const c=state.chapterFilter==='all'||m.world===Number(state.chapterFilter)
    const solved=progress.solvedProblems.includes(p.code)
    const st=state.status==='all'||(state.status==='solved'?solved:!solved)
    return q&&c&&st
  })
  return `<main class="page problems-page">
    <header><h1>Problems</h1><p>AP325 題目列表。</p></header>
    <div class="filters">
      <input id="search" value="${esc(state.query)}" placeholder="搜尋題號或題名">
      <select id="chapter-filter"><option value="all">全部章節</option>${worlds.map(w=>`<option value="${w.id}" ${String(w.id)===String(state.chapterFilter)?'selected':''}>${w.id}. ${esc(chapterTitles[w.id]||w.title)}</option>`).join('')}</select>
      <select id="status-filter"><option value="all">全部狀態</option><option value="unsolved" ${state.status==='unsolved'?'selected':''}>未完成</option><option value="solved" ${state.status==='solved'?'selected':''}>已完成</option></select>
    </div>
    <div class="all-problems">${list.map(p=>{
      const m=moduleById.get(p.module),solved=progress.solvedProblems.includes(p.code)
      return `<div class="all-problem-row ${solved?'solved':''}">
        <button class="solve-toggle" data-action="problem" data-code="${esc(p.code)}">${solved?'✓':'○'}</button>
        <div><strong>${esc(p.code)} · ${esc(p.title)}</strong><small>${m.world}. ${esc(chapterTitles[m.world]||'')} · PDF p.${p.page}</small></div>
        <span>${esc(getProblemLabel(p))}</span>
        ${getTcircProblemUrl(p.code)?`<a href="${getTcircProblemUrl(p.code)}" target="_blank" rel="noreferrer">Judge</a>`:''}
      </div>`
    }).join('')}</div>
  </main>`
}
function footer(){return `<footer><span>AP325 Guide</span><div><a href="${AP325_PDF}" target="_blank" rel="noreferrer">AP325 v1.3</a><a href="${AP325_JUDGE}" target="_blank" rel="noreferrer">Judge</a></div></footer>`}
function enhanceRenderedContent(){
  if(window.renderMathInElement){
    window.renderMathInElement(document.body,{
      delimiters:[
        {left:'$$',right:'$$',display:true},
        {left:'$',right:'$',display:false},
        {left:'\\(',right:'\\)',display:false},
        {left:'\\[',right:'\\]',display:true}
      ],
      throwOnError:false,
      ignoredTags:['script','noscript','style','textarea','pre','code']
    })
  }
  if(window.hljs){
    $$('pre code.language-cpp').forEach(el=>{
      if(!el.dataset.highlighted) window.hljs.highlightElement(el)
    })
  }
}
function render(scrollTop=true){
  document.body.innerHTML=topbar()+(state.chapter!==null?chapterView(state.chapter):state.view==='practice'?practiceView():homeView())+footer()
  syncUrl();bind();enhanceRenderedContent()
  if(scrollTop)window.scrollTo({top:0})
}
function bind(){
  $$('[data-action]').forEach(el=>el.addEventListener('click',async()=>{
    const a=el.dataset.action
    if(a==='home'){state.chapter=null;state.view='path';render()}
    if(a==='view'){state.chapter=null;state.view=el.dataset.view;render()}
    if(a==='chapter')openChapter(Number(el.dataset.id))
    if(a==='problem')toggleProblem(el.dataset.code)
    if(a==='copy-code'){
      try{await navigator.clipboard.writeText(decodeURIComponent(el.dataset.code||''));el.textContent='Copied'}
      catch{el.textContent='Copy failed'}
    }
  }))
  $('#search')?.addEventListener('input',e=>{state.query=e.target.value;render(false)})
  $('#chapter-filter')?.addEventListener('change',e=>{state.chapterFilter=e.target.value;render(false)})
  $('#status-filter')?.addEventListener('change',e=>{state.status=e.target.value;render(false)})
}
window.addEventListener('load',enhanceRenderedContent)
render()
