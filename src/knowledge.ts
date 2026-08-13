import type { AlgorithmLesson, CategoryId, Frame } from './algorithms'

export interface KnowledgeDependency {
  lessonId: string
  reason: string
}

export interface KnowledgeTerm {
  term: string
  meaning: string
}

export interface KnowledgeOperation {
  name: string
  purpose: string
  reads: string
  writes: string
  complexity: string
}

export interface KnowledgeComplexity {
  preprocessing: string
  query: string
  update: string
  memory: string
  note: string
}

export interface KnowledgeImplementation {
  scope: 'complete-core' | 'extension'
  input: string
  output: string
  assumptions: string[]
  relationship: string
}

export interface KnowledgeUnit {
  motivation: {
    problem: string
    why: string
    naive: string
  }
  coreIdea: string
  mentalModel: string
  prerequisites: KnowledgeDependency[]
  localPrerequisites: KnowledgeTerm[]
  structure: KnowledgeTerm[]
  initialization: {
    goal: string
    steps: string[]
    result: string
  }
  operations: KnowledgeOperation[]
  operationFlow: string[]
  complexity: KnowledgeComplexity
  implementation: KnowledgeImplementation
  example: {
    input: string
    steps: string[]
    output: string
  }
  mistakes: string[]
  edgeCases: string[]
  extensions: KnowledgeDependency[]
}

