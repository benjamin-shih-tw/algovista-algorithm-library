import type { AlgorithmLesson, Frame } from './algorithms'
import { eventFrame, lineNumber } from './traceAuthoring'

type TraceBuilder = (lesson: AlgorithmLesson) => Frame[]

const monotonicStackView = (frame: Frame): NonNullable<Frame['executionView']> => {
  const stack = Array.isArray(frame.state?.stack) ? frame.state.stack : []
  return {kind:'table',title:'MONOTONIC STACK · bottom → top',
    columns:['index','a[i]','in stack'],
    rows:(frame.values??[]).map((value,index)=>[String(index),String(value),stack.includes(String(value))?'候選':'—']),
    activeCells:frame.active?.map((index)=>`${index},1`),
    badges:[`stack = [${stack.join(',')}]`,...(frame.state?.incoming!==undefined?[`incoming = ${frame.state.incoming}`]:[]),...(frame.state?.removed!==undefined?[`removed = ${frame.state.removed}`]:[])],
  }
}
const nextGreaterView = (frame: Frame, step: number): NonNullable<Frame['executionView']> => {
  const answers=[['-1','-1','-1','-1','-1'],['-1','-1','-1','-1','-1'],['-1','5','-1','-1','-1'],['-1','5','-1','-1','-1'],['5','5','-1','-1','-1'],['5','5','-1','-1','-1'],['5','5','-1','-1','-1'],['5','5','-1','4','-1'],['5','5','-1','4','-1']][step]
  const stack=Array.isArray(frame.state?.stack)?frame.state.stack:[]
  return {kind:'table',title:'NEXT GREATER · first larger value to the right',
    columns:['index','a[i]','NGE[i]'],
    rows:(frame.values??[]).map((value,index)=>[String(index),String(value),answers[index]]),
    activeCells:frame.active?.map((index)=>`${index},1`),
    badges:['-1 = 尚未找到',`pending stack = [${stack.join(',')}]`,...(frame.state?.resolved?[String(frame.state.resolved)]:[])],
  }
}
const monotonicQueueView = (frame: Frame, step: number): NonNullable<Frame['executionView']> => {
  const deque=Array.isArray(frame.state?.deque)?frame.state.deque:Array.isArray(frame.state?.finalDeque)?frame.state.finalDeque:[]
  const output=['[]','[]','[]','[]','[3]','[3]','[3,3]','[3,3]','[3,3]','[3,3,5]','[3,3,5,5]','[3,3,5,5]','[3,3,5,5,6]','[3,3,5,5,6]','[3,3,5,5,6,7]'][step]
  return {kind:'table',title:'MONOTONIC DEQUE · front is window maximum',
    columns:['index','a[i]','in deque'],
    rows:(frame.values??[]).map((value,index)=>[String(index),String(value),deque.some((entry)=>entry.startsWith(`${index}(`))?'候選':'—']),
    activeCells:frame.active?.map((index)=>`${index},1`),
    badges:['k = 3',`deque = [${deque.join(',')}]`,...(frame.state?.window?[`window = ${frame.state.window}`]:[]),`output = ${output}`],
  }
}

const floydMatrix = (aToC: string, aToD: string, bToD: string, activeCells: string[] = []): NonNullable<Frame['executionView']> => ({
  kind: 'matrix', title: 'FLOYD–WARSHALL · dist[i][j]',
  rowLabels: ['A', 'B', 'C', 'D'], colLabels: ['A', 'B', 'C', 'D'],
  cells: [['0', '3', aToC, aToD], ['∞', '0', '2', bToD], ['∞', '∞', '0', '1'], ['∞', '∞', '∞', '0']],
  activeCells,
})
const editWrites = [
  { row: 1, col: 1, value: '0' }, { row: 1, col: 2, value: '1' }, { row: 1, col: 3, value: '2' },
  { row: 2, col: 1, value: '1' }, { row: 2, col: 2, value: '1' }, { row: 2, col: 3, value: '1' },
]
const editMatrix = (step: number): NonNullable<Frame['executionView']> => {
  const cells = [['0','1','2','3'],['1','—','—','—'],['2','—','—','—']]
  for (const write of editWrites.slice(0, step)) cells[write.row][write.col] = write.value
  const active = editWrites[step - 1]
  return { kind:'matrix', title:'EDIT DISTANCE · dp[i][j]', rowLabels:['∅','a','ab'], colLabels:['∅','a','ac','acb'], cells,
    activeCells:active ? [`${active.row},${active.col}`] : [] }
}
const lcsMatrix = (frame: Frame): NonNullable<Frame['executionView']> => {
  const rows = (frame.state?.table as string[] | undefined) ?? ['0 0 0 0','0 0 1 1','0 1 1 1','0 1 1 2']
  const cell = String(frame.state?.cell ?? '').match(/dp\[(\d+)\]\[(\d+)\]/)
  const activeCells = cell ? [`${cell[1]},${cell[2]}`] : frame.state?.result === 2 ? ['3,3'] : []
  return { kind:'matrix', title:'LCS · dp[i][j]', rowLabels:['∅','A','AB','ABC'], colLabels:['∅','B','BA','BAC'],
    cells:rows.map((row)=>row.split(/\s+/).map((value)=>value==='·'?'—':value)), activeCells }
}
const bitmaskView = (step: number): NonNullable<Frame['executionView']> => {
  const snapshots = [
    ['0','∞','∞','∞','∞','∞','∞','∞'],
    ['0','∞','∞','∞','∞','∞','∞','∞'],
    ['0','4','∞','∞','∞','∞','∞','∞'],
    ['0','4','2','∞','∞','∞','∞','∞'],
    ['0','4','2','6','9','12','3','∞'],
    ['0','4','2','6','9','12','3','7'],
    ['0','4','2','6','9','12','3','4'],
    ['0','4','2','6','9','12','3','4'],
  ]
  const active = [0,0,1,2,6,7,7,7][step]
  return {kind:'table',title:'BITMASK DP · dp[mask] minimum cost',columns:['mask','selected','dp[mask]'],
    rows:snapshots[step].map((value,mask)=>[mask.toString(2).padStart(3,'0'),[0,1,2].filter((bit)=>mask & (1<<bit)).join(',')||'∅',value]),
    activeRow:active,
  }
}
const tspView = (step: number): NonNullable<Frame['executionView']> => {
  const states = [
    ['0001','0','0','0'], ['0011','1','0→1','2'], ['0101','2','0→2','9'],
    ['1001','3','0→3','10'], ['1011','3','0→1→3','6'], ['1111','2','0→1→3→2','9'],
  ]
  return {kind:'table',title:'TSP DP · selected states and tour closure',
    columns:['mask','end','path','cost'],rows:step<6?states.slice(0,step+1):[...states,['tour','0','return 2→0','18']],
    activeRow:step<6?step:6,badges:step>=6?['minimum tour = 18']:[],
  }
}

const codeOverrides: Record<string, string[]> = {
  'monotonic-stack': [
    'stack<int> decreasingCandidates(const vector<int>& a) {',
    '  stack<int> st;',
    '  for (int x : a) {',
    '    while (!st.empty() && st.top() <= x) st.pop();',
    '    st.push(x);',
    '  }',
    '  return st;',
    '}',
  ],
  'next-greater-element': [
    'vector<int> nextGreaterToRight(const vector<int>& a) {',
    '  int n=(int)a.size();',
    '  vector<int> answer(n,-1);',
    '  stack<int> st;',
    '  for(int i=0;i<n;++i){',
    '    while(!st.empty() && a[st.top()]<a[i]){',
    '      answer[st.top()]=a[i];',
    '      st.pop();',
    '    }',
    '    st.push(i);',
    '  }',
    '  return answer;',
    '}',
  ],
  'monotonic-queue': [
    'vector<int> monotonicWindowMaximum(const vector<int>& a,int k) {',
    '  int n=(int)a.size();',
    '  if(k<=0 || k>n) return {};',
    '  deque<int> dq;',
    '  vector<int> answer;',
    '  for (int i=0;i<n;++i) {',
    '    while (!dq.empty() && dq.front() <= i-k) dq.pop_front();',
    '    while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();',
    '    dq.push_back(i);',
    '    if (i >= k-1) answer.push_back(a[dq.front()]);',
    '  }',
    '  return answer;',
    '}',
  ],
  'bitmask-dp': [
    'long long minMaskCost(int n, const vector<vector<long long>>& costByMask) {',
    '  const long long INF = numeric_limits<long long>::max() / 4;',
    '  vector<long long> dp(1 << n, INF);',
    '  dp[0] = 0;',
    '  for (int mask=0; mask<(1<<n); ++mask) {',
    '    if (dp[mask] == INF) continue;',
    '    for (int x=0; x<n; ++x)',
    '      if (!(mask>>x&1))',
    '        dp[mask|(1<<x)] = min(dp[mask|(1<<x)], dp[mask]+costByMask[mask][x]);',
    '  }',
    '  return dp[(1<<n)-1];',
    '}',
  ],
  'connected-components': [
    'void dfs(int u) {',
    '  seen[u] = true;',
    '  for (int v : graph[u])',
    '    if (!seen[v]) dfs(v);',
    '}',
    'int components = 0;',
    'for (int u = 0; u < n; ++u) {',
    '  if (seen[u]) continue;',
    '  ++components;',
    '  dfs(u);',
    '}',
  ],
  'quickselect': [
    'int partitionRange(int l, int r) {',
    '  int pivot = a[r], p = l;',
    '  for (int i = l; i < r; ++i)',
    '    if (a[i] < pivot) swap(a[i], a[p++]);',
    '  swap(a[p], a[r]);',
    '  return p;',
    '}',
    'int quickselect(int l, int r, int k) {',
    '  int p = partitionRange(l, r);',
    '  if (p == k) return a[p];',
    '  if (k < p) return quickselect(l, p - 1, k);',
    '  return quickselect(p + 1, r, k);',
    '}',
  ],
  'binary-heap': [
    'vector<int> heap;',
    'void pushMinHeap(int x) {',
    '  heap.push_back(x);',
    '  int i = (int)heap.size() - 1;',
    '  while (i > 0) {',
    '    int p = (i - 1) / 2;',
    '    if (heap[p] <= heap[i]) break;',
    '    swap(heap[p], heap[i]);',
    '    i = p;',
    '  }',
    '}',
    'int popMinHeap() {',
    '  int result = heap[0];',
    '  heap[0] = heap.back(); heap.pop_back();',
    '  int i = 0;',
    '  while (2 * i + 1 < (int)heap.size()) {',
    '    int child = 2 * i + 1;',
    '    if (child + 1 < (int)heap.size() && heap[child + 1] < heap[child]) ++child;',
    '    if (heap[i] <= heap[child]) break;',
    '    swap(heap[i], heap[child]);',
    '    i = child;',
    '  }',
    '  return result;',
    '}',
  ],
  'tsp-dp': [
    'long long shortestTour(const vector<vector<long long>>& w, int start=0) {',
    '  int n = w.size(); if (n == 0) return 0;',
    '  const long long INF = numeric_limits<long long>::max() / 4;',
    '  vector<vector<long long>> dp(1 << n, vector<long long>(n, INF));',
    'dp[1 << start][start] = 0;',
    'for (int mask = 0; mask < (1 << n); ++mask)',
    '  for (int u = 0; u < n; ++u) if (mask >> u & 1) {',
    '    if (dp[mask][u] == INF) continue;',
    '    for (int v = 0; v < n; ++v) if (!(mask >> v & 1))',
    '      dp[mask | (1 << v)][v] = min(dp[mask | (1 << v)][v], dp[mask][u] + w[u][v]);',
    '  }',
    'int full = (1 << n) - 1; long long answer = INF;',
    'for (int u = 0; u < n; ++u)',
    '  answer = min(answer, dp[full][u] + w[u][start]);',
    'return answer;',
    '}',
  ],
  'merge-sort': [
    'void mergeSort(int l, int r) {',
    '  if (r - l <= 1) return;',
    '  int m = (l + r) / 2;',
    '  mergeSort(l, m);',
    '  mergeSort(m, r);',
    '  vector<int> tmp;',
    '  int i = l, j = m;',
    '  while (i < m && j < r) {',
    '    if (a[i] <= a[j]) {',
    '      tmp.push_back(a[i]);',
    '      ++i;',
    '    } else {',
    '      tmp.push_back(a[j]);',
    '      ++j;',
    '    }',
    '  }',
    '  while (i < m) { tmp.push_back(a[i]); ++i; }',
    '  while (j < r) { tmp.push_back(a[j]); ++j; }',
    '  copy(tmp.begin(), tmp.end(), a.begin() + l);',
    '}',
  ],
}

const lessonOverrides: Record<string, Partial<AlgorithmLesson>> = {
  'merge-sort': {
    description:'以完整四元素 execution 示範遞迴拆分、左右子問題回傳與逐步 merge；每個可見資料 mutation 都對應實際 C++ 行。',
  },
  'monotonic-stack': {
    description: '以遞減 Stack 示範候選的 push/pop；這堂只維護候選，不計算題目答案。',
  },
  'zero-one-bfs': {
    edges: [
      {from:'A',to:'B',weight:1},{from:'A',to:'C',weight:0},
      {from:'B',to:'D',weight:1},{from:'B',to:'E',weight:0},
      {from:'C',to:'E',weight:1},{from:'D',to:'F',weight:0},
      {from:'E',to:'F',weight:1},
    ],
  },
  'bellman-ford': {
    edges: [
      {from:'A',to:'B',weight:4},{from:'A',to:'C',weight:2},
      {from:'C',to:'B',weight:-3},{from:'B',to:'D',weight:2},
      {from:'D',to:'E',weight:2},{from:'E',to:'B',weight:-6},
      {from:'D',to:'F',weight:2},
    ],
  },
  'floyd-warshall': {
    points: [
      {id:'A',x:12,y:50,label:'A'},{id:'B',x:38,y:20,label:'B'},
      {id:'C',x:62,y:70,label:'C'},{id:'D',x:88,y:40,label:'D'},
    ],
    edges: [
      {from:'A',to:'B',weight:3},{from:'A',to:'C',weight:10},
      {from:'A',to:'D',weight:20},{from:'B',to:'C',weight:2},
      {from:'B',to:'D',weight:8},{from:'C',to:'D',weight:1},
    ],
  },
  'euler-circuit': {
    edges: [
      {from:'A',to:'B'},{from:'B',to:'D'},{from:'D',to:'F'},
      {from:'F',to:'E'},{from:'E',to:'C'},{from:'C',to:'A'},
    ],
  },
  'tree-diameter': {
    edges: [
      {from:'A',to:'B'},{from:'A',to:'C'},{from:'B',to:'D'},
      {from:'B',to:'E'},{from:'D',to:'F'},
    ],
  },
  'lca-binary-lifting': {
    edges: [
      {from:'A',to:'B'},{from:'A',to:'C'},{from:'B',to:'D'},
      {from:'B',to:'E'},{from:'D',to:'F'},
    ],
  },
  'euler-tour-flattening': {
    edges: [
      {from:'A',to:'B'},{from:'A',to:'C'},{from:'B',to:'D'},
      {from:'B',to:'E'},{from:'D',to:'F'},
    ],
  },
  'tarjan-scc': {
    edges: [
      {from:'A',to:'B'},{from:'B',to:'C'},{from:'C',to:'A'},
      {from:'C',to:'D'},{from:'D',to:'E'},{from:'E',to:'D'},
      {from:'E',to:'F'},
    ],
  },
  'bridges': {
    edges: [
      {from:'A',to:'B'},{from:'B',to:'C'},{from:'C',to:'A'},
      {from:'B',to:'D'},{from:'D',to:'E'},{from:'E',to:'F'},{from:'F',to:'D'},
    ],
  },
  'articulation-points': {
    edges: [
      {from:'A',to:'B'},{from:'B',to:'C'},{from:'C',to:'A'},
      {from:'B',to:'D'},{from:'D',to:'E'},{from:'E',to:'F'},{from:'F',to:'D'},
    ],
  },
  'tree-centroid': {
    edges: [
      {from:'A',to:'B'},{from:'A',to:'C'},{from:'B',to:'D'},
      {from:'B',to:'E'},{from:'D',to:'F'},
    ],
  },
  'heavy-light-decomposition': {
    edges: [
      {from:'A',to:'B'},{from:'A',to:'C'},{from:'B',to:'D'},
      {from:'B',to:'E'},{from:'D',to:'F'},
    ],
  },
  'centroid-decomposition': {
    edges: [
      {from:'A',to:'B'},{from:'A',to:'C'},{from:'B',to:'D'},
      {from:'B',to:'E'},{from:'D',to:'F'},
    ],
  },
  'tree-isomorphism': {
    edges: [
      {from:'A',to:'B'},{from:'A',to:'C'},{from:'B',to:'D'},
      {from:'B',to:'E'},{from:'D',to:'F'},
    ],
  },
}

