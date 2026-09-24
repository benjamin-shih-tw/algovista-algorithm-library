export const guideC = {
  "6-dp-mindset": {
    "sections": [
      {
        "title": "DP 不是表格，是『不要重算同一個子問題』",
        "body": [
          "很多遞迴會重複遇到完全相同的 state。DP 的做法是先定義 state，再把每個 state 的答案只算一次。表格只是儲存方式。",
          "真正的起點永遠是：`dp[state]` 這句話到底代表什麼。若定義模糊，transition 再漂亮也沒有意義。"
        ]
      },
      {
        "title": "五步驟框架",
        "body": [
          "1. State：每個索引代表什麼。2. Base：最小已知答案。3. Transition：最後一步從哪裡來。4. Order：先算誰才能保證依賴已完成。5. Answer：最後要讀哪個 state。",
          "做 DP 題時先把這五行寫成中文，常常比直接 coding 更快。"
        ]
      },
      {
        "title": "Top-down 與 Bottom-up",
        "body": [
          "Top-down memoization 比較接近原始遞迴，只計算真正被訪問的 state；Bottom-up 則依合法順序逐一填表，通常更容易控制常數與記憶體。",
          "兩者本質相同：都保證每個 state 只計算一次。"
        ]
      }
    ],
    "example": {
      "title": "例：爬樓梯",
      "steps": [
        "定義 dp[i]：到第 i 階的最少成本。",
        "最後一步可能從 i-1 或 i-2 來。",
        "所以 dp[i]=min(dp[i-1]+cost1, dp[i-2]+cost2)。",
        "由小 i 填到大 i。"
      ],
      "result": "Transition 是從『最後一步有哪些可能』推導，不是憑空背公式。"
    },
    "checkpoint": [
      "能完整寫出 State/Base/Transition/Order/Answer。",
      "能分清 top-down 與 bottom-up。",
      "知道 state 語意不能中途改變。"
    ]
  },
  "6-1d0d": {
    "sections": [
      {
        "title": "1D0D 是最基本的線性 DP",
        "body": [
          "一維 state `dp[i]`，每個 state 只依賴固定數量的前驅，例如 i-1、i-2。這種題目最適合練習『state 語意一致』。",
          "常見兩種定義很容易混淆：`dp[i]=前 i 個元素的最佳答案`，與 `dp[i]=恰好以 i 結尾的最佳答案`。它們的 transition 完全不同。"
        ]
      },
      {
        "title": "選 / 不選",
        "body": [
          "若每個物件可以選或不選，通常從『第 i 個有沒有選』拆 transition。例如 non-adjacent maximum：不選 i → dp[i-1]；選 i → dp[i-2]+a[i]。"
        ]
      },
      {
        "title": "空間壓縮",
        "body": [
          "如果 dp[i] 只依賴前兩三個 state，就不必保存整張表。保留 rolling variables 即可把 O(N) 空間壓到 O(1)，但先確保你不需要回溯答案。"
        ]
      }
    ],
    "example": {
      "title": "例：不能選相鄰元素的最大總和",
      "steps": [
        "定義 dp[i]：前 i 個元素可取得的最大和。",
        "第 i 個不選：dp[i-1]。",
        "第 i 個選：dp[i-2]+a[i]。",
        "兩者取 max。"
      ],
      "result": "最後答案是 dp[n]，而不是一定『以 n 結尾』。"
    },
    "checkpoint": [
      "會辨認『前 i 個』與『以 i 結尾』。",
      "能從最後決策推 transition。",
      "會在適合時做 rolling array。"
    ]
  },
  "6-2d0d": {
    "sections": [
      {
        "title": "兩個維度通常代表兩個位置",
        "body": [
          "Grid DP 的 state 是 row/column；LCS 的 state 是兩個字串前綴長度。只要每格只依賴固定鄰居，就屬於典型 2D0D。",
          "畫出依賴箭頭很有幫助：如果 (i,j) 依賴上、左、左上，那就知道填表方向必須確保這三格先完成。"
        ]
      },
      {
        "title": "LCS 的 transition",
        "body": [
          "若 A[i-1]==B[j-1]，可以把這個共同字元接在 LCS(A前i-1,B前j-1) 後面，所以 +1。若不同，最後至少有一邊的末字元不使用，因此取 dp[i-1][j] 與 dp[i][j-1] 的最大值。"
        ]
      },
      {
        "title": "二維前綴與最大子矩陣",
        "body": [
          "很多二維 DP 題會先搭配 prefix sum，把矩形 cost 從 O(HW) 降成 O(1)。要習慣把『狀態轉移』與『cost 查詢』分開最佳化。"
        ]
      }
    ],
    "example": {
      "title": "例：LCS('ABC','AC')",
      "steps": [
        "dp[0][*]=dp[*][0]=0。",
        "A vs A 相同 → dp[1][1]=1。",
        "B vs C 不同 → 取上/左最大。",
        "C vs C 相同 → dp[3][2]=dp[2][1]+1=2。"
      ],
      "result": "答案是 2，對應 'AC'。"
    },
    "checkpoint": [
      "能畫 2D DP 依賴方向。",
      "會推導 LCS match/mismatch。",
      "知道邊界第 0 列/欄的意義。"
    ]
  },
  "6-1d1d": {
    "sections": [
      {
        "title": "每個 i 都要枚舉前一個 j",
        "body": [
          "這類 DP 常寫成 `dp[i] = best(dp[j] + cost(j,i))`，其中 j 遍歷一段前驅。最直觀版本通常 O(N²)。",
          "不要一看到 O(N²) 就急著用資料結構。先把正確 transition 寫清楚，再觀察 cost 是否具有單調性、凸性、可二分或可維護最大值。"
        ]
      },
      {
        "title": "LIS 是代表例",
        "body": [
          "若定義 dp[i] 為『以 i 結尾的 LIS 長度』，就枚舉所有 j<i 且 a[j]<a[i]，轉移 dp[i]=max(dp[i],dp[j]+1)。這是標準 O(N²) 1D1D。",
          "進一步的 O(N log N) tails 解法已經不是單純 DP 表，而是利用『各長度最小結尾』的單調結構。"
        ]
      },
      {
        "title": "最後切點思維",
        "body": [
          "切棍、分段、排程等題常把 j 解釋成『上一個切點/上一個決策』。這個語意能幫你避免 j 範圍與 off-by-one 混亂。"
        ]
      }
    ],
    "example": {
      "title": "例：O(N²) LIS",
      "steps": [
        "dp[i]=1。",
        "對所有 j<i，若 a[j]<a[i]，嘗試 dp[j]+1。",
        "答案是 max_i dp[i]。"
      ],
      "result": "先掌握正確狀態，再學 tails 的 O(N log N) 優化。"
    },
    "checkpoint": [
      "會寫 O(N²) transition。",
      "能解釋 j 的語意。",
      "知道優化前先確保原 DP 正確。"
    ]
  },
  "6-interval-advanced": {
    "sections": [
      {
        "title": "Interval DP：狀態是一段區間",
        "body": [
          "`dp[l][r]` 通常代表處理區間 [l,r) 的最佳答案。因為大區間會依賴較小區間，所以計算順序應依 length 從短到長。",
          "常見 transition 是枚舉最後切點 k，把 [l,r) 分成 [l,k) 與 [k,r)。"
        ]
      },
      {
        "title": "Matrix Chain",
        "body": [
          "矩陣乘法順序不改變最終矩陣，但會大幅改變 scalar multiplication 次數。`dp[l][r]` 可以定義為把第 l..r 段矩陣乘完的最小成本，枚舉最後一次合併點 k。"
        ]
      },
      {
        "title": "Bitmask DP",
        "body": [
          "當 N 小、state 由『已選哪些元素』決定時，可以用整數 mask 表示集合。第 i bit=1 表示元素 i 已經選。",
          "典型 TSP state 是 `dp[mask][last]`：走過 mask 中所有城市，最後停在 last 的最小成本。State 數 2^N×N，所以 N 一大就會爆。"
        ]
      },
      {
        "title": "計算順序與複雜度",
        "body": [
          "Interval DP 常見 N² states × N 個切點 = O(N³)；TSP 常見 2^N×N states，每個 state 再試 N 個 next = O(N²2^N)。先算 state 數再決定能不能做。"
        ]
      }
    ],
    "example": {
      "title": "例：Matrix Chain A(10×30),B(30×5),C(5×60)",
      "steps": [
        "(AB)C：10×30×5 + 10×5×60 = 4500。",
        "A(BC)：30×5×60 + 10×30×60 = 27000。",
        "同樣三個矩陣，括號位置造成巨大成本差。"
      ],
      "result": "Interval DP 的切點就是在選最後一次合併在哪裡。"
    },
    "checkpoint": [
      "會依 length 填 interval DP。",
      "能讀懂 mask 位元語意。",
      "會估 O(N³) 與 O(N²2^N) 是否可行。"
    ]
  }
};
