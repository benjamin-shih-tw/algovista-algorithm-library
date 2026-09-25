export const lessonContent = {
  "0-cpp-testing": {
    "why": "競賽真正穩定的起點不是背更多語法，而是建立一個能快速驗證想法的工作流：先寫最小正確版本，再用極小測資、邊界測資與反例把 bug 分類。",
    "pattern": "Think → write a tiny model → test invariants → only then optimize.",
    "steps": [
      "固定一份最小 C++17 模板。",
      "先手算 2–3 筆小測資，再跑程式比對。",
      "把錯誤分成讀題、演算法、邊界、實作四類。",
      "每次 WA 先做最小反例，不要立刻重寫整份程式。"
    ],
    "invariant": "任何時刻你都應該能回答：目前哪一個變數代表什麼、它的合法範圍是什麼。",
    "template": "#include <bits/stdc++.h>\nusing namespace std;\nusing ll = long long;\n\nint main(){\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    // read\n    // solve\n    // output\n}",
    "quiz": {
      "q": "Sample 都對，但正式測資 WA。第一件事最值得做什麼？",
      "options": [
        "加更多 pragma",
        "找最小反例與邊界測資",
        "把 int 全改 long long"
      ],
      "answer": 1,
      "explain": "Sample 只驗證很少情況；先定位錯誤類型，才知道是否真的是型別或效能問題。"
    }
  },
  "0-complexity": {
    "why": "資料量其實在暗示解法。先由 N 排除不可能的複雜度，可以避免花時間把一個必 TLE 的想法寫得很漂亮。",
    "pattern": "Constraint → target complexity → candidate techniques.",
    "steps": [
      "列出最主要的 N、M、值域。",
      "估算最壞操作次數，不只看迴圈層數。",
      "把 STL 操作成本算進去。",
      "若超標，問：能否排序、預處理、單調化、折半、DP 或資料結構加速？"
    ],
    "invariant": "複雜度分析看的是最壞情況下「總工作量」，不是程式碼看起來有幾層。",
    "template": "// quick mental model\n// N <= 20      -> O(2^N) may work\n// N <= 1e3     -> O(N^2) often works\n// N <= 2e5     -> target O(N log N) / O(N)\n// N >= 1e6     -> usually near-linear",
    "quiz": {
      "q": "N = 2e5，兩層迴圈一定是 O(N^2) 嗎？",
      "options": [
        "一定",
        "不一定，要看內層總共執行幾次",
        "只要用 vector 就不是"
      ],
      "answer": 1,
      "explain": "雙指標、單調佇列等常見寫法表面有 while 內嵌，但每個元素只進出常數次，總成本仍可為 O(N)。"
    }
  },
  "0-danger-zone": {
    "why": "overflow、浮點誤差與求值順序不會讓演算法更高級，卻最容易把正確想法變成隱晦的 WA。",
    "pattern": "Before submit: range, precision, bounds, evaluation order.",
    "steps": [
      "乘法前先估最大值。",
      "必要時讓乘法在 long long / __int128 中發生。",
      "浮點比較用 EPS 或改用整數式。",
      "索引前先確保短路條件真的會先擋住非法存取。"
    ],
    "invariant": "型別的範圍必須覆蓋「運算中間值」，不只覆蓋最後答案。",
    "template": "long long a,b;\n// 1LL*a*b forces 64-bit multiplication\nlong long x = 1LL * a * b;\n\nconst double EPS = 1e-9;\nbool eq(double x,double y){ return fabs(x-y) <= EPS; }",
    "quiz": {
      "q": "int a,b; long long x = a*b; 為什麼仍可能 overflow？",
      "options": [
        "long long 太小",
        "a*b 先以 int 計算後才轉型",
        "只有負數才會"
      ],
      "answer": 1,
      "explain": "右側運算先決定型別；要寫 1LL*a*b 或先把其中一個 operand 轉成 long long。"
    }
  },
  "1-recursion-model": {
    "why": "遞迴不是『函式呼叫自己』這麼簡單；真正重要的是你能否先定義 f(x) 的語意，再證明每次呼叫都縮小到 base case。",
    "pattern": "Define meaning → base case → smaller subproblem → combine.",
    "steps": [
      "先用一句話寫出 f(...) 回傳什麼。",
      "找最小不需要再分解的 base case。",
      "證明遞迴參數會朝 base case 前進。",
      "只在回傳時組合子問題答案。"
    ],
    "invariant": "每層只相信：較小問題的答案已正確，不偷看其內部怎麼完成。",
    "template": "Result solve(State s){\n    if(base(s)) return baseAnswer(s);\n    State t = smaller(s);\n    Result sub = solve(t);\n    return combine(s, sub);\n}",
    "quiz": {
      "q": "寫遞迴前最重要的一句話是什麼？",
      "options": [
        "我要呼叫自己",
        "這個函式的參數與回傳值代表什麼",
        "我要用全域陣列"
      ],
      "answer": 1,
      "explain": "函式語意明確後，base case 與 transition 才有可驗證的正確性。"
    }
  },
  "1-enumeration": {
    "why": "暴搜並不等於亂試。只要把每一步的選擇建成決策樹，就能完整枚舉而不重不漏，並清楚估算 2^N、k^N 等成本。",
    "pattern": "At position i, enumerate every legal choice exactly once.",
    "steps": [
      "定義 depth i 表示已決定前 i 個元素。",
      "列出當層所有選擇，例如選 / 不選。",
      "把必要資訊累積在 state 中。",
      "到葉節點才更新答案，或在能判定失敗時提前剪枝。"
    ],
    "invariant": "每一個完整答案對應到唯一一條根到葉路徑。",
    "template": "void dfs(int i, long long sum){\n    if(i==n){ use(sum); return; }\n    dfs(i+1, sum);          // not choose\n    dfs(i+1, sum+a[i]);     // choose\n}",
    "quiz": {
      "q": "N=25 的子集合枚舉，若每個葉節點再 O(N) 掃一次，總複雜度最接近？",
      "options": [
        "O(N)",
        "O(2^N)",
        "O(N2^N)"
      ],
      "answer": 2,
      "explain": "有約 2^N 個葉節點，每個葉節點再花 O(N)。"
    }
  },
  "1-backtracking": {
    "why": "Backtracking 的力量來自『提早知道這條路不可能成功』。修改狀態、深入、還原狀態三步必須成對。",
    "pattern": "choose → check/prune → recurse → undo.",
    "steps": [
      "只保留產生合法解所需的狀態。",
      "選擇前或選擇後立刻檢查衝突。",
      "進入下一層。",
      "返回時完全 rollback。"
    ],
    "invariant": "進入 dfs(depth) 時，state 恰好描述前 depth 個已確定選擇。",
    "template": "void dfs(int row){\n    if(row==n){ ++ans; return; }\n    for(int col=0; col<n; ++col){\n        if(!ok(row,col)) continue;\n        place(row,col);\n        dfs(row+1);\n        undo(row,col);\n    }\n}",
    "boss": "Q-1-10",
    "quiz": {
      "q": "Backtracking 最常見的隱性 bug？",
      "options": [
        "用了 recursion",
        "忘記 undo 狀態",
        "用了 for 迴圈"
      ],
      "answer": 1,
      "explain": "若狀態沒有還原，下一個 sibling branch 會繼承不屬於自己的選擇。"
    }
  },
  "2-sorting": {
    "why": "排序不是終點，而是製造單調性。很多原本 O(N^2) 的配對、區間或去重問題，排序後才有二分、雙指標與 sweep line 的空間。",
    "pattern": "Sort to create order, then exploit the order.",
    "steps": [
      "確認排序 key。",
      "若需保留原索引，把 index 一起存。",
      "離散化用 sort + unique 建排名。",
      "比較器只表達 strict weak ordering。"
    ],
    "invariant": "排序後你依賴的關係（例如非遞減）必須在後續操作中保持成立。",
    "template": "sort(v.begin(), v.end());\nv.erase(unique(v.begin(), v.end()), v.end());\n\nint rankOf(long long x){\n    return lower_bound(v.begin(), v.end(), x)-v.begin();\n}",
    "quiz": {
      "q": "比較器 return a<=b 為什麼危險？",
      "options": [
        "太慢",
        "違反 strict weak ordering",
        "不能比較 int"
      ],
      "answer": 1,
      "explain": "當 a==b 時 a<b 必須為 false；<= 會破壞排序所需的關係。"
    }
  },
  "2-binary-search": {
    "why": "二分真正的核心是 invariant：每一步砍掉一半後，答案仍一定在保留區。把這件事想清楚，就不容易卡在 while 條件與 ±1。",
    "pattern": "Monotone / sorted search space + preserved invariant.",
    "steps": [
      "先定義搜尋區間是 [l,r] 還是 [l,r)。",
      "明確寫出 mid 左右哪一側可丟掉。",
      "每次更新都必須縮小區間。",
      "最後確認回傳點滿足你要的 first/last 條件。"
    ],
    "invariant": "答案若存在，始終留在目前候選區間。",
    "template": "int l=0, r=n; // [l,r)\nwhile(l<r){\n    int mid=l+(r-l)/2;\n    if(a[mid] >= target) r=mid;\n    else l=mid+1;\n}\n// l == first index with a[l] >= target",
    "quiz": {
      "q": "lower_bound 找的是？",
      "options": [
        "最後一個 < x",
        "第一個 >= x",
        "第一個 > x"
      ],
      "answer": 1,
      "explain": "upper_bound 才是第一個 > x。"
    }
  },
  "2-fast-power": {
    "why": "指數 n 的二進位表示告訴你需要哪些 a^(2^k)。每一回合平方 base、右移 exponent，就能把 O(n) 乘法降成 O(log n)。",
    "pattern": "Process exponent bits from low to high.",
    "steps": [
      "ans 從乘法單位元 1 開始。",
      "若最低 bit 為 1，把 base 乘進 ans。",
      "base 自乘平方。",
      "exponent 右移一位。"
    ],
    "invariant": "ans * base^exp 始終等於原本要算的 a^n（忽略 mod 表示上的等價）。",
    "template": "long long binpow(long long a,long long e,long long mod){\n    long long ans=1%mod;\n    while(e){\n        if(e&1) ans=(__int128)ans*a%mod;\n        a=(__int128)a*a%mod;\n        e>>=1;\n    }\n    return ans;\n}",
    "quiz": {
      "q": "為什麼 exponent 每輪可以 e>>=1？",
      "options": [
        "因為 base 同時平方，維持等價",
        "因為奇數會變偶數",
        "只是語法技巧"
      ],
      "answer": 0,
      "explain": "把一個 bit 處理掉後，剩餘指數除以 2；base 平方恰好補償權重變化。"
    }
  },
  "2-fibonacci": {
    "why": "固定階線性遞迴可以視為『狀態向量反覆乘同一個轉移矩陣』。因此把重複 n 次轉移變成矩陣快速冪。",
    "pattern": "recurrence → state vector → transition matrix → fast exponentiation.",
    "steps": [
      "選擇能從一步推出下一步的 state vector。",
      "把一次 transition 寫成矩陣。",
      "用 identity matrix 作快速冪初值。",
      "最後讀出所需分量。"
    ],
    "invariant": "矩陣 T^k 表示連續做 k 次相同 transition。",
    "template": "// Fibonacci\n// [F(n+1)] = [1 1]^n [F(1)]\n// [F(n)  ]   [1 0]   [F(0)]\n// implement 2x2 multiply + binary exponentiation",
    "quiz": {
      "q": "矩陣快速冪的 ans 為什麼從單位矩陣開始？",
      "options": [
        "因為它是矩陣乘法的單位元",
        "因為全部是 1",
        "為了避免 overflow"
      ],
      "answer": 0,
      "explain": "就像數字快速冪從 1 開始。"
    }
  },
  "2-two-number": {
    "why": "排序後，若和太小就移動較小端、和太大就移動較大端，這種單調性讓兩個指標總共只走 O(N) 步。",
    "pattern": "Sorted data + monotone pointer movement.",
    "steps": [
      "先排序。",
      "l 指向最小、r 指向最大。",
      "依目前和與 target 的大小只移一端。",
      "若題目要原索引，排序前一起保存。"
    ],
    "invariant": "被丟掉的端點不可能再和剩餘任何元素形成更好的答案。",
    "template": "sort(a.begin(),a.end());\nint l=0,r=n-1;\nwhile(l<r){\n    long long s=a[l]+a[r];\n    if(s==target) break;\n    if(s<target) ++l;\n    else --r;\n}",
    "quiz": {
      "q": "two pointers 能成立的關鍵？",
      "options": [
        "一定有兩個答案",
        "移動方向具有單調性",
        "vector 已排序所以任何題都能用"
      ],
      "answer": 1,
      "explain": "若移動後的可行性沒有單調方向，就不能安全丟掉候選。"
    }
  },
  "2-mitm": {
    "why": "2^40 太大，但 2^20 約百萬。折半枚舉把一個大指數拆成兩個較小指數，再用排序與搜尋合併。",
    "pattern": "enumerate left half + enumerate right half + combine efficiently.",
    "steps": [
      "切成左右兩半。",
      "各自列出所有 subset 值。",
      "排序其中一側。",
      "對另一側每個值二分最合適配對。"
    ],
    "invariant": "任何完整子集合都唯一拆成一個左半子集合與一個右半子集合。",
    "template": "vector<long long> gen(vector<long long> v){\n    vector<long long> s{0};\n    for(long long x:v){\n        int m=s.size();\n        for(int i=0;i<m;i++) s.push_back(s[i]+x);\n    }\n    return s;\n}",
    "boss": "P-2-9",
    "quiz": {
      "q": "MITM 對 N=40 的主要成本量級？",
      "options": [
        "2^40",
        "約 2^20",
        "40^2"
      ],
      "answer": 1,
      "explain": "兩半各自約 20 個元素，因此各枚舉約一百萬個子集合。"
    }
  },
  "3-linear-structures": {
    "why": "Queue、Stack、Deque 的價值不是 API，而是它們各自保證的取出順序。之後 BFS、括號、單調結構都只是把這些順序套進問題。",
    "pattern": "Choose container by the order in which unfinished work must be revisited.",
    "steps": [
      "FIFO → queue。",
      "LIFO → stack。",
      "兩端都要刪除/加入 → deque。",
      "對空容器取 front/top 前先保證非空。"
    ],
    "invariant": "容器裡保存的是『尚未處理完、且仍有價值』的狀態。",
    "template": "queue<int> q;\nstack<int> st;\ndeque<int> dq;\n\nq.push(x); q.front(); q.pop();\nst.push(x); st.top(); st.pop();\ndq.push_back(x); dq.pop_front();",
    "quiz": {
      "q": "BFS 為何用 queue 而不是 stack？",
      "options": [
        "queue 比較快",
        "FIFO 才能維持逐層距離順序",
        "stack 不能放 int"
      ],
      "answer": 1,
      "explain": "最早被發現的較近節點必須先被展開。"
    }
  },
  "3-expression-stack": {
    "why": "括號與運算式的共同點是『最近開啟、尚未完成』的結構要最先收尾，這正是 LIFO。",
    "pattern": "Use stack to store unfinished nested context.",
    "steps": [
      "括號：遇左括號 push。",
      "遇右括號檢查 top 是否匹配。",
      "運算式：依 precedence 決定何時 pop 運算子。",
      "掃描結束後確認 stack 狀態合法。"
    ],
    "invariant": "stack top 永遠代表最近一個尚未完成的結構。",
    "template": "bool ok(string s){\n    stack<char> st;\n    for(char c:s){\n        if(c=='(') st.push(c);\n        else if(c==')'){\n            if(st.empty()) return false;\n            st.pop();\n        }\n    }\n    return st.empty();\n}",
    "quiz": {
      "q": "只在遇到 ')' 時檢查 stack 非空，最後不檢查 empty，會漏掉什麼？",
      "options": [
        "多餘左括號",
        "多餘右括號",
        "空字串"
      ],
      "answer": 0,
      "explain": "像 '(((' 不會觸發右括號錯誤，但最後仍不合法。"
    }
  },
  "3-monotonic-stack": {
    "why": "單調 stack 的核心不是『保持漂亮』，而是證明被 pop 的元素已永遠不可能成為未來答案，所以可以永久丟棄。",
    "pattern": "Maintain only undominated candidates.",
    "steps": [
      "決定要找 next greater 還是 next smaller。",
      "stack 通常存 index。",
      "新元素來時，反覆 pop 被它解答或支配的元素。",
      "再把自己 push 成未來候選。"
    ],
    "invariant": "stack 由底到頂保持指定單調性，且每個元素只進出一次。",
    "template": "vector<int> ans(n,-1), st;\nfor(int i=0;i<n;i++){\n    while(!st.empty() && a[st.back()] < a[i]){\n        ans[st.back()] = i;\n        st.pop_back();\n    }\n    st.push_back(i);\n}",
    "quiz": {
      "q": "為何總複雜度是 O(N) 而不是 O(N^2)？",
      "options": [
        "while 最多跑一次",
        "每個 index 最多 push/pop 各一次",
        "compiler 會優化"
      ],
      "answer": 1,
      "explain": "攤銷分析看所有 while 次數的總和。"
    }
  },
  "3-sliding-window": {
    "why": "當區間條件具有單調性，左右界只向右走，就能把反覆重算的區間狀態保留下來。",
    "pattern": "Expand right, repair with left, maintain state incrementally.",
    "steps": [
      "right 每次加入一個元素。",
      "更新 sum/freq 等狀態。",
      "若條件不合法，移動 left 並同步刪除狀態。",
      "在合法時更新答案。"
    ],
    "invariant": "window state 精確對應目前 [l,r] 內元素。",
    "template": "int l=0;\nfor(int r=0;r<n;r++){\n    add(a[r]);\n    while(!valid()) remove(a[l++]);\n    use(l,r);\n}",
    "quiz": {
      "q": "什麼情況不該硬套 sliding window？",
      "options": [
        "左右界能單調前進",
        "合法性對 left/right 沒有單調性",
        "需要維護 sum"
      ],
      "answer": 1,
      "explain": "若縮小/擴大區間的合法性不可預測，就無法安全只往前走。"
    }
  },
  "3-monotonic-queue": {
    "why": "固定視窗最大值需要同時處理兩件事：前端元素可能過期；尾端元素可能被新值永久支配。Deque 正好能在兩端 O(1) 處理。",
    "pattern": "front removes expired; back removes dominated.",
    "steps": [
      "先從尾端刪除不可能再成為答案的 index。",
      "push 當前 index。",
      "從前端刪除已離開 window 的 index。",
      "front 就是目前最大/最小值位置。"
    ],
    "invariant": "deque 中 index 遞增，對應值保持單調。",
    "template": "deque<int> dq;\nfor(int i=0;i<n;i++){\n    while(!dq.empty() && a[dq.back()]<=a[i]) dq.pop_back();\n    dq.push_back(i);\n    while(dq.front()<=i-k) dq.pop_front();\n    if(i>=k-1) cout<<a[dq.front()]<<' ';\n}",
    "boss": "Q-3-13",
    "quiz": {
      "q": "為何通常存 index 而不是只存 value？",
      "options": [
        "index 比較小",
        "需要知道元素何時過期",
        "value 不能比較"
      ],
      "answer": 1,
      "explain": "滑出視窗是位置條件。"
    }
  },
  "4-greedy-basics": {
    "why": "Greedy 的難點不是寫 code，而是證明局部選擇不會傷害最優解。最常用的語言是交換論證：把某個最優解第一步換成你的選擇，答案不變差。",
    "pattern": "Find a safe local choice and prove it by exchange / staying-ahead.",
    "steps": [
      "先猜一個排序或選擇規則。",
      "拿任意最優解比較。",
      "證明把最優解局部替換成你的選擇不會更差。",
      "重複後得到完全符合 greedy 的最優解。"
    ],
    "invariant": "做到第 k 步時，存在至少一個全域最優解以目前已選 prefix 開頭。",
    "template": "// Greedy proof checklist\n// 1. What is the local choice?\n// 2. Why can an optimal solution be transformed to use it?\n// 3. What subproblem remains after taking it?",
    "quiz": {
      "q": "『看起來最划算』足以證明 greedy 正確嗎？",
      "options": [
        "足夠",
        "不夠，需要交換/領先等證明",
        "只要 sample 過就夠"
      ],
      "answer": 1,
      "explain": "Greedy 最容易出現反例，證明是演算法的一部分。"
    }
  },
  "4-scheduling": {
    "why": "排程題常把難點藏在排序 key。Activity selection 的最早結束優先、某些成本最小化的比值排序，都可以用相鄰交換比較導出。",
    "pattern": "Derive the comparator from swapping two adjacent jobs.",
    "steps": [
      "先假設兩工作 A、B 相鄰。",
      "比較 AB 與 BA 的總成本。",
      "整理不等式得到排序 key。",
      "排序後線性掃描建答案。"
    ],
    "invariant": "任何逆著正確 comparator 的相鄰對都可以交換而不變差。",
    "template": "sort(job.begin(),job.end(),[](auto A,auto B){\n    // write comparator derived from exchange argument\n    return ...;\n});",
    "quiz": {
      "q": "Activity selection 的經典排序 key？",
      "options": [
        "開始時間最早",
        "區間最短",
        "結束時間最早"
      ],
      "answer": 2,
      "explain": "先結束能保留最多後續空間。"
    }
  },
  "4-priority-queue": {
    "why": "當候選會隨掃描過程動態加入，而每一刻只需要目前最小/最大的候選，priority_queue 讓你不必每次重新排序整個集合。",
    "pattern": "Sweep events + push candidates + pop best / expired.",
    "steps": [
      "決定 heap 的排序方向。",
      "事件到達時 push 新候選。",
      "需要答案時取 top。",
      "若候選可能失效，使用 lazy deletion 反覆 pop 過期項。"
    ],
    "invariant": "heap top 是所有仍有效候選中的最佳者。",
    "template": "priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;\npq.push({key,id});\nwhile(!pq.empty() && invalid(pq.top())) pq.pop();\nif(!pq.empty()) use(pq.top());",
    "quiz": {
      "q": "priority_queue 做 lazy deletion 的理由？",
      "options": [
        "任意刪除不方便，等它到 top 再丟掉",
        "可以讓 O(logN) 變 O(1)",
        "避免使用 pair"
      ],
      "answer": 0,
      "explain": "Heap 擅長刪 top，不擅長刪任意位置。"
    }
  },
  "4-binary-answer": {
    "why": "有些題目問最小可行 X / 最大可行 X。若 check(X) 有單調性，就把『求答案』改成『判斷 X 是否可行』，再二分答案。",
    "pattern": "Optimization → monotone decision problem.",
    "steps": [
      "寫出 check(x) 的語意。",
      "證明 true/false 區間是單調的。",
      "決定 first true 或 last true。",
      "用最壞範圍設二分左右界。"
    ],
    "invariant": "二分區間始終夾住臨界點。",
    "template": "long long l=lo, r=hi; // find first feasible\nwhile(l<r){\n    long long mid=l+(r-l)/2;\n    if(check(mid)) r=mid;\n    else l=mid+1;\n}\nreturn l;",
    "quiz": {
      "q": "Binary search on answer 最先要證明什麼？",
      "options": [
        "答案是整數",
        "check(x) 單調",
        "N 已排序"
      ],
      "answer": 1,
      "explain": "沒有單調性就不能安全砍半答案空間。"
    }
  },
  "4-sweep-line": {
    "why": "把區間或幾何物件轉成事件，依座標排序後從左到右處理，就能把『同時存在的東西』維護在一個 active set 裡。",
    "pattern": "Events sorted by coordinate + active state.",
    "steps": [
      "把開始、結束、查詢等轉成事件。",
      "定義同座標事件 tie-break。",
      "按座標掃描並更新 active state。",
      "每個事件只做局部修改或查詢。"
    ],
    "invariant": "處理到座標 x 時，active state 恰好表示所有涵蓋 x 的物件。",
    "template": "struct Event{long long x; int type;};\nsort(ev.begin(),ev.end(),cmp);\nfor(auto e:ev){\n    if(e.type==ADD) add(e);\n    else if(e.type==REMOVE) remove(e);\n    else answer(e);\n}",
    "boss": "P-4-15",
    "quiz": {
      "q": "Sweep line 最容易出錯的地方？",
      "options": [
        "一定要用 set",
        "同座標事件處理順序與端點定義",
        "一定是 O(N)"
      ],
      "answer": 1,
      "explain": "閉區間 / 開區間會直接決定 add、query、remove 的 tie-break。"
    }
  },
  "5-divide-basics": {
    "why": "Divide & Conquer 把問題切成互相獨立的較小問題，再合併。複雜度通常來自『每層總工作量 × 層數』。",
    "pattern": "divide → recursively solve → combine.",
    "steps": [
      "找自然切點。",
      "遞迴解左右子問題。",
      "只設計必要的跨中線 combine。",
      "用 recurrence 分析成本。"
    ],
    "invariant": "進入 combine 時，所有子問題答案已經正確。",
    "template": "Answer solve(int l,int r){\n    if(r-l<=1) return base(l,r);\n    int m=(l+r)/2;\n    auto L=solve(l,m), R=solve(m,r);\n    return combine(L,R,l,m,r);\n}",
    "quiz": {
      "q": "若每層 combine 總成本 O(N)，深度 O(logN)，總成本？",
      "options": [
        "O(N)",
        "O(NlogN)",
        "O(N^2)"
      ],
      "answer": 1,
      "explain": "每一層 O(N)，共有 O(logN) 層。"
    }
  },
  "5-merge-inversion": {
    "why": "Merge sort 合併兩個已排序半部時，可以順手統計跨半部 inversion，因為一旦 right[j] < left[i]，它同時小於 left[i..end]。",
    "pattern": "Count cross information while merging sorted halves.",
    "steps": [
      "遞迴算左右半部 inversion。",
      "merge 時比較 left[i], right[j]。",
      "若 right[j] 更小，增加剩餘 left 數量。",
      "把合併結果寫回。"
    ],
    "invariant": "merge 前左右半部都已排序，且各自 inversion 已計數完成。",
    "template": "long long inv=0;\nwhile(i<m && j<r){\n    if(a[i]<=a[j]) tmp.push_back(a[i++]);\n    else{\n        inv += m-i;\n        tmp.push_back(a[j++]);\n    }\n}",
    "quiz": {
      "q": "right[j] < left[i] 時為何加 m-i？",
      "options": [
        "只是公式",
        "right[j] 也小於 left[i] 後面所有元素",
        "因為右半長度是 m-i"
      ],
      "answer": 1,
      "explain": "左半已排序，所以從 i 開始的所有左元素都比 right[j] 大。"
    }
  },
  "5-divide-patterns": {
    "why": "進階分治題的核心都是『跨中線資訊』。若 combine 仍然太慢，整個分治就失去意義。",
    "pattern": "Solve inside halves, then handle only cross-mid candidates.",
    "steps": [
      "先寫出答案分成 left / right / cross 三類。",
      "左右由遞迴處理。",
      "專心把 cross 壓到 O(N) 或 O(NlogN)。",
      "檢查 combine 是否重複做了可在上層維護的工作。"
    ],
    "invariant": "遞迴只負責區間內答案，combine 只補跨左右的答案。",
    "template": "// max subarray D&C idea\n// answer = max(leftAnswer, rightAnswer,\n//              bestSuffix(left) + bestPrefix(right));",
    "boss": "Q-5-8",
    "quiz": {
      "q": "Closest pair 分治中 strip 的目的？",
      "options": [
        "重新檢查所有點對",
        "只檢查可能跨中線且比目前答案更近的少量候選",
        "把點排序兩次"
      ],
      "answer": 1,
      "explain": "已知左右最佳距離 d，離中線超過 d 的點不可能形成跨中線更優解。"
    }
  },
  "6-dp-mindset": {
    "why": "DP 最難的是 state 定義，而不是 transition 公式。若一句話講不清 dp[state] 的意思，後面幾乎一定會亂。",
    "pattern": "Define state → base → transition → evaluation order → answer.",
    "steps": [
      "把 dp[...] 用一句話完整定義。",
      "列 base cases。",
      "枚舉最後一步 / 最後決策推 transition。",
      "確認所有依賴在使用前已完成。",
      "最後指出答案位在哪個 state。"
    ],
    "invariant": "每一個 dp state 都只代表同一種語意，不能一會兒『恰好』一會兒『至多』。",
    "template": "// Before coding, write:\n// dp[i] = ...\n// base: ...\n// transition: ...\n// order: ...\n// answer: ...",
    "quiz": {
      "q": "DP 卡住時最值得先檢查？",
      "options": [
        "陣列型別",
        "dp 定義是否精確一致",
        "是否用了 vector"
      ],
      "answer": 1,
      "explain": "多數 DP 錯誤其實是 state 語意混亂。"
    }
  },
  "6-1d0d": {
    "why": "1D0D 是最適合建立 DP 手感的類型：dp[i] 只看固定幾個前驅。重點是分清『前 i 個最佳』與『恰好以 i 結尾』。",
    "pattern": "Linear states with O(1) predecessor transitions.",
    "steps": [
      "選擇 index i 的語意。",
      "列出有限種最後一步。",
      "從前面固定幾個 state 轉移。",
      "必要時用滾動變數壓空間。"
    ],
    "invariant": "計算 dp[i] 時，它依賴的 state 已經完成。",
    "template": "vector<long long> dp(n+1, INF);\ndp[0]=0;\nfor(int i=1;i<=n;i++){\n    dp[i]=min(dp[i], dp[i-1]+cost1(i));\n    if(i>=2) dp[i]=min(dp[i], dp[i-2]+cost2(i));\n}",
    "quiz": {
      "q": "『dp[i]=前 i 個元素最佳』與『dp[i]=恰好選 i 的最佳』可以混用嗎？",
      "options": [
        "可以",
        "不可以，transition 會失去語意",
        "只有 Greedy 不可以"
      ],
      "answer": 1,
      "explain": "同一陣列的 state 定義必須一致。"
    }
  },
  "6-2d0d": {
    "why": "當 state 由兩個位置描述，例如兩個字串前綴或網格座標，就自然形成二維 DP 表。",
    "pattern": "2D state, each cell depends on a constant number of nearby cells.",
    "steps": [
      "定義 dp[i][j]。",
      "先處理第 0 列 / 第 0 欄。",
      "照依賴方向填表。",
      "必要時回溯 transition 重建答案。"
    ],
    "invariant": "填到 (i,j) 時，所有 transition 來源都已經完成。",
    "template": "for(int i=1;i<=n;i++){\n  for(int j=1;j<=m;j++){\n    if(a[i-1]==b[j-1]) dp[i][j]=dp[i-1][j-1]+1;\n    else dp[i][j]=max(dp[i-1][j],dp[i][j-1]);\n  }\n}",
    "quiz": {
      "q": "LCS 在 a[i-1]==b[j-1] 時最自然的 transition？",
      "options": [
        "dp[i-1][j-1]+1",
        "dp[i-1][j]+1",
        "dp[i][j-1]+1"
      ],
      "answer": 0,
      "explain": "同時使用兩個最後字元，所以退回兩個前綴。"
    }
  },
  "6-1d1d": {
    "why": "每個 dp[i] 若要枚舉所有 j<i，基礎就是 O(N^2)。先把正確 O(N^2) 寫清楚，再判斷 transition 是否有單調性可優化。",
    "pattern": "For each endpoint i, enumerate the previous breakpoint j.",
    "steps": [
      "把 j 解釋成前一個決策位置。",
      "明確 j 的合法範圍。",
      "先寫 O(N^2) transition。",
      "再觀察是否能二分、deque、prefix best 等最佳化。"
    ],
    "invariant": "每一種合法解都能被唯一地視為某個最後轉移 j→i。",
    "template": "for(int i=0;i<n;i++){\n    dp[i]=base(i);\n    for(int j=0;j<i;j++) if(ok(j,i))\n        dp[i]=best(dp[i], dp[j]+gain(j,i));\n}",
    "quiz": {
      "q": "看到 O(N^2) transition，第一步應該？",
      "options": [
        "直接上 segment tree",
        "先確保 state/transition 正確，再找結構",
        "改成 recursion 就會快"
      ],
      "answer": 1,
      "explain": "優化錯誤 DP 只會更難 debug。"
    }
  },
  "6-interval-advanced": {
    "why": "AP325 後段 DP 開始把 state 擴成區間或集合。共同思路仍不變：先定義 state，再決定一個能保證依賴已完成的計算順序。",
    "pattern": "Interval DP by length; Bitmask DP by subset inclusion.",
    "steps": [
      "Interval DP：由短區間到長區間。",
      "枚舉最後切點 k。",
      "Bitmask DP：mask 表示已選集合。",
      "transition 增加一個尚未選的元素。",
      "嚴格估算 state 數與每 state 轉移數。"
    ],
    "invariant": "任何 transition 都從『更小的區間 / 更少元素的集合』走到更大 state。",
    "template": "// interval DP\nfor(int len=2;len<=n;len++)\n  for(int l=0;l+len<=n;l++){\n    int r=l+len;\n    for(int k=l+1;k<r;k++)\n      dp[l][r]=min(dp[l][r],dp[l][k]+dp[k][r]+cost(l,k,r));\n  }",
    "boss": "Q-6-25",
    "quiz": {
      "q": "Bitmask DP 最大風險通常是？",
      "options": [
        "沒有 recursion",
        "state 數 2^N 爆炸",
        "不能用 long long"
      ],
      "answer": 1,
      "explain": "先估 2^N × transition，否則很容易在正確前就 TLE/MLE。"
    }
  },
  "7-graph-foundation": {
    "why": "圖論先不要想成『畫圖』，而是把每個狀態編號，再列出可以一步走到哪些狀態。鄰接串列只是這個轉移關係的儲存方式。",
    "pattern": "State = vertex; transition = edge.",
    "steps": [
      "決定 vertex 代表什麼。",
      "無向邊記得雙向加入。",
      "需要權重就存 pair/struct。",
      "另外維護 visited/dist/parent，不把演算法狀態塞進圖本身。"
    ],
    "invariant": "g[u] 應該完整列出從 u 可以一步轉移到的所有鄰居。",
    "template": "vector<vector<pair<int,int>>> g(n);\nfor(int i=0;i<m;i++){\n    int u,v,w; cin>>u>>v>>w;\n    g[u].push_back({v,w});\n    g[v].push_back({u,w}); // remove for directed\n}",
    "quiz": {
      "q": "無向圖 adjacency list 最常見漏誤？",
      "options": [
        "沒有 sort",
        "只加入 u→v 忘記 v→u",
        "用 vector"
      ],
      "answer": 1,
      "explain": "無向邊在鄰接串列中通常要放兩個方向。"
    }
  },
  "7-bfs": {
    "why": "BFS 的 queue 讓距離 d 的節點一定在距離 d+1 之前被展開，因此在無權圖中第一次到達就是最短路。",
    "pattern": "Queue preserves nondecreasing distance layers.",
    "steps": [
      "起點 dist=0 並立刻標記 visited。",
      "push 起點。",
      "pop u，掃所有鄰居 v。",
      "未到達 v 時設定 dist[v]=dist[u]+1、parent[v]=u 並入隊。"
    ],
    "invariant": "queue 中節點的 dist 由前到後不遞減。",
    "template": "queue<int> q;\nvector<int> dist(n,-1),par(n,-1);\ndist[s]=0; q.push(s);\nwhile(!q.empty()){\n    int u=q.front(); q.pop();\n    for(int v:g[u]) if(dist[v]==-1){\n        dist[v]=dist[u]+1; par[v]=u; q.push(v);\n    }\n}",
    "boss": "Q-7-5",
    "quiz": {
      "q": "為什麼通常在『入隊時』就標記 visited？",
      "options": [
        "避免同一節點被多次入隊",
        "因為 pop 很慢",
        "queue 不支援重複值"
      ],
      "answer": 0,
      "explain": "若等到出隊才標記，多個前驅可能重複把同一點塞進 queue。"
    }
  },
  "7-dfs-dag": {
    "why": "DFS 適合深入探索結構；DAG 額外提供無環性，讓所有依賴可以排成拓樸序，再在線性時間做 DP 或最短路。",
    "pattern": "DFS for structure; topological order for dependency-respecting computation.",
    "steps": [
      "DFS 用 visited / color 區分狀態。",
      "DAG 可用 DFS postorder 或 Kahn indegree 得 topological order。",
      "依拓樸序做 transition。",
      "若無法取完所有點，代表存在 cycle。"
    ],
    "invariant": "拓樸序中每條有向邊 u→v 都滿足 u 出現在 v 前面。",
    "template": "queue<int> q;\nfor(int i=0;i<n;i++) if(indeg[i]==0) q.push(i);\nwhile(!q.empty()){\n  int u=q.front(); q.pop(); order.push_back(u);\n  for(int v:g[u]) if(--indeg[v]==0) q.push(v);\n}",
    "quiz": {
      "q": "Kahn algorithm 最後 order.size()<n 代表？",
      "options": [
        "圖不連通",
        "圖有 directed cycle",
        "queue 用錯"
      ],
      "answer": 1,
      "explain": "環上的點永遠無法全部降到 indegree 0。"
    }
  },
  "7-dijkstra": {
    "why": "Dijkstra 在非負邊權圖中，用 min-heap 每次取出目前距離最小的候選；一旦這個候選是最新值，它就不可能再被更晚路徑改善。",
    "pattern": "Best-first expansion + relaxation.",
    "steps": [
      "dist[s]=0，其餘 INF。",
      "min-heap push (0,s)。",
      "pop (d,u)，若 d!=dist[u] 就跳過 stale entry。",
      "對每條 u→v 做 relax，改善就 push 新候選。"
    ],
    "invariant": "被以最新最小距離 pop 的 u，其 dist[u] 已確定。",
    "template": "priority_queue<pair<ll,int>,vector<pair<ll,int>>,greater<pair<ll,int>>> pq;\ndist[s]=0; pq.push({0,s});\nwhile(!pq.empty()){\n auto [d,u]=pq.top(); pq.pop();\n if(d!=dist[u]) continue;\n for(auto [v,w]:g[u]) if(dist[v]>d+w){\n   dist[v]=d+w; pq.push({dist[v],v});\n }\n}",
    "quiz": {
      "q": "Dijkstra 為何不能直接處理負邊？",
      "options": [
        "priority_queue 不支援負數",
        "已確定的最小距離可能之後被負邊改善",
        "long long 會 overflow"
      ],
      "answer": 1,
      "explain": "非負邊權是 greedy 確定距離的關鍵前提。"
    }
  },
  "7-dsu-mst": {
    "why": "DSU 回答『兩點是否已在同一連通塊』；Kruskal 正好需要在按權重加入邊時避免形成 cycle，因此兩者天然結合。",
    "pattern": "Sort edges by weight; add if endpoints are in different components.",
    "steps": [
      "DSU 用 parent + size/rank。",
      "find 做 path compression。",
      "Kruskal 先按邊權排序。",
      "若 find(u)!=find(v) 就 unite 並收進 MST。"
    ],
    "invariant": "已選邊始終是一座森林；每次加入的是跨兩個 component 的當前最輕邊。",
    "template": "for(auto [w,u,v]:edges){\n    if(find(u)==find(v)) continue;\n    unite(u,v);\n    ans += w;\n    ++used;\n}",
    "boss": "P-7-12",
    "quiz": {
      "q": "Kruskal 遇到 u,v 已在同一 DSU 集合時為何跳過？",
      "options": [
        "那條邊一定最重",
        "加入會形成 cycle",
        "DSU 不能再 union"
      ],
      "answer": 1,
      "explain": "MST 必須保持 acyclic。"
    }
  },
  "8-tree-traversal": {
    "why": "樹是沒有 cycle 的連通圖。選一個 root 後，parent/depth/subtree 等概念都能用一次 DFS/BFS 建立。",
    "pattern": "Root the tree, then every edge becomes parent-child except the edge back to parent.",
    "steps": [
      "指定 root。",
      "DFS/BFS 傳入 parent，避免走回去。",
      "計算 depth、parent、subtree size。",
      "需要子樹區間時記 tin/tout。"
    ],
    "invariant": "對 root 以外每個節點，都有唯一 parent。",
    "template": "void dfs(int u,int p){\n    parent[u]=p;\n    sz[u]=1;\n    for(int v:g[u]) if(v!=p){\n        depth[v]=depth[u]+1;\n        dfs(v,u);\n        sz[u]+=sz[v];\n    }\n}",
    "quiz": {
      "q": "樹 DFS 為何常不需要 visited 陣列？",
      "options": [
        "樹沒有邊",
        "只要跳過 parent 就不會形成其他 cycle",
        "DFS 會自動避免 cycle"
      ],
      "answer": 1,
      "explain": "樹的唯一簡單路徑性讓 back edge 只有 parent 那條。"
    }
  },
  "8-bottom-up-dp": {
    "why": "Tree DP 的共同骨架是 postorder：先得到每個 child 的答案，再把它們合併成 parent 的 state。",
    "pattern": "Children first, parent later.",
    "steps": [
      "定義 dp[u][state]。",
      "DFS 到 child。",
      "把 child 的多種 state 合併。",
      "最後完成 u 並回傳給 parent。"
    ],
    "invariant": "處理 u 的 transition 時，所有 child 的 DP 已完整計算。",
    "template": "void dfs(int u,int p){\n  dp[u][0]=0; dp[u][1]=1;\n  for(int v:g[u]) if(v!=p){\n    dfs(v,u);\n    dp[u][0]+=dp[v][1];\n    dp[u][1]+=min(dp[v][0],dp[v][1]);\n  }\n}",
    "quiz": {
      "q": "Tree DP 最自然的計算順序？",
      "options": [
        "preorder 先父後子",
        "postorder 先子後父",
        "依節點編號"
      ],
      "answer": 1,
      "explain": "parent transition 依賴 child state。"
    }
  },
  "8-reroot-relations": {
    "why": "如果要算『每個節點當 root』的答案，不需要重跑 N 次 DFS。先算一個 root 的子樹資訊，再把父答案 O(1) 推給 child，就是 rerooting。",
    "pattern": "down DP + parent-to-child transfer.",
    "steps": [
      "第一次 DFS 算 subtree/down 資訊。",
      "求一個 root 的完整答案。",
      "第二次 DFS 把答案從 u 推到 child v。",
      "推導只調整跨 u-v 這條邊造成的貢獻。"
    ],
    "invariant": "從 u reroot 到相鄰 v 時，只有 u-v 兩側的角色互換，其餘結構不變。",
    "template": "// example: sum of distances\nvoid reroot(int u,int p){\n  for(int v:g[u]) if(v!=p){\n    ans[v] = ans[u] + n - 2*sz[v];\n    reroot(v,u);\n  }\n}",
    "boss": "Q-8-16",
    "quiz": {
      "q": "Rerooting 能把『每個 root 各跑一次 O(N)』降到什麼？",
      "options": [
        "通常 O(N)",
        "O(N^2)",
        "O(logN)"
      ],
      "answer": 0,
      "explain": "兩次 DFS，每條邊只做常數次轉移。"
    }
  }
};

export const WORLD_BOSSES = {
  1:'Q-1-10', 2:'P-2-15', 3:'Q-3-13', 4:'P-4-15', 5:'Q-5-8', 6:'Q-6-25', 7:'P-7-12', 8:'Q-8-16'
};
