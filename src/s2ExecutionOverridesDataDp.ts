import type { AlgorithmLesson, Frame, Point } from './algorithms'
import { eventFrame } from './traceAuthoring'

type TraceBuilder=(lesson:AlgorithmLesson)=>Frame[]

const gridDpSnapshots = [
  [['1','—','—'],['—','—','—'],['—','—','—']],
  [['1','4','5'],['—','—','—'],['—','—','—']],
  [['1','4','5'],['2','—','—'],['—','—','—']],
  [['1','4','5'],['2','7','—'],['—','—','—']],
  [['1','4','5'],['2','7','6'],['6','8','7']],
]
const gridDpView = (step:number):NonNullable<Frame['executionView']> => ({
  kind:'matrix',title:'GRID DP · minimum path cost',cells:gridDpSnapshots[Math.min(step,4)],
  rowLabels:['0','1','2'],colLabels:['0','1','2'],
  activeCells:step===5?['0,0','0,1','0,2','1,2','2,2']:step===0?['0,0']:step===1?['0,1','0,2']:step===2?['1,0']:step===3?['1,1']:[],
})
const chainView = (step:number):NonNullable<Frame['executionView']> => ({
  kind:'matrix',title:'MATRIX CHAIN · dp[l][r) scalar multiplications',
  rowLabels:['l=0','l=1','l=2'],colLabels:['r=0','r=1','r=2','r=3'],
  cells:[['—','0',step>=1?'1500':'—',step>=4?'4500':step===3?'27000':'—'],
    ['—','—','0',step>=1?'9000':'—'],['—','—','—','0']],
  activeCells:step===1?['0,2','1,3']:step>=3?['0,3']:[],
})
const fenwick2DView = (step:number):NonNullable<Frame['executionView']> => {
  const cells = Array.from({length:4},()=>Array(4).fill('0') as string[])
  if(step>=1) cells[1][2]='5'
  if(step>=2) cells[1][3]='5'
  if(step>=3) { cells[3][2]='5'; cells[3][3]='5' }
  return {kind:'matrix',title:'2D FENWICK · bit[i][j]',rowLabels:['1','2','3','4'],colLabels:['1','2','3','4'],cells,
    activeCells:step===1?['1,2']:step===2?['1,3']:step===3?['3,2','3,3']:step===5?['2,2','2,1']:step===6?['1,2','1,1']:[],
    badges:step>=4?[`prefix(3,3) · s=${step===6?5:0}`]:[],}
}
const intervalView = (step:number):NonNullable<Frame['executionView']> => ({
  kind:'matrix',title:'INTERVAL DP · dp[l][r] score difference',
  rowLabels:['l=0','l=1','l=2','l=3'],colLabels:['r=0','r=1','r=2','r=3'],
  cells:[
    [step>=1?'4':'—',step>=2?'3':'—',step>=4?'-1':'—',step>=4?'10':'—'],
    ['—',step>=1?'7':'—',step>=3?'5':'—',step>=4?'4':'—'],
    ['—','—',step>=1?'2':'—',step>=3?'7':'—'],
    ['—','—','—',step>=1?'9':'—'],
  ],
  activeCells:step===1?['0,0','1,1','2,2','3,3']:step===2?['0,1']:step===3?['1,2','2,3']:step>=4?['0,3']:[],
})

const treePoints:Point[]=[
  {id:'A',x:12,y:46,label:'A'},{id:'B',x:34,y:22,label:'B'},
  {id:'C',x:34,y:76,label:'C'},{id:'D',x:60,y:16,label:'D'},
  {id:'E',x:60,y:48,label:'E'},{id:'F',x:86,y:16,label:'F'},
]
const treeEdges=[
  {from:'A',to:'B'},{from:'A',to:'C'},{from:'B',to:'D'},
  {from:'B',to:'E'},{from:'D',to:'F'},
]
const treeDpView=(step:number):NonNullable<Frame['executionView']>=>{
  const value:Record<string,string>={A:step>=0?'dp 1':'—',B:'—',C:'—',D:'—',E:'—',F:'—'}
  if(step>=2) value.B='dp 1'
  if(step>=4) value.D='dp 1'
  if(step>=6) value.F='dp 1'
  if(step>=7) value.D='dp 2'
  if(step>=8) value.B='dp 3'
  if(step>=10) value.E='dp 1'
  if(step>=11) value.B='dp 4'
  if(step>=12) value.A='dp 5'
  if(step>=14) value.C='dp 1'
  if(step>=15) value.A='dp 6'
  const stacks=[
    ['A'],['A','B'],['A','B'],['A','B','D'],['A','B','D'],['A','B','D','F'],
    ['A','B','D','F'],['A','B','D'],['A','B'],['A','B','E'],['A','B','E'],
    ['A','B'],['A'],['A','C'],['A','C'],['A'],
  ]
  const activeEdges=new Set(stacks[Math.min(step,15)].slice(1).map((node,index)=>{
    const parent=stacks[Math.min(step,15)][index]
    return parent+node
  }))
  return {
    kind:'network',title:'TREE DP · subtree size · postorder execution',
    nodes:treePoints.map(p=>({id:p.id,label:p.id,x:p.x*10,y:p.y*4.3,value:value[p.id]})),
    edges:treeEdges.map(e=>({from:e.from,to:e.to,active:activeEdges.has(e.from+e.to)})),
    badges:[`call stack = ${stacks[Math.min(step,15)].join(' → ')}`,step===15?'dp[A] = 6 · all subtree sizes complete':'先算 child，return 後才 merge'],
    path:stacks[Math.min(step,15)],
  }
}

