import type { AlgorithmLesson, Frame, ExecutionView } from './algorithms'
import { eventFrame } from './traceAuthoring'

type TraceBuilder=(lesson:AlgorithmLesson)=>Frame[]
const netNodes=[
  {id:'S',label:'S',x:110,y:215},{id:'A',label:'A',x:330,y:100},{id:'B',label:'B',x:330,y:330},
  {id:'C',label:'C',x:620,y:100},{id:'D',label:'D',x:620,y:330},{id:'T',label:'T',x:885,y:215},
]
const bipNodes=[
  {id:'L1',x:180,y:90,group:'L'},{id:'L2',x:180,y:215,group:'L'},{id:'L3',x:180,y:340,group:'L'},
  {id:'R1',x:820,y:90,group:'R'},{id:'R2',x:820,y:215,group:'R'},{id:'R3',x:820,y:340,group:'R'},
]
const network=(title:string,edges:ExecutionView extends infer _?any:never,path:string[]=[],badges:string[]=[]):ExecutionView=>({kind:'network',title,nodes:netNodes,edges,path,badges})
const bip=(title:string,edges:any[],path:string[]=[],badges:string[]=[]):ExecutionView=>({kind:'network',title,nodes:bipNodes,edges,path,badges})

const codeOverrides:Record<string,string[]>={
  'ford-fulkerson':[
    'long long flow=0;',
    'while(findAugmentingPath(s,t,parent)){',
    '  long long add=bottleneck(parent,s,t);',
    '  for(int v=t;v!=s;v=parent[v]){',
    '    Edge& e=edge(parent[v],v);',
    '    e.cap-=add; reverse(e).cap+=add;',
    '  }',
    '  flow+=add;',
    '}',
  ],
  'edmonds-karp':[
    'long long flow=0;',
    'while(bfsResidual(s,t,parent)){',
    '  long long add=bottleneck(parent,s,t);',
    '  for(int v=t;v!=s;v=parent[v]) updateResidual(parent[v],v,add);',
    '  flow+=add;',
    '}',
  ],
  'dinic':[
    'while(bfsLevelGraph(s,t)){',
    '  fill(ptr.begin(),ptr.end(),0);',
    '  while(long long pushed=dfs(s,INF,t)) flow+=pushed;',
    '}',
    'dfs follows only level[v]==level[u]+1;',
    'residual capacities update forward and reverse edges;',
  ],
  'minimum-cut':[
    'maxflow(s,t);',
    'vector<char> reachable=dfsResidual(s);',
    'long long cutCapacity=0;',
    'for(const Edge& e:original)',
    '  if(reachable[e.u] && !reachable[e.v]) cutCapacity+=e.cap;',
    'return cutCapacity;',
  ],
  'min-cost-max-flow':[
    'while(shortestPathResidual(s,t,dist,parent)){',
    '  long long add=bottleneck(parent);',
    '  flow+=add; cost+=add*dist[t];',
    '  for(EdgeRef e:path(parent)) updateResidual(e,add);',
    '}',
  ],
  'push-relabel':[
    'height[s]=n;',
    'for(Edge& e:g[s]) pushFromSource(e);',
    'while(int u=nextActiveVertex()){',
    '  if(canPush(u)) pushAdmissible(u);',
    '  else relabel(u);',
    '}',
  ],
  'flow-lower-bounds':[
    'for(auto [u,v,low,high]:edges){',
    '  addEdge(u,v,high-low);',
    '  balance[u]-=low;',
    '  balance[v]+=low;',
    '}',
    'for(int v=0;v<n;++v){',
    '  if(balance[v]>0) addEdge(SS,v,balance[v]);',
    '  if(balance[v]<0) addEdge(v,TT,-balance[v]);',
    '}',
    'addEdge(t,s,INF);',
    'return maxflow(SS,TT)==totalDemand;',
  ],
  'circulation-demands':[
    'for(auto [u,v,low,high]:edges){ addEdge(u,v,high-low); balance[u]-=low; balance[v]+=low; }',
    'for(int v=0;v<n;++v){',
    '  if(balance[v]>0) addEdge(SS,v,balance[v]);',
    '  if(balance[v]<0) addEdge(v,TT,-balance[v]);',
    '}',
    'return maxflow(SS,TT)==sumPositiveBalance;',
  ],
  'kuhn-matching':[
    'bool augment(int u){',
    '  if(seen[u]) return false; seen[u]=true;',
    '  for(int v:g[u])',
    '    if(match[v]==-1 || augment(match[v])){ match[v]=u; return true; }',
    '  return false;',
    '}',
  ],
  'hopcroft-karp':[
    'while(bfsLayers()){',
    '  for(int u:leftVertices)',
    '    if(matchL[u]==-1 && dfsAugment(u)) ++matching;',
    '}',
  ],
  'hungarian':[
    'for(int i=1;i<=n;++i){',
    '  p[0]=i; int j0=0;',
    '  fill(minv.begin(),minv.end(),INF);',
    '  do { updateSlacksAndChooseNext(i,j0); updatePotentials(); j0=j1; } while(p[j0]!=0);',
    '  do { int j1=way[j0]; p[j0]=p[j1]; j0=j1; } while(j0);',
    '}',
  ],
  'blossom':[
    'int v=findAugmentingPath(root);',
    'while(v!=-1){',
    '  if(foundOddCycle(v,u)){ int b=lcaBlossom(v,u); contractBlossom(v,u,b); }',
    '  else growAlternatingForest(v,u);',
    '}',
    'augmentAndLiftPath();',
  ],
}

