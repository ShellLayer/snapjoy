// Original paper-mask artwork, drawn locally and cached by stickers.js.
// All designs share eye centers (68, 104) and (132, 104) in a 200 x 240 space.
const designs = [
  ['cat','奶油猫咪面具','animal'],['fox','赤狐面具','animal'],['panda','糯米熊猫面具','animal'],['tiger','森林虎崽面具','animal'],
  ['rabbit','软糖兔子面具','animal'],['bear','蜂蜜小熊面具','animal'],['husky','雪地哈士奇面具','animal'],['raccoon','夜行浣熊面具','animal'],
  ['koala','抱树考拉面具','animal'],['lion','太阳狮子面具','animal'],['deer','花斑小鹿面具','animal'],['owl','星夜猫头鹰面具','animal'],
  ['frog','荷塘青蛙面具','animal'],['penguin','围巾企鹅面具','animal'],['dalmatian','斑点小狗面具','animal'],['dragon','翡翠小龙面具','animal'],
  ['robot','星际机器人面具','fantasy'],['astronaut','月球探险面具','fantasy'],['alien','友好外星人面具','fantasy'],['hero','闪电英雄面具','fantasy'],
  ['butterfly','彩蝶舞会面具','fantasy'],['fairy','森林精灵面具','fantasy'],['mermaid','珊瑚人鱼面具','fantasy'],['unicorn','极光独角兽面具','fantasy'],
  ['phoenix','金羽凤凰面具','fantasy'],['sun','太阳守护者面具','fantasy'],['moon','月光旅人面具','fantasy'],['ice','冰晶骑士面具','fantasy'],
  ['lava','火山小勇士面具','fantasy'],['carnival','彩铃小丑面具','fantasy'],['opera','戏曲小花脸面具','fantasy'],['diver','深海潜水面具','fantasy']
];
export const MASKS = designs.map(([key,name,theme])=>({
  id:'mask-'+key,name,category:'masks',anchor:'face',aspect:5/6,
  mask:{key,theme,eyeY:104/240,eyeSpan:64/200},keywords:theme==='animal'?'动物 变脸 面罩':'奇幻 角色 变脸 面罩'
}));
const ink='#514655', cream='#fff3d8';
function shape(c,d,fill,stroke=ink,width=2.5){const p=new Path2D(d);if(fill){c.fillStyle=fill;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke(p);}}
function oval(c,x,y,rx,ry,fill,stroke=null,width=2.5,angle=0){c.beginPath();c.ellipse(x,y,rx,ry,angle,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(c,d,color=ink,width=3){shape(c,d,null,color,width);}
function star(c,x,y,r,color,points=5){c.beginPath();for(let i=0;i<points*2;i++){const a=i*Math.PI/points-Math.PI/2,rr=i%2?r*.43:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fillStyle=color;c.fill();}
function body(c,a,b=a,d='M100 49 C145 45 175 72 174 119 C174 175 144 218 100 223 C56 218 26 175 26 119 C25 72 55 45 100 49Z'){
  const g=c.createLinearGradient(0,50,0,225);g.addColorStop(0,a);g.addColorStop(1,b);shape(c,d,g);
}
function pair(c,fn){for(const side of [-1,1]){c.save();if(side===1){c.translate(200,0);c.scale(-1,1);}fn();c.restore();}}
function ears(c,kind,color,inside='#edb4b8'){
  pair(c,()=>{
    if(kind==='round'){oval(c,34,62,29,33,color,ink);oval(c,34,62,17,20,inside);}
    if(kind==='point'){shape(c,'M31 87 L17 13 Q57 18 77 61Z',color);shape(c,'M37 61 L29 31 L60 60Z',inside,null);}
    if(kind==='long'){shape(c,'M53 75 C18 47 27 1 43 4 C61 1 78 48 77 70Z',color);oval(c,48,36,10,27,inside,null,0,-.18);}
    if(kind==='flop'){shape(c,'M53 64 C2 35 -1 93 14 144 Q25 174 43 147 L63 78Z',color);line(c,'M30 66 Q10 102 27 141',inside,9);}
  });
}
function muzzle(c,color=cream,nose=ink){oval(c,80,155,29,24,color);oval(c,120,155,29,24,color);shape(c,'M88 139 Q100 133 112 139 Q114 146 100 154 Q86 146 88 139Z',nose,null);line(c,'M100 153 L100 169 M81 173 Q91 181 100 169 Q109 181 119 173',ink,2.5);}
function whiskers(c){pair(c,()=>{line(c,'M30 144 L64 151 M27 160 L63 160 M33 177 L65 168',ink,2);});}
function jewel(c,x,y,r,color){shape(c,`M${x} ${y-r} L${x+r*.7} ${y} L${x} ${y+r} L${x-r*.7} ${y}Z`,color,ink,1.5);line(c,`M${x} ${y-r*.7} L${x-r*.3} ${y}`,cream,2);}
function holes(c){
  // Erase only the cached mask image, never the camera image beneath it.
  c.save();c.globalCompositeOperation='destination-out';
  for(const x of [68,132])oval(c,x,104,23,15,'#000');
  c.restore();for(const x of [68,132])oval(c,x,104,24,16,null,cream,2.5);
}

export function drawMask(c,def){
  const k=def.mask.key;c.lineJoin='round';c.lineCap='round';
  if(def.mask.theme==='animal'){
    const colors={cat:['#f6d8aa','#e7b680'],fox:['#eeaa69','#d47a56'],panda:['#fff8eb','#e6e5dc'],tiger:['#f5bf64','#e99847'],rabbit:['#fff4e5','#f0d4dd'],bear:['#cda276','#aa7654'],husky:['#8c9caf','#63788e'],raccoon:['#a7acb4','#838795'],koala:['#bec5d0','#9ba7b8'],lion:['#f6d38a','#e9ad60'],deer:['#d5aa7a','#c18c5c'],owl:['#bea6d2','#8e78ae'],frog:['#b9d884','#82b78a'],penguin:['#59667f','#34465f'],dalmatian:['#fff9ec','#e5e7e7'],dragon:['#8cd3b1','#4b9e97']};
    const [a,b]=colors[k];
    if(['cat','fox','tiger','husky','raccoon'].includes(k))ears(c,'point',a);
    if(['panda','bear','koala'].includes(k))ears(c,'round',k==='panda'?ink:a,k==='panda'?'#9d99a7':'#eabac0');
    if(k==='rabbit')ears(c,'long',a);
    if(k==='dalmatian')ears(c,'flop',ink,'#a9a2ac');
    if(k==='lion'){for(let i=0;i<16;i++){const t=i*Math.PI/8;c.save();c.translate(100,126);c.rotate(t);oval(c,0,-85,24,28,i%2?'#d3924c':'#e6ad57',ink,2);c.restore();}}
    if(k==='deer'){pair(c,()=>{line(c,'M59 65 L44 32 L48 6 M44 32 L24 22 L20 9 M44 32 L64 19', '#85654e',7);shape(c,'M51 87 Q1 78 11 47 Q49 46 68 69Z',a);});}
    if(k==='owl')pair(c,()=>shape(c,'M33 88 L20 25 L68 52 L92 47 L78 90Z',b));
    if(k==='frog')pair(c,()=>oval(c,53,58,31,34,a,ink));
    if(k==='dragon'){pair(c,()=>{shape(c,'M57 71 Q13 45 33 5 Q36 35 76 49Z','#f4db9a');shape(c,'M27 85 L6 67 L11 102 L1 120 L26 150Z','#e9c779');});}
    body(c,a,b);
    if(k==='cat'){shape(c,'M76 56 L86 85 L99 62 L111 86 L124 56Z','#c49979',null);muzzle(c);whiskers(c);}
    if(k==='fox'){pair(c,()=>shape(c,'M29 121 L87 141 L100 211 Q40 197 29 121Z',cream,null));muzzle(c);line(c,'M47 83 L71 89 M129 89 L153 83',ink,4);}
    if(k==='panda'){oval(c,65,106,34,39,ink,null,0,-.24);oval(c,135,106,34,39,ink,null,0,.24);muzzle(c);oval(c,44,151,12,7,'#eab4bb');oval(c,156,151,12,7,'#eab4bb');}
    if(k==='tiger'){pair(c,()=>{for(let i=0;i<3;i++)shape(c,`M28 ${124+i*23} L67 ${135+i*16} L32 ${139+i*22}Z`,ink,null);});line(c,'M100 56 L100 83 M83 65 L117 65 M86 78 L114 78',ink,6);muzzle(c);whiskers(c);}
    if(k==='rabbit'){oval(c,48,148,18,13,'#edb9c7');oval(c,152,148,18,13,'#edb9c7');muzzle(c,cream,'#dc9ea9');shape(c,'M86 173 L113 173 L112 193 L88 193Z','#fffdf3',ink,1.5);line(c,'M100 175 L100 192',ink,1.5);}
    if(k==='bear'){oval(c,100,164,42,37,'#ebc9a0');muzzle(c,'#ebc9a0');line(c,'M51 79 Q65 74 78 79 M122 79 Q135 74 149 79',ink,3);}
    if(k==='husky'){shape(c,'M31 80 L76 96 L100 62 L125 96 L169 80 L157 158 Q132 207 100 216 Q68 207 43 158Z','#edf3ed',null);muzzle(c);line(c,'M47 79 L74 89 M126 89 L153 79',ink,5);}
    if(k==='raccoon'){shape(c,'M29 77 Q65 78 100 93 Q135 78 171 77 L167 132 Q131 144 100 123 Q69 144 33 132Z',ink,null);oval(c,100,171,46,35,'#e6ded0');muzzle(c,'#e6ded0');}
    if(k==='koala'){oval(c,100,139,19,31,'#615d70',ink);oval(c,45,145,14,9,'#edbcc6');oval(c,155,145,14,9,'#edbcc6');line(c,'M85 184 Q100 194 115 184',ink,3);pair(c,()=>{line(c,'M29 72 L41 62 M28 60 L43 53','#edf0e9',3);});}
    if(k==='lion'){oval(c,100,159,48,40,'#fff0bf');muzzle(c,'#fff0bf');whiskers(c);line(c,'M83 191 Q100 202 117 191','#c48b50',4);}
    if(k==='deer'){oval(c,100,166,35,39,cream);muzzle(c,cream);pair(c,()=>{[[34,110],[41,138],[55,153],[52,66]].forEach(([x,y])=>oval(c,x,y,4,5,cream));});}
    if(k==='owl'){oval(c,66,108,39,48,'#eaded8');oval(c,134,108,39,48,'#eaded8');shape(c,'M86 135 L114 135 L100 164Z','#edc46e');for(let row=0;row<3;row++)for(let col=0;col<3;col++)line(c,`M${66+col*25} ${172+row*12} l9 7 l9 -7`,'#ddc7e3',2);}
    if(k==='frog'){oval(c,100,168,54,35,'#dceaa6');line(c,'M53 159 Q100 199 147 159',ink,3);oval(c,41,143,14,8,'#e4b39e');oval(c,159,143,14,8,'#e4b39e');star(c,100,65,12,'#f7e6a5');}
    if(k==='penguin'){shape(c,'M100 86 C47 49 25 136 55 184 Q100 233 145 184 C175 136 153 49 100 86Z',cream,null);shape(c,'M84 142 L116 142 L100 165Z','#f1b46d');line(c,'M47 202 Q100 220 153 202','#dd8b90',16);line(c,'M126 211 L142 231','#dd8b90',15);}
    if(k==='dalmatian'){oval(c,62,104,35,43,ink,null,0,-.2);[[143,64,13,10],[155,148,12,17],[60,192,9,12],[120,197,8,9]].forEach(args=>oval(c,...args,ink));muzzle(c);line(c,'M100 174 Q107 199 114 177','#e4a4ad',9);}
    if(k==='dragon'){for(let i=0;i<3;i++)jewel(c,100,61+i*14,10,'#e9d68f');oval(c,100,165,46,31,'#bcdfaf');oval(c,81,156,5,4,ink);oval(c,119,156,5,4,ink);line(c,'M71 181 Q100 194 129 181',ink,3);pair(c,()=>{shape(c,'M44 152 L55 168 L34 176Z','#d6e9b4',null);});}
  }else{
    if(k==='robot'){
      line(c,'M100 53 L100 22','#839baa',7);oval(c,100,16,10,10,'#edb877',ink);pair(c,()=>shape(c,'M16 85 L34 85 L34 146 L16 146Z','#98b6c4'));
      body(c,'#d8e5e5','#95b7c5','M46 52 L154 52 Q174 52 174 76 L174 174 L150 215 L50 215 L26 174 L26 76 Q26 52 46 52Z');
      shape(c,'M39 84 L161 84 L161 127 L39 127Z','#657f9b');line(c,'M74 171 L126 171 M74 183 L126 183',ink,4);jewel(c,100,68,10,'#f1cc85');pair(c,()=>oval(c,42,151,6,6,'#e4b18b',ink,1));
    }else if(['astronaut','diver'].includes(k)){
      oval(c,100,127,91,107,k==='diver'?'#d4b47a':'#e6e8e5',ink,3);oval(c,100,125,73,88,k==='diver'?'#86bdbd':'#829dc2',ink,3);
      pair(c,()=>{shape(c,'M5 100 L24 100 L24 153 L5 153Z',k==='diver'?'#a4875d':'#9ea9be');});
      if(k==='astronaut'){line(c,'M42 180 L59 207 L141 207 L158 180',cream,12);star(c,100,47,10,'#e9c379');line(c,'M148 68 Q163 85 162 104','#eaf8ff',5);}
      else{for(let i=0;i<8;i++){const a=i*Math.PI/4;oval(c,100+Math.cos(a)*82,127+Math.sin(a)*98,4,4,'#f3e1ac',ink,1);}line(c,'M83 186 L117 186',ink,8);line(c,'M100 190 L100 231','#bfa16b',16);}
    }else if(k==='alien'){
      pair(c,()=>{line(c,'M58 64 Q21 32 44 14','#9cb8a3',5);oval(c,43,12,10,10,'#dcd196',ink);});body(c,'#c5ddae','#91bcae');
      oval(c,66,107,32,38,'#666589',ink,1,-.3);oval(c,134,107,32,38,'#666589',ink,1,.3);oval(c,100,146,5,4,'#719690');line(c,'M81 178 Q100 188 119 178',ink,3);star(c,100,69,10,'#f9e5aa');
    }else if(k==='hero'){
      body(c,'#d88c97','#b86a86','M13 59 L69 76 L100 62 L131 76 L187 59 L172 153 L133 179 L100 160 L67 179 L28 153Z');
      shape(c,'M106 67 L85 94 L99 94 L93 121 L117 88 L103 88Z','#ffdf8c',null);pair(c,()=>line(c,'M30 78 L42 135 L67 151','#f4d092',5));
    }else if(k==='butterfly'){
      pair(c,()=>{shape(c,'M100 98 C20 -7 -22 57 31 114 C-4 154 40 210 100 143Z','#baa4db');shape(c,'M91 98 Q26 43 29 90 L48 128 L89 130Z','#ecc1d7',null);oval(c,43,74,8,11,'#ffdf9c');jewel(c,49,152,17,'#91d2cd');});line(c,'M100 84 L100 159',ink,5);jewel(c,100,75,13,'#ffe6b2');
    }else if(k==='fairy'){
      pair(c,()=>shape(c,'M43 96 L3 47 Q-3 124 42 154Z','#bad1a4'));body(c,'#d9e6b7','#95b997');
      pair(c,()=>{shape(c,'M46 85 Q27 20 90 42 Q83 70 46 85Z','#7aa28a');line(c,'M49 74 L77 48','#e0dda0',2);shape(c,'M27 137 Q56 143 61 181 Q34 175 27 137Z','#6c9b86',null);});jewel(c,100,64,16,'#ead39b');line(c,'M84 183 Q100 191 116 183','#729482',3);
    }else if(k==='mermaid'){
      body(c,'#b8ded8','#99b2d7');pair(c,()=>{shape(c,'M33 109 L3 76 L12 147 L33 170Z','#caafd7');for(let i=0;i<3;i++)line(c,`M13 ${103+i*13} L29 ${121+i*12}`,cream,2);});
      for(let i=0;i<7;i++){const a=(i-3)*.25;c.save();c.translate(100,74);c.rotate(a);oval(c,0,-30,9,27,['#ead0db','#bba6ce','#efd8c3'][i%3],ink,1.2);c.restore();}jewel(c,100,80,12,'#9bd7da');
      for(let row=0;row<3;row++)for(let col=0;col<5;col++){const x=54+col*23+(row%2?5:0),y=153+row*15;line(c,`M${x} ${y} q9 13 18 0`,'#e6e5e8',2);}oval(c,100,198,9,3,'#a475a9');
    }else if(k==='unicorn'){
      ears(c,'point','#f5ebed','#d0b7d9');shape(c,'M83 59 L100 2 L117 59Z','#ffe0a1');line(c,'M90 34 L111 42 M95 19 L106 24','#c6a2ce',3);body(c,'#faedef','#d1c4e4');
      pair(c,()=>{shape(c,'M32 112 Q15 157 52 197 L66 171Z','#a7d6d8',null);star(c,44,146,10,'#f2c97e');});jewel(c,100,71,14,'#b6a0d4');oval(c,100,174,33,24,'#f6dce4');oval(c,88,173,4,3,'#b392b3');oval(c,112,173,4,3,'#b392b3');
    }else if(k==='phoenix'){
      pair(c,()=>{for(let i=0;i<4;i++)shape(c,`M77 95 Q${3+i*7} ${40+i*16} ${19+i*10} ${4+i*5} Q${71+i*6} 33 94 86Z`,i%2?'#edbb68':'#d98c65');});
      body(c,'#f2ce89','#d88865');pair(c,()=>shape(c,'M29 87 L84 94 L85 128 L36 148Z','#fbe6b2',null));shape(c,'M87 129 L113 129 L100 165Z','#e0a65d');jewel(c,100,73,13,'#bc7a80');pair(c,()=>line(c,'M47 169 L79 195','#ffe1a2',4));
    }else if(k==='sun'){
      for(let i=0;i<16;i++){c.save();c.translate(100,127);c.rotate(i*Math.PI/8);shape(c,'M-12 -81 L0 -119 L12 -81Z','#efc56b',ink,1.7);c.restore();}body(c,'#ffe7aa','#e9b976');
      pair(c,()=>{oval(c,47,148,14,10,'#eaa087');star(c,47,148,6,cream,4);});line(c,'M77 180 Q100 198 123 180','#aa795a',4);star(c,100,67,14,'#d69b61',8);
    }else if(k==='moon'){
      body(c,'#a4b3d3','#667ca8');shape(c,'M106 51 Q33 126 106 221 Q8 184 28 102 Q45 48 106 51Z','#f6e6ba',null);
      [[119,70,6],[155,139,9],[128,184,6],[72,168,5]].forEach(([x,y,r])=>star(c,x,y,r,'#ffe4ab',4));line(c,'M86 189 Q100 196 114 189','#d6d9e9',2);
    }else if(k==='ice'){
      shape(c,'M28 76 L21 30 L66 53 L101 8 L134 53 L179 30 L172 76Z','#b8dce8');body(c,'#d5edf1','#9bb8d7');
      pair(c,()=>{shape(c,'M28 118 L56 139 L43 176 L29 153Z','#dceaf0',ink,1);line(c,'M44 71 L81 89','#eefcff',5);});jewel(c,100,68,21,'#a4b9e1');jewel(c,100,181,21,'#e2f0ec');line(c,'M100 147 L100 167','#648da9',3);
    }else if(k==='lava'){
      shape(c,'M33 75 Q26 24 55 32 L78 53 L101 6 L124 53 L147 30 Q177 29 167 76Z','#e9a65c');body(c,'#98768a','#615c78');
      line(c,'M45 71 L68 85 L52 126 L75 147 L57 173 M155 71 L132 85 L148 126 L125 147 L143 173','#fac47d',5);shape(c,'M100 58 Q130 97 100 118 Q70 99 100 58Z','#edb66f');line(c,'M82 187 L100 194 L118 187','#efb887',4);
    }else if(k==='carnival'){
      shape(c,'M22 79 L18 9 L73 51 L100 4 L129 51 L182 9 L178 79Z','#beaad4');shape(c,'M73 51 L100 4 L129 51 L114 75 L86 75Z','#efbd91',null);
      [18,100,182].forEach(x=>oval(c,x,x===100?8:13,7,7,'#f7dc91',ink,1.3));body(c,'#fff0d7','#f0c6c6');
      pair(c,()=>{shape(c,'M68 69 L51 93 L85 93Z','#8eb8d4',null);shape(c,'M51 123 L85 123 L68 153Z','#bf9eca',null);});oval(c,100,143,12,12,'#db8b9a',ink,1.5);line(c,'M66 178 Q100 208 134 178','#ba7b8e',5);
    }else if(k==='opera'){
      body(c,'#fff2d9','#e3c6c3');shape(c,'M100 49 Q65 47 44 73 L82 89 L89 129 L69 164 L100 179 L131 164 L111 129 L118 89 L156 73 Q135 47 100 49Z','#d7807e');
      pair(c,()=>{line(c,'M37 84 Q55 72 84 91',ink,5);line(c,'M35 127 L64 139 L51 170',ink,4);});jewel(c,100,70,15,'#efcd83');shape(c,'M82 185 Q100 175 118 185 Q100 202 82 185Z','#ae6c7c',null);
    }
  }
  holes(c);
}
