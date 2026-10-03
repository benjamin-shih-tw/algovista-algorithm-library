import type { AlgorithmLesson, Edge, Frame, Point } from './algorithms'
import { eventFrame, lineNumber } from './traceAuthoring'

type TraceBuilder=(lesson:AlgorithmLesson)=>Frame[]

const points:Point[]=[
  {id:'A',x:12,y:48,label:'A'},{id:'B',x:34,y:18,label:'B'},
  {id:'C',x:36,y:78,label:'C'},{id:'D',x:62,y:22,label:'D'},
  {id:'E',x:66,y:74,label:'E'},{id:'F',x:88,y:48,label:'F'},
]

const treeEdges=[
  {from:'A',to:'B'},{from:'A',to:'C'},{from:'B',to:'D'},
  {from:'B',to:'E'},{from:'D',to:'F'},
]
const mstEdges=[
  {from:'A',to:'B',weight:4},{from:'A',to:'C',weight:2},{from:'B',to:'C',weight:1},
  {from:'B',to:'D',weight:5},{from:'C',to:'D',weight:8},{from:'C',to:'E',weight:10},
  {from:'D',to:'E',weight:2},{from:'D',to:'F',weight:6},{from:'E',to:'F',weight:3},
]
const sccEdges=[
  {from:'A',to:'B'},{from:'B',to:'C'},{from:'C',to:'A'},
  {from:'C',to:'D'},{from:'D',to:'E'},{from:'E',to:'D'},{from:'E',to:'F'},
]
const bridgeEdges=[
  {from:'A',to:'B'},{from:'B',to:'C'},{from:'C',to:'A'},
  {from:'B',to:'D'},{from:'D',to:'E'},{from:'E',to:'F'},{from:'F',to:'D'},
]

const xy=(id:string)=>{const p=points.find(item=>item.id===id)!;return {x:p.x*10,y:p.y*4.3}}
const undirected=(title:string,edges:Edge[],selected:string[],focus:string[],badges:string[],removed:string[]=[],sequence?:string[]):NonNullable<Frame['executionView']>=>({
  kind:'structure',title,
  nodes:points.map(p=>({id:p.id,label:p.id,...xy(p.id),active:focus.includes(p.id),muted:removed.includes(p.id)})),
  edges:edges.filter(e=>!removed.includes(e.from)&&!removed.includes(e.to)).map(e=>({from:e.from,to:e.to,label:e.weight===undefined?undefined:String(e.weight),active:selected.includes(`${e.from}${e.to}`)||selected.includes(`${e.to}${e.from}`)})),
  badges,sequence,
})
const directed=(title:string,edges:Edge[],groups:Record<string,string>,values:Record<string,string>,active:string[],badges:string[],path?:string[]):NonNullable<Frame['executionView']>=>({
  kind:'network',title,
  nodes:points.filter(p=>edges.some(e=>e.from===p.id||e.to===p.id)).map(p=>({id:p.id,label:p.id,...xy(p.id),group:groups[p.id],value:values[p.id]})),
  edges:edges.map(e=>({from:e.from,to:e.to,label:e.weight===undefined?undefined:String(e.weight),active:active.includes(`${e.from}${e.to}`)})),
  badges,path,
})
const mstSelected:Record<string,string[][]>={
  kruskal:[[],['BC'],['BC','AC'],['BC','AC','DE','EF'],['BC','AC','DE','EF'],['BC','AC','DE','EF','BD']],
  prim:[
    [],[],[],[],[],
    ['AC'],['AC'],['AC'],
    ['AC','BC'],['AC','BC'],['AC','BC'],['AC','BC'],['AC','BC'],
    ['AC','BC','BD'],['AC','BC','BD'],['AC','BC','BD'],
    ['AC','BC','BD','DE'],['AC','BC','BD','DE'],['AC','BC','BD','DE'],
    ['AC','BC','BD','DE','EF'],
  ],
  boruvka:[[],[],[],['BC','AC','DE','EF'],['BC','AC','DE','EF'],['BC','AC','DE','EF','BD']],
}
const mstCosts:Record<string,string[]>={
  kruskal:['0','1','3','8','8','13'],
  prim:['0','0','0','0','0','2','2','2','3','3','3','3','3','8','8','8','10','10','10','13'],
  boruvka:['0','0','0','8','8','13'],
}

const graphTreeView=(lesson:AlgorithmLesson,frame:Frame,step:number):Frame['executionView']=>{
  const id=lesson.id
  if(mstSelected[id]){
    const focus=frame.active??[]
    return undirected(`${lesson.zhTitle} · 已選邊為亮線`,mstEdges,mstSelected[id][step],focus,
      [`cost = ${mstCosts[id][step]}`,`selected = ${mstSelected[id][step].length} / 5`,
        ...(id==='kruskal'&&step===4?['AB4 rejected: cycle']:[]),
        ...(id==='prim'&&step===11?['AB4 skipped: stale']:[])])
  }
  if(id==='dag-shortest-path'){
    const distances=frame.distances??(step===0?{A:'∞',B:'∞',C:'∞',D:'∞',E:'∞'}:{})
    const active=[[],[],['AB','AC'],['BC','BD'],['CD','CE'],['DE']][step]
    return directed('DAG · 拓樸序 A → B → C → D → E',lesson.edges??[],{},
      Object.fromEntries(Object.entries(distances).map(([key,value])=>[key,`dist ${value}`])),active,
      step===5?['E = 4']:['負邊可用：圖中沒有有向環'],step>=2?[['A'],['A','B'],['A','B','C'],['A','B','C','D']][step-2]:undefined)
  }
  if(id==='negative-cycle-reconstruction'){
    const active=[[],['BC','CB','CD'],['BC','CB'],['BC','CB'],['BC','CB']][step]
    return directed('Bellman–Ford · 回退 parent 找環',lesson.edges??[],{}, {},active,
      [
        ['B→C(1) + C→B(-3) = -2'],['最後更新：x = D（環外）'],
        ['D ← C ← B ← C ← B','回退 4 次：x = B'],['parent chain：B ← C ← B'],
        ['B → C → B','weight = -2'],
      ][step],step===1?['D']:step>=2?['B','C']:undefined)
  }
  if(id==='kosaraju-scc'){
    const groups=step>=3?{A:'0',B:'0',C:'0',...(step>=4?{D:'1',E:'1'}:{}),...(step>=5?{F:'2'}:{})}:{}
    const focus=[[],[],[],['A','B','C'],['D','E'],['F']][step]
    return directed('Kosaraju · 原圖與已辨識 SCC',sccEdges,groups,
      Object.fromEntries(Object.entries(groups).map(([node,group])=>[node,`SCC ${group}`])),[],
      step===5?['ABC · DE · F','3 SCC']:[step<3?'第一趟完成順序，再走反向圖':`目前辨識 ${step-2} 個 SCC`],focus)
  }
  if(id==='condensation-graph'){
    if(step<2) return directed('原圖 · SCC 0={ABC}, 1={DE}, 2={F}',sccEdges,
      {A:'0',B:'0',C:'0',D:'1',E:'1',F:'2'},
      {A:'SCC 0',B:'SCC 0',C:'SCC 0',D:'SCC 1',E:'SCC 1',F:'SCC 2'},[],['同一 SCC 內邊不進縮點圖'])
    return {kind:'network',title:'SCC 縮點後的 DAG',nodes:[
      {id:'0',label:'0',x:180,y:210,value:'A,B,C',group:'0'},
      {id:'1',label:'1',x:500,y:210,value:'D,E',group:'1'},
      {id:'2',label:'2',x:820,y:210,value:'F',group:'2'},
    ],edges:[{from:'0',to:'1',label:'C→D',active:true},...(step>=3?[{from:'1',to:'2',label:'E→F',active:true}]:[])],
    badges:step===4?['0 → 1 → 2']:['只保留跨 SCC 的有向邊']}
  }
  if(id==='bridge-tree'){
    if(step<4) return undirected('原圖 · B—D 是唯一橋',bridgeEdges,
      step===0?['BD']:['AB','BC','CA',...(step>=2?['DE','EF','FD']:[])],frame.active??[],
      step===0?['移除 B—D，圖分成兩塊']:step>=2?['component 0 = ABC','component 1 = DEF']:['component 0 = ABC'])
    return {kind:'structure',title:'Bridge Tree · 每塊縮成一點',nodes:[
      {id:'0',label:'ABC',x:280,y:210},{id:'1',label:'DEF',x:720,y:210},
    ],edges:[{from:'0',to:'1',label:'B—D',active:true}],badges:['ABC — DEF']}
  }
  if(id==='tree-center') return undirected('樹的直徑 F—D—B—A—C',treeEdges,
    ['FD','DB','BA','AC'],step===2?['B']:step===0?['F','D','B','A','C']:[],
    step===2?['center = B','radius = 2']:['直徑長度 = 4 條邊'])
  if(id==='prufer-code'){
    const removed=[[],['C'],['C','A'],['C','A','E'],['C','A','E','B'],['C','A','E','B']][step]
    const code=[[],['1'],['1','2'],['1','2','2'],['1','2','2','4'],['1','2','2','4']][step]
    const focus=[['C','E','F'],['C','A'],['A','B'],['E','B'],['B','D'],['D','F']][step]
    return undirected('Prüfer · 每次移除編號最小的葉',treeEdges,[],focus,
      step===5?['[1,2,2,4]','degree(v) = 出現次數 + 1']:[`A=1, B=2, C=3, D=4, E=5, F=6`,`code = [${code.join(',')}]`],removed,code)
  }
  return undefined
}

