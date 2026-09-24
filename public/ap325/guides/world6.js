export const world6Guides = {
  "6-dp-mindset": {
    title: "Dynamic Programming：先定義 state，再談 transition",
    source: "AP325 6.1，教材頁 161–167",
    intro: "DP 最容易學成一堆公式，但 AP325 真正想建立的是一套解題流程：找重複子問題、定義 state、列 base case、從最後一步推 transition、決定計算順序，再估 state 數 × 每個 state 的轉移成本。",
    objectives: [
      "能用一句完整中文定義 dp[state]",
      "會從最後一步推導 transition",
      "能在 top-down memoization 與 bottom-up 之間轉換",
      "會用 state 數 × transition 成本估複雜度"
    ],
    focus: {
      title: "先不要看任何特定題目：把 DP 寫成五行中文",
      prompt: "拿一題你熟悉的 DP，在寫 code 前先寫：State / Base / Transition / Order / Answer。只要其中一行含糊，就先不要 coding。",
      questions: [
        "dp[i] 是『前 i 個最佳』還是『恰好以 i 結尾』？",
        "transition 用到的 state 是否已經先算好？",
        "答案真的在 dp[n]，還是要取 max/min over states？"
      ]
    },
    blocks: [
      {
        type: "steps",
        id: "five-step",
        title: "DP 五步驟",
        steps: [
          { title: "State", body: "每個維度代表什麼？用一句話完整定義，例如 dp[i]=處理前 i 個項目的最佳答案。" },
          { title: "Base", body: "最小 state 的答案是什麼？初始化值要符合語意，而不是看到最大化就全部設 0。" },
          { title: "Transition", body: "枚舉『最後一步 / 最後一個決策』，把答案拆回較小 state。" },
          { title: "Order", body: "所有依賴必須在使用前完成；top-down 靠 recursion，bottom-up 靠迴圈順序。" },
          { title: "Answer", body: "最後答案在哪裡？有時是 dp[n]，有時是 max_i dp[i]，有時要看多個 ending state。" }
        ]
      },
      {
        type: "text",
        id: "memo-vs-table",
        title: "Top-down memoization 與 Bottom-up 是同一件事",
        paragraphs: [
          "Top-down 從原始 recursion 出發，遇到 state 第一次才計算並記住；Bottom-up 則先找依賴順序，用迴圈把所有 state 填完。兩者都在保證『同一個 state 不重算』。",
          "Top-down 的優點是容易從暴搜改寫，也可能只碰到真的需要的 state；Bottom-up 的優點是常數小、順序清楚、容易做滾動陣列。"
        ]
      },
      {
        type: "example",
        id: "fib-overlap",
        title: "從 naive Fibonacci 看『重疊子問題』",
        problem: "fib(n)=fib(n-1)+fib(n-2)。",
        steps: [
          "fib(5) 會呼叫 fib(4) 與 fib(3)。",
          "fib(4) 內又會呼叫 fib(3)，同一個 fib(3) 被重算。",
          "記住 fib(3) 的答案後，之後再次需要時 O(1) 取回。",
          "state 只有 n+1 個，每個 state 做 O(1) transition，所以從指數降成 O(n)。"
        ],
        conclusion: "DP 的本質不是陣列，而是把 recursion tree 中相同 state 合併成一個節點。"
      },
      {
        type: "callout",
        id: "definition-warning",
        title: "DP 最常見的錯：同一個 dp[i] 被你偷偷換了語意",
        body: "例如前半段把 dp[i] 當『前 i 個最佳』，後半段又用成『恰好以 i 結尾』。公式可能看起來很像，但 correctness 已經不存在。每次寫 transition 前都重新念一次 state definition。",
        tone: "warning"
      }
    ],
    practice: [],
    checkpoints: [
      { q: "Top-down 與 bottom-up 的本質差別是什麼？", a: "狀態與 transition 可以完全相同，只是計算順序不同：top-down 由需求驅動遞迴，bottom-up 依拓樸順序迭代。" },
      { q: "DP 複雜度最穩定的估法？", a: "可達 state 數 × 每個 state 枚舉的 transition 數，再加上每次 transition 的額外成本。" }
    ],
    mastery: [
      "任何 DP 題都先寫 State/Base/Transition/Order/Answer",
      "能把 memoized recursion 改成 table",
      "會從 state 數推估時間與記憶體"
    ]
  },

  "6-1d0d": {
    title: "1D0D DP：一維 state、常數個前驅",
    source: "AP325 6.2.1，P-6-1～Q-6-4，教材頁 168–174",
    intro: "1D0D 是建立 DP 手感的最佳區域：dp[i] 只依賴固定數量的前面 state。真正要練的是精確 state definition，以及『選 / 不選』『最後一步從哪裡來』兩種 transition 思考。",
    objectives: [
      "會設計 dp[i] 的精確語意",
      "會處理選 / 不選與固定步長 transition",
      "能判斷何時可用 rolling variables 壓到 O(1) 空間"
    ],
    focus: {
      code: "P-6-1",
      prompt: "先定義 dp[i]：到第 i 個位置的最小成本。不要先想迴圈。問：要到 i，最後一步可能從哪些位置來？",
      questions: [
        "base case 需要幾個？",
        "若某些位置不能站，應如何表示不可達？",
        "若只依賴前兩格，整張 dp 表是否一定要保留？"
      ]
    },
    blocks: [
      {
        type: "example",
        id: "stairs",
        title: "P-6-1：小朋友上樓梯最小成本",
        problem: "dp[i] 定義為到達位置 i 的最小成本。",
        steps: [
          "列出能到 i 的最後一步，例如從 i-1 或 i-2。",
          "每個前驅答案已知後，加上這一步對應成本。",
          "dp[i] 取所有合法前驅 candidate 的 min。",
          "按照 i 由小到大填，確保前驅已完成。"
        ],
        conclusion: "Transition 不是背出來的，而是『枚舉最後一步』自然得到。"
      },
      {
        type: "text",
        id: "choose-skip",
        title: "P-6-2：選 / 不選是最常見的一維 DP",
        paragraphs: [
          "若相鄰項目不能同時選，可以定義 dp[i] 為『前 i 個項目的最大收益』。第 i 個不選 → dp[i-1]；第 i 個選 → dp[i-2]+value[i]。",
          "注意這個 dp[i] 是前綴最佳，不是『恰好選 i』。如果 state 定義改成 ending-at-i，transition 會完全不同。"
        ]
      },
      {
        type: "code",
        id: "take-skip-code",
        title: "選 / 不選骨架",
        code: "vector<long long> dp(n+1,0);\nfor(int i=1;i<=n;i++){\n    dp[i]=dp[i-1]; // 不選 i\n    if(i>=2) dp[i]=max(dp[i],dp[i-2]+value[i]);\n    else dp[i]=max(dp[i],value[i]);\n}",
        notes: [
          "初始化要配合『允許一個都不選嗎？』這個題意。",
          "最大化且可能有負值時，0 是否合法要先確認。",
          "只依賴 i-1、i-2 時可壓成兩個變數。"
        ]
      },
      {
        type: "text",
        id: "state-machine",
        title: "Q-6-4：當『上一個選擇』會影響下一步，就把它放進 state",
        paragraphs: [
          "有些題看起來仍是一維序列，但每一關有兩種狀態，下一步成本取決於你上一關選哪個。這時不是硬塞進一個 dp[i]，而是擴成 dp[i][state]。",
          "這個觀念很重要：DP 維度不是由輸入維度決定，而是由『描述未來所需資訊』決定。"
        ]
      }
    ],
    practice: [
      { code: "P-6-1", level: "focus", why: "練最後一步與 min transition。" },
      { code: "P-6-2", level: "core", why: "建立前綴最佳的選 / 不選模型。" },
      { code: "P-6-3", level: "core", why: "加入鄰居限制，檢查 state 是否完整。" },
      { code: "Q-6-4", level: "challenge", why: "同一位置有多種狀態，開始從 1D 走向小型 state machine DP。" }
    ],
    checkpoints: [
      { q: "dp[i]=前 i 個最佳與 dp[i]=恰好以 i 結尾有何差別？", a: "前者已經包含不選 i 的可能，常會從 dp[i-1] 直接繼承；後者強制 i 在解中，通常只從能接到 i 的前驅轉移。" },
      { q: "何時可以 rolling array？", a: "當未來只會依賴固定幾個最近 state，且不需要完整表來重建答案或做後續查詢時。" }
    ],
    mastery: [
      "能從最後一步寫出 transition",
      "不混淆 prefix-best 與 ending-at-i",
      "會判斷是否能壓縮空間"
    ]
  },

  "6-2d0d": {
    title: "2D0D DP：兩個位置、固定鄰居與二維依賴",
    source: "AP325 6.2.2，Q-6-5～P-6-9，教材頁 174–182",
    intro: "當 state 需要兩個座標或兩個前綴長度才能描述，就自然出現二維 DP。這一節的核心不是『開二維陣列』，而是畫出依賴箭頭，讓填表順序與 transition 一眼可驗證。",
    objectives: [
      "會從 grid / 兩字串前綴定義 dp[i][j]",
      "會推導 LCS 的 match / mismatch transition",
      "能把 prefix sum 等前處理與 DP transition 分開"
    ],
    focus: {
      code: "P-6-7",
      prompt: "定義 dp[i][j] 為 A 前 i 個字元與 B 前 j 個字元的 LCS 長度。現在只問：最後兩個字元相等與不相等時，各自代表什麼？",
      questions: [
        "match 時為什麼可看 dp[i-1][j-1]+1？",
        "mismatch 時為什麼只需考慮丟掉 A 尾或 B 尾？",
        "第 0 列與第 0 欄代表什麼？"
      ]
    },
    blocks: [
      {
        type: "text",
        id: "dependency-arrows",
        title: "先畫依賴箭頭，再決定迴圈順序",
        paragraphs: [
          "Grid path 常依賴上方與左方；LCS 常依賴上、左、左上。只要把箭頭畫出來，就知道 row-major 從左上往右下可以保證來源先完成。",
          "若 transition 依賴未來格子，你不是『不能 DP』，而是填表順序或 state 定義需要調整。"
        ]
      },
      {
        type: "example",
        id: "lcs",
        title: "P-6-7：LCS",
        problem: "A=ABC，B=AC。",
        steps: [
          "dp[0][*]=dp[*][0]=0，空字串和任何字串 LCS 都是 0。",
          "A[0]=B[0]='A'，所以 dp[1][1]=dp[0][0]+1=1。",
          "比較 B 與 C 時 mismatch，取上方 / 左方最大值。",
          "最後 C 與 C match，dp[3][2]=dp[2][1]+1=2。"
        ],
        conclusion: "答案 2 對應 AC。Match/mismatch 不是模板，而是從『最後字元是否能共同使用』推來。"
      },
      {
        type: "code",
        id: "lcs-code",
        title: "LCS O(NM)",
        code: "vector<vector<int>> dp(n+1,vector<int>(m+1));\nfor(int i=1;i<=n;i++){\n    for(int j=1;j<=m;j++){\n        if(A[i-1]==B[j-1])\n            dp[i][j]=dp[i-1][j-1]+1;\n        else\n            dp[i][j]=max(dp[i-1][j],dp[i][j-1]);\n    }\n}",
        notes: [
          "字串 index 與 dp prefix 長度差 1，這是最常見 off-by-one。",
          "若只要長度，可以滾動兩列；若要重建 LCS，保留完整表比較方便。"
        ]
      },
      {
        type: "text",
        id: "grid-and-rectangle",
        title: "Grid DP 與二維最大子矩陣不是同一件事",
        paragraphs: [
          "P-6-6 的 grid path 是『每格由固定鄰居轉移』；Q-6-5 的最大子矩陣則常需要先固定上下界，再把列壓成一維後做 maximum subarray。",
          "重點是不要看到『二維』就自動開 dp[i][j]。State 必須代表可重用的子問題，而不是照輸入長相抄維度。"
        ]
      },
      {
        type: "callout",
        id: "local-alignment",
        title: "Local alignment：允許重新開始，就是把 0 放進 transition",
        body: "Local alignment 與 LCS / global alignment 的差異之一，是當前分數若變差可以從 0 重新開始。這和 Kadane 的 max(0, previous+gain) 有相似精神。",
        tone: "tip"
      }
    ],
    practice: [
      { code: "P-6-6", level: "core", why: "先練最乾淨的 grid dependency。" },
      { code: "P-6-7", level: "focus", why: "二維 prefix DP 的經典模型。" },
      { code: "Q-6-8", level: "challenge", why: "從 LCS 延伸到 scoring / reset，檢查你是否理解 state 而非背公式。" },
      { code: "Q-6-5", level: "core", why: "學會二維題不一定等於二維 DP。" },
      { code: "P-6-9", level: "core", why: "用另一個二維狀態驗證依賴順序。" }
    ],
    checkpoints: [
      { q: "LCS mismatch 時為什麼取 dp[i-1][j] 與 dp[i][j-1]？", a: "最後兩字元不同，不可能同時作為共同子序列最後一字；最優解至少會忽略其中一邊的末字元。" },
      { q: "輸入是二維就一定要二維 DP 嗎？", a: "不一定。維度由描述子問題所需 state 決定，不是由輸入格式決定。" }
    ],
    mastery: [
      "能畫二維 DP 依賴箭頭",
      "會獨立推 LCS transition",
      "知道二維輸入與二維 state 是兩回事"
    ]
  },

  "6-1d1d": {
    title: "1D1D DP：每個 state 枚舉一段前驅",
    source: "AP325 6.2.3，Q-6-10～P-6-16，教材頁 183–196",
    intro: "1D1D 的典型形式是：對每個 i，枚舉所有可能的前一個決策 j。最直觀版本常是 O(N²)。這一節最重要的能力，是把 j 的語意說清楚，再辨認 transition 是否能被排序、二分、deque 或其他資料結構最佳化。",
    objectives: [
      "會把 j 解釋成上一個決策 / 切點 / 前驅",
      "先寫正確 O(N²) 再談最佳化",
      "能辨認 LIS、分段、交易等 1D1D 結構"
    ],
    focus: {
      code: "P-6-15",
      prompt: "先用 O(N²) 思考：若 dp[i] 代表『恰好以 i 結尾』的最佳答案，前一個元素 j 需要滿足什麼條件？",
      questions: [
        "j 的合法範圍是什麼？",
        "答案是 dp[n] 還是 max_i dp[i]？",
        "如果 N 變大，transition 有沒有單調性可利用？"
      ]
    },
    blocks: [
      {
        type: "text",
        id: "previous-decision",
        title: "把 j 當成『上一個決策』",
        paragraphs: [
          "很多 O(N²) DP 看起來公式不同，其實都在枚舉上一個關鍵位置。只要能說出 j 的具體角色，合法範圍與 cost(j,i) 就會清楚很多。",
          "例如 LIS 中 j 是前一個選入元素；分段問題中 j 是上一個切點；排程中 j 可能是最後一個與 i 相容的工作。"
        ]
      },
      {
        type: "example",
        id: "lis-n2",
        title: "以 LIS 建立 1D1D 心智模型",
        problem: "dp[i] = 恰好以 a[i] 結尾的最長遞增子序列長度。",
        steps: [
          "任何答案至少可只有 a[i] 自己，所以 dp[i]=1。",
          "枚舉所有 j<i。",
          "若 a[j]<a[i]，就能把 i 接到以 j 結尾的序列後，candidate=dp[j]+1。",
          "答案不是 dp[n-1]，而是 max_i dp[i]。"
        ],
        conclusion: "這是 O(N²) 的正確基線。後續 O(N log N) tails 是利用額外單調結構，不是改變問題定義。"
      },
      {
        type: "callout",
        id: "optimize-later",
        title: "先有正確 baseline，再最佳化",
        body: "如果 O(N²) 版本的 state / transition 都說不清楚，直接上 segment tree、deque 或 convex hull trick 只會把 bug 藏得更深。競賽實務上，能先寫 brute / quadratic oracle 還可以拿來 stress test 最佳化版。",
        tone: "warning"
      },
      {
        type: "text",
        id: "catalan",
        title: "Catalan：transition 其實是在枚舉『最後分割點』",
        paragraphs: [
          "Catalan 類 recurrence 常把結構依某個 root / 配對位置 k 切成左右兩個獨立部分，然後把兩側方案數相乘，再對所有 k 加總。",
          "這提醒你：DP transition 不一定只有 min/max，也可能是計數；combine 也可能是乘法，取決於子結構如何組合。"
        ]
      },
      {
        type: "text",
        id: "optimization-signals",
        title: "看到 O(N²) transition 時，下一步觀察什麼",
        paragraphs: [
          "先看合法 j 是否形成一個單調區間；再看要取的是 max/min/sum；再看 cost(j,i) 能否拆成只與 j 有關的 summary。這些觀察分別可能導向 binary search、sliding window、prefix best、Fenwick/segment tree 等。",
          "不是每個 O(N²) 都能優化。找不到結構時，資料量本身可能就允許平方級。"
        ]
      }
    ],
    practice: [
      { code: "Q-6-10", level: "core", why: "練習『上一個相容決策』的 transition。" },
      { code: "P-6-11", level: "core", why: "計數型 transition，建立 Catalan 分割觀念。" },
      { code: "Q-6-12", level: "core", why: "固定間隔依賴，檢查 state 定義。" },
      { code: "P-6-13", level: "challenge", why: "需要更精細的前驅選擇與最佳化觀察。" },
      { code: "Q-6-14", level: "challenge", why: "多次交易讓 state / previous decision 更複雜。" },
      { code: "P-6-15", level: "focus", why: "典型 ending-at-i 前驅枚舉。" },
      { code: "P-6-16", level: "core", why: "把同一類 transition 換成不同敘述。" }
    ],
    checkpoints: [
      { q: "1D1D 中的第二個 1D 通常代表什麼？", a: "對每個一維 state i，transition 還要枚舉一維範圍的前驅 j，因此常有 O(N²) 基線。" },
      { q: "為什麼 LIS 的答案不是固定 dp[n-1]？", a: "因為 dp[i] 定義為『恰好以 i 結尾』；最長序列可能在任何位置結尾，所以要取 max_i。" }
    ],
    mastery: [
      "看到 transition 能講出 j 的實際語意",
      "會先建立 O(N²) oracle",
      "能從單調性 / summary 觀察可能的最佳化方向"
    ]
  },

  "6-interval-advanced": {
    title: "Interval / Bitmask / Advanced DP：state 變大，但五步驟不變",
    source: "AP325 6.2.4–6.3，P-6-17～Q-6-25，教材頁 197–218",
    intro: "AP325 DP 後段開始進入區間 DP、集合狀態、TSP 等較大型 state。這裡最容易被公式淹沒，所以更要回到同一套方法：state 的語意、較小 state 是誰、計算順序、state 數量與 transition 數量。",
    objectives: [
      "會依區間長度填 interval DP",
      "會用 bitmask 表示已選集合",
      "能估 O(N³)、O(N2^N)、O(N²2^N) 是否可行",
      "知道何時這些內容屬於 Beyond APCS"
    ],
    focus: {
      code: "P-6-17",
      prompt: "切棍子時，假設區間 (l,r) 內的切點最後都會完成。你不知道第一刀切哪裡，所以自然枚舉 k；切完後左右兩邊就變成獨立子問題。",
      questions: [
        "dp[l][r] 應代表哪一段？",
        "為什麼要由短區間算到長區間？",
        "枚舉 k 後 combine 成本是什麼？"
      ]
    },
    blocks: [
      {
        type: "example",
        id: "cut-stick",
        title: "P-6-17：切棍子是 interval DP 的標準模型",
        problem: "dp[l][r] = 完成 l 與 r 之間所有切點的最小成本。",
        steps: [
          "若 l、r 之間沒有切點，成本 0。",
          "枚舉第一個切的位置 k。",
          "切 k 這一刀支付目前整段長度 cost(l,r)。",
          "之後左右獨立，candidate=dp[l][k]+dp[k][r]+cost(l,r)。",
          "對所有 k 取 min。"
        ],
        conclusion: "大區間依賴小區間，因此 bottom-up 要依 interval length 由短到長。"
      },
      {
        type: "code",
        id: "interval-code",
        title: "Interval DP 骨架",
        code: "for(int len=2;len<=n;len++){\n    for(int l=0;l+len<=n;l++){\n        int r=l+len;\n        dp[l][r]=INF;\n        for(int k=l+1;k<r;k++){\n            dp[l][r]=min(dp[l][r],\n                dp[l][k]+dp[k][r]+cost(l,k,r));\n        }\n    }\n}",
        notes: [
          "最外層是 length，確保所有較短子區間已算好。",
          "N² 個區間 × N 個切點通常是 O(N³)。",
          "不同題的 cost 與 k 合法範圍不同，不要硬套。"
        ]
      },
      {
        type: "text",
        id: "matrix-chain",
        title: "Q-6-18：Matrix Chain 的『最後一次合併』",
        paragraphs: [
          "矩陣乘法有結合律，但不同括號方式會產生不同 scalar multiplication 次數。dp[l][r] 可表示把第 l..r 段矩陣乘成一個矩陣的最小成本。",
          "枚舉最後一次把 [l,k] 與 [k+1,r] 合併的位置 k，左右兩段先各自最佳，再加最後一次矩陣乘法成本。"
        ]
      },
      {
        type: "text",
        id: "bitmask",
        title: "Bitmask DP：用一個整數記住『集合裡有哪些元素』",
        paragraphs: [
          "當 N 大約只有 20 左右時，可以用 mask 的第 i bit 表示城市 / 物件 i 是否已被選。集合 state 從 O(N) 維布林資訊壓成一個整數索引。",
          "最典型的 TSP state 是 dp[mask][last]：已走過 mask 中城市，最後停在 last 的最小成本。要加入 nxt，就轉移到 mask|(1<<nxt)。"
        ]
      },
      {
        type: "example",
        id: "tsp",
        title: "Q-6-25：貨郎問題（TSP state compression）",
        problem: "從起點出發走訪每個城市一次，求最小成本。",
        steps: [
          "state 需要知道『走過哪些城市』，只記目前城市不夠。",
          "所以使用 dp[mask][u]。",
          "枚舉尚未在 mask 中的 v，relax dp[mask|1<<v][v]。",
          "state 數 2^N×N，每個 state 最多試 N 個 next。"
        ],
        conclusion: "時間通常 O(N²2^N)，這也是為什麼 bitmask DP 只能處理小 N。"
      },
      {
        type: "table",
        id: "advanced-cost",
        title: "先看 state 數，避免寫完才發現爆炸",
        headers: ["類型", "State 數", "每 state 轉移", "典型總量級"],
        rows: [
          ["Interval DP", "O(N²)", "O(N)", "O(N³)"],
          ["Subset / Bitmask DP", "O(2^N)", "O(N)", "O(N2^N)"],
          ["TSP DP", "O(N2^N)", "O(N)", "O(N²2^N)"]
        ]
      },
      {
        type: "callout",
        id: "beyond",
        title: "不要因為這章很難就回頭懷疑前面的 DP",
        body: "Interval / bitmask 本來就比 APCS 核心範圍更重。先確保 1D0D、2D0D、1D1D 能獨立建模，再把這裡當 challenge。困難來自 state 數與結構，不代表你前面的 DP 沒學會。",
        tone: "tip"
      }
    ],
    practice: [
      { code: "P-6-17", level: "focus", why: "Interval DP 的第一題，先建立 length-order。" },
      { code: "Q-6-18", level: "core", why: "矩陣鏈是『枚舉最後切點』的標準題。" },
      { code: "P-6-19", level: "challenge", why: "狀態維度與限制更複雜。" },
      { code: "P-6-20", level: "core", why: "從集合 / hyper-cube 角度建立 bitmask state。" },
      { code: "P-6-21", level: "core", why: "區間 / 邊界狀態綜合。" },
      { code: "P-6-22", level: "beyond", why: "進階 DP，主線完成後再挑戰。" },
      { code: "Q-6-23", level: "beyond", why: "大型 state 設計與最佳化。" },
      { code: "Q-6-24", level: "beyond", why: "全國賽等級進階題。" },
      { code: "Q-6-25", level: "challenge", why: "TSP state compression，bitmask DP 章末 Boss。" }
    ],
    checkpoints: [
      { q: "Interval DP 為什麼通常要依 length 由小到大？", a: "大區間 transition 依賴被切出的較小區間；依 length 填表可保證來源 state 已完成。" },
      { q: "TSP 為什麼只記目前城市不夠？", a: "未來可走哪些城市取決於已經走過的集合；相同目前城市但 visited set 不同，是不同子問題。" },
      { q: "N=25 時 O(N²2^N) 有什麼警訊？", a: "2^25 已約 3.3×10^7，再乘 N² 幾乎不可行；要重新看限制、剪枝或其他結構。" }
    ],
    mastery: [
      "會自行建立 interval DP 計算順序",
      "能讀寫 bitmask 與集合轉移",
      "先估 state 數再決定是否實作"
    ]
  }
};
