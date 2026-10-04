import type { ExecutionView } from './algorithms'
import { list, source, trace } from './studentTrace'

const names = ['A','B','C','D','E','F']
const positions = [[100,180],[320,75],[320,300],[580,75],[800,180],[580,300]]
const undirectedEdges = [[0,1],[1,2],[2,0],[1,3],[3,4],[4,5],[5,3]]
const directedEdges = [[0,1],[1,2],[2,0],[2,3],[3,4],[4,3],[4,5]]

export function lowlinkLesson(kind: 'bridges' | 'articulation-points', n=6, edges=undirectedEdges) {
  const code=source(`pair<vector<pair<int,int>>, vector<int>> lowlink(int n, const vector<pair<int,int>>& edges) {
  vector<vector<pair<int,int>>> graph(n);
  for (int id = 0; id < (int)edges.size(); ++id) {
    auto [u, v] = edges[id];
    graph[u].push_back({v, id});
    graph[v].push_back({u, id});
  }
  vector<int> disc(n, -1), low(n, -1), cut(n, 0);
  vector<pair<int,int>> bridges;
  int timer = 0;
  function<void(int,int)> dfs = [&](int u, int parentEdge) {
    disc[u] = low[u] = timer++;
    int children = 0;
    for (auto [v, id] : graph[u]) {
      if (id == parentEdge) continue;
      if (disc[v] == -1) {
        ++children;
        dfs(v, id);
        low[u] = min(low[u], low[v]);
        if (low[v] > disc[u]) bridges.push_back({u, v});
        if (parentEdge != -1 && low[v] >= disc[u]) cut[u] = 1;
      } else {
        low[u] = min(low[u], disc[v]);
      }
    }
    if (parentEdge == -1 && children >= 2) cut[u] = 1;
  };
  for (int u = 0; u < n; ++u) {
    if (disc[u] == -1) dfs(u, -1);
  }
  return {bridges, cut};
}`)
  const label=(u:number)=>names[u]??String(u)
  const graph: {v:number;id:number}[][]=Array.from({length:n},()=>[])
  edges.forEach(([u,v],id)=>{graph[u].push({v,id});graph[v].push({v:u,id})})
  const disc=Array(n).fill(-1) as number[],low=[...disc],cut=Array(n).fill(0) as number[],bridges:string[]=[],stack:number[]=[];let timer=0
  const snapshot=()=>disc.map((d,u)=>`${label(u)}:${d===-1?'未走訪':`${d}/${low[u]}`}`).join('，')
  const view=(u=-1,edge=-1):ExecutionView=>({kind:'structure',title:'無向圖：節點下方是首次編號 disc／可回到的最早編號 low',nodes:Array.from({length:n},(_,v)=>({id:label(v),label:label(v),x:positions[v]?.[0]??100+v*100,y:positions[v]?.[1]??200,meta:disc[v]===-1?'未走訪':`disc ${disc[v]} / low ${low[v]}${cut[v]?' · 割點':''}`,active:v===u})),edges:edges.map(([a,b],id)=>({from:label(a),to:label(b),active:id===edge,label:bridges.includes(`${label(a)}-${label(b)}`)||bridges.includes(`${label(b)}-${label(a)}`)?'橋':undefined})),sequence:stack.map(label),badges:[`目前呼叫路徑：${stack.map(label).join(' → ')||'空'}`,`已找到橋：${bridges.join('、')||'無'}`,`割點：${cut.flatMap((v,i)=>v?[label(i)]:[]).join('、')||'無'}`]})
  const t=trace(code,{input:'無向圖：A-B-C-A 與 D-E-F-D 是兩個圈，B-D 連接兩側。A=0、B=1…F=5；程式以數字存點，畫面顯示字母。',goal:kind==='bridges'?'找出「移除這條邊會讓圖多斷成一塊」的橋。順便比較割點條件，避免混淆 > 與 ≥。':'找出「移除這個點及相連邊會讓圖多斷成一塊」的割點。比較一般點與搜尋起點的不同規則。',terms:[{term:'DFS／深度優先走訪',meaning:'先沿一條還沒走過的路走到底；走不下去，再回到呼叫它的點繼續。'},{term:'disc[u]',meaning:'第一次走到 u 的編號。從 0 遞增；−1 表示還沒走到。不是距離。'},{term:'low[u]／low-link',meaning:'從 u 的搜尋子樹往下，再最多用一條非父邊，能連回的最小 disc。數字小代表能回到較早的地方。'},{term:'parentEdge／children',meaning:'parentEdge 是走進這個點的邊編號。children 只數由這個點第一次走訪的新點，不是所有鄰居數。'},{term:'橋 >；割點 ≥',meaning:'刪邊時回到 u 就足夠；刪點時 u 也消失，所以必須回到 u 之前才救得了子樹。'}],reasoning:['首次走到 u，disc 與 low 都等於新編號；還不知道其他回路。','走到新鄰居 v，就完整處理 v，再用 low[v] 更新 low[u]；遇到已走訪的非父鄰居，使用 disc[v] 更新。','若 low[v]>disc[u]，子樹完全繞不回 u 或 u 之前；拿掉 u-v 就會斷開。','一般點若某個 child 的 low[v]≥disc[u]，刪掉 u 後 child 那側出不去，所以 u 是割點。','DFS 起點沒有上方那一側，必須有至少 2 個獨立搜尋 child 才是割點。只有一個 child 時不能套一般規則。'],boundaries:['每個尚未走訪的點都要啟動 DFS，才涵蓋不連通圖。','用邊編號略過父邊，而不是略過所有通往父點的邊；這樣平行邊才能正確提供替代路徑。','單點不是割點；樹的每條邊都是橋，但樹的葉子不是割點。'],cost:'V 個點、E 條邊，每點走訪一次、每條無向邊掃兩次。時間 O(V+E)，鄰接表與遞迴堆疊 O(V+E)；很深的圖實作時需注意呼叫堆疊限制。',question:'為什麼 D 的 child E 有 low[E]=disc[D] 時，D 仍是割點，但 D-E 不是橋？',answer:'E 可以經 F 回到 D，所以刪掉 D-E 仍有替代路；可是刪掉 D 時，這条回路的終點也消失，E、F 仍會和左側分開。'})
  const add=(line:string,title:string,before:string,decision:string,after:string,why:string,u=-1,edge=-1)=>t.add(line,title,before,decision,after,why,view(u,edge),{disc:disc.map(String),low:low.map(String),cuts:cut.flatMap((v,i)=>v?[label(i)]:[]),bridges:[...bridges],stack:stack.map(label)})
  add('vector<int> disc(n, -1), low(n, -1), cut(n, 0);','每個點先標成未走訪','已依輸入建立無向鄰接表；每條邊有唯一編號。','disc、low 先填 −1；cut 填 0。',snapshot(),'判斷未走訪要用 −1，因為合法首次編號包含 0。')
  function dfs(u:number,parentEdge:number){stack.push(u);const before=snapshot();disc[u]=low[u]=timer++
    add('disc[u] = low[u] = timer++;',`第一次走到 ${label(u)}`,before,`disc[${label(u)}]=low[${label(u)}]=${disc[u]}；timer 加 1。`,snapshot(),'先假設只能回到自己，再用真的走到的邊改善。',u)
    let children=0
    add('int children = 0;','這次呼叫自己的 child 計數',`目前在 ${label(u)}。`,'children=0。','尚未從這個點發現新點。','不同呼叫各自保存 children，不共用同一個計數。',u)
    for(const {v,id} of graph[u]){
      add('if (id == parentEdge) continue;',`檢查 ${label(u)}-${label(v)}`,`目前邊 #${id}，父邊 #${parentEdge}。`,id===parentEdge?'同一條父邊，直接略過。':'不是父邊，可以繼續檢查。','disc、low 尚未改變。','原路走回父親不是新的替代路；平行的另一條邊則不能略過。',u,id)
      if(id===parentEdge)continue
      add('if (disc[v] == -1) {','鄰居是第一次走到嗎？',`disc[${label(v)}]=${disc[v]}。`,disc[v]===-1?'尚未走訪，準備遞迴。':'已走訪，檢查是否能回到較早編號。','此步只判斷分支。','第一次發現的邊與已走訪鄰居的邊，更新 low 的方式不同。',u,id)
      if(disc[v]===-1){children++;add('++children;','增加一個搜尋 child',`舊 children=${children-1}。`,`children=${children}。`,`${label(v)} 是由 ${label(u)} 首次發現的。`,'只在首次發現鄰居的分支增加。',u,id)
        add('dfs(v, id);',`先處理 ${label(v)}，暫停 ${label(u)}`,`正在 ${label(u)} 掃鄰居。`,`呼叫 dfs(${label(v)}, 邊#${id})。`,'目前呼叫保留位置，等子呼叫回來。','必須等整個子樹走完，low[v] 才完整。',v,id);dfs(v,id)
        const old=low[u];low[u]=Math.min(low[u],low[v]);add('low[u] = min(low[u], low[v]);',`回到 ${label(u)}，接收子樹結果`,`low[${label(u)}]=${old}，low[${label(v)}]=${low[v]}。`,`min(${old},${low[v]})=${low[u]}。`,snapshot(),'子樹可到達的較早位置，也可以透過 u 到達。',u,id)
        const bridge=low[v]>disc[u];if(bridge)bridges.push(`${label(u)}-${label(v)}`)
        add('if (low[v] > disc[u]) bridges.push_back({u, v});','測試這條邊是不是橋',`low[${label(v)}]=${low[v]}，disc[${label(u)}]=${disc[u]}。`,`${low[v]}>${disc[u]}：${bridge?'成立，記錄橋':'不成立，不是橋'}。`,`橋：${bridges.join('、')||'無'}。`,'只有嚴格大於，才表示沒有繞回 u 的路。',u,id)
        const isCut=parentEdge!==-1&&low[v]>=disc[u];if(isCut)cut[u]=1
        add('if (parentEdge != -1 && low[v] >= disc[u]) cut[u] = 1;','測試一般點是不是割點',`父邊=${parentEdge}；low[${label(v)}]=${low[v]}，disc[${label(u)}]=${disc[u]}。`,parentEdge===-1?'這是 DFS 起點，不能套一般規則。':`${low[v]}≥${disc[u]}：${isCut?'成立，標記割點':'不成立'}。`,`cut[${label(u)}]=${cut[u]}。`,'刪點會連終點 u 一起拿掉，因此等號也算危險。',u,id)
      }else{const old=low[u];low[u]=Math.min(low[u],disc[v]);add('low[u] = min(low[u], disc[v]);','用非父邊檢查較早位置',`low[${label(u)}]=${old}，disc[${label(v)}]=${disc[v]}。`,`min(${old},${disc[v]})=${low[u]}。`,snapshot(),'這裡使用鄰居的首次編號 disc[v]，不是照抄它整個 low[v]。',u,id)}
    }
    const rootCut=parentEdge===-1&&children>=2;if(rootCut)cut[u]=1
    add('if (parentEdge == -1 && children >= 2) cut[u] = 1;','所有鄰居完成：檢查起點特例',`父邊=${parentEdge}，children=${children}。`,rootCut?'是起點且至少 2 個 child，標記割點。':'起點特例不成立，保留原標記。',`cut[${label(u)}]=${cut[u]}；接著返回上一層。`,'起點是否切斷兩側，要看独立 DFS 分支數，不是度數。',u);stack.pop()
  }
  for(let u=0;u<n;u++){add('if (disc[u] == -1) dfs(u, -1);',`外層查看 ${label(u)}`,`disc[${label(u)}]=${disc[u]}。`,disc[u]===-1?'尚未走訪，啟動新 DFS。':'已在之前的 DFS 走訪，不重做。','已完成部分保持不變。','每個不連通塊都必須有自己的 DFS 起點。',u);if(disc[u]===-1)dfs(u,-1)}
  add('return {bridges, cut};','交回橋與割點','所有點均已掃描。','回傳 bridges 與 cut。',`橋=${list(bridges)}；割點=${list(cut.flatMap((v,i)=>v?[label(i)]:[]))}。`,'每個標記都來自回路條件，不能只憑圖畫的外觀判斷。')
  return t.finish()
}