const functionalGraphView=(step:number):NonNullable<Frame['executionView']>=>{
  const nodes=['A','B','C','D','E','F']
  const successors=['B','C','B','C','F','F']
  const marksByStep:string[][]=[
    ['0','0','0','0','0','0'],
    ['1','1','1','0','0','0'],
    ['1','1','1','0','0','0'],
    ['1','1','1','0','0','0'],
    ['1','1','1','0','0','0'],
    ['-1','-1','-1','0','0','0'],
    ['-1','-1','-1','0','0','0'],
    ['-1','-1','-1','4','0','0'],
    ['-1','-1','-1','-1','0','0'],
    ['-1','-1','-1','-1','0','0'],
    ['-1','-1','-1','-1','5','5'],
    ['-1','-1','-1','-1','5','5'],
    ['-1','-1','-1','-1','5','5'],
    ['-1','-1','-1','-1','5','5'],
    ['-1','-1','-1','-1','-1','-1'],
    ['-1','-1','-1','-1','-1','-1'],
  ]
  const marks=marksByStep[Math.min(step,marksByStep.length-1)]
  const activeRows=[0,2,1,1,1,0,3,3,3,4,5,5,5,5,4,5]
  const bccKnown=step>=2
  const selfKnown=step>=11
  return {kind:'table',title:'FUNCTIONAL GRAPH · one successor per node',
    columns:['node','next[node]','state','role'],
    rows:nodes.map((node,index)=>[node,successors[index],marks[index],
      selfKnown&&node==='F'?'cycle':
      bccKnown&&(node==='B'||node==='C')?'cycle':
      marks[index]==='0'?'unseen':
      node==='A'||node==='D'||node==='E'?'entry path':'walking']),
    activeRow:activeRows[Math.min(step,activeRows.length-1)],
    badges:['0 = unseen · positive = this walk · -1 = done',
      ...(selfKnown?['cycles = [B,C], [F]']:bccKnown?['cycle = B→C→B']:[])],
  }
}
const weightedDsuView=(step:number):NonNullable<Frame['executionView']>=>{
  const parent=['A','B','C']
  const potential=['0','0','0']
  if(step>=4) parent[1]='A'
  if(step>=5) potential[1]='3'
  if(step>=10) parent[2]='A'
  if(step>=11) potential[2]='7'
  const active=[0,0,1,1,1,1,1,1,2,2,2,2,2,2][Math.min(step,13)]
  const badges=[
    'potential[x] = value[x] - value[parent[x]]',
    ...(step>=11?['B-A = 3 · C-A = 7']:[]),
    ...(step===12?['check C-A=7 → consistent']:[]),
    ...(step>=13?['check C-A=8 → contradiction']:[]),
  ]
  return {kind:'table',title:'WEIGHTED DSU · parent 與勢能',
    columns:['node','parent','potential to parent'],
    rows:['A','B','C'].map((node,index)=>[node,parent[index],potential[index]]),
    activeRow:active,badges}
}

const rollbackDsuView=(step:number):NonNullable<Frame['executionView']>=>{
  const parent=['A','B','C']
  const size=['1','1','1']
  if(step>=4) parent[1]='A'
  if(step>=5) size[0]='2'
  if(step>=10&&step<17) parent[2]='A'
  if(step>=11&&step<16) size[0]='3'
  if(step>=16) size[0]='2'
  const history=step<3?[]:step<9?['(B, oldSizeA=1)']:step<14?['(B, oldSizeA=1)','(C, oldSizeA=2)']:['(B, oldSizeA=1)']
  return {kind:'table',title:'ROLLBACK DSU · parent / size / history',
    columns:['node','parent','size (root only)'],
    rows:['A','B','C'].map((node,index)=>[node,parent[index],parent[index]===node?size[index]:'—']),
    activeRow:[0,0,1,1,1,0,0,1,2,2,2,0,2,2,2,2,0,2,2][Math.min(step,18)],
    badges:[`history = ${history.length?history.join(' · '):'∅'}`,...(step>=6?['snapshot = 1']:[]),...(step>=18?['rollback complete: {A,B} · {C}']:[])]}
}