const overrides: Record<string, TraceBuilder> = {
  'stack': (lesson) => [
    eventFrame(lesson,'stack<int> st','建立空 Stack','一開始 stack 為空；之後所有操作都只發生在 top。',{stack:[],operation:'initialize'}),
    eventFrame(lesson,'st.push(2)','Push 2','把 2 放到頂端。現在 top=2。',{stack:['2'],top:2,operation:'push 2'},{values:[2],active:['0']}),
    eventFrame(lesson,'st.push(5)','Push 5','把 5 放到 2 上方。因為 Stack 是 LIFO，下一個被讀取或移除的一定是 5。',{stack:['2','5'],top:5,operation:'push 5'},{values:[2,5],active:['1']}),
    eventFrame(lesson,'st.top()','讀取 Top','top() 讀到 5，但不修改 Stack。',{stack:['2','5'],returned:5,operation:'read top'},{values:[2,5],active:['1'],accepted:['1']}),
    eventFrame(lesson,'st.pop()','Pop 5','pop() 移除目前頂端 5；2 再次成為 top。',{stack:['2'],top:2,removed:5,operation:'pop'},{values:[2],active:['0'],accepted:['0']}),
  ],

  'queue': (lesson) => [
    eventFrame(lesson,'queue<int> q','建立空 Queue','一開始 queue 為空；新元素從 back 加入，舊元素從 front 離開。',{queue:[],operation:'initialize'}),
    eventFrame(lesson,'q.push(2)','2 從 Back 入隊','2 是第一個進入的元素，因此同時是 front 與 back。',{queue:['2'],front:2,back:2,operation:'enqueue 2'},{values:[2],active:['0']}),
    eventFrame(lesson,'q.push(5)','5 從 Back 入隊','5 排在 2 後面；FIFO 保證 2 仍然先被處理。',{queue:['2','5'],front:2,back:5,operation:'enqueue 5'},{values:[2,5],active:['1']}),
    eventFrame(lesson,'q.front()','讀取 Front','front() 回傳等待最久的 2，但 queue 內容不變。',{queue:['2','5'],returned:2,operation:'read front'},{values:[2,5],active:['0'],accepted:['0']}),
    eventFrame(lesson,'q.pop()','2 從 Front 出隊','移除 2 後，5 成為新的 front。',{queue:['5'],front:5,removed:2,operation:'dequeue'},{values:[5],active:['0'],accepted:['0']}),
  ],

  'deque': (lesson) => [
    eventFrame(lesson,'deque<int> dq','建立空 Deque','Deque 的 front 與 back 都可以 O(1) 加入或移除。',{deque:[],operation:'initialize'}),
    eventFrame(lesson,'dq.push_back(5)','從 Back 加入 5','5 放到右端；此時左右端都是 5。',{deque:['5'],front:5,back:5,operation:'push_back 5'},{values:[5],active:['0']}),
    eventFrame(lesson,'dq.push_front(2)','從 Front 加入 2','2 放到左端，內容變成 [2,5]。',{deque:['2','5'],front:2,back:5,operation:'push_front 2'},{values:[2,5],active:['0']}),
    eventFrame(lesson,'dq.pop_back()','從 Back 移除 5','右端的 5 被移除，只剩 2。',{deque:['2'],front:2,back:2,removed:5,operation:'pop_back'},{values:[2],active:['0']}),
    eventFrame(lesson,'dq.pop_front()','從 Front 移除 2','左端的 2 被移除，Deque 回到空集合。',{deque:[],removed:2,operation:'pop_front'},{values:[],accepted:[]}),
  ],

  'parentheses-matching': (lesson) => [
    eventFrame(lesson,'st.push(c);','讀到 (：執行 Push','isOpen(c) 為 true，真正改變 Stack 的是這一行 st.push(c)。Push 後 stack=[(]。',{input:'([{}])',i:0,current:'(',stack:['('],operation:'push open'},{values:[1,2,3,4,5,6],active:['0']}),
    eventFrame(lesson,'st.push(c);','讀到 [：執行 Push','第二個左括號同樣走 true branch，執行 st.push(c) 後 stack=[(,[ ]。',{input:'([{}])',i:1,current:'[',stack:['(','['],operation:'push open'},{values:[1,2,3,4,5,6],active:['1']}),
    eventFrame(lesson,'st.push(c);','讀到 {：執行 Push','第三個左括號 Push 後成為 top；此時 stack=[(,[,{]。',{input:'([{}])',i:2,current:'{',stack:['(','[','{'],operation:'push open'},{values:[1,2,3,4,5,6],active:['2']}),
    eventFrame(lesson,'if (st.empty())','讀到 }：先檢查 Stack 是否為空','isOpen(}) 為 false，因此進入 else。st.empty() 為 false，代表有左括號可供配對。',{input:'([{}])',i:3,current:'}',empty:'false',stack:['(','[','{'],operation:'check non-empty'},{values:[1,2,3,4,5,6],active:['3']}),
    eventFrame(lesson,'if (!match(st.top(), c))','檢查 { 與 } 是否同型','top 是 {，match({,}) 為 true，所以 !match 為 false，不會 return false。',{input:'([{}])',i:3,current:'}',top:'{',match:'true',stack:['(','[','{'],operation:'check pair'},{values:[1,2,3,4,5,6],active:['2','3']}),
    eventFrame(lesson,'st.pop();','{} 配對成功：Pop {','配對確認成功後才執行 pop；Stack 由 [(,[,{] 變成 [(,[]。',{input:'([{}])',i:3,current:'}',stack:['(','['],operation:'pop matched open'},{values:[1,2,3,4,5,6],accepted:['2','3']}),
    eventFrame(lesson,'if (st.empty())','讀到 ]：Stack 仍非空','進入 else 後先檢查 st.empty()；目前 top=[，所以 empty=false。',{input:'([{}])',i:4,current:']',empty:'false',stack:['(','['],operation:'check non-empty'},{values:[1,2,3,4,5,6],active:['4']}),
    eventFrame(lesson,'if (!match(st.top(), c))','檢查 [ 與 ] 是否同型','match([,]) 為 true，因此不會提前 return false。',{input:'([{}])',i:4,current:']',top:'[',match:'true',stack:['(','['],operation:'check pair'},{values:[1,2,3,4,5,6],active:['1','4']}),
    eventFrame(lesson,'st.pop();','[] 配對成功：Pop [','確認成功後執行 pop；Stack 只剩最外層的 (。',{input:'([{}])',i:4,current:']',stack:['('],operation:'pop matched open'},{values:[1,2,3,4,5,6],accepted:['1','2','3','4']}),
    eventFrame(lesson,'if (st.empty())','讀到 )：最後一次 Empty Check','Stack 內仍有 (，因此 empty=false，可以繼續做型別檢查。',{input:'([{}])',i:5,current:')',empty:'false',stack:['('],operation:'check non-empty'},{values:[1,2,3,4,5,6],active:['5']}),
    eventFrame(lesson,'if (!match(st.top(), c))','檢查 ( 與 ) 是否同型','match((,)) 為 true，最後一組括號通過型別檢查。',{input:'([{}])',i:5,current:')',top:'(',match:'true',stack:['('],operation:'check pair'},{values:[1,2,3,4,5,6],active:['0','5']}),
    eventFrame(lesson,'st.pop();','() 配對成功：Pop (','最後一次 pop 後 Stack 變空，六個字元都已正確處理。',{input:'([{}])',i:5,current:')',stack:[],operation:'pop matched open'},{values:[1,2,3,4,5,6],accepted:['0','1','2','3','4','5']}),
    eventFrame(lesson,'return st.empty()','掃描完成：檢查沒有未閉合括號','for loop 結束後回傳 st.empty()。現在為 true，因此整個字串合法。',{stack:[],result:'valid',operation:'verify empty'},{accepted:['0','1','2','3','4','5']}),
  ],

  'monotonic-stack': (lesson) => [
    eventFrame(lesson,'st.push(x)','讀入 2','Stack 為空，2 直接成為第一個候選。',{incoming:2,stack:['2'],operation:'push 2'},{values:[2,1,5,3,4,7],active:['0']}),
    eventFrame(lesson,'st.push(x)','讀入 1：保持遞減','1<2，不需要 pop；push 後 Stack=[2,1]。',{incoming:1,stack:['2','1'],operation:'push 1'},{values:[2,1,5,3,4,7],active:['0','1']}),
    eventFrame(lesson,'st.pop()','讀入 5：先 Pop 1','1≤5，1 被更晚且更大的 5 支配，永遠不會再成為更好的候選。',{incoming:5,stack:['2'],removed:1,operation:'pop dominated'},{values:[2,1,5,3,4,7],active:['1','2'],muted:['1']}),
    eventFrame(lesson,'st.pop()','5 繼續 Pop 2','2≤5，同理移除 2。每個元素最多只會被 pop 一次。',{incoming:5,stack:[],removed:2,operation:'pop dominated'},{values:[2,1,5,3,4,7],active:['0','2'],muted:['0','1']}),
    eventFrame(lesson,'st.push(x)','Push 5','被支配元素清空後，把 5 放入 Stack。',{incoming:5,stack:['5'],operation:'push 5'},{values:[2,1,5,3,4,7],active:['2'],accepted:['2']}),
    eventFrame(lesson,'st.push(x)','讀入 3：Push','3<5，Stack 變成 [5,3]。',{incoming:3,stack:['5','3'],operation:'push 3'},{values:[2,1,5,3,4,7],active:['2','3']}),
    eventFrame(lesson,'st.pop()','讀入 4：Pop 3','3≤4，3 被 4 支配，因此移除 3。',{incoming:4,stack:['5'],removed:3,operation:'pop dominated'},{values:[2,1,5,3,4,7],active:['3','4'],muted:['3']}),
    eventFrame(lesson,'st.push(x)','Push 4','5>4，停止 pop 並 push 4，恢復嚴格遞減 Stack=[5,4]。',{incoming:4,stack:['5','4'],operation:'push 4'},{values:[2,1,5,3,4,7],active:['2','4']}),
    eventFrame(lesson,'st.pop()','讀入 7：清掉 4 與 5','7 比目前所有候選都大，因此依序 pop 4、5。',{incoming:7,stack:[],removed:'4,5',operation:'pop dominated values'},{values:[2,1,5,3,4,7],active:['2','4','5'],muted:['2','4']}),
    eventFrame(lesson,'st.push(x)','Push 7，掃描完成','最後 Stack=[7]；這是候選維護示範，不是題目答案。每個元素最多 push/pop 各一次，總成本 O(n)。',{incoming:7,stack:['7'],operation:'push 7',result:'O(n)'},{values:[2,1,5,3,4,7],active:['5'],accepted:['5']}),
  ].map((frame)=>({...frame,executionView:monotonicStackView(frame)})),

  'next-greater-element': (lesson) => [
    eventFrame(lesson,'st.push(i)','i=0，2 尚未有答案','把索引 0 放入 Stack，等待右側第一個更大的值。',{i:0,value:2,stack:['0(2)'],answers:['-1','-1','-1','-1','-1'],operation:'push index'},{values:[2,1,5,3,4],active:['0']}),
    eventFrame(lesson,'st.push(i)','i=1，1 也等待答案','1<2，不會解決索引 0；索引 1 也入 Stack。',{i:1,value:1,stack:['0(2)','1(1)'],answers:['-1','-1','-1','-1','-1'],operation:'push index'},{values:[2,1,5,3,4],active:['0','1']}),
    eventFrame(lesson,'answer[st.top()]','i=2，5 解決索引 1','5>1，所以 NGE[1]=5；先寫答案再 pop 索引 1。',{i:2,value:5,resolved:'NGE[1]=5',stack:['0(2)','1(1)'],operation:'resolve top'},{values:[2,1,5,3,4],active:['1','2'],accepted:['1']}),
    eventFrame(lesson,'st.pop()','Pop 索引 1','索引 1 已經得到第一個右側更大值，不再需要留在 Stack。',{i:2,stack:['0(2)'],removed:'1(1)',operation:'pop resolved index'},{values:[2,1,5,3,4],active:['0','2']}),
    eventFrame(lesson,'answer[st.top()]','5 繼續解決索引 0','5>2，而且 1 並沒有比 2 大，所以 5 也是 2 的第一個右側更大值。',{i:2,value:5,resolved:'NGE[0]=5',stack:['0(2)'],operation:'resolve top'},{values:[2,1,5,3,4],active:['0','2'],accepted:['0','1']}),
    eventFrame(lesson,'st.push(i)','把索引 2 放入 Stack','前面較小元素都已解決，現在 5 自己等待右側更大值。',{i:2,value:5,stack:['2(5)'],answers:['5','5','-1','-1','-1'],operation:'push index'},{values:[2,1,5,3,4],active:['2']}),
    eventFrame(lesson,'st.push(i)','i=3，3 入 Stack','3<5，不能解決 5，因此索引 3 入 Stack。',{i:3,value:3,stack:['2(5)','3(3)'],operation:'push index'},{values:[2,1,5,3,4],active:['2','3']}),
    eventFrame(lesson,'answer[st.top()]','i=4，4 解決索引 3','4>3，因此 NGE[3]=4。',{i:4,value:4,resolved:'NGE[3]=4',stack:['2(5)','3(3)'],operation:'resolve top'},{values:[2,1,5,3,4],active:['3','4'],accepted:['3']}),
    eventFrame(lesson,'st.push(i)','掃描結束','索引 2(5) 與 4(4) 右側沒有更大值，因此答案維持 -1。',{stack:['2(5)','4(4)'],answers:['5','5','-1','4','-1'],operation:'finish unresolved'},{values:[2,1,5,3,4],accepted:['0','1','2','3','4']}),
  ].map((frame,step)=>({...frame,executionView:nextGreaterView(frame,step)})),

  'dfs': (lesson) => [
    eventFrame(lesson,'visited[u] = true','進入 A：立即標記','DFS 一進入節點就標記 visited，避免沿環回到 A。',{current:'A',callStack:['A'],visited:['A'],operation:'mark A'},{active:['A'],accepted:['A']}),
    eventFrame(lesson,'dfs(v, u)','A → B：遞迴深入','B 尚未訪問，因此呼叫 dfs(B,A)。父呼叫 A 會留在 call stack 等待。',{current:'B',callStack:['A','B'],visited:['A','B'],treeEdges:['A-B'],operation:'descend A-B'},{active:['A','B'],accepted:['A','B']}),
    eventFrame(lesson,'dfs(v, u)','B → D：繼續深入','D 尚未訪問，DFS 沿 B→D 深入。',{current:'D',callStack:['A','B','D'],visited:['A','B','D'],treeEdges:['A-B','B-D'],operation:'descend B-D'},{active:['B','D'],accepted:['A','B','D']}),
    eventFrame(lesson,'dfs(v, u)','D → F：到達葉端','F 是 D 的未訪鄰居，遞迴進入 F。',{current:'F',callStack:['A','B','D','F'],visited:['A','B','D','F'],treeEdges:['A-B','B-D','D-F'],operation:'descend D-F'},{active:['D','F'],accepted:['A','B','D','F']}),
    eventFrame(lesson,'for (int v : graph[u])','F 沒有新鄰居：開始回溯','F 的鄰居都已處理，dfs(F,D) 返回 D，再回到 B。',{returnFrom:'F',callStack:['A','B','D'],visited:['A','B','D','F'],operation:'return from F'},{active:['D'],accepted:['A','B','D','F']}),
    eventFrame(lesson,'dfs(v, u)','B → E：處理下一個分支','回到 B 後繼續掃鄰接串列，E 尚未訪問，因此進入 E。',{current:'E',callStack:['A','B','E'],visited:['A','B','D','E','F'],treeEdges:['A-B','B-D','D-F','B-E'],operation:'descend B-E'},{active:['B','E'],accepted:['A','B','D','E','F']}),
    eventFrame(lesson,'dfs(v, u)','A → C：完成另一個分支','B 子樹完成後回到 A；C 尚未訪問，因此進入 C。',{current:'C',callStack:['A','C'],visited:['A','B','C','D','E','F'],treeEdges:['A-B','B-D','D-F','B-E','A-C'],operation:'descend A-C'},{active:['A','C'],accepted:['A','B','C','D','E','F']}),
    eventFrame(lesson,'if (v == parent || visited[v]) continue','遇到已訪 E：跳過','C 的 E 已在 B 子樹被標記，visited[E]=true，因此不重複遞迴。',{current:'C',neighbor:'E',decision:'visited → skip',visited:['A','B','C','D','E','F'],operation:'skip visited edge'},{active:['C','E'],accepted:['A','B','C','D','E','F']}),
  ],

  'flood-fill': (lesson) => [
    eventFrame(lesson,'if (!inside(r,c)','檢查起點 A','A 在網格內且顏色等於 oldColor，所以可以進入這個連通區。',{cell:'A',inside:'true',colorMatch:'true',painted:[],operation:'check A'},{active:['A']}),
    eventFrame(lesson,'grid[r][c] = newColor','染色 A','先把 A 改成 newColor；這同時就是 visited 標記。',{cell:'A',painted:['A'],frontier:['B','C'],operation:'paint A'},{active:['A'],accepted:['A']}),
    eventFrame(lesson,'fill(r+dr, c+dc)','A → B','沿一個方向進入相鄰同色格 B。',{cell:'B',painted:['A'],frontier:['B','C'],callStack:['A','B'],operation:'recurse to B'},{active:['A','B'],accepted:['A']}),
    eventFrame(lesson,'grid[r][c] = newColor','染色 B','B 第一次被成功進入，因此立即染色。',{cell:'B',painted:['A','B'],frontier:['C','D','E'],operation:'paint B'},{active:['B'],accepted:['A','B']}),
    eventFrame(lesson,'fill(r+dr, c+dc)','B → D','繼續沿同色連通區走到 D。',{cell:'D',painted:['A','B'],callStack:['A','B','D'],operation:'recurse to D'},{active:['B','D'],accepted:['A','B']}),
    eventFrame(lesson,'grid[r][c] = newColor','染色 D','D 被標記，之後從其他方向碰到 D 會立即返回。',{cell:'D',painted:['A','B','D'],operation:'paint D'},{active:['D'],accepted:['A','B','D']}),
    eventFrame(lesson,'fill(r+dr, c+dc)','逐步擴張到剩餘格','遞迴依相同規則處理 C、E、F；異色或越界方向在 guard 直接返回。',{painted:['A','B','C','D','E','F'],componentSize:6,operation:'finish component'},{active:['C','E','F'],accepted:['A','B','C','D','E','F']}),
  ],

  'multi-source-bfs': (lesson) => [
    eventFrame(lesson,'dist[s] = 0','把 A、F 都設為距離 0','所有來源同時是第 0 層；先設定 dist=0 再入隊。',{sources:['A','F'],dist:'A=0,F=0',queue:['A','F'],operation:'initialize sources'},{active:['A','F'],accepted:['A','F'],queue:['A','F'],distances:{A:0,F:0,B:'∞',C:'∞',D:'∞',E:'∞'}}),
    eventFrame(lesson,'int u = q.front()','Pop A','FIFO 先展開來源 A。',{current:'A',queue:['F'],layer:0,operation:'pop A'},{active:['A'],accepted:['A','F'],queue:['F']}),
    eventFrame(lesson,'dist[v] = dist[u] + 1','A 發現 B','B 第一次被看到，因此 dist[B]=1 並加入 queue。',{edge:'A-B',update:'B: ∞ → 1',queue:['F','B'],operation:'discover B'},{active:['A','B'],accepted:['A','B','F'],queue:['F','B'],distances:{A:0,B:1,F:0,C:'∞',D:'∞',E:'∞'}}),
    eventFrame(lesson,'dist[v] = dist[u] + 1','A 發現 C','C 同樣位於來源 A 的下一層，dist[C]=1。',{edge:'A-C',update:'C: ∞ → 1',queue:['F','B','C'],operation:'discover C'},{active:['A','C'],accepted:['A','B','C','F'],queue:['F','B','C'],distances:{A:0,B:1,C:1,F:0,D:'∞',E:'∞'}}),
    eventFrame(lesson,'int u = q.front()','Pop F','下一個第 0 層來源 F 出隊。',{current:'F',queue:['B','C'],layer:0,operation:'pop F'},{active:['F'],accepted:['A','B','C','F'],queue:['B','C']}),
    eventFrame(lesson,'dist[v] = dist[u] + 1','F 發現 D','D 第一次被 F 到達，因此 dist[D]=1。',{edge:'F-D',update:'D: ∞ → 1',queue:['B','C','D'],operation:'discover D'},{active:['F','D'],accepted:['A','B','C','D','F'],queue:['B','C','D'],distances:{A:0,B:1,C:1,D:1,F:0,E:'∞'}}),
    eventFrame(lesson,'dist[v] = dist[u] + 1','F 發現 E','E 第一次被 F 到達，因此 dist[E]=1。',{edge:'F-E',update:'E: ∞ → 1',queue:['B','C','D','E'],operation:'discover E'},{active:['F','E'],accepted:['A','B','C','D','E','F'],queue:['B','C','D','E'],distances:{A:0,B:1,C:1,D:1,E:1,F:0}}),
    eventFrame(lesson,'if (dist[v] == INF)','後續節點不重複入隊','B、C、D、E 展開時鄰居都已有距離，因此不會被第二次加入；第一次發現就是最近來源距離。',{result:'A=0,F=0,B=C=D=E=1',queue:[],operation:'skip discovered'},{accepted:['A','B','C','D','E','F'],queue:[],distances:{A:0,B:1,C:1,D:1,E:1,F:0}}),
  ],

  'topological-sort': (lesson) => [
    eventFrame(lesson,'if (indegree[u] == 0)','把 A 放入 Queue','初始只有 A 的 indegree=0，所以 A 可以安全成為第一個輸出。',{indegree:'A0 B1 C1 D1 E2 F2',queue:['A'],order:[],operation:'enqueue zero-indegree'},{active:['A'],queue:['A']}),
    eventFrame(lesson,'int u = q.front()','Pop A，加入答案','A 出隊並加入 order；接著刪除 A 的出邊。',{current:'A',queue:[],order:['A'],operation:'output A'},{active:['A'],accepted:['A'],queue:[]}),
    eventFrame(lesson,'--indegree[v]','刪除 A→B','B 的 indegree 1→0，因此 B 入隊。',{edge:'A-B',indegree:'B:1→0',queue:['B'],order:['A'],operation:'decrement B'},{active:['A','B'],accepted:['A'],queue:['B']}),
    eventFrame(lesson,'--indegree[v]','刪除 A→C','C 的 indegree 1→0，因此 C 也入隊。',{edge:'A-C',indegree:'C:1→0',queue:['B','C'],order:['A'],operation:'decrement C'},{active:['A','C'],accepted:['A'],queue:['B','C']}),
    eventFrame(lesson,'int u = q.front()','Pop B','B 是下一個 indegree=0 節點，加入 order。',{current:'B',queue:['C'],order:['A','B'],operation:'output B'},{active:['B'],accepted:['A','B'],queue:['C']}),
    eventFrame(lesson,'--indegree[v]','B→D 讓 D 入隊','刪除 B→D 後 D 的 indegree 1→0。',{edge:'B-D',indegree:'D:1→0',queue:['C','D'],order:['A','B'],operation:'decrement D'},{active:['B','D'],accepted:['A','B'],queue:['C','D']}),
    eventFrame(lesson,'--indegree[v]','B→E 尚未讓 E 歸零','E 的 indegree 2→1，所以還不能入隊。',{edge:'B-E',indegree:'E:2→1',queue:['C','D'],order:['A','B'],operation:'decrement E'},{active:['B','E'],accepted:['A','B'],queue:['C','D']}),
    eventFrame(lesson,'--indegree[v]','C→E 讓 E 歸零','處理 C 後 E 的 indegree 1→0，現在 E 入隊。',{edge:'C-E',indegree:'E:1→0',queue:['D','E'],order:['A','B','C'],operation:'decrement E'},{active:['C','E'],accepted:['A','B','C'],queue:['D','E']}),
    eventFrame(lesson,'--indegree[v]','D、E 共同解鎖 F','D→F 先讓 indegree[F] 2→1；E→F 再讓 1→0，F 入隊。',{edges:['D-F','E-F'],indegree:'F:2→1→0',queue:['F'],order:['A','B','C','D','E'],operation:'unlock F'},{active:['D','E','F'],accepted:['A','B','C','D','E'],queue:['F']}),
    eventFrame(lesson,'if (order.size() != n)','輸出全部 6 點：沒有環','order.size()==n，拓樸序完成；若 queue 提前空而輸出不足 n 才代表有環。',{order:['A','B','C','D','E','F'],result:'acyclic',operation:'verify count'},{accepted:['A','B','C','D','E','F'],queue:[]}),
  ],

  'connected-components': (lesson) => [
    eventFrame(lesson,'if (seen[u]) continue','u=A 尚未訪問','外迴圈遇到 A，seen[A]=false，因此開始第一個連通分量。',{root:'A',components:0,seen:[],operation:'find new root'},{active:['A']}),
    eventFrame(lesson,'++components','建立分量 #1','components 由 0→1，接著 DFS(A)。',{root:'A',components:1,seen:[],operation:'start component 1'},{active:['A']}),
    eventFrame(lesson,'seen[u] = true','DFS 標記 A','A 加入第一個分量。',{current:'A',components:1,seen:['A'],operation:'visit A'},{active:['A'],accepted:['A']}),
    eventFrame(lesson,'if (!seen[v]) dfs(v)','A → B','B 未訪問，DFS 進入 B。',{current:'B',components:1,seen:['A','B'],operation:'visit B'},{active:['A','B'],accepted:['A','B']}),
    eventFrame(lesson,'if (!seen[v]) dfs(v)','A/B → C','C 也屬於同一可達集合；第一個分量成為 {A,B,C}。',{current:'C',components:1,seen:['A','B','C'],component:['A','B','C'],operation:'finish component 1'},{active:['C'],accepted:['A','B','C']}),
    eventFrame(lesson,'if (seen[u]) continue','掃到 B、C：略過','B、C 已經 seen，不會重複啟動 DFS。',{components:1,seen:['A','B','C'],skipped:['B','C'],operation:'skip seen roots'},{active:['B','C'],accepted:['A','B','C']}),
    eventFrame(lesson,'++components','u=D：建立分量 #2','D 尚未訪問，因此 components 1→2 並啟動 DFS(D)。',{root:'D',components:2,seen:['A','B','C'],operation:'start component 2'},{active:['D'],accepted:['A','B','C']}),
    eventFrame(lesson,'if (!seen[v]) dfs(v)','DFS(D) 收集 E、F','從 D 可達 E、F，第二個分量是 {D,E,F}。',{current:'D',components:2,seen:['A','B','C','D','E','F'],component:['D','E','F'],operation:'finish component 2'},{active:['D','E','F'],accepted:['A','B','C','D','E','F']}),
  ],

  'bipartite-coloring': (lesson) => [
    eventFrame(lesson,'color[s]=0','A 染成 0 並入隊','每個新分量可以任選起點顏色；令 A=0。',{colors:'A=0',queue:['A'],operation:'seed color'},{active:['A'],queue:['A']}),
    eventFrame(lesson,'int u=q.front()','Pop A','展開 A，所有未染色鄰居必須染成相反色 1。',{colorState:'A=0 before propagation',current:'A',colors:'A=0',queue:[],operation:'pop A'},{active:['A'],queue:[]}),
    eventFrame(lesson,'color[v]=color[u]^1','A→B：B 染成 1','B 未染色，因此 color[B]=1 並入隊。',{edge:'A-B',colors:'A=0,B=1',queue:['B'],operation:'color B'},{active:['A','B'],accepted:['A','B'],queue:['B']}),
    eventFrame(lesson,'color[v]=color[u]^1','A→C：C 染成 1','C 同樣與 A 相鄰，因此 C=1。',{edge:'A-C',colors:'A=0,B=1,C=1',queue:['B','C'],operation:'color C'},{active:['A','C'],accepted:['A','B','C'],queue:['B','C']}),
    eventFrame(lesson,'color[v]=color[u]^1','B→D：D 染成 0','展開 B 時 D 尚未染色，所以 D 必須與 B 相反，得到 0。',{edge:'B-D',colors:'B=1,D=0',queue:['C','D'],operation:'color D'},{active:['B','D'],accepted:['A','B','C','D'],queue:['C','D']}),
    eventFrame(lesson,'color[v]=color[u]^1','C→E：E 染成 0','C 的顏色是 1，所以它尚未染色的鄰居 E 必須染成相反色 0，才能維持二分圖條件。',{edge:'C-E',colors:'C=1,E=0',queue:['D','E'],operation:'color E'},{active:['C','E'],accepted:['A','B','C','D','E'],queue:['D','E']}),
    eventFrame(lesson,'color[v]=color[u]^1','D→F：F 染成 1','F 第一次被 D 發現，所以 F=1。',{edge:'D-F',colors:'D=0,F=1',queue:['E','F'],operation:'color F'},{active:['D','F'],accepted:['A','B','C','D','E','F'],queue:['E','F']}),
    eventFrame(lesson,'else if(color[v]==color[u])','E→F：顏色不同，沒有衝突','E=0、F=1，這條已染色邊兩端顏色不同，因此合法。',{edge:'E-F',colors:'E=0,F=1',conflict:'false',operation:'check colored edge'},{active:['E','F'],accepted:['A','B','C','D','E','F']}),
    eventFrame(lesson,'return true','全部邊合法：圖可二分','所有邊兩端顏色都不同，0/1 兩組就是合法二分。',{partition0:['A','D','E'],partition1:['B','C','F'],result:'bipartite',operation:'finish'},{accepted:['A','B','C','D','E','F']}),
  ],

  'cycle-detection': (lesson) => [
    eventFrame(lesson,'color[u]=1','進入 A：白 → 灰','灰色代表節點正在目前 DFS call stack 上。',{current:'A',colors:'A=gray,B=white,C=white',stack:['A'],operation:'enter A'},{active:['A']}),
    eventFrame(lesson,'color[v]==0 && dfs(v)','A→B：B 還是白色','B 尚未探索，因此遞迴進入 B；A 保持灰色等待返回。',{edge:'A-B',colors:'A=gray,B=gray,C=white',stack:['A','B'],operation:'descend A-B'},{active:['A','B']}),
    eventFrame(lesson,'color[v]==0 && dfs(v)','B→C：C 還是白色','再遞迴進入 C，此時 A、B、C 都在同一條 DFS 路徑上。',{edge:'B-C',colors:'A=gray,B=gray,C=gray',stack:['A','B','C'],operation:'descend B-C'},{active:['A','B','C']}),
    eventFrame(lesson,'if(color[v]==1) return true','C→A 指向灰色祖先','C 的出邊回到仍為灰色的 A，這是一條 back edge；A→B→C→A 構成有向環。',{edge:'C-A',colors:'A=gray,B=gray,C=gray',backEdge:'C→A',result:'cycle',operation:'detect back edge'},{active:['A','C'],accepted:['A','B','C']}),
  ],


  'dsu': (lesson) => [
    eventFrame(lesson,'iota(parent.begin()','初始化 6 個單元素集合','每個節點一開始都是自己的 parent，size 全為 1。',{parent:['A→A','B→B','C→C','D→D','E→E','F→F'],sizes:'all 1',operation:'initialize sets'},{active:['A','B','C','D','E','F']}),
    eventFrame(lesson,'a = find(a); b = find(b);','Unite A 與 B：先找根','find(A)=A、find(B)=B，兩個代表元不同，因此可以合併。',{query:'unite(A,B)',roots:['A','B'],operation:'find roots'},{active:['A','B']}),
    eventFrame(lesson,'parent[b] = a; size[a] += size[b];','把 B 掛到 A','兩棵大小相同，令 parent[B]=A，size[A]=2。',{parent:['A→A','B→A'],sizes:'A=2,B=1',operation:'union by size'},{active:['A','B'],accepted:['A','B']}),
    eventFrame(lesson,'parent[b] = a; size[a] += size[b];','再把 D 掛到 B 的集合','先合併 B 與 D。find(B)=A，所以實際是把 D 掛到代表元 A；集合成為 {A,B,D}。',{parent:['A→A','B→A','D→A'],sizes:'A=3',operation:'unite B,D'},{active:['A','B','D'],accepted:['A','B','D']}),
    eventFrame(lesson,'if (parent[x] == x)','Find D：D 不是根','parent[D]=A，所以 find(D) 需要往上走。',{query:'find(D)',path:['D','A'],operation:'follow parent'},{active:['D','A']}),
    eventFrame(lesson,'return parent[x] = find(parent[x]);','路徑壓縮','遞迴返回時把 D 直接指向 A。這個例子已是一層；若原本是 D→B→A，就會壓成 D→A。',{before:'D→B→A',after:'D→A',operation:'path compression'},{active:['D','A'],accepted:['A']}),
    eventFrame(lesson,'if (size[a] < size[b]) swap(a, b);','Unite E 與大集合：小掛大','E 的集合大小 1，小於 A 集合大小 3，因此保持 A 為新根。',{merge:'E → A',sizes:'A=3,E=1',operation:'choose larger root'},{active:['A','E']}),
    eventFrame(lesson,'parent[b] = a; size[a] += size[b];','完成 Unite','parent[E]=A，size[A]=4；A、B、D、E 現在同集合。',{parent:['B→A','D→A','E→A'],sizes:'A=4',operation:'merge E'},{active:['A','E'],accepted:['A','B','D','E']}),
    eventFrame(lesson,'return find(a) == find(b)','Same(B,E) 回傳 true','find(B)=A 且 find(E)=A，所以兩點已連通。',{query:'same(B,E)',roots:['A','A'],result:'true',operation:'connectivity query'},{active:['B','E'],accepted:['A','B','D','E']}),
  ],

  'fenwick-tree': (lesson) => [
    eventFrame(lesson,'explicit FenwickTree','建立 n=8 的空 BIT','bit[1..8] 全為 0；索引採 1-based。',{n:8,bit:['0','0','0','0','0','0','0','0'],operation:'initialize BIT'},{values:[0,0,0,0,0,0,0,0]}),
    eventFrame(lesson,'for (; i <= n; i += i & -i) bit[i] += delta;','Add(3,+5)：更新 bit[3]','lowbit(3)=1，所以第一個被更新的分組右端是 3。',{i:3,lowbit:1,bit:'bit[3]:0→5',path:['3','4','8'],operation:'update bit[3]'},{values:[0,0,5,0,0,0,0,0],active:['2']}),
    eventFrame(lesson,'for (; i <= n; i += i & -i) bit[i] += delta;','i=4：更新 bit[4]','3+lowbit(3)=4；bit[4] 代表 [1,4]，也必須包含位置 3 的 +5。',{i:4,lowbit:4,bit:'bit[4]:0→5',path:['3','4','8'],operation:'update bit[4]'},{values:[0,0,5,5,0,0,0,0],active:['3']}),
    eventFrame(lesson,'for (; i <= n; i += i & -i) bit[i] += delta;','i=8：更新 bit[8]','4+lowbit(4)=8；bit[8] 代表 [1,8]。下一步 i=16 超界，add 結束。',{i:8,lowbit:8,bit:'bit[8]:0→5',path:['3','4','8'],operation:'update bit[8]'},{values:[0,0,5,5,0,0,0,5],active:['7']}),
    eventFrame(lesson,'long long s = 0;','Prefix(6)：累加器從 0 開始','查詢前綴 [1,6]，先令 s=0。',{query:'prefix(6)',i:6,sum:0,operation:'initialize prefix'},{values:[0,0,5,5,0,0,0,5]}),
    eventFrame(lesson,'for (; i > 0; i -= i & -i) s += bit[i];','讀 bit[6]','lowbit(6)=2，bit[6] 代表 [5,6]；目前值為 0，所以 s 仍為 0。',{i:6,lowbit:2,covered:'[5,6]',sum:'0+0=0',operation:'accumulate bit[6]'},{values:[0,0,5,5,0,0,0,5],active:['5']}),
    eventFrame(lesson,'for (; i > 0; i -= i & -i) s += bit[i];','i=4：讀 bit[4]','6−lowbit(6)=4；bit[4] 代表 [1,4]，值為 5，所以 s=5。',{i:4,lowbit:4,covered:'[1,4]',sum:'0+5=5',operation:'accumulate bit[4]'},{values:[0,0,5,5,0,0,0,5],active:['3'],accepted:['2']}),
    eventFrame(lesson,'return s;','Prefix(6)=5','4−lowbit(4)=0，查詢結束；位置 3 的 +5 正確落在前綴中。',{query:'prefix(6)',result:5,operation:'return prefix'},{values:[0,0,5,5,0,0,0,5],accepted:['2']}),
  ],

  'sparse-table': (lesson) => [
    eventFrame(lesson,'st[0] = a;','Level 0：複製所有長度 1 區間','st[0][i] 就是 a[i]；這一行真的把第一層資料寫進 Sparse Table。',{level:0,intervalLength:1,row:['2','5','1','4','9','3','7','6'],operation:'copy base level'},{values:[2,5,1,4,9,3,7,6]}),
    eventFrame(lesson,'for (int j = 1; j < k; ++j)','j=1：進入長度 2 的層','這一行只決定目前層級 j=1；此刻尚未寫入任何 st[1][i]。真正的資料更新會發生在內層 assignment。',{level:1,intervalLength:2,operation:'enter level 1'},{values:[2,5,1,4,9,3,7,6]}),
    eventFrame(lesson,'st[j][i] = min','i=0：st[1][0] = min(2,5)=2','合併 st[0][0] 與 st[0][1]，得到區間 [0,1] 的 RMQ。',{level:1,i:0,cell:'st[1][0]',left:2,right:5,result:2,operation:'write cell'},{active:['0','1'],accepted:['0']}),
    eventFrame(lesson,'st[j][i] = min','i=1：st[1][1] = min(5,1)=1','同一行進入下一次內層迴圈，合併區間 [1] 與 [2]。',{level:1,i:1,cell:'st[1][1]',left:5,right:1,result:1,operation:'write cell'},{active:['1','2'],accepted:['2']}),
    eventFrame(lesson,'st[j][i] = min','完成 Level 1 的其餘 Cells','同一 assignment 依序處理 i=2..6，最後 st[1]=[2,1,1,4,3,3,6]。這是同一行 Code 的多次迴圈執行，不是 for header 自己寫入。',{level:1,row:['2','1','1','4','3','3','6'],remainingI:['2','3','4','5','6'],operation:'finish level 1'},{active:['2','3','4','5','6']}),
    eventFrame(lesson,'for (int j = 1; j < k; ++j)','j=2：進入長度 4 的層','外層迴圈把 j 更新成 2；每個新 cell 會由兩個長度 2 的區塊合併。',{level:2,intervalLength:4,operation:'enter level 2'}),
    eventFrame(lesson,'st[j][i] = min','先計算 st[2][0]、st[2][1]','i=0 得 min(2,1)=1；i=1 得 min(1,4)=1。兩次都實際執行 assignment。',{level:2,cells:['st[2][0]=1','st[2][1]=1'],operation:'write first level-2 cells'},{active:['0','1','2','3','4']}),
    eventFrame(lesson,'st[j][i] = min','i=2：建立查詢左區塊 [2,5]','st[2][2]=min(st[1][2],st[1][4])=min(1,3)=1。',{level:2,i:2,cell:'st[2][2]',interval:'[2,5]',leftBlock:'[2,3]=1',rightBlock:'[4,5]=3',result:1,operation:'write query-left block'},{active:['2','3','4','5'],accepted:['2']}),
    eventFrame(lesson,'st[j][i] = min','i=3：建立查詢右區塊 [3,6]','st[2][3]=min(st[1][3],st[1][5])=min(4,3)=3。',{level:2,i:3,cell:'st[2][3]',interval:'[3,6]',leftBlock:'[3,4]=4',rightBlock:'[5,6]=3',result:3,operation:'write query-right block'},{active:['3','4','5','6'],accepted:['5']}),
    eventFrame(lesson,'st[j][i] = min','i=4：完成 Level 2','最後 st[2][4]=min(3,6)=3，因此 st[2]=[1,1,1,3,3]。',{level:2,i:4,row:['1','1','1','3','3'],operation:'finish level 2'},{active:['4','5','6','7']}),
    eventFrame(lesson,'for (int j = 1; j < k; ++j)','j=3：進入長度 8 的最後一層','n=8，因此 j=3 只會產生一個長度 8 的 cell。',{level:3,intervalLength:8,operation:'enter level 3'}),
    eventFrame(lesson,'st[j][i] = min','st[3][0] = min(1,3)=1','合併 st[2][0] 對應 [0,3] 與 st[2][4] 對應 [4,7]，完成整張表。',{level:3,i:0,cell:'st[3][0]',leftBlock:'[0,3]=1',rightBlock:'[4,7]=3',result:1,operation:'finish build'},{active:['0','1','2','3','4','5','6','7'],accepted:['2']}),
    eventFrame(lesson,'int k = 31 - __builtin_clz','Query [2,6]：計算 k=2','查詢長度 5，所以 floor(log2 5)=2；接下來讀兩個長度 4 的預處理區塊。',{query:'[2,6]',length:5,k:2,blockLength:4,operation:'choose power of two'},{low:2,high:6}),
    eventFrame(lesson,'return min(st[k][l]','讀 [2,5] 與 [3,6]，回傳 1','左值 st[2][2]=1，右值 st[2][3]=3。兩區塊雖重疊，但 min 具有冪等性，所以 min(1,3)=1 正確。',{leftBlock:'[2,5]→1',rightBlock:'[3,6]→3',answer:1,operation:'two-block RMQ'},{low:2,high:6,accepted:['2']}),
  ],

  'lazy-segment-tree': (lesson) => [
    eventFrame(lesson,'void update(int p','Update [1,5] += 3','從根 [0,7] 開始。目標只部分覆蓋根，因此需要往下分解。',{node:'[0,7]',query:'[1,5] += 3',lazy:0,operation:'enter update'},{values:[2,5,1,4,9,3,7,6],low:1,high:5}),
    eventFrame(lesson,'if (ql <= l && r <= qr) { apply','命中完整覆蓋節點','當遞迴到完整落在 [1,5] 的節點，例如 [2,3]，直接 apply，不再往下。',{node:'[2,3]',covered:'true',delta:3,operation:'apply full cover'},{values:[2,5,1,4,9,3,7,6],active:['2','3']}),
    eventFrame(lesson,'tree[p] += v *','Apply [2,3] += 3','區間長度 2，所以 tree[p] 總和增加 3×2=6；lazy[p] 同時累加 +3。',{node:'[2,3]',sum:'5→11',lazy:'0→3',operation:'store lazy tag'},{values:[2,5,4,7,9,3,7,6],active:['2','3'],accepted:['2','3']}),
    eventFrame(lesson,'push(p, l, r);','只有需要進入子節點才 Push','若另一個部分覆蓋節點帶有 lazy，進入孩子前才把標記下傳；完整覆蓋節點可以一直保留標記。',{node:'[0,3]',reason:'partial overlap',operation:'push before descent'}),
    eventFrame(lesson,'tree[p] = tree[p * 2] + tree[p * 2 + 1];','回程 Pull','左右子樹更新完後，重新以兩個孩子總和計算父節點。',{node:'[0,3]',operation:'pull children',invariant:'tree[p]=left+right'}),
    eventFrame(lesson,'void update(int l, int r','更新完成','索引 1..5 共 5 個元素各 +3，根總和從 37 變成 52；未下傳的 lazy 仍與查詢結果等價。',{query:'[1,5]+=3',rootSum:'37→52',pending:'covered nodes keep lazy tags',operation:'finish update'},{values:[2,8,4,7,12,6,7,6],low:1,high:5,accepted:['1','2','3','4','5']}),
    eventFrame(lesson,'if (ql <= l && r <= qr) return tree[p];','Query 完整覆蓋直接讀 Tree','之後查詢若完整包含某個帶 lazy 的節點，tree[p] 已經包含標記效果，所以可直接回傳。',{query:'query [2,3]',node:'[2,3]',answer:11,operation:'read covered node'},{active:['2','3'],accepted:['2','3']}),
  ],

  'zero-one-bfs': (lesson) => [
    eventFrame(lesson,'dist[s] = 0','起點 A 距離設為 0','A 放到 deque 前端。因為之後只有 0/1 權重，deque 足以維持候選距離順序。',{current:'A',deque:['A'],operation:'initialize source'},{active:['A'],queue:['A'],distances:{A:0,B:'∞',C:'∞',D:'∞',E:'∞',F:'∞'}}),
    eventFrame(lesson,'int u = dq.front()','Pop A','取出 deque 最前端 A。',{current:'A',deque:[],operation:'pop front'},{active:['A'],queue:[]}),
    eventFrame(lesson,'dist[v] = dist[u] + w','A→B 權重 1：B=1','鬆弛後 dist[B]=1。權重 1 的候選要放到 deque 尾端。',{edge:'A→B (1)',update:'B:∞→1',deque:['B'],operation:'relax weight 1'},{active:['A','B'],queue:['B'],distances:{A:0,B:1,C:'∞',D:'∞',E:'∞',F:'∞'}}),
    eventFrame(lesson,'if (w == 0) dq.push_front(v);','A→C 權重 0：Push Front','dist[C]=0，與 A 同層，因此 C 必須插到 B 前面。',{edge:'A→C (0)',update:'C:∞→0',deque:['C','B'],operation:'push_front C'},{active:['A','C'],queue:['C','B'],distances:{A:0,B:1,C:0,D:'∞',E:'∞',F:'∞'}}),
    eventFrame(lesson,'int u = dq.front()','Pop C','C 的距離 0 小於 B 的 1，所以 C 先被展開。',{current:'C',deque:['B'],operation:'pop C'},{active:['C'],queue:['B'],distances:{A:0,B:1,C:0,D:'∞',E:'∞',F:'∞'}}),
    eventFrame(lesson,'else dq.push_back(v);','C→E 權重 1：Push Back','dist[E]=1，放到 B 後方。',{edge:'C→E (1)',update:'E:∞→1',deque:['B','E'],operation:'push_back E'},{active:['C','E'],queue:['B','E'],distances:{A:0,B:1,C:0,D:'∞',E:1,F:'∞'}}),
    eventFrame(lesson,'dist[v] = dist[u] + w','B→D 權重 1：D=2','展開 B 後得到 dist[D]=2，放尾端。B→E 的 0 權候選為 1，沒有比目前 E=1 更好。',{current:'B',edge:'B→D (1)',update:'D:∞→2',deque:['E','D'],operation:'relax from B'},{active:['B','D'],queue:['E','D'],distances:{A:0,B:1,C:0,D:2,E:1,F:'∞'}}),
    eventFrame(lesson,'else dq.push_back(v);','E→F 權重 1：F=2','E 出隊後把 F 更新成 2，放到尾端。',{current:'E',edge:'E→F (1)',update:'F:∞→2',deque:['D','F'],operation:'relax F'},{active:['E','F'],queue:['D','F'],distances:{A:0,B:1,C:0,D:2,E:1,F:2}}),
    eventFrame(lesson,'while (!dq.empty())','Deque 清空，距離完成','D→F 的 0 權候選同樣是 2，不會再改善。最後 A0、C0、B1、E1、D2、F2。',{result:'A0 C0 B1 E1 D2 F2',deque:[],operation:'finish'},{accepted:['A','B','C','D','E','F'],queue:[],distances:{A:0,B:1,C:0,D:2,E:1,F:2}}),
  ],

  'bellman-ford': (lesson) => [
    eventFrame(lesson,'dist[s] = 0','初始化來源 A','只有 A=0，其餘皆為 ∞。這個例子含可達負環 B→D→E→B。',{pass:0,dist:'A0 others∞',operation:'initialize'},{active:['A'],distances:{A:0,B:'∞',C:'∞',D:'∞',E:'∞',F:'∞'}}),
    eventFrame(lesson,'dist[v] = dist[u] + w','Pass 1：A→B，B=4','第一次掃邊時 A→B 讓 B 從 ∞ 變 4。',{pass:1,edge:'A→B (4)',update:'B:∞→4',operation:'relax'},{active:['A','B'],distances:{A:0,B:4,C:'∞',D:'∞',E:'∞',F:'∞'}}),
    eventFrame(lesson,'dist[v] = dist[u] + w','Pass 1：A→C，C=2','A→C 讓 C=2。',{pass:1,edge:'A→C (2)',update:'C:∞→2',operation:'relax'},{active:['A','C'],distances:{A:0,B:4,C:2,D:'∞',E:'∞',F:'∞'}}),
    eventFrame(lesson,'dist[v] = dist[u] + w','Pass 1：C→B，B 變 -1','負邊 C→B(-3) 改善 B：2−3=-1。',{pass:1,edge:'C→B (-3)',update:'B:4→-1',operation:'negative-edge relax'},{active:['C','B'],distances:{A:0,B:-1,C:2,D:'∞',E:'∞',F:'∞'}}),
    eventFrame(lesson,'dist[v] = dist[u] + w','Pass 1：沿 B→D→E','B→D 得 D=1；D→E 得 E=3；D→F 得 F=3。',{pass:1,relaxed:['B→D:1','D→E:3','D→F:3'],operation:'propagate one pass'},{active:['B','D','E','F'],distances:{A:0,B:-1,C:2,D:1,E:3,F:3}}),
    eventFrame(lesson,'dist[v] = dist[u] + w','E→B 關閉負環並再次改善','E→B 權重 -6，使 B 從 -1 變 -3。因 B 已在這輪早些時候處理過，影響會在下一輪繼續傳播。',{pass:1,edge:'E→B (-6)',update:'B:-1→-3',cycleWeight:'2+2-6=-2',operation:'close negative cycle'},{active:['E','B'],distances:{A:0,B:-3,C:2,D:1,E:3,F:3}}),
    eventFrame(lesson,'for (int pass = 1; pass < n; ++pass)','Pass 2：距離繼續下降','下一輪 B→D→E→B 再走一次，B 會再下降 2；負環可無限降低路徑成本。',{pass:2,update:'B:-3→-5, D:1→-1, E:3→1, F:3→1',operation:'repeat relaxation'},{active:['B','D','E'],distances:{A:0,B:-5,C:2,D:-1,E:1,F:1}}),
    eventFrame(lesson,'negativeCycle = true','額外一輪仍可鬆弛：偵測負環','做完 V−1 輪後若還能改善，例如 B→D，代表改善路徑必重複節點且包含負權環。',{extraPass:'relaxable edge remains',edge:'B→D',result:'negative cycle reachable',operation:'detect negative cycle'},{active:['B','D','E'],accepted:['B','D','E']}),
  ],

  'floyd-warshall': (lesson) => [
    eventFrame(lesson,'for (int k = 0; k < n; ++k)','初始矩陣：只允許直接邊','A→B=3、A→C=10、A→D=20、B→C=2、B→D=8、C→D=1。尚未允許任何中繼點。',{k:'none',AtoC:10,AtoD:20,BtoD:8,operation:'initial distances'},{active:['A','B','C','D'],executionView:floydMatrix('10','20','8')}),
    eventFrame(lesson,'dist[i][j] = min','k=B：A→C 改成 5','比較 direct 10 與 A→B→C = 3+2=5，取 5。',{k:'B',pair:'A→C',direct:10,via:'3+2=5',result:5,operation:'relax via B'},{active:['A','B','C'],executionView:floydMatrix('5','20','8',['0,2'])}),
    eventFrame(lesson,'dist[i][j] = min','k=B：A→D 改成 11','A→B→D = 3+8=11，比原本 20 好。',{k:'B',pair:'A→D',direct:20,via:'3+8=11',result:11,operation:'relax via B'},{active:['A','B','D'],executionView:floydMatrix('5','11','8',['0,3'])}),
    eventFrame(lesson,'dist[i][j] = min','k=C：A→D 再改成 6','在 k=C 的 i=A 回合，dist[A][C]=5，所以 A→C→D = 5+1=6，比上一輪的 11 更短。',{k:'C',pair:'A→D',before:11,via:'5+1=6',result:6,operation:'relax via C'},{active:['A','C','D'],executionView:floydMatrix('5','6','8',['0,3'])}),
    eventFrame(lesson,'dist[i][j] = min','k=C：B→D 改成 3','接著 i=B，B→C→D = 2+1=3，比直接邊 8 好。',{k:'C',pair:'B→D',direct:8,via:'2+1=3',result:3,operation:'relax via C'},{active:['B','C','D'],executionView:floydMatrix('5','6','3',['1,3'])}),
    eventFrame(lesson,'for (int k = 0; k < n; ++k)','所有中繼點完成','k 依序放在最外層，確保每輪只使用已允許的中繼點。最終 A→D=6。',{allowed:'A,B,C,D',result:'A→D=6',operation:'finish all-pairs'},{accepted:['A','B','C','D'],executionView:floydMatrix('5','6','3')}),
  ],

  'quickselect': (lesson) => [
    eventFrame(lesson,'int p = partitionRange','第一次 Partition：pivot=3，p=2','目標 k=3（0-based，第 4 小）。以最右端 3 為 pivot 後，3 固定在索引 2。',{range:'[0,7]',k:3,pivot:3,p:2,operation:'partition'},{values:[2,1,3,4,7,8,5,9],active:['2'],low:0,high:7,accepted:['2']}),
    eventFrame(lesson,'return quickselect(p + 1','k=3 > p=2：只搜右側','索引 0..2 已確定都不會包含第 4 小，遞迴到 [3,7]。',{k:3,p:2,nextRange:'[3,7]',operation:'discard left side'},{values:[2,1,3,4,7,8,5,9],low:3,high:7,muted:['0','1','2']}),
    eventFrame(lesson,'int p = partitionRange','第二次 Partition：pivot=9，p=7','9 是目前子段最大值，固定到索引 7。',{range:'[3,7]',k:3,pivot:9,p:7,operation:'partition'},{values:[2,1,3,4,7,8,5,9],active:['7'],low:3,high:7,accepted:['2','7']}),
    eventFrame(lesson,'if (k < p)','k=3 < 7：改搜左側','第 4 小一定在 [3,6]。',{k:3,p:7,nextRange:'[3,6]',operation:'discard right pivot'},{values:[2,1,3,4,7,8,5,9],low:3,high:6,muted:['0','1','2','7']}),
    eventFrame(lesson,'int p = partitionRange','第三次 Partition：pivot=5，p=4','子段 [4,7,8,5] 以 5 分割後得到 [4,5,8,7]，5 固定索引 4。',{range:'[3,6]',k:3,pivot:5,p:4,operation:'partition'},{values:[2,1,3,4,5,8,7,9],active:['4'],low:3,high:6,accepted:['2','4','7']}),
    eventFrame(lesson,'if (k < p)','k=3 < 4：只剩索引 3','下一個遞迴區間為 [3,3]。',{k:3,p:4,nextRange:'[3,3]',operation:'narrow to one element'},{values:[2,1,3,4,5,8,7,9],low:3,high:3,active:['3']}),
    eventFrame(lesson,'if (p == k) return a[p];','p=k=3：回傳 4','單元素 partition 後 pivot 位置就是 3；a[3]=4 是第 4 小。其他區段從未完整排序。',{k:3,p:3,result:4,operation:'return kth element'},{values:[2,1,3,4,5,8,7,9],active:['3'],accepted:['3']}),
  ],


  'binary-heap': (lesson) => [
    eventFrame(lesson,'vector<int> heap','初始 Min-Heap','目前陣列 [2,5,3,9,8,7] 對應完全二元樹；每個父節點都不大於孩子。',{heap:['2','5','3','9','8','7'],minimum:2,operation:'initial heap'},{values:[2,5,3,9,8,7],accepted:['0']}),
    eventFrame(lesson,'heap.push_back(x)','Push 1：先放到尾端','新值 1 先追加在索引 6，暫時可能破壞 parent≤child。',{incoming:1,index:6,heap:['2','5','3','9','8','7','1'],operation:'append'},{values:[2,5,3,9,8,7,1],active:['6']}),
    eventFrame(lesson,'swap(heap[p], heap[i])','Sift Up：1 與父 3 交換','索引 6 的父節點是 2，heap[2]=3>1，所以交換。',{i:6,parent:2,swap:'1↔3',heap:['2','5','1','9','8','7','3'],operation:'sift up swap'},{values:[2,5,1,9,8,7,3],active:['2','6']}),
    eventFrame(lesson,'swap(heap[p], heap[i])','Sift Up：1 再與根 2 交換','現在 i=2，父節點索引 0 的值 2 仍大於 1，再交換。',{i:2,parent:0,swap:'1↔2',heap:['1','5','2','9','8','7','3'],operation:'sift up swap'},{values:[1,5,2,9,8,7,3],active:['0','2'],accepted:['0']}),
    eventFrame(lesson,'if (heap[p] <= heap[i]) break','Push 完成','1 已在根，沒有父節點需要比較；Min-Heap invariant 恢復。',{heap:['1','5','2','9','8','7','3'],minimum:1,operation:'finish push'},{values:[1,5,2,9,8,7,3],accepted:['0']}),
    eventFrame(lesson,'int result = heap[0]','Pop Min：先記住 1','最小值一定在 root，因此先保存 result=1。',{removed:1,heap:['1','5','2','9','8','7','3'],operation:'read minimum'},{values:[1,5,2,9,8,7,3],active:['0']}),
    eventFrame(lesson,'heap[0] = heap.back()','尾端 3 搬到 Root','刪除最後元素後把 3 放到 root，陣列變 [3,5,2,9,8,7]，接著向下修復。',{root:'1→3',heap:['3','5','2','9','8','7'],operation:'move last to root'},{values:[3,5,2,9,8,7],active:['0']}),
    eventFrame(lesson,'if (child + 1','選較小孩子 2','root 的孩子是 5 與 2；Sift-down 必須和較小的 2 比較。',{i:0,left:5,right:2,chosen:2,operation:'choose smaller child'},{values:[3,5,2,9,8,7],active:['0','1','2']}),
    eventFrame(lesson,'swap(heap[i], heap[child])','3 與 2 交換','3>2，所以交換後變成 [2,5,3,9,8,7]。',{swap:'3↔2',heap:['2','5','3','9','8','7'],operation:'sift down swap'},{values:[2,5,3,9,8,7],active:['0','2'],accepted:['0']}),
    eventFrame(lesson,'return result','Pop 完成，回傳 1','新的 root=2 且所有父≤子；popMinHeap 回傳被移除的 1。',{result:1,heap:['2','5','3','9','8','7'],minimum:2,operation:'finish pop'},{values:[2,5,3,9,8,7],accepted:['0']}),
  ],

  'monotonic-queue': (lesson) => [
    eventFrame(lesson,'dq.push_back(i)','i=0，Push 1','Deque 儲存索引且值保持遞減；目前只有 0(1)。',{i:0,incoming:1,deque:['0(1)'],operation:'push index'},{values:[1,3,-1,-3,5,3,6,7],active:['0']}),
    eventFrame(lesson,'a[dq.back()] <= a[i]','i=1，新值 3 支配 1','3 比尾端 1 大且更晚過期，因此 0(1) 永遠不會成為未來視窗最大值，先 pop_back。',{i:1,incoming:3,popped:['0(1)'],deque:[],operation:'remove dominated'},{values:[1,3,-1,-3,5,3,6,7],active:['0','1'],muted:['0']}),
    eventFrame(lesson,'dq.push_back(i)','Push 1(3)','Deque 變成 [1(3)]。',{i:1,deque:['1(3)'],operation:'push 3'},{values:[1,3,-1,-3,5,3,6,7],active:['1']}),
    eventFrame(lesson,'dq.push_back(i)','i=2，-1 直接進尾端','-1<3，不需 pop；Deque=[1(3),2(-1)]。',{i:2,deque:['1(3)','2(-1)'],operation:'push -1'},{values:[1,3,-1,-3,5,3,6,7],active:['1','2']}),
    eventFrame(lesson,'answer.push_back','第一個視窗 [0,2] 最大值是 3','i=2 已形成長度 k=3 的視窗，front=1 對應值 3。',{window:'[0,2]',deque:['1(3)','2(-1)'],maximum:3,operation:'emit max'},{values:[1,3,-1,-3,5,3,6,7],low:0,high:2,accepted:['1']}),
    eventFrame(lesson,'dq.push_back(i)','i=3，Push -3','索引 1 仍在視窗 [1,3]，而 -3 不會支配 -1。',{i:3,deque:['1(3)','2(-1)','3(-3)'],operation:'push -3'},{values:[1,3,-1,-3,5,3,6,7],low:1,high:3}),
    eventFrame(lesson,'answer.push_back','第二個視窗 [1,3] 最大值仍是 3','front=1(3) 仍在視窗內，所以輸出第二個 3；接著 i=4 才會移除過期索引 1。',{window:'[1,3]',deque:['1(3)','2(-1)','3(-3)'],maximum:3,operation:'emit second max'},{values:[1,3,-1,-3,5,3,6,7],low:1,high:3,accepted:['1']}),
    eventFrame(lesson,'dq.front() <= i-k','i=4：索引 1 過期','新視窗是 [2,4]，front=1≤i-k=1，所以先 pop_front。',{i:4,expired:'1(3)',deque:['2(-1)','3(-3)'],operation:'remove expired'},{values:[1,3,-1,-3,5,3,6,7],low:2,high:4,muted:['1']}),
    eventFrame(lesson,'a[dq.back()] <= a[i]','新值 5 清掉尾端候選','5 依序支配 -3 與 -1；Deque 被清空。',{i:4,incoming:5,popped:['3(-3)','2(-1)'],deque:[],operation:'remove dominated'},{values:[1,3,-1,-3,5,3,6,7],active:['2','3','4'],muted:['2','3']}),
    eventFrame(lesson,'dq.push_back(i)','Push 4(5)，輸出 5','5 成為 front，因此視窗 [2,4] 最大值是 5。',{i:4,deque:['4(5)'],maximum:5,operation:'push and emit'},{values:[1,3,-1,-3,5,3,6,7],low:2,high:4,accepted:['4']}),
    eventFrame(lesson,'dq.push_back(i)','i=5：Push 3，輸出 5','3<5，兩個候選保留為 [4(5),5(3)]；視窗 [3,5] 的最大值仍是 5。',{i:5,deque:['4(5)','5(3)'],maximum:5,operation:'push and emit'},{values:[1,3,-1,-3,5,3,6,7],low:3,high:5,accepted:['4']}),
    eventFrame(lesson,'a[dq.back()] <= a[i]','i=6：6 淘汰 3、5','新值 6 比尾端 3 與 5 都大，依序 pop_back，Deque 暫時為空。',{i:6,incoming:6,popped:['5(3)','4(5)'],deque:[],operation:'remove dominated'},{values:[1,3,-1,-3,5,3,6,7],active:['4','5','6'],muted:['4','5']}),
    eventFrame(lesson,'answer.push_back','Push 6，輸出 6','把索引 6 加入 Deque；視窗 [4,6] 的最大值是 6。',{i:6,deque:['6(6)'],maximum:6,operation:'push and emit'},{values:[1,3,-1,-3,5,3,6,7],low:4,high:6,accepted:['6']}),
    eventFrame(lesson,'a[dq.back()] <= a[i]','i=7：7 淘汰 6','7>6，索引 6 被較大且較晚過期的 7 支配。',{i:7,incoming:7,popped:['6(6)'],deque:[],operation:'remove dominated'},{values:[1,3,-1,-3,5,3,6,7],active:['6','7'],muted:['6']}),
    eventFrame(lesson,'answer.push_back','Push 7，輸出 7','最後視窗 [5,7] 的最大值是 7；完整答案為 [3,3,5,5,6,7]。',{i:7,deque:['7(7)'],answers:['3','3','5','5','6','7'],operation:'finish windows'},{values:[1,3,-1,-3,5,3,6,7],low:5,high:7,active:['7'],accepted:['7']}),
  ].map((frame,step)=>({...frame,
    codeLines:[...frame.codeLines,...([9,10,12,14].includes(step)?[lineNumber(lesson,'dq.push_back(i)'),lineNumber(lesson,'answer.push_back')]:[])],
    state:{...frame.state,...([9,10,12,14].includes(step)?{highlightCodeLines:'all'}:{})},
    executionView:monotonicQueueView(frame,step),
  })),

  'sqrt-decomposition': (lesson) => [
    eventFrame(lesson,'int blockSize = sqrt(n) + 1','n=8，Block Size=3','陣列切成 [0,2]、[3,5]、[6,7] 三塊。',{n:8,blockSize:3,blocks:['[0,2]','[3,5]','[6,7]'],operation:'choose block size'},{values:[2,5,1,4,9,3,7,6]}),
    eventFrame(lesson,'block[i/blockSize] += a[i]','建立 Block Sums','三塊總和分別是 8、16、13。',{blockSums:['8','16','13'],operation:'build block sums'},{values:[2,5,1,4,9,3,7,6],accepted:['0','1','2','3','4','5','6','7']}),
    eventFrame(lesson,'while (l<=r && l%blockSize)','Query [1,6]：先處理索引 1','l=1 不在 block 邊界，直接加 a[1]=5，l→2。',{l:1,r:6,answer:'0→5',operation:'left fringe'},{values:[2,5,1,4,9,3,7,6],active:['1'],low:1,high:6}),
    eventFrame(lesson,'while (l<=r && l%blockSize)','再處理索引 2','l=2 仍不在邊界，加 a[2]=1，answer=6，l→3。',{l:2,r:6,answer:'5→6',operation:'left fringe'},{values:[2,5,1,4,9,3,7,6],active:['2'],low:1,high:6}),
    eventFrame(lesson,'while (l+blockSize-1<=r)','一次吃完整 Block [3,5]','l=3 且完整 block 沒超過 r=6，直接加 block[1]=16；answer=22，l→6。',{block:'[3,5]',blockSum:16,answer:'6→22',operation:'whole block'},{values:[2,5,1,4,9,3,7,6],active:['3','4','5'],low:1,high:6}),
    eventFrame(lesson,'while (l<=r) answer+=a[l++]','尾端索引 6','剩下索引 6，直接加 a[6]=7，answer=29。',{l:6,r:6,answer:'22→29',operation:'right fringe'},{values:[2,5,1,4,9,3,7,6],active:['6'],low:1,high:6}),
    eventFrame(lesson,'return answer','回傳 29','整段 [1,6] = 5+1+4+9+3+7 = 29；只逐格處理兩端，中間整塊 O(1)。',{query:'[1,6]',result:29,operation:'return query'},{values:[2,5,1,4,9,3,7,6],low:1,high:6,accepted:['1','2','3','4','5','6']}),
  ],

  'mo-algorithm': (lesson) => [
    eventFrame(lesson,'sort(queries.begin()','先重排三個 Query','以 block 再依右端排序後，處理順序為 Q0=[0,3]、Q2=[1,4]、Q1=[2,6]；原 id 保留。',{order:['Q0[0,3]','Q2[1,4]','Q1[2,6]'],operation:'offline sort'},{values:[2,5,1,4,9,3,7,6]}),
    eventFrame(lesson,'int L=0,R=-1','維護區間從空集合開始','L=0、R=-1 表示 current 尚未包含任何元素。',{L:0,R:-1,current:0,operation:'initialize window'},{values:[2,5,1,4,9,3,7,6]}),
    eventFrame(lesson,'while (L>l) add(--L); while (R<r) add(++R);','移到 Q0=[0,3]','R 依序 0→1→2→3，每次 add；current=2+5+1+4=12。',{query:'Q0[0,3]',moves:['add0','add1','add2','add3'],L:0,R:3,current:12,operation:'expand right'},{values:[2,5,1,4,9,3,7,6],low:0,high:3}),
    eventFrame(lesson,'answer[id]=current','保存 Q0=12','答案寫回 id=0，而不是「目前處理次序」的位置。',{id:0,answer:12,operation:'store by id'},{low:0,high:3,accepted:['0','1','2','3']}),
    eventFrame(lesson,'while (L>l) add(--L); while (R<r) add(++R);','移到 Q2=[1,4]：先 Add 4','R:3→4，加 a[4]=9，current 12→21。',{query:'Q2[1,4]',move:'add4',current:'12→21',L:0,R:4,operation:'move right'},{values:[2,5,1,4,9,3,7,6],low:0,high:4}),
    eventFrame(lesson,'while (L<l) remove(L++);','再 Remove 0','L:0→1，移除 a[0]=2，current 21→19；現在正好是 [1,4]。',{query:'Q2[1,4]',move:'remove0',current:'21→19',L:1,R:4,operation:'move left'},{values:[2,5,1,4,9,3,7,6],low:1,high:4}),
    eventFrame(lesson,'while (L>l) add(--L); while (R<r) add(++R);','移到 Q1=[2,6]：Add 5、6','R 由 4→6，加入 3 與 7，current 19→29。',{query:'Q1[2,6]',moves:['add5','add6'],current:'19→29',L:1,R:6,operation:'expand right'},{values:[2,5,1,4,9,3,7,6],low:1,high:6}),
    eventFrame(lesson,'while (L<l) remove(L++);','Remove 1，得到 24','移除 a[1]=5，L 變 2，current=24；區間即 [2,6]。',{query:'Q1[2,6]',move:'remove1',current:'29→24',L:2,R:6,operation:'move left'},{values:[2,5,1,4,9,3,7,6],low:2,high:6}),
    eventFrame(lesson,'answer[id]=current','依原 Id 還原答案','Q0=12、Q1=24、Q2=19。離線排序只改處理順序，不改輸出語意。',{answers:['Q0=12','Q1=24','Q2=19'],operation:'restore original order'},{accepted:['0','1','2','3','4','5','6']}),
  ],

  'persistent-segment-tree': (lesson) => [
    eventFrame(lesson,'int update(int prev','從 Version 0 更新 pos=4','假設 root0 已表示 [2,5,1,4,9,3,7,6]。建立 root1，只複製包含索引 4 的根到葉路徑。',{version:'root0',update:'pos4:9→10',path:['[0,7]','[4,7]','[4,5]','[4,4]'],operation:'start persistent update'},{values:[2,5,1,4,9,3,7,6],active:['4']}),
    eventFrame(lesson,'int cur = tree.size()','複製根 [0,7]','配置新節點 cur；它先複製舊根的左右 child pointer 與 value。',{copy:'root0 [0,7] → root1 [0,7]',shared:'both children initially',operation:'copy root'}),
    eventFrame(lesson,'tree.push_back(prev ? tree[prev]','沿路複製 [4,7]','pos=4 在右半，所以左半 [0,3] 指標直接共享，只建立新的右孩子。',{copied:'[4,7]',shared:'[0,3]',operation:'path copy'}),
    eventFrame(lesson,'if (pos <= m) tree[cur].left = update','再複製 [4,5]','pos=4 落在 [4,5] 的左半；[6,7] 仍與舊版本共享。',{copied:'[4,5]',shared:'[6,7]',operation:'descend left'}),
    eventFrame(lesson,'if (l == r) { tree[cur].value = val','複製葉 [4,4] 並寫 10','到葉節點才真正把 value 從 9 改成 10；舊葉仍保留 9。',{leaf:'[4,4]',oldValue:9,newValue:10,operation:'write new leaf'},{values:[2,5,1,4,10,3,7,6],active:['4']}),
    eventFrame(lesson,'tree[cur].value = tree[tree[cur].left].value','回程重算 [4,5]','新 [4,5] = 10+3=13；右孩子 [5,5] 可直接共享舊節點。',{node:'[4,5]',value:'12→13',operation:'pull copied node'}),
    eventFrame(lesson,'tree[cur].value = tree[tree[cur].left].value','一路 Pull 到新 Root','只重算被複製的祖先，root1 總和 38；root0 仍是 37。',{root0:37,root1:38,newNodes:4,operation:'finish new version'},{values:[2,5,1,4,10,3,7,6],accepted:['4']}),
    eventFrame(lesson,'if (ql <= l && r <= qr) return tree[node].value','兩個版本可同時查詢','查 root0 的索引 4 得 9；查 root1 得 10。持久化的關鍵就是舊節點從未被改寫。',{query:'position 4',version0:9,version1:10,operation:'compare versions'},{active:['4'],accepted:['4']}),
  ],

  'li-chao-tree': (lesson) => [
    eventFrame(lesson,'void add(Line nw','根目前存 y=2x+1','現在加入新線 y=-x+8，定義域 [0,8]。',{currentLine:'2x+1',newLine:'-x+8',domain:'[0,8]',operation:'start insertion'}),
    eventFrame(lesson,'int m=(l+r)/2','在左端與中點比較','l=0：新線 8 不優於舊線 1，所以 left=false；m=4：新線 4 優於舊線 9，所以 mid=true。',{l:0,m:4,left:'8<1 false',mid:'4<9 true',operation:'compare two points'}),
    eventFrame(lesson,'if (mid) swap(nw,line[p])','中點較優者留在 Root','mid=true，因此把 -x+8 留在目前節點，原本 2x+1 變成待遞迴的 nw。',{kept:'-x+8',remaining:'2x+1',operation:'swap at midpoint'}),
    eventFrame(lesson,'if (left!=mid) add(nw,p*2,l,m);','優劣只可能在左半翻轉','left=false、mid=true 不同，兩線交點位於左半側，所以只需把 2x+1 遞迴到 [0,4]。',{left:'false',mid:'true',recurse:'[0,4]',line:'2x+1',operation:'recurse left'}),
    eventFrame(lesson,'if (l==r) return','遞迴深度至多 log C','每層只進一個孩子；落敗線若還可能勝出，只會發生在那一側。',{domain:'[0,8]→[0,4]→…',complexity:'O(log C)',operation:'finish insertion'}),
  ],

  'longest-increasing-subsequence': (lesson) => [
    eventFrame(lesson,'vector<int> tails','初始 Tails 為空','輸入使用 [3,1,5,2,6,4,9]。tails[k-1] 代表長度 k 子序列的最小可能結尾。',{input:['3','1','5','2','6','4','9'],tails:[],operation:'initialize'},{values:[3,1,5,2,6,4,9]}),
    eventFrame(lesson,'tails.push_back(x)','x=3：Push','lower_bound 找不到 ≥3 的位置，因此 3 延伸出長度 1。',{x:3,tails:['3'],length:1,operation:'extend'},{values:[3,1,5,2,6,4,9],active:['0']}),
    eventFrame(lesson,'else *it=x','x=1：把 3 換成 1','第一個 ≥1 的位置是 tails[0]；替換不改 LIS 長度，但讓未來更容易延伸。',{x:1,replace:'3→1',tails:['1'],length:1,operation:'improve tail'},{values:[3,1,5,2,6,4,9],active:['1']}),
    eventFrame(lesson,'tails.push_back(x)','x=5：Push','5 大於所有 tails，得到 [1,5]，LIS 長度增為 2。',{x:5,tails:['1','5'],length:2,operation:'extend'},{values:[3,1,5,2,6,4,9],active:['2']}),
    eventFrame(lesson,'else *it=x','x=2：5→2','lower_bound 指向 5；替換後 tails=[1,2]。',{x:2,replace:'5→2',tails:['1','2'],length:2,operation:'improve tail'},{values:[3,1,5,2,6,4,9],active:['3']}),
    eventFrame(lesson,'tails.push_back(x)','x=6：Push','6 延伸長度 2 的最佳尾端 2，tails=[1,2,6]。',{x:6,tails:['1','2','6'],length:3,operation:'extend'},{values:[3,1,5,2,6,4,9],active:['4']}),
    eventFrame(lesson,'else *it=x','x=4：6→4','同長度 3 的尾端從 6 改成 4。',{x:4,replace:'6→4',tails:['1','2','4'],length:3,operation:'improve tail'},{values:[3,1,5,2,6,4,9],active:['5']}),
    eventFrame(lesson,'tails.push_back(x)','x=9：Push，長度 4','9 大於 4，新增一格得到 [1,2,4,9]。',{x:9,tails:['1','2','4','9'],length:4,operation:'extend'},{values:[3,1,5,2,6,4,9],active:['6'],accepted:['1','3','5','6']}),
    eventFrame(lesson,'return tails.size()','回傳 LIS 長度 4','tails 本身不保證是原序列的一條 LIS，但它的長度一定等於 LIS 長度。',{result:4,tails:['1','2','4','9'],operation:'return length'},{accepted:['1','3','5','6']}),
  ],

  'coin-change': (lesson) => [
    eventFrame(lesson,'dp[0]=0','初始化 dp[0]=0','硬幣 {1,3,4}，目標 W=6。空金額需要 0 枚，其餘先為 INF。',{coins:['1','3','4'],W:6,dp:['0','∞','∞','∞','∞','∞','∞'],operation:'initialize'},{values:[0,0,0,0,0,0,0]}),
    eventFrame(lesson,'dp[amount]=min','Amount=1：只能用 Coin 1','dp[1]=dp[0]+1=1。',{amount:1,choices:['coin1→1'],dp:['0','1','∞','∞','∞','∞','∞'],operation:'fill dp[1]'},{values:[0,1,0,0,0,0,0],active:['1']}),
    eventFrame(lesson,'dp[amount]=min','Amount=2：1+1','只有 coin1 可用，dp[2]=dp[1]+1=2。',{amount:2,choices:['coin1→2'],dp:['0','1','2','∞','∞','∞','∞'],operation:'fill dp[2]'},{values:[0,1,2,0,0,0,0],active:['2']}),
    eventFrame(lesson,'dp[amount]=min','Amount=3：Coin 3 直接命中','coin1 給 3 枚；coin3 給 dp[0]+1=1，因此 dp[3]=1。',{amount:3,choices:['coin1→3','coin3→1'],best:1,dp:['0','1','2','1','∞','∞','∞'],operation:'fill dp[3]'},{values:[0,1,2,1,0,0,0],active:['3']}),
    eventFrame(lesson,'dp[amount]=min','Amount=4：Coin 4 直接命中','coin1→2、coin3→2、coin4→1，所以 dp[4]=1。',{amount:4,choices:['coin1→2','coin3→2','coin4→1'],best:1,dp:['0','1','2','1','1','∞','∞'],operation:'fill dp[4]'},{values:[0,1,2,1,1,0,0],active:['4']}),
    eventFrame(lesson,'dp[amount]=min','Amount=5：最少 2 枚','最佳可以是 1+4 或 4+1，因此 dp[5]=2。',{amount:5,choices:['coin1→2','coin3→3','coin4→2'],best:2,dp:['0','1','2','1','1','2','∞'],operation:'fill dp[5]'},{values:[0,1,2,1,1,2,0],active:['5']}),
    eventFrame(lesson,'dp[amount]=min','Amount=6：3+3 最好','coin1→3、coin3→dp[3]+1=2、coin4→dp[2]+1=3，所以 dp[6]=2。',{amount:6,choices:['coin1→3','coin3→2','coin4→3'],best:2,dp:['0','1','2','1','1','2','2'],operation:'fill dp[6]'},{values:[0,1,2,1,1,2,2],active:['6'],accepted:['3','6']}),
    eventFrame(lesson,'return dp[W]','回傳 2','湊出 6 的最少硬幣數是 2，可用 3+3。',{W:6,result:2,example:'3+3',operation:'return answer'},{values:[0,1,2,1,1,2,2],accepted:['3','6']}),
  ],


  'longest-common-subsequence': (lesson) => [
    eventFrame(lesson,'for (int i=1','使用 A="ABC"、B="BAC"','dp[i][j] 表示兩個前綴的 LCS 長度；第 0 列與第 0 欄都是 0。',{A:'ABC',B:'BAC',table:['0 0 0 0','0 · · ·','0 · · ·','0 · · ·'],operation:'initialize table'}),
    eventFrame(lesson,'else dp[i][j]=max','dp[1][1]：A vs B 不同','A[0]=A、B[0]=B 不同，取上方與左方 max(0,0)=0。',{cell:'dp[1][1]',chars:'A vs B',value:0,table:['0 0 0 0','0 0 · ·','0 · · ·','0 · · ·'],operation:'mismatch transition'}),
    eventFrame(lesson,'if (a[i-1]==b[j-1])','dp[1][2]：A == A','字元相同，取左上 dp[0][1]+1=1。',{cell:'dp[1][2]',chars:'A == A',value:1,table:['0 0 0 0','0 0 1 ·','0 · · ·','0 · · ·'],operation:'diagonal plus one'}),
    eventFrame(lesson,'else dp[i][j]=max','dp[1][3]：A vs C','不同，max(dp[0][3],dp[1][2])=1。',{cell:'dp[1][3]',chars:'A vs C',value:1,table:['0 0 0 0','0 0 1 1','0 · · ·','0 · · ·'],operation:'mismatch transition'}),
    eventFrame(lesson,'if (a[i-1]==b[j-1])','dp[2][1]：B == B','相同，dp[2][1]=dp[1][0]+1=1。',{cell:'dp[2][1]',chars:'B == B',value:1,table:['0 0 0 0','0 0 1 1','0 1 · ·','0 · · ·'],operation:'diagonal plus one'}),
    eventFrame(lesson,'else dp[i][j]=max','完成第 2 列','B vs A、C 都不相同；dp[2][2]=1、dp[2][3]=1。',{row:2,values:['1','1','1'],table:['0 0 0 0','0 0 1 1','0 1 1 1','0 · · ·'],operation:'finish row 2'}),
    eventFrame(lesson,'else dp[i][j]=max','dp[3][1], dp[3][2] 都是 1','C 與 B、A 都不相同，因此沿上/左保留最佳值 1。',{row:3,prefixValues:['1','1'],table:['0 0 0 0','0 0 1 1','0 1 1 1','0 1 1 ·'],operation:'carry best prefix'}),
    eventFrame(lesson,'if (a[i-1]==b[j-1])','dp[3][3]：C == C','最後字元相同，dp[3][3]=dp[2][2]+1=2。',{cell:'dp[3][3]',chars:'C == C',value:2,table:['0 0 0 0','0 0 1 1','0 1 1 1','0 1 1 2'],operation:'diagonal plus one'}),
    eventFrame(lesson,'return dp[n][m]','LCS 長度 = 2','ABC 與 BAC 的 LCS 長度為 2，例如 AC 或 BC。',{result:2,examples:['AC','BC'],operation:'return answer'}),
  ].map((frame) => ({ ...frame, executionView: lcsMatrix(frame) })),

  'edit-distance': (lesson) => [
    eventFrame(lesson,'dp[i][0]=i','初始化 "ab" → "acb" 邊界','空字串轉成長度 j 只能插入 j 次；長度 i 轉空字串只能刪除 i 次。',{source:'ab',target:'acb',table:['0 1 2 3','1 · · ·','2 · · ·'],operation:'initialize borders'}),
    eventFrame(lesson,'int cost=','dp[1][1]：a == a，cost=0','三種操作中，左上 dp[0][0]+0=0 最小。',{cell:'dp[1][1]',chars:'a==a',choices:['delete2','insert2','match0'],value:0,operation:'compute cost'}),
    eventFrame(lesson,'dp[i][j]=min','dp[1][2]：a → ac','要把 a 變 ac，最佳是在已匹配 a 後插入 c，所以值 1。',{cell:'dp[1][2]',choices:['delete3','insert1','replace2'],value:1,operation:'take minimum'}),
    eventFrame(lesson,'dp[i][j]=min','dp[1][3]：a → acb','再多一個 b，最佳需要 2 次插入。',{cell:'dp[1][3]',value:2,row:['0','1','2'],operation:'finish row 1'}),
    eventFrame(lesson,'dp[i][j]=min','dp[2][1]：ab → a','刪除尾端 b 即可，值 1。',{cell:'dp[2][1]',value:1,operation:'delete transition'}),
    eventFrame(lesson,'int cost=','dp[2][2]：b vs c，cost=1','刪除、插入、替換三種候選都是從已完成子問題出發；替換給 1。',{cell:'dp[2][2]',chars:'b!=c',choices:['2','2','1'],value:1,operation:'replace transition'}),
    eventFrame(lesson,'dp[i][j]=min','dp[2][3]：b == b','字元相同，沿左上 dp[1][2]=1，不增加成本。',{cell:'dp[2][3]',chars:'b==b',value:1,table:['0 1 2 3','1 0 1 2','2 1 1 1'],operation:'match transition'}),
    eventFrame(lesson,'return dp[n][m]','編輯距離 = 1','只要在 a 與 b 中間插入 c：ab → acb。',{result:1,script:['insert c at index 1'],operation:'return answer'}),
  ].map((frame, step) => ({ ...frame, executionView: editMatrix(step) })),

  'bitmask-dp': (lesson) => [
    eventFrame(lesson,'dp[0] = 0;','n=3，從 Mask 000 開始','dp[000]=0，其餘狀態先為 INF。第 x 位 1 代表元素 x 已處理。',{n:3,dp0:0,operation:'initialize mask DAG'}),
    eventFrame(lesson,'if (!(mask>>x&1))','從 000 可選 0、1、2','三個 bit 都是 0，因此三個元素都可作下一步。',{mask:'000',available:['0','1','2'],operation:'enumerate unset bits'}),
    eventFrame(lesson,'dp[mask|(1<<x)] = min','000 → 001，選 0','示例 cost(000,0)=4，所以 dp[001]=4。',{from:'000',choose:0,to:'001',candidate:4,operation:'relax subset'}),
    eventFrame(lesson,'dp[mask|(1<<x)] = min','000 → 010，選 1','cost(000,1)=2，得到 dp[010]=2。',{from:'000',choose:1,to:'010',candidate:2,operation:'relax subset'}),
    eventFrame(lesson,'dp[mask|(1<<x)] = min','010 → 110，加入 2','中間掃過 mask=001：cost(001,1)=2 得 dp[011]=4+2=6；cost(001,2)=8 得 dp[101]=4+8=12。現在 cost(010,2)=1，得到 dp[110]=2+1=3。',{from:'010',choose:2,to:'110',candidate:'2+1=3',operation:'relax subset'}),
    eventFrame(lesson,'dp[mask|(1<<x)] = min','011 → 111 先得到 7','dp[011]=6，再加 cost(011,2)=1，先把 full mask 更新成 7。',{from:'011',choose:2,to:'111',before:'∞',after:7,operation:'first full-mask candidate'}),
    eventFrame(lesson,'dp[mask|(1<<x)] = min','110 → 111 改善成 4','dp[110]=3，再加入元素 0 的成本 1，候選 4 比 7 好，因此覆寫。',{from:'110',choose:0,to:'111',before:7,after:4,operation:'improve full mask'}),
    eventFrame(lesson,'return dp[(1<<n)-1]','所有 Mask 完成後回傳 4','每次轉移都把 0 bit 變成 1，狀態圖沒有環；最終 dp[111]=4。',{target:'111',result:4,operation:'finish subset DP'}),
  ].map((frame,step)=>({...frame,executionView:bitmaskView(step)})),

  'tsp-dp': (lesson) => [
    eventFrame(lesson,'dp[1 << start][start] = 0','從城市 0 出發','n=4，初始 state 是 mask=0001、u=0，cost=0。示例對稱邊權為 w01=2、w02=9、w03=10、w12=12、w13=4、w23=3。',{state:'0001,u=0',cost:0,operation:'initialize TSP'}),
    eventFrame(lesson,'dp[mask | (1 << v)][v]','0 → 1','w[0][1]=2，所以 dp[0011][1]=2。',{from:'0001,0',edge:'0→1',to:'0011,1',candidate:2,operation:'visit city 1'}),
    eventFrame(lesson,'dp[mask | (1 << v)][v]','0 → 2','另一個候選 dp[0101][2]=9。',{from:'0001,0',edge:'0→2',to:'0101,2',candidate:9,operation:'visit city 2'}),
    eventFrame(lesson,'dp[mask | (1 << v)][v]','0 → 3','dp[1001][3]=10。',{from:'0001,0',edge:'0→3',to:'1001,3',candidate:10,operation:'visit city 3'}),
    eventFrame(lesson,'dp[mask | (1 << v)][v]','0011,1 → 1011,3','已走 0→1 成本 2，再走 1→3 成本 4，得到 state 1011,3 的成本 6。',{from:'0011,1',edge:'1→3 (4)',to:'1011,3',candidate:'2+4=6',operation:'extend path'}),
    eventFrame(lesson,'dp[mask | (1 << v)][v]','1011,3 → 1111,2','再走 3→2 成本 3，完整拜訪所有城市時落在 2，成本 9。',{from:'1011,3',edge:'3→2 (3)',to:'1111,2',candidate:'6+3=9',operation:'complete visit mask'}),
    eventFrame(lesson,'answer = min(answer','加上回到 Start 的最後一邊','從城市 2 回 0 的成本是 9，因此 tour 候選為 9+9=18。',{state:'1111,2',returnEdge:'2→0 (9)',tourCost:18,operation:'close tour'}),
    eventFrame(lesson,'return answer','最短巡迴成本 18','另一方向 0→2→3→1→0 也得到 18；答案為 18。',{result:18,tour:'0→1→3→2→0',operation:'return tour cost'}),
  ].map((frame,step)=>({...frame,executionView:tspView(step)})),

  'euler-circuit': (lesson) => [
    eventFrame(lesson,'stack<int> st; st.push(start)','從 A 開始','底圖現在就是 6-cycle：A-B-D-F-E-C-A，每個節點度數 2，所有非零度節點連通。',{stack:['A'],unusedEdges:6,operation:'push start'},{active:['A']}),
    eventFrame(lesson,'takeUnusedEdge(u); st.push(v)','走 A→B','取走一條未使用邊並把 B push 到 stack。',{edge:'A-B',stack:['A','B'],unusedEdges:5,operation:'consume edge'},{active:['A','B']}),
    eventFrame(lesson,'takeUnusedEdge(u); st.push(v)','沿 B→D→F 繼續','只要 top 還有未使用邊就繼續前進，stack 形成當前 trail。',{edges:['B-D','D-F'],stack:['A','B','D','F'],unusedEdges:3,operation:'extend trail'},{active:['B','D','F']}),
    eventFrame(lesson,'takeUnusedEdge(u); st.push(v)','再走 F→E→C→A','最後一條 C→A 用掉後，stack 成為 A,B,D,F,E,C,A，所有 6 條邊都已使用。',{edges:['F-E','E-C','C-A'],stack:['A','B','D','F','E','C','A'],unusedEdges:0,operation:'consume remaining edges'},{active:['A','C','E','F']}),
    eventFrame(lesson,'circuit.push_back(u); st.pop()','Top A 無未使用邊：開始回退','把 A 加到 circuit 後 pop；接著 C、E、F、D、B、A 都會依序進 circuit。',{deadEnd:'A',circuit:['A'],stack:['A','B','D','F','E','C'],operation:'append on dead end'},{active:['A'],accepted:['A']}),
    eventFrame(lesson,'circuit.push_back(u); st.pop()','整條 Trail 逆序寫入 Circuit','回退完成後 circuit=[A,C,E,F,D,B,A]，這是走訪順序的反向。',{circuit:['A','C','E','F','D','B','A'],stack:[],operation:'finish backtracking'},{accepted:['A','B','C','D','E','F']}),
    eventFrame(lesson,'reverse(circuit.begin()','反轉得到 Euler Circuit','反轉後 A→B→D→F→E→C→A，剛好每條邊一次。',{result:['A','B','D','F','E','C','A'],allEdgesUsed:'true',operation:'reverse circuit'},{accepted:['A','B','C','D','E','F']}),
  ],

  'tree-diameter': (lesson) => [
    eventFrame(lesson,'farthest(0)','第一次搜尋從 A 開始','真正的樹邊是 A-B、A-C、B-D、B-E、D-F。從 A 計算距離。',{start:'A',distances:'A0 B1 C1 D2 E2 F3',operation:'first traversal'},{active:['A','B','C','D','E','F']}),
    eventFrame(lesson,'farthest(0)','最遠點是 F','F 距離 A 為 3，是第一輪找到的直徑端點候選。',{start:'A',farthest:'F',distance:3,operation:'choose endpoint'},{active:['A','B','D','F'],accepted:['F']}),
    eventFrame(lesson,'farthest(x)','第二次從 F 搜尋','從 F 出發，距離依序 F0、D1、B2、A3、E3、C4。',{start:'F',distances:'F0 D1 B2 A3 E3 C4',operation:'second traversal'},{active:['F','D','B','A','C']}),
    eventFrame(lesson,'farthest(x)','最遠點 C，距離 4','F→D→B→A→C 是樹上的唯一路徑，長度 4。',{start:'F',farthest:'C',diameter:4,path:['F','D','B','A','C'],operation:'find opposite endpoint'},{active:['F','D','B','A','C'],accepted:['F','C']}),
    eventFrame(lesson,'max_tree_diameter = diameter','直徑完成','第二次最遠距離就是樹直徑 4。',{result:4,path:['F','D','B','A','C'],operation:'store diameter'},{accepted:['A','B','C','D','F']}),
  ],

  'lca-binary-lifting': (lesson) => [
    eventFrame(lesson,'if (depth[u] < depth[v])','Query LCA(F,C)','F 深度 3、C 深度 1，因此 F 是較深節點，準備先抬高 F。',{u:'F(depth3)',v:'C(depth1)',operation:'compare depths'},{active:['F','C']}),
    eventFrame(lesson,'if (depth[up[u][k]] >= depth[v])','用 2¹ 祖先把 F 跳到 B','F 的 2-step ancestor 是 B，depth(B)=1，剛好與 C 同深。',{k:1,jump:'F→B',u:'B(depth1)',v:'C(depth1)',operation:'lift deeper node'},{active:['F','D','B','C']}),
    eventFrame(lesson,'if (u == v) return u','B 與 C 不相同','同步深度後兩點仍不同，所以要一起往上找 LCA 的下一層。',{u:'B',v:'C',equal:'false',operation:'check same node'},{active:['B','C']}),
    eventFrame(lesson,'if (up[u][k] != up[v][k])','最大可跳祖先已相同','B 與 C 的更高祖先都會到 A，因此不存在能讓兩者祖先仍不同的大跳躍。',{u:'B',v:'C',commonParent:'A',operation:'skip equal ancestors'},{active:['A','B','C']}),
    eventFrame(lesson,'return up[u][0]','回傳 Parent(B)=A','此時 u、v 位於 LCA 的兩個直接子樹，parent[B]=parent[C]=A。',{LCA:'A',operation:'return parent'},{active:['A','B','C'],accepted:['A']}),
  ],

  'euler-tour-flattening': (lesson) => [
    eventFrame(lesson,'tin[u] = timer++','進入 A：tin[A]=0','Preorder 進入節點時記錄 tin 並遞增 timer。',{current:'A',timer:'0→1',tin:'A=0',order:['A'],operation:'enter A'},{active:['A']}),
    eventFrame(lesson,'order.push_back(u)','依 DFS 進入 B','A 的第一個 child 是 B，因此 order=[A,B]、tin[B]=1。',{current:'B',timer:2,tin:'A0 B1',order:['A','B'],operation:'enter B'},{active:['A','B']}),
    eventFrame(lesson,'for (int v : tree[u])','B→D→F 深入','先走 D，再走 F；tin[D]=2、tin[F]=3。',{path:['B','D','F'],timer:4,tin:'D2 F3',order:['A','B','D','F'],operation:'dfs descendants'},{active:['B','D','F']}),
    eventFrame(lesson,'tout[u] = timer','F 返回，tout[F]=4','F 沒有孩子，離開時 timer=4，因此 F 子樹對應 [3,4)。',{node:'F',tin:3,tout:4,range:'[3,4)',operation:'exit F'},{active:['F'],accepted:['F']}),
    eventFrame(lesson,'order.push_back(u)','回到 B 再進入 E','D 完成後 B 的下一個 child E 取得 tin[E]=4；order=[A,B,D,F,E]。',{current:'E',tin:4,order:['A','B','D','F','E'],operation:'enter E'},{active:['B','E']}),
    eventFrame(lesson,'tout[u] = timer','B 子樹完成：range [1,5)','E 返回後 timer=5，B 的所有後代剛好連續占 order[1..5)。',{node:'B',tin:1,tout:5,range:'[1,5)',subtree:['B','D','F','E'],operation:'close subtree'},{active:['B','D','E','F'],accepted:['B','D','E','F']}),
    eventFrame(lesson,'order.push_back(u)','最後進入 C','回到 A 後處理 C，tin[C]=5，order 最終是 [A,B,D,F,E,C]。',{current:'C',tin:5,order:['A','B','D','F','E','C'],operation:'enter C'},{active:['A','C']}),
    eventFrame(lesson,'tout[u] = timer','A 完成：整棵樹 [0,6)','timer=6，tout[A]=6；每個子樹都對應一個半開連續區間。',{tinA:0,toutA:6,range:'[0,6)',order:['A','B','D','F','E','C'],operation:'finish flattening'},{accepted:['A','B','C','D','E','F']}),
  ],


  'tarjan-scc': (lesson) => [
    eventFrame(lesson,'disc[u] = low[u] = timer++','進入 A：disc=low=0，Push Stack','Tarjan 只讓仍在 stack 的節點參與回邊 low-link。',{current:'A',disc:'A0',low:'A0',stack:['A'],operation:'discover A'},{active:['A']}),
    eventFrame(lesson,'disc[v] == -1','A→B→C 深入','B、C 都尚未造訪，依 DFS tree 進入；disc 依序 1、2。',{path:['A','B','C'],disc:'A0 B1 C2',low:'A0 B1 C2',stack:['A','B','C'],operation:'tree-edge DFS'},{active:['A','B','C']}),
    eventFrame(lesson,'else if (inStack[v]) low[u] = min','C→A 是 Stack 內回邊','A 還在 stack，故 low[C]=min(2,disc[A]=0)=0。',{edge:'C→A',before:'low[C]=2',after:'low[C]=0',stack:['A','B','C'],operation:'back-edge update'},{active:['C','A']}),
    eventFrame(lesson,'disc[v] == -1','C→D→E→F 繼續 DFS','沿 C→D、D→E、E→F 進入，disc 分別 3、4、5。',{path:['C','D','E','F'],disc:'D3 E4 F5',stack:['A','B','C','D','E','F'],operation:'discover tail'},{active:['D','E','F']}),
    eventFrame(lesson,'else if (inStack[v]) low[u] = min','E→D 讓 low[E]=3','D 還在 stack，所以 E 可以回到 D 的 discovery time 3。',{edge:'E→D',before:'low[E]=4',after:'low[E]=3',operation:'back-edge update'},{active:['E','D']}),
    eventFrame(lesson,'if (low[u] == disc[u])','F 是自己的 SCC Root','F 沒有回到更早 stack 節點，low[F]=disc[F]=5。',{u:'F',low:5,disc:5,operation:'detect SCC root'},{active:['F']}),
    eventFrame(lesson,'st.top(); st.pop()','Pop F，得到 SCC {F}','從 stack top 彈到 F，F 成為單獨 SCC。',{component:['F'],remainingStack:['A','B','C','D','E'],operation:'pop SCC'},{active:['F'],accepted:['F']}),
    eventFrame(lesson,'if (low[u] == disc[u])','回到 D：low[D]=disc[D]=3','E 的 low=3 傳回 D，因此 D 是下一個 SCC root。',{u:'D',low:3,disc:3,operation:'detect SCC root'},{active:['D','E']}),
    eventFrame(lesson,'st.top(); st.pop()','Pop E、D，得到 SCC {D,E}','從 top 依序彈 E、D。',{component:['D','E'],remainingStack:['A','B','C'],operation:'pop SCC'},{active:['D','E'],accepted:['D','E','F']}),
    eventFrame(lesson,'low[u] = min(low[u], low[v])','Low 值一路傳回 A','C 的 low=0 傳給 B，再傳給 A；A、B、C 都能互相回到 A。',{low:'C0→B0→A0',stack:['A','B','C'],operation:'propagate low-link'},{active:['A','B','C']}),
    eventFrame(lesson,'st.top(); st.pop()','A 為 Root：Pop C、B、A','最後得到 SCC {A,B,C}。所有節點恰好屬於一個 SCC。',{component:['A','B','C'],remainingStack:[],operation:'pop final SCC'},{accepted:['A','B','C','D','E','F']}),
  ],

  'bridges': (lesson) => [
    eventFrame(lesson,'disc[u] = low[u] = timer++','DFS 從 A 開始','圖左側 A-B-C 是三角形，右側 D-E-F 也是三角形，中間只有 B-D 一條連接。',{current:'A',disc:'A0',low:'A0',operation:'start DFS'},{active:['A']}),
    eventFrame(lesson,'dfs(v,id); low[u] = min','沿 A→B→C','disc[A]=0、B=1、C=2。',{treeEdges:['A-B','B-C'],disc:'A0 B1 C2',operation:'tree descent'},{active:['A','B','C']}),
    eventFrame(lesson,'else low[u] = min(low[u],disc[v])','C→A 回邊讓 low[C]=0','C 能繞過父邊 B-C 回到祖先 A，因此這個三角形中的邊都不會是橋。',{edge:'C-A',before:'low[C]=2',after:'low[C]=0',operation:'back-edge low update'},{active:['C','A']}),
    eventFrame(lesson,'low[u] = min(low[u],low[v])','回到 B：low[B]=0','C 子樹可回到 A，所以 B-C 不是橋，B 的 low 也降為 0。',{u:'B',low:'1→0',operation:'propagate child low'},{active:['B','C','A']}),
    eventFrame(lesson,'dfs(v,id); low[u] = min','B→D 進入右側三角形','D=3、E=4、F=5；F→D 是回邊，使 low[F]=3。',{treeEdges:['B-D','D-E','E-F'],backEdge:'F-D',lowF:3,operation:'explore right cycle'},{active:['B','D','E','F']}),
    eventFrame(lesson,'low[u] = min(low[u],low[v])','右側 Low 傳回 D=3','F 的 low=3 傳給 E，再傳給 D；E-F、D-E 都有替代路徑，不是橋。',{low:'F3→E3→D3',operation:'propagate right-cycle low'},{active:['D','E','F']}),
    eventFrame(lesson,'if (low[v] > disc[u]) bridge[id] = true','檢查 B-D：3 > 1','low[D]=3 嚴格大於 disc[B]=1，D 子樹無法繞回 B 或更早祖先，因此 B-D 是橋。',{edge:'B-D',lowD:3,discB:1,result:'bridge',operation:'bridge test'},{active:['B','D'],accepted:['B','D']}),
  ],

  'articulation-points': (lesson) => [
    eventFrame(lesson,'disc[u] = low[u] = timer++','DFS Discovery','使用同一張「兩個三角形由 B-D 相連」的圖。A 為 DFS root。',{root:'A',disc:'A0',operation:'start DFS'},{active:['A']}),
    eventFrame(lesson,'low[u] = min(low[u],disc[v])','左三角形回邊 C→A','low[C]=0，回傳後 low[B]=0；因此刪除 B-C 不會斷開圖。',{edge:'C-A',low:'C2→0, B1→0',operation:'back-edge update'},{active:['A','B','C']}),
    eventFrame(lesson,'++children; dfs(v,u); low[u] = min','B 的另一個 Child 是 D','從 B 沿橋進入右側 D-E-F 三角形。',{u:'B',child:'D',disc:'B1 D3',operation:'visit child subtree'},{active:['B','D']}),
    eventFrame(lesson,'low[u] = min(low[u],disc[v])','F→D 讓右側 Low 回到 3','右側三角形內可以繞行，但無法越過 D 回到 B。',{backEdge:'F-D',low:'F5→3, E4→3, D3',operation:'close right cycle'},{active:['D','E','F']}),
    eventFrame(lesson,'parent != -1 && low[v] >= disc[u]','B 是割點','對 child D，low[D]=3 ≥ disc[B]=1；刪除 B 後右側 {D,E,F} 與 {A,C} 分離。',{u:'B',child:'D',condition:'3≥1',cut:'B',operation:'non-root articulation test'},{active:['B','D'],accepted:['B']}),
    eventFrame(lesson,'parent != -1 && low[v] >= disc[u]','D 也是割點','對 D 的 child E，low[E]=3 ≥ disc[D]=3。等號也算，因為刪掉 D 後回到 D 的回邊也消失。',{u:'D',child:'E',condition:'3≥3',cut:'D',operation:'non-root articulation test'},{active:['D','E'],accepted:['B','D']}),
    eventFrame(lesson,'parent == -1 && children >= 2','A 不是割點','A 在 DFS tree 中只有一個 child B；C 已由 B 被造訪，所以 root 特例不成立。',{root:'A',children:1,result:'not cut',operation:'root articulation test'},{active:['A'],accepted:['B','D']}),
  ],

  'tree-centroid': (lesson) => [
    eventFrame(lesson,'int centroid(int u','固定 Root A 的 Subtree Size','n=6，subtree 為 A6、B4、C1、D2、E1、F1。',{n:6,subtree:'A6 B4 C1 D2 E1 F1',operation:'precomputed subtree sizes'},{active:['A','B','C','D','E','F']}),
    eventFrame(lesson,'if (subtree[v] > n/2)','在 A 發現 B 太大','n/2=3，而 subtree[B]=4>3，所以 A 不可能是重心；重心必在 B 子樹內。',{current:'A',child:'B',size:4,half:3,operation:'follow heavy component'},{active:['A','B']}),
    eventFrame(lesson,'return centroid(v,u,n)','遞迴移到 B','呼叫 centroid(B,A,6)。',{from:'A',to:'B',operation:'move candidate'},{active:['B']}),
    eventFrame(lesson,'if (subtree[v] > n/2)','B 的 Child 都不超過 3','D 子樹大小 2、E 大小 1；B 的父側大小是 6−4=2，也不超過一半。',{current:'B',components:['D-side=2','E-side=1','parent-side=2'],operation:'check all components'},{active:['B','D','E','A']}),
    eventFrame(lesson,'return u','回傳 B 為重心','刪除 B 後所有連通塊大小都 ≤3，因此 B 是 centroid。',{centroid:'B',componentSizes:['2','1','2'],operation:'return centroid'},{active:['B'],accepted:['B']}),
  ],

  'heavy-light-decomposition': (lesson) => [
    eventFrame(lesson,'while (head[u] != head[v])','Query Path C→F','預處理後 heavy chain 是 A-B-D-F；C 與 E 各自是 light chain。u=C、v=F 的 head 不同。',{u:'C',v:'F',headU:'C',headV:'A',operation:'start path query'},{active:['C','F']}),
    eventFrame(lesson,'depth[head[u]] < depth[head[v]]','較深的 Head 是 C','depth(head C)=1 > depth(head F=A)=0，所以不 swap；先處理 C 這條短鏈。',{headU:'C(depth1)',headV:'A(depth0)',operation:'choose deeper chain'},{active:['C','A']}),
    eventFrame(lesson,'answer += query(pos[head[u]], pos[u])','查詢 Segment [C,C]','C 的 chain 只有自己，因此先把 C 的值合併進 answer。',{segment:'pos[C]..pos[C]',pathPiece:['C'],operation:'query chain segment'},{active:['C'],accepted:['C']}),
    eventFrame(lesson,'u = parent[head[u]]','跳過 Light Edge C→A','處理完 C chain 後令 u=parent[C]=A。現在 head[A]=head[F]=A。',{from:'C',to:'A',operation:'jump to parent head'},{active:['A','C']}),
    eventFrame(lesson,'if (depth[u] > depth[v]) swap(u,v)','同鏈內校正端點順序','u=A 深度 0、v=F 深度 3，不需交換。',{u:'A',v:'F',sameHead:'A',operation:'order same-chain endpoints'},{active:['A','F']}),
    eventFrame(lesson,'answer += query(pos[u], pos[v])','一次查完 A-B-D-F','同一 heavy chain 在 base array 中連續，因此查 pos[A]..pos[F] 即完成剩餘路徑。',{segment:'A-B-D-F',pathPiece:['A','B','D','F'],segmentsUsed:2,operation:'final chain query'},{active:['A','B','D','F'],accepted:['A','B','C','D','F']}),
  ],

  'centroid-decomposition': (lesson) => [
    eventFrame(lesson,'findCentroid(component)','整棵 6 點樹找到重心 B','第一層 component 是 {A,B,C,D,E,F}，centroid=B。',{component:['A','B','C','D','E','F'],centroid:'B',operation:'find centroid'},{active:['B']}),
    eventFrame(lesson,'removed[c] = true','標記 B Removed','刪除 B 後原樹切成三個互不相交 component。',{removed:'B',components:['{A,C}','{D,F}','{E}'],operation:'remove centroid'},{active:['A','C','D','E','F'],accepted:['B']}),
    eventFrame(lesson,'decompose(componentOf(v))','遞迴處理 {A,C}','這個兩點 component 的重心可取 A；建立 centroid child A。',{component:['A','C'],childCentroid:'A',operation:'decompose component 1'},{active:['A','C'],accepted:['B']}),
    eventFrame(lesson,'centroidParent[child] = c','設定 Parent[A]=B','Centroid tree 邊 B→A 建立。',{child:'A',parent:'B',operation:'link centroid tree'},{active:['A','B'],accepted:['A','B']}),
    eventFrame(lesson,'decompose(componentOf(v))','遞迴處理 {D,F} 與 {E}','{D,F} 的重心取 D；單點 {E} 的重心就是 E。',{nextCentroids:['D','E'],operation:'decompose remaining components'},{active:['D','E','F'],accepted:['A','B']}),
    eventFrame(lesson,'centroidParent[child] = c','第一層 Centroid Tree 完成','得到 B→A、B→D、B→E；更小 component 繼續遞迴，深度最多 O(log n)。',{centroidTree:['B→A','B→D','B→E'],height:'≤ log n',operation:'finish decomposition layer'},{accepted:['A','B','D','E']}),
  ],

  'tree-isomorphism': (lesson) => [
    eventFrame(lesson,'vector<string> children','從葉節點開始編碼','葉 C、E、F 都沒有 child，因此 children 為空。',{leaves:['C','E','F'],operation:'encode leaves'},{active:['C','E','F']}),
    eventFrame(lesson,'return "(" + concat(children) + ")"','葉編碼都是 ()','節點名稱不進入編碼，所以任何葉都得到同一字串 ()。',{codes:['C=()','E=()','F=()'],operation:'return leaf codes'},{accepted:['C','E','F']}),
    eventFrame(lesson,'children.push_back(encode(v,u))','D 收到 Child F 的 ()','D 只有 F 一個 child，因此 children=[()].',{node:'D',childCodes:['()'],operation:'collect child code'},{active:['D','F']}),
    eventFrame(lesson,'return "(" + concat(children) + ")"','D 編碼為 (())','外層括號包住 child code。',{node:'D',code:'(())',operation:'encode D'},{active:['D'],accepted:['D','F']}),
    eventFrame(lesson,'sort(children.begin(), children.end())','B 排序 D 與 E 的子樹碼','B 的 child codes 是 (()) 與 ()；排序消除兄弟排列順序差異。',{node:'B',before:['(())','()'],after:['(())','()'],operation:'sort child multiset'},{active:['B','D','E']}),
    eventFrame(lesson,'return "(" + concat(children) + ")"','B 編碼為 ((())())','串接排序後 child code，再包一層括號。',{node:'B',code:'((())())',operation:'encode B'},{active:['B'],accepted:['B','D','E','F']}),
    eventFrame(lesson,'sort(children.begin(), children.end())','A 合併 B 與 C','A 的 child codes 是 ((())()) 與 ()，排序後保持此順序。',{node:'A',childCodes:['((())())','()'],operation:'sort root children'},{active:['A','B','C']}),
    eventFrame(lesson,'return "(" + concat(children) + ")"','Root Code = (((())())())','任何僅重新命名、交換兄弟順序但結構相同的 rooted tree 都得到同一 root code。',{root:'A',code:'(((())())())',comparisonTreeCode:'(((())())())',isomorphic:'true',operation:'compare root codes'},{accepted:['A','B','C','D','E','F']}),
  ],

  'merge-sort': (lesson) => [
    eventFrame(lesson,'int m = (l + r) / 2;','Root [0,4)：切在 m=2','輸入 [7,2,9,4]。這一行只計算切點 m=2，資料本身尚未改變。',{range:'[0,4)',mid:2,operation:'split root'},{values:[7,2,9,4],low:0,high:3}),
    eventFrame(lesson,'mergeSort(l, m);','先遞迴處理左半 [0,2)','依 DFS 呼叫順序，必須等 [0,2) 完整排序並 return，Root 才會呼叫右半。左半內部再切成 [0,1) 與 [1,2)。',{call:'mergeSort(0,2)',split:'[0,1)+[1,2)',operation:'enter left recursion'},{values:[7,2,9,4],low:0,high:1}),
    eventFrame(lesson,'if (r - l <= 1) return;','[7]、[2] 都命中 Base Case','兩個長度 1 的子呼叫依序 return；單元素不用修改，接下來回到 mergeSort(0,2) 做 merge。',{baseCalls:['[0,1)','[1,2)'],operation:'return leaf calls'},{values:[7,2,9,4],active:['0','1']}),
    eventFrame(lesson,'tmp.push_back(a[j]);','比較 7 與 2：先 Push 右邊的 2','條件 7<=2 為 false，因此走 else；真正改 tmp 的是 tmp.push_back(a[j])，tmp 由 [] 變 [2]。',{leftFront:7,rightFront:2,branch:'else',tmp:['2'],operation:'push right value'},{values:[7,2,9,4],active:['0','1']}),
    eventFrame(lesson,'while (i < m) { tmp.push_back(a[i]); ++i; }','右半耗盡：把剩餘 7 接到 Tmp','j 已到 r，因此主 while 結束；left remainder loop 執行一次，把 7 接上，tmp=[2,7]。',{remainingLeft:['7'],tmp:['2','7'],operation:'append left remainder'},{values:[7,2,9,4],active:['0']}),
    eventFrame(lesson,'copy(tmp.begin(), tmp.end(), a.begin() + l);','寫回左半：[7,2] → [2,7]','只有 copy 這一行才真正修改原陣列 a；現在 a=[2,7,9,4]。',{range:'[0,2)',tmp:['2','7'],operation:'copy left pair'},{values:[2,7,9,4],accepted:['0','1'],low:0,high:1}),
    eventFrame(lesson,'mergeSort(m, r);','左半 Return 後才進右半 [2,4)','Root 現在呼叫 mergeSort(2,4)，它再切成 [2,3) 與 [3,4)。',{call:'mergeSort(2,4)',split:'[2,3)+[3,4)',operation:'enter right recursion'},{values:[2,7,9,4],low:2,high:3,accepted:['0','1']}),
    eventFrame(lesson,'if (r - l <= 1) return;','[9]、[4] 都命中 Base Case','兩個長度 1 子呼叫依序 return，回到 mergeSort(2,4) 開始合併。',{baseCalls:['[2,3)','[3,4)'],operation:'return right leaves'},{values:[2,7,9,4],active:['2','3'],accepted:['0','1']}),
    eventFrame(lesson,'tmp.push_back(a[j]);','比較 9 與 4：先 Push 4','9<=4 為 false，else branch 把右半的 4 放入 tmp。',{leftFront:9,rightFront:4,branch:'else',tmp:['4'],operation:'push right value'},{values:[2,7,9,4],active:['2','3'],accepted:['0','1']}),
    eventFrame(lesson,'while (i < m) { tmp.push_back(a[i]); ++i; }','右半耗盡：接上剩餘 9','left remainder loop 執行一次，tmp=[4,9]。',{remainingLeft:['9'],tmp:['4','9'],operation:'append left remainder'},{values:[2,7,9,4],active:['2'],accepted:['0','1']}),
    eventFrame(lesson,'copy(tmp.begin(), tmp.end(), a.begin() + l);','寫回右半：[9,4] → [4,9]','copy 後 a=[2,7,4,9]；Root 的兩個 child 現在都已排序完成。',{range:'[2,4)',tmp:['4','9'],operation:'copy right pair'},{values:[2,7,4,9],accepted:['0','1','2','3']}),
    eventFrame(lesson,'tmp.push_back(a[i]);','Final Merge：2 <= 4，Push 2','Root 合併 [2,7] 與 [4,9]。第一個 if 為 true，所以 tmp=[2]，i 前進。',{leftFront:2,rightFront:4,tmp:['2'],operation:'take left 2'},{values:[2,7,4,9],active:['0','2']}),
    eventFrame(lesson,'tmp.push_back(a[j]);','7 > 4，改從右邊 Push 4','下一次比較 7 與 4，走 else；tmp=[2,4]，j 前進到 9。',{leftFront:7,rightFront:4,tmp:['2','4'],operation:'take right 4'},{values:[2,7,4,9],active:['1','2']}),
    eventFrame(lesson,'tmp.push_back(a[i]);','7 <= 9，Push 7','第三次主 while 比較後走左 branch，tmp=[2,4,7]；左半至此耗盡。',{leftFront:7,rightFront:9,tmp:['2','4','7'],operation:'take left 7'},{values:[2,7,4,9],active:['1','3']}),
    eventFrame(lesson,'while (j < r) { tmp.push_back(a[j]); ++j; }','左半耗盡：接上最後的 9','主 while 結束後只剩右半 9；right remainder loop 執行一次，tmp=[2,4,7,9]。',{remainingRight:['9'],tmp:['2','4','7','9'],operation:'append right remainder'},{values:[2,7,4,9],active:['3']}),
    eventFrame(lesson,'copy(tmp.begin(), tmp.end(), a.begin() + l);','Final Copy：排序完成','把完整 tmp 寫回 a[0..4)，得到 [2,4,7,9]。每層總 merge O(n)，遞迴深度 O(log n)，總時間 O(n log n)。',{result:['2','4','7','9'],complexity:'O(n log n)',operation:'final copy'},{values:[2,4,7,9],accepted:['0','1','2','3']}),

  ],
}

export const applyExecutionTraceOverride = (lesson: AlgorithmLesson): AlgorithmLesson => {
  const build = overrides[lesson.id]
  if (!build) return lesson
  const datasetLesson = lessonOverrides[lesson.id] ? { ...lesson, ...lessonOverrides[lesson.id] } : lesson
  const tracedLesson = codeOverrides[lesson.id] ? { ...datasetLesson, code: codeOverrides[lesson.id] } : datasetLesson
  return {
    ...tracedLesson,
    frames: build(tracedLesson),
    traceMode: 'execution',
    animationVersion: 2,
  }
}

export const executionTraceOverrideIds = Object.freeze(Object.keys(overrides))