const dependencyById: Record<string, KnowledgeDependency[]> = {
  bfs: [{ lessonId: 'queue', reason: 'FIFO Queue 保證距離較小的節點先被展開。' }],
  'coordinate-compression': [{ lessonId: 'merge-sort', reason: '先排序並去重，才能把原值映射成保序排名。' }],
  kadane: [{ lessonId: 'prefix-sum', reason: '先理解連續區間和，再把最佳左端選擇壓成單一狀態。' }],
  'selection-sort': [{ lessonId: 'linear-search', reason: '每輪以線性掃描找剩餘最小值。' }],
  'bubble-sort': [{ lessonId: 'linear-search', reason: '每一趟逐一比較相鄰元素。' }],
  'two-pointers': [{ lessonId: 'binary-search', reason: '先理解排序與單調性如何安全排除候選。' }],
  'sliding-window': [{ lessonId: 'two-pointers', reason: '視窗本質上是兩個只向前移動的端點。' }],
  'difference-array': [{ lessonId: 'prefix-sum', reason: '差分的還原就是前綴累積。' }],
  'prefix-sum-2d': [{ lessonId: 'prefix-sum', reason: '先掌握一維前綴定義與半開區間。' }],
  'prefix-xor': [{ lessonId: 'prefix-sum', reason: '沿用前綴抵消的查詢思路，只把加法改成 XOR。' }],
  'quickselect': [{ lessonId: 'quick-sort', reason: '兩者共用 partition；Quickselect 只遞迴答案所在一側。' }],
  'counting-sort': [{ lessonId: 'selection-sort', reason: '先理解比較排序，再利用有限值域改成頻率桶。' }],
  'meet-in-the-middle': [{ lessonId: 'binary-search', reason: '兩半枚舉後通常以排序與二分配對答案。' }],
  'interval-scheduling': [{ lessonId: 'merge-sort', reason: '貪心前必須先按結束時間建立處理順序。' }],
  'interval-covering': [{ lessonId: 'interval-scheduling', reason: '先理解區間排序與交換論證，再改成每步延伸最遠右端。' }],
  'interval-merging': [{ lessonId: 'merge-sort', reason: '排序左端點後，重疊區間才會相鄰出現。' }],
  'job-scheduling': [{ lessonId: 'interval-scheduling', reason: '同樣先用排序固定可證明的處理順序。' }],
  'huffman-coding': [{ lessonId: 'binary-heap', reason: '每次需要快速取出權重最小的兩棵樹。' }],
  'fractional-knapsack': [{ lessonId: 'merge-sort', reason: '依單位價值排序後才可由高到低貪心。' }],
  'inversion-counting': [{ lessonId: 'merge-sort', reason: '逆序對是在 merge 階段額外統計的資訊。' }],
  'parallel-binary-search': [{ lessonId: 'binary-search', reason: '必須先能證明單一查詢的答案具有單調性。' }],
  'parentheses-matching': [{ lessonId: 'stack', reason: '未配對左括號由 LIFO 順序管理。' }],
  'monotonic-stack': [{ lessonId: 'stack', reason: '單調堆疊是在 Stack 上加入候選淘汰規則。' }],
  'next-greater-element': [{ lessonId: 'monotonic-stack', reason: '答案由單調堆疊被彈出的時刻決定。' }],
  'largest-rectangle-histogram': [{ lessonId: 'monotonic-stack', reason: '需要最近較小元素作為左右邊界。' }],
  'monotonic-queue': [{ lessonId: 'deque', reason: '候選需要同時從前端過期、從後端淘汰。' }],
  'sliding-window-maximum': [{ lessonId: 'monotonic-queue', reason: '視窗最大值就是單調 Queue 的標準完整應用。' }, { lessonId: 'sliding-window', reason: '先理解左右端點與過期元素。' }],
  'expression-evaluation': [{ lessonId: 'stack', reason: '運算元與運算子需要依 LIFO 順序處理。' }],
  'shunting-yard': [{ lessonId: 'stack', reason: '運算子 Stack 是轉換優先序的核心狀態。' }],
  dijkstra: [{ lessonId: 'bfs', reason: '先建立圖的走訪、距離與 frontier 概念。' }, { lessonId: 'binary-heap', reason: 'Priority Queue 由 Heap 快速取出最小暫定距離。' }],
  'multi-source-bfs': [{ lessonId: 'bfs', reason: '只是把 BFS 的第 0 層改成多個來源。' }],
  'flood-fill': [{ lessonId: 'dfs', reason: '把網格格子視為節點後，就是受邊界限制的 DFS/BFS。' }],
  'zero-one-bfs': [{ lessonId: 'bfs', reason: '沿用最短路鬆弛與 frontier。' }, { lessonId: 'deque', reason: '權重 0 放前端、權重 1 放後端。' }],
  'dag-shortest-path': [{ lessonId: 'topological-sort', reason: '必須按拓樸順序保證所有前驅已完成。' }],
  'negative-cycle-reconstruction': [{ lessonId: 'bellman-ford', reason: '利用第 V 輪仍被鬆弛的節點回溯負環。' }],
  'floyd-warshall': [{ lessonId: 'dijkstra', reason: '先理解單源 relaxation，再比較以中繼點逐步改善所有點對。' }],
  'connected-components': [{ lessonId: 'dfs', reason: '每次 DFS 完整標記一個連通分量。' }],
  'bipartite-coloring': [{ lessonId: 'bfs', reason: '逐層染相反顏色並偵測衝突。' }],
  'cycle-detection': [{ lessonId: 'dfs', reason: '需要區分 DFS 的未進入、遞迴中與已完成狀態。' }],
  'functional-graph': [{ lessonId: 'dfs', reason: '每個連通塊由一個環與指向環的樹組成。' }, { lessonId: 'lca-binary-lifting', reason: '長距離跳躍沿用倍增表。' }],
  'euler-circuit': [{ lessonId: 'dfs', reason: 'Hierholzer 沿未使用邊深入並在死路回程輸出。' }, { lessonId: 'stack', reason: '顯式 Stack 保存目前尚未封閉的路徑。' }],
  'kosaraju-scc': [{ lessonId: 'dfs', reason: '兩趟 DFS 分別建立完成順序與收集分量。' }],
  'tarjan-scc': [{ lessonId: 'dfs', reason: 'disc、low 與遞迴 Stack 都建立在 DFS 樹上。' }],
  bridges: [{ lessonId: 'dfs', reason: '橋的 low-link 判定依賴 DFS 樹邊與回邊。' }],
  'articulation-points': [{ lessonId: 'bridges', reason: '沿用 disc/low，再把切斷條件改到節點。' }],
  'biconnected-components': [{ lessonId: 'articulation-points', reason: '點雙連通分量由割點與 DFS 邊 Stack 分割。' }],
  'bridge-tree': [{ lessonId: 'bridges', reason: '先找橋，再縮合所有非橋連通塊。' }],
  'block-cut-tree': [{ lessonId: 'biconnected-components', reason: '圓方樹的方點就是點雙連通分量。' }],
  'condensation-graph': [{ lessonId: 'tarjan-scc', reason: '先把每個節點標到 SCC，才能縮成 DAG。' }, { lessonId: 'topological-sort', reason: '縮點後的結構是 DAG。' }],
  'two-sat': [{ lessonId: 'tarjan-scc', reason: '可滿足性由 implication graph 的 SCC 判定。' }],
  kruskal: [{ lessonId: 'dsu', reason: 'DSU 用來判斷加入邊是否形成環。' }],
  prim: [{ lessonId: 'binary-heap', reason: 'Priority Queue 維護跨割候選邊。' }],
  boruvka: [{ lessonId: 'dsu', reason: '每輪需要維護目前連通分量並同步合併。' }],
  'weighted-dsu': [{ lessonId: 'dsu', reason: '在 parent 關係上額外維護到根的位勢差。' }],
  'rollback-dsu': [{ lessonId: 'dsu', reason: '先理解 union-by-size，再限制不能做路徑壓縮。' }],
  'offline-dynamic-connectivity': [{ lessonId: 'rollback-dsu', reason: '時間分治進出節點時需要套用與撤銷 Union。' }, { lessonId: 'segment-tree', reason: '用時間線段樹保存邊的有效區間。' }],
  'tree-diameter': [{ lessonId: 'dfs', reason: '樹距離與父子關係先由一次完整遍歷建立。' }],
  'tree-center': [{ lessonId: 'tree-diameter', reason: '樹中心位於直徑路徑中點。' }],
  'tree-isomorphism': [{ lessonId: 'dfs', reason: '必須先以父節點方向遞迴取得每個子樹編碼。' }],
  'euler-tour-flattening': [{ lessonId: 'dfs', reason: 'DFS 進出時間使每棵子樹成為連續區間。' }],
  'lca-binary-lifting': [{ lessonId: 'dfs', reason: '先建立 depth 與 immediate parent。' }, { lessonId: 'euler-tour-flattening', reason: '先理解祖先區間與 DFS 時間。' }],
  'tree-distance-queries': [{ lessonId: 'lca-binary-lifting', reason: '距離公式以 LCA 拆開兩條祖先路徑。' }],
  'heavy-light-decomposition': [{ lessonId: 'lca-binary-lifting', reason: '先理解樹路徑與深度。' }, { lessonId: 'segment-tree', reason: '每段重鏈映射成陣列區間後交給區間結構。' }],
  'centroid-decomposition': [{ lessonId: 'tree-centroid', reason: '每一層都先找目前連通塊的重心。' }],
  'small-to-large': [{ lessonId: 'tree-dp', reason: '子樹答案在 DFS 回程時合併。' }],
  'dsu-on-tree': [{ lessonId: 'small-to-large', reason: '保留重兒子資料、重建輕兒子是小併大的變形。' }],
  'virtual-tree': [{ lessonId: 'lca-binary-lifting', reason: '補入關鍵節點的 LCA 才能封閉祖先結構。' }, { lessonId: 'euler-tour-flattening', reason: '依 tin 排序才能線性建虛樹。' }],
  'kruskal-reconstruction-tree': [{ lessonId: 'kruskal', reason: '每次 DSU 合併被記成一個新父節點。' }],
  'prufer-code': [{ lessonId: 'tree-isomorphism', reason: '先理解標號樹、葉節點與樹結構表示。' }],
  'fenwick-tree': [{ lessonId: 'prefix-sum', reason: 'Fenwick 把可修改前綴和拆成 lowbit 區塊。' }],
  'segment-tree': [{ lessonId: 'prefix-sum', reason: '先比較靜態 O(1) 查詢與可修改需求的差異。' }],
  'iterative-segment-tree': [{ lessonId: 'segment-tree', reason: '同一個 build/query/update lifecycle 的迭代儲存版本。' }],
  'lazy-segment-tree': [{ lessonId: 'segment-tree', reason: '必須先完整理解節點區間、build、query 與 point update。' }],
  'persistent-segment-tree': [{ lessonId: 'segment-tree', reason: '持久化只複製單次更新路徑，其餘節點共用。' }],
  'dynamic-segment-tree': [{ lessonId: 'segment-tree', reason: '先理解固定完整樹，再改成需要時才建立節點。' }],
  'merge-sort-tree': [{ lessonId: 'segment-tree', reason: '每個區間節點改存排序陣列。' }, { lessonId: 'merge-sort', reason: 'build 時以 merge 合併子節點排序資料。' }],
  'segment-tree-beats': [{ lessonId: 'lazy-segment-tree', reason: '先掌握區間標記與何時可以整段套用更新。' }],
  'fenwick-tree-2d': [{ lessonId: 'fenwick-tree', reason: '把一維 lowbit 走訪套在兩個座標軸。' }],
  'segment-tree-2d': [{ lessonId: 'segment-tree', reason: '外層與內層都使用同一套區間分割。' }],
  'disjoint-sparse-table': [{ lessonId: 'sparse-table', reason: '先理解冪次分層預處理與靜態查詢。' }],
  'mo-algorithm': [{ lessonId: 'sqrt-decomposition', reason: '查詢依左端區塊與右端順序離線排序。' }, { lessonId: 'sliding-window', reason: '答案由 add/remove 維護可移動區間。' }],
  'li-chao-tree': [{ lessonId: 'convex-hull-trick', reason: '兩者都維護直線集合並回答指定 x 的最值。' }],
  'wavelet-tree': [{ lessonId: 'segment-tree', reason: '沿值域遞迴分割，並在每層保存區間計數。' }, { lessonId: 'merge-sort', reason: '穩定分割與排序統計是建構基礎。' }],
  'wavelet-matrix': [{ lessonId: 'wavelet-tree', reason: '把指標樹改成逐 bit 的平坦穩定分割。' }],
  'implicit-treap': [{ lessonId: 'treap', reason: '把 BST key 改為左子樹大小形成隱式索引。' }],
  'cartesian-tree': [{ lessonId: 'monotonic-stack', reason: '線性建樹以單調 Stack 找到父子關係。' }],
  'ordered-statistic-tree': [{ lessonId: 'treap', reason: '在平衡 BST 節點加上 subtree size 即可支援 rank 與 kth。' }],
  'kd-tree': [{ lessonId: 'closest-pair', reason: '先理解空間候選剪枝，再以交替座標切分空間。' }],
  'link-cut-tree': [{ lessonId: 'splay-tree', reason: '每條 preferred path 由 Splay 維護。' }, { lessonId: 'tree-distance-queries', reason: '先理解靜態樹路徑，再處理動態 link/cut。' }],
  'euler-tour-tree': [{ lessonId: 'euler-tour-flattening', reason: '把 Euler 序列放進可 split/merge 的平衡樹。' }, { lessonId: 'implicit-treap', reason: '動態序列需要 split 與 merge。' }],
  'persistent-dsu': [{ lessonId: 'dsu', reason: '持久化版本保存 parent/size 的歷史狀態。' }],
  'knapsack-01': [{ lessonId: 'fibonacci-dp', reason: '先掌握狀態、轉移、初始值與計算順序。' }],
  'coin-change': [{ lessonId: 'fibonacci-dp', reason: '先把重複子問題寫成明確 DP 狀態。' }],
  'longest-common-subsequence': [{ lessonId: 'fibonacci-dp', reason: '先掌握二維 DP 的狀態與 base case。' }],
  'longest-increasing-subsequence': [{ lessonId: 'fibonacci-dp', reason: '先會寫 O(n²) DP，再理解 tails 最佳化。' }, { lessonId: 'binary-search', reason: 'O(n log n) 版本以二分維護 tails。' }],
  'edit-distance': [{ lessonId: 'longest-common-subsequence', reason: '同樣以兩個前綴定義二維狀態。' }],
  'unbounded-knapsack': [{ lessonId: 'knapsack-01', reason: '只改容量迭代方向，就改變物品能否重複使用。' }],
  'subset-sum': [{ lessonId: 'knapsack-01', reason: '把價值最大化改成可達性布林狀態。' }],
  'dp-reconstruction': [{ lessonId: 'knapsack-01', reason: '先完成 DP 值，再保存選擇回溯答案。' }],
  'bitmask-dp': [{ lessonId: 'fibonacci-dp', reason: '先掌握 DP lifecycle，再用 bitmask 壓縮集合狀態。' }],
  'tsp-dp': [{ lessonId: 'bitmask-dp', reason: '狀態是已訪集合加最後節點。' }],
  'profile-dp': [{ lessonId: 'bitmask-dp', reason: '輪廓以 bitmask 表示尚未封閉的局部狀態。' }, { lessonId: 'grid-dp', reason: '依格子順序推進網格 frontier。' }],
  'tree-dp': [{ lessonId: 'dfs', reason: '子樹狀態必須依 DFS 回程順序合併。' }, { lessonId: 'fibonacci-dp', reason: '先建立基本 DP 的狀態與轉移。' }],
  'rerooting-dp': [{ lessonId: 'tree-dp', reason: '先算向下 DP，再把父側貢獻傳給孩子。' }],
  'dag-dp': [{ lessonId: 'topological-sort', reason: '拓樸順序確保所有依賴先完成。' }, { lessonId: 'fibonacci-dp', reason: '先掌握 DP 狀態與轉移。' }],
  'interval-dp': [{ lessonId: 'fibonacci-dp', reason: '先建立 base case 與依賴方向，再改成由短區間推長區間。' }],
  'matrix-chain-multiplication': [{ lessonId: 'interval-dp', reason: '枚舉切點合併左右子區間。' }],
  'digit-dp': [{ lessonId: 'fibonacci-dp', reason: '先掌握記憶化與狀態定義。' }],
  'probability-dp': [{ lessonId: 'fibonacci-dp', reason: '把計數轉移改成依事件機率加權。' }],
  'divide-conquer-dp': [{ lessonId: 'fibonacci-dp', reason: '必須先有正確的原始 DP 轉移式。' }],
  'knuth-optimization': [{ lessonId: 'interval-dp', reason: '先完成 O(n³) 區間 DP，再證明最佳切點單調。' }],
  'monotone-queue-optimization': [{ lessonId: 'monotonic-queue', reason: 'Queue 維護轉移視窗中的最佳候選。' }, { lessonId: 'fibonacci-dp', reason: '最佳化前必須先寫出原始 DP。' }],
  'convex-hull-trick': [{ lessonId: 'fibonacci-dp', reason: '先把 DP 轉移式整理成直線斜率與查詢 x。' }],
  'slope-trick': [{ lessonId: 'convex-hull-trick', reason: '先理解以幾何物件維護凸函數／直線最值的觀點。' }, { lessonId: 'binary-heap', reason: '常見實作用兩個 Heap 維護斜率轉折點。' }],
  'aliens-optimization': [{ lessonId: 'binary-search', reason: '對懲罰參數二分以控制選取數量。' }, { lessonId: 'fibonacci-dp', reason: '每次可行性檢查本身是一個完整 DP。' }],
  kmp: [{ lessonId: 'linear-search', reason: '先看朴素逐起點匹配為何會重複比較。' }],
  'rabin-karp': [{ lessonId: 'rolling-hash', reason: '滑動匹配建立在可 O(1) 更新子字串 Hash。' }],
  'aho-corasick': [{ lessonId: 'trie', reason: '多個模式先共用 Trie 前綴。' }, { lessonId: 'kmp', reason: 'failure link 是 KMP 失配資訊的多模式版本。' }],
  'lcp-array': [{ lessonId: 'suffix-array', reason: 'LCP 依後綴排名比較相鄰後綴。' }],
  'suffix-tree': [{ lessonId: 'trie', reason: '先理解共享前綴，再把單一路徑壓縮成邊標籤。' }, { lessonId: 'suffix-array', reason: '用後綴集合建立完整問題背景。' }],
  'suffix-automaton': [{ lessonId: 'trie', reason: '先理解字串前綴路徑與狀態轉移。' }],
  'palindromic-tree': [{ lessonId: 'manacher', reason: '先建立回文中心、半徑與回文後綴概念。' }],
  'minimum-string-rotation': [{ lessonId: 'duval-lyndon', reason: '字典序最小旋轉可由 Lyndon 分解觀點理解。' }],
  'z-algorithm': [{ lessonId: 'kmp', reason: '先理解前綴匹配資訊，再比較 Z[i] 如何改以位置 i 為起點。' }],
  dinic: [{ lessonId: 'ford-fulkerson', reason: '先完整理解殘餘邊、增廣路與瓶頸。' }, { lessonId: 'bfs', reason: 'BFS 建立 level graph。' }],
  'edmonds-karp': [{ lessonId: 'ford-fulkerson', reason: '它只把任意增廣路改成 BFS 最短增廣路。' }, { lessonId: 'bfs', reason: 'BFS 在殘餘網路中重建 parent。' }],
  'minimum-cut': [{ lessonId: 'ford-fulkerson', reason: '最大流完成後才能從殘餘可達集合讀出最小割。' }],
  'push-relabel': [{ lessonId: 'ford-fulkerson', reason: '先理解容量、反向殘餘邊與流守恆。' }],
  'min-cost-max-flow': [{ lessonId: 'ford-fulkerson', reason: '沿殘餘增廣路送流的 lifecycle 相同。' }, { lessonId: 'bellman-ford', reason: '負費用殘餘邊需要最短路或勢能處理。' }],
  'flow-lower-bounds': [{ lessonId: 'ford-fulkerson', reason: '先掌握普通容量與流守恆，再做下界轉換。' }],
  'circulation-demands': [{ lessonId: 'flow-lower-bounds', reason: '需求與下界都轉成節點 balance 和超級源匯。' }],
  'hopcroft-karp': [{ lessonId: 'kuhn-matching', reason: '先理解單條交錯增廣路如何增加匹配。' }, { lessonId: 'bfs', reason: 'BFS 一次建立最短增廣路分層。' }],
  hungarian: [{ lessonId: 'kuhn-matching', reason: '先理解二分圖指派與每個點只能配一次的限制。' }],
  'stable-matching': [{ lessonId: 'queue', reason: '尚未匹配且仍可求婚的人依序進入待處理 Queue。' }],
  blossom: [{ lessonId: 'kuhn-matching', reason: '先理解二分圖交錯路，再處理奇環收縮。' }],
  'extended-euclid': [{ lessonId: 'euclidean-algorithm', reason: '在 gcd 遞迴回程時同時恢復 Bézout 係數。' }],
  'modular-inverse': [{ lessonId: 'extended-euclid', reason: '一般模數下由 ax+my=gcd(a,m) 求逆元。' }, { lessonId: 'fast-exponentiation', reason: '質數模數下也可用 a^(p−2)。' }],
  'chinese-remainder-theorem': [{ lessonId: 'extended-euclid', reason: '合併同餘需要 gcd 與模逆。' }],
  'matrix-exponentiation': [{ lessonId: 'fast-exponentiation', reason: '完全沿用快速冪 invariant，只把乘法換成矩陣乘法。' }],
  'gaussian-elimination': [{ lessonId: 'extended-euclid', reason: '先理解以可逆操作維持等價解集合，再推廣到列運算。' }],
  'xor-linear-basis': [{ lessonId: 'gaussian-elimination', reason: 'XOR 基底就是 GF(2) 上依最高位選 pivot 的消去。' }],
  'sprague-grundy': [{ lessonId: 'nim', reason: 'SG 值把每個子遊戲等價成 Nim 石堆。' }],
  'linear-sieve': [{ lessonId: 'prime-sieve', reason: '先理解篩掉合數，再限制每個合數只被最小質因數處理一次。' }],
  'prime-factorization': [{ lessonId: 'prime-sieve', reason: '小範圍可先建立質數或最小質因數表。' }],
  'euler-totient': [{ lessonId: 'prime-factorization', reason: 'φ(n) 的乘法公式由 n 的不同質因數決定。' }],
  'miller-rabin': [{ lessonId: 'fast-exponentiation', reason: '每個 witness 都需要安全的模冪。' }],
  'pollard-rho': [{ lessonId: 'miller-rabin', reason: '遞迴前先判斷目前因子是否已是質數。' }, { lessonId: 'euclidean-algorithm', reason: '以 gcd 偵測模未知質因數下的碰撞。' }],
  'baby-step-giant-step': [{ lessonId: 'modular-inverse', reason: '巨步轉移需要乘上 a^{-m}。' }, { lessonId: 'fast-exponentiation', reason: '建立 a^m 與驗證答案。' }],
  'segment-intersection': [{ lessonId: 'dot-cross-product', reason: '外積符號是方向與跨立判定的基礎。' }],
  'line-intersection': [{ lessonId: 'dot-cross-product', reason: '交點參數由向量外積推導。' }],
  'point-line-distance': [{ lessonId: 'dot-cross-product', reason: '面積除以底長得到距離。' }],
  'polar-sort': [{ lessonId: 'dot-cross-product', reason: '同半平面內以外積判斷角度先後。' }],
  'polygon-area': [{ lessonId: 'dot-cross-product', reason: '鞋帶公式就是依序累加相鄰向量外積。' }],
  'point-in-polygon': [{ lessonId: 'segment-intersection', reason: '射線法需要可靠的邊界與交點判定。' }],
  'convex-hull': [{ lessonId: 'dot-cross-product', reason: 'Andrew 演算法以外積判定左轉與右轉。' }],
  'rotating-calipers': [{ lessonId: 'convex-hull', reason: '對踵點的單調性只在凸多邊形邊界上成立。' }],
  'half-plane-intersection': [{ lessonId: 'line-intersection', reason: '相鄰半平面邊界交點形成可行多邊形。' }, { lessonId: 'polar-sort', reason: '直線需依方向角排序。' }],
  'minkowski-sum': [{ lessonId: 'convex-hull', reason: '線性 edge merge 版本要求兩個輸入皆為凸多邊形。' }, { lessonId: 'polar-sort', reason: '兩組邊向量依極角合併。' }],
  'circle-tangents': [{ lessonId: 'circle-intersection', reason: '先理解圓心距、半徑與相交分類。' }],
  'smallest-enclosing-circle': [{ lessonId: 'circle-intersection', reason: '答案由兩點直徑圓或三點外接圓決定。' }],
  'closest-pair': [{ lessonId: 'sweep-line', reason: '候選集合隨 x 掃描線前進而加入與過期。' }],
  'voronoi-diagram': [{ lessonId: 'line-intersection', reason: 'Voronoi 邊位於兩 site 的垂直平分線。' }],
  'delaunay-triangulation': [{ lessonId: 'voronoi-diagram', reason: 'Delaunay 與 Voronoi 是平面對偶。' }, { lessonId: 'circle-intersection', reason: '空外接圓判定是核心 invariant。' }],
  fft: [{ lessonId: 'fast-exponentiation', reason: '先理解重複平方與分治式的冪次結構。' }],
  ntt: [{ lessonId: 'fft', reason: 'Butterfly 與正反轉換流程相同，只把複數根改為有限域原根。' }, { lessonId: 'modular-inverse', reason: '反轉換最後需要乘 n^{-1}。' }],
  'fast-walsh-hadamard-transform': [{ lessonId: 'fft', reason: '先理解 transform → pointwise product → inverse 的卷積流程。' }],
  'lagrange-interpolation': [{ lessonId: 'modular-inverse', reason: '有限域中的基底分母需要可逆。' }],
  'berlekamp-massey': [{ lessonId: 'fibonacci-dp', reason: '先理解線性遞迴如何由前項生成後項。' }, { lessonId: 'modular-inverse', reason: '有限域 discrepancy 修正需要除以先前差值。' }],
}

