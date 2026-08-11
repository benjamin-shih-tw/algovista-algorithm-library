export type VisualModel =
  | 'array-search' | 'array-two-pointers' | 'array-window' | 'prefix-1d' | 'prefix-2d' | 'difference' | 'compression' | 'kadane'
  | 'sort-selection' | 'sort-adjacent' | 'sort-merge' | 'sort-partition' | 'counting-buckets' | 'meet-in-middle' | 'parallel-search'
  | 'interval-scheduling' | 'interval-covering' | 'interval-merging' | 'job-timeline' | 'heap-merge' | 'fractional-choice'
  | 'stack' | 'queue' | 'deque' | 'heap' | 'monotonic-stack' | 'monotonic-queue' | 'histogram-stack' | 'expression-stack'
  | 'graph-traversal' | 'grid-traversal' | 'shortest-path' | 'all-pairs-matrix' | 'dag-order' | 'euler-trail' | 'disjoint-sets'
  | 'scc-clusters' | 'lowlink' | 'mst-growth' | 'functional-graph' | 'two-sat' | 'dynamic-connectivity'
  | 'tree-traversal' | 'tree-path' | 'tree-centroid' | 'tree-decomposition' | 'tree-merging' | 'tree-encoding' | 'reconstruction-tree'
  | 'fenwick-tree' | 'segment-tree' | 'lazy-tree' | 'persistent-tree' | 'sparse-table' | 'sqrt-blocks' | 'balanced-bst'
  | 'fenwick-2d' | 'segment-tree-2d' | 'dynamic-segment-tree' | 'merge-sort-tree' | 'segment-tree-beats'
  | 'line-container' | 'wavelet' | 'spatial-tree' | 'dynamic-tree' | 'persistent-dsu'
  | 'dp-1d' | 'dp-2d' | 'dp-grid' | 'dp-bitmask' | 'dp-tree' | 'dag-dp' | 'dp-interval' | 'dp-digit' | 'dp-optimization' | 'dp-lines'
  | 'string-prefix' | 'trie' | 'string-automaton' | 'suffix-order' | 'suffix-tree' | 'suffix-automaton' | 'palindrome' | 'palindromic-tree'
  | 'flow-network' | 'bipartite-matching' | 'assignment' | 'stable-matching' | 'general-matching'
  | 'euclid' | 'sieve' | 'exponentiation' | 'matrix-power' | 'matrix-algebra' | 'xor-basis' | 'impartial-game' | 'congruence'
  | 'primality' | 'factorization' | 'discrete-log'
  | 'line-geometry' | 'polar-sort' | 'polygon' | 'convex-hull' | 'sweep-line' | 'circle-geometry' | 'closest-pair' | 'spatial-partition' | 'minkowski-sum'
  | 'fourier-transform' | 'polynomial' | 'linear-recurrence'

export interface PracticeProblem { judge: 'CSES' | 'AtCoder' | 'Codeforces'; title: string; url: string; note: string }

