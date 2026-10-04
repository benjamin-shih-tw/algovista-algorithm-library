import type { ExecutionView } from './algorithms'
import { list, source, trace } from './studentTrace'

export function centroidLesson(decomposition=false, inputEdges=[[0,1],[0,2],[1,3],[1,4],[3,5]], n=6) {
  let code=source(`struct CentroidSolver {
  vector<vector<int>> tree;
  vector<int> sz, removed, parent;
  CentroidSolver(const vector<vector<int>>& input) : tree(input), sz(input.size()), removed(input.size(), 0), parent(input.size(), -1) {}
  int sizeOf(int u, int p) {
    sz[u] = 1;
    for (int v : tree[u]) {
      if (v == p || removed[v]) continue;
      sz[u] += sizeOf(v, u);
    }
    return sz[u];
  }
  int walk(int u, int p, int total) {
    for (int v : tree[u]) {
      if (v == p || removed[v]) continue;
      if (sz[v] > total / 2) {
        return walk(v, u, total);
      }
    }
    return u;
  }
  int findCentroid(int start) {
    int total = sizeOf(start, -1);
    return walk(start, -1, total);
  }
  void decompose(int start, int p) {
    int c = findCentroid(start);
    parent[c] = p;
    removed[c] = 1;
    for (int v : tree[c]) {
      if (!removed[v]) decompose(v, c);
    }
  }
  vector<int> build() {
    decompose(0, -1);
    return parent;
  }
};`)
  if (!decomposition) code = [...code.slice(0, code.findIndex((line) => line.includes('void decompose'))), '};']
  const names=['A','B','C','D','E','F'],label=(u:number)=>u<0?'無':names[u]??String(u),positions=[[180,65],[430,150],[180,300],[690,150],[430,340],[840,310]]
  const tree:number[][]=Array.from({length:n},()=>[]);inputEdges.forEach(([u,v])=>{tree[u].push(v);tree[v].push(u)})
  const sz=Array(n).fill(0) as number[],removed=[...sz],parent=Array(n).fill(-1) as number[],assigned=new Set<number>(),calls:number[]=[]
  const view=(u=-1,centroidTree=false):ExecutionView=>({kind:'structure',title:centroidTree?'新建的重心樹（不是原樹的邊）':'原樹：數字為本輪計算的 sz，淡色點已移出分解範圍',nodes:Array.from({length:n},(_,v)=>({id:label(v),label:label(v),x:positions[v]?.[0]??100+v*100,y:positions[v]?.[1]??200,meta:centroidTree?(assigned.has(v)?`上層=${label(parent[v])}`:'待分解'):`sz=${sz[v]}${removed[v]?' · 已移除':''}`,active:v===u,muted:centroidTree?!assigned.has(v):Boolean(removed[v])})),edges:(centroidTree?parent.flatMap((p,v)=>p<0?[]:[[p,v]]):inputEdges).map(([a,b])=>({from:label(a),to:label(b),active:a===u||b===u,dashed:!centroidTree&&Boolean(removed[a]||removed[b])})),sequence:calls.map(label),badges:[`已移除=${list(removed.flatMap((v,i)=>v?[label(i)]:[]))}`,`呼叫路徑=${list(calls.map(label))}`]})
  const t=trace(code,{input:'原樹 A-B、A-C、B-D、B-E、D-F，共 6 點；A=0…F=5。輸入必須是一棵非空、連通、無環的無向樹。',goal:decomposition?'每次找目前區塊的重心，把它拿掉，再完整處理每個小區塊，建立一棵新的「重心樹」。不把處理完第一層誤稱整個分解完成。':'找一個點，拿掉它後，每塊剩餘區塊的點數都不超過原本一半。先算大小，再走向唯一過大的那一側。',terms:[{term:'子樹大小 sz[u]',meaning:'先選搜尋起點；從 u 往下，不走回父親、不穿過已移除點，能涵蓋多少個點，包含 u 自己。'},{term:'重心 centroid',meaning:'拿掉這個點後，任何一塊剩餘區塊都不超過原本總點數一半。它不是最小高度的「樹中心」。'},{term:'total / 2',meaning:'C++ 整數除法會捨去小數。例如 5/2=2，所以剩餘塊最多只能有 2 點。'},{term:'removed',meaning:'分解時標記不再穿過的點。原來的鄰接表不需要真的刪邊。'},{term:'重心樹 parent',meaning:'记录這個重心是由哪個上一層重心切出的區塊找到的。這個父子關係不是原樹的父子關係。'}],reasoning:['先從本區塊的起點計算大小；每個點先算自己 1，再加所有未移除的 child 大小。','若某個 child 大於總數一半，重心不可能在別側：拿掉別側的點，這個過大的區塊仍會留下。','往過大的 child 走時，背後那一側已經小於一半；因此只需繼續檢查更下方的 child。','沒有 child 超過一半時，所有側都合格，目前點就是重心。','分解时每個剩餘區塊最多原來一半。必須對每個區塊重新計算大小，不能沿用上一層的 total。'],boundaries:['兩點樹的兩點都是重心；程式可選其中任一個。','單點樹的重心是自己；分解後沒有子區塊。','空樹不要呼叫 findCentroid(0) 或 decompose(0,-1)；本範例輸入約定非空。','這是樹的演算法，不能直接放入有環的一般圖。重心分解的查詢用途需另外加入各層距離等資料，本課不假裝已完成那些功能。'],cost:decomposition?'每層所有區塊的總點數不超過 n，區塊最多每次減半；總時間 O(n log n)、結構空間 O(n)。重心樹深度 O(log n)，但計算大小的 DFS 呼叫深度仍可能 O(n)。':'算大小 O(n)，沿過大子樹走最多 O(n)，總時間 O(n)、空間 O(n)。',question:'這棵樹拿掉 B 後有哪些區塊？为什么不是只選畫面正中間的點？',answer:'剩下 {A,C}、{D,F}、{E}，大小 2、2、1，都不超過 6/2=3。重心根據區塊大小判斷，與畫圖位置無關。'})
  const add=(line:string,title:string,before:string,decision:string,after:string,why:string,u=-1,newTree=false)=>t.add(line,title,before,decision,after,why,view(u,newTree),{sizes:sz.map(String),removed:removed.map(String),parent:parent.map(String)})
  function sizeOf(u:number,p:number):number{calls.push(u);sz[u]=1;add('sz[u] = 1;',`計算 ${label(u)}：先算自己`,`本輪從 ${label(u)} 往下算，父點 ${label(p)}。`,`sz[${label(u)}]=1。`,'還沒把 child 大小加入。','每個點都算自己一次，不是從 0 開始。',u)
    for(const v of tree[u]){const skip=v===p||Boolean(removed[v]);add('if (v == p || removed[v]) continue;',`檢查大小計算的鄰居 ${label(v)}`,`父點=${label(p)}；removed[${label(v)}]=${removed[v]}。`,skip?'回到父親或已移除，略過。':'可走入這個 child。',`sz[${label(u)}]=${sz[u]}。`,'不回父親可避免在無向樹上往返；不穿過已移除重心才能只算當前區塊。',u);if(skip)continue
      const old=sz[u],child=sizeOf(v,u);sz[u]+=child;add('sz[u] += sizeOf(v, u);',`返回 ${label(u)}，加入 ${label(v)} 的大小`,`原本 ${old}，child 回傳 ${child}。`,`${old}+${child}=${sz[u]}。`,`sz[${label(u)}]=${sz[u]}。`,'子呼叫全部算完才累加，不能先拿未完成的大小。',u)}
    add('return sz[u];',`${label(u)} 的大小完成`,'這個點的鄰居都已處理。',`回傳 ${sz[u]}。`,`上層將收到 ${sz[u]}。`,'返回的是當前區塊、當前搜尋方向的子樹大小。',u);calls.pop();return sz[u]
  }
  function walk(u:number,p:number,total:number):number{for(const v of tree[u]){if(v===p||removed[v])continue
    const big=sz[v]>Math.floor(total/2);add('if (sz[v] > total / 2) {',`從 ${label(u)} 檢查 ${label(v)} 這側`,`區塊 total=${total}，sz[${label(v)}]=${sz[v]}。`,`${sz[v]}>${Math.floor(total/2)}：${big?'成立':'不成立'}。`,big?'這側過大，重心必須往這側找。':'這側合格，繼續看其他側。','只要還有一側超過一半，現在的點就不能當重心。',u)
    if(big){add('return walk(v, u, total);','走向唯一過大的那一側',`目前 ${label(u)}。`,`改在 ${label(v)} 找，total=${total} 不變。`,'這不是把 total 換成 child 大小。','仍然是在替同一個原區塊找重心；背後那側已小於一半。',v);return walk(v,u,total)}}
    add('return u;',`${label(u)} 通過所有側的大小檢查`,`所有未移除 child 都不超過 ${Math.floor(total/2)}。`,`回傳 ${label(u)}。`,`本區塊重心=${label(u)}。`,'起點沒有父側；移動後的父側已由「只走超過一半的 child」保證合格。',u);return u
  }
  function find(start:number){const total=sizeOf(start,-1);add('int total = sizeOf(start, -1);','取得這次區塊的總點數',`從 ${label(start)} 計算大小的呼叫已完成。`,`total=${total}。`,'接著用這個 total 找重心。','每次分解都必須重新計算，不能使用整棵原樹的總數。',start);return walk(start,-1,total)}
  function decompose(start:number,p:number){const c=find(start);add('int c = findCentroid(start);','本區塊的重心已找到',`從 ${label(start)} 開始找。`,`c=${label(c)}。`,'尚未移除重心。','先找到正确重心，才可以保證後續區塊至少減半。',c);parent[c]=p;assigned.add(c);add('parent[c] = p;','加入新的重心樹',`上一層重心是 ${label(p)}。`,`parent[${label(c)}]=${label(p)}。`,'此圖顯示重心樹；待分解的點暫無父邊。','這條邊記錄分解層次，不一定是原樹的一條邊。',c,true);removed[c]=1;add('removed[c] = 1;','把重心移出後续區塊',`removed[${label(c)}]=0。`,'改為 1。','回到原樹，之後不再穿過這個點。','原鄰接表保留，靠 removed 隔開不同區塊。',c)
    for(const v of tree[c]){add('if (!removed[v]) decompose(v, c);',`查看剩餘方向 ${label(v)}`,`removed[${label(v)}]=${removed[v]}。`,removed[v]?'已移除，不再處理。':`遞迴處理這一側，上層重心是 ${label(c)}。`,'其他側會在這個子呼叫完成後再處理。','每一側都是不同區塊，不能只處理第一個就結束。',v);if(!removed[v])decompose(v,c)}
  }
  if(n===0)throw new Error('Centroid lesson requires a nonempty tree')
  if(decomposition){
    decompose(0,-1)
    t.add('return parent;','所有區塊都分解完成','每個點都已擔任自己那一層的重心。','回傳完整重心樹的 parent。',parent.map((p,u)=>`${label(u)} 的上層=${label(p)}`).join('，'),'每個原樹節點在重心樹中恰好出現一次；根的 parent 是 −1。',view(-1,true),{parent:parent.map(String),removed:removed.map(String),result:list(parent)})
  }else{
    const result=find(0)
    t.add('return walk(start, -1, total);','交回整棵樹的重心','大小計算與所有過大側檢查都已完成。',`回傳 ${label(result)}。`,`重心是 ${label(result)}。`,'它讓每個剩餘區塊最多包含原來一半的點；不由畫面位置判斷。',view(result),{result,centroid:label(result),sizes:sz.map(String)})
  }
  return t.finish()
}

