# AlgoVista 全專案交接文件

更新日期：2026-08-13（Asia/Taipei）  
交接對象：Antigravity  
專案：Competitive Programming 演算法動畫教學網站

## 1. 使用者真正要的最終產品

這不是 MVP。使用者要的是一個可以正式公開的完整演算法動畫教學網站：

- 以使用者自己的 CPPBook、Notion 模板庫與 USACO 為主要內容來源。
- 目前 catalog 有 202 個競賽演算法、資料結構與技巧。
- 每個演算法都必須依自身資料模型呈現專屬動畫，不能把圖論、字串、幾何等內容硬套成陣列。
- 動畫要讓完全沒學過的初學者第一次看就能理解，原則上每課 10～20 步。
- 每一步必須同步：畫面狀態、白話解說、變數狀態、C++ 程式碼行。
- 程式碼要達競賽模板等級；不能只有突然出現的 function、未定義 helper 或沒有初始化的 query。
- 每課需要使用時機、CSES／AtCoder／Codeforces 例題、常見錯誤與邊界。
- UI 為現代深色、高留白、精緻教育動畫風格；不可有廉價圓圈箭頭感。
- 使用者可調整動畫、程式碼與解說視窗大小，也可自訂配色與字級。
- 網站必須部署到 GitHub Pages。

## 2. 最新核心要求：完整知識體系

任何 operation 都不能脫離完整演算法 lifecycle 單獨存在。

每個主題都應形成以下知識單元：

1. Problem / Motivation
2. Naive solution 與瓶頸
3. Core idea / mental model
4. Structure / State，所有變數與節點的意義
5. Initialization / Build
6. 全部主要 operations
7. Operations 之間的關係
8. Preprocessing / Query / Update / Memory 複雜度
9. 完整可使用的 implementation 或明確建立在完整基礎課上的 extension
10. Example / execution flow
11. Common mistakes / edge cases
12. Extensions

範例：Segment Tree 不能只教 query，必須完整包含 motivation → node invariant → storage → build → query → update → complexity → code → example → lazy extension。

知識依賴也必須成立，例如：

- Lazy Propagation → Segment Tree
- Dijkstra → Graph traversal + Priority Queue / Heap
- LCA → Tree + DFS + depth / parent
- KMP → prefix function / failure information
- DP optimization → basic DP formulation

禁止出現未定義術語，例如 lowbit、lazy、parent、rank、indegree、relaxation、memoization、prefix function。

## 3. Repository 與部署

- 本機專案：`/Users/benjamin/Documents/Codex/2026-08-11/referenced-chatgpt-conversation-this-is-an/outputs/segment-tree-studio`
- GitHub：<https://github.com/benjamin-shih-tw/algovista-algorithm-library>
- 公開網站：<https://benjamin-shih-tw.github.io/algovista-algorithm-library/>
- 主分支：`main`
- 最新已推送 commit：`7c06338 Build repository-wide algorithm knowledge graph`
- 最新 GitHub Pages workflow run：`31708479700`，已成功。
- 最後確認 working tree 是乾淨的。

## 4. 技術架構

- React 19
- TypeScript
- Vite
- Framer Motion
- SVG / HTML 視覺化
- Tailwind CSS 4
- lucide-react
- GitHub Pages

主要檔案：

