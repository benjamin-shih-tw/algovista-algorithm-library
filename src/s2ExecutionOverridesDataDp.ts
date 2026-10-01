import type { AlgorithmLesson, Frame, Point } from './algorithms'
import { eventFrame } from './traceAuthoring'

type TraceBuilder=(lesson:AlgorithmLesson)=>Frame[]

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
    '  for (int v:tree[u]) if (v!=p) {',
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
    eventFrame(lesson,'ll prefix(int x,int y)','查 Prefix(3,3)','x 方向走 3→2→0；每個 x 下 y 方向走 3→2→0。',{query:'prefix(3,3)',xPath:['3','2'],yPath:['3','2'],operation:'start prefix query'}),
    eventFrame(lesson,'s+=bit[i][j]','讀 (3,3),(3,2)：都是 0','目前 s=0。',{cells:['(3,3)=0','(3,2)=0'],sum:0,operation:'accumulate first x row'}),
    eventFrame(lesson,'s+=bit[i][j]','i=2：bit[2][3]=5','再讀 bit[2][2]=0，所以 prefix(3,3)=5。',{cells:['(2,3)=5','(2,2)=0'],sum:5,operation:'finish prefix'}),
  ],

  'tree-dp':lesson=>[
    eventFrame(lesson,'dp[u]=1','Root A：每個 Node 先 Count 自己','這個具體 Tree DP 計算 subtree size；葉節點 base 都是 1。',{goal:'subtree size',root:'A',operation:'base state'},{active:['A']}),
    eventFrame(lesson,'dfs(v,u)','沿 A→B→D→F 深入','先處理 child 再回父節點合併。',{callStack:['A','B','D','F'],operation:'postorder DFS'},{active:['A','B','D','F']}),
    eventFrame(lesson,'dp[u]+=dp[v]','F 返回 D：dp[D]=1+1=2','F 是葉，dp[F]=1；D 合併 child F。',{child:'F',parent:'D',dpF:1,dpD:'1→2',operation:'merge child state'},{active:['D','F'],accepted:['F']}),
    eventFrame(lesson,'dp[u]+=dp[v]','D、E 合併到 B','B 自己 1 + dp[D]2 + dp[E]1 = 4。',{node:'B',children:['D=2','E=1'],dpB:4,operation:'merge B subtree'},{active:['B','D','E'],accepted:['D','E','F']}),
    eventFrame(lesson,'dp[u]+=dp[v]','C 是 Leaf：dp[C]=1','A 的另一個 child C 完成。',{node:'C',dpC:1,operation:'leaf result'},{active:['C'],accepted:['C']}),
    eventFrame(lesson,'dp[u]+=dp[v]','Root A 合併 B 與 C','dp[A]=1+4+1=6，等於整棵樹節點數。',{node:'A',children:['B=4','C=1'],dpA:6,operation:'finish root DP'},{active:['A','B','C'],accepted:['A','B','C','D','E','F']}),
  ],

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
    eventFrame(lesson,'long long cur=prev1+prev2','i=3：cur=2','1+1=2。',{i:3,cur:2,operation:'compute F3'}),
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
}

export const applyS2DataDpOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  const base=lessonOverrides[lesson.id] ? {...lesson,...lessonOverrides[lesson.id]} : lesson
  const coded=codeOverrides[lesson.id] ? {...base,code:codeOverrides[lesson.id]} : base
  const build=overrides[lesson.id]
  if(!build) return coded
  return {...coded,frames:build(coded),traceMode:'execution',animationVersion:2}
}

export const s2DataDpOverrideIds=Object.freeze(Object.keys(overrides))
