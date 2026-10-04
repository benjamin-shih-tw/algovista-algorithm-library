import { buildTree, createQueryTrace } from './segmentTree'
import { foundationLessons } from './foundationLessons'
import { graphTreeLessons } from './graphTreeLessons'
import { dataDpLessons } from './dataDpLessons'
import { advancedLessons } from './advancedLessons'
import { completionLessons } from './completionLessons'
import { enrichLesson, type PracticeProblem, type VisualModel } from './lessonMeta'
import { enrichPedagogy } from './pedagogy'
import { enrichKnowledgeCatalog, type KnowledgeUnit } from './knowledge'
import { applyExecutionTraceOverride } from './executionTraceOverrides'
import { applyS2ExecutionOverride } from './s2ExecutionOverrides'
import { applyS3ExecutionOverride } from './s3ExecutionOverrides'
import { applyStudentLesson } from './studentLessons'

export type AlgorithmId = string
export type VisualKind = 'array' | 'linear' | 'graph' | 'tree' | 'segment-tree' | 'range' | 'dp' | 'string' | 'flow' | 'math' | 'geometry' | 'transform'
export type VisualFidelity = 'concrete' | 'semantic'

export interface Point { id: string; x: number; y: number; label: string }
export interface Edge { from: string; to: string; weight?: number }
export interface VisualTraceNode { label: string; value: string; role: 'input' | 'operation' | 'result' | 'invariant' }
export interface VisualTrace {
  signature: string
  step: number
  totalSteps: number
  phase: 'prepare' | 'execute' | 'verify'
  nodes: VisualTraceNode[]
  focus: string[]
  activeCode: string
}

export type ExecutionView =
  | {
      kind: 'network'
      title: string
      nodes: { id: string; label?: string; x: number; y: number; value?: string; group?: string }[]
      edges: { from: string; to: string; label?: string; active?: boolean; muted?: boolean; dashed?: boolean }[]
      path?: string[]
      badges?: string[]
    }
  | {
      kind: 'matrix'
      title: string
      rowLabels?: string[]
      colLabels?: string[]
      cells: string[][]
      activeCells?: string[]
      pivot?: string
      badges?: string[]
    }
  | {
      kind: 'structure'
      title: string
      nodes: { id: string; label: string; x: number; y: number; meta?: string; active?: boolean; muted?: boolean }[]
      edges: { from: string; to: string; label?: string; active?: boolean; dashed?: boolean }[]
      sequence?: string[]
      badges?: string[]
    }
  | {
      kind: 'geometry'
      title: string
      points: { id: string; x: number; y: number; label?: string; active?: boolean }[]
      segments?: { from: string; to: string; label?: string; active?: boolean; dashed?: boolean }[]
      circles?: { x: number; y: number; r: number; label?: string; active?: boolean }[]
      polygon?: string[]
      sweepX?: number
      badges?: string[]
    }
  | {
      kind: 'table'
      title: string
      columns: string[]
      rows: string[][]
      activeRow?: number
      activeCells?: string[]
      badges?: string[]
    }
export interface BeginnerStep {
  observe: string
  action: string
  reason: string
  result: string
  codeMeaning: string
  pitfall?: string
}
export interface StudentGuide {
  input: string
  goal: string
  terms: { term: string; meaning: string }[]
  reasoning: string[]
  boundaries: string[]
  cost: string
  question: string
  answer: string
}
export interface BeginnerGuide {
  mentalModel: string
  prerequisite: string
  invariant: string
  walkthrough: string[]
  pitfalls: string[]
  glossary: { term: string; meaning: string }[]
}
export interface CodeGuideLine {
  lineNumber: number
  code: string
  role: string
  syntax: string
  purpose: string
  effect: string
}
export interface VisualCue {
  mode: 'observe' | 'evaluate' | 'mutate' | 'verify'
  label: string
  focus: string[]
  progress: number
}
export interface Frame {
  title: string
  explanation: string
  codeLine: string
  active?: string[]
  accepted?: string[]
  muted?: string[]
  values?: number[]
  low?: number
  high?: number
  mid?: number
  queue?: string[]
  priorityQueue?: string[]
  distances?: Record<string, number | '∞'>
  hull?: string[]
  segmentStep?: ReturnType<typeof createQueryTrace>[number]
  segmentNodeValues?: Record<string, number>
  codeLines: number[]
  state?: Record<string, string | number | string[]>
  executionView?: ExecutionView
  trace?: VisualTrace
  visualStep?: number
  visualProgress?: number
  beginner?: BeginnerStep
  teaching?: { before: string; decision: string; after: string; why: string }
  visualCue?: VisualCue
}

export interface AlgorithmLesson {
  id: AlgorithmId
  index: string
  category: string
  categoryId: CategoryId
  subcategory: string
  title: string
  zhTitle: string
  description: string
  complexity: string
  accent: string
  visual: VisualKind
  fidelity?: VisualFidelity
  animationVersion?: 2
  traceMode?: 'execution' | 'semantic'
  visualModel?: VisualModel
  beginnerGuide?: BeginnerGuide
  studentGuide?: StudentGuide
  codeGuide?: CodeGuideLine[]
  knowledge?: KnowledgeUnit
  usage?: string[]
  practice?: PracticeProblem[]
  sources?: { label: string; title: string; url: string }[]
  frames: Frame[]
  points?: Point[]
  edges?: Edge[]
  code: string[]
}

export type CategoryId = 'search-sort' | 'linear-structures' | 'graph' | 'trees' | 'data-structures' | 'dynamic-programming' | 'strings' | 'flow-matching' | 'mathematics' | 'geometry' | 'advanced'
export interface AlgorithmCategory { id: CategoryId; index: string; title: string; zhTitle: string; description: string; accent: string; subcategories: string[] }
export const categories: AlgorithmCategory[] = [
  { id: 'search-sort', index: '01', title: 'Arrays, Search & Sort', zhTitle: '陣列、搜尋與排序', description: '利用順序、單調性、區間與資料移動縮小答案空間。', accent: '#78d8ff', subcategories: ['陣列技巧', '單調性搜尋', '排序與選擇', '離線查詢', '區間與貪心'] },
  { id: 'linear-structures', index: '02', title: 'Linear Structures', zhTitle: '線性資料結構', description: '用 Stack、Queue、Deque 與 Heap 維護處理順序。', accent: '#62e4d0', subcategories: ['Stack', 'Queue 與 Deque', 'Heap'] },
  { id: 'graph', index: '03', title: 'Graph Algorithms', zhTitle: '圖論', description: '在節點與邊構成的關係中探索、連通與最佳化。', accent: '#a994ff', subcategories: ['圖的遍歷', '最短路徑', '連通性', '有向圖'] },
  { id: 'trees', index: '04', title: 'Tree Algorithms', zhTitle: '樹演算法', description: '利用唯一路徑、子樹與祖先結構處理查詢。', accent: '#8bc7ff', subcategories: ['樹的基礎', '祖先與路徑', '樹分治', '樹的編碼與離線技巧'] },
  { id: 'data-structures', index: '05', title: 'Range Data Structures', zhTitle: '區間資料結構', description: '結構化維護區間資訊，支援快速查詢與修改。', accent: '#72e6b7', subcategories: ['區間資料結構', '平衡搜尋樹', '持久化與動態結構'] },
  { id: 'dynamic-programming', index: '06', title: 'Dynamic Programming', zhTitle: '動態規劃', description: '明確定義狀態、轉移、初始值與計算順序。', accent: '#ffad72', subcategories: ['經典 DP', '區間與樹 DP', '狀態壓縮', 'DP 最佳化'] },
  { id: 'strings', index: '07', title: 'String Algorithms', zhTitle: '字串演算法', description: '處理匹配、前綴、後綴、自動機與回文結構。', accent: '#d49aff', subcategories: ['字串匹配', 'Trie 與自動機', '後綴結構', '回文'] },
  { id: 'flow-matching', index: '08', title: 'Flow & Matching', zhTitle: '網路流與匹配', description: '以增廣路、殘餘網路與對偶關係求最佳配置。', accent: '#ff7f96', subcategories: ['最大流與最小割', '費用流', '匹配'] },
  { id: 'mathematics', index: '09', title: 'Mathematics', zhTitle: '競賽數學', description: '以數線、模環、消去與基底呈現數學演算法。', accent: '#ffd36f', subcategories: ['數論', '線性代數', '賽局'] },
  { id: 'geometry', index: '10', title: 'Geometry', zhTitle: '計算幾何', description: '用向量、方向與空間關係處理平面問題。', accent: '#ff8fa8', subcategories: ['向量與相交', '多邊形', '凸包', '掃描線與圓'] },
  { id: 'advanced', index: '11', title: 'Advanced Algorithms', zhTitle: '進階演算法', description: '多項式轉換、進階樹結構與高階離線技巧。', accent: '#b6a7ff', subcategories: ['多項式與轉換', '多項式工具'] },
]