- `src/algorithms.ts`：lesson schema、核心 lessons、最終 202 課組裝流程
- `src/foundationLessons.ts`：基礎陣列、排序、線性結構等
- `src/graphTreeLessons.ts`：圖與樹的主要課程
- `src/dataDpLessons.ts`：資料結構與 DP
- `src/advancedLessons.ts`：數學、幾何、Flow、Transform 等
- `src/completion*Lessons.ts`：補齊 202 課的 catalog specs
- `src/completionFactory.ts`：大量 completion lesson 的三階段原始生成器
- `src/lessonMeta.ts`：112 種 visual model 映射、使用時機與例題
- `src/pedagogy.ts`：C++ 可讀格式、逐行 code guide、初學者四段解說
- `src/knowledge.ts`：最新加入的 Knowledge Unit schema、204 條 dependency、術語與 lifecycle 生成
- `src/AdaptiveScenes.tsx`：演算法族群專屬畫面
- `src/App.tsx`：Library、課程頁、動畫、Knowledge Unit、程式同步與控制
- `src/ThemeControls.tsx`：配色與字級自訂
- `src/workspace.css`：Resizable workspace、Knowledge Unit UI
- `src/beginner.css`、`src/product.css`、`src/styles.css`：其餘 UI 與視覺系統

## 5. 目前 catalog 狀態

- 202 lessons
- 11 大分類
- 112 個 visual models
- 2116 個 deterministic visual traces
- 每課目前被現有 audit 標記為 concrete
- 每課 10～20 animation frames
- 202 個 Knowledge Units
- 204 條 prerequisite edges
- 191 條 extension back-links
- dependency graph 無循環
- 無孤立 foundation／advanced lesson（以目前 dependency 定義計算）

分類數量：

- Search / Sort：26
- Linear Structures：12
- Graph：32
- Trees：14
- Range Data Structures：25
- Dynamic Programming：26
- Strings：14
- Flow / Matching：13
- Mathematics：17
- Geometry：18
- Advanced：5

## 6. 已完成的 UI / UX

- 先分類，再進入子分類，不再把 202 課散放。
- 分類內依 dependency depth 排序，而非只依原始 index。
- 課程卡顯示先備數量與學習深度。
- 每課新增預設摺疊的「完整演算法體系」區塊：
  - 可點擊先備課
  - 本頁先定義的概念
  - Problem / Naive / Core Idea
  - State / Structure glossary
  - Initialization
  - Operation lifecycle 表格
  - 分項 complexity
  - Input / Output / implementation contract
  - Example flow
  - Mistakes / edge cases
  - 可點擊 extensions
- 原本「播放前，先建立理解地圖」也預設摺疊，避免頁面資訊過量。
- 初學者首頁路線已改為 6 課：
  1. Linear Search
  2. Binary Search
  3. Prefix Sum
  4. Queue
  5. BFS
  6. Segment Tree
- 程式碼區有 C++17 token coloring、複製、下載、點行跳動畫。
- 程式碼上方顯示 input / output contract。
- 顯示目前 implementation 是「完整核心流程」或「延伸實作／依賴先備課」。
- 動畫、程式碼、解說可調整高度；桌面左右面板可拖曳。
- 支援 Midnight、Ocean、Ember、Contrast 與自訂主色、背景、語法色、字級。
- 390×844 手機版驗收時沒有頁面水平 overflow。

## 7. Segment Tree 已做的深度修正

Segment Tree 是目前唯一真正做到完整 lifecycle 並額外以 C++ compiler 驗證的課程。

目前是 20 步：

- 1～6：Structure + Build
- 7～14：Range sum query
- 15～20：Point update + pull + query-after-update verification

完整 C++ class 現在包含：

- storage
- constructor
- build
- recursive query
- public query wrapper
- recursive update
- public update wrapper

動畫會展示 `[2,5,1,4,9,3,7,6]`，把索引 4 的 9 更新成 10 後，根總和從 37 變成 38。

公開驗證網址：

<https://benjamin-shih-tw.github.io/algovista-algorithm-library/?lesson=segment-tree&step=7>

## 8. 自動檢查

可執行：

```bash
npm run build
npm run audit:catalog
npm run audit:templates
npm run audit:knowledge
npm run audit:cpp
```

目前全部通過。

### `audit:catalog`

檢查：

- 202 課與分類完整性
- visual model 唯一映射
- 10～20 frames
- trace / animation / code line 同步
- beginner explanations
- sources、usage、practice problems

