import type { AlgorithmLesson, Edge, Frame, Point } from './algorithms'

const points: Point[] = [
  {id:'A',x:12,y:48,label:'A'},{id:'B',x:31,y:20,label:'B'},{id:'C',x:32,y:74,label:'C'},
  {id:'D',x:55,y:20,label:'D'},{id:'E',x:57,y:70,label:'E'},{id:'F',x:83,y:44,label:'F'},
]
const edges: Edge[] = [{from:'A',to:'B'},{from:'A',to:'C'},{from:'B',to:'D'},{from:'B',to:'E'},{from:'C',to:'E'},{from:'D',to:'F'},{from:'E',to:'F'}]
const weighted: Edge[] = edges.map((e,i)=>({...e,weight:[4,2,3,6,1,5,2][i]}))
type Phase={title:string;explanation:string;lines:number[];state:Record<string,string|number|string[]>;active?:string[];accepted?:string[];muted?:string[];queue?:string[];distances?:Record<string,number|'∞'>}
type Spec=Omit<AlgorithmLesson,'frames'|'visual'|'points'|'edges'>&{phases:Phase[];weighted?:boolean}
const make=(s:Spec):AlgorithmLesson=>({...s,visual:'graph',points,edges:s.weighted?weighted:edges,frames:s.phases.map((p):Frame=>({title:p.title,explanation:p.explanation,codeLine:s.code[p.lines[0]-1]?.trim()??'',codeLines:p.lines,state:p.state,active:p.active,accepted:p.accepted,muted:p.muted,queue:p.queue,distances:p.distances}))})

