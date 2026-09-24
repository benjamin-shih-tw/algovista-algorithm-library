export const guideD = {
  "7-graph-foundation": {
    "sections": [
      {
        "title": "先把問題建成圖",
        "body": [
          "圖論最重要的第一步不是挑 BFS 還是 DFS，而是決定『什麼是節點、什麼是邊』。節點通常代表一個狀態，邊代表一次合法轉移。",
          "只要模型建對，很多看似不同的迷宮、社群、道路、任務依賴問題，其實只是同一組圖演算法。"
        ]
      },
      {
        "title": "Adjacency list",
        "body": [
          "稀疏圖最常用 `vector<vector<Edge>> g`。無向圖一條邊要加入兩個方向；有向圖只加入題目指定方向。若有權重，就把 `(to,weight)` 一起存。",
          "矩陣適合小而密的圖，否則 O(V²) 空間通常太浪費。"
        ]
      },
      {
        "title": "把圖與演算法狀態分開",
        "body": [
          "`g` 只描述圖本身；visited、dist、parent、indegree 等是某次演算法的狀態。這樣才能重複在同一張圖上跑不同演算法，也比較不容易污染資料。"
        ]
      }
    ],
    "example": {
      "title": "例：網格迷宮建圖",
      "steps": [
        "每個可走格子視為一個 vertex。",
        "上下左右相鄰且可走就連 edge。",
        "每步代價相同 → unweighted graph。",
        "最短步數自然變成 BFS。"
      ],
      "result": "很多『棋盤題』只是把 vertex 寫成 (r,c) 而已。"
    },
    "checkpoint": [
      "能從敘述定義 vertex/edge。",
      "知道無向邊要雙向加入。",
      "能選 adjacency list 而不是盲用 matrix。"
    ]
  },
  "7-bfs": {
    "sections": [
      {
        "title": "BFS 為什麼能求無權最短路",
        "body": [
          "起點距離是 0。Queue 先處理所有距離 0，再處理距離 1，再距離 2……因此節點第一次被發現時，不可能存在更短但還沒處理到的路。",
          "這個『距離逐層不遞減』就是 BFS 正確性的核心。"
        ]
      },
      {
        "title": "Visited 應在入隊時設定",
        "body": [
          "若等 pop 才 visited，同一個未處理節點可能被很多鄰居重複 push。正確做法通常是在第一次發現時立即標記，確保每個 vertex 只進 queue 一次。"
        ]
      },
      {
        "title": "Multi-source 與 Grid BFS",
        "body": [
          "若有多個起點，把所有 source 都設 dist=0 並一起放進 queue，就能一次求每點到最近 source 的距離。Grid BFS 只是鄰居生成方式改成四/八方向。"
        ]
      },
      {
        "title": "Path reconstruction",
        "body": [
          "第一次到達 v 時記 `parent[v]=u`。到終點後沿 parent 反向走回起點，再 reverse，即可重建一條最短路。"
        ]
      }
    ],
    "example": {
      "title": "例：兩個火源同時擴散",
      "steps": [
        "兩個 source 都 dist=0 並 push。",
        "queue 交錯展開，但距離仍逐層。",
        "某格第一次被到達的 dist，就是最近火源到它的距離。"
      ],
      "result": "不必為每個 source 各跑一次 BFS。"
    },
    "checkpoint": [
      "能證明第一次到達是最短。",
      "會寫 multi-source BFS。",
      "會用 parent 重建路徑。"
    ]
  },
  "7-dfs-dag": {
    "sections": [
      {
        "title": "DFS 用來看結構",
        "body": [
          "DFS 會沿一條路徑深入到底再回來，因此適合連通塊、樹狀結構、cycle detection、topological DFS 等。",
          "在一般圖中要用 visited 或三色狀態避免無限繞圈；在樹上則常只需跳過 parent。"
        ]
      },
      {
        "title": "DAG 的特別之處",
        "body": [
          "Directed Acyclic Graph 沒有有向環，所以所有依賴可以排成一個 topological order，使每條邊 u→v 都滿足 u 在 v 前。",
          "這個順序讓 DAG DP、DAG shortest path 都能只掃一次邊。"
        ]
      },
      {
        "title": "Kahn's algorithm",
        "body": [
          "計算每點 indegree，把所有 indegree=0 的點入 queue。每取出 u，就刪除它的出邊（也就是把鄰居 indegree--）。若鄰居變 0，再入 queue。",
          "若最後取出的點數少於 V，代表剩下部分存在 cycle。"
        ]
      }
    ],
    "example": {
      "title": "例：課程先修",
      "steps": [
        "A→B 表示 A 必須先修。",
        "所有 indegree=0 課程可先選。",
        "完成一門就降低後續課程 indegree。",
        "得到一個合法修課順序。"
      ],
      "result": "Topological order 本質是依賴關係的線性化。"
    },
    "checkpoint": [
      "會區分 DFS 與 BFS 的使用語意。",
      "能寫 Kahn。",
      "知道 order.size()<V 代表有 cycle。"
    ]
  },
  "7-dijkstra": {
    "sections": [
      {
        "title": "從 BFS 到加權最短路",
        "body": [
          "BFS 假設每條邊代價相同，所以『先走較少步』等價於『距離較短』。當權重不同，就需要依目前總距離決定誰先擴張，這就是 Dijkstra 的 min-heap。"
        ]
      },
      {
        "title": "Relaxation",
        "body": [
          "若目前已知 dist[u]，走邊 (u,v,w) 可以提出候選 `dist[u]+w`。若比 dist[v] 小，就更新並 push 新值。這個動作叫 relax。",
          "Heap 中可能保留舊距離，因此 pop 後若 d!=dist[u]，直接跳過 stale entry。"
        ]
      },
      {
        "title": "為何要求非負邊",
        "body": [
          "當 u 以全域最小 tentative distance 被取出時，任何尚未走過的路都還要再加非負成本，因此不可能回頭把 u 變得更短。若允許負邊，這個 greedy 證明失效。"
        ]
      },
      {
        "title": "複雜度",
        "body": [
          "Adjacency list + binary heap 通常 O((V+E)log V)，實務上常寫作 O(E log V)。"
        ]
      }
    ],
    "example": {
      "title": "例：道路權重 1, 2, 100",
      "steps": [
        "起點先 relax 鄰居。",
        "Heap 永遠先取目前距離最小者，而不是邊數最少者。",
        "找到更短距離就再次 push。",
        "舊 pair 日後 pop 時由 stale check 丟掉。"
      ],
      "result": "不需要 decrease-key 也能有乾淨的 C++ 實作。"
    },
    "checkpoint": [
      "能解釋 relax。",
      "知道 stale entry 為何安全。",
      "知道負邊會破壞 Dijkstra。"
    ]
  },
  "7-dsu-mst": {
    "sections": [
      {
        "title": "DSU 維護動態連通塊",
        "body": [
          "Disjoint Set Union 支援兩個操作：find(x) 找集合代表元；unite(a,b) 合併兩集合。Path compression 與 union by size/rank 讓均攤成本幾乎常數。",
          "它特別適合只需要知道『目前是否已連通』，而不需要列出完整路徑的問題。"
        ]
      },
      {
        "title": "Kruskal = 排序邊 + DSU",
        "body": [
          "把所有邊依權重由小到大處理。若 u、v 已在同一 component，加入這條邊會形成 cycle，所以跳過；否則安全加入並 unite。",
          "Cut property 告訴我們：跨某個 cut 的最輕邊可以出現在某棵 MST 中，這支撐 Kruskal 的 greedy 正確性。"
        ]
      },
      {
        "title": "Prim 的另一個視角",
        "body": [
          "Prim 從一個 vertex 開始，維護『目前樹到外界』的最輕邊。它與 Kruskal 都使用 cut property，但資料流不同：Kruskal 看全域邊排序，Prim 看當前 frontier。"
        ]
      }
    ],
    "example": {
      "title": "例：Kruskal",
      "steps": [
        "edges 依 w 排序。",
        "遇 (u,v)，若 find(u)==find(v) 跳過。",
        "否則加入答案、unite。",
        "選到 V-1 條邊時完成。"
      ],
      "result": "森林逐步合併，始終不產生 cycle。"
    },
    "checkpoint": [
      "會寫 find + union by size。",
      "能說明 Kruskal 為何跳過同 component 邊。",
      "知道 MST 不存在時 selected edges 會少於 V-1。"
    ]
  },
  "8-tree-traversal": {
    "sections": [
      {
        "title": "樹 = 連通且無環",
        "body": [
          "樹中任兩點只有唯一簡單路徑。選定 root 後，每個非 root 節點都會有唯一 parent，其他相鄰節點就是 children。",
          "因此很多一般圖需要 visited 的地方，在樹 DFS 中只要傳 parent 並跳過它。"
        ]
      },
      {
        "title": "一次 DFS 能算很多東西",
        "body": [
          "進入 u 時知道 parent 與 depth；處理 children 後可以得到 subtree size；若記錄進入時間 tin 與離開時間 tout，整棵 subtree 會對應到 DFS order 中一段連續區間。",
          "這個 flattening 是後續 Fenwick/segment tree 處理 subtree query 的橋樑。"
        ]
      },
      {
        "title": "Tree diameter",
        "body": [
          "無權樹可從任一點做 BFS/DFS 找最遠點 A，再從 A 找最遠點 B；A-B 就是一條 diameter。加權樹可用 DFS 累積距離。"
        ]
      }
    ],
    "example": {
      "title": "例：subtree size",
      "steps": [
        "dfs(u,p) 時先 sz[u]=1。",
        "對每個 child v 執行 dfs(v,u)。",
        "回來後 sz[u]+=sz[v]。",
        "postorder 完成時 sz[u] 就是整個子樹大小。"
      ],
      "result": "樹的很多資訊天然由 child 往 parent 聚合。"
    },
    "checkpoint": [
      "會建立 parent/depth/sz。",
      "知道 Euler flattening 為何讓 subtree 連續。",
      "能用兩次 traversal 找 diameter。"
    ]
  },
  "8-bottom-up-dp": {
    "sections": [
      {
        "title": "Tree DP 就是『子樹答案往上合併』",
        "body": [
          "因為樹沒有 cycle，選 root 後每個 child subtree 都互不重疊。只要先算完所有 child，就能把它們的答案組成 parent 的答案。",
          "所以最自然順序是 postorder：children first, parent later。"
        ]
      },
      {
        "title": "State 通常描述 u 的選擇",
        "body": [
          "例如 minimum vertex cover 可以定義 dp[u][0/1] 表示 u 不選/選時，u 子樹的最小成本。若 u 不選，所有 child 必須選；若 u 選，child 可自由選較小者。",
          "這種『父狀態限制子狀態』是 Tree DP 的常見形式。"
        ]
      },
      {
        "title": "合併 child",
        "body": [
          "若 children 彼此獨立，總成本常是對每個 child 的最佳選擇相加。若還有容量、選取數量等維度，則可能需要在節點上做 knapsack-like merge。"
        ]
      }
    ],
    "example": {
      "title": "例：Tree Vertex Cover",
      "steps": [
        "dp[u][0]=0, dp[u][1]=cost[u]。",
        "child v 算完後：dp[u][0]+=dp[v][1]。",
        "dp[u][1]+=min(dp[v][0],dp[v][1])。",
        "root 取 min 兩狀態。"
      ],
      "result": "狀態直接對應『u 是否被選』的局部限制。"
    },
    "checkpoint": [
      "會選 postorder。",
      "能從 parent choice 推 child transition。",
      "知道 child subtrees 為何可以獨立合併。"
    ]
  },
  "8-reroot-relations": {
    "sections": [
      {
        "title": "不要為每個 root 重跑一次",
        "body": [
          "若一個 root 的答案 O(N)，對 N 個 root 重跑就是 O(N²)。Rerooting 的想法是：先選任意 root 算好 subtree 資訊與 root 答案，再沿每條邊把答案從 parent O(1) 推給 child。"
        ]
      },
      {
        "title": "換根時其實只改一條邊的方向",
        "body": [
          "從 u 換根到相鄰 v，v 子樹內所有點離新 root 距離少 1，其他 N-sz[v] 個點距離多 1。因此距離總和有漂亮公式 `ans[v]=ans[u] + (N-sz[v]) - sz[v]`。",
          "這種『一邊增加、一邊減少』的關係就是 reroot transition。"
        ]
      },
      {
        "title": "LCA 與倍增",
        "body": [
          "樹上兩點距離可由 `depth[u]+depth[v]-2*depth[lca]` 計算。Binary lifting 預處理 up[k][v] = v 的 2^k 祖先，查詢時先同步深度，再由大到小跳。",
          "雖然 LCA 與 reroot 不完全是同一技巧，但都建立在 parent/depth 關係之上，是 AP325 樹章後段的重要連結。"
        ]
      }
    ],
    "example": {
      "title": "例：所有節點到其他點距離總和",
      "steps": [
        "第一次 DFS 算 sz[u] 與 root=0 的 ans[0]。",
        "第二次 DFS 對 child v 套 ans[v]=ans[u]+N-2*sz[v]。",
        "每條 edge 只轉移一次。"
      ],
      "result": "原本 O(N²) 的所有根答案降到 O(N)。"
    },
    "checkpoint": [
      "能推導 N-2*sz[v]。",
      "理解 down DP + reroot pass。",
      "知道 LCA 如何把樹距離變成深度公式。"
    ]
  }
};
