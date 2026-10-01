import type { AlgorithmLesson, Frame } from './algorithms'
import { eventFrame } from './traceAuthoring'

type TraceBuilder=(lesson:AlgorithmLesson)=>Frame[]

const codeOverrides:Record<string,string[]>={
  'suffix-array':[
    'vector<int> sa(n), rank(n), nextRank(n);',
    'iota(sa.begin(),sa.end(),0);',
    'for(int i=0;i<n;++i) rank[i]=(unsigned char)s[i];',
    'for(int k=1;;k<<=1){',
    '  sort(sa.begin(),sa.end(),[&](int a,int b){ return pair{rank[a],a+k<n?rank[a+k]:-1} < pair{rank[b],b+k<n?rank[b+k]:-1}; });',
    '  nextRank[sa[0]]=0;',
    '  for(int i=1;i<n;++i){',
    '    auto prev=pair{rank[sa[i-1]],sa[i-1]+k<n?rank[sa[i-1]+k]:-1};',
    '    auto cur=pair{rank[sa[i]],sa[i]+k<n?rank[sa[i]+k]:-1};',
    '    nextRank[sa[i]]=nextRank[sa[i-1]]+(prev!=cur);',
    '  }',
    '  rank=nextRank;',
    '  if(rank[sa.back()]==n-1) break;',
    '}',
  ],
  'lcp-array':[
    'for(int i=0;i<n;++i) rank[sa[i]]=i;',
    'int h=0;',
    'for(int i=0;i<n;++i){',
    '  int r=rank[i];',
    '  if(r==0) continue;',
    '  int j=sa[r-1];',
    '  while(i+h<n && j+h<n && s[i+h]==s[j+h]) ++h;',
    '  lcp[r]=h;',
    '  if(h) --h;',
    '}',
  ],
  'manacher':[
    'for(int i=0,l=0,r=-1;i<n;++i){',
    '  int k=(i>r?1:min(rad[l+r-i],r-i+1));',
    '  while(i-k>=0 && i+k<n && s[i-k]==s[i+k]) ++k;',
    '  rad[i]=k;',
    '  --k;',
    '  if(i+k>r) l=i-k,r=i+k;',
    '}',
  ],
  'duval-lyndon':[
    'for(int i=0;i<n;){',
    '  int j=i+1,k=i;',
    '  while(j<n && s[k]<=s[j]){',
    '    if(s[k]<s[j]) k=i; else ++k;',
    '    ++j;',
    '  }',
    '  while(i<=k){',
    '    factors.push_back(s.substr(i,j-k));',
    '    i+=j-k;',
    '  }',
    '}',
  ],
  'minimum-string-rotation':[
    'string t=s+s;',
    'int i=0,j=1,k=0,n=s.size();',
    'while(i<n && j<n && k<n){',
    '  char a=t[i+k], b=t[j+k];',
    '  if(a==b){ ++k; continue; }',
    '  if(a>b) i=i+k+1; else j=j+k+1;',
    '  if(i==j) ++j;',
    '  k=0;',
    '}',
    'int start=min(i,j);',
    'return t.substr(start,n);',
  ],
}

