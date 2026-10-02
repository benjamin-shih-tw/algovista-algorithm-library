import type { AlgorithmLesson, Frame, ExecutionView } from './algorithms'
import { eventFrame } from './traceAuthoring'

type TraceBuilder=(lesson:AlgorithmLesson)=>Frame[]
const geo=(title:string,points:any[],segments:any[]=[],badges:string[]=[],polygon?:string[],circles?:any[],sweepX?:number):ExecutionView=>({
  kind:'geometry',title,points,segments,badges,polygon,circles,sweepX
})
const table=(title:string,columns:string[],rows:string[][],activeRow?:number,badges:string[]=[]):ExecutionView=>({
  kind:'table',title,columns,rows,activeRow,badges
})

const codeOverrides:Record<string,string[]>={
  'sweep-line':[
    'vector<Event> events;',
    'for(auto rect:rectangles){ events.push_back({rect.x1,+1,rect.y1,rect.y2}); events.push_back({rect.x2,-1,rect.y1,rect.y2}); }',
    'sort(events.begin(),events.end());',
    'long long area=0,prevX=events[0].x;',
    'for(auto e:events){',
    '  area += coveredY()*(e.x-prevX);',
    '  updateY(e.y1,e.y2,e.type);',
    '  prevX=e.x;',
    '}',
  ],
  'closest-pair':[
    'sort(points.begin(),points.end(),byX);',
    'set<pair<int,int>> active;',
    'double best=INF; int left=0;',
    'for(int i=0;i<n;++i){',
    '  while(points[i].x-points[left].x>=best) active.erase({points[left].y,left++});',
    '  for(auto it=active.lower_bound({points[i].y-best,-1}); it!=active.end() && it->first<=points[i].y+best; ++it)',
    '    best=min(best,distance(points[i],points[it->second]));',
    '  active.insert({points[i].y,i});',
    '}',
  ],
  'half-plane-intersection':[
    'sort(lines.begin(),lines.end(),byAngle);',
    'deque<Line> dq;',
    'for(Line L:lines){',
    '  while(dq.size()>=2 && outside(L,intersection(dq[dq.size()-2],dq.back()))) dq.pop_back();',
    '  while(dq.size()>=2 && outside(L,intersection(dq[0],dq[1]))) dq.pop_front();',
    '  dq.push_back(L);',
    '}',
    'while(dq.size()>=3 && outside(dq.front(),intersection(dq[dq.size()-2],dq.back()))) dq.pop_back();',
    'while(dq.size()>=3 && outside(dq.back(),intersection(dq[0],dq[1]))) dq.pop_front();',
    'return consecutiveIntersections(dq);',
  ],
  'circle-tangents':[
    'vector<pair<Point,Point>> tangents(Circle A,Circle B){',
    '  Point d=B.c-A.c; double d2=norm2(d);',
    '  for(int s:{-1,1}){',
    '    double r=A.r-s*B.r;',
    '    double h2=d2-r*r; if(h2<0) continue;',
    '    for(int side:{-1,1}){',
    '      Point v=(d*r + rotate90(d)*sqrt(max(0.0,h2))*side)/d2;',
    '      out.push_back({A.c+v*A.r,B.c+v*(s*B.r)});',
    '    }',
    '  }',
    '  return out;',
    '}',
  ],
  'smallest-enclosing-circle':[
    'Circle c={{0,0},-1};',
    'shuffle(points.begin(),points.end(),rng);',
    'for(int i=0;i<n;++i) if(!inside(c,points[i])){',
    '  c={points[i],0};',
    '  for(int j=0;j<i;++j) if(!inside(c,points[j])){',
    '    c=diameterCircle(points[i],points[j]);',
    '    for(int k=0;k<j;++k) if(!inside(c,points[k])) c=circumcircle(points[i],points[j],points[k]);',
    '  }',
    '}',
    'return c;',
  ],
  'voronoi-diagram':[
    'priority_queue<Event> pq=siteEvents(points);',
    'while(!pq.empty()){',
    '  Event e=popNextEvent(); sweepY=e.y;',
    '  if(e.type==SITE) insertBeachArc(e.site);',
    '  else { createVoronoiVertex(e.center); removeArc(e.arc); }',
    '  updateCircleEventsNearChange();',
    '}',
  ],
  'delaunay-triangulation':[
    'triangles={superTriangle};',
    'for(Point p:points){',
    '  vector<Triangle> bad;',
    '  for(auto t:triangles) if(inCircumcircle(t,p)) bad.push_back(t);',
    '  auto boundary=boundaryEdges(bad);',
    '  erase(triangles,bad);',
    '  for(auto e:boundary) triangles.push_back({e.a,e.b,p});',
    '}',
    'removeTrianglesUsingSuperTriangle();',
  ],
  'minkowski-sum':[
    'normalizeToLowestLeft(A); normalizeToLowestLeft(B);',
    'vector<Point> ea=edgeVectors(A), eb=edgeVectors(B);',
    'Point cur=A[0]+B[0]; result.push_back(cur);',
    'int i=0,j=0;',
    'while(i<ea.size() || j<eb.size()){',
    '  if(j==eb.size() || (i<ea.size() && cross(ea[i],eb[j])>0)) cur+=ea[i++];',
    '  else if(i==ea.size() || cross(ea[i],eb[j])<0) cur+=eb[j++];',
    '  else cur+=ea[i++]+eb[j++];',
    '  result.push_back(cur);',
    '}',
  ],
}

