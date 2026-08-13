import { buildTree, createQueryTrace } from './segmentTree'
import { foundationLessons } from './foundationLessons'
import { graphTreeLessons } from './graphTreeLessons'
import { dataDpLessons } from './dataDpLessons'
import { advancedLessons } from './advancedLessons'
import { completionLessons } from './completionLessons'
import { enrichLesson, type PracticeProblem, type VisualModel } from './lessonMeta'
import { enrichPedagogy } from './pedagogy'

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
export interface BeginnerStep {
  observe: string
  action: string
  reason: string
  result: string
  codeMeaning: string
  pitfall?: string
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
  codeLines: number[]
  state?: Record<string, string | number | string[]>
  trace?: VisualTrace
  visualStep?: number
  visualProgress?: number
  beginner?: BeginnerStep
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
  visualModel?: VisualModel
  beginnerGuide?: BeginnerGuide
  codeGuide?: CodeGuideLine[]
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
  { title: '先確認可以使用二分搜尋', explanation: '輸入已由小到大排序。只有在這個前提下，看到中間值後才能確定整個左半或右半都不可能包含答案。目標值是 29。', codeLine: 'int binarySearch(vector<int>& a, int target) {', codeLines: [1], state: { target: 29, prerequisite: 'array is sorted', candidate: '[0, 8]' }, values: binaryValues, low: 0, high: 8 },
  { title: '建立搜尋區間', explanation: '令 low=0、high=8，使用包含兩端的閉區間 [low, high]。迴圈不變量是：如果 29 存在，它一定仍在這個區間裡。', codeLine: 'int low = 0, high = (int)a.size() - 1;', codeLines: [2], state: { target: 29, invariant: 'answer remains in [low, high]', candidate: '[0, 8]' }, values: binaryValues, low: 0, high: 8 },
  { title: '檢查區間是否還有候選', explanation: '目前 low=0、high=8，所以 low≤high 成立。區間不是空的，演算法可以安全進入第一次迭代。', codeLine: 'while (low <= high) {', codeLines: [3], state: { target: 29, condition: '0 ≤ 8 → true', candidate: '[0, 8]' }, values: binaryValues, low: 0, high: 8 },
  { title: '計算第一次中點', explanation: 'mid=0+(8−0)/2=4。使用 low+(high−low)/2 可避免 low+high 在大型整數範圍中溢位。', codeLine: 'int mid = low + (high - low) / 2;', codeLines: [4], state: { target: 29, calculation: 'mid = 0 + (8−0)/2 = 4', candidate: '[0, 8]' }, values: binaryValues, low: 0, high: 8, mid: 4, active: ['4'] },
  { title: '比較中間值與目標', explanation: '索引 4 的值是 22。因為 22<29，而且陣列遞增，所以索引 0 到 4 的值全部不可能等於 29。', codeLine: 'if (a[mid] < target)', codeLines: [5,7], state: { target: 29, comparison: 'a[4] = 22 < 29', decision: 'discard indices 0…4' }, values: binaryValues, low: 0, high: 8, mid: 4, active: ['4'] },
  { title: '把左界移到中點右側', explanation: '令 low=mid+1=5，排除 [0,4]。新的候選區間是 [5,8]；若答案存在，它仍在其中，因此不變量被維持。', codeLine: 'low = mid + 1;', codeLines: [8], state: { target: 29, update: 'low: 0 → 5', candidate: '[5, 8]' }, values: binaryValues, low: 5, high: 8, muted: ['0','1','2','3','4'] },
  { title: '開始第二次迭代', explanation: '現在 low=5、high=8，仍滿足 low≤high。被排除的五個位置不會再被讀取。', codeLine: 'while (low <= high) {', codeLines: [3], state: { target: 29, condition: '5 ≤ 8 → true', candidate: '[5, 8]' }, values: binaryValues, low: 5, high: 8, muted: ['0','1','2','3','4'] },
  { title: '計算第二次中點', explanation: 'mid=5+(8−5)/2=6。候選區間有四個位置時，整數除法向下取整，因此選到索引 6。', codeLine: 'int mid = low + (high - low) / 2;', codeLines: [4], state: { target: 29, calculation: 'mid = 5 + (8−5)/2 = 6', candidate: '[5, 8]' }, values: binaryValues, low: 5, high: 8, mid: 6, active: ['6'], muted: ['0','1','2','3','4'] },
  { title: '第二次比較發現中間值太大', explanation: '索引 6 的值是 34。因為 34>29，索引 6 到 8 的值只會更大，所以這整段都不可能是答案。', codeLine: 'if (a[mid] > target)', codeLines: [5,9], state: { target: 29, comparison: 'a[6] = 34 > 29', decision: 'discard indices 6…8' }, values: binaryValues, low: 5, high: 8, mid: 6, active: ['6'], muted: ['0','1','2','3','4'] },
  { title: '把右界移到中點左側', explanation: '令 high=mid−1=5，排除 [6,8]。現在只剩候選區間 [5,5]，其中仍包含可能的答案。', codeLine: 'high = mid - 1;', codeLines: [10], state: { target: 29, update: 'high: 8 → 5', candidate: '[5, 5]' }, values: binaryValues, low: 5, high: 5, muted: ['0','1','2','3','4','6','7','8'] },
  { title: '確認唯一候選仍需檢查', explanation: 'low=high=5 時條件 low≤high 仍然成立。這就是閉區間寫法必須使用 ≤ 的原因；若寫成 <，會漏掉最後一個位置。', codeLine: 'while (low <= high) {', codeLines: [3], state: { target: 29, condition: '5 ≤ 5 → true', candidate: '[5, 5]' }, values: binaryValues, low: 5, high: 5, active: ['5'], muted: ['0','1','2','3','4','6','7','8'] },
  { title: '中點就是唯一候選', explanation: 'mid=5+(5−5)/2=5。搜尋區間只有一格，因此 low、mid、high 三個指標都指向索引 5。', codeLine: 'int mid = low + (high - low) / 2;', codeLines: [4], state: { target: 29, calculation: 'mid = 5', candidate: '[5, 5]' }, values: binaryValues, low: 5, high: 5, mid: 5, active: ['5'], muted: ['0','1','2','3','4','6','7','8'] },
  { title: '比較結果相等', explanation: 'a[5]=29，正好等於 target。相等分支已找到合法索引，不需要再縮小區間。', codeLine: 'if (a[mid] == target)', codeLines: [5], state: { target: 29, comparison: 'a[5] = 29', decision: 'match' }, values: binaryValues, low: 5, high: 5, mid: 5, active: ['5'], accepted: ['5'], muted: ['0','1','2','3','4','6','7','8'] },
  { title: '回傳正確索引', explanation: '回傳 mid=5。由於 a[5]=29，回傳值直接滿足規格；整個過程只檢查三個中點，時間複雜度是 O(log n)。', codeLine: 'return mid;', codeLines: [6], state: { target: 29, result: 'index 5', proof: 'a[5] = 29' }, values: binaryValues, low: 5, high: 5, mid: 5, active: ['5'], accepted: ['5'], muted: ['0','1','2','3','4','6','7','8'] },
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
  { title: '確認 BFS 的問題設定', explanation: '這是一張沒有邊權的圖，起點是 A。BFS 會用 queue 按「距離 A 的邊數」逐層處理，因此第一次發現節點時就得到最短距離。', codeLine: 'void bfs(int source) {', codeLines: [1], state: { source: 'A', invariant: 'queue order is nondecreasing distance', frontier: 'not started' }, active: ['A'], accepted: [], queue: [], distances: { A: '∞', B: '∞', C: '∞', D: '∞', E: '∞', F: '∞' } },
  { title: '建立 Queue 與距離陣列', explanation: 'queue 保存已發現但尚未展開的節點；所有 dist 先設為 −1，代表尚未被發現。', codeLine: 'queue<int> q;', codeLines: [2,3], state: { structure: 'FIFO queue', distance: 'all nodes = unvisited', frontier: 'empty' }, active: [], accepted: [], queue: [], distances: { A: '∞', B: '∞', C: '∞', D: '∞', E: '∞', F: '∞' } },
  { title: '把起點 A 放入 Queue', explanation: 'A 是第一個待處理節點，因此把 A 加到 queue 尾端。之後每次都從前端取出，維持先進先出。', codeLine: 'q.push(source);', codeLines: [4], state: { operation: 'push A', queue: ['A'], frontier: 'distance 0' }, active: ['A'], accepted: [], queue: ['A'], distances: { A: '∞', B: '∞', C: '∞', D: '∞', E: '∞', F: '∞' } },
  { title: '在入隊時立刻標記 A', explanation: '將 A 標記 visited 並令 dist[A]=0。標記必須發生在入隊時，才能避免同一節點被不同鄰居重複加入 queue。', codeLine: 'visited[source] = true;', codeLines: [5,6], state: { operation: 'visit A', queue: ['A'], distance: 'A = 0' }, active: ['A'], accepted: ['A'], queue: ['A'], distances: { A: 0, B: '∞', C: '∞', D: '∞', E: '∞', F: '∞' } },
  { title: 'Queue 非空，開始展開', explanation: 'queue 目前是 [A]，所以迴圈繼續。queue 前端永遠是已發現節點中距離最小者。', codeLine: 'while (!q.empty()) {', codeLines: [7], state: { condition: 'queue is not empty', queue: ['A'], frontier: 'A' }, active: ['A'], accepted: ['A'], queue: ['A'], distances: { A: 0, B: '∞', C: '∞', D: '∞', E: '∞', F: '∞' } },
  { title: '取出並展開 A', explanation: '從 queue 前端取得 A，再將它移除。接著逐一檢查 A 的鄰居 B、C。', codeLine: 'int u = q.front();', codeLines: [8,9,10], state: { current: 'A', operation: 'pop A', queue: [] }, active: ['A'], accepted: ['A'], queue: [], distances: { A: 0, B: '∞', C: '∞', D: '∞', E: '∞', F: '∞' } },
  { title: '第一次發現 B', explanation: 'B 尚未 visited，因此設定 dist[B]=dist[A]+1=1，標記後放到 queue 尾端。B 的最短距離現在已確定。', codeLine: 'dist[v] = dist[u] + 1;', codeLines: [11,12,13,14], state: { current: 'A', neighbor: 'B', operation: 'discover B, push B' }, active: ['A','B'], accepted: ['A','B'], queue: ['B'], distances: { A: 0, B: 1, C: '∞', D: '∞', E: '∞', F: '∞' } },
  { title: '接著發現 C', explanation: 'C 也尚未被發現，因此 dist[C]=1 並加入 queue 尾端。queue 變成 [B,C]，同一層依發現順序排列。', codeLine: 'q.push(v);', codeLines: [10,11,12,13,14], state: { current: 'A', neighbor: 'C', operation: 'discover C, push C' }, active: ['A','C'], accepted: ['A','B','C'], queue: ['B','C'], distances: { A: 0, B: 1, C: 1, D: '∞', E: '∞', F: '∞' } },
  { title: '取出下一個同層節點 B', explanation: 'A 的鄰居處理完畢。從 queue 前端取出 B；C 仍留在前端，所以距離 1 的節點會在距離 2 的節點之前處理。', codeLine: 'q.pop();', codeLines: [7,8,9], state: { current: 'B', operation: 'pop B', queue: ['C'] }, active: ['B'], accepted: ['A','B','C'], queue: ['C'], distances: { A: 0, B: 1, C: 1, D: '∞', E: '∞', F: '∞' } },
  { title: '由 B 發現 D', explanation: 'D 尚未 visited，得到 dist[D]=dist[B]+1=2，並加入 queue 尾端。此時 queue 是 [C,D]。', codeLine: 'dist[v] = dist[u] + 1;', codeLines: [10,11,12,13,14], state: { current: 'B', neighbor: 'D', operation: 'discover D, push D' }, active: ['B','D'], accepted: ['A','B','C','D'], queue: ['C','D'], distances: { A: 0, B: 1, C: 1, D: 2, E: '∞', F: '∞' } },
  { title: '由 B 發現 E', explanation: 'E 第一次被看見，設定 dist[E]=2 並入隊。queue 變成 [C,D,E]，其中 C 的距離仍較小。', codeLine: 'visited[v] = true;', codeLines: [10,11,12,13,14], state: { current: 'B', neighbor: 'E', operation: 'discover E, push E' }, active: ['B','E'], accepted: ['A','B','C','D','E'], queue: ['C','D','E'], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: '∞' } },
  { title: '展開 C，遇到已發現的 E', explanation: '取出 C 後檢查到 E，但 E 已在由 B 展開時標記。直接 continue，避免 E 重複入隊，也不改寫其最短距離。', codeLine: 'if (visited[v]) continue;', codeLines: [8,9,10,11], state: { current: 'C', neighbor: 'E', decision: 'already visited → skip' }, active: ['C','E'], accepted: ['A','B','C','D','E'], queue: ['D','E'], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: '∞' } },
  { title: '由 D 發現最後一層 F', explanation: '接著取出 D。F 尚未被發現，因此 dist[F]=dist[D]+1=3，標記後加入 queue。', codeLine: 'dist[v] = dist[u] + 1;', codeLines: [8,9,10,11,12,13,14], state: { current: 'D', neighbor: 'F', operation: 'discover F, push F' }, active: ['D','F'], accepted: ['A','B','C','D','E','F'], queue: ['E','F'], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 3 } },
  { title: '展開 E，不重複加入 F', explanation: '取出 E 後也能看到 F，但 F 已經 visited。第一次發現 F 的路徑長度是 3；另一條同長或更長路徑不需要再次處理。', codeLine: 'if (visited[v]) continue;', codeLines: [8,9,10,11], state: { current: 'E', neighbor: 'F', decision: 'already visited → skip' }, active: ['E','F'], accepted: ['A','B','C','D','E','F'], queue: ['F'], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 3 } },
  { title: 'F 沒有未訪問鄰居', explanation: '最後取出 F。它的所有鄰居都已訪問，因此不會再有新節點入隊，queue 變成空。', codeLine: 'for (int v : graph[u]) {', codeLines: [8,9,10,11], state: { current: 'F', operation: 'no new neighbor', queue: [] }, active: ['F'], accepted: ['A','B','C','D','E','F'], queue: [], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 3 } },
  { title: 'Queue 清空，最短距離完成', explanation: 'queue 為空後迴圈結束。最終距離依層次為 A:0，B、C:1，D、E:2，F:3；每個點與每條邊只處理常數次，複雜度 O(V+E)。', codeLine: '}', codeLines: [7,16,17], state: { result: 'A0 · B1 · C1 · D2 · E2 · F3', proof: 'first discovery is shortest', queue: [] }, active: [], accepted: ['A','B','C','D','E','F'], queue: [], distances: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 3 } },
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
  { title: '把所有距離設為無限大', explanation: '目前還不知道任何路徑，因此 dist[A..F] 全部初始化為 INF。Min-heap 會使用 pair 的第一個欄位，也就是距離來排序。', codeLine: 'fill(dist.begin(), dist.end(), INF);', codeLines: [3,4], state: { operation: 'initialize distances', priorityQueue: [], fixed: [] }, active: [], accepted: [], priorityQueue: [], distances: { A: '∞', B: '∞', C: '∞', D: '∞', E: '∞', F: '∞' } },
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
  { title: '依字典序排序', explanation: '先按 x、再按 y 排序。最左與最右的極端點必定位於凸包，排序也讓上下鏈可以單向掃描。', codeLine: 'sort(p.begin(), p.end());', codeLines: [2], state: { order: ['P1','P2','P3','P4','P8','P5','P6','P7'], lowerStack: ['P1'] }, active: ['P1'], hull: ['P1'] },
  { title: '維持下凸包左轉不變量', explanation: '依序加入點。lower 中任意連續三點必須嚴格逆時針；cross>0 表示左轉，因此目前候選可保留。', codeLine: 'lower.push_back(p);', codeLines: [4,5,7], state: { lowerStack: ['P1','P2','P4'], cross: '+840', decision: 'push P4' }, active: ['P1','P2','P4'], hull: ['P1','P2','P4'] },
  { title: '遇到非左轉就移除中點', explanation: '新點使最後三點 cross≤0，表示右轉或共線。中央點位於新線段內側，不可能成為最外層邊界，因此 pop。', codeLine: 'lower.pop_back();', codeLines: [5,6], state: { lowerStack: ['P1','P2','P4','P6'], cross: '-520', decision: 'pop interior point' }, active: ['P2','P4','P6'], hull: ['P1','P2','P4','P6'] },
  { title: '完成由左至右的下鏈', explanation: '掃描至最右點後，lower 的每個轉向都為左轉，得到凸包的下半部。', codeLine: 'for (Point p : points)', codeLines: [4,5,6,7], state: { lowerStack: ['P1','P2','P4','P6','P7'], invariant: 'all cross > 0' }, active: ['P7'], hull: ['P1','P2','P4','P6','P7'] },
  { title: '反向建立上鏈', explanation: '從右向左套用相同的左轉規則，得到上半部；端點會同時出現在兩條鏈。', codeLine: 'reverse(points.begin(), points.end());', codeLines: [9,10], state: { upperStack: ['P7','P8','P1'], direction: 'right → left' }, active: ['P7','P8'], hull: ['P1','P2','P4','P6','P7','P8'] },
  { title: '移除重複端點並合併', explanation: '刪除上下鏈各自重複的首尾端點後串接。P3、P5 位於外殼內側，所以不在最終凸包。總成本由排序主導為 O(n log n)。', codeLine: 'lower.insert(lower.end(), upper.begin(), upper.end());', codeLines: [11,12,13], state: { hull: ['P1','P2','P4','P6','P7','P8'], removed: ['P3','P5'] }, active: [], accepted: ['P1','P2','P4','P6','P7','P8'], muted: ['P3','P5'], hull: ['P1','P2','P4','P6','P7','P8'] },
]

