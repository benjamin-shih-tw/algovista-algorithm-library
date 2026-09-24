export const world0Guides = {
  "0-cpp-testing": {
    "title": "競賽 C++：先建立可驗證的解題流程",
    "source": "AP325 0.2.1–0.2.2，教材頁 3–5",
    "intro": "AP325 後面真正困難的地方不是 C++ 語法，而是你能不能快速把「想法」變成一支可測、可定位錯誤、可放心修改的程式。這一節把競賽時會重複使用的工作流先固定下來。",
    "objectives": [
      "能分辨 compile error、runtime error、WA、TLE",
      "會設計 sample 以外的邊界測資",
      "會用最小反例定位演算法或實作錯誤"
    ],
    "focus": {
      "title": "一支 sample 全過但正式 WA 的程式",
      "prompt": "先想：你會先改哪裡？如果答案是『重寫』，那通常太早。",
      "questions": [
        "哪一筆最小測資可以讓錯誤穩定出現？",
        "錯的是演算法不變量，還是索引 / 型別 / 初始化？",
        "如果把 N 縮到 5，你能手算答案嗎？"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "failure-types",
        "title": "先把錯誤分類，debug 才不會亂跑",
        "paragraphs": [
          "競賽最浪費時間的 debug，是不知道自己在找什麼。Compile Error 是語法 / 型別 / API 問題；Runtime Error 常是越界、空容器、遞迴過深；Wrong Answer 是邏輯或邊界；TLE 才需要重新看複雜度。分類後，搜尋空間會小很多。",
          "不要看到 WA 就立刻懷疑整個演算法。先問：如果我的 invariant 是對的，哪一行最可能破壞它？"
        ],
        "bullets": [
          "CE：先讀第一個真正的 compiler error，不要被後續連鎖錯誤淹沒。",
          "RE：檢查 index、空 queue/stack、除以零、遞迴深度。",
          "WA：先找最小反例，逐步印 state。",
          "TLE：估總操作數，不要只看單一 STL 操作。"
        ]
      },
      {
        "type": "steps",
        "id": "test-ladder",
        "title": "四層測試法",
        "intro": "每題都用同一套順序，會比『想到什麼測什麼』穩定很多。",
        "steps": [
          {
            "title": "最小合法資料",
            "body": "N=1、空集合允許時的空集合、只有一條邊、只有一個字元。它最容易打出 base case 與 off-by-one。"
          },
          {
            "title": "結構極端",
            "body": "全相同、嚴格遞增、嚴格遞減、答案在最左 / 最右、完全無解、全部都可行。"
          },
          {
            "title": "手算小亂數",
            "body": "N 很小時自己或 brute force 算真值，和正式解比較。這是抓錯誤 invariant 最有效的方法之一。"
          },
          {
            "title": "壓力測試",
            "body": "用最大 N、最壞結構與最大值域驗證時間和 overflow。"
          }
        ]
      },
      {
        "type": "example",
        "id": "minimal-counterexample",
        "title": "把錯誤縮成最小反例",
        "problem": "你寫 two pointers 找兩數和，sample 正確，但遇到重複值 WA。",
        "steps": [
          "先不要塞 100 個亂數，從 2 個數開始。",
          "測 [4,4], target=8；如果題目允許不同 index，答案應存在。",
          "若你的程式用 value 判斷『不能和自己配』，就會把兩個不同位置的 4 也錯誤排除。",
          "反例只剩兩個元素後，錯誤原因變成一句話：你混淆了 value 與 index。"
        ],
        "conclusion": "最小反例的價值不是測得更多，而是把錯誤原因壓縮成你能一句話說清楚的形式。"
      },
      {
        "type": "code",
        "id": "contest-template",
        "title": "最小競賽模板",
        "intro": "模板越短越好；真正需要的東西再加，不要一開始塞滿巨集與 pragma。",
        "code": "#include <bits/stdc++.h>\nusing namespace std;\nusing ll = long long;\n\nvoid solve(){\n    int n;\n    cin >> n;\n    // 1. read\n    // 2. maintain a clearly-defined state / invariant\n    // 3. output\n}\n\nint main(){\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    solve();\n    return 0;\n}",
        "notes": [
          "fast I/O 通常只需要關閉 sync 並解除 cin/cout 綁定。",
          "先讓程式正確，再談常數優化；pragma 不能把 O(N²) 變 O(N log N)。",
          "全域陣列雖然方便，但要清楚它的初始化與跨 test case 重設問題。"
        ]
      },
      {
        "type": "callout",
        "id": "submit-check",
        "title": "送出前 20 秒 checklist",
        "body": "N=1？答案在邊界？有沒有 empty() 前就 front()/top()？乘法是不是先在 int overflow？排序後原 index 還在嗎？這 20 秒往往比再讀一次整份 code 更有效。",
        "tone": "tip"
      }
    ],
    "practice": [],
    "checkpoints": [
      {
        "q": "Sample 全過但 WA，為什麼先找最小反例比直接加 debug 輸出更好？",
        "a": "因為最小反例會同時縮小 state 數量與可能的錯誤原因；你能逐步手算每個變數，debug 輸出才有可比較的真值。"
      },
      {
        "q": "一個兩層 while 一定是 O(N²) 嗎？",
        "a": "不一定。如果兩個指標都只單調前進，每個元素總共只被進出常數次，總成本仍可能是 O(N)。"
      }
    ],
    "mastery": [
      "看到 verdict 能先分類錯誤方向",
      "能主動設計最小、極端、無解、全解測資",
      "能在小 N 下寫 brute force 當 oracle"
    ]
  },
  "0-complexity": {
    "title": "複雜度：從資料量反推演算法",
    "source": "AP325 0.2.3，教材頁 6–9",
    "intro": "競賽不是先想最漂亮的演算法，而是先由限制把不可能的做法刪掉。AP325 後面很多技巧，其實都是把某個超標的因子拿掉：排序把配對變單調、DP 把重複子問題消掉、MITM 把 2^N 切成 2^(N/2)。",
    "objectives": [
      "會估最壞時間複雜度",
      "會由 N 推估可接受的量級",
      "會辨認攤銷 O(N) 而不是被巢狀 while 騙到"
    ],
    "focus": {
      "title": "N=200000 的題目",
      "prompt": "如果你目前只想到 O(N²)，先別寫。問自己：哪個工作被重複做了？",
      "questions": [
        "是否能排序後只掃一次？",
        "是否能用 prefix / hash / queue 保存前面結果？",
        "是否存在單調性讓指標不回頭？"
      ]
    },
    "blocks": [
      {
        "type": "table",
        "id": "constraint-map",
        "title": "常用資料量 ↔ 目標複雜度",
        "headers": [
          "資料量 N",
          "通常可接受",
          "常見候選"
        ],
        "rows": [
          [
            "N ≤ 20~25",
            "O(2^N)",
            "subset enumeration / bitmask"
          ],
          [
            "N ≈ 40",
            "O(2^(N/2))",
            "meet-in-the-middle"
          ],
          [
            "N ≤ 1000~3000",
            "O(N²)",
            "2D DP / pair enumeration"
          ],
          [
            "N ≤ 2×10^5",
            "O(N log N) / O(N)",
            "sort、binary search、heap、two pointers"
          ],
          [
            "N ≥ 10^6",
            "接近 O(N)",
            "prefix、單次掃描、簡單 hash"
          ]
        ]
      },
      {
        "type": "text",
        "id": "count-work",
        "title": "不要數迴圈層數，要數『總工作量』",
        "paragraphs": [
          "兩層 for 幾乎總是 O(N²)，但 while 包在 for 裡不一定。經典 sliding window 的 right 走 N 次，left 也最多走 N 次，因此 while 雖然看似巢狀，總移動次數只有 2N。",
          "同樣地，monotonic stack 每個元素最多 push 一次、pop 一次，所以所有 while 加起來仍是 O(N)。這種分析叫 amortized analysis。"
        ]
      },
      {
        "type": "example",
        "id": "amortized",
        "title": "為什麼單調堆疊是 O(N)",
        "problem": "for i=0..N-1，每次 while stack top 比 a[i] 小就 pop。最壞時某一輪可能 pop 很多個。",
        "steps": [
          "看單一 i，while 最多 O(N)，這會讓人誤判成 O(N²)。",
          "但一個 index 被 pop 後永遠不會再回 stack。",
          "每個 index 最多 push 一次、pop 一次。",
          "所有 push + pop 次數 ≤ 2N。"
        ],
        "conclusion": "分析『一個元素一生被處理幾次』，常比分析單輪最壞成本更準。"
      },
      {
        "type": "steps",
        "id": "complexity-workflow",
        "title": "拿到題目的複雜度工作流",
        "steps": [
          {
            "title": "抓真正的 N",
            "body": "點數 V、邊數 E、字串長度、值域、query 次數可能同時存在。"
          },
          {
            "title": "估 naive",
            "body": "先把最直覺解寫成數學量級，例如 O(N²)、O(NM)、O(VE)。"
          },
          {
            "title": "找重複工作",
            "body": "是否每次都重算同一段？能否 prefix、memoization、資料結構保存？"
          },
          {
            "title": "找單調性 / 順序",
            "body": "排序後能不能二分、雙指標、掃描線？"
          },
          {
            "title": "再估記憶體",
            "body": "2^N、N² 陣列常是時間還沒爆，記憶體先爆。"
          }
        ]
      },
      {
        "type": "callout",
        "id": "constants",
        "title": "Big-O 不是忽略一切常數",
        "body": "兩個同為 O(N log N) 的程式仍可能差很多；但競賽初學最常見的錯誤，是拿『常數比較快』替一個高一階的複雜度辯護。先把階數做對，再看常數。",
        "tone": "warning"
      }
    ],
    "practice": [],
    "checkpoints": [
      {
        "q": "for r=0..N-1，內部 while(l<=r && condition) l++，什麼條件下總成本是 O(N)？",
        "a": "只要 l 從不往回走，而且每次 while 都讓 l 增加，l 一生最多增加 N 次，所以外層 N 次加上總 while N 次，仍是 O(N)。"
      },
      {
        "q": "N=40 的 subset 類問題為什麼常想到 MITM？",
        "a": "2^40 約一兆不可行；切成兩半後各約 2^20 ≈ 一百萬，排序與二分後就有機會通過。"
      }
    ],
    "mastery": [
      "能由限制先排除不可能的演算法",
      "會用 total operations / amortized 思考巢狀結構",
      "能同時估時間與記憶體"
    ]
  },
  "0-danger-zone": {
    "title": "競賽危險區：正確演算法也會 WA 的細節",
    "source": "AP325 0.2.4，教材頁 10–13",
    "intro": "這一節不是新演算法，但會反覆出現在後面所有章節。最典型的陷阱是：最後答案放得進 long long，不代表中間乘法沒有先用 int 爆掉。",
    "objectives": [
      "會估 integer 中間值範圍",
      "會安全比較浮點",
      "理解 && / || 的 short-circuit 順序",
      "知道 optimization 不能改變演算法階數"
    ],
    "focus": {
      "title": "long long ans = a*b 為什麼仍會爆？",
      "prompt": "如果 a、b 都是 int，右側乘法會先以 int 執行，再轉成 long long。",
      "questions": [
        "要在哪一個 operand 上轉型才有效？",
        "模乘時 (a*b)%MOD 是否仍可能先 overflow？",
        "浮點的 == 什麼時候特別危險？"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "overflow",
        "title": "Overflow：看中間值，不只看答案",
        "paragraphs": [
          "C++ 運算式的型別由 operands 決定。int a,b; long long x=a*b; 中，a*b 先用 int 計算，爆掉後才存進 long long。寫 1LL*a*b 或 static_cast<long long>(a)*b 才真的把乘法提升。",
          "同理，模運算不是防 overflow 的護身符；如果 a、b 接近 1e18，連 long long 乘法也不安全，需要 __int128 或特殊模乘。"
        ]
      },
      {
        "type": "code",
        "id": "numeric-template",
        "title": "安全數值模板",
        "code": "long long x = 1LL * a * b;\n\nlong long mul_mod(long long a,long long b,long long mod){\n    return (__int128)a * b % mod;\n}\n\nconst double EPS = 1e-9;\nbool eq(double x,double y){\n    return fabs(x-y) <= EPS;\n}",
        "notes": [
          "EPS 要和題目數值尺度一起考慮，沒有一個萬用 EPS。",
          "幾何若輸入是整數，能用 cross product 的整數符號判斷時，通常比轉成角度更穩。"
        ]
      },
      {
        "type": "example",
        "id": "short-circuit",
        "title": "Short-circuit 其實也是防越界工具",
        "problem": "while(a[r] < x && r < n) 看起來合理嗎？",
        "steps": [
          "C++ 的 && 由左到右，前面 false 後才不算後面。",
          "這個條件會先讀 a[r]，如果 r==n 就已經越界。",
          "應寫 r<n && a[r]<x。",
          "同理，if(!st.empty() && st.top()==x) 安全；反過來就可能對空 stack 取 top。"
        ],
        "conclusion": "short-circuit 不只是效能細節，它會決定某些運算是否根本被執行。"
      },
      {
        "type": "text",
        "id": "float",
        "title": "Floating point：不要把近似值當精確整數",
        "paragraphs": [
          "0.1 在二進位浮點通常無法精確表示，因此連續運算後直接用 == 很容易失敗。若只是比較大小，可用誤差範圍；若題目本質其實可以交叉相乘、平方距離、整數外積，就盡量留在整數世界。",
          "另外要避免把浮點當 map/set 的『理應相等 key』，因為極小誤差會讓兩個數被視為不同。"
        ]
      },
      {
        "type": "callout",
        "id": "optimizer",
        "title": "Compiler optimization 的正確定位",
        "body": "-O2/-O3 可以把常數壓低，但不能把錯誤的 O(N²) 思路變成可過 2e5 的 O(N log N)。如果複雜度超標，先換演算法。",
        "tone": "warning"
      }
    ],
    "practice": [],
    "checkpoints": [
      {
        "q": "int a=100000,b=100000; long long x=a*b; 會發生什麼？",
        "a": "a*b 先以 32-bit int 計算，10^10 超過範圍，結果已經錯；存入 long long 也救不回來。"
      },
      {
        "q": "為什麼 r<n && a[r]<x 的順序重要？",
        "a": "當 r==n 時，第一項已是 false，第二項不會被執行，因此不會存取 a[n]。"
      }
    ],
    "mastery": [
      "能在寫式子前估最大中間值",
      "知道何時需要 1LL / __int128",
      "會把邊界條件放在 short-circuit 的前面"
    ]
  }
};
