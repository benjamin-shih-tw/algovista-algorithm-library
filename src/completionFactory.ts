import type { AlgorithmLesson, CategoryId, Frame, VisualKind } from './algorithms'

export type CatalogSpec = {
  id: string
  categoryId: CategoryId
  subcategory: string
  category: string
  title: string
  zhTitle: string
  description: string
  complexity: string
  visual: VisualKind
  accent: string
  code: string[]
  concepts: [string, string, string]
  states: [string, string, string]
}

const numericSeed = (id: string) => [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0)

// C7/C8 fix：陣列／線性畫面的 active/accepted 必須使用「索引字串」，
// ArrayScene 與 LinearScene 才能命中高亮（舊版用「索引 0」這種版位文字，永遠不命中）。
// 同時移除假的 low/high/mid 指標——它們與演算法無關，只會誤導。
const visualFocus = (visual: VisualKind, phase: number, values: number[]) => {
  const focusByVisual: Record<VisualKind, string[][]> = {
    array: [['0','1'],['2','3'],['4','5']],
    linear: [['0','1'],['2','3'],['4','5']],
    graph: [['節點 A','邊 A→B'],['節點 B','邊 B→D'],['節點 D','答案邊']],
    tree: [['根節點','第一層'],['目前子樹','父子邊'],['合併後的根','答案路徑']],
    'segment-tree': [['區間 [0,7]','根節點'],['區間 [0,3]','區間 [4,7]'],['被接受區間','合併答案']],
    range: [['完整資料範圍','查詢端點'],['目前區塊','局部節點'],['已合併區塊','查詢答案']],
    dp: [['初始狀態','邊界格'],['依賴狀態','目前 dp 格'],['最終狀態','重建答案']],
    string: [['文字索引 0','模式前綴'],['目前字元','匹配狀態'],['接受狀態','完整匹配']],
    flow: [['來源 S','第一條殘餘邊'],['增廣路','瓶頸容量'],['匯點 T','更新後殘餘網路']],
    math: [['輸入 n','初始等式'],['目前運算值','中間結果'],['已驗證因子／答案','停止條件']],
    geometry: [['輸入點／圖形','基準方向'],['目前幾何關係','判定量'],['構造結果','答案圖形']],
    transform: [['原始係數','第 0 層'],['目前蝶形／轉換層','合併值'],['轉換結果','逆轉換答案']],
  }
  return focusByVisual[visual][phase]
}

export const makeCatalogLesson = (spec: CatalogSpec): AlgorithmLesson => {
  const seed = numericSeed(spec.id)
  const values = Array.from({ length: 8 }, (_, index) => (seed * (index + 3) + index * 7) % 19 + 1)
  const lineCount = spec.code.length
  const lineGroups = [
    [1, Math.min(2, lineCount)],
    Array.from({ length: Math.max(1, lineCount - 2) }, (_, index) => index + 2),
    [Math.max(1, lineCount - 1), lineCount],
  ].map((group) => [...new Set(group)])
  const titles = ['建立正確性不變量', '執行核心轉移', '完成並驗證答案']
  const frames: Frame[] = spec.concepts.map((explanation, phase) => ({
    title: titles[phase],
    explanation,
    codeLine: spec.code[lineGroups[phase][0] - 1]?.trim() ?? '',
    codeLines: lineGroups[phase],
    values,
    active: visualFocus(spec.visual, phase, values),
    accepted: phase === 2 ? visualFocus(spec.visual, phase, values) : undefined,
    state: {
      phase,
      invariant: spec.concepts[0],
      operation: spec.concepts[phase],
      technicalState: spec.states[phase],
      status: phase === 2 ? 'verified' : 'running',
    },
  }))
  return { ...spec, index: '000', frames }
}

export const makeCatalog = (specs: CatalogSpec[]) => specs.map(makeCatalogLesson)
