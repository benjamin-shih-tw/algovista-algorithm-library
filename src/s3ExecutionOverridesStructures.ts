import type { AlgorithmLesson, Frame, ExecutionView } from './algorithms'
import { eventFrame } from './traceAuthoring'
type TraceBuilder=(lesson:AlgorithmLesson)=>Frame[]

const tree=(title:string,nodes:any[],edges:any[],badges:string[]=[],sequence?:string[]):ExecutionView=>({kind:'structure',title,nodes,edges,badges,sequence})
const table=(title:string,columns:string[],rows:string[][],activeRow?:number,badges:string[]=[]):ExecutionView=>({kind:'table',title,columns,rows,activeRow,badges})

const codeOverrides:Record<string,string[]>={
  'segment-tree-beats':[
    'void chmin(int p,int l,int r,int ql,int qr,long long x){',
    '  if(qr<=l || r<=ql || max1[p]<=x) return;',
    '  if(ql<=l && r<=qr && max2[p]<x){ applyMax(p,x); return; }',
    '  push(p); int m=(l+r)/2;',
    '  chmin(p*2,l,m,ql,qr,x); chmin(p*2+1,m,r,ql,qr,x);',
    '  pull(p);',
    '}',
  ],
  'segment-tree-2d':[
    'void addX(int px,int lx,int rx,int x,int y,int delta){',
    '  addY(px,1,0,W,y,delta);',
    '  if(rx-lx==1) return;',
    '  int mx=(lx+rx)/2;',
    '  if(x<mx) addX(px*2,lx,mx,x,y,delta); else addX(px*2+1,mx,rx,x,y,delta);',
    '}',
    'long long rectQuery(int x1,int x2,int y1,int y2){ return queryX(1,0,H,x1,x2,y1,y2); }',
  ],
  'wavelet-tree':[
    'Node* build(vector<int> a,int lo,int hi){',
    '  if(lo==hi || a.empty()) return new Node(lo,hi);',
    '  int mid=(lo+hi)/2;',
    '  pref[0]=0; for(int x:a) pref.push_back(pref.back()+(x<=mid));',
    '  stable_partition(a.begin(),a.end(),[&](int x){return x<=mid;});',
    '  left=build(leftPart,lo,mid); right=build(rightPart,mid+1,hi);',
    '  return node;',
    '}',
    'int kth(int l,int r,int k){ int inLeft=pref[r]-pref[l]; if(k<=inLeft) return left->kth(pref[l],pref[r],k); return right->kth(l-pref[l],r-pref[r],k-inLeft); }',
  ],
  'wavelet-matrix':[
    'for(int bit=MAXBIT;bit>=0;--bit){',
    '  rank0[bit][0]=0;',
    '  for(int x:a) rank0[bit].push_back(rank0[bit].back()+(((x>>bit)&1)==0));',
    '  zeroCount[bit]=rank0[bit].back();',
    '  stable_partition(a.begin(),a.end(),[&](int x){return ((x>>bit)&1)==0;});',
    '}',
    'int kth(int l,int r,int k){ /* descend bits using zeroCount + rank0 */ }',
  ],
  'implicit-treap':[
    'pair<Node*,Node*> split(Node* t,int k){',
    '  if(!t) return {nullptr,nullptr}; push(t);',
    '  if(size(t->left)>=k){ auto [a,b]=split(t->left,k); t->left=b; pull(t); return {a,t}; }',
    '  auto [a,b]=split(t->right,k-size(t->left)-1); t->right=a; pull(t); return {t,b};',
    '}',
    'Node* merge(Node* a,Node* b){ if(!a||!b) return a?a:b; if(a->priority<b->priority){push(a);a->right=merge(a->right,b);pull(a);return a;} push(b);b->left=merge(a,b->left);pull(b);return b; }',
  ],
  'splay-tree':[
    'void rotate(Node* x){ Node* p=x->parent; Node* g=p->parent; /* reconnect */ }',
    'void splay(Node* x){',
    '  while(x->parent){ Node* p=x->parent; Node* g=p->parent;',
    '    if(!g) rotate(x);',
    '    else if((g->left==p)==(p->left==x)) rotate(p),rotate(x);',
    '    else rotate(x),rotate(x);',
    '  }',
    '}',
  ],
  'link-cut-tree':[
    'void access(Node* x){ Node* last=nullptr; for(Node* y=x;y;y=y->parent){ splay(y); y->right=last; pull(y); last=y; } splay(x); }',
    'void makeRoot(Node* x){ access(x); x->rev^=1; push(x); }',
    'void link(Node* u,Node* v){ makeRoot(u); u->parent=v; }',
    'void cut(Node* u,Node* v){ makeRoot(u); access(v); v->left=nullptr; u->parent=nullptr; pull(v); }',
  ],
  'euler-tour-tree':[
    'Sequence componentTour(Node* root);',
    'auto [a,b]=split(tourU,exitU);',
    'auto [c,d]=split(tourV,entryV);',
    'tour=concat(a,edgeUV,c,edgeVU,b,d);',
    'cut removes both directed edge occurrences then splits the sequence;',
  ],
  'kd-tree':[
    'Node* build(points,depth){',
    '  int axis=depth%2; nth_element(points.begin(),mid,points.end(),byAxis(axis));',
    '  node->point=*mid; node->left=build(left,depth+1); node->right=build(right,depth+1);',
    '  node->box=mergeBoxes(node->point,node->left,node->right);',
    '  return node;',
    '}',
    'void nearest(Node* node,Point q){ best=min(best,dist2(node->point,q)); visitNearChild(); if(boxDist2(farChild->box,q)<best) visitFarChild(); }',
  ],
  'persistent-dsu':[
    'Version unite(Version v,int a,int b){',
    '  a=find(v,a); b=find(v,b); if(a==b) return v;',
    '  if(size(v,a)<size(v,b)) swap(a,b);',
    '  Version nv=pathCopy(v); nv.parent[b]=a; nv.size[a]+=nv.size[b];',
    '  return nv;',
    '}',
    'int find(Version v,int x){ while(parent(v,x)!=x) x=parent(v,x); return x; }',
  ],
  'ordered-statistic-tree':[
    'Node* insert(Node* t,int key){ /* balanced BST insert + pull subtree size */ }',
    'int kth(Node* t,int k){',
    '  int left=size(t->left);',
    '  if(k==left+1) return t->key;',
    '  if(k<=left) return kth(t->left,k);',
    '  return kth(t->right,k-left-1);',
    '}',
    'int orderOfKey(Node* t,int x){ /* accumulate left sizes while descending */ }',
  ],
}