### `audit:templates`

檢查：

- lesson header
- 無已知 placeholder pattern
- 行長
- 每個 teaching line 有 animation mapping 與 code guide

注意：這個 audit 叫 `templateReady`，不代表真的能被 C++ compiler 編譯。

### `audit:knowledge`

檢查：

- 202 個 knowledge units
- motivation、state、initialization、至少完整 lifecycle、complexity、contract、example、mistakes、edges、extensions
- dependency 不缺課、不自指、不成環
- extension back-reference 一致
- 知識單元不整份重複
- 關鍵術語有定義

### `audit:cpp`

目前只實際編譯 `segment-tree`。

## 9. 非常重要的真實限制

不要對使用者宣稱「202 份程式碼都已完整可編譯」。目前這不是真的。

目前狀態：

- 202 課都有結構化 knowledge unit、implementation contract、逐行 guide 與動畫映射。
- 但很多 completion lessons 的 code 仍是核心 algorithm snippet，可能依賴未定義 helper、type 或 shared primitive。
- 例如部分 Flow、Geometry、Dynamic Tree、Voronoi、Delaunay 等原始資料中仍存在 `findAugmentingPath`、`bottleneck`、`superTriangle`、`inCircumcircle`、`beachLine` 等抽象 helper。
- 某些 code 雖然長得像 C++，本質仍接近 outline。
- `src/pedagogy.ts` 現在會加上 `#include <bits/stdc++.h>` 與 `using namespace std;`，但這只補標準函式庫，不會補課程特定 helper。
- 大量 completion lessons 是由 `completionFactory.ts` 的三個 concepts 擴成 10 步，步驟文字可能比以前詳細，但仍不等於每一課都有人工作者逐步模擬。
- Knowledge Unit 有一部分由 category / visual model 規則生成，再加 lesson-specific dependency 與術語；並非 202 課每句都已人工校稿。
- `knowledge.extensions` 最多只顯示 8 個，以避免 UI 過長。
- 最終 bundle 約 830 KB，Vite 有 >500 KB chunk warning，但不影響部署。
- GitHub workflow 有 Node 20 deprecated annotation；Actions 被 runner 強制以 Node 24 執行，目前仍成功。

## 10. 下一階段最高優先級

### P0：把其餘 201 份 code 變成真正可編譯的競賽模板

這是現在最大的未完成項。

建議做法：

1. 擴充 `scripts/auditCpp.ts`，不要一次宣稱全部成功。
2. 依 family 批次處理，每批 5～15 課。
3. 為 shared primitives 建立清楚且可見的完整基礎模板，例如：
   - Graph / WeightedEdge
   - DSU
   - Flow Edge + addEdge + residual graph
   - Geometry Point / cross / sign / EPS
   - Modular arithmetic
   - Tree node / traversal state
4. Advanced lesson 可以是 extension snippet，但頁面必須明確連到已可編譯的 base lesson，而且 extension 本身要補齊所有新增 state / operation。
5. 每修完一課，把它加入 `auditCpp.ts` targets。
6. 只有 targets 達 202 且零錯誤，才能宣稱 202 templates 全部 compile-verified。

### P0：修正「知識寫完整、動畫仍不完整」的落差

Segment Tree 已修好，但其他資料結構還要逐一做 lifecycle 動畫：

- Fenwick：build → add → prefixSum → rangeSum
- Lazy Segment Tree：build → apply/compose → push → range update → range query
- DSU：makeSet → find → unite → same
- Heap：buildHeap → push → top → pop
- Trie：root → insert → search → prefix / erase
- Sparse Table：log table → build → query
- Flow：addEdge → residual graph → augment → update reverse edge → termination

不要只在 Knowledge Unit 表格補 operations；動畫 timeline 與右側 code 也必須真的演完整 lifecycle。

### P1：逐課人工內容校稿

優先順序：

