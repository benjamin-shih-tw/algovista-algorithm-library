import type { AlgorithmLesson } from './algorithms'
import { applyS3FlowOverride } from './s3ExecutionOverridesFlow'
import { applyS3StructureOverride } from './s3ExecutionOverridesStructures'

export const applyS3ExecutionOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  const flow=applyS3FlowOverride(lesson)
  if(flow!==lesson) return flow
  return applyS3StructureOverride(lesson)
}
