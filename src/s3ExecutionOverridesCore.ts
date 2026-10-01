import type { AlgorithmLesson, Frame, ExecutionView } from './algorithms'
import { eventFrame } from './traceAuthoring'
type TraceBuilder=(lesson:AlgorithmLesson)=>Frame[]

const structure=(title:string,nodes:any[],edges:any[],badges:string[]=[],sequence?:string[]):ExecutionView=>({kind:'structure',title,nodes,edges,badges,sequence})
const table=(title:string,columns:string[],rows:string[][],activeRow?:number,badges:string[]=[]):ExecutionView=>({kind:'table',title,columns,rows,activeRow,badges})
const graphNodes=[
  {id:'A',x:150,y:210},{id:'B',x:350,y:90},{id:'C',x:550,y:210},{id:'D',x:350,y:340},{id:'E',x:780,y:110},{id:'F',x:800,y:320},
]

const codeOverrides:Record<string,string[]>={
  'biconnected-components':[
    'void dfs(int u,int parentEdge){',
    '  disc[u]=low[u]=++timer;',
    '  for(int eid:adj[u]) if(eid!=parentEdge){ int v=other(eid,u);',
    '    if(!disc[v]){ edgeStack.push(eid); dfs(v,eid); low[u]=min(low[u],low[v]);',
    '      if(low[v]>=disc[u]) popBlockUntil(eid);',
    '    } else if(disc[v]<disc[u]) edgeStack.push(eid),low[u]=min(low[u],disc[v]);',
    '  }',
    '}',
  ],
  'block-cut-tree':[
    'findBiconnectedComponents();',
    'for(each block B) createBlockNode(B);',
    'for(each articulation vertex a) createArticulationNode(a);',
    'for(each block B)',
    '  for(each articulation a in B) addEdge(blockNode(B),artNode(a));',
  ],
  'offline-dynamic-connectivity':[
    'for(each edge e) addInterval(timeTree,activeFrom[e],activeTo[e],e);',
    'void solve(node,l,r){',
    '  int snap=dsu.snapshot();',
    '  for(edge e:bucket[node]) dsu.unite(e.u,e.v);',
    '  if(r-l==1) answerQueriesAt(l);',
    '  else solve(left,l,m),solve(right,m,r);',
    '  dsu.rollback(snap);',
    '}',
  ],
  'suffix-automaton':[
    'void extend(char c){ int cur=newState(len[last]+1),p=last;',
    '  while(p!=-1 && !next[p][c]) next[p][c]=cur,p=link[p];',
    '  if(p==-1) link[cur]=0; else { int q=next[p][c];',
    '    if(len[p]+1==len[q]) link[cur]=q;',
    '    else { int clone=cloneState(q,len[p]+1); redirectTransitions(p,c,q,clone); link[q]=link[cur]=clone; }',
    '  } last=cur;',
    '}',
  ],
  'palindromic-tree':[
    'void add(int pos){ int cur=last;',
    '  while(s[pos-len[cur]-1]!=s[pos]) cur=link[cur];',
    '  if(!next[cur][s[pos]]){ int now=newNode(len[cur]+2);',
    '    int p=link[cur]; while(s[pos-len[p]-1]!=s[pos]) p=link[p];',
    '    link[now]=next[p][s[pos]]; next[cur][s[pos]]=now;',
    '  }',
    '  last=next[cur][s[pos]];',
    '}',
  ],
  'suffix-tree':[
    'for(char c:text){ ++remaining;',
    '  while(remaining){',
    '    if(walkDown()) continue;',
    '    if(noEdge(activeNode,nextChar)) createLeaf();',
    '    else if(nextCharMatches(c)){ ++activeLength; break; }',
    '    else splitEdgeAndCreateLeaf();',
    '    updateSuffixLinks(); --remaining; updateActivePoint();',
    '  }',
    '}',
  ],
  'berlekamp-massey':[
    'vector<long long> C{1},B{1}; int L=0,m=1; long long b=1;',
    'for(int n=0;n<s.size();++n){',
    '  long long d=s[n]; for(int i=1;i<=L;++i) d+=C[i]*s[n-i];',
    '  if(d==0){ ++m; continue; }',
    '  auto T=C; long long coef=d*inverse(b);',
    '  C-=coef*x^m*B;',
    '  if(2*L<=n){ L=n+1-L; B=T; b=d; m=1; } else ++m;',
    '}',
  ],
  'gaussian-elimination':[
    'for(int col=0,row=0;col<m && row<n;++col){',
    '  int sel=argmaxAbs(A,row,col); if(abs(A[sel][col])<EPS) continue;',
    '  swap(A[sel],A[row]);',
    '  divideRow(A[row],A[row][col]);',
    '  for(int i=0;i<n;++i) if(i!=row) eliminate(A[i],A[row],col);',
    '  where[col]=row++;',
    '}',
    'classifyByRankAndConsistency();',
  ],
  'profile-dp':[
    'dp[0][0]=1;',
    'for(int pos=0;pos<H*W;++pos){',
    '  for(int mask=0;mask<(1<<W);++mask) if(dp[pos][mask]){',
    '    if(mask&1) dp[pos+1][mask>>1]+=dp[pos][mask];',
    '    else { placeVertical(); if(canHorizontal()) placeHorizontal(); }',
    '  }',
    '}',
  ],
  'convex-hull-trick':[
    'void addLine(long long m,long long b){',
    '  while(lines.size()>=2 && redundant(lines[-2],lines[-1],{m,b})) lines.pop_back();',
    '  lines.push_back({m,b});',
    '}',
    'long long query(long long x){',
    '  while(ptr+1<lines.size() && value(lines[ptr+1],x)<=value(lines[ptr],x)) ++ptr;',
    '  return value(lines[ptr],x);',
    '}',
  ],
  'slope-trick':[
    'priority_queue<long long> left; priority_queue<long long,vector<long long>,greater<long long>> right;',
    'long long minValue=0,addL=0,addR=0;',
    'void addAbs(long long a){',
    '  addMax0XMinusA(a); addMax0AMinusX(a);',
    '}',
    'void shift(long long l,long long r){ addL+=l; addR+=r; }',
  ],
}

