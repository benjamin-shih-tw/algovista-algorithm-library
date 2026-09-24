import { AP325_PDF, AP325_JUDGE, worlds, modules, problems, moduleById, problemsByModule, worldById, getProblemLabel, getProblemTone, getPdfUrl } from './ap325Curriculum.js'
import { lessonContent, WORLD_BOSSES } from './lessonContent.js'
import { guideByModule } from './guides/index.js'
import { guideArticles } from './guideArticles.js'
import { pdfSupplements, ap325SourceMap } from './pdfSupplements.js'

const ALGO_BASE='https://benjamin-shih-tw.github.io/algovista-algorithm-library/'
const STORAGE_KEY='ap325-guide-progress-v1'
const $=(s,r=document)=>r.querySelector(s)
const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const initialParams=new URLSearchParams(location.search)
const initialModule=initialParams.get('module')
const state={view:initialParams.get('view')||'path',module:initialModule&&moduleById.has(initialModule)?initialModule:null,query:'',world:'all',status:'all',tone:'all',hint:null,quizChoice:null,visual:null}
const empty={completedModules:[],readModules:[],solvedProblems:[],exploredVisuals:[],solvedAt:{},quizPassed:[],checklistDone:{},notes:{},streak:1,lastVisit:null}
function load(){try{return {...empty,...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}}catch{return {...empty}}}
let progress=load()
const today=()=>new Date().toISOString().slice(0,10)
const yesterday=()=>{const d=new Date();d.setDate(d.getDate()-1);return d.toISOString().slice(0,10)}
if(progress.lastVisit!==today()){progress.streak=progress.lastVisit===yesterday()?(progress.streak||1)+1:1;progress.lastVisit=today();save()}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(progress))}
function syncUrl(){
  const u=new URL(location.href)
  if(state.module){u.searchParams.set('module',state.module);u.searchParams.delete('view')}
  else{u.searchParams.delete('module'); if(state.view&&state.view!=='path')u.searchParams.set('view',state.view);else u.searchParams.delete('view')}
  history.replaceState(null,'',u)
}
function checklistKey(moduleId,index){return moduleId+':'+index}
function toggleChecklist(moduleId,index,checked){
  const key=checklistKey(moduleId,index)
  progress.checklistDone[key]=!!checked
  save()
}
function toggle(arr,key){return arr.includes(key)?arr.filter(x=>x!==key):[...arr,key]}
function toggleProblem(code){const solved=progress.solvedProblems.includes(code);progress.solvedProblems=toggle(progress.solvedProblems,code);if(solved)delete progress.solvedAt[code];else progress.solvedAt[code]=new Date().toISOString();save();render()}
function toggleModule(id){progress.completedModules=toggle(progress.completedModules,id);save();render()}
function markVisual(id){if(!progress.exploredVisuals.includes(id)){progress.exploredVisuals.push(id);save()}state.visual=id;render()}
function xp(){return progress.completedModules.length*25+progress.readModules.length*15+progress.solvedProblems.length*40+progress.exploredVisuals.length*10+progress.quizPassed.length*15}
function mProgress(m){const list=problemsByModule.get(m.id)||[];const quiz=lessonContent[m.id]?.quiz?1:0;const done=(progress.completedModules.includes(m.id)?1:0)+(progress.quizPassed.includes(m.id)?1:0)+list.filter(p=>progress.solvedProblems.includes(p.code)).length;return Math.round(done/(list.length+1+quiz)*100)}
function wProgress(id){const ms=modules.filter(m=>m.world===id);let total=0,done=0;for(const m of ms){const ps=problemsByModule.get(m.id)||[];const quiz=lessonContent[m.id]?.quiz?1:0;total+=ps.length+1+quiz;done+=(progress.completedModules.includes(m.id)?1:0)+(progress.quizPassed.includes(m.id)?1:0)+ps.filter(p=>progress.solvedProblems.includes(p.code)).length}return total?Math.round(done/total*100):0}
function icon(x){return `<span class="ico" aria-hidden="true">${x}</span>`}
function topbar(){return `<header class="ap-topbar"><div class="ap-topbar-inner"><button class="ap-brand" data-action="view" data-view="path">AP325 Guide</button><nav class="ap-world-nav">${worlds.map(w=>`<a href="./#world-${w.id}">${esc(w.title)}</a>`).join('')}</nav><nav class="ap-utility-nav"><button class="${state.view==='practice'?'active':''}" data-action="view" data-view="practice">Problems</button><button class="${state.view==='review'?'active':''}" data-action="view" data-view="review">Review</button><a href="${AP325_JUDGE}" target="_blank" rel="noreferrer">Judge</a></nav></div></header>`}
function lessonFor(m){return lessonContent[m.id]||null}
function moduleIndex(m){return modules.findIndex(x=>x.id===m.id)}
function neighborModule(m,delta){const i=moduleIndex(m)+delta;return i>=0&&i<modules.length?modules[i]:null}
function quizCard(m,c){
  if(!c?.quiz)return ''
  const q=c.quiz,choice=state.quizChoice,passed=progress.quizPassed.includes(m.id),answered=choice!==null
  const choices=q.options.map((opt,i)=>`<button class="ap-quiz-option ${answered?(i===q.answer?'correct':i===choice?'wrong':''):''}" data-action="quiz" data-id="${m.id}" data-choice="${i}" ${passed?'disabled':''}><span>${String.fromCharCode(65+i)}</span><b>${esc(opt)}</b></button>`).join('')
  return `<section class="ap-lesson-card ap-quiz-card"><div class="ap-section-label">✓ QUICK CHECK</div><h2>不看筆記，你能回答嗎？</h2><p class="ap-quiz-question">${esc(q.q)}</p><div class="ap-quiz-options">${choices}</div>${answered||passed?`<div class="ap-quiz-feedback ${passed||choice===q.answer?'ok':'bad'}"><b>${passed||choice===q.answer?'答對了':'還差一點'}</b><p>${esc(q.explain)}</p></div>`:''}</section>`
}
function deepLesson(m){
  const c=lessonFor(m); if(!c)return ''
  const boss=c.boss?problems.find(p=>p.code===c.boss):null
  return `<section class="ap-lesson-card ap-deep-lesson"><div class="ap-section-label">▤ LESSON</div><div class="ap-lesson-prose"><article><span>WHY THIS WORKS</span><h2>先理解，再背模板</h2><p>${esc(c.why)}</p></article><article class="ap-pattern-box"><span>PATTERN</span><strong>${esc(c.pattern)}</strong></article></div><div class="ap-derivation"><h3>推導順序</h3>${c.steps.map((x,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><p>${esc(x)}</p></div>`).join('')}</div><div class="ap-invariant"><span>INVARIANT</span><p>${esc(c.invariant)}</p></div><div class="ap-template"><header><div><span>C++ / PSEUDOCODE</span><b>最小可重用模板</b></div><button data-action="copy-template" data-id="${m.id}">Copy</button></header><pre><code>${esc(c.template)}</code></pre></div>${boss?`<div class="ap-boss-card"><span>CHAPTER BOSS</span><div><code>${esc(boss.code)}</code><h3>${esc(boss.title)}</h3><p>先完成本模組核心題，再把這題當作不看提示的總驗收。</p></div><a href="${getPdfUrl(boss.page)}" target="_blank" rel="noreferrer">Open PDF ↗</a></div>`:''}</section>`
}
function longformGuide(m){
  const a=guideArticles[m.id]
  if(!a) return ''
  return `<section class="ap-longform-guide">
    <div class="ap-prereq-strip">
      <div><span>PREREQUISITES</span><div>${(a.prerequisites||[]).map(x=>`<b>${esc(x)}</b>`).join('')}</div></div>
      <div><span>GOAL</span><p>${esc(a.objective||'')}</p></div>
    </div>
    ${(a.sections||[]).map((sec,i)=>`<section id="deep-${i}" class="ap-longform-section"><span>DEEP DIVE ${String(i+1).padStart(2,'0')}</span><h2>${esc(sec.title)}</h2>${(sec.body||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${sec.bullets?.length?`<ul>${sec.bullets.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}</section>`).join('')}
    ${a.worked?`<section id="deep-worked" class="ap-longform-section ap-longform-worked"><span>WORKED EXAMPLE</span><h2>${esc(a.worked.title)}</h2><p class="ap-worked-setup">${esc(a.worked.setup||'')}</p><div class="ap-worked-steps">${(a.worked.steps||[]).map((x,i)=>`<article><b>${String(i+1).padStart(2,'0')}</b><p>${esc(x)}</p></article>`).join('')}</div><aside><b>TAKEAWAY</b><p>${esc(a.worked.takeaway||'')}</p></aside></section>`:''}
    ${a.correctness?.length?`<section id="deep-proof" class="ap-longform-section ap-proof-section"><span>CORRECTNESS</span><h2>為什麼這個方法是對的？</h2>${a.correctness.map(p=>`<p>${esc(p)}</p>`).join('')}</section>`:''}
    ${a.checklist?.length?`<section id="deep-checklist" class="ap-longform-section ap-checklist-section"><span>IMPLEMENTATION CHECKLIST</span><h2>送出前自己檢查</h2><div>${a.checklist.map((x,i)=>`<label><input type="checkbox" data-checklist-module="${m.id}" data-checklist-index="${i}" ${progress.checklistDone[checklistKey(m.id,i)]?'checked':''}> <span>${esc(x)}</span></label>`).join('')}</div></section>`:''}
  </section>`
}

function focusProblemFor(m){
  const code=guideByModule[m.id]?.focus?.code
  return code?problems.find(p=>p.code===code)||null:null
}
function questPanel(m){
  const focus=focusProblemFor(m)
  const read=progress.readModules.includes(m.id)
  const visualDone=!m.visuals.length||m.visuals.some(id=>progress.exploredVisuals.includes(id))
  const focusDone=!focus||progress.solvedProblems.includes(focus.code)
  const quizDone=progress.quizPassed.includes(m.id)
  const done=progress.completedModules.includes(m.id)
  const tasks=[
    {ok:read,label:'讀完完整 Guide',sub:'完成正文、worked example 與 correctness'},
    {ok:visualDone,label:m.visuals.length?'看至少一個 AlgoVista 動畫':'本節不需要動畫',sub:m.visuals.length?'用動畫確認 state / invariant':'以文章與例題為主'},
    {ok:focusDone,label:focus?`完成 Focus 題 ${focus.code}`:'完成核心練習',sub:focus?focus.title:'本節沒有指定 Focus 題'},
    {ok:quizDone,label:'通過 Quick Check',sub:'不看文章回答核心觀念'},
    {ok:done,label:'Master Module',sub:'確認你能獨立重建演算法'}
  ]
  const count=tasks.filter(x=>x.ok).length
  return `<section class="ap-quest-panel"><header><div><span>MODULE QUEST</span><h2>${count}/${tasks.length} completed</h2></div><div class="ap-quest-meter"><i style="width:${count/tasks.length*100}%"></i></div></header><div class="ap-quest-tasks">${tasks.map((t,i)=>`<article class="${t.ok?'done':''}"><span>${t.ok?'✓':i+1}</span><div><b>${esc(t.label)}</b><small>${esc(t.sub)}</small></div></article>`).join('')}</div><div class="ap-quest-actions"><button data-action="mark-read" data-id="${m.id}">${read?'✓ Guide 已讀完':'標記 Guide 已讀完 · +15 XP'}</button></div></section>`
}
function moduleNotes(m){
  const value=progress.notes?.[m.id]||''
  return `<section class="ap-module-notes"><div><span>MY NOTES</span><h2>把你真正會忘的東西留下來</h2><p>存在瀏覽器本機，不會公開。</p></div><textarea id="module-notes" data-module="${m.id}" placeholder="例如：lower_bound 是第一個 >= x；Tree DP 要先 child 後 parent…">${esc(value)}</textarea><small id="notes-status">${value?'已儲存':'尚未輸入'}</small></section>`
}

function sourceSupplement(m){
  const items=pdfSupplements[m.id]||[]
  if(!items.length)return ''
  return `<section class="ap-source-supplement"><div class="ap-source-supplement-head"><span>FROM THE ORIGINAL PDF</span><h2>AP325 原書中不能被「併章」吃掉的內容</h2><p>下面是原教材目錄中的獨立小節；在 Guide 裡保留成正式正文，而不是一句帶過。</p></div>${items.map((x,i)=>`<article id="pdf-supp-${i}"><span>AP325 SOURCE NOTE</span><h3>${esc(x.title)}</h3>${(x.paragraphs||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${x.bullets?.length?`<ul>${x.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul>`:''}</article>`).join('')}</section>`
}
function coverageView(){
  const grouped=worlds.map(w=>({w,rows:ap325SourceMap.filter(x=>moduleById.get(x.module)?.world===w.id)}))
  return `<section class="ap-coverage-page"><header><span>PDF → GUIDE</span><h1>AP325 Source Coverage</h1><p>不是用「38 個 module」冒充完整；這裡逐項列出原 PDF 目錄小節實際落在哪篇 Guide。</p></header><div class="ap-coverage-summary"><b>${ap325SourceMap.length}</b><span>個原教材小節已映射</span><a href="${AP325_PDF}" target="_blank" rel="noreferrer">原始 AP325 PDF ↗</a></div>${grouped.map(({w,rows})=>`<section class="ap-coverage-world" style="--world-accent:${w.accent}"><div><span>WORLD ${w.id}</span><h2>${esc(w.title)}</h2></div><div class="ap-coverage-list">${rows.map(row=>{const m=moduleById.get(row.module);return `<button data-action="module" data-id="${row.module}"><code>${esc(row.section)}</code><div><b>${esc(row.title)}</b><small>→ ${esc(m?.title||row.module)}</small></div><span>›</span></button>`}).join('')}</div></section>`).join('')}</section>`
}

function guideBlock(block,m){
  if(block.type==='text') return `<section id="${esc(block.id)}" class="ap-guide-section"><span class="ap-guide-kicker">${esc(block.kicker||'LESSON')}</span><h2>${esc(block.title)}</h2>${(block.paragraphs||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${block.bullets?.length?`<ul>${block.bullets.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}</section>`
  if(block.type==='steps') return `<section id="${esc(block.id)}" class="ap-guide-section"><span class="ap-guide-kicker">${esc(block.kicker||'STEP BY STEP')}</span><h2>${esc(block.title)}</h2>${block.intro?`<p>${esc(block.intro)}</p>`:''}<div class="ap-guide-steps">${block.steps.map((x,i)=>`<article><span>${i+1}</span><div><b>${esc(x.title)}</b><p>${esc(x.body)}</p></div></article>`).join('')}</div></section>`
  if(block.type==='example') return `<section id="${esc(block.id)}" class="ap-guide-section ap-worked-example"><span class="ap-guide-kicker">WORKED EXAMPLE</span><h2>${esc(block.title)}</h2>${block.problem?`<div class="ap-example-problem">${esc(block.problem)}</div>`:''}<div class="ap-example-trace">${block.steps.map((x,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><p>${esc(x)}</p></div>`).join('')}</div>${block.conclusion?`<div class="ap-example-conclusion"><b>結論</b><p>${esc(block.conclusion)}</p></div>`:''}</section>`
  if(block.type==='callout') return `<aside id="${esc(block.id)}" class="ap-guide-callout ${esc(block.tone||'info')}"><b>${esc(block.title)}</b><p>${esc(block.body)}</p></aside>`
  if(block.type==='code') return `<section id="${esc(block.id)}" class="ap-guide-section"><span class="ap-guide-kicker">${esc(block.kicker||'IMPLEMENTATION')}</span><h2>${esc(block.title)}</h2>${block.intro?`<p>${esc(block.intro)}</p>`:''}<div class="ap-guide-code"><header><b>${esc(block.label||'C++17')}</b><button data-action="copy-guide-code" data-module="${m.id}" data-block="${esc(block.id)}">Copy</button></header><pre><code>${esc(block.code)}</code></pre></div>${block.notes?.length?`<div class="ap-code-notes">${block.notes.map((x,i)=>`<p><span>${i+1}</span>${esc(x)}</p>`).join('')}</div>`:''}</section>`
  if(block.type==='table') return `<section id="${esc(block.id)}" class="ap-guide-section"><span class="ap-guide-kicker">${esc(block.kicker||'COMPARE')}</span><h2>${esc(block.title)}</h2><div class="ap-guide-table-wrap"><table><thead><tr>${block.headers.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${block.rows.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`
  return ''
}
function guideArticle(m){const g=guideByModule[m.id];if(!g)return '';const list=problemsByModule.get(m.id)||[];const ids=(g.blocks||[]).filter(x=>x.id&&x.type!=='callout').map(x=>({id:x.id,title:x.title}));const practice=(g.practice||[]).map(item=>{const p=problems.find(x=>x.code===item.code);if(!p)return '';return `<article class="ap-guide-practice-item"><div><code>${esc(p.code)}</code><b>${esc(p.title)}</b></div><p>${esc(item.why||'')}</p><div><button data-action="hint" data-code="${esc(p.code)}">Hint</button><a href="${getPdfUrl(p.page)}" target="_blank" rel="noreferrer">PDF</a></div></article>`}).join('');return `<div class="ap-guide-layout"><aside class="ap-guide-toc"><b>Table of Contents</b>${ids.map(x=>`<a href="#${esc(x.id)}">${esc(x.title)}</a>`).join('')}${(pdfSupplements[m.id]||[]).map((x,i)=>`<a href="#pdf-supp-${i}">${esc(x.title)}</a>`).join('')}<a href="#practice-ladder">Problems</a><a href="#mastery-check">Quiz</a></aside><article class="ap-guide-article"><header class="ap-guide-intro"><small>AP325 ${esc(m.chapter)}</small><h1>${esc(g.title||m.title)}</h1><p>${esc(g.intro||m.overview)}</p></header><section class="ap-guide-resources"><h2>Resources</h2><table><tbody><tr><td>AP325</td><td><a href="${AP325_PDF}" target="_blank" rel="noreferrer">Original Notes</a></td><td>${esc(g.source||m.chapter)}</td></tr>${m.visuals.length?`<tr><td>AlgoVista</td><td><a href="${ALGO_BASE}?lesson=${encodeURIComponent(m.visuals[0])}" target="_blank" rel="noreferrer">Visualization</a></td><td>${esc(m.visuals[0].replaceAll('-',' '))}</td></tr>`:''}<tr><td>Judge</td><td><a href="${AP325_JUDGE}" target="_blank" rel="noreferrer">AP325 Online Judge</a></td><td>Practice</td></tr></tbody></table></section>${g.objectives?.length?`<section class="ap-guide-section"><h2>Learning Objectives</h2><ul>${g.objectives.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`:''}${(g.blocks||[]).map(b=>guideBlock(b,m)).join('')}${sourceSupplement(m)}<section id="practice-ladder" class="ap-guide-section"><h2>Problems</h2><div class="ap-guide-practice-list">${practice||list.map(p=>`<article><code>${esc(p.code)}</code><b>${esc(p.title)}</b></article>`).join('')}</div></section><section id="mastery-check" class="ap-guide-section ap-mastery-check"><h2>Quiz</h2><div class="ap-checkpoint-list">${(g.checkpoints||[]).map((q,i)=>`<details><summary>${i+1}. ${esc(q.q)}</summary><p>${esc(q.a)}</p></details>`).join('')}</div></section></article></div>`}

function moduleNav(m){
  const prev=neighborModule(m,-1),next=neighborModule(m,1)
  return `<nav class="ap-module-nav">${prev?`<button data-action="module" data-id="${prev.id}"><span>← PREVIOUS</span><b>${esc(prev.title)}</b></button>`:'<span></span>'}${next?`<button data-action="module" data-id="${next.id}"><span>NEXT →</span><b>${esc(next.title)}</b></button>`:'<span></span>'}</nav>`
}

function problemRow(p){const solved=progress.solvedProblems.includes(p.code),tone=getProblemTone(p),open=state.hint===p.code,m=moduleById.get(p.module),c=lessonFor(m);return `<article class="ap-problem-row ${solved?'solved':''}"><button class="ap-check" data-action="problem" data-code="${esc(p.code)}">${solved?'✓':'○'}</button><div class="ap-problem-main"><div class="ap-problem-title"><code>${esc(p.code)}</code><strong>${esc(p.title)}</strong><span class="ap-tone ${tone}">${esc(getProblemLabel(p))}</span></div><div class="ap-problem-meta"><span>PDF p.${p.page}</span>${p.source?`<span>${esc(p.source)}</span>`:''}${p.flags.map(f=>`<span>${esc(f)}</span>`).join('')}</div>${open?`<div class="ap-hints"><div><b>Hint 1 · 辨識題型</b><p>先不要寫 code。把「${esc(p.title)}」放回 <strong>${esc(m.title)}</strong>：${esc(c?.pattern||m.overview)}</p></div><div><b>Hint 2 · 維持什麼</b><p>${esc(c?.invariant||m.overview)}</p></div><div><b>Hint 3 · 實作前檢查</b><p>${esc(c?.steps?.slice(0,2).join(' → ')||m.learn[0])}。再確認複雜度與邊界，最後才 coding。</p></div></div>`:''}</div><div class="ap-problem-actions"><button data-action="hint" data-code="${esc(p.code)}">${open?'Hide hint':'Hint'}</button><a href="${getPdfUrl(p.page)}" target="_blank" rel="noreferrer">PDF</a><a href="${AP325_JUDGE}" target="_blank" rel="noreferrer">Judge</a></div></article>`}
function bossForWorld(id){const code=WORLD_BOSSES[id];if(!code)return null;return problems.find(p=>p.code===code)||null}
function pathView(){const mc={done:progress.completedModules.length,doing:modules.filter(m=>!progress.completedModules.includes(m.id)&&mProgress(m)>0).length};const pc=progress.solvedProblems.length;return `<section class="ap-usaco-home"><header><h1>AP325</h1><p>依照 AP325 v1.3 章節順序整理。</p></header><div class="ap-progress-summary"><section><h3>Modules Progress</h3><div><span><b>${mc.done}</b>Completed</span><span><b>${mc.doing}</b>In Progress</span><span><b>${modules.length-mc.done-mc.doing}</b>Not Started</span><span><b>${modules.length}</b>Total</span></div></section><section><h3>Problems Progress</h3><div><span><b>${pc}</b>Completed</span><span><b>${problems.length-pc}</b>Not Started</span><span><b>${problems.length}</b>Total</span></div></section></div>${worlds.map(w=>{const ms=modules.filter(m=>m.world===w.id),ps=problems.filter(p=>moduleById.get(p.module)?.world===w.id),done=ps.filter(p=>progress.solvedProblems.includes(p.code)).length;return `<section class="ap-usaco-section" id="world-${w.id}"><div class="ap-usaco-section-head"><div><h2>${esc(w.title)}</h2><p>${esc(w.subtitle)}</p></div><span>${done}/${ps.length}</span></div><div class="ap-usaco-module-list">${ms.map(m=>`<button data-action="module" data-id="${m.id}" class="${progress.completedModules.includes(m.id)?'complete':mProgress(m)>0?'progress':''}"><span class="ap-status-dot"></span><div><b>${esc(m.title)}</b><p>${esc(m.subtitle)}</p></div><small>${m.difficulty==='foundation'?'Intro':m.difficulty==='challenge'?'Hard':'Normal'}</small><em>AP325 ${esc(m.chapter)}</em><strong>›</strong></button>`).join('')}</div></section>`}).join('')}</section>`}
function moduleView(m){const w=worldById.get(m.world),list=problemsByModule.get(m.id)||[],completed=progress.completedModules.includes(m.id),solved=list.filter(p=>progress.solvedProblems.includes(p.code)).length,c=lessonFor(m);return `<main class="ap-module-shell usaco-module"><div class="ap-module-top"><button class="ap-back" data-action="back">← AP325</button><div><span>AP325 ${esc(m.chapter)} · ${esc(w.title)}</span><b>${solved}/${list.length} problems solved</b></div></div>${guideArticle(m)}${list.length?`<section class="ap-usaco-problems"><h2>Problemset</h2><div class="ap-problem-list">${list.map(problemRow).join('')}</div></section>`:''}${quizCard(m,c)}<section class="ap-usaco-progress"><h3>Module Progress</h3><button data-action="complete" data-id="${m.id}" class="${completed?'done':''}">${completed?'Completed':'Mark Complete'}</button></section>${moduleNav(m)}</main>`}
function practiceView(){let fs=problems.filter(p=>{const m=moduleById.get(p.module),q=`${p.code} ${p.title} ${p.source||''}`.toLowerCase().includes(state.query.toLowerCase()),w=state.world==='all'||m.world===Number(state.world),solved=progress.solvedProblems.includes(p.code),tone=getProblemTone(p),statusOk=state.status==='all'||(state.status==='solved'?solved:!solved),toneOk=state.tone==='all'||tone===state.tone;return q&&w&&statusOk&&toneOk});return `<section class="ap-practice-page"><header><span>PROBLEM LIBRARY</span><h1>Problems</h1><p>AP325 題目列表。</p></header><div class="ap-filters ap-filters-4"><label>⌕ <input id="search" value="${esc(state.query)}" placeholder="搜尋題號、題名、APCS 年份…"></label><select id="world-filter"><option value="all">全部章節</option>${worlds.map(w=>`<option value="${w.id}" ${String(state.world)===String(w.id)?'selected':''}>World ${w.id} · ${esc(w.title)}</option>`).join('')}</select><select id="tone-filter"><option value="all">全部難度</option><option value="core" ${state.tone==='core'?'selected':''}>Focus / Core</option><option value="foundation" ${state.tone==='foundation'?'selected':''}>Practice</option><option value="challenge" ${state.tone==='challenge'?'selected':''}>Challenge @@</option><option value="beyond" ${state.tone==='beyond'?'selected':''}>Beyond APCS *</option></select><select id="status-filter"><option value="all">全部狀態</option><option value="unsolved" ${state.status==='unsolved'?'selected':''}>未完成</option><option value="solved" ${state.status==='solved'?'selected':''}>已完成</option></select></div><div class="ap-practice-count">顯示 ${fs.length} / ${problems.length} 題</div><div class="ap-problem-list">${fs.map(problemRow).join('')}</div></section>`}
function reviewView(){const now=Date.now(),due=problems.filter(p=>progress.solvedAt[p.code]&&now-new Date(progress.solvedAt[p.code]).getTime()>=7*864e5),weak=modules.filter(m=>!progress.completedModules.includes(m.id)).slice(0,8);return `<section class="ap-usaco-review"><header><h1>Review</h1><p>到期題目與未完成模組。</p></header><section><h2>7-Day Review</h2>${due.length?`<div class="ap-problem-list">${due.map(problemRow).join('')}</div>`:'<p class="ap-muted">目前沒有到期題。</p>'}</section><section><h2>Continue Learning</h2><div class="ap-usaco-module-list">${weak.map(m=>`<button data-action="module" data-id="${m.id}"><span class="ap-status-dot"></span><div><b>${esc(m.title)}</b><p>${esc(m.subtitle)}</p></div><strong>›</strong></button>`).join('')}</div></section></section>`}
function footer(){return `<footer class="ap-footer"><div><b>AP325 Guide</b><span>Based on AP325 v1.3</span></div><div><a href="${AP325_PDF}" target="_blank">AP325 PDF</a><a href="${AP325_JUDGE}" target="_blank">Judge</a></div></footer>`}
function updateReadingProgress(){
  const bar=$('#reading-progress-bar')
  if(!bar||!state.module)return
  const doc=document.documentElement
  const max=Math.max(1,doc.scrollHeight-innerHeight)
  const pct=Math.min(100,Math.max(0,scrollY/max*100))
  bar.style.width=pct+'%'
}
function render(){document.body.innerHTML=topbar()+ (state.module?moduleView(moduleById.get(state.module)):`<main class="ap-shell">${state.view==='path'?pathView():state.view==='practice'?practiceView():reviewView()}</main>`) +footer();syncUrl();bind();window.scrollTo({top:0});updateReadingProgress()}
function bind(){document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',async e=>{const a=el.dataset.action;if(a==='view'){state.view=el.dataset.view;state.module=null;state.hint=null;state.quizChoice=null;state.visual=null;render()}if(a==='module'){state.module=el.dataset.id;state.hint=null;state.quizChoice=null;state.visual=null;render()}if(a==='back'){state.module=null;state.view='path';state.quizChoice=null;state.visual=null;render()}if(a==='problem')toggleProblem(el.dataset.code);if(a==='hint'){state.hint=state.hint===el.dataset.code?null:el.dataset.code;render()}if(a==='visual')markVisual(el.dataset.id);if(a==='close-visual'){state.visual=null;render()};if(a==='mark-read'){progress.readModules=toggle(progress.readModules,el.dataset.id);save();render()}if(a==='complete')toggleModule(el.dataset.id);if(a==='quiz'){const id=el.dataset.id,choice=Number(el.dataset.choice),q=lessonContent[id]?.quiz;state.quizChoice=choice;if(q&&choice===q.answer&&!progress.quizPassed.includes(id)){progress.quizPassed.push(id);save()}render()}if(a==='copy-template'){const text=lessonContent[el.dataset.id]?.template||'';try{await navigator.clipboard.writeText(text);el.textContent='Copied'}catch{el.textContent='Copy failed'}}if(a==='toggle-guide-start'){document.querySelector('.ap-guide-intro')?.scrollIntoView({behavior:'smooth',block:'start'})}if(a==='copy-guide-code'){const g=guideByModule[el.dataset.module],b=g?.blocks?.find(x=>x.id===el.dataset.block);try{await navigator.clipboard.writeText(b?.code||'');el.textContent='Copied'}catch{el.textContent='Copy failed'}}if(a==='reset'&&confirm('確定清除本機 AP325 學習進度？')){progress={...empty,lastVisit:today()};save();render()}}));$('#search')?.addEventListener('input',e=>{state.query=e.target.value;render()});$('#world-filter')?.addEventListener('change',e=>{state.world=e.target.value;render()});$('#tone-filter')?.addEventListener('change',e=>{state.tone=e.target.value;render()});$('#status-filter')?.addEventListener('change',e=>{state.status=e.target.value;render()});document.querySelectorAll('[data-checklist-module]').forEach(el=>el.addEventListener('change',e=>toggleChecklist(el.dataset.checklistModule,Number(el.dataset.checklistIndex),el.checked)));const notes=$('#module-notes');if(notes){let timer;notes.addEventListener('input',()=>{clearTimeout(timer);const status=$('#notes-status');if(status)status.textContent='儲存中…';timer=setTimeout(()=>{progress.notes[notes.dataset.module]=notes.value;save();if(status)status.textContent='已儲存'},350)})}window.onscroll=updateReadingProgress}
render()