const codeOverrides:Record<string,string[]>={
  'digit-dp':[
    'long long dfs(int pos,bool tight,bool started,int mod){',
    '  if(pos==digits.size()) return started && mod==0;',
    '  if(!tight && memoKnown(pos,started,mod)) return memo[pos][started][mod];',
    '  long long ans=0;',
    '  int hi=tight?digits[pos]:9;',
    '  for(int d=0;d<=hi;++d)',
    '    ans+=dfs(pos+1,tight&&d==hi,started||d,(mod+d)%3);',
    '  if(!tight) memo[pos][started][mod]=ans;',
    '  return ans;',
    '}',
  ],
  'tree-dp':[
    'void dfs(int u,int p) {',
    '  dp[u]=1;',
    '  for (int v:tree[u]) {',
    '    if (v==p) continue;',
    '    dfs(v,u);',
    '    dp[u]+=dp[v];',
    '  }',
    '}',
  ],
  'rerooting-dp':[
    'void dfs1(int u,int p) {',
    '  subtree[u]=1;',
    '  for(int v:tree[u]) if(v!=p) {',
    '    depth[v]=depth[u]+1;',
    '    dfs1(v,u);',
    '    subtree[u]+=subtree[v];',
    '  }',
    '}',
    'void dfs2(int u,int p) {',
    '  for(int v:tree[u]) if(v!=p) {',
    '    answer[v]=answer[u]+n-2*subtree[v];',
    '    dfs2(v,u);',
    '  }',
    '}',
    'dfs1(root,-1);',
    'answer[root]=sum(depth.begin(),depth.end());',
    'dfs2(root,-1);',
  ],
  'divide-conquer-dp':[
    'long long cost(int l,int r){ long long s=prefix[r]-prefix[l]; return s*s; }',
    'void solve(int l,int r,int optL,int optR) {',
    '  if(l>r) return;',
    '  int mid=(l+r)/2;',
    '  pair<long long,int> best={INF,-1};',
    '  for(int j=optL;j<=min(mid-1,optR);++j)',
    '    best=min(best,{prev[j]+cost(j,mid),j});',
    '  cur[mid]=best.first; opt[mid]=best.second;',
    '  solve(l,mid-1,optL,opt[mid]);',
    '  solve(mid+1,r,opt[mid],optR);',
    '}',
  ],
  'knuth-optimization':[
    'for(int i=0;i<n;++i) opt[i][i+1]=i+1;',
    'for(int len=2;len<=n;++len)',
    '  for(int l=0;l+len<=n;++l) {',
    '    int r=l+len; dp[l][r]=INF;',
    '    for(int k=opt[l][r-1];k<=opt[l+1][r];++k) {',
    '      long long cand=dp[l][k]+dp[k][r]+rangeSum(l,r);',
    '      if(cand<dp[l][r]) dp[l][r]=cand,opt[l][r]=k;',
    '    }',
    '  }',
  ],
  'dag-dp':[
    'for(int u:topologicalOrder) {',
    '  for(auto [v,w]:g[u]) {',
    '    dp[v]=max(dp[v],dp[u]+w);',
    '  }',
    '}',
  ],

  'probability-dp':[
    'dp[0][0]=1.0;',
    'for(int i=0;i<n;++i)',
    '  for(int h=0;h<=i;++h) {',
    '    dp[i+1][h]+=dp[i][h]*(1-p[i]);',
    '    dp[i+1][h+1]+=dp[i][h]*p[i];',
    '  }',
    'double answer=0;',
    'for(int h=n/2+1;h<=n;++h) answer+=dp[n][h];',
  ],

  'dp-reconstruction':[
    'for(int i=1;i<=n;++i) {',
    '  dp[i]=dp[i-1]; take[i]=false;',
    '  if(value[i]+dp[prev[i]]>dp[i]) dp[i]=value[i]+dp[prev[i]],take[i]=true;',
    '}',
    'vector<int> chosen;',
    'for(int i=n;i>0;)',
    '  if(take[i]) chosen.push_back(i),i=prev[i]; else --i;',
  ],

  'monotone-queue-optimization':[
    'deque<int> dq;',
    'for(int i=0;i<n;++i) {',
    '  while(!dq.empty() && dq.front()<i-K) dq.pop_front();',
    '  dp[i]=value[i]+(dq.empty()?0:dp[dq.front()]);',
    '  while(!dq.empty() && dp[dq.back()]<=dp[i]) dq.pop_back();',
    '  dq.push_back(i);',
    '}',
  ],

  'aliens-optimization':[
    'long long solve(long long lambda,int& groups) {',
    '  dp[0]=0; cnt[0]=0;',
    '  for(int i=1;i<=n;++i) {',
    '    dp[i]=INF;',
    '    for(int j=0;j<i;++j)',
    '      if(dp[j]+cost(j+1,i)+lambda<dp[i]) dp[i]=dp[j]+cost(j+1,i)+lambda,cnt[i]=cnt[j]+1;',
    '  }',
    '  groups=cnt[n]; return dp[n];',
    '}',
    'while(lo<hi){ long long mid=(lo+hi)/2; int groups; solve(mid,groups); if(groups>K) lo=mid+1; else hi=mid; }',
  ],

}

const lessonOverrides:Record<string,Partial<AlgorithmLesson>>={
  'knapsack-01':{visual:'dp'},
  'digit-dp':{visual:'dp'},
  'tree-dp':{visual:'tree',points:treePoints,edges:treeEdges},
  'rerooting-dp':{visual:'tree',points:treePoints,edges:treeEdges},
  'divide-conquer-dp':{visual:'dp'},
  'knuth-optimization':{visual:'dp'},
  'fibonacci-dp':{visual:'dp'},
  'unbounded-knapsack':{visual:'dp'},
  'subset-sum':{visual:'dp'},
  'fenwick-tree-2d':{visual:'range'},
  'iterative-segment-tree':{visual:'range'},
  'dynamic-segment-tree':{visual:'range'},
  'merge-sort-tree':{visual:'range'},
  'disjoint-sparse-table':{visual:'range'},
  'cartesian-tree':{visual:'range'},
  'grid-dp':{visual:'dp'},
  'matrix-chain-multiplication':{visual:'dp'},
  'interval-dp':{visual:'dp'},
  'dag-dp':{visual:'dp'},
  'probability-dp':{visual:'dp'},
  'dp-reconstruction':{visual:'dp'},
  'monotone-queue-optimization':{visual:'dp'},
  'aliens-optimization':{visual:'dp'},
}

