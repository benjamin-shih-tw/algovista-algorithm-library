import type { AlgorithmLesson, Frame } from './algorithms'
import { eventFrame } from './traceAuthoring'

type TraceBuilder=(lesson:AlgorithmLesson)=>Frame[]

const codeOverrides:Record<string,string[]>={
  'meet-in-the-middle':[
    'bool hasSubsetSumTarget(const vector<long long>& a,long long target){',
    '  int n=(int)a.size();',
    '  int n1=n/2, n2=n-n1;',
    '  vector<long long> left(a.begin(),a.begin()+n1);',
    '  vector<long long> right(a.begin()+n1,a.end());',
    '  vector<long long> leftSums, rightSums;',
    '  for(int mask=0;mask<(1<<n1);++mask){',
    '    long long sum=0;',
    '    for(int i=0;i<n1;++i) if(mask>>i&1) sum+=left[i];',
    '    leftSums.push_back(sum);',
    '  }',
    '  for(int mask=0;mask<(1<<n2);++mask){',
    '    long long sum=0;',
    '    for(int i=0;i<n2;++i) if(mask>>i&1) sum+=right[i];',
    '    rightSums.push_back(sum);',
    '  }',
    '  sort(rightSums.begin(),rightSums.end());',
    '  for(long long x:leftSums){',
    '    long long need=target-x;',
    '    if(binary_search(rightSums.begin(),rightSums.end(),need)) return true;',
    '  }',
    '  return false;',
    '}',
  ],
  'treap':[
    'pair<Node*,Node*> split(Node* t,int key){',
    '  if(!t) return {nullptr,nullptr};',
    '  if(t->key<key){',
    '    auto [a,b]=split(t->right,key);',
    '    t->right=a;',
    '    return {t,b};',
    '  }else{',
    '    auto [a,b]=split(t->left,key);',
    '    t->left=b;',
    '    return {a,t};',
    '  }',
    '}',
    'Node* merge(Node* a,Node* b){',
    '  if(!a||!b) return a?a:b;',
    '  if(a->priority<b->priority){ a->right=merge(a->right,b); return a; }',
    '  b->left=merge(a,b->left); return b;',
    '}',
  ],
  'shunting-yard':[
    'for(Token t:tokens){',
    '  if(t.isNumber()) output.push_back(t);',
    '  else if(t.isOperator()){',
    '    while(!ops.empty() && precedence(ops.back())>=precedence(t)) output.push_back(pop(ops));',
    '    ops.push_back(t);',
    '  }',
    '}',
    'while(!ops.empty()) output.push_back(pop(ops));',
  ],
  'fft':[
    'void fft(vector<complex<double>>& a){',
    '  int n=a.size(); if(n==1) return;',
    '  vector<complex<double>> even(n/2),odd(n/2);',
    '  for(int i=0;i<n/2;++i) even[i]=a[2*i],odd[i]=a[2*i+1];',
    '  fft(even); fft(odd);',
    '  for(int k=0;k<n/2;++k){',
    '    complex<double> w=polar(1.0,2*PI*k/n);',
    '    a[k]=even[k]+w*odd[k];',
    '    a[k+n/2]=even[k]-w*odd[k];',
    '  }',
    '}',
  ],
  'ntt':[
    'void ntt4(array<int,4>& a){',
    '  int E0=(a[0]+a[2])%17, E1=(a[0]-a[2]+17)%17;',
    '  int O0=(a[1]+a[3])%17, O1=(a[1]-a[3]+17)%17;',
    '  int w=4;',
    '  a[0]=(E0+O0)%17;',
    '  a[2]=(E0-O0+17)%17;',
    '  a[1]=(E1+w*O1)%17;',
    '  a[3]=(E1-w*O1%17+17)%17;',
    '}',
  ],
}