const overrides:Record<string,TraceBuilder>={
  'segment-tree-beats':lesson=>[
    eventFrame(lesson,'max1[p]<=x','Node [0,4): values [9,7,5,3]','Root stats: max1=9, max2=7, countMax=1, sum=24。做 range chmin(0,4,8)。',{max1:9,max2:7,countMax:1,sum:24,x:8,operation:'inspect node stats'},{executionView:table('SEGMENT TREE BEATS · NODE STATS',['range','max1','max2','cntMax','sum'],[['[0,4)','9','7','1','24'],['[0,2)','9','7','1','16'],['[2,4)','5','3','1','8']],0,['chmin x=8'])}),
    eventFrame(lesson,'max2[p]<x','7 < 8 < 9：整段可套 ApplyMax','只有最大值 9 需要降成 8；其他值都 ≤7，不受影響。',{condition:'max2 < x < max1',operation:'beats shortcut'},{executionView:table('SAFE WHOLE-NODE UPDATE',['range','condition','effect'],[['[0,4)','7 < 8 < 9','only values==9 change']],0,['no descent'])}),
    eventFrame(lesson,'applyMax','更新 Root Stats','sum 減 (9-8)*countMax=1，所以 sum 24→23，max1 9→8。',{sum:'24→23',max1:'9→8',operation:'apply node chmin'},{executionView:table('AFTER APPLY',['range','max1','max2','cntMax','sum'],[['[0,4)','8','7','1','23'],['values','8','7','5','3']],0,['O(1) at node'])}),
    eventFrame(lesson,'push(p)','若改 chmin x=6，就不能整段','max2=7 不小於 6，因 9 與 7 都要變；必須 push/descend。',{x:6,condition:'max2>=x',operation:'force descent'},{executionView:table('WHEN BEATS CANNOT STOP',['range','max1','max2','x'],[['[0,4)','8','7','6'],['decision','','','DESCEND']],0,['push'])}),
    eventFrame(lesson,'pull(p)','子樹更新後 Pull 回父節點','重新計算 max1/max2/countMax/sum，維持 beats invariant。',{operation:'rebuild parent stats'},{executionView:table('PULL INVARIANT',['field','meaning'],[['max1','largest value'],['max2','largest value < max1'],['cntMax','number of max1'],['sum','range sum']],undefined,['invariant restored'])}),
  ],

  'segment-tree-2d':lesson=>[
    eventFrame(lesson,'addX','4×4 Grid 在 (x=2,y=1) 加 5','X tree 先沿包含 x=2 的 root→right→left 路徑。',{point:'(2,1)',delta:5,operation:'x-dimension descent'},{executionView:tree('2D SEGMENT TREE · X TREE',[{id:'x03',label:'x[0,4)',x:500,y:70,active:true},{id:'x01',label:'x[0,2)',x:280,y:190},{id:'x23',label:'x[2,4)',x:720,y:190,active:true},{id:'x2',label:'x[2,3)',x:610,y:330,active:true},{id:'x3',label:'x[3,4)',x:830,y:330}], [{from:'x03',to:'x01'},{from:'x03',to:'x23',active:true},{from:'x23',to:'x2',active:true},{from:'x23',to:'x3'}],['x=2'])}),
    eventFrame(lesson,'addY','每個 X Node 都更新自己的 Y Tree','在 x[0,4)、x[2,4)、x[2,3) 內，y=1 都沿 y-root→left→right 更新。',{y:1,operation:'nested y updates'},{executionView:table('NESTED Y TREES',['x node','y path','delta'],[['x[0,4)','[0,4)→[0,2)→[1,2)','+5'],['x[2,4)','same','+5'],['x[2,3)','same','+5']],0,['3 nested trees'])}),
    eventFrame(lesson,'rectQuery','Query Rectangle x∈[1,3), y∈[0,2)','X tree 把 [1,3) 分成 x[1,2) 與 x[2,3)。',{xQuery:'[1,3)',yQuery:'[0,2)',operation:'decompose x range'},{executionView:tree('RECTANGLE X-DECOMPOSITION',[{id:'root',label:'x[0,4)',x:500,y:60},{id:'l',label:'x[0,2)',x:300,y:180},{id:'r',label:'x[2,4)',x:700,y:180},{id:'x1',label:'x[1,2)',x:390,y:330,active:true},{id:'x2',label:'x[2,3)',x:610,y:330,active:true}], [{from:'root',to:'l'},{from:'root',to:'r'},{from:'l',to:'x1',active:true},{from:'r',to:'x2',active:true}],['two x nodes'])}),
    eventFrame(lesson,'queryX','在兩個 X Node 的 Y Tree 查 [0,2)','每個 Y query 回傳局部 aggregate，再相加就是矩形答案。',{partial:['x[1,2):0','x[2,3):5'],result:5,operation:'query nested y ranges'},{executionView:table('RECTANGLE AGGREGATION',['x block','y range','sum'],[['[1,2)','[0,2)','0'],['[2,3)','[0,2)','5'],['TOTAL','','5']],2,['answer 5'])}),
  ],

  'wavelet-tree':lesson=>[
    eventFrame(lesson,'int mid=(lo+hi)/2','Array [5,1,4,2,3]，Value Range [1,5]','Root mid=3；≤3 往左，>3 往右。',{array:['5','1','4','2','3'],mid:3,operation:'partition by value'},{executionView:table('WAVELET TREE · STABLE PARTITION',['idx','value','≤3?','prefix-left'],[['0','5','0','0'],['1','1','1','1'],['2','4','0','1'],['3','2','1','2'],['4','3','1','3']],undefined,['mid 3'])}),
    eventFrame(lesson,'pref.push_back','建立 Prefix Rank Map','pref=[0,0,1,1,2,3]，能把任意 index interval 映射到左孩子座標。',{pref:['0','0','1','1','2','3'],operation:'build rank prefix'},{executionView:table('PREFIX LEFT COUNTS',['prefix index','0','1','2','3','4','5'],[['pref','0','0','1','1','2','3']],0,['rank map'])}),
    eventFrame(lesson,'stable_partition','Stable Split 成 Left=[1,2,3], Right=[5,4]','相對順序保持，這是 index range 能正確映射的原因。',{left:['1','2','3'],right:['5','4'],operation:'stable partition'},{executionView:tree('VALUE PARTITION TREE',[{id:'root',label:'[1..5]',x:500,y:70,meta:'5,1,4,2,3',active:true},{id:'L',label:'[1..3]',x:300,y:220,meta:'1,2,3'},{id:'R',label:'[4..5]',x:700,y:220,meta:'5,4'}],[{from:'root',to:'L',label:'≤3',active:true},{from:'root',to:'R',label:'>3',active:true}],['stable'])}),
    eventFrame(lesson,'kth(int l','Query a[1..5) 的第 2 小','此 index interval 是 [1,5)，左孩子數量 pref[5]-pref[1]=3。k=2≤3，所以進左。',{l:1,r:5,k:2,inLeft:3,operation:'kth descend left'},{executionView:tree('KTH DESCENT',[{id:'root',label:'[1..5]',x:500,y:70,active:true},{id:'L',label:'[1..3]',x:300,y:220,active:true},{id:'R',label:'[4..5]',x:700,y:220,muted:true}],[{from:'root',to:'L',active:true},{from:'root',to:'R'}],['k=2','left count 3'])}),
    eventFrame(lesson,'return left->kth','繼續下降得到 Value 2','映射後 interval 內值是 [1,2,3]，第 2 小為 2。',{result:2,operation:'return kth value'},{executionView:table('KTH RESULT',['query values','sorted','k','answer'],[['1,4,2,3','1,2,3,4','2','2']],0,['answer 2'])}),
  ],

  'wavelet-matrix':lesson=>[
    eventFrame(lesson,'for(int bit=MAXBIT','Array [5,1,4,2,3] = [101,001,100,010,011]','先處理 bit2；0-bit 值穩定排前、1-bit 排後。',{bit:2,operation:'bitwise stable partition'},{executionView:table('WAVELET MATRIX · BIT 2',['value','bits','bit2'],[['5','101','1'],['1','001','0'],['4','100','1'],['2','010','0'],['3','011','0']],undefined,['MSB first'])}),
    eventFrame(lesson,'rank0[bit].push_back','Bit2 Rank0 Prefix','zero prefix=[0,0,1,1,2,3]，zeroCount=3。',{zeroCount:3,operation:'rank zero prefix'},{executionView:table('BIT 2 RANK0',['prefix','0','1','2','3','4','5'],[['rank0','0','0','1','1','2','3']],0,['zeros 3'])}),
    eventFrame(lesson,'stable_partition','Bit2 後排列 [1,2,3 | 5,4]','下一層在這個重排後序列繼續處理 bit1。',{sequence:['1','2','3','5','4'],operation:'stable bit partition'},{executionView:table('AFTER BIT 2',['zero group','one group'],[['1,2,3','5,4']],0,['zeroCount 3'])}),
    eventFrame(lesson,'kth(int l','Query 全陣列第 4 小','bit2 的 zero count=3，小於 k=4，所以答案 bit2=1，k→1，interval 映射到 one group。',{bit:2,k:'4→1',answerBit:1,operation:'choose one branch'},{executionView:table('KTH BIT DECISION',['bit','zeros in range','k','decision'],[['2','3','4','take 1; k=1']],0,['answer prefix 1xx'])}),
    eventFrame(lesson,'kth(int l','繼續 bit1、bit0 得 100₂','第 4 小值是 4。',{bits:'100',result:4,operation:'assemble answer bits'},{executionView:table('WAVELET MATRIX RESULT',['sorted','k','binary','answer'],[['1,2,3,4,5','4','100','4']],0,['answer 4'])}),
  ],

  'implicit-treap':lesson=>[
    eventFrame(lesson,'split(Node* t,int k)','Sequence [A,B,C,D,E]，Split k=3','Implicit key 是 subtree size；目標左邊保留前三個元素。',{sequence:['A','B','C','D','E'],k:3,operation:'start size split'},{executionView:tree('IMPLICIT TREAP · SEQUENCE',[{id:'C',label:'C',x:500,y:80,meta:'size5',active:true},{id:'B',label:'B',x:300,y:210,meta:'size2'},{id:'A',label:'A',x:180,y:330},{id:'E',label:'E',x:700,y:210,meta:'size2'},{id:'D',label:'D',x:610,y:330}],[{from:'C',to:'B'},{from:'B',to:'A'},{from:'C',to:'E'},{from:'E',to:'D'}],['A','B','C','D','E'])}),
    eventFrame(lesson,'size(t->left)>=k','Root C 左 size=2 < k=3','C 本身也放左邊；到右子樹 E 時新的 k=3-2-1=0。',{root:'C',leftSize:2,newK:0,operation:'split right subtree'},{executionView:tree('SPLIT DECISION',[{id:'C',label:'C',x:500,y:90,meta:'left size2',active:true},{id:'B',label:'B',x:300,y:230},{id:'E',label:'E',x:700,y:230,active:true}],[{from:'C',to:'B'},{from:'C',to:'E',active:true}],['new k=0'])}),
    eventFrame(lesson,'t->left=b','在 E 以 k=0 Split','所有 E 子樹都落右半；回傳 (null,E-subtree)。',{operation:'base positional cut'},{executionView:tree('CUT BEFORE D/E',[{id:'L',label:'A B C',x:300,y:210,active:true},{id:'R',label:'D E',x:700,y:210,active:true}],[],['left 3','right 2'],['A','B','C','D','E'])}),
    eventFrame(lesson,'pull(t)','回溯更新 Subtree Size','C 的 right 變 null，size(C-subtree)=3；E subtree size=2。',{sizes:['left=3','right=2'],operation:'pull sizes'},{executionView:table('PULL SUBTREE SIZES',['tree','sequence','size'],[['left','A B C','3'],['right','D E','2']],undefined,['invariant restored'])}),
    eventFrame(lesson,'merge(Node* a','Merge 時由 Priority 選 Root','之後可把兩段再 merge；priority heap 決定連接方向，但 inorder 仍維持 A B C D E。',{operation:'merge sequence halves'},{executionView:table('MERGE INVARIANTS',['inorder','heap priority','size'],[['A B C D E','preserved','5']],0,['sequence restored'])}),
  ],

  'splay-tree':lesson=>[
    eventFrame(lesson,'void splay(Node* x)','BST：30 root，20 left，10 left-left','要把 x=10 splay 到 root；x 與 parent 20、grandparent 30 同方向，是 Zig-Zig。',{x:10,p:20,g:30,operation:'detect zig-zig'},{executionView:tree('SPLAY · BEFORE ZIG-ZIG',[{id:'30',label:'30',x:500,y:80},{id:'20',label:'20',x:330,y:210},{id:'10',label:'10',x:210,y:340,active:true}],[{from:'30',to:'20'},{from:'20',to:'10',active:true}],['zig-zig'])}),
    eventFrame(lesson,'rotate(p)','先 Rotate Parent 20 Around 30','20 上升成暫時 root，30 變右 child。',{operation:'first zig-zig rotation'},{executionView:tree('AFTER ROTATE(20)',[{id:'20',label:'20',x:500,y:90,active:true},{id:'10',label:'10',x:310,y:250},{id:'30',label:'30',x:690,y:250}],[{from:'20',to:'10'},{from:'20',to:'30'}],['rotation 1'])}),
    eventFrame(lesson,'rotate(x)','再 Rotate 10 Around 20','10 成為 root，20 成右 child，30 仍在 20 右側。',{operation:'second zig-zig rotation'},{executionView:tree('AFTER ROTATE(10)',[{id:'10',label:'10',x:500,y:90,active:true},{id:'20',label:'20',x:670,y:230},{id:'30',label:'30',x:790,y:350}],[{from:'10',to:'20',active:true},{from:'20',to:'30'}],['x at root'])}),
    eventFrame(lesson,'else rotate(x),rotate(x)','若方向不同則是 Zig-Zag','例如 30-left 10-right 20，會連續 rotate(x) 兩次，而不是 rotate parent。',{case:'zig-zag',operation:'contrast rotation case'},{executionView:tree('ZIG-ZAG CASE',[{id:'30',label:'30',x:500,y:80},{id:'10',label:'10',x:300,y:210},{id:'20',label:'20',x:410,y:340,active:true}],[{from:'30',to:'10'},{from:'10',to:'20',active:true}],['rotate x twice'])}),
  ],

  'link-cut-tree':lesson=>[
    eventFrame(lesson,'access(Node* x)','Represented Tree A-B-C-D，Access(D)','目標把 root→D 路徑變成 preferred path，auxiliary splay tree 只表示目前 preferred edges。',{path:['A','B','C','D'],operation:'start access'},{executionView:tree('LINK-CUT · REPRESENTED TREE',[{id:'A',label:'A',x:150,y:210},{id:'B',label:'B',x:360,y:210},{id:'C',label:'C',x:570,y:210},{id:'D',label:'D',x:780,y:210,active:true}],[{from:'A',to:'B'},{from:'B',to:'C'},{from:'C',to:'D',active:true}],['access D'])}),
    eventFrame(lesson,'splay(y)','從 D 向 Parent Chain 逐個 Splay','每次把 y splay 成自己的 aux root，準備替換 y.right。',{current:'D→C→B→A',operation:'splay ancestors'},{executionView:table('ACCESS LOOP',['y','splay','new preferred suffix'],[['D','root of aux','D'],['C','root of aux','C-D'],['B','root of aux','B-C-D'],['A','root of aux','A-B-C-D']],2,['preferred path grows'])}),
    eventFrame(lesson,'y->right=last','把 Right Child 改成上一段 Preferred Path','最後 aux tree 的 inorder 就是 A-B-C-D。',{sequence:['A','B','C','D'],operation:'rewire preferred edges'},{executionView:tree('AUXILIARY TREE AFTER ACCESS',[{id:'B',label:'B',x:500,y:100},{id:'A',label:'A',x:320,y:250},{id:'D',label:'D',x:700,y:250},{id:'C',label:'C',x:610,y:350}],[{from:'B',to:'A'},{from:'B',to:'D',active:true},{from:'D',to:'C'}],['preferred path'],['A','B','C','D'])}),
    eventFrame(lesson,'makeRoot(Node* x)','makeRoot(A)：Access + Reverse Lazy Flag','toggle rev 後 preferred path 方向翻轉，A 成 represented root。',{rev:'A path ^= 1',operation:'lazy reverse path'},{executionView:table('LAZY REVERSAL',['before inorder','rev flag','after push'],[['A B C D','1','D C B A']],0,['makeRoot A'])}),
    eventFrame(lesson,'cut(Node* u','cut(B,C)：makeRoot(B), access(C)','此時 B-C 會成為 C 的直接 left connection；斷開後 represented tree 分成兩個 component。',{cut:'B-C',operation:'cut represented edge'},{executionView:tree('AFTER CUT B–C',[{id:'A',label:'A',x:260,y:200},{id:'B',label:'B',x:420,y:200,active:true},{id:'C',label:'C',x:650,y:200,active:true},{id:'D',label:'D',x:810,y:200}],[{from:'A',to:'B'},{from:'C',to:'D'}],['two components'])}),
  ],

  'euler-tour-tree':lesson=>[
    eventFrame(lesson,'componentTour','Tree A-B, A-C 的 Euler Sequence','可表示成 A,AB,B,BA,A,AC,C,CA；每個 undirected edge 有兩個 directed occurrence。',{tour:['A','AB','B','BA','A','AC','C','CA'],operation:'materialize component sequence'},{executionView:table('EULER TOUR TREE · SEQUENCE',['pos','token'],[['0','A'],['1','A→B'],['2','B'],['3','B→A'],['4','A'],['5','A→C'],['6','C'],['7','C→A']],undefined,['balanced sequence tree'])}),
    eventFrame(lesson,'split(tourU','Link C-D：先在 C 的 occurrence Split','把 component tour 旋轉到 C 可插入的位置。',{splitAt:'C',operation:'split component sequence'},{executionView:table('SPLIT TOUR',['left','right'],[['… C','C→A …']],0,['cut sequence at occurrence'])}),
    eventFrame(lesson,'concat(a,edgeUV','插入 C→D、D Tour、D→C','concat 後兩個 component 變成一棵 tree 的 Euler sequence。',{insert:['C→D','D','D→C'],operation:'link by concatenation'},{executionView:table('LINK CONCATENATION',['before','insert','after'],[['tour(C component)','C→D · tour(D) · D→C','one combined tour']],0,['link C-D'])}),
    eventFrame(lesson,'cut removes','Cut A-B：找到 A→B 與 B→A 兩個 occurrence','刪掉兩個 directed tokens 後，sequence 自然分裂成 B-subtree component 與其餘 component。',{edge:'A-B',operation:'remove edge occurrences'},{executionView:table('CUT OCCURRENCES',['token','action'],[['A→B','erase'],['B→A','erase']],undefined,['split into 2 tours'])}),
  ],

  'kd-tree':lesson=>[
    eventFrame(lesson,'axis=depth%2','Points (2,3),(5,4),(9,6),(4,7),(8,1),(7,2)','depth0 依 x，median 是 (7,2)。',{axis:'x',median:'(7,2)',operation:'choose split median'},{executionView:{kind:'geometry',title:'KD-TREE BUILD · X SPLIT',points:[{id:'P1',x:200,y:270,label:'2,3'},{id:'P2',x:420,y:220,label:'5,4'},{id:'P3',x:800,y:150,label:'9,6'},{id:'P4',x:340,y:90,label:'4,7'},{id:'P5',x:720,y:350,label:'8,1'},{id:'P6',x:620,y:310,label:'7,2',active:true}],segments:[{from:'P6',to:'P6',label:'x=7'}],sweepX:620,badges:['median x=7']}}),
    eventFrame(lesson,'nth_element','左側 x<7、右側 x>7','左有 (2,3),(5,4),(4,7)；右有 (8,1),(9,6)。',{left:3,right:2,operation:'partition points'},{executionView:table('KD PARTITION',['side','points'],[['left','(2,3) (5,4) (4,7)'],['pivot','(7,2)'],['right','(8,1) (9,6)']],1,['stable membership not required'])}),
    eventFrame(lesson,'node->box=mergeBoxes','每個 Node 保存 Bounding Box','root box 涵蓋 x=[2,9], y=[1,7]；子樹有更小 box。',{box:'[2,9]×[1,7]',operation:'compute subtree box'},{executionView:tree('KD-TREE NODES + BOXES',[{id:'R',label:'(7,2)',x:500,y:70,meta:'x-split',active:true},{id:'L',label:'(5,4)',x:300,y:220,meta:'y-split'},{id:'RR',label:'(8,1)',x:710,y:220,meta:'y-split'}],[{from:'R',to:'L'},{from:'R',to:'RR'}],['boxes cached'])}),
    eventFrame(lesson,'best=min','Nearest Query q=(9,2)','root (7,2) dist²=4，best=4；先走 near/right child。',{q:'(9,2)',best:4,operation:'visit near child'},{executionView:{kind:'geometry',title:'NEAREST NEIGHBOR QUERY',points:[{id:'Q',x:820,y:310,label:'q=9,2',active:true},{id:'R',x:620,y:310,label:'7,2',active:true},{id:'P',x:720,y:350,label:'8,1'}],segments:[{from:'Q',to:'R',label:'d²=4',active:true}],badges:['best 4']}}),
    eventFrame(lesson,'boxDist2','Far-child Box Lower Bound > Best → Prune','若左子樹 bbox 到 q 的最小 dist²=16 > best2，整個左子樹都不可能更好。',{lowerBound:16,best:2,decision:'prune',operation:'bbox pruning'},{executionView:table('KD PRUNING',['subtree','box lower bound','best','action'],[['left','16','2','PRUNE']],0,['safe pruning'])}),
  ],

  'persistent-dsu':lesson=>[
    eventFrame(lesson,'Version unite','Version0：{1}{2}{3}{4}','每個版本都能被歷史 query；union 不能覆寫舊 parent/size。',{version:0,sets:['1','2','3','4'],operation:'initial version'},{executionView:table('PERSISTENT DSU · VERSIONS',['version','operation','components'],[['v0','initial','{1}{2}{3}{4}']],0,['immutable history'])}),
    eventFrame(lesson,'pathCopy','v1 = unite(v0,1,2)','只複製 parent/size 結構中被修改的路徑；v0 保留原資料。',{version:1,copy:['parent[2]','size[1]'],operation:'path copy union'},{executionView:table('VERSION 1',['version','parent changes','sets'],[['v0','none','{1}{2}{3}{4}'],['v1','p2=1,size1=2','{1,2}{3}{4}']],1,['v0 unchanged'])}),
    eventFrame(lesson,'nv.parent[b]=a','v2 = unite(v1,3,4)','v2 新增 p4=3；v1 仍只有 1-2 合併。',{version:2,operation:'second persistent union'},{executionView:table('VERSION 2',['version','sets'],[['v0','{1}{2}{3}{4}'],['v1','{1,2}{3}{4}'],['v2','{1,2}{3,4}']],2,['branchable history'])}),
    eventFrame(lesson,'find(Version v','Historical Find：find(v0,2)=2','同一元素在 v0 是 root，在 v1/v2 則 root=1。',{queries:['find(v0,2)=2','find(v1,2)=1','find(v2,2)=1'],operation:'historical query'},{executionView:table('HISTORICAL FIND',['query','answer'],[['v0: find(2)','2'],['v1: find(2)','1'],['v2: find(2)','1']],0,['version-aware'])}),
  ],

  'ordered-statistic-tree':lesson=>[
    eventFrame(lesson,'insert(Node* t','插入 Keys 20,10,30,25','平衡 BST 每個 node 額外保存 subtree size。',{keys:['20','10','30','25'],operation:'build size-augmented BST'},{executionView:tree('ORDER-STATISTIC TREE',[{id:'20',label:'20',x:500,y:80,meta:'size4'},{id:'10',label:'10',x:300,y:230,meta:'size1'},{id:'30',label:'30',x:700,y:230,meta:'size2'},{id:'25',label:'25',x:610,y:350,meta:'size1'}],[{from:'20',to:'10'},{from:'20',to:'30'},{from:'30',to:'25'}],['subtree sizes'])}),
    eventFrame(lesson,'int left=size','Query kth(k=3) at Root 20','left size=1；k=3 > left+1=2，所以往右，新的 k=3-2=1。',{node:20,leftSize:1,k:'3→1',operation:'skip left and root'},{executionView:tree('KTH DESCENT',[{id:'20',label:'20',x:500,y:80,meta:'left size1',active:true},{id:'10',label:'10',x:300,y:230,muted:true},{id:'30',label:'30',x:700,y:230,active:true},{id:'25',label:'25',x:610,y:350}],[{from:'20',to:'10'},{from:'20',to:'30',active:true},{from:'30',to:'25'}],['k=1 in right'])}),
    eventFrame(lesson,'if(k<=left)','At 30：left size=1，k=1 → Go Left','進到 25。',{node:30,leftSize:1,k:1,operation:'descend left'},{executionView:tree('KTH DESCENT 2',[{id:'30',label:'30',x:500,y:80,meta:'left size1',active:true},{id:'25',label:'25',x:330,y:230,active:true}],[{from:'30',to:'25',active:true}],['k=1'])}),
    eventFrame(lesson,'k==left+1','At 25：left size0，k=1','k==left+1，所以第 3 小是 25。',{result:25,operation:'return kth'},{executionView:table('ORDER STATISTIC RESULT',['sorted keys','k','answer'],[['10,20,25,30','3','25']],0,['kth = 25'])}),
    eventFrame(lesson,'orderOfKey','order_of_key(26)','沿 BST 累積被跳過的 left size+root：20 及其左子樹共2，再在30走左到25並再加1，答案3。',{x:26,result:3,operation:'rank accumulation'},{executionView:table('RANK QUERY',['x','keys < x','rank'],[['26','10,20,25','3']],0,['order_of_key'])}),
  ],
}

export const applyS3StructureOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  const build=overrides[lesson.id]
  if(!build) return lesson
  const coded={...lesson,code:codeOverrides[lesson.id]}
  return {...coded,frames:build(coded),traceMode:'execution',animationVersion:2,fidelity:'concrete'}
}
export const s3StructureOverrideIds=Object.freeze(Object.keys(overrides))