export const visualModelGroups: Record<VisualModel, string[]> = {
  'array-search': ['binary-search','linear-search'],
  'array-two-pointers': ['two-pointers'],
  'array-window': ['sliding-window'],
  'prefix-1d': ['prefix-sum','prefix-xor'],
  'prefix-2d': ['prefix-sum-2d'],
  difference: ['difference-array'],
  compression: ['coordinate-compression'],
  kadane: ['kadane'],
  'sort-selection': ['selection-sort'],
  'sort-adjacent': ['bubble-sort'],
  'sort-merge': ['merge-sort','inversion-counting'],
  'sort-partition': ['quick-sort','quickselect'],
  'counting-buckets': ['counting-sort'],
  'meet-in-middle': ['meet-in-the-middle'],
  'parallel-search': ['parallel-binary-search'],
  'interval-scheduling': ['interval-scheduling'],
  'interval-covering': ['interval-covering'],
  'interval-merging': ['interval-merging'],
  'job-timeline': ['job-scheduling'],
  'heap-merge': ['huffman-coding'],
  'fractional-choice': ['fractional-knapsack'],
  stack: ['stack','parentheses-matching'],
  queue: ['queue'],
  deque: ['deque'],
  heap: ['binary-heap'],
  'monotonic-stack': ['monotonic-stack','next-greater-element'],
  'monotonic-queue': ['monotonic-queue','sliding-window-maximum'],
  'histogram-stack': ['largest-rectangle-histogram'],
  'expression-stack': ['expression-evaluation','shunting-yard'],
  'graph-traversal': ['bfs','dfs','multi-source-bfs','connected-components','bipartite-coloring','cycle-detection'],
  'grid-traversal': ['flood-fill'],
  'shortest-path': ['dijkstra','zero-one-bfs','bellman-ford','dag-shortest-path','negative-cycle-reconstruction'],
  'all-pairs-matrix': ['floyd-warshall'],
  'dag-order': ['topological-sort','condensation-graph'],
  'euler-trail': ['euler-circuit'],
  'disjoint-sets': ['dsu','weighted-dsu','rollback-dsu'],
  'scc-clusters': ['tarjan-scc','kosaraju-scc'],
  lowlink: ['bridges','articulation-points','biconnected-components','bridge-tree','block-cut-tree'],
  'mst-growth': ['kruskal','prim','boruvka'],
  'functional-graph': ['functional-graph'],
  'two-sat': ['two-sat'],
  'dynamic-connectivity': ['offline-dynamic-connectivity'],
  'tree-traversal': ['tree-diameter','euler-tour-flattening','tree-isomorphism','tree-center'],
  'tree-path': ['lca-binary-lifting','tree-distance-queries'],
  'tree-centroid': ['tree-centroid','centroid-decomposition'],
  'tree-decomposition': ['heavy-light-decomposition'],
  'tree-merging': ['small-to-large','dsu-on-tree','virtual-tree'],
  'tree-encoding': ['prufer-code'],
  'reconstruction-tree': ['kruskal-reconstruction-tree'],
  'fenwick-tree': ['fenwick-tree'],
  'fenwick-2d': ['fenwick-tree-2d'],
  'segment-tree': ['segment-tree','iterative-segment-tree'],
  'segment-tree-2d': ['segment-tree-2d'],
  'dynamic-segment-tree': ['dynamic-segment-tree'],
  'merge-sort-tree': ['merge-sort-tree'],
  'segment-tree-beats': ['segment-tree-beats'],
  'lazy-tree': ['lazy-segment-tree'],
  'persistent-tree': ['persistent-segment-tree'],
  'sparse-table': ['sparse-table','disjoint-sparse-table'],
  'sqrt-blocks': ['sqrt-decomposition','mo-algorithm'],
  'balanced-bst': ['treap','implicit-treap','splay-tree','cartesian-tree','ordered-statistic-tree'],
  'line-container': ['li-chao-tree'],
  wavelet: ['wavelet-tree','wavelet-matrix'],
  'spatial-tree': ['kd-tree'],
  'dynamic-tree': ['link-cut-tree','euler-tour-tree'],
  'persistent-dsu': ['persistent-dsu'],
  'dp-1d': ['knapsack-01','coin-change','longest-increasing-subsequence','fibonacci-dp','unbounded-knapsack','subset-sum','probability-dp','dp-reconstruction'],
  'dp-2d': ['longest-common-subsequence','edit-distance','matrix-chain-multiplication'],
  'dp-grid': ['grid-dp'],
  'dp-bitmask': ['bitmask-dp','tsp-dp','profile-dp'],
  'dp-tree': ['tree-dp','rerooting-dp'],
  'dag-dp': ['dag-dp'],
  'dp-interval': ['interval-dp'],
  'dp-digit': ['digit-dp'],
  'dp-optimization': ['divide-conquer-dp','knuth-optimization','monotone-queue-optimization','aliens-optimization'],
  'dp-lines': ['convex-hull-trick','slope-trick'],
  'string-prefix': ['rolling-hash','kmp','z-algorithm','rabin-karp','duval-lyndon','minimum-string-rotation'],
  trie: ['trie'],
  'string-automaton': ['aho-corasick'],
  'suffix-order': ['suffix-array','lcp-array'],
  'suffix-tree': ['suffix-tree'],
  'suffix-automaton': ['suffix-automaton'],
  palindrome: ['manacher'],
  'palindromic-tree': ['palindromic-tree'],
  'flow-network': ['dinic','minimum-cut','min-cost-max-flow','ford-fulkerson','edmonds-karp','push-relabel','flow-lower-bounds','circulation-demands'],
  'bipartite-matching': ['kuhn-matching','hopcroft-karp'],
  assignment: ['hungarian'],
  'stable-matching': ['stable-matching'],
  'general-matching': ['blossom'],
  euclid: ['euclidean-algorithm','extended-euclid'],
  sieve: ['prime-sieve','linear-sieve','euler-totient'],
  exponentiation: ['fast-exponentiation'],
  'matrix-power': ['matrix-exponentiation'],
  'matrix-algebra': ['gaussian-elimination'],
  'xor-basis': ['xor-linear-basis'],
  'impartial-game': ['nim','sprague-grundy'],
  congruence: ['modular-inverse','chinese-remainder-theorem'],
  primality: ['miller-rabin'],
  factorization: ['prime-factorization','pollard-rho'],
  'discrete-log': ['baby-step-giant-step'],
  'line-geometry': ['segment-intersection','dot-cross-product','line-intersection','point-line-distance'],
  'polar-sort': ['polar-sort'],
  polygon: ['polygon-area','point-in-polygon','half-plane-intersection'],
  'convex-hull': ['convex-hull','rotating-calipers'],
  'sweep-line': ['sweep-line'],
  'circle-geometry': ['circle-intersection','circle-tangents','smallest-enclosing-circle'],
  'closest-pair': ['closest-pair'],
  'spatial-partition': ['voronoi-diagram','delaunay-triangulation'],
  'minkowski-sum': ['minkowski-sum'],
  'fourier-transform': ['fft','ntt','fast-walsh-hadamard-transform'],
  polynomial: ['lagrange-interpolation'],
  'linear-recurrence': ['berlekamp-massey'],
}

