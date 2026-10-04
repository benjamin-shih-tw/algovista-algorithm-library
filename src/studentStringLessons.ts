import { list, source, table, trace } from './studentTrace'

export function kmpLesson(p = 'ababaca') {
  const code = source(`vector<int> prefixFunction(const string& p) {
  int n = p.size();
  vector<int> pi(n, 0);
  for (int i = 1; i < n; ++i) {
    int j = pi[i - 1];
    while (j > 0 && p[i] != p[j]) {
      j = pi[j - 1];
    }
    if (p[i] == p[j]) {
      ++j;
    }
    pi[i] = j;
  }
  return pi;
}`)
  const pi = Array(p.length).fill(0) as number[]
  const view = (i = -1, j = -1) => table('同一字串：前端與目前結尾比較', ['位置', '字元', 'pi：相同頭尾長度', '本步角色'], [...p].map((c, k) => [k, c, pi[k], [k === i ? '新字元 i' : '', k === j ? '前端待比較 j' : ''].filter(Boolean).join('／') || '—']), i, ['位置從 0 開始', 'pi[0] 固定為 0'])
  const t = trace(code, {
    input: `字串 p="${p}"。小格的編號從 0 開始。`, goal: '建立 KMP 的前綴表 pi：走到每一格時，找出「開頭」與「目前結尾」相同的最長長度；不能把整段自己當答案。本課先把 KMP 的回退機制學完整，不把建表畫成另一段文字搜尋。',
    terms: [{term:'前綴 prefix／後綴 suffix',meaning:'前綴從第一格開始取；後綴必須取到目前最後一格。例如 aba 的非完整相同頭尾是 a，長度 1。'}, {term:'pi[i]',meaning:'只看 p[0..i] 時，最長且不是整段的相同頭尾長度。0 表示沒有。'}, {term:'i、j',meaning:'i 是這輪新加入字元的位置；j 是已經相同的長度，也是前端下一格的位置。'}, {term:'回退',meaning:'字元不同時，把 j 換成更短、但已證明相同的頭尾長度；i 留在原地。'}],
    reasoning: ['上一格已算好的 pi[i−1] 是這輪最長的起始候選，不必從頭比較。', '若下一字元不同，長度 j 的候選不行；它自己的最長相同頭尾 pi[j−1] 是下一個可能候選。更長的其他長度已被前綴表排除。', '若字元相同，原本相同的 j 格可以多接一格，成為 j+1。若退到 0 仍不同，答案就是 0。', '建表是 KMP 搜尋可重用的部分。搜尋文字時同樣以 j 回退，但這課顯示的是 p 自己的建表，不是文字的命中位置。'],
    boundaries: ['空字串回傳空表；單一字元只有 pi[0]=0。', '全部相同如 aaaa，答案是 [0,1,2,3]，不是 [1,2,3,4]。', '回退不能令 i 往回走，也不能每次都直接把 j 清為 0。'], cost: 'n 是字元數。i 只往右；j 每次增加最多 1，回退的總次數不會超過增加次數，因此時間 O(n)、表格空間 O(n)。',
  })
  t.add('vector<int> pi(n, 0);','先建一張全 0 的表','還沒有 pi 表。',`建立 ${p.length} 格，先填 0。`, `pi=${list(pi)}；後面的格子尚待計算。`,'單一字元沒有比自己短的非空頭尾，所以 pi[0]=0。',view(),{pi:pi.map(String)})
  for (let i=1;i<p.length;i++) {
    let j=pi[i-1]
    t.add('int j = pi[i - 1];',`讀取上一格，準備處理位置 ${i}`,`p[${i}]=${p[i]}；pi[${i-1}]=${j}。`,`令 j=${j}。`,`候選長度 ${j}，接著比較 p[${i}] 與 p[${j}]。`,'沿用已知相同的頭尾，不重新比較已知相同的字元。',view(i,j),{i,j,pi:pi.map(String)})
    while (true) {
      const condition = j>0 && p[i]!==p[j]
      t.add('while (j > 0 && p[i] != p[j]) {','先問：還能回退嗎？',`i=${i}，j=${j}。`,j===0?'j>0 不成立；&& 後面的字元比較不需要執行。':`${j}>0 且 ${p[i]}≠${p[j]}：${condition?'成立':'不成立'}。`,condition?'準備縮短 j；本步尚未改動 pi。':'離開回退迴圈，接著檢查能否延長。','while 只控制是否進入；把判斷與改值分開看。',view(i,j),{i,j})
      if (!condition) break
      const old=j;j=pi[j-1]
      t.add('j = pi[j - 1];','保留更短的相同頭尾',`舊 j=${old}，pi[${old-1}]=${j}。`,`j：${old} → ${j}；i=${i} 不動。`,`下一次比較位置為 p[${i}] 與 p[${j}]。`,'原候選失敗，但它內部較短的相同頭尾仍可能接上新字元。',view(i,j),{i,j})
    }
    const equal=p[i]===p[j]
    t.add('if (p[i] == p[j]) {','比較能否多接一格',`p[${i}]=${p[i]}，p[${j}]=${p[j]}。`,`${p[i]} == ${p[j]}：${equal?'成立':'不成立'}。`,equal?'下一步增加 j。':'j 保持 0，沒有相同頭尾。','只有兩個新字元相同，才可在原本相同的片段後各加一格。',view(i,j),{i,j})
    if (equal) { const old=j;j++;t.add('++j;','相同長度增加 1',`j=${old}。`,`j=${old}+1=${j}。`,`相同片段是「${p.slice(0,j)}」。`,'這裡增加的是長度，不是 i。',view(i,j),{i,j}) }
    pi[i]=j
    t.add('pi[i] = j;',`寫下 pi[${i}]`, `pi[${i}] 尚未定案。`,`把 ${j} 寫入第 ${i} 格。`,`pi=${list(pi)}。`,'所有更長候選已被排除，現在的長度才是最長合法答案。',view(i,j),{i,j,pi:pi.map(String)})
  }
  t.add('return pi;','交回整張前綴表',`已處理 ${p.length} 個字元。`,'沒有未處理的位置，回傳 pi。',list(pi),'每格記錄自己的答案；最後一格不是整張表的替代品。',view(),{pi:pi.map(String),result:list(pi)})
  return t.finish()
}

