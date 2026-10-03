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
  prim:[[],[],[],['AC'],['AC'],['AC','BC'],['AC','BC'],['AC','BC','BD','DE','EF']],
  boruvka:[[],[],[],['BC','AC','DE','EF'],['BC','AC','DE','EF'],['BC','AC','DE','EF','BD']],
}
const mstCosts:Record<string,string[]>={kruskal:['0','1','3','8','8','13'],prim:['0','0','0','2','2','3','3','13'],boruvka:['0','0','0','8','8','13']}

const graphTreeView=(lesson:AlgorithmLesson,frame:Frame,step:number):Frame['executionView']=>{
  const id=lesson.id
  if(mstSelected[id]){
    const focus=frame.active??[]
    return undirected(`${lesson.zhTitle} · 已選邊為亮線`,mstEdges,mstSelected[id][step],focus,
      [`cost = ${mstCosts[id][step]}`,`selected = ${mstSelected[id][step].length} / 5`,
        ...(id==='kruskal'&&step===4?['AB4 rejected: cycle']:[]),
        ...(id==='prim'&&step===6?['AB4 skipped: stale']:[])])
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
  const marks=[
    ['0','0','0','0','0','0'],
    ['1','1','1','0','0','0'],
    ['1','1','1','0','0','0'],
    ['-1','-1','-1','0','0','0'],
    ['-1','-1','-1','-1','0','0'],
    ['-1','-1','-1','-1','-1','-1'],
  ][step]
  return {kind:'table',title:'FUNCTIONAL GRAPH · one successor per node',
    columns:['node','next[node]','state','role'],
    rows:nodes.map((node,index)=>[node,successors[index],marks[index],
      step>=5&&node==='F'||step>=2&&(node==='B'||node==='C')?'cycle':
      marks[index]==='0'?'unseen':node==='A'||node==='D'||step>=5&&node==='E'?'entry path':'walking']),
    activeRow:[0,2,1,0,3,5][step],
    badges:['0 = unseen · positive = this walk · -1 = done',
      ...(step===2?['cycle = B→C→B']:step===5?['cycles = [B,C], [F]']:[])],
  }
}

const lessonOverrides:Record<string,Partial<AlgorithmLesson>>={
  'kruskal':{points,edges:mstEdges},
  'prim':{points,edges:mstEdges},
  'boruvka':{points,edges:mstEdges},
  'kosaraju-scc':{points,edges:sccEdges},
  'condensation-graph':{points,edges:sccEdges},
  'bridge-tree':{points,edges:bridgeEdges},
  'tree-center':{points,edges:treeEdges},
  'tree-distance-queries':{points,edges:treeEdges},
  'prufer-code':{points,edges:treeEdges},
  'functional-graph':{description:'沿每點唯一出邊找出所有有向環；本動畫不計算跳躍查詢或到環距離。',code:[
    'vector<vector<int>> findFunctionalCycles(const vector<int>& next) {',
    '  int n=next.size();',
    '  vector<int> state(n,0);',
    '  vector<vector<int>> cycles;',
    '  for(int s=0;s<n;++s) if(state[s]==0){',
    '    int u=s;',
    '    while(state[u]==0){ state[u]=s+1; u=next[u]; }',
    '    if(state[u]==s+1){',
    '      vector<int> cycle;',
    '      int v=u;',
    '      do { cycle.push_back(v); v=next[v]; } while(v!=u);',
    '      cycles.push_back(cycle);',
    '    }',
    '    u=s;',
    '    while(state[u]==s+1){ state[u]=-1; u=next[u]; }',
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
    eventFrame(lesson,'pq.push({0,s,-1})','從 A 啟動 Prim','Heap 先放虛擬邊 (0,A)。used 全 false。',{heap:['0:A'],used:[],cost:0,operation:'seed heap'},{active:['A']}),
    eventFrame(lesson,'used[u]=true; cost+=w','Pop A，加入 MST','A 首次出 heap，used[A]=true，cost 仍 0。',{pop:'A(0)',used:['A'],cost:0,operation:'take vertex'},{active:['A'],accepted:['A']}),
    eventFrame(lesson,'for(auto e:g[u])','把 A-B4、A-C2 Push','它們是 used 集合跨到外部的候選邊。',{from:'A',heap:['AC2','AB4'],operation:'push cut edges'},{active:['A','B','C']}),
    eventFrame(lesson,'used[u]=true; cost+=w','Pop AC2：加入 C','最小 crossing edge 是 AC2，cost=2。',{edge:'A-C(2)',used:['A','C'],cost:2,operation:'take minimum crossing edge'},{active:['A','C'],accepted:['A','C']}),
    eventFrame(lesson,'for(auto e:g[u])','C 加入候選 BC1、CD8、CE10','Heap 現在最小會是 BC1。',{from:'C',heap:['BC1','AB4','CD8','CE10'],operation:'expand frontier'}),
    eventFrame(lesson,'used[u]=true; cost+=w','Pop BC1：加入 B','B 尚未 used，接受邊 BC，cost=3。',{edge:'B-C(1)',used:['A','B','C'],cost:3,operation:'take B'},{active:['B','C'],accepted:['A','B','C']}),
    eventFrame(lesson,'if(used[u]) continue','之後 AB4 變成過期候選','A、B 都已 used，pop AB4 時直接 continue，不重複加 cost。',{edge:'A-B(4)',decision:'stale/skip',cost:3,operation:'skip stale edge'},{active:['A','B']}),
    eventFrame(lesson,'used[u]=true; cost+=w','BD5、DE2、EF3 完成 MST','依序加入 D（+5）、E（+2）、F（+3），總 cost=13。',{chosen:['BD5','DE2','EF3'],used:['A','B','C','D','E','F'],cost:13,operation:'finish MST'},{accepted:['A','B','C','D','E','F']}),
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
    eventFrame(lesson,'for(int s=0','從 A 開始新的 Walk','next: A→B→C→B；本輪 id 用 s+1 標記尚未完成的路徑。',{start:'A',path:[],operation:'start component walk'},{active:['A']}),
    eventFrame(lesson,'while(state[u]==0)','A→B→C 依序打本輪標記','state[A]=state[B]=state[C]=1，下一步從 C 到 B。',{path:['A','B','C'],state:'A=B=C=1',next:'C→B',operation:'follow successors'},{active:['A','B','C']}),
    eventFrame(lesson,'if(state[u]==s+1)','再次到 B：找到 Cycle B→C→B','B 已帶本輪編號 1，因此從 B 開始的重訪段就是新 cycle。',{repeat:'B',cycle:['B','C'],operation:'record cycle'},{active:['B','C'],accepted:['B','C']}),
    eventFrame(lesson,'while(state[u]==s+1)','清理 A、B、C 為完成狀態 -1','從 A 沿 successor 清理本輪標記，避免之後重做。',{cleared:['A','B','C'],operation:'finalize component'}),
    eventFrame(lesson,'while(state[u]==0)','D 走到已完成 C，不產生新 Cycle','D→C，但 C 已是 -1；本輪只清理 D，不會再次記錄 B-C 環。',{start:'D',path:['D'],hits:'C completed',operation:'attach to old component'},{active:['D','C']}),
    eventFrame(lesson,'if(state[u]==s+1)','E→F→F 找到第二個 Cycle {F}','F 在同一輪被重訪，自環 F→F 是第二個 cycle；記錄後把 E、F 清理為 -1。',{start:'E',path:['E','F'],cycle:['F'],operation:'record self cycle'},{active:['E','F'],accepted:['B','C','F']}),
  ].map((frame,step)=>({...frame,
    codeLines:step===2||step===5?[lineNumber(lesson,'if(state[u]==s+1)'),lineNumber(lesson,'cycle.push_back(v)'),lineNumber(lesson,'cycles.push_back(cycle)')]:frame.codeLines,
    state:step===2||step===5?{...frame.state,highlightCodeLines:'all'}:frame.state,
    executionView:functionalGraphView(step),
  })),

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
    eventFrame(lesson,'unite(int a,int b,ll d)','加入 Constraint B-A=3','A、B 尚不同根；wa=0,wb=0。',{constraint:'B-A=3',roots:['A','B'],operation:'start weighted union'}),
    eventFrame(lesson,'potential[rb]=d+wa-wb','把 Root B 掛到 A，Potential[B]=3','令 parent[B]=A，potential[B] 表示 value[B]-value[A]=3。',{parent:'B→A',potentialB:3,operation:'set weighted parent'}),
    eventFrame(lesson,'unite(int a,int b,ll d)','加入 C-B=4','find(B) 得 root A、wa=3；C 自己為 root，wb=0。',{constraint:'C-B=4',rootB:'A',weightB:3,rootC:'C',weightC:0,operation:'second weighted union'}),
    eventFrame(lesson,'potential[rb]=d+wa-wb','把 C 掛到 A，Potential[C]=7','公式 d+wa-wb = 4+3-0=7，所以 C-A=7。',{parent:'C→A',potentialC:7,operation:'derive root potential'}),
    eventFrame(lesson,'potential[x]+=w','Find C 時累加 Potential','若路徑更長，compression 會把 parent potential 全部累加；此例 C 已直接指 A。',{query:'find(C)',root:'A',weight:7,operation:'weighted path compression'}),
    eventFrame(lesson,'if(ra==rb) return wb-wa==d','驗證 Constraint C-A=7','A、C 已同根；wc-wa=7-0=7，與新約束一致，回 true。',{constraint:'C-A=7',computed:7,result:'consistent',operation:'check existing relation'}),
    eventFrame(lesson,'if(ra==rb) return wb-wa==d','若要求 C-A=8，偵測矛盾','同根實際差固定為 7，不等於 8，因此 unite 回 false。',{constraint:'C-A=8',computed:7,result:'contradiction',operation:'detect inconsistency'}),
  ],

  'rollback-dsu':lesson=>[
    eventFrame(lesson,'unite(int a,int b)','Unite A,B','size 相同，令 parent[B]=A、size[A]=2，並把 (B,oldSizeA=1) Push History。',{union:'A-B',parent:'B→A',sizeA:2,history:['B,1'],operation:'record reversible union'}),
    eventFrame(lesson,'int snapshot()','Snapshot S=1','snapshot 只是目前 history stack 長度 1。',{snapshot:1,historySize:1,operation:'take snapshot'}),
    eventFrame(lesson,'unite(int a,int b)','再 Unite B,C','find(B)=A；C 掛到 A，size[A]=3，history 再 Push (C,2)。',{union:'B-C',parent:'C→A',sizeA:3,history:['B,1','C,2'],operation:'second union'}),
    eventFrame(lesson,'unite(int a,int b)','再 Unite D,E','形成另一個 component DE；history size=3。',{union:'D-E',components:['ABC','DE','F'],historySize:3,operation:'third union'}),
    eventFrame(lesson,'rollback(int snap)','Rollback 到 S=1','History size 3→1，逆序 undo D-E 與 B-C。',{snapshot:1,undo:['D-E','B-C'],operation:'rollback changes'}),
    eventFrame(lesson,'undo(history.top())','恢復 Parent 與 Size','最終只保留 snapshot 前的 A-B；components={AB},{C},{D},{E},{F}。',{components:['AB','C','D','E','F'],history:['B,1'],operation:'restored state'}),
  ],

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
