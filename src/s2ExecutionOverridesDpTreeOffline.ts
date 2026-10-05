import type { AlgorithmLesson, Frame, Point } from './algorithms'
import { eventFrame, lineNumber } from './traceAuthoring'

type TraceBuilder=(lesson:AlgorithmLesson)=>Frame[]

const parallelSearchView=(step:number):NonNullable<Frame['executionView']>=>{
  const intervals=[
    [[0,4],[0,4],[0,4]],
    [[0,4],[0,4],[0,4]],
    [[0,2],[0,2],[3,4]],
    [[0,2],[0,2],[3,4]],
    [[0,1],[2,2],[3,4]],
    [[0,1],[2,2],[4,4]],
    [[1,1],[2,2],[4,4]],
  ][step]
  const mids=[['—','—','—'],['2','2','2'],['2','2','2'],['1','1','3'],['1','1','3'],['1','1','3'],['0','—','—']][step]
  return {kind:'table',title:'PARALLEL BINARY SEARCH · earliest prefix threshold',
    columns:['Query','Threshold','lo','hi','mid'],
    rows:intervals.map(([lo,hi],index)=>[`q${index}`,String([3,6,10][index]),String(lo),String(hi),mids[index]]),
    activeRow:step===4?1:step===5?2:step===6?0:undefined,
    badges:step===2?['t=2 · prefix=6']:step===4?['t=1 · prefix=3']:step===5?['t=3 · prefix=8']:step===6?['答案 1, 2, 4']:[],
  }
}

const huffmanHeapView=(frame:Frame):NonNullable<Frame['executionView']>=>{
  const heap=Array.isArray(frame.state?.heap)?frame.state.heap:[]
  const take=Array.isArray(frame.state?.take)?frame.state.take:[]
  return {kind:'table',title:'HUFFMAN · current min-heap after this step',
    columns:['rank','tree weight'],
    rows:heap.map((weight,index)=>[String(index+1),weight]),
    badges:[`cost = ${frame.state?.cost}`,...(take.length?[`take ${take.join(' + ')} → ${frame.state?.push}`]:[])],
  }
}

const treePoints:Point[]=[
  {id:'A',x:12,y:46,label:'A'},{id:'B',x:34,y:22,label:'B'},
  {id:'C',x:34,y:76,label:'C'},{id:'D',x:60,y:16,label:'D'},
  {id:'E',x:60,y:48,label:'E'},{id:'F',x:86,y:16,label:'F'},
]
const treeEdges=[
  {from:'A',to:'B'},{from:'A',to:'C'},{from:'B',to:'D'},
  {from:'B',to:'E'},{from:'D',to:'F'},
]

const codeOverrides:Record<string,string[]>={
  'dsu-on-tree':[
    'dfsSize(u,p);',
    'solve(u,p,keep){',
    '  for(v:lightChildren(u)) solve(v,u,false);',
    '  if(heavy[u]!=-1) solve(heavy[u],u,true);',
    '  for(v:lightChildren(u)){',
    '    addSubtree(v);',
    '  }',
    '  add(u);',
    '  answer[u]=current();',
    '  if(!keep) removeSubtree(u);',
    '}',
  ],
  'small-to-large':[
    'set<int>* dfs(int u,int p){',
    '  auto* cur=new set<int>{color[u]};',
    '  for(int v:tree[u]){',
    '    if(v==p) continue;',
    '    auto* child=dfs(v,u);',
    '    if(cur->size()<child->size()){',
    '      swap(cur,child);',
    '    }',
    '    cur->insert(child->begin(),child->end());',
    '    delete child;',
    '  }',
    '  answer[u]=cur->size();',
    '  return cur;',
    '}',
  ],
  'huffman-coding':[
    'long long huffmanMergeCost(const vector<long long>& freq) {',
    '  priority_queue<long long,vector<long long>,greater<long long>> pq(freq.begin(),freq.end());',
    '  long long cost=0;',
    '  while(pq.size()>1){',
    '    long long a=pq.top(); pq.pop();',
    '    long long b=pq.top(); pq.pop();',
    '    cost+=a+b;',
    '    pq.push(a+b);',
    '  }',
    '  return cost;',
    '}',
  ],
  'interval-dp':[
    'for(int i=0;i<n;++i) dp[i][i+1]=0;',
    'for(int len=2;len<=n;++len)',
    '  for(int l=0;l+len<=n;++l){',
    '    int r=l+len; dp[l][r]=INF;',
    '    for(int k=l+1;k<r;++k)',
    '      dp[l][r]=min(dp[l][r],dp[l][k]+dp[k][r]+rangeSum(l,r));',
    '  }',
  ],
  'dag-dp':[
    'vector<int> order=topologicalSort();',
    'fill(dp.begin(),dp.end(),-INF); dp[source]=0;',
    'for(int u:order) if(dp[u]>-INF)',
    '  for(auto [v,w]:g[u])',
    '    dp[v]=max(dp[v],dp[u]+w);',
  ],
  'monotone-queue-optimization':[
    'deque<int> dq; dp[0]=base[0]; dq.push_back(0);',
    'for(int i=1;i<n;++i){',
    '  while(!dq.empty() && dq.front()<i-K) dq.pop_front();',
    '  dp[i]=base[i]+dp[dq.front()];',
    '  while(!dq.empty() && dp[dq.back()]<=dp[i]) dq.pop_back();',
    '  dq.push_back(i);',
    '}',
  ],
}

