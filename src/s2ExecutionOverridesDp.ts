import type { AlgorithmLesson, Frame } from './algorithms'
import { eventFrame } from './traceAuthoring'

type TraceBuilder=(lesson:AlgorithmLesson)=>Frame[]

const codeOverrides:Record<string,string[]>={
  'knapsack-01':[
    'vector<int> dp(W+1,0);',
    'for (auto [weight,value] : items) {',
    '  for (int w=W; w>=weight; --w) {',
    '    dp[w]=max(dp[w],dp[w-weight]+value);',
    '  }',
    '}',
    'return dp[W];',
  ],
  'digit-dp':[
    'long long dfs(int pos,int tight,int started,int sum) {',
    '  if (pos==digits.size()) return started && sum%3==0;',
    '  if (!tight && memo[pos][started][sum]!=-1) return memo[pos][started][sum];',
    '  int limit=tight?digits[pos]:9;',
    '  long long ans=0;',
    '  for (int d=0; d<=limit; ++d)',
    '    ans += dfs(pos+1, tight && d==limit, started || d!=0, (sum+d)%3);',
    '  if (!tight) memo[pos][started][sum]=ans;',
    '  return ans;',
    '}',
  ],
  'tree-dp':[
    'void dfs(int u,int p) {',
    '  dp[u][0]=0; dp[u][1]=weight[u];',
    '  for (int v:g[u]) if (v!=p) {',
    '    dfs(v,u);',
    '    dp[u][0]+=max(dp[v][0],dp[v][1]);',
    '    dp[u][1]+=dp[v][0];',
    '  }',
    '}',
  ],
  'rerooting-dp':[
    'void dfs1(int u,int p) {',
    '  sub[u]=1; down[u]=0;',
    '  for (int v:g[u]) if(v!=p){ dfs1(v,u); sub[u]+=sub[v]; down[u]+=down[v]+sub[v]; }',
    '}',
    'void dfs2(int u,int p) {',
    '  for (int v:g[u]) if(v!=p){',
    '    answer[v]=answer[u] + n - 2*sub[v];',
    '    dfs2(v,u);',
    '  }',
    '}',
  ],
  'divide-conquer-dp':[
    'void solve(int l,int r,int optL,int optR) {',
    '  if(l>r) return;',
    '  int mid=(l+r)/2, bestK=-1;',
    '  dp[mid]=INF;',
    '  for(int k=optL;k<=min(mid-1,optR);++k)',
    '    if(prev[k]+cost(k+1,mid)<dp[mid]) dp[mid]=prev[k]+cost(k+1,mid),bestK=k;',
    '  solve(l,mid-1,optL,bestK);',
    '  solve(mid+1,r,bestK,optR);',
    '}',
  ],
  'knuth-optimization':[
    'for(int len=2;len<=n;++len) {',
    '  for(int l=0;l+len<=n;++l) {',
    '    int r=l+len;',
    '    dp[l][r]=INF;',
    '    for(int k=opt[l][r-1]; k<=opt[l+1][r]; ++k)',
    '      if(dp[l][k]+dp[k][r]+cost(l,r)<dp[l][r]) dp[l][r]=dp[l][k]+dp[k][r]+cost(l,r),opt[l][r]=k;',
    '  }',
    '}',
  ],
  'fibonacci-dp':[
    'vector<long long> dp(n+1);',
    'dp[0]=0; dp[1]=1;',
    'for(int i=2;i<=n;++i)',
    '  dp[i]=dp[i-1]+dp[i-2];',
    'return dp[n];',
  ],
  'unbounded-knapsack':[
    'vector<int> dp(W+1,0);',
    'for(auto [weight,value]:items)',
    '  for(int w=weight;w<=W;++w)',
    '    dp[w]=max(dp[w],dp[w-weight]+value);',
    'return dp[W];',
  ],
  'subset-sum':[
    'vector<char> can(S+1,false); can[0]=true;',
    'for(int x:a)',
    '  for(int s=S;s>=x;--s)',
    '    can[s]=can[s] || can[s-x];',
    'return can[S];',
  ],
  'grid-dp':[
    'dp[0][0]=grid[0][0];',
    'for(int r=0;r<H;++r)',
    '  for(int c=0;c<W;++c) if(r||c) {',
    '    dp[r][c]=INF;',
    '    if(r) dp[r][c]=min(dp[r][c],dp[r-1][c]+grid[r][c]);',
    '    if(c) dp[r][c]=min(dp[r][c],dp[r][c-1]+grid[r][c]);',
    '  }',
    'return dp[H-1][W-1];',
  ],
  'matrix-chain-multiplication':[
    'for(int len=2;len<=n;++len)',
    '  for(int l=0;l+len<=n;++l) {',
    '    int r=l+len; dp[l][r]=INF;',
    '    for(int k=l+1;k<r;++k)',
    '      dp[l][r]=min(dp[l][r],dp[l][k]+dp[k][r]+dim[l]*dim[k]*dim[r]);',
    '  }',
  ],
  'interval-dp':[
    'for(int len=1;len<=n;++len)',
    '  for(int l=0;l+len<=n;++l) {',
    '    int r=l+len-1;',
    '    if(l==r) dp[l][r]=a[l];',
    '    else dp[l][r]=max(a[l]-dp[l+1][r],a[r]-dp[l][r-1]);',
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

const overrides:Record<string,TraceBuilder>={
  'knapsack-01':lesson=>[
    eventFrame(lesson,'vector<int> dp','容量 W=7，DP 全 0','物品使用 (w=3,v=5)、(w=4,v=6)。dp[w] 是目前物品集合下容量 w 的最大價值。',{W:7,items:['(3,5)','(4,6)'],dp:['0','0','0','0','0','0','0','0'],operation:'initialize'}),
    eventFrame(lesson,'for (int w=W','處理 (3,5)：從 w=7 往下','0/1 背包必須倒序，確保同一件物品不會在本輪被重複使用。',{item:'(3,5)',direction:'7→3',operation:'scan descending'}),
    eventFrame(lesson,'dp[w]=max','更新 w=7','max(dp[7]=0, dp[4]+5=5)=5。',{w:7,choice:['0','0+5'],dp7:5,operation:'take item'}),
    eventFrame(lesson,'dp[w]=max','完成第一件物品','容量 3..7 都可放一次這件物品，dp=[0,0,0,5,5,5,5,5]。',{dp:['0','0','0','5','5','5','5','5'],operation:'finish item 1'}),
    eventFrame(lesson,'dp[w]=max','處理 (4,6)：更新 w=7','比較不選 5 與 dp[3]+6=11，選兩件不同物品得到 11。',{w:7,choice:['5','5+6'],dp7:11,operation:'combine items'}),
    eventFrame(lesson,'return dp[W]','答案 dp[7]=11','選 (3,5)+(4,6)，總重量 7、價值 11。',{answer:11,selected:['(3,5)','(4,6)'],operation:'return answer'}),
  ],

  'digit-dp':lesson=>[
    eventFrame(lesson,'dfs(int pos','目標：計算 0..25 中位數和可被 3 整除的正整數','digits=[2,5]；狀態包含 pos、tight、started、sum mod 3。',{N:25,digits:['2','5'],state:'(pos,tight,started,sum%3)',operation:'define state'}),
    eventFrame(lesson,'int limit=tight','pos=0 且 tight=1，所以 limit=2','第一位只能選 0、1、2。',{pos:0,tight:1,limit:2,operation:'respect upper bound'}),
    eventFrame(lesson,'for (int d=0','選 d=1：tight 變 0','1<2，所以後續位可自由選 0..9；started=1，sum=1。',{pos:0,digit:1,next:'(1,0,1,1)',operation:'transition digit'}),
    eventFrame(lesson,'for (int d=0','下一位選 2：得到 12','sum=(1+2)%3=0，走到終點時會計入答案。',{number:12,nextSum:0,operation:'complete one valid number'}),
    eventFrame(lesson,'if (pos==digits.size())','終點檢查','started=true 且 sum%3=0 才回傳 1；像 12、15、18、21、24 都會被計數。',{validExamples:['3','6','9','12','15','18','21','24'],operation:'base case'}),
    eventFrame(lesson,'memo[pos][started][sum]','非 Tight 狀態可記憶化','當 tight=0 時後續只與 pos/started/sum 有關，可直接重用。',{memoKey:'(pos,started,sum)',reason:'upper prefix already smaller',operation:'memoize'}),
    eventFrame(lesson,'return ans','最終答案 8','0 不計入，1..25 中共有 8 個數字位數和是 3 的倍數。',{answer:8,operation:'return count'}),
  ],

  'tree-dp':lesson=>[
    eventFrame(lesson,'dp[u][0]=0','樹：1 連 2、3；2 連 4','求最大權獨立集，權重 w1=4,w2=5,w3=3,w4=6。dp[u][1] 表示選 u。',{tree:['1-2','1-3','2-4'],weights:['1:4','2:5','3:3','4:6'],operation:'define tree'}),
    eventFrame(lesson,'dfs(v,u)','先遞迴到葉 4','葉 4：dp[4][0]=0、dp[4][1]=6。',{u:4,dp0:0,dp1:6,operation:'solve leaf'}),
    eventFrame(lesson,'dp[u][0]+=max','回到 2：若不選 2','可自由選或不選 4，因此 dp[2][0]=max(0,6)=6。',{u:2,child:4,dp0:6,operation:'parent not selected'}),
    eventFrame(lesson,'dp[u][1]+=dp[v][0]','若選 2','孩子 4 不能選，因此 dp[2][1]=5+0=5。',{u:2,dp1:5,operation:'parent selected'}),
    eventFrame(lesson,'dp[u][0]+=max','葉 3 回傳 (0,3)','根 1 不選時，可取 max(dp2)=6 加 max(dp3)=3，共 9。',{u:1,dp0:9,operation:'combine children'}),
    eventFrame(lesson,'dp[u][1]+=dp[v][0]','根 1 選時','dp[1][1]=4+dp2[0](6)+dp3[0](0)=10。',{u:1,dp1:10,operation:'selected root'}),
    eventFrame(lesson,'dp[u][1]+=dp[v][0]','答案 max(9,10)=10','最佳集合是 {1,4}。',{answer:10,selected:['1','4'],operation:'finish tree dp'}),
  ],

  'rerooting-dp':lesson=>[
    eventFrame(lesson,'sub[u]=1','樹 1-2,1-3,3-4','目標是每個根到所有節點的距離總和。',{tree:['1-2','1-3','3-4'],n:4,operation:'define reroot problem'}),
    eventFrame(lesson,'down[u]+=down[v]+sub[v]','第一遍計算 sub/down','由葉向上：sub2=1, sub4=1, sub3=2；根1 的 down=1 + (down3+sub3)=1+3=4。',{sub:['1:4','2:1','3:2','4:1'],down1:4,operation:'bottom-up'}),
    eventFrame(lesson,'answer[v]=answer[u] + n - 2*sub[v]','從根1移到子2','跨 1→2：子樹2內 1 個點距離 -1，其餘 3 個點 +1，所以 answer2=4+4-2=6。',{edge:'1→2',subV:1,answer:'4→6',operation:'reroot to 2'}),
    eventFrame(lesson,'answer[v]=answer[u] + n - 2*sub[v]','從根1移到子3','sub3=2，因此 answer3=4+4-4=4。',{edge:'1→3',subV:2,answer:'4→4',operation:'reroot to 3'}),
    eventFrame(lesson,'answer[v]=answer[u] + n - 2*sub[v]','從 3 移到 4','sub4=1，所以 answer4=4+4-2=6。',{edge:'3→4',answer:'4→6',operation:'reroot to 4'}),
    eventFrame(lesson,'dfs2(v,u)','全部根答案完成','距離總和為 [root1=4, root2=6, root3=4, root4=6]。',{answers:['1:4','2:6','3:4','4:6'],operation:'finish rerooting'}),
  ],

  'divide-conquer-dp':lesson=>[
    eventFrame(lesson,'solve(int l','計算一層 DP，假設最佳切點單調','示例 prev=[0,2,5,9]，cost(k+1,i)=(i-k)^2；要求 dp[1..3]。',{prev:['0','2','5','9'],range:'1..3',optRange:'0..2',operation:'start divide conquer'}),
    eventFrame(lesson,'int mid=(l+r)/2','先算 mid=2','整段 [1,3] 先處理中點 2。',{mid:2,optL:0,optR:2,operation:'choose midpoint'}),
    eventFrame(lesson,'for(int k=optL','枚舉 k=0,1','k=0:0+4=4；k=1:2+1=3，所以 bestK=1、dp[2]=3。',{mid:2,candidates:['k0→4','k1→3'],bestK:1,dp2:3,operation:'find optimum'}),
    eventFrame(lesson,'solve(l,mid-1','左半只需搜尋 opt ≤1','單調性讓 dp[1] 的最佳切點範圍縮為 [0,1]。',{range:'1..1',optRange:'0..1',operation:'recurse left'}),
    eventFrame(lesson,'solve(mid+1','右半只需搜尋 opt ≥1','dp[3] 的範圍縮成 [1,2]。',{range:'3..3',optRange:'1..2',operation:'recurse right'}),
    eventFrame(lesson,'if(prev[k]+cost','得到 dp=[1,3,6]','比每個 i 都掃全部 k 更省，前提是 opt 單調性成立。',{dp:['1','3','6'],operation:'finish optimized layer'}),
  ],

  'knuth-optimization':lesson=>[
    eventFrame(lesson,'for(int len=2','區間合併成本例：weights=[2,3,4]','dp[l][r] 為合併半開區間 [l,r) 的最小成本。',{weights:['2','3','4'],operation:'define interval cost'}),
    eventFrame(lesson,'for(int k=opt[l][r-1]','算 [0,2)','唯一切點 k=1，成本 2+3=5，因此 dp[0][2]=5、opt=1。',{interval:'[0,2)',candidates:['k=1→5'],dp:5,opt:1,operation:'base split'}),
    eventFrame(lesson,'for(int k=opt[l][r-1]','算 [1,3)','唯一切點 k=2，成本 3+4=7。',{interval:'[1,3)',dp:7,opt:2,operation:'base split'}),
    eventFrame(lesson,'for(int k=opt[l][r-1]','算 [0,3)：只搜 opt[0][2]..opt[1][3] = 1..2','Knuth 單調性把候選切點限制在 [1,2]。',{interval:'[0,3)',search:'k=1..2',operation:'restricted search'}),
    eventFrame(lesson,'if(dp[l][k]+dp[k][r]','比較兩切點','k=1：0+7+9=16；k=2：5+0+9=14，所以選 k=2。',{candidates:['k1→16','k2→14'],best:14,opt:2,operation:'choose split'}),
    eventFrame(lesson,'dp[l][r]=INF','最終 dp[0][3]=14','此優化只在四邊形不等式/單調最佳切點等條件成立時安全。',{answer:14,operation:'finish Knuth'}),
  ],

  'fibonacci-dp':lesson=>[
    eventFrame(lesson,'dp[0]=0','建立 Base Cases','n=7，dp[0]=0、dp[1]=1。',{n:7,dp:['0','1'],operation:'initialize'}),
    eventFrame(lesson,'dp[i]=dp[i-1]+dp[i-2]','i=2：1+0=1','dp[2]=1。',{i:2,formula:'1+0',dp:['0','1','1'],operation:'transition'}),
    eventFrame(lesson,'dp[i]=dp[i-1]+dp[i-2]','i=3：1+1=2','dp[3]=2。',{i:3,dp:['0','1','1','2'],operation:'transition'}),
    eventFrame(lesson,'dp[i]=dp[i-1]+dp[i-2]','一路填到 7','依序得到 3、5、8、13。',{dp:['0','1','1','2','3','5','8','13'],operation:'finish table'}),
    eventFrame(lesson,'return dp[n]','答案 13','F(7)=13。',{answer:13,operation:'return'}),
  ],

  'unbounded-knapsack':lesson=>[
    eventFrame(lesson,'vector<int> dp','W=7，物品 (3,5),(4,6)','完全背包允許每種物品使用多次。',{W:7,items:['(3,5)','(4,6)'],dp:['0','0','0','0','0','0','0','0'],operation:'initialize'}),
    eventFrame(lesson,'for(int w=weight','處理 (3,5) 時容量正向掃','w=3→7；正向讓本輪剛更新的 dp[w-3] 可再次使用同一件物品。',{item:'(3,5)',direction:'3→7',operation:'scan ascending'}),
    eventFrame(lesson,'dp[w]=max','w=6 可使用兩個 weight=3','dp[6]=max(5,dp[3]+5=10)=10。',{w:6,dp6:10,composition:'3+3',operation:'reuse item'}),
    eventFrame(lesson,'dp[w]=max','處理 (4,6)，w=7','dp[7]=max(10,dp[3]+6=11)=11。',{w:7,choice:['10','5+6'],dp7:11,operation:'combine types'}),
    eventFrame(lesson,'return dp[W]','答案 11','最佳仍是 3+4，但正向掃描允許像 3+3 的重複。',{answer:11,operation:'return'}),
  ],

  'subset-sum':lesson=>[
    eventFrame(lesson,'can[0]=true','a=[3,5,6], S=11','一開始只有總和 0 可達。',{a:['3','5','6'],S:11,reachable:['0'],operation:'initialize'}),
    eventFrame(lesson,'for(int s=S;s>=x','處理 x=3，倒序掃描','由 can[0] 推出 can[3]=true。',{x:3,reachable:['0','3'],operation:'add 3'}),
    eventFrame(lesson,'can[s]=can[s] || can[s-x]','處理 x=5','新增 5 與 8(=3+5)。',{x:5,reachable:['0','3','5','8'],operation:'add 5'}),
    eventFrame(lesson,'can[s]=can[s] || can[s-x]','處理 x=6','由既有 5 推出 11，目標變成可達。',{x:6,newSums:['6','9','11'],reachable:['0','3','5','6','8','9','11'],operation:'add 6'}),
    eventFrame(lesson,'return can[S]','can[11]=true','一個實際子集合是 {5,6}。',{result:'true',subset:['5','6'],operation:'return'}),
  ],

  'grid-dp':lesson=>[
    eventFrame(lesson,'dp[0][0]=grid[0][0]','3×3 Cost Grid','grid=[[1,3,1],[1,5,1],[4,2,1]]，只能向右或向下。',{grid:['1 3 1','1 5 1','4 2 1'],dp00:1,operation:'initialize start'}),
    eventFrame(lesson,'if(r) dp[r][c]=min','算 (1,0)','只能從上面來：dp[1][0]=1+1=2。',{cell:'(1,0)',value:2,operation:'from top'}),
    eventFrame(lesson,'if(c) dp[r][c]=min','算 (0,1)','只能從左來：dp[0][1]=1+3=4。',{cell:'(0,1)',value:4,operation:'from left'}),
    eventFrame(lesson,'dp[r][c]=INF','算中心 (1,1)','從上：4+5=9；從左：2+5=7，因此 dp[1][1]=7。',{cell:'(1,1)',choices:['9','7'],value:7,operation:'choose min predecessor'}),
    eventFrame(lesson,'if(c) dp[r][c]=min','填完整張表','最終 dp=[[1,4,5],[2,7,6],[6,8,7]]。',{dp:['1 4 5','2 7 6','6 8 7'],operation:'finish grid'}),
    eventFrame(lesson,'return dp[H-1][W-1]','右下角答案 7','路徑 1→3→1→1→1，總成本 7。',{answer:7,path:['(0,0)','(0,1)','(0,2)','(1,2)','(2,2)'],operation:'return'}),
  ],

  'matrix-chain-multiplication':lesson=>[
    eventFrame(lesson,'for(int len=2','矩陣尺寸 10×30, 30×5, 5×60','dim=[10,30,5,60]，三個矩陣。',{dim:['10','30','5','60'],operation:'define chain'}),
    eventFrame(lesson,'dp[l][r]=INF','長度 2 的區間','A1A2 成本 10*30*5=1500；A2A3 成本 30*5*60=9000。',{dp:['dp[0][2]=1500','dp[1][3]=9000'],operation:'solve short intervals'}),
    eventFrame(lesson,'for(int k=l+1','求整段 [0,3)','有兩個最後切點 k=1 或 k=2。',{interval:'[0,3)',splits:['k=1','k=2'],operation:'enumerate split'}),
    eventFrame(lesson,'dp[l][r]=min','k=1：A1 | (A2A3)','0 + 9000 + 10*30*60 = 27000。',{k:1,cost:27000,operation:'evaluate split'}),
    eventFrame(lesson,'dp[l][r]=min','k=2：(A1A2) | A3','1500 + 0 + 10*5*60 = 4500。',{k:2,cost:4500,operation:'evaluate split'}),
    eventFrame(lesson,'dp[l][r]=min','答案 4500','最佳括號化是 (A1A2)A3。',{answer:4500,parenthesization:'(A1A2)A3',operation:'finish'}),
  ],

  'interval-dp':lesson=>[
    eventFrame(lesson,'for(int len=1','取數遊戲 a=[4,7,2,9]','dp[l][r] 表示目前玩家相對對手能取得的最大分差。',{a:['4','7','2','9'],operation:'define interval state'}),
    eventFrame(lesson,'if(l==r)','長度 1 Base','dp[i][i]=a[i]，所以對角線是 4,7,2,9。',{diag:['4','7','2','9'],operation:'base intervals'}),
    eventFrame(lesson,'dp[l][r]=max','算 [0,1]','max(4-dp[1][1]= -3, 7-dp[0][0]=3)=3。',{interval:'[0,1]',choices:['4-7=-3','7-4=3'],value:3,operation:'choose endpoint'}),
    eventFrame(lesson,'dp[l][r]=max','算 [2,3]','max(2-9=-7,9-2=7)=7。',{interval:'[2,3]',value:7,operation:'choose endpoint'}),
    eventFrame(lesson,'dp[l][r]=max','逐長度擴張到 [0,3]','利用較短區間結果，最終 dp[0][3]=10。',{interval:'[0,3]',value:10,operation:'finish table'}),
    eventFrame(lesson,'dp[l][r]=max','分差 10','第一手可保證比對手多 10 分。',{answer:10,operation:'return game value'}),
  ],

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

export const applyS2DpOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  const build=overrides[lesson.id]
  if(!build) return lesson
  const traced=codeOverrides[lesson.id]?{...lesson,code:codeOverrides[lesson.id]}:lesson
  return {...traced,frames:build(traced),traceMode:'execution',animationVersion:2}
}

export const s2DpOverrideIds=Object.freeze(Object.keys(overrides))
