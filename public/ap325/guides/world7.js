export const world7Guides = {
  "7-graph-foundation": {
    title: "Graph Modeling：先決定 vertex / edge，再選演算法",
    source: "AP325 7.1–7.2.1，教材頁 219–225",
    intro: "圖論真正的第一關不是 BFS/DFS，而是建模。只要能把『狀態』變成 vertex、把『一步合法轉移』變成 edge，迷宮、道路、任務依賴、社群連通都會落到同一套工具。",
    objectives: [
      "能從題意定義 vertex 與 edge",
      "會使用 adjacency list 儲存稀疏圖",
      "會區分 directed / undirected、weighted / unweighted",
      "會把 graph data 與 visited/dist/parent 等演算法狀態分開"
    ],
    focus: {
      title: "把一個方格迷宮改寫成圖",
      prompt: "每一個可走格子是一個 vertex；上下左右可走就是 edge。現在問：如果每一步代價都一樣，最短路應該想到什麼？",
      questions: [
        "vertex 一定要是 int 嗎？",
        "無向邊在 adjacency list 要存幾次？",
        "若有權重，Edge 至少要多存什麼？"
      ]
    },
    blocks: [
      {
        type: "text",
        id: "model-first",
        title: "圖不是畫出來的，是定義出來的",
        paragraphs: [
          "很多題沒有直接說『給你一張圖』。例如棋盤上的每個位置、字串的某個狀態、任務進度、甚至 bitmask 都可以是 vertex；只要從一個 state 能合法走到另一個 state，就有 edge。",
          "因此建模時先問：同一個 vertex 必須保存哪些資訊，才能讓未來合法轉移只由目前 state 決定？如果資訊不足，就會把不同狀態錯誤合併。"
        ]
      },
      {
        type: "table",
        id: "graph-types",
        title: "先把四個屬性分清楚",
        headers: ["屬性", "代表意義", "會影響什麼"],
        rows: [
          ["Directed", "u→v 不代表 v→u", "indegree、topological sort、DAG"],
          ["Undirected", "邊可雙向走", "連通塊、MST、tree"],
          ["Unweighted", "每條邊同成本", "BFS 可求最短路"],
          ["Weighted", "邊有不同成本", "Dijkstra / 其他 shortest path"]
        ]
      },
      {
        type: "code",
        id: "adj-list",
        title: "Adjacency list 最小模板",
        code: "struct Edge{\n    int to;\n    long long w;\n};\nvector<vector<Edge>> g(n);\n\nfor(int i=0;i<m;i++){\n    int u,v; long long w;\n    cin >> u >> v >> w;\n    g[u].push_back({v,w});\n    g[v].push_back({u,w}); // undirected only\n}",
        notes: [
          "若是有向圖，拿掉第二個方向。",
          "edge id、weight、capacity 等額外資訊都可放進 Edge struct。",
          "visited/dist/parent 是某次演算法的 state，不建議塞進 Edge 本身。"
        ]
      },
      {
        type: "callout",
        id: "matrix-warning",
        title: "Adjacency matrix 不是預設答案",
        body: "若 V=2e5，V² 根本無法存。競賽大多數稀疏圖優先使用 adjacency list，空間 O(V+E)。只有 V 小、圖很密或需要 O(1) 查是否有邊時才考慮 matrix。",
        tone: "warning"
      }
    ],
    practice: [],
    checkpoints: [
      { q: "無向邊 (u,v) 在 adjacency list 通常怎麼存？", a: "存 u→v 與 v→u 兩個方向；若需要辨認同一條原始邊，可額外保存相同 edge id。" },
      { q: "為什麼迷宮可以視為圖？", a: "每個位置是 state/vertex；每個合法一步移動是 edge。只要 state 與 transition 定義完整，就能套圖演算法。" }
    ],
    mastery: [
      "能從非圖論敘述自己建 graph",
      "會寫 weighted / unweighted adjacency list",
      "知道 V+E 與 V² 儲存的差別"
    ]
  },

  "7-bfs": {
    title: "BFS：Queue 保證逐層擴張，所以第一次到達就是最短",
    source: "AP325 7.2.2–7.3，P-7-1、P-7-3、P-7-4、Q-7-5，教材頁 225–242",
    intro: "BFS 不是『用 queue 的 DFS』。它最重要的 invariant 是：queue 中節點的距離不會往回變小，因此無權圖中一個節點第一次被發現時，就是最短距離。",
    objectives: [
      "會寫 O(V+E) BFS",
      "能證明無權最短路 correctness",
      "會做 grid BFS、multi-source BFS、parent path reconstruction",
      "知道狀態擴充後仍可 BFS"
    ],
    focus: {
      code: "P-7-1",
      prompt: "把 source 設 dist=0。當你從 queue pop 出距離 d 的點時，為什麼不可能還有一個距離 d-1 的點之後才出現？",
      questions: [
        "visited 應在 push 還是 pop 時設定？",
        "每個 vertex 最多進 queue 幾次？",
        "如何用 parent 還原路徑？"
      ]
    },
    blocks: [
      {
        type: "text",
        id: "layer-invariant",
        title: "BFS correctness 的核心：distance layer",
        paragraphs: [
          "起點距離 0。距離 d 的 vertex 被處理時，只會把尚未發現的鄰居設成 d+1 並放到 queue 尾端。Queue FIFO 保證所有較早的 d 或 d+1 節點會先被處理。",
          "所以第一次發現 v 時，任何更短路徑若存在，它的前一個 vertex 必定更早被處理，v 應該早就被發現，產生矛盾。"
        ]
      },
      {
        type: "code",
        id: "bfs-code",
        title: "標準 BFS + parent",
        code: "queue<int> q;\nvector<int> dist(n,-1), par(n,-1);\n\ndist[s]=0;\nq.push(s);\nwhile(!q.empty()){\n    int u=q.front(); q.pop();\n    for(int v:g[u]){\n        if(dist[v]!=-1) continue;\n        dist[v]=dist[u]+1;\n        par[v]=u;\n        q.push(v);\n    }\n}",
        notes: [
          "第一次 push 時就標記 dist/visited，避免同一點被多個前驅重複入隊。",
          "dist=-1 同時可表示尚未到達，省一個 visited 陣列。",
          "若 edge weight 不全相同，普通 BFS 不再保證最短。"
        ]
      },
      {
        type: "example",
        id: "grid-bfs",
        title: "P-7-3：Grid BFS 只是鄰居生成方式不同",
        problem: "機器人在方格中移動，每一步代價相同。",
        steps: [
          "state 是 (r,c)，可用 pair 或編號 r*W+c。",
          "pop 一格後枚舉四方向。",
          "越界、障礙、已訪問就跳過。",
          "第一次到終點時得到的 dist 就是最少步數。"
        ],
        conclusion: "不要因為輸入是二維就把它和 DP 混在一起；若你在求『最少幾步到達』且每步等價，圖最短路模型更直接。"
      },
      {
        type: "text",
        id: "state-bfs",
        title: "P-7-4 / Q-7-5：當位置不夠描述未來，就把狀態加進 vertex",
        paragraphs: [
          "例如最少轉彎數、剩餘資源、上一個方向等資訊會影響下一步成本時，單純 (r,c) 可能不夠。你可以把 vertex 擴成 (r,c,dir) 或 (position,state)。",
          "圖論的一個強大觀念是：只要擴充後每條 transition 成本相同，BFS 仍然成立。演算法沒變，只有 graph modeling 變了。"
        ]
      },
      {
        type: "callout",
        id: "zero-one",
        title: "邊權只有 0/1 時，還有 0-1 BFS",
        body: "若轉移成本只有 0 或 1，可用 deque：cost 0 push_front、cost 1 push_back，維持距離順序。這不是 AP325 主線必學，但能幫你理解『容器順序 = shortest path invariant』。",
        tone: "tip"
      }
    ],
    practice: [
      { code: "P-7-1", level: "focus", why: "最純的 BFS distance layer。" },
      { code: "P-7-3", level: "core", why: "把 BFS 搬到 grid state。" },
      { code: "P-7-4", level: "core", why: "開始加入方向 / 路徑狀態。" },
      { code: "Q-7-5", level: "challenge", why: "綜合 state modeling 與 shortest path。" }
    ],
    checkpoints: [
      { q: "為什麼 visited 通常在入隊時就設定？", a: "避免多個前驅在該節點尚未 pop 前重複把它加入 queue；第一次發現已經是最短，不需要再等。" },
      { q: "普通 BFS 為什麼不能直接處理權重 1、100 混合的圖？", a: "FIFO 只保證邊數 layer，不保證總權重非遞減；較少邊的路可能反而更貴。" }
    ],
    mastery: [
      "能用 distance-layer 證明 BFS",
      "會從 grid / 狀態題建 BFS graph",
      "會用 parent 重建一條最短路"
    ]
  },

  "7-dfs-dag": {
    title: "DFS / DAG / Topological Sort：探索結構與依賴順序",
    source: "AP325 7.2.3–7.3，P-7-2、P-7-6、Q-7-7、Q-7-8，教材頁 230–247",
    intro: "DFS 擅長沿一條路深入，適合連通結構、遞迴狀態與 cycle；DAG 則多了一個非常強的性質：所有依賴可以排成 topological order，讓 DP / shortest path 只需照順序掃一遍。",
    objectives: [
      "會 iterative / recursive DFS 的 visited invariant",
      "會 Kahn topological sort",
      "能在 DAG 上做 longest / shortest path DP",
      "能用 topological order 判斷 cycle"
    ],
    focus: {
      code: "P-7-6",
      prompt: "DAG 上如果已經有 topological order，每條 edge u→v 都從前指向後。那麼當你處理 u 時，dp[u] 是否已經可以視為完成？",
      questions: [
        "為什麼 DAG 不需要 Dijkstra 就能處理負權 shortest path？",
        "longest path transition 和 shortest path 差在哪裡？",
        "若 Kahn 最後只取到部分 vertex，代表什麼？"
      ]
    },
    blocks: [
      {
        type: "text",
        id: "dfs-meaning",
        title: "DFS：沿著一條未完成路徑一路深入",
        paragraphs: [
          "DFS 最自然的遞迴 contract 是 dfs(u)：處理所有從 u 可到達、尚未訪問的節點。一般圖一定要有 visited / color，否則 cycle 會讓遞迴無限循環。",
          "若要判 directed cycle，可使用三色：0 未訪問、1 正在 recursion stack、2 已完成；遇到 edge 指向 color=1 的點就是 back edge。"
        ]
      },
      {
        type: "steps",
        id: "kahn",
        title: "Kahn topological sort",
        steps: [
          { title: "算 indegree", body: "indeg[v] 是目前還沒移除的前置依賴數量。" },
          { title: "所有 indegree=0 入 queue", body: "這些 vertex 已沒有未完成依賴，可以現在處理。" },
          { title: "移除出邊", body: "pop u 後，對每個 u→v 做 --indeg[v]；降到 0 就入 queue。" },
          { title: "檢查數量", body: "若最後 order.size()<V，剩下節點互相依賴形成 directed cycle。" }
        ]
      },
      {
        type: "example",
        id: "dag-path",
        title: "P-7-6：DAG longest / shortest path",
        problem: "已知 topological order。",
        steps: [
          "初始化 source 的 dp，其他設 -INF（longest）或 INF（shortest）。",
          "依 topological order 處理 u。",
          "對每條 u→v 做 dp[v]=best(dp[v],dp[u]+w)。",
          "因為所有進入 u 的 edge 都來自更早位置，處理 u 時 dp[u] 已最終確定。"
        ],
        conclusion: "DAG shortest path 甚至可以有負權，因為沒有 cycle，計算順序已完全由拓樸關係決定。"
      },
      {
        type: "code",
        id: "topo-code",
        title: "Kahn + DAG DP 骨架",
        code: "queue<int> q;\nfor(int i=0;i<n;i++) if(indeg[i]==0) q.push(i);\nvector<int> order;\nwhile(!q.empty()){\n    int u=q.front(); q.pop();\n    order.push_back(u);\n    for(auto [v,w]:g[u])\n        if(--indeg[v]==0) q.push(v);\n}\n\nif((int)order.size()!=n){\n    // directed cycle exists\n}",
        notes: [
          "topological order 不唯一是正常的。",
          "只有 DAG 才存在完整 topological order。",
          "做 path DP 前要先處理 unreachable state，避免 INF+w overflow。"
        ]
      },
      {
        type: "text",
        id: "aov",
        title: "Q-7-7：AOV / earliest finish 本質是 DAG DP",
        paragraphs: [
          "若 edge 表示先後依賴，某工作最早開始時間取決於所有 predecessor 完成時間的最大值。這就是在 topological order 上做 max transition。",
          "一旦你看見『必須先完成哪些工作才能開始』，就應該想到 indegree、topological order 與 DAG DP。"
        ]
      }
    ],
    practice: [
      { code: "P-7-2", level: "core", why: "練 DFS 對可達結構的探索。" },
      { code: "P-7-6", level: "focus", why: "topological order + path DP 的核心題。" },
      { code: "Q-7-7", level: "core", why: "把 DAG DP 放進工作依賴敘述。" },
      { code: "Q-7-8", level: "challenge", why: "圖結構與限制結合，驗收 DFS / DAG 建模。" }
    ],
    checkpoints: [
      { q: "DAG shortest path 為什麼可以有負邊？", a: "因為沒有 cycle，topological order 保證每個 vertex 的所有 predecessor 在它之前完成，不需要 Dijkstra 的非負 greedy 性質。" },
      { q: "Kahn 最後 order.size()<V 代表什麼？", a: "剩餘節點沒有任何 indegree 0 可取，表示它們之間存在 directed cycle。" }
    ],
    mastery: [
      "會用三色 DFS 想 cycle",
      "能獨立寫 Kahn",
      "會在 topological order 上寫 DP"
    ]
  },

  "7-dijkstra": {
    title: "Dijkstra：用 Min-Heap 維持『下一個最值得確定的距離』",
    source: "AP325 7.4.1，P-7-9，教材頁 248–252",
    intro: "當 edge weight 非負但不相同，BFS 的 FIFO layer 不再等於最短距離。Dijkstra 改用 min-heap，永遠先擴張目前 tentative distance 最小的 vertex；非負權重使這個 greedy choice 可以被證明安全。",
    objectives: [
      "會寫 adjacency list + min-heap Dijkstra",
      "理解 relaxation 與 stale entry",
      "能說明非負權重為何是 correctness 前提",
      "會選 long long 與安全 INF"
    ],
    focus: {
      code: "P-7-9",
      prompt: "假設 heap top 是 (d,u)，而且 d==dist[u]。為什麼任何尚未處理的路徑都不可能把 dist[u] 再變小？",
      questions: [
        "哪一步用到了『edge weight >= 0』？",
        "為什麼同一 vertex 可以在 heap 出現多次？",
        "stale entry 怎麼判斷？"
      ]
    },
    blocks: [
      {
        type: "text",
        id: "relax",
        title: "Relaxation：所有 shortest path 演算法的共同語言",
        paragraphs: [
          "已知一條到 u 的路 dist[u]，走 edge (u,v,w) 就得到一個到 v 的 candidate=dist[u]+w。如果 candidate 更小，就更新 dist[v]。",
          "Dijkstra 與 DAG shortest path 都在做 relaxation；差別只是『用什麼順序保證目前 state 可以被確定』。"
        ]
      },
      {
        type: "steps",
        id: "dijkstra-proof",
        title: "為什麼 pop 到的最新最小距離可以確定",
        steps: [
          { title: "u 是 heap 中最小 tentative distance", body: "假設 d=dist[u] 是所有尚未確定 vertex 中最小。" },
          { title: "反設有更短路", body: "那條路一定從已確定區域跨到某個尚未確定 vertex x。" },
          { title: "利用非負邊", body: "走到 x 的距離不可能大於完整更短路，而 x 應該有 tentative distance < d。" },
          { title: "矛盾", body: "但 u 已是 heap 中最小，所以更短路不存在。" }
        ]
      },
      {
        type: "code",
        id: "dijkstra-code",
        title: "不需要 decrease-key 的競賽版本",
        code: "using P=pair<long long,int>;\nconst long long INF=(1LL<<62);\nvector<long long> dist(n,INF);\npriority_queue<P,vector<P>,greater<P>> pq;\n\ndist[s]=0;\npq.push({0,s});\nwhile(!pq.empty()){\n    auto [d,u]=pq.top(); pq.pop();\n    if(d!=dist[u]) continue; // stale\n    for(auto [v,w]:g[u]){\n        if(dist[v] > d+w){\n            dist[v]=d+w;\n            pq.push({dist[v],v});\n        }\n    }\n}",
        notes: [
          "更新 dist 時直接 push 新 pair；舊 pair 留在 heap，日後以 stale check 丟掉。",
          "INF 不要選到加 w 就 overflow；常用 1LL<<62。",
          "若有負邊，不能靠這個 greedy proof。"
        ]
      },
      {
        type: "table",
        id: "shortest-path-choice",
        title: "先看 edge cost 再選 shortest path 工具",
        headers: ["邊權", "常見工具", "核心容器 / 順序"],
        rows: [
          ["全部相同", "BFS", "queue"],
          ["只有 0 / 1", "0-1 BFS", "deque"],
          ["全部非負", "Dijkstra", "min-heap"],
          ["DAG，可含負權", "Topo DP", "topological order"]
        ]
      }
    ],
    practice: [
      { code: "P-7-9", level: "focus", why: "AP325 Dijkstra 主題核心題；先完整掌握 relax + heap + stale entry。" }
    ],
    checkpoints: [
      { q: "Dijkstra 為什麼可以讓同一 vertex 多次入 heap？", a: "每次找到更短距離就 push 新 pair；舊 pair 到 top 時若 d!=dist[u] 就是 stale，不會影響 correctness。" },
      { q: "負邊到底破壞了哪一步？", a: "一個已經被視為最小並確定的 vertex，可能之後經由負邊得到更短路，破壞 greedy finalization。" }
    ],
    mastery: [
      "會從零寫 min-heap Dijkstra",
      "能口述非負權 correctness",
      "會依 edge cost 選 BFS / 0-1 BFS / Dijkstra / DAG DP"
    ]
  },

  "7-dsu-mst": {
    title: "DSU 與 MST：維護連通塊，再用 Cut Property 做 Greedy",
    source: "AP325 7.4.2–7.4.3，P-7-10、Q-7-11、P-7-12，教材頁 253–266",
    intro: "DSU 解決的是『目前哪些點已經在同一個 component』；Kruskal 恰好需要這個判斷來避免成環。MST 的 greedy 正確性則來自 cut property：跨越某個 cut 的最輕邊可以安全選進某棵最小生成樹。",
    objectives: [
      "會 path compression + union by size",
      "理解 DSU 的 amortized complexity",
      "會 Kruskal 並用 DSU 判 cycle",
      "能說明 cut property 與 Prim / Kruskal 的共同核心"
    ],
    focus: {
      code: "P-7-12",
      prompt: "把所有 edge 由小到大看。若 u、v 已在同一 component，為什麼這條邊一定不能『必要地』加入目前森林？",
      questions: [
        "加入同 component 邊會發生什麼？",
        "為什麼跨 component 的最小邊是 safe choice？",
        "MST 最後應有幾條邊？"
      ]
    },
    blocks: [
      {
        type: "code",
        id: "dsu-code",
        title: "DSU：兩個最佳化都要會",
        code: "struct DSU{\n    vector<int> p,sz;\n    DSU(int n):p(n),sz(n,1){ iota(p.begin(),p.end(),0); }\n    int find(int x){\n        return p[x]==x ? x : p[x]=find(p[x]);\n    }\n    bool unite(int a,int b){\n        a=find(a); b=find(b);\n        if(a==b) return false;\n        if(sz[a]<sz[b]) swap(a,b);\n        p[b]=a; sz[a]+=sz[b];\n        return true;\n    }\n};",
        notes: [
          "path compression 讓 find 路徑逐漸變扁。",
          "union by size 避免小樹上掛大樹。",
          "兩者一起使用時 amortized O(alpha(N))，實務上近乎常數。"
        ]
      },
      {
        type: "example",
        id: "kruskal",
        title: "P-7-12：Kruskal",
        problem: "給加權無向圖，求 MST。",
        steps: [
          "所有 edge 依 weight 由小到大排序。",
          "若 unite(u,v) 回 false，代表已同 component，加入會成 cycle，所以跳過。",
          "若 unite 成功，就把 w 加入答案。",
          "成功選到 V-1 條邊即可停止。"
        ],
        conclusion: "DSU 讓『加入這條邊會不會成環』從圖搜尋變成近乎 O(1) 的集合查詢。"
      },
      {
        type: "text",
        id: "cut-property",
        title: "Kruskal 為什麼不是『因為最小就選』",
        paragraphs: [
          "想像目前森林把 vertices 分成多個 components。任何連接兩個不同 component 的 edge 都跨過某個 cut；其中最輕邊依 cut property 可以被納入某棵 MST。",
          "所以 Kruskal 每次選『不成環的全域最輕邊』是有證明的 greedy choice，不是單純看起來便宜。"
        ]
      },
      {
        type: "text",
        id: "prim",
        title: "Prim 與 Kruskal 是同一個 theorem 的兩種資料流",
        paragraphs: [
          "Prim 維護一棵已選 vertex set，每次取跨出目前 cut 的最輕邊；Kruskal 則維護很多 components，依全域 edge weight 合併。",
          "兩者都靠 cut property。實作選擇通常依圖的表示方式與題目後續操作決定。"
        ]
      },
      {
        type: "callout",
        id: "disconnected",
        title: "圖不連通時沒有 spanning tree",
        body: "Kruskal 跑完若成功選邊數 < V-1，代表原圖不連通。這時得到的是 minimum spanning forest，不是整張圖的 MST。",
        tone: "warning"
      }
    ],
    practice: [
      { code: "P-7-10", level: "core", why: "先練 DSU 的動態連通判斷。" },
      { code: "Q-7-11", level: "challenge", why: "把 DSU 放進更不直接的敘述，驗收建模。" },
      { code: "P-7-12", level: "focus", why: "Kruskal + DSU 的完整 MST 主題。" }
    ],
    checkpoints: [
      { q: "Kruskal 遇到 find(u)==find(v) 為什麼跳過？", a: "u、v 已由目前森林中的路徑連通，再加入 (u,v) 必形成 cycle；spanning tree 不需要這條邊。" },
      { q: "MST 的 cut property 在說什麼？", a: "對任意 cut，跨 cut 的最輕 edge 至少可以出現在某棵 MST 中；這支撐 Prim/Kruskal 的 safe choice。" }
    ],
    mastery: [
      "能不看模板寫 DSU",
      "會 Kruskal 並檢查 disconnected",
      "能用 cut property 解釋 MST greedy"
    ]
  }
};
