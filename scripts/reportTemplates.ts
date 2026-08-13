import { lessons } from '../src/algorithms'

const longLines = lessons.flatMap((lesson) => lesson.code.flatMap((line, index) => line.length > 160 ? [{ id: lesson.id, line: index + 1, length: line.length, code: line }] : []))
const placeholderPattern = /for\s*\(\s*(?:merge pointers|each cell)|\[[^\]]*:[^\]]*\]|solve\(points sorted|merge ea,eb|S\s*=\s*\{[^}]*\||fft\((?:even|odd) coefficients\)|takeLeft\(\)|takeRight\(\)|copyMergedBack\(\)/i
const placeholders = lessons.flatMap((lesson) => lesson.code.flatMap((line, index) => placeholderPattern.test(line) ? [{ id: lesson.id, line: index + 1, code: line }] : []))
const noHeader = lessons.filter((lesson) => !lesson.code[0]?.startsWith(`// ${lesson.title}`)).map((lesson) => lesson.id)
const missingAnimation = lessons.flatMap((lesson) => lesson.code.flatMap((line, index) => line.trim() && !line.trim().startsWith('//') && !/^[{}]+;?$/.test(line.trim()) && !lesson.frames.some((frame) => frame.codeLines.includes(index + 1)) ? [`${lesson.id}:${index + 1}`] : []))
const missingGuide = lessons.flatMap((lesson) => lesson.code.flatMap((line, index) => line.trim() && !line.trim().startsWith('//') && !/^[{}]+;?$/.test(line.trim()) && !lesson.codeGuide?.some((guide) => guide.lineNumber === index + 1) ? [`${lesson.id}:${index + 1}`] : []))
const errors = [
  ...longLines.map((item) => `${item.id}:${item.line} exceeds 160 characters`),
  ...placeholders.map((item) => `${item.id}:${item.line} contains pseudocode placeholder`),
  ...noHeader.map((id) => `${id}: missing template metadata`),
  ...missingAnimation.map((item) => `${item}: missing animation mapping`),
  ...missingGuide.map((item) => `${item}: missing beginner guide`),
]
console.log(JSON.stringify({ total: lessons.length, templateReady: errors.length ? 0 : lessons.length, longLines: longLines.length, placeholders, noHeader, missingAnimation, missingGuide, errors }, null, 2))
if (errors.length) process.exitCode = 1
