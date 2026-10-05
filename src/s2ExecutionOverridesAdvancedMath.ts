import type { AlgorithmLesson, Frame } from './algorithms'
import { eventFrame } from './traceAuthoring'

type TraceBuilder=(lesson:AlgorithmLesson)=>Frame[]

const codeOverrides:Record<string,string[]>={
  'miller-rabin':[
    'bool witness(uint64_t a,uint64_t n){',
    '  uint64_t d=n-1,s=0;',
    '  while((d&1)==0) d>>=1,++s;',
    '  uint64_t x=powMod(a,d,n);',
    '  if(x==1 || x==n-1) return false;',
    '  for(uint64_t r=1;r<s;++r){',
    '    x=mulMod(x,x,n);',
    '    if(x==n-1) return false;',
    '  }',
    '  return true;',
    '}',
  ],
  'chinese-remainder-theorem':[
    'auto [g,p,q]=extendedGcd(m,n);',
    'if((b-a)%g) return NO_SOLUTION;',
    'long long lcm=m/g*n;',
    'long long t=((b-a)/g*p)%(n/g);',
    'long long x=normalize(a+m*t,lcm);',
    'return pair{x,lcm};',
  ],
  'lagrange-interpolation':[
    'long long answer=0;',
    'for(int i=0;i<k;++i){',
    '  long long num=1,den=1;',
    '  for(int j=0;j<k;++j) if(i!=j){ num=num*(x-xs[j])%mod; den=den*(xs[i]-xs[j])%mod; }',
    '  answer=(answer + ys[i]*num%mod*inverse(den)%mod)%mod;',
    '}',
    'return normalize(answer,mod);',
  ],
  'matrix-exponentiation':[
    'Matrix R=identity(2);',
    'while(n){',
    '  if(n&1) R=R*A;',
    '  A=A*A;',
    '  n>>=1;',
    '}',
    'return R;',
  ],
  'xor-linear-basis':[
    'bool insert(uint64_t x){',
    '  for(int b=MAXB;b>=0;--b){',
    '    if(((x>>b)&1)==0) continue;',
    '    if(!basis[b]){',
    '      basis[b]=x;',
    '      return true;',
    '    }',
    '    x^=basis[b];',
    '  }',
    '  return false;',
    '}',
    'uint64_t maxXor(){',
    '  uint64_t ans=0;',
    '  for(int b=MAXB;b>=0;--b){',
    '    if((ans^basis[b])<=ans) continue;',
    '    ans^=basis[b];',
    '  }',
    '  return ans;',
    '}',
  ],
  'nim':[
    'int nimSum=0;',
    'for(int pile:piles) nimSum^=pile;',
    'if(nimSum==0) return LOSE;',
    'for(int& pile:piles){',
    '  int reduced=pile^nimSum;',
    '  if(reduced<pile){ pile=reduced; break; }',
    '}',
    'return WIN;',
  ],
  'sprague-grundy':[
    'int grundy(int s){',
    '  if(s==0) return 0;',
    '  if(memo[s]!=-1) return memo[s];',
    '  set<int> seen;',
    '  for(int t:moves(s)) seen.insert(grundy(t));',
    '  int g=0; while(seen.count(g)) ++g;',
    '  return memo[s]=g;',
    '}',
  ],
  'prime-factorization':[
    'vector<pair<long long,int>> factor(long long n){',
    '  vector<pair<long long,int>> out;',
    '  for(long long p=2;p*p<=n;++p) if(n%p==0){',
    '    int e=0;',
    '    while(n%p==0){',
    '      n/=p;',
    '      ++e;',
    '    }',
    '    out.push_back({p,e});',
    '  }',
    '  if(n>1){',
    '    out.push_back({n,1});',
    '  }',
    '  return out;',
    '}',
  ],
  'pollard-rho':[
    'long long rho(long long n){',
    '  auto f=[&](long long x){ return (mulMod(x,x,n)+1)%n; };',
    '  long long x=2,y=2,d=1;',
    '  while(d==1){',
    '    x=f(x);',
    '    y=f(f(y));',
    '    d=gcd(abs(x-y),n);',
    '  }',
    '  return d==n?FAIL:d;',
    '}',
  ],
  'baby-step-giant-step':[
    'long long M=ceil(sqrt((long double)m));',
    'unordered_map<long long,long long> baby;',
    'long long cur=1;',
    'for(long long j=0;j<M;++j) baby.emplace(cur,j),cur=cur*a%m;',
    'long long factor=inverse(powMod(a,M,m),m);',
    'cur=b;',
    'for(long long i=0;i<=M;++i){',
    '  if(baby.count(cur)) return i*M+baby[cur];',
    '  cur=cur*factor%m;',
    '}',
    'return NO_SOLUTION;',
  ],
  'fast-walsh-hadamard-transform':[
    'for(int len=1;len<n;len<<=1)',
    '  for(int i=0;i<n;i+=2*len)',
    '    for(int j=0;j<len;++j){',
    '      long long u=a[i+j],v=a[i+j+len];',
    '      a[i+j]=u+v;',
    '      a[i+j+len]=u-v;',
    '    }',
    'if(inverse) for(long long& x:a) x/=n;',
  ],
}