export function zLesson(s='ababa') {
  const code=source(`vector<int> zFunction(const string& s) {
  int n = s.size();
  vector<int> z(n, 0);
  int l = 0, r = 0;
  for (int i = 1; i < n; ++i) {
    if (i < r) {
      z[i] = min(r - i, z[i - l]);
    }
    while (i + z[i] < n && s[z[i]] == s[i + z[i]]) {
      ++z[i];
    }
    if (i + z[i] > r) {
      l = i;
      r = i + z[i];
    }
  }
  return z;
}`)
  const z=Array(s.length).fill(0) as number[];let l=0,r=0
  const view=(i=-1)=>table('每個起點與字串開頭能連續相同幾格', ['位置','字元','z 長度','已知區間'],[...s].map((c,k)=>[k,c,z[k],k>=l&&k<r?'在 [l,r) 內':'—']),i,[`l=${l}，r=${r}；r 不包含在區間內`])
  const t=trace(code,{input:`s="${s}"，位置從 0 開始。`,goal:'算出每個起點能與字串開頭連續匹配幾個字元；重用已比過的部分，只比較尚不知道的部分。',terms:[{term:'z[i]',meaning:'從位置 i 開始，與 s 的開頭連續相同的長度。本實作把 z[0] 定為 0。'},{term:'[l,r)／Z-box',meaning:'已知與開頭相同、而且右端最遠的一段。包含 l，不包含 r。'},{term:'i−l',meaning:'i 在已知區間裡離左邊有多遠；在字串開頭的對應位置也是這個距離。'},{term:'min',meaning:'取兩個數中較小的；不能把已知區間外的部分也當成確定相同。'}],reasoning:['區間 [l,r) 已經比過，與 s[0..r−l) 相同，因此區間內可以找對應位置重用。','只能安全重用到 r 前一格，所以取 min(r−i,z[i−l])。','重用後繼續逐字比較；遇到不同或到達字串結尾才停止。','新區間比舊區間伸得更右才更新 l、r。z 表的舊格子不會被這個更新清掉。'],boundaries:['空字串回傳空表；只有一格時回傳 [0]。','r 是第一個不包含的位置，不能寫成 r−i+1。','z[0] 也有其他定義；本課一律用 0，避免和長度 n 混用。'],cost:'n 是字元數；右端 r 不後退，額外成功比較只會把右端往右延伸。時間 O(n)，表格 O(n)。'})
  t.add('int l = 0, r = 0;','從空的已知區間開始','z 全部先填 0。','令 l=0、r=0。','[0,0) 裡沒有字元。','沒有比較過的資料，不能憑空重用。',view(),{z:z.map(String)})
  for(let i=1;i<s.length;i++) {
    t.add('if (i < r) {',`處理起點 ${i}`,`i=${i}，r=${r}。`,`${i}<${r}：${i<r?'成立，能重用區間內資料':'不成立，要從長度 0 比較'}。`,`目前 z[${i}]=0。`,'先確定是否位在已知區間內，再讀對應的 z 值。',view(i),{i,l,r,z:z.map(String)})
    if(i<r){const old=z[i-l];z[i]=Math.min(r-i,old);t.add('z[i] = min(r - i, z[i - l]);','只抄已證明的部分',`右側已知長度 ${r-i}，z[${i-l}]=${old}。`,`min(${r-i},${old})=${z[i]}。`,`z[${i}]=${z[i]}。`,'超出右界的字元尚未比較，不能跟著複製。',view(i),{i,l,r,z:z.map(String)})}
    while(true){const end=i+z[i]>=s.length,equal=!end&&s[z[i]]===s[i+z[i]]
      t.add('while (i + z[i] < n && s[z[i]] == s[i + z[i]]) {','檢查下一對字元',`i=${i}，z[${i}]=${z[i]}。`,end?`${i}+${z[i]}=${s.length}，已到結尾；不能再讀字元。`:`s[${z[i]}]=${s[z[i]]} 與 s[${i+z[i]}]=${s[i+z[i]]}：${equal?'相同':'不同'}。`,equal?'下一步增加匹配長度。':'本起點的匹配停止。','先檢查位置還在字串內，才可以讀取字元。',view(i),{i,l,r,z:z.map(String)})
      if(!equal)break
      const old=z[i];z[i]++;t.add('++z[i];','又確認一格相同',`已相同 ${old} 格。`,`長度 ${old}→${z[i]}。`,`目前相同片段「${s.slice(i,i+z[i])}」。`,'一次只增加已實際比對成功的一格。',view(i),{i,l,r,z:z.map(String)})
    }
    const farther=i+z[i]>r
    t.add('if (i + z[i] > r) {','是否伸到更右邊？',`舊 r=${r}。`,`${i}+${z[i]} > ${r}：${farther?'成立':'不成立'}。`,farther?'準備更新已知區間。':'保留舊區間。','維護的是右端最遠的區間，而不是每輪都重設。',view(i),{i,l,r})
    if(farther){l=i;t.add('l = i;','更新左端',`新起點是 ${i}。`,`l=${i}。`,'接著更新右端；這兩行一起建立新區間。','本步只改 l，下一步才改 r。',view(i),{i,l,r});r=i+z[i];t.add('r = i + z[i];','更新右端',`起點 ${i}，匹配長度 ${z[i]}。`,`r=${i}+${z[i]}=${r}。`,`已知區間 [${l},${r})。`,'右界不包含，區間長度才恰好是 z[i]。',view(i),{i,l,r,z:z.map(String)})}
  }
  t.add('return z;','回傳每個起點的答案','每個起點都已處理。','回傳 z。',list(z),'答案來自字元比對與有邊界的重用，不是播放進度。',view(),{result:list(z),z:z.map(String)})
  return t.finish()
}