const localPrerequisiteByCategory: Record<CategoryId, KnowledgeTerm[]> = {
  'search-sort': [
    { term: '索引與區間', meaning: '本網站一律明確標示閉區間 [l,r] 或半開區間 [l,r)，端點定義不能混用。' },
    { term: '單調性', meaning: '某個方向只會變大或只會變小，才可以一次排除一整批候選。' },
  ],
  'linear-structures': [
    { term: '容器不變量', meaning: '先定義哪一端加入、哪一端取出，以及容器內元素保持的順序。' },
    { term: '攤銷分析', meaning: '單一步驟可能很慢，但每個元素總共只被加入與移除常數次。' },
  ],
  graph: [
    { term: '圖的表示', meaning: 'adj[u] 保存從節點 u 能走到的鄰居；有向邊只記單向，無向邊要記兩次。' },
    { term: '走訪狀態', meaning: '未發現、已加入 frontier、已完成必須分清楚，避免重複處理。' },
  ],
  trees: [
    { term: '根與父節點', meaning: '選定 root 後，每個非根節點有唯一 parent；depth 是到 root 的邊數。' },
    { term: '子樹', meaning: '節點 u 與所有以 u 為祖先的後代形成 subtree(u)。' },
  ],
  'data-structures': [
    { term: '聚合運算', meaning: '節點保存的資訊必須能由左右兩段合併，例如 sum、min、max 或 gcd。' },
    { term: '查詢與修改', meaning: '先定義資料是靜態、單點修改或區間修改，才能選擇正確結構。' },
  ],
  'dynamic-programming': [
    { term: '狀態', meaning: 'dp[...] 的每個維度都必須用一句精確句子定義，包含已處理範圍與限制。' },
    { term: '轉移與初始值', meaning: '轉移只可讀取已完成狀態；base case 是最小、可直接回答的子問題。' },
  ],
  strings: [
    { term: '前綴／後綴', meaning: '前綴從索引 0 開始，後綴延伸到字串末端；proper prefix 不等於整個字串。' },
    { term: '匹配位置', meaning: '必須區分文字索引、模式索引與已匹配長度，失配後只回退模式狀態。' },
  ],
  'flow-matching': [
    { term: '殘餘網路', meaning: '正向剩餘容量表示還能送多少；反向邊表示能撤回多少既有流。' },
    { term: '增廣路', meaning: '在殘餘網路從 source 到 sink 的正容量路徑，瓶頸決定本次能增加的流。' },
  ],
  mathematics: [
    { term: '不變量／等價式', meaning: '每一步變形都要保持與原問題等價，不能只背公式。' },
    { term: '模運算安全', meaning: '負數要 normalize，中間乘法要使用足夠寬的型別或安全模乘。' },
  ],
  geometry: [
    { term: '向量與外積', meaning: 'cross(b−a,c−a) 的符號表示 a→b 到 a→c 的旋轉方向。' },
    { term: '退化情況', meaning: '共線、重點、端點接觸與浮點誤差都必須在主流程外明確處理。' },
  ],
  advanced: [
    { term: '代數結構', meaning: '先確認運算的單位元、反元素與結合律，轉換公式才有意義。' },
    { term: '正轉換與逆轉換', meaning: '資料轉到容易運算的表示，完成逐點操作後必須正確還原。' },
  ],
}

