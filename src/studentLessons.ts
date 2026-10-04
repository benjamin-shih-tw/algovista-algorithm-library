import type { AlgorithmLesson } from './algorithms'
import { kmpLesson, zLesson, rollingLesson, rabinLesson } from './studentStringLessons'
import { lowlinkLesson, tarjanLesson } from './studentGraphLessons'
import { centroidLesson, digitLesson } from './studentTreeDpLessons'
import type { StudentLesson } from './studentTrace'

const builders: Record<string, () => StudentLesson> = {
  kmp: kmpLesson,
  'z-algorithm': zLesson,
  'rolling-hash': rollingLesson,
  'rabin-karp': rabinLesson,
  'tarjan-scc': tarjanLesson,
  bridges: () => lowlinkLesson('bridges'),
  'articulation-points': () => lowlinkLesson('articulation-points'),
  'tree-centroid': () => centroidLesson(),
  'centroid-decomposition': () => centroidLesson(true),
  'digit-dp': digitLesson,
}
const descriptions: Record<string,string> = {
  kmp: '逐字建立相同頭尾長度表，理解失配時為什麼可以保留較短的已知片段。',
  'z-algorithm': '算出每個起點與字串開頭相同幾格，學會安全重用已比較的區間。',
  'rolling-hash': '建立字串的數字指紋，再用對齊權重的減法取出區間指紋。',
  'rabin-karp': '移動文字視窗，用指紋篩選，再逐字確認所有命中位置。',
  'tarjan-scc': '沿箭頭走訪，利用首次編號、回連資訊與待分組堆疊找出互相可達的組。',
  bridges: '逐條檢查回路，找出移除後會讓圖斷開的邊。',
  'articulation-points': '區分一般點與搜尋起點，找出移除後會让圖斷開的點。',
  'tree-centroid': '先算每側的大小，找出移除後每塊都不超過一半的點。',
  'centroid-decomposition': '反覆找重心、切開區塊、重新計算大小，建立完整重心樹。',
  'digit-dp': '逐位填數字，把未來選擇相同的路徑合併計數，遵守上限並排除零。',
}

export const applyStudentLesson = (lesson: AlgorithmLesson): AlgorithmLesson => {
  const build = builders[lesson.id]
  return build ? { ...lesson, ...build(), description: descriptions[lesson.id], traceMode: 'execution', animationVersion: 2 } : lesson
}