const binaryValues = [3, 7, 11, 16, 22, 29, 34, 41, 48]
const binaryFrames: Frame[] = [
  { title: '確認二分搜尋前提', explanation: '輸入已由小到大排序，目標值是 29。二分搜尋依賴排序後的單調性：比較中點後，才能安全排除整個左半或右半。', codeLine: 'int binarySearch(const vector<int>& a, int target) {', codeLines: [1], state: { target: 29, prerequisite: 'array is sorted', candidate: '[0, 8]' }, values: binaryValues, low: 0, high: 8 },
  { title: '初始化左界 low', explanation: '使用閉區間 [low, high]。先令 low=0，表示候選區間從第一個元素開始。', codeLine: 'int low = 0;', codeLines: [2], state: { target: 29, update: 'low = 0', candidate: '[0, 8]' }, values: binaryValues, low: 0, high: 8 },
  { title: '初始化右界 high', explanation: '令 high=a.size()-1=8。此後維持不變量：如果 29 存在，它一定仍在 [low, high] 中。', codeLine: 'int high = static_cast<int>(a.size()) - 1;', codeLines: [3], state: { target: 29, update: 'high = 8', invariant: 'answer remains in [low, high]', candidate: '[0, 8]' }, values: binaryValues, low: 0, high: 8 },
  { title: '第一次檢查搜尋區間', explanation: '目前 low=0、high=8，所以 low<=high 為 true，候選區間仍非空。', codeLine: 'while (low <= high) {', codeLines: [4], state: { target: 29, condition: '0 <= 8 -> true', candidate: '[0, 8]' }, values: binaryValues, low: 0, high: 8 },
  { title: '計算第一次中點', explanation: 'mid=0+(8-0)/2=4。使用 low+(high-low)/2 可避免 low+high 可能造成的整數溢位。', codeLine: 'int mid = low + (high - low) / 2;', codeLines: [5], state: { target: 29, calculation: 'mid = 4', candidate: '[0, 8]' }, values: binaryValues, low: 0, high: 8, mid: 4, active: ['4'] },
  { title: '先檢查是否命中', explanation: 'a[4]=22，22==29 為 false，因此不能 return，繼續執行下一個大小判斷。', codeLine: 'if (a[mid] == target) {', codeLines: [6], state: { target: 29, comparison: '22 == 29 -> false', decision: 'continue to less-than test' }, values: binaryValues, low: 0, high: 8, mid: 4, active: ['4'] },
  { title: '判斷中間值是否太小', explanation: '22<29 為 true。因為陣列遞增，所以索引 0 到 4 的值全部不可能等於 29。', codeLine: 'if (a[mid] < target) {', codeLines: [9], state: { target: 29, comparison: '22 < 29 -> true', decision: 'discard indices 0...4' }, values: binaryValues, low: 0, high: 8, mid: 4, active: ['4'] },
  { title: '把左界移到 mid 右側', explanation: '執行 low=mid+1=5，排除 [0,4]。新的候選區間是 [5,8]，不變量仍成立。', codeLine: 'low = mid + 1;', codeLines: [10], state: { target: 29, update: 'low: 0 -> 5', candidate: '[5, 8]' }, values: binaryValues, low: 5, high: 8, muted: ['0','1','2','3','4'] },
  { title: '第二次檢查搜尋區間', explanation: 'low=5、high=8，5<=8 為 true，因此進入第二輪。', codeLine: 'while (low <= high) {', codeLines: [4], state: { target: 29, condition: '5 <= 8 -> true', candidate: '[5, 8]' }, values: binaryValues, low: 5, high: 8, muted: ['0','1','2','3','4'] },
  { title: '計算第二次中點', explanation: 'mid=5+(8-5)/2=6，因此這輪檢查 a[6]=34。', codeLine: 'int mid = low + (high - low) / 2;', codeLines: [5], state: { target: 29, calculation: 'mid = 6', candidate: '[5, 8]' }, values: binaryValues, low: 5, high: 8, mid: 6, active: ['6'], muted: ['0','1','2','3','4'] },
  { title: '第二輪先檢查是否命中', explanation: 'a[6]=34，34==29 為 false，因此不能 return。', codeLine: 'if (a[mid] == target) {', codeLines: [6], state: { target: 29, comparison: '34 == 29 -> false', decision: 'continue to less-than test' }, values: binaryValues, low: 5, high: 8, mid: 6, active: ['6'], muted: ['0','1','2','3','4'] },
  { title: '第二輪檢查是否太小', explanation: '34<29 為 false，因此不會執行 low=mid+1，而是走到 else 分支。', codeLine: 'if (a[mid] < target) {', codeLines: [9], state: { target: 29, comparison: '34 < 29 -> false', decision: 'take else branch' }, values: binaryValues, low: 5, high: 8, mid: 6, active: ['6'], muted: ['0','1','2','3','4'] },
  { title: '進入 else：中間值必然太大', explanation: '前面已知道 a[mid] 不等於 target，且也不小於 target，所以此時必然有 a[mid]>target。這就是實際 C++ control flow，而不是額外虛構一個 > 判斷。', codeLine: '} else {', codeLines: [11], state: { target: 29, deduction: 'not equal and not less -> greater', decision: 'discard indices 6...8' }, values: binaryValues, low: 5, high: 8, mid: 6, active: ['6'], muted: ['0','1','2','3','4'] },
  { title: '把右界移到 mid 左側', explanation: '執行 high=mid-1=5，排除 [6,8]。現在只剩候選區間 [5,5]。', codeLine: 'high = mid - 1;', codeLines: [12], state: { target: 29, update: 'high: 8 -> 5', candidate: '[5, 5]' }, values: binaryValues, low: 5, high: 5, muted: ['0','1','2','3','4','6','7','8'] },
  { title: '最後一格仍必須檢查', explanation: 'low=high=5 時，low<=high 仍為 true。閉區間寫法使用 <=，才能保留最後一個候選。', codeLine: 'while (low <= high) {', codeLines: [4], state: { target: 29, condition: '5 <= 5 -> true', candidate: '[5, 5]' }, values: binaryValues, low: 5, high: 5, active: ['5'], muted: ['0','1','2','3','4','6','7','8'] },
  { title: '唯一候選成為中點', explanation: 'mid=5+(5-5)/2=5，因此 low、mid、high 都指向索引 5。', codeLine: 'int mid = low + (high - low) / 2;', codeLines: [5], state: { target: 29, calculation: 'mid = 5', candidate: '[5, 5]' }, values: binaryValues, low: 5, high: 5, mid: 5, active: ['5'], muted: ['0','1','2','3','4','6','7','8'] },
  { title: '第三輪命中 target', explanation: 'a[5]=29，29==29 為 true，因此進入命中分支。', codeLine: 'if (a[mid] == target) {', codeLines: [6], state: { target: 29, comparison: '29 == 29 -> true', decision: 'match' }, values: binaryValues, low: 5, high: 5, mid: 5, active: ['5'], accepted: ['5'], muted: ['0','1','2','3','4','6','7','8'] },
  { title: '回傳正確索引', explanation: '執行 return mid，回傳 5。因為 a[5]=29，所以答案正確；每輪都至少排除一半候選，時間複雜度為 O(log n)。', codeLine: 'return mid;', codeLines: [7], state: { target: 29, result: 'index 5', proof: 'a[5] = 29' }, values: binaryValues, low: 5, high: 5, mid: 5, active: ['5'], accepted: ['5'], muted: ['0','1','2','3','4','6','7','8'] },
]

