import type { AlgorithmLesson, Frame } from './algorithms'

export type FrameExtra = Partial<Pick<Frame,
  'active'|'accepted'|'muted'|'values'|'low'|'high'|'mid'|'queue'|'priorityQueue'|'distances'|'hull'|'segmentStep'|'executionView'|'codeAnchor'
>> & { sourceOccurrence?: number }

export const lineNumber = (lesson: AlgorithmLesson, needle: string, occurrence = 0) => {
  const exact = lesson.code.flatMap((line,index) => line.trim() === needle.trim() ? [index] : [])
  const matches = exact.length ? exact : lesson.code.flatMap((line,index) => line.includes(needle) ? [index] : [])
  const index = matches[occurrence]
  if (index === undefined) throw new Error(`Execution trace override ${lesson.id}: cannot find occurrence ${occurrence} of code line containing "${needle}"`)
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
  const hasExplicitOccurrence = Object.prototype.hasOwnProperty.call(extra, 'sourceOccurrence')
  const { sourceOccurrence = 0, ...frameExtra } = extra
  const number = lineNumber(lesson, needle, sourceOccurrence)
  return {
    title,
    explanation,
    codeLine: lesson.code[number - 1].trim(),
    codeAnchor: sourceOccurrence > 0 ? `${needle}@@${sourceOccurrence}` : needle,
    codeLines: [number],
    state: hasExplicitOccurrence ? {...state, sourceOccurrence} : state,
    ...frameExtra,
  }
}
