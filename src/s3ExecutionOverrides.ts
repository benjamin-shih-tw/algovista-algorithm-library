import type { AlgorithmLesson } from './algorithms'
import { applyS3FlowOverride } from './s3ExecutionOverridesFlow'

export const applyS3ExecutionOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  return applyS3FlowOverride(lesson)
}
