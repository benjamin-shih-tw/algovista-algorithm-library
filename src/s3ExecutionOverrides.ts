import type { AlgorithmLesson } from './algorithms'
import { applyS3FlowOverride } from './s3ExecutionOverridesFlow'
import { applyS3StructureOverride } from './s3ExecutionOverridesStructures'
import { applyS3CoreOverride } from './s3ExecutionOverridesCore'
import { applyS3GeometryOverride } from './s3ExecutionOverridesGeometry'

export const applyS3ExecutionOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  const flow=applyS3FlowOverride(lesson)
  if(flow!==lesson) return flow
  const structures=applyS3StructureOverride(lesson)
  if(structures!==lesson) return structures
  const core=applyS3CoreOverride(lesson)
  if(core!==lesson) return core
  return applyS3GeometryOverride(lesson)
}