export function tarjanLesson(n=6,edges=directedEdges) {
  const code=source(`vector<int> tarjan(int n, const vector<pair<int,int>>& edges) {
  vector<vector<int>> graph(n);
  for (auto [u, v] : edges) graph[u].push_back(v);
  vector<int> disc(n, -1), low(n, -1), onStack(n, 0), component(n, -1), st;
  int timer = 0, count = 0;
  function<void(int)> dfs = [&](int u) {
    disc[u] = low[u] = timer++;
    st.push_back(u);
    onStack[u] = 1;
    for (int v : graph[u]) {
      if (disc[v] == -1) {
        dfs(v);
        low[u] = min(low[u], low[v]);
      } else if (onStack[v]) {
        low[u] = min(low[u], disc[v]);
      }
    }
    if (low[u] == disc[u]) {
      while (true) {
        int v = st.back();
        st.pop_back();
        onStack[v] = 0;
        component[v] = count;
        if (v == u) break;
      }
      ++count;
    }
  };
  for (int u = 0; u < n; ++u) {
    if (disc[u] == -1) dfs(u);
  }
  return component;
}`)
  const label=(u:number)=>names[u]??String(u),graph:number[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v])=>graph[u].push(v))
  const disc=Array(n).fill(-1) as number[],low=[...disc],component=[...disc],onStack=Array(n).fill(0) as number[],st:number[]=[],calls:number[]=[];let timer=0,count=0
  const view=(u=-1,v=-1):ExecutionView=>({kind:'network',title:'有向圖：箭頭只能順向走；數值依序為 disc / low',nodes:Array.from({length:n},(_,k)=>({id:label(k),x:positions[k]?.[0]??100+k*100,y:positions[k]?.[1]??200,value:disc[k]===-1?'未走訪':`${disc[k]} / ${low[k]}${component[k]===-1?'':` · 組${component[k]}`}`,group:component[k]===-1?'default':String(component[k])})),edges:edges.map(([a,b])=>({from:label(a),to:label(b),active:a===u&&b===v})),path:u<0?[]:[label(u)],badges:[`待分組堆疊（右端是頂）：${st.map(label).join(' → ')||'空'}`,`呼叫路徑：${calls.map(label).join(' → ')||'空'}`,`已完成 ${count} 組`]})
  const t=trace(code,{input:'有向邊 A→B→C→A、C→D、D→E→D、E→F。A=0…F=5。',goal:'把能沿箭頭互相到達的點放入同一組；完整展示走入、回邊、返回、判斷組頭與彈出堆疊。',terms:[{term:'強連通分量 SCC',meaning:'一組點中的任意兩點都能沿箭頭互相走到；不能再加入其他點而仍保持這個性質。'},{term:'disc / low',meaning:'disc 是首次走到的編號。low 用來追蹤目前尚未定案的搜尋裡能回到的較早編號。它不是一般最短路距離。'},{term:'st／onStack',meaning:'st 保存已走到、但尚未分組定案的點，右端最後放進去。onStack[v]=1 表示 v 還在這份名單裡。'},{term:'呼叫路徑與待分組堆疊',meaning:'呼叫結束的點不一定立刻分組；所以待分組堆疊可能比目前 DFS 呼叫路徑更長。'},{term:'component',meaning:'每個點所屬的組號。−1 表示尚未定案；組號大小不是圖上的距離。'}],reasoning:['第一次走到 u 時記下編號，並把 u 放進尚未分組的堆疊。','未走訪的 v 先遞迴，再接收 low[v]；已走訪且仍在堆疊的 v，使用 disc[v] 更新。','已經離開堆疊的點屬於定案的另一組；指向它不能把兩組重新合併。','當 low[u]=disc[u]，u 以下尚未彈出的這一段形成一組；從頂端彈到 u 為止。','外層要看每個點，避免漏掉從第一個起點到不了的分量。'],boundaries:['只有一個點也能形成 SCC，不必有自我箭頭。','A→B 不等於 A、B 同組；必須也能由 B 回到 A。','不要把 onStack 換成單純 visited；已走訪但已定案的點不能再影響目前分組。'],cost:'V 個點、E 條有向邊。每點入堆疊、出堆疊各一次，每邊掃一次，時間 O(V+E)、空間 O(V+E)。過深的 DFS 需要考慮呼叫堆疊限制。',question:'為什麼 F 已經走訪過，卻不會和 D、E 合在一組？',answer:'F 沒有路回到 D 或 E；它在自己的呼叫結束時 low[F]=disc[F]，先單獨彈出定案。已離開堆疊的 F 不能把其他組連在一起。'})
  const snap=()=>disc.map((d,u)=>`${label(u)}:${d}/${low[u]}`).join('，')
  const add=(line:string,title:string,before:string,decision:string,after:string,why:string,u=-1,v=-1)=>t.add(line,title,before,decision,after,why,view(u,v),{disc:disc.map(String),low:low.map(String),stack:st.map(label),onStack:onStack.map(String),component:component.map(String)})
  add('vector<int> disc(n, -1), low(n, -1), onStack(n, 0), component(n, -1), st;','準備兩種不同的狀態','鄰接表只保存輸入箭頭方向。','disc、low、component 填 −1，onStack 填 0，st 為空。','所有點未走訪、也未分組。','已走訪與已分組是兩件不同的事，必須分開記。')
  function dfs(u:number){calls.push(u);disc[u]=low[u]=timer++;add('disc[u] = low[u] = timer++;',`走到 ${label(u)}`,`${label(u)} 未走訪。`,`首次編號 ${disc[u]}。`,snap(),'編號記的是走訪先後，不是點的名字或距離。',u)
    st.push(u);add('st.push_back(u);','加入待分組堆疊',`準備放入 ${label(u)}。`,`把 ${label(u)} 加到右端。`,list(st.map(label)),'分組時從右端往回彈，直到這組最早的入口。',u)
    onStack[u]=1;add('onStack[u] = 1;','標記尚未分組',`${label(u)} 已放入堆疊。`,`onStack[${label(u)}]=1。`,'這個點可作為目前搜尋的回連目標。','後面碰到它時，要知道它尚未定案。',u)
    for(const v of graph[u]){add('if (disc[v] == -1) {',`沿箭頭 ${label(u)}→${label(v)}`,`disc[${label(v)}]=${disc[v]}。`,disc[v]===-1?'未走訪，先遞迴處理。':'已走訪，接著檢查是否仍在堆疊。','本步尚未改變 low。','有向邊不能自行加反方向；判斷以輸入箭頭為準。',u,v)
      if(disc[v]===-1){add('dfs(v);',`暫停 ${label(u)}，走入 ${label(v)}`,`目前呼叫 ${label(u)}。`,`呼叫 dfs(${label(v)})。`,'子呼叫結束後回到這裡。','等 v 的出邊全部處理完，才接收它的 low。',u,v);dfs(v);const old=low[u];low[u]=Math.min(old,low[v]);add('low[u] = min(low[u], low[v]);','子呼叫返回，更新 low',`low[${label(u)}]=${old}，low[${label(v)}]=${low[v]}。`,`min(${old},${low[v]})=${low[u]}。`,snap(),'由 DFS 子樹取得可回到的較早位置。',u,v)}else{
        add('} else if (onStack[v]) {','這個鄰居還沒分組嗎？',`onStack[${label(v)}]=${onStack[v]}。`,onStack[v]?'仍在堆疊，可以使用它的 disc。':'已定案，略過這條邊對 low 的影響。','low 尚未改變。','visited 只說曾走到；onStack 才說能否參與目前這組。',u,v)
        if(onStack[v]){const old=low[u];low[u]=Math.min(old,disc[v]);add('low[u] = min(low[u], disc[v]);','遇到尚未定案的較早點',`舊 low=${old}，鄰居 disc=${disc[v]}。`,`min(${old},${disc[v]})=${low[u]}。`,snap(),'此分支用 disc[v]，不直接照抄 low[v]。',u,v)}
      }
    }
    add('if (low[u] == disc[u]) {',`${label(u)} 是這一組的入口嗎？`,`low=${low[u]}，disc=${disc[u]}。`,`${low[u]}==${disc[u]}：${low[u]===disc[u]?'成立，開始彈出一組':'不成立，留在堆疊等較早入口處理'}。`,`st=${list(st.map(label))}。`,'low 更小表示還連著較早的未定案點，不能搶先把自己分開。',u)
    if(low[u]===disc[u]){while(true){const v=st.at(-1)!;add('int v = st.back();','讀取堆疊最右端',list(st.map(label)),`v=${label(v)}。`,'只讀，還沒移除。','讀取與移除分開，才能看出下一行改了什麼。',v);st.pop();add('st.pop_back();','移除堆疊最右端',`頂端是 ${label(v)}。`,`移除 ${label(v)}。`,list(st.map(label)),'v 變數仍記住被取出的點。',v);onStack[v]=0;add('onStack[v] = 0;','清掉在堆疊標記',`onStack[${label(v)}]=1。`,'改為 0。',`${label(v)} 不再參與後续未定案搜尋。`,'忘記清掉會把不同 SCC 錯誤混在一起。',v);component[v]=count;add('component[v] = count;','填入組號',`${label(v)} 尚未定案。`,`component[${label(v)}]=${count}。`,`本組 ${count} 加入 ${label(v)}。`,'同一次彈出過程使用同一個組號。',v);add('if (v == u) break;','已彈到這組的入口嗎？',`取出 ${label(v)}，入口 ${label(u)}。`,v===u?'相同，停止彈出。':'不同，繼續取下一個頂端。','其他更早的點不能一併彈掉。','入口 u 是這次分組的邊界。',u);if(v===u)break}count++;add('++count;','一組完成',`剛完成組 ${count-1}。`,`count=${count}。`,'下一組使用新的組號。','不同組的編號必須不同。',u)}calls.pop()
  }
  for(let u=0;u<n;u++){add('if (disc[u] == -1) dfs(u);',`外層查看 ${label(u)}`,`disc=${disc[u]}。`,disc[u]===-1?'啟動 DFS。':'已走訪，不重複啟動。','已完成組別保持不變。','覆蓋不連通或不可由第一起點到達的點。',u);if(disc[u]===-1)dfs(u)}
  add('return component;','交回每個點的組號','所有點都已分組。','回傳 component。',component.map((c,u)=>`${label(u)}→組${c}`).join('，'),'同組代表互相可達，不同組不代表完全沒有箭頭相連。')
  return t.finish()
}