const hullGuidedFrames: Frame[] = [
  { title: '把所有點想成釘子', explanation: '凸包是能包住所有點的最小凸多邊形，就像橡皮筋繃在最外層釘子上。內部點最後不會出現在邊界。', codeLine: 'vector<Point> convexHull(vector<Point> p) {', codeLines: [1], state: { goal: 'minimum convex boundary', points: 'P1…P8', invariant: 'processed points stay inside boundary' }, active: ['P1','P2','P3','P4','P5','P6','P7','P8'], hull: [] },
  { title: '依 x、再依 y 排序', explanation: '排序結果是 P1、P2、P3、P8、P4、P5、P6、P7。最左與最右的極端點一定在凸包上，排序讓我們能單向掃描。', codeLine: 'sort(p.begin(), p.end());', codeLines: [2], state: { order: ['P1','P2','P3','P8','P4','P5','P6','P7'], operation: 'lexicographic sort', guarantee: 'extreme points are on hull' }, active: ['P1','P7'], hull: ['P1'] },
  { title: '下凸包先放入 P1', explanation: 'lower stack 從最左點 P1 開始。尚未形成轉角，因此直接保留。', codeLine: 'vector<Point> lower, upper;', codeLines: [3,4,7], state: { lowerStack: ['P1'], operation: 'push P1', direction: 'left → right' }, active: ['P1'], hull: ['P1'] },
  { title: '第二個點 P2 也直接加入', explanation: '只有兩個點時仍無法判斷左轉或右轉，所以把 P2 推入 lower，形成第一條候選邊。', codeLine: 'lower.push_back(x);', codeLines: [4,7], state: { lowerStack: ['P1','P2'], operation: 'push P2', turn: 'not enough points' }, active: ['P1','P2'], hull: ['P1','P2'] },
  { title: 'P3 形成左轉，保留', explanation: 'cross(P1,P2,P3)=1000>0，表示從 P1→P2 轉向 P3 是逆時針左轉，符合下凸包不變量，因此 push P3。', codeLine: 'cross(lower.end()[-2], lower.back(), x) <= 0', codeLines: [4,5,7], state: { triple: 'P1, P2, P3', cross: 1000, decision: 'left turn → push P3' }, active: ['P1','P2','P3'], hull: ['P1','P2','P3'] },
  { title: 'P8 仍形成左轉', explanation: 'cross(P2,P3,P8)=600>0，lower 的最後三點仍為嚴格左轉，因此 P8 暫時可以留在邊界候選。', codeLine: 'lower.push_back(x);', codeLines: [4,5,7], state: { triple: 'P2, P3, P8', cross: 600, decision: 'left turn → push P8' }, active: ['P2','P3','P8'], hull: ['P1','P2','P3','P8'] },
  { title: '加入 P4 時先移除 P8', explanation: 'cross(P3,P8,P4)=−468≤0，表示右轉。P8 位於新邊 P3→P4 的內側，不可能是下凸包點，因此 pop P8。', codeLine: 'lower.pop_back();', codeLines: [5,6], state: { triple: 'P3, P8, P4', cross: -468, decision: 'right turn → pop P8' }, active: ['P3','P8','P4'], muted: ['P8'], hull: ['P1','P2','P3'] },
  { title: 'P4 使 P3 也成為內部點', explanation: 'pop 後重新檢查 cross(P2,P3,P4)=−840≤0，所以 P3 也必須移除。接著 cross(P1,P2,P4)>0，P4 才能加入。', codeLine: 'while (lower.size() >= 2 &&', codeLines: [5,6,7], state: { triple: 'P2, P3, P4', cross: -840, decision: 'pop P3; then push P4' }, active: ['P2','P3','P4'], muted: ['P3','P8'], hull: ['P1','P2','P4'] },
  { title: 'P5 形成左轉並加入', explanation: 'cross(P2,P4,P5)=1524>0，因此 P5 目前位於合法的下邊界方向，直接 push。', codeLine: 'lower.push_back(x);', codeLines: [4,5,7], state: { triple: 'P2, P4, P5', cross: 1524, decision: 'left turn → push P5' }, active: ['P2','P4','P5'], muted: ['P3','P8'], hull: ['P1','P2','P4','P5'] },
  { title: 'P6 讓 P5 被淘汰', explanation: 'cross(P4,P5,P6)=−1284≤0，所以 P5 位於新邊內側。pop P5 後，cross(P2,P4,P6)=600>0，故 push P6。', codeLine: 'lower.pop_back();', codeLines: [5,6,7], state: { triple: 'P4, P5, P6', cross: -1284, decision: 'pop P5; push P6' }, active: ['P4','P5','P6'], muted: ['P3','P5','P8'], hull: ['P1','P2','P4','P6'] },
  { title: 'P7 完成下凸包', explanation: 'cross(P4,P6,P7)=1300>0，加入最右點 P7。下凸包最後是 P1→P2→P4→P6→P7。', codeLine: 'for (Point x : p) {', codeLines: [4,5,6,7], state: { lowerStack: ['P1','P2','P4','P6','P7'], cross: 1300, result: 'lower hull complete' }, active: ['P4','P6','P7'], muted: ['P3','P5','P8'], hull: ['P1','P2','P4','P6','P7'] },
  { title: '反向掃描建立上凸包', explanation: '將排序順序反轉，從 P7 往 P1 套用完全相同的左轉規則。這樣得到凸包的上半部。', codeLine: 'reverse(p.begin(), p.end());', codeLines: [9,10], state: { direction: 'right → left', upperStack: ['P7'], operation: 'start upper hull' }, active: ['P7'], hull: ['P1','P2','P4','P6','P7'] },
  { title: '上凸包初期移除 P6', explanation: '先放 P7、P6；看到 P5 時 cross(P7,P6,P5)<0，因此 P6 對上凸包是內部點，pop 後保留 P5。', codeLine: '// build upper using the same loop', codeLines: [10], state: { triple: 'P7, P6, P5', cross: -1208, decision: 'pop P6; push P5' }, active: ['P7','P6','P5'], hull: ['P7','P5'] },
  { title: 'P8 淘汰 P4 與 P5', explanation: '掃到 P8 時，最後轉向連續不是左轉，因此依序 pop P4、P5，再把 P8 加入；上凸包變成 P7→P8。', codeLine: '// build upper using the same loop', codeLines: [10], state: { upperStack: ['P7','P8'], operation: 'pop P4, P5; push P8', invariant: 'all turns are left' }, active: ['P7','P8'], muted: ['P4','P5'], hull: ['P7','P8'] },
  { title: 'P2 使 P3 離開上凸包', explanation: 'P3 曾暫時加入，但新點 P2 使最後三點不是左轉，所以 pop P3；重新檢查後 P2 可以暫留。', codeLine: 'lower.pop_back();', codeLines: [5,6,10], state: { triple: 'P8, P3, P2', cross: -600, decision: 'pop P3; push P2' }, active: ['P8','P3','P2'], muted: ['P3'], hull: ['P7','P8','P2'] },
  { title: '最左點 P1 完成上凸包', explanation: '加入 P1 時 P2 形成非左轉，因此 pop P2；剩下 P7→P8→P1，這就是上凸包。', codeLine: '// build upper using the same loop', codeLines: [10], state: { upperStack: ['P7','P8','P1'], operation: 'pop P2; push P1', result: 'upper hull complete' }, active: ['P7','P8','P1'], muted: ['P2','P3','P4','P5','P6'], hull: ['P7','P8','P1'] },
  { title: '移除上下鏈重複端點', explanation: 'P1、P7 同時出現在上下凸包。合併前各自移除一個重複端點，避免結果中同一點出現兩次。', codeLine: 'lower.pop_back(); upper.pop_back();', codeLines: [11,12], state: { duplicates: ['P1','P7'], operation: 'remove repeated endpoints', status: 'ready to concatenate' }, active: ['P1','P7'], hull: ['P1','P2','P4','P6','P7','P8'] },
  { title: '合併得到逆時針凸包', explanation: '串接下鏈與上鏈，得到 P1、P2、P4、P6、P7、P8。P3、P5 在內部；排序主導總複雜度 O(n log n)。', codeLine: 'lower.insert(lower.end(), upper.begin(), upper.end());', codeLines: [13,14], state: { result: ['P1','P2','P4','P6','P7','P8'], removed: ['P3','P5'], proof: 'every boundary turn is counterclockwise' }, active: [], accepted: ['P1','P2','P4','P6','P7','P8'], muted: ['P3','P5'], hull: ['P1','P2','P4','P6','P7','P8'] },
]

