export const pdfSupplements = {
  "0-danger-zone": [
    {
      "title": "編譯器優化：它能讓常數變快，不能把錯的複雜度救活",
      "paragraphs": [
        "AP325 把 compiler optimization 放在預備知識最後，是因為它很容易被誤用。-O2 / -O3 會做 inline、dead-code elimination、vectorization 等最佳化，但不會把 O(N²) 自動變成 O(N log N)。如果 N=2×10^5，錯的演算法階數仍然會 TLE。",
        "更重要的是：最佳化建立在程式沒有 undefined behavior 的前提上。越界、signed overflow 等 UB 在開 optimization 後可能表現得更奇怪；不要把『關掉 O2 就正常』當成修 bug。競賽上先保證正確與複雜度，再考慮 pragma。"
      ],
      "bullets": [
        "先選對演算法階數，再談常數優化",
        "不要依賴 undefined behavior",
        "pragma 是最後的微調，不是演算法"
      ]
    }
  ],
  "2-binary-search": [
    {
      "title": "Bitonic sequence：先找山頂，再在兩側二分",
      "paragraphs": [
        "Bitonic sequence 先嚴格上升、再嚴格下降。它整體不是單調陣列，所以不能直接對整段做普通 binary search；但山頂左右各自單調。",
        "第一步可比較 a[mid] 與 a[mid+1] 找 peak：若 a[mid] < a[mid+1]，mid 還在上坡，peak 在右側；否則 peak 在 mid 或左側。找到 peak 後，左半做遞增二分、右半做遞減二分。",
        "這個技巧的重要觀念是：『整體不單調』不代表不能二分；先把資料切成少數單調區段即可。"
      ]
    },
    {
      "title": "set / map：把二分搜尋交給平衡樹",
      "paragraphs": [
        "std::set / std::map 通常以平衡搜尋樹實作，insert、erase、find、lower_bound 都是 O(log N)。它們適合資料會動態加入刪除、但仍需要有序搜尋的情況。",
        "set 只保留唯一 key；multiset 允許重複；map 是 key→value。和 vector + sort 的差別是：vector 適合一次排序後大量查詢，set/map 適合在線動態維護。",
        "set::lower_bound(x) 一樣是第一個 >=x；但回傳 iterator，可能等於 end()。競賽中常見 bug 是直接解參考 end iterator。"
      ]
    }
  ],
  "3-linear-structures": [
    {
      "title": "Linked list：當刪除的是『已知位置』而不是『已知索引』",
      "paragraphs": [
        "Linked list 的節點彼此以 pointer / link 串接。若已經拿到某節點 iterator，插入或刪除可 O(1) 完成；但要找第 k 個位置仍需 O(k)，所以它不是 vector 的全面升級。",
        "AP325 把 linked list 放在 queue/stack/deque 應用附近，是因為有些題需要頻繁刪除中間元素，同時還要快速找到被刪元素的前後鄰居。這時『保存 iterator / next-prev 關係』比每次搬動陣列省很多。",
        "C++ std::list 的 iterator 在刪除其他節點時通常仍有效，但被 erase 的 iterator 立即失效。競賽裡若只是兩側刪除，deque 往往更簡單；真的需要任意節點 O(1) splice/erase 才考慮 list。"
      ]
    }
  ],
  "6-dp-mindset": [
    {
      "title": "Top-down memoization：從正確暴搜直接長成 DP",
      "paragraphs": [
        "如果你已經能寫出遞迴 f(state)，但 recursion tree 裡同一個 state 被重複計算，就可以加 memo。第一次算 f(state) 時存答案；之後遇到同 state 直接回傳。",
        "Memoization 不會自動降低 state 數；它只是保證每個 state 最多真正展開一次。因此複雜度仍要算『可達 state 數 × 每 state transition 數』。",
        "Top-down 特別適合 state 空間很大但實際只會走到一小部分的題；Bottom-up 則通常常數較小、順序與空間壓縮更容易控制。"
      ]
    }
  ],
  "6-interval-advanced": [
    {
      "title": "2D1D：二維 state，每格再枚舉一個 transition 位置",
      "paragraphs": [
        "AP325 的分類可把 state 維度與 transition 枚舉維度分開看。2D1D 代表 dp 有兩個主要索引，例如 dp[l][r]，而計算一個 state 時還要枚舉一個 k。",
        "Interval DP 就是最典型例子：dp[l][r] 表示區間答案，transition 枚舉切點 k，所以 state 約 O(N²)，每 state 再 O(N)，總計 O(N³)。",
        "這個分類的價值是讓你在寫 code 前就估出成本：不是看到兩維陣列就喊 O(N²)，還要把每個 state 內部的 transition 掃描一起乘進去。"
      ]
    }
  ],
  "7-graph-foundation": [
    {
      "title": "不用 vector 的 adjacency list：理解底層，而不是要求你每題重造輪子",
      "paragraphs": [
        "AP325 另外介紹以 edge array + next index 手刻 adjacency list。概念上，每個 vertex 保存第一條 outgoing edge 的編號，每條 edge 再保存下一條同起點 edge 的編號，形成一條 linked list。",
        "這種寫法可避免大量小 vector 的配置，在極端效能或固定記憶體環境有價值；但現代競賽多數情況 `vector<vector<Edge>>` 已足夠清楚且快速。",
        "真正要學的是 adjacency list 的本質：只為實際存在的 edge 配空間，因此稀疏圖空間 O(V+E)，而不是一定要背某一份 head/next/to 陣列模板。"
      ]
    }
  ]
};
export const ap325SourceMap = [
  {
    "section": "0.2.1",
    "title": "基本 C++模板與輸入輸出",
    "module": "0-cpp-testing"
  },
  {
    "section": "0.2.2",
    "title": "程式測試與測試資料",
    "module": "0-cpp-testing"
  },
  {
    "section": "0.2.3",
    "title": "複雜度估算",
    "module": "0-complexity"
  },
  {
    "section": "0.2.4",
    "title": "整數 overflow / rounding error / short-circuit / 編譯器優化",
    "module": "0-danger-zone"
  },
  {
    "section": "1.1",
    "title": "基本遞迴觀念與用法",
    "module": "1-recursion-model"
  },
  {
    "section": "1.2",
    "title": "實作遞迴定義",
    "module": "1-recursion-model"
  },
  {
    "section": "1.3",
    "title": "以遞迴窮舉暴搜 / Backtracking",
    "module": "1-enumeration"
  },
  {
    "section": "2.1",
    "title": "排序與離散化",
    "module": "2-sorting"
  },
  {
    "section": "2.2",
    "title": "二分搜 / lower_bound / set-map",
    "module": "2-binary-search"
  },
  {
    "section": "2.3a",
    "title": "Bitonic sequence 搜尋",
    "module": "2-binary-search"
  },
  {
    "section": "2.3b",
    "title": "快速冪",
    "module": "2-fast-power"
  },
  {
    "section": "2.3c",
    "title": "快速計算 Fibonacci",
    "module": "2-fibonacci"
  },
  {
    "section": "2.4",
    "title": "搜尋例題 / Two-number / MITM",
    "module": "2-two-number"
  },
  {
    "section": "3.1a",
    "title": "queue / stack / deque",
    "module": "3-linear-structures"
  },
  {
    "section": "3.2a",
    "title": "stack 應用與單調結構",
    "module": "3-expression-stack"
  },
  {
    "section": "3.2b",
    "title": "Linked list",
    "module": "3-linear-structures"
  },
  {
    "section": "3.2c",
    "title": "Sliding window",
    "module": "3-sliding-window"
  },
  {
    "section": "4.1",
    "title": "Greedy 基本原理 / priority_queue",
    "module": "4-greedy-basics"
  },
  {
    "section": "4.2.1",
    "title": "單欄位資料排序 Greedy",
    "module": "4-scheduling"
  },
  {
    "section": "4.2.2",
    "title": "結構資料排序 Greedy",
    "module": "4-scheduling"
  },
  {
    "section": "4.2.3",
    "title": "PQ 處理動態資料",
    "module": "4-priority-queue"
  },
  {
    "section": "4.2.4",
    "title": "外掛二分搜",
    "module": "4-binary-answer"
  },
  {
    "section": "4.2.5",
    "title": "Sweep line",
    "module": "4-sweep-line"
  },
  {
    "section": "5.1",
    "title": "分治基本原理與複雜度",
    "module": "5-divide-basics"
  },
  {
    "section": "5.2",
    "title": "Merge / inversion / 分治例題",
    "module": "5-merge-inversion"
  },
  {
    "section": "5.3",
    "title": "分治補充",
    "module": "5-divide-patterns"
  },
  {
    "section": "6.1.1",
    "title": "DP 基本思維與步驟",
    "module": "6-dp-mindset"
  },
  {
    "section": "6.1.2",
    "title": "狀態轉移",
    "module": "6-dp-mindset"
  },
  {
    "section": "6.1.3",
    "title": "分類與複雜度",
    "module": "6-dp-mindset"
  },
  {
    "section": "6.1.4",
    "title": "Top-down memoization",
    "module": "6-dp-mindset"
  },
  {
    "section": "6.2.1",
    "title": "1D0D",
    "module": "6-1d0d"
  },
  {
    "section": "6.2.2",
    "title": "2D0D",
    "module": "6-2d0d"
  },
  {
    "section": "6.2.3",
    "title": "1D1D",
    "module": "6-1d1d"
  },
  {
    "section": "6.2.4",
    "title": "2D1D 與其他",
    "module": "6-interval-advanced"
  },
  {
    "section": "6.3",
    "title": "進階 DP",
    "module": "6-interval-advanced"
  },
  {
    "section": "7.1",
    "title": "圖論基本名詞",
    "module": "7-graph-foundation"
  },
  {
    "section": "7.2.1",
    "title": "圖資料結構 / adjacency list",
    "module": "7-graph-foundation"
  },
  {
    "section": "7.2.2",
    "title": "BFS",
    "module": "7-bfs"
  },
  {
    "section": "7.2.3",
    "title": "DFS",
    "module": "7-dfs-dag"
  },
  {
    "section": "7.2.4",
    "title": "DAG / topological sort",
    "module": "7-dfs-dag"
  },
  {
    "section": "7.3",
    "title": "圖論例題 / DAG path",
    "module": "7-dfs-dag"
  },
  {
    "section": "7.4.1",
    "title": "Dijkstra",
    "module": "7-dijkstra"
  },
  {
    "section": "7.4.2",
    "title": "Union and Find",
    "module": "7-dsu-mst"
  },
  {
    "section": "7.4.3",
    "title": "Minimum Spanning Tree",
    "module": "7-dsu-mst"
  },
  {
    "section": "8.1",
    "title": "Tree 基本觀念與名詞",
    "module": "8-tree-traversal"
  },
  {
    "section": "8.2.1",
    "title": "Tree 儲存資料結構",
    "module": "8-tree-traversal"
  },
  {
    "section": "8.2.2",
    "title": "Tree DFS",
    "module": "8-tree-traversal"
  },
  {
    "section": "8.2.3",
    "title": "Tree BFS",
    "module": "8-tree-traversal"
  },
  {
    "section": "8.2.4",
    "title": "Bottom-up traversal",
    "module": "8-bottom-up-dp"
  },
  {
    "section": "8.3",
    "title": "Tree 例題 / Tree DP / Reroot",
    "module": "8-reroot-relations"
  }
];