export function rollingLesson(s='abca',left=1,right=3) {
  const code=source(`long long substringHash(const string& s, int l, int r) {
  const long long base = 31, mod = 101;
  int n = s.size();
  vector<long long> h(n + 1, 0), power(n + 1, 1);
  for (int i = 0; i < n; ++i) {
    h[i + 1] = (h[i] * base + (s[i] - 'a' + 1)) % mod;
    power[i + 1] = power[i] * base % mod;
  }
  return (h[r] - h[l] * power[r - l] % mod + mod) % mod;
}`)
  const h=Array(s.length+1).fill(0) as number[],power=Array(s.length+1).fill(1) as number[]
  const view=(i=-1)=>table('前綴指紋與 31 的次方', ['前綴長度 k','s[0..k)','h[k]','power[k]'],h.map((v,k)=>[k,s.slice(0,k)||'空',v,power[k]]),i,['a=1、b=2…z=26','% 101 = 除以 101 的餘數'])
  const t=trace(code,{input:`小寫字串 "${s}"，查詢 [${left},${right})，即「${s.slice(left,right)}」。`,goal:'先把每段開頭算成短數字，再用減法去掉不需要的前段，快速得到指定片段的數字指紋。指紋相同不保證字串相同。',terms:[{term:'雜湊 hash／指紋',meaning:'把字串照固定規則變成數字，方便先做快速篩選；不同字串仍可能得到同一個數字。'},{term:'base=31',meaning:'每加一個字元，舊值先乘 31，再加字元編號，保留順序的影響。'},{term:'mod=101、%',meaning:'只保留除以 101 的餘數，避免數字一直變長；101 在這裡是方便手算的小範例，不是安全防碰撞參數。'},{term:'h[k]、power[k]',meaning:'h[k] 是前 k 個字元的指紋；power[k] 是 31 的 k 次方除以 101 的餘數。'},{term:'[l,r)',meaning:'包含位置 l，不包含位置 r；總長度 r−l。'}],reasoning:['h[k+1]=(h[k]×31+新字元編號)%101，從空字串的 0 逐格建立。','h[r] 裡面，前 l 格因為後面又加了 r−l 格，已被多乘 31 的 r−l 次方。','所以不能只減 h[l]；要減 h[l]×power[r−l]，才留下片段本身。','減法可能得到負數，先加 mod 再取餘數，結果回到 0..100。'],boundaries:['須有 0≤l≤r≤n，且本函式只定義小寫 a..z。','l=r 是空片段，結果 0；不能因此認定所有指紋 0 的片段都是空字串。','小模數刻意容易碰撞。需要精確相等時，再比原字串；雙雜湊也只降低碰撞率。'],cost:'n 是字元數。建立表 O(n)、每次合法區間查詢 O(1)、空間 O(n)。本函式每次呼叫會重建表；多次查詢時應把建表獨立出來並共用。'})
  t.add('vector<long long> h(n + 1, 0), power(n + 1, 1);','準備空前綴','尚未讀入任何字元。','建立 n+1 格。','h[0]=0；power[0]=1；後面的格子是待計算初值。','多一格存空前綴，讓從位置 0 開始的查詢也用同一公式。',view(0),{h:h.map(String),power:power.map(String)})
  for(let i=0;i<s.length;i++){const old=h[i],value=s.charCodeAt(i)-96;h[i+1]=(old*31+value)%101
    t.add("h[i + 1] = (h[i] * base + (s[i] - 'a' + 1)) % mod;",`加入字元 ${s[i]}`,`h[${i}]=${old}；${s[i]} 的編號 ${value}。`,`(${old}×31+${value})%101=${h[i+1]}。`,`h[${i+1}]=${h[i+1]}。`,'先乘再加；交換字元順序通常會改變指紋。',view(i+1),{i,h:h.map(String),power:power.map(String)})
    power[i+1]=power[i]*31%101;t.add('power[i + 1] = power[i] * base % mod;','準備去掉前段需要的乘數',`power[${i}]=${power[i]}。`,`${power[i]}×31%101=${power[i+1]}。`,`power[${i+1}]=${power[i+1]}。`,'逐次乘 31，查詢時就不必重新計算次方。',view(i+1),{i,h:h.map(String),power:power.map(String)})
  }
  const removed=h[left]*power[right-left]%101,result=(h[right]-removed+101)%101
  t.add('return (h[r] - h[l] * power[r - l] % mod + mod) % mod;','去掉前段，只留下查詢片段',`h[r]=${h[right]}，h[l]=${h[left]}，power[r−l]=${power[right-left]}。`,`(${h[right]}−${removed}+101)%101=${result}。`,`「${s.slice(left,right)}」的指紋是 ${result}。`,'右段的位置權重已經對齊；這是指紋，不是字串本身或保證唯一的編號。',view(-1),{result,h:h.map(String),power:power.map(String)})
  return t.finish()
}