export const visualModelById = Object.fromEntries(
  Object.entries(visualModelGroups).flatMap(([model, ids]) => ids.map((id) => [id, model as VisualModel])),
) as Record<string, VisualModel>

const cses = (title: string, task: string, note: string): PracticeProblem => ({ judge: 'CSES', title, url: `https://cses.fi/problemset/task/${task}`, note })
const atcoder = (title: string, task: string, note: string): PracticeProblem => ({ judge: 'AtCoder', title, url: `https://atcoder.jp/contests/${task.split('/')[0]}/tasks/${task.split('/')[1]}`, note })
const codeforces = (title: string, task: string, note: string): PracticeProblem => ({ judge: 'Codeforces', title, url: `https://codeforces.com/problemset/problem/${task.replace('-', '/')}`, note })

const practiceByModel: Partial<Record<VisualModel, PracticeProblem>> = {
  'array-search': cses('Sum of Two Values','1640','把搜尋條件落到實際索引。'),
  'array-two-pointers': cses('Ferris Wheel','1090','排序後讓左右指標單調移動。'),
  'array-window': cses('Playlist','1141','維護不含重複值的最長視窗。'),
  'prefix-1d': cses('Static Range Sum Queries','1646','用兩個前綴值回答區間和。'),
  'prefix-2d': cses('Forest Queries','1652','用四個二維前綴值回答矩形查詢。'),
  difference: cses('Range Update Queries','1651','把區間修改拆成兩個邊界事件。'),
  compression: cses('Salary Queries','1144','把大座標映射成可索引的排名。'),
  kadane: cses('Maximum Subarray Sum','1643','維護以目前位置結尾的最佳答案。'),
  'sort-selection': cses('Distinct Numbers','1621','排序後線性掃描相同值。'),
  'sort-adjacent': atcoder('Partitions and Inversions','typical90/typical90_ck','從相鄰交換次數理解逆序對。'),
  'sort-merge': atcoder('Crossing Segments','typical90/typical90_q','以分治或樹狀陣列計數交錯順序。'),
  'sort-partition': cses('Stick Divisions','1161','練習分治與選擇順序的成本觀念。'),
  'counting-buckets': cses('Distinct Numbers','1621','值域可控時改用頻率桶。'),
  'meet-in-middle': cses('Meet in the Middle','1628','把 2^n 枚舉拆成兩個 2^(n/2)。'),
  'parallel-search': cses('Factory Machines','1620','先掌握單一單調答案二分，再把多個查詢離線平行處理。'),
  'interval-scheduling': cses('Movie Festival','1629','依結束時間選最多不重疊區間。'),
  'interval-covering': codeforces('Union of k-Segments','612-D','在時間軸上處理覆蓋與端點事件。'),
  'interval-merging': cses('Restaurant Customers','1619','排序端點並掃描重疊狀態。'),
  'job-timeline': cses('Tasks and Deadlines','1630','用處理順序最佳化總獎勵。'),
  'heap-merge': atcoder('Bread','abc252/abc252_f','每次合併最小兩段的 Huffman 型貪心。'),
  'fractional-choice': codeforces('Ciel and Duel','321-B','比較每單位收益並做貪心選擇。'),
  stack: cses('Bracket Sequences I','2064','以堆疊／平衡量追蹤括號合法性。'),
  queue: cses('Message Route','1667','BFS queue 逐層找最短路。'),
  deque: cses('Josephus Problem I','2162','練習從兩端或循環順序維護元素。'),
  heap: cses('Concert Tickets','1091','維護可快速取出極值的候選集合。'),
  'monotonic-stack': cses('Nearest Smaller Values','1645','彈出不可能成為答案的棧頂。'),
  'monotonic-queue': cses('Maximum Subarray Sum II','1644','用 deque 維護滑動區間的前綴極值。'),
  'histogram-stack': cses('Advertisement','1142','以最近較小邊界計算每根柱子的最大矩形。'),
  'expression-stack': codeforces('Ciel and Duel','321-B','練習把運算順序轉成可依序處理的狀態。'),
  'graph-traversal': cses('Counting Rooms','1192','用 DFS/BFS 完整走訪每個連通區。'),
  'grid-traversal': cses('Labyrinth','1193','在網格鄰接關係中搜尋並重建路徑。'),
  'shortest-path': cses('Shortest Routes I','1671','在帶權圖中執行鬆弛與最短路。'),
  'all-pairs-matrix': cses('Shortest Routes II','1672','以中繼點逐步改善所有點對距離。'),
  'dag-order': cses('Course Schedule','1679','用入度或 DFS 建立拓樸順序。'),
  'euler-trail': cses('Mail Delivery','1691','每條邊恰好使用一次並串成路徑。'),
  'disjoint-sets': cses('Road Construction','1676','每次加邊後合併兩個連通集合。'),
  'scc-clusters': cses('Planets and Kingdoms','1683','把互相可達節點縮成強連通分量。'),
  lowlink: cses('Necessary Roads','2076','用 tin/low 判斷橋與連通結構。'),
  'mst-growth': cses('Road Reparation','1675','依邊或前沿逐步建立最小生成樹。'),
  'functional-graph': cses('Planets Queries II','1160','利用環與入樹結構回答跳躍查詢。'),
  'two-sat': cses('Giant Pizza','1684','把布林限制轉成 implication graph。'),
  'dynamic-connectivity': cses('Network Breakdown','1677','倒序加入邊或離線處理連通變化。'),
  'tree-traversal': cses('Tree Diameter','1131','以樹遍歷計算深度、端點與子樹資訊。'),
  'tree-path': cses('Distance Queries','1135','用 LCA 將路徑距離拆成祖先距離。'),
  'tree-centroid': cses('Finding a Centroid','2079','找出移除後各部分都不超過一半的節點。'),
  'tree-decomposition': cses('Path Queries II','2134','把樹路徑拆成少量連續重鏈區間。'),
  'tree-merging': cses('Distinct Colors','1139','合併子樹集合統計不同顏色。'),
  'tree-encoding': cses('Prüfer Code','1134','在樹與葉節點序列間互相轉換。'),
  'reconstruction-tree': cses('MST Edge Check','3407','用 Kruskal 合併歷史表示連通門檻。'),
  'fenwick-tree': atcoder('Fenwick Tree','practice2/practice2_b','點更新與前綴聚合的標準練習。'),
  'fenwick-2d': cses('Forest Queries II','1739','在二維平面上做點更新與矩形查詢。'),
  'segment-tree': atcoder('Segment Tree','practice2/practice2_j','練習 monoid 區間查詢與單點更新。'),
  'segment-tree-2d': cses('Forest Queries II','1739','把兩個座標維度都納入區間結構。'),
  'dynamic-segment-tree': codeforces('Physical Education Lessons','915-E','在巨大座標域上只建立實際訪問的節點。'),
  'merge-sort-tree': cses('Salary Queries','1144','在區間節點保存排序值並做值域計數。'),
  'segment-tree-beats': codeforces('The Child and Sequence','438-D','利用節點最大值資訊剪枝區間取模。'),
  'lazy-tree': atcoder('Range Affine Range Sum','practice2/practice2_k','練習 lazy tag 的組合與下推。'),
  'persistent-tree': cses('Range Queries and Copies','1737','每次修改建立新版本並保留舊根。'),
  'sparse-table': cses('Static Range Minimum Queries','1647','不可修改時預處理冪次區間。'),
  'sqrt-blocks': cses('Distinct Values Queries','1734','離線分塊排序查詢並移動端點。'),
  'balanced-bst': cses('Josephus Problem II','2163','需要按順序統計刪除第 k 個元素。'),
  'line-container': codeforces('Ciel and Gondolas','321-E','以直線最小值查詢最佳化 DP。'),
  wavelet: cses('Salary Queries','1144','需要值域上的第 k 小與計數查詢。'),
  'spatial-tree': atcoder('Max Manhattan Distance','typical90/typical90_aj','處理高維／空間範圍查詢。'),
  'dynamic-tree': cses('Path Queries II','2134','比較靜態重鏈與真正動態樹操作。'),
  'persistent-dsu': cses('Network Breakdown','1677','保存或離線重建不同時間的連通狀態。'),
  'dp-1d': cses('Book Shop','1158','定義容量狀態並依正確方向更新。'),
  'dp-2d': cses('Edit Distance','1639','用二維狀態比較兩個前綴。'),
  'dp-grid': cses('Grid Paths I','1638','按照依賴方向填滿網格。'),
  'dp-bitmask': cses('Elevator Rides','1653','用集合遮罩表示已選元素。'),
  'dp-tree': cses('Tree Distances II','1133','先做子樹 DP，再換根傳遞答案。'),
  'dag-dp': cses('Longest Flight Route','1680','依拓樸順序把前驅答案推向後繼。'),
  'dp-interval': cses('Removal Game','1097','由短區間到長區間計算最佳決策。'),
  'dp-digit': cses('Counting Numbers','2220','逐位維護 tight、started 與限制狀態。'),
  'dp-optimization': codeforces('Yet Another Minimization Problem','868-F','分治最佳化 DP 轉移範圍。'),
  'dp-lines': codeforces('Kalila and Dimna in the Logging Industry','319-C','把 DP 轉移視為直線查詢。'),
  'string-prefix': cses('String Matching','1753','利用 prefix/Z/hash 線性匹配模式。'),
  trie: cses('Word Combinations','1731','沿 Trie 同時展開所有前綴候選。'),
  'string-automaton': cses('Finding Patterns','2102','以多模式自動機追蹤匹配狀態。'),
  'suffix-order': cses('Distinct Substrings','2105','利用後綴順序與 LCP 計數不同子字串。'),
  'suffix-tree': cses('Distinct Substrings','2105','把所有後綴壓縮在共享路徑的字元樹上。'),
  'suffix-automaton': codeforces('Substrings in a String','235-C','用後綴自動機表示所有子字串。'),
  palindrome: cses('Longest Palindrome','1111','以中心半徑或回文結構求最長答案。'),
  'palindromic-tree': cses('All Palindromes','3138','為每個不同回文建立節點與 suffix link。'),
  'flow-network': cses('Download Speed','1694','沿殘餘網路尋找增廣流。'),
  'bipartite-matching': cses('School Dance','1696','用增廣路建立最大二分匹配。'),
  assignment: atcoder('MinCostFlow','practice2/practice2_e','把指派成本建成最小費用流。'),
  'stable-matching': codeforces('Fox And Names','510-C','練習偏好／順序限制與衝突。'),
  'general-matching': cses('School Dance','1696','先掌握二分圖增廣，再比較一般圖花演算法。'),
  euclid: cses('Common Divisors','1081','運用 gcd 與因數結構找共同除數。'),
  sieve: codeforces('T-primes','230-B','先篩質數再判斷完全平方。'),
  exponentiation: cses('Exponentiation','1095','依指數二進位快速計算模冪。'),
  'matrix-power': cses('Fibonacci Numbers','1722','用轉移矩陣快速冪計算線性遞迴。'),
  'matrix-algebra': cses('System of Linear Equations','2133','以列運算判定並求解線性系統。'),
  'xor-basis': codeforces('Shortest Path Problem?','845-G','用 XOR 線性基底消去環差值。'),
  'impartial-game': cses('Nim Game I','1730','用所有子遊戲的 XOR 判斷勝負。'),
  congruence: cses('Exponentiation II','1712','處理模反元素、指數週期與同餘。'),
  primality: codeforces('T-primes','230-B','比較篩法與大整數質數測試的使用界線。'),
  factorization: codeforces('Sherlock and His Girlfriend','776-B','從最小質因數理解分解與著色。'),
  'discrete-log': codeforces('Moodular Arithmetic','603-B','處理乘法群上的指數關係。'),
  'line-geometry': cses('Line Segment Intersection','2190','用外積方向與邊界測試判相交。'),
  'polar-sort': cses('Convex Hull','2195','以半平面與外積比較器排序射線方向。'),
  polygon: cses('Point in Polygon','2192','用射線或有向面積處理多邊形。'),
  'convex-hull': cses('Convex Hull','2195','排序點並維持凸鏈轉向。'),
  'sweep-line': cses('Intersection Points','1740','把二維相交轉成掃描事件與一維查詢。'),
  'circle-geometry': codeforces('Commentator problem','2-C','由圓與比例限制建立幾何解。'),
  'closest-pair': cses('Minimum Euclidean Distance','2194','用分治或掃描線維護近鄰候選。'),
  'spatial-partition': atcoder('Piles in AtCoder Farm','typical90/typical90_ao','用凸包與空間劃分思考點集合。'),
  'minkowski-sum': codeforces('Mogohu-Rea Idol','87-E','用兩個凸多邊形的 Minkowski 和判定點。'),
  'fourier-transform': atcoder('Convolution','practice2/practice2_f','用轉換把卷積降為 O(n log n)。'),
  polynomial: codeforces('The Sum of the k-th Powers','622-F','以拉格朗日插值求高次多項式值。'),
  'linear-recurrence': codeforces("Mr. Kitayuta's Gift",'506-E','從有限狀態序列導出線性遞迴。'),
}