const graphPoints: Point[] = [
  { id: 'A', x: 14, y: 48, label: 'A' }, { id: 'B', x: 34, y: 22, label: 'B' },
  { id: 'C', x: 34, y: 74, label: 'C' }, { id: 'D', x: 58, y: 22, label: 'D' },
  { id: 'E', x: 60, y: 70, label: 'E' }, { id: 'F', x: 84, y: 46, label: 'F' },
]
const bfsEdges: Edge[] = [
  { from: 'A', to: 'B' }, { from: 'A', to: 'C' }, { from: 'B', to: 'D' },
  { from: 'B', to: 'E' }, { from: 'C', to: 'E' }, { from: 'D', to: 'F' }, { from: 'E', to: 'F' },
]
const bfsFrames: Frame[] = [
  { title: '初始化 BFS 狀態', explanation: '建立 dist 與 FIFO queue，所有 dist 先設為 -1；再令 dist[A]=0 並把 A 入隊。dist=-1 同時表示「尚未發現」，不另外維護 visited，避免兩份狀態失同步。', codeLine: 'vector<int> dist(n, -1);', codeLines: [3,4,5,6], state: { operation: 'initialize dist, queue, and source A', invariant: 'dist[v] = -1 iff v is undiscovered', queue: ['A'] }, active: ['A'], accepted: ['A'], queue: ['A'], distances: { A: 0, B: '∞', C: '∞', D: '∞', E: '∞', F: '∞' } },
  { title: '取出並展開 A', explanation: 'queue 非空，讀取 front=A 後 pop。接下來依 A 的 adjacency list 檢查 B、C；front 與 pop 是連續的 queue 操作，畫面在本步結束時顯示 A 已離隊。', codeLine: 'int u = q.front();', codeLines: [7,8,9,10], state: { current: 'A', operation: 'front A -> pop A', queue: [] }, active: ['A'], accepted: ['A'], queue: [], distances: { A: 0, B: '∞', C: '∞', D: '∞', E: '∞', F: '∞' } },
  { title: '由 A 第一次發現 B', explanation: 'dist[B]=-1，所以 guard 不會 continue；接著設定 dist[B]=dist[A]+1=1，再把 B 加到 queue。這三行共同構成一次完整的 discovery event。', codeLine: 'dist[v] = dist[u] + 1;', codeLines: [11,14,15], state: { current: 'A', neighbor: 'B', operation: 'guard passes -> dist[B]=1 -> push B' }, active: ['A','B'], accepted: ['A','B'], queue: ['B'], distances: { A: 0, B: 1, C: '∞', D: '∞', E: '∞', F: '∞' } },
  { title: '由 A 第一次發現 C', explanation: 'dist[C]=-1，因此設定 dist[C]=1 並入隊。queue 變成 [B,C]，同一層依發現順序排列。', codeLine: 'dist[v] = dist[u] + 1;', codeLines: [11,14,15], state: { current: 'A', neighbor: 'C', operation: 'guard passes -> dist[C]=1 -> push C' }, active: ['A','C'], accepted: ['A','B','C'], queue: ['B','C'], distances: { A: 0, B: 1, C: 1, D: '∞', E: '∞', F: '∞' } },
  { title: '取出並展開 B', explanation: '讀取 queue 前端 B 後 pop，C 仍留在 queue。接著依無向 adjacency list 檢查 B 的鄰居 A、D、E。', codeLine: 'int u = q.front();', codeLines: [7,8,9,10], state: { current: 'B', operation: 'front B -> pop B', queue: ['C'] }, active: ['B'], accepted: ['A','B','C'], queue: ['C'], distances: { A: 0, B: 1, C: 1, D: '∞', E: '∞', F: '∞' } },
  { title: 'B 遇到已發現的 A', explanation: '無向邊 B-A 會真的被掃到。因為 dist[A]=0，不是 -1，所以 guard 成立並執行 continue；A 不會重複入隊。', codeLine: 'if (dist[v] != -1) {', codeLines: [11,12], state: { current: 'B', neighbor: 'A', decision: 'dist[A] != -1 -> continue' }, active: ['B','A'], accepted: ['A','B','C'], queue: ['C'], distances: { A: 0, B: 1, C: 1, D: '∞', E: '∞', F: '∞' } },
  { title: '由 B 第一次發現 D', explanation: 'dist[D]=-1，所以設定 dist[D]=dist[B]+1=2，再把 D 加到 queue 尾端。', codeLine: 'dist[v] = dist[u] + 1;', codeLines: [11,14,15], state: { current: 'B', neighbor: 'D', operation: 'guard passes -> dist[D]=2 -> push D' }, active: ['B','D'], accepted: ['A','B','C','D'], queue: ['C','D'], distances: { A: 0, B: 1, C: 1, D: 2, E: '∞', F: '∞' } },
  { title: '由 B 第一次發現 E', explanation: 'dist[E]=-1，所以設定 dist[E]=2 並入隊。queue 變成 [C,D,E]。', codeLine: 'dist[v] = dist[u] + 1;', codeLines: [11,14,15], state: { current: 'B', neighbor: 'E', operation: 'guard passes -> dist[E]=2 -> push E' }, active: ['B','E'], accepted: ['A','B','C','D','E'], queue: ['C','D','E'], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: '∞' } },
  { title: '取出並展開 C', explanation: '讀取 C 後 pop，queue 剩 [D,E]。C 的無向鄰居是 A、E。', codeLine: 'int u = q.front();', codeLines: [7,8,9,10], state: { current: 'C', operation: 'front C -> pop C', queue: ['D','E'] }, active: ['C'], accepted: ['A','B','C','D','E'], queue: ['D','E'], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: '∞' } },
  { title: 'C 遇到已發現的 A', explanation: 'dist[A]=0，因此 guard 成立並 continue。這個無向回邊會被真實執行，但不改變 queue 或距離。', codeLine: 'if (dist[v] != -1) {', codeLines: [11,12], state: { current: 'C', neighbor: 'A', decision: 'dist[A] != -1 -> continue' }, active: ['C','A'], accepted: ['A','B','C','D','E'], queue: ['D','E'], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: '∞' } },
  { title: 'C 遇到已發現的 E', explanation: 'E 已由 B 設成 dist[E]=2，因此 C 掃到 E 時直接 continue，不會重複入隊，也不會改寫最短距離。', codeLine: 'if (dist[v] != -1) {', codeLines: [11,12], state: { current: 'C', neighbor: 'E', decision: 'dist[E] != -1 -> continue' }, active: ['C','E'], accepted: ['A','B','C','D','E'], queue: ['D','E'], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: '∞' } },
  { title: '取出並展開 D', explanation: '讀取 D 後 pop，queue 剩 [E]。D 的無向鄰居是 B、F。', codeLine: 'int u = q.front();', codeLines: [7,8,9,10], state: { current: 'D', operation: 'front D -> pop D', queue: ['E'] }, active: ['D'], accepted: ['A','B','C','D','E'], queue: ['E'], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: '∞' } },
  { title: 'D 遇到已發現的 B', explanation: 'dist[B]=1，因此 guard 成立並 continue。', codeLine: 'if (dist[v] != -1) {', codeLines: [11,12], state: { current: 'D', neighbor: 'B', decision: 'dist[B] != -1 -> continue' }, active: ['D','B'], accepted: ['A','B','C','D','E'], queue: ['E'], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: '∞' } },
  { title: '由 D 第一次發現 F', explanation: 'dist[F]=-1，所以設定 dist[F]=dist[D]+1=3，再把 F 加到 queue。queue 變成 [E,F]。', codeLine: 'dist[v] = dist[u] + 1;', codeLines: [11,14,15], state: { current: 'D', neighbor: 'F', operation: 'guard passes -> dist[F]=3 -> push F' }, active: ['D','F'], accepted: ['A','B','C','D','E','F'], queue: ['E','F'], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 3 } },
  { title: '取出並展開 E', explanation: '讀取 E 後 pop，queue 剩 [F]。E 的三個鄰居 B、C、F 都已經有非 -1 的 dist。', codeLine: 'int u = q.front();', codeLines: [7,8,9,10], state: { current: 'E', operation: 'front E -> pop E', queue: ['F'] }, active: ['E'], accepted: ['A','B','C','D','E','F'], queue: ['F'], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 3 } },
  { title: 'E 的所有鄰居都直接略過', explanation: '依序檢查 B、C、F；三者的 dist 都不是 -1，所以每次都走 guard 的 continue。這三次真實迴圈不改變任何資料，因此合併成同一個「無狀態變化」事件。', codeLine: 'if (dist[v] != -1) {', codeLines: [10,11,12], state: { current: 'E', neighbors: ['B','C','F'], decision: 'all discovered -> continue each time' }, active: ['E','B','C','F'], accepted: ['A','B','C','D','E','F'], queue: ['F'], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 3 } },
  { title: '取出並展開 F', explanation: '讀取最後一個 F 後 pop，queue 變空。F 的鄰居是 D、E。', codeLine: 'int u = q.front();', codeLines: [7,8,9,10], state: { current: 'F', operation: 'front F -> pop F', queue: [] }, active: ['F'], accepted: ['A','B','C','D','E','F'], queue: [], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 3 } },
  { title: 'F 的鄰居 D、E 都已發現', explanation: 'dist[D]=2、dist[E]=2，所以兩次檢查都執行 continue；沒有新節點加入 queue。', codeLine: 'if (dist[v] != -1) {', codeLines: [10,11,12], state: { current: 'F', neighbors: ['D','E'], decision: 'both discovered -> continue each time' }, active: ['F','D','E'], accepted: ['A','B','C','D','E','F'], queue: [], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 3 } },
  { title: 'Queue 清空，BFS 結束', explanation: 'queue 為空，所以 while 條件為 false。所有可達節點都已經被發現且展開，最短距離固定為 A0、B1、C1、D2、E2、F3。', codeLine: 'while (!q.empty()) {', codeLines: [7], state: { condition: 'queue is not empty -> false', result: 'A0 · B1 · C1 · D2 · E2 · F3' }, active: [], accepted: ['A','B','C','D','E','F'], queue: [], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 3 } },
  { title: '回傳所有最短距離', explanation: '回傳 dist=[0,1,1,2,2,3]。每個節點只會第一次發現時入隊一次，每條無向邊最多從兩端各檢查一次，因此時間複雜度為 O(V+E)。', codeLine: 'return dist;', codeLines: [18], state: { result: 'dist = [0,1,1,2,2,3]', proof: 'first discovery fixes shortest unweighted distance' }, active: [], accepted: ['A','B','C','D','E','F'], queue: [], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 3 } },
]

const weightedEdges: Edge[] = [
  { from: 'A', to: 'B', weight: 4 }, { from: 'A', to: 'C', weight: 2 }, { from: 'C', to: 'B', weight: 1 },
  { from: 'B', to: 'D', weight: 5 }, { from: 'C', to: 'E', weight: 4 }, { from: 'E', to: 'D', weight: 1 },
  { from: 'D', to: 'F', weight: 3 }, { from: 'E', to: 'F', weight: 7 },
]
const dijkstraFrames: Frame[] = [
  { title: '初始化距離與 Priority Queue', explanation: '只有 A 的已知距離是 0。將 (0,A) 放入以距離為鍵的 min-priority queue，其餘距離設為無限大。', codeLine: 'pq.push({0, source});', codeLines: [4,5,6,7], state: { priorityQueue: ['(0,A)'], fixed: [], operation: 'push (0,A)' }, active: ['A'], accepted: [], distances: { A: 0, B: '∞', C: '∞', D: '∞', E: '∞', F: '∞' } },
  { title: '取出最小項目並鬆弛 A', explanation: 'pop 得到 (0,A)。所有邊權非負，因此 A 不可能再由未處理節點得到更短路徑；鬆弛後 push (2,C)、(4,B)。', codeLine: 'if (d + w < dist[v])', codeLines: [9,10,11,13,14,15], state: { priorityQueue: ['(2,C)','(4,B)'], fixed: ['A'], operation: 'relax A→B, A→C' }, active: ['A','B','C'], accepted: ['A'], distances: { A: 0, B: 4, C: 2, D: '∞', E: '∞', F: '∞' } },
  { title: '取出 C 並改善 B', explanation: 'pop (2,C)。C→B 產生候選距離 2+1=3，小於 4，因此更新並 push (3,B)。舊的 (4,B) 不會被刪除，之後以過期檢查略過。', codeLine: 'pq.push({dist[v], v});', codeLines: [9,10,13,14,15,16], state: { priorityQueue: ['(3,B)','(4,B)','(6,E)'], fixed: ['A','C'], operation: 'decrease B: 4→3' }, active: ['C','B','E'], accepted: ['A','C'], distances: { A: 0, B: 3, C: 2, D: '∞', E: 6, F: '∞' } },
  { title: '固定 B 並保留過期項目', explanation: 'pop (3,B) 並鬆弛得到 D=8。queue 仍含舊項目 (4,B)，但 dist[B] 已是 3，因此它被取出時會由 d != dist[u] 判定過期。', codeLine: 'if (d != dist[u]) continue;', codeLines: [9,10,11,12,13,14,15], state: { priorityQueue: ['(4,B) stale','(6,E)','(8,D)'], fixed: ['A','C','B'], operation: 'push (8,D)' }, active: ['B','D'], accepted: ['A','B','C'], distances: { A: 0, B: 3, C: 2, D: 8, E: 6, F: '∞' } },
  { title: '由 E 改善 D', explanation: '過期的 (4,B) 被略過，接著 pop (6,E)。E→D 給出 7<8，更新 D 並 push (7,D)；E→F 暫得 13。', codeLine: 'dist[v] = d + w;', codeLines: [9,10,11,12,13,14,15,16], state: { priorityQueue: ['(7,D)','(8,D) stale','(13,F)'], fixed: ['A','C','B','E'], operation: 'D: 8→7; F: ∞→13' }, active: ['E','D','F'], accepted: ['A','B','C','E'], distances: { A: 0, B: 3, C: 2, D: 7, E: 6, F: 13 } },
  { title: '得到所有最短距離', explanation: 'pop (7,D)，由 D→F 得到 7+3=10，優於 13。非負權重保證每個首次以最新距離 pop 的節點已達最短距離。', codeLine: 'dist[v] = d + w;', codeLines: [9,10,11,13,14,15,16], state: { priorityQueue: ['(8,D) stale','(10,F)','(13,F) stale'], fixed: ['A','B','C','D','E','F'], operation: 'F: 13→10' }, active: ['D','F'], accepted: ['A','B','C','D','E','F'], distances: { A: 0, B: 3, C: 2, D: 7, E: 6, F: 10 } },
]

