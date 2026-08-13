import type { AlgorithmLesson, BeginnerGuide, BeginnerStep, CodeGuideLine, Frame, VisualKind } from './algorithms'

const stateLabel: Record<string, string> = {
  algorithm: '演算法', activeCode: '目前程式', 'active code': '目前程式碼', alreadyVisited: '是否已走訪', best: '目前最佳值', microStep: '教學動作', microPhase: '教學階段', timelineStep: '時間軸步驟', outcome: '本步結果', technicalState: '技術狀態',
  checked: '已檢查範圍', complexity: '複雜度', component: '連通分量', currentNode: '目前節點',
  currentValue: '目前數值', frontier: '等待處理', goal: '本題目標', index: '目前索引', input: '輸入資料',
  left: '左端點', l: '左端點', right: '右端點', r: '右端點', mid: '中間位置',
  neighbor: '目前鄰居', parent: '父節點', path: '目前路徑', prerequisite: '使用前提',
  proof: '正確性檢查', queue: '佇列內容', remaining: '尚未處理', source: '起點',
  sum: '目前總和', visited: '已走訪', worstCase: '最壞情況',
  active: '目前焦點', answer: '目前答案', candidate: '候選範圍', candidates: '候選集合',
  before: '執行前', after: '執行後', rationale: '判斷依據',
  comparison: '比較結果', condition: '判斷條件', cost: '目前成本', current: '正在處理',
  decision: '本步決策', distance: '目前距離', edge: '正在檢查的邊', focus: '目前焦點',
  formula: '代入計算', invariant: '必須維持', operation: '執行動作', phase: '教學階段',
  query: '目前查詢', result: '得到結果', status: '執行狀態', target: '目標',
  transition: '狀態轉移', update: '資料更新', window: '目前區間',
}

const asText = (value: string | number | string[]) => Array.isArray(value) ? value.join('、') : String(value)
const commonStateValues: Record<string, string> = {
  'all edge weights ≥ 0': '所有邊權皆為非負數',
  'heap top is minimum tentative distance': '最小 Heap 頂端必須是目前暫定距離最小的節點',
  'array is sorted': '陣列已由小到大排序',
  'answer remains in [low, high]': '答案若存在，必定仍在 [low, high] 中',
  'queue order is nondecreasing distance': 'Queue 內節點距離由小到大排列',
  'not started': '尚未開始', empty: '空', running: '執行中', verified: '已驗證',
  true: '成立', false: '不成立', none: '尚無', match: '成功匹配',
}
export const humanizeStateKey = (key: string) => stateLabel[key] ?? key
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replaceAll('_', ' ')
  .replace(/^./, (char) => char.toUpperCase())
export const humanizeStateValue = (value: string | number | string[]) => {
  if (Array.isArray(value)) return value.map((item) => commonStateValues[item] ?? item).join('、')
  const text = String(value)
  return commonStateValues[text] ?? text
}
const cleanCode = (line: string) => line.trim() || '（這一行只負責分隔程式區塊）'
const meaningfulCodeLines = (lesson: AlgorithmLesson) => lesson.code
  .map((line, index) => ({ line: line.trim(), number: index + 1 }))
  .filter(({ line }) => line && !/^[{}]+$/.test(line) && !line.startsWith('//') && !line.startsWith('#include') && !/^using namespace\b/.test(line))