export function rabinLesson(text='abacaba',pattern='aba') {
  const code=source(`vector<int> rabinKarp(const string& text, const string& pattern) {
  const long long base = 31, mod = 101;
  int n = text.size(), m = pattern.size();
  vector<int> matches;
  if (m == 0 || m > n) return matches;
  long long target = 0, window = 0, power = 1;
  for (int k = 0; k < m; ++k) {
    target = (target * base + (pattern[k] - 'a' + 1)) % mod;
    window = (window * base + (text[k] - 'a' + 1)) % mod;
    if (k + 1 < m) power = power * base % mod;
  }
  for (int i = 0; i + m <= n; ++i) {
    if (window == target) {
      if (text.compare(i, m, pattern) == 0) {
        matches.push_back(i);
      }
    }
    if (i + m < n) {
      window = (window - (text[i] - 'a' + 1) * power % mod + mod) % mod;
      window = (window * base + (text[i + m] - 'a' + 1)) % mod;
    }
  }
  return matches;
}`)
  let target=0,window=0,power=1;const matches:number[]=[];const m=pattern.length,n=text.length,value=(c:string)=>c.charCodeAt(0)-96
  const view=(i=-1,remaining?:string)=>table('逐格移動同樣長度的視窗', ['位置','文字字元','目前視窗'],[...text].map((c,k)=>[k,c,i>=0&&k>=i&&k<i+(remaining?.length??m)?'視窗內':'—']),undefined,[`目標「${pattern}」指紋=${target}`,`視窗${remaining===undefined?'':`剩餘「${remaining}」`}指紋=${window}`,`已找到=${list(matches)}`])
  const t=trace(code,{input:`文字「${text}」，找「${pattern}」的所有起點。`,goal:'先用指紋跳過不可能的視窗；指紋相同時再逐字檢查，確保沒有把碰撞當命中。',terms:[{term:'視窗 window',meaning:'文字裡連續 m 格。每次往右一格：去掉最左字元，再補入右邊新字元。'},{term:'target',meaning:'要找的 pattern 的指紋，整個搜尋過程保持不變。'},{term:'power',meaning:'31 的 m−1 次方取餘數，正好是視窗最左字元所乘的權重。'},{term:'碰撞',meaning:'字串不同但指紋一樣。這是可能發生的，不能只比數字。'},{term:'matches',meaning:'已逐字驗證成功的起點清單，從 0 編號。'}],reasoning:['長度 m 的每個候選視窗都要掃到，包括最後起點 n−m。','視窗指紋不同就一定不是同樣字串；相同只能代表值得再檢查。','滾動時先減去舊左端的加權值，再乘 base，最後加入新右端。','即使全部視窗發生碰撞，逐字驗證仍保證答案正確，只是速度會變慢。'],boundaries:['本課只處理小寫字母；空 pattern 約定回傳空清單，不在所有邊界回報。','pattern 比文字長時，不能讀取第一個視窗，直接回傳空清單。','重疊命中也要保留，例如 aaaa 找 aa 的起點是 0、1、2。'],cost:'建第一個指紋 O(m)，每次移窗 O(1)；每次指紋命中再花 O(m) 驗證。通常接近 O(n+m)，最壞 O(nm)，答案之外的額外空間 O(1)。'})
  const invalid=m===0||m>n
  t.add('if (m == 0 || m > n) return matches;','先確認視窗放得下',`文字長 ${n}，pattern 長 ${m}。`,`m==0 或 m>n：${invalid?'成立':'不成立'}。`,invalid?'依約定回傳空清單。':'可以建立第一個視窗。','先檢查才能避免越界讀字元。',view(),{matches:[]})
  if(invalid)return t.finish()
  for(let k=0;k<m;k++){
    const a=target;target=(target*31+value(pattern[k]))%101;t.add("target = (target * base + (pattern[k] - 'a' + 1)) % mod;",`建立目標指紋：讀 ${pattern[k]}`,`target=${a}。`,`(${a}×31+${value(pattern[k])})%101=${target}。`,`target=${target}。`,'建目標與視窗時必須用相同規則。',view(0),{target,window})
    const b=window;window=(window*31+value(text[k]))%101;t.add("window = (window * base + (text[k] - 'a' + 1)) % mod;",`建立首個視窗：讀 ${text[k]}`,`window=${b}。`,`(${b}×31+${value(text[k])})%101=${window}。`,`window=${window}。`,'此時只是在建第一個視窗，不代表已找到答案。',view(0),{target,window})
    const old=power;if(k+1<m)power=power*31%101;t.add('if (k + 1 < m) power = power * base % mod;','準備最左端權重',`k=${k}，power=${old}。`,`${k+1}<${m}：${k+1<m?'成立，乘 31':'不成立，不再乘'}。`,`power=${power}。`,'長度 m 的最左端只乘 m−1 次 31，不是 m 次。',view(0),{power})
  }
  for(let i=0;i+m<=n;i++){
    t.add('if (window == target) {',`檢查視窗 ${i}：「${text.slice(i,i+m)}」`,`window=${window}，target=${target}。`,`${window} == ${target}：${window===target?'成立':'不成立'}。`,window===target?'接著逐字檢查。':'跳過這個視窗，不逐字檢查。','相同字串一定產生相同指紋；反方向不成立。',view(i),{i,target,window,matches:matches.map(String)})
    if(window===target){const equal=text.slice(i,i+m)===pattern;t.add('if (text.compare(i, m, pattern) == 0) {','指紋相同，核對全部字元',`候選「${text.slice(i,i+m)}」，目標「${pattern}」。`,`逐字比較：${equal?'完全相同':'不同，這是碰撞'}。`,equal?'可以加入起點。':'不加入答案。','這一步才保證精確匹配。',view(i),{i,verified:equal?'match':'collision'});if(equal){matches.push(i);t.add('matches.push_back(i);','記錄一個真正命中',`起點 ${i} 已驗證。`,`加入 ${i}。`,`matches=${list(matches)}。`,'下一輪仍只右移一格，所以不漏掉重疊命中。',view(i),{matches:matches.map(String)})}}
    t.add('if (i + m < n) {','右邊還有字元嗎？',`目前右側下一格是 ${i+m}，總長 ${n}。`,`${i+m}<${n}：${i+m<n?'成立':'不成立'}。`,i+m<n?'可以移動視窗。':'已檢查最後視窗，停止。','沒有新字元時不能再讀 text[i+m]。',view(i),{i})
    if(i+m<n){const old=window;window=(window-value(text[i])*power%101+101)%101;t.add("window = (window - (text[i] - 'a' + 1) * power % mod + mod) % mod;",'先移除最左字元',`window=${old}，左端 ${text[i]}=${value(text[i])}，權重 ${power}。`,`(${old}−${value(text[i])*power%101}+101)%101=${window}。`,`剩下「${text.slice(i+1,i+m)}」的指紋 ${window}。`,'先去掉舊字元的完整權重，還沒補右邊字元。',view(i+1,text.slice(i+1,i+m)),{i,window});const rest=window;window=(window*31+value(text[i+m]))%101;t.add("window = (window * base + (text[i + m] - 'a' + 1)) % mod;",'再加入右邊新字元',`剩餘指紋 ${rest}，新字元 ${text[i+m]}=${value(text[i+m])}。`,`(${rest}×31+${value(text[i+m])})%101=${window}。`,`新視窗「${text.slice(i+1,i+m+1)}」，指紋 ${window}。`,'這兩行完成一次真正的滾動更新。',view(i+1),{i:i+1,window})}
  }
  t.add('return matches;','交回所有起點','每個長度 m 的視窗都已檢查。','回傳 matches。',list(matches),'每個回報位置都經過逐字驗證。',view(),{result:list(matches),matches:matches.map(String)})
  return t.finish()
}
