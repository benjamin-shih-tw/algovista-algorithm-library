import type { AlgorithmLesson, Frame } from './algorithms'
import { eventFrame } from './traceAuthoring'

type TraceBuilder=(lesson:AlgorithmLesson)=>Frame[]

const codeOverrides:Record<string,string[]>={
  'rotating-calipers':[
    'int j=1;',
    'for(int i=0;i<h;++i){',
    '  while(area2(hull[i],hull[(i+1)%h],hull[(j+1)%h]) > area2(hull[i],hull[(i+1)%h],hull[j]))',
    '    j=(j+1)%h;',
    '  answer=max(answer,dist2(hull[i],hull[j]));',
    '  answer=max(answer,dist2(hull[(i+1)%h],hull[j]));',
    '}',
  ],
  'point-in-polygon':[
    'if(onBoundary(poly,P)) return BOUNDARY;',
    'int crossings=0;',
    'for(auto [a,b]:edges(poly)){',
    '  if(a.y>b.y) swap(a,b);',
    '  if(a.y<P.y && P.y<=b.y && cross(b-a,P-a)>0) ++crossings;',
    '}',
    'return crossings%2?INSIDE:OUTSIDE;',
  ],
  'segment-intersection':[
    'long long d1=orient(a,b,c), d2=orient(a,b,d);',
    'long long d3=orient(c,d,a), d4=orient(c,d,b);',
    'if(sgn(d1)*sgn(d2)<0 && sgn(d3)*sgn(d4)<0) return true;',
    'if(d1==0 && onSegment(a,b,c)) return true;',
    'if(d2==0 && onSegment(a,b,d)) return true;',
    'if(d3==0 && onSegment(c,d,a)) return true;',
    'if(d4==0 && onSegment(c,d,b)) return true;',
    'return false;',
  ],
  'polygon-area':[
    'long long twiceArea=0;',
    'for(int i=0;i<n;++i)',
    '  twiceArea += cross(p[i],p[(i+1)%n]);',
    'return abs(twiceArea);',
  ],
  'dot-cross-product':[
    'long long dot(Point a,Point b){ return a.x*b.x+a.y*b.y; }',
    'long long cross(Point a,Point b){ return a.x*b.y-a.y*b.x; }',
    'long long orient(Point a,Point b,Point c){ return cross(b-a,c-a); }',
  ],
  'line-intersection':[
    'Point intersection(Point p,Point r,Point q,Point s){',
    '  double den=cross(r,s);',
    '  if(abs(den)<EPS) return NO_UNIQUE_INTERSECTION;',
    '  double t=cross(q-p,s)/den;',
    '  return p+r*t;',
    '}',
  ],
  'point-line-distance':[
    'double distancePointLine(Point p,Point a,Point b){',
    '  Point ab=b-a, ap=p-a;',
    '  double area2=abs(cross(ab,ap));',
    '  double base=hypot(ab.x,ab.y);',
    '  return area2/base;',
    '}',
  ],
  'polar-sort':[
    'int half(Point p){ return (p.y>0 || (p.y==0 && p.x>=0))?0:1; }',
    'sort(v.begin(),v.end(),[&](Point a,Point b){',
    '  if(half(a)!=half(b)) return half(a)<half(b);',
    '  long long cr=cross(a,b);',
    '  if(cr!=0) return cr>0;',
    '  return norm2(a)<norm2(b);',
    '});',
  ],
  'circle-intersection':[
    'double d=distance(c1,c2);',
    'if(d>r1+r2 || d<abs(r1-r2)) return NO_INTERSECTION;',
    'double a=(r1*r1-r2*r2+d*d)/(2*d);',
    'double h=sqrt(max(0.0,r1*r1-a*a));',
    'Point mid=c1+(c2-c1)*(a/d);',
    'Point perp=rotate90((c2-c1)/d);',
    'return pair{mid+perp*h,mid-perp*h};',
  ],
}