const naiveByCategory: Record<CategoryId, string> = {
  'search-sort': '最直接的方法通常是逐一枚舉所有候選或每次重新掃描整個區間；正確但會重複做大量已知工作。',
  'linear-structures': '若每次都在普通陣列中搬移、重新搜尋候選，單次操作可能退化成 O(n)。',
  graph: '直接枚舉所有路徑通常是指數級；即使重複 DFS，也會一再掃描相同節點與邊。',
  trees: '每個查詢都從根重新 DFS 可以得到答案，但多次查詢會重複走過同一批父子邊。',
  'data-structures': '每次 query 都線性掃描 [l,r]，每次 update 直接改完整區間，至少一種操作會是 O(n)。',
  'dynamic-programming': '直接遞迴枚舉所有選擇會反覆計算相同子問題，常見成本是指數級。',
  strings: '在文字的每個起點重新逐字比較，最壞會重複比對相同前綴而達 O(nm)。',
  'flow-matching': '枚舉所有配置、割或匹配組合是指數級，也很難局部修正已做的選擇。',
  mathematics: '逐次模擬、試除或枚舉所有可能值通常無法處理競賽題的大範圍限制。',
  geometry: '枚舉所有點、邊或圖形組合通常達 O(n²) 以上，且退化邊界容易漏判。',
  advanced: '直接做係數卷積、逐點求值或枚舉完整狀態通常至少 O(n²)，大資料下不可行。',
}

