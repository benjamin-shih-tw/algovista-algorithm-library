export const world3Guides = {
  "3-linear-structures": {
    "title": "Queue / Stack / Deque：先理解『取出順序』，再記 API",
    "source": "AP325 3.1 與 P-3-1，教材頁 72–79",
    "intro": "這三個容器真正的差異不是語法，而是未完成工作被重新取出的順序。FIFO 對應逐層處理，LIFO 對應最近尚未完成的工作，deque 則允許兩端同時維護候選。",
    "objectives": [
      "能由問題需要判斷 queue / stack / deque",
      "會安全使用 STL 基本操作",
      "理解 P-3-1 bottom-up 為何可用 queue"
    ],
    "focus": {
      "code": "P-3-1",
      "prompt": "先把每個人的『尚未處理孩子數』想成 indegree。葉節點高度已知是 0，能否從葉往上逐層推父親？",
      "questions": [
        "什麼節點一開始可以進 queue？",
        "一個 parent 要等到哪些 child 都處理完才可確定？",
        "queue 中保存的是『已可被處理』還是『還沒看過』？"
      ]
    },
    "blocks": [
      {
        "type": "table",
        "id": "semantics",
        "title": "三種容器的語意",
        "headers": [
          "容器",
          "保證的順序",
          "典型用途"
        ],
        "rows": [
          [
            "queue",
            "FIFO 先進先出",
            "BFS、拓樸式 bottom-up"
          ],
          [
            "stack",
            "LIFO 後進先出",
            "括號、DFS、最近未完成結構"
          ],
          [
            "deque",
            "兩端 O(1)",
            "單調佇列、0-1 BFS、雙端候選"
          ]
        ]
      },
      {
        "type": "text",
        "id": "choose-by-order",
        "title": "選資料結構前先問：下一個該處理誰？",
        "paragraphs": [
          "如果『最早等待的工作』必須先做，queue 自然；如果『最近開啟但尚未結束』要先完成，stack 自然。資料結構不是因為題目名字出現 queue 才選，而是因為演算法需要某種順序。",
          "同樣一批元素放進不同容器，輸出順序會不同；這個順序往往就是演算法正確性的 invariant。"
        ]
      },
      {
        "type": "example",
        "id": "bottom-up-tree",
        "title": "P-3-1：從葉節點向根推高度",
        "problem": "一棵 rooted tree，h(u)=1+max h(child)，葉子高度 0。",
        "steps": [
          "先統計每個節點 child 數；childCount=0 的葉節點高度已知，全部入 queue。",
          "pop 一個已完成節點 u，更新 parent 的最大 child height。",
          "parent 尚未完成的 child 數減一。",
          "當 parent 的 child 全部完成，它的高度就可確定，於是入 queue。"
        ],
        "conclusion": "queue 裡不是『走訪到的點』，而是『所有依賴都已完成，因此現在可以計算的點』。這就是後面 topological DP 的雛形。"
      },
      {
        "type": "code",
        "id": "stl-basics",
        "title": "最小 STL 操作表",
        "code": "queue<int> q;\nq.push(x); q.front(); q.pop();\n\nstack<int> st;\nst.push(x); st.top(); st.pop();\n\ndeque<int> dq;\ndq.push_front(x); dq.push_back(x);\ndq.front(); dq.back();\ndq.pop_front(); dq.pop_back();",
        "notes": [
          "front()/back()/top() 前先確保 !empty()。",
          "pop() 不回傳元素；需要值時先讀 front/top，再 pop。",
          "deque 不是 priority queue，它不會自動排序。"
        ]
      },
      {
        "type": "callout",
        "id": "later",
        "title": "這一章只是容器，真正威力在後面",
        "body": "Queue 會在 BFS、拓樸排序出現；Stack 會變成 monotonic stack；Deque 會變成 monotonic queue。先把『順序語意』學會，後面才不會只是在背模板。",
        "tone": "tip"
      }
    ],
    "practice": [
      {
        "code": "P-3-1",
        "level": "focus",
        "why": "把 queue 用在依賴完成順序，而不是單純操作模擬。"
      }
    ],
    "checkpoints": [
      {
        "q": "queue 的 FIFO 為什麼對 BFS 很重要？",
        "a": "距離較小、較早被發現的節點必須先擴張，才能保持 queue 中距離非遞減。"
      },
      {
        "q": "P-3-1 中 parent 什麼時候可以進 queue？",
        "a": "當它所有 child 都已經處理完成，亦即尚未完成的 child 數降到 0。"
      }
    ],
    "mastery": [
      "看到處理順序能判斷容器",
      "能安全使用 front/top/pop",
      "能解釋 P-3-1 的 queue invariant"
    ]
  },
  "3-expression-stack": {
    "title": "Stack 應用：括號、優先序與『最近未完成工作』",
    "source": "AP325 3.2，教材頁 80–84",
    "intro": "括號與運算式看似不同，但都符合 LIFO：最後打開的左括號要最先被關閉；最近遇到但尚未執行的運算子，也常最先決定。",
    "objectives": [
      "會做多種括號匹配",
      "理解 operator precedence 與 associativity",
      "能用 stack 表示尚未完成的巢狀結構"
    ],
    "focus": {
      "code": "P-3-2",
      "prompt": "掃描字串時，stack 只存『還沒被配對的左括號』。右括號來時，只需要看最近的一個。",
      "questions": [
        "為什麼不是 queue？",
        "遇到右括號但 stack empty 代表什麼？",
        "掃完後 stack 非空又代表什麼？"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "unfinished",
        "title": "Stack 的共同模型：最近開啟、尚未完成",
        "paragraphs": [
          "處理巢狀結構時，內層一定先結束。這正是 LIFO。括號是最乾淨的例子：每個右括號只能關閉最近尚未配對的左括號。",
          "運算式則把『尚未決定何時執行的 operator』暫存在 stack；一旦遇到優先序不更高的新 operator，就把先前可確定的運算先完成。"
        ]
      },
      {
        "type": "code",
        "id": "parentheses",
        "title": "括號匹配",
        "code": "bool match(char l,char r){\n    return (l=='('&&r==')') || (l=='['&&r==']') || (l=='{'&&r=='}');\n}\n\nbool valid(const string& s){\n    stack<char> st;\n    for(char c:s){\n        if(c=='('||c=='['||c=='{') st.push(c);\n        else{\n            if(st.empty() || !match(st.top(),c)) return false;\n            st.pop();\n        }\n    }\n    return st.empty();\n}",
        "notes": [
          "右括號出現時 stack empty：關閉了不存在的左括號。",
          "掃描結束 stack 非空：仍有左括號未關閉。"
        ]
      },
      {
        "type": "steps",
        "id": "expression",
        "title": "運算式求值的三個問題",
        "steps": [
          {
            "title": "Tokenize",
            "body": "先把數字與 operator 分開；多位數不能逐字元當成一個數。"
          },
          {
            "title": "Precedence",
            "body": "新 operator 到來時，哪些 stack top operator 必須先執行？"
          },
          {
            "title": "Associativity",
            "body": "同優先序時，左結合通常先算舊 operator；右結合則相反。"
          }
        ]
      },
      {
        "type": "example",
        "id": "precedence-trace",
        "title": "3 + 4 * 5 為什麼不能看到 + 就立刻算",
        "problem": "掃描 3 + 4 * 5。",
        "steps": [
          "讀到 3，放入 value。",
          "讀到 +，先保留。",
          "讀到 4，再看到 *；* 優先於 +，所以 + 仍不能算。",
          "讀到 5，先算 4*5=20，再算 3+20=23。"
        ],
        "conclusion": "stack 保存的是『已看到但尚不能安全執行』的 operator。"
      },
      {
        "type": "callout",
        "id": "shunting",
        "title": "完整版可延伸到 Shunting-yard",
        "body": "如果要支援括號、更多 operator、不同結合方向，最穩定的方法是 operator stack + value/output structure。AlgoVista 中已有 expression evaluation / shunting-yard 視覺化。",
        "tone": "tip"
      }
    ],
    "practice": [
      {
        "code": "P-3-2",
        "level": "focus",
        "why": "最純粹的 LIFO invariant。"
      },
      {
        "code": "Q-3-3",
        "level": "core",
        "why": "把 stack 從配對擴展成 precedence 管理。"
      }
    ],
    "checkpoints": [
      {
        "q": "括號匹配為什麼不能用 queue？",
        "a": "因為最晚出現的未配對左括號必須最先被右括號關閉，這是 LIFO，不是 FIFO。"
      },
      {
        "q": "運算子 stack 何時可以 pop？",
        "a": "當你能確定 stack top 的運算在後續不可能被更高優先序或括號結構延後時。"
      }
    ],
    "mastery": [
      "能寫多種括號匹配",
      "能口述 precedence/associativity 如何影響 pop",
      "理解 stack 存的是『未完成上下文』"
    ]
  },
  "3-monotonic-stack": {
    "title": "Monotonic Stack：刪掉永遠不會再有用的候選",
    "source": "AP325 P-3-4～P-3-6，教材頁 84–94",
    "intro": "單調堆疊最難的不是 push/pop，而是證明『被 pop 的元素為什麼永遠不可能再成為未來答案』。一旦這個支配關係想通，O(N) 攤銷複雜度也會自然出現。",
    "objectives": [
      "會找 nearest greater/smaller",
      "知道 stack 應存 index 而非只存 value 的時機",
      "會用攤銷分析證明 O(N)"
    ],
    "focus": {
      "code": "P-3-4",
      "prompt": "從左到右處理每個人的身高。當新的人更高時，哪些較矮候選已被永久遮住？",
      "questions": [
        "stack 要維持遞增還是遞減？",
        "被 pop 的人為什麼不會再成為未來某人的最近高人？",
        "相等身高時題意要求 > 還是 >=？"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "dominated",
        "title": "被 pop 的候選是『被支配』，不是『暫時不用』",
        "paragraphs": [
          "假設 stack 保存從目前位置往左仍可能成為『最近更高者』的候選。新高度 h 進來時，若 stack top ≤ h，那個 top 對未來位置已沒有價值：h 比它更靠右，而且不矮於它。",
          "所以 future query 若原本能選 top，也一定會先遇到 h；top 被永久支配，可以 pop。"
        ]
      },
      {
        "type": "example",
        "id": "nge-trace",
        "title": "序列 5,4,1,1,3 的候選如何變化",
        "problem": "維護可能成為未來最近更高者的遞減 stack。",
        "steps": [
          "讀 5：stack=[5]。",
          "讀 4：4<5，stack=[5,4]。",
          "讀 1：stack=[5,4,1]。",
          "再讀 1：依題意若要求嚴格更高，舊 1 不能成為答案，可先 pop 相等值，再 push 新 1。",
          "讀 3：pop 1；4>3 停止，因此最近更高者是 4。"
        ],
        "conclusion": "等號要不要 pop 不是模板問題，而是『更高』是否允許相等的題意問題。"
      },
      {
        "type": "code",
        "id": "nearest-greater",
        "title": "左側最近嚴格更大元素",
        "code": "vector<int> st;\nvector<int> leftGreater(n,-1);\nfor(int i=0;i<n;i++){\n    while(!st.empty() && a[st.back()] <= a[i]) st.pop_back();\n    if(!st.empty()) leftGreater[i]=st.back();\n    st.push_back(i);\n}",
        "notes": [
          "存 index 才能回傳距離 / 位置。",
          "若題目要最近大於等於，while 的 <= 要改成 <。",
          "stack 中 index 由小到大，value 由底到頂嚴格遞減。"
        ]
      },
      {
        "type": "text",
        "id": "amortized",
        "title": "O(N) 的真正理由：每個 index 一生只死一次",
        "paragraphs": [
          "某一個 i 可能連 pop 很多人，看起來像巢狀 O(N²)。但一個 index 一旦被 pop 就永遠不回來，因此全程最多 N 次 push、N 次 pop。",
          "這是競賽很常見的攤銷分析方式：不要看單輪最壞，而是看每個元素一生被收費幾次。"
        ]
      },
      {
        "type": "text",
        "id": "variant",
        "title": "加上額外狀態時，先保住單調 invariant",
        "paragraphs": [
          "Q-3-5 加了板凳等額外條件，P-3-6 又把『刪除後鄰居改變』帶進來。遇到變形時，不要先改模板；先重新定義 stack/list 裡每個候選為何仍可能有用。",
          "只要你能說出候選集合的 invariant，二分、multimap、linked-list 等額外工具才不會變成亂湊。"
        ]
      }
    ],
    "practice": [
      {
        "code": "P-3-4",
        "level": "focus",
        "why": "標準最近更高候選，先練支配證明。"
      },
      {
        "code": "Q-3-5",
        "level": "challenge",
        "why": "增加板凳高度，單純 monotonic stack 不再直接夠用。"
      },
      {
        "code": "P-3-6",
        "level": "core",
        "why": "刪除元素後鄰接關係改變，練習候選維護。"
      }
    ],
    "checkpoints": [
      {
        "q": "為什麼被新元素 h pop 的較小元素永遠不會再成為未來最近更高者？",
        "a": "h 比它更靠近未來位置且至少一樣高；任何未來位置若能被舊元素服務，h 會更早出現並不更差，因此舊元素被支配。"
      },
      {
        "q": "單調堆疊為什麼總共 O(N)？",
        "a": "每個 index 最多 push 一次、pop 一次，全程 stack 操作 O(N)。"
      }
    ],
    "mastery": [
      "能先定義候選被支配的理由",
      "會依嚴格/非嚴格條件處理等號",
      "能用 amortized analysis 解釋複雜度"
    ]
  },
  "3-sliding-window": {
    "title": "Sliding Window：讓左右界只往前，不重算整段",
    "source": "AP325 Sliding Window 與 P-3-7、P-3-9～Q-3-12，教材頁 94–105",
    "intro": "滑動視窗成立的關鍵不是『有連續區間』，而是當 right 擴張後，若目前狀態不合法，可以靠 left 單調往右把它修回合法，而且 left 永遠不需要回頭。",
    "objectives": [
      "會寫 expand-right / shrink-left 骨架",
      "會維護 sum / frequency / distinct count",
      "能判斷什麼條件不具單調性而不能套 window"
    ],
    "focus": {
      "code": "P-3-7",
      "prompt": "題目元素全是正整數，這個條件就是滑窗成立的關鍵。sum 太大時移 left，sum 一定下降；sum 太小時加 right，sum 一定上升。",
      "questions": [
        "如果允許負數，這個單調性還在嗎？",
        "視窗狀態怎麼 O(1) 更新？",
        "left 最多走幾次？"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "window-invariant",
        "title": "把 window 寫成一個清楚的 invariant",
        "paragraphs": [
          "常見骨架是 right 每輪加入一個元素，然後 while(condition violated) 把 left 向右移，直到 window 恢復合法。此時 [left,right] 就是目前要評估的區間。",
          "重要的是 add/remove 必須精確同步 state，例如 sum、cnt[color]、distinct。window 變了但 state 沒變，後面判斷全部失真。"
        ]
      },
      {
        "type": "code",
        "id": "window-template",
        "title": "可變長度 sliding window 模板",
        "code": "int l=0;\nState state;\nfor(int r=0;r<n;r++){\n    add(a[r], state);\n    while(l<=r && !valid(state)){\n        remove(a[l], state);\n        ++l;\n    }\n    use(l,r,state);\n}",
        "notes": [
          "right 走 N 次，left 也最多 N 次，所以典型是 O(N)。",
          "valid 必須具有足夠單調性，才能確定 left 不需回頭。"
        ]
      },
      {
        "type": "example",
        "id": "positive-sum",
        "title": "正整數讓區間和具單調性",
        "problem": "a=[2,1,4,3,2]，希望維持 sum≤6。",
        "steps": [
          "right 加 2,1，sum=3 合法。",
          "再加 4，sum=7；移除 left 的 2，sum=5，恢復合法。",
          "right 加 3，sum=8；移除 1→7，再移除 4→3。",
          "每個元素只被 add 一次、remove 一次。"
        ],
        "conclusion": "若有負數，移除 left 可能反而讓 sum 上升，這套單調推理會壞掉。"
      },
      {
        "type": "text",
        "id": "frequency",
        "title": "Frequency window：不要每次重新數顏色",
        "paragraphs": [
          "P-3-9 類題維護 cnt[color]。新元素進來，若 cnt 從 0 變 1，distinct++；舊元素出去，若 cnt 從 1 變 0，distinct--。",
          "這個『只在狀態跨過臨界值時更新總量』的技巧很通用：不用每個 window 再掃一遍整個 frequency table。"
        ]
      },
      {
        "type": "code",
        "id": "distinct-code",
        "title": "固定 window 的 distinct count",
        "code": "vector<int> cnt(C);\nint distinct=0;\nfor(int i=0;i<L;i++) if(cnt[a[i]]++==0) ++distinct;\nint best=distinct;\nfor(int r=L;r<n;r++){\n    if(cnt[a[r]]++==0) ++distinct;\n    int old=a[r-L];\n    if(--cnt[old]==0) --distinct;\n    best=max(best,distinct);\n}",
        "notes": [
          "顏色值很大時，先離散化或用 unordered_map/map。",
          "固定長度 window 不需要 while；每次恰好進一個、出一個。"
        ]
      },
      {
        "type": "callout",
        "id": "window-or-not",
        "title": "看到連續區間不等於一定能 sliding window",
        "body": "若條件對 left/right 沒有單調性，例如含正負數的『區間和最接近 K』，left 往右不一定讓狀態朝單一方向改善，通常要 prefix sum + ordered set 等別的方法。",
        "tone": "warning"
      }
    ],
    "practice": [
      {
        "code": "P-3-7",
        "level": "focus",
        "why": "正整數和提供最乾淨的 window 單調性。"
      },
      {
        "code": "P-3-9",
        "level": "core",
        "why": "固定窗 + frequency state。"
      },
      {
        "code": "P-3-10",
        "level": "challenge",
        "why": "顏色值域不再方便，加入離散化 / 字典。"
      },
      {
        "code": "Q-3-11",
        "level": "core",
        "why": "可變窗 + distinct constraint。"
      },
      {
        "code": "Q-3-12",
        "level": "challenge",
        "why": "把 window 條件放進 APCS 變形。"
      }
    ],
    "checkpoints": [
      {
        "q": "P-3-7 為什麼特別強調正整數？",
        "a": "因為擴張 right 只會讓 sum 不減，縮小 left 只會讓 sum 不增，合法性有單調方向，指標不用回頭。"
      },
      {
        "q": "如何 O(1) 維護 distinct color 數？",
        "a": "只有 cnt[color] 在 0↔1 跨界時 distinct 才改變，無需掃整張 cnt。"
      }
    ],
    "mastery": [
      "能證明左右指標不回頭",
      "會設計 O(1) add/remove state",
      "看到負數等破壞單調性的條件會停止硬套 window"
    ]
  },
  "3-monotonic-queue": {
    "title": "Monotonic Queue：滑動視窗裡的最大 / 最小值",
    "source": "AP325 P-3-8、Q-3-13～Q-3-14，教材頁 96–107",
    "intro": "Monotonic queue = sliding window 的過期機制 + monotonic stack 的支配機制。前端負責刪掉已離開視窗的 index，後端負責刪掉被新值永久支配的候選。",
    "objectives": [
      "會做 fixed-window max/min",
      "知道 deque 中要存 index",
      "能同時維護 max deque 與 min deque"
    ],
    "focus": {
      "code": "P-3-8",
      "prompt": "長度 L 的每個 window 都要 max-min。若每窗重掃 O(L)，最壞 O(NL)。想辦法讓每個元素只進出 deque 一次。",
      "questions": [
        "front 何時過期？",
        "back 何時被新元素支配？",
        "為什麼只存 value 不夠？"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "two-removals",
        "title": "Deque 的兩端各自有不同任務",
        "paragraphs": [
          "假設維護 window maximum。Deque 內 index 遞增、對應 value 遞減。front 永遠是目前最大值。",
          "新 index i 到來時，先從 back 移除所有 value≤a[i] 的候選：新元素更靠右又不更小，它們永遠不會再成為最大值。另一端則移除 index≤i-L 的過期元素。"
        ]
      },
      {
        "type": "example",
        "id": "window-max-trace",
        "title": "a=[4,2,5,1,3]，L=3",
        "problem": "維護 max deque。",
        "steps": [
          "i=0: dq=[4]。i=1: 2 較小，dq=[4,2]。",
          "i=2: 5 進來，從 back pop 2、4，dq=[5]；第一窗 max=5。",
          "i=3: 1 進來，dq=[5,1]；5 尚未過期，max=5。",
          "i=4: 3 進來先 pop 1；index 2 的 5 還在窗 [2,4]，max 仍 5。"
        ],
        "conclusion": "back pop 解決支配，front pop 解決時間/位置過期。"
      },
      {
        "type": "code",
        "id": "window-max-code",
        "title": "Sliding window maximum",
        "code": "deque<int> dq;\nfor(int i=0;i<n;i++){\n    while(!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();\n    dq.push_back(i);\n\n    while(!dq.empty() && dq.front() <= i-L) dq.pop_front();\n\n    if(i >= L-1){\n        long long mx = a[dq.front()];\n        use(mx);\n    }\n}",
        "notes": [
          "index 讓你同時取得 value 與判斷是否過期。",
          "若要求 minimum，把比較方向反過來。",
          "P-3-8 要 max-min，因此常同時維護兩個 deque。"
        ]
      },
      {
        "type": "text",
        "id": "range-condition",
        "title": "從固定窗擴展到『X 差值範圍內』",
        "paragraphs": [
          "Q-3-13 這類問題不一定固定 window 長度，而是 window 合法性由 x 座標差決定。front 的過期判斷就從 i-L 改成『x[i]-x[front] 是否超過限制』。",
          "資料結構不變，變的是 window 的有效範圍條件。先寫清楚何時元素過期，deque 模板才不會被套錯。"
        ]
      },
      {
        "type": "callout",
        "id": "equal-policy",
        "title": "等值時 pop 哪一個？",
        "body": "維護 maximum 時常用 <= 把較舊的相等值 pop 掉，因為新值壽命更長；但若題目需要計數或保留最早位置，等號策略可能不同。先看答案需要什麼資訊。",
        "tone": "tip"
      }
    ],
    "practice": [
      {
        "code": "P-3-8",
        "level": "focus",
        "why": "最標準的 max/min deque。"
      },
      {
        "code": "Q-3-13",
        "level": "core",
        "why": "把固定長度過期改成 x-range 過期。"
      },
      {
        "code": "Q-3-14",
        "level": "challenge",
        "why": "單調候選與幾何/函數條件混合，要求重新定義支配關係。"
      }
    ],
    "checkpoints": [
      {
        "q": "為什麼 monotonic queue 一定要能刪 front 和 back？",
        "a": "back 用來刪被新元素支配的候選；front 用來刪已離開 window 的過期候選。"
      },
      {
        "q": "總複雜度為什麼 O(N)？",
        "a": "每個 index 最多 push 一次、從某一端 pop 一次，所有 deque 操作總數線性。"
      }
    ],
    "mastery": [
      "能獨立寫 window max/min",
      "能把『過期條件』從固定長度換成其他單調範圍",
      "能解釋 deque 兩端各自的 invariant"
    ]
  }
};
