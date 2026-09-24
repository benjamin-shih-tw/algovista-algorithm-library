export const guideA = {
  "0-cpp-testing": {
    "sections": [
      {
        "title": "競賽程式不是把所有語法都背熟",
        "body": [
          "你需要的是一個穩定的解題迴圈：讀題後先把輸入、輸出與限制寫在紙上，接著寫出最小能跑的版本，再用自己設計的小測資確認每個變數的意義。這比一開始追求模板長、pragma 多、巨集多有效得多。",
          "對初學者最重要的 debug 技巧是把錯誤分類。答案錯不一定是演算法錯；也可能是邊界漏掉、型別 overflow、輸入讀錯、狀態沒有重設。分類後再修，速度會快很多。"
        ]
      },
      {
        "title": "怎麼設計測資",
        "body": [
          "第一組一定要是最小資料，例如 N=1。第二組刻意打邊界，例如答案剛好等於限制、剛好超過限制。第三組做結構反例，例如全相同、嚴格遞增、嚴格遞減。",
          "如果你的演算法依賴『排序後一定怎樣』或『指標只會往右』，就要特別設計能破壞這個假設的測資。測試不是驗證 sample，而是在攻擊自己的想法。"
        ]
      },
      {
        "title": "提交前 checklist",
        "body": [
          "確認陣列大小、long long、空容器、最後一個元素、0-based/1-based、是否每筆 test case 都重設狀態。然後再估一次最壞複雜度。"
        ]
      }
    ],
    "example": {
      "title": "例：區間最大值程式 sample 正確但 WA",
      "steps": [
        "先造 N=1，確認單元素。",
        "造全部負數，檢查是否錯把初值設 0。",
        "造最大值在最後一格，檢查迴圈上界。",
        "若仍錯，再看型別與輸入。"
      ],
      "result": "你不是『亂改 code』，而是在逐層排除 bug 類型。"
    },
    "checkpoint": [
      "能說出自己固定使用的最小模板。",
      "能在 2 分鐘內為一題設計至少 3 類測資。",
      "遇到 WA 先縮小反例，而不是直接重寫。"
    ]
  },
  "0-complexity": {
    "sections": [
      {
        "title": "先看 N，再想演算法",
        "body": [
          "限制不是題目最後才看的附註，而是第一個線索。若 N=2×10^5，O(N^2) 大約是 4×10^10 次操作，幾乎不用寫就知道不可能；若 N=20，2^N 反而可能是合理選擇。",
          "因此解題順序應該是：資料量 → 可接受複雜度 → 候選技巧。這也是為什麼同一個『找子集合』問題在 N=20、N=40、N=2000 時會用完全不同的方法。"
        ]
      },
      {
        "title": "不要只數迴圈層數",
        "body": [
          "兩層迴圈不一定是 O(N^2)。例如雙指標中外層 r 走 N 次，內層 l 雖然放在 while 裡，但 l 一生只會從 0 走到 N，所以總共也是 O(N)。",
          "反過來，單層迴圈裡如果每次做 set/map 的 O(log N) 操作，總成本就是 O(N log N)。"
        ]
      },
      {
        "title": "空間也要算",
        "body": [
          "DP 的 state 數量乘上每個 state 的大小就是空間複雜度。bitmask DP 的 2^N 不只會 TLE，也可能先 MLE。先算 state 數，再決定是否需要滾動陣列、壓位元或改寫狀態。"
        ]
      }
    ],
    "example": {
      "title": "例：N=40 的 subset sum",
      "steps": [
        "2^40 約 10^12，直接枚舉不行。",
        "切成 20+20 後，各側 2^20 約 10^6。",
        "配合排序與二分，可把問題降到可做範圍。"
      ],
      "result": "這就是 meet-in-the-middle 的動機，技巧是從限制推導出來的。"
    },
    "checkpoint": [
      "看到 N 能快速排除 O(N^2)、O(2^N) 是否可行。",
      "能用攤銷分析說明雙指標為何是 O(N)。",
      "會把 STL 操作成本算進去。"
    ]
  },
  "0-danger-zone": {
    "sections": [
      {
        "title": "中間值也會 overflow",
        "body": [
          "`long long ans = a*b;` 不保證安全，若 a、b 都是 int，乘法可能先在 int 裡溢位，再把錯誤結果轉成 long long。要讓運算本身在 64 位元發生，例如 `1LL*a*b`。",
          "若兩個 10^18 等級數字相乘再取模，long long 甚至也不夠，這時需要 `__int128` 或其他安全模乘技巧。"
        ]
      },
      {
        "title": "浮點不是精確實數",
        "body": [
          "0.1 在二進位浮點中通常不能被精確表示，所以 `a==b` 經常不是你想要的判斷。競賽幾何常比較 `fabs(a-b) <= EPS`，但更好的策略是：能用整數式就盡量不要轉成 double。"
        ]
      },
      {
        "title": "短路求值可以保護索引",
        "body": [
          "在 `i<n && a[i]==x` 中，左邊為 false 時右邊不會執行，因此可以避免 a[i] 越界。反過來若寫成 `a[i]==x && i<n`，你已經先存取非法位置。"
        ]
      }
    ],
    "example": {
      "title": "例：距離平方比較",
      "steps": [
        "不要先 sqrt。",
        "比較 dx*dx+dy*dy。",
        "若座標可到 10^9，中間值要用 long long。"
      ],
      "result": "同時避免浮點誤差與不必要的 sqrt。"
    },
    "checkpoint": [
      "知道 int、long long 的量級。",
      "能解釋 1LL 的作用。",
      "知道浮點比較與 short-circuit 的風險。"
    ]
  },
  "1-recursion-model": {
    "sections": [
      {
        "title": "先定義函式，不要先寫函式",
        "body": [
          "遞迴最重要的問題是：`f(x)` 到底代表什麼？例如 `f(n)` 可以定義為『回傳 n!』，或『處理前 n 個元素後的最佳答案』。只有語意固定，base case 與遞迴式才有辦法被驗證。",
          "你應該把每一層視為黑盒子：目前這層只負責把問題縮小、呼叫已經正確的較小問題，再把答案組合回來。"
        ]
      },
      {
        "title": "Base case 是數學定義的一部分",
        "body": [
          "base case 不是『為了避免無窮遞迴硬塞的 if』，它是遞迴定義的起點。若遞迴呼叫沒有保證問題規模變小，就算有 base case 也可能永遠碰不到。"
        ]
      },
      {
        "title": "Call stack 怎麼看",
        "body": [
          "進入新函式時，上一層的局部變數不會消失，而是暫存在 call stack。等較深層 return 後，上一層才繼續執行。理解這件事後，樹 DFS、分治、backtracking 都會自然很多。"
        ]
      }
    ],
    "example": {
      "title": "例：sum(n)=1+2+...+n",
      "steps": [
        "定義 sum(n)：回傳 1 到 n 的總和。",
        "base：sum(0)=0。",
        "若 n>0，最後一項是 n，前面是 sum(n-1)。",
        "所以 sum(n)=sum(n-1)+n。"
      ],
      "result": "正確性來自定義本身，而不是『因為程式跑出來對』。"
    },
    "checkpoint": [
      "能先用一句話定義遞迴函式。",
      "能指出每次呼叫如何縮小問題。",
      "能手追至少 3 層 call stack。"
    ]
  },
  "1-enumeration": {
    "sections": [
      {
        "title": "把所有答案變成決策樹",
        "body": [
          "若每個元素都有『選/不選』兩種決策，N 個元素就形成深度 N 的二叉樹。每條根到葉路徑代表唯一子集合，因此只要 DFS 完整走訪，就能不重不漏枚舉所有答案。",
          "這種想法的價值是把『所有可能』變成結構化搜尋，而不是靠多層 for 迴圈硬寫。"
        ]
      },
      {
        "title": "State 只帶必要資訊",
        "body": [
          "如果葉節點只需要總和，就在遞迴途中維護 sum，而不是到葉節點再 O(N) 重算。這會把 O(N2^N) 降成 O(2^N)。",
          "同理，如果目標是最大乘積、目前選了幾個、剩餘容量，都可以做為遞迴 state。"
        ]
      },
      {
        "title": "什麼時候剪枝",
        "body": [
          "當目前狀態已不可能形成合法答案，或就算把剩下全部加入也不可能超過目前最佳值，就可以停止這個分支。剪枝必須有邏輯保證，不能憑感覺。"
        ]
      }
    ],
    "example": {
      "title": "例：子集合和",
      "steps": [
        "dfs(i,sum) 表示前 i 個元素已決定。",
        "分支 1：不選 a[i]。",
        "分支 2：選 a[i]，sum += a[i]。",
        "i==n 時檢查 sum 是否達標。"
      ],
      "result": "每個 subset 恰好對應一條 decision path。"
    },
    "checkpoint": [
      "能把選/不選畫成 recursion tree。",
      "能估算 2^N 與 N2^N 的差別。",
      "會把重複計算移進 state。"
    ]
  },
  "1-backtracking": {
    "sections": [
      {
        "title": "Backtracking = DFS + 可逆狀態",
        "body": [
          "與單純枚舉相比，backtracking 通常有更強的合法性限制。你會在選一個候選後修改狀態，深入下一層，回來時再完全還原。",
          "最核心的不變量是：進入 `dfs(depth)` 時，所有狀態只描述前 depth 個已確定決策。"
        ]
      },
      {
        "title": "越早檢查越好",
        "body": [
          "N-Queen 若等 8 個皇后全放完才檢查衝突，等於浪費大量分支。更好的做法是每放一個皇后就檢查同欄與兩條對角線，一旦衝突立即停止。"
        ]
      },
      {
        "title": "如何設計 O(1) 合法性檢查",
        "body": [
          "不要每次掃整張棋盤。用 `col[c]`、`diag1[r-c+offset]`、`diag2[r+c]` 記錄是否被占用，就能把每次檢查降成 O(1)。"
        ]
      }
    ],
    "example": {
      "title": "例：N-Queen",
      "steps": [
        "第 r 層代表要決定第 r 列皇后位置。",
        "枚舉 c。若 column/diagonal 已占用就跳過。",
        "標記三個集合後 dfs(r+1)。",
        "return 後把三個標記復原。"
      ],
      "result": "剪枝後只探索可能完成的 partial solution。"
    },
    "checkpoint": [
      "會寫 choose→dfs→undo。",
      "能設計 O(1) 衝突狀態。",
      "知道忘記 rollback 會污染 sibling branch。"
    ]
  },
  "2-sorting": {
    "sections": [
      {
        "title": "排序的真正用途是建立秩序",
        "body": [
          "很多題目原本沒有明顯結構。排序後，『左邊都不大於右邊』變成永久成立的條件，於是可以二分、雙指標、掃描線或貪心。",
          "因此排序常是前處理，不是最終演算法。"
        ]
      },
      {
        "title": "Comparator 的規則",
        "body": [
          "C++ `sort` 的 comparator 應回答『a 是否嚴格排在 b 前面』。所以相等時必須回傳 false；寫 `<=` 會破壞 strict weak ordering。",
          "排序 struct 時先確定 primary key，再決定 tie-break 是否真的需要。"
        ]
      },
      {
        "title": "離散化",
        "body": [
          "若原數值很大但只在乎大小順序，就複製一份、sort、unique，接著用 lower_bound 取得 rank。離散化保留 `<`、`=` 的關係，但不保留原數值差距。"
        ]
      }
    ],
    "example": {
      "title": "例：座標 10^9 但只出現 2×10^5 個",
      "steps": [
        "把所有座標收集到 vector xs。",
        "sort(xs)，再 unique。",
        "每個 x 映射成 lower_bound(xs,x) 的 index。"
      ],
      "result": "值域從 10^9 壓成 0..K-1，可用陣列/Fenwick tree 等結構。"
    },
    "checkpoint": [
      "能正確寫 comparator。",
      "知道離散化保留什麼、不保留什麼。",
      "知道排序何時能帶來單調性。"
    ]
  },
  "2-binary-search": {
    "sections": [
      {
        "title": "不要背 while，先決定 invariant",
        "body": [
          "二分搜尋最常見的錯不是 mid，而是不知道 l、r 各自代表什麼。推薦使用半開區間 `[l,r)`：候選永遠在這個區間中，當 l==r 時答案唯一。",
          "若要找第一個 `a[i] >= x`，判斷成立時把 r=mid，否則 l=mid+1。每一步都保證區間縮小。"
        ]
      },
      {
        "title": "lower_bound / upper_bound",
        "body": [
          "`lower_bound` 是第一個 `>= x`；`upper_bound` 是第一個 `> x`。兩者差值可用來算等於 x 的元素數量。",
          "對 set/map 使用其成員函式通常比拿 iterator 做 `std::lower_bound` 更合理，因為樹本身已支援 O(log N) 搜尋。"
        ]
      },
      {
        "title": "二分不是只能找陣列元素",
        "body": [
          "只要答案空間有單調 true/false 邊界，就能二分。後面 Binary Search on Answer 就是同一個 invariant 的延伸。"
        ]
      }
    ],
    "example": {
      "title": "例：第一個 >= 7",
      "steps": [
        "a=[1,3,7,7,10]。",
        "初始 [0,5)。",
        "mid=2，a[2]>=7，所以 r=2。",
        "再縮小後得到 l=2。"
      ],
      "result": "答案是 index 2；即使 7 有重複，也會找到第一個。"
    },
    "checkpoint": [
      "能手寫 half-open binary search。",
      "分得清 lower_bound 與 upper_bound。",
      "會處理回傳 end() 的情況。"
    ]
  },
  "2-fast-power": {
    "sections": [
      {
        "title": "把指數看成二進位",
        "body": [
          "例如 13=8+4+1，所以 a^13 = a^8·a^4·a。你不需要做 13 次乘法，只要依序得到 a、a²、a⁴、a⁸。",
          "每一輪檢查 exponent 的最低 bit；bit=1 就把目前 base 乘進答案。然後 base 平方、exponent 右移。"
        ]
      },
      {
        "title": "核心不變量",
        "body": [
          "在任何時刻，`ans * base^exp` 都等價於原本的 a^n。處理掉最低 bit 後，base 平方正好補上 exponent 除以 2 的變化。"
        ]
      },
      {
        "title": "模冪",
        "body": [
          "若答案只要 mod M，每次乘法都立刻取模。注意乘法本身仍可能 overflow，因此大模數時要用更寬型別。"
        ]
      }
    ],
    "example": {
      "title": "例：3^13",
      "steps": [
        "13 二進位 1101。",
        "bit0=1 → ans*=3。base=9。",
        "bit1=0 → 不乘。base=81。",
        "bit2=1 → ans*=81。",
        "bit3=1 → 再乘 3^8。"
      ],
      "result": "只需 O(log 13) 回合。"
    },
    "checkpoint": [
      "能解釋 e>>=1 的理由。",
      "會寫模快速冪。",
      "知道 exponent=0 時答案是乘法單位元。"
    ]
  },
  "2-fibonacci": {
    "sections": [
      {
        "title": "把遞迴改寫成狀態轉移",
        "body": [
          "F(n+1)=F(n)+F(n-1) 可以寫成向量 `[F(n+1),F(n)]^T` 由固定矩陣乘上 `[F(n),F(n-1)]^T`。因此走 n 步就是同一個矩陣連乘 n 次。",
          "固定矩陣連乘正是快速冪可以加速的形式。"
        ]
      },
      {
        "title": "為什麼用單位矩陣初始化",
        "body": [
          "矩陣乘法的單位元是 I，就像數字快速冪的 1。把 ans 初始化成 I，再依 exponent bits 乘入 transition matrix。"
        ]
      },
      {
        "title": "何時值得用",
        "body": [
          "當 n 非常大，O(n) DP 不可行，但 recurrence 階數固定、transition 不隨位置改變時，矩陣快速冪是標準工具。"
        ]
      }
    ],
    "example": {
      "title": "例：F(10)",
      "steps": [
        "建立 T=[[1,1],[1,0]]。",
        "計算 T^9。",
        "乘上初始向量 [F1,F0]=[1,0]。",
        "讀出第一分量。"
      ],
      "result": "把線性遞迴從 O(n) 降成 O(log n)。"
    },
    "checkpoint": [
      "會把二階 recurrence 寫成 2×2 matrix。",
      "知道矩陣乘法順序不能交換。",
      "能把 binary exponentiation 套到 matrix。"
    ]
  },
  "2-two-number": {
    "sections": [
      {
        "title": "排序後才有可丟棄的候選",
        "body": [
          "對 two-sum 類問題，排序後若 a[l]+a[r] 太小，那固定 l 時與任何更小/相同右端都不可能達標，因此 l 可以永久右移。太大則 r 左移。",
          "每次移動都不是猜測，而是由單調性證明整批候選不可能。"
        ]
      },
      {
        "title": "原索引怎麼辦",
        "body": [
          "若題目要輸出原 index，排序前把 `(value,index)` 一起存。不要排序完才試圖找回重複值的原位置。"
        ]
      },
      {
        "title": "重複值",
        "body": [
          "條件若要求不同 index，迴圈必須維持 l<r。若要計數不同 pair，還要明確決定相同值是逐個算還是整段一次處理。"
        ]
      }
    ],
    "example": {
      "title": "例：找和為 10",
      "steps": [
        "排序 [1,2,4,6,9]。",
        "1+9=10，找到答案。",
        "若是 1+6=7 太小，就把 l 右移，因為固定 1 不可能配出更大於目前 r 的值。"
      ],
      "result": "整體 O(N log N) 排序 + O(N) 掃描。"
    },
    "checkpoint": [
      "能說明為何某端可以永久丟掉。",
      "會保留 original index。",
      "能處理 duplicate 與 l<r。"
    ]
  },
  "2-mitm": {
    "sections": [
      {
        "title": "為什麼折半有效",
        "body": [
          "N=40 時 2^40 太大，但把元素拆成兩組 20，左右各自只有約 10^6 個 subset。任何完整 subset 都唯一等於『左半 subset + 右半 subset』。",
          "所以先列出兩側所有 subset value，再用排序與二分尋找最合適組合。"
        ]
      },
      {
        "title": "典型組合方式",
        "body": [
          "若求最大和 ≤ T：排序 right sums。對每個 left sum x，用 upper_bound 找最後一個 ≤ T-x 的 y。",
          "若求是否存在精確值，也可以排序一側後 binary_search，或兩側排序後用 two pointers。"
        ]
      },
      {
        "title": "時間與空間",
        "body": [
          "產生兩側各 O(2^(N/2))，排序再乘 log 因子。這是用記憶體交換指數的一半。"
        ]
      }
    ],
    "example": {
      "title": "例：N=6, T=10",
      "steps": [
        "左半 [a0,a1,a2] 產生 8 個 sums。",
        "右半 [a3,a4,a5] 產生 8 個 sums 並排序。",
        "對每個左 sum x，找最大的 y≤10-x。",
        "更新最佳 x+y。"
      ],
      "result": "完整覆蓋所有 64 個 subset，但合併更有效率。"
    },
    "checkpoint": [
      "會生成 subset sums。",
      "會用 upper_bound 合併。",
      "知道 N 約 40 是 MITM 經典尺度。"
    ]
  }
};