const lessonOverrides:Record<string,Partial<AlgorithmLesson>>={
  'kruskal':{points,edges:mstEdges},
  'prim':{points,edges:mstEdges,code:[
    'priority_queue<Edge,vector<Edge>,greater<Edge>> pq;',
    'pq.push({0,s,-1});',
    'while(!pq.empty()){',
    '  auto [w,u,p]=pq.top();',
    '  pq.pop();',
    '  if(used[u]) continue;',
    '  used[u]=true; cost+=w;',
    '  for(auto e:g[u]) {',
    '    if(!used[e.to]) {',
    '      pq.push(e);',
    '    }',
    '  }',
    '}',
  ]},
  'boruvka':{points,edges:mstEdges},
  'kosaraju-scc':{points,edges:sccEdges},
  'condensation-graph':{points,edges:sccEdges},
  'bridge-tree':{points,edges:bridgeEdges},
  'tree-center':{points,edges:treeEdges},
  'tree-distance-queries':{points,edges:treeEdges},
  'prufer-code':{points,edges:treeEdges},
  'weighted-dsu':{code:[
    'struct WeightedDSU {',
    '  vector<int> parent;',
    '  vector<long long> potential;',
    '  WeightedDSU(int n): parent(n), potential(n,0) {',
    '    iota(parent.begin(),parent.end(),0);',
    '  }',
    '  pair<int,long long> find(int x) {',
    '    if(parent[x]==x) return {x,0};',
    '    auto [r,w]=find(parent[x]);',
    '    potential[x]+=w;',
    '    parent[x]=r;',
    '    return {r,potential[x]};',
    '  }',
    '  bool unite(int a,int b,long long d) {',
    '    auto [ra,wa]=find(a);',
    '    auto [rb,wb]=find(b);',
    '    if(ra==rb) return wb-wa==d;',
    '    parent[rb]=ra;',
    '    potential[rb]=d+wa-wb;',
    '    return true;',
    '  }',
    '};',
  ]},
  'rollback-dsu':{code:[
    'struct RollbackDSU {',
    '  vector<int> parent, sz;',
    '  vector<pair<int,int>> history;',
    '  RollbackDSU(int n): parent(n), sz(n,1) {',
    '    iota(parent.begin(),parent.end(),0);',
    '  }',
    '  int find(int x) const {',
    '    while(x!=parent[x]) x=parent[x];',
    '    return x;',
    '  }',
    '  int snapshot() const { return (int)history.size(); }',
    '  bool unite(int a,int b) {',
    '    a=find(a);',
    '    b=find(b);',
    '    if(a==b) { history.push_back({-1,-1}); return false; }',
    '    if(sz[a]<sz[b]) swap(a,b);',
    '    history.push_back({b,sz[a]});',
    '    parent[b]=a;',
    '    sz[a]+=sz[b];',
    '    return true;',
    '  }',
    '  void rollback(int snap) {',
    '    while((int)history.size()>snap) {',
    '      auto [b,oldSizeA]=history.back();',
    '      history.pop_back();',
    '      if(b==-1) continue;',
    '      int a=parent[b];',
    '      sz[a]=oldSizeA;',
    '      parent[b]=b;',
    '    }',
    '  }',
    '};',
  ]},
  'functional-graph':{description:'沿每點唯一出邊找出所有有向環；本動畫不計算跳躍查詢或到環距離。',code:[
    'vector<vector<int>> findFunctionalCycles(const vector<int>& next) {',
    '  int n=next.size();',
    '  vector<int> state(n,0);',
    '  vector<vector<int>> cycles;',
    '  for(int s=0;s<n;++s) if(state[s]==0){',
    '    int u=s;',
    '    while(state[u]==0){',
    '      state[u]=s+1;',
    '      u=next[u];',
    '    }',
    '    if(state[u]==s+1){',
    '      vector<int> cycle;',
    '      int v=u;',
    '      do {',
    '        cycle.push_back(v);',
    '        v=next[v];',
    '      } while(v!=u);',
    '      cycles.push_back(cycle);',
    '    }',
    '    u=s;',
    '    while(state[u]==s+1){',
    '      state[u]=-1;',
    '      u=next[u];',
    '    }',
    '  }',
    '  return cycles;',
    '}'],points,edges:[
    {from:'A',to:'B'},{from:'B',to:'C'},{from:'C',to:'B'},
    {from:'D',to:'C'},{from:'E',to:'F'},{from:'F',to:'F'},
  ]},
  'dag-shortest-path':{points,edges:[
    {from:'A',to:'B',weight:2},{from:'A',to:'C',weight:5},
    {from:'B',to:'C',weight:-1},{from:'B',to:'D',weight:4},
    {from:'C',to:'D',weight:2},{from:'C',to:'E',weight:7},{from:'D',to:'E',weight:1},
  ]},
  'negative-cycle-reconstruction':{points,edges:[
    {from:'A',to:'B',weight:1},{from:'B',to:'C',weight:1},
    {from:'C',to:'B',weight:-3},{from:'C',to:'D',weight:2},
  ]},
}

