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
}

export const applyExecutionTraceOverride = (lesson: AlgorithmLesson): AlgorithmLesson => {
  const build = overrides[lesson.id]
  if (!build) return lesson
  return {
    ...lesson,
    frames: build(lesson),
    traceMode: 'execution',
    animationVersion: 2,
  }
}

export const executionTraceOverrideIds = Object.freeze(Object.keys(overrides))
