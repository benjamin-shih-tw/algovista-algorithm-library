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
  ],,

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
}

export const applyExecutionTraceOverride = (lesson: AlgorithmLesson): AlgorithmLesson => {
  const build = overrides[lesson.id]
  if (!build) return lesson
  const tracedLesson = codeOverrides[lesson.id] ? { ...lesson, code: codeOverrides[lesson.id] } : lesson
  return {
    ...tracedLesson,
    frames: build(tracedLesson),
    traceMode: 'execution',
    animationVersion: 2,
  }
}

export const executionTraceOverrideIds = Object.freeze(Object.keys(overrides))
