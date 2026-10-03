import type { AlgorithmLesson, Frame } from './algorithms'
import { eventFrame, lineNumber } from './traceAuthoring'
import { applyS2StringsMathOverride } from './s2ExecutionOverridesStringsMath'
import { applyS2GraphTreeOverride } from './s2ExecutionOverridesGraphTree'
import { applyS2DataDpOverride } from './s2ExecutionOverridesDataDp'
import { applyS2DpTreeOfflineOverride } from './s2ExecutionOverridesDpTreeOffline'
import { applyS2AdvancedStringOverride } from './s2ExecutionOverridesAdvancedStrings'
import { applyS2AdvancedMathOverride } from './s2ExecutionOverridesAdvancedMath'
import { applyS2GeometryOverride } from './s2ExecutionOverridesGeometry'
import { applyS2MiscOverride } from './s2ExecutionOverridesMisc'

type TraceBuilder = (lesson: AlgorithmLesson) => Frame[]

const countingSortCode = [
  'vector<int> countingSort(vector<int> a,int K) {',
  '  vector<int> count(K+1,0);',
  '  for(int x:a) ++count[x];',
  '  int p=0;',
  '  for(int value=0;value<=K;++value)',
  '    for(int copies=0;copies<count[value];++copies) a[p++]=value;',
  '  return a;',
  '}',
]
const countingSortView = (step:number):NonNullable<Frame['executionView']> => {
  const counts=step===0?[0,0,0,0,0,0]:step===1?[0,0,2,0,1,0]:[0,1,3,1,1,1]
  const emitted=step<3?[0,0,0,0,0,0]:step===3?[0,1,0,0,0,0]:step===4?[0,1,3,0,0,0]:[0,1,3,1,1,1]
  const output=['∅','∅','∅','1','1,2,2,2','1,2,2,2,3,4,5'][step]
  const active=step===1?[2,4]:step===2?[1,2,3,4,5]:step===3?[1]:step===4?[2]:step===5?[3,4,5]:[]
  return {kind:'table',title:'COUNTING SORT · count[v] and emitted copies',
    columns:['value','count[v]','emitted'],rows:counts.map((count,value)=>[String(value),String(count),String(emitted[value])]),
    activeCells:active.map((value)=>`${value},${step<3?1:2}`),
    badges:[`input = 4,2,2,5,3,2,1`,`output = ${output}`],
  }
}
const inversionMergeView = (frame:Frame,step:number):NonNullable<Frame['executionView']> => {
  const buffer=Array.isArray(frame.state?.buffer)?frame.state.buffer:step>=5?['1','2','3','4','5']:[]
  const answer=frame.state?.answer??frame.state?.result??0
  return {kind:'table',title:'INVERSION COUNTING · merge two sorted halves',
    columns:['part','current state'],
    rows:[['left sorted','[2,4]'],['right sorted','[1,3,5]'],['merge buffer',buffer.length?`[${buffer.join(',')}]`:'∅'],['counted pairs',String(answer)]],
    activeRow:step>=5?3:step>=2?2:undefined,
    badges:[step>=5?'a = [1,2,3,4,5]':'a = [2,4,1,3,5]',...(frame.state?.add!==undefined?[`this comparison +${frame.state.add}`]:[])],
  }
}
const fractionalKnapsackCode = [
  'struct FractionalItem { double weight,value; };',
  'double fractionalKnapsack(vector<FractionalItem> items,double capacity) {',
  '  sort(items.begin(),items.end(),[](auto a,auto b){return a.value*b.weight>b.value*a.weight;});',
  '  double answer=0;',
  '  for(auto item:items){',
  '    double take=min(capacity,item.weight);',
  '    answer+=take*item.value/item.weight;',
  '    capacity-=take;',
  '    if(capacity==0) break;',
  '  }',
  '  return answer;',
  '}',
]
const fractionalKnapsackView = (step:number):NonNullable<Frame['executionView']> => {
  const taken=[['0','0','0'],['0','0','0'],['預計 10','0','0'],['10','0','0'],['10','20','0'],['10','20','預計 20/30'],['10','20','20/30']][step]
  return {kind:'table',title:'FRACTIONAL KNAPSACK · highest value per weight first',
    columns:['weight','value','density','taken'],
    rows:[[10,60,6],[20,100,5],[30,120,4]].map(([weight,value,density],index)=>[String(weight),String(value),String(density),taken[index]]),
    activeCells:(step===2||step===3?['0,3']:step===4?['1,3']:step>=5?['2,3']:[]),
    badges:[`capacity = ${[50,50,50,40,20,20,0][step]}`,`answer = ${[0,0,0,60,160,160,240][step]}`],
  }
}
const histogramCode = [
  'int largestRectangleArea(const vector<int>& height) {',
  '  int n=height.size(), answer=0;',
  '  stack<int> st;',
  '  for(int i=0;i<=n;++i){',
  '    int h=i==n?0:height[i];',
  '    while(!st.empty() && height[st.top()]>h){',
  '      int k=st.top(); st.pop();',
  '      int left=st.empty()?0:st.top()+1;',
  '      answer=max(answer,height[k]*(i-left));',
  '    }',
  '    st.push(i);',
  '  }',
  '  return answer;',
  '}',
]
const histogramView = (step:number):NonNullable<Frame['executionView']> => {
  const stack=[[],['0(2)'],[],[],['1(1)','2(5)','3(6)'],['1(1)','2(5)'],['1(1)'],[]][step]
  const active=[[],[0],[0,1],[0],[1,2,3],[3],[2,3],[]][step]
  const area=step===3?'area = 2 × 1 = 2':step===5?'area = 6 × 1 = 6':step===6?'area = 5 × 2 = 10':undefined
  return {kind:'table',title:'HISTOGRAM · pop fixes the widest rectangle',
    columns:['index','height','stack status'],
    rows:[2,1,5,6,2,3].map((height,index)=>[String(index),String(height),stack.some((entry)=>entry.startsWith(`${index}(`))?'候選':'—']),
    activeCells:active.map((index)=>`${index},1`),
    badges:[`stack = [${stack.join(', ')}]`,`best = ${[0,0,0,2,2,6,10,10][step]}`,...(area?[area]:[])],
  }
}
const slidingWindowMaximumCode = [
  'vector<int> slidingWindowMaximum(const vector<int>& a,int k) {',
  '  deque<int> dq;',
  '  vector<int> answer;',
  '  for(int i=0;i<(int)a.size();++i){',
  '    while(!dq.empty() && dq.front()<=i-k) dq.pop_front();',
  '    while(!dq.empty() && a[dq.back()]<=a[i]) dq.pop_back();',
  '    dq.push_back(i);',
  '    if(i>=k-1) answer.push_back(a[dq.front()]);',
  '  }',
  '  return answer;',
  '}',
]
const windowMaximumView = (step:number):NonNullable<Frame['executionView']> => {
  const deque=[[],[1],[1,2],[1,2,3],[2,3],[],[4],[7]][step]
  const window=[undefined,undefined,'[0,2]','[1,3]','[2,4]','[2,4]','[2,4]','[5,7]'][step]
  const output=['[]','[]','[3]','[3,3]','[3,3]','[3,3]','[3,3,5]','[3,3,5,5,6,7]'][step]
  return {kind:'table',title:'WINDOW MAXIMUM · deque keeps undominated indices',
    columns:['index','a[i]','in deque'],
    rows:[1,3,-1,-3,5,3,6,7].map((value,index)=>[String(index),String(value),deque.includes(index)?'候選':'—']),
    activeCells:(step===1?[0,1]:step===2?[0,1,2]:step===3?[1,2,3]:step===4?[1,2,3,4]:step===5?[2,3,4]:step===6?[4]:step===7?[7]:[]).map((index)=>`${index},1`),
    badges:[`deque = [${deque.map((index)=>`${index}(${[1,3,-1,-3,5,3,6,7][index]})`).join(', ')}]`,...(window?[`window = ${window}`]:[]),`output = ${output}`],
  }
}
const expressionEvaluationCode = [
  'long long evaluateExpression(const vector<string>& tokens) {',
  '  vector<long long> values;',
  '  vector<string> ops;',
  '  auto precedence=[](const string& op){return op=="+"||op=="-"?1:2;};',
  '  auto applyTop=[&](){',
  '    string op=ops.back(); ops.pop_back();',
  '    long long b=values.back(); values.pop_back();',
  '    long long a=values.back(); values.pop_back();',
  '    values.push_back(op=="+"?a+b:op=="-"?a-b:op=="*"?a*b:a/b);',
  '  };',
  '  for(const string& t:tokens){',
  '    if(isdigit((unsigned char)t[0])) values.push_back(stoll(t));',
  '    else if(t=="(") ops.push_back(t);',
  '    else if(t==")"){ while(ops.back()!="(") applyTop(); ops.pop_back(); }',
  '    else {',
  '      while(!ops.empty() && ops.back()!="(" && precedence(ops.back())>=precedence(t)) applyTop();',
  '      ops.push_back(t);',
  '    }',
  '  }',
  '  while(!ops.empty()) applyTop();',
  '  return values.back();',
  '}',
]
const expressionEvaluationView = (step:number):NonNullable<Frame['executionView']> => {
  const values=[[],['3'],['3'],['3','4'],['3','4'],['3','4','2'],['3','8'],['11']][step]
  const ops=[[],[],['+'],['+'],['+','*'],['+','*'],['+'],[]][step]
  return {kind:'table',title:'EXPRESSION EVALUATION · 3 + 4 * 2',
    columns:['token index','token','read'],
    rows:['3','+','4','*','2'].map((token,index)=>[String(index),token,index<=Math.min(step-1,4)?'已讀':'待讀']),
    activeCells:step>=1&&step<=5?[`${step-1},1`]:[],
    badges:[`values = [${values.join(',')}]`,`ops = [${ops.join(',')}]`,...(step===6?['4 * 2 = 8']:step===7?['3 + 8 = 11']:[])],
  }
}