const dijkstraGuidedFrames: Frame[] = [
  { title: '確認 Dijkstra 的使用前提', explanation: '起點是 A，所有邊權都非負。非負性保證 priority queue 取出的最新最小距離，不可能再被尚未處理的路徑改善。', codeLine: 'void dijkstra(int source) {', codeLines: [1,2,3], state: { source: 'A', prerequisite: 'all edge weights ≥ 0', invariant: 'heap top is minimum tentative distance' }, active: ['A'], accepted: [], priorityQueue: [], distances: { A: '∞', B: '∞', C: '∞', D: '∞', E: '∞', F: '∞' } },
  { title: '把所有距離設為無限大', explanation: '目前還不知道任何路徑，因此 dist[A..F] 全部初始化為 INF。Min-heap 會使用 pair 的第一個欄位，也就是距離來排序。', codeLine: 'dist.assign(graph.size(), INF);', codeLines: [4], state: { operation: 'initialize distances', priorityQueue: [], fixed: [] }, active: [], accepted: [], priorityQueue: [], distances: { A: '∞', B: '∞', C: '∞', D: '∞', E: '∞', F: '∞' } },
  { title: '設定起點並加入 Min-Heap', explanation: '空路徑長度為 0，所以令 dist[A]=0，並把 (0,A) 推入 min-priority queue；其他節點仍不可達。', codeLine: 'pq.push({0, source});', codeLines: [5,6], state: { operation: 'dist[A]=0; push (0,A)', priorityQueue: ['(0,A)'], fixed: [] }, active: ['A'], accepted: [], priorityQueue: ['(0,A)'], distances: { A: 0, B: '∞', C: '∞', D: '∞', E: '∞', F: '∞' } },
  { title: '取出目前最小的 A', explanation: 'heap top 是 (0,A)。取出後 d 等於 dist[A]，不是過期資訊；A 因而成為第一個距離確定的節點。', codeLine: 'auto [d, u] = pq.top();', codeLines: [7,8,9,10], state: { current: '(0,A)', decision: 'fresh entry', priorityQueue: [], fixed: ['A'] }, active: ['A'], accepted: ['A'], priorityQueue: [], distances: { A: 0, B: '∞', C: '∞', D: '∞', E: '∞', F: '∞' } },
  { title: '鬆弛邊 A → B', explanation: '經過 A 到 B 的候選距離是 0+4=4，小於 INF，因此更新 dist[B]=4，並把 (4,B) 加入 heap。', codeLine: 'if (d + w < dist[v]) {', codeLines: [11,12,13,14], state: { edge: 'A → B (4)', comparison: '0 + 4 < ∞', update: 'B: ∞ → 4' }, active: ['A','B'], accepted: ['A'], priorityQueue: ['(4,B)'], distances: { A: 0, B: 4, C: '∞', D: '∞', E: '∞', F: '∞' } },
  { title: '鬆弛邊 A → C', explanation: 'A 到 C 的候選距離是 0+2=2，小於 INF。更新 dist[C]=2 並 push (2,C)；heap 依距離排序。', codeLine: 'pq.push({dist[v], v});', codeLines: [12,13,14], state: { edge: 'A → C (2)', update: 'C: ∞ → 2', priorityQueue: ['(2,C)','(4,B)'] }, active: ['A','C'], accepted: ['A'], priorityQueue: ['(2,C)','(4,B)'], distances: { A: 0, B: 4, C: 2, D: '∞', E: '∞', F: '∞' } },
  { title: '取出距離最小的 C', explanation: 'heap top 是 (2,C)，小於 (4,B)。它與 dist[C] 相同，因此 C 的最短距離 2 被確定。', codeLine: 'pq.pop();', codeLines: [8,9,10], state: { current: '(2,C)', decision: 'fresh entry', priorityQueue: ['(4,B)'] }, active: ['C'], accepted: ['A','C'], priorityQueue: ['(4,B)'], distances: { A: 0, B: 4, C: 2, D: '∞', E: '∞', F: '∞' } },
  { title: 'C 提供更短的 B 路徑', explanation: '經 C 到 B 的候選距離是 2+1=3，小於目前的 4。更新 dist[B]=3 並加入 (3,B)；舊的 (4,B) 暫時留在 heap。', codeLine: 'dist[v] = d + w;', codeLines: [11,12,13,14], state: { edge: 'C → B (1)', comparison: '2 + 1 < 4', update: 'B: 4 → 3' }, active: ['C','B'], accepted: ['A','C'], priorityQueue: ['(3,B)','(4,B) stale'], distances: { A: 0, B: 3, C: 2, D: '∞', E: '∞', F: '∞' } },
  { title: '由 C 第一次到達 E', explanation: '經 C 到 E 的候選距離是 2+4=6，小於 INF。設定 dist[E]=6，並把 (6,E) 推入 heap。', codeLine: 'pq.push({dist[v], v});', codeLines: [11,12,13,14], state: { edge: 'C → E (4)', update: 'E: ∞ → 6', priorityQueue: ['(3,B)','(4,B) stale','(6,E)'] }, active: ['C','E'], accepted: ['A','C'], priorityQueue: ['(3,B)','(4,B) stale','(6,E)'], distances: { A: 0, B: 3, C: 2, D: '∞', E: 6, F: '∞' } },
  { title: '取出最新的 B', explanation: 'heap top (3,B) 與 dist[B]=3 相同，所以這是最新項目。B 的最短距離現在被確定。', codeLine: 'if (d != dist[u]) continue;', codeLines: [8,9,10], state: { current: '(3,B)', decision: 'fresh entry', fixed: ['A','C','B'] }, active: ['B'], accepted: ['A','B','C'], priorityQueue: ['(4,B) stale','(6,E)'], distances: { A: 0, B: 3, C: 2, D: '∞', E: 6, F: '∞' } },
  { title: '由 B 第一次到達 D', explanation: '候選距離是 dist[B]+5=8，小於 INF，因此設定 dist[D]=8 並 push (8,D)。', codeLine: 'dist[v] = d + w;', codeLines: [11,12,13,14], state: { edge: 'B → D (5)', update: 'D: ∞ → 8', priorityQueue: ['(4,B) stale','(6,E)','(8,D)'] }, active: ['B','D'], accepted: ['A','B','C'], priorityQueue: ['(4,B) stale','(6,E)','(8,D)'], distances: { A: 0, B: 3, C: 2, D: 8, E: 6, F: '∞' } },
  { title: '略過 B 的過期項目', explanation: '接著 pop (4,B)，但 dist[B] 已經是 3。因為 d≠dist[B]，這筆舊資訊直接 continue，不會再次掃描 B 的邊。', codeLine: 'if (d != dist[u]) continue;', codeLines: [8,9,10], state: { current: '(4,B)', decision: '4 ≠ dist[B]=3 → stale', priorityQueue: ['(6,E)','(8,D)'] }, active: ['B'], accepted: ['A','B','C'], priorityQueue: ['(6,E)','(8,D)'], distances: { A: 0, B: 3, C: 2, D: 8, E: 6, F: '∞' } },
  { title: '取出 E 並確定距離 6', explanation: 'heap top 是最新的 (6,E)，因此 E 的最短距離確定為 6。接下來檢查 E→D 與 E→F。', codeLine: 'auto [d, u] = pq.top();', codeLines: [8,9,10,11], state: { current: '(6,E)', decision: 'fresh entry', fixed: ['A','C','B','E'] }, active: ['E'], accepted: ['A','B','C','E'], priorityQueue: ['(8,D)'], distances: { A: 0, B: 3, C: 2, D: 8, E: 6, F: '∞' } },
  { title: 'E 改善 D 的距離', explanation: '經 E 到 D 的候選距離是 6+1=7，小於原本的 8。更新 dist[D]=7 並 push (7,D)，舊的 (8,D) 成為過期項目。', codeLine: 'dist[v] = d + w;', codeLines: [11,12,13,14], state: { edge: 'E → D (1)', comparison: '6 + 1 < 8', update: 'D: 8 → 7' }, active: ['E','D'], accepted: ['A','B','C','E'], priorityQueue: ['(7,D)','(8,D) stale'], distances: { A: 0, B: 3, C: 2, D: 7, E: 6, F: '∞' } },
  { title: 'E 提供第一條到 F 的路徑', explanation: '經 E 到 F 的候選距離是 6+7=13，小於 INF。設定 dist[F]=13，並 push (13,F)。', codeLine: 'pq.push({dist[v], v});', codeLines: [11,12,13,14], state: { edge: 'E → F (7)', update: 'F: ∞ → 13', priorityQueue: ['(7,D)','(8,D) stale','(13,F)'] }, active: ['E','F'], accepted: ['A','B','C','E'], priorityQueue: ['(7,D)','(8,D) stale','(13,F)'], distances: { A: 0, B: 3, C: 2, D: 7, E: 6, F: 13 } },
  { title: '取出 D 並確定距離 7', explanation: '最新的 (7,D) 位於 heap top，與 dist[D] 相同。D 的最短距離確定，舊的 (8,D) 留待之後略過。', codeLine: 'if (d != dist[u]) continue;', codeLines: [8,9,10], state: { current: '(7,D)', decision: 'fresh entry', fixed: ['A','C','B','E','D'] }, active: ['D'], accepted: ['A','B','C','D','E'], priorityQueue: ['(8,D) stale','(13,F)'], distances: { A: 0, B: 3, C: 2, D: 7, E: 6, F: 13 } },
  { title: 'D 把 F 改善為 10', explanation: '經 D 到 F 的候選距離是 7+3=10，小於 13。更新 dist[F]=10 並 push (10,F)，原本的 (13,F) 變成過期項目。', codeLine: 'dist[v] = d + w;', codeLines: [11,12,13,14], state: { edge: 'D → F (3)', comparison: '7 + 3 < 13', update: 'F: 13 → 10' }, active: ['D','F'], accepted: ['A','B','C','D','E'], priorityQueue: ['(8,D) stale','(10,F)','(13,F) stale'], distances: { A: 0, B: 3, C: 2, D: 7, E: 6, F: 10 } },
  { title: 'Heap 清空，所有最短距離完成', explanation: '略過 (8,D)，取出最新的 (10,F)，再略過 (13,F)。答案為 A0、C2、B3、E6、D7、F10，複雜度 O((V+E) log V)。', codeLine: '}', codeLines: [8,9,10,17,18], state: { result: 'A0 · B3 · C2 · D7 · E6 · F10', proof: 'nonnegative weights + fresh heap minimum', priorityQueue: [] }, active: [], accepted: ['A','B','C','D','E','F'], priorityQueue: [], distances: { A: 0, B: 3, C: 2, D: 7, E: 6, F: 10 } },
]

