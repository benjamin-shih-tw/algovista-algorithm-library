export const guideArticles = {
  "0-cpp-testing": {
    "prerequisites": [
      "會宣告變數、陣列、函式與基本迴圈",
      "能用 cin/cout 或 scanf/printf 讀寫資料"
    ],
    "objective": "建立一套競賽時可以重複使用的「讀題 → 建模 → 驗證 → 除錯」流程，而不是只會把程式碼打出來。",
    "sections": [
      {
        "title": "競賽程式和一般作業差在哪裡？",
        "body": [
          "競賽題通常不在乎你把程式拆成多少 class，而在乎答案是否正確、時間與記憶體是否過關。因此模板應該越小越好，只保留會反覆使用的輸入輸出、型別與常用容器。",
          "真正需要養成的是驗證習慣。每寫完一個演算法，先不要急著送出；先問：最小輸入會怎樣？只有一個元素呢？全部相同呢？答案在邊界呢？如果這些都沒有想過，sample 全過也沒有太大意義。"
        ]
      },
      {
        "title": "把 bug 分類，你會快很多",
        "body": [
          "遇到 WA 時先分類。讀題錯代表模型就錯；演算法錯代表想法對某些情況不成立；邊界錯常是空集合、首尾元素、等號；implementation bug 則是 index、初始化、型別、狀態沒還原。",
          "最有效的 debug 技巧通常不是印一百個變數，而是把 failing case 縮到很小。當你能手算出正確答案，再逐步看程式在哪一步偏掉，問題通常很快就會現形。"
        ],
        "bullets": [
          "先手算，再跑程式",
          "先找最小反例，再改 code",
          "每個變數都要能說出『代表什麼』"
        ]
      }
    ],
    "worked": {
      "title": "為什麼 sample 過了仍會 WA？",
      "setup": "假設題目要輸出陣列最大值，你把 ans 初始化成 0。",
      "steps": [
        "Sample 全是正數，所以看起來完全正常。",
        "如果正式測資全部是負數，例如 -5 -2 -9，ans 永遠保持 0。",
        "問題不是 max 寫錯，而是初始狀態不符合『ans 是目前看過資料的最大值』這個 invariant。",
        "改成 ans=a[0]，或初始化成足夠小的值。"
      ],
      "takeaway": "初始化本身也是演算法的一部分；它必須讓 invariant 從第一步就成立。"
    },
    "correctness": [
      "任何演算法都可以把正確性拆成兩件事：初始化時 invariant 成立；每次更新後 invariant 仍成立。最後再由 invariant 推出答案。這個思考方法會一路用到 Binary Search、DP、Dijkstra。"
    ],
    "checklist": [
      "我知道每個主要變數的語意",
      "測過最小輸入與極端輸入",
      "沒有只靠 sample 判斷正確",
      "輸出格式完全符合題目"
    ]
  },
  "0-complexity": {
    "prerequisites": [
      "會看 for / while 迴圈",
      "知道 sort 大致需要 O(N log N)"
    ],
    "objective": "看到限制就先縮小演算法候選範圍，而不是想到什麼就寫什麼。",
    "sections": [
      {
        "title": "資料量是在提示你",
        "body": [
          "如果 N=200000，O(N²) 幾乎一定不合理；如果 N=20，反而可以認真考慮 2^N。這不是死背表格，而是把『最多會做幾次基本操作』估到一個量級。",
          "複雜度要看總工作量。兩層迴圈不一定 O(N²)：雙指標的內層 while 雖然寫在 for 裡，但 left 只會一路往右，所以所有 while 的總次數最多 O(N)。"
        ]
      },
      {
        "title": "從暴力開始，再找重複工作",
        "body": [
          "很推薦先寫出最直接的暴力思路，因為那能清楚告訴你瓶頸在哪。接著問：哪些資訊被重算？能不能排序後重用？能不能 prefix sum？能不能只維護當前 window？能不能把所有答案空間做二分？",
          "演算法學習其實就是累積『把某種重複工作消掉』的方法。"
        ]
      },
      {
        "title": "空間也要估",
        "body": [
          "2^25 個 long long 已經很大；N×N 的 int 在 N=10000 更完全不可能。看到 DP 或圖論題時，先算 state 數量，再決定資料結構。"
        ]
      }
    ],
    "worked": {
      "title": "N=2×10^5 的區間問題",
      "setup": "最直覺是枚舉所有 l,r，再計算區間資訊。",
      "steps": [
        "區間數量本身就是 O(N²)，已經超過合理範圍。",
        "若區間資訊是 sum，可用 prefix sum 把每次計算降成 O(1)，但總區間仍 O(N²)。",
        "因此還需要額外結構，例如滑動視窗的單調性、排序後二分、或資料結構，才能把『枚舉所有區間』本身消掉。"
      ],
      "takeaway": "把一部分從 O(N) 降成 O(1) 不代表整體就夠快；要看整個流程的乘積。"
    },
    "correctness": [
      "複雜度估算不是證明答案正確，而是證明『即使答案正確，也有機會在限制內跑完』。競賽解法同時需要 correctness 與 complexity。"
    ],
    "checklist": [
      "先寫最壞情況操作次數",
      "把 sort/set/map/pq 的 log N 算進去",
      "迴圈攤銷成本沒有重複計算",
      "state 數量與記憶體可接受"
    ]
  },
  "0-danger-zone": {
    "prerequisites": [
      "知道 int / long long 是有限範圍整數",
      "知道浮點數不是精確實數"
    ],
    "objective": "排除那些『演算法對，但答案仍 WA』的低階風險。",
    "sections": [
      {
        "title": "Overflow 看的是中間值",
        "body": [
          "最常見的陷阱是 `long long x = a*b;`，若 a、b 是 int，乘法會先在 int 中完成，溢位後才存進 long long。解法是讓至少一個 operand 先變成 long long，例如 `1LL*a*b`。",
          "同樣地，模運算也不能假設最後 `% MOD` 就安全；如果乘法前已經爆掉，取模救不回來。"
        ]
      },
      {
        "title": "浮點不要直接相信 ==",
        "body": [
          "0.1 在二進位浮點中通常不能被精確表示，所以經過多次運算後，理論上相等的兩個值可能差一點點。幾何或數值題常用 `fabs(a-b) < EPS`。",
          "如果題目本來是整數關係，優先考慮把式子改寫成整數比較，通常比靠 EPS 更穩。"
        ]
      },
      {
        "title": "Short-circuit 其實也是安全工具",
        "body": [
          "像 `i<n && a[i]==x` 中，如果 i>=n，右半部不會被計算，能避免越界。條件順序因此有語意，不能隨便交換。"
        ]
      }
    ],
    "worked": {
      "title": "平方距離比較",
      "setup": "想比較兩點距離，不一定要真的開根號。",
      "steps": [
        "距離 d=sqrt(dx²+dy²)。",
        "sqrt 是單調函數，因此比較 d1<d2 等價於比較 d1²<d2²。",
        "直接比較平方距離能避免浮點與 sqrt 成本。",
        "但 dx² 可能超過 int，因此中間值要用 long long。"
      ],
      "takeaway": "先做代數化簡，再決定資料型別；很多數值風險可以在建模階段消掉。"
    },
    "correctness": [
      "安全實作的核心是：每個運算都必須在它的數值域內有定義，而且比較方式要符合題目的數學語意。"
    ],
    "checklist": [
      "乘法中間值不會 overflow",
      "浮點比較有明確策略",
      "陣列存取前有邊界保護",
      "沒有把 undefined behavior 當成 compiler 問題"
    ]
  },
  "1-recursion-model": {
    "prerequisites": [
      "會寫函式",
      "知道區域變數與參數"
    ],
    "objective": "把遞迴理解成一個可證明的數學定義，而不是神秘的『自己呼叫自己』。",
    "sections": [
      {
        "title": "先寫函式語意，再寫程式",
        "body": [
          "例如 `solve(l,r)` 不要只想成『處理 l 到 r』，要寫清楚它回傳什麼：『回傳區間 [l,r) 的最大值』。這一句話會直接決定 base case 和 combine。",
          "遞迴正確性的思考方式是假設較小問題已經正確，然後證明自己能用那些答案得到較大問題。這就是數學歸納法在程式裡的版本。"
        ]
      },
      {
        "title": "三個必要條件",
        "body": [
          "有 base case；每次呼叫規模真的變小；當較小答案回來後，你知道怎麼組成目前答案。缺任何一個，遞迴都只是語法。"
        ]
      },
      {
        "title": "Call stack 要怎麼看",
        "body": [
          "每次呼叫都有自己的參數與區域變數。當下一層尚未回來，上一層會暫停在呼叫位置。回傳時才繼續往下執行。理解這件事後，很多『為什麼變數沒有被覆蓋』的疑惑自然消失。"
        ]
      }
    ],
    "worked": {
      "title": "計算區間總和",
      "setup": "定義 f(i)=a[i]+a[i+1]+...+a[n-1]。",
      "steps": [
        "base：i==n 時沒有元素，答案是 0。",
        "recursive step：f(i)=a[i]+f(i+1)。",
        "f(i+1) 的輸入規模少一個元素，所以一定朝 base 前進。",
        "假設 f(i+1) 正確，那加上 a[i] 就得到 f(i)。"
      ],
      "takeaway": "真正的核心是函式定義與縮小方向；code 反而只有幾行。"
    },
    "correctness": [
      "用歸納法：base i=n 正確；假設 f(i+1) 正確，則 f(i)=a[i]+f(i+1) 也正確。因此所有 i 都成立。"
    ],
    "checklist": [
      "能用一句話定義函式",
      "base case 回傳值符合定義",
      "每次呼叫規模變小",
      "combine 與函式語意一致"
    ]
  },
  "1-enumeration": {
    "prerequisites": [
      "會基本遞迴",
      "會用陣列或 vector 保存輸入"
    ],
    "objective": "把『所有可能』系統化地枚舉，並能估算搜尋樹大小。",
    "sections": [
      {
        "title": "把每個選擇畫成樹",
        "body": [
          "子集合問題對每個元素只有兩個選擇：選或不選。深度 i 表示前 i 個元素已決定，因此整棵樹有 2^N 個葉節點。",
          "只要每個完整答案對應唯一的一條根到葉路徑，就不會重複也不會漏。這個觀點比背某個 subset template 更重要。"
        ]
      },
      {
        "title": "狀態要跟著遞迴走",
        "body": [
          "如果只需要目前總和，就直接把 sum 當參數；不要到葉節點再重新掃一遍 chosen[]。這能把 O(N2^N) 降成 O(2^N)。",
          "如果需要輸出實際選了哪些元素，才保存 path，進分支時 push，回來後 pop。"
        ]
      },
      {
        "title": "剪枝是什麼",
        "body": [
          "如果現在已經能確定某個分支不可能產生合法解，就不必走到葉節點。例如正數 subset sum 若 currentSum 已超過上限，後面再選只會更大，可以直接 return。"
        ]
      }
    ],
    "worked": {
      "title": "枚舉 {3,5,8} 的所有 subset sum",
      "setup": "用 dfs(i,sum)，i 是下一個要決定的 index。",
      "steps": [
        "dfs(0,0) 分成不選 3 與選 3。",
        "每個分支再對 5 做相同決策。",
        "最後對 8 決策，i==3 時輸出 sum。",
        "葉節點依序代表 000、001、010...等二進位選擇。"
      ],
      "takeaway": "bitmask 與 recursion 其實是在走同一個決策空間，只是表示法不同。"
    },
    "correctness": [
      "對第 i 個元素，合法答案必定屬於『不選 i』或『選 i』兩類，而且互斥。遞迴完整處理兩類，因此不重不漏。"
    ],
    "checklist": [
      "每層選擇完整且互斥",
      "state 增量維護",
      "葉節點條件正確",
      "知道搜尋樹節點數量級"
    ]
  },
  "1-backtracking": {
    "prerequisites": [
      "熟悉遞迴枚舉",
      "知道什麼是合法性條件"
    ],
    "objective": "在暴搜過程中提早砍掉不可能成功的分支，並正確維護可回復狀態。",
    "sections": [
      {
        "title": "Backtracking = 搜尋 + 約束",
        "body": [
          "和單純枚舉相比，Backtracking 多了一個核心：每做一個決策，立刻檢查目前部分解是否仍可能擴充成完整解。如果不能，就不往下。",
          "N-Queen 就是典型例子。放第 k 列皇后時，只考慮不和前面皇后同欄、同斜線的位置。這樣大量排列根本不會被展開。"
        ]
      },
      {
        "title": "State 怎麼設計",
        "body": [
          "最直接可以掃描前 k 列檢查衝突；再進一步可以用 column、diag1、diag2 三組布林陣列 O(1) 判斷。",
          "優化的本質不是『換資料結構』，而是把『目前哪些位置已被占用』這件事增量維護。"
        ]
      },
      {
        "title": "Rollback 一定成對",
        "body": [
          "進入 child 前做的修改，離開 child 後必須完全撤銷。可以把程式碼視為 `choose(); dfs(); undo();` 三件套。"
        ]
      }
    ],
    "worked": {
      "title": "4-Queens 第一層",
      "setup": "第 0 列先放在第 1 欄。",
      "steps": [
        "標記 col[1]、兩條對角線已占用。",
        "進入第 1 列，只枚舉未衝突欄位。",
        "若某列沒有任何合法欄位，該分支立即結束。",
        "返回第 0 列時，取消剛才所有標記，再試下一欄。"
      ],
      "takeaway": "剪枝越早，搜尋樹縮得越多；但剪枝條件必須保證不會砍掉任何可能成功的分支。"
    },
    "correctness": [
      "每個完整合法配置在每一列都有唯一欄位選擇，因此搜尋可達到它；我們只剪掉已經違反必要條件的 prefix，所以不會刪除任何合法完整解。"
    ],
    "checklist": [
      "合法性條件是必要條件",
      "修改與 rollback 完全對稱",
      "沒有 sibling 共用髒狀態",
      "剪枝發生得越早越好"
    ]
  },
  "2-sorting": {
    "prerequisites": [
      "會使用 vector",
      "理解比較大小"
    ],
    "objective": "把排序當成『製造單調性』的工具，並理解離散化為何不改變大小關係。",
    "sections": [
      {
        "title": "排序後問題會變簡單",
        "body": [
          "未排序陣列中，兩個元素之間沒有方向；排序後，如果目前值太小，你知道往右才可能更大。Binary Search、Two Pointers、Sweep Line 都依賴這種單調性。",
          "很多題不是真的在考 sort，而是在考『排序後可以安全丟掉哪些候選』。"
        ]
      },
      {
        "title": "Comparator 不是隨便寫",
        "body": [
          "C++ sort 的 comparator 應表示嚴格的小於關係。例如 `a.key < b.key`。如果寫成 `<=`，相等元素會同時認為彼此在前，破壞 strict weak ordering。"
        ]
      },
      {
        "title": "離散化保留什麼",
        "body": [
          "如果只在乎大小次序，可以把 [1000000000, -7, 42] 映成 rank [2,0,1]。值域變小，但 `<`、`>`、相等關係都保留。",
          "做法是複製、sort、unique，再用 lower_bound 找 rank。"
        ]
      }
    ],
    "worked": {
      "title": "把座標壓到 0..k-1",
      "setup": "原值為 [50, 10, 50, 30]。",
      "steps": [
        "複製成 [50,10,50,30]。",
        "排序得到 [10,30,50,50]。",
        "unique 後 [10,30,50]。",
        "原陣列映成 [2,0,2,1]。"
      ],
      "takeaway": "離散化不保留差值，只保留順序與相等關係；如果題目需要真實距離，不能只用 rank 做減法。"
    },
    "correctness": [
      "排序後唯一值陣列嚴格遞增，因此 lower_bound 回傳的位置正是值的排名；相同值會得到相同位置。"
    ],
    "checklist": [
      "確認需要保留原 index 嗎",
      "comparator 是 strict",
      "離散化後沒有誤用 rank 差當數值差",
      "排序是否創造了後續單調性"
    ]
  },
  "2-binary-search": {
    "prerequisites": [
      "排序概念",
      "知道陣列索引"
    ],
    "objective": "用 invariant 寫出不會 off-by-one 的二分搜尋，並熟悉 lower_bound / upper_bound。",
    "sections": [
      {
        "title": "二分不是背 while 模板",
        "body": [
          "你要先決定區間語意。推薦用半開區間 [l,r)：l 可能是答案，r 不包含。找第一個 >= target 時，若 a[mid] 已符合，就保留 mid 所在右界 `r=mid`；否則 `l=mid+1`。",
          "每一步都要確定區間真的變小，而且答案若存在仍在區間內。"
        ]
      },
      {
        "title": "lower_bound / upper_bound",
        "body": [
          "`lower_bound` 找第一個 `>= x`；`upper_bound` 找第一個 `> x`。兩者的差可以計算等於 x 的個數。",
          "回傳可能是 end()，所以解參考前要檢查。"
        ]
      },
      {
        "title": "Binary Search 的真正適用條件",
        "body": [
          "不一定需要陣列。只要判斷條件從某點開始由 false 永遠變 true，或相反，就可以二分。這會直接延伸到 Binary Search on Answer。"
        ]
      }
    ],
    "worked": {
      "title": "找第一個 >= 7",
      "setup": "a=[1,3,7,7,10]，搜尋區間 [0,5)。",
      "steps": [
        "mid=2，a[2]=7 符合，所以 r=2。",
        "現在 [0,2)，mid=1，a[1]=3 不符合，所以 l=2。",
        "l==r==2，答案 index 2。"
      ],
      "takeaway": "我們沒有在找到 7 時立刻停，因為目標是『第一個』，仍要往左壓。"
    },
    "correctness": [
      "Invariant：所有 index<l 都確定不符合；所有 index>=r 都不可能比目前候選更早。每次更新保持此性質，當 l==r 時唯一候選即為 first true。"
    ],
    "checklist": [
      "明確知道找 first true 還是 last true",
      "區間語意固定",
      "更新後區間必縮小",
      "處理 end() 與不存在"
    ]
  },
  "2-fast-power": {
    "prerequisites": [
      "理解指數規則",
      "會位元運算基本概念"
    ],
    "objective": "把重複乘法從 O(n) 降成 O(log n)，並看懂二進位分解的 invariant。",
    "sections": [
      {
        "title": "為什麼可以一直平方",
        "body": [
          "例如 13 的二進位是 1101，所以 a^13 = a^8·a^4·a。只要依序準備 a, a², a⁴, a⁸，就能在看到 bit=1 時乘進答案。",
          "每次把 exponent 右移一位，同時把 base 平方，剛好讓新的最低 bit 對應下一個 2 的冪。"
        ]
      },
      {
        "title": "模快速冪",
        "body": [
          "若只要 mod M，可以在每次乘法後取模。注意乘法本身仍可能 overflow；M 很大時要用 __int128 或專門的 modular multiplication。"
        ]
      },
      {
        "title": "它其實是一個通用框架",
        "body": [
          "只要某個運算有結合律與單位元，就可以做『快速冪』。矩陣乘法因此也能套完全相同的 binary exponentiation 骨架。"
        ]
      }
    ],
    "worked": {
      "title": "算 3^13",
      "setup": "ans=1, base=3, e=13(1101₂)。",
      "steps": [
        "最低 bit=1：ans=3；base→9；e→6。",
        "bit=0：ans 不變；base→81；e→3。",
        "bit=1：ans*=81；base 再平方；e→1。",
        "最後 bit=1 再乘進 ans。"
      ],
      "takeaway": "總迴圈次數等於 exponent 的 bit 數，大約 log2(e)。"
    },
    "correctness": [
      "Invariant：`ans * base^e` 始終等於原本的 a^n。e 為奇數時先取出一個 base；之後 base 平方且 e 除以 2，等式仍成立。"
    ],
    "checklist": [
      "e=0 時答案為單位元",
      "乘法型別足夠大",
      "mod 每一步都正確",
      "理解 invariant 而非只背模板"
    ]
  },
  "2-fibonacci": {
    "prerequisites": [
      "快速冪",
      "基本矩陣乘法"
    ],
    "objective": "把固定線性 recurrence 轉成矩陣狀態，進而 O(log n) 求第 n 項。",
    "sections": [
      {
        "title": "從 recurrence 找 state",
        "body": [
          "F(n+1)=F(n)+F(n-1)。要推出下一步，只需要知道相鄰兩項，因此 state 可以選 `[F(k+1),F(k)]`。",
          "一次前進可以寫成固定矩陣乘法：第一列做相加，第二列把舊的第一個值搬下來。"
        ]
      },
      {
        "title": "為什麼 T^n 有意義",
        "body": [
          "T 表示『走一步』，T² 就是連做兩步，T^n 就是連做 n 步。這和數字 a^n 是連乘 n 次完全同一個概念。"
        ]
      },
      {
        "title": "一般化",
        "body": [
          "任何固定階的線性 recurrence，只要下一狀態是舊 state 的線性組合，就可以擴成矩陣。矩陣維度等於你需要記住的歷史資訊數量。"
        ]
      }
    ],
    "worked": {
      "title": "Fibonacci transition",
      "setup": "state_k=[F(k+1),F(k)]ᵀ。",
      "steps": [
        "下一步第一個分量要 F(k+2)=F(k+1)+F(k)。",
        "下一步第二個分量只是 F(k+1)。",
        "所以 T=[[1,1],[1,0]]。",
        "state_n=T^n·state_0。"
      ],
      "takeaway": "矩陣不是硬背，而是把『每個新分量如何由舊分量組合』逐列寫出來。"
    },
    "correctness": [
      "矩陣每一列精確描述 recurrence，因此一次乘法正確實作一步 transition；由乘法結合律，T^n 等價於連續做 n 次。"
    ],
    "checklist": [
      "state 包含足夠歷史",
      "transition matrix 每列語意清楚",
      "identity matrix 作快速冪初值",
      "矩陣乘法順序正確"
    ]
  },
  "2-two-number": {
    "prerequisites": [
      "排序",
      "二分搜尋"
    ],
    "objective": "辨識『固定一個、搜尋另一個』與 two pointers 的單調性。",
    "sections": [
      {
        "title": "從 O(N²) 開始看",
        "body": [
          "Two-Sum 暴力枚舉所有 pair。排序後，可以對每個 a[i] 二分 target-a[i]，變 O(N log N)；若只問是否存在 pair，還可以用雙指標做到 O(N)。"
        ]
      },
      {
        "title": "雙指標為什麼敢丟掉端點",
        "body": [
          "若 a[l]+a[r] 太小，固定 r 時任何比 a[l] 更小的值只會更小，所以 l 不可能參與答案，可以安全 ++l。",
          "相反地，和太大時 r 可以安全 --r。"
        ]
      },
      {
        "title": "索引與重複值",
        "body": [
          "題目若要求原位置，排序時要存 (value,index)。若需要兩個不同元素，要避免同一 index 被使用兩次。重複值也會影響計數題的處理方式。"
        ]
      }
    ],
    "worked": {
      "title": "target=10",
      "setup": "排序後 a=[1,2,4,6,8]。",
      "steps": [
        "l=1,r=8，和 9 太小，所以 l++。",
        "2+8=10，找到答案。",
        "我們不需要試 1+6、1+4，因為在 1+8 都太小時，搭配更小右端更不可能到 10。"
      ],
      "takeaway": "雙指標的效率來自一次移動可以排除整批 pair。"
    },
    "correctness": [
      "每次根據排序單調性排除的端點，都不可能與剩餘另一側形成答案，因此不會漏解；兩指標最多各移動 N 次。"
    ],
    "checklist": [
      "資料先排序",
      "移動方向有證明",
      "原 index 是否要保存",
      "計數題處理 duplicate"
    ]
  },
  "2-mitm": {
    "prerequisites": [
      "子集合枚舉",
      "排序與二分"
    ],
    "objective": "處理 N 約 35–45、2^N 太大但 2^(N/2) 可接受的 subset 類問題。",
    "sections": [
      {
        "title": "為什麼折半有用",
        "body": [
          "N=40 時 2^40 約一兆，不可能枚舉；切成 20+20 後，左右各只有約一百萬個 subset。",
          "完整解的資訊通常可以拆成 leftContribution + rightContribution，因此只要有效率地把兩側配對即可。"
        ]
      },
      {
        "title": "典型流程",
        "body": [
          "枚舉左半所有值 L；枚舉右半所有值 R；排序 R；對每個 x∈L，二分找最適合與 x 配對的 y。"
        ]
      },
      {
        "title": "何時不能直接 MITM",
        "body": [
          "必須確認完整答案能由兩半的摘要資訊合併。如果跨半部還有複雜依賴，例如選擇順序互相影響，就不能只存一個 sum。"
        ]
      }
    ],
    "worked": {
      "title": "subset sum ≤ P",
      "setup": "N=6，切成前三個與後三個。",
      "steps": [
        "左右各產生 8 個 subset sum。",
        "把右側排序。",
        "對每個左和 x，二分 `upper_bound(P-x)`。",
        "取不超過 P-x 的最大右和，更新 x+y。"
      ],
      "takeaway": "MITM 用空間與排序換掉一半指數。"
    },
    "correctness": [
      "任何 subset 唯一分成左半 subset 與右半 subset，因此枚舉 L×R 的配對空間概念上完整；二分只是把對每個 x 找最佳 y 的線性掃描加速。"
    ],
    "checklist": [
      "N/2 的 2^k 真能放進記憶體",
      "摘要資訊足以合併",
      "數值範圍型別足夠",
      "二分上下界等號正確"
    ]
  },
  "3-linear-structures": {
    "prerequisites": [
      "vector 基本操作"
    ],
    "objective": "不靠背 API，而是依『未完成工作應該以什麼順序被取出』選資料結構。",
    "sections": [
      {
        "title": "Queue：先進先出",
        "body": [
          "最早加入的工作最先處理。BFS 需要保持距離層次，因此 queue 是自然選擇。"
        ]
      },
      {
        "title": "Stack：後進先出",
        "body": [
          "最近開啟的結構最先關閉，例如括號、遞迴呼叫、DFS 的顯式模擬。"
        ]
      },
      {
        "title": "Deque：兩端都能操作",
        "body": [
          "當一端負責移除過期資料、另一端負責移除被支配候選時，deque 特別有用，單調佇列就是典型。"
        ]
      }
    ],
    "worked": {
      "title": "哪個容器適合？",
      "setup": "你有一批待處理節點。",
      "steps": [
        "若要按發現時間處理：queue。",
        "若要一路深入、回頭處理最近分支：stack。",
        "若舊資料從前端過期、新資料可能從後端淘汰候選：deque。"
      ],
      "takeaway": "先決定處理順序，再選容器；不是看到某題『像 queue 題』就硬套。"
    },
    "correctness": [
      "資料結構本身不保證演算法正確；它只是實作某種順序。你必須先證明那個順序符合問題需要。"
    ],
    "checklist": [
      "知道 FIFO/LIFO 的語意",
      "不對空容器取 front/top",
      "需要 index 還是 value 想清楚",
      "容器順序與演算法 invariant 一致"
    ]
  },
  "3-expression-stack": {
    "prerequisites": [
      "Stack",
      "字串掃描"
    ],
    "objective": "理解『尚未完成、最近開啟』的 nested 結構為何用 stack。",
    "sections": [
      {
        "title": "括號匹配",
        "body": [
          "遇到左括號，把種類 push；遇右括號時，它只能和最近尚未配對的左括號配對，所以檢查 top。掃完後 stack 也必須為空。"
        ]
      },
      {
        "title": "運算子 precedence",
        "body": [
          "中序式求值時，若 stack top 的運算子優先級高於目前運算子，應先完成舊運算。括號則暫時阻止跨越。"
        ]
      },
      {
        "title": "Shunting-yard 的核心",
        "body": [
          "輸出數字；運算子暫存在 stack；依優先級與結合律決定何時 pop 到輸出。最後得到 postfix，之後可用另一個 stack 線性求值。"
        ]
      }
    ],
    "worked": {
      "title": "3 + 4 * 2",
      "setup": "掃描中序式。",
      "steps": [
        "3 直接輸出。",
        "+ 暫存 stack。",
        "4 輸出。",
        "* 優先級比 + 高，所以先放 stack，不 pop +。",
        "2 輸出；掃描結束後先 pop * 再 pop +，得到 3 4 2 * +。"
      ],
      "takeaway": "Stack 保存的是『還不能決定執行時機』的運算子。"
    },
    "correctness": [
      "當一個運算子被 pop 時，所有應比它更早處理的 operand 與高優先級運算都已完成，因此輸出順序符合原表達式語意。"
    ],
    "checklist": [
      "左右括號都檢查",
      "優先級與結合律分開處理",
      "掃描結束清空 stack",
      "負號/多位數等 token 規格確認"
    ]
  },
  "3-monotonic-stack": {
    "prerequisites": [
      "Stack",
      "排序/單調性的基本直覺"
    ],
    "objective": "用『支配』概念維護只可能成為未來答案的候選。",
    "sections": [
      {
        "title": "為什麼可以 pop",
        "body": [
          "找右側第一個更大元素時，如果新值 a[i] 比 stack top 更大，那 top 的答案就是 i，可以完成並 pop。",
          "更一般地，如果新候選在『位置更晚、值又更好』兩個維度都不輸舊候選，舊候選對未來就沒有價值。"
        ]
      },
      {
        "title": "存 index 比存 value 更常見",
        "body": [
          "index 可以同時取得 value、距離、是否過期，資訊更完整。"
        ]
      },
      {
        "title": "相等值策略",
        "body": [
          "`<` 還是 `<=` 會決定相等元素是否互相淘汰。題目問 strictly greater 或 greater-or-equal 時，這個等號非常重要。"
        ]
      }
    ],
    "worked": {
      "title": "Next Greater Element",
      "setup": "a=[2,1,5,3]。",
      "steps": [
        "2 push。",
        "1 不大於 2，也 push，stack 值為 2,1。",
        "5 到來：先解答 1，再解答 2，兩者都 pop；5 push。",
        "3 不大於 5，push。最後未被解答者答案不存在。"
      ],
      "takeaway": "每個 index 只 push 一次、pop 一次，所以 while 雖然巢狀，總複雜度 O(N)。"
    },
    "correctness": [
      "stack 維持單調；某元素被新值 pop 時，新值是它右側第一個打破單調條件的元素，因此就是第一個符合答案的位置。"
    ],
    "checklist": [
      "明確知道 stack 的單調方向",
      "存 index 或 value 有理由",
      "等號符合題意",
      "能做攤銷 O(N) 分析"
    ]
  },
  "3-sliding-window": {
    "prerequisites": [
      "雙指標",
      "能維護 freq/sum"
    ],
    "objective": "在連續區間上增量維護資訊，讓左右界都只往前。",
    "sections": [
      {
        "title": "固定長度 window",
        "body": [
          "最簡單：加入新右端、移除舊左端。若 sum 可以 O(1) 更新，就不必每次重算 k 個元素。"
        ]
      },
      {
        "title": "可變長度 window",
        "body": [
          "常見模式是右端逐步擴張；一旦條件不合法，就不斷移動 left 直到恢復合法。成立前提是『移動 left 的效果有單調方向』。"
        ]
      },
      {
        "title": "狀態要同步",
        "body": [
          "left++ 時要把離開元素從 sum/freq/set 等結構刪掉。很多 bug 都是區間邊界動了，但維護資訊沒動。"
        ]
      }
    ],
    "worked": {
      "title": "最長無重複子陣列",
      "setup": "a=[1,2,1,3,4]。",
      "steps": [
        "r=0,1 時 window [1,2] 合法。",
        "r=2 加入 1 後重複，移動 l 並減少 freq，直到第一個 1 離開。",
        "現在 window [2,1] 恢復合法。",
        "之後加入 3、4，持續更新最大長度。"
      ],
      "takeaway": "window 永遠維護一個『目前合法的最左界』，因此每個元素最多進出一次。"
    },
    "correctness": [
      "當 window 不合法時，任何更左的 l 也不會比修正後更適合作為『最小合法左界』；由單調性可以安全只往右移。"
    ],
    "checklist": [
      "條件真的具有單調性",
      "add/remove 成對",
      "更新答案時機正確",
      "left/right 邊界含不含端點一致"
    ]
  },
  "3-monotonic-queue": {
    "prerequisites": [
      "Deque",
      "Sliding Window",
      "Monotonic Stack 的支配概念"
    ],
    "objective": "O(N) 求所有固定視窗的最大/最小值。",
    "sections": [
      {
        "title": "Deque 裡不是全部元素",
        "body": [
          "只保留還可能成為未來最大值的候選。新值若比尾端更大，尾端既比較舊又比較小，永遠不可能再贏，可以 pop_back。"
        ]
      },
      {
        "title": "前端處理過期",
        "body": [
          "deque 保存 index，因此若 front <= i-k，表示已離開目前視窗，要 pop_front。"
        ]
      },
      {
        "title": "兩個 invariant",
        "body": [
          "index 由前到後遞增；對最大值問題，對應 value 由前到後遞減。於是 front 同時是最舊的優秀候選，也是目前最大值。"
        ]
      }
    ],
    "worked": {
      "title": "k=3，a=[1,3,2,5]",
      "setup": "維護 decreasing deque。",
      "steps": [
        "1 入 deque。",
        "3 進來時淘汰 1，deque=[3]。",
        "2 較小，放尾端，第一窗最大值 3。",
        "5 進來時從尾端依序淘汰 2、3，deque=[5]，第二窗最大值 5。"
      ],
      "takeaway": "一個元素一旦被更晚且更大的元素淘汰，就永遠沒有回來的必要。"
    },
    "correctness": [
      "任何被尾端移除的元素，在未來所有仍同時存在的 window 中都輸給新元素；過期元素則不再屬於 window。因此 deque front 恰為所有有效且未被支配候選中的最大值。"
    ],
    "checklist": [
      "deque 存 index",
      "先後順序不會誤刪當前元素",
      "相等值策略符合需求",
      "能解釋 O(N) 攤銷"
    ]
  },
  "4-greedy-basics": {
    "prerequisites": [
      "排序",
      "能寫簡單 proof"
    ],
    "objective": "學會分辨『直覺選最好的』與『可證明安全的局部選擇』。",
    "sections": [
      {
        "title": "Greedy 要回答兩個問題",
        "body": [
          "第一，現在選什麼？第二，為什麼這個選擇不會讓全域最優解消失？第二題才是重點。"
        ]
      },
      {
        "title": "Exchange argument",
        "body": [
          "假設有一個最優解沒有採用我們的 greedy choice。若能把它某一部分交換成 greedy choice，而且答案不變差，就證明至少存在一個最優解和我們第一步一致。接著遞迴處理剩餘問題。"
        ]
      },
      {
        "title": "Greedy 和 DP 怎麼分",
        "body": [
          "如果目前選擇會改變未來很多種可能狀態，通常需要 DP；如果你能證明某個局部選擇總有最優解願意配合，就有 greedy 結構。"
        ]
      }
    ],
    "worked": {
      "title": "活動選擇",
      "setup": "要選最多個互不重疊區間。",
      "steps": [
        "Greedy 選目前能選且結束最早的區間。",
        "假設某最優解第一個選的是另一區間 X。",
        "把 X 換成更早或同時結束的 greedy 區間，不會減少後面可用時間。",
        "因此存在最優解以 greedy choice 開頭。"
      ],
      "takeaway": "證明不是說『看起來留最多空間』，而是明確構造交換。"
    },
    "correctness": [
      "每一步透過 exchange argument 保證至少一個最優解與目前 greedy prefix 相容；重複到結束後得到的完整解因此也是最優。"
    ],
    "checklist": [
      "局部選擇規則明確",
      "有交換/領先性證明",
      "剩餘問題仍是同型問題",
      "找過小反例挑戰自己的 greedy"
    ]
  },
  "4-scheduling": {
    "prerequisites": [
      "Greedy 基本證明",
      "自訂 sort comparator"
    ],
    "objective": "從相鄰交換推導排序規則，而不是憑感覺選 key。",
    "sections": [
      {
        "title": "排序 key 可以推導",
        "body": [
          "很多排程成本取決於工作順序。取兩個相鄰工作 A、B，比較 AB 與 BA 的總成本；把不等式整理後，就會得到 A 應排在 B 前的條件。"
        ]
      },
      {
        "title": "Activity selection 是特殊例子",
        "body": [
          "若目標是最大化不重疊區間數，排序依結束時間。這個 key 不是『區間最短』，兩者完全不同。"
        ]
      },
      {
        "title": "Tie-break 的角色",
        "body": [
          "若主 comparator 相等時任何順序都同樣好，tie-break 只為穩定實作；但有些題相等時仍影響後續，必須重新證明。"
        ]
      }
    ],
    "worked": {
      "title": "最早結束優先",
      "setup": "區間 (1,4),(2,3),(3,5)。",
      "steps": [
        "依 end 排序：(2,3),(1,4),(3,5)。",
        "先選 (2,3)。",
        "下一個可接的是 (3,5)，得到兩段。",
        "若先選 (1,4)，只能得到一段。"
      ],
      "takeaway": "Greedy key 的價值在於保留後續自由度。"
    },
    "correctness": [
      "以 exchange argument：任一最優解的第一段若不是最早結束者，可以換成最早結束者而不讓任何後續區間失效。"
    ],
    "checklist": [
      "排序 key 有證明",
      "端點相接算不算重疊已確認",
      "tie-break 不破壞性質",
      "排序後掃描條件正確"
    ]
  },
  "4-priority-queue": {
    "prerequisites": [
      "Heap / priority_queue",
      "Greedy"
    ],
    "objective": "在候選集合動態變化時，持續 O(log N) 取出當前最佳候選。",
    "sections": [
      {
        "title": "為什麼不是每次重新 sort",
        "body": [
          "若掃描過程中一直加入新工作，每次 sort 全部會太慢。Heap 只維護『誰是最小/最大』，插入與刪 top O(log N)。"
        ]
      },
      {
        "title": "事件 + Heap",
        "body": [
          "常見套路：先按時間/位置排序事件；掃到某點時把新可用候選 push；再從 top 取最適合者。"
        ]
      },
      {
        "title": "Lazy deletion",
        "body": [
          "某候選可能後來失效，但 heap 不方便刪任意位置。可以在 top 時檢查 validity，若已失效就 pop，直到 top 有效。"
        ]
      }
    ],
    "worked": {
      "title": "動態選最早截止工作",
      "setup": "工作會隨時間變成可執行。",
      "steps": [
        "事件按 release time 排序。",
        "時間走到 t，把所有 release<=t 的工作 push 到 min-heap，key=deadline。",
        "每次執行 heap top。",
        "若某工作已過期，就在 top 時丟棄。"
      ],
      "takeaway": "Heap 解的是『動態候選中的極值』，不是所有排序問題。"
    },
    "correctness": [
      "只要 greedy proof 告訴你每一步應選候選中的最小/最大 key，priority_queue 就能正確且有效率地實作這個選擇。"
    ],
    "checklist": [
      "max-heap/min-heap 方向正確",
      "候選加入時機正確",
      "失效資料有清掉",
      "pair 的 lexicographic ordering 符合 key"
    ]
  },
  "4-binary-answer": {
    "prerequisites": [
      "Binary Search",
      "能寫 O(N) check"
    ],
    "objective": "把最佳化問題轉成單調 decision problem。",
    "sections": [
      {
        "title": "先不要直接求答案",
        "body": [
          "如果問『最小可行 X』，先假設 X 已知，問能不能做到。通常 feasibility 比直接最佳化容易很多。"
        ]
      },
      {
        "title": "單調性",
        "body": [
          "若 X 可行，所有更大的 X 都可行，就形成 F...F T...T，可以找 first true；反之形成 T...T F...F 則找 last true。"
        ]
      },
      {
        "title": "check 的成本決定總成本",
        "body": [
          "總複雜度是 O(check × log range)。所以 check 如果本身 O(N²)，二分也救不了。"
        ]
      }
    ],
    "worked": {
      "title": "最小最大分段和",
      "setup": "把正數陣列切成至多 K 段，最小化最大段和。",
      "steps": [
        "猜一個上限 X。",
        "從左到右 greedy 裝入目前段；若再加會超 X 就開新段。",
        "計算需要幾段，若 <=K 則 X 可行。",
        "X 越大只會更容易可行，因此二分 first true。"
      ],
      "takeaway": "最難的是發現『答案大小』具有可行性單調性。"
    },
    "correctness": [
      "對固定 X，正數情況下 greedy 每段塞到不能再塞，能使用最少段數；因此可正確判斷是否能在 K 段內完成。外層由單調性二分臨界 X。"
    ],
    "checklist": [
      "check(x) 語意清楚",
      "已證明單調性",
      "上下界一定包住答案",
      "first/last true 模板一致"
    ]
  },
  "4-sweep-line": {
    "prerequisites": [
      "排序",
      "set/map 或其他動態結構"
    ],
    "objective": "把區間/幾何問題轉成排序事件，維護目前 active 狀態。",
    "sections": [
      {
        "title": "把物件變事件",
        "body": [
          "區間 [l,r] 可以產生 start(l)、end(r)；點查詢是 query(x)。所有事件依座標排序後，就能線性掃過。"
        ]
      },
      {
        "title": "同座標 tie-break 很重要",
        "body": [
          "閉區間若 query 在端點也算涵蓋，就必須讓 add 發生在 query 前、remove 發生在 query 後；開區間則可能不同。"
        ]
      },
      {
        "title": "Active set 是第二層資料結構",
        "body": [
          "簡單題只維護 count；更難題可能維護目前 y 排序、最小值、最大值、重疊區間等。Sweep line 只決定事件順序，active structure 決定每步查什麼。"
        ]
      }
    ],
    "worked": {
      "title": "區間最大重疊數",
      "setup": "有多個閉區間 [l,r]。",
      "steps": [
        "每個 l 建 +1 事件，每個 r 建 -1 事件。",
        "同座標時 +1 必須先於 -1，因為端點相交也算同時存在。",
        "按座標掃描，cur += delta。",
        "ans=max(ans,cur)。"
      ],
      "takeaway": "很多區間題的核心其實就是『哪一刻進入、哪一刻離開』。"
    },
    "correctness": [
      "掃到座標 x 時，所有開始點≤x 且結束點≥x 的區間恰好已 add 尚未 remove，因此 cur/active set 精確代表當下狀態。"
    ],
    "checklist": [
      "事件定義完整",
      "同座標順序符合端點語意",
      "active state 可增量更新",
      "排序 + 每事件操作複雜度可接受"
    ]
  },
  "5-divide-basics": {
    "prerequisites": [
      "遞迴",
      "基本複雜度"
    ],
    "objective": "理解分治真正的設計重點是 combine，而不是『把東西切一半』。",
    "sections": [
      {
        "title": "三步驟",
        "body": [
          "Divide：切成較小的同型問題；Conquer：遞迴解子問題；Combine：把子問題答案組回原問題。"
        ]
      },
      {
        "title": "先假設子問題都會解",
        "body": [
          "設計時不要陷進遞迴細節。假設左右答案已經神奇地正確回來，問自己：只看這兩個答案與少量邊界資訊，怎麼得到整體答案？"
        ]
      },
      {
        "title": "複雜度看每層",
        "body": [
          "平衡切半通常深度 O(log N)。若每層所有 combine 總工作量 O(N)，就得到 O(N log N)。"
        ]
      }
    ],
    "worked": {
      "title": "區間最大最小值",
      "setup": "solve(l,r) 回傳 [l,r) 的 min,max。",
      "steps": [
        "若只剩一個元素，min=max=a[l]。",
        "切 m=(l+r)/2。",
        "遞迴得到左邊與右邊 pair。",
        "整體 min 是兩個 min 較小者，max 類似。"
      ],
      "takeaway": "這題直接掃 O(N) 更簡單，但它非常適合看清楚 divide/conquer/combine 的語意。"
    },
    "correctness": [
      "由歸納法，左右子區間的 min/max 正確；全區間元素完全分布在左右兩側，因此全域 min/max 必為兩側答案再取 min/max。"
    ],
    "checklist": [
      "子問題和原問題同型",
      "base case 完整",
      "combine 不漏跨區資訊",
      "遞迴深度與每層成本已分析"
    ]
  },
  "5-merge-inversion": {
    "prerequisites": [
      "Divide & Conquer",
      "Merge Sort"
    ],
    "objective": "利用已排序的子問題，在 merge 時線性統計跨半部資訊。",
    "sections": [
      {
        "title": "Inversion 分三類",
        "body": [
          "一對 (i,j) 若 i<j 且 a[i]>a[j]。它要嘛都在左半、都在右半、要嘛 i 在左 j 在右。前兩類遞迴處理，combine 只需算第三類。"
        ]
      },
      {
        "title": "排序讓跨半部一次算一批",
        "body": [
          "若 right[j] < left[i]，因左半已排序，所以 left[i],left[i+1]...全部都 > right[j]，可以一次加上剩餘左元素數量。"
        ]
      },
      {
        "title": "同時排序與計數",
        "body": [
          "merge 後必須輸出排序好的結果，供上層繼續使用。這就是子問題答案除了 count，還帶著『已排序』這個結構性保證。"
        ]
      }
    ],
    "worked": {
      "title": "[3,5] 與 [1,4]",
      "setup": "兩半都已排序。",
      "steps": [
        "比較 3 與 1：1 較小，所以和 3、5 都形成 inversion，一次 +2。",
        "再比較 3 與 4：3 較小，正常合併。",
        "比較 5 與 4：4 較小，+1。",
        "跨半部共 3 對。"
      ],
      "takeaway": "排序不是附帶效果，而是讓 combine 從 O(N²) 變 O(N) 的關鍵。"
    },
    "correctness": [
      "左右內部 inversion 由遞迴完整計數；merge 時每個跨半部 pair 恰在右元素第一次越過剩餘左元素時被計算一次，因此不重不漏。"
    ],
    "checklist": [
      "等號不算 inversion",
      "使用 long long 計數",
      "merge 後陣列確實有序",
      "跨半部增加量是剩餘左元素數"
    ]
  },
  "5-divide-patterns": {
    "prerequisites": [
      "基本分治",
      "會分析 cross-mid case"
    ],
    "objective": "看到新分治題時，能系統化拆成 left/right/cross 三類。",
    "sections": [
      {
        "title": "最大子陣列",
        "body": [
          "答案可能完全在左、完全在右、或跨中點。跨中點的最佳答案=左半最佳 suffix + 右半最佳 prefix，因此 combine O(N)。"
        ]
      },
      {
        "title": "Closest Pair",
        "body": [
          "左右各求最近距離 d；跨中線的答案只可能出現在距中線 <d 的 strip。再利用 y 排序與幾何 packing 性質，把候選比較壓到近線性。"
        ]
      },
      {
        "title": "分治不是萬能",
        "body": [
          "若子問題大量重疊，純分治會重算，應考慮 DP；若 combine 比原問題還慢，也失去分治意義。"
        ]
      }
    ],
    "worked": {
      "title": "最大子陣列 cross case",
      "setup": "中點 m，把陣列切左右。",
      "steps": [
        "從 m-1 向左掃，記最大 suffix sum。",
        "從 m 向右掃，記最大 prefix sum。",
        "兩者相加就是所有跨中點子陣列中的最佳值。",
        "和左右遞迴答案取 max。"
      ],
      "takeaway": "設計分治時，最值得花時間的是『跨兩邊的答案怎麼快算』。"
    },
    "correctness": [
      "任一最佳解只能屬於 left、right、cross 三類之一；三類都被完整求出，取最大即為整體最佳。"
    ],
    "checklist": [
      "分類互斥且完整",
      "cross case 有正確摘要資訊",
      "combine 足夠快",
      "不是重疊子問題造成重算"
    ]
  },
  "6-dp-mindset": {
    "prerequisites": [
      "遞迴",
      "複雜度分析"
    ],
    "objective": "建立真正可重複使用的 DP 解題流程：State → Transition → Base → Order → Answer。",
    "sections": [
      {
        "title": "DP 不是填表",
        "body": [
          "DP 的本質是相同子問題只算一次。最重要的一步是 state 定義，例如 `dp[i] = 走到第 i 階的最小成本`。這句話一旦模糊，公式再漂亮也沒有意義。",
          "建議每題在 code 前先寫五行：state 是什麼、base 是什麼、最後一步有哪些可能、計算順序、答案在哪。"
        ]
      },
      {
        "title": "Transition 從『最後一步』想",
        "body": [
          "問：要到目前 state，最後一個決策可能是什麼？例如到第 i 階只能從 i-1 或 i-2 來，就自然得到 min(dp[i-1],dp[i-2])。"
        ]
      },
      {
        "title": "Top-down 與 Bottom-up",
        "body": [
          "memoization 比較接近原遞迴定義；bottom-up 直接按相依順序填表。兩者 state/transition 是同一件事，只是執行順序不同。"
        ]
      }
    ],
    "worked": {
      "title": "樓梯最小成本",
      "setup": "每階有 cost[i]，每次走 1 或 2 階。",
      "steps": [
        "定義 dp[i]=到達 i 且支付 cost[i] 的最小總成本。",
        "最後一步來自 i-1 或 i-2。",
        "dp[i]=cost[i]+min(dp[i-1],dp[i-2])。",
        "只依賴前兩格，所以還能壓成 O(1) 空間。"
      ],
      "takeaway": "先有語意，再有公式；公式只是把『最後一步』翻譯成數學。"
    },
    "correctness": [
      "任一到 i 的合法路徑最後一步只可能來自 i-1 或 i-2；兩類都取各自最優，再取 min，因此涵蓋所有可能且不漏更佳解。"
    ],
    "checklist": [
      "state 一句話能說完",
      "transition 枚舉所有最後決策",
      "base 與 state 語意一致",
      "計算順序滿足 dependency"
    ]
  },
  "6-1d0d": {
    "prerequisites": [
      "DP 基本流程"
    ],
    "objective": "處理一維 state 且每個 state 只依賴固定少量前驅的 DP。",
    "sections": [
      {
        "title": "0D transition 是什麼",
        "body": [
          "這裡可以把它理解成每個 dp[i] 只看固定個數的其他 state，而不是再枚舉一個 j。典型成本 O(N)。"
        ]
      },
      {
        "title": "『前 i 個最佳』與『以 i 結尾』不同",
        "body": [
          "House Robber 類型常定義前 i 個最佳；LIS 的基礎 O(N²) 則常定義以 i 結尾。兩種語意會得到完全不同 transition，不能混。"
        ]
      },
      {
        "title": "空間壓縮",
        "body": [
          "如果 dp[i] 只依賴有限個前項，計算後很舊的 state 不再使用，就能用 rolling variables/array 壓空間。"
        ]
      }
    ],
    "worked": {
      "title": "不能取相鄰元素的最大和",
      "setup": "a=[4,7,2,9]。",
      "steps": [
        "定義 dp[i]=前 i 個元素可取得最大和。",
        "對第 i 個元素：不選→dp[i-1]；選→dp[i-2]+a[i-1]。",
        "取兩者 max。",
        "每步只依賴前兩個 state。"
      ],
      "takeaway": "『選 / 不選』不是遞迴專屬；DP 只是把重複子問題保存起來。"
    },
    "correctness": [
      "任一最優解對最後一個元素只有選或不選兩類；兩類的剩餘部分分別化成 dp[i-2] 與 dp[i-1]，因此 transition 完整。"
    ],
    "checklist": [
      "index 與『前幾個』定義一致",
      "初始 state 足夠",
      "負無限/0 的語意正確",
      "可否空間壓縮已判斷"
    ]
  },
  "6-2d0d": {
    "prerequisites": [
      "1D DP",
      "二維陣列"
    ],
    "objective": "把兩個位置/維度一起放進 state，並依 dependency 填表。",
    "sections": [
      {
        "title": "Grid DP",
        "body": [
          "若只能向右或向下走，dp[r][c] 可由上方與左方轉移。因為依賴方向天然形成拓樸順序，可以 row-major 填。"
        ]
      },
      {
        "title": "LCS",
        "body": [
          "dp[i][j] 表示 A 前 i 個字元與 B 前 j 個字元的 LCS 長度。最後字元相等時可同時取用；不等時至少有一個最後字元不在某個最佳解中，因此取上/左 max。"
        ]
      },
      {
        "title": "二維 state 先算大小",
        "body": [
          "N,M 各 5000 時 N×M=2500 萬，記憶體與時間都要小心；如果 transition 只用上一列，常能壓成 2 rows。"
        ]
      }
    ],
    "worked": {
      "title": "LCS of ABCA and ACA",
      "setup": "dp[i][j]=兩前綴 LCS。",
      "steps": [
        "初始化第 0 列/欄為 0。",
        "A[0]=A 與 B[0]=A 相等，所以 dp[1][1]=1。",
        "遇不同字元時取 dp[i-1][j]、dp[i][j-1] 最大。",
        "一路填到 dp[4][3]=3。"
      ],
      "takeaway": "二維 DP 的格子不是畫表方便而已，每一軸都必須有明確語意。"
    },
    "correctness": [
      "依最後字元分類：相等可把它加入某最佳解；不等時兩者不可能都必須被取，因此至少可刪一側最後字元，轉成上或左子問題。"
    ],
    "checklist": [
      "兩個維度各自代表什麼",
      "邊界列欄初始化",
      "填表順序滿足依賴",
      "記憶體是否需壓縮"
    ]
  },
  "6-1d1d": {
    "prerequisites": [
      "DP",
      "雙重迴圈"
    ],
    "objective": "掌握每個 dp[i] 枚舉前驅 j 的 O(N²) DP，並為之後最佳化打基礎。",
    "sections": [
      {
        "title": "j 是『上一個決策點』",
        "body": [
          "不要把內層迴圈當公式。每個 j 都應有語意，例如上一個被選位置、上一段結束點、最後切點。"
        ]
      },
      {
        "title": "先寫對，再優化",
        "body": [
          "很多進階最佳化（LIS 的 binary search、Convex Hull Trick、Deque optimization）都是從一個正確的 O(N²) transition 出發。沒有基礎式，最佳化容易變成背模板。"
        ]
      },
      {
        "title": "看 transition 結構",
        "body": [
          "若 transition 是 max(dp[j]) over 某個可排序條件，可能用資料結構；若 j 的最佳位置有單調性，可能用 deque/divide-and-conquer optimization。"
        ]
      }
    ],
    "worked": {
      "title": "O(N²) LIS",
      "setup": "dp[i]=以 a[i] 結尾的 LIS 長度。",
      "steps": [
        "dp[i] 至少為 1。",
        "枚舉 j<i。",
        "若 a[j]<a[i]，可以把 a[i] 接到以 j 結尾的序列，更新 dp[i]=max(dp[i],dp[j]+1)。",
        "答案是 max_i dp[i]，不是一定 dp[n-1]。"
      ],
      "takeaway": "state 語意決定答案位置；『以 i 結尾』和『前 i 個最佳』不同。"
    },
    "correctness": [
      "任何以 i 結尾且長度>1 的 LIS，都有某個倒數第二位置 j<i 且 a[j]<a[i]；枚舉所有 j 即枚舉所有可能最後轉移。"
    ],
    "checklist": [
      "j 的合法範圍正確",
      "base 值符合單元素解",
      "答案位置符合 state 定義",
      "優化前已有正確 O(N²) 版本"
    ]
  },
  "6-interval-advanced": {
    "prerequisites": [
      "1D/2D DP",
      "Bitmask 基礎"
    ],
    "objective": "理解『區間』與『集合』這兩種更大的 state 空間，以及它們的計算順序。",
    "sections": [
      {
        "title": "Interval DP",
        "body": [
          "dp[l][r] 表示某段區間的答案。因為長區間依賴短區間，所以外層常按 length 由小到大。transition 常枚舉切點 k。"
        ]
      },
      {
        "title": "Matrix Chain / Cutting",
        "body": [
          "『最後一次合併/切割在哪裡』是很典型的 interval transition。枚舉 k 後，把左右兩段答案加上這次合併成本。"
        ]
      },
      {
        "title": "Bitmask DP",
        "body": [
          "mask 直接表示一個集合。TSP 常用 dp[mask][last] 表示已走過 mask 中城市且最後在 last 的最小成本。state 數 O(2^N N)，很快就爆，所以 N 限制通常不大。"
        ]
      }
    ],
    "worked": {
      "title": "Matrix Chain",
      "setup": "矩陣 A1..An，找最佳括號化。",
      "steps": [
        "dp[l][r]=乘完 l..r 的最小 scalar multiplication。",
        "長度 1 成本 0。",
        "枚舉最後一次切點 k，把 [l,k]、[k+1,r] 各自先算好。",
        "加上最後兩結果矩陣相乘的成本。"
      ],
      "takeaway": "Interval DP 的核心是『最後一次把這段拆成哪兩段』。"
    },
    "correctness": [
      "任一完整括號化一定有唯一的最外層最後切點 k；枚舉所有 k 並使用左右子區間最優解，因此包含全域最優。"
    ],
    "checklist": [
      "state 數量可接受",
      "區間端點定義一致",
      "按 length 計算",
      "bitmask 的位元操作括號正確"
    ]
  },
  "7-graph-foundation": {
    "prerequisites": [
      "vector",
      "基本資料結構"
    ],
    "objective": "把圖建模成 state 與 transition，正確選 adjacency list / matrix 與輔助陣列。",
    "sections": [
      {
        "title": "Vertex 到底代表什麼",
        "body": [
          "在競賽中 vertex 不一定是實體城市，也可以是『位置+方向』、『數字狀態』、『棋盤格』。圖論其實是把所有合法狀態和一步轉移列出來。"
        ]
      },
      {
        "title": "Adjacency List",
        "body": [
          "稀疏圖最常用 `vector<vector<int>>` 或 pair 存 (to,weight)。空間 O(V+E)。無向邊通常要加兩次。"
        ]
      },
      {
        "title": "演算法狀態不要混進圖",
        "body": [
          "g 只描述固定邊；visited、dist、parent、color 等是某次搜尋狀態。分開後更容易重跑與 debug。"
        ]
      }
    ],
    "worked": {
      "title": "Grid 也可以是圖",
      "setup": "H×W 地圖四方向移動。",
      "steps": [
        "每個可走格子是一個 vertex。",
        "上下左右合法移動是一條 edge。",
        "若每步成本相同，可直接 BFS。",
        "不一定要真的建 adjacency list，也可在 BFS 中即時計算四鄰居。"
      ],
      "takeaway": "建圖是建模，不一定等於先產生一個巨大 edge 陣列。"
    },
    "correctness": [
      "只要 vertex 集合覆蓋所有合法狀態、edge 精確對應一步合法轉移，任何原問題路徑就與圖上的 path 一一對應。"
    ],
    "checklist": [
      "有向/無向分清楚",
      "權重語意正確",
      "vertex 編號不越界",
      "邊數/記憶體估過"
    ]
  },
  "7-bfs": {
    "prerequisites": [
      "Queue",
      "Graph representation"
    ],
    "objective": "用逐層擴張理解 BFS 為何能求無權最短路。",
    "sections": [
      {
        "title": "Queue 維持距離順序",
        "body": [
          "起點距離 0。當距離 d 的點被 pop 時，新發現鄰居距離 d+1，會被放到目前 queue 後面。因此不可能有更遠層跑到更近層前面。"
        ]
      },
      {
        "title": "第一次到達就是最短",
        "body": [
          "如果 v 第一次從 u 被發現，得到 dist[u]+1。任何更短路徑都應經過距離更小的前驅，而那些前驅理應更早被處理，矛盾。"
        ]
      },
      {
        "title": "Multi-source BFS",
        "body": [
          "若有多個起點，全部設 dist=0 同時入隊，就等價於增加一個 super source 以 0 成本連到它們，可求每點到最近來源距離。"
        ]
      }
    ],
    "worked": {
      "title": "迷宮最短步數",
      "setup": "每格移動上下左右成本 1。",
      "steps": [
        "起點 dist=0 入隊。",
        "pop 一格，所有未訪鄰居設 dist+1 並記 parent。",
        "目標第一次被發現時距離已最短。",
        "沿 parent 反向可重建路徑。"
      ],
      "takeaway": "visited 最好在入隊時標記，避免同一格被多個前驅重複塞入 queue。"
    },
    "correctness": [
      "由 queue 的非遞減距離 invariant，第一次到達 v 時，所有可能產生更短距離的節點都已處理，因此該距離最短。"
    ],
    "checklist": [
      "只用於等權/無權最短路",
      "入隊時標記",
      "dist 初值 -1/INF",
      "需要路徑就存 parent"
    ]
  },
  "7-dfs-dag": {
    "prerequisites": [
      "Recursion/Stack",
      "Graph foundation"
    ],
    "objective": "區分 DFS 的探索用途與 DAG 提供的依賴順序，並能做 topological sort / DAG DP。",
    "sections": [
      {
        "title": "DFS 看結構",
        "body": [
          "DFS 會沿一條路深入到底再回退，很適合 connected component、cycle detection、tree traversal、postorder。"
        ]
      },
      {
        "title": "Topological order",
        "body": [
          "DAG 可以把所有點排成一個順序，使每條 u→v 都是 u 在前、v 在後。這代表依賴能被線性化。"
        ]
      },
      {
        "title": "Kahn Algorithm",
        "body": [
          "先把 indegree=0 的點入 queue；每移除一點，就把出邊鄰居 indegree--。若最後無法取出所有 V 點，剩餘部分一定含 cycle。"
        ]
      }
    ],
    "worked": {
      "title": "DAG 最長路",
      "setup": "有向無環圖，每邊權重可為正。",
      "steps": [
        "先取得 topo order。",
        "dp[s]=0，其餘 -INF。",
        "依 topo order 掃 u，把 dp[u]+w 更新到每個 v。",
        "因所有前驅都在 u 之前，所以更新到 v 時不會漏掉更晚前驅。"
      ],
      "takeaway": "DAG 的強大之處不是 DFS 本身，而是『沒有環 → 有可計算的依賴順序』。"
    },
    "correctness": [
      "Topological order 保證每條 transition 都從已處理 state 指向未來 state，因此當走到 v 時，所有可能前驅都已完成更新。"
    ],
    "checklist": [
      "有向圖 cycle 判斷方式正確",
      "topological order 長度是否 V",
      "DAG DP 初值處理 unreachable",
      "DFS recursion depth 是否安全"
    ]
  },
  "7-dijkstra": {
    "prerequisites": [
      "Priority Queue",
      "Graph weighted edges"
    ],
    "objective": "理解 Dijkstra 的 greedy correctness 與 stale heap entry 技巧。",
    "sections": [
      {
        "title": "Relaxation",
        "body": [
          "已知 dist[u]，走一條邊 (u,v,w) 就產生候選 dist[u]+w。若比 dist[v] 小，就更新。"
        ]
      },
      {
        "title": "為什麼最小 dist 可以確定",
        "body": [
          "當所有邊權非負，heap 中最小候選 u 被取出後，任何還沒處理的路徑若繞過其他未確定點，只會再加非負成本，不可能回頭變得更小。"
        ]
      },
      {
        "title": "不用真的 decrease-key",
        "body": [
          "C++ priority_queue 不方便修改 heap 內舊 key。簡單做法是每次改善都 push 新 pair；pop 時若 d!=dist[u]，表示 stale，直接 continue。"
        ]
      }
    ],
    "worked": {
      "title": "三點圖",
      "setup": "s→A=5，s→B=2，B→A=1。",
      "steps": [
        "初始 push (0,s)。",
        "從 s relax 得 A=5,B=2。",
        "先 pop B=2，再 relax A 變 3，push (3,A)。",
        "之後 pop A=3 確定；舊的 (5,A) 到來時因 5!=dist[A] 被丟棄。"
      ],
      "takeaway": "Heap 可以有同一 vertex 多份候選，只要 stale check 正確即可。"
    },
    "correctness": [
      "取出最新最小距離 d 的 u。假設還有更短路徑，沿該路徑找第一個未確定點 x，其前驅已確定且會產生不大於該更短路徑的候選，應早於 u 被取出，矛盾。非負邊是關鍵。"
    ],
    "checklist": [
      "所有邊權非負",
      "min-heap 方向正確",
      "stale entry 有跳過",
      "dist 加法不 overflow"
    ]
  },
  "7-dsu-mst": {
    "prerequisites": [
      "Sorting",
      "Graph",
      "Greedy"
    ],
    "objective": "用 DSU 維護連通塊，並理解 Kruskal/Prim 的 MST greedy 結構。",
    "sections": [
      {
        "title": "DSU 解的是什麼",
        "body": [
          "支援 find(x)=x 屬於哪個 component、unite(a,b)=合併兩 component。Path compression + union by size/rank 後幾乎可視為常數攤銷。"
        ]
      },
      {
        "title": "Kruskal",
        "body": [
          "所有邊按權重由小到大；若 u,v 已連通，加入會成環，跳過；否則加入 MST 並 unite。"
        ]
      },
      {
        "title": "Prim vs Dijkstra",
        "body": [
          "兩者都可用 PQ，但 key 不同：Dijkstra 的 key 是從 source 的總路徑距離；Prim 的 key 是把某個新點接進目前 tree 的最便宜單邊。"
        ]
      }
    ],
    "worked": {
      "title": "Kruskal 選邊",
      "setup": "邊權依序 1:(A,B), 2:(B,C), 3:(A,C)。",
      "steps": [
        "選權 1，合併 A/B。",
        "選權 2，合併 AB 與 C。",
        "權 3 的 A,C 已在同 component，加入會成環，所以跳過。",
        "已選 V-1 邊，完成 MST。"
      ],
      "takeaway": "DSU 讓『加入這條邊會不會成環』變成兩次 find。"
    },
    "correctness": [
      "Cut property：對任意尚未連通的兩側，跨 cut 的最輕邊存在於某 MST。Kruskal 每次選當前可安全連接兩 component 的最輕邊，因此能維持某個 MST 與已選集合相容。"
    ],
    "checklist": [
      "DSU 初始化每點自成集合",
      "邊排序方向正確",
      "只選不同 component",
      "圖不連通時知道得到的是 minimum spanning forest"
    ]
  },
  "8-tree-traversal": {
    "prerequisites": [
      "DFS/BFS",
      "Graph"
    ],
    "objective": "把無根樹 root 起來，建立 parent/depth/subtree/tin-tout 等後續 Tree DP 基礎資訊。",
    "sections": [
      {
        "title": "Root 之後，無向邊有方向",
        "body": [
          "任選 root 後，每個非 root 點有唯一 parent，其餘相鄰點是 children。因樹沒有 cycle，DFS 時只要跳過 parent 就不會走回已訪點。"
        ]
      },
      {
        "title": "Subtree Size",
        "body": [
          "初始化 sz[u]=1；每個 child v DFS 完後做 sz[u]+=sz[v]。這是最基本的 bottom-up combine。"
        ]
      },
      {
        "title": "Euler Tour Flattening",
        "body": [
          "進 u 時記 tin[u]，完整處理 subtree 後記 tout[u]。若只在第一次進點時把 u 放入陣列，u 的整個 subtree 會對應一段連續區間，可和 BIT/Segment Tree 結合。"
        ]
      }
    ],
    "worked": {
      "title": "求 depth 與 subtree size",
      "setup": "以 1 為 root。",
      "steps": [
        "depth[1]=0。",
        "DFS 到 child v 時 depth[v]=depth[u]+1。",
        "v 的所有 child 完成後得到 sz[v]。",
        "回到 u 累加 sz[v]。"
      ],
      "takeaway": "同一次 DFS 可以同時產生 top-down 資訊（depth）與 bottom-up 資訊（subtree size）。"
    },
    "correctness": [
      "樹上任兩點只有唯一簡單路徑，因此 root 後每個非 root 節點的 parent 唯一；DFS 遍歷每條 parent-child edge 一次即可完整覆蓋。"
    ],
    "checklist": [
      "跳過 parent",
      "root 特例處理",
      "recursion depth 可能需 iterative",
      "tin/tout 定義統一"
    ]
  },
  "8-bottom-up-dp": {
    "prerequisites": [
      "Tree traversal",
      "DP"
    ],
    "objective": "把 children 的答案合併成 parent，掌握 Tree DP 最核心的 postorder 模式。",
    "sections": [
      {
        "title": "先定義『以 u 為根的子樹』",
        "body": [
          "Tree DP state 幾乎都和 subtree 綁定，例如 dp[u][0/1] 表示 u 不選/選時，u subtree 的最佳值。"
        ]
      },
      {
        "title": "Child 獨立性",
        "body": [
          "切掉 u 與 parent 的邊後，不同 child subtree 彼此沒有邊，很多問題因此可以把 child 貢獻相加或做小型 knapsack merge。"
        ]
      },
      {
        "title": "Postorder",
        "body": [
          "必須先算完所有 child，才有資料完成 u，所以自然是 DFS 回程時 transition。"
        ]
      }
    ],
    "worked": {
      "title": "Tree Maximum Independent Set",
      "setup": "選最多點，任兩相鄰點不能同時選。",
      "steps": [
        "dp[u][1]=選 u，初始 1；那每個 child v 必須不選，所以加 dp[v][0]。",
        "dp[u][0]=不選 u；child 可選可不選，所以加 max(dp[v][0],dp[v][1])。",
        "所有 child 合併後完成 u。",
        "答案 max(dp[root][0],dp[root][1])。"
      ],
      "takeaway": "Tree DP 的 transition 通常就是把 parent state 對 child 可用 state 的限制寫清楚。"
    },
    "correctness": [
      "固定 u 是否選後，各 child subtree 的限制彼此獨立；每個 child 都取在該限制下的最佳值，相加即得到 u subtree 最佳。"
    ],
    "checklist": [
      "state 包含 parent-child 必要條件",
      "child 先算完",
      "合併是否獨立可相加",
      "root 最終答案取哪些 state"
    ]
  },
  "8-reroot-relations": {
    "prerequisites": [
      "Tree DP",
      "Subtree size"
    ],
    "objective": "在 O(N) 或 O(N log N) 內得到『每個點當 root』的答案，而不是重跑 N 次 DFS。",
    "sections": [
      {
        "title": "換 root 時，其實只跨一條邊",
        "body": [
          "從 u 換到相鄰 child v，v subtree 內所有點距離減 1，其餘 N-sz[v] 個點距離加 1。很多 reroot 公式就來自這個局部差異。"
        ]
      },
      {
        "title": "Two-pass DP",
        "body": [
          "第一遍 DFS 算 down/subtree 資訊與某個 root 的完整答案；第二遍沿邊把 parent 的完整答案推給 child。"
        ]
      },
      {
        "title": "LCA 與 Tree Relations",
        "body": [
          "若重點是任兩點距離，常用 depth + LCA：dist(u,v)=depth[u]+depth[v]-2depth[lca]。LCA 可用 binary lifting O(log N) 查詢。"
        ]
      }
    ],
    "worked": {
      "title": "所有點距離總和",
      "setup": "已知 root=1 的 ans[1] 與每個 sz[v]。",
      "steps": [
        "考慮把 root 從 u 移到 child v。",
        "v subtree 的 sz[v] 個點距離全部 -1。",
        "其他 N-sz[v] 個點距離全部 +1。",
        "所以 ans[v]=ans[u]-sz[v]+(N-sz[v]) = ans[u]+N-2sz[v]。"
      ],
      "takeaway": "Rerooting 的公式通常不是背出來，而是精確數『哪些點變近、哪些點變遠』。"
    },
    "correctness": [
      "換根只改變每個點相對 u-v 邊的距離方向；對 v subtree 與其補集分別統計距離變化，兩類完整且互斥，因此公式正確。"
    ],
    "checklist": [
      "第一遍 subtree 資訊正確",
      "parent→child 轉移有局部推導",
      "不重複重算整棵樹",
      "距離/LCA 型別與倍增層數足夠"
    ]
  }
};