const overrides:Record<string,TraceBuilder>={
  'biconnected-components':lesson=>[
    eventFrame(lesson,'disc[u]=low[u]','Graph：Triangle A-B-C-A，Bridge C-D','DFS 從 A；disc/low 初始依進入順序。',{operation:'start lowlink dfs'},{executionView:{kind:'network',title:'BCC · DFS GRAPH',nodes:graphNodes.slice(0,4),edges:[{from:'A',to:'B'},{from:'B',to:'C'},{from:'C',to:'A'},{from:'C',to:'D'}],path:['A'],badges:['edge stack empty']}}),
    eventFrame(lesson,'edgeStack.push','走 Tree Edges A-B、B-C','兩條 edge push 到 DFS edge stack；disc A1,B2,C3。',{stack:['A-B','B-C'],disc:['A1','B2','C3'],operation:'push tree edges'},{executionView:table('EDGE STACK + LOWLINK',['vertex','disc','low'],[['A','1','1'],['B','2','2'],['C','3','3']],2,['stack A-B · B-C'])}),
    eventFrame(lesson,'disc[v]<disc[u]','C→A 是 Back Edge','push C-A，low[C]=min(3,disc[A]=1)=1。',{edge:'C-A',lowC:'3→1',stack:['A-B','B-C','C-A'],operation:'back edge lowers low'},{executionView:{kind:'network',title:'BACK EDGE LOW UPDATE',nodes:graphNodes.slice(0,4),edges:[{from:'A',to:'B',active:true},{from:'B',to:'C',active:true},{from:'C',to:'A',active:true},{from:'C',to:'D'}],path:['C','A'],badges:['low(C)=1']}}),
    eventFrame(lesson,'popBlockUntil','回到 A：low[B]=1 ≥ disc[A]=1','從 stack pop 到 A-B，得到 block {A-B,B-C,C-A}。',{block:['A-B','B-C','C-A'],operation:'emit triangle block'},{executionView:table('BICONNECTED BLOCK 1',['popped edge','block'],[['C-A','B1'],['B-C','B1'],['A-B','B1']],2,['triangle block'])}),
    eventFrame(lesson,'low[v]>=disc[u]','C→D 的子樹 low[D]=4 ≥ disc[C]=3','Bridge C-D 自己形成另一個 edge-biconnected block。',{block:['C-D'],operation:'emit bridge block'},{executionView:table('BCC RESULT',['block','edges'],[['B1','AB BC CA'],['B2','CD']],1,['2 blocks'])}),
  ],

  'block-cut-tree':lesson=>[
    eventFrame(lesson,'findBiconnectedComponents','原圖 Blocks：B1={A,B,C}, B2={C,D,E}','C 同時出現在兩個 block，所以 C 是 articulation vertex。',{blocks:['B1:A,B,C','B2:C,D,E'],articulation:'C',operation:'compute blocks'},{executionView:{kind:'network',title:'ORIGINAL GRAPH + BLOCKS',nodes:graphNodes.slice(0,5),edges:[{from:'A',to:'B'},{from:'B',to:'C'},{from:'C',to:'A'},{from:'C',to:'D'},{from:'D',to:'E'},{from:'E',to:'C'}],path:['C'],badges:['C articulation']}}),
    eventFrame(lesson,'createBlockNode','每個 BCC 建一個 Block Node','建立方形節點 B1、B2。',{blockNodes:['B1','B2'],operation:'create block nodes'},{executionView:structure('BLOCK NODES',[{id:'B1',label:'B1',x:320,y:210,meta:'A,B,C',active:true},{id:'B2',label:'B2',x:680,y:210,meta:'C,D,E',active:true}],[],['2 blocks'])}),
    eventFrame(lesson,'createArticulationNode','為 C 建 Articulation Node','非 articulation 原頂點不必在 block-cut tree 中單獨建點。',{artNode:'C',operation:'create articulation node'},{executionView:structure('ADD ARTICULATION NODE',[{id:'B1',label:'B1',x:250,y:210},{id:'C',label:'C',x:500,y:210,meta:'cut vertex',active:true},{id:'B2',label:'B2',x:750,y:210}],[],['C'])}),
    eventFrame(lesson,'addEdge(blockNode','連 B1-C、C-B2','Block-cut graph 必為 tree（對每個 connected component）。',{edges:['B1-C','C-B2'],operation:'connect memberships'},{executionView:structure('BLOCK-CUT TREE',[{id:'B1',label:'B1',x:250,y:210,meta:'A,B,C'},{id:'C',label:'C',x:500,y:210,meta:'articulation',active:true},{id:'B2',label:'B2',x:750,y:210,meta:'C,D,E'}],[{from:'B1',to:'C',active:true},{from:'C',to:'B2',active:true}],['tree'])}),
  ],

  'offline-dynamic-connectivity':lesson=>[
    eventFrame(lesson,'addInterval','Timeline t=0..4：Edge AB 活躍 [0,3)，BC 活躍 [1,4)','先把每條 edge 的 active lifetime 丟到時間 Segment Tree 的 O(log Q) buckets。',{lifetimes:['AB:[0,3)','BC:[1,4)'],operation:'place edge intervals'},{executionView:table('EDGE LIFETIMES',['edge','start','end'],[['AB','0','3'],['BC','1','4']],undefined,['offline intervals'])}),
    eventFrame(lesson,'bucket[node]','時間樹 Bucket 分解','AB [0,3) 會放到能完全覆蓋其 lifetime 的幾個 time nodes；BC 同理。',{operation:'segment time intervals'},{executionView:structure('TIME SEGMENT TREE',[{id:'04',label:'[0,4)',x:500,y:70},{id:'02',label:'[0,2)',x:300,y:190,meta:'AB'},{id:'24',label:'[2,4)',x:700,y:190},{id:'01',label:'[0,1)',x:200,y:330},{id:'12',label:'[1,2)',x:400,y:330,meta:'BC'},{id:'23',label:'[2,3)',x:620,y:330,meta:'AB·BC'},{id:'34',label:'[3,4)',x:800,y:330,meta:'BC'}],[{from:'04',to:'02'},{from:'04',to:'24'},{from:'02',to:'01'},{from:'02',to:'12'},{from:'24',to:'23'},{from:'24',to:'34'}],['edge buckets'])}),
    eventFrame(lesson,'dsu.snapshot','進入 [2,3) 前記錄 Rollback Snapshot','沿 root→leaf 已 union 該路徑 buckets；到 t=2 時 AB、BC 都存在，所以 A,B,C 連通。',{time:2,sets:['{A,B,C}'],operation:'apply unions on path'},{executionView:table('ROLLBACK DSU AT t=2',['applied edges','components','query A~C'],[['AB, BC','{A,B,C}','YES']],0,['snapshot'])}),
    eventFrame(lesson,'answerQueriesAt','Leaf t=3：AB 已失效，只剩 BC','Rollback 離開 t=2 branch，再進 t=3 branch；A 不再與 C 連通。',{time:3,sets:['{A}','{B,C}'],operation:'answer leaf query'},{executionView:table('AT t=3',['active edges','components','A~C'],[['BC','{A} {B,C}','NO']],0,['time-local state'])}),
    eventFrame(lesson,'dsu.rollback','離開 Branch 時 Rollback 到 Snapshot','撤銷本 branch 的 parent/size mutations，不影響 sibling time interval。',{operation:'rollback branch state'},{executionView:table('ROLLBACK LOG',['mutation','undo'],[['parent[C]=B','restore C'],['size[B]+=size[C]','restore size']],undefined,['persistent-by-rollback'])}),
  ],

  'suffix-automaton':lesson=>[
    eventFrame(lesson,'newState(len[last]+1)','對字串 "ababa" 逐字 Extend','先有 state0(len0)。加入 a 建 state1(len1)，轉移 0-a→1，link1=0。',{text:'ababa',operation:'extend a'},{executionView:structure('SUFFIX AUTOMATON · "a"',[{id:'0',label:'0',x:240,y:210,meta:'len0'},{id:'1',label:'1',x:620,y:210,meta:'len1',active:true}],[{from:'0',to:'1',label:'a',active:true}],['link 1→0'])}),
    eventFrame(lesson,'while(p!=-1','加入 b：沿 Suffix Links 補 Transition','state1 沒有 b：加 1-b→2；state0 也沒有 b：加 0-b→2；link2=0。',{operation:'add missing transitions'},{executionView:structure('EXTEND "b"',[{id:'0',label:'0',x:150,y:210},{id:'1',label:'1',x:430,y:100},{id:'2',label:'2',x:720,y:210,meta:'len2',active:true}],[{from:'0',to:'1',label:'a'},{from:'1',to:'2',label:'b',active:true},{from:'0',to:'2',label:'b',active:true}],['link 2→0'])}),
    eventFrame(lesson,'len[p]+1==len[q]','加入下一個 a：遇到既有 q 且長度連續','從 state2 加 a→3；沿 link 到0 時 0 已有 a→1，且 len0+1=len1，所以 link3=1，不需 clone。',{cur:3,link:1,operation:'direct suffix link'},{executionView:structure('NO CLONE CASE',[{id:'0',label:'0',x:120,y:220},{id:'1',label:'1',x:350,y:100,meta:'len1'},{id:'2',label:'2',x:580,y:220,meta:'len2'},{id:'3',label:'3',x:820,y:100,meta:'len3',active:true}],[{from:'0',to:'1',label:'a'},{from:'1',to:'2',label:'b'},{from:'2',to:'3',label:'a',active:true},{from:'3',to:'1',label:'link',dashed:true}],['link cur→q'])}),
    eventFrame(lesson,'cloneState','Clone Case 的必要條件','若遇到 transition p-c→q 但 len[p]+1<len[q]，複製 q 的 transitions，clone.len=len[p]+1。',{operation:'create clone state'},{executionView:structure('CLONE SPLITS ENDPOS CLASS',[{id:'p',label:'p',x:180,y:220},{id:'q',label:'q',x:650,y:100,meta:'old len'},{id:'cl',label:'clone',x:650,y:310,meta:'shorter len',active:true},{id:'cur',label:'cur',x:850,y:220}],[{from:'p',to:'cl',label:'c',active:true},{from:'cl',to:'q',label:'copied transitions',dashed:true},{from:'cur',to:'cl',label:'link',dashed:true}],['redirect transitions'])}),
    eventFrame(lesson,'link[q]=link[cur]=clone','Redirect + Re-link 維持 Automaton Minimality','q 與 cur 的 suffix link 都改到 clone；沿 suffix links 繼續把指向 q 的 c transition 改到 clone。',{operation:'finish clone repair'},{executionView:table('SAM INVARIANTS',['state','len','suffix link'],[['q','long','clone'],['cur','new longest','clone'],['clone','len[p]+1','old link(q)']],undefined,['≤2n−1 states'])}),
  ],

  'palindromic-tree':lesson=>[
    eventFrame(lesson,'int cur=last','字串 "ababa"；兩個 Root len=-1 與 len=0','last 一開始指 len0 root。加入位置0的 a。',{text:'ababa',pos:0,operation:'start extension'},{executionView:structure('EERTREE ROOTS',[{id:'neg',label:'-1',x:270,y:210,meta:'odd root'},{id:'zero',label:'0',x:500,y:210,meta:'even root',active:true}], [{from:'zero',to:'neg',label:'suffix link',dashed:true}],['add a'])}),
    eventFrame(lesson,'while(s[pos-len[cur]-1]','len0 Root 無法包 a → Follow Link 到 -1','-1 root 保證 s[pos-(-1)-1]=s[pos]，所以找到可擴張 suffix。',{cur:'0→-1',operation:'suffix-link fallback'},{executionView:structure('FIND EXTENDABLE SUFFIX',[{id:'neg',label:'-1',x:300,y:210,active:true},{id:'zero',label:'0',x:650,y:210}],[{from:'zero',to:'neg',label:'link',active:true,dashed:true}],['fallback'])}),
    eventFrame(lesson,'newNode(len[cur]+2)','建立 Palindrome Node "a"，len=1','next[-1][a] 指到新 node；它的 suffix link 指 len0 root。',{palindrome:'a',len:1,operation:'create first palindrome'},{executionView:structure('CREATE "a"',[{id:'neg',label:'-1',x:160,y:230},{id:'zero',label:'0',x:390,y:230},{id:'a',label:'a',x:700,y:230,meta:'len1',active:true}],[{from:'neg',to:'a',label:'a',active:true},{from:'a',to:'zero',label:'suffix',dashed:true}],['new node'])}),
    eventFrame(lesson,'last=next[cur]','掃到第三字元 a 時建立 "aba"','目前 longest pal suffix 是 b；用兩側 a 包住得到新 palindrome aba，len=3。',{pos:2,palindrome:'aba',operation:'extend longest suffix'},{executionView:structure('CREATE "aba"',[{id:'a',label:'a',x:260,y:100,meta:'len1'},{id:'b',label:'b',x:260,y:320,meta:'len1'},{id:'aba',label:'aba',x:700,y:210,meta:'len3',active:true}],[{from:'b',to:'aba',label:'a...a',active:true},{from:'aba',to:'a',label:'suffix',dashed:true}],['one new palindrome'])}),
    eventFrame(lesson,'link[now]=','完成 "ababa"','不同 palindrome nodes 為 a,b,aba,bab,ababa；每次 add 最多新增一個 node。',{nodes:['a','b','aba','bab','ababa'],operation:'finish eertree'},{executionView:table('PALINDROME NODES',['node','len','suffix link'],[['a','1','0'],['b','1','0'],['aba','3','a'],['bab','3','b'],['ababa','5','aba']],4,['5 distinct palindromes'])}),
  ],

  'suffix-tree':lesson=>[
    eventFrame(lesson,'for(char c:text)','建 "aba$" 的 Compressed Suffix Tree','唯一終止符 $ 讓每個 suffix 都成為顯式 leaf。',{text:'aba$',operation:'initialize Ukkonen'},{executionView:structure('SUFFIX TREE TARGET',[{id:'root',label:'root',x:150,y:210},{id:'aba',label:'aba$',x:720,y:80},{id:'ba',label:'ba$',x:720,y:210},{id:'a',label:'a$',x:720,y:330},{id:'d',label:'$',x:720,y:400}],[{from:'root',to:'aba',label:'aba$'},{from:'root',to:'ba',label:'ba$'},{from:'root',to:'a',label:'a$'},{from:'root',to:'d',label:'$'}],['compressed edges'])}),
    eventFrame(lesson,'createLeaf','加入第一個 a：Root 無 a Edge → 建 Leaf','edge label 不複製字串，而保存 text index interval [0,end)。',{edge:'root-a...',label:'[0,end)',remaining:1,operation:'create first leaf'},{executionView:structure('EXTENSION "a"',[{id:'root',label:'root',x:250,y:210},{id:'leaf0',label:'leaf0',x:720,y:210,meta:'[0,end)',active:true}],[{from:'root',to:'leaf0',label:'a…',active:true}],['leaf'])}),
    eventFrame(lesson,'nextCharMatches','加入第三字元 a：Existing Edge Match → Rule 3','activeLength++ 並提前停止本 phase；remaining suffixes 保留到下一字元。',{activeNode:'root',activeEdge:'a',activeLength:1,operation:'rule 3'} ,{executionView:table('ACTIVE POINT',['active node','edge','length','remaining'],[['root','a…','1','1']],0,['rule 3'])}),
    eventFrame(lesson,'splitEdgeAndCreateLeaf','加入 $ 時 Match 失敗 → Split Edge','在 a|ba… 中間建 internal node，舊 leaf 掛剩餘 ba$，新 leaf 掛 $。',{operation:'edge split'},{executionView:structure('EDGE SPLIT',[{id:'root',label:'root',x:170,y:210},{id:'int',label:'internal',x:470,y:210,meta:'edge "a"',active:true},{id:'old',label:'old leaf',x:780,y:110,meta:'ba$'},{id:'new',label:'new leaf',x:780,y:310,meta:'$'}],[{from:'root',to:'int',label:'a',active:true},{from:'int',to:'old',label:'ba$'},{from:'int',to:'new',label:'$',active:true}],['split + leaf'])}),
    eventFrame(lesson,'updateSuffixLinks','Suffix Link 連 Internal Nodes','完成所有 remaining suffix extension；每個 leaf 對應 aba$、ba$、a$、$。',{suffixes:['aba$','ba$','a$','$'],operation:'finish all suffixes'},{executionView:table('EXPLICIT SUFFIX LEAVES',['suffix start','suffix'],[['0','aba$'],['1','ba$'],['2','a$'],['3','$']],undefined,['all suffixes explicit'])}),
  ],

  'berlekamp-massey':lesson=>[
    eventFrame(lesson,'vector<long long> C','Sequence Fibonacci 0,1,1,2,3,5','C=[1]、B=[1]、L=0、m=1、b=1。',{sequence:['0','1','1','2','3','5'],L:0,operation:'initialize BM'},{executionView:table('BERLEKAMP–MASSEY STATE',['n','s[n]','L','C(x)','B(x)','d'],[['start','','0','1','1','']],0,['find shortest recurrence'])}),
    eventFrame(lesson,'long long d=s[n]','n=1：Discrepancy d=1','目前 recurrence L=0 預測 0，但 s1=1，所以 d=1。',{n:1,d:1,operation:'compute discrepancy'},{executionView:table('DISCREPANCY',['n','actual','predicted','d'],[['1','1','0','1']],0,['nonzero correction'])}),
    eventFrame(lesson,'C-=coef','用 B 修正 C','coef=d/b=1；C ← 1 - x。因 2L≤n，更新 L=2? 對 Fibonacci indexing 經下一次 correction 最終會到 L=2。',{C:'1-x',operation:'polynomial correction'},{executionView:table('CONNECTION POLYNOMIAL UPDATE',['before C','coef·x^m·B','after C'],[['1','x','1-x']],0,['correction'])}),
    eventFrame(lesson,'if(2*L<=n)','保存舊 C 到 B 並調整 L/m/b','這是「目前 recurrence 長度不足」時的結構性更新。',{operation:'increase recurrence length'},{executionView:table('L UPDATE',['field','new value'],[['L','2'],['B','previous C'],['b','current d'],['m','1']],undefined,['new recurrence order'])}),
    eventFrame(lesson,'d==0','後續 Fibonacci Terms Discrepancy 變 0','最終 C 對應 s[n]=s[n-1]+s[n-2]，最短 recurrence length L=2。',{L:2,C:'1 - x - x²',operation:'verify recurrence'},{executionView:table('BM RESULT',['L','recurrence'],[['2','s[n]=s[n-1]+s[n-2]']],0,['minimal recurrence'])}),
  ],

  'gaussian-elimination':lesson=>[
    eventFrame(lesson,'for(int col=0','Augmented Matrix：x+y=3，2x-y=0','開始矩陣 [[1,1|3],[2,-1|0]]。',{operation:'initialize system'},{executionView:{kind:'matrix',title:'GAUSSIAN ELIMINATION',colLabels:['x','y','rhs'],rowLabels:['R1','R2'],cells:[['1','1','3'],['2','-1','0']],badges:['2 equations']}}),
    eventFrame(lesson,'argmaxAbs','Column x 選最大 Pivot：R2 的 2','使用 partial pivoting，sel=R2。',{pivot:'R2C0',operation:'select pivot'},{executionView:{kind:'matrix',title:'PIVOT SELECTION',colLabels:['x','y','rhs'],rowLabels:['R1','R2'],cells:[['1','1','3'],['2','-1','0']],pivot:'1,0',activeCells:['1,0'],badges:['pivot 2']}}),
    eventFrame(lesson,'swap(A[sel],A[row])','Swap R1 ↔ R2','矩陣變 [[2,-1|0],[1,1|3]]。',{operation:'row swap'},{executionView:{kind:'matrix',title:'ROW SWAP',colLabels:['x','y','rhs'],rowLabels:['R1','R2'],cells:[['2','-1','0'],['1','1','3']],activeCells:['0,0'],badges:['R1↔R2']}}),
    eventFrame(lesson,'divideRow','Normalize Pivot Row ÷2','R1=[1,-0.5|0]。',{operation:'normalize row'},{executionView:{kind:'matrix',title:'NORMALIZE PIVOT',colLabels:['x','y','rhs'],rowLabels:['R1','R2'],cells:[['1','-0.5','0'],['1','1','3']],activeCells:['0,0','0,1','0,2'],badges:['R1 / 2']}}),
    eventFrame(lesson,'eliminate','R2 ← R2 - R1','得到 R2=[0,1.5|3]；再 normalize y pivot 得 y=2，回消得 x=1。',{operation:'eliminate below'},{executionView:{kind:'matrix',title:'ROW REDUCTION',colLabels:['x','y','rhs'],rowLabels:['R1','R2'],cells:[['1','0','1'],['0','1','2']],activeCells:['0,2','1,2'],badges:['RREF']}}),
    eventFrame(lesson,'classifyByRank','Rank=2=Variables，唯一解','x=1、y=2；若出現 [0,0|nonzero] 則無解，若 rank<variables 則無限多解。',{rank:2,result:['x=1','y=2'],operation:'classify solution'},{executionView:table('SOLUTION CLASSIFICATION',['rank(A)','rank([A|b])','variables','result'],[['2','2','2','unique']],0,['x=1','y=2'])}),
  ],

  'profile-dp':lesson=>[
    eventFrame(lesson,'dp[0][0]=1','2×3 Grid Domino Tiling','W=3，mask 的最低位代表目前 cell 是否已由上一個 vertical domino 佔用。',{H:2,W:3,mask:'000',operation:'initialize frontier'},{executionView:table('PROFILE DP · FRONTIER',['pos','cell','mask','ways'],[['0','(0,0)','000','1']],0,['2×3 domino tiling'])}),
    eventFrame(lesson,'if(mask&1)','若 bit0=1：當前格已填','直接 shift mask>>1，移到下一格，不放新 domino。',{mask:'001→000',operation:'consume occupied cell'},{executionView:table('OCCUPIED CELL',['before mask','action','after mask'],[['001','shift','000']],0,['no placement'])}),
    eventFrame(lesson,'placeVertical','mask bit0=0：可放 Vertical','若下一 row 存在，vertical 會讓下一層相同 column 的 frontier bit 設為 1。',{placement:'vertical',mask:'000→100 (after shift convention)',operation:'vertical placement'},{executionView:table('VERTICAL TRANSITION',['cell','placement','next frontier'],[['(0,0)','vertical','future bit set']],0,['local transition'])}),
    eventFrame(lesson,'canHorizontal','也可放 Horizontal','若同 row 下一格也空，兩格一起覆蓋，mask 消耗兩個位置。',{placement:'horizontal',operation:'horizontal placement'},{executionView:table('HORIZONTAL TRANSITION',['cells','placement','next'],[['(0,0),(0,1)','horizontal','skip two cells']],0,['branch'])}),
    eventFrame(lesson,'for(int mask','逐 Cell / Mask 推進','2×3 最終 dp[6][0]=3；只有 frontier mask 回到 0 才代表完整 tiling。',{result:3,operation:'finish profile dp'},{executionView:table('PROFILE DP RESULT',['final pos','mask','ways'],[['6','000','3']],0,['3 tilings'])}),
  ],

  'convex-hull-trick':lesson=>[
    eventFrame(lesson,'addLine','加入 Lines y=5x+0、3x+4、1x+10','Slope 單調下降；維護 lower envelope。',{lines:['5x','3x+4','x+10'],operation:'initialize monotone lines'},{executionView:{kind:'geometry',title:'CONVEX HULL TRICK · LINES',points:[{id:'O',x:120,y:350,label:'x=0'},{id:'X',x:850,y:350,label:'x'}],segments:[{from:'O',to:'X',label:'5x'},{from:'O',to:'X',label:'3x+4'},{from:'O',to:'X',label:'x+10'}],badges:['lower envelope']}}),
    eventFrame(lesson,'redundant','檢查中間 Line 是否 Redundant','比較相鄰交點；若 (5x) 與 (3x+4) 的交點不早於 (3x+4) 與 (x+10)，中線永遠不最優就 pop。',{operation:'intersection-order test'},{executionView:table('REDUNDANCY TEST',['pair','intersection x'],[['5x vs 3x+4','2'],['3x+4 vs x+10','3']],undefined,['2 < 3 → keep'])}),
    eventFrame(lesson,'lines.push_back','Envelope 保存三條線','每條線只被 push/pop 一次。',{envelope:['5x','3x+4','x+10'],operation:'append line'},{executionView:table('LOWER ENVELOPE',['segment of x','best line'],[['x<2','5x?'],['2..3','3x+4'],['x>3','x+10']],undefined,['monotone breakpoints'])}),
    eventFrame(lesson,'query(long long x)','Query x=4','值分別 20、16、14，最優是 y=x+10=14。',{x:4,values:['20','16','14'],operation:'evaluate candidate lines'},{executionView:table('QUERY x=4',['line','value'],[['5x','20'],['3x+4','16'],['x+10','14']],2,['minimum 14'])}),
    eventFrame(lesson,'++ptr','Monotone Query x 只增時 Pointer 只向右','ptr 從較陡線逐步移向較平線，總查詢可攤銷 O(1)。',{ptr:'advance to line x+10',result:14,operation:'advance envelope pointer'},{executionView:table('CHT RESULT',['x','chosen line','dp value'],[['4','x+10','14']],0,['pointer monotone'])}),
  ],

  'slope-trick':lesson=>[
    eventFrame(lesson,'priority_queue','從 Convex Function f(x)=0 開始','left/right heaps 保存 breakpoint，minValue 保存最小函數值，minimizer interval 初始整條實線。',{minValue:0,operation:'initialize convex PL function'},{executionView:table('SLOPE TRICK STATE',['min f','left heap','right heap','argmin'],[['0','∅','∅','(-∞,+∞)']],0,['convex function'])}),
    eventFrame(lesson,'addAbs','加入 |x-3|','breakpoint 3 同時進 left/right；min 仍 0，argmin={3}。',{a:3,minValue:0,argmin:'[3,3]',operation:'add absolute value'},{executionView:table('ADD |x-3|',['min f','L max','R min','argmin'],[['0','3','3','[3,3]']],0,['V shape'])}),
    eventFrame(lesson,'addAbs','再加入 |x-7|','函數 |x-3|+|x-7| 在 [3,7] 皆取最小值4。',{a:7,minValue:4,argmin:'[3,7]',operation:'widen minimizer interval'},{executionView:table('ADD |x-7|',['min f','left top','right top','argmin'],[['4','3','7','[3,7]']],0,['flat minimum'])}),
    eventFrame(lesson,'shift(long long l','Shift Operation [l,r]=[2,2]','把函數圖形平移 2：breakpoint offsets addL/addR 都 +2，argmin 變 [5,9]。',{shift:2,argmin:'[5,9]',operation:'lazy shift breakpoints'},{executionView:table('SHIFT FUNCTION',['before argmin','shift','after argmin','min f'],[['[3,7]','+2','[5,9]','4']],0,['lazy offsets'])}),
    eventFrame(lesson,'minValue','Heaps + Lazy Offsets 足以描述整個 Convex Function','不需要顯式存每個線段；每次 breakpoint operation 只做 heap push/pop。',{minValue:4,argmin:'[5,9]',operation:'finish slope trick state'},{executionView:table('SLOPE TRICK RESULT',['min value','minimizer interval'],[['4','[5,9]']],0,['piecewise-linear convex'])}),
  ],
}

export const applyS3CoreOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  const build=overrides[lesson.id]
  if(!build) return lesson
  const coded={...lesson,code:codeOverrides[lesson.id]}
  return {...coded,frames:build(coded),traceMode:'execution',animationVersion:2,fidelity:'concrete'}
}
export const s3CoreOverrideIds=Object.freeze(Object.keys(overrides))