const segmentValues = [2, 5, 1, 4, 9, 3, 7, 6]
const segmentNodes = buildTree(segmentValues)
const segmentFrames: Frame[] = createQueryTrace(segmentValues, 1, 5).filter((step) => step.kind !== 'visit').map((step, stepIndex) => ({
  title: `${String(stepIndex + 1).padStart(2, '0')} · ${step.title}`,
  explanation: `${step.explanation} 遞迴始終以完整包含、完全相離或繼續拆分三種互斥情況處理，因此不會重複或漏算任何元素。`,
  codeLine: step.kind === 'accept' ? 'return tree[node]' : step.kind === 'return' ? 'return left + right' : 'query(node, left, right)',
  codeLines: step.kind === 'accept' ? [4] : step.kind === 'ignore' ? [3] : step.kind === 'return' ? [7] : step.kind === 'partial' ? [5,6,7] : [2],
  state: { activeInterval: step.activeId ?? 'root', runningTotal: step.runningTotal, event: step.kind },
  segmentStep: step,
}))

const binaryCode = [
  'int binarySearch(vector<int>& a, int target) {', '  int low = 0, high = (int)a.size() - 1;', '  while (low <= high) {',
  '    int mid = low + (high - low) / 2;', '    if (a[mid] == target)', '      return mid;', '    if (a[mid] < target)',
  '      low = mid + 1;', '    else', '      high = mid - 1;', '  }', '  return -1;', '}',
]
const bfsCode = [
  'void bfs(int source) {', '  queue<int> q;', '  vector<int> dist(n, -1);', '  q.push(source);', '  visited[source] = true;', '  dist[source] = 0;',
  '  while (!q.empty()) {', '    int u = q.front();', '    q.pop();', '    for (int v : graph[u]) {', '      if (visited[v]) continue;',
  '      dist[v] = dist[u] + 1;', '      visited[v] = true;', '      q.push(v);', '    }', '  }', '}',
]
const dijkstraCode = [
  'void dijkstra(int source) {', '  using State = pair<long long, int>;', '  priority_queue<State, vector<State>, greater<State>> pq;',
  '  fill(dist.begin(), dist.end(), INF);', '  dist[source] = 0;', '  pq.push({0, source});', '  while (!pq.empty()) {',
  '    auto [d, u] = pq.top();', '    pq.pop();', '    if (d != dist[u]) continue;', '    for (auto [v, w] : graph[u]) {',
  '      if (d + w < dist[v]) {', '        dist[v] = d + w;', '        pq.push({dist[v], v});', '      }', '    }', '  }', '}',
]
const segmentCode = [
  'long long query(int node, int l, int r, int ql, int qr) {', '  // node represents [l, r]', '  if (r < ql || qr < l) return 0;',
  '  if (ql <= l && r <= qr) return tree[node];', '  int mid = l + (r - l) / 2;',
  '  long long left = query(node*2, l, mid, ql, qr);', '  long long right = query(node*2+1, mid+1, r, ql, qr);',
  '  return left + right;', '}',
]
const hullCode = [
  'vector<Point> convexHull(vector<Point> p) {', '  sort(p.begin(), p.end());', '  vector<Point> lower, upper;', '  for (Point x : p) {',
  '    while (lower.size() >= 2 &&', '           cross(lower.end()[-2], lower.back(), x) <= 0)', '      lower.pop_back();', '    lower.push_back(x);', '  }',
  '  reverse(p.begin(), p.end());', '  // build upper using the same loop', '  lower.pop_back(); upper.pop_back();',
  '  lower.insert(lower.end(), upper.begin(), upper.end());', '  return lower;', '}',
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

const conciseSentence = (text: string) => text.split(/(?<=[。！？])/).map((sentence) => sentence.trim()).find(Boolean) ?? text

const meaningfulCodeLines = (lesson: AlgorithmLesson) => lesson.code
  .map((line, index) => ({ line: line.trim(), number: index + 1 }))
  .filter(({ line }) => line && !/^[{}]+;?$/.test(line) && !line.startsWith('//'))

const codeStepRole = (line: string) => {
  if (/^[\w:<>,&*\s]+\w+\s*\([^;]*\)\s*\{.*\bif\b.*\breturn\b/.test(line)) return '進入函式並處理立即可判斷的特例'
  if (/\bif\b.*\breturn\b/.test(line)) return '檢查特例，成立時提前回傳'
  if (/\breturn\b/.test(line)) return '驗證並回傳答案'
  if (/^if\s*\(/.test(line) || /^else\b/.test(line)) return '把目前數值代入分支條件'
  if (/^(for|while)\s*\(/.test(line)) return '檢查迴圈是否還有工作'
  if (/\b(push|push_back|push_front|insert|emplace|pop|pop_back|pop_front|erase|swap)\b/.test(line)) return '更新演算法使用的資料結構'
  if (/\[[^\]]+\]\s*(\+=|-=|\*=|\/=|=)/.test(line) || /(^|\s)\w+\s*(\+=|-=|\*=|\/=|=)/.test(line)) return '算出並寫入新的狀態'
  if (/^[\w:<>,&*\s]+\w+\s*\([^;]*\)\s*\{?$/.test(line)) return '確認函式輸入與輸出'
  if (/\w+\s*\([^;]*\);?$/.test(line)) return '呼叫子程序處理目前子問題'
  return '讀取這一步需要的資料'
}

const conditionOf = (line: string) => line.match(/^(?:if|while|for)\s*\((.*)\)/)?.[1] ?? '依目前資料執行這一行'

const expandGuidedFrames = (lesson: AlgorithmLesson): Frame[] => {
  const meaningful = meaningfulCodeLines(lesson)
  const total = Math.min(20, Math.max(10, meaningful.length))
  const phases = lesson.frames
  const firstInvariant = phases.find((frame) => frame.state?.invariant)?.state?.invariant ?? conciseSentence(phases[0]?.explanation ?? lesson.description)
  const lineAssignments = Array.from({ length: total }, (_, step) => Math.floor(step * meaningful.length / total))

  return Array.from({ length: total }, (_, step): Frame => {
    const start = lineAssignments[step]
    const end = Math.max(start + 1, Math.floor((step + 1) * meaningful.length / total))
    const occurrenceIndex = lineAssignments.slice(0, step + 1).filter((item) => item === start).length - 1
    const occurrenceTotal = lineAssignments.filter((item) => item === start).length
    const bucket = meaningful.slice(start, Math.min(meaningful.length, end))
    const selected = bucket.length ? bucket : [meaningful[Math.min(start, meaningful.length - 1)]].filter(Boolean)
    const codeLines = selected.map((item) => item.number)
    const primary = selected[0] ?? { line: lesson.code[0]?.trim() ?? '', number: 1 }
    const phaseIndex = Math.min(phases.length - 1, Math.floor(step * phases.length / total))
    const phase = phases[phaseIndex]
    const previous = phases[Math.max(0, phaseIndex - 1)]
    const baseRole = codeStepRole(primary.line)
    const repeatedRoles = [
      `讀取輸入，準備${baseRole}`,
      `代入實際值，判斷是否${baseRole}`,
      `執行目前敘述，開始${baseRole}`,
      `比較執行前後，確認${baseRole}`,
      `核對結果，完成${baseRole}`,
    ]
    const role = occurrenceTotal === 1 ? baseRole : repeatedRoles[Math.min(repeatedRoles.length - 1, Math.round(occurrenceIndex / Math.max(1, occurrenceTotal - 1) * (repeatedRoles.length - 1)))]
    const before = phaseIndex === 0 ? '尚未執行這個階段，只有輸入與初始值' : `${previous.title}：${conciseSentence(previous.explanation)}`
    const completedAfter = `${phase.title}：${conciseSentence(phase.explanation)}`
    const after = occurrenceIndex < occurrenceTotal - 1
      ? occurrenceIndex === 0
        ? `已定位這行要讀取的資料，尚未改變原狀態`
        : occurrenceIndex === 1
          ? `已完成代入「${conditionOf(primary.line)}」，準備執行對應分支`
          : `正在把本行造成的變化寫入高亮資料`
      : completedAfter
    const baseActive = phase.active ?? []
    const revealRatio = (step + 1) / total
    const activeCount = Math.max(1, Math.ceil(baseActive.length * Math.min(1, revealRatio * 1.4)))
    const state = {
      algorithm: lesson.zhTitle,
      goal: phase.title,
      before,
      condition: conditionOf(primary.line),
      operation: role,
      after,
      rationale: phase.explanation,
      invariant: firstInvariant,
      timelineStep: step + 1,
      phase: phaseIndex,
    }
    return {
      ...phase,
      title: `${String(step + 1).padStart(2, '0')}．${role}`,
      explanation: `第 ${primary.number} 行負責「${role}」，目前屬於「${phase.title}」。${phase.explanation} 執行前是 ${before}；完成這行後應得到 ${after}。`,
      codeLine: primary.line,
      codeLines,
      state,
      values: phase.values ?? previous.values,
      low: phase.low ?? previous.low,
      high: phase.high ?? previous.high,
      mid: phase.mid,
      active: baseActive.slice(0, activeCount),
      accepted: step === total - 1 ? (phase.accepted ?? phase.active) : phase.accepted,
      muted: phase.muted,
      queue: phase.queue,
      priorityQueue: phase.priorityQueue,
      distances: phase.distances,
      trace: undefined,
    }
  })
}

const ensureGuidedLesson = (lesson: AlgorithmLesson): AlgorithmLesson => {
  if (lesson.animationVersion===2) return lesson
  return {
    ...lesson,
    animationVersion: 2,
    sources: lesson.sources?.length?lesson.sources:[cppBookSourceByCategory[lesson.categoryId]],
    frames: expandGuidedFrames(lesson),
  }
}
const buildVisualTrace = (lesson: AlgorithmLesson, frame: Frame, step: number): VisualTrace => {
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

export const lessons: AlgorithmLesson[] = [...coreLessons, ...foundationLessons, ...graphTreeLessons, ...dataDpLessons, ...advancedLessons, ...completionLessons]
  .map(ensureGuidedLesson)
  .map(enrichLesson)
  .map(enrichPedagogy)
  .map((lesson) => ({ ...lesson, fidelity: lesson.animationVersion === 2 ? 'concrete' as const : 'semantic' as const }))
  .map((lesson) => ({ ...lesson, frames: lesson.frames.map((frame, step) => ({ ...frame, trace: buildVisualTrace(lesson, frame, step) })) }))
  .map((lesson, index) => ({ ...lesson, index: String(index + 1).padStart(3, '0') }))

export { segmentNodes, segmentValues }
