// Original vector artwork for SnapJoy. No emoji fonts or remote assets are used.
// The design coordinates are 200 x 160; rasterization is cached by stickers.js.
const groups = {
  animals: [
    ['fox','小狐狸耳朵','head'],['panda','熊猫耳朵','head'],['koala','考拉耳朵','head'],['tiger','老虎耳朵','head'],
    ['lion','小狮子鬃毛','face'],['mouse','奶酪鼠耳朵','head'],['elephant','小象大耳朵','face'],['monkey','小猴子耳朵','head'],
    ['sheep','绵羊卷卷头','head'],['cow','奶牛小犄角','head'],['raccoon','浣熊耳朵','head'],['wolf','雪狼耳朵','head'],
    ['owl','猫头鹰羽冠','head'],['bat','蝙蝠耳朵','head'],['butterfly','蝴蝶触角','head'],['axolotl','六角龙发饰','head']
  ],
  hats: [
    ['wizard','星月魔法帽','head'],['witch','南瓜女巫帽','head'],['captain','小船长帽','head'],['sailor','水手帽','head'],
    ['chef','小厨师帽','head'],['beret','画家贝雷帽','head'],['cowboy','西部牛仔帽','head'],['explorer','探险家帽','head'],
    ['firefighter','消防员头盔','head'],['nurse','小医生帽','head'],['graduate','毕业方帽','head'],['santa','圣诞绒帽','head'],
    ['pumpkin','南瓜帽','head'],['straw','夏日草帽','head'],['mushroom','蘑菇小帽','head'],['icecream','冰淇淋帽','head']
  ],
  eyewear: [
    ['round','圆圆学者眼镜','eyes'],['oval','复古椭圆眼镜','eyes'],['aviator','飞行员眼镜','eyes'],['pixel','像素墨镜','eyes'],
    ['dive','潜水护目镜','eyes'],['ski','滑雪护目镜','eyes'],['visor','未来光带眼镜','eyes'],['flower','小花眼镜','eyes'],
    ['butterfly','蝴蝶眼镜','eyes'],['spiral','转圈圈眼镜','eyes'],['sleepy','困困睡眠眼罩','eyes'],['lashes','星光睫毛','eyes'],
    ['monocle','绅士单片眼镜','rightEye'],['cloud','云朵眼镜','eyes'],['diamond','钻石眼镜','eyes'],['leaf','树叶精灵眼镜','eyes']
  ],
  paint: [
    ['freckles','阳光雀斑','cheeks'],['stars','星星脸颊彩绘','cheeks'],['tears','小水滴彩绘','cheeks'],['lightning','闪电面纹','leftCheek'],
    ['tiger','老虎面纹','cheeks'],['cat','猫咪小面纹','cheeks'],['clown','马戏团彩绘','cheeks'],['diamond','宝石额纹','forehead'],
    ['rainbow','彩虹脸颊','cheeks'],['rose','玫瑰面饰','rightCheek'],['sunflower','小太阳面饰','leftCheek'],['butterfly','蝴蝶面饰','rightCheek'],
    ['snow','雪花面饰','cheeks'],['paw','猫爪脸颊','cheeks'],['galaxy','银河亮片','cheeks'],['confetti','派对彩点','cheeks']
  ],
  magic: [
    ['mermaid','美人鱼贝壳冠','head'],['tiara','水晶公主冠','head'],['firehorns','火焰小龙角','head'],['icehorns','冰晶小龙角','head'],
    ['robot','机器人天线','head'],['alien','小外星人触角','head'],['halo','小天使光环','head'],['wings','小天使翅膀','face'],
    ['dragonwings','龙翼面饰','face'],['leafcrown','森林花冠','head'],['elfears','精灵尖耳朵','face'],['gem','魔法额心宝石','forehead'],
    ['moon','月亮仙子头饰','head'],['planet','小行星头饰','head'],['fairywings','彩蝶精灵翅膀','face'],['superhero','小英雄面罩','eyes']
  ],
  accessories: [
    ['french','法式八字胡','mouth'],['goatee','魔术师山羊胡','chin'],['beard','船长大胡子','chin'],['santabeard','圣诞白胡子','chin'],
    ['vampire','小吸血鬼牙齿','mouth'],['bunnyteeth','小兔门牙','mouth'],['duckbeak','小鸭扁嘴','mouth'],['catnose','小猫鼻尖','nose'],
    ['dognose','小狗鼻尖','nose'],['bowtie','礼服蝴蝶领结','neck'],['scarf','软软条纹围巾','neck'],['necklace','珍珠项链','neck'],
    ['earrings','星月耳坠','face'],['headphone','彩色耳机','face'],['ribbon','双侧飘带','face'],['flowers','双侧小花发夹','face']
  ]
};
export const FACE_PROPS=Object.entries(groups).flatMap(([category,items])=>items.map(([key,name,anchor],variant)=>({
  id:`prop-${category}-${key}`,name,category,anchor,aspect:1.25,design:{category,key,variant},
  anchorScale:category==='paint' && ['rose','sunflower','butterfly'].includes(key)?1.15:1
})));
const palette=['#f3a8bc','#ffd27b','#9bd6b6','#9bc9ef','#b8a4df','#ed9977'];
function shape(c,d,fill,stroke='#594964',line=3){const p=new Path2D(d);c.lineJoin='round';c.lineCap='round';if(fill){c.fillStyle=fill;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke(p);}}
function oval(c,x,y,rx,ry,fill,stroke){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=3;c.stroke();}}
function line(c,d,color,width=4){shape(c,d,null,color,width);}
function box(c,x,y,w,h,r,color,stroke){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=3;c.stroke();}}
function star(c,x,y,r,color,points=5){c.beginPath();for(let i=0;i<points*2;i++){const a=i*Math.PI/points-Math.PI/2,rr=i%2?r*.43:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fillStyle=color;c.fill();}
function flower(c,x,y,r,color){for(let i=0;i<6;i++){let a=i*Math.PI/3;oval(c,x+Math.cos(a)*r*.65,y+Math.sin(a)*r*.65,r*.43,r*.43,color);}oval(c,x,y,r*.4,r*.4,'#ffe4a0');}
function gem(c,x,y,r,color){shape(c,`M${x} ${y-r} L${x+r*.7} ${y} L${x} ${y+r} L${x-r*.7} ${y} Z`,color,'#77628d',2);line(c,`M${x} ${y-r*.65} L${x-r*.3} ${y}`, '#ffffffb0',2);}
function shine(c,x,y){star(c,x,y,7,'#fff8de',4);}
function band(c,color='#d2a6bc'){line(c,'M25 137 Q100 102 175 137',color,12);line(c,'M28 132 Q100 102 172 132','#fff8e760',3);}
function cheeks(c,fn){for(const [x,flip] of [[35,1],[165,-1]]){c.save();c.translate(x,89);c.scale(flip,1);fn(c);c.restore();}}

export function drawFaceProp(c,def){
  const {category,key,variant:v}=def.design,color=palette[v%6],dark='#594964';
  c.lineJoin='round';c.lineCap='round';
  if(category==='animals'){
    if(key==='lion'){
      for(let i=0;i<16;i++){const a=i*Math.PI/8;c.save();c.translate(100,82);c.rotate(a);oval(c,0,-62,24,28,i%2?'#d89551':'#efbc64',dark);c.restore();}
      oval(c,29,65,13,18,'#f8d397');oval(c,171,65,13,18,'#f8d397');return;
    }
    if(key==='elephant'){
      shape(c,'M48 52 C-10 -4 -4 158 52 143 L70 98 Z','#b5bbd5');shape(c,'M152 52 C210 -4 204 158 148 143 L130 98 Z','#b5bbd5');
      oval(c,26,94,18,35,'#e6b7cc');oval(c,174,94,18,35,'#e6b7cc');return;
    }
    if(key==='axolotl'){
      for(let i=0;i<3;i++){line(c,`M52 132 Q${20+i*5} ${85-i*27} ${10+i*12} ${60-i*22}`,'#ed96b7',12);line(c,`M148 132 Q${180-i*5} ${85-i*27} ${190-i*12} ${60-i*22}`,'#ed96b7',12);}
      band(c,'#f5b4cf');return;
    }
    if(key==='butterfly'){
      line(c,'M66 137 Q20 50 57 24 M134 137 Q180 50 143 24',dark,5);flower(c,57,25,15,'#c4a1e4');flower(c,143,25,15,'#91d2d3');band(c,'#b8a4df');return;
    }
    if(key==='sheep'){
      shape(c,'M16 111 Q-2 65 48 88 L65 122Z','#b7a5ce');shape(c,'M184 111 Q202 65 152 88 L135 122Z','#b7a5ce');
      for(let i=0;i<8;i++)oval(c,30+i*20,105-Math.sin(i/7*Math.PI)*22,21,22,'#fff6e3', '#aa99af');band(c,'#fff6e3');return;
    }
    if(key==='cow'){
      shape(c,'M60 100 Q26 45 58 25 Q44 67 81 106Z','#f2cc81');shape(c,'M140 100 Q174 45 142 25 Q156 67 119 106Z','#f2cc81');
      oval(c,31,110,28,18,'#fff6e7',dark);oval(c,169,110,28,18,'#fff6e7',dark);oval(c,23,108,12,10,dark);band(c,'#fff6e7');return;
    }
    const round=['panda','koala','mouse','monkey'].includes(key);
    const fill={fox:'#e7a16c',panda:'#494657',koala:'#c4becb',tiger:'#efbb6d',mouse:'#a6b1c8',monkey:'#b58b69',raccoon:'#7e8295',wolf:'#e4e9ed',owl:'#b79acb',bat:'#767197'}[key]||color;
    for(const side of [-1,1]){
      c.save();if(side===1){c.translate(200,0);c.scale(-1,1);}
      if(round){oval(c,39,68,key==='mouse'?37:32,key==='koala'?43:35,fill,dark);oval(c,39,69,20,24,key==='panda'?'#b9aebc':'#eebac6');if(key==='koala')for(let j=0;j<4;j++)line(c,`M${10+j*4} ${45+j*12} L${3+j*4} ${40+j*12}`,'#e8e2ec',3);}
      else {shape(c,key==='bat'?'M17 137 L7 6 Q53 31 78 116Z':'M17 137 L13 15 Q55 26 81 115Z',fill,dark,4);shape(c,'M29 105 L27 42 L63 112Z',key==='wolf'?'#bab5d6':'#f0c0c7',null);}
      if(key==='tiger')line(c,'M20 58 L39 72 M19 85 L49 99',dark,6);
      if(key==='fox'||key==='wolf')shape(c,'M18 134 L19 98 L31 108 L35 89 L46 111 L62 101 L65 132Z','#fff8e8',null);
      if(key==='raccoon')line(c,'M21 31 L58 83', '#e7dfd3',10);
      if(key==='owl'){shape(c,'M32 113 L38 51 L54 79 L66 48 L70 118Z','#f0d696');line(c,'M48 89 L52 126',dark,3);}
      c.restore();
    }
    band(c,fill);if(key==='mouse')shape(c,'M80 128 L103 100 L126 128Z','#ffe08c',dark,2);
  }else if(category==='hats'){
    if(['wizard','witch'].includes(key)){
      oval(c,100,132,89,17,key==='wizard'?'#7269b3':'#59475f',dark);
      shape(c,key==='wizard'?'M39 126 L103 6 L163 126Z':'M40 126 L100 10 Q128 -2 144 27 L119 31 L162 126Z',key==='wizard'?'#9285cf':'#806299');
      line(c,'M54 104 Q100 114 148 104','#edb773',12);key==='wizard'?star(c,98,62,17,'#ffe39c'):box(c,87,100,26,17,2,'#ffd486',dark);shine(c,70,82);
    }else if(key==='chef'){
      shape(c,'M41 97 C-4 82 21 30 53 41 C50 -2 111 -2 119 28 C153 0 194 37 169 70 C190 99 163 113 150 109Z','#fff9e9', '#aaa1ad');box(c,48,99,107,45,8,'#fff9e9','#aaa1ad');line(c,'M64 111 L64 133 M88 111 L88 133 M114 111 L114 133 M140 111 L140 133','#ded3ce',3);
    }else if(key==='graduate'){
      box(c,48,79,104,59,12,'#4c566a',dark);shape(c,'M5 63 L99 23 L195 63 L100 102Z','#58687e');line(c,'M101 63 L170 81 L170 130','#edc878',4);box(c,163,123,14,26,4,'#edc878');
    }else if(key==='santa'){
      shape(c,'M36 125 Q70 -8 132 25 Q179 45 165 91 L141 87 Q142 50 122 59 L152 125Z','#eb818b');oval(c,166,91,18,19,'#fff8ec');box(c,30,118,129,30,13,'#fff8ec','#bd91a0');
    }else if(key==='mushroom'){
      box(c,74,94,53,52,11,'#ffedc5');shape(c,'M9 110 Q18 14 101 16 Q183 14 191 110 Q100 142 9 110Z','#e991a1');[[52,70,18],[97,46,16],[145,79,21],[100,108,12]].forEach(([x,y,r])=>oval(c,x,y,r,r,'#fff2d7'));
    }else if(key==='icecream'){
      shape(c,'M56 108 L147 108 L128 149 L76 149Z','#ddb780');line(c,'M66 113 L117 148 M93 111 L136 139 M136 114 L87 147','#fff0c5',3);
      for(const [x,y,r,col] of [[62,91,32,'#eab4cf'],[131,91,33,'#a7d9bd'],[98,54,34,'#f2d3a8']])oval(c,x,y,r,r,col,dark);
      oval(c,101,18,9,9,'#df798d');line(c,'M102 12 Q108 2 118 6','#739774',3);shine(c,84,43);
    }else if(key==='pumpkin'){
      for(let i=0;i<5;i++)oval(c,50+i*25,94,30,48,i%2?'#eaa56b':'#f8bc79',dark);shape(c,'M91 47 L95 13 L116 9 L110 47Z','#89a878');line(c,'M110 22 Q146 6 145 33 Q140 46 130 31','#89a878',4);
    }else if(key==='beret'){
      shape(c,'M24 114 Q0 57 69 40 Q152 2 182 64 Q194 103 153 120Z','#a6bcd7');box(c,40,118,116,23,7,'#7e98ba');line(c,'M104 36 L107 18',dark,7);flower(c,149,99,14,'#f4d69d');
    }else if(key==='cowboy'){
      shape(c,'M40 117 L58 39 Q80 23 99 42 Q122 23 145 39 L160 117Z','#cca277');shape(c,'M8 100 Q36 147 100 127 Q165 149 193 100 L185 137 Q101 159 18 138Z','#e6be88');line(c,'M50 103 Q102 116 152 102','#876878',10);star(c,100,109,13,'#ffe3a1');
    }else if(key==='straw'){
      oval(c,100,126,94,23,'#e8c78f',dark);shape(c,'M44 117 L55 48 Q100 26 146 48 L157 117Z','#f2dbac');line(c,'M49 104 Q100 123 152 104','#91bba3',13);for(let y=59;y<100;y+=12)line(c,`M56 ${y} Q100 ${y+14} 146 ${y}`,'#d0af7a',2);flower(c,151,112,17,'#f3a8bc');
    }else if(key==='firefighter'){
      shape(c,'M24 122 Q25 32 100 28 Q175 32 176 122Z','#e88b79');box(c,12,119,176,23,8,'#f3c471',dark);box(c,87,23,27,75,8,'#f3c471',dark);shape(c,'M76 85 L124 85 L122 118 L100 135 L78 118Z','#fff1ba');star(c,100,107,14,'#d78364');
    }else if(key==='nurse'){
      shape(c,'M26 69 Q100 21 174 69 L154 138 L47 138Z','#fef7ed');box(c,90,61,20,60,3,'#e98f9c');box(c,70,81,60,20,3,'#e98f9c');
    }else if(key==='explorer'){
      shape(c,'M30 119 Q27 37 100 37 Q173 37 170 119Z','#b8c79a');oval(c,100,129,93,18,'#cbd3a9',dark);line(c,'M101 40 L101 115','#8f9e7a',5);box(c,78,105,45,27,6,'#ebcd91',dark);oval(c,99,118,8,8,'#9bb8ba');
    }else{
      shape(c,'M24 66 Q100 8 176 66 L155 115 L44 115Z','#fff5df');box(c,38,108,125,26,5,key==='sailor'?'#95c5e0':'#5a6a8e');shape(c,'M51 132 Q100 160 151 132Z',key==='sailor'?'#95c5e0':'#5a6a8e');
      if(key==='captain')star(c,100,83,19,'#eac579');else{line(c,'M100 61 L100 99 M85 87 Q100 113 115 87 M87 74 L113 74','#7189b0',5);oval(c,100,59,5,5,null,'#7189b0');}
    }
  }else if(category==='eyewear'){
    if(key==='monocle'){oval(c,100,70,40,43,'#c5dfe740','#bc9a58');line(c,'M133 99 Q167 122 148 154','#bc9a58',4);shine(c,84,47);return;}
    if(key==='lashes'){for(const x of [53,147]){line(c,`M${x-34} 78 Q${x} 105 ${x+34} 78`,dark,5);for(let i=0;i<5;i++)line(c,`M${x-27+i*13} ${86+Math.sin(i/4*Math.PI)*5} L${x-32+i*16} ${105+Math.sin(i/4*Math.PI)*9}`,dark,4);star(c,x,58,11,'#f7dba0');}return;}
    if(['dive','ski','visor','sleepy'].includes(key)){
      line(c,'M4 78 L195 78',dark,10);
      shape(c,'M11 47 Q100 25 189 47 L182 105 Q150 131 115 102 L100 87 L85 102 Q50 131 18 105Z',key==='sleepy'?'#b3a2d2':key==='visor'?'#91dece99':'#a6cce988',dark,5);
      if(key==='dive'){line(c,'M99 45 L99 86','#85b7ce',8);line(c,'M178 100 L188 140 L167 140','#ecc777',11);}
      if(key==='ski')line(c,'M23 58 Q100 44 178 57','#e9b3d4',8);
      if(key==='visor')for(let i=0;i<5;i++)line(c,`M${30+i*32} 54 L${23+i*32} 100`,'#f6e6b7',3);
      if(key==='sleepy')for(const x of [53,147]){line(c,`M${x-19} 75 Q${x} 92 ${x+19} 75`,dark,3);star(c,x,56,8,'#fff1bd');}
      shine(c,41,56);return;
    }
    line(c,'M7 75 L20 77 M84 77 Q100 63 116 77 M180 77 L194 75',dark,5);
    for(const x of [53,147]){
      if(key==='flower'){flower(c,x,80,44,color);oval(c,x,80,24,26,'#6e5979');oval(c,x,80,20,22,'#a6d9e980');}
      else if(key==='pixel'){box(c,x-41,51,82,51,0,dark);for(let j=0;j<3;j++)box(c,x-30+j*15,61,10,10,0,'#f4ebd6');}
      else if(key==='spiral'){oval(c,x,80,40,40,'#fff6db',dark);c.beginPath();for(let a=0;a<Math.PI*5;a+=.1){let r=a*2;c.lineTo(x+Math.cos(a)*r,80+Math.sin(a)*r);}c.strokeStyle=color;c.lineWidth=5;c.stroke();}
      else if(key==='butterfly'){shape(c,`M${x} 79 C${x-65} 7 ${x-60} 115 ${x} 113 C${x+60} 115 ${x+65} 7 ${x} 79Z`,color,dark,4);oval(c,x,88,20,18,'#c8e5f180');}
      else if(key==='cloud'){for(const [dx,dy,r] of [[-22,0,20],[-10,-14,22],[15,-10,22],[25,8,17],[0,13,24]])oval(c,x+dx,77+dy,r,r,'#fdf5ef');oval(c,x,82,26,23,'#b9dbe9a0');}
      else if(key==='leaf'){shape(c,`M${x-41} 93 Q${x-41} 37 ${x+41} 55 Q${x+25} 118 ${x-41} 93Z`,'#aad4a887', '#688f73',4);line(c,`M${x-28} 91 L${x+29} 62`,'#688f73',2);}
      else if(key==='diamond'){shape(c,`M${x-41} 75 L${x-20} 43 L${x+20} 43 L${x+41} 75 L${x} 119Z`,'#b4bae290','#9a86b3',5);line(c,`M${x-20} 49 L${x} 109 L${x+20} 49`,'#dce9f0',2);}
      else if(key==='aviator'){shape(c,`M${x-38} 50 Q${x} 40 ${x+38} 50 L${x+35} 92 Q${x} 128 ${x-35} 92Z`,'#a0b7cba0','#c2a36c',4);}
      else {oval(c,x,80,key==='oval'?42:37,key==='oval'?27:38,'#b7d4e94d',key==='round'?'#c4a46f':dark);}
      shine(c,x-13,65);
    }
  }else if(category==='paint'){
    const one=['lightning','diamond','rose','sunflower','butterfly'].includes(key);
    const mark=(x)=>{
      if(key==='freckles'){for(let i=0;i<7;i++)oval(x,(i%4-1.5)*12,(Math.floor(i/4)*12)-5,2.4,2.4,'#b47e69');}
      if(key==='stars'){star(x,0,0,22,'#f6cf77');star(x,-25,18,10,'#f2a9c2');star(x,27,-12,9,'#aecbed');}
      if(key==='tears'){shape(x,'M0 -31 Q-35 14 0 25 Q35 14 0 -31Z','#9ccce9','#7895bd',2);line(x,'M-8 3 L-11 12','#f2fbff',4);}
      if(key==='lightning'){shape(x,'M12 -61 L-32 9 L-4 9 L-21 63 L36 -14 L8 -14Z','#f9ce7c','#c88d7a',3);}
      if(key==='tiger'){for(let i=0;i<3;i++)shape(x,`M-30 ${-22+i*22} Q-3 ${-32+i*22} 33 ${-5+i*18} Q-5 ${-7+i*20} -30 ${-22+i*22}Z`,dark,null);}
      if(key==='cat'){oval(x,-6,6,25,16,'#f3b0b4a0');line(x,'M-26 -15 L22 -4 M-29 8 L26 12 M-22 32 L22 24',dark,3);}
      if(key==='clown'){shape(x,'M0 -38 L-19 -3 L19 -3Z','#89c5df',null);shape(x,'M-18 8 L18 8 L0 38Z','#e99bb1',null);oval(x,0,1,6,6,'#f8d681');}
      if(key==='diamond'){gem(x,0,0,43,'#bcb3ea');gem(x,-45,8,18,'#9edace');gem(x,45,8,18,'#9edace');}
      if(key==='rainbow'){['#f398a8','#f6cf81','#a6d6b5','#9abfeb'].forEach((col,i)=>{x.beginPath();x.arc(0,17,29-i*6,Math.PI,0);x.strokeStyle=col;x.lineWidth=6;x.stroke();});}
      if(key==='rose'){for(let i=0;i<6;i++){x.save();x.rotate(i*Math.PI/3);oval(x,0,-14,21,25,i%2?'#edacbf':'#db87a2');x.restore();}oval(x,0,0,13,14,'#f4ced3');shape(x,'M19 23 Q61 10 45 45 Q32 44 19 23Z','#9bc9aa',null);}
      if(key==='sunflower'){flower(x,0,0,45,'#f6d17b');oval(x,0,0,19,19,'#a9856a');for(let i=0;i<6;i++)oval(x,Math.cos(i)*10,Math.sin(i)*10,2,2,'#efd7aa');}
      if(key==='butterfly'){shape(x,'M0 -4 C-64 -64 -66 20 -7 17 C-53 68 8 67 0 9 C66 65 58 2 8 17 C68 -29 47 -65 0 -4Z','#bba8dc','#8a719f',2);line(x,'M0 -16 L0 29','#685274',4);oval(x,0,-18,6,6,'#685274');}
      if(key==='snow'){for(let i=0;i<6;i++){x.save();x.rotate(i*Math.PI/3);line(x,'M0 0 L0 -30 M0 -17 L-8 -24 M0 -17 L8 -24','#b5e3ef',3);x.restore();}}
      if(key==='paw'){oval(x,0,9,17,13,'#e89db8');[-19,-7,7,19].forEach((a,i)=>oval(x,a,-10-Math.sin(i/3*Math.PI)*9,6,9,'#e89db8'));}
      if(key==='galaxy'){for(let i=0;i<12;i++){const a=i*2.4,r=7+i*2;star(x,Math.cos(a)*r,Math.sin(a)*r,3+i%3,palette[i%6],4);}}
      if(key==='confetti'){for(let i=0;i<12;i++){x.save();x.translate((i%4-1.5)*14,Math.floor(i/4)*12-12);x.rotate(i*.6);box(x,-2,-4,5,9,1,palette[i%6]);x.restore();}}
    };
    if(one){c.save();c.translate(100,80);mark(c);c.restore();}else cheeks(c,mark);
  }else if(category==='magic'){
    if(['wings','dragonwings','fairywings','elfears'].includes(key)){
      for(let i=0;i<2;i++){c.save();if(i){c.translate(200,0);c.scale(-1,1);}
        if(key==='elfears'){shape(c,'M55 72 L5 14 Q-7 95 54 139 L68 108Z','#e1c7ab');shape(c,'M47 99 L18 42 Q17 86 42 116Z','#e6aeba',null);}
        if(key==='wings'){for(let j=0;j<5;j++)shape(c,`M62 128 Q${-5+j*8} ${84-j*13} ${8+j*8} ${12+j*3} Q${51+j*4} 63 64 108Z`,'#fff8e8','#c8bbd4',2);}
        if(key==='dragonwings'){shape(c,'M65 128 L3 20 Q50 25 74 64 Q41 61 44 83 Q18 74 23 99 Q48 95 65 128Z','#abcba3','#677c7f',3);line(c,'M10 29 L61 119 M10 29 L65 67','#dce8b5',3);}
        if(key==='fairywings'){shape(c,'M66 96 C-5 -47 -18 103 52 103 C-20 122 30 182 68 112Z','#c0a8e280','#9d82bc',3);line(c,'M58 93 L19 40 M58 107 L26 137','#e9c7e6',3);shine(c,29,69);}
        c.restore();}return;
    }
    if(key==='superhero'){shape(c,'M5 37 Q53 44 100 64 Q148 44 195 37 L171 119 L125 112 L100 94 L75 112 L29 119Z','#db929f',dark,3);c.save();c.globalCompositeOperation='destination-out';oval(c,54,82,24,16,'black');oval(c,146,82,24,16,'black');c.restore();gem(c,100,63,15,'#ffe0a2');return;}
    if(key==='gem'){line(c,'M10 75 Q100 34 190 75','#c8a86b',5);gem(c,100,88,38,'#9ecfdf');[22,46,70,130,154,178].forEach(x=>oval(c,x,72,5,5,'#f7d990'));return;}
    if(key==='halo'){oval(c,100,60,80,29,null,'#ffdc86');oval(c,100,60,76,25,null,'#fff4bf');shine(c,27,58);shine(c,169,62);return;}
    if(['robot','alien'].includes(key)){
      if(key==='robot'){line(c,'M100 123 L100 34','#7d92a7',9);box(c,55,113,90,28,9,'#a6bfd3',dark);oval(c,100,23,16,16,'#eca88c',dark);star(c,100,23,9,'#ffe7ad');}
      else{line(c,'M52 132 Q22 59 49 27 M148 132 Q178 59 151 27','#91b7a2',9);oval(c,49,24,22,24,'#b7d5a0',dark);oval(c,151,24,22,24,'#b7d5a0',dark);oval(c,52,24,9,12,'#5c6871');oval(c,148,24,9,12,'#5c6871');band(c,'#9cc7a8');}return;
    }
    if(key==='firehorns'||key==='icehorns'){
      for(let i=0;i<2;i++){c.save();if(i){c.translate(200,0);c.scale(-1,1);}
        shape(c,key==='firehorns'?'M24 140 Q-3 75 37 12 Q22 61 57 45 Q42 102 79 134Z':'M22 140 L12 69 L43 10 L56 75 L79 135Z',key==='firehorns'?'#eeaf78':'#b0dbe5',dark);
        shape(c,key==='firehorns'?'M38 136 Q15 93 43 61 Q37 100 62 133Z':'M32 133 L39 39 L63 132Z',key==='firehorns'?'#ffe19a':'#e5f4ef',null);c.restore();}band(c,key==='firehorns'?'#eeaf78':'#b0dbe5');return;
    }
    if(key==='leafcrown'){band(c,'#90b495');for(let i=0;i<7;i++){c.save();c.translate(30+i*23,116-Math.sin(i/6*Math.PI)*25);c.rotate((i-3)*.15);shape(c,'M0 10 Q-35 -23 0 -43 Q35 -23 0 10Z',i%2?'#a9cf9f':'#90bba6',null);line(c,'M0 5 L0 -30','#e7e8bc',2);flower(c,0,3,9,palette[i%6]);c.restore();}return;}
    if(key==='mermaid'){band(c,'#9dcbbd');for(let i=0;i<5;i++){c.save();c.translate(100,129);c.rotate((i-2)*.4);shape(c,'M0 0 Q-29 -24 -15 -70 Q0 -94 15 -70 Q29 -24 0 0Z',palette[(i+3)%6],'#a189af',2);line(c,'M0 -5 L0 -70','#fff1dd',2);c.restore();}oval(c,100,133,11,11,'#fff1da');return;}
    if(key==='tiara'){line(c,'M20 133 Q100 110 180 133','#c9accb',8);for(let i=0;i<5;i++){const x=36+i*32,h=20+Math.sin(i/4*Math.PI)*32;gem(c,x,112-h*.55,h,palette[(i+3)%6]);}shine(c,100,51);return;}
    if(key==='moon'){band(c,'#b5a6d1');shape(c,'M106 13 C22 19 29 105 104 107 C61 78 72 39 106 13Z','#f6db9d','#bca786');star(c,133,67,26,'#c6b1e1');star(c,166,108,12,'#f6db9d');return;}
    if(key==='planet'){band(c,'#a6b9d8');oval(c,100,72,41,40,'#bdaed8',dark);c.save();c.translate(100,72);c.rotate(-.3);oval(c,0,0,70,16,null,'#eac792');c.restore();oval(c,84,61,10,8,'#e7c0d3');star(c,34,29,13,'#f4da9c');star(c,167,110,10,'#c5dfd1');}
  }else if(category==='accessories'){
    if(key==='catnose'||key==='dognose'){
      shape(c,key==='catnose'?'M65 58 Q100 42 135 58 L100 98Z':'M57 58 Q100 35 143 58 Q147 99 100 104 Q53 99 57 58Z',key==='catnose'?'#e6a0af':'#685965');oval(c,84,59,9,5,'#fff4e990');line(c,'M100 97 L100 120 M78 119 Q90 135 100 120 Q110 135 122 119','#685965',3);
    }else if(key==='french'){
      shape(c,'M100 87 Q73 53 48 84 Q28 101 13 70 Q7 129 56 113 L100 97 L144 113 Q193 129 187 70 Q172 101 152 84 Q127 53 100 87Z','#6e5872');
    }else if(['goatee','beard','santabeard'].includes(key)){
      if(key==='goatee'){shape(c,'M69 53 Q100 78 131 53 L123 115 L99 151 L77 115Z','#725e70');line(c,'M90 86 L96 131 M109 87 L103 131','#9b8190',3);}
      else {shape(c,'M17 16 Q33 65 72 43 Q100 66 129 43 Q167 65 183 16 Q199 112 100 155 Q1 112 17 16Z',key==='beard'?'#947253':'#fff5e8',key==='beard'?dark:'#b8a1b2');for(let i=0;i<6;i++)line(c,`M${40+i*24} 79 Q${30+i*24} 103 ${80+i*8} 135`,key==='beard'?'#bc946c':'#decdd5',3);}
    }else if(key==='vampire'||key==='bunnyteeth'){
      if(key==='vampire'){shape(c,'M39 49 L68 49 L55 128Z','#fff6e8');shape(c,'M132 49 L161 49 L145 128Z','#fff6e8');line(c,'M35 46 Q100 69 165 46','#d3889e',6);}
      else {box(c,61,40,38,70,10,'#fff9ec',dark);box(c,101,40,38,70,10,'#fff9ec',dark);line(c,'M55 40 Q100 54 145 40','#d59eaf',5);}
    }else if(key==='duckbeak'){
      shape(c,'M13 85 Q100 12 187 85 Q100 119 13 85Z','#f7c77c');shape(c,'M22 91 Q100 155 179 91 Q100 116 22 91Z','#e8a566');oval(c,75,66,4,6,'#9c705f');oval(c,125,66,4,6,'#9c705f');
    }else if(key==='bowtie'){
      line(c,'M10 81 L190 81','#a98bb6',8);shape(c,'M86 69 L20 32 L20 129 L86 93 M114 69 L180 32 L180 129 L114 93Z','#b39ac7');box(c,83,58,34,49,10,'#e3b5ce',dark);shine(c,42,58);
    }else if(key==='scarf'){
      box(c,21,44,158,48,19,'#9fcbb8',dark);shape(c,'M101 78 L133 80 L151 150 L109 150Z','#9fcbb8');for(let i=0;i<5;i++)box(c,35+i*29,45,11,45,2,'#f0d698');line(c,'M109 116 L140 111 M113 135 L146 129','#f0d698',8);
    }else if(key==='necklace'){
      line(c,'M16 33 Q100 165 184 33','#cbbcb5',2);for(let i=0;i<13;i++){const a=.2+i*(Math.PI-.4)/12;oval(c,100-Math.cos(a)*83,24+Math.sin(a)*88,7,8,'#fff5df','#bba9b4');}gem(c,100,128,20,'#c5b3dc');
    }else if(key==='headphone'){
      line(c,'M17 94 C-3 -26 203 -26 183 94','#bba9d3',15);box(c,9,68,30,69,12,'#a2cbd8',dark);box(c,161,68,30,69,12,'#a2cbd8',dark);line(c,'M21 81 L21 122 M179 81 L179 122','#fff0d9',5);
    }else{
      for(let i=0;i<2;i++){c.save();if(i){c.translate(200,0);c.scale(-1,1);}
        if(key==='earrings'){oval(c,23,51,6,6,'#efd394');line(c,'M23 59 L23 103','#bca478',3);star(c,23,123,20,i?'#bba9d5':'#f4d69a');}
        if(key==='flowers'){flower(c,30,65,24,'#eaa7bd');flower(c,25,106,16,'#f6d69c');line(c,'M47 87 L15 132','#9abc9b',4);}
        if(key==='ribbon'){shape(c,'M35 56 L57 139 L33 125 L15 146 L22 60Z','#c0afd8');shape(c,'M30 56 Q-8 8 8 58 Q-1 89 30 66 Q64 90 60 58 Q72 18 30 56Z','#e8b2ca');oval(c,30,59,9,10,'#f8dfcb');}
        c.restore();}
    }
  }
}