export const explainCppLine = (line: string, lesson: AlgorithmLesson, lineNumber: number) => {
  const code = cleanCode(line)
  const prefix = `第 ${lineNumber} 行「${code}」`
  if (/^[\w:<>,&*\s]+\w+\s*\([^;]*\)\s*\{.*\bif\b.*\breturn\b/.test(code)) return `${prefix}同時做兩件事：先宣告 ${lesson.title} 的函式與輸入，再檢查能立刻判斷的特例；特例成立就直接回傳，否則才繼續一般流程。`
  if (/^[\w:<>,&*\s]+\w+\s*\([^;]*\)\s*\{?$/.test(code)) return `${prefix}是 ${lesson.title} 的函式入口；括號內是演算法收到的資料，函式內接下來會維護本課介紹的狀態。`
  if (/^(using|typedef)\b/.test(code)) return `${prefix}替較長的資料型別取一個容易閱讀的名字；它不會建立資料，只讓後續宣告更清楚。`
  if (/\b(priority_queue|set|multiset|map|unordered_map)\b/.test(code)) return `${prefix}建立能快速取得或查找關鍵候選的容器；後面的操作都依賴這個容器保持指定順序。`
  if (/\b(queue|deque|stack)\s*</.test(code)) return `${prefix}建立本演算法的工作容器；容器的取出順序決定下一個會被處理的狀態。`
  if (/\bvector\b/.test(code) && /[=(]/.test(code)) return `${prefix}建立並初始化狀態陣列；初始值代表每個位置在演算法尚未處理前的意義。`
  if (/^for\s*\(/.test(code)) return `${prefix}控制迭代範圍；每次迴圈只推進一個明確單位，畫面會同步標出本輪讀取的位置或物件。`
  if (/^while\s*\(/.test(code)) return `${prefix}檢查是否仍有工作要做；條件為真才進入下一輪，為假就表示這一階段已經完成。`
  if (/^if\s*\(/.test(code)) {
    const condition = code.match(/^if\s*\((.*)\)/)?.[1] ?? '括號內條件'
    return `${prefix}判斷「${condition}」是否成立。程式會先讀取條件中的變數，只在結果為 true 時執行後面的敘述；這一行本身不會偷偷修改其他狀態。`
  }
  if (/^else\b/.test(code)) return `${prefix}處理前一個條件不成立的另一種情況；這個分支與前一分支互斥，不會同時執行。`
  if (/\b(sort|stable_sort|reverse)\s*\(/.test(code)) return `${prefix}重新安排資料順序，目的是建立之後可安全利用的單調性或處理順序。`
  if (/\.(push|push_back|insert|emplace)\b/.test(code)) return `${prefix}把新候選加入資料結構；加入後要重新確認容器仍維持本演算法要求的順序或不變量。`
  if (/\.(pop|pop_back|erase)\b/.test(code)) return `${prefix}移除已處理或已證明不可能成為答案的候選；被移除的資料之後不應再次影響答案。`
  if (/\breturn\b/.test(code)) return `${prefix}把目前已驗證的結果交回呼叫端；回傳前要用畫面中的狀態確認它符合題目要求。`
  if (/\bcontinue\b/.test(code)) return `${prefix}略過目前這個不需要處理的候選，直接進入下一輪；已有的正確狀態完全不被改動。`
  if (/\b(break)\b/.test(code)) return `${prefix}結束目前迴圈；此時停止條件已成立，所以繼續掃描不會產生新的必要資訊。`
  if (/\[[^\]]+\]\s*(\+=|-=|\*=|\/=|=)/.test(code)) {
    const target = code.match(/([\w.]+\[[^\]]+\])\s*(?:\+=|-=|\*=|\/=|=)/)?.[1] ?? '對應位置'
    return `${prefix}要更新 ${target}。先用等號右邊的舊狀態算出新值，確認條件成立後才寫回；畫面中只有這個位置應改變。`
  }
  if (/\b(auto|int|long long|bool|double|string)\b.*=/.test(code)) {
    const variable = code.match(/\b(?:auto|int|long long|bool|double|string)\s+([\w]+)/)?.[1] ?? '左側變數'
    return `${prefix}宣告並計算 ${variable}。右側運算會先完整求值，再把結果存入 ${variable}，供這一輪後續的比較或更新使用。`
  }
  if (/\w+\s*\([^;]*\);?$/.test(code)) return `${prefix}呼叫一個子程序處理目前子問題；呼叫前的參數決定畫面接下來聚焦的範圍或節點。`
  if (/^(\}|\{)/.test(code)) return `${prefix}標示程式區塊的邊界；它不改變資料，只說明前一個條件或迴圈的作用範圍。`
  return `${prefix}執行 ${lesson.zhTitle} 的目前操作；請對照畫面中高亮的資料，確認執行前後只有預期狀態改變。`
}

const visualMentalModel: Record<VisualKind, string> = {
  array: '把陣列想成一排可逐格檢查的卡片；指標、區間與被排除位置都直接畫在同一條數線上。',
  linear: '把容器想成有明確入口與出口的等待區；每一步只加入、查看或移除一個元素。',
  graph: '把問題想成節點與邊的地圖；顏色表示已知狀態，發光邊表示這一步正在傳遞資訊。',
  tree: '把樹想成有父子關係的層級圖；資訊沿父子邊向下拆解，或由子節點向上合併。',
  'segment-tree': '把一段陣列逐層切半；每個節點只負責自己的區間，查詢答案由少量完整區間合併。',
  range: '把長區間拆成預先整理的小區塊；查詢與更新只碰到能完整代表目標範圍的部分。',
  dp: '把每個子問題的答案放進表格；只有依賴的格子已知後，才能填入目前這一格。',
  string: '把字串排成有索引的字元帶；匹配狀態記住已成功對上的前綴，失配時只退狀態而不重做。',
  flow: '把每條邊想成有容量的管線；每次沿合法路徑送流量，同時在殘餘網路保留反悔空間。',
  math: '把抽象公式拆成一串可檢查的數值狀態；每次等式變形都保留與原問題相同的答案。',
  geometry: '把點、線與方向直接放在平面上；所有判斷都回到外積、距離或相對位置。',
  transform: '把資料從原表示轉到更容易運算的表示；完成核心運算後，再依規則轉回答案。',
}

const glossaryFor = (lesson: AlgorithmLesson): BeginnerGuide['glossary'] => {
  const model = lesson.visualModel ?? ''
  if (lesson.id === 'linear-search') return [
    { term: '索引', meaning: '元素在陣列中的位置，從 0 開始；回傳索引和回傳元素值是兩件不同的事。' },
    { term: '目前指標 i', meaning: '這一步唯一正在比較的位置；i 左邊已檢查，右邊仍未知。' },
    { term: '未排序', meaning: '相鄰數值沒有固定大小關係，所以一次比較只能排除目前這一格。' },
  ]
  if (lesson.id === 'binary-search') return [
    { term: '候選區間', meaning: '答案仍可能存在的連續範圍；每次更新都必須保證答案沒有被丟掉。' },
    { term: 'mid', meaning: '目前候選區間的中點；比較 mid 後才能決定安全排除左半或右半。' },
    { term: '單調性', meaning: '判斷結果只會由 false 轉成 true 一次，或排序值只會同方向增加，這是能折半的理由。' },
  ]
  if (lesson.id === 'prefix-sum') return [
    { term: 'prefix[i]', meaning: '前 i 個元素的總和，也就是 a[0] 到 a[i−1]；prefix[0] 是空前綴，值為 0。' },
    { term: '半開區間', meaning: '[0,i) 包含 0、1、…、i−1，但不包含 i；因此閉區間右端 r 要讀 prefix[r+1]。' },
    { term: '相減消去', meaning: '大前綴 prefix[r+1] 扣掉左側多算的 prefix[l]，就只留下查詢區間 [l,r]。' },
  ]
  if (/shortest-path/.test(model)) return [
    { term: '暫定距離', meaning: '目前已知從起點到節點的最小成本；之後仍可能被更短路徑改善。' },
    { term: '鬆弛', meaning: '檢查經過目前節點是否更短；若更短，就更新距離與前驅。' },
    { term: 'Priority Queue', meaning: '每次先取出暫定距離最小的候選；取出後仍要忽略已過期項目。' },
  ]
  if (/flow|matching|assignment/.test(model)) return [
    { term: '殘餘容量', meaning: '一條邊目前還能再送多少流量；反向邊則表示能撤回多少既有流量。' },
    { term: '增廣路', meaning: '在殘餘網路中從來源走到匯點、每條邊仍有容量的路徑。' },
    { term: '瓶頸', meaning: '增廣路上最小的殘餘容量，決定本次最多能增加多少流。' },
  ]
  if (/dp/.test(model)) return [
    { term: '狀態', meaning: '一個子問題的精確定義；必須先說清楚每個索引代表什麼。' },
    { term: '轉移', meaning: '使用已算好的較小狀態，推導目前狀態答案的公式。' },
    { term: '計算順序', meaning: '讀取某格之前，它依賴的格子必須已經完成，否則會讀到未定義或本輪新值。' },
  ]
  if (/string|trie|suffix|palindrome/.test(model)) return [
    { term: '前綴／後綴', meaning: '分別從字串開頭／結尾開始的連續片段；長度與最後索引不能混用。' },
    { term: '匹配狀態', meaning: '目前已成功對上的字元數，失配時依既有資訊跳到下一個可能狀態。' },
    { term: '轉移', meaning: '讀入下一個字元後，狀態沿邊移動；沒有邊時依 fallback 規則退回。' },
  ]
  if (/segment|fenwick|sparse|sqrt|wavelet|tree/.test(model)) return [
    { term: '節點區間', meaning: '每個節點只負責一段固定範圍，節點值是該範圍資訊的摘要。' },
    { term: '合併', meaning: '把互不重疊子區間的摘要組成父區間答案；合併規則必須一致。' },
    { term: '下推／上拉', meaning: '延遲資訊往子節點傳叫下推；子節點更新後重算父節點叫上拉。' },
  ]
  if (/graph|lowlink|scc|mst|dag|disjoint/.test(model)) return [
    { term: '節點與邊', meaning: '節點是狀態，邊表示兩個狀態可直接轉移或具有關係。' },
    { term: 'Frontier', meaning: '已被發現、但尚未完整展開的候選集合；容器順序決定下一個處理誰。' },
    { term: '已完成', meaning: '該節點需要傳遞的資訊已處理完；它與「剛被發現」是不同狀態。' },
  ]
  if (/geometry|polygon|convex|circle|sweep|closest|spatial|minkowski|line-/.test(model)) return [
    { term: '外積符號', meaning: '正、負、零分別表示左轉、右轉、共線；點的先後順序會改變符號。' },
    { term: '退化情況', meaning: '共線、重點、端點接觸或相切等臨界輸入，必須有明確規則。' },
    { term: '精度策略', meaning: '整數座標優先用整數運算；浮點比較則使用一致的誤差界線。' },
  ]
  if (/euclid|sieve|exponent|matrix|xor|congruence|primality|factor|discrete/.test(model)) return [
    { term: '不變量', meaning: '每次數值變形後仍與原問題等價的性質，用來保證最後答案沒有被改掉。' },
    { term: '模運算', meaning: '只保留除以模數的餘數；加減乘後要依型別與題意正規化。' },
    { term: '邊界值', meaning: '0、1、負數與最大整數常使一般公式失效，必須先分支處理。' },
  ]
  return [
    { term: '候選', meaning: '目前仍可能成為答案的資料；只有有證明時才能排除。' },
    { term: '指標／範圍', meaning: '畫面上的位置與區間端點；先確認採閉區間還是半開區間。' },
    { term: '不變量', meaning: '每一步前後都必須成立的核心敘述，也是判斷更新是否正確的依據。' },
  ]
}

const pitfallsFor = (lesson: AlgorithmLesson): [string, string] => {
  const model = lesson.visualModel ?? ''
  if (lesson.id === 'linear-search') return ['看到某格已大於目標就提前停止；未排序陣列的後面仍可能出現目標。', '走完整個陣列仍找不到時忘記回傳 -1，或把找到的索引誤當成元素值。']
  if (lesson.id === 'binary-search') return ['資料沒有排序、判斷也沒有單調性時仍使用二分搜尋；此時排除一半沒有證明。', '左右邊界定義混用閉區間與半開區間，造成無限迴圈或漏掉最後一格。']
  if (lesson.id === 'prefix-sum') return ['把 prefix[i] 誤認為包含 a[i]，查詢時就會固定多一格或少一格。', '閉區間 [l,r] 忘記讀 prefix[r+1]，或在 l=0 時使用不存在的 prefix[l−1]。']
  if (lesson.id === 'bfs') return ['等到節點出 queue 才標記 visited，會讓同一節點被多個鄰居重複加入。', '圖有不同邊權時仍用普通 BFS 求最短成本；此時 queue 的逐層順序不再代表距離順序。']
  if (/shortest-path/.test(model)) return ['沒有先判斷邊權限制就直接套 Dijkstra，遇到負邊時答案會錯。', '把舊的 priority queue 項目當成最新距離處理，會造成重複工作或錯誤鬆弛。']
  if (/dp/.test(model)) return ['只背轉移式卻沒有先說清楚 dp 狀態代表什麼，初始化與答案位置很容易一起寫錯。', '更新順序不符合依賴關係，讀到本輪剛改過的值，會把 0/1 選擇誤寫成可重複選擇。']
  if (/string/.test(model) || /trie|suffix|palindrome/.test(model)) return ['混用字元索引、前綴長度與半開區間，常造成差一格的錯誤。', '失配時直接把文字指標退回，會失去演算法利用既有前綴資訊的複雜度優勢。']
  if (/flow|matching|assignment/.test(model)) return ['只看原始容量而忽略殘餘邊，後面的增廣路就無法撤銷先前不理想的選擇。', '更新路徑時只改正向邊、沒有同步反向邊，殘餘網路會立刻失去一致性。']
  if (/segment|fenwick|sparse|sqrt|wavelet|tree/.test(model)) return ['區間端點採用閉區間或半開區間沒有統一，查詢邊界會多算或漏算一格。', '修改子節點後忘記重新合併父節點，之後讀到的區間資訊會仍是舊值。']
  if (/graph|lowlink|scc|mst|dag|disjoint/.test(model)) return ['沒有區分「已發現」與「已完成」的狀態，遇到回邊或重複邊時容易做出錯誤判斷。', '把無向邊的父邊當成環，或忘記處理平行邊，會破壞遍歷與 low-link 判定。']
  if (/geometry|polygon|convex|circle|sweep|closest|spatial|minkowski|line-/.test(model)) return ['使用浮點數直接比較相等而沒有誤差策略，臨界共線或相切案例會不穩定。', '外積方向的點順序前後不一致，會把左轉、右轉與多邊形方向全部顛倒。']
  if (/sort|array|prefix|difference|interval|window|kadane/.test(model)) return ['沒有先確認排序、單調性或元素正負等前提，就使用能排除候選的結論。', '左右端點與半開區間定義不一致，容易在第一格、最後一格或空區間發生錯誤。']
  if (/euclid|sieve|exponent|matrix|xor|congruence|primality|factor|discrete|game/.test(model)) return ['中間乘法沒有先提升整數型別或取模，大輸入下會在公式正確時仍發生溢位。', '只記公式而沒有維持等價關係或循環不變量，遇到 0、1 與負數邊界就容易失效。']
  return ['沒有先寫下每個變數的精確意義，會讓程式碼看似能跑卻無法證明正確。', '忽略空輸入、單一元素與重複值等邊界情況，範例通過仍可能在正式測資失敗。']
}

const describeEntries = (frame: Frame, fromEnd = false) => {
  const entries = Object.entries(frame.state ?? {}).filter(([key]) => !['phase', 'microStep', 'microPhase', 'timelineStep', 'algorithm'].includes(key))
  const selected = (fromEnd ? entries.slice(-2) : entries.slice(0, 2))
  if (!selected.length) return '目前先以高亮程式行與畫面焦點作為判斷依據'
  return selected.map(([key, value]) => `${humanizeStateKey(key)}是 ${humanizeStateValue(value)}`).join('；')
}

const splitStatements = (source: string) => {
  const pieces: string[] = []
  let start = 0
  let parentheses = 0
  let brackets = 0
  let quote = ''
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    const previous = source[index - 1]
    if (quote) {
      if (char === quote && previous !== '\\') quote = ''
      continue
    }
    if (char === '"' || char === "'") { quote = char; continue }
    if (char === '(') parentheses += 1
    if (char === ')') parentheses = Math.max(0, parentheses - 1)
    if (char === '[') brackets += 1
    if (char === ']') brackets = Math.max(0, brackets - 1)
    if (char === ';' && parentheses === 0 && brackets === 0) {
      pieces.push(source.slice(start, index + 1).trim())
      start = index + 1
    }
  }
  const remainder = source.slice(start).trim()
  if (remainder) pieces.push(remainder)
  return pieces.filter(Boolean)
}

const expandReadableLine = (rawLine: string) => {
  const trimmed = rawLine.trim()
  if (!trimmed || trimmed.startsWith('//')) return [rawLine]
  const indent = rawLine.match(/^\s*/)?.[0] ?? ''
  const inlineBlock = trimmed.match(/^(.*\))\s*\{\s*(.+)\s*\}\s*$/)
  if (inlineBlock && !trimmed.includes('[]')) {
    const body = splitStatements(inlineBlock[2])
    if (body.length > 1) return [`${indent}${inlineBlock[1]} {`, ...body.map((line) => `${indent}  ${line}`), `${indent}}`]
  }
  const statements = splitStatements(trimmed)
  if (statements.length > 1 && !trimmed.includes('{') && !trimmed.includes('}')) return statements.map((line) => `${indent}${line}`)
  return [rawLine]
}

const prepareReadableTemplate = (lesson: AlgorithmLesson): AlgorithmLesson => {
  const code: string[] = [
    `// ${lesson.title}｜${lesson.zhTitle}`,
    `// Purpose: ${lesson.description}`,
    `// Complexity: ${lesson.complexity}`,
    '',
    '#include <bits/stdc++.h>',
    'using namespace std;',
    '',
  ]
  const lineMap = new Map<number, number[]>()
  lesson.code.forEach((line, index) => {
    const expanded = expandReadableLine(line)
    const mapped = expanded.map((expandedLine) => { code.push(expandedLine); return code.length })
    lineMap.set(index + 1, mapped)
  })
  const frames = lesson.frames.map((frame) => {
    const codeLines = [...new Set(frame.codeLines.flatMap((line) => lineMap.get(line) ?? []))]
    const firstMeaningful = codeLines.find((line) => code[line - 1]?.trim() && !/^[{}]+;?$/.test(code[line - 1].trim())) ?? codeLines[0]
    return { ...frame, codeLines, codeLine: firstMeaningful ? code[firstMeaningful - 1].trim() : frame.codeLine }
  })
  return { ...lesson, code, frames }
}

const ensureCodeCoverage = (lesson: AlgorithmLesson) => {
  const frames = lesson.frames.map((frame) => ({ ...frame, codeLines: [...new Set(frame.codeLines)] }))
  const covered = new Set(frames.flatMap((frame) => frame.codeLines))
  for (const { number } of meaningfulCodeLines(lesson)) {
    if (covered.has(number)) continue
    const target = Math.min(frames.length - 1, Math.round((number - 1) / Math.max(1, lesson.code.length - 1) * (frames.length - 1)))
    frames[target].codeLines = [...new Set([...frames[target].codeLines, number])].sort((a, b) => a - b)
    covered.add(number)
  }
  return frames.map((frame, frameIndex) => {
    const candidates = frame.codeLines
      .map((number) => ({ number, line: lesson.code[number - 1]?.trim() ?? '' }))
      .filter(({ line }) => line && !/^[{}]+;?$/.test(line) && !line.startsWith('//'))
    const fallback = meaningfulCodeLines(lesson)[Math.min(meaningfulCodeLines(lesson).length - 1, Math.round(frameIndex / Math.max(1, frames.length - 1) * Math.max(0, meaningfulCodeLines(lesson).length - 1)))]
    const teachingLine = candidates[0] ?? fallback
    if (!teachingLine) return frame
    return { ...frame, codeLine: teachingLine.line, codeLines: [...new Set([...frame.codeLines, teachingLine.number])].sort((a, b) => a - b) }
  })
}

const buildStep = (lesson: AlgorithmLesson, frame: Frame, step: number, total: number): BeginnerStep => {
  const activeLines = frame.codeLines.map((lineNumber) => explainCppLine(lesson.code[lineNumber - 1] ?? '', lesson, lineNumber))
  const activeSource = frame.codeLines.map((lineNumber) => lesson.code[lineNumber - 1] ?? '').join(' ')
  const focus = [...new Set([...(frame.active ?? []), ...(frame.queue ?? []), ...(frame.priorityQueue ?? [])])]
  const focusText = focus.length ? `先找畫面高亮的 ${focus.slice(0, 5).join('、')}；這是本步會讀取或改動的資料。` : '先找畫面中最亮的節點、格子或區間，再對照右側高亮程式行。'
  const finalStep = step === total - 1
  const before = frame.state?.before ? humanizeStateValue(frame.state.before) : describeEntries(frame)
  const after = frame.state?.after ? humanizeStateValue(frame.state.after) : describeEntries(frame, true)
  const hasCondition = Boolean(frame.state?.condition) || /\b(if|while|for)\s*\(/.test(activeSource)
  const condition = frame.state?.condition ? humanizeStateValue(frame.state.condition) : '高亮程式行括號內的條件'
  const operation = frame.state?.operation ? humanizeStateValue(frame.state.operation) : frame.title
  const invariant = frame.state?.invariant ? humanizeStateValue(frame.state.invariant) : lesson.beginnerGuide?.invariant ?? lesson.description
  const rationale = frame.state?.rationale ? humanizeStateValue(frame.state.rationale) : frame.explanation
  const resultText = /[。！？]$/.test(after) ? after : `${after}。`
  const observeEnding = hasCondition ? '先不要看結果，先用這些值判斷條件會是 true 還是 false。' : '先確認這些值接下來會被哪一行讀取或更新。'
  const actionLead = hasCondition
    ? `把目前數值代入「${condition}」，判斷成立後再執行「${operation}」。`
    : /^[\w:<>,&*\s]+\w+\s*\([^;]*\)\s*\{?/.test(activeSource.trim())
      ? '先讀取函式收到的參數與回傳型別；函式入口本身不會修改資料。'
      : `依照高亮順序執行「${operation}」。`
  return {
    observe: `${focusText} 執行前的狀態是：${before}。${observeEnding}`,
    action: `${actionLead}${activeLines.join(' ')}`,
    reason: `${rationale} 因此這一步完成後，仍必須維持：${invariant}。`,
    result: `${finalStep ? '演算法完成後的最終狀態' : '這一行執行後、交給下一步的狀態'}是：${resultText}請確認畫面改變、高亮程式行與這個結果三者一致。`,
    codeMeaning: activeLines.join(' '),
    pitfall: pitfallsFor(lesson)[step % 2],
  }
}

const buildGuide = (lesson: AlgorithmLesson, frames: Frame[]): BeginnerGuide => {
  const goalFrames = frames.filter((frame) => frame.state?.goal).filter((frame, index, all) => index === all.findIndex((candidate) => candidate.state?.goal === frame.state?.goal))
  const routeFrames = goalFrames.length >= 3 ? goalFrames.slice(0,3) : [frames[0],frames[Math.floor(frames.length/2)],frames.at(-1)!]
  const [first, middle, last] = [routeFrames[0] ?? frames[0], routeFrames[1] ?? frames[Math.floor(frames.length / 2)], routeFrames[2] ?? frames.at(-1)!]
  const invariantFrame = frames.find((frame) => frame.state?.invariant)
  const invariant = invariantFrame?.state?.invariant
  const pitfalls = pitfallsFor(lesson)
  const route = (label: string, frame: Frame) => {
    const goal = humanizeStateValue(frame.state?.goal ?? frame.title)
    const rationale = humanizeStateValue(frame.state?.rationale ?? frame.explanation).split(/(?<=[。！？])/)[0]
    return `${label}：${goal}。${rationale}`
  }
  return {
    mentalModel: `${visualMentalModel[lesson.visual]} 在本課中，這個畫面專門用來表示「${lesson.description.replace(/[。.]$/, '')}」。`,
    prerequisite: lesson.usage?.[1] ?? `開始前先確認輸入限制符合 ${lesson.title} 的資料模型與複雜度需求。`,
    invariant: invariant ? `整個過程都要維持：${asText(invariant)}。每一步完成後都用它檢查目前狀態是否仍然合法。` : `整個過程都要維持「尚未排除的候選仍完整包含正確答案」；每次更新後都要重新檢查這件事。`,
    walkthrough: [
      route('準備', first),
      route('核心', middle),
      route('驗證', last),
    ],
    pitfalls: [...pitfalls],
    glossary: glossaryFor(lesson),
  }
}

const codeRole = (line: string) => {
  if (/^[\w:<>,&*\s]+\w+\s*\([^;]*\)\s*\{.*\bif\b.*\breturn\b/.test(line)) return '函式入口＋特例'
  if (/^[\w:<>,&*\s]+\w+\s*\([^;]*\)\s*\{?$/.test(line)) return '函式入口'
  if (/\bif\b.*\breturn\b/.test(line)) return '特例提前回傳'
  if (/\breturn\b/.test(line)) return '輸出答案'
  if (/^if\s*\(/.test(line)) return '分支判斷'
  if (/^(for|while)\s*\(/.test(line)) return '控制迴圈'
  if (/\b(push|insert|emplace)\b/.test(line)) return '加入候選'
  if (/\b(pop|erase)\b/.test(line)) return '移除候選'
  if (/\b(sort|reverse)\s*\(/.test(line)) return '建立處理順序'
  if (/=|\+=|-=|\*=|\/=/.test(line)) return '更新狀態'
  return '讀取／呼叫'
}

const codePurpose = (lesson: AlgorithmLesson, line: string, fallback: string) => {
  if (/\b(sort|stable_sort)\s*\(/.test(line)) {
    if (lesson.id === 'meet-in-the-middle') return '把右半部的所有子集合和由小到大排序，讓下一步能用 upper_bound 二分搜尋最大合法補數。'
    return '先建立由小到大的處理順序，讓後續二分搜尋、雙指標或相鄰掃描能安全利用單調性。'
  }
  if (/\bupper_bound\s*\(/.test(line)) return '在已排序容器中找出第一個大於上限的位置；往前一格就是不超過上限的最大候選。'
  if (/\blower_bound\s*\(/.test(line)) return '在已排序容器中找出第一個不小於目標的位置，避免重新線性掃描整段資料。'
  return fallback
}

const codeEffect = (line: string, fallback: string) => {
  const container = line.match(/\b(?:sort|stable_sort|reverse)\s*\(\s*([A-Za-z_]\w*)/)?.[1]
  if (/\b(sort|stable_sort)\s*\(/.test(line)) return `${container ?? '目標容器'} 的元素順序會被原地改成由小到大；這不是只讀取資料。排序後才可以正確呼叫 lower_bound 或 upper_bound。`
  if (/\breverse\s*\(/.test(line)) return `${container ?? '目標容器'} 的元素順序會被原地反轉，後續程式讀到的是新順序。`
  if (/^if\s*\(/.test(line)) return '這行只決定是否進入分支；條件成立後，分支內的敘述才會改變狀態。'
  if (/^(for|while)\s*\(/.test(line)) return '這行負責控制是否進入下一輪；真正的資料變化發生在迴圈本體。'
  if (/^[\w:<>,&*\s]+\w+\s*\([^;]*\)\s*\{?$/.test(line)) return '這是函式入口，只建立參數名稱與回傳規格，不會在這一行修改輸入。'
  return fallback
}

const buildCodeGuide = (lesson: AlgorithmLesson, frames: Frame[]): CodeGuideLine[] => meaningfulCodeLines(lesson).map(({ line, number }) => {
  const related = frames.find((frame) => frame.codeLines.includes(number))
  const fallbackPurpose = related?.state?.operation ? humanizeStateValue(related.state.operation) : related?.title ?? lesson.description
  const fallbackEffect = related?.state?.after ? humanizeStateValue(related.state.after) : describeEntries(related ?? frames[0], true)
  return {
    lineNumber: number,
    code: line,
    role: codeRole(line),
    syntax: explainCppLine(line, lesson, number),
    purpose: codePurpose(lesson, line, `在 ${lesson.zhTitle} 中，這行負責：${fallbackPurpose}。`),
    effect: codeEffect(line, `完成後應觀察到：${fallbackEffect}${/[。！？]$/.test(fallbackEffect)?'':'。'}`),
  }
})

export const enrichPedagogy = (rawLesson: AlgorithmLesson): AlgorithmLesson => {
  const lesson = prepareReadableTemplate(rawLesson)
  const coveredFrames = ensureCodeCoverage(lesson)
  const total = coveredFrames.length
  const frames = coveredFrames.map((frame, step) => {
    const progress = total <= 1 ? 1 : step / (total - 1)
    const operation = String(frame.state?.operation ?? frame.title)
    const code = frame.codeLine.trim()
    const mode: NonNullable<Frame['visualCue']>['mode'] = /讀取輸入|定位|準備/.test(operation)
      ? 'observe'
      : /代入實際值|判斷/.test(operation)
        ? 'evaluate'
        : /執行目前|寫入|更新|加入|移除|交換|合併/.test(operation)
          ? 'mutate'
          : /比較執行前後|核對結果/.test(operation)
            ? 'verify'
            : step === total - 1 || /回傳|答案|核對|完成/.test(operation) || /\breturn\b/.test(code)
              ? 'verify'
              : /push|pop|swap|\+=|-=/.test(code)
                ? 'mutate'
                : /if|while|for/.test(code)
                  ? 'evaluate'
                  : 'observe'
    const label = mode === 'observe' ? '讀取目前焦點' : mode === 'evaluate' ? '代入條件判斷' : mode === 'mutate' ? '更新高亮狀態' : '核對不變量'
    return {
      ...frame,
      visualStep: step,
      visualProgress: progress,
      beginner: buildStep(lesson, frame, step, total),
      visualCue: {
        mode,
        label,
        focus: [...new Set([...(frame.active ?? []), ...(frame.accepted ?? []), ...(frame.queue ?? []), ...(frame.priorityQueue ?? [])])].slice(0, 4),
        progress,
      },
    }
  })
  return { ...lesson, frames, beginnerGuide: buildGuide(lesson, frames), codeGuide: buildCodeGuide(lesson, frames) }
}
