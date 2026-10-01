import type { AlgorithmLesson, Frame } from './algorithms'

export type FrameExtra = Partial<Pick<Frame,
  'active'|'accepted'|'muted'|'values'|'low'|'high'|'mid'|'queue'|'priorityQueue'|'distances'|'hull'|'segmentStep'|'executionView'
>>

export const lineNumber = (lesson: AlgorithmLesson, needle: string) => {
  const index = lesson.code.findIndex((line) => line.includes(needle))
  if (index < 0) throw new Error(`Execution trace override ${lesson.id}: cannot find code line containing "${needle}"`)
  return index + 1
}

export const eventFrame = (
  lesson: AlgorithmLesson,
  needle: string,
  title: string,
  explanation: string,
  state: Record<string, string | number | string[]>,
  extra: FrameExtra = {},
): Frame => {
  const number = lineNumber(lesson, needle)
  return {
    title,
    explanation,
    codeLine: lesson.code[number - 1].trim(),
    codeLines: [number],
    state,
    ...extra,
  }
}
