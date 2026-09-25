export const world2Guides = {
  "2-sorting": {
    "title": "排序與離散化：先創造順序，才有後面的單調性",
    "source": "AP325 2.1，教材頁 34–38、44",
    "intro": "排序本身很少是答案，真正的價值是把原本雜亂的資料變成可掃描、可去重、可二分、可雙指標的順序。AP325 在這裡先用 distinct 與 coordinate compression 建立這個習慣。",
    "objectives": [
      "熟悉 sort 與 comparator 的語意",
      "會用 sort + unique 去重",
      "會做 coordinate compression 並保留原值大小關係"
    ],
    "focus": {
      "code": "P-2-1",
      "prompt": "先想：排序後，相同的數會全部連在一起。那麼『有多少不同的數』還需要 set 嗎？",
      "questions": [
        "排序後怎麼線性去重？",
        "如果不想破壞原陣列怎麼做？",
        "N=1e5 時 O(N log N) 是否足夠？"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "why-sort",
        "title": "排序真正帶來的是『鄰近性』與『單調性』",
        "paragraphs": [
          "未排序時，兩個相同值可能相距很遠；排序後，所有相同值會形成連續區塊。因此去重只需要比較目前值和前一個值。",
          "之後的 binary search、two pointers、interval sweep 都依賴同一件事：資料一旦有序，就可以安全地丟掉一整段候選，而不是逐一檢查。"
        ]
      },
      {
        "type": "example",
        "id": "distinct-example",
        "title": "P-2-1：排序後一趟去重",
        "problem": "輸入 5,3,9,3,15,9,8,9。",
        "steps": [
          "排序得到 3,3,5,8,9,9,9,15。",
          "第一個 3 一定保留。",
          "之後只有當 v[i] != v[i-1] 時才加入答案。",
          "得到 3,5,8,9,15。"
        ],
        "conclusion": "排序花 O(N log N)，去重掃描 O(N)，總複雜度 O(N log N)。"
      },
      {
        "type": "code",
        "id": "sort-unique",
        "title": "sort + unique 與手動去重",
        "code": "vector<long long> v = a;\nsort(v.begin(), v.end());\nv.erase(unique(v.begin(), v.end()), v.end());\n\n// v 現在就是由小到大的所有相異值",
        "notes": [
          "unique 不會真正縮短 vector；它把重複元素移到尾端並回傳新 logical end，所以通常接 erase。",
          "若要保留原 index，先存 pair<value,index> 再排序。"
        ]
      },
      {
        "type": "text",
        "id": "compression",
        "title": "離散化：保留順序，不保留距離",
        "paragraphs": [
          "如果原值可能到 10^9，但你只在意誰大誰小，可以把第 k 小的不同值映射成 k。這就是 coordinate compression。",
          "注意：離散化保留的是 order relation。原本 10 與 1000 的差距 990，壓縮後可能只差 1，因此不能把壓縮 index 當成原數值距離。"
        ]
      },
      {
        "type": "code",
        "id": "compression-code",
        "title": "Coordinate compression 模板",
        "code": "vector<long long> xs = a;\nsort(xs.begin(), xs.end());\nxs.erase(unique(xs.begin(), xs.end()), xs.end());\n\nvector<int> rank(a.size());\nfor(int i=0;i<(int)a.size();++i){\n    rank[i] = lower_bound(xs.begin(), xs.end(), a[i]) - xs.begin();\n}",
        "notes": [
          "壓縮後 rank 範圍是 0..K-1。",
          "若只需要排序後掃描，不一定要真的把值換成 rank。"
        ]
      },
      {
        "type": "callout",
        "id": "comparator",
        "title": "Comparator 不可以寫 <= ",
        "body": "sort 的比較函數必須表達『a 嚴格排在 b 前面』。若 a==b 時仍回 true，會破壞 strict weak ordering，行為不再可靠。",
        "tone": "warning"
      }
    ],
    "practice": [
      {
        "code": "P-2-1",
        "level": "focus",
        "why": "排序後去重，建立『排序是前處理』的習慣。"
      },
      {
        "code": "P-2-2",
        "level": "core",
        "why": "真正把大值域壓成排名，後面 BIT / frequency 類題都會重用。"
      }
    ],
    "checkpoints": [
      {
        "q": "離散化後能不能直接用 rank 差代表原值差？",
        "a": "不能。離散化只保留相對順序與相等關係，不保留原始距離。"
      },
      {
        "q": "sort 的 comparator 在 a==b 時應回傳什麼？",
        "a": "false。比較器必須是嚴格關係。"
      }
    ],
    "mastery": [
      "能獨立寫 sort + unique",
      "知道何時需要保留原 index",
      "能分辨『排序後的順序』與『原值距離』"
    ]
  },
  "2-binary-search": {
    "title": "Binary Search：搜尋的不是數字，而是臨界點",
    "source": "AP325 2.2 與部分 2.4，教材頁 39–50、58、66",
    "intro": "二分搜尋最容易背成模板，然後一換成『找第一個可行』就爆掉。真正穩定的方法是先定義 predicate 與 invariant：哪一半已知不可能，答案一定留在哪一半。",
    "objectives": [
      "會寫 lower_bound 型 binary search",
      "知道 lower_bound / upper_bound 差異",
      "能把 set/map 搜尋與陣列二分連起來"
    ],
    "focus": {
      "title": "找第一個 >= x 的位置",
      "prompt": "不要先背 while。先定義：答案始終存在於 [l,r)；mid 若已 >=x，答案可能是 mid 或更左，因此 r=mid。",
      "questions": [
        "為什麼不是 r=mid-1？",
        "如果全部 < x，最後 l 會在哪？",
        "lower_bound 回 end() 要怎麼判斷？"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "invariant",
        "title": "二分的核心 invariant",
        "paragraphs": [
          "以 lower_bound 為例，用 half-open interval [l,r)。我們維持：真正答案若存在，就在 [l,r)；而 [0,l) 都確定 < target。當 a[mid] >= target，mid 還可能就是答案，所以不能丟掉 mid，只能令 r=mid。",
          "當 a[mid] < target，mid 一定不是答案，且它左邊更小，所以整段 [l,mid] 都能丟掉，令 l=mid+1。"
        ]
      },
      {
        "type": "code",
        "id": "lower-bound-manual",
        "title": "手寫 first >= target",
        "code": "int l = 0, r = n;          // answer in [l,r)\nwhile(l < r){\n    int mid = l + (r-l)/2;\n    if(a[mid] >= target) r = mid;\n    else l = mid + 1;\n}\n// l == n 表示沒有任何元素 >= target",
        "notes": [
          "用 r=n 可以自然表示『答案不存在，位置在尾端』。",
          "half-open 寫法不需要 mid±1 在兩邊都出現，較不易卡 infinite loop。"
        ]
      },
      {
        "type": "table",
        "id": "stl-bounds",
        "title": "lower_bound 與 upper_bound",
        "headers": [
          "函式",
          "回傳位置",
          "典型用途"
        ],
        "rows": [
          [
            "lower_bound(x)",
            "第一個 >= x",
            "找 x 是否存在、第一個不小於 x"
          ],
          [
            "upper_bound(x)",
            "第一個 > x",
            "計算 ≤x 的個數、找 x 區塊右端"
          ],
          [
            "equal range",
            "[first >=x, first >x)",
            "所有等於 x 的區間"
          ]
        ]
      },
      {
        "type": "example",
        "id": "count-equal",
        "title": "用兩個 bound 算某值出現幾次",
        "problem": "a=[1,2,2,2,5,9]，求 2 的出現次數。",
        "steps": [
          "lower_bound(2) 指向 index 1。",
          "upper_bound(2) 指向 index 4。",
          "差值 4-1=3。",
          "整個過程 O(log N)，前提是資料已排序。"
        ],
        "conclusion": "很多『計數』問題，本質是找一段等值區間的左右邊界。"
      },
      {
        "type": "text",
        "id": "ordered-containers",
        "title": "set / map 的搜尋和 array binary search 是同一個想法",
        "paragraphs": [
          "set/map 內部維持有序結構，因此 find、lower_bound 通常是 O(log N)。差別是它們支援動態插入 / 刪除，而 sorted vector 適合資料固定後大量查詢。",
          "不要把 vector 的 lower_bound 和 set.lower_bound 混用成本：對 set 應呼叫 member function，因為 generic std::lower_bound 只會用 iterator 線性前進。"
        ]
      },
      {
        "type": "callout",
        "id": "binary-answer-preview",
        "title": "先埋一個伏筆：二分不一定在陣列上",
        "body": "只要 check(x) 的真假具有單調性，就能二分答案空間。第四章會把這件事正式拿出來用。",
        "tone": "tip"
      }
    ],
    "practice": [
      {
        "code": "P-2-2C",
        "level": "core",
        "why": "比較有序容器與 sort-based compression。"
      },
      {
        "code": "Q-2-8",
        "level": "beyond",
        "why": "模逆元本身是數論，但會要求你熟悉搜尋 / 快速運算背景。"
      },
      {
        "code": "Q-2-14",
        "level": "challenge",
        "why": "不再是直接找值，而是找單調條件的臨界位置。"
      }
    ],
    "checkpoints": [
      {
        "q": "lower_bound 回傳 end() 代表什麼？",
        "a": "沒有任何元素 >= target；若是 vector，位置等於 n。"
      },
      {
        "q": "為什麼 set 上不要用 generic std::lower_bound？",
        "a": "set iterator 不是 random-access，generic lower_bound 雖比較次數是 O(log N)，iterator 前進總成本可能到 O(N)；set.lower_bound 才利用樹結構做到 O(log N)。"
      }
    ],
    "mastery": [
      "能不背模板地推導邊界更新",
      "能明確說出 first true / first >= 的 invariant",
      "會安全處理不存在與 end()"
    ]
  },
  "2-fast-power": {
    "title": "快速冪：把指數拆成二進位",
    "source": "AP325 2.3，教材頁 51–53、65",
    "intro": "快速冪的本質是：任何指數 n 都能寫成 2 的冪次之和。於是不用做 n 次乘法，只要一路平方 base，再根據 exponent 的 bit 決定哪些平方值要乘進答案。",
    "objectives": [
      "能推導 iterative binary exponentiation",
      "會做 modular exponentiation",
      "能處理 exponent=0 與乘法 overflow"
    ],
    "focus": {
      "code": "P-2-3",
      "prompt": "試著算 3^13。13 的二進位是 1101，所以答案只需要 3^1、3^4、3^8。",
      "questions": [
        "每輪 base 為什麼平方？",
        "每輪 exponent 為什麼右移？",
        "ans 初值為什麼是 1？"
      ]
    },
    "blocks": [
      {
        "type": "example",
        "id": "pow-trace",
        "title": "3^13 的完整 trace",
        "problem": "13 = 1101₂。",
        "steps": [
          "e=13，最低 bit=1：ans=3；base=9；e=6。",
          "e=6，最低 bit=0：ans 不變；base=81；e=3。",
          "e=3：ans=3×81=243；base=6561；e=1。",
          "e=1：ans=243×6561=3^13；e=0 結束。"
        ],
        "conclusion": "每一輪處理 exponent 的一個 bit，因此輪數是 O(log n)。"
      },
      {
        "type": "text",
        "id": "invariant",
        "title": "用一條 invariant 記住整個演算法",
        "paragraphs": [
          "若原目標是 A^E，可維持 ans × base^e = A^E。當 e 是奇數，把一個 base 乘到 ans，剩下 e-1；接著 base 平方、e 除以 2，等式仍成立。",
          "這比背『if(e&1)...』可靠，因為矩陣快速冪、modular exponentiation 都只是把乘法換成別的 associative operation。"
        ]
      },
      {
        "type": "code",
        "id": "binpow",
        "title": "安全 modular binary exponentiation",
        "code": "long long binpow(long long a,long long e,long long mod){\n    long long ans = 1 % mod;\n    a %= mod;\n    while(e > 0){\n        if(e & 1) ans = (__int128)ans * a % mod;\n        a = (__int128)a * a % mod;\n        e >>= 1;\n    }\n    return ans;\n}",
        "notes": [
          "e=0 時回傳乘法單位元 1。",
          "若 mod 和 a 接近 long long 上限，使用 __int128 避免乘法先 overflow。",
          "核心只要求乘法結合律，所以矩陣也可套同樣骨架。"
        ]
      },
      {
        "type": "text",
        "id": "huge-number",
        "title": "當底數或答案非常大：分開看『表示』與『演算法』",
        "paragraphs": [
          "Q-2-4 的 200 位整數提醒你：快速冪解決的是『乘法次數』，不是任意大整數的表示問題。若題目只需要某個模數，就每步取模；若真的要完整大數，則需要 big integer 表示或語言內建大整數。",
          "不要因為快速冪是 O(log e) 就忘了單次 multiplication 的成本；大整數長度很大時，一次乘法本身就不再是 O(1)。"
        ]
      },
      {
        "type": "callout",
        "id": "generalization",
        "title": "這其實是 monoid exponentiation",
        "body": "只要有一個 associative operation 和 identity，就能做『重複平方』。後面的矩陣快速冪就是最重要的例子。",
        "tone": "tip"
      }
    ],
    "practice": [
      {
        "code": "P-2-3",
        "level": "focus",
        "why": "先把 bit 與平方骨架練熟。"
      },
      {
        "code": "Q-2-4",
        "level": "core",
        "why": "逼你分辨演算法與數值表示。"
      },
      {
        "code": "Q-2-13",
        "level": "challenge",
        "why": "指數 / 數值型態更不直觀，驗證你是否理解原理而非模板。"
      }
    ],
    "checkpoints": [
      {
        "q": "快速冪為何是 O(log e)？",
        "a": "每輪把 exponent 右移一 bit，也就是除以 2，直到 0，因此輪數等於其二進位位數。"
      },
      {
        "q": "矩陣快速冪為什麼可以直接套同一個 while？",
        "a": "矩陣乘法具結合律，而且有 identity matrix 作單位元。"
      }
    ],
    "mastery": [
      "能手算一個 exponent 的 bit trace",
      "能從 invariant 重建模板",
      "知道乘法 overflow 與大整數成本仍需另外處理"
    ]
  },
  "2-fibonacci": {
    "title": "Fibonacci 加速：從 recurrence 到 transition matrix",
    "source": "AP325 2.3，教材頁 53–54",
    "intro": "Fibonacci 的真正重點不是這個數列本身，而是示範如何把固定維度的線性 recurrence 寫成『每一步乘同一個矩陣』，再用快速冪把 n 次 transition 壓成 log n 次。",
    "objectives": [
      "會把 recurrence 選成 state vector",
      "會寫 2×2 transition matrix",
      "能解釋 identity matrix 與 T^k 的語意"
    ],
    "focus": {
      "code": "Q-2-5",
      "prompt": "不要直接背 [[1,1],[1,0]]。先問：如果 state 是 [F(k+1),F(k)]，下一步 [F(k+2),F(k+1)] 怎麼由舊 state 線性組成？",
      "questions": [
        "第一列係數是什麼？",
        "第二列為什麼是 [1,0]？",
        "T^n 代表做幾次 transition？"
      ]
    },
    "blocks": [
      {
        "type": "steps",
        "id": "derive-matrix",
        "title": "一步一步推 transition matrix",
        "steps": [
          {
            "title": "選 state",
            "body": "令 v_k = [F(k+1), F(k)]^T。這兩個值足以推出下一步。"
          },
          {
            "title": "寫下一步",
            "body": "F(k+2)=F(k+1)+F(k)，而新的第二項 F(k+1) 就是舊的第一項。"
          },
          {
            "title": "讀出係數",
            "body": "因此 v_{k+1} = [[1,1],[1,0]] · v_k。"
          },
          {
            "title": "重複 n 次",
            "body": "v_n = T^n v_0；T^n 用 binary exponentiation。"
          }
        ]
      },
      {
        "type": "example",
        "id": "matrix-trace",
        "title": "用 T² 看『兩步 transition』",
        "problem": "T=[[1,1],[1,0]]。",
        "steps": [
          "T 乘一次，把 [F1,F0] 變成 [F2,F1]。",
          "T² 就把同一 state 一次跨兩步，變成 [F3,F2]。",
          "因此 power 的 exponent 不是神秘公式，只是『做幾次相同 transition』。"
        ],
        "conclusion": "矩陣只是把多個互相依賴的 state 一次打包。"
      },
      {
        "type": "code",
        "id": "matrix-code",
        "title": "2×2 matrix exponentiation",
        "code": "struct Mat{\n    long long a[2][2]{};\n};\n\nMat mul(Mat x, Mat y, long long mod){\n    Mat z;\n    for(int i=0;i<2;i++)\n        for(int k=0;k<2;k++)\n            for(int j=0;j<2;j++)\n                z.a[i][j]=(z.a[i][j]+(__int128)x.a[i][k]*y.a[k][j])%mod;\n    return z;\n}\n\nMat mpow(Mat base,long long e,long long mod){\n    Mat ans; ans.a[0][0]=ans.a[1][1]=1;\n    while(e){\n        if(e&1) ans=mul(ans,base,mod);\n        base=mul(base,base,mod);\n        e>>=1;\n    }\n    return ans;\n}",
        "notes": [
          "identity matrix 對應普通快速冪的 1。",
          "矩陣乘法順序通常不可交換，寫 transition 時要固定 column-vector 或 row-vector 慣例。"
        ]
      },
      {
        "type": "callout",
        "id": "when-matrix",
        "title": "什麼 recurrence 值得想到矩陣？",
        "body": "如果下一步由固定數量的前幾項做線性組合，而且 n 很大，常可以把最近 k 個值打包成 k 維 state，得到固定 k×k transition matrix。",
        "tone": "tip"
      }
    ],
    "practice": [
      {
        "code": "Q-2-5",
        "level": "focus",
        "why": "完整走過 recurrence → state vector → matrix → fast power。"
      }
    ],
    "checkpoints": [
      {
        "q": "為什麼 transition matrix 的大小和 recurrence 階數有關？",
        "a": "state 必須保存足夠的前置值才能推出下一步；k 階 recurrence 通常需要 k 維 state，因此矩陣是 k×k。"
      },
      {
        "q": "矩陣乘法可以任意交換順序嗎？",
        "a": "不行，一般 AB≠BA；所以 state 是 column vector 還是 row vector、transition 放左邊還右邊要一致。"
      }
    ],
    "mastery": [
      "能自己從 recurrence 推矩陣而不是背 Fibonacci 矩陣",
      "能寫 identity + binary exponentiation",
      "能指出矩陣方法何時比 O(n) DP 值得"
    ]
  },
  "2-two-number": {
    "title": "Two-Number 與雙指標：排序後一次排除一整群答案",
    "source": "AP325 2.4，教材頁 55–57、68",
    "intro": "Two-number problem 是排序後單調性的代表題。當 a[l]+a[r] 太小時，不必嘗試 l 與更小的右端，因為 r 已經是最大；唯一有希望的是讓 l 變大。",
    "objectives": [
      "會用 two pointers 解 pair sum",
      "能證明每次移動一端不會漏解",
      "會保留原 index 並處理重複值"
    ],
    "focus": {
      "code": "P-2-6",
      "prompt": "排序後令 l 最小、r 最大。當和小於 target，哪一端必須移？先證明，再寫 while。",
      "questions": [
        "sum<target 為什麼不能 r--？",
        "sum>target 為什麼 l++ 沒幫助？",
        "題目若要原 index，排序前要多存什麼？"
      ]
    },
    "blocks": [
      {
        "type": "example",
        "id": "two-pointer-trace",
        "title": "完整排除過程",
        "problem": "a=[1,2,4,7,11]，target=9。",
        "steps": [
          "l=1,r=11，sum=12 太大。因 11 與任何更大的左端只會更大，所以 r--。",
          "l=1,r=7，sum=8 太小。因 1 與任何更小右端只會更小，所以 l++。",
          "l=2,r=7，sum=9，找到答案。"
        ],
        "conclusion": "每次移動都不是猜，是用排序後的單調性證明一整排 pair 不可能。"
      },
      {
        "type": "code",
        "id": "two-pointer-code",
        "title": "Pair-sum template",
        "code": "sort(a.begin(),a.end());\nint l=0, r=(int)a.size()-1;\nwhile(l<r){\n    long long s=a[l]+a[r];\n    if(s==target){\n        // found\n        break;\n    }\n    if(s<target) ++l;\n    else --r;\n}",
        "notes": [
          "l<r 保證使用不同位置。",
          "若排序後需要輸出原 index，元素型別改成 pair<value,index>。",
          "重複值是否要跳過，取決於你是找任一解、所有不同 value pair、還是計數。"
        ]
      },
      {
        "type": "text",
        "id": "binary-alternative",
        "title": "固定一個元素 + binary search 也能做",
        "paragraphs": [
          "另一種解法是對每個 a[i] 搜尋 target-a[i]，時間 O(N log N)。Two pointers 在排序後是 O(N)，但兩者都建立在同一個排序單調性上。",
          "當問題擴成 3-sum 時，也常固定第一個元素，再對剩下區間做 two pointers，得到 O(N²)。"
        ]
      },
      {
        "type": "text",
        "id": "circle",
        "title": "圓環類問題：排序後要重新思考『線性化』",
        "paragraphs": [
          "P-2-15 類型提醒一件事：資料在圓上時，排序後的頭尾其實相鄰。常見技巧是複製一份位置加上 circumference，或選一個切點把 circular order 攤平成線性 order。",
          "不要因為用了 sort 就忘記原問題的拓樸結構；線性陣列的兩端可能在原題其實相連。"
        ]
      }
    ],
    "practice": [
      {
        "code": "P-2-6",
        "level": "focus",
        "why": "標準 pair sum，先把單調排除證明說清楚。"
      },
      {
        "code": "Q-2-7",
        "level": "core",
        "why": "把互補關係放進實際 APCS 題型。"
      },
      {
        "code": "P-2-15",
        "level": "challenge",
        "why": "排序 / 搜尋放進 circular structure，不能直接照抄直線模板。"
      }
    ],
    "checkpoints": [
      {
        "q": "sum<target 時為什麼可以安全 l++？",
        "a": "目前 r 已是可選的最大值；若 a[l]+a[r] 都太小，那 a[l] 和任何更小的右端也一定太小，所以 a[l] 不可能參與解。"
      },
      {
        "q": "two pointers 與 sliding window 的共同核心是什麼？",
        "a": "指標只單調前進，並利用單調性證明被跳過的候選永遠不需要回頭。"
      }
    ],
    "mastery": [
      "每次移動指標都能說出排除了哪些候選",
      "能處理 duplicate 與 original index",
      "能辨認圓形資料何時需要 linearization"
    ]
  },
  "2-mitm": {
    "title": "Meet in the Middle：把 2^N 砍成兩個 2^(N/2)",
    "source": "AP325 2.4，教材頁 59–65",
    "intro": "當 N≈40，完整 subset enumeration 幾乎不可能，但每一半 20 個元素只有約一百萬個 subset。MITM 的關鍵不是只『切兩半』，而是找到一個可高效合併兩半結果的條件。",
    "objectives": [
      "會產生兩半 subset values",
      "會用排序 + binary search / two pointers 合併",
      "能估算時間與記憶體"
    ],
    "focus": {
      "code": "P-2-9",
      "prompt": "先把所有元素切成 L/R。任何完整 subset 都唯一等於一個 left subset 與一個 right subset 的聯集。",
      "questions": [
        "左右各有多少 subset？",
        "若條件是 product≤K，怎麼為每個 left value 找最大的 right 搭配？",
        "哪一邊需要排序？"
      ]
    },
    "blocks": [
      {
        "type": "text",
        "id": "decomposition",
        "title": "為什麼切半不會漏答案",
        "paragraphs": [
          "對任何完整 subset S，都能唯一分解成 S∩L 與 S∩R。反過來任選一個 left subset 和一個 right subset，其聯集也是唯一完整 subset。",
          "因此問題不再是『枚舉所有完整 subset』，而是『先列出兩邊所有部分答案，再找最佳 pair』。"
        ]
      },
      {
        "type": "steps",
        "id": "mitm-workflow",
        "title": "標準 MITM 工作流",
        "steps": [
          {
            "title": "Split",
            "body": "把 N 個元素切成大約 N/2 與 N/2。"
          },
          {
            "title": "Enumerate",
            "body": "各自產生所有 subset sum / product / score。"
          },
          {
            "title": "Sort one side",
            "body": "通常排序右側，建立可二分或雙指標的單調性。"
          },
          {
            "title": "Combine",
            "body": "對每個左側結果，找最合適的右側結果。"
          }
        ]
      },
      {
        "type": "example",
        "id": "subset-sum-mitm",
        "title": "最接近 K 的 subset sum",
        "problem": "left sums 與 right sums 已列出，要求 x+y≤K 且最大。",
        "steps": [
          "把 right sums 排序。",
          "對每個 left sum x，目標變成找最大的 y≤K-x。",
          "用 upper_bound(K-x)-1 取得 y。",
          "更新 best=max(best,x+y)。"
        ],
        "conclusion": "枚舉約 2^(N/2)，每個左值做一次 O(log 2^(N/2)) 搜尋。"
      },
      {
        "type": "code",
        "id": "mitm-code",
        "title": "Subset-sum MITM 骨架",
        "code": "vector<long long> gen(const vector<long long>& v){\n    vector<long long> s{0};\n    for(long long x:v){\n        int n=s.size();\n        for(int i=0;i<n;i++) s.push_back(s[i]+x);\n    }\n    return s;\n}\n\nvector<long long> L=gen(left), R=gen(right);\nsort(R.begin(),R.end());\nlong long best=LLONG_MIN;\nfor(long long x:L){\n    auto it=upper_bound(R.begin(),R.end(),K-x);\n    if(it!=R.begin()){\n        --it;\n        best=max(best,x+*it);\n    }\n}",
        "notes": [
          "若只要 count，合併方式可能改成 lower/upper bound 差值。",
          "若 subset value 可能重複，是否去重取決於題目是在計『subset 數量』還是只找『最佳 value』。",
          "記憶體也是 O(2^(N/2))，N 再大仍會爆。"
        ]
      },
      {
        "type": "text",
        "id": "not-magic",
        "title": "MITM 不是所有 N=40 都能用",
        "paragraphs": [
          "切半之後還要能有效 combine。如果左右結果之間的關係需要 O(2^(N/2))×O(2^(N/2)) 全配對，那又回到 O(2^N)。",
          "所以真正要找的是：pairing condition 是否能排序、hash、binary search 或 two pointers。"
        ]
      },
      {
        "type": "callout",
        "id": "comparison",
        "title": "和 DP 怎麼選？",
        "body": "若值域 sum 很小，subset-sum DP 可能 O(NS) 更好；若值域巨大但 N≈40，MITM 更自然。演算法選擇要同時看 N 與值域。",
        "tone": "tip"
      }
    ],
    "practice": [
      {
        "code": "P-2-9",
        "level": "focus",
        "why": "標準折半枚舉，建立 split/enumerate/combine 三段式。"
      },
      {
        "code": "Q-2-10",
        "level": "core",
        "why": "subset sum 版本，練 binary-search pairing。"
      },
      {
        "code": "P-2-11",
        "level": "beyond",
        "why": "將 MITM 用在更不直觀的區間目標。"
      },
      {
        "code": "Q-2-12",
        "level": "beyond",
        "why": "二維 / 矩陣版本，資料轉換和合併都更重。"
      }
    ],
    "checkpoints": [
      {
        "q": "MITM 為什麼不是 O(2^N)？",
        "a": "因為不列出所有左右配對；只各列 2^(N/2) 個部分結果，再透過排序 + 搜尋以近線性 / log 成本配對。"
      },
      {
        "q": "若左右兩邊都各有約一百萬結果，為什麼不能雙層 loop 配對？",
        "a": "那會有約 10^12 次配對，等同失去 MITM 的意義。"
      }
    ],
    "mastery": [
      "能從完整解唯一拆成左右部分解",
      "能為 pairing 找到排序 / binary search 結構",
      "會同時估 2^(N/2) 的時間與記憶體"
    ]
  }
};
