# AlgoVista Algorithm Library

競賽程式演算法動畫教學網站。目前包含 202 個演算法，依 11 個領域與子分類整理；每個教學頁都同步顯示步驟狀態、C++ 程式碼與正確性解說。

## 執行

```bash
npm install
npm run dev
```

瀏覽器開啟終端機顯示的本機網址（預設為 `http://localhost:5173`）。

## 建置

```bash
npm run build
npm run preview
```

## 內容稽核

```bash
npm run audit:catalog
```

這會檢查重複演算法、分類完整性、每一步的專屬視覺資料、同步程式碼行、使用時機與官方例題；任一頁缺少視覺模型、trace 或題目資料就會失敗。

## 功能

- 202 個演算法、11 大分類與完整搜尋
- 202 個演算法全部採 10–20 步的 deterministic guided animation
- 全站共 2462 個可重播、具唯一識別的 step-specific visual traces
- 每頁標示 CPPBook、個人 Notion 模板庫或 USACO 的內容來源
- 播放、暫停、上一步、下一步與重播
- 112 種依「演算法實際操作」建立的視覺模型；202 課逐一明確映射，不允許退回章節共用預設畫面
- 每課包含兩項使用時機，以及 CSES、AtCoder 或 Codeforces 官方例題
- C++17 token-level 語法染色，並以低干擾底色和側邊標記同步目前執行行
- 202 頁全部標記為 concrete，依 Array、Graph、Tree、Range、DP、String、Flow、Math、Geometry、Transform 等視覺引擎呈現
- 每一步同步標示 C++17 行號、演算法狀態、不變量、操作與複雜度
- 支援 `?lesson=<algorithm-id>` 直接開啟指定教學頁
- 桌面與手機響應式介面

主要入口為 `src/algorithms.ts`，視覺與例題映射在 `src/lessonMeta.ts`，專屬畫面在 `src/AdaptiveScenes.tsx`，視覺與互動入口在 `src/App.tsx`。