const overrides:Record<string,TraceBuilder>={
  'sweep-line':lesson=>[
    eventFrame(lesson,'vector<Event> events','兩矩形：R1=[1,4]×[1,3]、R2=[3,6]×[2,5]','每個矩形產生進入 x1 與離開 x2 事件。',{rectangles:['R1 x1=1 x2=4 y[1,3]','R2 x1=3 x2=6 y[2,5]'],operation:'create events'},{executionView:table('SWEEP EVENTS',['x','type','y interval'],[['1','+1','[1,3)'],['3','+1','[2,5)'],['4','-1','[1,3)'],['6','-1','[2,5)']],undefined,['sorted by x'])}),
    eventFrame(lesson,'area += coveredY()','從 x=1 掃到 x=3','Active Y 只有 [1,3)，coveredY=2；strip width=2，因此 area +=4。',{coveredY:2,width:2,area:4,operation:'accumulate first strip'},{executionView:geo('SWEEP STRIP x=1→3',[{id:'a',x:250,y:120,label:'y=5'},{id:'b',x:250,y:330,label:'y=1'}],[],['coveredY 2','Δx 2','+4'],undefined,undefined,430)}),
    eventFrame(lesson,'updateY','x=3 加入 R2 的 [2,5)','Active intervals [1,3) 與 [2,5) 合併後 coveredY=4（[1,5)）。',{active:['[1,3)','[2,5)'],coveredY:4,operation:'update active intervals'},{executionView:table('ACTIVE Y COVERAGE',['interval','count'],[['[1,2)','1'],['[2,3)','2'],['[3,5)','1']],1,['union length 4'])}),
    eventFrame(lesson,'area += coveredY()','x=3→4：coveredY=4，width=1','area 從 4 增到 8。',{coveredY:4,width:1,area:8,operation:'accumulate overlap strip'},{executionView:geo('OVERLAP STRIP',[{id:'p1',x:500,y:90,label:'y=5'},{id:'p2',x:500,y:350,label:'y=1'}],[],['+4','area 8'],undefined,undefined,560)}),
    eventFrame(lesson,'updateY','x=4 移除 R1','只剩 [2,5)，coveredY=3；接著 x=4→6 寬2，area再加6。',{coveredY:3,width:2,area:14,operation:'remove interval and finish'},{executionView:table('FINAL AREA',['strip','coveredY','width','area add'],[['1→3','2','2','4'],['3→4','4','1','4'],['4→6','3','2','6'],['TOTAL','','','14']],3,['union area 14'])}),
  ],

  'closest-pair':lesson=>[
    eventFrame(lesson,'sort(points.begin()','Points 依 x 排序','P={(1,1),(2,5),(3,2),(5,4),(8,1)}。',{points:['(1,1)','(2,5)','(3,2)','(5,4)','(8,1)'],operation:'sort by x'},{executionView:geo('CLOSEST PAIR · X ORDER',[
      {id:'A',x:150,y:330,label:'1,1'},{id:'B',x:260,y:100,label:'2,5'},{id:'C',x:370,y:270,label:'3,2'},{id:'D',x:590,y:160,label:'5,4'},{id:'E',x:850,y:330,label:'8,1'}
    ],[],['sorted x'])}),
    eventFrame(lesson,'best=min','掃到 C=(3,2)，目前 Best 由 A-C 得 sqrt(5)','A=(1,1) 與 C=(3,2) 距離²=5；best≈2.236。',{best:'sqrt(5)',pair:'A-C',operation:'update current best'},{executionView:geo('CURRENT BEST',[
      {id:'A',x:150,y:330,label:'A',active:true},{id:'B',x:260,y:100,label:'B'},{id:'C',x:370,y:270,label:'C',active:true},{id:'D',x:590,y:160,label:'D'}
    ],[{from:'A',to:'C',label:'√5',active:true}],['best √5'])}),
    eventFrame(lesson,'while(points[i].x-points[left].x>=best)','掃到 D=(5,4) 時移除太左的 A、B','只保留 x 距離 < best 的點；這是 active strip。',{current:'D',removed:['A','B'],operation:'evict left points'},{executionView:geo('ACTIVE STRIP NEAR x=5',[
      {id:'C',x:370,y:270,label:'C',active:true},{id:'D',x:590,y:160,label:'D',active:true}
    ],[{from:'C',to:'D',label:'candidate'}],['strip width 2·best'],undefined,undefined,590)}),
    eventFrame(lesson,'active.lower_bound','只查 y∈[D.y-best,D.y+best]','Active set 依 y 排序，候選數受幾何 packing 限制為常數級。',{yRange:'[1.764,6.236]',operation:'restrict y range'},{executionView:table('ACTIVE Y CANDIDATES',['point','y','candidate?'],[['C','2','yes']],0,['balanced BST by y'])}),
    eventFrame(lesson,'best=min','C-D 距離 sqrt(8) 不更好','最終最近仍是 A-C，距離 sqrt(5)。',{result:'sqrt(5)',pair:'(1,1)-(3,2)',operation:'finish sweep'},{executionView:table('CLOSEST PAIR RESULT',['pair','distance²','distance'],[['A-C','5','√5']],0,['answer'])}),
  ],

  'half-plane-intersection':lesson=>[
    eventFrame(lesson,'sort(lines.begin()','四個 Half-planes：x≥0, x≤4, y≥0, y≤3','依 directed boundary angle 排序。交集應是 4×3 rectangle。',{halfplanes:['x≥0','x≤4','y≥0','y≤3'],operation:'angle sort'},{executionView:table('HALF-PLANE ANGLE ORDER',['boundary','kept side'],[['y=0 →','y≥0'],['x=4 ↑','x≤4'],['y=3 ←','y≤3'],['x=0 ↓','x≥0']],undefined,['CCW boundaries'])}),
    eventFrame(lesson,'dq.push_back','依序 Push 前兩條 Line','Deque 保存目前仍可能形成 feasible polygon 的 boundary lines。',{deque:['y≥0','x≤4'],operation:'initialize deque'},{executionView:geo('FIRST TWO HALF-PLANES',[{id:'A',x:160,y:340},{id:'B',x:840,y:340},{id:'C',x:840,y:80}], [{from:'A',to:'B',label:'y=0',active:true},{from:'B',to:'C',label:'x=4',active:true}],['deque size 2'])}),
    eventFrame(lesson,'outside(L,intersection','加入 y≤3，檢查尾端交點 (4,0)','(4,0) 在新 half-plane y≤3 內，所以不 pop。',{intersection:'(4,0)',outside:'false',operation:'back outside test'},{executionView:geo('KEEP BACK INTERSECTION',[{id:'P',x:840,y:340,label:'(4,0)',active:true}],[],['inside y≤3'])}),
    eventFrame(lesson,'dq.push_back','加入 x≥0 後形成四邊界','相鄰交點依序為 (0,0),(4,0),(4,3),(0,3)。',{deque:['y≥0','x≤4','y≤3','x≥0'],operation:'complete deque'},{executionView:geo('FEASIBLE POLYGON',[
      {id:'A',x:220,y:330,label:'0,0'},{id:'B',x:780,y:330,label:'4,0'},{id:'C',x:780,y:100,label:'4,3'},{id:'D',x:220,y:100,label:'0,3'}
    ],[],['4 active half-planes'],['A','B','C','D'])}),
    eventFrame(lesson,'return consecutiveIntersections','回傳 Rectangle Vertices','所有 deque 首尾一致性測試通過，feasible region 面積12。',{vertices:['(0,0)','(4,0)','(4,3)','(0,3)'],area:12,operation:'finish HPI'},{executionView:table('HPI RESULT',['vertex','coordinate'],[['A','(0,0)'],['B','(4,0)'],['C','(4,3)'],['D','(0,3)']],undefined,['area 12'])}),
  ],

  'circle-tangents':lesson=>[
    eventFrame(lesson,'Point d=B.c-A.c','兩圓 A=(0,0),r=2；B=(6,0),r=1','中心距離 d=6，兩圓分離，因此有 4 條 common tangents。',{A:'(0,0),r2',B:'(6,0),r1',operation:'initialize circles'},{executionView:geo('TWO DISJOINT CIRCLES',[{id:'A',x:260,y:220,label:'A'},{id:'B',x:720,y:220,label:'B'}],[],['4 tangents expected'],undefined,[{x:260,y:220,r:110,label:'A'},{x:720,y:220,r:60,label:'B'}])}),
    eventFrame(lesson,'for(int s:{-1,1})','s=+1 處理 External Tangents','使用等效半徑差 rA-rB=1。',{s:1,r:1,operation:'external tangent family'},{executionView:geo('EXTERNAL TANGENTS',[{id:'A1',x:260,y:115,label:'TA+'},{id:'B1',x:720,y:165,label:'TB+'},{id:'A2',x:260,y:325,label:'TA-'},{id:'B2',x:720,y:275,label:'TB-'}],[{from:'A1',to:'B1',active:true},{from:'A2',to:'B2',active:true}],['external pair'],undefined,[{x:260,y:220,r:110},{x:720,y:220,r:60}])}),
    eventFrame(lesson,'for(int s:{-1,1})','s=-1 處理 Internal Tangents','等效半徑和 rA+rB=3；因 6>3，所以也存在兩條。',{s:-1,r:3,operation:'internal tangent family'},{executionView:geo('INTERNAL TANGENTS',[{id:'A1',x:300,y:120,label:'A+'},{id:'B1',x:690,y:275,label:'B-'},{id:'A2',x:300,y:320,label:'A-'},{id:'B2',x:690,y:165,label:'B+'}],[{from:'A1',to:'B1',active:true},{from:'A2',to:'B2',active:true}],['internal pair'],undefined,[{x:260,y:220,r:110},{x:720,y:220,r:60}])}),
    eventFrame(lesson,'h2=d2-r*r','每個 family 先檢查 h²≥0','若 h²<0 表示幾何上沒有該類切線；h²=0 時兩條退化為一條。',{operation:'existence condition'},{executionView:table('TANGENT EXISTENCE',['family','effective r','d','result'],[['external','1','6','2 tangents'],['internal','3','6','2 tangents']],undefined,['total 4'])}),
    eventFrame(lesson,'out.push_back','回傳 4 組 Tangent Points','每組兩點分別在 A、B 圓周，連線與半徑垂直。',{count:4,operation:'finish tangents'},{executionView:table('COMMON TANGENTS RESULT',['type','count'],[['external','2'],['internal','2'],['TOTAL','4']],2,['4 lines'])}),
  ],

  'smallest-enclosing-circle':lesson=>[
    eventFrame(lesson,'shuffle(points.begin()','Points A=(0,0),B=(4,0),C=(0,3),D=(1,1)','固定示例順序 A,B,D,C；隨機順序只影響期望複雜度，不影響正確性。',{order:['A','B','D','C'],operation:'randomized order'},{executionView:geo('MINIMUM ENCLOSING CIRCLE · POINTS',[
      {id:'A',x:250,y:320,label:'A 0,0'},{id:'B',x:750,y:320,label:'B 4,0'},{id:'C',x:250,y:90,label:'C 0,3'},{id:'D',x:390,y:240,label:'D 1,1'}
    ],[],['process A→B→D→C'])}),
    eventFrame(lesson,'c={points[i],0}','A Outside 空 Circle → Circle(A,0)','第一個 point 自己成為 boundary。',{boundary:['A'],operation:'one-point circle'},{executionView:geo('BOUNDARY = {A}',[{id:'A',x:250,y:320,label:'A',active:true}],[],['r=0'],undefined,[{x:250,y:320,r:1,active:true}])}),
    eventFrame(lesson,'diameterCircle','B Outside → 以 AB 為 Diameter','center=(2,0)，r=2；D=(1,1) 在此圓內。',{boundary:['A','B'],center:'(2,0)',r:2,operation:'two-point circle'},{executionView:geo('DIAMETER CIRCLE AB',[
      {id:'A',x:250,y:320,label:'A',active:true},{id:'B',x:750,y:320,label:'B',active:true},{id:'D',x:390,y:240,label:'D'}
    ],[{from:'A',to:'B',label:'diameter',active:true}],['r=2'],undefined,[{x:500,y:320,r:250,active:true}])}),
    eventFrame(lesson,'circumcircle','C=(0,3) 在 AB Circle 外','需要三個 boundary points A,B,C 的 circumcircle；這是 3-4-5 right triangle，center=(2,1.5)，r=2.5。',{boundary:['A','B','C'],center:'(2,1.5)',r:2.5,operation:'three-point circumcircle'},{executionView:geo('CIRCUMCIRCLE ABC',[
      {id:'A',x:250,y:320,label:'A',active:true},{id:'B',x:750,y:320,label:'B',active:true},{id:'C',x:250,y:90,label:'C',active:true},{id:'D',x:390,y:240,label:'D'}
    ],[],['boundary 3','r=2.5'],undefined,[{x:500,y:205,r:290,active:true}])}),
    eventFrame(lesson,'return c','所有 Points 都在 Circle 內','最小包覆圓由 A,B,C 三點唯一決定；D 嚴格在內部。',{center:'(2,1.5)',r:2.5,operation:'finish MEC'},{executionView:table('MEC RESULT',['center','radius','boundary'],[['(2,1.5)','2.5','A,B,C']],0,['D inside'])}),
  ],

  'voronoi-diagram':lesson=>[
    eventFrame(lesson,'siteEvents(points)','Sites A=(2,5), B=(5,4), C=(3,1)','Fortune Sweep 從高 y 往低 y。',{sites:['A(2,5)','B(5,4)','C(3,1)'],operation:'initialize site events'},{executionView:geo('VORONOI · SITE EVENTS',[
      {id:'A',x:300,y:80,label:'A',active:true},{id:'B',x:650,y:150,label:'B'},{id:'C',x:430,y:350,label:'C'}
    ],[],['sweep top→bottom'],undefined,undefined,40)}),
    eventFrame(lesson,'insertBeachArc','Sweep 遇到 A：Beach Line 建第一個 Arc','目前所有已處理平面最近 site 都是 A。',{beach:['A'],operation:'insert first arc'},{executionView:table('BEACH LINE',['arc order'],[['A']],0,['after site A'])}),
    eventFrame(lesson,'insertBeachArc','遇到 B：A Arc 被切成 A-B-A','A/B 的等距邊界開始形成一條 bisector ray。',{beach:['A','B','A'],operation:'split beach arc'},{executionView:table('BEACH LINE AFTER B',['left arc','new arc','right arc'],[['A','B','A']],0,['bisector A-B born'])}),
    eventFrame(lesson,'updateCircleEventsNearChange','加入 C 後形成 Circle Event 候選','相鄰 arcs A-B-C 若三 site circumcircle 的最低點將來被 sweep 遇到，middle arc 會消失。',{triple:['A','B','C'],operation:'schedule circle event'},{executionView:geo('CIRCLE EVENT CANDIDATE',[
      {id:'A',x:300,y:80,label:'A'},{id:'B',x:650,y:150,label:'B'},{id:'C',x:430,y:350,label:'C'},{id:'V',x:455,y:190,label:'circumcenter',active:true}
    ],[{from:'A',to:'V',dashed:true},{from:'B',to:'V',dashed:true},{from:'C',to:'V',dashed:true}],['circle event'])}),
    eventFrame(lesson,'createVoronoiVertex','Circle Event 發生：建立 Voronoi Vertex V','三個 site 等距；B 對應的 beach arc 消失，兩條 bisector rays 在 V 相交。',{vertex:'V',operation:'emit voronoi vertex'},{executionView:geo('VORONOI VERTEX',[
      {id:'A',x:300,y:80,label:'A'},{id:'B',x:650,y:150,label:'B'},{id:'C',x:430,y:350,label:'C'},{id:'V',x:455,y:190,label:'V',active:true},{id:'X1',x:180,y:250},{id:'X2',x:760,y:300},{id:'X3',x:500,y:20}
    ],[{from:'V',to:'X1',active:true},{from:'V',to:'X2',active:true},{from:'V',to:'X3',active:true}],['equal distance to A,B,C'])}),
    eventFrame(lesson,'updateCircleEventsNearChange','更新鄰近 Circle Events，直到 Queue Empty','最終 edges 將平面分成每個 site 的最近點 cell。',{operation:'finish fortune sweep'},{executionView:table('FORTUNE EVENTS',['event type','effect'],[['site','insert/split beach arc'],['circle','remove arc + Voronoi vertex']],undefined,['O(n log n)'])}),
  ],

  'delaunay-triangulation':lesson=>[
    eventFrame(lesson,'triangles={superTriangle}','Points A=(2,2),B=(6,2),C=(4,6),D=(4,3)','先建包住所有點的 Super Triangle。',{points:['A','B','C','D'],operation:'initialize Bowyer-Watson'},{executionView:geo('DELAUNAY · INPUT POINTS',[
      {id:'A',x:280,y:320,label:'A'},{id:'B',x:720,y:320,label:'B'},{id:'C',x:500,y:80,label:'C'},{id:'D',x:500,y:250,label:'D',active:true}
    ],[],['incremental insertion'])}),
    eventFrame(lesson,'inCircumcircle','插入 D：找所有 Circumcircle 包含 D 的 Bad Triangles','假設目前有 triangle ABC；D 位於 ABC circumcircle 內，因此 ABC 是 bad。',{bad:['ABC'],operation:'find conflict cavity'},{executionView:geo('CONFLICT CIRCUMCIRCLE',[
      {id:'A',x:280,y:320,label:'A'},{id:'B',x:720,y:320,label:'B'},{id:'C',x:500,y:80,label:'C'},{id:'D',x:500,y:250,label:'D',active:true}
    ],[{from:'A',to:'B'},{from:'B',to:'C'},{from:'C',to:'A'}],['ABC bad'],undefined,[{x:500,y:250,r:260,active:true}])}),
    eventFrame(lesson,'boundaryEdges(bad)','Bad Triangle Union 的 Boundary 是 AB,BC,CA','內部被重複出現的 edge 會取消，只留 cavity boundary。',{boundary:['AB','BC','CA'],operation:'extract cavity boundary'},{executionView:geo('CAVITY BOUNDARY',[
      {id:'A',x:280,y:320,label:'A'},{id:'B',x:720,y:320,label:'B'},{id:'C',x:500,y:80,label:'C'},{id:'D',x:500,y:250,label:'D',active:true}
    ],[{from:'A',to:'B',active:true},{from:'B',to:'C',active:true},{from:'C',to:'A',active:true}],['3 boundary edges'])}),
    eventFrame(lesson,'triangles.push_back','用 D 連每個 Boundary Edge 重三角化','新增 ABD、BCD、CAD。',{newTriangles:['ABD','BCD','CAD'],operation:'retriangulate cavity'},{executionView:geo('RETRIANGULATE',[
      {id:'A',x:280,y:320,label:'A'},{id:'B',x:720,y:320,label:'B'},{id:'C',x:500,y:80,label:'C'},{id:'D',x:500,y:250,label:'D',active:true}
    ],[{from:'A',to:'B'},{from:'B',to:'C'},{from:'C',to:'A'},{from:'A',to:'D',active:true},{from:'B',to:'D',active:true},{from:'C',to:'D',active:true}],['local repair'])}),
    eventFrame(lesson,'removeTrianglesUsingSuperTriangle','所有點插入後移除 Super Triangle 相關 Faces','剩餘每條 Delaunay edge 的 opposite point 都不落入對面 triangle circumcircle。',{operation:'finish delaunay'},{executionView:table('DELAUNAY INVARIANT',['property','result'],[['empty circumcircle','true for every final triangle'],['dual','Voronoi diagram']],undefined,['triangulation complete'])}),
  ],

  'minkowski-sum':lesson=>[
    eventFrame(lesson,'normalizeToLowestLeft','A=Rectangle [(0,0),(2,0),(2,1),(0,1)]；B=Triangle [(0,0),(1,0),(0,2)]','兩個凸多邊形都從最低、再最左頂點開始，方向 CCW。',{operation:'normalize starts'},{executionView:table('MINKOWSKI INPUT',['polygon','vertices'],[['A','(0,0)(2,0)(2,1)(0,1)'],['B','(0,0)(1,0)(0,2)']],undefined,['CCW'])}),
    eventFrame(lesson,'edgeVectors','轉為 Cyclic Edge Vectors','A edges=(2,0),(0,1),(-2,0),(0,-1)；B=(1,0),(-1,2),(0,-2)。',{operation:'build edge directions'},{executionView:table('EDGE VECTORS',['poly','edge vectors'],[['A','(2,0) · (0,1) · (-2,0) · (0,-1)'],['B','(1,0) · (-1,2) · (0,-2)']],undefined,['polar-sorted cyclically'])}),
    eventFrame(lesson,'cross(ea[i],eb[j])','第一組 Edge 同方向：cross((2,0),(1,0))=0','同極角時兩向量一起加：cur=(0,0)+(2,0)+(1,0)=(3,0)。',{i:0,j:0,cur:'(3,0)',operation:'merge equal-angle edges'},{executionView:table('MERGE STEP 1',['ea','eb','cross','advance','new vertex'],[['(2,0)','(1,0)','0','i++,j++','(3,0)']],0,['co-linear merge'])}),
    eventFrame(lesson,'cross(ea[i],eb[j])>0','接著比較 A 的 (0,1) 與 B 的 (-1,2)','cross=1>0，A edge 極角更小，所以只前進 i，cur=(3,1)。',{cross:1,cur:'(3,1)',operation:'advance A edge'},{executionView:table('MERGE STEP 2',['ea','eb','cross','take','vertex'],[['(0,1)','(-1,2)','+1','A','(3,1)']],0,['angle merge'])}),
    eventFrame(lesson,'result.push_back','依序合併所有 Edge Directions','輸出凸 polygon 頂點可整理為 (0,0),(3,0),(3,1),(2,3),(0,3)。',{vertices:['(0,0)','(3,0)','(3,1)','(2,3)','(0,3)'],operation:'finish edge merge'},{executionView:geo('MINKOWSKI SUM A+B',[
      {id:'P0',x:220,y:330,label:'0,0'},{id:'P1',x:760,y:330,label:'3,0'},{id:'P2',x:760,y:250,label:'3,1'},{id:'P3',x:580,y:90,label:'2,3'},{id:'P4',x:220,y:90,label:'0,3'}
    ],[],['5 output vertices'],['P0','P1','P2','P3','P4'])}),
  ],
}

export const applyS3GeometryOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  const build=overrides[lesson.id]
  if(!build) return lesson
  const coded={...lesson,code:codeOverrides[lesson.id]}
  return {...coded,frames:build(coded),traceMode:'execution',animationVersion:2,fidelity:'concrete'}
}
export const s3GeometryOverrideIds=Object.freeze(Object.keys(overrides))
