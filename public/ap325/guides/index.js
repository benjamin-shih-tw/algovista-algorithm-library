import { fullGuide } from './fullGuide.js'
import { modules, problems, problemsByModule, getProblemTone } from '../ap325Curriculum.js'
import { lessonContent } from '../lessonContent.js'

const moduleById = new Map(modules.map(m => [m.id, m]))

function difficultyLevel(problem){
  const tone = getProblemTone(problem)
  if(tone === 'beyond') return 'beyond'
  if(tone === 'challenge') return 'challenge'
  return 'core'
}

function makeBlocks(id, guide, lesson){
  const blocks = []
  let n = 1
  for(const section of guide.sections || []){
    blocks.push({
      type:'text',
      id:`concept-${n++}`,
      kicker:'GUIDE',
      title:section.title,
      paragraphs:section.body || [],
    })
  }
  if(guide.example){
    blocks.push({
      type:'example',
      id:'worked-example',
      title:guide.example.title,
      problem:'先自己預測每一步會發生什麼，再展開下面的 trace。',
      steps:guide.example.steps || [],
      conclusion:guide.example.result || '',
    })
  }
  if(lesson?.invariant){
    blocks.push({
      type:'callout',
      id:'invariant',
      tone:'key',
      title:'Key invariant',
      body:lesson.invariant,
    })
  }
  if(lesson?.template){
    blocks.push({
      type:'code',
      id:'implementation',
      kicker:'IMPLEMENTATION',
      title:'把觀念翻成最小可重用實作',
      intro:'先看懂每一行對應到哪個 invariant，再把模板帶到題目；不要把模板當成魔法。',
      label:'C++17 / Pseudocode',
      code:lesson.template,
      notes:[
        '先確認 state / index / boundary 的語意，再動手改模板。',
        '若題目限制改變，重新估複雜度與型別範圍。',
        '能從空白寫出核心 5–15 行，比背整份程式更重要。',
      ],
    })
  }
  return blocks
}

export const guideByModule = Object.fromEntries(
  modules.map(module => {
    const guide = fullGuide[module.id]
    const lesson = lessonContent[module.id]
    const list = problemsByModule.get(module.id) || []
    if(!guide) return [module.id, null]
    const focusProblem = list.find(p => getProblemTone(p) === 'core') || list[0] || null
    const quiz = lesson?.quiz
    const checkpoints = []
    if(quiz){
      checkpoints.push({
        q:quiz.q,
        a:`${quiz.options[quiz.answer]}。 ${quiz.explain}`,
      })
    }
    if(lesson?.invariant){
      checkpoints.push({
        q:'這個技巧最重要、在整個演算法執行期間不能被破壞的 invariant 是什麼？',
        a:lesson.invariant,
      })
    }
    checkpoints.push({
      q:'什麼時候不該使用這個技巧？',
      a:`回到資料量與前提檢查：只有當題目真的滿足「${lesson?.pattern || module.subtitle}」需要的結構時才使用；若前提不成立，就改用別的模型。`,
    })

    return [module.id, {
      source:`AP325 ${module.chapter}`,
      title:module.title,
      intro:guide.sections?.[0]?.body?.[0] || module.overview,
      objectives:module.learn || [],
      focus:focusProblem ? {
        code:focusProblem.code,
        prompt:`先只看題目與限制，不看題解。試著回答：這題為什麼會被放在「${module.title}」這一節？`,
        questions:[
          '最直觀的暴力解法是什麼？複雜度多少？',
          `資料量暗示你需要哪個等級的複雜度？`,
          `你需要維持的 state / invariant 是什麼？`,
        ],
      } : {
        title:module.title,
        prompt:'這一節先以觀念為主。讀正文前先用自己的話解釋標題中的技術。',
        questions:['它解決哪一類重複工作？','它成立需要哪些前提？','最常見的錯誤會發生在哪裡？'],
      },
      blocks:makeBlocks(module.id, guide, lesson),
      practice:list.map((p,i)=>({
        code:p.code,
        level:i===0?'focus':difficultyLevel(p),
        why:i===0
          ? '先用這題確認你能把正文的核心模型寫成程式。'
          : getProblemTone(p)==='challenge'
            ? '這題會要求你把核心技巧和額外觀察結合，不要一開始就看 Hint 3。'
            : getProblemTone(p)==='beyond'
              ? '這題超出一般 APCS 核心需求，適合在主線完成後挑戰。'
              : '用來鞏固同一個 invariant 在不同敘述中的辨識能力。',
      })),
      checkpoints,
      mastery:guide.checkpoint || [],
    }]
  }).filter(([,g]) => g)
)

export const guideModuleCount = Object.keys(guideByModule).length