export function digitLesson(bound='25') {
  const code=source(`long long countDigitSumMultipleOf3(const string& bound) {
  using Layer = array<array<array<long long, 3>, 2>, 2>;
  Layer dp{};
  dp[1][0][0] = 1;
  for (char ch : bound) {
    int digit = ch - '0';
    Layer next{};
    for (int tight = 0; tight < 2; ++tight) {
      for (int started = 0; started < 2; ++started) {
        for (int rem = 0; rem < 3; ++rem) {
          long long ways = dp[tight][started][rem];
          if (ways == 0) continue;
          int limit = tight ? digit : 9;
          for (int d = 0; d <= limit; ++d) {
            int nt = tight && (d == digit);
            int ns = started || (d != 0);
            int nr = (rem + d) % 3;
            next[nt][ns][nr] += ways;
          }
        }
      }
    }
    dp = next;
  }
  return dp[0][1][0] + dp[1][1][0];
}`)
  type Layer=number[][][]
  const empty=():Layer=>Array.from({length:2},()=>Array.from({length:2},()=>[0,0,0]))
  let dp=empty();dp[1][0][0]=1
  const view=(data:Layer,pos:number,active?:string):ExecutionView=>({kind:'matrix',title:`已填 ${pos} 位：每格是填法數，不是某個數字`,rowLabels:['已小於上限／尚未開始','已小於上限／已開始','貼住上限／尚未開始','貼住上限／已開始'],colLabels:['數位和餘 0','數位和餘 1','數位和餘 2'],cells:data.flatMap((row)=>row.map((values)=>values.map(String))),activeCells:active?[active]:[],badges:['tight：是否仍等於上限前綴','started：是否放過非 0 位數']})
  const t=trace(code,{input:`上限 ${bound}。數字 1 到 ${bound} 中，數位相加後能被 3 整除的有幾個？`,goal:'一位一位選數字，把「未來可選數字相同」的路徑合在同一格計數。完整保留上限限制、前導零、餘數、初始值、轉移與最後排除 0。',terms:[{term:'位數位置 pos',meaning:'目前已填幾位；由左到右處理。填 01 代表數字 1，不是額外多一個數。'},{term:'tight',meaning:'1 表示目前前綴仍和上限完全一樣，下一位不能超過上限該位；0 表示已經較小，下一位可選 0..9。'},{term:'started',meaning:'是否已放過非 0 的數位。全部前導零代表數字 0，最後不算入正整數答案。'},{term:'rem',meaning:'目前數位和除以 3 的餘數，只會是 0、1、2。'},{term:'ways／dp',meaning:'dp[tight][started][rem] 存到達這個狀態的填法數，不是最大值或單一選法。'},{term:'狀態合併／memoization',meaning:'只要已填位數與三個狀態相同，後續選擇就相同。本課用逐層加總的 DP；遞迴寫法可用 memoization（記住子問題答案）重用，兩者不要混為一個假遞迴。'}],reasoning:['什麼都沒填有 1 種方法，所以 dp[1][0][0]=1；不能整張表都留 0，否則沒有路徑能開始。','每輪讀舊層 dp，寫新層 next；若直接寫回 dp，同一個位數可能被重複處理。','仍貼上限時只選 0..該位數字；選得更小後 tight 變 0，不可能重新變 1。','加上 d 後，數位和餘數是 (rem+d)%3；不同前綴到達同格時要相加，不是覆蓋。','填完所有位後，只取 started=1、rem=0 的兩種 tight，正好排除全零而保留全部合法正整數。'],boundaries:['bound 必須是非空十進位數字字串；這個 long long 範例限定最多 18 位，避免計數溢位。','上限 0 回傳 0；上限 2 也回傳 0；上限 3 回傳 1。','如果題目把 0 也算進答案，就必須改最後的 started 篩選，而不是任意改初值。','「數位和可被 3 整除」剛好也等價於數本身可被 3 整除，可用來獨立核對，但不能把這個特例當所有 Digit DP 題目的捷徑。'],cost:'L 位上限，每層 2×2×3=12 個狀態，每格最多試 10 個數位，所以時間 O(L×120)，滾動兩層的額外空間 O(12)。',question:'把 next 清為 0，會不會把上一層答案弄丟？',answer:'不會。這一輪仍從 dp 讀舊計數，把每種選字結果加到 next。全部舊狀態處理完才用 dp=next 換層；兩張表不能提前混在一起。'})
  t.add('dp[1][0][0] = 1;','空前綴只有一種填法','兩層表的格子先填 0。','把 tight=1、started=0、rem=0 這格設為 1。','還沒填數字，已有 1 條起始路徑。','若起點也是 0，後面再怎麼相加都不會得到任何答案。',view(dp,0,'2,0'),{pos:0,counts:dp.flat(2).map(String)})
  for(let pos=0;pos<bound.length;pos++){
    const digit=Number(bound[pos]),next=empty()
    t.add('int digit = ch - \'0\';',`準備第 ${pos+1} 位`,`上限這一位的字元是「${bound[pos]}」。`,`digit=${digit}。`,'貼住上限的路徑不能選超過這個數字。','字元與數值分開：減掉字元 0 才得到可計算的整數。',view(dp,pos),{pos})
    t.add('Layer next{};','清空新一層','舊層 dp 保持不變。','next 的 12 格全部設成 0。','畫面現在顯示準備填的 next。','每次多填一位，都要重新累加新一層，不能留下上一輪 next。',view(next,pos+1),{pos,counts:next.flat(2).map(String)})
    for(let tight=0;tight<2;tight++)for(let started=0;started<2;started++)for(let rem=0;rem<3;rem++){
      const ways=dp[tight][started][rem]
      t.add('if (ways == 0) continue;','這個舊狀態有填法嗎？',`舊 dp[${tight}][${started}][${rem}]=${ways}。`,ways===0?'ways=0，沒有路徑，直接略過。':`有 ${ways} 種前綴，接著各自擴展一位。`,'新層目前不變。','0 是沒有填法，不是可隨便增加一種填法。',view(next,pos+1),{pos,tight,started,rem,ways})
      if(!ways)continue
      const limit=tight?digit:9
      t.add('int limit = tight ? digit : 9;','決定這一位能選多大',`tight=${tight}，上限該位 ${digit}。`,`limit=${limit}，可選 0..${limit}。`,'接著逐個數位 d 處理。',tight?'前綴仍相等，這位不能超過上限。':'前綴已經較小，後面無論選哪一位都不會超過上限。',view(next,pos+1),{pos,tight,limit})
      for(let d=0;d<=limit;d++){
        const nt=Number(Boolean(tight)&&d===digit),ns=Number(Boolean(started)||d!==0),nr=(rem+d)%3,old=next[nt][ns][nr]
        next[nt][ns][nr]+=ways
        t.add('next[nt][ns][nr] += ways;',`這一位選 ${d}，把填法送進新格`, `舊狀態 (${tight},${started},${rem}) 有 ${ways} 種；目標格原有 ${old}。`,`nt=${tight} 且 ${d}==${digit} → ${nt}；ns=${started} 或 ${d}≠0 → ${ns}；nr=(${rem}+${d})%3=${nr}。`,`next[${nt}][${ns}][${nr}]：${old}+${ways}=${next[nt][ns][nr]}。`,'這步包含緊接在高亮加總前的三行新狀態計算。每個舊前綴選同一個 d，都得到一個不同新前綴，因此加 ways。',view(next,pos+1,`${nt*2+ns},${nr}`),{pos,tight,started,rem,d,nt,ns,nr,ways,previous:old,nextCount:next[nt][ns][nr],counts:next.flat(2).map(String)})
      }
    }
    dp=next;t.add('dp = next;',`第 ${pos+1} 位全部完成`,'這一位的所有舊狀態都處理完。','用 next 取代 dp。',`現在每條路徑都恰好填了 ${pos+1} 位。`,'只有整層完成才換表，確保一輪只增加一位。',view(dp,pos+1),{pos:pos+1,counts:dp.flat(2).map(String)})
  }
  const result=dp[0][1][0]+dp[1][1][0]
  t.add('return dp[0][1][0] + dp[1][1][0];','只取正整數且餘數為 0 的格子',`較小前綴 ${dp[0][1][0]} 種，恰等於上限 ${dp[1][1][0]} 種。`,`${dp[0][1][0]}+${dp[1][1][0]}=${result}。`,`答案 ${result}；全零路徑不算。`,'started=1 排除 0；rem=0 才符合數位和可被 3 整除。',view(dp,bound.length),{result,counts:dp.flat(2).map(String)})
  return t.finish()
}
