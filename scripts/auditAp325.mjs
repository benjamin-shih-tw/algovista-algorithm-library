import fs from 'node:fs/promises'

const read = (p) => fs.readFile(p, 'utf8')
const fail = (msg) => { console.error('AP325 AUDIT FAILED:', msg); process.exitCode = 1 }
const ok = (msg) => console.log('✓', msg)

const curriculum = await read('public/ap325/ap325Curriculum.js')
const lessonContent = await read('public/ap325/lessonContent.js')
const app = await read('public/ap325/app.js')
const { guideByModule } = await import('../public/ap325/guides/index.js')
const { guideArticles } = await import('../public/ap325/guideArticles.js')
const { pdfSupplements, ap325SourceMap } = await import('../public/ap325/pdfSupplements.js')


const moduleIds = [...curriculum.matchAll(/\{ id: '([^']+)', world:/g)].map(m => m[1])
const problemCodes = [...curriculum.slice(curriculum.indexOf('const rawProblems = [')).matchAll(/\['([PQ]-\d+-[^']+)'/g)].map(m => m[1])
const contentIds = [...lessonContent.matchAll(/^  "([^"]+)": \{/gm)].map(m => m[1])
const bossCodes = [...lessonContent.matchAll(/boss": "([^"]+)"/g)].map(m => m[1])
const visualIds = [...curriculum.matchAll(/visuals:\s*\[([^\]]*)\]/g)]
  .flatMap(m => [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]))

if (moduleIds.length !== 38) fail(`expected 38 modules, found ${moduleIds.length}`)
else ok('38 curriculum modules')

if (problemCodes.length !== 122) fail(`expected 122 AP325 problems, found ${problemCodes.length}`)
else ok('122 AP325 P/Q problems')

const guideIds = Object.keys(guideByModule)
if (guideIds.length !== 38) fail(`expected 38 full guide articles, found ${guideIds.length}`)
else ok('38 full AP325 guide articles')

const missingGuides = moduleIds.filter(id => !guideByModule[id])
if (missingGuides.length) fail(`modules missing full guide article: ${missingGuides.join(', ')}`)
else ok('every curriculum module has a full guide article')

for (const id of moduleIds) {
  const g = guideByModule[id]
  if (!g) continue
  const textBlocks = (g.blocks || []).filter(b => ['text','steps','example','code','table'].includes(b.type))
  if (!g.intro || !g.objectives?.length || textBlocks.length < 2) {
    fail(`guide ${id} is too shallow: requires intro, objectives, and >=2 instructional blocks`)
  }
  if (!g.checkpoints?.length || !g.mastery?.length) {
    fail(`guide ${id} missing checkpoints/mastery`)
  }
}
if(!process.exitCode) ok('all guide articles pass depth checks')

const narrativeIds = Object.keys(guideArticles)
if (narrativeIds.length !== 38) fail(`expected 38 long-form narrative articles, found ${narrativeIds.length}`)
else ok('38 long-form narrative articles')

const missingNarratives = moduleIds.filter(id => !guideArticles[id])
if (missingNarratives.length) fail(`modules missing long-form narrative: ${missingNarratives.join(', ')}`)
else ok('every module has a long-form narrative layer')

for (const id of moduleIds) {
  const a = guideArticles[id]
  if (!a) continue
  if (!a.objective || !a.prerequisites?.length || (a.sections||[]).length < 2 || !a.worked?.steps?.length || !a.correctness?.length || !a.checklist?.length) {
    fail(`long-form narrative ${id} is incomplete`)
  }
}
if(!process.exitCode) ok('all long-form narratives pass depth checks')

if (ap325SourceMap.length < 50) fail(`expected >=50 AP325 source coverage rows, found ${ap325SourceMap.length}`)
else ok(`${ap325SourceMap.length} AP325 source coverage rows`)

const invalidCoverage = ap325SourceMap.filter(x => !moduleIds.includes(x.module))
if (invalidCoverage.length) fail(`source map references unknown modules: ${invalidCoverage.map(x=>x.module).join(', ')}`)
else ok('every source-map row points to a valid module')

const requiredSourceTopics = [
  ['Bitonic','2-binary-search'],
  ['set-map','2-binary-search'],
  ['Linked list','3-linear-structures'],
  ['Top-down memoization','6-dp-mindset'],
  ['2D1D','6-interval-advanced'],
  ['adjacency list','7-graph-foundation'],
  ['編譯器優化','0-danger-zone']
]
for (const [needle,module] of requiredSourceTopics) {
  const row=ap325SourceMap.find(x=>x.title.includes(needle) && x.module===module)
  if(!row) fail(`missing AP325 source topic mapping: ${needle} -> ${module}`)
}
if(!process.exitCode) ok('source coverage map includes formerly omitted AP325 subsections')

for (const id of ['0-danger-zone','2-binary-search','3-linear-structures','6-dp-mindset','6-interval-advanced','7-graph-foundation']) {
  if(!pdfSupplements[id]?.length) fail(`missing PDF supplement for ${id}`)
}
if(!process.exitCode) ok('PDF supplement lessons present for merged source sections')

const duplicate = (arr) => arr.filter((x, i) => arr.indexOf(x) !== i)
for (const [label, arr] of [['module',moduleIds],['problem',problemCodes],['lesson content',contentIds]]) {
  const d=[...new Set(duplicate(arr))]
  if(d.length) fail(`duplicate ${label} ids: ${d.join(', ')}`)
}

const missingContent = moduleIds.filter(id => !contentIds.includes(id))
const orphanContent = contentIds.filter(id => !moduleIds.includes(id))
if (missingContent.length) fail(`modules missing lesson content: ${missingContent.join(', ')}`)
else ok('every module has detailed lesson content')
if (orphanContent.length) fail(`orphan lesson content: ${orphanContent.join(', ')}`)

const unknownBoss = bossCodes.filter(code => !problemCodes.includes(code))
if (unknownBoss.length) fail(`unknown boss codes: ${unknownBoss.join(', ')}`)
else ok('all boss problems exist in AP325 problem catalog')

const lessonFiles = [
  'src/algorithms.ts','src/foundationLessons.ts','src/dataDpLessons.ts','src/graphTreeLessons.ts',
  'src/advancedLessons.ts','src/completionFoundationLessons.ts','src/completionDataDpLessons.ts',
  'src/completionGraphLessons.ts','src/completionAdvancedLessons.ts','src/completionLessons.ts'
]
let lessonSource=''
for (const p of lessonFiles) lessonSource += '\n' + await read(p)
const algoIds = new Set([...lessonSource.matchAll(/\bid\s*:\s*['"`]([^'"`]+)['"`]/g)].map(m => m[1]))
const missingVisual = [...new Set(visualIds)].filter(id => !algoIds.has(id))
if (missingVisual.length) fail(`AP325 references missing AlgoVista lessons: ${missingVisual.join(', ')}`)
else ok(`all ${new Set(visualIds).size} referenced AlgoVista lessons exist`)

const moduleRefs = [...curriculum.slice(curriculum.indexOf('const rawProblems = [')).matchAll(/\['[PQ]-\d+-[^']+'\s*,\s*'([^']+)'/g)].map(m=>m[1])
const invalidModuleRefs = [...new Set(moduleRefs.filter(id => !moduleIds.includes(id)))]
if(invalidModuleRefs.length) fail(`problems reference unknown modules: ${invalidModuleRefs.join(', ')}`)
else ok('every problem maps to a valid module')

for (const token of ["guideByModule", "pdfSupplements", "chapterView", "topicSection", "renderBlock", "rich", "renderMathInElement", "hljs.highlightElement", "language-cpp"]) {
  if(!app.includes(token)) fail(`app.js missing integration token: ${token}`)
}
if(!app.includes("chapterTitles") || !app.includes("chapterModules")) fail("chapter-first AP325 reading flow missing")
else ok("chapter-first AP325 reading flow present")
if(!process.exitCode) ok('AP325 Guide rendering wiring present')

if (process.exitCode) process.exit(process.exitCode)
console.log('AP325 audit complete.')