export const visualKindForModel = (model: VisualModel) => {
  if (/^(stack|queue|deque|heap|monotonic|histogram|expression)/.test(model) || model === 'heap-merge') return 'linear'
  if (/^(graph|grid|shortest|all-pairs|dag|euler|disjoint|scc|lowlink|mst|functional|two-sat|dynamic-connectivity)/.test(model)) return 'graph'
  if (/^tree-/.test(model) || model === 'reconstruction-tree') return 'tree'
  if (/^(fenwick|segment|dynamic-segment|merge-sort-tree|lazy|persistent-tree|sparse|sqrt|balanced|line-container|wavelet|spatial-tree|dynamic-tree|persistent-dsu)/.test(model)) return 'range'
  if (model === 'dag-dp') return 'graph'
  if (/^dp-/.test(model)) return 'dp'
  if (/^(string|trie|suffix|palindrome|palindromic)/.test(model)) return 'string'
  if (/^(flow|bipartite|assignment|stable|general)/.test(model)) return 'flow'
  if (/^(euclid|sieve|exponentiation|matrix|xor|impartial|congruence|primality|factorization|discrete)/.test(model)) return 'math'
  if (/^(line-geometry|polar|polygon|convex|sweep|circle|closest|spatial-partition|minkowski)/.test(model)) return 'geometry'
  if (/^(fourier|polynomial|linear-recurrence)/.test(model)) return 'transform'
  return 'array'
}