const overrides:Record<string,TraceBuilder>={
  'meet-in-the-middle':lesson=>[
    eventFrame(lesson,'vector<long long> leftSums','a=[3,5,6,7], target=12','切成 Left=[3,5]、Right=[6,7]。每半只有 2²=4 個 subset。',{left:['3','5'],right:['6','7'],target:12,operation:'split input'}),
    eventFrame(lesson,'leftSums.push_back','枚舉 Left Sums','mask 00,01,10,11 對應 0,3,5,8。',{leftSums:['0','3','5','8'],operation:'enumerate left subsets'}),
    eventFrame(lesson,'rightSums.push_back','枚舉 Right Sums','得到 0,6,7,13。',{rightSums:['0','6','7','13'],operation:'enumerate right subsets'}),
    eventFrame(lesson,'sort(rightSums','排序右半','[0,6,7,13] 已是排序結果，可用 binary_search。',{rightSums:['0','6','7','13'],operation:'sort one half'}),
    eventFrame(lesson,'long long need=target-x','x=0：Need 12','Right 沒有 12；繼續。',{x:0,need:12,found:'false',operation:'probe complement'}),
    eventFrame(lesson,'binary_search','x=3：Need 9，也不存在','Right Sums 中找不到 9，因此這個 left sum 無法組成 target，繼續檢查下一個候選。',{x:3,need:9,found:'false',operation:'probe complement'}),
    eventFrame(lesson,'binary_search','x=5：Need 7，命中','Left subset {5} + Right subset {7}=12。',{x:5,need:7,found:'true',subset:['5','7'],operation:'find matching halves'}),
    eventFrame(lesson,'return true','回傳 True','把 O(2^n) 枚舉拆成兩個 O(2^(n/2)) 集合。',{result:'true',complexity:'O(2^(n/2) log 2^(n/2))',operation:'finish MITM'}),
  ],

  'treap':lesson=>[
    eventFrame(lesson,'split(Node* t','Treap：key 2(p30), 5(p10), 8(p20)','BST key 順序是 2<5<8，min-priority heap 讓 5(p10) 當 Root，左 2、右 8。',{tree:['root 5(p10)','left 2(p30)','right 8(p20)'],key:6,operation:'initialize treap split'}),
    eventFrame(lesson,'if(t->key<key)','Root key 5 < split key 6','5 應留在左半；只需要 split 它的右子樹 8。',{node:'5',decision:'go right',operation:'split root right'}),
    eventFrame(lesson,'split(t->right,key)','遞迴到 Node 8','8≥6，因此 8 應落在右半，接著 split 它的左子樹 null。',{node:'8',decision:'go left',operation:'recurse into 8'}),
    eventFrame(lesson,'if(!t)','Null Base 回傳 (null,null)','遞迴走到空子樹，表示這條 split 路徑已到達基底，可以開始回溯重接指標。',{result:['null','null'],operation:'split base'}),
    eventFrame(lesson,'t->left=b','回到 8：left 仍 Null','這層回傳 (null,8)。',{left:'null',right:'8(p20)',operation:'rewire right tree'}),
    eventFrame(lesson,'t->right=a','回到 5：right 改成 Null','這層回傳 (5-subtree,8)。左樹含 2、5；右樹含 8。',{left:['5(p10)','2(p30)'],right:['8(p20)'],operation:'rewire left tree'}),
    eventFrame(lesson,'return {t,b}','Split 完成','兩棵樹各自仍同時滿足 BST 與 priority heap 性質。',{result:['{2,5}','{8}'],operation:'finish split'}),
  ],

  'shunting-yard':lesson=>[
    eventFrame(lesson,'for(Token t:tokens)','Expression = 3 + 4 * 2','Output=[]，Ops=[]。',{tokens:['3','+','4','*','2'],output:[],ops:[],operation:'initialize'}),
    eventFrame(lesson,'output.push_back(t)','讀 3：直接輸出','數字不需要等待運算子。',{token:'3',output:['3'],ops:[],operation:'emit operand'}),
    eventFrame(lesson,'ops.push_back(t)','讀 +：Push Ops','Ops 空，所以 + 直接入 stack。',{token:'+',output:['3'],ops:['+'],operation:'push plus'}),
    eventFrame(lesson,'output.push_back(t)','讀 4：輸出','Output=[3,4]。',{token:'4',output:['3','4'],ops:['+'],operation:'emit operand'}),
    eventFrame(lesson,'precedence(ops.back())>=precedence(t)','讀 *：+ 的優先序較低','不 pop +，直接把 * push；Ops=[+,*]。',{conversionState:'postfix output=3 4 before *',token:'*',output:['3','4'],ops:['+','*'],operation:'respect precedence'}),
    eventFrame(lesson,'output.push_back(t)','讀 2：輸出','Output=[3,4,2]。',{token:'2',output:['3','4','2'],ops:['+','*'],operation:'emit operand'}),
    eventFrame(lesson,'while(!ops.empty()) output.push_back','輸入結束：先 Pop * 再 Pop +','得到 postfix [3,4,2,*,+]。',{output:['3','4','2','*','+'],ops:[],operation:'flush operators'}),
    eventFrame(lesson,'while(!ops.empty()) output.push_back','Postfix 完成','其結構等價於 3 + (4*2)，不再需要括號或 precedence。',{result:'3 4 2 * +',operation:'finish shunting yard'}),
  ],

  'fft':lesson=>[
    eventFrame(lesson,'fft(vector','輸入係數 [1,2,3,4]','n=4，將偶數 index 與奇數 index 拆成兩個 n/2 子問題。',{input:['1','2','3','4'],n:4,operation:'initialize FFT'}),
    eventFrame(lesson,'even[i]=a[2*i]','Split Even=[1,3], Odd=[2,4]','A(x)=E(x²)+xO(x²)。',{even:['1','3'],odd:['2','4'],operation:'split coefficients'}),
    eventFrame(lesson,'fft(even); fft(odd)','兩個長度 2 DFT','E=[4,-2]；O=[6,-2]。',{E:['4','-2'],O:['6','-2'],operation:'solve half transforms'}),
    eventFrame(lesson,'w=polar','k=0：w=1','a0=4+6=10；a2=4-6=-2。',{k:0,w:'1',out0:'10',out2:'-2',operation:'butterfly k0'}),
    eventFrame(lesson,'w=polar','k=1：w=i','a1=-2+i(-2)=-2-2i；a3=-2-i(-2)=-2+2i。',{k:1,w:'i',out1:'-2-2i',out3:'-2+2i',operation:'butterfly k1'}),
    eventFrame(lesson,'a[k+n/2]=even[k]-w*odd[k]','DFT 完成','結果 [10,-2-2i,-2,-2+2i]。',{result:['10','-2-2i','-2','-2+2i'],operation:'finish FFT'}),
  ],

  'ntt':lesson=>[
    eventFrame(lesson,'ntt4','在 mod 17 做長度 4 NTT，輸入 [1,2,3,4]','4 是 mod17 的四次原根：4²=16=-1、4⁴=1。',{mod:17,root:4,input:['1','2','3','4'],operation:'initialize NTT'}),
    eventFrame(lesson,'E0=(a[0]+a[2])','偶數位置 1,3 的長度 2 Transform','E0=1+3=4；E1=1-3=-2≡15。',{E0:4,E1:15,operation:'transform even half'}),
    eventFrame(lesson,'O0=(a[1]+a[3])','奇數位置 2,4','O0=6；O1=2-4=-2≡15。',{O0:6,O1:15,operation:'transform odd half'}),
    eventFrame(lesson,'a[0]=(E0+O0)','k=0 Butterfly','a0=4+6=10；a2=4-6=-2≡15。',{a0:10,a2:15,operation:'butterfly k0'}),
    eventFrame(lesson,'a[1]=(E1+w*O1)','k=1 使用 w=4','w*O1=4×15=60≡9；a1=15+9=24≡7。',{wO1:9,a1:7,operation:'butterfly k1 plus'}),
    eventFrame(lesson,'a[3]=(E1-w*O1','另一半 a3=15-9=6','所有計算都在有限域中精確進行。',{a3:6,operation:'butterfly k1 minus'}),
    eventFrame(lesson,'a[3]=(E1-w*O1','NTT 結果 [10,7,15,6]','不含浮點誤差；inverse 時改用逆根並乘 n^-1。',{result:['10','7','15','6'],operation:'finish NTT'}),
  ],
}

export const applyS2MiscOverride=(lesson:AlgorithmLesson):AlgorithmLesson=>{
  const build=overrides[lesson.id]
  if(!build) return lesson
  const coded={...lesson,code:codeOverrides[lesson.id]}
  return {...coded,frames:build(coded),traceMode:'execution',animationVersion:2}
}

export const s2MiscOverrideIds=Object.freeze(Object.keys(overrides))