const intervalSchedulingCode = [
  'int maxNonOverlapping(vector<pair<int,int>> intervals) {',
  '  sort(intervals.begin(), intervals.end(), [](auto a, auto b) { return a.second < b.second; });',
  '  int lastEnd = numeric_limits<int>::min(), answer = 0;',
  '  for(auto [l,r]:intervals) if(l>=lastEnd){',
  '    ++answer; lastEnd=r;',
  '  }',
  '  return answer;',
  '}',
]
const intervalSchedulingView = (step: number): NonNullable<Frame['executionView']> => {
  const intervals = [[1,4],[3,5],[0,6],[5,7],[3,9],[5,9],[6,10],[8,11]]
  const decided = [0,0,1,3,4,7,8][step]
  const active = [[],[],[0],[1,2],[3],[4,5,6],[7]][step]
  return {kind:'table',title:'INTERVAL SCHEDULING · sorted by finish time',
    columns:['start','end','decision'],
    rows:intervals.map(([l,r],index)=>[String(l),String(r),index>=decided?'待檢查':[0,3,7].includes(index)?'接受':'跳過']),
    activeCells:active.map((index)=>`${index},2`),
    badges:[`lastEnd = ${['—','−∞','4','4','7','7','11'][step]}`,`accepted = ${[0,0,1,1,2,2,3][step]}`],
  }
}
const jobSchedulingCode = [
  'int maxJobsBeforeDeadlines(vector<pair<int,int>> jobs) {',
  '  sort(jobs.begin(), jobs.end());',
  '  priority_queue<int> durations; long long used=0;',
  '  for(auto [deadline,duration]:jobs){',
  '    used+=duration; durations.push(duration);',
  '    if(used>deadline){',
  '      used-=durations.top(); durations.pop();',
  '    }',
  '  }',
  '  return durations.size();',
  '}',
]
const jobSchedulingView = (step: number): NonNullable<Frame['executionView']> => {
  const statuses = [
    ['待處理','待處理','待處理','待處理'],
    ['保留','待處理','待處理','待處理'],
    ['保留','保留','待處理','待處理'],
    ['保留','保留','暫收','待處理'],
    ['移除','保留','保留','待處理'],
    ['移除','保留','保留','保留'],
  ][step]
  const jobs=[[3,3],[4,1],[4,2],[6,3]]
  return {kind:'table',title:'DEADLINE SCHEDULING · keep maximum feasible count',
    columns:['deadline','duration','decision'],rows:jobs.map(([deadline,duration],index)=>[String(deadline),String(duration),statuses[index]]),
    activeCells:(step===3?[2]:step===4?[0]:step===5?[3]:step>0?[step-1]:[]).map((index)=>`${index},2`),
    badges:[`used = ${[0,3,4,6,3,6][step]}`,`kept = ${[0,1,2,3,2,3][step]}`],
  }
}
const intervalCoveringCode = [
  'struct CoverInterval { double l, r; };',
  'int minIntervalsToCover(vector<CoverInterval> intervals, double L, double R) {',
  '  sort(intervals.begin(), intervals.end(), [](auto a, auto b) { return a.l < b.l; });',
  '  int n=intervals.size(), i=0, answer=0;',
  '  double covered=L;',
  '  while(covered<R){',
  '    double far=covered;',
  '    while(i<n && intervals[i].l<=covered) far=max(far,intervals[i++].r);',
  '    if(far==covered) return -1;',
  '    covered=far; ++answer;',
  '  }',
  '  return answer;',
  '}',
]
const intervalCoveringView = (step: number): NonNullable<Frame['executionView']> => {
  const intervals=[[-1,3],[0,4],[2,7],[4,6],[6,10],[7,12]]
  const status=[
    ['待檢查','待檢查','待檢查','待檢查','待檢查','待檢查'],
    ['待檢查','待檢查','待檢查','待檢查','待檢查','待檢查'],
    ['候選','最遠','待檢查','待檢查','待檢查','待檢查'],
    ['跳過','選用','待檢查','待檢查','待檢查','待檢查'],
    ['跳過','選用','最遠','候選','待檢查','待檢查'],
    ['跳過','選用','選用','跳過','待檢查','待檢查'],
    ['跳過','選用','選用','跳過','候選','最遠'],
    ['跳過','選用','選用','跳過','跳過','選用'],
  ][step]
  const active=[[],[],[0,1],[1],[2,3],[2],[4,5],[5]][step]
  return {kind:'table',title:'INTERVAL COVERING · farthest reachable right end',
    columns:['left','right','decision'],rows:intervals.map(([l,r],index)=>[String(l),String(r),status[index]]),
    activeCells:active.map((index)=>`${index},2`),
    badges:[`covered = ${['—','0','0','4','4','7','7','12'][step]}`,`far = ${['—','—','4','4','7','7','12','12'][step]}`],
  }
}
const intervalMergingCode = [
  'vector<pair<int,int>> mergeIntervals(vector<pair<int,int>> intervals) {',
  '  sort(intervals.begin(), intervals.end());',
  '  vector<pair<int,int>> out;',
  '  for(auto [l,r]:intervals){',
  '    if(out.empty() || l>out.back().second) out.push_back({l,r});',
  '    else out.back().second=max(out.back().second,r);',
  '  }',
  '  return out;',
  '}',
]
const intervalMergingView = (step: number): NonNullable<Frame['executionView']> => {
  const intervals=[[1,3],[2,6],[8,10],[9,12],[15,18]]
  const status=[
    ['待處理','待處理','待處理','待處理','待處理'],
    ['新段','待處理','待處理','待處理','待處理'],
    ['新段','合併','待處理','待處理','待處理'],
    ['新段','合併','新段','待處理','待處理'],
    ['新段','合併','新段','合併','待處理'],
    ['新段','合併','新段','合併','新段'],
  ][step]
  const output=['∅','(1,3)','(1,6)','(1,6), (8,10)','(1,6), (8,12)','(1,6), (8,12), (15,18)'][step]
  return {kind:'table',title:'INTERVAL MERGING · sorted input and union',
    columns:['left','right','action'],rows:intervals.map(([l,r],index)=>[String(l),String(r),status[index]]),
    activeRow:step?step-1:undefined,badges:[`out = ${output}`],
  }
}

