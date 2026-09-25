export const world5Guides = {
  "5-divide-basics": {
    title: "Divide & Conquer：先分清楚 divide、conquer、combine",
    source: "AP325 5.1 與 P-5-1，教材頁 144–147",
    intro: "分治不是『看到 recursion 就算』。真正的結構是：把一個大小 N 的問題切成幾個較小且互相獨立的子問題，遞迴解完，再用可控的成本合併。分析時要同時看遞迴深度與每層總工作量。",
    objectives: [
      "能把問題拆成 divide / conquer / combine 三段",
      "會用 recursion tree 估 T(N)=2T(N/2)+O(N)",
      "能辨認什麼題其實是重疊子問題，應改用 DP"
    ],
    focus: {
      code: "P-5-1",
      prompt: "先想：找最大值與最小值明明線性掃描就能做，為什麼 AP325 還把它放在分治？因為這題是最乾淨的『切半→解兩邊→O(1) 合併』模型。",
      questions: [
        "solve(l,r) 應該回傳什麼，才能讓 combine 最簡單？",
        "base case 用單元素還是空區間？",
        "每層總共會處理多少元素 / 做多少次比較？"
      ]
    },
    blocks: [
      {
        type: "text",
        id: "three-parts",
        title: "分治的三個角色",
        paragraphs: [
          "Divide 決定如何切問題；Conquer 只是把較小問題交給同一個函式；Combine 才是最有價值的地方，因為它描述『已知子答案後，如何得到原答案』。",
          "寫分治時不要只盯著 recursive call。先把 combine 寫成一句話：最大最小值是左右答案各自取 max/min；merge sort 是合併兩個已排序序列；最大子陣列則還要處理跨中線答案。"
        ]
      },
      {
        type: "steps",
        id: "recursion-tree",
        title: "用 recursion tree 分析複雜度",
        intro: "比背 Master theorem 更重要的是會看『每層做多少工作』。",
        steps: [
          { title: "看一層有幾個子問題", body: "若每次切兩半，第 k 層大約有 2^k 個子問題，每個大小 N/2^k。" },
          { title: "算該層總 combine 成本", body: "若每個子問題 combine 與其長度成正比，該層總成本仍是 O(N)。" },
          { title: "算深度", body: "每次除以 2，到大小 1 約有 log2 N 層。" },
          { title: "相乘", body: "每層 O(N) × O(log N) 層 = O(N log N)。若 combine 只有 O(1)，總成本可能降到 O(N)。" }
        ]
      },
      {
        type: "example",
        id: "minmax",
        title: "P-5-1：最大值與最小值",
        problem: "solve(l,r) 回傳區間 [l,r) 的 {min,max}。",
        steps: [
          "若 r-l==1，答案就是 {a[l],a[l]}。",
          "mid=(l+r)/2，遞迴得到左半 L 與右半 R。",
          "combine：min=min(L.min,R.min)，max=max(L.max,R.max)。",
          "每個葉節點只被建立一次，內部節點只做常數次比較。"
        ],
        conclusion: "這個例子展示分治的骨架，而不是要取代線性掃描。重要的是學會把『子答案需要保存什麼』設計清楚。"
      },
      {
        type: "code",
        id: "dc-template",
        title: "最小分治模板",
        code: "struct Ans{ long long mn, mx; };\n\nAns solve(int l,int r){\n    if(r-l==1) return {a[l],a[l]};\n    int m=(l+r)/2;\n    Ans L=solve(l,m);\n    Ans R=solve(m,r);\n    return {min(L.mn,R.mn), max(L.mx,R.mx)};\n}",
        notes: [
          "使用半開區間 [l,r) 會讓長度直接是 r-l。",
          "每次 recursive call 必須保證區間真的變小。",
          "如果左右子問題會重複出現，這就開始像 DP，而不是純分治。"
        ]
      },
      {
        type: "callout",
        id: "dc-vs-dp",
        title: "分治 vs DP",
        body: "分治通常把問題切成互不重疊的子問題；DP 常遇到大量相同 state 被重複需要。Naive Fibonacci 雖然長得像分治，但子問題嚴重重疊，所以應 memoize。",
        tone: "tip"
      }
    ],
    practice: [
      { code: "P-5-1", level: "focus", why: "最乾淨的 divide / conquer / combine 骨架。" }
    ],
    checkpoints: [
      { q: "T(N)=2T(N/2)+O(N) 為什麼通常是 O(N log N)？", a: "每層所有子問題的線性 combine 總成本是 O(N)，而切半遞迴有 O(log N) 層。" },
      { q: "看到 recursion 就能叫 divide and conquer 嗎？", a: "不能。要看是否真的把問題切成較小子問題並合併；若大量 state 重疊，更接近 DP。" }
    ],
    mastery: [
      "能先寫 combine 再寫 recursion",
      "會用 recursion tree 分析每層成本",
      "能辨認分治與 DP 的差別"
    ]
  },

  "5-merge-inversion": {
    title: "Merge Sort 與 Inversion：在 merge 的瞬間一次算掉一整批 pair",
    source: "AP325 5.2，P-5-3、P-5-4，教材頁 149–152",
    intro: "Merge sort 的價值不只是排序。因為合併前左右兩半已經排序，很多跨半部資訊可以在 merge 時一次統計。反序數量就是最經典例子：原本 O(N²) 的 pair 計數，被排序結構壓成 O(N log N)。",
    objectives: [
      "會從零寫 merge sort",
      "能解釋 inversion 為何在 right[j] < left[i] 時一次增加剩餘左半數量",
      "會處理相等值與 long long 計數"
    ],
    focus: {
      code: "P-5-4",
      prompt: "先不要寫 merge sort。先問：如果左右兩半各自都已排序，當 right[j] < left[i] 時，你可以一次確定多少個跨半部 inversion？",
      questions: [
        "為什麼不是只加 1？",
        "相等值算不算 inversion？",
        "最大 inversion 數量需要 int 還是 long long？"
      ]
    },
    blocks: [
      {
        type: "text",
        id: "merge-invariant",
        title: "Merge 的 invariant：兩邊尚未取出的部分都仍有序",
        paragraphs: [
          "merge 時用 i、j 指向左右兩個 sorted range 的第一個未取元素。較小者一定是所有未取元素中的下一個，因此可以安全放進輸出。",
          "這個 invariant 不只讓排序正確，也讓我們知道『如果 right[j] 已經小於 left[i]，那它也小於 left[i+1], left[i+2]...』。"
        ]
      },
      {
        type: "example",
        id: "inversion-trace",
        title: "P-5-4：反序數量",
        problem: "合併左半 [3,5,8] 與右半 [1,4,7]。",
        steps: [
          "3 vs 1：1 較小。因為左半有序，所以 1 同時和 3、5、8 形成 inversion，一次加 3。",
          "3 vs 4：取 3，不新增 inversion。",
          "5 vs 4：4 較小，和 5、8 形成 2 個 inversion。",
          "5 vs 7：取 5；8 vs 7 再加 1。"
        ],
        conclusion: "跨半部 inversion 共 6。關鍵不是『看到小的就 +1』，而是利用 sorted invariant 一次加上左半剩餘數量。"
      },
      {
        type: "code",
        id: "inversion-code",
        title: "Merge sort + inversion count",
        code: "long long solve(int l,int r){\n    if(r-l<=1) return 0;\n    int m=(l+r)/2;\n    long long inv=solve(l,m)+solve(m,r);\n\n    int i=l,j=m;\n    vector<long long> tmp;\n    tmp.reserve(r-l);\n    while(i<m && j<r){\n        if(a[i] <= a[j]) tmp.push_back(a[i++]);\n        else{\n            inv += m-i;\n            tmp.push_back(a[j++]);\n        }\n    }\n    while(i<m) tmp.push_back(a[i++]);\n    while(j<r) tmp.push_back(a[j++]);\n    copy(tmp.begin(),tmp.end(),a.begin()+l);\n    return inv;\n}",
        notes: [
          "若 inversion 定義是 a[i] > a[j]，相等不能算，因此比較用 <= 讓左側先取。",
          "最大 inversion 約 N(N-1)/2，N 大時必須 long long。",
          "若不把 merge 結果寫回，上一層就失去『兩半已排序』的 invariant。"
        ]
      },
      {
        type: "text",
        id: "generalization",
        title: "把『一次算一批』的觀察帶到其他題",
        paragraphs: [
          "Merge-based counting 的共通套路是：左右半部都已經有序，因此一旦某個 inequality 成立，常常可以一次確定一整段元素都成立。",
          "後面遇到 pair counting、dominance、offline query 時，可以主動問：排序後能不能把逐 pair 檢查改成整段計數？"
        ]
      }
    ],
    practice: [
      { code: "P-5-3", level: "core", why: "先把純 merge sort 寫熟，確保合併 invariant 沒問題。" },
      { code: "P-5-4", level: "focus", why: "在 merge 上加跨半部統計，是本 module 的核心。" }
    ],
    checkpoints: [
      { q: "為什麼 right[j] < left[i] 時可以加 m-i？", a: "因為左半已排序，left[i] 到 left[m-1] 全都 >= left[i] > right[j]，每個都與 right[j] 形成 inversion。" },
      { q: "若相等值不算 inversion，merge 比較為什麼常寫 <=？", a: "讓相等時先取左側，就不會把相等錯誤算成右值跨過左值。" }
    ],
    mastery: [
      "能不看模板寫 merge sort",
      "能手算一段 merge 的 inversion 增量",
      "知道何時 pair counting 可以借排序一次算一批"
    ]
  },

  "5-divide-patterns": {
    title: "分治題型：真正的難點永遠在 cross-mid",
    source: "AP325 5.2–5.3，P-5-2、Q-5-5、P-5-6、P-5-7、Q-5-8，教材頁 147–160",
    intro: "進階分治不再只是『切半然後 merge』。你要先把答案分類成左、右、跨中線三種；左右交給遞迴，所有創意都集中在 cross-mid 如何比暴力更快。",
    objectives: [
      "會把答案拆成 left / right / cross 三類",
      "會設計 O(N) 或 O(N log N) 的 combine",
      "能比較同一題的分治版與線性 / sweep-line 版"
    ],
    focus: {
      code: "P-5-2",
      prompt: "最大連續子陣列的答案只有三種位置：全在左、全在右、跨中線。前兩個遞迴已處理；跨中線的最佳區間有什麼固定形狀？",
      questions: [
        "跨中線區間的左半一定是什麼？",
        "右半一定是什麼？",
        "combine 能不能只掃左右各一次？"
      ]
    },
    blocks: [
      {
        type: "steps",
        id: "cross-mid-framework",
        title: "Cross-mid 四步框架",
        steps: [
          { title: "先列完整分類", body: "證明任一合法答案必定屬於 left-only、right-only、cross-mid 其中之一。" },
          { title: "遞迴處理前兩類", body: "不要在 combine 重算左右內部答案。" },
          { title: "找 cross 的必要條件", body: "最大子陣列跨中線時必含左 suffix 與右 prefix；closest pair 跨中線時兩點都必須靠近中線。" },
          { title: "把候選量壓小", body: "利用排序、幾何 packing、prefix/suffix summary 等結構，把跨中線從 O(N²) 壓到 O(N) 或 O(N log N)。" }
        ]
      },
      {
        type: "example",
        id: "max-subarray-dc",
        title: "P-5-2：最大連續子陣列（分治）",
        problem: "區間 [l,r) 從 mid 切開。",
        steps: [
          "左半最佳由 solve(l,mid) 回傳。",
          "右半最佳由 solve(mid,r) 回傳。",
          "跨中線答案一定是『左半以 mid-1 結尾的最大 suffix』+『右半以 mid 開始的最大 prefix』。",
          "左右各線性掃一次即可得到 cross，三者取 max。"
        ],
        conclusion: "這個做法是 O(N log N)。它不是這題最快解（Kadane 可 O(N)），但非常適合學 cross-mid combine。"
      },
      {
        type: "text",
        id: "closest-pair",
        title: "Q-5-5：Closest Pair 的 strip 為什麼夠小",
        paragraphs: [
          "遞迴後左右半各有最佳距離 d。若跨中線的一對點距離要 < d，那兩點的 x 座標都必須落在距中線 d 的 strip 內；離太遠的點可以直接排除。",
          "再把 strip 依 y 排序。平面 packing 性質保證：對每個點，不需要向後比較整個 strip，只要比較常數個 y 很接近的候選。這就是幾何分治真正把 O(N²) 壓掉的地方。"
        ]
      },
      {
        type: "callout",
        id: "combine-warning",
        title: "如果 combine 還是 O(N²)，分治多半沒有救到你",
        body: "先寫 recurrence。T(N)=2T(N/2)+O(N²) 仍然是 O(N²) 量級。切半本身不會自動變快；真正的加速來自 cross-mid 候選被結構化地縮小。",
        tone: "warning"
      },
      {
        type: "table",
        id: "same-problem-different-techniques",
        title: "同一題，不同技巧是在利用不同結構",
        headers: ["問題", "分治的關鍵", "另一種常見解法"],
        rows: [
          ["最大連續子陣列", "suffix + prefix 組 cross", "Kadane O(N)"],
          ["Closest pair", "strip + y-order packing", "sweep line O(N log N)"],
          ["完美彩帶", "把答案拆成跨中線條件", "sliding window / 其他結構視版本而定"]
        ]
      }
    ],
    practice: [
      { code: "P-5-2", level: "focus", why: "最乾淨的 left/right/cross 三分法。" },
      { code: "P-5-6", level: "core", why: "練習重新設計 cross-mid summary，而不是只會最大子陣列模板。" },
      { code: "P-5-7", level: "core", why: "驗證你能從題意自己找 combine。" },
      { code: "Q-5-5", level: "challenge", why: "幾何分治經典；strip 的候選縮減是重點。" },
      { code: "Q-5-8", level: "challenge", why: "章末驗收：同一問題換分治觀點，檢查你是否真的掌握 cross-mid。" }
    ],
    checkpoints: [
      { q: "最大子陣列的 cross-mid 為什麼是 left suffix + right prefix？", a: "任何跨越 mid 的連續區間，在左半必然從某處一路延伸到 mid-1，因此是 suffix；右半同理是從 mid 開始的 prefix。" },
      { q: "分治的 combine 若是 O(N²)，為什麼常沒有加速？", a: "因為 recurrence 的每層成本太高；切半只降低子問題大小，若合併仍平方級，總量級通常仍是平方級。" }
    ],
    mastery: [
      "看到分治題會先列 left/right/cross",
      "能自己設計跨中線必要條件",
      "知道同一題可以有分治、greedy、sweep-line 等不同解法"
    ]
  }
};