const overrides:Record<string,TraceBuilder>={
  'kruskal':lesson=>[
    eventFrame(lesson,'sort(edges.begin()','依 Weight 排序所有 Edge','一種同分順序：BC1, AC2, DE2, EF3, AB4, BD5, DF6, CD8, CE10；AC2 與 DE2 可互換。',{order:['BC1','AC2','DE2','EF3','AB4','BD5','DF6','CD8','CE10'],operation:'sort edges'}),
    eventFrame(lesson,'dsu.unite','BC(1)：兩端不同集合，接受','DSU 合併 B、C；cost=1。',{edge:'B-C(1)',components:['A','BC','D','E','F'],cost:1,operation:'accept safe edge'},{active:['B','C'],accepted:['B','C']}),
    eventFrame(lesson,'cost+=w','AC(2)：合併 A 與 BC','A、C 不同集合，選入 AC；cost=3，component=ABC。',{edge:'A-C(2)',components:['ABC','D','E','F'],cost:3,operation:'accept edge'},{active:['A','C'],accepted:['A','B','C']}),
    eventFrame(lesson,'cost+=w','DE(2)、EF(3) 建立 DEF','依序合併 D-E、E-F；右側 component 成為 DEF，cost=8。',{edges:['D-E(2)','E-F(3)'],components:['ABC','DEF'],cost:8,operation:'build second component'},{active:['D','E','F'],accepted:['A','B','C','D','E','F']}),
    eventFrame(lesson,'dsu.unite','AB(4)：同 Component，拒絕','A、B 已在 ABC；若加入 AB 會形成 cycle，因此 unite 回 false。',{edge:'A-B(4)',decision:'skip cycle',cost:8,operation:'reject cycle edge'},{active:['A','B']}),
    eventFrame(lesson,'cost+=w','BD(5)：連接兩大 Components','B∈ABC、D∈DEF，接受 BD；全部 6 點連通，cost=13。',{edge:'B-D(5)',components:['ABCDEF'],cost:13,mst:['BC1','AC2','DE2','EF3','BD5'],operation:'finish MST'},{active:['B','D'],accepted:['A','B','C','D','E','F']}),
  ],

  'prim':lesson=>[
    eventFrame(lesson,'pq.push({0,s,-1})','Seed：把 A 放入 Min-Heap','先放虛擬候選 (0,A)。它只用來讓起點以 cost 0 被第一個取出。',{heap:['0:A'],used:[],cost:0,operation:'seed heap'},{active:['A']}),
    eventFrame(lesson,'pq.pop();','Extract A(0)','top() 讀到目前最小候選 A(0)，接著 pq.pop() 真正把它從 heap 移除。',{pop:'A(0)',heap:[],used:[],cost:0,operation:'extract minimum'},{active:['A']}),
    eventFrame(lesson,'used[u]=true; cost+=w','接受 A','A 尚未 used，因此執行 used[A]=true；虛擬邊權重為 0，所以 cost 仍為 0。',{used:['A'],cost:0,operation:'accept start vertex'},{active:['A'],accepted:['A']}),
    eventFrame(lesson,'pq.push(e);','從 A Push AB4、AC2','for 逐邊檢查未使用鄰點；同一行 pq.push(e) 依序執行兩次，heap 變成 AC2、AB4。',{from:'A',pushed:['AB4','AC2'],heap:['AC2','AB4'],used:['A'],cost:0,operation:'push frontier edges'},{active:['A','B','C'],accepted:['A']}),
    eventFrame(lesson,'pq.pop();','Extract AC2','heap 最小候選是 AC2；pop 後 AB4 暫時留在 heap。',{pop:'AC2',heap:['AB4'],used:['A'],cost:0,operation:'extract minimum'},{active:['A','C'],accepted:['A']}),
    eventFrame(lesson,'used[u]=true; cost+=w','接受 AC2：加入 C','C 尚未 used，因此接受這條 crossing edge；used[C]=true，cost 由 0 變 2。',{edge:'A-C(2)',used:['A','C'],cost:2,operation:'accept crossing edge'},{active:['A','C'],accepted:['A','C']}),
    eventFrame(lesson,'pq.push(e);','從 C Push BC1、CD8、CE10','AC 指回已 used 的 A 不入 heap；其餘三條邊在 pq.push(e) 這行依序加入。',{from:'C',pushed:['BC1','CD8','CE10'],heap:['BC1','AB4','CD8','CE10'],used:['A','C'],cost:2,operation:'expand frontier'},{active:['B','C','D','E'],accepted:['A','C']}),
    eventFrame(lesson,'pq.pop();','Extract BC1','目前最小候選 BC1 被取出。',{pop:'BC1',heap:['AB4','CD8','CE10'],used:['A','C'],cost:2,operation:'extract minimum'},{active:['B','C'],accepted:['A','C']}),
    eventFrame(lesson,'used[u]=true; cost+=w','接受 BC1：加入 B','B 尚未 used，故 used[B]=true 並累加 1；cost=3。',{edge:'B-C(1)',used:['A','B','C'],cost:3,operation:'accept crossing edge'},{active:['B','C'],accepted:['A','B','C']}),
    eventFrame(lesson,'pq.push(e);','從 B 只 Push BD5','BA、BC 都指向已 used 節點，只有 BD5 通過 if(!used[e.to]) 並執行 pq.push(e)。',{from:'B',pushed:['BD5'],heap:['AB4','BD5','CD8','CE10'],used:['A','B','C'],cost:3,operation:'expand frontier'},{active:['B','D'],accepted:['A','B','C']}),
    eventFrame(lesson,'pq.pop();','Extract AB4','AB4 權重 4 比 BD5 小，所以它會先被取出；但 B 已在 MST 中。',{pop:'AB4',heap:['BD5','CD8','CE10'],used:['A','B','C'],cost:3,operation:'extract stale candidate'},{active:['A','B'],accepted:['A','B','C']}),
    eventFrame(lesson,'if(used[u]) continue','AB4 是 Stale Edge：Skip','候選終點 B 已 used，因此 continue；不改 used、不加 cost，也不展開 B。',{edge:'A-B(4)',decision:'stale → continue',used:['A','B','C'],cost:3,operation:'skip stale edge'},{active:['A','B'],accepted:['A','B','C']}),
    eventFrame(lesson,'pq.pop();','Extract BD5','下一個最小候選是 BD5。',{pop:'BD5',heap:['CD8','CE10'],used:['A','B','C'],cost:3,operation:'extract minimum'},{active:['B','D'],accepted:['A','B','C']}),
    eventFrame(lesson,'used[u]=true; cost+=w','接受 BD5：加入 D','D 尚未 used，接受 BD5；cost 3→8。',{edge:'B-D(5)',used:['A','B','C','D'],cost:8,operation:'accept crossing edge'},{active:['B','D'],accepted:['A','B','C','D']}),
    eventFrame(lesson,'pq.push(e);','從 D Push DE2、DF6','DB、DC 指向 used；DE2 與 DF6 依序執行 pq.push(e)，其中 DE2 成為新的 heap minimum。',{from:'D',pushed:['DE2','DF6'],heap:['DE2','DF6','CD8','CE10'],used:['A','B','C','D'],cost:8,operation:'expand frontier'},{active:['D','E','F'],accepted:['A','B','C','D']}),
    eventFrame(lesson,'pq.pop();','Extract DE2','DE2 是目前最小 crossing edge。',{pop:'DE2',heap:['DF6','CD8','CE10'],used:['A','B','C','D'],cost:8,operation:'extract minimum'},{active:['D','E'],accepted:['A','B','C','D']}),
    eventFrame(lesson,'used[u]=true; cost+=w','接受 DE2：加入 E','E 尚未 used，接受 DE2；cost 8→10。',{edge:'D-E(2)',used:['A','B','C','D','E'],cost:10,operation:'accept crossing edge'},{active:['D','E'],accepted:['A','B','C','D','E']}),
    eventFrame(lesson,'pq.push(e);','從 E Push EF3','EC、ED 已 used；只有 EF3 新增到 heap，且比既有 DF6 更小。',{from:'E',pushed:['EF3'],heap:['EF3','DF6','CD8','CE10'],used:['A','B','C','D','E'],cost:10,operation:'expand frontier'},{active:['E','F'],accepted:['A','B','C','D','E']}),
    eventFrame(lesson,'pq.pop();','Extract EF3','EF3 是最後需要的最小 crossing edge。',{pop:'EF3',heap:['DF6','CD8','CE10'],used:['A','B','C','D','E'],cost:10,operation:'extract minimum'},{active:['E','F'],accepted:['A','B','C','D','E']}),
    eventFrame(lesson,'used[u]=true; cost+=w','接受 EF3：MST 完成','F 加入後 6 個頂點全部 used；cost=13，已選邊 AC2、BC1、BD5、DE2、EF3 構成 MST。',{edge:'E-F(3)',used:['A','B','C','D','E','F'],cost:13,mst:['AC2','BC1','BD5','DE2','EF3'],operation:'finish MST'},{accepted:['A','B','C','D','E','F']}),
  ],

  'boruvka':lesson=>[
    eventFrame(lesson,'while(dsu.components()>1)','初始 6 個 Components','每個頂點都是獨立 DSU component。',{components:['A','B','C','D','E','F'],cost:0,operation:'start round'}),
    eventFrame(lesson,'fill(best.begin()','清空每個 Component 的 Best Edge','best[root]=NONE，接著掃所有邊。',{best:'all NONE',operation:'reset best edges'}),
    eventFrame(lesson,'updateBestForBoth','掃邊後得到各自最便宜出邊','A→AC2；B/C→BC1；D/E→DE2；F→EF3。',{best:['A:AC2','B:BC1','C:BC1','D:DE2','E:DE2','F:EF3'],operation:'choose cheapest per component'}),
    eventFrame(lesson,'dsu.unite','平行合併安全邊','實際 unique 合併 BC1、AC2、DE2、EF3，cost=8；分量降為 ABC 與 DEF。',{merged:['BC1','AC2','DE2','EF3'],components:['ABC','DEF'],cost:8,operation:'merge round 1'}),
    eventFrame(lesson,'updateBestForBoth','第二輪找兩 Component 間最便宜邊','跨 ABC/DEF 的候選有 BD5、CD8、CE10，best=BD5。',{components:['ABC','DEF'],best:'BD5',operation:'round 2 cheapest edge'}),
    eventFrame(lesson,'dsu.unite','合併 BD5，完成 MST','兩分量合併，cost=13，components=1。',{edge:'B-D(5)',components:['ABCDEF'],cost:13,operation:'finish Boruvka'},{accepted:['A','B','C','D','E','F']}),
  ],

  'functional-graph':lesson=>[
    eventFrame(lesson,'int u=s;','Start A：u=A','外層找到第一個 unseen 起點 A，將本輪游標 u 設為 A。',{start:'A',u:'A',path:[],operation:'start walk'},{active:['A']}),
    eventFrame(lesson,'state[u]=s+1;','Mark A、B、C 為本輪 Path','while 內這一行會在 u=A、B、C 時各執行一次，因此 state[A]=state[B]=state[C]=1。',{path:['A','B','C'],state:'A=B=C=1',operation:'mark current walk'},{active:['A','B','C']}),
    eventFrame(lesson,'u=next[u];','Follow Successor：C 回到 B','與上一行交替執行 A→B、B→C、C→B；最後 u=B，而 state[B] 已不是 0，離開 while。',{walk:['A→B','B→C','C→B'],u:'B',operation:'advance successor'},{active:['B','C']}),
    eventFrame(lesson,'if(state[u]==s+1)','B 帶本輪編號：確認出現新 Cycle','state[B]=1 且 s+1=1，表示重訪的是本輪 path 上節點，而不是舊 component。',{repeat:'B',decision:'same walk → cycle',operation:'detect cycle'},{active:['B','C'],accepted:['B','C']}),
    eventFrame(lesson,'cycle.push_back(v);','沿 B→C→B 收集 Cycle 節點','do-while 中這一行先 push B，再下一輪 push C；回到 B 時停止，所以 cycle=[B,C]。',{cycle:['B','C'],operation:'collect cycle vertices'},{active:['B','C'],accepted:['B','C']}),
    eventFrame(lesson,'cycles.push_back(cycle);','保存 Cycle [B,C]','局部 cycle 收集完成後，真正把 [B,C] 加入答案 cycles。',{cycles:['[B,C]'],operation:'save cycle'},{accepted:['B','C']}),
    eventFrame(lesson,'state[u]=-1;','Cleanup A、B、C','u 重設為 A 後，cleanup while 依序把本輪的 A、B、C 設成 -1，表示已完成。',{cleared:['A','B','C'],operation:'mark walk done'},{accepted:['B','C']}),
    eventFrame(lesson,'int u=s;','下一個 Unseen 起點是 D','外層會略過已完成的 B、C；到 s=D 時重新令 u=D。',{start:'D',u:'D',operation:'start second walk'},{active:['D']}),
    eventFrame(lesson,'state[u]=s+1;','Mark D，再走向 C','D 被標成本輪編號 4；接著 successor 是已完成的 C，因此 walk 只含 D。',{path:['D'],stateD:4,operation:'mark entry path'},{active:['D','C']}),
    eventFrame(lesson,'u=next[u];','D→C 命中已完成 Component','u 變成 C，而 state[C]=-1，所以 while 結束；因 -1≠4，也不會進入 cycle 分支。',{walk:['D→C'],u:'C',hit:'completed',operation:'join old component'},{active:['D','C'],accepted:['B','C']}),
    eventFrame(lesson,'state[u]=-1;','Cleanup D','cleanup 從 D 開始，把 state[D] 由 4 改成 -1；下一步到 C 時停止。',{cleared:['D'],operation:'finish second walk'},{accepted:['B','C']}),
    eventFrame(lesson,'int u=s;','下一個 Unseen 起點是 E','外層前進到 E，開始第三次 walk。',{start:'E',u:'E',operation:'start third walk'},{active:['E']}),
    eventFrame(lesson,'state[u]=s+1;','Mark E、F 為本輪 Path','state[E]=state[F]=5；F 的 successor 仍是 F。',{path:['E','F'],state:'E=F=5',operation:'mark self-loop walk'},{active:['E','F'],accepted:['B','C']}),
    eventFrame(lesson,'if(state[u]==s+1)','F 被本輪重訪：找到 Self-Cycle','沿 E→F→F 後 u=F，且 state[F]=5=s+1，因此確認新 cycle。',{repeat:'F',cycle:['F'],operation:'detect self cycle'},{active:['F'],accepted:['B','C','F']}),
    eventFrame(lesson,'cycles.push_back(cycle);','收集並保存 Cycle [F]','do-while 的 cycle.push_back(v) 只執行一次就回到 F，接著將 [F] 加進 cycles。',{cycles:['[B,C]','[F]'],operation:'save self cycle'},{active:['F'],accepted:['B','C','F']}),
    eventFrame(lesson,'state[u]=-1;','Cleanup E、F，演算法完成','最後把 E、F 設成 -1；所有節點都完成，答案為 cycles=[[B,C],[F]]。',{cleared:['E','F'],cycles:['[B,C]','[F]'],operation:'finish all walks'},{accepted:['A','B','C','D','E','F']}),
  ].map((frame,step)=>({...frame,executionView:functionalGraphView(step)})),

  'dag-shortest-path':lesson=>[
    eventFrame(lesson,'topologicalSort','Topo Order = A,B,C,D,E','圖無環；處理一個節點前，它所有前驅都已完成。',{order:['A','B','C','D','E'],operation:'topological order'}),
    eventFrame(lesson,'dist[s]=0','Source A=0，其餘 ∞','可以安全包含負邊 B→C=-1，因為 DAG 不會回頭形成負環。',{dist:'A0 B∞ C∞ D∞ E∞',operation:'initialize distances'},{distances:{A:0,B:'∞',C:'∞',D:'∞',E:'∞'}}),
    eventFrame(lesson,'dist[v]=min','處理 A：B=2、C=5','鬆弛 A 的兩條出邊。',{u:'A',updates:['B:∞→2','C:∞→5'],operation:'relax A'},{active:['A','B','C'],distances:{A:0,B:2,C:5,D:'∞',E:'∞'}}),
    eventFrame(lesson,'dist[v]=min','處理 B：C 改成 1、D=6','B→C=-1，因此 2-1=1 比原本 5 更好；B→D 得 6。',{u:'B',updates:['C:5→1','D:∞→6'],operation:'relax B'},{active:['B','C','D'],distances:{A:0,B:2,C:1,D:6,E:'∞'}}),
    eventFrame(lesson,'dist[v]=min','處理 C：D=3、E=8','C→D2 將 D 改成 3；C→E7 得 8。',{u:'C',updates:['D:6→3','E:∞→8'],operation:'relax C'},{active:['C','D','E'],distances:{A:0,B:2,C:1,D:3,E:8}}),
    eventFrame(lesson,'dist[v]=min','處理 D：E=4','D→E1 改善 E；最終 A0,B2,C1,D3,E4。',{u:'D',update:'E:8→4',result:'A0 B2 C1 D3 E4',operation:'finish DAG shortest paths'},{accepted:['A','B','C','D','E'],distances:{A:0,B:2,C:1,D:3,E:4}}),
  ],

  'negative-cycle-reconstruction':lesson=>[
    eventFrame(lesson,'int x=-1','Bellman–Ford on A→B→C，且 C→B=-3','Cycle B→C→B 權重 1-3=-2，因此每繞一次距離都會下降。',{edges:['A-B1','B-C1','C-B-3','C-D2'],x:-1,operation:'initialize reconstruction'}),
    eventFrame(lesson,'parent[v]=u,x=v','第 4 輪仍可 Relax','按 A→B、B→C、C→B、C→D 的掃描順序，D 最後被更新，因此 x=D；D 不在負環內。',{pass:'V',updated:['B','C','D'],x:'D',parents:['B←C','C←B','D←C'],operation:'remember updated vertex'}),
    eventFrame(lesson,'if(x!=-1){ for(int i=0;i<n','從 D 沿 Parent 回退 V 次','D←C←B←C←B；回退 4 次後 x=B，保證落在 cycle 內。',{start:'D',walk:['D','C','B','C','B'],x:'B',operation:'enter cycle'}),
    eventFrame(lesson,'for(int v=x;;v=parent[v])','從 B 收集 Parent Chain','push B，再 parent[B]=C，再 parent[C]=B 回到起點。',{cycleRaw:['B','C','B'],operation:'collect cycle'}),
    eventFrame(lesson,'cycle.push_back','得到負環 B→C→B','反轉/調整方向後輸出 B,C,B，總權重 -2。',{cycle:['B','C','B'],weight:-2,operation:'output negative cycle'},{active:['B','C'],accepted:['B','C']}),
  ],

  'kosaraju-scc':lesson=>[
    eventFrame(lesson,'dfs1(u,order)','第一趟 DFS 記 Finish Order','在原圖 ABC 是一個 SCC、DE 是一個 SCC、F 單獨；跨邊 C→D、E→F。',{graphScc:['ABC','DE','F'],operation:'first DFS'}),
    eventFrame(lesson,'dfs1(u,order)','完成順序示例 F,E,D,C,B,A','真正重要的是反轉後來源 SCC 會先被處理。',{finishOrder:['F','E','D','C','B','A'],operation:'record finish times'}),
    eventFrame(lesson,'reverse(order.begin()','反轉為 A,B,C,D,E,F 並清 Seen','第二趟改走 reverseGraph。',{order:['A','B','C','D','E','F'],operation:'prepare reverse graph pass'}),
    eventFrame(lesson,'dfs2(reverseGraph','從 A 得到 SCC {A,B,C}','反向圖中從 A 不會越過原本 C→D 的方向去到 DE。',{root:'A',component:['A','B','C'],operation:'collect SCC 0'},{active:['A','B','C'],accepted:['A','B','C']}),
    eventFrame(lesson,'dfs2(reverseGraph','下一個未訪 D 得 {D,E}','第二個 component 是 DE。',{root:'D',component:['D','E'],operation:'collect SCC 1'},{active:['D','E'],accepted:['A','B','C','D','E']}),
    eventFrame(lesson,'dfs2(reverseGraph','最後 F 單獨成 SCC','得到三個 SCC：ABC、DE、F。',{component:['F'],all:['ABC','DE','F'],operation:'finish SCC partition'},{active:['F'],accepted:['A','B','C','D','E','F']}),
  ],

  'condensation-graph':lesson=>[
    eventFrame(lesson,'findSCC(component)','先得到 Component Mapping','令 comp[A,B,C]=0，comp[D,E]=1，comp[F]=2。',{mapping:['A→0','B→0','C→0','D→1','E→1','F→2'],operation:'compute SCCs'}),
    eventFrame(lesson,'component[u]!=component[v]','忽略 SCC 內部 Edge','A→B、B→C、C→A、D↔E 都不產生 condensation edge。',{internal:['A-B','B-C','C-A','D-E','E-D'],operation:'skip internal edges'}),
    eventFrame(lesson,'dag[component[u]].push_back','C→D 產生 0→1','這條跨 SCC 邊保留方向。',{edge:'C→D',dagEdge:'0→1',operation:'add condensation edge'}),
    eventFrame(lesson,'dag[component[u]].push_back','E→F 產生 1→2','縮點圖目前 0→1→2。',{edge:'E→F',dagEdges:['0→1','1→2'],operation:'add condensation edge'}),
    eventFrame(lesson,'sortUnique(adj)','去除重邊後得到 DAG','若縮點後有 directed cycle，cycle 上 SCC 本來就應合併，故必無環。',{dag:['0→1','1→2'],topological:['0','1','2'],operation:'finish condensation DAG'}),
  ],

  'bridge-tree':lesson=>[
    eventFrame(lesson,'findBridges()','找出唯一 Bridge B-D','A-B-C-A 與 D-E-F-D 各自是 cycle；只有 B-D 沒有替代路徑。',{bridges:['B-D'],operation:'find bridges'},{active:['B','D']}),
    eventFrame(lesson,'paintWithoutBridges','忽略橋後 Paint 第一塊','從 A 不穿 B-D，可到 A,B,C，標 component 0。',{component0:['A','B','C'],operation:'paint 2-edge component'},{active:['A','B','C'],accepted:['A','B','C']}),
    eventFrame(lesson,'paintWithoutBridges','Paint 第二塊 D,E,F','得到 component 1。',{component1:['D','E','F'],operation:'paint second component'},{active:['D','E','F'],accepted:['A','B','C','D','E','F']}),
    eventFrame(lesson,'if(isBridge[e.id])','Bridge B-D 連接 Comp 0 與 1','把原橋轉成 tree edge 0—1。',{bridge:'B-D',treeEdge:'0-1',operation:'contract bridge'}),
    eventFrame(lesson,'tree[comp[e.u]].push_back','Bridge Tree 完成','兩個縮點、一條邊；原圖上的橋數路徑可轉成這棵樹的距離。',{tree:['ABC — DEF'],operation:'finish bridge tree'}),
  ],

  'two-sat':lesson=>[
    eventFrame(lesson,'for(auto [a,b]:clauses)','Clauses：(x∨y),(¬x∨y),(x∨¬y)','每個 clause 轉成兩條 implication。',{clauses:['x∨y','¬x∨y','x∨¬y'],operation:'read clauses'}),
    eventFrame(lesson,'addImplication(not(a),b)','x∨y → ¬x→y、¬y→x','第一個 clause 產生兩條必要 implication。',{clause:'x∨y',implications:['¬x→y','¬y→x'],operation:'add implications'}),
    eventFrame(lesson,'addImplication(not(a),b)','其餘 Clauses 加完','¬x∨y 產生 x→y、¬y→¬x；x∨¬y 產生 ¬x→¬y、y→x。',{implications:['x→y','¬y→¬x','¬x→¬y','y→x'],operation:'complete implication graph'}),
    eventFrame(lesson,'findSCC()','SCC 分成 {x,y} 與 {¬x,¬y}','正 literal 互相可達；負 literal 也互相可達，但兩組不同 SCC。',{components:['{x,y}','{¬x,¬y}'],operation:'compute implication SCCs'}),
    eventFrame(lesson,'comp[x]==comp[not(x)]','檢查 x 與 ¬x 不同 SCC','y 與 ¬y 也不同，所以不存在 contradiction。',{checks:['comp(x)≠comp(¬x)','comp(y)≠comp(¬y)'],result:'satisfiable',operation:'contradiction test'}),
    eventFrame(lesson,'value[x]=comp[x]>comp[not(x)]','依 SCC Order 賦值','可得到 x=true、y=true；三個 clauses 全部成立。',{assignment:['x=true','y=true'],verified:['x∨y=true','¬x∨y=true','x∨¬y=true'],operation:'assign variables'}),
  ],

  'weighted-dsu':lesson=>[
    eventFrame(lesson,'iota(parent.begin(),parent.end(),0);','初始化：每個點先是自己的 Root','A、B、C 的 parent 都指向自己，所有 potential 都是 0。',{parent:'A→A B→B C→C',potential:'0,0,0',operation:'initialize weighted dsu'}),
    eventFrame(lesson,'auto [ra,wa]=find(a);','Constraint B-A=3：先 Find A','第一次 unite(A,B,3) 中，A 自己就是 root，所以 ra=A、wa=0。',{constraint:'B-A=3',a:'A',ra:'A',wa:0,operation:'find a root'}),
    eventFrame(lesson,'auto [rb,wb]=find(b);','再 Find B','B 也尚未合併，因此 rb=B、wb=0。',{b:'B',rb:'B',wb:0,operation:'find b root'}),
    eventFrame(lesson,'if(ra==rb)','Roots 不同，可以合併','ra=A、rb=B，不同 root，所以不做 consistency return，進入真正的 union mutation。',{ra:'A',rb:'B',decision:'merge',operation:'check roots'}),
    eventFrame(lesson,'parent[rb]=ra;','把 Root B 掛到 A','真正改 parent 的是這一行：parent[B] 由 B 改成 A。此刻勢能值尚未寫入。',{parent:'B→A',operation:'attach root'}),
    eventFrame(lesson,'potential[rb]=d+wa-wb;','寫入 Potential[B]=3','公式 d+wa-wb = 3+0-0=3，因此 value[B]-value[A]=3。',{formula:'3+0-0',potentialB:3,operation:'set root potential'}),
    eventFrame(lesson,'auto [r,w]=find(parent[x]);','第二個 Constraint C-B=4：Find B 遞迴到 A','unite(B,C,4) 先 find(B)。因 parent[B]=A，所以遞迴 find(A) 得 root A、w=0。',{constraint:'C-B=4',x:'B',parentB:'A',r:'A',w:0,operation:'recursive find'}),
    eventFrame(lesson,'potential[x]+=w;','累加 B 到 Root 的勢能','potential[B] 原本是 3，再加上 A 到 root 的 0，仍為 3；這行才是 weighted path compression 的勢能累加。',{x:'B',before:3,add:0,after:3,operation:'accumulate potential'}),
    eventFrame(lesson,'auto [rb,wb]=find(b);','Find C 得 Root C、Weight 0','C 尚未加入任何 component，因此 rb=C、wb=0。',{b:'C',rb:'C',wb:0,operation:'find second root'}),
    eventFrame(lesson,'if(ra==rb)','A 與 C Roots 不同','find(B) 得 ra=A、wa=3；find(C) 得 rb=C、wb=0，因此需要合併。',{ra:'A',wa:3,rb:'C',wb:0,decision:'merge',operation:'check roots'}),
    eventFrame(lesson,'parent[rb]=ra;','把 Root C 掛到 A','parent[C] 由 C 改成 A；下一行再計算 C 到 A 的勢能。',{parent:'C→A',operation:'attach second root'}),
    eventFrame(lesson,'potential[rb]=d+wa-wb;','推得 Potential[C]=7','d+wa-wb = 4+3-0=7，所以 C-A=7，同時仍滿足 C-B=4。',{formula:'4+3-0',potentialC:7,operation:'derive potential'}),
    eventFrame(lesson,'if(ra==rb) return wb-wa==d;','驗證 C-A=7：一致','再 unite(A,C,7) 時兩者已同 root；wc-wa=7-0=7，條件成立，回傳 true 且不改結構。',{constraint:'C-A=7',computed:7,result:'true',operation:'consistency check'}),
    eventFrame(lesson,'if(ra==rb) return wb-wa==d;','驗證 C-A=8：矛盾','同一結構下實際差仍是 7，不等於 8，因此回傳 false；Weighted DSU 成功偵測衝突。',{constraint:'C-A=8',computed:7,result:'false',operation:'detect contradiction'}),
  ].map((frame,step)=>({...frame,executionView:weightedDsuView(step)}))

  'rollback-dsu':lesson=>[
    eventFrame(lesson,'iota(parent.begin(),parent.end(),0);','初始化 Parent / Size','A、B、C 各自成一個 component，size 都是 1，history 為空。',{parent:'A→A B→B C→C',sizes:'1,1,1',history:'empty',operation:'initialize rollback dsu'}),
    eventFrame(lesson,'a=find(a);','Unite A,B：Find A','Rollback DSU 不做 path compression；find(A) 直接得到 A。',{a:'A',rootA:'A',operation:'find a'}),
    eventFrame(lesson,'b=find(b);','Find B','B 也是自己的 root。',{b:'B',rootB:'B',operation:'find b'}),
    eventFrame(lesson,'history.push_back({b,sz[a]});','先保存可逆資訊 (B,1)','在修改 parent/size 前，history 記錄「被掛的 root B」與「A 原本的 size=1」。',{history:['B,1'],operation:'record change'}),
    eventFrame(lesson,'parent[b]=a;','Parent[B] = A','現在才真正把 B 掛到 A。',{parent:'B→A',operation:'attach B'}),
    eventFrame(lesson,'sz[a]+=sz[b];','Size[A]：1→2','合併完成後 root A 的 size 變 2。',{sizeA:2,components:['AB','C'],operation:'grow root size'}),
    eventFrame(lesson,'int snapshot() const','Snapshot = 1','snapshot 只保存目前 history 長度；現在有一筆 A-B 合併紀錄，所以 snap=1。',{snapshot:1,historySize:1,operation:'take snapshot'}),
    eventFrame(lesson,'a=find(a);','Unite B,C：Find B 得 A','因 B 的 parent=A，find(B) 回傳 A；仍沒有 path compression mutation。',{input:'B',root:'A',operation:'find merged root'}),
    eventFrame(lesson,'b=find(b);','Find C 得 C','C 尚未合併，root=C。',{input:'C',root:'C',operation:'find C'}),
    eventFrame(lesson,'history.push_back({b,sz[a]});','保存 (C,2)','這次即將把 C 掛到 A，所以先記錄 C 與 A 合併前的 size=2。',{history:['B,1','C,2'],operation:'record second change'}),
    eventFrame(lesson,'parent[b]=a;','Parent[C] = A','C 正式加入 A-B component。',{parent:'C→A',operation:'attach C'}),
    eventFrame(lesson,'sz[a]+=sz[b];','Size[A]：2→3','現在 component ABC 的 root A size=3。',{sizeA:3,components:['ABC'],operation:'grow size again'}),
    eventFrame(lesson,'while((int)history.size()>snap)','Rollback：history 2 > snapshot 1','需要撤銷 snapshot 之後的那一筆 B-C 合併，進入 while。',{historySize:2,snapshot:1,operation:'enter rollback loop'}),
    eventFrame(lesson,'auto [b,oldSizeA]=history.back();','讀出最後修改 (C,2)','LIFO 保證先撤銷最近的 union；取得 b=C、oldSizeA=2。',{b:'C',oldSizeA:2,operation:'read last change'}),
    eventFrame(lesson,'history.pop_back();','Pop 最後一筆 History','history 由兩筆回到一筆，只留下 snapshot 前的 (B,1)。',{history:['B,1'],operation:'pop history'}),
    eventFrame(lesson,'int a=parent[b];','找出當時的 Root A','此刻 parent[C]=A 尚未還原，因此可以直接由 parent[b] 取得要恢復 size 的 root A。',{b:'C',a:'A',operation:'recover parent root'}),
    eventFrame(lesson,'sz[a]=oldSizeA;','恢復 Size[A]：3→2','先把 A 的 size 還原成 union B-C 前的 2。',{sizeA:2,operation:'restore root size'}),
    eventFrame(lesson,'parent[b]=b;','恢復 Parent[C] = C','最後讓 C 再次成為自己的 root；component 回到 {A,B} 與 {C}。',{parent:'C→C',components:['AB','C'],operation:'restore detached root'}),
    eventFrame(lesson,'while((int)history.size()>snap)','History Size 已等於 Snapshot，停止','history.size()=1，不再大於 snap=1；rollback 完成，而且 A-B 的舊狀態完整保留。',{historySize:1,snapshot:1,result:'AB | C',operation:'rollback complete'}),
  ].map((frame,step)=>({...frame,executionView:rollbackDsuView(step)}))

  'tree-center':lesson=>[
    eventFrame(lesson,'getDiameterPath','重建 Diameter F-D-B-A-C','這棵樹最長路徑有 5 個節點、4 條邊。',{diameter:['F','D','B','A','C'],edges:4,operation:'get diameter'},{active:['F','D','B','A','C']}),
    eventFrame(lesson,'int m=diameter.size','m=5 為 Odd','奇數個 path nodes 只有一個正中央。',{m:5,parity:'odd',operation:'check diameter length'}),
    eventFrame(lesson,'if(m%2) centers','Center = diameter[2] = B','B 到 F、C 的最大距離都是 2；任何向一端偏移都會讓另一端更遠。',{center:'B',radius:2,operation:'choose one center'},{active:['B'],accepted:['B']}),
  ],

  'tree-distance-queries':lesson=>[
    eventFrame(lesson,'int w=lca(u,v)','Query dist(F,C)：LCA=A','以 A 為根：distRoot[F]=3、distRoot[C]=1，LCA(F,C)=A。',{u:'F',v:'C',lca:'A',operation:'find LCA'},{active:['F','C','A']}),
    eventFrame(lesson,'distRoot[u]+distRoot[v]','套公式 3+1-2·0','根到兩點距離相加，根到 LCA 的共享前綴要扣兩次。',{distU:3,distV:1,distLca:0,formula:'3+1-2·0',distance:4,operation:'compute path distance'}),
    eventFrame(lesson,'return distance','回傳 4','實際唯一路徑 F-D-B-A-C 也有 4 條邊。',{path:['F','D','B','A','C'],result:4,operation:'return distance'},{accepted:['F','D','B','A','C']}),
  ],

  'prufer-code':lesson=>[
    eventFrame(lesson,'priority_queue<int','標號 A..F → 1..6','樹邊 1-2,1-3,2-4,2-5,4-6；初始葉為 3,5,6，Min-Heap top=3。',{edges:['1-2','1-3','2-4','2-5','4-6'],leaves:['3','5','6'],operation:'initialize leaf heap'}),
    eventFrame(lesson,'int leaf=leaves.top','移除最小葉 3，記錄鄰居 1','Code=[1]；degree[1] 從 2→1，因此 1 變新葉加入 heap。',{leaf:3,neighbor:1,code:['1'],newLeaf:1,operation:'remove leaf'}),
    eventFrame(lesson,'code.push_back(p)','下一個最小葉 1，記錄 2','移除 1 後 degree[2] 3→2，尚未成葉。Code=[1,2]。',{leaf:1,neighbor:2,code:['1','2'],operation:'record neighbor'}),
    eventFrame(lesson,'code.push_back(p)','移除葉 5，仍記錄 2','degree[2] 2→1，所以 2 加入 leaves。Code=[1,2,2]。',{leaf:5,neighbor:2,code:['1','2','2'],newLeaf:2,operation:'remove leaf'}),
    eventFrame(lesson,'code.push_back(p)','移除葉 2，記錄 4','Code 長度達 n-2=4，得到 [1,2,2,4]。',{leaf:2,neighbor:4,code:['1','2','2','4'],operation:'finish Prufer code'}),
    eventFrame(lesson,'if(--degree[p]==1)','出現次數驗證 Degree','1 出現 1 次→degree 2；2 出現 2 次→degree 3；4 出現 1 次→degree 2；其他未出現→degree 1。',{code:['1','2','2','4'],degreeCheck:['1:2','2:3','3:1','4:2','5:1','6:1'],operation:'verify degree property'}),
  ],
}

export const applyS2GraphTreeOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  const dataset=lessonOverrides[lesson.id] ? {...lesson,...lessonOverrides[lesson.id]} : lesson
  const build=overrides[lesson.id]
  if(!build) return dataset
  return {...dataset,frames:build(dataset).map((frame,step)=>({
    ...frame,executionView:frame.executionView??graphTreeView(dataset,frame,step),
  })),traceMode:'execution',animationVersion:2}
}

export const s2GraphTreeOverrideIds=Object.freeze(Object.keys(overrides))
