import type { AlgorithmLesson, Frame } from './algorithms'

type FrameExtra = Partial<Pick<Frame,
  'active'|'accepted'|'muted'|'values'|'low'|'high'|'mid'|'queue'|'priorityQueue'|'distances'|'hull'|'segmentStep'
>>

const lineNumber = (lesson: AlgorithmLesson, needle: string) => {
  const index = lesson.code.findIndex((line) => line.includes(needle))
  if (index < 0) throw new Error(`Execution trace override ${lesson.id}: cannot find code line containing "${needle}"`)
  return index + 1
}

const eventFrame = (
  lesson: AlgorithmLesson,
  needle: string,
  title: string,
  explanation: string,
  state: Record<string, string | number | string[]>,
  extra: FrameExtra = {},
): Frame => {
  const number = lineNumber(lesson, needle)
  return {
    title,
    explanation,
    codeLine: lesson.code[number - 1].trim(),
    codeLines: [number],
    state,
    ...extra,
  }
}

type TraceBuilder = (lesson: AlgorithmLesson) => Frame[]

const codeOverrides: Record<string, string[]> = {
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
}

const lessonOverrides: Record<string, Partial<AlgorithmLesson>> = {
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
    eventFrame(lesson,'isOpen(c)','讀到 (：Push','左括號尚未配對，先放入 Stack。',{input:'([{}])',i:0,current:'(',stack:['('],operation:'push open'},{values:[1,2,3,4,5,6],active:['0']}),
    eventFrame(lesson,'isOpen(c)','讀到 [：Push','第二個左括號壓在 ( 上方。',{input:'([{}])',i:1,current:'[',stack:['(','['],operation:'push open'},{values:[1,2,3,4,5,6],active:['1']}),
    eventFrame(lesson,'isOpen(c)','讀到 {：Push','最內層左括號 { 成為 top。',{input:'([{}])',i:2,current:'{',stack:['(','[','{'],operation:'push open'},{values:[1,2,3,4,5,6],active:['2']}),
    eventFrame(lesson,'!match(st.top(), c)','讀到 }：先檢查 Top','目前 top 是 {，與 } 正確配對，所以可以繼續。',{input:'([{}])',i:3,current:'}',top:'{',match:'true',stack:['(','[','{'],operation:'check pair'},{values:[1,2,3,4,5,6],active:['2','3']}),
    eventFrame(lesson,'st.pop()','配對 {}：Pop','成功配對後移除 {；現在 [ 成為 top。',{input:'([{}])',i:3,current:'}',stack:['(','['],operation:'pop matched open'},{values:[1,2,3,4,5,6],accepted:['2','3']}),
    eventFrame(lesson,'st.pop()','配對 []：Pop','下一個 ] 與 top=[ 配對，移除 [。',{input:'([{}])',i:4,current:']',stack:['('],operation:'pop matched open'},{values:[1,2,3,4,5,6],accepted:['1','2','3','4']}),
    eventFrame(lesson,'st.pop()','配對 ()：Pop','最後 ) 與 top=( 配對，Stack 變空。',{input:'([{}])',i:5,current:')',stack:[],operation:'pop matched open'},{values:[1,2,3,4,5,6],accepted:['0','1','2','3','4','5']}),
    eventFrame(lesson,'return st.empty()','掃描完成','所有右括號都正確配對，而且 Stack 為空，因此整個字串合法。',{stack:[],result:'valid',operation:'verify empty'},{accepted:['0','1','2','3','4','5']}),
  ],

  'monotonic-stack': (lesson) => [
    eventFrame(lesson,'for (int x : a)','讀入 2','Stack 為空，2 直接成為第一個候選。',{incoming:2,stack:['2'],operation:'push 2'},{values:[2,1,5,3,4,7],active:['0']}),
    eventFrame(lesson,'st.push(x)','讀入 1：保持遞減','1<2，不需要 pop；push 後 Stack=[2,1]。',{incoming:1,stack:['2','1'],operation:'push 1'},{values:[2,1,5,3,4,7],active:['0','1']}),
    eventFrame(lesson,'st.pop()','讀入 5：先 Pop 1','1≤5，1 被更晚且更大的 5 支配，永遠不會再成為更好的候選。',{incoming:5,stack:['2'],removed:1,operation:'pop dominated'},{values:[2,1,5,3,4,7],active:['1','2'],muted:['1']}),
    eventFrame(lesson,'st.pop()','5 繼續 Pop 2','2≤5，同理移除 2。每個元素最多只會被 pop 一次。',{incoming:5,stack:[],removed:2,operation:'pop dominated'},{values:[2,1,5,3,4,7],active:['0','2'],muted:['0','1']}),
    eventFrame(lesson,'st.push(x)','Push 5','被支配元素清空後，把 5 放入 Stack。',{incoming:5,stack:['5'],operation:'push 5'},{values:[2,1,5,3,4,7],active:['2'],accepted:['2']}),
    eventFrame(lesson,'st.push(x)','讀入 3：Push','3<5，Stack 變成 [5,3]。',{incoming:3,stack:['5','3'],operation:'push 3'},{values:[2,1,5,3,4,7],active:['2','3']}),
    eventFrame(lesson,'st.pop()','讀入 4：Pop 3','3≤4，3 被 4 支配，因此移除 3。',{incoming:4,stack:['5'],removed:3,operation:'pop dominated'},{values:[2,1,5,3,4,7],active:['3','4'],muted:['3']}),
    eventFrame(lesson,'st.push(x)','Push 4','5>4，停止 pop 並 push 4，恢復嚴格遞減 Stack=[5,4]。',{incoming:4,stack:['5','4'],operation:'push 4'},{values:[2,1,5,3,4,7],active:['2','4']}),
    eventFrame(lesson,'st.pop()','讀入 7：清掉 4 與 5','7 比目前所有候選都大，因此依序 pop 4、5。',{incoming:7,stack:[],removed:'4,5',operation:'pop dominated values'},{values:[2,1,5,3,4,7],active:['2','4','5'],muted:['2','4']}),
    eventFrame(lesson,'st.push(x)','Push 7，掃描完成','最後 Stack=[7]。總操作數是 O(n)，因為每個元素最多 push/pop 各一次。',{incoming:7,stack:['7'],operation:'push 7',result:'O(n)'},{values:[2,1,5,3,4,7],active:['5'],accepted:['5']}),
  ],

  'next-greater-element': (lesson) => [
    eventFrame(lesson,'st.push(i)','i=0，2 尚未有答案','把索引 0 放入 Stack，等待右側第一個更大的值。',{i:0,value:2,stack:['0(2)'],answers:['?','?','?','?','?'],operation:'push index'},{values:[2,1,5,3,4],active:['0']}),
    eventFrame(lesson,'st.push(i)','i=1，1 也等待答案','1<2，不會解決索引 0；索引 1 也入 Stack。',{i:1,value:1,stack:['0(2)','1(1)'],answers:['?','?','?','?','?'],operation:'push index'},{values:[2,1,5,3,4],active:['0','1']}),
    eventFrame(lesson,'answer[st.top()]','i=2，5 解決索引 1','5>1，所以 NGE[1]=5；先寫答案再 pop 索引 1。',{i:2,value:5,resolved:'NGE[1]=5',stack:['0(2)','1(1)'],operation:'resolve top'},{values:[2,1,5,3,4],active:['1','2'],accepted:['1']}),
    eventFrame(lesson,'st.pop()','Pop 索引 1','索引 1 已經得到第一個右側更大值，不再需要留在 Stack。',{i:2,stack:['0(2)'],removed:'1(1)',operation:'pop resolved index'},{values:[2,1,5,3,4],active:['0','2']}),
    eventFrame(lesson,'answer[st.top()]','5 繼續解決索引 0','5>2，而且 1 並沒有比 2 大，所以 5 也是 2 的第一個右側更大值。',{i:2,value:5,resolved:'NGE[0]=5',stack:['0(2)'],operation:'resolve top'},{values:[2,1,5,3,4],active:['0','2'],accepted:['0','1']}),
    eventFrame(lesson,'st.push(i)','把索引 2 放入 Stack','前面較小元素都已解決，現在 5 自己等待右側更大值。',{i:2,value:5,stack:['2(5)'],answers:['5','5','?','?','?'],operation:'push index'},{values:[2,1,5,3,4],active:['2']}),
    eventFrame(lesson,'st.push(i)','i=3，3 入 Stack','3<5，不能解決 5，因此索引 3 入 Stack。',{i:3,value:3,stack:['2(5)','3(3)'],operation:'push index'},{values:[2,1,5,3,4],active:['2','3']}),
    eventFrame(lesson,'answer[st.top()]','i=4，4 解決索引 3','4>3，因此 NGE[3]=4。',{i:4,value:4,resolved:'NGE[3]=4',stack:['2(5)','3(3)'],operation:'resolve top'},{values:[2,1,5,3,4],active:['3','4'],accepted:['3']}),
    eventFrame(lesson,'st.push(i)','掃描結束','索引 2(5) 與 4(4) 右側沒有更大值，因此答案維持 -1。',{stack:['2(5)','4(4)'],answers:['5','5','-1','4','-1'],operation:'finish unresolved'},{values:[2,1,5,3,4],accepted:['0','1','2','3','4']}),
  ],

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
    eventFrame(lesson,'int u=q.front()','Pop A','展開 A，所有未染色鄰居必須染成相反色 1。',{current:'A',colors:'A=0',queue:[],operation:'pop A'},{active:['A'],queue:[]}),
    eventFrame(lesson,'color[v]=color[u]^1','A→B：B 染成 1','B 未染色，因此 color[B]=1 並入隊。',{edge:'A-B',colors:'A=0,B=1',queue:['B'],operation:'color B'},{active:['A','B'],accepted:['A','B'],queue:['B']}),
    eventFrame(lesson,'color[v]=color[u]^1','A→C：C 染成 1','C 同樣與 A 相鄰，因此 C=1。',{edge:'A-C',colors:'A=0,B=1,C=1',queue:['B','C'],operation:'color C'},{active:['A','C'],accepted:['A','B','C'],queue:['B','C']}),
    eventFrame(lesson,'color[v]=color[u]^1','B→D：D 染成 0','展開 B 時 D 尚未染色，所以 D 必須與 B 相反，得到 0。',{edge:'B-D',colors:'B=1,D=0',queue:['C','D'],operation:'color D'},{active:['B','D'],accepted:['A','B','C','D'],queue:['C','D']}),
    eventFrame(lesson,'color[v]=color[u]^1','C→E：E 染成 0','同理 E=0。',{edge:'C-E',colors:'C=1,E=0',queue:['D','E'],operation:'color E'},{active:['C','E'],accepted:['A','B','C','D','E'],queue:['D','E']}),
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
    eventFrame(lesson,'long long s = 0;','Prefix(6)：累加器從 0 開始','查詢前綴 [1,6]，先令 s=0。',{query:'prefix(6)',i:6,sum:0,operation:'initialize prefix'}),
    eventFrame(lesson,'for (; i > 0; i -= i & -i) s += bit[i];','讀 bit[6]','lowbit(6)=2，bit[6] 代表 [5,6]；目前值為 0，所以 s 仍為 0。',{i:6,lowbit:2,covered:'[5,6]',sum:'0+0=0',operation:'accumulate bit[6]'},{active:['5']}),
    eventFrame(lesson,'for (; i > 0; i -= i & -i) s += bit[i];','i=4：讀 bit[4]','6−lowbit(6)=4；bit[4] 代表 [1,4]，值為 5，所以 s=5。',{i:4,lowbit:4,covered:'[1,4]',sum:'0+5=5',operation:'accumulate bit[4]'},{active:['3'],accepted:['2']}),
    eventFrame(lesson,'return s;','Prefix(6)=5','4−lowbit(4)=0，查詢結束；位置 3 的 +5 正確落在前綴中。',{query:'prefix(6)',result:5,operation:'return prefix'},{accepted:['2']}),
  ],

  'sparse-table': (lesson) => [
    eventFrame(lesson,'st[0] = a;','Level 0 直接複製原陣列','st[0][i] 表示長度 1 的區間最小值，因此就是 a[i]。',{level:0,intervalLength:1,row:['2','5','1','4','9','3','7','6'],operation:'copy base level'},{values:[2,5,1,4,9,3,7,6]}),
    eventFrame(lesson,'for (int j = 1; j < k; ++j)','建立 Level 1','j=1 代表長度 2；每格由兩個長度 1 區間合併。',{level:1,intervalLength:2,operation:'build level 1'},{values:[2,5,1,4,9,3,7,6]}),
    eventFrame(lesson,'st[j][i] = min','st[1][1] = min(5,1)=1','區間 [1,2] 的最小值由 st[0][1] 與 st[0][2] 合併。',{cell:'st[1][1]',left:5,right:1,result:1,operation:'merge length-1 blocks'},{active:['1','2'],accepted:['2']}),
    eventFrame(lesson,'st[j][i] = min','建立 Level 2 的 [2,5]','j=2 代表長度 4；st[2][2]=min(st[1][2],st[1][4])=min(1,3)=1。',{cell:'st[2][2]',interval:'[2,5]',leftBlock:'[2,3]=1',rightBlock:'[4,5]=3',result:1,operation:'merge length-2 blocks'},{active:['2','3','4','5'],accepted:['2']}),
    eventFrame(lesson,'int k = 31 - __builtin_clz','Query [2,6]：選 k=2','查詢長度 5，floor(log2 5)=2，所以使用兩個長度 4 的區塊。',{query:'[2,6]',length:5,k:2,blockLength:4,operation:'choose power of two'},{low:2,high:6}),
    eventFrame(lesson,'return min(st[k][l]','用 [2,5] 與 [3,6] 覆蓋','兩個區塊可以重疊；min 是冪等運算，重複元素不影響答案。min(1,3)=1。',{leftBlock:'[2,5]→1',rightBlock:'[3,6]→3',answer:1,operation:'two-block RMQ'},{low:2,high:6,accepted:['2']}),
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
    eventFrame(lesson,'for (int k = 0; k < n; ++k)','初始矩陣：只允許直接邊','A→B=3、A→C=10、A→D=20、B→C=2、B→D=8、C→D=1。尚未允許任何中繼點。',{k:'none',AtoC:10,AtoD:20,BtoD:8,operation:'initial distances'},{active:['A','B','C','D']}),
    eventFrame(lesson,'dist[i][j] = min','k=B：A→C 改成 5','比較 direct 10 與 A→B→C = 3+2=5，取 5。',{k:'B',pair:'A→C',direct:10,via:'3+2=5',result:5,operation:'relax via B'},{active:['A','B','C']}),
    eventFrame(lesson,'dist[i][j] = min','k=B：A→D 改成 11','A→B→D = 3+8=11，比原本 20 好。',{k:'B',pair:'A→D',direct:20,via:'3+8=11',result:11,operation:'relax via B'},{active:['A','B','D']}),
    eventFrame(lesson,'dist[i][j] = min','k=C：B→D 改成 3','B→C→D = 2+1=3，比直接邊 8 好。',{k:'C',pair:'B→D',direct:8,via:'2+1=3',result:3,operation:'relax via C'},{active:['B','C','D']}),
    eventFrame(lesson,'dist[i][j] = min','k=C：A→D 再改成 6','現在 dist[A][C]=5，所以 A→C→D = 5+1=6，比上一輪的 11 更短。',{k:'C',pair:'A→D',before:11,via:'5+1=6',result:6,operation:'relax via C'},{active:['A','C','D']}),
    eventFrame(lesson,'for (int k = 0; k < n; ++k)','所有中繼點完成','k 依序放在最外層，確保每輪只使用已允許的中繼點。最終 A→D=6。',{allowed:'A,B,C,D',result:'A→D=6',operation:'finish all-pairs'},{accepted:['A','B','C','D']}),
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
    eventFrame(lesson,'dq.front() <= i-k','i=4：索引 1 過期','新視窗是 [2,4]，front=1≤i-k=1，所以先 pop_front。',{i:4,expired:'1(3)',deque:['2(-1)','3(-3)'],operation:'remove expired'},{values:[1,3,-1,-3,5,3,6,7],low:2,high:4,muted:['1']}),
    eventFrame(lesson,'a[dq.back()] <= a[i]','新值 5 清掉尾端候選','5 依序支配 -3 與 -1；Deque 被清空。',{i:4,incoming:5,popped:['3(-3)','2(-1)'],deque:[],operation:'remove dominated'},{values:[1,3,-1,-3,5,3,6,7],active:['2','3','4'],muted:['2','3']}),
    eventFrame(lesson,'dq.push_back(i)','Push 4(5)，輸出 5','5 成為 front，因此視窗 [2,4] 最大值是 5。',{i:4,deque:['4(5)'],maximum:5,operation:'push and emit'},{values:[1,3,-1,-3,5,3,6,7],low:2,high:4,accepted:['4']}),
    eventFrame(lesson,'a[dq.back()] <= a[i]','後續 6、7 持續支配舊候選','i=6 的 6 清掉 3、5；i=7 的 7 再清掉 6。每個索引最多進出一次。',{finalDeque:['7(7)'],answers:['3','3','5','5','6','7'],operation:'finish windows'},{values:[1,3,-1,-3,5,3,6,7],active:['7'],accepted:['7']}),
  ],

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
