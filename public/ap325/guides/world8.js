export const world8Guides = {
  "8-tree-traversal": {
    "title": "Tree Traversal：選定 root 後，所有關係都變成 parent / child",
    "source": "AP325 8.1–8.2.3，P-8-1、P-8-2，教材頁 267–278",
    "intro": "樹是連通且無環的圖，因此任兩點只有唯一簡單路徑。選一個 root 之後，每個非 root 節點都有唯一 parent；這個結構讓 depth、subtree size、Euler order、diameter 等資訊都能用一次 DFS/BFS 建立。",
    "objectives": [
      "會在 tree DFS 中用 parent 避免走回頭",
      "會計算 parent、depth、subtree size",
      "理解 Euler flattening 為何讓 subtree 成為連續區間",
      "會用兩次 traversal 理解 tree diameter"
    ],
    "focus": {
      "code": "P-8-1",
      "prompt": "樹上走訪和一般圖最大的差異是：沒有 cycle。若 dfs(u,p) 已知道 p，還需要 visited 嗎？先利用樹的唯一簡單路徑性質回答。",
      "questions": [
        "每個非 root vertex 的 parent 為什麼唯一？",
        "subtree size 為什麼一定要 child 回來後才能完成？",
        "若要查整棵 subtree，怎麼把它映射成陣列區間？"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "rooting",
        "title": "無根樹先 root，一切才有方向",
        "paragraphs": [
          "原本的 undirected tree 沒有誰是父誰是子。選定 root 後，從 root 出發的唯一簡單路徑決定每個節點的 parent；其他相鄰點就是 child。",
          "這個 rooting 只是我們的觀點，不會改變原樹。換一個 root，parent/depth/subtree 會改，但 edge 集合不變。"
        ]
      },
      {
        "type": "code",
        "id": "tree-dfs",
        "title": "一次 DFS 建 parent / depth / subtree size",
        "code": "void dfs(int u,int p){\n    parent[u]=p;\n    sz[u]=1;\n    tin[u]=timer++;\n\n    for(int v:g[u]){\n        if(v==p) continue;\n        depth[v]=depth[u]+1;\n        dfs(v,u);\n        sz[u]+=sz[v];\n    }\n\n    tout[u]=timer;\n}",
        "notes": [
          "在 tree 上跳過 parent 就足以避免走回去；一般 graph 不成立。",
          "sz[u] 必須在 child dfs 返回後累加，因此是 postorder 資訊。",
          "若 timer 只在 enter 時增加，subtree u 對應 [tin[u], tout[u])。"
        ]
      },
      {
        "type": "example",
        "id": "euler-flatten",
        "title": "為什麼 subtree 在 DFS order 中是連續的",
        "problem": "DFS 進入 u 後，在 return 以前一定會把 u 的所有 descendants 全部處理完。",
        "steps": [
          "進入 u 時記 tin[u]。",
          "接著依序完整走完每個 child subtree。",
          "在 u return 前，不可能跑去 u subtree 外的節點。",
          "因此所有 descendants 的 tin 都落在一段連續區間。"
        ],
        "conclusion": "這讓 subtree sum / update 可以轉成陣列區間問題，再接 Fenwick tree / segment tree。"
      },
      {
        "type": "text",
        "id": "diameter",
        "title": "Tree diameter：兩次最遠點搜尋",
        "paragraphs": [
          "從任一點 s 出發找到最遠點 A；再從 A 出發找到最遠點 B，A-B 是一條 tree diameter。無權樹可用 BFS，樹上也可直接 DFS 累積距離。",
          "直覺上，第一次會落到某條最長路徑的一個端點；第二次從端點出發自然走到另一端。"
        ]
      },
      {
        "type": "callout",
        "id": "tree-vs-graph",
        "title": "不要把 tree DFS 的 parent 技巧亂搬到一般 graph",
        "body": "一般 undirected graph 可能存在不是 parent 的 back/cross edge；只跳過 p 仍可能繞 cycle。只有在已知輸入是 tree 時，parent check 才能取代 visited。",
        "tone": "warning"
      }
    ],
    "practice": [
      {
        "code": "P-8-1",
        "level": "focus",
        "why": "從 traversal 建立 tree state 的第一題。"
      },
      {
        "code": "P-8-2",
        "level": "core",
        "why": "把 DFS/BFS 與樹上距離 / 派送敘述連起來。"
      }
    ],
    "checkpoints": [
      {
        "q": "為什麼 tree DFS 通常只跳過 parent 就夠？",
        "a": "樹沒有 cycle；從 u 除了通往 parent 的邊之外，其他相鄰邊都進入互不重疊的 child subtree，不可能繞回已訪節點。"
      },
      {
        "q": "Euler flattening 為什麼讓 subtree 連續？",
        "a": "DFS 一旦進入 u，在 u return 前會完整處理所有 descendants，不會先跑到 subtree 外，因此 enter times 形成連續區間。"
      }
    ],
    "mastery": [
      "能一次 DFS 建 parent/depth/sz",
      "會解釋 subtree interval",
      "知道 tree 與 general graph visited 的差異"
    ]
  },
  "8-bottom-up-dp": {
    "title": "Bottom-up Tree DP：child 先完成，parent 才有資格做決策",
    "source": "AP325 8.2.4–8.3，P-8-3、P-8-4、P-8-5、P-8-7、P-8-8、Q-8-10、P-8-11、Q-8-12，教材頁 279–303",
    "intro": "Tree DP 的核心不是『在樹上開 dp』，而是利用 child subtrees 互不重疊：先把每個 child 的答案算完，再合併成 parent。State 通常描述 u 的局部選擇，transition 則描述這個選擇如何限制 children。",
    "objectives": [
      "會以 postorder 計算 tree DP",
      "會設計 dp[u][state] 描述 u 的局部選擇",
      "能把 child states 獨立合併",
      "會處理最大獨立集 / 公司派對這類選與不選"
    ],
    "focus": {
      "code": "P-8-8",
      "prompt": "樹的最大獨立集要求相鄰節點不能同時選。定義 dp[u][0/1] 表示 u 不選 / 選時，u subtree 的最佳答案。現在直接從『u 選不選』推出 child 限制。",
      "questions": [
        "u 選時 child 能選嗎？",
        "u 不選時 child 一定要選嗎？",
        "為什麼不同 child 的答案可以直接相加？"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "postorder",
        "title": "Tree DP 的計算順序就是 postorder",
        "paragraphs": [
          "要計算 dp[u]，你通常需要每個 child v 的 dp[v]。因此 dfs(u) 裡先遞迴 child，return 後再 merge。這和一般 1D DP 的『前驅先算好』完全相同，只是依賴關係由樹決定。",
          "若你在進入 u 的瞬間就試圖完成 dp[u]，通常代表你還沒有 child 的資訊。"
        ]
      },
      {
        "type": "example",
        "id": "mis",
        "title": "P-8-8：Tree Maximum Independent Set",
        "problem": "相鄰 vertex 不可同時選，最大化選取數量 / 權重。",
        "steps": [
          "dp[u][1]：u 被選。每個 child v 就不能選，所以加 dp[v][0]。",
          "dp[u][0]：u 不選。child v 可選或不選，所以加 max(dp[v][0],dp[v][1])。",
          "每個 child subtree 互不重疊，所以貢獻可以相加。",
          "root 最後取 max(dp[root][0],dp[root][1])。"
        ],
        "conclusion": "Tree DP transition 的來源不是公式記憶，而是 parent local state 對 child state 的限制。"
      },
      {
        "type": "code",
        "id": "tree-dp-code",
        "title": "選 / 不選 Tree DP 骨架",
        "code": "void dfs(int u,int p){\n    dp[u][0]=0;\n    dp[u][1]=weight[u];\n\n    for(int v:g[u]){\n        if(v==p) continue;\n        dfs(v,u);\n        dp[u][0] += max(dp[v][0],dp[v][1]);\n        dp[u][1] += dp[v][0];\n    }\n}",
        "notes": [
          "若題目是最小化、強制覆蓋、恰好選 K 個，state / merge 會不同；不要只背這兩行。",
          "child subtrees 獨立是『可以直接相加』的原因。",
          "負權時 root answer 是否允許空集合要依題意處理。"
        ]
      },
      {
        "type": "text",
        "id": "bottom-up-variants",
        "title": "同一個 bottom-up 骨架可以算高度、成本、顏色與方案數",
        "paragraphs": [
          "P-8-4 的高度是 1+max(child height)；選位置類題可能把 child distance / cost 相加；顏色或派對題則用多狀態限制。",
          "不要以為 Tree DP 一定是 dp[u][2]。真正固定的只有『先 child、後 parent』，state 幾維由未來需要的資訊決定。"
        ]
      },
      {
        "type": "text",
        "id": "tree-knapsack",
        "title": "當 child 之間還要分配『數量』，merge 會變成 knapsack",
        "paragraphs": [
          "若 state 還記錄『在 u subtree 選了 k 個』，合併每個 child 時就要枚舉目前已選數量與 child 選取數量，這是 tree knapsack 的典型形狀。",
          "這類題複雜度不再單純 O(N)，要把每個節點的額外 state 數與 merge 成本一起計算。"
        ]
      },
      {
        "type": "callout",
        "id": "root-state",
        "title": "Root 沒有 parent，答案通常要另外決定",
        "body": "dp[u][state] 是在『parent 關係已固定』下定義的。到了 root，沒有 parent 限制，因此最後常需要在 root 的多個 state 中再取一次 min/max。",
        "tone": "tip"
      }
    ],
    "practice": [
      {
        "code": "P-8-3",
        "level": "core",
        "why": "先練 child 資訊向 parent 聚合。"
      },
      {
        "code": "P-8-4",
        "level": "core",
        "why": "高度 / root 是最乾淨的 postorder summary。"
      },
      {
        "code": "P-8-5",
        "level": "core",
        "why": "多個 child 的成本合併。"
      },
      {
        "code": "P-8-7",
        "level": "challenge",
        "why": "增加顏色 / 狀態限制，檢查 state completeness。"
      },
      {
        "code": "P-8-8",
        "level": "focus",
        "why": "選 / 不選 Tree DP 經典模型。"
      },
      {
        "code": "Q-8-10",
        "level": "challenge",
        "why": "更複雜限制下的 subtree state。"
      },
      {
        "code": "P-8-11",
        "level": "core",
        "why": "公司派對是 independent-set 類敘述的再包裝。"
      },
      {
        "code": "Q-8-12",
        "level": "challenge",
        "why": "章末整合較大型 tree state。"
      }
    ],
    "checkpoints": [
      {
        "q": "Tree MIS 中 u 不選時，child 為什麼不是『一定要選』？",
        "a": "Independent set 只限制相鄰點不能同時選；u 不選時 child 沒有被迫選，可以自行取選 / 不選的較佳值。"
      },
      {
        "q": "為什麼不同 child 的貢獻能相加？",
        "a": "移除 u 後，各 child subtree 彼此沒有邊相連；在固定 u state 下，它們成為獨立子問題。"
      }
    ],
    "mastery": [
      "能從 parent choice 推 child restrictions",
      "會用 postorder 完成 dp[u]",
      "知道何時 merge 會升級成 tree knapsack"
    ]
  },
  "8-reroot-relations": {
    "title": "Rerooting / Tree Relations：不要為每個 root 重跑一次 DFS",
    "source": "AP325 8.3，Q-8-6、Q-8-9、P-8-13～Q-8-16，教材頁 291–315",
    "intro": "如果題目要『每個 vertex 當 root 時的答案』，最直接做法是跑 N 次 O(N) DFS，變成 O(N²)。Rerooting 的關鍵是：從 u 換根到相鄰 v 時，只有 edge (u,v) 兩側的角色改變，因此常能 O(1) 更新答案。",
    "objectives": [
      "會 two-pass rerooting",
      "能推導 distance-sum 的 N-2*sz[v]",
      "理解 LCA / binary lifting 與 tree distance",
      "能把 root-dependent answer 從 O(N²) 降到 O(N)"
    ],
    "focus": {
      "code": "Q-8-6",
      "prompt": "已知 ans[u]=u 到所有點距離總和。若把 root 從 u 移到 child v，v subtree 內的點距離都減 1，其他點都加 1。直接數兩邊有幾個點。",
      "questions": [
        "v subtree 有幾個點？",
        "subtree 外有幾個點？",
        "總變化量為什麼是 N-2*sz[v]？"
      ]
    },
    "blocks": [
      {
        "type": "steps",
        "id": "two-pass",
        "title": "Rerooting 的兩次 DFS",
        "steps": [
          {
            "title": "第一趟：down information",
            "body": "選任意 root，算 sz[u]、depth、subtree cost，以及這個 root 的完整答案。"
          },
          {
            "title": "推相鄰根公式",
            "body": "分析從 u→v 時，哪些點貢獻增加、哪些減少。"
          },
          {
            "title": "第二趟：reroot",
            "body": "從 root 往下，用 O(1) transition 算每個 child 的完整答案。"
          },
          {
            "title": "每條 edge 一次",
            "body": "兩趟 DFS 都是 O(N)，總計 O(N)。"
          }
        ]
      },
      {
        "type": "example",
        "id": "distance-sum",
        "title": "Q-8-6：所有 root 的距離總和",
        "problem": "ans[u]=Σ dist(u,x)。已知 sz[v]，v 是 u 的 child。",
        "steps": [
          "換根到 v 後，v subtree 內 sz[v] 個點都離 root 近 1，總和減 sz[v]。",
          "subtree 外 N-sz[v] 個點都遠 1，總和加 N-sz[v]。",
          "所以 ans[v]=ans[u]-sz[v]+(N-sz[v])。",
          "整理得 ans[v]=ans[u]+N-2*sz[v]。"
        ],
        "conclusion": "這個公式完全來自『edge 兩側各有多少點』，不需要重新算任何距離。"
      },
      {
        "type": "code",
        "id": "reroot-code",
        "title": "Distance-sum reroot 骨架",
        "code": "void dfs1(int u,int p){\n    sz[u]=1;\n    for(int v:g[u]) if(v!=p){\n        depth[v]=depth[u]+1;\n        dfs1(v,u);\n        sz[u]+=sz[v];\n    }\n}\n\nvoid dfs2(int u,int p){\n    for(int v:g[u]) if(v!=p){\n        ans[v]=ans[u]+n-2LL*sz[v];\n        dfs2(v,u);\n    }\n}",
        "notes": [
          "ans[root] 可由 Σ depth[x] 得到。",
          "若 edge 有不同 weight，變化量還要乘該 edge weight。",
          "更一般 rerooting 可能要保存 prefix/suffix merge，才能排除某個 child 的貢獻。"
        ]
      },
      {
        "type": "text",
        "id": "lca",
        "title": "P-8-14：LCA 把 tree distance 變成深度公式",
        "paragraphs": [
          "任兩點 u、v 的路徑會在最近共同祖先 LCA(u,v) 匯合，因此 dist(u,v)=depth[u]+depth[v]-2*depth[lca]（無權樹）。",
          "Binary lifting 預處理 up[k][v] = v 的 2^k 祖先。查詢時先把較深節點跳到同深度，再從大 k 到小 k 同步往上跳，最後取得 LCA。"
        ]
      },
      {
        "type": "code",
        "id": "lca-core",
        "title": "Binary lifting 的核心資料",
        "code": "for(int k=1;k<LOG;k++)\n    for(int v=0;v<n;v++)\n        up[k][v]=up[k-1][ up[k-1][v] ];\n\n// lift u by diff\nfor(int k=0;k<LOG;k++)\n    if((diff>>k)&1) u=up[k][u];",
        "notes": [
          "up table 是倍增：2^k 祖先由兩次 2^(k-1) 組成。",
          "預處理 O(N log N)，每次 LCA O(log N)。",
          "要特別處理 root 的祖先定義，常讓 root 指向自己。"
        ]
      },
      {
        "type": "text",
        "id": "general-reroot",
        "title": "一般 rerooting：需要的是『排除某個 child 後的其餘貢獻』",
        "paragraphs": [
          "距離總和有漂亮 O(1) 公式，但不是所有 reroot 題都這麼簡單。一般情況下，你可能先算每個 child contribution，再用 prefix/suffix merge 快速得到『除了 child v 之外的所有貢獻』，把 parent-side 資訊傳給 v。",
          "這個觀點會在更進階的 reroot DP 中反覆出現：down[u] 描述 subtree，up[u] 描述 subtree 外。"
        ]
      },
      {
        "type": "callout",
        "id": "reroot-signal",
        "title": "看到『每個點當根 / 每個點答案』就先問能不能 reroot",
        "body": "先不要直接 N 次 DFS。若相鄰兩個 root 的答案只差 edge 兩側局部貢獻，通常可以把 O(N²) 降成 O(N) 或 O(N log N)。",
        "tone": "tip"
      }
    ],
    "practice": [
      {
        "code": "Q-8-6",
        "level": "focus",
        "why": "最乾淨的 reroot distance-sum 推導。"
      },
      {
        "code": "Q-8-9",
        "level": "core",
        "why": "服務中心位置把 root-dependent objective 換成最佳化問題。"
      },
      {
        "code": "P-8-13",
        "level": "challenge",
        "why": "加入不同 edge / node cost 後重新推 reroot transition。"
      },
      {
        "code": "P-8-14",
        "level": "core",
        "why": "建立 parent/depth/LCA 的 tree relation 查詢。"
      },
      {
        "code": "Q-8-15",
        "level": "challenge",
        "why": "距離與路徑綜合題。"
      },
      {
        "code": "Q-8-16",
        "level": "challenge",
        "why": "AP325 Tree 章末 Boss，整合樹關係與演算法建模。"
      }
    ],
    "checkpoints": [
      {
        "q": "ans[v]=ans[u]+N-2*sz[v] 怎麼推？",
        "a": "換根 u→v 後，v subtree 的 sz[v] 個點各近 1，其餘 N-sz[v] 個點各遠 1，所以變化=(N-sz[v])-sz[v]。"
      },
      {
        "q": "LCA 為什麼能算兩點距離？",
        "a": "u→v 唯一路徑由 u 上到 LCA，再從 LCA 下到 v，長度是兩個 depth 減去重複的兩份 LCA depth。"
      },
      {
        "q": "一般 rerooting 沒有簡單公式時怎麼辦？",
        "a": "拆成 down 與 up 資訊，並用 prefix/suffix 等技巧快速取得『排除某 child 後的其他貢獻』。"
      }
    ],
    "mastery": [
      "能自行推導相鄰換根公式",
      "會 two-pass rerooting",
      "會用 binary lifting 查 LCA",
      "看到 all-roots 問題會先避免 O(N²)"
    ]
  }
};