const geometryPoints: Point[] = [
  { id: 'P1', x: 12, y: 70, label: '1' }, { id: 'P2', x: 20, y: 28, label: '2' },
  { id: 'P3', x: 40, y: 48, label: '3' }, { id: 'P4', x: 50, y: 16, label: '4' },
  { id: 'P5', x: 62, y: 62, label: '5' }, { id: 'P6', x: 80, y: 24, label: '6' },
  { id: 'P7', x: 90, y: 70, label: '7' }, { id: 'P8', x: 44, y: 82, label: '8' },
]
const hullFrames: Frame[] = [
  { title: '依字典序排序', explanation: '先按 x、再按 y 排序。最左與最右的極端點必定位於凸包，排序也讓上下鏈可以單向掃描。', codeLine: 'sort(p.begin(), p.end());', codeLines: [2], state: { order: ['P1','P2','P3','P8','P4','P5','P6','P7'], lowerStack: ['P1'] }, active: ['P1'], hull: ['P1'] },
  { title: '維持下凸包左轉不變量', explanation: '依序加入點。lower 中任意連續三點必須嚴格逆時針；cross>0 表示左轉，因此目前候選可保留。', codeLine: 'lower.push_back(p);', codeLines: [4,5,7], state: { lowerStack: ['P1','P2','P4'], cross: '+840', decision: 'push P4' }, active: ['P1','P2','P4'], hull: ['P1','P2','P4'] },
  { title: '遇到非左轉就移除中點', explanation: '新點使最後三點 cross≤0，表示右轉或共線。中央點位於新線段內側，不可能成為最外層邊界，因此 pop。', codeLine: 'lower.pop_back();', codeLines: [5,6,7,8], state: { lowerStack: ['P1','P2','P4','P6'], cross: '-520', decision: 'pop interior point' }, active: ['P2','P4','P6'], hull: ['P1','P2','P4','P6'] },
  { title: '完成由左至右的下鏈', explanation: '掃描至最右點後，lower 的每個轉向都為左轉，得到凸包的下半部。', codeLine: 'for (Point p : points)', codeLines: [4,5,6,7], state: { lowerStack: ['P1','P2','P4','P6','P7'], invariant: 'all cross > 0' }, active: ['P7'], hull: ['P1','P2','P4','P6','P7'] },
  { title: '反向建立上鏈', explanation: '從右向左套用相同的左轉規則，得到上半部；端點會同時出現在兩條鏈。', codeLine: 'reverse(points.begin(), points.end());', codeLines: [9,10], state: { upperStack: ['P7','P8','P1'], direction: 'right → left' }, active: ['P7','P8'], hull: ['P1','P2','P4','P6','P7','P8'] },
  { title: '移除重複端點並合併', explanation: '刪除上下鏈各自重複的首尾端點後串接。P3、P5 位於外殼內側，所以不在最終凸包。總成本由排序主導為 O(n log n)。', codeLine: 'lower.insert(lower.end(), upper.begin(), upper.end());', codeLines: [11,12,13], state: { hull: ['P1','P2','P4','P6','P7','P8'], removed: ['P3','P5'] }, active: [], accepted: ['P1','P2','P4','P6','P7','P8'], muted: ['P3','P5'], hull: ['P1','P2','P4','P6','P7','P8'] },
]