const memoryByCategory: Record<CategoryId, string> = {
  'search-sort': '通常 O(1)～O(n)，取決於是否需要複製、排序或離線保存事件。',
  'linear-structures': 'O(n)，每個尚未淘汰的元素至多保存一次。',
  graph: 'O(V+E)，包含鄰接表與每個節點的狀態。',
  trees: 'O(V log V) 上限；基本遍歷為 O(V)，倍增或分層表會再乘 log V。',
  'data-structures': '通常 O(n)～O(n log n)，由每個元素被保存的層數決定。',
  'dynamic-programming': '等於狀態數；能否滾動陣列取決於轉移只讀取哪些前一層。',
  strings: '通常 O(n+ m) 或 O(總模式長度)，保存前綴狀態與轉移。',
  'flow-matching': 'O(V+E)，每條原始邊另有一條反向殘餘邊。',
  mathematics: '通常 O(1)～O(n)，由是否預處理表格或保存基底決定。',
  geometry: '通常 O(n)，保存排序後物件與目前候選集合。',
  advanced: 'O(n)，保存轉換陣列、係數或遞迴狀態。',
}

const dataStructureOperations: Record<string, KnowledgeOperation[]> = {
  'segment-tree': [
    { name: 'build', purpose: '由葉節點的原始值向上合併，建立每個區間節點。', reads: 'array、左右子節點', writes: 'tree[node]', complexity: 'O(n)' },
    { name: 'query', purpose: '把 [ql,qr] 分解成互斥的完整節點並合併答案。', reads: '節點區間、tree[node]', writes: '遞迴回傳的聚合值', complexity: 'O(log n)' },
    { name: 'pointUpdate', purpose: '修改一個葉節點，再沿祖先路徑重新 pull。', reads: '目標索引與兄弟節點', writes: '葉節點及 O(log n) 個祖先', complexity: 'O(log n)' },
  ],
  'lazy-tree': [
    { name: 'build', purpose: '建立基礎 Segment Tree 與每個節點的區間聚合。', reads: 'array', writes: 'tree、lazy 初值', complexity: 'O(n)' },
    { name: 'apply / compose', purpose: '把區間修改套到整個節點，並把尚未下傳的標記按正確順序合成。', reads: '節點長度、舊 tag、新 tag', writes: 'tree[node]、lazy[node]', complexity: 'O(1)' },
    { name: 'push', purpose: '進入子節點前把父節點標記傳下去並清空父標記。', reads: 'lazy[node]', writes: '兩個子節點的值與 tag', complexity: 'O(1)' },
    { name: 'rangeUpdate / rangeQuery', purpose: '完整覆蓋直接 apply；部分覆蓋先 push 再遞迴並 pull。', reads: '查詢／修改區間', writes: '被覆蓋節點與祖先', complexity: 'O(log n)' },
  ],
  'fenwick-tree': [
    { name: 'build', purpose: '以逐點 add 或線性建表建立各 lowbit 區塊和。', reads: 'array', writes: 'bit[]', complexity: 'O(n log n)；可最佳化為 O(n)' },
    { name: 'add', purpose: '修改索引 i，並更新所有包含 i 的祖先區塊。', reads: 'i、delta', writes: 'bit[i], bit[i+lowbit(i)], ...', complexity: 'O(log n)' },
    { name: 'prefixSum', purpose: '反覆移除最低設定位元，合併覆蓋 [1,i] 的互斥區塊。', reads: 'bit[i], bit[i-lowbit(i)], ...', writes: 'answer', complexity: 'O(log n)' },
    { name: 'rangeSum', purpose: '以 prefixSum(r)-prefixSum(l-1) 回答區間。', reads: '兩個前綴和', writes: 'query result', complexity: 'O(log n)' },
  ],
  'sparse-table': [
    { name: 'initialize logs', purpose: '預先計算 floor(log2(length))，讓 query 直接選擇層級。', reads: '區間長度 1..n', writes: 'log2[]', complexity: 'O(n)' },
    { name: 'build', purpose: '預先計算每個起點、每個 2^k 長度區間的答案。', reads: 'array、前一層兩半', writes: 'table[k][i]', complexity: 'O(n log n)' },
    { name: 'query', purpose: '用兩個可重疊的 2^k 區塊回答冪等操作，或依序分解一般操作。', reads: 'table 與 log table', writes: 'query result', complexity: 'O(1)（RMQ）' },
  ],
  'disjoint-sets': [
    { name: 'makeSet', purpose: '每個元素一開始自成集合，parent 指向自己。', reads: '元素範圍', writes: 'parent、size/rank', complexity: 'O(n)' },
    { name: 'find', purpose: '沿 parent 找代表元，並以路徑壓縮縮短後續查詢。', reads: 'parent chain', writes: '壓縮後的 parent', complexity: '攤銷 α(n)' },
    { name: 'unite', purpose: '先 find 兩個代表元，不同集合才按 size/rank 合併。', reads: '兩個 root 與 size/rank', writes: 'parent、size/rank', complexity: '攤銷 α(n)' },
    { name: 'same', purpose: '比較兩個元素的代表元判斷是否連通。', reads: 'find(a)、find(b)', writes: 'boolean result', complexity: '攤銷 α(n)' },
  ],
  'fenwick-2d': [
    { name: 'build', purpose: '配置 (H+1)×(W+1) 的 BIT，逐點加入初始值。', reads: 'grid', writes: 'bit[x][y]', complexity: 'O(HW log H log W)' },
    { name: 'add', purpose: '在兩個座標軸都沿 lowbit 祖先更新。', reads: '(x,y,delta)', writes: '所有覆蓋該點的二維區塊', complexity: 'O(log H log W)' },
    { name: 'prefixSum', purpose: '合併矩形 [1..x]×[1..y] 的互斥 lowbit 區塊。', reads: 'bit[][]', writes: 'prefix result', complexity: 'O(log H log W)' },
    { name: 'rectangleSum', purpose: '用四個二維前綴值做 inclusion-exclusion。', reads: '四次 prefixSum', writes: 'rectangle result', complexity: 'O(log H log W)' },
  ],
  'segment-tree-2d': [
    { name: 'buildX / buildY', purpose: '外層切 x 區間，每個外層節點再建立完整 y 軸聚合。', reads: 'grid', writes: 'tree[xNode][yNode]', complexity: 'O(HW)' },
    { name: 'rectangleQuery', purpose: '先分解 x 範圍，再於每個命中節點查 y 範圍。', reads: '矩形端點與二維節點', writes: 'rectangle result', complexity: 'O(log H log W)' },
    { name: 'pointUpdate', purpose: '修改一格，沿 x、y 兩條祖先路徑重新合併。', reads: '(x,y,value)', writes: 'O(log H log W) 個節點', complexity: 'O(log H log W)' },
  ],
  'dynamic-segment-tree': [
    { name: 'initialize root', purpose: '根只記錄巨大座標域，不預先建立全部節點。', reads: '全域座標邊界', writes: 'root', complexity: 'O(1)' },
    { name: 'ensure child', purpose: '遞迴真正進入某半區時才配置對應孩子。', reads: '目前區間與操作位置', writes: '缺少的 child pointer', complexity: 'O(1) per created node' },
    { name: 'query', purpose: '未建立節點視為單位元；其餘沿相交區間遞迴。', reads: '已存在節點', writes: 'query result', complexity: 'O(log C)' },
    { name: 'update', purpose: '沿目標路徑開點、修改並向上 pull。', reads: 'position/range update', writes: 'O(log C) 個節點', complexity: 'O(log C)' },
  ],
  'merge-sort-tree': [
    { name: 'build', purpose: '葉節點放單值，內部節點 merge 兩個已排序子陣列。', reads: 'array 與兩個孩子', writes: '每節點 sorted vector', complexity: 'O(n log n)' },
    { name: 'countLess / countLE', purpose: '把索引區間拆成節點，於每個 sorted vector 二分值域。', reads: '區間、threshold、lower/upper_bound', writes: 'count result', complexity: 'O(log² n)' },
    { name: 'kth', purpose: '對答案值域二分，反覆使用區間計數判斷第 k 小所在側。', reads: 'countLE', writes: 'kth value', complexity: 'O(log² n log V)' },
  ],
  'segment-tree-beats': [
    { name: 'build', purpose: '每節點建立 sum、最大值、次大值與最大值出現次數。', reads: 'array', writes: 'node statistics', complexity: 'O(n)' },
    { name: 'rangeChmin', purpose: '若 x 介於最大與次大間，可只降低最大值族群；否則下推。', reads: 'max1、max2、countMax', writes: 'sum、max1、lazy ceiling', complexity: '攤銷 O(log² n)' },
    { name: 'push / pull', purpose: '把父節點上限套到孩子，完成後重算完整統計。', reads: 'parent/children statistics', writes: 'children/parent', complexity: 'O(1)' },
    { name: 'rangeQuery', purpose: '以 Segment Tree 標準區間分解回答 sum/max。', reads: 'node statistics', writes: 'query result', complexity: 'O(log n)' },
  ],
  'persistent-tree': [
    { name: 'build version 0', purpose: '建立初始根；空樹或完整建樹皆須定義單位元。', reads: 'initial array', writes: 'roots[0] 與 node pool', complexity: 'O(n)' },
    { name: 'update(oldRoot)', purpose: '只複製根到目標葉的路徑，未改分支與舊版本共用。', reads: 'oldRoot、index、value', writes: 'newRoot 與 O(log n) 新節點', complexity: 'O(log n)' },
    { name: 'query(root)', purpose: '從指定版本根執行普通 Segment Tree query。', reads: 'version root、range', writes: 'query result', complexity: 'O(log n)' },
    { name: 'version management', purpose: '每個版本保存唯一 root；不得原地改寫共用舊節點。', reads: 'roots[]', writes: 'new roots entry', complexity: 'O(1)' },
  ],
  'balanced-bst': [
    { name: 'initialize', purpose: '建立空根；每個節點定義 key、孩子與維持平衡所需 metadata。', reads: '無', writes: 'root=null', complexity: 'O(1)' },
    { name: 'find / lowerBound', purpose: '依 BST 大小關係只走一條根到葉路徑。', reads: 'key 與 child pointers', writes: '查找結果', complexity: 'O(log n) expected/amortized' },
    { name: 'insert', purpose: '按 key 插入，再以 rotation、split/merge 或 splay 恢復結構 invariant。', reads: 'new key', writes: '一條搜尋路徑與 metadata', complexity: 'O(log n) expected/amortized' },
    { name: 'erase', purpose: '找到目標後合併左右子樹或旋轉移除，並向上 pull。', reads: 'target key', writes: 'links、size/aggregate', complexity: 'O(log n) expected/amortized' },
  ],
  'line-container': [
    { name: 'initialize domain', purpose: '定義可查詢的 x 範圍與 min/max 單位值。', reads: 'coordinate bounds', writes: 'empty root', complexity: 'O(1)' },
    { name: 'addLine', purpose: '比較新舊直線在區間端點與中點的優劣，保留中點較優者並遞迴可能翻轉的一側。', reads: 'new line、current line', writes: 'O(log C) nodes', complexity: 'O(log C)' },
    { name: 'query', purpose: '沿包含 x 的根到葉路徑，取所有經過直線的最佳值。', reads: 'x 與 path lines', writes: 'minimum/maximum', complexity: 'O(log C)' },
  ],
  wavelet: [
    { name: 'build levels', purpose: '依值域中點或 bit 對序列穩定分割，並保存每個前綴走左側的數量。', reads: 'sequence', writes: 'rank prefix per level', complexity: 'O(n log σ)' },
    { name: 'rank / frequency', purpose: '每層用 prefix count 把 [l,r) 映射到下一層。', reads: 'range、value bounds', writes: 'frequency result', complexity: 'O(log σ)' },
    { name: 'kth', purpose: '比較目前區間落到左側的數量，決定第 k 小的下一個 bit/分支。', reads: 'rank prefix、k', writes: 'kth value', complexity: 'O(log σ)' },
  ],
  'spatial-tree': [
    { name: 'build', purpose: '交替選擇座標軸，以中位數切分並為每個節點保存 bounding box。', reads: 'points', writes: 'balanced spatial tree', complexity: 'O(n log n)' },
    { name: 'insert / rebuild', purpose: '沿座標切分插入；若允許動態操作，需維持平衡或定期重建。', reads: 'new point', writes: 'path and bounding boxes', complexity: 'Expected O(log n)' },
    { name: 'range / nearest query', purpose: '若 bounding box 不可能改善答案就剪枝，否則進入孩子。', reads: 'query shape、bounding boxes', writes: 'candidate answer', complexity: '平均 O(log n)，最壞 O(n)' },
  ],
  'dynamic-tree': [
    { name: 'initialize forest', purpose: '每個節點先是獨立樹，並初始化 path aggregate 與 lazy reversal。', reads: 'vertices', writes: 'forest nodes', complexity: 'O(V)' },
    { name: 'makeroot / expose', purpose: '重排 preferred path，讓指定路徑成為可直接聚合的輔助樹。', reads: 'dynamic forest links', writes: 'auxiliary tree links/tags', complexity: '攤銷 O(log V)' },
    { name: 'link / cut', purpose: '先檢查連通與邊存在，再新增或刪除實體樹邊。', reads: 'u、v', writes: 'forest topology', complexity: '攤銷 O(log V)' },
    { name: 'pathQuery / pathUpdate', purpose: 'expose(u,v) 後在輔助樹根讀取或套用整條路徑。', reads: 'exposed path', writes: 'aggregate/tag or result', complexity: '攤銷 O(log V)' },
  ],
  'persistent-dsu': [
    { name: 'build version 0', purpose: '初始化每個 parent 與 size，並建立可保存歷史的儲存結構。', reads: 'n', writes: 'version 0', complexity: 'O(n)' },
    { name: 'find(version,x)', purpose: '在指定版本沿 parent 找 root；持久化版本通常不能任意原地壓縮路徑。', reads: 'versioned parent', writes: 'root result', complexity: 'O(log n) 或 O(log² n)' },
    { name: 'unite(version,a,b)', purpose: '按 size 合併兩個 root，只建立被修改位置的新版本。', reads: 'old version', writes: 'new version root', complexity: 'O(log n) 或 O(log² n)' },
    { name: 'same(version,a,b)', purpose: '在同一版本比較兩個代表元。', reads: 'two versioned find calls', writes: 'boolean result', complexity: '同 find' },
  ],
  trie: [
    { name: 'initialize root', purpose: '建立不代表字元的 root，轉移表為空，終止標記為 false。', reads: 'alphabet definition', writes: 'root node', complexity: 'O(1)' },
    { name: 'insert', purpose: '逐字元沿 transition 前進，缺少節點才建立，最後標記 word end。', reads: 'word', writes: 'missing nodes/end count', complexity: 'O(length)' },
    { name: 'search', purpose: '逐字元檢查轉移；全部存在且終止標記成立才是完整單字。', reads: 'word and transitions', writes: 'boolean/count result', complexity: 'O(length)' },
    { name: 'prefixQuery / erase', purpose: '前綴查詢不要求終止標記；刪除時以計數避免破壞其他共享前綴。', reads: 'prefix/word', writes: 'count or erase counts', complexity: 'O(length)' },
  ],
  heap: [
    { name: 'buildHeap', purpose: '由最後一個內部節點向前 siftDown，建立 Heap invariant。', reads: 'array', writes: 'heap array', complexity: 'O(n)' },
    { name: 'push', purpose: '把新值放到尾端並 siftUp。', reads: '新值與父節點', writes: '根到新葉路徑', complexity: 'O(log n)' },
    { name: 'top', purpose: '讀取根節點的最小值或最大值。', reads: 'heap[0]', writes: '無', complexity: 'O(1)' },
    { name: 'pop', purpose: '用末尾值替換根，再 siftDown 恢復順序。', reads: '根、末尾與孩子', writes: '一條根到葉路徑', complexity: 'O(log n)' },
  ],
  stack: [
    { name: 'initialize', purpose: '建立空 Stack，定義頂端是唯一可存取位置。', reads: '無', writes: 'empty stack', complexity: 'O(1)' },
    { name: 'push', purpose: '把元素加入頂端。', reads: 'new value', writes: 'top', complexity: 'O(1)' },
    { name: 'top', purpose: '讀取最後加入且尚未移除的元素。', reads: 'top', writes: '無', complexity: 'O(1)' },
    { name: 'pop', purpose: '移除頂端元素。', reads: 'top', writes: 'stack size', complexity: 'O(1)' },
  ],
  queue: [
    { name: 'initialize', purpose: '建立空 Queue，定義 front 取出、back 加入。', reads: '無', writes: 'empty queue', complexity: 'O(1)' },
    { name: 'push', purpose: '把新工作加入尾端。', reads: 'new value', writes: 'back', complexity: 'O(1)' },
    { name: 'front', purpose: '讀取最早加入且尚未處理的元素。', reads: 'front', writes: '無', complexity: 'O(1)' },
    { name: 'pop', purpose: '移除前端已處理元素。', reads: 'front', writes: 'queue size', complexity: 'O(1)' },
  ],
  deque: [
    { name: 'initialize', purpose: '建立可從兩端存取的空容器。', reads: '無', writes: 'empty deque', complexity: 'O(1)' },
    { name: 'push_front / push_back', purpose: '依優先級或時間順序從指定端加入。', reads: 'new value', writes: 'front 或 back', complexity: 'O(1)' },
    { name: 'front / back', purpose: '讀取兩端候選。', reads: '兩端元素', writes: '無', complexity: 'O(1)' },
    { name: 'pop_front / pop_back', purpose: '移除已處理或已淘汰候選。', reads: '兩端元素', writes: 'deque size', complexity: 'O(1)' },
  ],
}