const overrides:Record<string,TraceBuilder>={
  'miller-rabin':lesson=>[
    eventFrame(lesson,'uint64_t d=n-1','測 n=221，Base a=2','221-1=220=55×2²，所以 d=55、s=2。',{n:221,a:2,d:55,s:2,operation:'factor n-1'}),
    eventFrame(lesson,'while((d&1)==0)','持續除 2','220→110→55，共抽出兩個 2。',{sequence:['220','110','55'],s:2,operation:'extract powers of two'}),
    eventFrame(lesson,'x=powMod','算 x=2^55 mod 221 = 128','128 既不是 1 也不是 220，所以還不能通過。',{x:128,operation:'initial strong residue'}),
    eventFrame(lesson,'x=mulMod','唯一一次平方：128² mod 221 = 30','因 s=2，只需 r=1；結果仍不是 n-1=220。',{r:1,x:30,operation:'square residue'}),
    eventFrame(lesson,'return true','Base 2 是 Composite Witness','整條強偽質數條件失敗，因此 221 一定是合數。',{result:'composite',witness:2,operation:'report witness'}),
  ],

  'chinese-remainder-theorem':lesson=>[
    eventFrame(lesson,'extendedGcd','合併 x≡2 (mod 3), x≡3 (mod 5)','gcd(3,5)=1，extended gcd 可給 p=2，因 3×2+5×(-1)=1。',{a:2,m:3,b:3,n:5,g:1,p:2,operation:'extended gcd'}),
    eventFrame(lesson,'if((b-a)%g)','檢查可解條件','b-a=1 可被 g=1 整除，所以存在解。',{difference:1,g:1,result:'solvable',operation:'check compatibility'}),
    eventFrame(lesson,'long long lcm','新模數 lcm=15','所有解形成 modulo 15 的一個同餘類。',{lcm:15,operation:'compute combined modulus'}),
    eventFrame(lesson,'long long t=','解 3t ≡ 1 (mod 5)','t=((1)/1×p=2) mod5，所以 t=2。',{equation:'3t≡1 mod5',t:2,operation:'solve reduced congruence'}),
    eventFrame(lesson,'x=normalize','x=a+m*t=2+3×2=8','8 mod3=2、8 mod5=3。',{x:8,checks:['8%3=2','8%5=3'],operation:'construct solution'}),
    eventFrame(lesson,'return pair','回傳 x≡8 (mod 15)','這就是兩式合併後的唯一解類。',{result:'8 mod 15',operation:'return CRT'}),
  ],

  'lagrange-interpolation':lesson=>[
    eventFrame(lesson,'long long answer=0','三點 (0,1),(1,3),(2,7)，求 P(3)','這三點唯一決定次數 <3 的多項式。',{points:['(0,1)','(1,3)','(2,7)'],x:3,operation:'initialize interpolation'}),
    eventFrame(lesson,'for(int i=0','i=0 的 Basis L0(3)=1','(3-1)(3-2)/((0-1)(0-2)) = 2×1/2 = 1；貢獻 y0×L0=1。',{i:0,basis:1,contribution:1,operation:'evaluate basis 0'}),
    eventFrame(lesson,'num=num*(x-xs[j])','i=1：L1(3)=-3','(3-0)(3-2)/((1-0)(1-2)) = 3/(-1)=-3；貢獻 3×(-3)=-9。',{i:1,basis:-3,contribution:-9,operation:'evaluate basis 1'}),
    eventFrame(lesson,'answer=(answer','i=2：L2(3)=3','(3-0)(3-1)/((2-0)(2-1)) = 6/2=3；貢獻 7×3=21。',{i:2,basis:3,contribution:21,operation:'evaluate basis 2'}),
    eventFrame(lesson,'return normalize','總和 1-9+21=13','插值得到 P(3)=13；實際多項式是 x²+x+1。',{sum:'1-9+21',result:13,polynomial:'x^2+x+1',operation:'return interpolated value'}),
  ],

  'matrix-exponentiation':lesson=>[
    eventFrame(lesson,'Matrix R=identity','用 Fibonacci Matrix T=[[1,1],[1,0]] 算 T^5','R 從單位矩陣開始，n=5=101₂。',{T:['1 1','1 0'],n:5,bits:'101',R:'I',operation:'initialize'}),
    eventFrame(lesson,'if(n&1) R=R*A','最低位 1：R=T','處理 2^0 位。',{n:5,R:['1 1','1 0'],operation:'multiply selected power'}),
    eventFrame(lesson,'A=A*A','平方 A：T²=[[2,1],[1,1]]','n 右移變 2。',{A:['2 1','1 1'],n:'5→2',operation:'square matrix'}),
    eventFrame(lesson,'A=A*A','n=2 最低位 0，只平方得到 T⁴','T⁴=[[5,3],[3,2]]，n 變 1。',{A:['5 3','3 2'],n:'2→1',operation:'skip bit and square'}),
    eventFrame(lesson,'if(n&1) R=R*A','最後位 1：R=T×T⁴=T⁵','得到 [[8,5],[5,3]]。',{R:['8 5','5 3'],operation:'final multiply'}),
    eventFrame(lesson,'return R','T⁵ 完成','乘 [F1,F0]^T 可得到 [F6,F5]=[8,5]。',{result:['8 5','5 3'],fibonacci:['F6=8','F5=5'],operation:'return matrix power'}),
  ],

  'xor-linear-basis':lesson=>[
    eventFrame(lesson,'if(!basis[b]){','Insert 5=101₂：bit2 的 Pivot Slot 為空','掃描到最高設定位 b=2；basis[2] 尚未存在，所以進入建立新 pivot 的 branch。這一步只做判斷，還沒有寫資料。',{x:'101',b:2,basis2:'empty',operation:'check empty pivot'}),
    eventFrame(lesson,'basis[b]=x;','真正寫入 basis[2]=101','這一行才修改線性基底；rank 從 0 變 1。',{basis:['bit2=101'],rank:1,operation:'store first pivot'}),
    eventFrame(lesson,'if(!basis[b]){','Insert 3=011₂：bit1 為空','bit2 沒設位會 continue；到 b=1 時 basis[1] 為空，因此準備建立第二個 pivot。',{x:'011',b:1,basis:['bit2=101'],operation:'check second pivot'}),
    eventFrame(lesson,'basis[b]=x;','寫入 basis[1]=011','第二個獨立向量正式加入，rank=2。',{basis:['bit2=101','bit1=011'],rank:2,operation:'store second pivot'}),
    eventFrame(lesson,'if(!basis[b]){','Insert 6=110₂：bit2 已被占用','6 的最高位是 bit2，但 basis[2]=101 已存在，所以不能直接建立新 pivot，必須往下消去。',{x:'110',b:2,pivot:'101',decision:'eliminate',operation:'occupied pivot'}),
    eventFrame(lesson,'x^=basis[b];','消掉 bit2：110 XOR 101 = 011','執行 XOR 後 x 真的由 6 變成 3，最高設定位降到 bit1。',{before:'110',pivot:'101',after:'011',operation:'eliminate bit2'}),
    eventFrame(lesson,'if(!basis[b]){','bit1 也已有 Pivot 011','下一輪掃到 b=1；basis[1] 同樣已被占用，因此再做一次消去。',{x:'011',b:1,pivot:'011',decision:'eliminate',operation:'occupied second pivot'}),
    eventFrame(lesson,'x^=basis[b];','消掉 bit1：011 XOR 011 = 000','x 變成 0，代表原本的 6 可以由既有 basis 生成。',{before:'011',pivot:'011',after:'000',operation:'eliminate to zero'}),
    eventFrame(lesson,'return false;','x=0：6 不增加 Rank','for 結束仍沒有找到空 pivot，因此 insert 回 false；確實有 6 = 5 XOR 3。',{dependent:'6=5 XOR 3',rank:2,result:'false',operation:'reject dependent vector'}),
    eventFrame(lesson,'uint64_t ans=0;','Max XOR：Ans 從 0 開始','接著只讀 basis，不再修改線性基底。',{ans:0,basis:['101','011'],operation:'initialize max xor'}),
    eventFrame(lesson,'ans^=basis[b];','bit2：0 XOR 5 = 5，比 0 大','最高位貪心成立，因此這一行把 ans 從 0 改成 5。',{b:2,before:0,candidate:5,after:5,operation:'take bit2 pivot'}),
    eventFrame(lesson,'ans^=basis[b];','bit1：5 XOR 3 = 6，比 5 大','再取 basis[1]，ans 由 5 變 6。',{b:1,before:5,candidate:6,after:6,operation:'take bit1 pivot'}),
    eventFrame(lesson,'return ans;','回傳最大可生成 XOR = 6','basis={5,3} 的所有 XOR 為 0,3,5,6，最大值確實是 6。',{result:6,generated:['0','3','5','6'],operation:'return max xor'}),
  ],

  'nim':lesson=>[
    eventFrame(lesson,'int nimSum=0','Piles=[3,4,5]','先 XOR 全部石堆。',{piles:['3','4','5'],operation:'initialize'}),
    eventFrame(lesson,'nimSum^=pile','3 XOR 4 XOR 5 = 2','nimSum=2 非 0，所以目前是必勝狀態。',{nimSum:2,binary:'010',operation:'compute nim sum'}),
    eventFrame(lesson,'if(nimSum==0)','非零：需要走到 Nim Sum 0','找某堆 x 使 x XOR 2 < x。',{target:'new xor = 0',operation:'choose winning move'}),
    eventFrame(lesson,'int reduced=pile^nimSum','看 pile=3：3 XOR 2 = 1 < 3','可以把第一堆從 3 減到 1。',{pile:3,reduced:1,operation:'compute reduction'}),
    eventFrame(lesson,'pile=reduced','執行 Move：3→1','新 piles=[1,4,5]，1 XOR 4 XOR 5 =0。',{piles:['1','4','5'],nimSum:0,operation:'make winning move'}),
    eventFrame(lesson,'return WIN','回傳 WIN','之後對手每一步都會把 xor 0 變成非 0。',{result:'WIN',operation:'finish Nim'}),
  ],

  'sprague-grundy':lesson=>[
    eventFrame(lesson,'if(s==0)','遊戲：每次可減 1 或 2','終點 state0 沒有合法 move，所以 SG(0)=0。',{moves:'s→s-1 or s-2',sg0:0,operation:'base losing state'}),
    eventFrame(lesson,'seen.insert','SG(1)：後繼只有 SG(0)=0','mex{0}=1。',{state:1,reachable:['0'],sg:1,operation:'compute SG1'}),
    eventFrame(lesson,'while(seen.count(g))','SG(2)：後繼 SG={1,0}','mex{0,1}=2。',{state:2,reachable:['1','0'],sg:2,operation:'compute SG2'}),
    eventFrame(lesson,'return memo[s]=g','SG(3)：後繼 {2,1}','mex{1,2}=0，所以 3 是必敗狀態。',{state:3,reachable:['2','1'],sg:0,operation:'find losing state'}),
    eventFrame(lesson,'seen.insert','繼續得到 SG4=1、SG5=2','序列呈 0,1,2,0,1,2。',{sg:['0','1','2','0','1','2'],operation:'finish small states'}),
    eventFrame(lesson,'return memo[s]=g','兩個獨立遊戲 state2 與 state4','總 SG=2 XOR 1=3 非 0，因此組合遊戲必勝。',{components:['SG2=2','SG4=1'],xor:3,result:'winning',operation:'combine games'}),
  ],

  'prime-factorization':lesson=>[
    eventFrame(lesson,'factor(long long n)','分解 n=360','從最小可能質因數 p=2 開始。',{n:360,operation:'initialize trial division'}),
    eventFrame(lesson,'n/=p;','p=2：連除三次','360→180→90→45，所以記錄 2^3。',{p:2,sequence:['360','180','90','45'],exponent:3,operation:'extract factor 2'}),
    eventFrame(lesson,'n/=p;','p=3：45 可再除兩次','45→15→5，記錄 3^2。',{p:3,sequence:['45','15','5'],exponent:2,operation:'extract factor 3'}),
    eventFrame(lesson,'for(long long p=2','接下來 p*p > n','目前 n=5；不必再試到原本 sqrt(360)，因剩餘 n 已縮小。',{remaining:5,operation:'stop trial loop'}),
    eventFrame(lesson,'out.push_back({n,1});','剩餘 5 本身是質數','迴圈結束後剩餘 n=5 大於 1，因此它本身就是最後一個質因數，記錄為 5^1。',{factor:'5^1',operation:'append residual prime'}),
    eventFrame(lesson,'return out','結果 360=2^3×3^2×5','乘回 8×9×5=360。',{factors:['2^3','3^2','5'],check:360,operation:'return factors'}),
  ],

  'pollard-rho':lesson=>[
    eventFrame(lesson,'rho(long long n)','分解 n=91，F(x)=x²+1 mod 91','初始 tortoise x=2、hare y=2、d=1。',{n:91,x:2,y:2,d:1,operation:'initialize rho walk'}),
    eventFrame(lesson,'x=f(x);','Tortoise 走一步：x=5','f(2)=5。這一行只更新 x。',{before:2,after:5,operation:'advance tortoise'}),
    eventFrame(lesson,'y=f(f(y));','Hare 走兩步：y=26','先 f(2)=5，再 f(5)=26；這一行只更新 y。',{before:2,intermediate:5,after:26,operation:'advance hare'}),
    eventFrame(lesson,'d=gcd(abs(x-y),n);','檢查差值與 n 的 GCD','|5-26|=21，gcd(21,91)=7。',{difference:21,d:7,operation:'compute collision gcd'}),
    eventFrame(lesson,'while(d==1){','d=7：離開迴圈','d 已不是 1，而且 7≠91，所以找到非平凡因數，不需要再走下一輪。',{d:7,decision:'stop',operation:'finish rho loop'}),
    eventFrame(lesson,'return d==n?FAIL:d;','回傳 Factor 7','91=7×13，因此這次 rho walk 成功分裂 n。',{factor:7,cofactor:13,operation:'return factor'}),
  ]

  'baby-step-giant-step':lesson=>[
    eventFrame(lesson,'M=ceil','解 2^x ≡ 5 (mod 13)','M=ceil(sqrt(13))=4，寫 x=iM+j。',{a:2,b:5,m:13,M:4,operation:'choose block size'}),
    eventFrame(lesson,'baby.emplace','Baby Steps j=0..3','2^j mod13 = {1,2,4,8}，保存 value→j。',{baby:['1→0','2→1','4→2','8→3'],operation:'build baby table'}),
    eventFrame(lesson,'factor=inverse','Giant Factor = (2^4)^-1','2^4=16≡3，3^-1 mod13=9。',{power:3,factor:9,operation:'compute inverse giant step'}),
    eventFrame(lesson,'cur=b','i=0：cur=5，不在 Baby Table','繼續乘 factor。',{i:0,cur:5,hit:'no',operation:'probe giant step'}),
    eventFrame(lesson,'cur=cur*factor','i=1：cur=5×9≡6','6 也不在 table。',{i:1,cur:6,hit:'no',operation:'advance giant step'}),
    eventFrame(lesson,'baby.count','i=2：cur=6×9≡2，命中 j=1','因此 x=iM+j=2×4+1=9。',{i:2,cur:2,j:1,x:9,operation:'find collision'}),
    eventFrame(lesson,'return i*M+baby[cur]','驗證 2^9 mod13 =5','碰撞給出 x=2×4+1=9，代回驗證 2^9 mod 13=5，因此離散對數答案就是 9。',{result:9,check:'512 mod13=5',operation:'return discrete log'}),
  ],

  'fast-walsh-hadamard-transform':lesson=>[
    eventFrame(lesson,'for(int len=1','做 XOR Convolution：a=[1,2,0,0], b=[3,1,0,0]','長度 4 已是 2 的冪。',{a:['1','2','0','0'],b:['3','1','0','0'],operation:'initialize XOR convolution'}),
    eventFrame(lesson,'a[i+j]=u+v','FWT 第一層 len=1','a 的 pair (1,2)→(3,-1)，(0,0)→(0,0)。',{len:1,a:['3','-1','0','0'],operation:'first butterflies'}),
    eventFrame(lesson,'a[i+j+len]=u-v','第二層 len=2','a 變 [3,-1,3,-1]；同理 b 變 [4,2,4,2]。',{A:['3','-1','3','-1'],B:['4','2','4','2'],operation:'finish transforms'}),
    eventFrame(lesson,'a[i+j]=u+v','點值相乘','逐點乘得到 [12,-2,12,-2]。',{product:['12','-2','12','-2'],operation:'pointwise multiply'}),
    eventFrame(lesson,'if(inverse)','Inverse FWT 再做同樣 Butterfly 並除 n','再次 Hadamard 得 [20,28,0,0]，最後除 4。',{beforeDivide:['20','28','0','0'],n:4,operation:'inverse transform'}),
    eventFrame(lesson,'x/=n','XOR Convolution = [5,7,0,0]','例如 c0=a0b0+a1b1=1×3+2×1=5；c1=1×1+2×3=7。',{result:['5','7','0','0'],operation:'finish XOR convolution'}),
  ],
}

export const applyS2AdvancedMathOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  const build=overrides[lesson.id]
  if(!build) return lesson
  const coded={...lesson,code:codeOverrides[lesson.id]}
  return {...coded,frames:build(coded),traceMode:'execution',animationVersion:2}
}

export const s2AdvancedMathOverrideIds=Object.freeze(Object.keys(overrides))
