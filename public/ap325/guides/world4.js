export const world4Guides = {
  "4-greedy-basics": {
    "title": "Greedy：不是『看起來最划算』，而是能證明的局部選擇",
    "source": "AP325 4.1 與 P-4-1、P-4-12，教材頁 108–112、132",
    "intro": "貪心演算法的 code 往往短，真正的難度在證明。每一步選當下最有利者，只有在你能證明這個選擇不會封死某個更好的未來時才成立。最常用的證明工具是交換論證與 staying-ahead。",
    "objectives": [
      "能分辨『猜 greedy』與『有 safe choice 的 greedy』",
      "會用 exchange argument 驗證排序規則",
      "能把一次買賣等一維題寫成 prefix-best greedy"
    ],
    "focus": {
      "code": "P-4-1",
      "prompt": "先別問『我要排序什麼』。先問：每次決策之後，剩下的問題是否還是同一類型？如果是，才有 greedy-choice property 的可能。",
      "questions": [
        "局部選擇改掉後，剩餘子問題是否獨立？",
        "能否把任一最優解的第一步換成你的選擇而不變差？",
        "若不能證明，有沒有 3～5 個元素的小反例？"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "proof-first",
        "title": "Greedy 的三個層次",
        "paragraphs": [
          "第一層是觀察：某個規則看起來合理。第二層是反例搜尋：用小資料故意打它。第三層才是證明：對任一最優解，若它沒有採用你的局部選擇，能不能交換成你的選擇而不變差？",
          "競賽時不一定要把證明寫出來，但你至少要在腦中完成這三層，否則 greedy 很容易只是『sample 剛好過』。"
        ]
      },
      {
        "type": "steps",
        "id": "exchange",
        "title": "Exchange argument 模板",
        "steps": [
          {
            "title": "假設有一個 optimal solution",
            "body": "不要假設它和你的 greedy 一樣。"
          },
          {
            "title": "找到第一個不同的地方",
            "body": "比較 optimal 與 greedy 的局部選擇。"
          },
          {
            "title": "交換",
            "body": "把 optimal 的那個局部選擇換成 greedy choice，證明可行性不壞、objective 不變差。"
          },
          {
            "title": "重複",
            "body": "把 optimal 逐步變成 greedy solution，因此 greedy 也是 optimal。"
          }
        ]
      },
      {
        "type": "example",
        "id": "stock-one",
        "title": "P-4-12：一次買賣其實是『維護到目前為止最便宜』",
        "problem": "每天只有一個價格，只允許先買後賣一次，求最大利潤。",
        "steps": [
          "掃到第 i 天時，若今天賣出，最好的買入日一定是前 i-1 天最低價。",
          "因此只需要維護 minPrice。",
          "今天利潤 candidate = price[i]-minPrice。",
          "更新答案後，再把 minPrice=min(minPrice,price[i])。"
        ],
        "conclusion": "Greedy state 不是『今天一定買 / 賣』，而是維護未來決策所需的最佳 prefix summary。"
      },
      {
        "type": "code",
        "id": "stock-code",
        "title": "一次買賣 O(N)",
        "code": "long long mn = a[0];\nlong long best = 0;\nfor(int i=1;i<n;i++){\n    best = max(best, a[i]-mn);\n    mn = min(mn, a[i]);\n}",
        "notes": [
          "先用目前 mn 計算再更新 mn，語意是『買入必須發生在今天之前』；若同日買賣允許，best=0 本來就涵蓋。",
          "這種 prefix-best 思維會在 DP/scan 題反覆出現。"
        ]
      },
      {
        "type": "callout",
        "id": "greedy-warning",
        "title": "Greedy 失敗的訊號",
        "body": "如果今天的選擇會改變未來可選項的價值，而且沒有簡單交換論證，常需要 DP。不要因為 code 可以寫成 sort + for 就自動叫它 greedy。",
        "tone": "warning"
      }
    ],
    "practice": [
      {
        "code": "P-4-1",
        "level": "focus",
        "why": "先練 greedy choice 與局部決策。"
      },
      {
        "code": "P-4-12",
        "level": "core",
        "why": "把 greedy 寫成 prefix summary，而不是排序題。"
      }
    ],
    "checkpoints": [
      {
        "q": "Greedy correctness 最核心要證明什麼？",
        "a": "每一步局部選擇是 safe 的：存在某個全域最優解可以採用它，因此做完後仍不失去最優解。"
      },
      {
        "q": "交換論證為什麼有用？",
        "a": "它把『我的局部選擇看起來好』提升成『任何最優解都可被轉成採用我的選擇且不變差』。"
      }
    ],
    "mastery": [
      "會主動找 greedy 反例",
      "能講出一個 exchange argument",
      "能分辨 prefix-best greedy 與真正需要 DP 的情況"
    ]
  },
  "4-scheduling": {
    "title": "排序式 Greedy：從相鄰交換推導排序 key",
    "source": "AP325 4.2.1–4.2.2，教材頁 113–121、140",
    "intro": "排程題最常見的誤區，是憑直覺選 sorting key。真正穩的方法是只看兩個相鄰工作 A、B，比較 AB 與 BA 的 objective，整理不等式後直接得到 comparator。",
    "objectives": [
      "會 activity selection 最早結束優先",
      "會用 pairwise swap 推 shortest-job / weighted order",
      "能寫不 overflow 的 comparator"
    ],
    "focus": {
      "code": "P-4-4",
      "prompt": "若想參加最多場不重疊活動，為什麼不是『最早開始』或『長度最短』？試著把第一場換成結束最早的活動。",
      "questions": [
        "最早結束會為未來留下什麼？",
        "如果某 optimal 第一場不是最早結束，可否交換？",
        "端點相接算不算衝突要由題意決定。"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "activity-proof",
        "title": "Activity Selection：最早結束是 safe choice",
        "paragraphs": [
          "設 g 是所有活動中結束最早者。取任一最優排程 O，其第一個活動 o 的結束時間不會早於 g。把 o 換成 g，不會讓後面原本可接的活動失效，因為 g 只會更早釋放時間。",
          "因此至少存在一個 optimal 以 g 開頭。選完 g 後，剩下只看 start≥end(g) 的活動，形成同型子問題。這就同時得到 greedy choice property 與 optimal substructure。"
        ]
      },
      {
        "type": "code",
        "id": "activity-code",
        "title": "Activity selection implementation",
        "code": "sort(seg.begin(),seg.end(),[](auto A,auto B){\n    if(A.r!=B.r) return A.r<B.r;\n    return A.l<B.l;\n});\n\nint ans=0;\nlong long lastEnd = LLONG_MIN;\nfor(auto s:seg){\n    if(s.l >= lastEnd){\n        ++ans;\n        lastEnd=s.r;\n    }\n}",
        "notes": [
          "是否用 >= 或 > 取決於端點能否相接。",
          "真正決定正確性的是 r 遞增；tie-break 通常不影響 count，但仍應固定。"
        ]
      },
      {
        "type": "steps",
        "id": "pairwise-swap",
        "title": "兩工作交換法：自己推排序規則",
        "steps": [
          {
            "title": "只看相鄰 A,B",
            "body": "前面累積時間 T 固定，後面工作受 AB/BA 的總長度相同，因此常可消掉。"
          },
          {
            "title": "算 AB 的局部成本",
            "body": "例如 weighted completion time：wA(T+tA)+wB(T+tA+tB)。"
          },
          {
            "title": "算 BA 的局部成本",
            "body": "wB(T+tB)+wA(T+tB+tA)。"
          },
          {
            "title": "比較",
            "body": "消去共同項後得到 tA·wB ≤ tB·wA，亦即 A 應排前若 tA/wA ≤ tB/wB。"
          }
        ]
      },
      {
        "type": "example",
        "id": "weighted-order",
        "title": "P-4-5：不要真的用浮點比 t/w",
        "problem": "兩工作 A=(t=3,w=2)，B=(t=5,w=10)。",
        "steps": [
          "比較 3/2 與 5/10，B 應較前。",
          "程式不要算 double ratio；比較 tA*wB 與 tB*wA。",
          "3*10=30，5*2=10，所以 A 不應排在 B 前。",
          "用 long long / __int128 避免乘法 overflow。"
        ],
        "conclusion": "用 cross multiplication 同時避免浮點誤差，也直接保留交換論證的不等式形式。"
      },
      {
        "type": "text",
        "id": "deadline",
        "title": "Deadline 類題：先問 objective 再選 key",
        "paragraphs": [
          "Q-4-16、Q-4-17 類題常混合 deadline、profit、penalty。不要看到 deadline 就一律 sort deadline；要先寫 objective 與可行條件，再判斷是 EDF、heap、DSU slot 或 DP。",
          "同一個 scheduling 外觀可能對應完全不同演算法，sorting key 必須從證明來。"
        ]
      }
    ],
    "practice": [
      {
        "code": "P-4-3",
        "level": "core",
        "why": "Shortest-job first 的相鄰交換入門。"
      },
      {
        "code": "P-4-4",
        "level": "focus",
        "why": "Activity selection 是 greedy correctness 的經典模型。"
      },
      {
        "code": "P-4-5",
        "level": "core",
        "why": "用交換式推 weighted comparator。"
      },
      {
        "code": "Q-4-6",
        "level": "core",
        "why": "排序 key 放進 APCS 實際題型。"
      },
      {
        "code": "Q-4-16",
        "level": "challenge",
        "why": "objective 與 deadline 混合，不能只背一種排序。"
      },
      {
        "code": "Q-4-17",
        "level": "challenge",
        "why": "再做一題 deadline 變形檢查是否真的懂。"
      }
    ],
    "checkpoints": [
      {
        "q": "Activity selection 為什麼最早結束，不是最短活動？",
        "a": "最早結束能保證不比任何 optimal 第一場晚釋放時間，因此可交換；最短活動可能開始很晚，反而擋掉前面可排的活動。"
      },
      {
        "q": "比較 tA/wA 與 tB/wB 為什麼應用交叉相乘？",
        "a": "避免浮點誤差，且比較式本來就是由交換論證得到的 tA*wB ≤ tB*wA。"
      }
    ],
    "mastery": [
      "能自己推 comparator",
      "會避免 ratio double 比較",
      "遇到 deadline 題先寫 objective 而不是套模板"
    ]
  },
  "4-priority-queue": {
    "title": "Priority Queue Greedy：候選一直變，但每次只要最好的那個",
    "source": "AP325 4.2.3，教材頁 122–125、141",
    "intro": "PQ 適合『候選集合動態加入，而每一步只需要最小 / 最大』。它不是排序的替代品，而是當你無法一次把未來全部排序決定時，用 heap 維護當下最佳候選。",
    "objectives": [
      "會 max-heap / min-heap",
      "理解 two-way merge 為何每次取最小兩個",
      "會用 lazy deletion 處理失效候選"
    ],
    "focus": {
      "code": "P-4-7",
      "prompt": "每次合併兩群成本是 sizeA+sizeB，合併後又把和放回候選。為什麼應該永遠先合併目前最小兩個？",
      "questions": [
        "這和 Huffman coding 有什麼同型結構？",
        "為什麼一次 sort 不夠？",
        "min-heap 每輪做幾次操作？"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "dynamic-best",
        "title": "Heap 解的是『排序結果會被新資料改變』",
        "paragraphs": [
          "Two-way merge 中，取出兩個元素合併後會產生一個新元素，再回到候選集合。如果只在一開始排序，之後新和該插在哪裡會一直改變。",
          "min-heap 直接提供目前最小兩個，合併後 push 回去，每輪 O(log N)。"
        ]
      },
      {
        "type": "example",
        "id": "merge-trace",
        "title": "(3,5,1) 的最佳合併",
        "problem": "每次成本等於兩群 size 和。",
        "steps": [
          "heap=[1,3,5]。先取 1、3，成本 4，push 4。",
          "heap=[4,5]。取 4、5，成本 9。",
          "總成本 4+9=13。",
          "若先合併 3+5=8，再 8+1=9，總成本 17。"
        ],
        "conclusion": "小元素越早被合併，雖然會被重複計入後續成本，但每次被重複計入的重量較小。"
      },
      {
        "type": "code",
        "id": "merge-code",
        "title": "Optimal merge pattern",
        "code": "priority_queue<long long, vector<long long>, greater<long long>> pq;\nfor(long long x:a) pq.push(x);\nlong long ans=0;\nwhile(pq.size()>1){\n    long long x=pq.top(); pq.pop();\n    long long y=pq.top(); pq.pop();\n    ans += x+y;\n    pq.push(x+y);\n}",
        "notes": [
          "greater<long long> 把 priority_queue 變 min-heap。",
          "總共 N-1 次 merge，每次常數個 O(log N) heap 操作，所以 O(N log N)。"
        ]
      },
      {
        "type": "text",
        "id": "lazy-delete",
        "title": "候選可能失效時：Lazy deletion",
        "paragraphs": [
          "有些掃描題把候選丟進 heap 後，過一段時間會失效，但 priority_queue 不支援 O(log N) 任意刪除。常見做法是在 top 被詢問時，while(top 已失效) pop。",
          "正確性要求：你必須能 O(1) 判斷 top 是否仍有效，例如以 index、版本號、時間或目前 best 值比對。"
        ]
      },
      {
        "type": "callout",
        "id": "heap-not-all",
        "title": "不要把所有『取最小』都換成 heap",
        "body": "若資料一開始全部已知且只需一次排序後線性處理，sort 常更簡單。Heap 的價值在動態候選。",
        "tone": "tip"
      }
    ],
    "practice": [
      {
        "code": "P-4-7",
        "level": "focus",
        "why": "最純粹的 dynamic candidate + min-heap。"
      },
      {
        "code": "Q-4-8",
        "level": "core",
        "why": "時間事件加入候選後，再從 heap 取最佳。"
      },
      {
        "code": "Q-4-18",
        "level": "beyond",
        "why": "較複雜的動態候選管理，驗證 lazy / heap 思維。"
      }
    ],
    "checkpoints": [
      {
        "q": "P-4-7 為什麼不能只 sort 一次後一直相鄰合併？",
        "a": "每次合併產生的新 size 要重新和剩餘候選比較；它可能插到排序序列任意位置。"
      },
      {
        "q": "Lazy deletion 的成本會不會變 O(N²)？",
        "a": "通常不會，只要每個 entry 最多 push 一次、pop 一次；失效 entry 延後刪除但總刪除次數仍線性，外加 heap 的 log N。"
      }
    ],
    "mastery": [
      "會 min/max heap 語法",
      "能辨識動態候選問題",
      "理解 lazy deletion 的有效性判斷"
    ]
  },
  "4-binary-answer": {
    "title": "Binary Search on Answer：把最佳化改成可行性判斷",
    "source": "AP325 4.2.4，教材頁 126–128",
    "intro": "有些題目直接求最小 R 很難，但『給定 R，能不能做到？』很簡單。只要 feasibility check 對 R 單調，就可以二分臨界值。",
    "objectives": [
      "會把 optimization 轉成 monotone decision problem",
      "能證明 check(R) 單調",
      "會寫 first feasible binary search"
    ],
    "focus": {
      "code": "P-4-9",
      "prompt": "給定基地台直徑 R，能否用 ≤K 段長度 R 覆蓋所有點？這個 check 可以排序後 greedy 做。",
      "questions": [
        "R 越大，可行性會變好還是變差？",
        "check(R) 如何 O(N)？",
        "答案上下界可以設什麼？"
      ]
    },
    "blocks": [
      {
        "type": "steps",
        "id": "transform",
        "title": "三步把 optimization 變成 binary search",
        "steps": [
          {
            "title": "定義 check(x)",
            "body": "一句話說清楚：『限制 / 答案為 x 時，是否可行？』"
          },
          {
            "title": "證明單調",
            "body": "例如 R 可行，任何 R'>R 也可行，因此 false...false,true...true。"
          },
          {
            "title": "找 first true",
            "body": "二分最小可行 x，而不是在原問題上猜答案。"
          }
        ]
      },
      {
        "type": "example",
        "id": "base-station",
        "title": "P-4-9 的 check(R)",
        "problem": "數線上已排序服務點 p[]，一座基地台可覆蓋長度 R 的區間。",
        "steps": [
          "從最左尚未覆蓋點 p[i] 開始，最省的做法是把一段覆蓋到 p[i]+R。",
          "把所有 ≤p[i]+R 的點跳過。",
          "重複，計算用了幾段。",
          "若段數≤K，R 可行；否則不可行。"
        ],
        "conclusion": "外層 binary search O(log range)，內層 greedy check O(N)，總 O(N log range)。"
      },
      {
        "type": "code",
        "id": "answer-code",
        "title": "Find minimum feasible answer",
        "code": "bool check(long long R){\n    int used=0, i=0;\n    while(i<n){\n        ++used;\n        long long cover=p[i]+R;\n        while(i<n && p[i]<=cover) ++i;\n    }\n    return used<=K;\n}\n\nlong long l=0, r=p.back()-p.front();\nwhile(l<r){\n    long long mid=l+(r-l)/2;\n    if(check(mid)) r=mid;\n    else l=mid+1;\n}\ncout<<l<<'\\n';",
        "notes": [
          "先 sort p。",
          "check 必須是 deterministic 且足夠快。",
          "若找最大可行值，invariant 與邊界更新方向要重新推，不要硬改符號。"
        ]
      },
      {
        "type": "callout",
        "id": "nonmonotone",
        "title": "最危險的錯：check 根本不單調",
        "body": "Binary search on answer 不是『答案很大就二分』。你必須先證明 true/false 只會切換一次；若可行性會 true→false→true，二分沒有意義。",
        "tone": "warning"
      }
    ],
    "practice": [
      {
        "code": "P-4-9",
        "level": "focus",
        "why": "外掛二分最經典：greedy feasibility + first true。"
      },
      {
        "code": "Q-4-10",
        "level": "core",
        "why": "重新找 check 的定義與單調方向。"
      }
    ],
    "checkpoints": [
      {
        "q": "為什麼 R 可行就能推出所有更大的 R 也可行？",
        "a": "每座基地台覆蓋範圍只會變大，原本那組放置方案仍然可行。"
      },
      {
        "q": "外掛二分真正的 bottleneck 是什麼？",
        "a": "通常是能否設計快速、正確且單調的 check(x)。"
      }
    ],
    "mastery": [
      "能先寫 check 語意再寫二分",
      "能口頭證明 monotonicity",
      "會選合理 answer range"
    ]
  },
  "4-sweep-line": {
    "title": "Sweep Line：把幾何 / 區間問題變成排序後的事件流",
    "source": "AP325 4.2.5–4.3，教材頁 129–143",
    "intro": "掃描線的核心不是一定要畫一條線，而是把『在某座標發生的改變』變成 event，排序後只維護目前 active 的資訊。數線區間、最大子陣列、2D maximal point、closest pair 都能用這種思維。",
    "objectives": [
      "會 interval union 的 sort-and-scan",
      "理解 event tie-break 與端點語意",
      "能辨認 active set / prefix state"
    ],
    "focus": {
      "code": "P-4-11",
      "prompt": "先把線段按 left 排序。當下一段開始點 ≤ currentRight，它只會延長或被包含，不需要另開一段。",
      "questions": [
        "何時 current segment 可以確定結束？",
        "零長度線段會貢獻多少？",
        "若端點接觸 [a,b] 與 [b,c]，union length 如何處理？"
      ]
    },
    "blocks": [
      {
        "type": "example",
        "id": "interval-union",
        "title": "P-4-11：合併線段聯集",
        "problem": "線段 [5,15],[10,20],[30,75],[40,80]。",
        "steps": [
          "按 left 排序後，先 current=[5,15]。",
          "[10,20] 與 current overlap，延長成 [5,20]。",
          "[30,75] 的 left=30>20，前一段已不可能再被未來線段碰到，累加 15，開新 current。",
          "[40,80] overlap，延長到 [30,80]；最後再加 50，總 65。"
        ],
        "conclusion": "排序保證未來線段的 left 只會更右，因此 current 一旦被 gap 隔開就可永久結算。"
      },
      {
        "type": "code",
        "id": "merge-intervals",
        "title": "Interval union O(N log N)",
        "code": "sort(seg.begin(),seg.end());\nlong long ans=0;\nlong long L=seg[0].first, R=seg[0].second;\nfor(int i=1;i<n;i++){\n    auto [l,r]=seg[i];\n    if(l<=R) R=max(R,r);\n    else{\n        ans += R-L;\n        L=l; R=r;\n    }\n}\nans += R-L;",
        "notes": [
          "排序 O(N log N)，掃描 O(N)。",
          "若是離散事件版本，要先定義同座標 add/query/remove 順序。"
        ]
      },
      {
        "type": "text",
        "id": "events",
        "title": "一般 Sweep Line：排序事件 + 維護 active state",
        "paragraphs": [
          "區間 union 可以不顯式建立 start/end event，因為排序線段後 current interval 已足夠。但更一般的題目會把 start、end、query 各自變成 event。",
          "同座標 tie-break 很關鍵。例如閉區間 [l,r] 中，在 x=r 的 query 是否仍算 active，會決定 remove 放 query 前還後。"
        ]
      },
      {
        "type": "text",
        "id": "one-pass-patterns",
        "title": "P-4-13 / P-4-14：掃描也可以是『維護目前最好摘要』",
        "paragraphs": [
          "最大連續子陣列的 Kadane 維護『以 i 結尾的最佳值』；2D maximal point 排序一個座標後，掃描時維護另一座標的目前極值。",
          "它們不一定長得像幾何 sweep line，但共通點是：排序 / 固定掃描方向後，過去資料被壓成一個小型 active summary。"
        ]
      },
      {
        "type": "callout",
        "id": "closest",
        "title": "Closest pair 是更進階的 active-set sweep",
        "body": "P-4-15 的 L1 closest pair 需要對距離做座標轉換 / 幾何觀察；重點仍是只保留可能和目前點形成更好答案的候選，而不是比較所有 O(N²) 點對。",
        "tone": "tip"
      }
    ],
    "practice": [
      {
        "code": "P-4-11",
        "level": "focus",
        "why": "最乾淨的 sort + scan interval 模型。"
      },
      {
        "code": "P-4-13",
        "level": "core",
        "why": "把過去壓縮成『最佳 prefix ending state』。"
      },
      {
        "code": "P-4-14",
        "level": "core",
        "why": "排序一維後只維護另一維極值。"
      },
      {
        "code": "P-4-15",
        "level": "challenge",
        "why": "active candidate set + geometry。"
      },
      {
        "code": "Q-4-19",
        "level": "challenge",
        "why": "事件 / 場所條件更複雜。"
      },
      {
        "code": "Q-4-20",
        "level": "challenge",
        "why": "檢查是否能自己建立事件與 active invariant。"
      }
    ],
    "checkpoints": [
      {
        "q": "線段 union 為什麼按 left 排序後只需維護一個 current interval？",
        "a": "因為未來所有線段的 left 都不會更小；若下一段已在 currentRight 右側形成 gap，未來更右的線段也不可能再和 current 相交。"
      },
      {
        "q": "Sweep line 的同座標 event 順序為什麼重要？",
        "a": "它決定端點在該座標是否被視為 active；不同開閉區間語意需要不同 tie-break。"
      }
    ],
    "mastery": [
      "會把改變轉成 events",
      "能寫 interval union",
      "會明確定義 active state 與 tie-break"
    ]
  }
};
