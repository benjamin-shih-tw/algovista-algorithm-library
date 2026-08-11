import { lessons } from '../src/algorithms'

for (const lesson of lessons) {
  console.log([
    lesson.index,
    lesson.id,
    lesson.categoryId,
    lesson.subcategory,
    lesson.visual,
    lesson.title,
    lesson.zhTitle,
  ].join('\t'))
}