const overrides:Record<string,TraceBuilder>={
  'rotating-calipers':lesson=>[
    eventFrame(lesson,'int j=1','凸包是 4×2 Rectangle','H=[(0,0),(4,0),(4,2),(0,2)]，目標找最遠點對。',{hull:['A(0,0)','B(4,0)','C(4,2)','D(0,2)'],i:0,j:1,operation:'initialize antipodal pointer'}),
    eventFrame(lesson,'while(area2','固定 Edge A→B，嘗試把 j 從 B 往前推','area(A,B,C)=8，大於 area(A,B,B)=0，所以 j→C。',{edge:'A→B',j:'B→C',areas:['0','8'],operation:'advance antipodal point'}),
    eventFrame(lesson,'while(area2','再試 D','area(A,B,D)=8，沒有嚴格增加，所以停止在 C。',{edge:'A→B',j:'C',next:'D',areas:['8','8'],operation:'stop monotone advance'}),
    eventFrame(lesson,'answer=max(answer,dist2','檢查 A-C','dist²((0,0),(4,2))=16+4=20，暫時答案 20。',{pair:'A-C',dist2:20,answer:20,operation:'update diameter'}),
    eventFrame(lesson,'for(int i=0','i 移到下一條 Edge','最佳 j 不會逆向移動；後續會找到 B-D 也有 dist²=20。',{i:'0→1',j:'monotone',operation:'rotate calipers'}),
    eventFrame(lesson,'answer=max(answer,dist2','直徑平方 = 20','最遠點對為任一對角線 A-C 或 B-D。',{answer:20,pairs:['A-C','B-D'],operation:'finish diameter'}),
  ],

  'point-in-polygon':lesson=>[
    eventFrame(lesson,'onBoundary','Square [(0,0),(4,0),(4,4),(0,4)]，P=(2,2)','先確認 P 不在線段邊界上。',{polygon:['(0,0)','(4,0)','(4,4)','(0,4)'],P:'(2,2)',boundary:'false',operation:'boundary check'}),
    eventFrame(lesson,'int crossings=0','向右發射水平 Ray','crossings 從 0 開始。',{crossings:0,ray:'y=2, x>2',operation:'initialize ray casting'}),
    eventFrame(lesson,'if(a.y>b.y)','底邊與頂邊是 Horizontal','半開 y 條件不會計入水平邊。',{edges:['bottom','top'],operation:'ignore horizontal edges'}),
    eventFrame(lesson,'a.y<P.y && P.y<=b.y','右邊 Edge (4,0)→(4,4) 穿過 Ray','0<2≤4 且 P 位於這條向上邊的左側，所以 crossings=1。',{edge:'(4,0)→(4,4)',crossings:'0→1',operation:'count crossing'}),
    eventFrame(lesson,'cross(b-a,P-a)>0','左邊 Edge 不算右向 Ray 交點','經 endpoint ordering 與 cross 方向測試，它不會增加右側 crossing。',{edge:'(0,0)→(0,4)',crossings:1,operation:'reject left intersection'}),
    eventFrame(lesson,'return crossings%2','1 是 Odd，所以 P Inside','奇數次穿越代表從外部切換到內部一次。',{crossings:1,result:'INSIDE',operation:'return classification'}),
  ],

  'segment-intersection':lesson=>[
    eventFrame(lesson,'d1=orient','線段 AB=(0,0)→(4,4)，CD=(0,4)→(4,0)','兩條對角線預期在中心相交。',{A:'(0,0)',B:'(4,4)',C:'(0,4)',D:'(4,0)',operation:'initialize segments'}),
    eventFrame(lesson,'d1=orient','C、D 對 AB 的 Orientation','orient(A,B,C)=+16；orient(A,B,D)=-16，位於 AB 兩側。',{d1:16,d2:-16,operation:'test first line'}),
    eventFrame(lesson,'d3=orient','A、B 對 CD 的 Orientation','orient(C,D,A)=-16；orient(C,D,B)=+16，也在兩側。',{d3:-16,d4:16,operation:'test second line'}),
    eventFrame(lesson,'sgn(d1)*sgn(d2)<0','兩組符號都相反','(+)(-)<0 且 (-)(+)<0，因此是嚴格內部相交。',{test1:'true',test2:'true',operation:'strict intersection test'}),
    eventFrame(lesson,'return true','回傳 True','此例不需要進入共線 onSegment 特判。',{result:'intersect',point:'(2,2)',operation:'return intersection'}),
  ],

  'polygon-area':lesson=>[
    eventFrame(lesson,'long long twiceArea=0','4×3 Rectangle','頂點依逆時針：(0,0),(4,0),(4,3),(0,3)。',{points:['(0,0)','(4,0)','(4,3)','(0,3)'],twiceArea:0,operation:'initialize shoelace'}),
    eventFrame(lesson,'twiceArea += cross','Edge P0→P1','cross((0,0),(4,0))=0，累積仍 0。',{edge:'P0→P1',cross:0,sum:0,operation:'add oriented triangle'}),
    eventFrame(lesson,'twiceArea += cross','Edge P1→P2','cross((4,0),(4,3))=12，sum=12。',{edge:'P1→P2',cross:12,sum:12,operation:'add cross'}),
    eventFrame(lesson,'twiceArea += cross','Edge P2→P3','cross((4,3),(0,3))=12，sum=24。',{edge:'P2→P3',cross:12,sum:24,operation:'add cross'}),
    eventFrame(lesson,'twiceArea += cross','最後 P3→P0','cross((0,3),(0,0))=0，總兩倍面積 24。',{edge:'P3→P0',cross:0,sum:24,operation:'close polygon'}),
    eventFrame(lesson,'return abs','Area = |24|/2 = 12','程式回傳 twice area=24；若需要實際面積再除 2。',{twiceArea:24,area:12,orientation:'CCW',operation:'finish shoelace'}),
  ],

  'dot-cross-product':lesson=>[
    eventFrame(lesson,'dot(Point a','向量 a=(3,1), b=(1,4)','先計算兩向量的 dot product，藉由符號判斷它們夾角是銳角、直角還是鈍角。',{a:'(3,1)',b:'(1,4)',operation:'initialize vectors'}),
    eventFrame(lesson,'a.x*b.x+a.y*b.y','dot=3×1+1×4=7','正值表示夾角為銳角。',{dot:7,interpretation:'acute',operation:'compute dot'}),
    eventFrame(lesson,'cross(Point a','cross=3×4-1×1=11','正值表示 b 位於 a 的逆時針方向，平行四邊形有向面積為 11。',{cross:11,orientation:'counterclockwise',operation:'compute cross'}),
    eventFrame(lesson,'orient(Point a','令 A=(0,0), B=(3,1), C=(1,4)','orient(A,B,C)=cross(B-A,C-A)=11>0。',{A:'(0,0)',B:'(3,1)',C:'(1,4)',orient:11,operation:'orientation predicate'}),
    eventFrame(lesson,'return cross','因此 A→B→C 是 Left Turn','這個符號測試是凸包、相交等幾何演算法的核心 primitive。',{result:'left turn',operation:'finish vector primitives'}),
  ],

  'line-intersection':lesson=>[
    eventFrame(lesson,'intersection(Point p','Line1: p=(0,0), r=(4,4)；Line2: q=(0,4), s=(4,-4)','參數式為 p+t r = q+u s。',{p:'(0,0)',r:'(4,4)',q:'(0,4)',s:'(4,-4)',operation:'initialize lines'}),
    eventFrame(lesson,'double den=cross','den=cross(r,s)=-32','非 0，兩方向不平行，所以有唯一交點。',{den:-32,operation:'check parallelism'}),
    eventFrame(lesson,'double t=cross','t=cross(q-p,s)/den','q-p=(0,4)，cross((0,4),(4,-4))=-16，因此 t=(-16)/(-32)=0.5。',{numerator:-16,denominator:-32,t:0.5,operation:'solve parameter'}),
    eventFrame(lesson,'return p+r*t','交點 p+0.5r=(2,2)','代入另一條線也得到 q+0.5s=(2,2)。',{intersection:'(2,2)',check:'both t=u=0.5',operation:'return intersection'}),
  ],

  'point-line-distance':lesson=>[
    eventFrame(lesson,'distancePointLine','P=(2,3)，Line A=(0,0)→B=(4,0)','距離等於平行四邊形面積除底長。',{P:'(2,3)',A:'(0,0)',B:'(4,0)',operation:'initialize'}),
    eventFrame(lesson,'Point ab=b-a','ab=(4,0)，ap=(2,3)','把線段方向寫成 AB，並把點 P 相對於 A 的位移寫成 AP，後面才能用外積求平行四邊形面積。',{ab:'(4,0)',ap:'(2,3)',operation:'build vectors'}),
    eventFrame(lesson,'area2=abs(cross','|cross(ab,ap)|=|4×3-0×2|=12','這是以 |AB| 為底的平行四邊形面積。',{area2:12,operation:'compute cross area'}),
    eventFrame(lesson,'base=hypot','|AB|=4','向量 AB=(4,0) 的歐幾里得長度是 4，這就是面積公式中要除掉的底邊長度。',{base:4,operation:'compute base length'}),
    eventFrame(lesson,'return area2/base','Distance = 12/4 = 3','與水平線 y=0 到 P 的垂直距離一致。',{distance:3,operation:'return distance'}),
  ],

  'polar-sort':lesson=>[
    eventFrame(lesson,'half(Point p)','向量集合 E=(1,0),N=(0,1),W=(-1,0),S=(0,-1)','half=0 放上半平面含正 x 軸；half=1 放下半平面。',{vectors:['E(1,0)','N(0,1)','W(-1,0)','S(0,-1)'],operation:'initialize vectors'}),
    eventFrame(lesson,'half(a)!=half(b)','先依 Half 分組','E,N,W 都在 half0？依定義 W 的 y=0 且 x<0，所以 W 在 half1；S 也在 half1。',{half0:['E','N'],half1:['W','S'],operation:'split half planes'}),
    eventFrame(lesson,'long long cr=cross','half0 內比較 E 與 N','cross(E,N)=1>0，因此 E 排在 N 前面。',{pair:'E,N',cross:1,order:'E<N',operation:'compare polar angle'}),
    eventFrame(lesson,'if(cr!=0) return cr>0','half1 內比較 W 與 S','cross(W,S)=1>0，所以 W 在 S 前。',{pair:'W,S',cross:1,order:'W<S',operation:'compare lower half'}),
    eventFrame(lesson,'sort(v.begin()','最終 CCW Order','從正 x 軸開始得到 E,N,W,S。',{result:['E','N','W','S'],angles:['0°','90°','180°','270°'],operation:'finish polar sort'}),
  ],

  'circle-intersection':lesson=>[
    eventFrame(lesson,'double d=distance','兩圓 C1=(0,0), C2=(6,0), r1=r2=5','中心距離 d=6。',{c1:'(0,0)',c2:'(6,0)',r1:5,r2:5,d:6,operation:'initialize circles'}),
    eventFrame(lesson,'if(d>r1+r2','檢查交點存在','|5-5|=0 ≤6≤10，所以有兩個交點。',{range:'0≤6≤10',result:'two intersections',operation:'existence check'}),
    eventFrame(lesson,'double a=','沿中心線距離 a=3','a=(25-25+36)/(2×6)=3。',{a:3,operation:'project chord midpoint'}),
    eventFrame(lesson,'double h=sqrt','垂直高度 h=4','h=sqrt(25-9)=4。',{h:4,operation:'compute half chord'}),
    eventFrame(lesson,'Point mid=','弦中點 Mid=(3,0)','從 C1 沿 C1→C2 單位方向走 3。',{mid:'(3,0)',operation:'compute midpoint'}),
    eventFrame(lesson,'return pair','加減垂直向量得到 (3,4)、(3,-4)','兩點到兩圓心距離都剛好是 5。',{intersections:['(3,4)','(3,-4)'],check:'3-4-5 triangles',operation:'return intersections'}),
  ],
}

export const applyS2GeometryOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  const build=overrides[lesson.id]
  if(!build) return lesson
  const coded={...lesson,code:codeOverrides[lesson.id]}
  return {...coded,frames:build(coded),traceMode:'execution',animationVersion:2}
}

export const s2GeometryOverrideIds=Object.freeze(Object.keys(overrides))