const prefixMatrix = (cells: string[][], activeCells: string[] = []): NonNullable<Frame['executionView']> => ({
  kind: 'matrix', title: '2D PREFIX · pref[r][c] = sum of [0,r) × [0,c)', cells,
  rowLabels: ['0', '1', '2', '3'], colLabels: ['0', '1', '2', '3'], activeCells,
})
const prefixBorder = [
  ['0', '0', '0', '0'], ['0', '—', '—', '—'], ['0', '—', '—', '—'], ['0', '—', '—', '—'],
]
const prefixComplete = [
  ['0', '0', '0', '0'], ['0', '1', '3', '6'], ['0', '5', '12', '21'], ['0', '12', '27', '45'],
]

const overrides: Record<string, TraceBuilder> = {
  'prefix-xor': (lesson) => [
    eventFrame(lesson,'vector<int> px','建立 px[0]=0','使用 a=[5,2,7,3,2]。px[i] 表示 a[0..i) 的 XOR。',{input:['5','2','7','3','2'],px:['0'],operation:'initialize prefix xor'},{values:[5,2,7,3,2]}),
    eventFrame(lesson,'px[i+1]=px[i]^a[i]','i=0：px[1]=0 XOR 5=5','第一個前綴只包含 a[0]=5。',{i:0,formula:'0 XOR 5',px:['0','5'],operation:'extend prefix'},{values:[5,2,7,3,2],active:['0']}),
    eventFrame(lesson,'px[i+1]=px[i]^a[i]','i=1：px[2]=5 XOR 2=7','加入 a[1]=2 後得到 7。',{i:1,formula:'5 XOR 2',px:['0','5','7'],operation:'extend prefix'},{values:[5,2,7,3,2],active:['1']}),
    eventFrame(lesson,'px[i+1]=px[i]^a[i]','i=2：px[3]=7 XOR 7=0','相同值 XOR 會消掉，所以目前前綴回到 0。',{i:2,formula:'7 XOR 7',px:['0','5','7','0'],operation:'extend prefix'},{values:[5,2,7,3,2],active:['2']}),
    eventFrame(lesson,'px[i+1]=px[i]^a[i]','完成 Prefix XOR','後兩格依序得到 px[4]=3、px[5]=1。',{px:['0','5','7','0','3','1'],operation:'finish prefix table'},{values:[5,2,7,3,2],accepted:['0','1','2','3','4']}),
    eventFrame(lesson,'return px[r+1]^px[l]','Query [1,3]','區間 XOR = px[4] XOR px[1] = 3 XOR 5 = 6；共同前綴 a[0] 出現兩次而消去。',{query:'[1,3]',formula:'px[4] XOR px[1] = 3 XOR 5',result:6,operation:'range xor'},{values:[5,2,7,3,2],low:1,high:3,accepted:['1','2','3']}),
  ],

  'prefix-sum-2d': (lesson) => [
    eventFrame(lesson,'for(int r=0','使用 3×3 Matrix','a=[[1,2,3],[4,5,6],[7,8,9]]；畫面顯示多一列與一欄 0 的 pref，未計算格暫不顯示值。',{matrix:['1 2 3','4 5 6','7 8 9'],prefBorder:'row0/col0 = 0',operation:'initialize 2d prefix'},{executionView:prefixMatrix(prefixBorder)}),
    eventFrame(lesson,'pref[r+1][c+1]','計算 pref[1][1]','1 + 上0 + 左0 - 左上0 = 1。',{cell:'pref[1][1]',formula:'1+0+0-0',value:1,operation:'build cell'},{executionView:prefixMatrix(prefixBorder.map((row,r)=>row.map((value,c)=>r===1&&c===1?'1':value)),['1,1'])}),
    eventFrame(lesson,'pref[r+1][c+1]','計算 pref[1][2]','2 + 上0 + 左1 - 左上0 = 3。',{cell:'pref[1][2]',formula:'2+0+1-0',value:3,operation:'build cell'},{executionView:prefixMatrix(prefixBorder.map((row,r)=>row.map((value,c)=>r===1&&c===1?'1':r===1&&c===2?'3':value)),['1,2'])}),
    eventFrame(lesson,'pref[r+1][c+1]','計算 pref[2][2]','5 + pref[1][2](3) + pref[2][1](5) - pref[1][1](1) = 12。',{cell:'pref[2][2]',formula:'5+3+5-1',value:12,operation:'inclusion exclusion build'},{executionView:prefixMatrix([['0','0','0','0'],['0','1','3','6'],['0','5','12','—'],['0','—','—','—']],['2,2'])}),
    eventFrame(lesson,'pref[r+1][c+1]','Prefix Table 完成','pref=[[0,0,0,0],[0,1,3,6],[0,5,12,21],[0,12,27,45]]。',{pref:['0 0 0 0','0 1 3 6','0 5 12 21','0 12 27 45'],operation:'finish table'},{executionView:prefixMatrix(prefixComplete)}),
    eventFrame(lesson,'return pref[r2+1][c2+1]','Query rows 1..2, cols 1..2（0-based）','右下 2×2 是 [[5,6],[8,9]]。45 - 上6 - 左12 + 左上1 = 28。',{query:'r1=1,c1=1,r2=2,c2=2',formula:'45-6-12+1',result:28,operation:'rectangle query'},{executionView:prefixMatrix(prefixComplete,['3,3','1,3','3,1','1,1'])}),
  ],

  'counting-sort': (lesson) => [
    eventFrame(lesson,'vector<int> count(K+1','值域 0..5，建立 Count','輸入 a=[4,2,2,5,3,2,1]，count 一開始全 0。',{input:['4','2','2','5','3','2','1'],count:['0','0','0','0','0','0'],operation:'initialize buckets'},{values:[4,2,2,5,3,2,1]}),
    eventFrame(lesson,'++count[x]','讀 4、2、2','依值直接累加桶：count[4]=1、count[2]=2。',{processed:['4','2','2'],count:['0','0','2','0','1','0'],operation:'count values'},{values:[4,2,2,5,3,2,1],active:['0','1','2']}),
    eventFrame(lesson,'++count[x]','完成頻率統計','最終 count=[0,1,3,1,1,1]。',{count:['0','1','3','1','1','1'],operation:'finish histogram'},{values:[4,2,2,5,3,2,1],accepted:['0','1','2','3','4','5','6']}),
    eventFrame(lesson,'a[p++]=value','輸出 Value=1','count[1]=1，因此先寫一個 1 到 a[0]。',{value:1,copies:1,output:['1'],operation:'emit bucket'},{values:[1,2,2,5,3,2,1],active:['0']}),
    eventFrame(lesson,'a[p++]=value','輸出三個 2','count[2]=3，依序寫到 a[1..3]。',{value:2,copies:3,output:['1','2','2','2'],operation:'emit bucket'},{values:[1,2,2,2,3,2,1],active:['1','2','3']}),
    eventFrame(lesson,'a[p++]=value','依序輸出 3、4、5','掃值域由小到大，所以輸出天然有序。',{remaining:['3','4','5'],result:['1','2','2','2','3','4','5'],operation:'finish emission'},{values:[1,2,2,2,3,4,5],accepted:['0','1','2','3','4','5','6']}),
  ].map((frame,step)=>({...frame,executionView:countingSortView(step)})),

  'inversion-counting': (lesson) => [
    eventFrame(lesson,'int m=(l+r)/2','輸入 [2,4,1,3,5] Split','先遞迴排序左右半；逆序分成左內、右內、跨半三類。',{input:['2','4','1','3','5'],split:'[2,4] | [1,3,5]',operation:'divide'},{values:[2,4,1,3,5]}),
    eventFrame(lesson,'countInversions(a,l,m','左右半先各自排序','左 [2,4] 無逆序；右 [1,3,5] 無逆序，answer 目前 0。',{left:['2','4'],right:['1','3','5'],answer:0,operation:'recursive counts'},{values:[2,4,1,3,5]}),
    eventFrame(lesson,'else { answer+=m-i','比較 2 與 1：加 2','右值 1 < 左值 2；因左半已排序，1 也小於剩餘的 4，所以一次加入 m-i=2 個逆序：(2,1),(4,1)。',{leftFront:2,rightFront:1,add:2,answer:2,buffer:['1'],operation:'count cross inversions'},{values:[2,4,1,3,5],active:['0','2']}),
    eventFrame(lesson,'if (a[i]<=a[j])','比較 2 與 3：取 2','2≤3，不新增逆序，buffer=[1,2]。',{leftFront:2,rightFront:3,answer:2,buffer:['1','2'],operation:'merge left value'},{values:[2,4,1,3,5],active:['0','3']}),
    eventFrame(lesson,'else { answer+=m-i','比較 4 與 3：再加 1','3<4，所以新增 (4,3) 一個逆序，answer=3。',{leftFront:4,rightFront:3,add:1,answer:3,buffer:['1','2','3'],operation:'count cross inversion'},{values:[2,4,1,3,5],active:['1','3']}),
    eventFrame(lesson,'for (int k=l;k<r;++k)','Merge 完成並寫回','接上 4、5 後得到 [1,2,3,4,5]；總逆序數 3。',{sorted:['1','2','3','4','5'],answer:3,operation:'copy merged result'},{values:[1,2,3,4,5],accepted:['0','1','2','3','4']}),
    eventFrame(lesson,'return answer','回傳 3','原陣列逆序對就是 (2,1)、(4,1)、(4,3)。',{result:3,pairs:['(2,1)','(4,1)','(4,3)'],operation:'return inversion count'},{values:[1,2,3,4,5]}),
  ].map((frame,step)=>({...frame,executionView:inversionMergeView(frame,step)})),

  'interval-scheduling': (lesson) => [
    eventFrame(lesson,'sort(intervals.begin()','依 End 排序','區間 [(1,4),(3,5),(0,6),(5,7),(3,9),(5,9),(6,10),(8,11)] 依結束時間排序。',{ordered:['(1,4)','(3,5)','(0,6)','(5,7)','(3,9)','(5,9)','(6,10)','(8,11)'],operation:'sort by end'}),
    eventFrame(lesson,'int lastEnd','初始 lastEnd=-∞','尚未選任何區間，answer=0。',{lastEnd:'-∞',answer:0,operation:'initialize greedy'}),
    eventFrame(lesson,'if(l>=lastEnd)','接受 (1,4)','1≥-∞，選第一個最早結束區間；lastEnd=4。',{interval:'(1,4)',decision:'accept',lastEnd:4,answer:1,operation:'accept interval'}),
    eventFrame(lesson,'if(l>=lastEnd)','拒絕 (3,5)、(0,6)','兩者起點都小於 4，與已選 (1,4) 重疊。',{intervals:['(3,5)','(0,6)'],decision:'reject',lastEnd:4,answer:1,operation:'skip overlaps'}),
    eventFrame(lesson,'++answer; lastEnd=r','接受 (5,7)','5≥4，選入後 lastEnd=7、answer=2。',{interval:'(5,7)',lastEnd:7,answer:2,operation:'accept interval'}),
    eventFrame(lesson,'if(l>=lastEnd)','略過到 (8,11)','(3,9)、(5,9)、(6,10) 都與目前結束點 7 衝突；(8,11) 可接上。',{skipped:['(3,9)','(5,9)','(6,10)'],next:'(8,11)',operation:'scan compatible'}),
    eventFrame(lesson,'++answer; lastEnd=r','接受 (8,11)，答案 3','最終選 {(1,4),(5,7),(8,11)}，共 3 段。',{selected:['(1,4)','(5,7)','(8,11)'],answer:3,operation:'finish schedule'}),
  ].map((frame,step)=>({...frame,executionView:intervalSchedulingView(step)})),

  'interval-covering': (lesson) => [
    eventFrame(lesson,'sort(intervals.begin()','目標覆蓋 [0,10]','候選區間排序後為 (-1,3),(0,4),(2,7),(4,6),(6,10),(7,12)。',{target:'[0,10]',intervals:['(-1,3)','(0,4)','(2,7)','(4,6)','(6,10)','(7,12)'],operation:'sort candidates'}),
    eventFrame(lesson,'double covered=L','covered=0','目前只保證覆蓋到左端 0，answer=0。',{covered:0,answer:0,operation:'initialize coverage'}),
    eventFrame(lesson,'intervals[i].l<=covered','第一輪看所有 l≤0 的區間','(-1,3) 與 (0,4) 都可接；最遠右端 far=4。',{covered:0,candidates:['(-1,3)','(0,4)'],far:4,operation:'scan reachable intervals'}),
    eventFrame(lesson,'covered=far; ++answer','選到 4','把 covered 推進到 4，answer=1。',{covered:'0→4',answer:1,operation:'extend coverage'}),
    eventFrame(lesson,'intervals[i].l<=covered','第二輪選能到 7 的區間','此時新可接候選包含 (2,7),(4,6)，最遠是 7。',{covered:4,candidates:['(2,7)','(4,6)'],far:7,operation:'scan reachable intervals'}),
    eventFrame(lesson,'covered=far; ++answer','covered 變 7','answer=2。',{covered:'4→7',answer:2,operation:'extend coverage'}),
    eventFrame(lesson,'intervals[i].l<=covered','第三輪看到 (6,10)、(7,12)','兩者都可接，選 far=12 的 (7,12) 最有利。',{covered:7,candidates:['(6,10)','(7,12)'],far:12,operation:'choose farthest reach'}),
    eventFrame(lesson,'while(covered<R)','12≥10：完成','三段即可覆蓋整個 [0,10]。',{selectedReach:['0→4','4→7','7→12'],answer:3,result:'covered',operation:'finish coverage'}),
  ].map((frame,step)=>({...frame,executionView:intervalCoveringView(step)})),

  'interval-merging': (lesson) => [
    eventFrame(lesson,'sort(intervals.begin()','依 Left 排序','輸入 (1,3),(2,6),(8,10),(9,12),(15,18)。',{ordered:['(1,3)','(2,6)','(8,10)','(9,12)','(15,18)'],operation:'sort by left'}),
    eventFrame(lesson,'out.empty() || l>out.back().second','第一段 (1,3) 建立新 Union','out 為空，因此直接 push (1,3)。',{current:'(1,3)',out:['(1,3)'],operation:'start merged component'}),
    eventFrame(lesson,'out.back().second=max','(2,6) 與目前段重疊','2≤3，所以右端擴張 max(3,6)=6，得到 (1,6)。',{current:'(2,6)',before:'(1,3)',after:'(1,6)',operation:'extend merged interval'}),
    eventFrame(lesson,'out.empty() || l>out.back().second','(8,10) 開新段','8>6，中間有 gap，因此 push 新段。',{current:'(8,10)',out:['(1,6)','(8,10)'],operation:'new disjoint interval'}),
    eventFrame(lesson,'out.back().second=max','(9,12) 合併到第二段','9≤10，第二段延伸成 (8,12)。',{current:'(9,12)',after:'(8,12)',operation:'extend merged interval'}),
    eventFrame(lesson,'out.empty() || l>out.back().second','(15,18) 再開新段','15>12，因此互不重疊。',{current:'(15,18)',out:['(1,6)','(8,12)','(15,18)'],operation:'finish merged intervals'}),
  ].map((frame,step)=>({...frame,executionView:intervalMergingView(step)})),

  'job-scheduling': (lesson) => [
    eventFrame(lesson,'sort(jobs.begin()','依 Deadline 排序','使用 jobs=(d=3,t=3),(d=4,t=1),(d=4,t=2),(d=6,t=3)。',{jobs:['(3,3)','(4,1)','(4,2)','(6,3)'],operation:'sort by deadline'}),
    eventFrame(lesson,'used+=duration; durations.push','加入 (3,3)','used=3≤deadline 3，保留 duration 3。',{job:'(3,3)',used:3,heap:['3'],operation:'tentatively keep job'}),
    eventFrame(lesson,'used+=duration; durations.push','加入 (4,1)','used=4≤4，現在保留兩個工作，heap=[3,1]。',{job:'(4,1)',used:4,heap:['3','1'],operation:'tentatively keep job'}),
    eventFrame(lesson,'if(used>deadline)','加入 (4,2) 後超時','used=6>4，必須刪掉一個已選工作。',{job:'(4,2)',used:6,deadline:4,heap:['3','2','1'],operation:'detect infeasible prefix'}),
    eventFrame(lesson,'used-=durations.top(); durations.pop','刪除最長 Duration 3','移除 duration=3 後 used=3，仍保留兩件工時 1、2，對未來最有利。',{removed:3,used:'6→3',heap:['2','1'],kept:2,operation:'drop longest job'}),
    eventFrame(lesson,'used+=duration; durations.push','加入最後 (6,3)','used=6≤6，所以可保留；最終 heap 有三件工作。',{job:'(6,3)',used:6,heap:['3','2','1'],kept:3,operation:'finish feasible set'}),
  ].map((frame,step)=>({...frame,executionView:jobSchedulingView(step)})),

  'fractional-knapsack': (lesson) => [
    eventFrame(lesson,'sort(items.begin()','依 Value/Weight 排序','容量 50；物品 (w10,v60),(w20,v100),(w30,v120)，密度分別 6、5、4。',{capacity:50,items:['10/60 density6','20/100 density5','30/120 density4'],operation:'sort by density'}),
    eventFrame(lesson,'double answer=0','答案從 0 開始','remaining capacity=50。',{answer:0,capacity:50,operation:'initialize'}),
    eventFrame(lesson,'double take=min','第一件全拿 10','take=min(50,10)=10。',{item:'w10 v60',take:10,capacity:50,operation:'choose amount'}),
    eventFrame(lesson,'answer+=take*item.value','得到 60，容量剩 40','answer=60。',{gain:60,answer:60,capacity:'50→40',operation:'take first item'}),
    eventFrame(lesson,'answer+=take*item.value','第二件全拿 20','本輪 take=20，執行價值與容量更新後，answer=160、capacity=20。',{item:'w20 v100',take:20,gain:100,answer:160,capacity:20,operation:'take second item'}),
    eventFrame(lesson,'double take=min','第三件只能拿 20/30','容量只剩 20，因此取第三件的 2/3。',{item:'w30 v120',take:20,fraction:'2/3',operation:'take fraction'}),
    eventFrame(lesson,'answer+=take*item.value','部分價值 80，總答案 240','20×120/30=80，answer=240，capacity=0。',{gain:80,answer:240,capacity:0,operation:'finish knapsack'}),
  ].map((frame,step)=>({...frame,
    codeLines:[...frame.codeLines,...([3,4,6].includes(step)?[lineNumber(lesson,'capacity-=take;')]:[])],
    state:{...frame.state,...([3,4,6].includes(step)?{highlightCodeLines:'all'}:{})},
    executionView:fractionalKnapsackView(step),
  })),

  'largest-rectangle-histogram': (lesson) => [
    eventFrame(lesson,'stack<int> st','高度 [2,1,5,6,2,3]','Stack 保存高度非遞減的索引。',{heights:['2','1','5','6','2','3'],stack:[],answer:0,operation:'initialize monotone stack'},{values:[2,1,5,6,2,3]}),
    eventFrame(lesson,'st.push(i)','i=0 Push Height 2','stack=[0(2)]。',{i:0,stack:['0(2)'],answer:0,operation:'push bar'},{values:[2,1,5,6,2,3],active:['0']}),
    eventFrame(lesson,'height[st.top()]>h','i=1 Height 1 使 2 出 Stack','右側第一個更矮柱出現，height 2 的最大寬度只能到 i-1=0。',{i:1,h:1,pop:'0(2)',operation:'settle bar'},{values:[2,1,5,6,2,3],active:['0','1']}),
    eventFrame(lesson,'answer=max(answer,height[k]*(i-left))','Height 2 面積 = 2×1=2','pop 後 stack 空，left=0，面積 2。',{height:2,left:0,right:0,area:2,answer:2,operation:'compute rectangle'},{values:[2,1,5,6,2,3]}),
    eventFrame(lesson,'st.push(i)','Push 1、5、6','處理到 i=3 時 stack=[1(1),2(5),3(6)]。',{stack:['1(1)','2(5)','3(6)'],answer:2,operation:'grow increasing stack'},{values:[2,1,5,6,2,3],active:['1','2','3']}),
    eventFrame(lesson,'height[st.top()]>h','i=4 Height 2：先 Pop 6','6>2，寬度 1，面積 6。',{i:4,pop:'3(6)',left:3,area:6,answer:6,operation:'settle height 6'},{values:[2,1,5,6,2,3],active:['3','4']}),
    eventFrame(lesson,'answer=max(answer,height[k]*(i-left))','再 Pop 5，面積 10','5>2；pop 後 top 是 index1，因此 left=2，寬度 i-left=2，area=10，成為目前最大。',{pop:'2(5)',left:2,right:3,area:10,answer:10,operation:'settle height 5'},{values:[2,1,5,6,2,3],active:['2','3']}),
    eventFrame(lesson,'int h=i==n?0','Sentinel 0 結算剩餘柱','i=n 時 h=0，會把 stack 裡所有正高度柱依序 pop，確保沒有漏算延伸到最右端的矩形。',{sentinel:0,finalAnswer:10,operation:'flush stack'},{values:[2,1,5,6,2,3],accepted:['2','3']}),
  ].map((frame,step)=>({...frame,executionView:histogramView(step)})),

  'sliding-window-maximum': (lesson) => [
    eventFrame(lesson,'deque<int> dq','a=[1,3,-1,-3,5,3,6,7], k=3','Deque 保存索引遞增且值嚴格遞減的候選。',{input:['1','3','-1','-3','5','3','6','7'],k:3,deque:[],operation:'initialize deque'},{values:[1,3,-1,-3,5,3,6,7]}),
    eventFrame(lesson,'a[dq.back()]<=a[i]','i=1：3 支配 1','索引 0 被 pop_back；push 1 後 deque=[1(3)]。',{i:1,popped:['0(1)'],deque:['1(3)'],operation:'remove dominated back'},{values:[1,3,-1,-3,5,3,6,7],active:['0','1']}),
    eventFrame(lesson,'answer.push_back','i=2：第一個視窗最大值 3','push 2(-1) 後 deque=[1(3),2(-1)]，front 對應 3。',{window:'[0,2]',deque:['1(3)','2(-1)'],answer:3,operation:'emit window max'},{values:[1,3,-1,-3,5,3,6,7],low:0,high:2,accepted:['1']}),
    eventFrame(lesson,'answer.push_back','i=3：第二個視窗最大值仍為 3','push 3(-3) 後 deque=[1(3),2(-1),3(-3)]；視窗 [1,3] 的 front 仍是 1(3)，因此輸出第二個 3。',{window:'[1,3]',deque:['1(3)','2(-1)','3(-3)'],answer:3,operation:'emit second window max'},{values:[1,3,-1,-3,5,3,6,7],low:1,high:3,accepted:['1']}),
    eventFrame(lesson,'dq.front()<=i-k','i=4：索引 1 過期','視窗變 [2,4]，1≤4-3，所以先 pop_front。',{i:4,expired:'1(3)',deque:['2(-1)','3(-3)'],operation:'expire front'},{values:[1,3,-1,-3,5,3,6,7],low:2,high:4}),
    eventFrame(lesson,'a[dq.back()]<=a[i]','新值 5 清掉 -3、-1','5 更大且更晚離開視窗，因此兩個舊候選都被支配。',{i:4,popped:['3(-3)','2(-1)'],deque:[],operation:'remove dominated candidates'},{values:[1,3,-1,-3,5,3,6,7],active:['2','3','4']}),
    eventFrame(lesson,'answer.push_back','Push 4(5)，視窗最大值 5','deque=[4(5)]。',{window:'[2,4]',deque:['4(5)'],answer:5,operation:'emit max 5'},{values:[1,3,-1,-3,5,3,6,7],low:2,high:4,accepted:['4']}),
    eventFrame(lesson,'answer.push_back','後續 6、7 依序清掉較小候選','最後 deque=[7(7)]，所有視窗答案為 [3,3,5,5,6,7]。',{answers:['3','3','5','5','6','7'],deque:['7(7)'],operation:'finish all windows'},{values:[1,3,-1,-3,5,3,6,7],accepted:['7']}),
  ].map((frame,step)=>({...frame,executionView:windowMaximumView(step)})),

  'expression-evaluation': (lesson) => [
    eventFrame(lesson,'vector<long long> values','求值 3 + 4 * 2','tokens=[3,+,4,*,2]。values 與 ops 一開始都空。',{expression:'3 + 4 * 2',values:[],ops:[],operation:'initialize stacks'}),
    eventFrame(lesson,'values.push_back(stoll(t))','讀 3：Push Values','values=[3]。',{token:'3',values:['3'],ops:[],operation:'push operand'}),
    eventFrame(lesson,'      ops.push_back(t);','讀 +：Ops 為空，不 Reduce','直接把 + 放到 ops。',{token:'+',values:['3'],ops:['+'],operation:'push operator'}),
    eventFrame(lesson,'values.push_back(stoll(t))','讀 4','values=[3,4]。',{token:'4',values:['3','4'],ops:['+'],operation:'push operand'}),
    eventFrame(lesson,'precedence(ops.back())>=precedence(t)','讀 *：優先序高於 +','stack top + 不應先於 * 結算，所以 push *；ops=[+,*]。',{token:'*',values:['3','4'],ops:['+','*'],operation:'respect precedence'}),
    eventFrame(lesson,'values.push_back(stoll(t))','讀 2','values=[3,4,2]。',{token:'2',values:['3','4','2'],ops:['+','*'],operation:'push operand'}),
    eventFrame(lesson,'while(!ops.empty()) applyTop','輸入結束：先算 4*2','pop * 與 4、2，push 結果 8。values=[3,8]，ops=[+]。',{reduce:'4*2=8',values:['3','8'],ops:['+'],operation:'apply multiplication'}),
    eventFrame(lesson,'while(!ops.empty()) applyTop','再算 3+8','pop +，得到 values=[11]。',{reduce:'3+8=11',values:['11'],ops:[],result:11,operation:'apply addition'}),
  ].map((frame,step)=>({...frame,executionView:expressionEvaluationView(step)})),
}

