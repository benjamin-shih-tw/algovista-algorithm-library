export const guideB = {
  "3-linear-structures": {
    "sections": [
      {
        "title": "資料結構是在保證『誰先被取出』",
        "body": [
          "queue、stack、deque 的差別不是函式名稱，而是它們承諾的處理順序。Queue 是 FIFO，最早加入的最先處理；Stack 是 LIFO，最近加入的最先處理；Deque 則允許你在兩端都 O(1) 操作。",
          "當題目描述『逐層擴張』、『最近尚未完成』、『左右兩端候選』時，其實已經在暗示容器。"
        ]
      },
      {
        "title": "Queue",
        "body": [
          "queue 適合事件按照到達順序處理，例如 BFS。你通常只需要 push、front、pop。因為不能隨機存取，所以它強迫你維持 FIFO 的語意。"
        ]
      },
      {
        "title": "Stack 與 Deque",
        "body": [
          "stack 適合巢狀結構與回溯上下文；deque 則常用在 sliding window、0-1 BFS、單調佇列。選資料結構前先問：我需要從哪一端丟掉舊資料？"
        ]
      }
    ],
    "example": {
      "title": "例：客服排隊 vs 瀏覽器返回",
      "steps": [
        "客服排隊：先來先處理 → queue。",
        "瀏覽器返回：最後打開的頁面先返回 → stack。",
        "滑動視窗候選：前端會過期、尾端會被新元素支配 → deque。"
      ],
      "result": "選資料結構的依據是操作語意，不是『哪個比較強』。"
    },
    "checkpoint": [
      "能從題意辨識 FIFO/LIFO/雙端需求。",
      "知道空容器不能直接 front/top。",
      "能說明 deque 為何能支援單調佇列。"
    ]
  },
  "3-expression-stack": {
    "sections": [
      {
        "title": "巢狀結構天然適合 stack",
        "body": [
          "括號、函式呼叫、運算式都有一個共同特徵：最後開啟、尚未完成的東西，必須最先完成。這正是 LIFO。",
          "因此遇到右括號時，只需要檢查 stack top 是否是對應左括號。"
        ]
      },
      {
        "title": "運算子優先序",
        "body": [
          "若要解析 `3+4*5`，不能單純從左到右算。常見做法是用一個數值 stack 與一個 operator stack；新運算子進來時，先把優先序不低於它的舊運算子處理掉。",
          "若運算子是右結合，例如某些次方定義，pop 條件還要特別調整。"
        ]
      },
      {
        "title": "中序轉後序",
        "body": [
          "Shunting-yard 的精神是：數字直接輸出；運算子暫存在 stack，等優先序允許時再輸出。轉成 postfix 後，求值就只需要單一 stack。"
        ]
      }
    ],
    "example": {
      "title": "例：2 + 3 * 4",
      "steps": [
        "讀到 2，輸出。",
        "+ 進 operator stack。",
        "讀到 3，輸出。",
        "* 優先序高於 +，先進 stack。",
        "讀到 4，輸出。",
        "結尾依序 pop *、+，得到 2 3 4 * +。"
      ],
      "result": "Postfix 直接反映真正計算順序。"
    },
    "checkpoint": [
      "能正確檢查括號。",
      "知道 precedence 與 associativity 的差別。",
      "會用 stack 求 postfix。"
    ]
  },
  "3-monotonic-stack": {
    "sections": [
      {
        "title": "什麼叫『被支配』",
        "body": [
          "假設要找每個位置右邊第一個更大的值。當新值 a[i] 大於 stack top 對應值時，top 已經找到答案，而且之後更右邊的元素不可能成為『第一個』，所以 top 可以永久 pop。",
          "剩在 stack 裡的 index 代表『答案還沒出現』的候選。"
        ]
      },
      {
        "title": "為什麼是 O(N)",
        "body": [
          "雖然程式有 while，但每個 index 一生只 push 一次、pop 一次，所以所有 while 的總執行次數不超過 O(N)。這是典型 amortized analysis。"
        ]
      },
      {
        "title": "相等值要先定義",
        "body": [
          "找『更大』與『大於等於』的 pop 條件不同。`<`、`<=` 一個符號就會改變 duplicate case，所以寫之前先把題意轉成嚴格/非嚴格關係。"
        ]
      }
    ],
    "example": {
      "title": "例：[2,1,4,3]",
      "steps": [
        "i=0：stack=[2]。",
        "i=1：1 不比 2 大，push。",
        "i=2：4 先解答 1，再解答 2，兩者都 pop。",
        "i=3：3 留待未來。"
      ],
      "result": "每個元素的 next greater 只在它被 pop 的那一刻確定。"
    },
    "checkpoint": [
      "知道 stack 通常應存 index。",
      "能用攤銷分析證明 O(N)。",
      "能根據題意決定 < 或 <=。"
    ]
  },
  "3-sliding-window": {
    "sections": [
      {
        "title": "窗口為什麼能只往右",
        "body": [
          "Sliding window 的前提是合法性具有某種單調性。當 r 增加造成條件失效，只需要把 l 往右移來修復，而 l 不需要回頭。",
          "因此兩個指標都最多走 N 步，整體常是 O(N)。"
        ]
      },
      {
        "title": "固定長度與可變長度",
        "body": [
          "固定長度 K 很直接：加入新元素後刪掉 i-K 的舊元素。可變長度則要有 `while(!valid())`，持續縮左端直到恢復合法。",
          "窗口內資訊應該增量維護，例如 sum、freq、distinct count，而不是每次重新掃整段。"
        ]
      },
      {
        "title": "不是所有區間題都能 sliding window",
        "body": [
          "如果加入一個元素後，合法/不合法的關係沒有單調方向，移動 left 可能讓未來答案需要回頭，這時 sliding window 就不安全。負數和問題常是典型警訊。"
        ]
      }
    ],
    "example": {
      "title": "例：最長至多 K 種顏色",
      "steps": [
        "r 每次加入一個顏色並增加 freq。",
        "若 distinct>K，就移動 l 並減少 freq。",
        "某顏色 freq 變 0 時 distinct--。",
        "每次合法時更新 r-l+1。"
      ],
      "result": "每個元素進出窗口各一次。"
    },
    "checkpoint": [
      "會寫 add/remove 狀態。",
      "知道可變窗口需要單調條件。",
      "能區分固定長度與最長合法區間。"
    ]
  },
  "3-monotonic-queue": {
    "sections": [
      {
        "title": "同時處理『過期』與『支配』",
        "body": [
          "固定窗口最大值若每次重新掃 K 個元素要 O(NK)。Deque 可以把永遠不可能再成為最大值的元素從尾端刪掉，把滑出窗口的元素從前端刪掉。",
          "所以 deque 中只保留仍可能成為答案的 index。"
        ]
      },
      {
        "title": "兩個不變量",
        "body": [
          "第一，index 由前到後遞增，因此 front 最舊。第二，對應值由前到後單調遞減，因此 front 最大。",
          "新元素先從尾端淘汰較小值，再加入自己；窗口移動後再清掉過期 front。"
        ]
      },
      {
        "title": "順序為什麼重要",
        "body": [
          "若題目是當前窗口答案，加入新元素、移除過期元素、讀 front 的順序必須與窗口定義一致。最安全做法是明確寫出目前窗口 [i-K+1,i]。"
        ]
      }
    ],
    "example": {
      "title": "例：K=3, a=[1,3,-1,-3,5]",
      "steps": [
        "1 入 deque。",
        "3 來時 1 被支配，pop back。",
        "-1 加到尾端，窗口 [1,3,-1] 最大為 front=3。",
        "5 來時把 -3、-1、3 依序淘汰，front=5。"
      ],
      "result": "每個 index 最多進出一次，O(N)。"
    },
    "checkpoint": [
      "能寫 max-window 模板。",
      "知道為何只存 value 不夠。",
      "會說出 index 與 value 兩個不變量。"
    ]
  },
  "4-greedy-basics": {
    "sections": [
      {
        "title": "Greedy 不是『現在最好就選』",
        "body": [
          "真正的 Greedy 必須證明：存在一個最優解，其下一步可以改成你選的局部決策而不變差。這通常用 exchange argument 或 staying-ahead。",
          "所以解 Greedy 題時，code 往往很短，難的是找排序規則與證明。"
        ]
      },
      {
        "title": "Exchange argument",
        "body": [
          "假設某最優解第一步不是你的選擇 G，而是 O。若能把 O 換成 G，並證明剩下部分仍可行、總答案不變差，就能說 G 是 safe choice。接著問題縮成同類子問題。"
        ]
      },
      {
        "title": "怎麼辨識 Greedy",
        "body": [
          "常見訊號包括：排序後依序決定、每一步只保留目前最好候選、區間排程、最小成本合併。但任何看起來合理的規則都要主動找反例。"
        ]
      }
    ],
    "example": {
      "title": "例：最多不重疊活動",
      "steps": [
        "猜：每次選最早結束的活動。",
        "比較任意最優解第一個活動 O。",
        "因為 G 結束不晚於 O，把 O 換成 G 不會減少後續可用時間。",
        "因此存在一個最優解以 G 開頭。"
      ],
      "result": "最早結束是一個可證明的 safe choice。"
    },
    "checkpoint": [
      "會用一句話描述 exchange argument。",
      "知道 sample 通過不等於 greedy 正確。",
      "會主動找反例測排序規則。"
    ]
  },
  "4-scheduling": {
    "sections": [
      {
        "title": "排序 key 往往來自『交換相鄰兩項』",
        "body": [
          "若總成本與工作順序有關，可以假設只有 A、B 相鄰，分別計算 AB 與 BA 的成本。把兩者比較後整理不等式，就能得到 A 應排在 B 前的條件。",
          "這比憑直覺猜 duration、deadline、value 更可靠。"
        ]
      },
      {
        "title": "Activity selection",
        "body": [
          "若目標是選最多不重疊區間，排序依據是結束時間，而不是開始時間或區間長度。每次選最早結束且與上個已選區間不衝突的活動。"
        ]
      },
      {
        "title": "Tie-break 不要亂加",
        "body": [
          "如果證明只要求某 primary key，額外 tie-break 通常不影響正確性，但也不要加入會改變語意的條件。若 tie 本身影響答案，證明必須包含它。"
        ]
      }
    ],
    "example": {
      "title": "例：活動 [1,4],[2,3],[3,5]",
      "steps": [
        "依結束時間排序：[2,3],[1,4],[3,5]。",
        "選 [2,3]。",
        "[1,4] 衝突跳過。",
        "[3,5] 若端點允許銜接則選。"
      ],
      "result": "得到最多活動數。"
    },
    "checkpoint": [
      "會從相鄰交換推 comparator。",
      "會證明 earliest finish。",
      "知道 tie-break 需要與題意一致。"
    ]
  },
  "4-priority-queue": {
    "sections": [
      {
        "title": "Heap 適合『候選動態加入，只要最好的那個』",
        "body": [
          "若所有資料一開始就知道，排序一次可能足夠；若候選會隨時間加入，而每一步都要取當前最小/最大，priority_queue 就很自然。",
          "它不支援任意位置快速刪除，因此常搭配 lazy deletion。"
        ]
      },
      {
        "title": "Min-heap 與 Max-heap",
        "body": [
          "C++ `priority_queue<T>` 預設最大值在 top。要 min-heap 通常使用 `greater<T>`。pair 會先比 first，再比 second，因此要先確定你的 key 放在哪裡。"
        ]
      },
      {
        "title": "Lazy deletion",
        "body": [
          "若某候選已經失效，不必當下從 heap 中找它。等它浮到 top 時再檢查 validity 並 pop。只要每個元素最多被丟一次，總複雜度仍可控。"
        ]
      }
    ],
    "example": {
      "title": "例：掃描線上的最便宜可用任務",
      "steps": [
        "事件走到 x 時，把開始時間≤x 的任務加入 min-heap。",
        "反覆移除 deadline<x 的過期任務。",
        "heap top 就是目前合法候選中成本最小者。"
      ],
      "result": "排序事件 + heap，常見 O(N log N)。"
    },
    "checkpoint": [
      "能正確建立 min-heap。",
      "理解 lazy deletion。",
      "知道何時排序一次比 heap 更簡單。"
    ]
  },
  "4-binary-answer": {
    "sections": [
      {
        "title": "把最佳化問題改成 Yes/No",
        "body": [
          "若題目問『最小的 X 使某條件可行』，先寫 `check(X)`。只要 X 越大越容易（或越難），true/false 就形成單調邊界，可以二分。",
          "這個方法的難點通常不在 binary search，而在設計一個夠快、真的單調的 check。"
        ]
      },
      {
        "title": "First true / Last true",
        "body": [
          "若 false,false,true,true，要找最小可行值，就是 first true；若 true,true,false,false，要找最大可行值，就是 last true。先在紙上畫出布林序列，再選模板。"
        ]
      },
      {
        "title": "上界怎麼找",
        "body": [
          "可以從題目限制推安全上界，也可以 exponential search：先 1、2、4、8…擴張到 check 變 true，再在區間內二分。"
        ]
      }
    ],
    "example": {
      "title": "例：最小容量能在 D 天搬完貨物",
      "steps": [
        "check(C)：模擬每天依序裝貨，超過 C 就開新一天。",
        "C 越大，需要天數不會增加，因此單調。",
        "找第一個 check(C)=true。"
      ],
      "result": "最佳化被轉成 O(log range) 次線性 check。"
    },
    "checkpoint": [
      "能把 optimization 改寫成 predicate。",
      "會證明 check 單調。",
      "分得清 first true 與 last true。"
    ]
  },
  "4-sweep-line": {
    "sections": [
      {
        "title": "把幾何/區間問題變成事件流",
        "body": [
          "Sweep line 的核心是把物件轉成『開始、結束、查詢』事件，依座標排序。掃到位置 x 時，只維護目前 active 的物件。",
          "這等於把原本同時考慮所有區間的問題，改成時間線上的局部更新。"
        ]
      },
      {
        "title": "Tie-break 是演算法的一部分",
        "body": [
          "若區間是閉區間 [l,r]，同一座標上的 add、query、remove 順序會影響端點是否被算入。不要等 WA 才補 tie-break，應先由數學定義決定。"
        ]
      },
      {
        "title": "Active set 放什麼",
        "body": [
          "簡單的 union length 只需記目前覆蓋數量；最近點對可能要依 y 維護 set；動態候選可能用 heap。Sweep line 只是外框，active structure 才決定可支援的查詢。"
        ]
      }
    ],
    "example": {
      "title": "例：線段聯集長度",
      "steps": [
        "每段 [l,r] 轉成 (l,+1),(r,-1)。",
        "事件依 x 排序。",
        "若前一位置到目前位置之間 active>0，就累加距離。",
        "再更新 active count。"
      ],
      "result": "排序 O(N log N)，掃描 O(N)。"
    },
    "checkpoint": [
      "會把區間轉事件。",
      "會依開閉區間決定 tie-break。",
      "知道 active structure 要依問題選。"
    ]
  },
  "5-divide-basics": {
    "sections": [
      {
        "title": "Divide & Conquer 的三步",
        "body": [
          "先 divide：把大問題切成較小、通常相似的子問題；再 conquer：遞迴解子問題；最後 combine：把子答案合成原問題答案。",
          "真正值得分析的是 combine 成本。如果每層總共 O(N)，樹高 O(log N)，總成本就是 O(N log N)。"
        ]
      },
      {
        "title": "何時不適合純分治",
        "body": [
          "若子問題大量重疊，純遞迴會重算，這時更像 DP。若切開後 combine 仍需 O(N^2)，分治也未必帶來改善。"
        ]
      },
      {
        "title": "Recurrence",
        "body": [
          "常見形式 T(N)=2T(N/2)+O(N)。不用急著背 Master theorem，先畫 recursion tree：每層總工作量多少、有幾層。"
        ]
      }
    ],
    "example": {
      "title": "例：找最大最小值",
      "steps": [
        "把陣列切兩半。",
        "各自求 min/max。",
        "combine 時比較兩個 min 與兩個 max。",
        "遞迴直到單元素。"
      ],
      "result": "展示 divide/conquer/combine 的基本骨架。"
    },
    "checkpoint": [
      "能畫 recursion tree。",
      "會區分重疊子問題與獨立子問題。",
      "能估每層工作量。"
    ]
  },
  "5-merge-inversion": {
    "sections": [
      {
        "title": "Merge sort 為何是 O(N log N)",
        "body": [
          "每次切半產生 O(log N) 層；每一層所有 merge 的元素總數仍是 N，所以每層 O(N)。",
          "Merge 的關鍵是左右半部都已排序，因此只需要兩個指標線性合併。"
        ]
      },
      {
        "title": "逆序對如何藏在 merge 裡",
        "body": [
          "若 left[i] > right[j]，因為左半已排序，所以 left[i],left[i+1],... 全都 > right[j]。因此一次可以增加『左半剩餘元素數量』個 inversion。",
          "這正是從 O(N^2) 枚舉 pair 降成 O(N log N) 的地方。"
        ]
      },
      {
        "title": "相等值",
        "body": [
          "逆序通常定義為 i<j 且 a[i]>a[j]，相等不算。因此 merge 比較時通常 `<=` 讓左側先取，避免把相等誤算成 inversion。"
        ]
      }
    ],
    "example": {
      "title": "例：[3,5] 與 [1,4]",
      "steps": [
        "比較 3 vs 1：1 較小，因此 1 與 3、5 都形成 inversion，加 2。",
        "比較 3 vs 4：取 3。",
        "比較 5 vs 4：加 1。"
      ],
      "result": "跨半部 inversion 共 3。"
    },
    "checkpoint": [
      "會手寫 merge。",
      "能解釋為何一次加 m-i。",
      "知道相等值是否計入 inversion。"
    ]
  },
  "5-divide-patterns": {
    "sections": [
      {
        "title": "答案通常分成三類",
        "body": [
          "很多分治題可以把答案分成：完全在左半、完全在右半、跨越中線。前兩類交給遞迴，真正需要設計的是 cross case。",
          "如果 cross case 能 O(N) 或 O(N log N) 完成，整體常能維持 O(N log N)。"
        ]
      },
      {
        "title": "最大子陣列的 cross case",
        "body": [
          "跨中線的最大子陣列一定等於『左半最佳 suffix + 右半最佳 prefix』。因此只需各掃一次，不必枚舉所有跨中線區間。"
        ]
      },
      {
        "title": "Closest pair 的 cross case",
        "body": [
          "左右各自已得到距離 d，因此跨中線只需看 x 距離中線 < d 的 strip。再利用幾何 packing 性質，依 y 排序後每點只需比較常數個附近候選。"
        ]
      }
    ],
    "example": {
      "title": "例：最大子陣列 D&C",
      "steps": [
        "遞迴算左答案。",
        "遞迴算右答案。",
        "從 mid-1 往左找最大 suffix。",
        "從 mid 往右找最大 prefix。",
        "三者取 max。"
      ],
      "result": "cross case 被壓成 O(N)。"
    },
    "checkpoint": [
      "會把答案拆 left/right/cross。",
      "知道 combine 不應重新做整個問題。",
      "能比較同一題的 D&C 與線性解法。"
    ]
  }
};
