import fs from 'node:fs/promises'

const read = (p) => fs.readFile(p, 'utf8')
const fail = (msg) => { console.error('AP325 AUDIT FAILED:', msg); process.exitCode = 1 }
const ok = (msg) => console.log('✓', msg)

const curriculum = await read('public/ap325/ap325Curriculum.js')
const lessonContent = await read('public/ap325/lessonContent.js')
const app = await read('public/ap325/app.js')

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

for (const token of ["lessonContent", "quizPassed", "copy-template", "moduleNav"]) {
  if(!app.includes(token)) fail(`app.js missing integration token: ${token}`)
}
if(!process.exitCode) ok('AP325 Guide integration wiring present')

if (process.exitCode) process.exit(process.exitCode)
console.log('AP325 audit complete.')
