import { lessons } from '../src/algorithms'

// Spot-check suspicious practice assignments: title vs lesson topic relevance via keyword clash
const suspicious: string[] = []
const checks: [string, string][] = [
  // [lessonId, why it looks wrong]
  ['counting-sort', 'practice is Distinct Numbers — same as selection-sort; not a counting-sort task'],
  ['expression-stack', 'Ciel and Duel is a card game, not expression parsing'],
  ['stable-matching', 'Fox And Names is topological ordering, not Gale-Shapley'],
  ['convex-hull', 'MST Edge Check 3407 listed under reconstruction-tree is not a CSES task id'],
  ['reconstruction-tree', 'CSES 3407 does not exist (CSES problemset ids reach ~3300); URL dead'],
  ['palindromic-tree', 'CSES 3138 "All Palindromes" does not exist'],
  ['treap', 'Josephus II fine-ish but shared across 5 BST lessons'],
  ['segment-tree-beats', 'The Child and Sequence is point-update/range-sum, not chmin beats'],
  ['sweep-line', 'CSES 1740 Intersection Points ok but model shared'],
  ['spatial-tree', 'typical90_aj is Manhattan distance — no KD tree needed'],
]
for (const [id, why] of checks) {
  const l = lessons.find((x) => x.id === id)
  if (l) suspicious.push(`${id}: ${why}`)
}
// duplicate practice urls across lessons
const byUrl: Record<string, string[]> = {}
for (const l of lessons) for (const p of l.practice ?? []) (byUrl[p.url] ??= []).push(l.id)
const dupes = Object.entries(byUrl).filter(([, ids]) => ids.length > 1)
console.log('suspicious assignments:')
suspicious.forEach((s) => console.log(' -', s))
console.log('\npractice URLs shared by multiple lessons:', dupes.length)
for (const [url, ids] of dupes.sort((a, b) => b[1].length - a[1].length).slice(0, 8)) console.log(` ${ids.length}x ${url.split('/').slice(-1)[0]}: ${ids.join(',')}`)
