import type { AlgorithmLesson, ExecutionView, Frame, StudentGuide } from './algorithms'

export type StudentLesson = Pick<AlgorithmLesson, 'code' | 'frames' | 'studentGuide'>
export const source = (text: string) => text.trim().split('\n')
export const list = (items: (string | number)[]) => `[${items.join(', ')}]`
export const table = (title: string, columns: string[], rows: (string | number)[][], activeRow?: number, badges: string[] = []): ExecutionView => ({
  kind: 'table', title, columns, rows: rows.map((row) => row.map(String)), activeRow: activeRow !== undefined && activeRow >= 0 ? activeRow : undefined, badges,
})

export function trace(code: string[], studentGuide: StudentGuide) {
  const frames: Frame[] = []
  const add = (line: string, title: string, before: string, decision: string, after: string, why: string, view: ExecutionView, state: Frame['state'] = {}) => {
    const index = code.findIndex((text) => text.trim() === line.trim())
    if (index < 0) throw new Error(`Student trace has no exact code line: ${line}`)
    frames.push({
      title, explanation: decision, codeLine: code[index].trim(), codeLines: [index + 1],
      teaching: { before, decision, after, why },
      state: { ...state, before, after, operation: title, rationale: why },
      executionView: structuredClone(view),
    })
  }
  return { add, finish: (): StudentLesson => ({ code, frames, studentGuide }) }
}