1. Data structures
2. Graph / Flow
3. DP optimizations
4. String automata / suffix structures
5. Number theory
6. Geometry
7. Polynomial transforms

每課確認：

- Problem 是否真的是這個演算法解決的問題
- Naive complexity 是否精確
- State 定義是否足夠證明轉移
- Initialization 是否與 code 完全一致
- Operations 是否真的全部存在
- Complexity 是否分 preprocessing / query / update / memory
- Example 的 input / output 是否不是從 generic state 生硬推導
- Mistakes 是否是該演算法專屬，而非 family generic
- Practice problem 是否真的適合該課

### P1：動畫模型人工驗收

雖然 catalog 宣稱 112 visual models / 202 concrete，但需重新逐課判斷：

- 畫面是否真的表示該演算法的 state，而非只換 label。
- 每一步是否有真實資料變化。
- Edge / connector 是否指向正確節點，尤其 Tree、Flow、Geometry。
- active / accepted / returned / ignored 的狀態是否與 code 一致。
- 圖論演算法要顯示 Queue / Stack / Priority Queue / indegree / low-link 等必要結構。
- DP 必須顯示 state definition、base case、dependency direction、transition source。
- 幾何必須顯示 orientation、event order、active set 或圓／線的真實關係。

## 11. 建議分批工作清單

不要一次大改 202 課後只跑一個 generic audit。建議每批完成「內容 + code + animation + compile + browser」完整閉環。

第一批：Range data structures

- Segment Tree（已完成，可作標準）
- Fenwick Tree
- Lazy Segment Tree
- Sparse Table
- DSU
- Iterative / Persistent / Dynamic Segment Tree

第二批：Graph foundations

- Queue
- BFS
- DFS
- Topological Sort
- Dijkstra
- Bellman-Ford
- Floyd-Warshall
- SCC / low-link

第三批：DP foundations and optimization

- Fibonacci DP
- 0/1 Knapsack
- LCS
- Grid DP
- Bitmask DP
- Digit DP
- Divide & Conquer / Knuth / CHT

其後再依 category 推進。

## 12. 使用者偏好與溝通方式

- 使用繁體中文。
- 使用者要直接執行，不要只列計畫或做 MVP。
- 回報要誠實區分「schema/audit 通過」與「人工／compiler／browser 驗證通過」。
- 不要因為工作量大就改成 generic filler。
- UI 資訊很多，所以新增的大區塊預設摺疊。
- 使用者特別討厭：
  - code 擋住看不到
  - code 太短或未定義
  - 動畫只是三步邏輯圖
  - 不同演算法共用不適合的陣列畫面
  - 線段與圖形標錯
  - 說全部完成但實際只有幾個能看

## 13. 重要歷史需求

整段產品方向從「Segment Tree MVP」演變為：

1. React + TypeScript + Vite + SVG / Framer Motion Segment Tree 動畫。
2. 使用者提供 CPPBook 與 Notion 模板庫，先盤點既有演算法。
3. 從 5 個演算法 UI 樣本擴成 202 課。
4. 加入分類、子分類、Priority Queue、程式碼逐步同步。
5. 修 code coloring、動畫字級、resizable panels、theme customization。
6. 將理解地圖預設摺疊。
7. 最新進一步要求 repository-wide knowledge completeness 與 dependency graph。

任意 code → 自動生成動畫與 AI API 目前已明確暫緩；現在先把既有 202 課做成高品質靜態／deterministic 教學網站。

## 14. 開始接手前先做

```bash
cd /Users/benjamin/Documents/Codex/2026-08-11/referenced-chatgpt-conversation-this-is-an/outputs/segment-tree-studio
git status
npm install
npm run build
npm run audit:catalog
npm run audit:templates
npm run audit:knowledge
npm run audit:cpp
npm run dev
```

接著先以 Segment Tree 頁面作為品質基準，再選一個 family 完成整批，不要直接宣告全站完成。