const hullGuidedFrames: Frame[] = [
  { title: '把所有點想成釘子', explanation: '凸包是能包住所有點的最小凸多邊形，就像橡皮筋繃在最外層釘子上。內部點最後不會出現在邊界。', codeLine: 'vector<Point> convexHull(vector<Point> p) {', codeLines: [1], state: { goal: 'minimum convex boundary', points: 'P1…P8', invariant: 'processed points stay inside boundary' }, active: ['P1','P2','P3','P4','P5','P6','P7','P8'], hull: [] },
  { title: '依 x、再依 y 排序', explanation: '排序結果是 P1、P2、P3、P8、P4、P5、P6、P7。最左與最右的極端點一定在凸包上，排序讓我們能單向掃描。', codeLine: 'sort(p.begin(), p.end());', codeLines: [2], state: { order: ['P1','P2','P3','P8','P4','P5','P6','P7'], operation: 'lexicographic sort', guarantee: 'extreme points are on hull' }, active: ['P1','P7'], hull: ['P1'] },
  { title: '下凸包先放入 P1', explanation: 'lower stack 從最左點 P1 開始。尚未形成轉角，因此直接保留。', codeLine: 'lower.push_back(x);', codeLines: [3,4,8], state: { lowerStack: ['P1'], operation: 'push P1', direction: 'left → right' }, active: ['P1'], hull: ['P1'] },
  { title: '第二個點 P2 也直接加入', explanation: '只有兩個點時仍無法判斷左轉或右轉，所以把 P2 推入 lower，形成第一條候選邊。', codeLine: 'lower.push_back(x);', codeLines: [4,8], state: { lowerStack: ['P1','P2'], operation: 'push P2', turn: 'not enough points' }, active: ['P1','P2'], hull: ['P1','P2'] },
  { title: 'P3 形成左轉，保留', explanation: 'cross(P1,P2,P3)=1000>0，表示從 P1→P2 轉向 P3 是逆時針左轉，符合下凸包不變量，因此 push P3。', codeLine: 'lower.push_back(x);', codeLines: [5,6,8], state: { triple: 'P1, P2, P3', cross: 1000, decision: 'left turn → push P3' }, active: ['P1','P2','P3'], hull: ['P1','P2','P3'] },
  { title: 'P8 仍形成左轉', explanation: 'cross(P2,P3,P8)=600>0，lower 的最後三點仍為嚴格左轉，因此 P8 暫時可以留在邊界候選。', codeLine: 'lower.push_back(x);', codeLines: [5,6,8], state: { triple: 'P2, P3, P8', cross: 600, decision: 'left turn → push P8' }, active: ['P2','P3','P8'], hull: ['P1','P2','P3','P8'] },
  { title: '加入 P4 時先移除 P8', explanation: 'cross(P3,P8,P4)=−468≤0，表示右轉。P8 位於新邊 P3→P4 的內側，不可能是下凸包點，因此 pop P8。', codeLine: 'lower.pop_back();', codeLines: [5,6], state: { triple: 'P3, P8, P4', cross: -468, decision: 'right turn → pop P8' }, active: ['P3','P8','P4'], muted: ['P8'], hull: ['P1','P2','P3'] },
  { title: 'P4 使 P3 也成為內部點', explanation: 'pop 後重新檢查 cross(P2,P3,P4)=−840≤0，所以 P3 也必須移除。接著 cross(P1,P2,P4)>0，P4 才能加入。', codeLine: 'lower.pop_back();', codeLines: [5,6,7,8], state: { triple: 'P2, P3, P4', cross: -840, decision: 'pop P3; then push P4' }, active: ['P2','P3','P4'], muted: ['P3','P8'], hull: ['P1','P2','P4'] },
  { title: 'P5 形成左轉並加入', explanation: 'cross(P2,P4,P5)=1524>0，因此 P5 目前位於合法的下邊界方向，直接 push。', codeLine: 'lower.push_back(x);', codeLines: [4,5,7], state: { triple: 'P2, P4, P5', cross: 1524, decision: 'left turn → push P5' }, active: ['P2','P4','P5'], muted: ['P3','P8'], hull: ['P1','P2','P4','P5'] },
  { title: 'P6 讓 P5 被淘汰', explanation: 'cross(P4,P5,P6)=−1284≤0，所以 P5 位於新邊內側。pop P5 後，cross(P2,P4,P6)=600>0，故 push P6。', codeLine: 'lower.pop_back();', codeLines: [5,6,7], state: { triple: 'P4, P5, P6', cross: -1284, decision: 'pop P5; push P6' }, active: ['P4','P5','P6'], muted: ['P3','P5','P8'], hull: ['P1','P2','P4','P6'] },
  { title: 'P7 完成下凸包', explanation: 'cross(P4,P6,P7)=1300>0，加入最右點 P7。下凸包最後是 P1→P2→P4→P6→P7。', codeLine: 'lower.push_back(x);', codeLines: [4,5,6,7,8], state: { lowerStack: ['P1','P2','P4','P6','P7'], cross: 1300, result: 'lower hull complete' }, active: ['P4','P6','P7'], muted: ['P3','P5','P8'], hull: ['P1','P2','P4','P6','P7'] },
  { title: '反向掃描建立上凸包', explanation: '將排序順序反轉，從 P7 往 P1 套用完全相同的左轉規則。這樣得到凸包的上半部。', codeLine: 'reverse(p.begin(), p.end());', codeLines: [10,11], state: { direction: 'right → left', upperStack: ['P7'], operation: 'start upper hull' }, active: ['P7'], hull: ['P1','P2','P4','P6','P7'] },
  { title: '上凸包初期移除 P6', explanation: '先放 P7、P6；看到 P5 時 cross(P7,P6,P5)<0，因此 P6 對上凸包是內部點，pop 後保留 P5。', codeLine: 'upper.pop_back();', codeLines: [12,13,14,15], state: { triple: 'P7, P6, P5', cross: -1208, decision: 'pop P6; push P5' }, active: ['P7','P6','P5'], hull: ['P7','P5'] },
  { title: 'P8 淘汰 P4 與 P5', explanation: '掃到 P8 時，最後轉向連續不是左轉，因此依序 pop P4、P5，再把 P8 加入；上凸包變成 P7→P8。', codeLine: 'upper.pop_back();', codeLines: [12,13,14,15], state: { upperStack: ['P7','P8'], operation: 'pop P4, P5; push P8', invariant: 'all turns are left' }, active: ['P7','P8'], muted: ['P4','P5'], hull: ['P7','P8'] },
  { title: 'P2 使 P3 離開上凸包', explanation: 'P3 曾暫時加入，但新點 P2 使最後三點不是左轉，所以 pop P3；重新檢查後 P2 可以暫留。', codeLine: 'upper.pop_back();', codeLines: [12,13,14,15], state: { triple: 'P8, P3, P2', cross: -600, decision: 'pop P3; push P2' }, active: ['P8','P3','P2'], muted: ['P3'], hull: ['P7','P8','P2'] },
  { title: '最左點 P1 完成上凸包', explanation: '加入 P1 時 P2 形成非左轉，因此 pop P2；剩下 P7→P8→P1，這就是上凸包。', codeLine: 'upper.pop_back();', codeLines: [12,13,14,15], state: { upperStack: ['P7','P8','P1'], operation: 'pop P2; push P1', result: 'upper hull complete' }, active: ['P7','P8','P1'], muted: ['P2','P3','P4','P5','P6'], hull: ['P7','P8','P1'] },
  { title: '移除上下鏈重複端點', explanation: 'P1、P7 同時出現在上下凸包。合併前各自移除一個重複端點，避免結果中同一點出現兩次。', codeLine: 'lower.pop_back();', codeLines: [17,18], state: { duplicates: ['P1','P7'], operation: 'remove repeated endpoints', status: 'ready to concatenate' }, active: ['P1','P7'], hull: ['P1','P2','P4','P6','P7','P8'] },
  { title: '合併得到逆時針凸包', explanation: '串接下鏈與上鏈，得到 P1、P2、P4、P6、P7、P8。P3、P5 在內部；排序主導總複雜度 O(n log n)。', codeLine: 'lower.insert(lower.end(), upper.begin(), upper.end());', codeLines: [19,20], state: { result: ['P1','P2','P4','P6','P7','P8'], removed: ['P3','P5'], proof: 'every boundary turn is counterclockwise' }, active: [], accepted: ['P1','P2','P4','P6','P7','P8'], muted: ['P3','P5'], hull: ['P1','P2','P4','P6','P7','P8'] },
]

