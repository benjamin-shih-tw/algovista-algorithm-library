import type { AlgorithmLesson, Frame } from './algorithms'
import { eventFrame } from './traceAuthoring'

type TraceBuilder=(lesson:AlgorithmLesson)=>Frame[]

const codeOverrides:Record<string,string[]>={
  'z-algorithm':[
    'vector<int> zFunction(const string& s){',
    '  int n=s.size();',
    '  vector<int> z(n);',
    '  int l=0,r=0;',
    '  for(int i=1;i<n;++i){',
    '    if(i<r) z[i]=min(r-i,z[i-l]);',
    '    while(i+z[i]<n && s[z[i]]==s[i+z[i]]) ++z[i];',
    '    if(i+z[i]>r){',
    '      l=i;',
    '      r=i+z[i];',
    '    }',
    '  }',
    '  return z;',
    '}',
  ],
  'euler-totient':[
    'long long phi(long long n){',
    '  long long result=n;',
    '  for(long long p=2;p*p<=n;++p){',
    '    if(n%p!=0) continue;',
    '    while(n%p==0){',
    '      n/=p;',
    '    }',
    '    result-=result/p;',
    '  }',
    '  if(n>1) result-=result/n;',
    '  return result;',
    '}',
  ],
}

const overrides:Record<string,TraceBuilder>={
  'rolling-hash':(lesson)=>[
    eventFrame(lesson,'hash[i+1]','字串 abca：建立 h[1]','令 a=1,b=2,c=3、base=31、mod=101。h[1]=(0·31+1)%101=1。',{s:'abca',base:31,mod:101,i:0,hash:['0','1'],operation:'extend prefix hash'}),
    eventFrame(lesson,'power[i+1]','同步建立 Power','power[0]=1，power[1]=31。',{power:['1','31'],operation:'extend base powers'}),
    eventFrame(lesson,'hash[i+1]','加入 b：h[2]=33','(1·31+2)%101=33。',{i:1,char:'b=2',hash:['0','1','33'],operation:'extend prefix hash'}),
    eventFrame(lesson,'hash[i+1]','加入 c：h[3]=16','(33·31+3)%101=16。',{i:2,char:'c=3',hash:['0','1','33','16'],operation:'extend prefix hash'}),
    eventFrame(lesson,'hash[i+1]','加入 a：h[4]=93','(16·31+1)%101=93；prefix hash 完成。',{i:3,char:'a=1',hash:['0','1','33','16','93'],power:['1','31','52','97','78'],operation:'finish prefix hashes'}),
    eventFrame(lesson,'return (hash[r]-hash[l]','Query [1,3) = "bc"','h[3]-h[1]·power[2] = 16-1·52 = -36 ≡ 65 (mod 101)。直接算 2·31+3 也等於 65。',{l:1,r:3,substring:'bc',formula:'16-1·52 mod101',result:65,operation:'normalize substring hash'}),
  ],

  'kmp':(lesson)=>[
    eventFrame(lesson,'for (int i=1','Pattern = ababaca','pi[0]=0，j 表示目前可延伸的最長 border 長度。',{pattern:'ababaca',pi:['0','?','?','?','?','?','?'],j:0,operation:'initialize prefix function'}),
    eventFrame(lesson,'if (p[i]==p[j]) ++j','i=1：b ≠ a','j=0 無法 fallback，因此 pi[1]=0。',{i:1,char:'b',compare:'b vs a',j:0,pi:['0','0','?','?','?','?','?'],operation:'mismatch at zero'}),
    eventFrame(lesson,'if (p[i]==p[j]) ++j','i=2：a == a','j 由 0→1，pi[2]=1。',{i:2,compare:'a==a',j:'0→1',pi:['0','0','1','?','?','?','?'],operation:'extend border'}),
    eventFrame(lesson,'if (p[i]==p[j]) ++j','i=3：b == b','j 1→2，pi[3]=2。',{i:3,compare:'b==b',j:'1→2',pi:['0','0','1','2','?','?','?'],operation:'extend border'}),
    eventFrame(lesson,'if (p[i]==p[j]) ++j','i=4：a == a','j 2→3，pi[4]=3；目前 border 是 "aba"。',{i:4,compare:'a==a',j:'2→3',border:'aba',pi:['0','0','1','2','3','?','?'],operation:'extend border'}),
    eventFrame(lesson,'while (j>0 && p[i]!=p[j])','i=5：c vs b 失配，j=3→1','fallback 到 pi[2]=1；已知前綴 "a" 仍可能保留。',{i:5,compare:'c!=b',j:'3→1',fallback:'pi[2]=1',operation:'fallback'}),
    eventFrame(lesson,'while (j>0 && p[i]!=p[j])','仍失配：j=1→0','c vs b 仍不同，再 fallback 到 pi[0]=0，pi[5]=0。',{i:5,compare:'c!=b',j:'1→0',pi:['0','0','1','2','3','0','?'],operation:'fallback to zero'}),
    eventFrame(lesson,'if (p[i]==p[j]) ++j','i=6：a == a','最後 j 0→1，pi[6]=1。',{i:6,compare:'a==a',j:'0→1',pi:['0','0','1','2','3','0','1'],operation:'finish prefix function'}),
  ],

  'z-algorithm':(lesson)=>[
    eventFrame(lesson,'for(int i=1;i<n;++i){','s = ababa','z[i] 是 suffix i 與整串 prefix 的 LCP 長度；初始 [l,r) 為空。',{s:'ababa',z:['0','?','?','?','?'],box:'empty',operation:'initialize Z'}),
    eventFrame(lesson,'while (i+z[i]<n','i=1：b ≠ a，z[1]=0','無法延伸，Z-box 不變。',{i:1,compare:'b vs a',z:['0','0','?','?','?'],operation:'failed extension'}),
    eventFrame(lesson,'while (i+z[i]<n','i=2：逐字匹配 aba','s[2..]=aba 與 prefix aba 相同三字，因此 z[2]=3。',{i:2,matches:['a=a','b=b','a=a'],z2:3,operation:'extend beyond box'}),
    eventFrame(lesson,'l=i;','i=2：更新 Z-box 左端 l=2','z[2]=3 已延伸到舊右界之外，所以進入更新 branch；先令 l=i=2。',{i:2,l:2,r:0,z:['0','0','3','?','?'],operation:'update Z-box left'}),
    eventFrame(lesson,'r=i+z[i];','再更新右端 r=5','接著 r=i+z[i]=2+3=5，最右匹配區間正式成為 [2,5)。',{i:2,l:2,r:5,box:'[2,5)',z:['0','0','3','?','?'],operation:'update Z-box right'}),
    eventFrame(lesson,'if (i<r) z[i]=min','i=3 在 Box 內，重用 z[1]','z[3]=min(r-i=2,z[1]=0)=0，不需重比 box 內已知部分。',{i:3,mirror:1,reused:0,z:['0','0','3','0','?'],operation:'reuse mirror'}),
    eventFrame(lesson,'if (i<r) z[i]=min','i=4 重用 z[2] 但被邊界截斷','min(r-i=1,z[2]=3)=1，因此 z[4] 先得到 1；已到字串末端，不能再延伸。',{i:4,mirror:2,reused:'min(1,3)=1',z:['0','0','3','0','1'],operation:'reuse clipped value'}),
  ],

  'trie':(lesson)=>[
    eventFrame(lesson,'void insert','插入 "cat"：從 Root 開始','u=0，逐字元建立缺少的邊。',{word:'cat',u:'root',operation:'start insertion'}),
    eventFrame(lesson,'if (!next[u][c])','字元 c：建立 c 節點','root 沒有 c 邊，因此 newNode()，再走到該節點。',{char:'c',created:'root-c',path:'c',operation:'create edge'}),
    eventFrame(lesson,'if (!next[u][c])','字元 a：建立 ca','目前 c 節點沒有 a 邊，建立新節點。',{char:'a',created:'c-a',path:'ca',operation:'create edge'}),
    eventFrame(lesson,'if (!next[u][c])','字元 t：建立 cat','建立最後一條 t 邊。',{char:'t',created:'ca-t',path:'cat',operation:'create edge'}),
    eventFrame(lesson,'terminal[u]=true','標記 "cat" Terminal','路徑 cat 現在代表完整單字。',{word:'cat',terminal:'cat',nodes:4,operation:'mark terminal'}),
    eventFrame(lesson,'for (char c:s)','接著插入 "car"：重用 ca','c、a 兩條邊已存在，所以不建立新節點，直接走到 ca。',{word:'car',reused:['c','a'],path:'ca',operation:'reuse prefix'}),
    eventFrame(lesson,'if (!next[u][c])','只有 r 需要新節點','ca 節點沒有 r，建立 car 並標 terminal。',{word:'car',created:'ca-r',terminals:['cat','car'],nodes:5,operation:'branch shared prefix'}),
  ],

  'aho-corasick':(lesson)=>[
    eventFrame(lesson,'buildTrie(patterns)','Patterns = he, she, his, hers','先建立共享 Trie；terminal 對應四個 pattern。',{patterns:['he','she','his','hers'],operation:'build trie'}),
    eventFrame(lesson,'buildFailureLinksByBFS','BFS 建 Failure Links','例如 fail("she") 指到 "he"，因為 "he" 是 she 的最長 Trie 後綴；fail("hers") 最終可退到可用前綴。',{links:['she→he','his→s/root','hers→s/root'],operation:'build fail links'}),
    eventFrame(lesson,'for (char c:text)','掃描 Text = ushers：u','root 沒有 u 邊，狀態保持 root。',{text:'ushers',pos:0,char:'u',state:'root',operation:'scan char'}),
    eventFrame(lesson,'u=next[u][c]','讀 s→h→e：到達 she','依 Trie 轉移後目前狀態代表 suffix "she"。',{chars:['s','h','e'],state:'she',operation:'advance automaton'}),
    eventFrame(lesson,'report outputs on fail-chain','在 e 同時回報 she 與 he','she 本身 terminal；沿 fail 到 he 也是 terminal，所以同一結束位置有兩個匹配。',{pos:3,matches:['she','he'],operation:'report fail-chain outputs'}),
    eventFrame(lesson,'while (u && !next[u][c])','下一個 r 沒有直接邊，沿 Fail 回退','從 she 沿 fail 到 he；he 有 r 邊，因此保留後綴資訊而不重掃 text。',{char:'r',from:'she',fallback:'he',operation:'failure fallback'}),
    eventFrame(lesson,'u=next[u][c]','讀 r、s 到達 hers','轉移 he→her→hers，最後 terminal。',{chars:['r','s'],state:'hers',operation:'advance after fallback'}),
    eventFrame(lesson,'report outputs on fail-chain','回報 hers','最終在 text index 5 找到 hers。',{matches:['she@1','he@2','hers@2'],operation:'finish multi-pattern search'}),
  ],

  'rabin-karp':(lesson)=>[
    eventFrame(lesson,'Hash target=hash(pattern)','Pattern="aba", Text="abacaba"','先算 target hash 與第一個長度 3 視窗 "aba" 的 hash；兩者相等。',{pattern:'aba',text:'abacaba',window:'aba',hashRelation:'window==target',operation:'initial hashes'}),
    eventFrame(lesson,'text.compare(i,m,pattern)==0','i=0：Hash Hit 後直接驗證','字串比較也相等，因此 report(0)。',{i:0,window:'aba',verified:'match',reports:['0'],operation:'verify hash hit'}),
    eventFrame(lesson,'window=roll','Roll 到 "bac"','移除左側 a、加入 c，O(1) 更新 window hash，不重新掃三個字元。',{from:'aba',to:'bac',i:'0→1',operation:'roll window'}),
    eventFrame(lesson,'window=roll','繼續 "aca"、"cab"','這些 window hash 都與 target 不同，直接略過字串比較。',{windows:['aca','cab'],decision:'hash mismatch',operation:'skip non-hits'}),
    eventFrame(lesson,'window=roll','Roll 到 i=4 的 "aba"','window hash 再次等於 target。',{i:4,window:'aba',hashRelation:'equal',operation:'second hash hit'}),
    eventFrame(lesson,'text.compare(i,m,pattern)==0','驗證後 report(4)','實際字元也完全相同；matches=[0,4]。',{reports:['0','4'],operation:'finish Rabin-Karp'}),
  ],

  'euclidean-algorithm':(lesson)=>[
    eventFrame(lesson,'while (b != 0)','求 gcd(252,105)','初始 a=252,b=105。每輪保留 gcd(a,b)=gcd(b,a%b)。',{a:252,b:105,operation:'initialize gcd'}),
    eventFrame(lesson,'long long r=a%b','252 % 105 = 42','狀態變成 (105,42)。',{division:'252=2·105+42',next:'(105,42)',operation:'euclid step'}),
    eventFrame(lesson,'long long r=a%b','105 % 42 = 21','狀態變成 (42,21)。',{division:'105=2·42+21',next:'(42,21)',operation:'euclid step'}),
    eventFrame(lesson,'long long r=a%b','42 % 21 = 0','狀態變成 (21,0)，while 結束。',{division:'42=2·21+0',next:'(21,0)',operation:'final remainder'}),
    eventFrame(lesson,'return a','回傳 gcd=21','b=0 時 gcd(a,0)=a，所以答案 21。',{result:21,operation:'return gcd'}),
  ],

  'extended-euclid':(lesson)=>[
    eventFrame(lesson,'exgcd(b,a%b)','exgcd(99,78) 向下遞迴','呼叫序列：(99,78)→(78,21)→(21,15)→(15,6)→(6,3)→(3,0)。',{calls:['99,78','78,21','21,15','15,6','6,3','3,0'],operation:'recursive Euclid'}),
    eventFrame(lesson,'if (!b) return {a,1,0}','Base Case (3,0)','回傳 g=3,x=1,y=0，滿足 3·1+0·0=3。',{a:3,b:0,g:3,x:1,y:0,operation:'base Bezout'}),
    eventFrame(lesson,'return {g,y1,x1-(a/b)*y1}','回到 (6,3)','由子解回推得到 x=0,y=1：6·0+3·1=3。',{a:6,b:3,x:0,y:1,identity:'6·0+3·1=3',operation:'back substitute'}),
    eventFrame(lesson,'return {g,y1,x1-(a/b)*y1}','回到 (15,6)','得到 x=1,y=-2：15·1+6·(-2)=3。',{a:15,b:6,x:1,y:-2,identity:'15-12=3',operation:'back substitute'}),
    eventFrame(lesson,'return {g,y1,x1-(a/b)*y1}','回到 (21,15)','得到 x=-2,y=3。',{a:21,b:15,x:-2,y:3,identity:'-42+45=3',operation:'back substitute'}),
    eventFrame(lesson,'return {g,y1,x1-(a/b)*y1}','回到 (78,21)','得到 x=3,y=-11。',{a:78,b:21,x:3,y:-11,identity:'234-231=3',operation:'back substitute'}),
    eventFrame(lesson,'return {g,y1,x1-(a/b)*y1}','最終 (99,78)：x=-11,y=14','99·(-11)+78·14 = -1089+1092 = 3。',{g:3,x:-11,y:14,identity:'99·(-11)+78·14=3',operation:'return Bezout coefficients'}),
  ],

  'modular-inverse':(lesson)=>[
    eventFrame(lesson,'extendedGcd(a,m)','求 17⁻¹ mod 43','Extended GCD 給 gcd(17,43)=1，且可得到 17·(-5)+43·2=1；等價係數也可正規化。',{a:17,m:43,g:1,rawX:-5,operation:'extended gcd'}),
    eventFrame(lesson,'if(g!=1)','g=1：Inverse 存在','只有互質時 ax≡1 mod m 才有解。',{g:1,decision:'inverse exists',operation:'check gcd'}),
    eventFrame(lesson,'x%=m; if(x<0)x+=m','正規化 -5 到 38','-5 mod 43 正規化為 38。',{before:-5,after:38,mod:43,operation:'normalize residue'}),
    eventFrame(lesson,'return x','驗證 17·38 ≡ 1','17·38=646=43·15+1，所以 inverse=38。',{inverse:38,check:'646 mod43=1',operation:'return inverse'}),
  ],

  'fast-exponentiation':(lesson)=>[
    eventFrame(lesson,'long long result=1','計算 3¹³ mod 17','初始 result=1,a=3,e=13（二進位 1101）。',{result:1,a:3,e:13,bits:'1101',operation:'initialize binary power'}),
    eventFrame(lesson,'if (e&1) result=result*a%mod','e=13 為 Odd：result=3','最低位 1，因此把目前 a=3 乘進 result。',{e:13,result:'1→3',a:3,operation:'consume set bit'}),
    eventFrame(lesson,'a=a*a%mod; e>>=1','平方 a，e 右移','a=9、e=6。',{a:'3→9',e:'13→6',operation:'square and shift'}),
    eventFrame(lesson,'a=a*a%mod; e>>=1','e=6 為 Even，只平方','不改 result；a=9² mod17=13，e=3。',{result:3,a:'9→13',e:'6→3',operation:'skip zero bit'}),
    eventFrame(lesson,'if (e&1) result=result*a%mod','e=3：result=5','3·13 mod17=5。',{result:'3→5',a:13,e:3,operation:'consume set bit'}),
    eventFrame(lesson,'a=a*a%mod; e>>=1','平方到 a=16，e=1','13² mod17=16。',{a:'13→16',e:'3→1',operation:'square and shift'}),
    eventFrame(lesson,'if (e&1) result=result*a%mod','最後一 Bit：result=12','5·16 mod17=12。',{result:'5→12',e:1,operation:'consume final bit'}),
    eventFrame(lesson,'} return result','e=0，回傳 12','總共只處理 O(log 13) 個 bit。',{result:12,operation:'return power'}),
  ],

  'prime-sieve':(lesson)=>[
    eventFrame(lesson,'vector<bool> prime','n=20，先假設全部可能是 Prime','接著把 0、1 設為 false。',{n:20,candidates:'2..20',operation:'initialize sieve'}),
    eventFrame(lesson,'prime[0]=prime[1]=false','排除 0、1','最小候選從 2 開始。',{nonPrime:['0','1'],operation:'remove non-primes'}),
    eventFrame(lesson,'if (prime[p])','p=2 尚未被標記，所以是 Prime','從 p²=4 開始標記倍數。',{p:2,start:4,operation:'select prime 2'}),
    eventFrame(lesson,'prime[x]=false','標記 4,6,8,...,20','所有偶合數被排除。',{p:2,marked:['4','6','8','10','12','14','16','18','20'],operation:'mark multiples'}),
    eventFrame(lesson,'if (prime[p])','p=3 仍為 Prime','從 9 開始標記；6 已由 2 處理，不需要重頭。',{p:3,start:9,operation:'select prime 3'}),
    eventFrame(lesson,'prime[x]=false','標記 9,12,15,18','新增排除 9、15；其他可能已被標記。',{p:3,marked:['9','12','15','18'],operation:'mark multiples'}),
    eventFrame(lesson,'for (int p=2;p*p<=n','p=4 不是 Prime；之後 5²>20','外迴圈可以結束，因任何合數 ≤20 都有 ≤√20 的質因數。',{stopAt:'p=5',operation:'finish sieve'}),
    eventFrame(lesson,'prime[x]=false','剩餘 Prime','2,3,5,7,11,13,17,19。',{primes:['2','3','5','7','11','13','17','19'],operation:'sieve result'}),
  ],

  'linear-sieve':(lesson)=>[
    eventFrame(lesson,'for(int x=2','n=10，lp 全 0','lp[x] 保存最小質因數；primes 一開始空。',{n:10,lp:'all 0',primes:[],operation:'initialize linear sieve'}),
    eventFrame(lesson,'if(lp[x]==0)','x=2：發現 Prime 2','lp[2]=2，push primes=[2]。',{x:2,lp2:2,primes:['2'],operation:'discover prime'}),
    eventFrame(lesson,'lp[x*p]=p','用 p=2 生成 4','lp[4]=2；4 只會由 x=2,p=2 這組最小質因數表示生成。',{x:2,p:2,product:4,lp4:2,operation:'generate composite'}),
    eventFrame(lesson,'if(lp[x]==0)','x=3：發現 Prime 3','lp[3]=3，primes=[2,3]。',{x:3,primes:['2','3'],operation:'discover prime'}),
    eventFrame(lesson,'lp[x*p]=p','x=3 生成 6 與 9','p=2→lp[6]=2；p=3→lp[9]=3。',{x:3,generated:['6:2','9:3'],operation:'generate composites'}),
    eventFrame(lesson,'if(p>lp[x]','x=4：只用 p=2','lp[4]=2，所以 p=2 生成 8 後，下一個 p=3>lp[4] 立即 break，避免重複生成 12 類狀態。',{x:4,generated:'8:2',breakAt:3,operation:'stop at least prime factor'}),
    eventFrame(lesson,'if(lp[x]==0)','x=5：發現 Prime 5','再用 p=2 生成 10；到 n=10 為止。',{x:5,primes:['2','3','5','7'],generated:'10:2',operation:'continue scan'}),
    eventFrame(lesson,'for(int x=2','完成 lp[2..10]','lp=[2,3,2,5,2,7,2,3,2]，Primes=[2,3,5,7]。',{lp:['2','3','2','5','2','7','2','3','2'],primes:['2','3','5','7'],operation:'finish linear sieve'}),
  ],

  'euler-totient':(lesson)=>[
    eventFrame(lesson,'long long phi','計算 φ(36)','result=36，工作變數 n=36。',{originalN:36,n:36,result:36,operation:'initialize totient'}),
    eventFrame(lesson,'n/=p;','p=2 是質因數','先把 n 中所有 2 除盡：36→18→9。',{p:2,n:'36→18→9',operation:'remove prime powers'}),
    eventFrame(lesson,'result-=result/p','排除 2 的倍數','result=36-18=18，相當於乘 (1-1/2)。',{p:2,result:'36→18',operation:'apply totient factor'}),
    eventFrame(lesson,'n/=p;','p=3 是另一質因數','n=9→3→1。',{p:3,n:'9→3→1',operation:'remove prime powers'}),
    eventFrame(lesson,'result-=result/p','排除 3 的倍數','result=18-6=12，相當於再乘 (1-1/3)。',{p:3,result:'18→12',operation:'apply totient factor'}),
    eventFrame(lesson,'if(n>1)','剩餘 n=1，不需額外處理','所有不同質因數都已處理完。',{remainingN:1,operation:'check remaining prime'}),
    eventFrame(lesson,'return result','φ(36)=12','1..36 中恰有 12 個數與 36 互質。',{result:12,operation:'return totient'}),
  ],
}

export const applyS2StringsMathOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  const coded=codeOverrides[lesson.id] ? {...lesson,code:codeOverrides[lesson.id]} : lesson
  const build=overrides[lesson.id]
  if(!build) return coded
  return {...coded,frames:build(coded),traceMode:'execution',animationVersion:2}
}

export const s2StringsMathOverrideIds=Object.freeze(Object.keys(overrides))