export const applyS2ExecutionOverride = (lesson: AlgorithmLesson): AlgorithmLesson => {
  if(lesson.id==='counting-sort') lesson={...lesson,code:countingSortCode}
  if(lesson.id==='fractional-knapsack') lesson={...lesson,code:fractionalKnapsackCode}
  if(lesson.id==='largest-rectangle-histogram') lesson={...lesson,code:histogramCode}
  if(lesson.id==='sliding-window-maximum') lesson={...lesson,code:slidingWindowMaximumCode}
  if(lesson.id==='expression-evaluation') lesson={...lesson,code:expressionEvaluationCode}
  if(lesson.id==='interval-scheduling') lesson={...lesson,code:intervalSchedulingCode}
  if(lesson.id==='job-scheduling') lesson={...lesson,description:'依截止時間保留最多件可完成的工作。',code:jobSchedulingCode}
  if(lesson.id==='interval-covering') lesson={...lesson,code:intervalCoveringCode}
  if(lesson.id==='interval-merging') lesson={...lesson,code:intervalMergingCode}
  const build=overrides[lesson.id]
  if(build) return {
    ...lesson,
    frames:build(lesson),
    traceMode:'execution',
    animationVersion:2,
  }
  const stringsMath=applyS2StringsMathOverride(lesson)
  if(stringsMath!==lesson) return stringsMath
  const graphTree=applyS2GraphTreeOverride(lesson)
  if(graphTree!==lesson) return graphTree
  const dataDp=applyS2DataDpOverride(lesson)
  if(dataDp!==lesson) return dataDp
  const dpTreeOffline=applyS2DpTreeOfflineOverride(lesson)
  if(dpTreeOffline!==lesson) return dpTreeOffline
  const advancedString=applyS2AdvancedStringOverride(lesson)
  if(advancedString!==lesson) return advancedString
  const advancedMath=applyS2AdvancedMathOverride(lesson)
  if(advancedMath!==lesson) return advancedMath
  const geometry=applyS2GeometryOverride(lesson)
  if(geometry!==lesson) return geometry
  return applyS2MiscOverride(lesson)
}

export const s2ExecutionOverrideIds=Object.freeze(Object.keys(overrides))