const segmentValues = [2, 5, 1, 4, 9, 3, 7, 6]
const segmentNodes = buildTree(segmentValues)
const makeSegmentStep = (id: string, kind: NonNullable<Frame['segmentStep']>['kind'], active: string[], accepted: string[], title: string, explanation: string, runningTotal = 0) => {
  const statuses = Object.fromEntries(segmentNodes.map((node) => [node.id, accepted.includes(node.id) ? 'accepted' : active.includes(node.id) ? 'active' : 'idle'])) as NonNullable<Frame['segmentStep']>['statuses']
  return { id, kind, activeId: active.at(-1), statuses, returnedValues: {}, runningTotal, title, explanation }
}
const queryTrace = createQueryTrace(segmentValues, 1, 5).filter((step) => step.kind !== 'visit')
const selectedQueryTrace = [queryTrace[0], queryTrace[1], queryTrace[3], queryTrace[5], queryTrace[7], queryTrace[10], queryTrace.at(-2)!, queryTrace.at(-1)!].filter(Boolean)
const updatedSegmentValues = [2, 5, 1, 4, 10, 3, 7, 6]
const segmentBuildFrames: Frame[] = [
  { title:'01 · 先定義每個節點的責任', explanation:'SegmentTree 物件保存 n 與 tree。節點 node 代表固定閉區間 [l,r]，值是該區間總和；左右孩子分別代表 [l,mid] 與 [mid+1,r]。', codeLine:'struct SegmentTree {', codeLines:[1,2,3], state:{phaseName:'build',operationType:'structure',nodeMeaning:'tree[node] = sum of [l,r]'}, segmentStep:makeSegmentStep('build-structure','start',['0-7'],[],'定義節點區間','根節點先代表完整陣列') },
  { title:'02 · 配置 Tree 並呼叫 Build', explanation:'建構子先配置約 4n 個位置，再以 build(1,0,n−1,a) 從根開始。空陣列不進入遞迴，避免出現 [0,−1]。', codeLine:'if (n) build(1, 0, n - 1, a);', codeLines:[4,5], state:{phaseName:'build',operationType:'initialize',n:8,storage:'4n',rootInterval:'[0,7]'}, segmentStep:makeSegmentStep('build-init','start',['0-7'],[],'配置並開始建樹','root=[0,7]') },
  { title:'03 · 遞迴拆到單點葉節點', explanation:'只要 l<r，就用 mid 把區間拆成兩半。每次區間長度至少減半，最後一定到達 l=r 的葉節點。', codeLine:'int mid = l + (r - l) / 2;', codeLines:[7,9,10,11], state:{phaseName:'build',operationType:'split',interval:'[0,7] → [0,3] + [4,7]',invariant:'children are disjoint and cover parent'}, segmentStep:makeSegmentStep('build-split','partial',['0-7','0-3','4-7'],[],'拆分區間','左右孩子互斥且聯集等於父區間') },
  { title:'04 · 第一個葉節點讀原陣列', explanation:'遞迴到 [0,0] 時 l=r，tree[node]=a[0]=2。其他節點仍未寫入；接著會以相同方式處理其餘葉節點。', codeLine:'tree[node] = a[l];', codeLines:[8], state:{phaseName:'build',operationType:'write leaf',leaf:'[0,0]',value:2}, segmentStep:makeSegmentStep('build-leaves','accept',['0-0'],['0-0'],'寫入第一個葉節點','[0,0] = 2') },
  { title:'05 · 由孩子向上 Pull', explanation:'再寫入 [1,1]=5 後，父節點 [0,1] 以 2+5=7 重算。其餘子樹隨遞迴陸續建好；尚未計算的節點不顯示總和。', codeLine:'tree[node] = tree[node * 2] + tree[node * 2 + 1];', codeLines:[12], state:{phaseName:'build',operationType:'pull',example:'[0,1] = 2 + 5 = 7'}, segmentStep:makeSegmentStep('build-pull','return',['0-1'],['0-0','1-1','0-1'],'合併孩子','父節點等於左右子節點總和',7) },
  { title:'06 · Build 完成，根保存總和 37', explanation:'所有內部節點都已由葉節點向上合併，根節點 [0,7] 保存 37。建樹拜訪每個節點一次，因此時間與記憶體都是 O(n)。', codeLine:'tree[node] = tree[node * 2] + tree[node * 2 + 1];', codeLines:[12,13], state:{phaseName:'build',operationType:'build complete',rootSum:37,complexity:'O(n)'}, segmentStep:makeSegmentStep('build-complete','complete',['0-7'],segmentNodes.map((node)=>node.id),'建樹完成','所有節點值已可供 query 使用',37) },
]
const segmentQueryFrames: Frame[] = selectedQueryTrace.map((step, index) => ({
  title: `${String(index + 7).padStart(2, '0')} · Query：${step.title}`,
  explanation: `${step.explanation} 查詢只會使用 build 已建立的節點摘要；三種情況「相離、包含、部分重疊」互斥且完備，因此不重算也不漏算。`,
  codeLine: step.kind === 'accept' ? 'return tree[node]' : step.kind === 'return' ? 'return left + right' : 'query(node, left, right)',
  codeLines: step.kind === 'accept' ? [16] : step.kind === 'ignore' ? [15] : step.kind === 'return' || step.kind === 'complete' ? [20] : step.kind === 'partial' ? [17,18,19] : [14,22],
  state: { phaseName:'query', operationType:'range query', activeInterval: step.activeId ?? 'root', query:'[1,5]', runningTotal: step.runningTotal, event: step.kind },
  segmentStep: step,
}))
const updatePath = ['0-7','4-7','4-5','4-4']
const segmentUpdateFrames: Frame[] = [
  { title:'15 · Update 從根定位索引 4', explanation:'呼叫 update(4,10)。每層比較 index 與 mid，只進入包含索引 4 的孩子；其他子樹完全不需要改動。', codeLine:'if (index <= mid)', codeLines:[23,25,26,27], state:{phaseName:'update',operationType:'point update',index:4,value:'9 → 10',path:updatePath}, values:segmentValues, segmentStep:makeSegmentStep('update-descend','partial',updatePath,[],'沿唯一分支下降','只有包含 index=4 的節點會被修改') },
  { title:'16 · 到達葉節點並覆寫新值', explanation:'遞迴到 [4,4] 時 l=r，將 tree[node] 從 9 改成 10 後返回。這是 update 唯一直接讀取新值的位置。', codeLine:'tree[node] = value;', codeLines:[24], state:{phaseName:'update',operationType:'write leaf',leaf:'[4,4]',value:'9 → 10'}, values:updatedSegmentValues, segmentStep:makeSegmentStep('update-leaf','accept',['4-4'],['4-4'],'更新葉節點','a[4] 現在是 10',10) },
  { title:'17 · Pull 第一個祖先 [4,5]', explanation:'葉節點返回後，以左右孩子重算 [4,5]：10+3=13。兄弟 [5,5] 沒有改變，但它仍是重算父節點所需的資料。', codeLine:'tree[node] = tree[node * 2] + tree[node * 2 + 1];', codeLines:[28], state:{phaseName:'update',operationType:'pull',interval:'[4,5]',sum:'12 → 13'}, values:updatedSegmentValues, segmentStep:makeSegmentStep('update-pull-1','return',['4-5'],['4-4','5-5','4-5'],'重算局部祖先','[4,5] = 10 + 3 = 13',13) },
  { title:'18 · 沿路 Pull 回根節點', explanation:'依序重算 [4,7] 與 [0,7]，根總和從 37 變成 38。只有 O(log n) 個祖先被寫入。', codeLine:'tree[node] = tree[node * 2] + tree[node * 2 + 1];', codeLines:[28,29,30], state:{phaseName:'update',operationType:'pull to root',rootSum:'37 → 38',complexity:'O(log n)'}, values:updatedSegmentValues, segmentStep:makeSegmentStep('update-pull-root','return',['0-7'],updatePath,'更新所有祖先','根節點現在保存 38',38) },
  { title:'19 · 再次 Query 會讀到新答案', explanation:'update 已維持「每個父節點等於左右孩子合併」的不變量，因此後續任何 query 都會使用更新後的 10，而不會讀到舊值 9。', codeLine:'long long query(int l, int r) const', codeLines:[22], state:{phaseName:'verify',operationType:'query after update',invariant:'every node equals merge(children)'}, values:updatedSegmentValues, segmentStep:makeSegmentStep('update-verify','complete',['0-7'],segmentNodes.map((node)=>node.id),'驗證更新後結構','build → query → update 共享同一個節點 invariant',38) },
  { title:'20 · 完整 lifecycle 已閉合', explanation:'Build 建立所有節點；Query 只讀取並合併互斥節點；Update 改葉節點後 Pull 回根。三個操作共用同一個區間定義與合併規則。', codeLine:'void update(int index, long long value)', codeLines:[30,31], state:{phaseName:'verify',operationType:'lifecycle complete',result:'build O(n) · query O(log n) · update O(log n)'}, values:updatedSegmentValues, segmentStep:makeSegmentStep('lifecycle-complete','complete',['0-7'],segmentNodes.map((node)=>node.id),'完整操作關係','build → query → update',38) },
]
const initialNodeValues = Object.fromEntries(segmentNodes.map((node) => [node.id, node.sum]))
const updatedNodeValues = Object.fromEntries(buildTree(updatedSegmentValues).map((node) => [node.id, node.sum]))
const segmentSnapshots: Record<string, Record<string, number>> = {
  'build-structure': {}, 'build-init': {}, 'build-split': {},
  'build-leaves': { '0-0': initialNodeValues['0-0'] },
  'build-pull': { '0-0': initialNodeValues['0-0'], '1-1': initialNodeValues['1-1'], '0-1': initialNodeValues['0-1'] },
  'update-descend': initialNodeValues,
  'update-leaf': { ...initialNodeValues, '4-4': updatedNodeValues['4-4'] },
  'update-pull-1': { ...initialNodeValues, '4-4': updatedNodeValues['4-4'], '4-5': updatedNodeValues['4-5'] },
  'update-pull-root': updatedNodeValues, 'update-verify': updatedNodeValues, 'lifecycle-complete': updatedNodeValues,
}
const segmentFrames: Frame[] = [...segmentBuildFrames, ...segmentQueryFrames, ...segmentUpdateFrames].map((frame) => ({
  ...frame,
  segmentNodeValues: segmentSnapshots[frame.segmentStep!.id] ?? initialNodeValues,
}))

const binaryCode = [
  'int binarySearch(const vector<int>& a, int target) {',
  '  int low = 0;',
  '  int high = static_cast<int>(a.size()) - 1;',
  '  while (low <= high) {',
  '    int mid = low + (high - low) / 2;',
  '    if (a[mid] == target) {',
  '      return mid;',
  '    }',
  '    if (a[mid] < target) {',
  '      low = mid + 1;',
  '    } else {',
  '      high = mid - 1;',
  '    }',
  '  }',
  '  return -1;',
  '}',
]
const bfsCode = [
  'vector<int> bfs(const vector<vector<int>>& adj, int source) {',
  '  int n = static_cast<int>(adj.size());',
  '  vector<int> dist(n, -1);',
  '  queue<int> q;',
  '  dist[source] = 0;',
  '  q.push(source);',
  '  while (!q.empty()) {',
  '    int u = q.front();',
  '    q.pop();',
  '    for (int v : adj[u]) {',
  '      if (dist[v] != -1) {',
  '        continue;',
  '      }',
  '      dist[v] = dist[u] + 1;',
  '      q.push(v);',
  '    }',
  '  }',
  '  return dist;',
  '}',
]
const dijkstraCode = [
  'void dijkstra(int source) {', '  using State = pair<long long, int>;', '  priority_queue<State, vector<State>, greater<State>> pq;',
  '  dist.assign(graph.size(), INF);', '  dist[source] = 0;', '  pq.push({0, source});', '  while (!pq.empty()) {',
  '    auto [d, u] = pq.top();', '    pq.pop();', '    if (d != dist[u]) continue;', '    for (auto [v, w] : graph[u]) {',
  '      if (d + w < dist[v]) {', '        dist[v] = d + w;', '        pq.push({dist[v], v});', '      }', '    }', '  }', '}',
]
const segmentCode = [
  'struct SegmentTree {',
  '  int n;',
  '  vector<long long> tree;',
  '  explicit SegmentTree(const vector<long long>& a) : n(a.size()), tree(4 * max(1, n), 0) {',
  '    if (n) build(1, 0, n - 1, a);',
  '  }',
  '  void build(int node, int l, int r, const vector<long long>& a) {',
  '    if (l == r) { tree[node] = a[l]; return; }',
  '    int mid = l + (r - l) / 2;',
  '    build(node * 2, l, mid, a);',
  '    build(node * 2 + 1, mid + 1, r, a);',
  '    tree[node] = tree[node * 2] + tree[node * 2 + 1];',
  '  }',
  '  long long query(int node, int l, int r, int ql, int qr) const {',
  '    if (r < ql || qr < l) return 0;',
  '    if (ql <= l && r <= qr) return tree[node];',
  '    int mid = l + (r - l) / 2;',
  '    long long left = query(node * 2, l, mid, ql, qr);',
  '    long long right = query(node * 2 + 1, mid + 1, r, ql, qr);',
  '    return left + right;',
  '  }',
  '  long long query(int l, int r) const { return n ? query(1, 0, n - 1, l, r) : 0; }',
  '  void update(int node, int l, int r, int index, long long value) {',
  '    if (l == r) { tree[node] = value; return; }',
  '    int mid = l + (r - l) / 2;',
  '    if (index <= mid) update(node * 2, l, mid, index, value);',
  '    else update(node * 2 + 1, mid + 1, r, index, value);',
  '    tree[node] = tree[node * 2] + tree[node * 2 + 1];',
  '  }',
  '  void update(int index, long long value) { if (n) update(1, 0, n - 1, index, value); }',
  '};',
]
const hullCode = [
  'vector<Point> convexHull(vector<Point> p) {',
  '  sort(p.begin(), p.end());',
  '  vector<Point> lower, upper;',
  '  for (Point x : p) {',
  '    while (lower.size() >= 2 &&',
  '           cross(lower.end()[-2], lower.back(), x) <= 0)',
  '      lower.pop_back();',
  '    lower.push_back(x);',
  '  }',
  '  reverse(p.begin(), p.end());',
  '  for (Point x : p) {',
  '    while (upper.size() >= 2 &&',
  '           cross(upper.end()[-2], upper.back(), x) <= 0)',
  '      upper.pop_back();',
  '    upper.push_back(x);',
  '  }',
  '  lower.pop_back();',
  '  upper.pop_back();',
  '  lower.insert(lower.end(), upper.begin(), upper.end());',
  '  return lower;',
  '}',
]