const overrides:Record<string,TraceBuilder>={
  'ford-fulkerson':lesson=>[
    eventFrame(lesson,'long long flow=0','Residual Network 起始','容量：S→A 3、S→B 2、A→T 2、B→T 3、A→B 1。flow=0。',{flow:0,operation:'initialize residual network'},{executionView:network('FORD–FULKERSON · RESIDUAL NETWORK',[
      {from:'S',to:'A',label:'0/3'},{from:'S',to:'B',label:'0/2'},{from:'A',to:'T',label:'0/2'},{from:'B',to:'T',label:'0/3'},{from:'A',to:'B',label:'0/1'}
    ],[],['flow 0'])}),
    eventFrame(lesson,'findAugmentingPath','找到 Path S→A→T','任意 DFS 增廣路皆可；此路徑殘餘容量最小是 2。',{path:['S','A','T'],bottleneck:2,operation:'find path'},{executionView:network('AUGMENTING PATH',[
      {from:'S',to:'A',label:'res 3',active:true},{from:'A',to:'T',label:'res 2',active:true},{from:'S',to:'B',label:'res 2',muted:true},{from:'B',to:'T',label:'res 3',muted:true}
    ],['S','A','T'],['bottleneck 2'])}),
    eventFrame(lesson,'e.cap-=add','送出 2，建立 Reverse Capacity','S→A residual 1、A→S residual 2；A→T residual 0、T→A residual 2。',{add:2,flow:2,operation:'update residual edges'},{executionView:network('RESIDUAL UPDATE',[
      {from:'S',to:'A',label:'res 1',active:true},{from:'A',to:'S',label:'rev 2',dashed:true},{from:'A',to:'T',label:'res 0',active:true},{from:'T',to:'A',label:'rev 2',dashed:true},{from:'S',to:'B',label:'res 2'},{from:'B',to:'T',label:'res 3'}
    ],[],['flow 2'])}),
    eventFrame(lesson,'flow+=add','第二條 Path S→B→T 送 2','瓶頸 min(2,3)=2，總 flow=4。',{add:2,flow:4,operation:'second augmentation'},{executionView:network('SECOND AUGMENTATION',[
      {from:'S',to:'A',label:'res 1'},{from:'S',to:'B',label:'res 0',active:true},{from:'B',to:'T',label:'res 1',active:true},{from:'A',to:'T',label:'res 0'}
    ],['S','B','T'],['+2','flow 4'])}),
    eventFrame(lesson,'flow+=add','最後 S→A→B→T 送 1','使用 A→B 的 1 單位剩餘容量，總 flow=5。',{add:1,flow:5,operation:'final augmentation'},{executionView:network('FINAL AUGMENTATION',[
      {from:'S',to:'A',label:'res 0',active:true},{from:'A',to:'B',label:'res 0',active:true},{from:'B',to:'T',label:'res 0',active:true}
    ],['S','A','B','T'],['+1','max flow 5'])}),
  ],

  'edmonds-karp':lesson=>[
    eventFrame(lesson,'long long flow=0','同一 Capacity Network','Edmonds–Karp 與 Ford–Fulkerson 差別是每次用 BFS 找邊數最少的增廣路。',{flow:0,operation:'initialize'},{executionView:network('EDMONDS–KARP',[
      {from:'S',to:'A',label:'3'},{from:'S',to:'B',label:'2'},{from:'A',to:'T',label:'2'},{from:'B',to:'T',label:'3'},{from:'A',to:'B',label:'1'}
    ])}),
    eventFrame(lesson,'bfsResidual','BFS Layer 0:S；Layer1:A,B；Layer2:T','父指標先找到 S→A→T。',{levels:['S:0','A,B:1','T:2'],path:['S','A','T'],operation:'bfs shortest augmenting path'},{executionView:network('BFS RESIDUAL LAYERS',[
      {from:'S',to:'A',label:'3',active:true},{from:'S',to:'B',label:'2',active:true},{from:'A',to:'T',label:'2',active:true},{from:'B',to:'T',label:'3'}
    ],['S','A','T'],['levels 0→1→2'])}),
    eventFrame(lesson,'bottleneck','Path Bottleneck = 2','min(3,2)=2。',{add:2,operation:'compute bottleneck'},{executionView:network('BOTTLENECK',[
      {from:'S',to:'A',label:'3',active:true},{from:'A',to:'T',label:'2',active:true}
    ],['S','A','T'],['min = 2'])}),
    eventFrame(lesson,'updateResidual','更新正反 Residual','送 2 後 A→T 飽和；reverse T→A=2。',{flow:2,operation:'update residual'},{executionView:network('AFTER AUGMENT',[
      {from:'S',to:'A',label:'1'},{from:'A',to:'S',label:'2',dashed:true},{from:'A',to:'T',label:'0'},{from:'T',to:'A',label:'2',dashed:true},{from:'S',to:'B',label:'2'},{from:'B',to:'T',label:'3'}
    ],[],['flow 2'])}),
    eventFrame(lesson,'flow+=add','後續 BFS 增廣到 Flow 5','BFS 依序找到 S→B→T，再透過剩餘路徑送最後 1；T 最終不可達。',{flow:5,result:'max flow',operation:'finish'},{executionView:network('MAX FLOW 5',[
      {from:'S',to:'A',label:'3/3'},{from:'S',to:'B',label:'2/2'},{from:'A',to:'T',label:'2/2'},{from:'B',to:'T',label:'3/3'},{from:'A',to:'B',label:'1/1'}
    ],[],['flow 5'])}),
  ],

  'dinic':lesson=>[
    eventFrame(lesson,'bfsLevelGraph','建立 Level Graph','BFS 得 level[S]=0、A,B=1、C,D=2、T=3；只保留 level+1 的 Residual Edge。',{levels:['S0','A1','B1','C2','D2','T3'],operation:'build level graph'},{executionView:network('DINIC · LEVEL GRAPH',[
      {from:'S',to:'A',label:'3 · L0→1',active:true},{from:'S',to:'B',label:'2 · L0→1',active:true},{from:'A',to:'C',label:'2 · L1→2',active:true},{from:'A',to:'D',label:'1 · L1→2',active:true},{from:'B',to:'D',label:'2 · L1→2',active:true},{from:'C',to:'T',label:'2 · L2→3',active:true},{from:'D',to:'T',label:'3 · L2→3',active:true}
    ],[],['levels fixed'])}),
    eventFrame(lesson,'fill(ptr.begin()','Ptr 全部 Reset','每個節點記住下一條尚未證明無用的邊，避免 DFS 重掃。',{ptr:'all 0',operation:'reset current edges'},{executionView:network('CURRENT-EDGE POINTERS',[
      {from:'S',to:'A',label:'ptr S',active:true},{from:'A',to:'C',label:'ptr A',active:true},{from:'C',to:'T',label:'ptr C',active:true}
    ],[],['ptr reset'])}),
    eventFrame(lesson,'dfs(s,INF,t)','DFS 送 S→A→C→T，Flow 2','路徑遵守 level+1；瓶頸為 2。',{path:['S','A','C','T'],pushed:2,flow:2,operation:'blocking flow dfs'},{executionView:network('BLOCKING FLOW · PATH 1',[
      {from:'S',to:'A',label:'2/3',active:true},{from:'A',to:'C',label:'2/2',active:true},{from:'C',to:'T',label:'2/2',active:true},{from:'S',to:'B',label:'0/2'}
    ],['S','A','C','T'],['push 2'])}),
    eventFrame(lesson,'dfs(s,INF,t)','再送 S→B→D→T，Flow 2','另一條同層路徑再送 2，總 flow=4。',{path:['S','B','D','T'],pushed:2,flow:4,operation:'blocking flow dfs'},{executionView:network('BLOCKING FLOW · PATH 2',[
      {from:'S',to:'B',label:'2/2',active:true},{from:'B',to:'D',label:'2/2',active:true},{from:'D',to:'T',label:'2/3',active:true}
    ],['S','B','D','T'],['push 2','flow 4'])}),
    eventFrame(lesson,'bfsLevelGraph','Blocking Flow 後重新 BFS','本 level graph 已無 S→T 可送路徑；下一次 BFS 若 T 不可達即完成。',{flow:4,operation:'rebuild level graph'},{executionView:network('REBUILD LEVEL GRAPH',[
      {from:'S',to:'A',label:'res 1'},{from:'S',to:'B',label:'res 0',muted:true},{from:'D',to:'T',label:'res 1'}
    ],[],['blocking flow exhausted'])}),
  ],

  'minimum-cut':lesson=>[
    eventFrame(lesson,'maxflow(s,t)','先完成 Max Flow = 5','現在只看最終 Residual Network。',{flow:5,operation:'run max flow'},{executionView:network('POST MAX-FLOW RESIDUAL',[
      {from:'S',to:'A',label:'res 0'},{from:'S',to:'B',label:'res 0'},{from:'A',to:'S',label:'rev 3',dashed:true},{from:'B',to:'S',label:'rev 2',dashed:true}
    ],[],['max flow 5'])}),
    eventFrame(lesson,'dfsResidual','從 S 沿正 Residual Capacity 搜尋','S 沒有任何正向可走 edge，所以 Reachable Set S-side={S}。',{reachable:['S'],operation:'residual reachability'},{executionView:network('RESIDUAL REACHABLE SET',[
      {from:'S',to:'A',label:'0',muted:true},{from:'S',to:'B',label:'0',muted:true}
    ],['S'],['S-side {S}'])}),
    eventFrame(lesson,'cutCapacity+=e.cap','掃原始 Crossing Edges','原圖中 S→A capacity3、S→B capacity2 從 reachable 到 unreachable。',{cutEdges:['S-A(3)','S-B(2)'],operation:'collect cut edges'},{executionView:network('CUT EDGES',[
      {from:'S',to:'A',label:'cap 3',active:true},{from:'S',to:'B',label:'cap 2',active:true},{from:'A',to:'T',label:'cap 2',muted:true},{from:'B',to:'T',label:'cap 3',muted:true}
    ],['S'],['3 + 2'])}),
    eventFrame(lesson,'return cutCapacity','Cut Capacity = 5','等於最大流 5，因此這個 Cut 必是 Minimum Cut。',{cutCapacity:5,maxflow:5,operation:'prove min cut'},{executionView:network('MIN CUT = MAX FLOW',[
      {from:'S',to:'A',label:'3',active:true},{from:'S',to:'B',label:'2',active:true}
    ],['S'],['cut 5','flow 5'])}),
  ],

  'min-cost-max-flow':lesson=>[
    eventFrame(lesson,'shortestPathResidual','Residual Edge 同時有 Capacity / Cost','例：S→A cap2 cost1，A→T cap2 cost2；S→B cap1 cost0，B→T cap1 cost5。',{operation:'initialize residual costs'},{executionView:network('MIN-COST FLOW',[
      {from:'S',to:'A',label:'cap2 · cost1'},{from:'A',to:'T',label:'cap2 · cost2'},{from:'S',to:'B',label:'cap1 · cost0'},{from:'B',to:'T',label:'cap1 · cost5'}
    ])}),
    eventFrame(lesson,'shortestPathResidual','最短 Cost Path 是 S→A→T','單位 cost=1+2=3，比 B 路徑 5 便宜。',{path:['S','A','T'],distance:3,operation:'shortest residual path'},{executionView:network('SHORTEST COST PATH',[
      {from:'S',to:'A',label:'c1',active:true},{from:'A',to:'T',label:'c2',active:true},{from:'S',to:'B',label:'c0'},{from:'B',to:'T',label:'c5'}
    ],['S','A','T'],['path cost 3'])}),
    eventFrame(lesson,'bottleneck','Bottleneck = 2','兩條邊 cap 都是 2，因此一次送 2。',{add:2,operation:'compute bottleneck'},{executionView:network('BOTTLENECK 2',[
      {from:'S',to:'A',label:'2',active:true},{from:'A',to:'T',label:'2',active:true}
    ],['S','A','T'])}),
    eventFrame(lesson,'cost+=add*dist[t]','累積 Cost += 2×3 = 6','flow=2、cost=6；reverse edge 具有負 cost，可撤回錯誤決策。',{flow:2,cost:6,operation:'augment and price'},{executionView:network('AFTER AUGMENT',[
      {from:'A',to:'S',label:'cap2 · cost-1',dashed:true},{from:'T',to:'A',label:'cap2 · cost-2',dashed:true},{from:'S',to:'B',label:'cap1 · cost0'},{from:'B',to:'T',label:'cap1 · cost5'}
    ],[],['flow 2','cost 6'])}),
    eventFrame(lesson,'cost+=add*dist[t]','再送 B Path 1 單位','增加 cost5，最終 flow=3、cost=11。',{flow:3,cost:11,operation:'finish min cost max flow'},{executionView:network('FINAL FLOW / COST',[
      {from:'S',to:'A',label:'2/2 c1'},{from:'A',to:'T',label:'2/2 c2'},{from:'S',to:'B',label:'1/1 c0'},{from:'B',to:'T',label:'1/1 c5'}
    ],[],['flow 3','cost 11'])}),
  ],

  'push-relabel':lesson=>[
    eventFrame(lesson,'height[s]=n','初始化 Height[S]=|V|','令 S 高度 4；其他點高度 0。',{heights:['S=4','A=0','B=0','T=0'],operation:'initialize heights'},{executionView:network('PUSH–RELABEL · HEIGHTS',[
      {from:'S',to:'A',label:'cap3'},{from:'S',to:'B',label:'cap2'},{from:'A',to:'T',label:'cap2'},{from:'B',to:'T',label:'cap2'}
    ],['S'],['h(S)=4'])}),
    eventFrame(lesson,'pushFromSource','Source Preflow 飽和所有出邊','推 3 到 A、2 到 B；excess[A]=3、excess[B]=2。',{excess:['A=3','B=2'],operation:'source preflow'},{executionView:network('PREFLOW',[
      {from:'S',to:'A',label:'3/3',active:true},{from:'S',to:'B',label:'2/2',active:true},{from:'A',to:'T',label:'0/2'},{from:'B',to:'T',label:'0/2'}
    ],['S','A','B'],['excess A3','B2'])}),
    eventFrame(lesson,'relabel(u)','A 沒有 Admissible Edge → Relabel','A→T 的 T 高度 0；要 push 必須 h[A]=h[T]+1，所以把 A 提到 1。',{u:'A',height:'0→1',operation:'relabel active vertex'},{executionView:network('RELABEL A',[
      {from:'A',to:'T',label:'cap2',active:true}
    ],['A'],['h(A)=1'])}),
    eventFrame(lesson,'pushAdmissible','A→T Push 2','送 min(excess3,residual2)=2；A 尚餘 excess1。',{u:'A',push:2,excessA:1,operation:'admissible push'},{executionView:network('PUSH A→T',[
      {from:'A',to:'T',label:'2/2',active:true},{from:'T',to:'A',label:'rev2',dashed:true}
    ],['A','T'],['push 2','excess A1'])}),
    eventFrame(lesson,'pushAdmissible','B→T Push 2，剩餘 Excess 重新導回','B relabel 後送 2 到 T；A 的多餘 1 最後經 residual edge 回到 source 或其他 admissible route。',{flow:4,operation:'discharge active vertices'},{executionView:network('DISCHARGE COMPLETE',[
      {from:'A',to:'T',label:'2/2'},{from:'B',to:'T',label:'2/2'},{from:'S',to:'A',label:'2/3'},{from:'S',to:'B',label:'2/2'}
    ],[],['max flow 4'])}),
  ],

  'flow-lower-bounds':lesson=>[
    eventFrame(lesson,'addEdge(u,v,high-low);','A→B [2,5]：建立 Residual Capacity 3','輸入為 S→A [0,5]、A→B [2,5]、B→T [0,5]。先把 A→B 的下限 2 固定，剩餘可調容量是 5−2=3；兩側邊的可調容量各為 5。',{edge:'A→B',lower:2,upper:5,residual:3,operation:'create residual capacity'},{executionView:network('LOWER-BOUND TRANSFORM',[{from:'A',to:'B',label:'cap 3',active:true}],['A','B'],['original range [2,5]'])}),
    eventFrame(lesson,'balance[u]-=low;','扣除 A 的強制流出：Balance[A] = -2','lower=2 等於先固定送 2 單位；對起點 A 造成 2 單位缺口。',{node:'A',balance:'0→-2',operation:'decrease source balance'},{executionView:network('LOWER FLOW · SOURCE BALANCE',[{from:'A',to:'B',label:'forced 2',active:true}],['A'],['A balance -2'])}),
    eventFrame(lesson,'balance[v]+=low;','增加 B 的強制流入：Balance[B] = +2','同一筆 lower flow 在終點 B 形成 +2 需求。',{node:'B',balance:'0→+2',operation:'increase target balance'},{executionView:network('LOWER FLOW · TARGET BALANCE',[{from:'A',to:'B',label:'forced 2',active:true}],['B'],['A -2','B +2'])}),
    eventFrame(lesson,'addEdge(SS,v,balance[v]);','Positive Balance B：加 SS→B cap2','固定的下限已讓 B 收到 2；為維持流入等於流出，可調整部分必須從 B 再送出 2。SS→B 是輔助邊，用來強制這 2 單位沿剩餘網路送出。',{edge:'SS→B',capacity:2,operation:'add positive-balance edge'},{executionView:{kind:'network',title:'SUPER SOURCE EDGE',nodes:[...netNodes,{id:'SS',x:70,y:60},{id:'TT',x:930,y:370}],edges:[{from:'SS',to:'B',label:'2',active:true}],path:['SS','B'],badges:['B needs +2']}}),
    eventFrame(lesson,'addEdge(v,TT,-balance[v]);','Negative Balance A：加 A→TT cap2','A 已因下限流出 2，可調整部分必須替 A 補回 2。A→TT 是輔助邊；必須先有路徑把 2 送到 A，才能送入 TT。',{edge:'A→TT',capacity:2,operation:'add negative-balance edge'},{executionView:{kind:'network',title:'SUPER SINK EDGE',nodes:[...netNodes,{id:'SS',x:70,y:60},{id:'TT',x:930,y:370}],edges:[{from:'SS',to:'B',label:'2'},{from:'A',to:'TT',label:'2',active:true}],path:['A','TT'],badges:['A supplies deficit 2']}}),
    eventFrame(lesson,'addEdge(t,s,INF);','加入 T→S Infinite Edge','原本是有指定 source/sink 的 flow 問題；這條邊把它閉成 circulation，讓可行性統一用 SS→TT max-flow 檢查。',{operation:'close circulation'},{executionView:network('CLOSE CIRCULATION',[{from:'T',to:'S',label:'INF',active:true,dashed:true}],['T','S'])}),
    eventFrame(lesson,'return maxflow(SS,TT)==totalDemand;','檢查所有 Demand Edge 是否飽和','沿 SS→B→T→S→A→TT 送 2，兩條輔助需求邊都滿，maxflow=totalDemand=2。去掉 SS、TT 與 T→S，再加回 A→B 的下限 2：原圖 S→A→B→T 每邊流量均為 2，符合容量及中間點流量守恆。',{required:2,sent:2,result:'feasible',operation:'check feasibility'},{executionView:{kind:'network',title:'FEASIBILITY CHECK',nodes:[...netNodes,{id:'SS',x:70,y:60},{id:'TT',x:930,y:370}],edges:[{from:'A',to:'B',label:'0/3 + lower 2'},{from:'SS',to:'B',label:'2/2',active:true},{from:'B',to:'T',label:'2/5',active:true},{from:'T',to:'S',label:'2/INF',active:true},{from:'S',to:'A',label:'2/5',active:true},{from:'A',to:'TT',label:'2/2',active:true}],path:['SS','B','T','S','A','TT'],badges:['sent 2 / demand 2','feasible']}}),
  ],

  'circulation-demands':lesson=>[
    eventFrame(lesson,'balance[u]-=low','建立 Node Imbalance','例：A→B [2,4]、B→C [1,3]。lower flow 使 A=-2、B=+1、C=+1。',{balances:['A=-2','B=+1','C=+1'],operation:'lower-bound balances'},{executionView:network('CIRCULATION · IMBALANCE',[
      {from:'A',to:'B',label:'lower2',active:true},{from:'B',to:'C',label:'lower1',active:true}
    ],['A','B','C'],['A -2','B +1','C +1'])}),
    eventFrame(lesson,'addEdge(SS,v','SS 連到需求節點 B、C','SS→B cap1、SS→C cap1；A→TT cap2。',{superEdges:['SS-B1','SS-C1','A-TT2'],operation:'balance with super nodes'},{executionView:{kind:'network',title:'BALANCE NETWORK',nodes:[...netNodes,{id:'SS',x:80,y:50},{id:'TT',x:920,y:380}],edges:[{from:'SS',to:'B',label:'1',active:true},{from:'SS',to:'C',label:'1',active:true},{from:'A',to:'TT',label:'2',active:true}],badges:['positive demand 2']}}),
    eventFrame(lesson,'maxflow(SS,TT)','找能搬運 Imbalance 的 Residual Flow','利用原 edge 的 high-low 容量把 B/C 的需求送回 A 的缺口。',{operation:'route balancing flow'},{executionView:network('BALANCING FLOW',[
      {from:'B',to:'A',label:'res/reverse 1',active:true},{from:'C',to:'B',label:'res/reverse 1',active:true},{from:'B',to:'A',label:'total 2',active:true}
    ],['C','B','A'])}),
    eventFrame(lesson,'sumPositiveBalance','SS 所有 2 單位都成功送出','最大流等於 positive balance sum，circulation feasible。',{sent:2,required:2,result:'feasible',operation:'verify circulation'},{executionView:network('FEASIBLE CIRCULATION',[
      {from:'A',to:'B',label:'within [2,4]'},{from:'B',to:'C',label:'within [1,3]'}
    ],[],['flow conserved'])}),
  ],

  'kuhn-matching':lesson=>[
    eventFrame(lesson,'augment(int u)','Bipartite Graph 起始','Edges: L1-R1,R2；L2-R1；L3-R2,R3。matching 空。',{matching:[],operation:'initialize matching'},{executionView:bip('KUHN · BIPARTITE GRAPH',[
      {from:'L1',to:'R1'},{from:'L1',to:'R2'},{from:'L2',to:'R1'},{from:'L3',to:'R2'},{from:'L3',to:'R3'}
    ])}),
    eventFrame(lesson,'match[v]==-1','L1 找到 Free R1','R1 未匹配，所以直接 match[R1]=L1。',{matching:['L1-R1'],operation:'match free right'},{executionView:bip('MATCH L1–R1',[
      {from:'L1',to:'R1',label:'MATCH',active:true},{from:'L1',to:'R2'},{from:'L2',to:'R1'}
    ],['L1','R1'],['size 1'])}),
    eventFrame(lesson,'augment(match[v])','L2 想要 R1：遞迴改配 L1','R1 已配 L1，所以嘗試替 L1 找其他位置；L1 可改到 R2。',{path:['L2','R1','L1','R2'],operation:'alternating augmenting path'},{executionView:bip('ALTERNATING PATH',[
      {from:'L2',to:'R1',active:true},{from:'R1',to:'L1',label:'matched reverse',active:true,dashed:true},{from:'L1',to:'R2',active:true}
    ],['L2','R1','L1','R2'],['augment'])}),
    eventFrame(lesson,'match[v]=u','沿路 Flip','新 matching 為 L2-R1、L1-R2，大小從 1→2。',{matching:['L1-R2','L2-R1'],size:2,operation:'flip matching edges'},{executionView:bip('FLIP PATH',[
      {from:'L1',to:'R2',label:'MATCH',active:true},{from:'L2',to:'R1',label:'MATCH',active:true},{from:'L1',to:'R1',muted:true}
    ],[],['size 2'])}),
    eventFrame(lesson,'match[v]=u','L3 配到 Free R3','得到 perfect matching size3。',{matching:['L1-R2','L2-R1','L3-R3'],size:3,operation:'finish matching'},{executionView:bip('MATCHING SIZE 3',[
      {from:'L1',to:'R2',label:'MATCH',active:true},{from:'L2',to:'R1',label:'MATCH',active:true},{from:'L3',to:'R3',label:'MATCH',active:true}
    ],[],['perfect matching'])}),
  ],

  'hopcroft-karp':lesson=>[
    eventFrame(lesson,'bfsLayers','目前 Matching：L1-R1','未匹配左點 L2,L3 同時作為 BFS roots。',{matching:['L1-R1'],roots:['L2','L3'],operation:'multi-source alternating bfs'},{executionView:bip('HOPCROFT–KARP · BFS LAYERS',[
      {from:'L1',to:'R1',label:'MATCH'},{from:'L2',to:'R1',active:true},{from:'L3',to:'R2',active:true},{from:'L3',to:'R3',active:true}
    ],['L2','L3'],['free left roots'])}),
    eventFrame(lesson,'bfsLayers','找到最短增廣路長度','L3→R2 是長度1；L2→R1→L1→R2 會更長，所以此 phase 只接受 shortest length1 paths。',{shortest:1,operation:'freeze shortest augment length'},{executionView:bip('SHORTEST AUGMENTING LAYER',[
      {from:'L3',to:'R2',active:true},{from:'L2',to:'R1'},{from:'R1',to:'L1',dashed:true},{from:'L1',to:'R2'}
    ],['L3','R2'],['distance 1'])}),
    eventFrame(lesson,'dfsAugment','DFS 同層找 Vertex-disjoint Paths','先增廣 L3-R2。',{path:['L3','R2'],matching:['L1-R1','L3-R2'],operation:'dfs shortest path'},{executionView:bip('AUGMENT SHORTEST PATH',[
      {from:'L3',to:'R2',label:'MATCH',active:true},{from:'L1',to:'R1',label:'MATCH'}
    ],['L3','R2'],['size 2'])}),
    eventFrame(lesson,'bfsLayers','下一 Phase 重新 BFS','現在 L2 唯一未匹配；可走 L2→R1→L1→R2→L3→R3。',{root:'L2',operation:'next BFS phase'},{executionView:bip('NEXT ALTERNATING LAYERS',[
      {from:'L2',to:'R1',active:true},{from:'R1',to:'L1',active:true,dashed:true},{from:'L1',to:'R2',active:true},{from:'R2',to:'L3',active:true,dashed:true},{from:'L3',to:'R3',active:true}
    ],['L2','R1','L1','R2','L3','R3'])}),
    eventFrame(lesson,'++matching','Flip 後 Size=3','Hopcroft–Karp 每 phase 同時處理所有 shortest augmenting paths。',{matching:3,operation:'finish phase'},{executionView:bip('PERFECT MATCHING',[
      {from:'L2',to:'R1',label:'MATCH',active:true},{from:'L1',to:'R2',label:'MATCH',active:true},{from:'L3',to:'R3',label:'MATCH',active:true}
    ],[],['size 3'])}),
  ],

  'hungarian':lesson=>[
    eventFrame(lesson,'for(int i=1','Cost Matrix','三人三工作成本 [[4,1,3],[2,0,5],[3,2,2]]。',{operation:'initialize cost matrix'},{executionView:{kind:'matrix',title:'HUNGARIAN · COST MATRIX',colLabels:['J1','J2','J3'],rowLabels:['W1','W2','W3'],cells:[['4','1','3'],['2','0','5'],['3','2','2']],badges:['min assignment']}}),
    eventFrame(lesson,'fill(minv.begin()','加入 Worker 1，初始化 Slack','從 dummy column j0=0 建 alternating tree；minv 會存每個未訪工作目前最小 reduced cost。',{worker:1,operation:'initialize slacks'},{executionView:{kind:'matrix',title:'SLACKS FOR W1',colLabels:['J1','J2','J3'],rowLabels:['cost','slack'],cells:[['4','1','3'],['4','1','3']],activeCells:['1,1'],badges:['min slack = 1']}}),
    eventFrame(lesson,'updatePotentials','用 Delta=1 更新 Potentials','把 alternating tree 的 row potential 增加 1，所有 slack 減 1；J2 slack 變 0，進入 equality graph。',{delta:1,operation:'dual update'},{executionView:{kind:'matrix',title:'REDUCED COST / EQUALITY',colLabels:['J1','J2','J3'],rowLabels:['slack'],cells:[['3','0','2']],activeCells:['0,1'],badges:['u1 += 1','equality J2']}}),
    eventFrame(lesson,'p[j0]!=0','J2 目前 Free → 找到 Augmenting Path','將 W1 指派到 J2。',{assignment:['W1-J2'],operation:'augment assignment'},{executionView:bip('EQUALITY AUGMENT',[
      {from:'L1',to:'R2',label:'MATCH',active:true}
    ],['L1','R2'],['cost 1'])}),
    eventFrame(lesson,'p[j0]=p[j1]','依序加入 W2、W3 並重新增廣','最終 assignment W1-J2(1), W2-J1(2), W3-J3(2)，總成本 5。',{assignment:['W1-J2','W2-J1','W3-J3'],cost:5,operation:'finish Hungarian'},{executionView:{kind:'matrix',title:'OPTIMAL ASSIGNMENT',colLabels:['J1','J2','J3'],rowLabels:['W1','W2','W3'],cells:[['4','1','3'],['2','0','5'],['3','2','2']],activeCells:['0,1','1,0','2,2'],badges:['cost 5']}}),
  ],

  'blossom':lesson=>[
    eventFrame(lesson,'findAugmentingPath','一般圖含 Odd Cycle 1-2-3-1','目前 matching 有 1-4；搜尋從未匹配 root 5 開始，alternating forest 擴張到 odd cycle。',{cycle:['1','2','3'],operation:'grow alternating forest'},{executionView:{kind:'network',title:'BLOSSOM · ALTERNATING FOREST',nodes:[{id:'1',x:430,y:100},{id:'2',x:300,y:250},{id:'3',x:560,y:250},{id:'4',x:720,y:90},{id:'5',x:110,y:260}],edges:[{from:'1',to:'2',active:true},{from:'2',to:'3',active:true},{from:'3',to:'1',active:true},{from:'1',to:'4',label:'MATCH'},{from:'5',to:'2',active:true}],path:['5','2','1','3'],badges:['odd cycle']}}),
    eventFrame(lesson,'foundOddCycle','Edge 3-1 連接同 parity Tree Nodes','這表示出現奇環 blossom；直接當普通 BFS 會卡住。',{edge:'3-1',operation:'detect blossom'},{executionView:{kind:'network',title:'ODD CYCLE DETECTED',nodes:[{id:'1',x:430,y:100},{id:'2',x:300,y:250},{id:'3',x:560,y:250},{id:'4',x:720,y:90},{id:'5',x:110,y:260}],edges:[{from:'1',to:'2',active:true},{from:'2',to:'3',active:true},{from:'3',to:'1',active:true}],path:['1','2','3'],badges:['blossom 1-2-3']}}),
    eventFrame(lesson,'lcaBlossom','求 Blossom Base = 1','沿 alternating parents 找兩端最低共同 base。',{base:1,operation:'find blossom base'},{executionView:{kind:'structure',title:'BLOSSOM BASE',nodes:[{id:'B',label:'{1,2,3}',x:480,y:210,meta:'base 1',active:true},{id:'4',label:'4',x:760,y:100},{id:'5',label:'5',x:140,y:260}],edges:[{from:'5',to:'B',active:true},{from:'B',to:'4',label:'matched'}],badges:['contract odd cycle']}}),
    eventFrame(lesson,'contractBlossom','Contract 成 Supernode B','外部搜尋現在把 {1,2,3} 當一個節點，保留所有通往外部的 incident edges。',{operation:'contract blossom'},{executionView:{kind:'structure',title:'CONTRACTED GRAPH',nodes:[{id:'B',label:'B',x:480,y:210,meta:'1·2·3',active:true},{id:'4',label:'4',x:760,y:100},{id:'5',label:'5',x:140,y:260}],edges:[{from:'5',to:'B',active:true},{from:'B',to:'4',active:true}],sequence:['5','B','4'],badges:['search continues']}}),
    eventFrame(lesson,'augmentAndLiftPath','找到 Augmenting Path 後 Lift Blossom','把穿過 supernode 的路徑展開成原奇環內正確 alternating route，然後整條路 flip。',{operation:'lift and augment'},{executionView:{kind:'network',title:'LIFTED AUGMENTING PATH',nodes:[{id:'1',x:430,y:100},{id:'2',x:300,y:250},{id:'3',x:560,y:250},{id:'4',x:720,y:90},{id:'5',x:110,y:260}],edges:[{from:'5',to:'2',active:true},{from:'2',to:'3',active:true},{from:'3',to:'1',active:true},{from:'1',to:'4',active:true}],path:['5','2','3','1','4'],badges:['flip matching']}}),
  ],
}

export const applyS3FlowOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  const build=overrides[lesson.id]
  if(!build) return lesson
  const coded={...lesson,code:codeOverrides[lesson.id]}
  return {...coded,frames:build(coded),traceMode:'execution',animationVersion:2,fidelity:'concrete'}
}
export const s3FlowOverrideIds=Object.freeze(Object.keys(overrides))