const overrides:Record<string,TraceBuilder>={
  'suffix-array':lesson=>[
    eventFrame(lesson,'iota(sa.begin()','字串 banana：先以單字元 Rank','Suffix 起點 0..5；初始 rank 只看第一個字元 b,a,n,a,n,a。',{s:'banana',sa:['0','1','2','3','4','5'],rank:['b','a','n','a','n','a'],operation:'initialize ranks'}),
    eventFrame(lesson,'for(int k=1','k=1：比較長度 2 的 Prefix','每個 suffix 以 pair(rank[i],rank[i+1]) 排序。',{k:1,pairs:['0:(b,a)','1:(a,n)','2:(n,a)','3:(a,n)','4:(n,a)','5:(a,-)'],operation:'build rank pairs'}),
    eventFrame(lesson,'sort(sa.begin()','第一次排序','依 pair 排成起點 [5,1,3,0,2,4]。',{k:1,sa:['5','1','3','0','2','4'],operation:'sort suffixes'}),
    eventFrame(lesson,'nextRank[sa[i]]','重新壓縮 Rank','相同 pair 得相同 rank：suffix 1 與 3 同組、2 與 4 同組。',{nextRank:['2','1','3','1','3','0'],operation:'compress ranks'}),
    eventFrame(lesson,'for(int k=1','k=2：比較長度 4','使用 (rank[i],rank[i+2])，能分開 ana... 與 anana...。',{k:2,operation:'double prefix length'}),
    eventFrame(lesson,'sort(sa.begin()','第二次排序','得到 [5,3,1,0,4,2]。',{sa:['5','3','1','0','4','2'],suffixes:['a','ana','anana','banana','na','nana'],operation:'sort doubled ranks'}),
    eventFrame(lesson,'if(rank[sa.back()]==n-1)','所有 Rank 唯一，停止','SA(banana)=[5,3,1,0,4,2]。',{result:['5','3','1','0','4','2'],operation:'finish suffix array'}),
  ],

  'lcp-array':lesson=>[
    eventFrame(lesson,'rank[sa[i]]=i','沿用 banana 的 SA','SA=[5,3,1,0,4,2]，先建立反查 rank[position]。',{s:'banana',sa:['5','3','1','0','4','2'],rank:['3','2','5','1','4','0'],operation:'inverse suffix array'}),
    eventFrame(lesson,'int h=0','h 從 0 開始','Kasai 依原字串位置 i=0..n-1 掃，而不是依 SA 順序。',{h:0,operation:'initialize reused prefix'}),
    eventFrame(lesson,'int j=sa[r-1]','i=0 的前驅 suffix 是起點 1','比較 banana 與 anana，首字元不同，所以 lcp[rank0]=0。',{i:0,j:1,h:0,lcp:0,operation:'compare predecessor'}),
    eventFrame(lesson,'while(i+h<n','i=1：anana 與 ana','共同前綴 ana，h 從 0 增到 3，因此 lcp[2]=3。',{i:1,j:3,matched:'ana',h:3,operation:'extend lcp'}),
    eventFrame(lesson,'if(h) --h','移到 i=2 前先 h--','已知刪掉第一個字元後，共同前綴至少剩 2，不必重頭比。',{h:'3→2',operation:'reuse previous lcp'}),
    eventFrame(lesson,'while(i+h<n','i=2：nana 與 na','從 h=2 開始已到字尾，因此 lcp=2。',{i:2,j:4,h:2,matched:'na',operation:'reuse and finish'}),
    eventFrame(lesson,'lcp[r]=h','完整 LCP Array','對 SA=[5,3,1,0,4,2]，LCP=[0,1,3,0,0,2]。',{lcp:['0','1','3','0','0','2'],operation:'finish lcp array'}),
  ],

  'manacher':lesson=>[
    eventFrame(lesson,'for(int i=0','字串 abacaba：求 Odd Palindrome Radius','rad[i] 包含中心本身，最右回文區間初始為空。',{s:'abacaba',rad:['?','?','?','?','?','?','?'],l:0,r:-1,operation:'initialize'}),
    eventFrame(lesson,'int k=(i>r','i=0：在區間外，k=1','只知道單一字元 a 是回文。',{i:0,k:1,operation:'seed radius'}),
    eventFrame(lesson,'while(i-k>=0','i=1 中心 b：向外比較 a 與 a','相等後 k=2，得到 aba。',{i:1,expansion:'a==a',radius:2,palindrome:'aba',operation:'expand'}),
    eventFrame(lesson,'if(i+k>r)','更新最右區間為 [0,2]','目前最右 palindrome 是 aba。',{l:0,r:2,operation:'update rightmost'}),
    eventFrame(lesson,'int k=(i>r','i=2 在 [0,2] 內：用鏡像 i=0','mirror=0，rad[0]=1，且右界只剩 1，所以先令 k=1。',{i:2,mirror:0,k:1,operation:'reuse mirror'}),
    eventFrame(lesson,'while(i-k>=0','i=3 中心 c：一路擴張','a/b/a 對稱匹配，得到完整 abacaba，radius=4。',{i:3,radius:4,palindrome:'abacaba',operation:'expand maximum palindrome'}),
    eventFrame(lesson,'rad[i]=k','最終 Radius','rad=[1,2,1,4,1,2,1]。',{rad:['1','2','1','4','1','2','1'],operation:'finish Manacher'}),
  ],

  'duval-lyndon':lesson=>[
    eventFrame(lesson,'for(int i=0','字串 ababbab：開始 Lyndon Factorization','i 指向尚未分解的起點。',{s:'ababbab',i:0,factors:[],operation:'initialize'}),
    eventFrame(lesson,'int j=i+1,k=i','第一段從 i=0 開始','j=1、k=0，比較 s[k] 與 s[j]。',{i:0,j:1,k:0,operation:'start candidate'}),
    eventFrame(lesson,'if(s[k]<s[j])','a < b：k 重設回 i','找到嚴格上升時，候選 Lyndon word 可從起點重新比較。',{chars:'a<b',k:'1→0',operation:'reset comparison'}),
    eventFrame(lesson,'else ++k','遇到相等位置就向前對齊','演算法持續直到首次出現 s[k] > s[j] 或 j 到字尾。',{operation:'advance periodic comparison'}),
    eventFrame(lesson,'factors.push_back','第一個 Lyndon Factor = ababb','目前 j-k 給出最小週期長度，輸出 s[i..i+period)。',{factor:'ababb',operation:'emit factor'}),
    eventFrame(lesson,'i+=j-k','i 跳到下一未處理位置','剩餘字串是 ab。',{i:5,remaining:'ab',operation:'advance factor start'}),
    eventFrame(lesson,'factors.push_back','輸出第二段 ab','最終 factorization = [ababb, ab]，且 factors 非遞增字典序。',{factors:['ababb','ab'],operation:'finish Lyndon factorization'}),
  ],

  'minimum-string-rotation':lesson=>[
    eventFrame(lesson,'string t=s+s','字串 bbaaccaadd：在 s+s 上比較 Rotation','i=0、j=1 是目前兩個候選起點。',{s:'bbaaccaadd',i:0,j:1,k:0,operation:'initialize Booth-style comparison'}),
    eventFrame(lesson,'char a=t[i+k]','先比較 rotation 0 與 1','t[0]=b、t[1]=b，相等，所以 k++。',{i:0,j:1,k:'0→1',chars:'b==b',operation:'extend equal prefix'}),
    eventFrame(lesson,'if(a>b) i=i+k+1','下一字元 b > a','rotation 0 在第一個不同處更大，因此起點 0..k 都不可能最小，i 跳到 2。',{i:'0→2',j:1,k:1,comparison:'b>a',operation:'discard worse start'}),
    eventFrame(lesson,'if(i==j) ++j','避免兩候選重合','若跳躍後 i==j，就把 j 再往後移一格。',{operation:'keep distinct candidates'}),
    eventFrame(lesson,'k=0','每次淘汰後重新比較','新候選從偏移 0 開始。',{i:2,j:1,k:0,operation:'reset offset'}),
    eventFrame(lesson,'if(a>b) i=i+k+1','持續成批淘汰較大 Rotation','每次 mismatch 至少淘汰一段起點，所以總比較次數 O(n)。',{survivors:['2','?'],operation:'linear candidate elimination'}),
    eventFrame(lesson,'int start=min(i,j)','最後 start=2','最小 rotation 從 index 2 開始：aaccaaddbb。',{start:2,result:'aaccaaddbb',operation:'return minimum rotation'}),
  ],
}

export const applyS2AdvancedStringOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  const build=overrides[lesson.id]
  if(!build) return lesson
  const coded={...lesson,code:codeOverrides[lesson.id]}
  return {...coded,frames:build(coded),traceMode:'execution',animationVersion:2}
}

export const s2AdvancedStringOverrideIds=Object.freeze(Object.keys(overrides))