const coreLessons: AlgorithmLesson[] = [
  { id: 'binary-search', index: '01', category: 'SEARCH', categoryId: 'search-sort', subcategory: '單調性搜尋', title: 'Binary Search', zhTitle: '二分搜尋', description: '維持答案區間不變量，每次安全排除一半。', complexity: 'O(log n)', accent: '#78d8ff', visual: 'array', animationVersion: 2, sources: [{ label: 'USACO', title: 'Binary Search · USACO Guide', url: 'https://usaco.guide/silver/binary-search?lang=cpp' }], frames: binaryFrames, code: binaryCode },
  { id: 'bfs', index: '02', category: 'GRAPH', categoryId: 'graph', subcategory: '圖的遍歷', title: 'Breadth-First Search', zhTitle: '廣度優先搜尋', description: '用 FIFO queue 按邊數距離逐層探索。', complexity: 'O(V + E)', accent: '#a994ff', visual: 'graph', animationVersion: 2, sources: [{ label: '你的教材', title: 'CPPBook · Graph（遍歷）', url: 'https://pingchungchang.github.io/CPPBook/lectures/graph/' }], frames: bfsFrames, points: graphPoints, edges: bfsEdges, code: bfsCode },
  { id: 'dijkstra', index: '03', category: 'SHORTEST PATH', categoryId: 'graph', subcategory: '最短路徑', title: 'Dijkstra', zhTitle: '戴克斯特拉最短路', description: '以 min-priority queue 取出最小暫定距離並鬆弛邊。', complexity: 'O((V+E) log V)', accent: '#ffca78', visual: 'graph', animationVersion: 2, sources: [{ label: '你的模板', title: 'Notion · dijkstra', url: 'https://app.notion.com/p/2f492ab76d40803da59de7a94ad9097e' }, { label: '你的教材', title: 'CPPBook · Shortest Path', url: 'https://pingchungchang.github.io/CPPBook/lectures/shortest-path/' }], frames: dijkstraGuidedFrames, points: graphPoints, edges: weightedEdges, code: dijkstraCode },
  { id: 'segment-tree', index: '04', category: 'DATA STRUCTURE', categoryId: 'data-structures', subcategory: '區間資料結構', title: 'Segment Tree', zhTitle: '線段樹', description: '把查詢區間分解成互斥節點並合併答案。', complexity: 'O(log n)', accent: '#72e6b7', visual: 'segment-tree', animationVersion: 2, sources: [{ label: '你的模板', title: 'Notion · SEG TREE 完整模板', url: 'https://app.notion.com/p/33492ab76d408041bdccfa3f6d6ab70e' }], frames: segmentFrames, code: segmentCode },
  { id: 'convex-hull', index: '05', category: 'GEOMETRY', categoryId: 'geometry', subcategory: '凸包', title: 'Convex Hull', zhTitle: 'Andrew 單調鏈凸包', description: '以外積維持左右轉不變量，建立上下凸鏈。', complexity: 'O(n log n)', accent: '#ff8fa8', visual: 'geometry', animationVersion: 2, sources: [{ label: '你的模板', title: 'Notion · Computational Geometry', url: 'https://app.notion.com/p/34e92ab76d4080219fd8f814ea96d6e3' }], frames: hullGuidedFrames, points: geometryPoints, code: hullCode },
]

const traceValue = (value: string | number | string[]) => {
  const text = Array.isArray(value) ? value.join(' · ') : String(value)
  return text || '∅'
}

const cppBookSourceByCategory: Record<CategoryId, { label: string; title: string; url: string }> = {
  'search-sort': { label: '你的教材', title: 'CPPBook · Divide and Conquer', url: 'https://pingchungchang.github.io/CPPBook/lectures/dc/' },
  'linear-structures': { label: '你的教材', title: 'CPPBook · STL', url: 'https://pingchungchang.github.io/CPPBook/lectures/stl/' },
  graph: { label: '你的教材', title: 'CPPBook · Graph', url: 'https://pingchungchang.github.io/CPPBook/lectures/graph/' },
  trees: { label: '你的教材', title: 'CPPBook · Tree', url: 'https://pingchungchang.github.io/CPPBook/lectures/tree1/' },
  'data-structures': { label: '你的教材', title: 'CPPBook · Data Structures', url: 'https://pingchungchang.github.io/CPPBook/lectures/ds1/' },
  'dynamic-programming': { label: '你的教材', title: 'CPPBook · Dynamic Programming', url: 'https://pingchungchang.github.io/CPPBook/lectures/dp/' },
  strings: { label: '你的教材', title: 'CPPBook · String', url: 'https://pingchungchang.github.io/CPPBook/lectures/string/' },
  'flow-matching': { label: '你的教材', title: 'CPPBook · Graph (2)', url: 'https://pingchungchang.github.io/CPPBook/lectures/graph2/' },
  mathematics: { label: '你的教材', title: 'CPPBook · Math', url: 'https://pingchungchang.github.io/CPPBook/lectures/math/' },
  geometry: { label: '你的教材', title: 'CPPBook · Computational Geometry', url: 'https://pingchungchang.github.io/CPPBook/lectures/computational-geometry/' },
  advanced: { label: '你的教材', title: 'CPPBook · OI', url: 'https://pingchungchang.github.io/CPPBook/lectures/oi/' },
}

const ensureGuidedLesson = (lesson: AlgorithmLesson): AlgorithmLesson => {
  const authoredExecution = lesson.animationVersion === 2
  return {
    ...lesson,
    animationVersion: 2,
    traceMode: lesson.traceMode ?? (authoredExecution ? 'execution' : 'semantic'),
    sources: lesson.sources?.length ? lesson.sources : [cppBookSourceByCategory[lesson.categoryId]],
    // Stage 4: never manufacture a fake 10–20 step timeline from code-line count.
    // Until a lesson receives a real execution trace, preserve its authored semantic
    // snapshots exactly as they are.
    frames: lesson.frames,
  }
}
const buildVisualTrace = (lesson: AlgorithmLesson, frame: Frame, step: number): VisualTrace => {
  if (frame.teaching) return {
    signature: `${lesson.id}:${step}:${frame.title}`, step, totalSteps: lesson.frames.length,
    phase: step === 0 ? 'prepare' : step === lesson.frames.length - 1 ? 'verify' : 'execute',
    nodes: [
      { label: '執行前', value: frame.teaching.before, role: 'input' },
      { label: '本步操作', value: frame.teaching.decision, role: 'operation' },
      { label: '執行後', value: frame.teaching.after, role: 'result' },
    ], focus: frame.active ?? [], activeCode: frame.codeLine,
  }
  const entries = Object.entries(frame.state ?? {})
  const ratio = lesson.frames.length <= 1 ? 1 : step / (lesson.frames.length - 1)
  const phase: VisualTrace['phase'] = ratio < .34 ? 'prepare' : ratio < .78 ? 'execute' : 'verify'
  const semanticEntries = entries.filter(([key]) => !['phase', 'status', 'algorithm', 'microStep', 'microPhase', 'timelineStep'].includes(key))
  const first = semanticEntries[0]
  const remainingEntries = semanticEntries.slice(1)
  const operation = remainingEntries.find(([key]) => /operation|transition|decision|update|edge|current|query|focus/i.test(key)) ?? remainingEntries[0]
  const resultCandidates = remainingEntries.filter((entry) => entry !== operation)
  const result = resultCandidates.find(([key]) => /result|answer|cost|distance|flow|matching|hull|sorted|component|status/i.test(key)) ?? resultCandidates.at(-1)
  const invariantValue = first ? traceValue(first[1]) : lesson.description
  const rawOperationValue = operation ? traceValue(operation[1]) : frame.codeLine
  const operationValue = rawOperationValue === invariantValue ? frame.codeLine : rawOperationValue
  const rawResultValue = result ? traceValue(result[1]) : frame.title
  const resultValue = [invariantValue, operationValue].includes(rawResultValue) ? frame.title : rawResultValue
  const nodes: VisualTraceNode[] = [
    { label: first?.[0] ?? 'invariant', value: invariantValue, role: 'invariant' },
    { label: operation?.[0] ?? 'active code', value: operationValue, role: 'operation' },
    { label: result?.[0] ?? 'outcome', value: resultValue, role: 'result' },
  ]
  return {
    signature: `${lesson.id}:${step}:${frame.title}`,
    step,
    totalSteps: lesson.frames.length,
    phase,
    nodes,
    focus: [...new Set([...(frame.active ?? []), ...(frame.accepted ?? []), ...(frame.queue ?? [])])],
    activeCode: frame.codeLine,
  }
}

const pedagogicalLessons: AlgorithmLesson[] = [...coreLessons, ...foundationLessons, ...graphTreeLessons, ...dataDpLessons, ...advancedLessons, ...completionLessons]
  .map(ensureGuidedLesson)
  .map(applyExecutionTraceOverride)
  .map(applyS2ExecutionOverride)
  .map(applyS3ExecutionOverride)
  .map(applyStudentLesson)
  .map(enrichLesson)
  .map(enrichPedagogy)
  .map((lesson) => ({ ...lesson, fidelity: lesson.traceMode === 'execution' ? 'concrete' as const : 'semantic' as const }))
  .map((lesson) => ({ ...lesson, frames: lesson.frames.map((frame, step) => ({ ...frame, trace: buildVisualTrace(lesson, frame, step) })) }))
  .map((lesson, index) => ({ ...lesson, index: String(index + 1).padStart(3, '0') }))

export const lessons: AlgorithmLesson[] = enrichKnowledgeCatalog(pedagogicalLessons)

export { segmentNodes, segmentValues }
