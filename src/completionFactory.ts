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
    low: phase,
    high: Math.min(7, phase + 4),
    mid: Math.min(7, phase * 2 + 1),
    active: [String(Math.min(7, phase * 2)), String(Math.min(7, phase * 2 + 1)), String.fromCharCode(65 + phase), String.fromCharCode(66 + phase)],
    accepted: phase === 2 ? ['0', '1', '2', '3', 'A', 'B', 'C', 'D'] : undefined,
    queue: spec.visual === 'graph' ? ['A', String.fromCharCode(66 + phase), String.fromCharCode(67 + phase)] : undefined,
    distances: spec.visual === 'graph' ? { A: 0, B: phase + 1, C: phase + 2, D: phase === 0 ? '∞' : phase + 3, E: '∞', F: '∞' } : undefined,
    state: {
      phase,
      invariant: spec.states[0],
      operation: spec.states[phase],
      status: phase === 2 ? 'verified' : 'running',
    },
  }))
  return { ...spec, index: '000', frames }
}

export const makeCatalog = (specs: CatalogSpec[]) => specs.map(makeCatalogLesson)