const overrides:Record<string,TraceBuilder>={
  'knapsack-01':lesson=>[
    eventFrame(lesson,'vector<int> dp','W=7，DP 全 0','物品只有兩件：(w=3,v=5)、(w=4,v=6)。dp[c] 是容量不超過 c 的最大價值。',{W:7,items:['(3,5)','(4,6)'],dp:['0','0','0','0','0','0','0','0'],operation:'initialize knapsack'}),
    eventFrame(lesson,'for (auto [weight,value]','處理 Item (3,5)','容量必須由 7 往 3 反向掃，避免同一件物品在本輪被重複使用。',{item:'(3,5)',direction:'7→3',operation:'start item'}),
    eventFrame(lesson,'dp[w]=max','w=7：dp[7]=5','max(old 0, dp[4]+5=5)=5。',{item:'(3,5)',w:7,choices:['0','dp[4]+5=5'],result:5,operation:'relax capacity'}),
    eventFrame(lesson,'dp[w]=max','第一件完成：dp[3..7]=5','因為是反向掃，讀到的 dp[w-3] 都還是「未使用此物品」的舊狀態。',{dp:['0','0','0','5','5','5','5','5'],operation:'finish first item'}),
    eventFrame(lesson,'for (int w=W','處理 Item (4,6)，仍反向','先看 w=7，這次 dp[3] 已代表只使用第一件的合法狀態。',{item:'(4,6)',direction:'7→4',operation:'start second item'}),
    eventFrame(lesson,'dp[w]=max','w=7：選兩件得到 11','max(dp[7]=5, dp[3]+6=11)=11。',{w:7,choices:['5','5+6=11'],result:11,operation:'combine distinct items'}),
    eventFrame(lesson,'dp[w]=max','w=6,5,4 更新為 6','第二件單獨可提供價值 6；最終 dp=[0,0,0,5,6,6,6,11]。',{dp:['0','0','0','5','6','6','6','11'],operation:'finish capacity row'}),
    eventFrame(lesson,'return dp[W]','回傳 11','容量 7 正好選重量 3 與 4，各一次，價值 5+6=11。',{result:11,selected:['(3,5)','(4,6)'],operation:'return answer'}),
  ],

  'digit-dp':lesson=>[
    eventFrame(lesson,'long long dfs','計算 1..25 中 Digit Sum ≡ 0 mod 3','digits=[2,5]，state=目前 digit sum mod 3；started=false 用來排除數字 0。',{N:25,digits:['2','5'],state:'sum mod 3',operation:'define digit DP'}),
    eventFrame(lesson,'int hi=tight?digits[pos]:9','pos=0, tight=true，所以 hi=2','第一位只能選 0、1、2。',{pos:0,tight:'true',hi:2,operation:'set digit upper bound'}),
    eventFrame(lesson,'for(int d=0;d<=hi','選 d=0：進入 Loose Branch','0<2，因此下一位 tight=false；它代表所有一位數 1..9。數位和可被 3 整除的是 3,6,9，共 3 個。',{d:0,next:'pos1,tight=false,started=false,mod0',branchCount:3,operation:'enumerate leading zero branch'}),
    eventFrame(lesson,'ans+=dfs','選 d=1：Loose，Mod=1','第二位可選 0..9；要 (1+d)%3=0，因此 d=2,5,8，對應 12,15,18，共 3 個。',{d:1,validSuffix:['2','5','8'],numbers:['12','15','18'],branchCount:3,operation:'count loose state'}),
    eventFrame(lesson,'ans+=dfs','選 d=2：仍 Tight','第二位上限為 5；要 (2+d)%3=0，合法 d=1,4，得到 21、24。',{d:2,nextTight:'true',validSuffix:['1','4'],numbers:['21','24'],branchCount:2,operation:'count tight state'}),
    eventFrame(lesson,'if(pos==digits.size())','Base Case 只接受 Started 且 Mod=0','0 不會被計入；每個完整數字在唯一 digit path 到達 base。',{acceptRule:'started && mod==0',operation:'terminal acceptance'}),
    eventFrame(lesson,'return ans','總數 = 3+3+2 = 8','答案為 {3,6,9,12,15,18,21,24}。',{result:8,numbers:['3','6','9','12','15','18','21','24'],operation:'return count'}),
  ],

  'fenwick-tree-2d':lesson=>[
    eventFrame(lesson,'void add(int x,int y','在 4×4 BIT 執行 add(2,3,+5)','兩維都以 1-based lowbit 跳躍。',{size:'4×4',point:'(2,3)',delta:5,operation:'start point update'}),
    eventFrame(lesson,'bit[i][j]+=v','i=2,j=3：bit[2][3]+=5','j 下一步加 lowbit(3)=1，變 4。',{i:2,j:3,cell:'bit[2][3]',value:'0→5',operation:'update first cell'}),
    eventFrame(lesson,'bit[i][j]+=v','i=2,j=4：bit[2][4]+=5','j=4 再加 4 會超界；接著 i=2+2=4。',{i:2,j:4,cell:'bit[2][4]',value:'0→5',operation:'update row ancestor'}),
    eventFrame(lesson,'bit[i][j]+=v','i=4：更新 [4][3] 與 [4][4]','最後四個被改到的 BIT cell 是 (2,3),(2,4),(4,3),(4,4)。',{cells:['(2,3)','(2,4)','(4,3)','(4,4)'],operation:'finish nested update'}),
    eventFrame(lesson,'long long prefix(int x,int y)','查 Prefix(3,3)','x 方向走 3→2→0；每個 x 下 y 方向走 3→2→0。',{query:'prefix(3,3)',xPath:['3','2'],yPath:['3','2'],operation:'start prefix query'}),
    eventFrame(lesson,'s+=bit[i][j]','讀 (3,3),(3,2)：都是 0','這兩個查詢到的 BIT 儲存格都是 0，因此目前 prefix 累加值仍維持 s=0。',{cells:['(3,3)=0','(3,2)=0'],sum:0,operation:'accumulate first x row'}),
    eventFrame(lesson,'s+=bit[i][j]','i=2：bit[2][3]=5','再讀 bit[2][2]=0，所以 prefix(3,3)=5。',{cells:['(2,3)=5','(2,2)=0'],sum:5,operation:'finish prefix'}),
  ].map((frame,step)=>({...frame,executionView:fenwick2DView(step)})),

  'tree-dp':lesson=>[
    eventFrame(lesson,'dp[u]=1;','進入 A：先設 dp[A]=1','subtree size 的 base contribution 是節點自己，所以 dfs(A,-1) 一進來先執行 dp[A]=1。',{u:'A',dpA:1,operation:'initialize A'},{active:['A']}),
    eventFrame(lesson,'dfs(v,u);','A 呼叫 Child B','for 看到 B，B 不是 parent，因此真正執行 dfs(B,A)；A 必須等待 B return，不能先加 dp[B]。',{call:'A→B',operation:'descend to B'},{active:['A','B']}),
    eventFrame(lesson,'dp[u]=1;','進入 B：dp[B]=1','新的 stack frame B 先計入自己。',{u:'B',dpB:1,operation:'initialize B'},{active:['B']}),
    eventFrame(lesson,'dfs(v,u);','B 呼叫 Child D','B 掃到 D，執行 dfs(D,B)；dp[B] 此時仍是 1。',{call:'B→D',dpB:1,operation:'descend to D'},{active:['B','D']}),
    eventFrame(lesson,'dp[u]=1;','進入 D：dp[D]=1','D 先計入自己，再繼續找非 parent child。',{u:'D',dpD:1,operation:'initialize D'},{active:['D']}),
    eventFrame(lesson,'dfs(v,u);','D 呼叫 Child F','F 不是 parent B，所以 D 執行 dfs(F,D)。',{call:'D→F',operation:'descend to F'},{active:['D','F']}),
    eventFrame(lesson,'dp[u]=1;','F 是 Leaf：dp[F]=1 後 Return','F 的唯一鄰居是 parent D，會被 continue 掉；沒有 child call，也沒有 dp merge，所以直接 return。',{u:'F',dpF:1,leaf:true,operation:'leaf return'},{active:['F'],accepted:['F']}),
    eventFrame(lesson,'dp[u]+=dp[v];','F Return：D 合併 dp[F]','回到 D 的 dfs(F,D) 下一行，才執行 dp[D]+=dp[F]：1+1=2。',{u:'D',v:'F',formula:'1+1',dpD:2,operation:'merge F into D'},{active:['D','F'],accepted:['F']}),
    eventFrame(lesson,'dp[u]+=dp[v];','D Return：B 合併 dp[D]','D 已完成整個 subtree 並 return；回到 B 後執行一次 dp[B]+=dp[D]：1+2=3。',{u:'B',v:'D',formula:'1+2',dpB:3,operation:'merge D into B'},{active:['B','D'],accepted:['D','F']}),
    eventFrame(lesson,'dfs(v,u);','B 再呼叫 Child E','B 的下一個非 parent child 是 E。此時 dp[B]=3，先遞迴求 E，再決定要加多少。',{call:'B→E',dpB:3,operation:'descend to E'},{active:['B','E'],accepted:['D','F']}),
    eventFrame(lesson,'dp[u]=1;','E 是 Leaf：dp[E]=1 後 Return','E 除了 parent B 沒有其他 child，因此 dp[E]=1 就是完整答案。',{u:'E',dpE:1,leaf:true,operation:'leaf E return'},{active:['E'],accepted:['D','E','F']}),
    eventFrame(lesson,'dp[u]+=dp[v];','E Return：B 再合併一次','現在才執行第二次 dp[B]+=dp[v]：3+1=4。這和上一個 D merge 是兩次不同的 Code execution。',{u:'B',v:'E',formula:'3+1',dpB:4,operation:'merge E into B'},{active:['B','E'],accepted:['D','E','F']}),
    eventFrame(lesson,'dp[u]+=dp[v];','B Return：A 合併 dp[B]','B 的 children 全處理完，dp[B]=4 後 return；A 接著執行 dp[A]+=4，所以 1→5。',{u:'A',v:'B',formula:'1+4',dpA:5,operation:'merge B into A'},{active:['A','B'],accepted:['B','D','E','F']}),
    eventFrame(lesson,'dfs(v,u);','A 接著呼叫 Child C','A 的 B branch 完整 return 後才輪到 C；執行 dfs(C,A)，此時 dp[A]=5。',{call:'A→C',dpA:5,operation:'descend to C'},{active:['A','C'],accepted:['B','D','E','F']}),
    eventFrame(lesson,'dp[u]=1;','C 是 Leaf：dp[C]=1 後 Return','C 沒有非 parent child，因此完整 subtree size 就是 1。',{u:'C',dpC:1,leaf:true,operation:'leaf C return'},{active:['C'],accepted:['B','C','D','E','F']}),
    eventFrame(lesson,'dp[u]+=dp[v];','C Return：A 得到最終 dp[A]=6','最後一次 merge 執行 dp[A]+=dp[C]：5+1=6。此時所有 child 都完成，Root A 的 subtree size 等於整棵樹 6 個節點。',{u:'A',v:'C',formula:'5+1',dpA:6,result:'A6 B4 C1 D2 E1 F1',operation:'finish root DP'},{active:['A','C'],accepted:['A','B','C','D','E','F']}),
  ].map((frame,step)=>({...frame,executionView:treeDpView(step)})),

  'rerooting-dp':lesson=>[
    eventFrame(lesson,'dfs1(root,-1)','第一遍以 A 為 Root','同一棵 6 點樹，先求 subtree size 與 depth：A0,B1,C1,D2,E2,F3。',{root:'A',depth:'A0 B1 C1 D2 E2 F3',subtree:'A6 B4 C1 D2 E1 F1',operation:'first DFS'},{active:['A','B','C','D','E','F']}),
    eventFrame(lesson,'answer[root]=sum','A 作 Root 的距離總和 = 9','0+1+1+2+2+3=9。',{root:'A',answerA:9,operation:'base root answer'},{active:['A'],accepted:['A']}),
    eventFrame(lesson,'answer[v]=answer[u]+n-2*subtree[v]','Reroot A→B：9+6-2·4=7','移到 B 時，B 子樹內 4 個點各近 1，其餘 2 點各遠 1，淨變化 6-8=-2。',{edge:'A→B',formula:'9+6-8',answerB:7,operation:'reroot to B'},{active:['A','B'],accepted:['A','B']}),
    eventFrame(lesson,'answer[v]=answer[u]+n-2*subtree[v]','A→C：得到 13','C 子樹只有 1 點，9+6-2=13。',{edge:'A→C',answerC:13,operation:'reroot to C'},{active:['A','C'],accepted:['A','B','C']}),
    eventFrame(lesson,'answer[v]=answer[u]+n-2*subtree[v]','B→D：7+6-4=9','D 子樹大小 2，answer[D]=9。',{edge:'B→D',answerD:9,operation:'reroot to D'},{active:['B','D']}),
    eventFrame(lesson,'answer[v]=answer[u]+n-2*subtree[v]','B→E 得 11，D→F 得 13','所有 root answer 都只需從父答案 O(1) 推出。',{answers:['A=9','B=7','C=13','D=9','E=11','F=13'],operation:'finish all roots'},{accepted:['A','B','C','D','E','F']}),
  ],

  'divide-conquer-dp':lesson=>[
    eventFrame(lesson,'long long cost','具體 Recurrence：分組平方和 Cost','a=[1,2,3,4]，prefix=[0,1,3,6,10]；上一層 prev[j]=prefix[j]^2=[0,1,9,36,100]。',{a:['1','2','3','4'],prefix:['0','1','3','6','10'],prev:['0','1','9','36','100'],operation:'define concrete cost'}),
    eventFrame(lesson,'int mid=(l+r)/2','solve(2,4,1,3)：mid=3','先算中間狀態 i=3，再用 best[3] 縮左右候選範圍。',{range:'[2,4]',optRange:'[1,3]',mid:3,operation:'choose midpoint'}),
    eventFrame(lesson,'best=min','mid=3，測 j=1','prev[1]+(prefix3-prefix1)^2 = 1+(6-1)^2=26。',{mid:3,j:1,candidate:26,operation:'evaluate candidate'}),
    eventFrame(lesson,'best=min','mid=3，測 j=2：18 更好','9+(6-3)^2=18，所以 opt[3]=2。',{mid:3,j:2,candidate:18,best:2,operation:'set optimal split'}),
    eventFrame(lesson,'solve(l,mid-1','左半 solve(2,2,1,2)','因 opt 單調，左半上界可縮到 best=2；實際 j=1 得 cur[2]=1+(3-1)^2=5。',{state:'i=2',allowed:'j=1',cur2:5,opt2:1,operation:'solve left half'}),
    eventFrame(lesson,'solve(mid+1,r','右半 solve(4,4,2,3)','只測 j=2,3：58 vs 52，因此 cur[4]=52、opt[4]=3。',{state:'i=4',candidates:['j2=58','j3=52'],cur4:52,opt4:3,operation:'solve right half'}),
    eventFrame(lesson,'cur[mid]=best.first','這層結果 opt = [1,2,3] 單調','cur[2]=5,cur[3]=18,cur[4]=52；候選區間確實沿 best[mid] 分裂。',{cur:['i2=5','i3=18','i4=52'],opt:['1','2','3'],operation:'finish optimized layer'}),
  ],

  'knuth-optimization':lesson=>[
    eventFrame(lesson,'opt[i][i+1]','Weights = [3,1,4,1]，Base Opt','用經典區間合併 recurrence：dp[l][r]=min(dp[l][k]+dp[k][r]+sum(l,r))。單元素成本 0。',{weights:['3','1','4','1'],base:'dp[i][i+1]=0',operation:'initialize intervals'}),
    eventFrame(lesson,'for(int len=2','Len=2：先算最短非平凡區間','dp[0][2]=4,opt=1；dp[1][3]=5,opt=2；dp[2][4]=5,opt=3。',{len:2,dp:['[0,2]=4','[1,3]=5','[2,4]=5'],opt:['1','2','3'],operation:'build length 2'}),
    eventFrame(lesson,'for(int k=opt[l][r-1]','區間 [0,3] 的候選界是 k=1..2','由 opt[0][2]=1 與 opt[1][3]=2 直接夾住，不必掃其他 k。',{interval:'[0,3]',bounds:'1..2',operation:'Knuth bounds'}),
    eventFrame(lesson,'long long cand','[0,3]：k=1 得 13，k=2 得 12','sum[0,3]=8；選 k=2，所以 dp=12,opt=2。',{interval:'[0,3]',candidates:['k1:0+5+8=13','k2:4+0+8=12'],best:'k=2',operation:'choose split'}),
    eventFrame(lesson,'long long cand','[1,4]：k=2 與 3 都得 11','依 tie 規則保留 k=2，因此 opt[1][4]=2。',{interval:'[1,4]',candidates:['k2=11','k3=11'],best:'k=2',operation:'finish length 3'}),
    eventFrame(lesson,'for(int k=opt[l][r-1]','Full [0,4] 候選被夾成只有 k=2','opt[0][3]=2 且 opt[1][4]=2，所以只測一個切點。',{interval:'[0,4]',bounds:'2..2',operation:'tight Knuth window'}),
    eventFrame(lesson,'if(cand<dp[l][r])','Full Cost = 4+5+9 = 18','dp[0][4]=18,opt=2；Knuth 將這類 O(n³) 區間 DP 的總候選壓到 O(n²)。',{result:18,opt:2,operation:'finish Knuth DP'}),
  ],

  'iterative-segment-tree':lesson=>[
    eventFrame(lesson,'tree[i]=tree[i<<1]','由 Leaves 向上 Build','a=[2,5,1,4,9,3,7,6] 存在 tree[8..15]；例如 tree[4]=2+5=7，tree[1]=37。',{leaves:['2','5','1','4','9','3','7','6'],root:37,operation:'build flat tree'},{values:[2,5,1,4,9,3,7,6]}),
    eventFrame(lesson,'long long query','Query 半開區間 [1,6)','初始 l=1+8=9、r=6+8=14、ans=0。',{query:'[1,6)',l:9,r:14,ans:0,operation:'initialize iterative query'},{values:[2,5,1,4,9,3,7,6],low:1,high:5}),
    eventFrame(lesson,'if(l&1)','l=9 為右 Child：取 tree[9]=5','取完 l++→10；r=14 是偶數，不取。',{l:9,take:'tree[9]=5',ans:'0→5',operation:'consume left boundary'},{active:['1']}),
    eventFrame(lesson,'l>>=1,r>>=1','兩端上移：l=5,r=7','現在對應更大的區間節點。',{l:'10→5',r:'14→7',ans:5,operation:'move upward'}),
    eventFrame(lesson,'if(l&1)','l=5 為右 Child：取 tree[5]=5','tree[5] 代表原陣列 [2,4)={1,4}，ans=10。',{take:'[2,4) sum5',ans:'5→10',operation:'take left block'},{active:['2','3']}),
    eventFrame(lesson,'if(r&1)','r=7 為 Odd：先 --r=6，取 tree[6]=12','tree[6] 代表 [4,6)={9,3}，ans=22。',{take:'[4,6) sum12',ans:'10→22',operation:'take right block'},{active:['4','5']}),
    eventFrame(lesson,'} return ans','上移後 l=r=3，回傳 22','被選節點 [1,2)、[2,4)、[4,6) 互不重疊且恰覆蓋查詢。',{result:22,cover:['[1,2)','[2,4)','[4,6)'],operation:'return range sum'},{accepted:['1','2','3','4','5']}),
  ],

  'dynamic-segment-tree':lesson=>[
    eventFrame(lesson,'void add(Node*& p','座標域 [0,16)，Add x=11,+5','Root 一開始是 null；只沿包含 x=11 的單一路徑開節點。',{domain:'[0,16)',x:11,delta:5,operation:'start sparse update'}),
    eventFrame(lesson,'if(!p) p=new Node','配置 Root [0,16)','null 子樹等價於全 0；第一次進入才 new Node。',{created:'[0,16)',sum:0,operation:'allocate root'}),
    eventFrame(lesson,'if(x<m) add','mid=8，11≥8 → 走右側 [8,16)','左子樹 [0,8) 保持 null。',{interval:'[0,16)',mid:8,next:'[8,16)',operation:'choose right child'}),
    eventFrame(lesson,'if(x<m) add','[8,16) mid=12，11<12 → [8,12)','接著 mid=10 走右側 [10,12)，再 mid=11 走右側 [11,12)。',{path:['[8,16)','[8,12)','[10,12)','[11,12)'],operation:'descend sparse path'}),
    eventFrame(lesson,'p->sum+=delta','到 Leaf [11,12)：sum 0→5','只有這個 leaf 儲存實際 point value。',{leaf:'[11,12)',sum:'0→5',operation:'write leaf'}),
    eventFrame(lesson,'p->sum=sum(p->left)+sum(p->right)','回程 Pull 所有新祖先','[10,12)、[8,12)、[8,16)、[0,16) 的 sum 都變 5；未開的 sibling 視為 0。',{pulled:['[10,12)=5','[8,12)=5','[8,16)=5','[0,16)=5'],nodesCreated:5,operation:'pull sparse ancestors'}),
  ],

  'merge-sort-tree':lesson=>[
    eventFrame(lesson,'int countLE','Query positions [1,7)，count value ≤4','a=[2,5,1,4,9,3,7,6]；每個 Segment Tree Node 內部向量已排序。',{query:'[1,7), x=4',operation:'start value-range query'},{values:[2,5,1,4,9,3,7,6],low:1,high:6}),
    eventFrame(lesson,'if(qr<=l || r<=ql)','Root [0,8) 部分重疊，繼續拆','左右兩邊都需要查。',{node:'[0,8)',relation:'partial',operation:'split root'}),
    eventFrame(lesson,'return upper_bound','Node [1,2) 完整包含：vector=[5]','upper_bound(4) 在開頭，所以貢獻 0。',{node:'[1,2)',sorted:['5'],countLE4:0,operation:'binary search node'}),
    eventFrame(lesson,'return upper_bound','Node [2,4)：vector=[1,4]','兩個值都 ≤4，貢獻 2。',{node:'[2,4)',sorted:['1','4'],countLE4:2,operation:'count full node'}),
    eventFrame(lesson,'return upper_bound','Node [4,6)：vector=[3,9]','只有 3≤4，貢獻 1。',{node:'[4,6)',sorted:['3','9'],countLE4:1,operation:'count full node'}),
    eventFrame(lesson,'return upper_bound','Node [6,7)：vector=[7]','7>4，貢獻 0；[7,8) 完全相離直接回 0。',{node:'[6,7)',countLE4:0,operation:'finish right fringe'}),
    eventFrame(lesson,'return countLE','合併 0+2+1+0 = 3','查詢區間中符合 ≤4 的值是 1、4、3。',{result:3,valuesLE:['1','4','3'],operation:'aggregate counts'},{accepted:['2','3','5']}),
  ],

  'disjoint-sparse-table':lesson=>[
    eventFrame(lesson,'build suffix to midpoint','Array [2,5,1,4,9,3,7,6]','以 Sum 為 op。對最高相關層 block [0,8)，mid=4，建立左 suffix 與右 prefix。',{array:['2','5','1','4','9','3','7','6'],mid:4,operation:'build disjoint summaries'},{values:[2,5,1,4,9,3,7,6]}),
    eventFrame(lesson,'build suffix to midpoint','Left Suffix：suffix[2]=1+4=5','對左半 [0,4)，從中點向左累積；query l=2 會直接讀到 [2,4) 的和 5。',{leftHalf:'[0,4)',suffixAt2:5,covered:'[2,4)',operation:'build suffix'}),
    eventFrame(lesson,'build prefix from midpoint','Right Prefix：prefix[6]=9+3+7=19','對右半 [4,8)，從中點向右累積；r=6 會讀到 [4,6] 的和 19。',{rightHalf:'[4,8)',prefixAt6:19,covered:'[4,6]',operation:'build prefix'}),
    eventFrame(lesson,'int k=msb(l^r)','Query [2,6]：2 XOR 6 = 4，MSB=2','這一層正是 l、r 第一次位於中點兩側的 block。',{l:2,r:6,xor:4,k:2,operation:'choose disjoint level'}),
    eventFrame(lesson,'return suffix[k][l] op prefix[k][r]','只合併兩個預算值：5+19=24','[2,3] 與 [4,6] 完全不相交，聯集恰為 [2,6]。',{left:5,right:19,result:24,operation:'constant-time query'},{values:[2,5,1,4,9,3,7,6],low:2,high:6,accepted:['2','3','4','5','6']}),
  ],

  'cartesian-tree':lesson=>[
    eventFrame(lesson,'vector<int> st','輸入 a=[3,1,4,2]','要維持 index 中序順序與 min-heap value；stack 保存目前右脊。',{a:['3','1','4','2'],stack:[],operation:'initialize Cartesian tree'},{values:[3,1,4,2]}),
    eventFrame(lesson,'st.push_back(i)','i=0,value=3：直接 Push','stack=[0(3)]。',{i:0,stack:['0(3)'],operation:'push first node'},{active:['0']}),
    eventFrame(lesson,'a[st.back()]>a[i]','i=1,value=1：Pop 0','3>1，所以 0 會變成新節點 1 的左子樹。',{i:1,popped:'0(3)',last:0,operation:'pop greater spine'},{active:['0','1']}),
    eventFrame(lesson,'left[i]=last; st.push_back(i)','設定 left[1]=0，Push 1','stack=[1(1)]；value 1 成為目前 root。',{left1:0,stack:['1(1)'],operation:'attach left subtree'},{active:['0','1'],accepted:['1']}),
    eventFrame(lesson,'right[st.back()]=i','i=2,value=4：不 Pop，right[1]=2','1<4，所以 2 接在右脊尾端。',{i:2,parent:1,right1:2,stack:['1(1)','2(4)'],operation:'attach right child'},{active:['1','2']}),
    eventFrame(lesson,'a[st.back()]>a[i]','i=3,value=2：Pop 2(4)','last=2；此時 stack top 1 的 value=1≤2，停止。',{i:3,popped:'2(4)',last:2,stack:['1(1)'],operation:'pop right spine'}),
    eventFrame(lesson,'right[st.back()]=i; left[i]=last','設定 right[1]=3、left[3]=2','最終 root=1(value1)，左 child=0(value3)，右 child=3(value2)，3 的左 child=2(value4)。',{root:'1(value1)',edges:['1→0 left','1→3 right','3→2 left'],operation:'finish Cartesian tree'},{accepted:['0','1','2','3']}),
  ],

  'fibonacci-dp':lesson=>[
    eventFrame(lesson,'long long prev2=0,prev1=1','計算 F(7)：初值 F0=0,F1=1','只保留前兩項即可。',{n:7,prev2:0,prev1:1,operation:'initialize rolling states'}),
    eventFrame(lesson,'long long cur=prev1+prev2','i=2：cur=1','1+0=1，接著 prev2=1,prev1=1。',{i:2,cur:1,next:['prev2=1','prev1=1'],operation:'compute F2'}),
    eventFrame(lesson,'long long cur=prev1+prev2','i=3：cur=2','由前兩個 rolling state 相加得到 F3=1+1=2，下一輪會把這個 2 往前推成新的 prev1。',{i:3,cur:2,operation:'compute F3'}),
    eventFrame(lesson,'prev2=prev1; prev1=cur','i=4,5 依序得到 3、5','每輪先算 cur，再把 rolling window 向前推。',{steps:['F4=3','F5=5'],prev2:3,prev1:5,operation:'roll states'}),
    eventFrame(lesson,'long long cur=prev1+prev2','i=6 得 8；i=7 得 13','最後 prev1=13。',{steps:['F6=8','F7=13'],operation:'finish recurrence'}),
    eventFrame(lesson,'return n?prev1:prev2','回傳 13','每個 Fibonacci 狀態只算一次，O(n) time / O(1) space。',{result:13,operation:'return Fibonacci'}),
  ],

  'unbounded-knapsack':lesson=>[
    eventFrame(lesson,'dp[0]=0','W=7，Exact-Capacity DP','items=(3,5),(4,6)，dp[0]=0，其餘 -INF；同一物品可重複使用。',{W:7,items:['(3,5)','(4,6)'],dp:['0','-∞','-∞','-∞','-∞','-∞','-∞','-∞'],operation:'initialize unbounded knapsack'}),
    eventFrame(lesson,'for(int cap=weight;cap<=W','Item (3,5) 要正向掃 3→7','正向掃讓本輪剛更新的 dp[3] 可以被 dp[6] 再使用。',{item:'(3,5)',direction:'3→7',operation:'forward capacity order'}),
    eventFrame(lesson,'dp[cap]=max','cap=3：dp[3]=5','由 dp[0]+5。',{cap:3,result:5,operation:'take one copy'}),
    eventFrame(lesson,'dp[cap]=max','cap=6：讀到本輪 dp[3]=5，再加一件','dp[6]=10，這就是同一物品重複兩次。',{cap:6,formula:'dp[3]+5=10',result:10,operation:'reuse same item'}),
    eventFrame(lesson,'for(int cap=weight;cap<=W','處理 Item (4,6)','cap=4 得 6；cap=7 可以讀 dp[3]=5，得到 11。',{item:'(4,6)',updates:['dp4=6','dp7=11'],operation:'process second item'}),
    eventFrame(lesson,'dp[cap]=max','Final dp[7]=11','最優 exact weight 7 是 3+4，value=5+6=11。',{dp:['0','-∞','-∞','5','6','-∞','10','11'],result:11,operation:'finish unbounded DP'}),
  ],

  'subset-sum':lesson=>[
    eventFrame(lesson,'can[0]=true','Target S=11，初始只有 Sum 0 Reachable','a=[3,5,6]。',{a:['3','5','6'],S:11,reachable:['0'],operation:'initialize reachable sums'}),
    eventFrame(lesson,'for(int sum=S;sum>=x','處理 x=3，反向掃','由 can[0] 產生 can[3]=true；因為反向，這一輪不會再拿剛生成的 3 去做 6。',{x:3,reachable:['0','3'],operation:'take 3 once'}),
    eventFrame(lesson,'can[sum] = can[sum] || can[sum-x]','處理 x=5','由舊 reachable {0,3} 新增 5 與 8。',{x:5,before:['0','3'],after:['0','3','5','8'],operation:'add shifted states'}),
    eventFrame(lesson,'for(int sum=S;sum>=x','處理 x=6','從 sum=11 往下掃；can[11] 讀 can[5]=true，所以 11 立刻可達。',{x:6,sum:11,source:5,newReachable:11,operation:'reach target'}),
    eventFrame(lesson,'can[sum] = can[sum] || can[sum-x]','完成 x=6','另外新增 6、9；最終 reachable={0,3,5,6,8,9,11}。',{reachable:['0','3','5','6','8','9','11'],operation:'finish subset states'}),
    eventFrame(lesson,'for(int x:a)','Target 11 可達','具體 subset 是 {5,6}；每個元素最多被使用一次。',{target:11,result:'true',subset:['5','6'],operation:'report reachability'}),
  ],
  'grid-dp':lesson=>[
    eventFrame(lesson,'dp[0][0]=grid[0][0]','3×3 Cost Grid','grid=[[1,3,1],[1,5,1],[4,2,1]]，只能向右或向下。',{grid:['1 3 1','1 5 1','4 2 1'],dp00:1,operation:'initialize start'}),
    eventFrame(lesson,'if(c) dp[r][c]=min','先填第 0 列','row-major 會先算 (0,1)=1+3=4，再算 (0,2)=4+1=5；這一列只能從左邊來。',{row0:['1','4','5'],operation:'fill top row'}),
    eventFrame(lesson,'if(r) dp[r][c]=min','再算 (1,0)','第 0 列完成後才進入 r=1；(1,0) 只能從上方來，dp[1][0]=1+1=2。',{cell:'(1,0)',value:2,operation:'from top'}),
    eventFrame(lesson,'if(c) dp[r][c]=min','算中心 (1,1)','從上：4+5=9；從左：2+5=7，因此 dp[1][1]=7。',{cell:'(1,1)',choices:['9','7'],value:7,operation:'choose min predecessor'}),
    eventFrame(lesson,'if(c) dp[r][c]=min','填完整張表','最終 dp=[[1,4,5],[2,7,6],[6,8,7]]。',{dp:['1 4 5','2 7 6','6 8 7'],operation:'finish grid'}),
    eventFrame(lesson,'return dp[h-1][w-1]','右下角答案 7','路徑 1→3→1→1→1，總成本 7。',{answer:7,path:['(0,0)','(0,1)','(0,2)','(1,2)','(2,2)'],operation:'return'}),
  ].map((frame,step)=>({...frame,executionView:gridDpView(step)})),

  'matrix-chain-multiplication':lesson=>[
    eventFrame(lesson,'for(int len=2','矩陣尺寸 10×30, 30×5, 5×60','dim=[10,30,5,60]，三個矩陣。',{dim:['10','30','5','60'],operation:'define chain'}),
    eventFrame(lesson,'dp[l][r]=min','長度 2 的區間','A1A2 成本 10*30*5=1500；A2A3 成本 30*5*60=9000。',{dp:['dp[0][2]=1500','dp[1][3]=9000'],operation:'solve short intervals'}),
    eventFrame(lesson,'for(int k=l+1','求整段 [0,3)','有兩個最後切點 k=1 或 k=2。',{interval:'[0,3)',splits:['k=1','k=2'],operation:'enumerate split'}),
    eventFrame(lesson,'dp[l][r]=min','k=1：A1 | (A2A3)','0 + 9000 + 10*30*60 = 27000。',{k:1,cost:27000,operation:'evaluate split'}),
    eventFrame(lesson,'dp[l][r]=min','k=2：(A1A2) | A3','1500 + 0 + 10*5*60 = 4500。',{k:2,cost:4500,operation:'evaluate split'}),
    eventFrame(lesson,'return dp[0][n]','答案 4500','最佳括號化是 (A1A2)A3。',{answer:4500,parenthesization:'(A1A2)A3',operation:'finish'}),
  ].map((frame,step)=>({...frame,executionView:chainView(step)})),

  'interval-dp':lesson=>[
    eventFrame(lesson,'for(int len=1','取數遊戲 a=[4,7,2,9]','dp[l][r] 表示目前玩家相對對手能取得的最大分差。',{a:['4','7','2','9'],operation:'define interval state'}),
    eventFrame(lesson,'if(l==r)','長度 1 Base','dp[i][i]=a[i]，所以對角線是 4,7,2,9。',{diag:['4','7','2','9'],operation:'base intervals'}),
    eventFrame(lesson,'dp[l][r]=max','算 [0,1]','max(4-dp[1][1]= -3, 7-dp[0][0]=3)=3。',{interval:'[0,1]',choices:['4-7=-3','7-4=3'],value:3,operation:'choose endpoint'}),
    eventFrame(lesson,'dp[l][r]=max','算完長度 2 的區間','依 l 遞增，先得 dp[1][2]=5，最後 dp[2][3]=7。',{interval:'[2,3]',value:7,operation:'finish length two'}),
    eventFrame(lesson,'dp[l][r]=max','逐長度擴張到 [0,3]','長度 3 得 dp[0][2]=-1、dp[1][3]=4；長度 4 得 dp[0][3]=10。',{interval:'[0,3]',value:10,operation:'finish table'}),
    eventFrame(lesson,'return dp[0][n-1]','分差 10','第一手可保證比對手多 10 分。',{answer:10,operation:'return game value'}),
  ].map((frame,step)=>({...frame,executionView:intervalView(step)})),

  'dag-dp':lesson=>[
    eventFrame(lesson,'for(int u:topologicalOrder','DAG order=A,B,C,D','邊 A→B(2), A→C(5), B→D(4), C→D(1)，dp[A]=0，其餘 -∞。',{order:['A','B','C','D'],edges:['A-B:2','A-C:5','B-D:4','C-D:1'],operation:'initialize DAG'}),
    eventFrame(lesson,'dp[v]=max','處理 A→B','dp[B]=max(-∞,0+2)=2。',{edge:'A→B',update:'B:-∞→2',operation:'relax'}),
    eventFrame(lesson,'dp[v]=max','處理 A→C','dp[C]=5。',{edge:'A→C',update:'C:-∞→5',operation:'relax'}),
    eventFrame(lesson,'dp[v]=max','處理 B→D','dp[D]=2+4=6。',{edge:'B→D',update:'D:-∞→6',operation:'relax'}),
    eventFrame(lesson,'dp[v]=max','處理 C→D','候選 5+1=6，與現值相同。',{edge:'C→D',candidate:6,current:6,operation:'relax'}),
    eventFrame(lesson,'for(int u:topologicalOrder','拓樸序完成','最長路值 A0,B2,C5,D6；因所有前驅在 u 前已處理，所以 dp[u] 不會再被回頭修改。',{result:['A0','B2','C5','D6'],operation:'finish DAG DP'}),
  ],

  'probability-dp':lesson=>[
    eventFrame(lesson,'dp[0][0]=1.0','三次硬幣 p=[0.5,0.6,0.7]','dp[i][h] 是前 i 次出現 h 個正面的機率。',{p:['0.5','0.6','0.7'],state:'dp[i][heads]',operation:'initialize'}),
    eventFrame(lesson,'dp[i+1][h]+=','第一枚硬幣出反面','dp[1][0]+=1*(1-0.5)=0.5。',{transition:'tail',value:0.5,operation:'add tail probability'}),
    eventFrame(lesson,'dp[i+1][h+1]+=','第一枚硬幣出正面','dp[1][1]+=1*0.5=0.5。',{transition:'head',value:0.5,operation:'add head probability'}),
    eventFrame(lesson,'dp[i+1][h+1]+=','完成第二枚','dp[2]=[0.2,0.5,0.3]。',{row:['0.20','0.50','0.30'],operation:'finish row 2'}),
    eventFrame(lesson,'dp[i+1][h+1]+=','完成第三枚','dp[3]=[0.06,0.29,0.44,0.21]。',{row:['0.06','0.29','0.44','0.21'],operation:'finish row 3'}),
    eventFrame(lesson,'for(int h=n/2+1','加總多數正面 h≥2','answer=0.44+0.21=0.65。',{terms:['P(2)=0.44','P(3)=0.21'],answer:'0.65',operation:'sum target states'}),
  ],

  'dp-reconstruction':lesson=>[
    eventFrame(lesson,'dp[i]=dp[i-1]','Weighted intervals 已按 End 排序','jobs 1..4，value=[4,5,4,7]，prev=[0,0,1,2]。',{values:['4','5','4','7'],prev:['0','0','1','2'],operation:'initialize reconstruction DP'}),
    eventFrame(lesson,'if(value[i]+dp[prev[i]]','i=1：Take','4+dp0=4 > skip0，所以 dp1=4、take1=true。',{i:1,skip:0,take:4,dp:4,operation:'choose take'}),
    eventFrame(lesson,'if(value[i]+dp[prev[i]]','i=2：Take','5+dp0=5 > dp1=4，所以 dp2=5。',{i:2,skip:4,take:5,dp:5,operation:'choose take'}),
    eventFrame(lesson,'if(value[i]+dp[prev[i]]','i=3：Take job3 + job1','4+dp1=8 > dp2=5，因此 dp3=8。',{i:3,skip:5,take:8,dp:8,operation:'choose take'}),
    eventFrame(lesson,'if(value[i]+dp[prev[i]]','i=4：Take job4 + dp2','7+5=12 >8，所以 dp4=12。',{i:4,skip:8,take:12,dp:12,operation:'choose take'}),
    eventFrame(lesson,'if(take[i])','回溯 i=4','take4=true，選 job4，跳到 prev4=2。',{i:4,chosen:['4'],next:2,operation:'reconstruct take'}),
    eventFrame(lesson,'if(take[i])','回溯 i=2','take2=true，選 job2，跳到 0；重建完成。',{chosen:['4','2'],answer:12,operation:'finish reconstruction'}),
  ],

  'monotone-queue-optimization':lesson=>[
    eventFrame(lesson,'deque<int> dq','K=2，value=[3,-1,4,2,5]','dp[i]=value[i]+max dp[j]，其中 j∈[i-K,i-1]；Deque 保存 dp 遞減的索引。',{K:2,value:['3','-1','4','2','5'],deque:[],operation:'initialize'}),
    eventFrame(lesson,'dp[i]=value[i]','i=0','dq 空，所以 dp0=3，之後 push 0。',{i:0,dp0:3,deque:['0(3)'],operation:'compute first'}),
    eventFrame(lesson,'dp[i]=value[i]','i=1','front=0，所以 dp1=-1+3=2；2<3，push 後 [0(3),1(2)]。',{i:1,dp1:2,deque:['0(3)','1(2)'],operation:'extend window'}),
    eventFrame(lesson,'while(!dq.empty() && dp[dq.back()]<=dp[i])','i=2 得 dp2=7，清掉後方弱候選','4+front3=7；dp1=2、dp0=3 都≤7，因此依序 pop_back。',{i:2,dp2:7,popped:['1','0'],deque:[],operation:'remove dominated'}),
    eventFrame(lesson,'dq.push_back(i)','Push 2','deque=[2(7)]。',{deque:['2(7)'],operation:'push best'}),
    eventFrame(lesson,'while(!dq.empty() && dq.front()<i-K)','到 i=5 時會移除過期索引','每步先確保 front 還在長度 K 的合法前驅視窗，再用最大 dp。',{rule:'front >= i-K',operation:'expire old indices'}),
    eventFrame(lesson,'dq.push_back(i)','整體 O(n)','每個索引最多進出 Deque 各一次。',{complexity:'O(n)',operation:'finish optimized DP'}),
  ],

  'aliens-optimization':lesson=>[
    eventFrame(lesson,'solve(long long lambda','原問題要求恰好 K=2 段','對每段額外收 lambda，solve(lambda) 同時回傳最優成本與使用段數。',{K:2,lambda:'search',operation:'Lagrangian relaxation'}),
    eventFrame(lesson,'dp[j]+cost','lambda=0 時','分段沒有額外懲罰，最優解可能偏好多段，例如 groups=4。',{lambda:0,groups:4,operation:'solve relaxed'}),
    eventFrame(lesson,'if(dp[j]+cost','lambda=10 時','每多一段要多付 10，最優解改成 groups=1。',{lambda:10,groups:1,operation:'penalize groups'}),
    eventFrame(lesson,'while(lo<hi)','二分 lambda','段數隨 lambda 增加而不增；如果 groups>K，代表懲罰太小，要提高 lo。',{lo:0,hi:10,mid:5,groups:2,operation:'binary search penalty'}),
    eventFrame(lesson,'if(groups>K)','mid=5 正好得到 2 段','滿足 K，繼續向更小的可行 lambda 搜尋臨界點。',{lambda:5,groups:2,decision:'hi=mid',operation:'tighten search'}),
    eventFrame(lesson,'groups=cnt[n]','在臨界 lambda 還原原成本','relaxedCost 內含 K*lambda，最後扣回 K*lambda 得到恰好 K 段的原目標。',{formula:'original = relaxed - K*lambda',operation:'recover answer'}),
  ],

}

export const applyS2DataDpOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  const base=lessonOverrides[lesson.id] ? {...lesson,...lessonOverrides[lesson.id]} : lesson
  const coded=codeOverrides[lesson.id] ? {...base,code:codeOverrides[lesson.id]} : base
  const build=overrides[lesson.id]
  if(!build) return coded
  return {...coded,frames:build(coded),traceMode:'execution',animationVersion:2}
}

export const s2DataDpOverrideIds=Object.freeze(Object.keys(overrides))