const requiredVocabularyById: Record<string, KnowledgeTerm[]> = {
  dijkstra: [{ term: 'relax（鬆弛）', meaning: '若 dist[u]+w 比 dist[v] 小，就更新 dist[v] 並把新候選放入 Priority Queue。' }],
  'topological-sort': [{ term: 'indegree（入度）', meaning: '指向節點 u 的邊數；Kahn 演算法只有在 indegree[u]=0 時才能安全輸出 u。' }],
  dsu: [
    { term: 'parent', meaning: 'parent[x] 指向 x 在並查集森林中的父節點；root 的 parent 是自己。' },
    { term: 'rank / size', meaning: '合併時用來把較小或較矮的樹接到較大樹，避免高度失控。' },
  ],
  'fenwick-tree': [{ term: 'lowbit', meaning: 'lowbit(i)=i&(-i)，表示 bit[i] 所負責區間的長度，也是走向祖先或前一塊的步長。' }],
  'lazy-segment-tree': [{ term: 'lazy tag', meaning: '已作用在整個節點、但尚未傳到孩子的區間修改；進入孩子前必須 push。' }],
  kmp: [{ term: 'prefix function', meaning: 'pi[i] 是 pattern[0..i] 的最長 proper prefix 且同時為 suffix 的長度；失配時沿 pi 回退。' }],
  'fibonacci-dp': [{ term: 'state', meaning: 'dp[i] 精確代表第 i 個子問題的答案；每個轉移只能讀取已完成的較小狀態。' }],
  'digit-dp': [
    { term: 'memoization', meaning: '相同 pos/tight/started/constraint 狀態只計算一次；tight=false 的狀態才可跨不同前綴共用。' },
    { term: 'tight', meaning: '目前前綴是否仍等於上界前綴；若為 true，本位數字不可超過上界對應位。' },
  ],
  'sprague-grundy': [{ term: 'memoization', meaning: '每個賽局狀態的 SG 值只遞迴計算一次，之後直接查表。' }],
  'aho-corasick': [{ term: 'failure link', meaning: '目前 Trie 路徑失配時，跳到仍可能匹配的最長 proper suffix 狀態。' }],
  bridges: [{ term: 'low-link', meaning: 'low[u] 是 u 的 DFS 子樹經樹邊與至多一條回邊能到達的最早發現時間。' }],
  'min-cost-max-flow': [{ term: 'potential', meaning: '以節點勢能重加權殘餘邊，使 reduced cost 非負後才能安全使用 Dijkstra。' }],
  'heavy-light-decomposition': [{ term: 'heavy child', meaning: '子樹最大的孩子；沿 heavy edge 前進時子樹大小不會快速減半，因此任一路徑只跨 O(log n) 條輕邊。' }],
}