const lessonOverrides:Record<string,Partial<AlgorithmLesson>>={
  'huffman-coding':{description:'反覆合併兩個最低頻率節點。本動畫只計算最優樹的加權路徑長（合併成本），不產生每個符號的編碼字。'},
  'grid-dp':{visual:'dp'},
  'matrix-chain-multiplication':{visual:'dp'},
  'interval-dp':{visual:'dp'},
  'dag-dp':{visual:'dp'},
  'probability-dp':{visual:'dp'},
  'dp-reconstruction':{visual:'dp'},
  'monotone-queue-optimization':{visual:'dp'},
  'aliens-optimization':{visual:'dp'},
  'small-to-large':{visual:'tree',points:treePoints,edges:treeEdges},
  'dsu-on-tree':{visual:'tree',points:treePoints,edges:treeEdges},
  'virtual-tree':{visual:'tree',points:treePoints,edges:treeEdges},
}

const overrides:Record<string,TraceBuilder>={
  'grid-dp':lesson=>[
    eventFrame(lesson,'dp[0][0]=grid[0][0]','3×3 Grid，起點 dp=1','grid=[[1,3,1],[1,5,1],[4,2,1]]，只允許向右或向下，目標最小路徑和。',{grid:['1 3 1','1 5 1','4 2 1'],dp00:1,operation:'initialize start'}),
    eventFrame(lesson,'if(c) relax','第一列只能從左邊來','dp[0][1]=1+3=4，dp[0][2]=4+1=5。',{row0:['1','4','5'],operation:'fill top row'}),
    eventFrame(lesson,'if(r) relax','第一欄只能從上方來','dp[1][0]=1+1=2，dp[2][0]=2+4=6。',{col0:['1','2','6'],operation:'fill left column'}),
    eventFrame(lesson,'if(r) relax','Cell (1,1)：從上方候選 4+5=9','先用 dp[0][1] 放入候選 9。',{cell:'(1,1)',fromTop:9,operation:'relax from top'}),
    eventFrame(lesson,'if(c) relax','同一 Cell 從左為 2+5=7，更好','dp[1][1]=7。',{cell:'(1,1)',fromLeft:7,result:7,operation:'relax from left'}),
    eventFrame(lesson,'if(c) relax','依 Row-major 完成其餘格','dp table = [[1,4,5],[2,7,6],[6,8,7]]。',{dp:['1 4 5','2 7 6','6 8 7'],operation:'finish grid table'}),
    eventFrame(lesson,'} // row-major complete','右下答案 7','最佳路徑可走 1→3→1→1→1，總和 7。',{result:7,path:['(0,0)','(0,1)','(0,2)','(1,2)','(2,2)'],operation:'read destination'}),
  ],

  'matrix-chain-multiplication':lesson=>[
    eventFrame(lesson,'for(int len=2','三個 Matrix：10×30、30×5、5×60','dim=[10,30,5,60]，單一矩陣乘法成本 0。',{dims:['10','30','5','60'],matrices:['A:10×30','B:30×5','C:5×60'],operation:'initialize chain'}),
    eventFrame(lesson,'dp[l][r]=INF','Len=2：計算 AB','唯一切點 k=1，成本 10·30·5=1500。',{interval:'AB',k:1,cost:1500,operation:'base pair cost'}),
    eventFrame(lesson,'dp[l][r]=min','Len=2：計算 BC','成本 30·5·60=9000。',{interval:'BC',k:2,cost:9000,operation:'second pair cost'}),
    eventFrame(lesson,'for(int k=l+1','Full ABC，先試 k=1','A × (BC)：0+9000+10·30·60 = 27000。',{interval:'ABC',split:'A | BC',candidate:27000,operation:'evaluate split'}),
    eventFrame(lesson,'dp[l][r]=min','再試 k=2','(AB) × C：1500+0+10·5·60 = 4500，更小。',{interval:'ABC',split:'AB | C',candidate:4500,operation:'improve split'}),
    eventFrame(lesson,'} // interval complete','最少 Scalar Multiplications = 4500','最佳括號化為 (AB)C。',{result:4500,parenthesization:'(AB)C',operation:'finish matrix chain'}),
  ],

  'interval-dp':lesson=>[
    eventFrame(lesson,'dp[i][i+1]=0','Merge Weights = [3,1,4,1]','dp[l][r] 是把半開區間合併成一堆的最小成本；單元素成本 0。',{weights:['3','1','4','1'],operation:'initialize interval bases'}),
    eventFrame(lesson,'for(int len=2','Len=2 結果','[0,2]=4、[1,3]=5、[2,4]=5。',{len:2,dp:['4','5','5'],operation:'solve short intervals'}),
    eventFrame(lesson,'for(int k=l+1','[0,3] 試 k=1','0 + dp[1,3]5 + rangeSum8 = 13。',{interval:'[0,3]',k:1,candidate:13,operation:'evaluate split'}),
    eventFrame(lesson,'dp[l][r]=min','同區間 k=2 得 12','dp[0,2]4 + 0 + 8 =12，因此 dp[0,3]=12。',{interval:'[0,3]',k:2,candidate:12,result:12,operation:'choose better split'}),
    eventFrame(lesson,'dp[l][r]=min','[1,4] 最佳 = 11','k=2 或 3 都可得到 11。',{interval:'[1,4]',result:11,operation:'solve second length-3 interval'}),
    eventFrame(lesson,'for(int k=l+1','Full [0,4] 枚舉 k=1,2,3','候選分別 20、18、21，因此選 k=2。',{interval:'[0,4]',candidates:['k1=20','k2=18','k3=21'],operation:'enumerate final splits'}),
    eventFrame(lesson,'dp[l][r]=min','Full Answer = 18','依長度由短到長，所有讀到的子區間都已完成。',{result:18,operation:'finish interval DP'}),
  ],

  'dag-dp':lesson=>[
    eventFrame(lesson,'topologicalSort','DAG：A→B(2),A→C(1),B→D(3),C→D(5),D→E(1)','Topo order 使用 A,B,C,D,E；目標求 source A 的最長路。',{order:['A','B','C','D','E'],operation:'topological order'}),
    eventFrame(lesson,'dp[source]=0','初始化 A=0，其餘 -∞','不可達狀態不應參與轉移。',{dp:'A0 B-∞ C-∞ D-∞ E-∞',operation:'initialize longest path'}),
    eventFrame(lesson,'dp[v]=max','處理 A：B=2、C=1','A 的 state 已 finalized，沿出邊傳遞。',{u:'A',updates:['B:2','C:1'],operation:'propagate from A'}),
    eventFrame(lesson,'dp[v]=max','處理 B：D=5','2+3=5。',{u:'B',edge:'B→D(3)',update:'D:-∞→5',operation:'relax D'}),
    eventFrame(lesson,'dp[v]=max','處理 C：D 改善到 6','1+5=6，比 B 路徑的 5 更長。',{u:'C',edge:'C→D(5)',update:'D:5→6',operation:'improve D'}),
    eventFrame(lesson,'dp[v]=max','處理 D：E=7','6+1=7，得到完整最長路 A→C→D→E。',{u:'D',update:'E:-∞→7',result:7,operation:'finish DAG DP'}),
  ],

  'probability-dp':lesson=>[
    eventFrame(lesson,'prob[start]=1.0','起點 S 的 Probability Mass = 1','S 有兩條轉移：S→A 0.6、S→B 0.4。',{prob:['S=1','A=0','B=0','T1=0','T2=0'],operation:'initialize probability'}),
    eventFrame(lesson,'prob[t]+=prob[s]*p','S→A：A 得 0.6','1×0.6 加入 A。',{edge:'S→A',p:0.6,update:'A:0→0.6',operation:'distribute mass'}),
    eventFrame(lesson,'prob[t]+=prob[s]*p','S→B：B 得 0.4','目前總質量仍 1。',{edge:'S→B',p:0.4,update:'B:0→0.4',operation:'distribute mass'}),
    eventFrame(lesson,'prob[t]+=prob[s]*p','A 各半流向 T1、T2','A=0.6，所以各送 0.3。',{from:'A',updates:['T1:+0.3','T2:+0.3'],operation:'split A mass'}),
    eventFrame(lesson,'prob[t]+=prob[s]*p','B 以 0.25/0.75 分流','T1 再得 0.4×0.25=0.1；T2 得 0.3。',{from:'B',updates:['T1:+0.1','T2:+0.3'],operation:'split B mass'}),
    eventFrame(lesson,'for(State s:topologicalOrder)','Terminal Distribution = (0.4,0.6)','T1+T2=1，機率質量守恆。',{T1:0.4,T2:0.6,total:1,operation:'verify terminal mass'}),
  ],

  'dp-reconstruction':lesson=>[
    eventFrame(lesson,'if(candidate<dp[next])','Shortest-path DP：A→B Cost2','改善 B 時同步保存 parent[B]=A、choice[B]="A-B"。',{state:'A',next:'B',candidate:2,parent:'B←A',choice:'A-B',operation:'store predecessor'}),
    eventFrame(lesson,'dp[next]=candidate','A→C 先得到 5','parent[C]=A。',{next:'C',dpC:5,parent:'C←A',operation:'first C candidate'}),
    eventFrame(lesson,'if(candidate<dp[next])','B→C Cost1 改善 C 到 3','這次更新值時必須一起把 parent[C] 改成 B；不能保留舊 parent A。',{candidate:'2+1=3',before:5,after:3,parent:'C←B',operation:'replace predecessor'}),
    eventFrame(lesson,'dp[next]=candidate','B→D 先得到 6；C→D 再改善成 4','最終 parent[D]=C。',{dpD:'∞→6→4',parent:'D←C',operation:'finish relaxations'}),
    eventFrame(lesson,'for(State s=goal','從 Goal D 反向走 Parent','D←C←B←A，收集 choice 順序 C-D、B-C、A-B。',{backtrack:['D','C','B','A'],reverseMoves:['C-D','B-C','A-B'],operation:'backtrack parents'}),
    eventFrame(lesson,'reverse(answer.begin()','Reverse 得 Forward Solution','最優路徑 A→B→C→D，總 cost 4。',{answer:['A-B','B-C','C-D'],cost:4,operation:'restore forward solution'}),
  ],

  'monotone-queue-optimization':lesson=>[
    eventFrame(lesson,'dp[0]=base[0]','Recurrence：dp[i]=base[i]+max dp[j], j∈[i-3,i)','base=[0,2,-1,3,1,4]，dp[0]=0，Deque=[0]。',{K:3,base:['0','2','-1','3','1','4'],dp0:0,deque:['0'],operation:'initialize candidates'}),
    eventFrame(lesson,'dp[i]=base[i]+dp[dq.front()]','i=1：2+dp[0]=2','dp[1]=2。',{i:1,bestJ:0,dp1:2,operation:'use deque front'}),
    eventFrame(lesson,'dp[dq.back()]<=dp[i]','dp1=2 支配 dp0=0','索引 0 更小且更早過期，因此 pop_back 0，Push 1。',{popped:0,deque:['1'],operation:'remove dominated candidate'}),
    eventFrame(lesson,'dp[i]=base[i]+dp[dq.front()]','i=2：-1+2=1','dp[2]=1；因 1<2，Deque=[1,2]。',{i:2,dp2:1,deque:['1','2'],operation:'append weaker candidate'}),
    eventFrame(lesson,'dp[i]=base[i]+dp[dq.front()]','i=3：3+2=5','front=1 給最佳值 2，所以 dp3=5。',{i:3,bestJ:1,dp3:5,operation:'compute optimized transition'}),
    eventFrame(lesson,'dp[dq.back()]<=dp[i]','dp3=5 清掉 2、1','兩個舊候選都被支配，Deque=[3]。',{popped:['2','1'],deque:['3'],operation:'compress candidates'}),
    eventFrame(lesson,'dp[i]=base[i]+dp[dq.front()]','i=4 得 6；i=5 得 10','每次 front 直接提供 window 最大 dp，最終 dp=[0,2,1,5,6,10]。',{dp:['0','2','1','5','6','10'],operation:'finish linear DP'}),
  ],

  'aliens-optimization':lesson=>[
    eventFrame(lesson,'pair<ll,int> solve','Toy Problem 的最佳原成本依 Groups 數','可行解摘要：1組 cost20、2組 cost12、3組 cost9、4組 cost8。solve(λ) 最小化 cost+λ·groups，tie 時偏少組。',{solutions:['g1:c20','g2:c12','g3:c9','g4:c8'],K:2,operation:'define penalized problem'}),
    eventFrame(lesson,'while(lo<hi)','Binary Search λ∈[0,8]，mid=4','λ=4 時 penalized：24,20,21,24，所以 solve(4) 選 2 組；groups≤K，hi=4。',{lo:0,hi:8,mid:4,solve:'cost20,groups2',decision:'hi=4',operation:'binary search penalty'}),
    eventFrame(lesson,'if(solve(mid).groups<=K)','mid=2：solve(2) 選 3 組','penalized 最小為 9+2·3=15；3>K，所以 lo=3。',{lo:0,hi:4,mid:2,solve:'cost15,groups3',decision:'lo=3',operation:'too many groups'}),
    eventFrame(lesson,'if(solve(mid).groups<=K)','mid=3：2 組與 3 組同為 18','固定 tie-break 選較少組，所以 groups=2≤K，hi=3。',{lo:3,hi:4,mid:3,solve:'cost18,groups2',decision:'hi=3',operation:'tie-broken monotone predicate'}),
    eventFrame(lesson,'answer=solve(lo).cost-lo*K','λ=3 收斂，扣回 λK','penalized cost 18 - 3·2 = 12，正是「恰 2 組」原始最小成本。',{lambda:3,penalized:18,K:2,result:12,operation:'recover original objective'}),
  ],

  'small-to-large':lesson=>[
    eventFrame(lesson,'auto* cur=new set<int>{color[u]};','每個 DFS Frame 先放自己的 Color','Tree colors：A1,B2,C1,D3,E2,F3。以 D 為例，進入時 cur={3}。',{colors:['A1','B2','C1','D3','E2','F3'],node:'D',cur:['3'],operation:'initialize node set'},{active:['D']}),
    eventFrame(lesson,'auto* child=dfs(v,u);','D 呼叫 Child F','先遞迴得到 F 的集合；F 是 leaf，所以回傳 {3}。D 此刻仍保持 cur={3}。',{call:'D→F',childResult:['3'],cur:['3'],operation:'get child set'},{active:['D','F']}),
    eventFrame(lesson,'cur->insert(child->begin(),child->end());','D 合併 F 的 {3}','大小相同不 swap；真正合併發生在 insert range。3 已存在，所以 D 最後仍是 {3}。',{node:'D',before:['3'],child:['3'],after:['3'],operation:'merge F into D'},{active:['D','F']}),
    eventFrame(lesson,'auto* child=dfs(v,u);','B 收到 D 的集合 {3}','B 自己先有 {2}；遞迴 D 完成後 child={3}。',{node:'B',cur:['2'],child:['3'],operation:'receive D set'},{active:['B','D']}),
    eventFrame(lesson,'cur->insert(child->begin(),child->end());','B 合併 D：{2}→{2,3}','兩邊 size 都是 1，不需要 swap；insert 後 distinct colors 變 2。',{node:'B',before:['2'],child:['3'],after:['2','3'],operation:'merge D into B'},{active:['B','D']}),
    eventFrame(lesson,'auto* child=dfs(v,u);','B 再收到 E 的 {2}','E 是 leaf，child={2}。',{node:'B',cur:['2','3'],child:['2'],operation:'receive E set'},{active:['B','E']}),
    eventFrame(lesson,'cur->insert(child->begin(),child->end());','B 合併 E：沒有新 Color','2 已經存在，所以 B 的集合仍是 {2,3}。',{node:'B',child:['2'],after:['2','3'],operation:'merge E into B'},{active:['B','E']}),
    eventFrame(lesson,'auto* child=dfs(v,u);','A 收到 B 的大集合 {2,3}','A 自己 cur={1}，child size=2 大於 cur size=1。',{node:'A',cur:['1'],child:['2','3'],operation:'receive B set'},{active:['A','B']}),
    eventFrame(lesson,'swap(cur,child);','Small-to-Large：Swap 大小集合','真正的 swap 讓 cur 指向較大的 {2,3}，child 變成舊的小集合 {1}。這是複雜度保證的核心。',{node:'A',before:['cur{1}','child{2,3}'],after:['cur{2,3}','child{1}'],operation:'swap to keep larger set'},{active:['A','B']}),
    eventFrame(lesson,'cur->insert(child->begin(),child->end());','把小集合 {1} 搬進大集合','只搬動較小集合元素，A 暫時得到 {1,2,3}。',{node:'A',before:['2','3'],child:['1'],after:['1','2','3'],operation:'merge B result into A'},{active:['A','B']}),
    eventFrame(lesson,'auto* child=dfs(v,u);','A 再收到 C 的 {1}','C 是 leaf，child={1}。',{node:'A',cur:['1','2','3'],child:['1'],operation:'receive C set'},{active:['A','C']}),
    eventFrame(lesson,'cur->insert(child->begin(),child->end());','合併 C 後仍是 {1,2,3}','1 已存在，因此 root distinct count 不變。',{node:'A',after:['1','2','3'],operation:'merge C into A'},{active:['A','C']}),
    eventFrame(lesson,'answer[u]=cur->size();','Root A 的答案 = 3','A 子樹包含三種顏色。因每次只把小集合搬入大集合，每個元素最多被搬 O(log n) 次。',{node:'A',answer:3,complexity:'O(n log n) set moves',operation:'store distinct count'},{accepted:['A','B','C','D','E','F']}),
  ],

  'dsu-on-tree':lesson=>[
    eventFrame(lesson,'dfsSize(u,p);','先算 Subtree Size 與 Heavy Child','subtree sizes：A6,B4,C1,D2,E1,F1；因此 heavy[A]=B、heavy[B]=D、heavy[D]=F。',{subtree:'A6 B4 C1 D2 E1 F1',heavy:['A→B','B→D','D→F'],operation:'precompute heavy children'}),
    eventFrame(lesson,'for(v:lightChildren(u)) solve(v,u,false);','A 先處理 Light Child C','C 的答案是 1；因 keep=false，算完後把 C 的資料清掉，不污染之後保留的 heavy 狀態。',{node:'C',answer:1,keep:'false',operation:'solve light child'},{active:['C']}),
    eventFrame(lesson,'if(heavy[u]!=-1) solve(heavy[u],u,true);','再處理 Heavy Child B 並 Keep','B 內部會保留 heavy chain B→D→F 的資料，因此回到 A 時這部分不用重建。',{node:'B',keep:'true',heavyChain:['B','D','F'],operation:'solve kept heavy child'},{active:['B','D','F']}),
    eventFrame(lesson,'addSubtree(v);','在 B：加回 Light Child E','保留的 D/F 目前只有 color3；addSubtree(E) 加入 color2，資料變成 {2,3}。',{node:'B',before:['3'],added:'E:2',after:['2','3'],operation:'add B light subtree'},{active:['B','E']}),
    eventFrame(lesson,'add(u);','在 B：加入節點 B 自己','B 的 color 也是 2，加入後 distinct set 仍是 {2,3}。',{node:'B',color:2,colors:['2','3'],operation:'add B itself'},{active:['B']}),
    eventFrame(lesson,'answer[u]=current();','寫 Answer[B]=2','current() 現在代表 B 整棵子樹的 distinct colors 數量 2。',{node:'B',answer:2,operation:'store B answer'},{active:['B','D','E','F']}),
    eventFrame(lesson,'addSubtree(v);','回到 A：加回 Light Child C','Heavy B 的 {2,3} 保留著；將 C 的 color1 加回後得到 {1,2,3}。',{node:'A',before:['2','3'],added:'C:1',after:['1','2','3'],operation:'add A light subtree'},{active:['A','C']}),
    eventFrame(lesson,'add(u);','在 A：加入節點 A 自己','A 的 color 也是 1，所以 distinct set 不變。',{node:'A',color:1,colors:['1','2','3'],operation:'add A itself'},{active:['A']}),
    eventFrame(lesson,'answer[u]=current();','寫 Answer[A]=3','A 子樹含三種顏色；同理可得 A3,B2,C1,D1,E1,F1。',{node:'A',answer:3,answers:['A3','B2','C1','D1','E1','F1'],operation:'store root answer'},{accepted:['A','B','C','D','E','F']}),
    eventFrame(lesson,'if(!keep) removeSubtree(u);','Keep 規則決定是否清除','只有作為 light child 被呼叫且 keep=false 的子樹會在回傳前清掉；heavy 資料一路保留，避免重複工作。',{rule:'clear only when keep=false',complexity:'O(n log n)',operation:'explain cleanup rule'},{accepted:['A','B','C','D','E','F']}),
  ]

  'virtual-tree':lesson=>[
    eventFrame(lesson,'sort(key.begin()','Key Vertices = {F,E,C}','原樹 tin 順序為 A0,B1,D2,F3,E4,C5，因此 key 排成 F,E,C。',{key:['F','E','C'],tin:['F3','E4','C5'],operation:'sort by Euler tin'}),
    eventFrame(lesson,'key.push_back(lca','加入 Adjacent LCA','LCA(F,E)=B；LCA(E,C)=A，因此節點集合擴充為 {F,E,C,B,A}。',{lcas:['LCA(F,E)=B','LCA(E,C)=A'],operation:'close under necessary LCAs'}),
    eventFrame(lesson,'sortUnique','重新排序去重','依 tin 得 A,B,F,E,C。虛樹最多 2k-1=5 個節點，這裡剛好 5。',{nodes:['A','B','F','E','C'],operation:'sort unique virtual nodes'}),
    eventFrame(lesson,'while(!isAncestor','Stack 開始 A→B→F','A 是 B 祖先、B 是 F 祖先，因此建立 edges A-B、B-F。',{stack:['A','B','F'],edges:['A-B','B-F'],operation:'build ancestor stack'}),
    eventFrame(lesson,'st.pop_back','處理 E：F 不是 E 祖先，Pop F','B 仍是 E 的祖先，因此接 B-E。',{v:'E',popped:'F',edge:'B-E',stack:['A','B','E'],operation:'pop to nearest ancestor'}),
    eventFrame(lesson,'addEdge(st.back(),v)','處理 C：Pop E、B，接到 A','得到最後 edge A-C。',{v:'C',popped:['E','B'],edge:'A-C',operation:'finish virtual tree'}),
    eventFrame(lesson,'st.push_back(v)','虛樹只保留 5 點','Edges = A-B,B-F,B-E,A-C；原樹長路徑被壓縮成必要祖先關係。',{edges:['A-B','B-F','B-E','A-C'],operation:'virtual tree result'},{accepted:['A','B','C','E','F']}),
  ],

  'kruskal-reconstruction-tree':lesson=>[
    eventFrame(lesson,'sort(edges.begin()','Graph Edges：AB1, BC3, AC4, CD5','依 Weight 排序後逐次做 Kruskal merge。',{edges:['AB1','BC3','AC4','CD5'],operation:'sort graph edges'}),
    eventFrame(lesson,'newNode(w)','AB1 合併：建立 Internal Node X1','X1 權值 1，children={A,B}；DSU root 變成 X1。',{edge:'AB1',node:'X1(weight1)',children:['A','B'],operation:'create merge node'}),
    eventFrame(lesson,'child[x]={find(u),find(v)}','BC3：建立 X3','B 所在 component root=X1，C 自己為 root；新父 X3(weight3) children={X1,C}。',{edge:'BC3',node:'X3(weight3)',children:['X1','C'],operation:'merge component roots'}),
    eventFrame(lesson,'find(u)!=find(v)','AC4：已同 Component，Skip','A、C 已由 X3 連通，所以不建新節點。',{edge:'AC4',decision:'skip',operation:'ignore cycle edge'}),
    eventFrame(lesson,'newNode(w)','CD5：建立 Root X5','X5(weight5) children={X3,D}，整張圖完成。',{edge:'CD5',node:'X5(weight5)',children:['X3','D'],operation:'finish reconstruction tree'}),
    eventFrame(lesson,'parent[find(u)]=parent[find(v)]=x','查 A 與 C 的連通 Threshold','LCA(A,C)=X3，權值 3；代表只保留 ≤3 的原圖邊時它們第一次連通。',{query:'A,C',lca:'X3',threshold:3,operation:'read LCA weight'}),
  ],

  'stable-matching':lesson=>[
    eventFrame(lesson,'queue<int> free','三位 Proposer 全部 Free','M0 prefs W0,W1,W2；M1 prefs W0,W2,W1；M2 prefs W1,W0,W2。',{free:['M0','M1','M2'],operation:'initialize proposers'}),
    eventFrame(lesson,'int w=preference[m][next[m]++]','M0→W0：W0 Free，接受','partner[W0]=M0。',{proposal:'M0→W0',partners:['W0-M0'],free:['M1','M2'],operation:'free receiver accepts'}),
    eventFrame(lesson,'rank[w][m]<rank[w][partner[w]]','M1→W0：W0 更喜歡 M1','W0 偏好 M1>M0>M2，因此把 M0 丟回 free queue，partner[W0]=M1。',{proposal:'M1→W0',replaced:'M0',partners:['W0-M1'],free:['M2','M0'],operation:'receiver switches partner'}),
    eventFrame(lesson,'partner[w]==-1','M2→W1：接受','W1 尚未配對。',{proposal:'M2→W1',partners:['W0-M1','W1-M2'],free:['M0'],operation:'accept M2'}),
    eventFrame(lesson,'rank[w][m]<rank[w][partner[w]]','M0 下一個提 W1，W1 改選 M0','W1 偏好 M0>M2，因此 M2 重新 free。',{proposal:'M0→W1',replaced:'M2',partners:['W0-M1','W1-M0'],free:['M2'],operation:'switch W1'}),
    eventFrame(lesson,'else free.push(m)','M2→W0 被拒絕','W0 持有 M1 且更偏好 M1，所以 M2 繼續 free。',{proposal:'M2→W0',decision:'reject',free:['M2'],operation:'reject proposal'}),
    eventFrame(lesson,'partner[w]==-1','M2→W2：接受，完成','最終 M0-W1、M1-W0、M2-W2；不存在 blocking pair。',{matching:['M0-W1','M1-W0','M2-W2'],operation:'finish stable matching'}),
  ],

  'huffman-coding':lesson=>[
    eventFrame(lesson,'priority_queue<long long','Frequencies = [5,9,12,13,16,45]','六個符號各自是一棵單節點樹；Min-Heap 依樹的總頻率排列。',{heap:['5','9','12','13','16','45'],cost:0,operation:'initialize frequencies'}),
    eventFrame(lesson,'cost+=a+b','取 5 與 9，Merge=14','將兩棵最小樹接為同一父節點，5+9=14；累計 cost=14，再把 14 放回 Heap。',{take:['5','9'],push:14,cost:14,heap:['12','13','14','16','45'],operation:'merge two minima'}),
    eventFrame(lesson,'cost+=a+b','取 12 與 13 →25','12+13=25；累計 cost=14+25=39。',{take:['12','13'],push:25,cost:39,heap:['14','16','25','45'],operation:'second merge'}),
    eventFrame(lesson,'cost+=a+b','取 14 與 16 →30','14+16=30；累計 cost=39+30=69。',{take:['14','16'],push:30,cost:69,heap:['25','30','45'],operation:'third merge'}),
    eventFrame(lesson,'cost+=a+b','取 25 與 30 →55','25+30=55；累計 cost=69+55=124。',{take:['25','30'],push:55,cost:124,heap:['45','55'],operation:'fourth merge'}),
    eventFrame(lesson,'cost+=a+b','最後 45 與 55 →100','45+55=100；累計 cost=124+100=224。只剩一棵樹；224 是最優加權路徑長，本程式不輸出編碼字。',{take:['45','55'],push:100,cost:224,heap:['100'],operation:'finish Huffman tree'}),
  ].map((frame,step)=>({
    ...frame,
    codeLines:step===0?frame.codeLines:[lineNumber(lesson,'long long a=pq.top'),lineNumber(lesson,'long long b=pq.top'),lineNumber(lesson,'cost+=a+b'),lineNumber(lesson,'pq.push(a+b)')],
    state:step===0?frame.state:{...frame.state,highlightCodeLines:'all'},
    executionView:huffmanHeapView(frame),
  })),

  'parallel-binary-search':lesson=>[
    eventFrame(lesson,'while(existsUnresolvedQuery','Events 增量=[2,1,3,2,4]，Queries Threshold=[3,6,10]','每個 q 要找最早 prefix total ≥ threshold 的事件時間 t∈[0,4]。',{events:['2','1','3','2','4'],queries:['q0≥3','q1≥6','q2≥10'],intervals:['0..4','0..4','0..4'],operation:'initialize parallel searches'}),
    eventFrame(lesson,'bucketQueriesByMid','Round 1：三個 Query Mid 都是 2','把 q0,q1,q2 全部放 bucket[2]；資料結構只需掃事件一次。',{buckets:['t2:{q0,q1,q2}'],operation:'bucket by midpoint'}),
    eventFrame(lesson,'apply(event[t])','掃到 t=2，Prefix Total=6','predicate q0/q1 成立，所以 hi=2；q2 不成立，所以 lo=3。',{t:2,total:6,updates:['q0 hi=2','q1 hi=2','q2 lo=3'],operation:'evaluate bucket'}),
    eventFrame(lesson,'bucketQueriesByMid','Round 2：q0,q1 Mid=1；q2 Mid=3','重置 data structure，再共用一趟 sweep。',{buckets:['t1:{q0,q1}','t3:{q2}'],operation:'second round buckets'}),
    eventFrame(lesson,'apply(event[t])','t=1 Total=3','q0 threshold3 成立→hi1；q1 threshold6 不成立→lo2，因此 q1 已收斂 t=2。',{t:1,total:3,updates:['q0 hi=1','q1 lo=2=hi'],operation:'resolve q1'}),
    eventFrame(lesson,'predicate(q)','t=3 Total=8，q2 仍不成立','q2 lo=4=hi，答案 t=4。',{t:3,total:8,update:'q2 lo=4',operation:'resolve q2'}),
    eventFrame(lesson,'while(existsUnresolvedQuery','最後 q0 在 Mid=0 測 Total=2','2<3，因此 lo=1=hi。最終答案 q0=1,q1=2,q2=4。',{answers:['q0=1','q1=2','q2=4'],operation:'finish all binary searches'}),
  ].map((frame,step)=>({...frame,executionView:parallelSearchView(step)})),
}

export const applyS2DpTreeOfflineOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  const base=lessonOverrides[lesson.id] ? {...lesson,...lessonOverrides[lesson.id]} : lesson
  const coded=codeOverrides[lesson.id] ? {...base,code:codeOverrides[lesson.id]} : base
  const build=overrides[lesson.id]
  if(!build) return coded
  return {...coded,frames:build(coded),traceMode:'execution',animationVersion:2}
}

export const s2DpTreeOfflineOverrideIds=Object.freeze(Object.keys(overrides))
