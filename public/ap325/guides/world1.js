export const world1Guides = {
  "1-recursion-model": {
    "title": "遞迴：先定義函式，再相信較小問題",
    "source": "AP325 1.1–1.2，教材頁 16–24",
    "intro": "AP325 把遞迴分成兩種使用情境：把遞迴定義直接翻成程式，以及用遞迴做窮舉。這個 module 先處理第一種。最重要的不是 call stack，而是你能不能用一句話說清楚 f(state) 代表什麼。",
    "objectives": [
      "會寫精確的 recursive function contract",
      "會找 base case 與縮小方向",
      "會處理巢狀輸入、區間切割等天然遞迴結構"
    ],
    "focus": {
      "code": "P-1-1",
      "prompt": "先不要想『我要怎麼 parse 整串』。想像函式 solve() 從目前 token 開始，吃掉一個完整 expression 並回傳它的值。",
      "questions": [
        "如果下一個 token 是整數，base case 是什麼？",
        "如果是 f，需要再取得幾個子 expression？",
        "如果是 g，需要再取得幾個？"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "contract",
        "title": "第一步永遠是寫出函式 contract",
        "paragraphs": [
          "遞迴最常見的失敗，是一進來就開始想『這層要做什麼』。更穩的方法是先寫：solve(pos) 代表『從 pos 開始解析一個完整結構，回傳它的答案與新的位置』。一旦 contract 清楚，這層只需要辨認目前類型，較小的部分交給同一個函式。",
          "你不需要在每層重新理解整個問題。遞迴的信念是：假設較小問題已經被 solve 正確解完，我只負責把它們組合起來。"
        ]
      },
      {
        "type": "steps",
        "id": "three-parts",
        "title": "任何遞迴都檢查三件事",
        "steps": [
          {
            "title": "Base case",
            "body": "哪個最小輸入可以直接回答？沒有 base case 就不會停。"
          },
          {
            "title": "Progress",
            "body": "每次 recursive call 的問題規模必須變小，或 state 必須更接近終止狀態。"
          },
          {
            "title": "Combine",
            "body": "子問題回來後，這一層如何用 O(1) 或可控成本組成答案？"
          }
        ]
      },
      {
        "type": "example",
        "id": "prefix-expression",
        "title": "P-1-1：把合成函數看成一棵隱形 syntax tree",
        "problem": "token 序列：f g f 1 3。f(x)=2x-1，g(x,y)=x+2y-3。",
        "steps": [
          "solve() 看到 f：它需要一個完整子 expression，所以遞迴呼叫 solve()。",
          "下一層看到 g：它需要兩個子 expression。先 solve() 得到 f 1 = 1，再 solve() 得到 3。",
          "g(1,3)=4，返回上一層。",
          "最外層計算 f(4)=7。"
        ],
        "conclusion": "程式裡沒有真的建樹，但遞迴呼叫順序已經隱含了 expression tree。這也是 AP325 說的『心中有樹，程式中無樹』的一種典型情況。"
      },
      {
        "type": "code",
        "id": "focus-implementation",
        "title": "Focus implementation：recursive parser",
        "code": "long long solve(){\n    string t;\n    cin >> t;\n\n    if(t == \"f\"){\n        long long x = solve();\n        return 2*x - 1;\n    }\n    if(t == \"g\"){\n        long long x = solve();\n        long long y = solve();\n        return x + 2*y - 3;\n    }\n    return stoll(t);\n}\n\nint main(){\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    cout << solve() << '\\n';\n}",
        "notes": [
          "輸入已把括號與逗號換成空白，所以 token stream 本身就能由遞迴消耗。",
          "每次 solve() 恰好吃掉一個完整 expression；這就是最重要的 invariant。",
          "不需要先把所有 token 存陣列，只要 cin 的讀取順序和遞迴結構一致即可。"
        ]
      },
      {
        "type": "text",
        "id": "interval-recursion",
        "title": "第二種天然遞迴：區間切割",
        "paragraphs": [
          "P-1-3、Q-1-4 這類題不是 parsing，而是『一個大區間的答案由切割後的小區間答案組成』。此時 contract 可寫成 solve(l,r) = 處理 [l,r) 這段的答案。",
          "區間遞迴的兩個危險點是：base case 的長度，以及 mid 是否保證讓左右兩段都變小。先把區間慣例固定成 [l,r) 會比較少 off-by-one。"
        ]
      },
      {
        "type": "callout",
        "id": "recursion-cost",
        "title": "遞迴漂亮，不代表有效率",
        "body": "如果一個 state 會重複呼叫相同子問題，例如 naive Fibonacci，一棵 recursion tree 會重複展開，成本可能指數成長。後面的 DP 就是在解這個問題。",
        "tone": "warning"
      }
    ],
    "practice": [
      {
        "code": "P-1-1",
        "level": "focus",
        "why": "最乾淨的 recursive contract 練習：一個 call 吃一個 expression。"
      },
      {
        "code": "Q-1-2",
        "level": "core",
        "why": "同樣是語法樹概念，但結構更複雜，檢查你是否真的理解 parser contract。"
      },
      {
        "code": "P-1-3",
        "level": "core",
        "why": "把 contract 從 token stream 換成區間。"
      },
      {
        "code": "Q-1-5",
        "level": "core",
        "why": "四分遞迴與區塊面積，練習問題規模縮小。"
      },
      {
        "code": "Q-1-4",
        "level": "challenge",
        "why": "切割位置與遞迴結構較難，是本節的高階驗收。"
      }
    ],
    "checkpoints": [
      {
        "q": "為什麼 recursive parser 不需要顯式 position 也能工作？",
        "a": "因為 cin 本身就是一個只能往前的 token stream；每個 solve() 依 contract 恰好消耗一個完整 expression，呼叫返回後輸入游標自然已位於下一個 token。"
      },
      {
        "q": "遞迴正確性的兩個必要條件是什麼？",
        "a": "base case 能直接回答，且每次 recursive call 都朝 base case 前進；此外 combine 必須和函式 contract 一致。"
      }
    ],
    "mastery": [
      "能先寫 contract 再寫 recursive call",
      "能畫出至少一個小例子的 call tree",
      "能解釋每次 call 為何一定會終止"
    ]
  },
  "1-enumeration": {
    "title": "遞迴窮舉：把所有答案變成決策樹",
    "source": "AP325 1.3 前半，教材頁 25–28",
    "intro": "暴搜不是『亂試』。好的暴搜會先找出每一層要做的決策，讓每個合法答案恰好對應一條 root-to-leaf 路徑。這樣你才能證明不重不漏，也才能知道要在哪裡剪枝。",
    "objectives": [
      "會用選 / 不選枚舉 subset",
      "會估 O(2^N) 與葉節點額外成本",
      "會把目前答案增量維護而不是每個葉節點重算"
    ],
    "focus": {
      "code": "P-1-7",
      "prompt": "對每個元素只有兩個選擇：選或不選。先把這兩條 branch 寫出來，再處理乘積。",
      "questions": [
        "depth i 代表什麼？",
        "product 應該在進入 branch 時更新，還是到葉節點重算？",
        "N 多大時 2^N 才可接受？"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "decision-tree",
        "title": "枚舉的核心：一層只做一個決策",
        "paragraphs": [
          "假設有 N 個元素，每個元素選或不選。depth i 表示前 i 個元素已經決定；接著只有兩個 branch：不選 a[i]，或選 a[i]。走到 i==N，就得到一個完整 subset。",
          "這個模型的重要性是『唯一性』：每個 subset 都有唯一的 0/1 決策序列，因此不會漏、也不會重複。"
        ]
      },
      {
        "type": "example",
        "id": "subset-tree",
        "title": "N=3 的 subset tree",
        "problem": "a = [2,3,5]，枚舉所有 subset product。",
        "steps": [
          "i=0：不選 2 / 選 2。",
          "每個 branch 到 i=1：再分不選 3 / 選 3。",
          "到 i=2：再分不選 5 / 選 5。",
          "8 個葉節點對應 000,001,...,111，也就是全部 2^3 個子集合。"
        ],
        "conclusion": "不要把 subset enumeration 當『三層神秘遞迴』；它就是讀一個長度 N 的 binary decision string。"
      },
      {
        "type": "code",
        "id": "subset-template",
        "title": "Subset enumeration 模板",
        "code": "vector<long long> a;\nlong long answer = 0;\n\nvoid dfs(int i, long long product){\n    if(i == (int)a.size()){\n        use(product);\n        return;\n    }\n\n    dfs(i+1, product);          // 不選 a[i]\n    dfs(i+1, product*a[i]);     // 選 a[i]\n}",
        "notes": [
          "product 是 prefix decision 的狀態，所以進入下一層時增量更新。",
          "若葉節點再重新掃一次已選元素，會把 O(2^N) 變成 O(N2^N)。",
          "若乘積可能很大，先做範圍判斷或使用更寬型別。"
        ]
      },
      {
        "type": "text",
        "id": "pruning",
        "title": "剪枝不是魔法：必須證明整棵子樹都不可能",
        "paragraphs": [
          "假設所有 a[i] 都是正數，且你只關心 product ≤ K。當目前 product 已經 > K，後面再乘正整數只會更大，所以整個 subtree 都可 prune。",
          "但如果元素可能是 0、負數或分數，這個單調性就不存在，不能照抄同一個 pruning。剪枝的本質仍是證明『從這個 state 出發，所有完成答案都不可能更好 / 合法』。"
        ]
      },
      {
        "type": "callout",
        "id": "when-to-stop",
        "title": "看到 N≈40，不要硬跑 2^N",
        "body": "這正是第二章 Meet in the Middle 要處理的典型規模：把 40 切成 20+20，各自枚舉約一百萬個 subset。",
        "tone": "tip"
      }
    ],
    "practice": [
      {
        "code": "P-1-7",
        "level": "focus",
        "why": "標準 subset enumeration，先把 decision tree 寫穩。"
      },
      {
        "code": "Q-1-8",
        "level": "core",
        "why": "同樣的 0/1 決策，但答案條件不同，驗證你不是只背 P-1-7。"
      },
      {
        "code": "P-1-6",
        "level": "core",
        "why": "區間 / choice 的暴搜，練習把狀態維護進遞迴。"
      }
    ],
    "checkpoints": [
      {
        "q": "為什麼選 / 不選會恰好枚舉全部 2^N 個 subset？",
        "a": "每個 subset 對每個位置都有唯一的 0/1 選擇，因此和一個長度 N 的 binary string 一一對應。"
      },
      {
        "q": "什麼情況能安全 prune？",
        "a": "你能證明目前 state 的所有 descendant 都不可能產生合法或更優答案時。只是『看起來很差』不夠。"
      }
    ],
    "mastery": [
      "能由決策數量直接估分支因子與總狀態數",
      "能把 sum/product/count 增量維護在 recursion state",
      "能說清楚每一個 pruning 的正確性理由"
    ]
  },
  "1-backtracking": {
    "title": "Backtracking：DFS + 約束 + rollback",
    "source": "AP325 1.3 後半，教材頁 29–33",
    "intro": "Backtracking 和普通 enumeration 的差別，是你不會等到葉節點才發現答案非法。每做一個選擇，就立即更新約束；只要衝突，整個 subtree 直接停止。",
    "objectives": [
      "會設計 candidate state 與約束陣列",
      "會在選擇後立即 pruning",
      "會正確 rollback，讓 sibling branch 互不污染"
    ],
    "focus": {
      "code": "P-1-9",
      "prompt": "N-Queen 不需要每次掃整張棋盤。你真正要知道的是：這一欄、兩條對角線是否已經被佔用。",
      "questions": [
        "如果一層固定放第 row 列皇后，下一層還需要存 row 嗎？",
        "兩條 diagonal 要如何用 row/col 編號？",
        "哪一些狀態在 return 前必須 undo？"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "state-design",
        "title": "先把『合法性檢查』變 O(1)",
        "paragraphs": [
          "如果每次嘗試 (row,col) 都掃前面所有皇后，仍然可以做，但會把大量時間花在重複檢查。更好的 state 是三組 bool：column、row-col 對角線、row+col 對角線是否已佔用。",
          "固定一層只處理一個 row 後，row 本身不需要 visited；你只枚舉 col。這是 backtracking 的常見技巧：把『一定會依序發生的維度』放在 depth，而不是 state container。"
        ]
      },
      {
        "type": "example",
        "id": "nqueen-trace",
        "title": "4-Queen：pruning 發生在哪裡",
        "problem": "第 0 列先放在 col=1。",
        "steps": [
          "進 row=1，嘗試 col=0：與上一顆在同一條斜線，立刻 reject。",
          "嘗試 col=1：同欄 reject。",
          "嘗試 col=2：另一條斜線 reject。",
          "嘗試 col=3：合法，標記三組約束後進 row=2。",
          "若 row=2 沒任何合法 col，return 前必須把 row=1,col=3 的三個標記全部清掉。"
        ],
        "conclusion": "backtracking 的效率來自『越早發現不可能越好』；正確性來自完整枚舉所有仍可能合法的 branch。"
      },
      {
        "type": "code",
        "id": "nqueen-code",
        "title": "N-Queen 標準 backtracking",
        "code": "int n;\nlong long ans = 0;\nvector<int> col, diag1, diag2;\n\nvoid dfs(int r){\n    if(r == n){\n        ++ans;\n        return;\n    }\n\n    for(int c=0;c<n;c++){\n        int d1 = r-c+n-1;\n        int d2 = r+c;\n        if(col[c] || diag1[d1] || diag2[d2]) continue;\n\n        col[c]=diag1[d1]=diag2[d2]=1;\n        dfs(r+1);\n        col[c]=diag1[d1]=diag2[d2]=0;\n    }\n}",
        "notes": [
          "diag1 用 r-c 會有負數，因此平移 n-1。",
          "diag2=r+c 自然落在 [0,2n-2]。",
          "mark / recursive call / unmark 必須成對，這就是 rollback。"
        ]
      },
      {
        "type": "text",
        "id": "optimization",
        "title": "從『可行』到『分數最大』",
        "paragraphs": [
          "Q-1-10 把 N-Queen 從計數變成最佳化：每個合法位置還有分數。Backtracking 框架不變，只是 state 多一個 currentScore，葉節點更新 best。",
          "若能估算『剩下每列就算都拿最高分，最多也只能到多少』，還可以做 upper-bound pruning；當 upper bound ≤ current best，整棵 subtree 可直接砍掉。"
        ]
      },
      {
        "type": "callout",
        "id": "rollback-bug",
        "title": "最常見 bug：忘了 rollback 某一個狀態",
        "body": "如果你修改了三個 array，卻只還原兩個，下一個 sibling branch 會繼承上一條路徑的幽靈狀態。debug 時可以在進入 / 離開 dfs 前印出 state，確認函式返回後與進入前完全相同。",
        "tone": "warning"
      }
    ],
    "practice": [
      {
        "code": "P-1-9",
        "level": "focus",
        "why": "最標準的約束 + rollback 模型。"
      },
      {
        "code": "Q-1-10",
        "level": "core",
        "why": "在相同 backtracking 骨架上加入 objective function。"
      },
      {
        "code": "Q-1-11",
        "level": "challenge",
        "why": "遞迴決策不再只是棋盤位置，要求你重新辨識 state 與 pruning。"
      }
    ],
    "checkpoints": [
      {
        "q": "Backtracking 和 brute-force enumeration 的核心差異？",
        "a": "兩者都枚舉決策樹，但 backtracking 在 prefix 已違反約束時立即停止，不把非法 subtree 展開到葉節點。"
      },
      {
        "q": "rollback 的 invariant 是什麼？",
        "a": "dfs(depth) 返回後，所有可變 state 必須恢復成呼叫它之前的狀態，讓下一個 sibling branch 從同一個乾淨 prefix 開始。"
      }
    ],
    "mastery": [
      "能把合法性檢查壓成 O(1) state lookup",
      "每次修改狀態都能指出對應的 rollback",
      "能設計至少一個安全 pruning，而不是靠直覺亂砍"
    ]
  }
};