export const graphTreeLessons:AlgorithmLesson[]=[
  make({id:'dfs',index:'26',category:'GRAPH',categoryId:'graph',subcategory:'圖的遍歷',title:'Depth-First Search',zhTitle:'深度優先搜尋',description:'沿單一路徑深入，完成後回溯。',complexity:'O(V + E)',accent:'#a994ff',code:['void dfs(int u, int parent) {','  visited[u] = true;','  for (int v : graph[u]) {','    if (v == parent || visited[v]) continue;','    dfs(v, u);','  }','}'],phases:[
    {title:'進入節點立即標記',explanation:'呼叫 dfs(A) 時先標記 visited[A]，避免沿環回到 A。遞迴呼叫堆疊保存尚未完成的父節點。',lines:[1,2],state:{callStack:['dfs(A)'],visited:['A']},active:['A'],accepted:['A']},
    {title:'沿第一條未訪邊深入',explanation:'依鄰接串列順序 A→B→D→F。每個呼叫在處理完子樹前不會返回，因此形成 DFS tree。',lines:[3,4,5],state:{callStack:['A','B','D','F'],treeEdges:['A-B','B-D','D-F']},active:['A','B','D','F'],accepted:['A','B','D','F']},
    {title:'完成子樹後回溯',explanation:'F 沒有未訪鄰居，函式返回 D，再回到 B 繼續檢查下一個鄰居 E。每條邊最多檢查兩次。',lines:[3,4,5,6],state:{returnFrom:'F',resumeAt:'B',next:'E'},active:['B','E'],accepted:['A','B','D','F']},
  ]}),
  make({id:'flood-fill',index:'27',category:'GRAPH',categoryId:'graph',subcategory:'圖的遍歷',title:'Flood Fill',zhTitle:'網格淹水',description:'從起點擴張所有同色且相連的格子。',complexity:'O(HW)',accent:'#a994ff',code:['void fill(int r, int c) {','  if (!inside(r,c) || grid[r][c] != oldColor) return;','  grid[r][c] = newColor;','  for (auto [dr,dc] : directions)','    fill(r+dr, c+dc);','}'],phases:[
    {title:'檢查邊界與顏色',explanation:'只有在網格內且顏色等於 oldColor 的格子屬於同一區域；其他格子形成遞迴基底。',lines:[1,2],state:{cell:'A',inside:'true',colorMatch:'true'},active:['A']},
    {title:'先染色再擴張',explanation:'將目前格改成 newColor 等同 visited 標記，避免鄰居遞迴再次進入同一格。',lines:[3],state:{painted:['A','B','C'],frontier:['D','E']},active:['A','B','C'],accepted:['A','B','C']},
    {title:'四方向完成連通區',explanation:'每個格子最多成功進入一次；邊界或異色呼叫立即返回，因此總成本與格子數成正比。',lines:[4,5],state:{componentSize:6,result:'all reachable cells recolored'},accepted:['A','B','C','D','E','F']},
  ]}),
  make({id:'multi-source-bfs',index:'28',category:'GRAPH',categoryId:'graph',subcategory:'圖的遍歷',title:'Multi-source BFS',zhTitle:'多源廣度搜尋',description:'把所有來源同時放入 Queue，求最近來源距離。',complexity:'O(V + E)',accent:'#a994ff',code:['queue<int> q;','for (int s : sources) {','  dist[s] = 0; q.push(s);','}','while (!q.empty()) {','  int u = q.front(); q.pop();','  for (int v : graph[u]) if (dist[v] == INF) {','    dist[v] = dist[u] + 1; q.push(v);','  }','}'],phases:[
    {title:'所有來源距離同為 0',explanation:'一次把 A、F 放入 queue，等價於新增超級來源，以零成本連向每個來源。',lines:[1,2,3,4],state:{sources:['A','F'],queue:['A','F']},active:['A','F'],accepted:['A','F'],queue:['A','F']},
    {title:'同步向外擴張',explanation:'FIFO 先處理距離 0，再處理距離 1；一個節點第一次被發現時，必由最近來源抵達。',lines:[5,6,7,8],state:{queue:['B','C','D','E'],layer:1},active:['B','C','D','E'],accepted:['A','B','C','D','E','F'],queue:['B','C','D','E']},
    {title:'第一次發現即為最短距離',explanation:'dist 不再是 INF 時不重複加入。每個節點與邊仍只處理常數次，來源數量不增加漸進複雜度。',lines:[7,8],state:{distance:'A=0,F=0,B=C=D=E=1',owner:'nearest source'},accepted:['A','B','C','D','E','F']},
  ]}),
  make({id:'zero-one-bfs',index:'29',category:'SHORTEST PATH',categoryId:'graph',subcategory:'最短路徑',title:'0-1 BFS',zhTitle:'零一最短路',description:'權重只有 0/1 時以 Deque 取代 Priority Queue。',complexity:'O(V + E)',accent:'#ffca78',weighted:true,code:['deque<int> dq; dist[s] = 0; dq.push_front(s);','while (!dq.empty()) {','  int u = dq.front(); dq.pop_front();','  for (auto [v,w] : graph[u]) if (dist[u]+w < dist[v]) {','    dist[v] = dist[u] + w;','    if (w == 0) dq.push_front(v);','    else dq.push_back(v);','  }','}'],phases:[
    {title:'以 Deque 維持距離順序',explanation:'front 永遠保存目前最小距離候選。起點距離 0，放入前端。',lines:[1],state:{deque:['A'],distA:0},active:['A'],distances:{A:0,B:'∞',C:'∞',D:'∞',E:'∞',F:'∞'}},
    {title:'權重 0 放前端',explanation:'若鬆弛邊權為 0，新節點距離與 u 相同，必須 push_front，先於距離更大的候選處理。',lines:[3,4,5,6],state:{edge:'A→C (0)',deque:['C','B'],operation:'push_front C'},active:['A','C'],accepted:['A']},
    {title:'權重 1 放尾端',explanation:'權重 1 的候選距離多一層，push_back。因鍵值只差 0 或 1，Deque 就足以模擬 Dijkstra 的順序。',lines:[4,5,7],state:{edge:'C→E (1)',deque:['B','E'],operation:'push_back E'},active:['C','E'],accepted:['A','C']},
  ]}),
  make({id:'bellman-ford',index:'30',category:'SHORTEST PATH',categoryId:'graph',subcategory:'最短路徑',title:'Bellman–Ford',zhTitle:'可含負權的最短路',description:'重複鬆弛所有邊，並偵測可達負環。',complexity:'O(VE)',accent:'#ffca78',weighted:true,code:['dist[s] = 0;','for (int pass = 1; pass < n; ++pass)','  for (auto [u,v,w] : edges)','    if (dist[u] != INF && dist[u]+w < dist[v])','      dist[v] = dist[u] + w;','for (auto [u,v,w] : edges)','  if (dist[u] != INF && dist[u]+w < dist[v])','    negativeCycle = true;'],phases:[
    {title:'初始化單一來源',explanation:'只有來源距離為 0。演算法不要求非負邊權，因為不會貪心固定節點。',lines:[1],state:{pass:0,dist:['A=0','others=∞']},active:['A']},
    {title:'每輪將最短路多傳一條邊',explanation:'第 k 輪完整掃描所有邊後，所有使用至多 k 條邊的最短路都已正確。簡單最短路最多含 V−1 條邊。',lines:[2,3,4,5],state:{pass:2,relaxed:['C→B','E→D'],invariant:'paths with ≤2 edges'},active:['C','B','E','D']},
    {title:'第 V 輪仍改善代表負環',explanation:'若再掃一次仍能鬆弛，改善路徑必重複某個節點，且該環總權重為負；只檢查從來源可達的 u。',lines:[6,7,8],state:{extraPass:'relaxable edge found',negativeCycle:'true'},active:['D','F']},
  ]}),
  make({id:'floyd-warshall',index:'31',category:'SHORTEST PATH',categoryId:'graph',subcategory:'最短路徑',title:'Floyd–Warshall',zhTitle:'全點對最短路',description:'依序允許中繼點，更新所有點對距離。',complexity:'O(V³)',accent:'#ffca78',weighted:true,code:['for (int k = 0; k < n; ++k)','  for (int i = 0; i < n; ++i)','    for (int j = 0; j < n; ++j)','      dist[i][j] = min(dist[i][j],','                       dist[i][k] + dist[k][j]);'],phases:[
    {title:'建立 DP 不變量',explanation:'第 k 輪前，dist[i][j] 是只允許編號 <k 節點作為中繼點的最短距離。',lines:[1],state:{k:'A',allowedIntermediates:'none'},active:['A']},
    {title:'決定是否經過 k',explanation:'任一合法路徑要嘛不經 k，要嘛可拆成 i→k 與 k→j；取兩者較小即可涵蓋所有情況。',lines:[2,3,4,5],state:{pair:'B→E',direct:6,viaC:'1+2=3',newDist:3},active:['B','C','E']},
    {title:'完成所有中繼點',explanation:'k 必須是最外層迴圈，才能保證讀取的兩段距離已符合上一階段不變量。完成後得到所有點對最短路。',lines:[1,2,3],state:{allowedIntermediates:'A..F',result:'all-pairs distances'},accepted:['A','B','C','D','E','F']},
  ]}),
  make({id:'topological-sort',index:'32',category:'DAG',categoryId:'graph',subcategory:'有向圖',title:'Topological Sort',zhTitle:'拓樸排序',description:'重複移除入度為零的節點。',complexity:'O(V + E)',accent:'#a994ff',code:['queue<int> q;','for (int u = 0; u < n; ++u)','  if (indegree[u] == 0) q.push(u);','while (!q.empty()) {','  int u = q.front(); q.pop(); order.push_back(u);','  for (int v : graph[u])','    if (--indegree[v] == 0) q.push(v);','}','if (order.size() != n) cycleExists = true;'],phases:[
    {title:'入度零節點沒有未完成前置',explanation:'把所有 indegree=0 節點加入 queue；它們可以安全成為目前序列的下一個位置。',lines:[1,2,3],state:{indegree:'A=0,B=1,C=1,D=1,E=2,F=2',queue:['A']},active:['A'],queue:['A']},
    {title:'移除節點並刪除出邊',explanation:'輸出 A 後，視為刪除 A 的所有出邊，使 B、C 入度降為 0 並入隊。',lines:[4,5,6,7],state:{order:['A'],queue:['B','C'],newZero:['B','C']},active:['A','B','C'],accepted:['A'],queue:['B','C']},
    {title:'未輸出完代表有環',explanation:'若 queue 提前為空，剩餘子圖每個節點入度都 >0，沿前驅追蹤必形成有向環，因此不存在拓樸序。',lines:[9],state:{outputCount:6,vertexCount:6,cycle:'false'},accepted:['A','B','C','D','E','F']},
  ]}),
  make({id:'euler-circuit',index:'33',category:'GRAPH',categoryId:'graph',subcategory:'有向圖',title:'Euler Circuit',zhTitle:'歐拉迴路',description:'以 Hierholzer 逐邊走訪並在死路時輸出。',complexity:'O(E)',accent:'#a994ff',code:['stack<int> st; st.push(start);','while (!st.empty()) {','  int u = st.top();','  if (hasUnusedEdge(u)) {','    auto [u,v] = takeUnusedEdge(u); st.push(v);','  } else {','    circuit.push_back(u); st.pop();','  }','}','reverse(circuit.begin(), circuit.end());'],phases:[
    {title:'每條邊只能使用一次',explanation:'從 start 出發，遇到未使用邊就標記並沿它前進；stack 保存當前 trail。',lines:[1,2,3,4,5],state:{stack:['A','B','D','F'],usedEdges:['A-B','B-D','D-F']},active:['A','B','D','F']},
    {title:'死路節點逆序加入答案',explanation:'當 top 沒有未使用出邊，該節點在剩餘圖中的位置已確定，加入 circuit 後回退。',lines:[6,7],state:{deadEnd:'F',circuit:['F'],stack:['A','B','D']},active:['F'],accepted:['F']},
    {title:'反轉得到正向迴路',explanation:'回退過程可能插入其他封閉子迴路；逆序輸出自然把它們拼接。無向圖存在歐拉迴路需所有非零度節點連通且度數為偶。',lines:[10],state:{circuit:['A','B','D','F','E','C','A'],allEdgesUsed:'true'},accepted:['A','B','C','D','E','F']},
  ]}),
  make({id:'dsu',index:'34',category:'DSU',categoryId:'graph',subcategory:'連通性',title:'Disjoint Set Union',zhTitle:'並查集',description:'以代表元維護動態集合的合併與查詢。',complexity:'Amortized O(α(n))',accent:'#a994ff',code:[
    'struct DSU {',
    '  int n;',
    '  vector<int> parent, size;',
    '  explicit DSU(int n = 0) : n(n), parent(n), size(n, 1) {',
    '    iota(parent.begin(), parent.end(), 0);',
    '  }',
    '  int find(int x) {',
    '    if (parent[x] == x) return x;',
    '    return parent[x] = find(parent[x]);',
    '  }',
    '  bool unite(int a, int b) {',
    '    a = find(a); b = find(b);',
    '    if (a == b) return false;',
    '    if (size[a] < size[b]) swap(a, b);',
    '    parent[b] = a; size[a] += size[b];',
    '    return true;',
    '  }',
    '  bool same(int a, int b) { return find(a) == find(b); }',
    '};',
  ],phases:[
    {title:'Find 沿父指標找到代表元',explanation:'根節點滿足 parent[x]=x；同集合元素的 find 結果相同。',lines:[7,8],state:{parent:['A→A','B→A','D→B'],query:'find(D)'},active:['A','B','D']},
    {title:'路徑壓縮直接連到根',explanation:'遞迴返回時令 parent[D]=A，之後查詢可跳過 B；這不改變集合劃分。',lines:[9],state:{before:'D→B→A',after:'D→A'},active:['D','A'],accepted:['A']},
    {title:'小樹掛到大樹',explanation:'先找兩個根；若不同，以 size 決定方向。合併大小可限制樹高，搭配壓縮得到近常數攤銷時間。',lines:[11,12,13,14,15,16,17],state:{merge:'root(E) → root(A)',newSize:5},active:['A','E'],accepted:['A','B','D','E']},
  ]}),
  make({id:'tarjan-scc',index:'35',category:'CONNECTIVITY',categoryId:'graph',subcategory:'連通性',title:'Tarjan SCC',zhTitle:'強連通分量',description:'以 DFS low-link 找出可互達的極大集合。',complexity:'O(V + E)',accent:'#a994ff',code:['void dfs(int u) {','  disc[u] = low[u] = timer++; st.push(u); inStack[u] = true;','  for (int v : graph[u]) {','    if (disc[v] == -1) { dfs(v); low[u] = min(low[u], low[v]); }','    else if (inStack[v]) low[u] = min(low[u], disc[v]);','  }','  if (low[u] == disc[u]) {','    do { v = st.top(); st.pop(); inStack[v] = false; } while (v != u);','  }','}'],phases:[
    {title:'Discovery 與 Low-Link',explanation:'disc[u] 是首次進入時間；low[u] 是沿 DFS tree 邊與指向 stack 內節點的回邊可到達的最小 disc。',lines:[1,2],state:{stack:['A','B','D'],disc:'A0 B1 D2',low:'A0 B1 D2'},active:['A','B','D']},
    {title:'只用 Stack 內回邊更新',explanation:'遇到仍在 stack 的 v，代表它可能與 u 互達，使用 disc[v] 更新；已完成 SCC 的節點不可參與。',lines:[3,4,5],state:{edge:'D→B',update:'low[D]: 2→1',stack:['A','B','D']},active:['D','B']},
    {title:'Low 等於 Disc 時彈出 SCC',explanation:'low[u]=disc[u] 表示 u 的子樹無法回到更早的 stack 節點；從 top 彈到 u 恰為一個極大 SCC。',lines:[7,8],state:{root:'B',component:['B','D','F'],remainingStack:['A']},active:['B','D','F'],accepted:['B','D','F']},
  ]}),
  make({id:'bridges',index:'36',category:'CONNECTIVITY',categoryId:'graph',subcategory:'連通性',title:'Bridges',zhTitle:'橋與 Low-Link',description:'找出刪除後會增加連通分量的邊。',complexity:'O(V + E)',accent:'#a994ff',code:['void dfs(int u, int parentEdge) {','  disc[u] = low[u] = timer++;','  for (auto [v,id] : graph[u]) {','    if (id == parentEdge) continue;','    if (disc[v] == -1) {','      dfs(v,id); low[u] = min(low[u],low[v]);','      if (low[v] > disc[u]) bridge[id] = true;','    } else low[u] = min(low[u],disc[v]);','  }','}'],phases:[
    {title:'DFS Tree 與回邊',explanation:'low[v] 表示 v 子樹能否經非父邊回到 u 或更早祖先；重邊必須以 edge id 區分父邊。',lines:[1,2,3,4,5],state:{treeEdge:'B-D',discB:1,discD:2},active:['B','D']},
    {title:'子樹若能回到祖先則不是橋',explanation:'若 low[v]≤disc[u]，v 子樹存在繞過 (u,v) 的路徑，刪除該邊仍保持連通。',lines:[6,8],state:{edge:'C-E',lowE:0,discC:2,bridge:'false'},active:['C','E','A']},
    {title:'Low 嚴格大於父節點時間',explanation:'low[v]>disc[u] 代表 v 子樹沒有其他邊回到 u 以上；(u,v) 是唯一連接，因此必為橋。',lines:[6,7],state:{edge:'D-F',lowF:5,discD:3,bridge:'true'},active:['D','F'],accepted:['D','F']},
  ]}),
  make({id:'articulation-points',index:'37',category:'CONNECTIVITY',categoryId:'graph',subcategory:'連通性',title:'Articulation Points',zhTitle:'割點',description:'找出刪除後會增加連通分量的節點。',complexity:'O(V + E)',accent:'#a994ff',code:['void dfs(int u, int parent) {','  disc[u] = low[u] = timer++; int children = 0;','  for (int v : graph[u]) if (v != parent) {','    if (disc[v] == -1) {','      ++children; dfs(v,u); low[u] = min(low[u],low[v]);','      if (parent != -1 && low[v] >= disc[u]) cut[u] = true;','    } else low[u] = min(low[u],disc[v]);','  }','  if (parent == -1 && children >= 2) cut[u] = true;','}'],phases:[
    {title:'非根節點判定',explanation:'若某子節點 v 滿足 low[v]≥disc[u]，v 子樹無法繞到 u 的祖先；刪除 u 會使該子樹分離。',lines:[3,4,5,6],state:{u:'B',child:'D',lowD:3,discB:1},active:['B','D']},
    {title:'等號與橋不同',explanation:'low[v]=disc[u] 時可回到 u，但刪除 u 後這條回邊也消失，所以 u 仍是割點；橋則要求嚴格大於。',lines:[6],state:{condition:'low[D] ≥ disc[B]',cutB:'true'},active:['B'],accepted:['B']},
    {title:'DFS 根需要獨立規則',explanation:'根沒有祖先；只有當 DFS tree 中有至少兩個子樹時，刪除根才會把它們分開。',lines:[9],state:{root:'A',children:2,cutA:'true'},active:['A','B','C'],accepted:['A']},
  ]}),
  make({id:'tree-diameter',index:'38',category:'TREE',categoryId:'trees',subcategory:'樹的基礎',title:'Tree Diameter',zhTitle:'樹直徑',description:'兩次最遠點搜尋找出樹上最長簡單路徑。',complexity:'O(V)',accent:'#8bc7ff',code:['auto [x, _] = farthest(0);','auto [y, diameter] = farthest(x);','int max_tree_diameter = diameter;'],phases:[
    {title:'從任意節點找最遠端點',explanation:'在樹上從任意 A 出發，距離最遠的節點 x 必可作為某條直徑的端點。',lines:[1],state:{start:'A',farthest:'F',distance:3},active:['A','B','D','F'],accepted:['F']},
    {title:'從端點再次找最遠點',explanation:'以 F 為起點做 DFS/BFS，最遠節點 C 與 F 之間的唯一路徑具有最大長度。',lines:[2],state:{start:'F',farthest:'C',diameter:4},active:['F','D','B','A','C'],accepted:['F','C']},
    {title:'唯一路徑保證正確',explanation:'樹沒有環且兩點路徑唯一；若存在更長路徑，從第一次搜尋端點出發會找到至少同樣遠的端點，與最遠性矛盾。',lines:[3],state:{diameterPath:['F','D','B','A','C'],length:4},accepted:['A','B','C','D','F']},
  ]}),
  make({id:'euler-tour-flattening',index:'39',category:'TREE',categoryId:'trees',subcategory:'樹的基礎',title:'Euler Tour Flattening',zhTitle:'樹壓平',description:'以 DFS 進出時間把子樹映射成連續陣列。',complexity:'Build O(V)',accent:'#8bc7ff',code:['void dfs(int u, int p) {','  tin[u] = timer++;','  order.push_back(u);','  for (int v : tree[u]) if (v != p) dfs(v,u);','  tout[u] = timer;','}'],phases:[
    {title:'進入節點時記錄 Tin',explanation:'Preorder DFS 在第一次進入 u 時把 u 放入 order；timer 單調遞增。',lines:[1,2,3],state:{order:['A','B'],tin:'A=0,B=1'},active:['A','B']},
    {title:'完整處理子樹才返回',explanation:'DFS 在處理完 B 的所有後代前不會造訪 B 子樹外節點，因此 B 子樹在 order 中必連續。',lines:[4],state:{order:['A','B','D','F','E'],subtreeB:'[1,5)'},active:['B','D','E','F'],accepted:['B']},
    {title:'以半開區間表示子樹',explanation:'tout[u] 記錄離開時 timer。u 的子樹恰為 order[tin[u]..tout[u])，可交給 Fenwick 或 Segment Tree。',lines:[5],state:{tinB:1,toutB:5,range:'[1,5)'},accepted:['B','D','E','F']},
  ]}),
  make({id:'lca-binary-lifting',index:'40',category:'TREE',categoryId:'trees',subcategory:'祖先與路徑',title:'LCA with Binary Lifting',zhTitle:'最近共同祖先與倍增',description:'用 2 的冪次祖先快速同步深度並跳躍。',complexity:'O(log V) per query',accent:'#8bc7ff',code:['if (depth[u] < depth[v]) swap(u,v);','for (int k = LOG-1; k >= 0; --k)','  if (depth[up[u][k]] >= depth[v]) u = up[u][k];','if (u == v) return u;','for (int k = LOG-1; k >= 0; --k)','  if (up[u][k] != up[v][k]) u=up[u][k], v=up[v][k];','return up[u][0];'],phases:[
    {title:'先同步兩個節點深度',explanation:'較深節點依 depth 差的二進位表示向上跳；每次採最大可行 2^k，不會越過目標深度。',lines:[1,2,3],state:{u:'F(depth3)',v:'C(depth1)',jump:'2¹: F→B'},active:['F','B','C']},
    {title:'若重合則直接得到 LCA',explanation:'同步深度後若 u=v，較淺的原節點就是另一節點的祖先，也是最近共同祖先。',lines:[4],state:{u:'B',v:'C',equal:'false'},active:['B','C']},
    {title:'由大到小保持祖先不同',explanation:'同時跳到仍不同的 2^k 祖先；結束時 u、v 位於 LCA 的兩個直接子樹，回傳 parent[u]。',lines:[5,6,7],state:{u:'B',v:'C',parent:'A',LCA:'A'},active:['A','B','C'],accepted:['A']},
  ]}),
  make({id:'tree-centroid',index:'41',category:'TREE',categoryId:'trees',subcategory:'樹分治',title:'Tree Centroid',zhTitle:'樹重心',description:'找出刪除後每個連通塊至多 n/2 的節點。',complexity:'O(V)',accent:'#8bc7ff',code:['int centroid(int u, int p, int n) {','  for (int v : tree[u]) if (v != p)','    if (subtree[v] > n/2) return centroid(v,u,n);','  return u;','}'],phases:[
    {title:'先計算 Subtree Size',explanation:'固定任意根後，subtree[v] 是切斷父邊時 v 側連通塊大小；父側大小為 n−subtree[u]。',lines:[1,2],state:{n:6,subtree:'A6 B4 C1 D2 E1 F1'},active:['A','B']},
    {title:'往唯一過大的子樹移動',explanation:'若某子樹大小 >n/2，當前節點不可能是重心，且重心必在該子樹內；過大方向至多一個。',lines:[2,3],state:{current:'A',heavyChild:'B',size:4,half:3},active:['A','B']},
    {title:'沒有過大方向即為重心',explanation:'到 B 後每個子樹與父側大小都 ≤3，因此刪除 B 後所有連通塊符合定義。樹至多有兩個相鄰重心。',lines:[4],state:{centroid:'B',componentSizes:['2','1','1','1']},active:['B'],accepted:['B']},
  ]}),
  make({id:'heavy-light-decomposition',index:'42',category:'TREE',categoryId:'trees',subcategory:'祖先與路徑',title:'Heavy-Light Decomposition',zhTitle:'重鏈剖分',description:'把任意樹路徑拆成 O(log V) 個連續鏈區間。',complexity:'Query O(log² V)',accent:'#8bc7ff',code:['while (head[u] != head[v]) {','  if (depth[head[u]] < depth[head[v]]) swap(u,v);','  answer += query(pos[head[u]], pos[u]);','  u = parent[head[u]];','}','if (depth[u] > depth[v]) swap(u,v);','answer += query(pos[u], pos[v]);'],phases:[
    {title:'每節點選最大子樹為 Heavy Edge',explanation:'heavy child 至少占父子樹的一半門檻意義：沿 light edge 往下時子樹大小至少減半，因此最多跨 O(log V) 條 light edge。',lines:[1],state:{heavyEdges:['A-B','B-D','D-F'],lightEdges:['A-C','B-E']},active:['A','B','D','F']},
    {title:'同一條 Heavy Chain 映射成連續區間',explanation:'DFS 先走 heavy child，讓同鏈 pos 連續；Segment Tree 可一次查詢整段鏈。',lines:[3],state:{chain:'A-B-D-F',positions:'[0,3]',query:'D..F'},active:['D','F'],accepted:['D','F']},
    {title:'每次跳過一條 Light Edge',explanation:'兩端不在同鏈時處理較深 head 到 u，然後跳到 head 的父節點；最多 O(log V) 段，每段區間查詢 O(log V)。',lines:[1,2,3,4,5,6,7],state:{path:'C→F',segments:['C','A-B-D-F'],complexity:'O(log² V)'},active:['C','A','B','D','F']},
  ]}),
  make({id:'centroid-decomposition',index:'43',category:'TREE',categoryId:'trees',subcategory:'樹分治',title:'Centroid Decomposition',zhTitle:'重心分解',description:'反覆以重心切分，建立高度 O(log V) 的重心樹。',complexity:'Build O(V log V)',accent:'#8bc7ff',code:['int c = findCentroid(component);','removed[c] = true;','for (int v : tree[c]) if (!removed[v]) {','  int child = decompose(componentOf(v));','  centroidParent[child] = c;','}'],phases:[
    {title:'選重心平衡切分',explanation:'重心保證刪除後每個連通塊大小 ≤原大小一半，因此遞迴深度至多 O(log V)。',lines:[1,2],state:{componentSize:6,centroid:'B'},active:['B'],accepted:['B']},
    {title:'每個剩餘連通塊獨立遞迴',explanation:'標記 B removed 後，各鄰居所在連通塊互不相交；分別找新重心。',lines:[3,4],state:{components:['{A,C}','{D,F}','{E}'],nextCentroids:['A','D','E']},active:['A','D','E'],accepted:['B']},
    {title:'建立新的 Centroid Tree',explanation:'遞迴得到的重心設 B 為 centroid parent。原樹距離通常預先保存到每層重心，支援動態最近點查詢。',lines:[5],state:{centroidTree:['B→A','B→D','B→E'],height:'≤ log V'},accepted:['A','B','D','E']},
  ]}),
  make({id:'tree-isomorphism',index:'44',category:'TREE',categoryId:'trees',subcategory:'樹的基礎',title:'Tree Isomorphism',zhTitle:'樹同構',description:'以排序後的子樹編碼判斷結構是否相同。',complexity:'O(V log V)',accent:'#8bc7ff',code:['string encode(int u, int p) {','  vector<string> children;','  for (int v : tree[u]) if (v != p)','    children.push_back(encode(v,u));','  sort(children.begin(), children.end());','  return "(" + concat(children) + ")";','}'],phases:[
    {title:'葉節點得到相同基本編碼',explanation:'葉沒有子樹，因此不論編號與畫面位置，編碼都是 ()；編碼只描述結構。',lines:[1,2,3,6],state:{leafCodes:['C=()','E=()','F=()']},active:['C','E','F']},
    {title:'排序子樹編碼消除子節點順序',explanation:'無序樹中交換兄弟節點不改變同構；排序後再串接，使相同多重集合得到唯一結果。',lines:[3,4,5],state:{node:'B',childCodes:['()','(())'],sorted:['(())','()']},active:['B','D','E','F']},
    {title:'比較根編碼',explanation:'兩棵有根樹同構若且唯若根編碼相同。無根樹先找一或兩個重心，再比較可能的根編碼。',lines:[6],state:{tree1:'((())()())',tree2:'((())()())',isomorphic:'true'},accepted:['A','B','C','D','E','F']},
  ]}),
]