const triggerByModel: Partial<Record<VisualModel, string>> = {
  'array-search': '資料具有可直接掃描或可用單調性排除的搜尋空間。',
  'array-two-pointers': '排序後，左右端點的決策具有單調性，不需要重新回頭。',
  'array-window': '答案是連續區間，且加入右端或移除左端能增量維護條件。',
  'interval-scheduling': '目標是在互相衝突的時間區間中選出最多可行項目。',
  'shortest-path': '圖上要求最小代價；先檢查邊權是否非負、只有 0/1 或可能為負。',
  'disjoint-sets': '只需知道兩點是否同組，以及把兩組永久合併。',
  'segment-tree': '需要交錯處理區間查詢與更新，且合併運算具結合律。',
  'dp-bitmask': '元素數量小，狀態可用位元集合精確表示已選項目。',
  'string-prefix': '失配後仍可重用已知前綴／後綴資訊，避免文本指標回退。',
  'flow-network': '限制可表示成容量，答案可由增廣路、殘餘邊與割來描述。',
  'convex-hull': '只關心點集最外層邊界、方向極值或最遠點對。',
  'fourier-transform': '需要大量係數卷積，直接 O(n²) 無法通過。',
}

export const enrichLesson = <T extends { id: string; title: string; zhTitle: string; description: string }>(lesson: T) => {
  const visualModel = visualModelById[lesson.id]
  if (!visualModel) throw new Error(`Missing visual model for ${lesson.id}`)
  const practice = practiceByModel[visualModel]
  if (!practice) throw new Error(`Missing practice problem for visual model ${visualModel}`)
  return {
    ...lesson,
    visualModel,
    visual: lesson.id === 'segment-tree' ? 'segment-tree' : visualKindForModel(visualModel),
    usage: [
      `題目要求${lesson.description.replace(/[。.]$/, '')}時。`,
      triggerByModel[visualModel] ?? `輸入限制與 ${lesson.title} 的 ${visualModel.replaceAll('-', ' ')} 狀態模型吻合時。`,
    ],
    practice: [practice],
  }
}