const firstSentence = (text: string) => text.split(/(?<=[。！？])/).find((part) => part.trim())?.trim() ?? text
const cleanState = (frame: Frame) => Object.entries(frame.state ?? {})
  .filter(([key]) => !['phase', 'algorithm', 'timelineStep', 'microStep', 'microPhase'].includes(key))
  .slice(0, 3)
  .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join(', ') : String(value)}`)
  .join('；')

const inferInput = (lesson: AlgorithmLesson) => {
  if (lesson.visual === 'graph' || lesson.visual === 'flow') return '節點、邊與題目指定的起點／終點或限制'
  if (lesson.visual === 'tree' || lesson.visual.includes('tree')) return '原始陣列／樹結構、操作參數與索引範圍'
  if (lesson.visual === 'string') return '文字、模式字串或字串集合'
  if (lesson.visual === 'geometry') return '點、向量、線段或幾何物件集合'
  if (lesson.visual === 'dp') return '題目限制、可選元素與目標狀態'
  return '題目輸入資料與本演算法需要的查詢／操作參數'
}

const operationNamesByCategory: Record<CategoryId, [string, string, string, string]> = {
  'search-sort': ['validate input', 'initialize / arrange', 'scan / eliminate', 'return answer'],
  'linear-structures': ['define order invariant', 'initialize container', 'push / inspect / remove', 'verify output'],
  graph: ['build graph', 'initialize state / frontier', 'traverse / relax', 'finalize result'],
  trees: ['root the tree', 'preprocess parent / subtree', 'process path / component', 'answer / merge'],
  'data-structures': ['define node invariant', 'build', 'query', 'update / maintain'],
  'dynamic-programming': ['define dp state', 'initialize base cases', 'transition in dependency order', 'extract / reconstruct answer'],
  strings: ['define matching state', 'build prefix / index', 'scan and transition', 'report matches'],
  'flow-matching': ['build residual / relation graph', 'initialize feasible state', 'augment / improve', 'prove termination and output'],
  mathematics: ['state invariant / equation', 'initialize base values', 'iterate equivalent transform', 'normalize and return'],
  geometry: ['define predicate / orientation', 'normalize and order input', 'sweep / construct / test', 'handle degeneracy and output'],
  advanced: ['validate algebraic domain', 'pad / initialize representation', 'transform / combine', 'inverse / recover answer'],
}

const inferOperations = (lesson: AlgorithmLesson): KnowledgeOperation[] => {
  const model = lesson.visualModel ?? ''
  const exact = dataStructureOperations[lesson.id] ?? dataStructureOperations[model]
  if (exact) return exact
  const milestones = [lesson.frames[0], lesson.frames[Math.floor(lesson.frames.length / 3)], lesson.frames[Math.floor(lesson.frames.length * 2 / 3)], lesson.frames.at(-1)!]
  const names = operationNamesByCategory[lesson.categoryId]
  return milestones.map((frame, index) => ({
    name: names[index],
    purpose: firstSentence(frame.explanation),
    reads: index === 0 ? inferInput(lesson) : cleanState(frame) || '目前候選與已建立狀態',
    writes: index === 2 ? '最終答案與正確性檢查' : cleanState(frame) || '下一步所需狀態',
    complexity: index === 2 ? lesson.complexity : index === 0 ? '包含於整體複雜度' : '每次轉移依程式碼所示',
  }))
}

const inferComplexity = (lesson: AlgorithmLesson, operations: KnowledgeOperation[]): KnowledgeComplexity => {
  const build = operations.find((operation) => /build|initialize|makeSet/i.test(operation.name))
  const query = operations.find((operation) => /query|find|top|front|same|prefix/i.test(operation.name))
  const update = operations.find((operation) => /update|add|push|pop|unite|apply/i.test(operation.name))
  return {
    preprocessing: build?.complexity ?? '無獨立預處理；初始化成本包含在整體流程中。',
    query: query?.complexity ?? (/Query/i.test(lesson.complexity) ? lesson.complexity : '本課是一次性演算法，沒有獨立 query API。'),
    update: update?.complexity ?? '靜態演算法；輸入改變時需重新執行，沒有線上 update。',
    memory: memoryByCategory[lesson.categoryId],
    note: `本課標示的主時間界為 ${lesson.complexity}；比較複雜度時要同時確認輸入模型與可否修改。`,
  }
}

const edgeCasesByCategory: Record<CategoryId, string[]> = {
  'search-sort': ['空陣列、單一元素、重複值，以及答案不存在。', 'l、r 的閉／半開定義與最後一格是否被處理。'],
  'linear-structures': ['對空容器呼叫 top/front/pop 前必須先檢查。', '重複值的淘汰條件應使用 < 還是 ≤，會直接改變答案。'],
  graph: ['圖可能不連通；只從單一起點走訪不代表處理了全部節點。', '無向邊、平行邊、自環與不可達節點必須依題目分別處理。'],
  trees: ['n=1 時沒有父邊；root 的 parent 與 depth 要有明確哨兵值。', '遞迴深度可能達 O(n)，長鏈需要迭代 DFS 或調整 Stack 策略。'],
  'data-structures': ['n=0、n=1，以及查詢空區間或完整範圍。', '索引基底 0/1-base、區間端點與單位元必須全程一致。'],
  'dynamic-programming': ['不可達狀態不能參與 min/max；INF 加法前要先檢查。', '更新方向錯誤可能讓同一個物品或狀態在同一層被重複使用。'],
  strings: ['空模式、長度 1、全部相同字元與高度重複前綴。', '字元編碼、分隔符與 hash collision 必須符合題目字元集。'],
  'flow-matching': ['source=sink、零容量邊、平行邊與反向邊索引。', '每次更新正向殘餘容量時必須同步增加反向容量。'],
  mathematics: ['0、1、負數與模數為 1 的定義要先確認。', '乘法溢位、負餘數與不存在逆元。'],
  geometry: ['重複點、共線、端點相切與零長度線段。', '整數外積可能溢位；浮點比較要使用一致 epsilon。'],
  advanced: ['長度不是 2 的冪時的 padding 與逆轉換 normalization。', '模數、原根、可逆元素或輸入長度不滿足代數前提。'],
}

const implementationAssumptions = (lesson: AlgorithmLesson) => {
  const assumptions = [
    `程式碼使用 C++17；索引、輸入型別與回傳值以本課「輸入／輸出契約」為準。`,
    `所有在程式中使用的容器與狀態，都必須先依 initialization 段落完成配置與初值。`,
  ]
  if (extensionLessonIds.has(lesson.id)) assumptions.push('延伸課程只新增本課操作；共用基礎結構沿用上方先備課程的完整 invariant 與 API。')
  return assumptions
}

const extensionLessonIds = new Set([
  'parallel-binary-search', 'multi-source-bfs', 'zero-one-bfs', 'negative-cycle-reconstruction', 'condensation-graph',
  'weighted-dsu', 'rollback-dsu', 'offline-dynamic-connectivity', 'tree-distance-queries', 'heavy-light-decomposition',
  'centroid-decomposition', 'dsu-on-tree', 'virtual-tree', 'kruskal-reconstruction-tree', 'iterative-segment-tree',
  'lazy-segment-tree', 'persistent-segment-tree', 'dynamic-segment-tree', 'merge-sort-tree', 'segment-tree-beats',
  'fenwick-tree-2d', 'segment-tree-2d', 'disjoint-sparse-table', 'implicit-treap', 'link-cut-tree',
  'euler-tour-tree', 'persistent-dsu', 'rerooting-dp', 'tsp-dp', 'profile-dp', 'dp-reconstruction',
  'divide-conquer-dp', 'knuth-optimization', 'monotone-queue-optimization', 'aliens-optimization', 'lcp-array',
  'aho-corasick', 'minimum-cut', 'edmonds-karp', 'push-relabel', 'flow-lower-bounds', 'circulation-demands',
  'hopcroft-karp', 'sprague-grundy', 'linear-sieve', 'pollard-rho', 'rotating-calipers', 'circle-tangents',
  'delaunay-triangulation', 'ntt',
])

const coreIdeaById: Record<string, string> = {
  'segment-tree': '把每個區間答案保存成樹節點。Build 由葉往上建立摘要；Query 只取完整落入範圍的互斥節點；Update 改葉後沿同一路徑重新合併祖先。',
  'lazy-segment-tree': '先把基礎 Segment Tree 的 point update 推廣成整段 apply；若暫時不必進入孩子，就把尚未下傳的修改合成 lazy tag。',
  dijkstra: 'dist[v] 是目前已知最短候選；Priority Queue 每次取出最小候選，過期項目略過，並以 relaxation 改善鄰居。非負邊權使最新最小候選可被確定。',
  kmp: '用 prefix function 記住「失配後仍可保留的最長前綴長度」，因此文字索引不用倒退，只回退模式狀態。',
  'lca-binary-lifting': '先用 DFS 建 depth 與 parent，再預處理 2^k 祖先；查詢時先拉平深度，接著由大到小同步跳躍。',
}

const buildKnowledge = (lesson: AlgorithmLesson): KnowledgeUnit => {
  const guide = lesson.beginnerGuide!
  const operations = inferOperations(lesson)
  const first = lesson.frames[0]
  const middle = lesson.frames[Math.floor(lesson.frames.length / 2)]
  const last = lesson.frames.at(-1)!
  const dependencies = dependencyById[lesson.id] ?? []
  const structure = [...guide.glossary, ...(requiredVocabularyById[lesson.id] ?? [])]
  for (const [key, value] of Object.entries(first.state ?? {})) {
    if (structure.length >= 6) break
    if (!structure.some((item) => item.term.toLowerCase() === key.toLowerCase())) structure.push({ term: key, meaning: `在本課範例中的初始意義是「${Array.isArray(value) ? value.join(', ') : String(value)}」。` })
  }
  return {
    motivation: {
      problem: `${lesson.zhTitle} 要處理的核心任務是：${lesson.description}`,
      why: `當輸入規模變大或同類操作重複出現時，需要用「${guide.invariant}」避免重做已能證明的工作。`,
      naive: naiveByCategory[lesson.categoryId],
    },
    coreIdea: coreIdeaById[lesson.id] ?? firstSentence(middle.explanation),
    mentalModel: guide.mentalModel,
    prerequisites: dependencies,
    localPrerequisites: localPrerequisiteByCategory[lesson.categoryId],
    structure,
    initialization: {
      goal: first.title,
      steps: [firstSentence(first.explanation), first.beginner?.result ?? `初始化後狀態：${cleanState(first)}`],
      result: `核心操作開始前，必須已建立：${cleanState(first) || guide.prerequisite}`,
    },
    operations,
    operationFlow: operations.map((operation, index) => `${index + 1}. ${operation.name}：${operation.purpose}`),
    complexity: inferComplexity(lesson, operations),
    implementation: {
      scope: extensionLessonIds.has(lesson.id) ? 'extension' : 'complete-core',
      input: inferInput(lesson),
      output: `符合「${lesson.description.replace(/[。.]$/, '')}」的答案或更新後狀態。`,
      assumptions: implementationAssumptions(lesson),
      relationship: operations.map((operation) => operation.name).join(' → '),
    },
    example: {
      input: cleanState(first) || inferInput(lesson),
      steps: [firstSentence(first.explanation), firstSentence(middle.explanation), firstSentence(last.explanation)],
      output: cleanState(last) || firstSentence(last.explanation),
    },
    mistakes: guide.pitfalls,
    edgeCases: edgeCasesByCategory[lesson.categoryId],
    extensions: [],
  }
}

export const enrichKnowledgeCatalog = (lessons: AlgorithmLesson[]) => {
  const ids = new Set(lessons.map((lesson) => lesson.id))
  const withKnowledge = lessons.map((lesson) => ({ ...lesson, knowledge: buildKnowledge(lesson) }))
  const extensionMap = new Map<string, KnowledgeDependency[]>()
  for (const lesson of withKnowledge) {
    for (const dependency of lesson.knowledge.prerequisites) {
      if (!ids.has(dependency.lessonId)) continue
      const extensions = extensionMap.get(dependency.lessonId) ?? []
      extensions.push({ lessonId: lesson.id, reason: `${lesson.zhTitle} 建立在本課概念之上。` })
      extensionMap.set(dependency.lessonId, extensions)
    }
  }
  return withKnowledge.map((lesson) => ({
    ...lesson,
    knowledge: {
      ...lesson.knowledge,
      extensions: (extensionMap.get(lesson.id) ?? []).slice(0, 8),
    },
  }))
}

export const knowledgeDependencies = dependencyById
