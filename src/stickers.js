import { FACE_PROPS, drawFaceProp } from './face-props.js';
const wearable = [
  ['bunny','兔耳朵','head'],['cat','猫耳朵','head'],['puppy','垂耳小狗','head'],['bear','小熊耳朵','head'],
  ['antlers','小鹿角','head'],['dragon','小龙角','head'],['unicorn','独角兽头饰','head'],['crown','小皇冠','head'],
  ['partyhat','生日尖帽','head'],['frog','青蛙头箍','head'],['bee','蜜蜂触角','head'],['bow','大蝴蝶结','head'],
  ['sunglasses','酷酷墨镜','eyes'],['hearts','爱心眼镜','eyes'],['stars','星星眼镜','eyes'],['rainbowglasses','彩虹眼镜','eyes'],
  ['googly','搞怪大眼睛','eyes'],['pirate','海盗眼罩','eyes'],['pig','小猪鼻子','nose'],['clown','小丑红鼻子','nose'],
  ['whiskers','猫咪胡须','nose'],['mustache','卷卷小胡子','mouth'],['blush','爱心腮红','cheeks'],['astronaut','太空头盔','face']
].map(([id,name,anchor])=>({id,name,category:'wear',anchor,aspect:1.25}));
const emojiGroups = {
  animals: [['小猫','🐱'],['小狗','🐶'],['小兔','🐰'],['小熊','🐻'],['熊猫','🐼'],['狐狸','🦊'],['青蛙','🐸'],['小猪','🐷'],['小鸡','🐥'],['企鹅','🐧'],['独角兽','🦄'],['恐龙','🦕']],
  nature: [['蝴蝶','🦋'],['蜜蜂','🐝'],['小蜗牛','🐌'],['小瓢虫','🐞'],['小鲸鱼','🐳'],['小海豚','🐬'],['章鱼','🐙'],['小鱼','🐠'],['向日葵','🌻'],['樱花','🌸'],['四叶草','🍀'],['蘑菇','🍄']],
  magic: [['彩虹','🌈'],['太阳','☀️'],['小月亮','🌙'],['云朵','☁️'],['闪亮星星','🌟'],['闪光','✨'],['雪花','❄️'],['水滴','💧'],['爱心','💖'],['彩色爱心','💕'],['小火苗','🔥'],['魔法棒','🪄']],
  food: [['草莓','🍓'],['西瓜','🍉'],['樱桃','🍒'],['菠萝','🍍'],['牛油果','🥑'],['甜甜圈','🍩'],['冰激凌','🍦'],['棒棒糖','🍭'],['小蛋糕','🧁'],['生日蛋糕','🎂'],['爆米花','🍿'],['糖果','🍬']],
  toys: [['火箭','🚀'],['飞碟','🛸'],['飞机','✈️'],['小汽车','🚗'],['小火车','🚂'],['直升机','🚁'],['机器人','🤖'],['泰迪熊','🧸'],['足球','⚽'],['篮球','🏀'],['游戏手柄','🎮'],['调色盘','🎨']],
  party: [['气球','🎈'],['彩纸礼炮','🎉'],['礼物盒','🎁'],['缎带','🎀'],['奖杯','🏆'],['小奖牌','🏅'],['音符','🎵'],['小铃铛','🔔'],['圣诞树','🎄'],['雪人','⛄'],['南瓜灯','🎃'],['笑哈哈','😆']]
};
const legacyStickers = [...Object.entries(emojiGroups).flatMap(([category, items]) =>
  items.map(([name,emoji],index)=>({id:category+'-'+index,name,emoji,category,aspect:1}))
)];
export const STICKERS = [...wearable, ...FACE_PROPS];
export const ANCHORS = [['default','素材推荐'],['head','头顶'],['forehead','额头'],['eyes','双眼'],['leftEye','画面左眼'],['rightEye','画面右眼'],['nose','鼻子'],['mouth','嘴部'],['cheeks','双颊'],['leftCheek','画面左脸颊'],['rightCheek','画面右脸颊'],['chin','下巴'],['face','整张脸'],['neck','脖子']];
export const STICKER_CATEGORIES = [['all','全部'],['wear','经典'],['animals','动物'],['hats','帽子'],['eyewear','眼镜'],['paint','面饰'],['magic','魔法'],['accessories','配饰']];
export const FRAMES = [
  {id:'none',name:'不加相框',colors:['#eeeade']},
  {id:'instant',name:'拍立得',colors:['#fff9e8']},
  {id:'rainbow',name:'彩虹乐园',colors:['#ff8a9a','#ffd369','#9fe4bf','#91c9ff','#c8b3ee']},
  {id:'stars',name:'星星梦境',colors:['#a79cdb','#e2d6fa']},
  {id:'birthday',name:'生日快乐',colors:['#ffd7a4','#ff9da4','#a9decf']},
  {id:'candy',name:'糖果屋',colors:['#f8adc8','#fff4db']},
  {id:'jungle',name:'森林探险',colors:['#93bf87','#f3df9a']},
  {id:'ocean',name:'海底派对',colors:['#79cce1','#b0eae3']},
  {id:'space',name:'太空旅行',colors:['#383d70','#8e91cf']},
  {id:'garden',name:'花花世界',colors:['#f2c4cc','#dde5ac']},
  {id:'comic',name:'漫画封面',colors:['#f9cf55','#f27c70']},
  {id:'arcade',name:'像素冒险',colors:['#353e55','#82d5ad']},
  {id:'winter',name:'冬日童话',colors:['#b5d9e8','#fff7ef']}
];
const extraFrames = [['film','电影胶卷','#444252','#eed4a1'],['bubbles','泡泡时光','#9ed3e4','#e5c3e0'],['hearts','心动派对','#e8adbe','#fff1dc'],['botanical','植物标本','#94b99d','#f1e3ba'],['butterflies','蝴蝶花园','#c6b3d8','#eecab5'],['sports','运动日','#81bab4','#f0d488'],['neon','霓虹舞台','#483c68','#d799ce'],['chalk','粉笔小黑板','#45635c','#c3d7b3'],['cherry','樱桃甜心','#e8a29c','#f5dec2'],['clouds','云端日记','#acc9e1','#f9ebdb'],['scrapbook','手帐拼贴','#d5bb91','#e3d5b6'],['festival','星灯庆典','#b7a5d1','#f4d29b']];
FRAMES.push(...extraFrames.map(([id,name,a,b])=>({id,name,colors:[a,b],vector:true})));
const byId = new Map([...legacyStickers,...STICKERS].map(s=>[s.id,s]));
export const stickerById = id => byId.get(id);
const cache = new Map();
function path(c,d,fill,stroke='#654c55',width=4) {
  const p=new Path2D(d);
  if(fill){c.fillStyle=fill;c.fill(p);}
  if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke(p);}
}
function ellipse(c,x,y,rx,ry,fill,stroke) {
  c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);
  if(fill){c.fillStyle=fill;c.fill();}
  if(stroke){c.strokeStyle=stroke;c.lineWidth=4;c.stroke();}
}
function star(c,x,y,r,fill,stroke,points=5) {
  c.beginPath();for(let i=0;i<points*2;i++){const a=-Math.PI/2+i*Math.PI/points,rr=i%2?r*.45:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();
  c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=4;c.stroke();}
}
function heart(c,x,y,size,fill,stroke) {
  c.save();c.translate(x,y);c.scale(size/50,size/50);
  path(c,'M0 20 C-8 10 -28 -4 -24 -18 C-20 -33 -4 -30 0 -18 C8 -36 28 -30 26 -14 C25 0 10 12 0 20Z',fill,stroke,3);
  c.restore();
}
function drawWear(c,id) {
  c.lineJoin='round';c.lineCap='round';
  switch(id){
    case 'bunny':
      path(c,'M42 147 C15 116 16 10 43 10 C72 10 73 106 72 142Z','#fff6eb');
      path(c,'M128 142 C122 99 131 8 159 10 C188 16 181 117 158 148Z','#fff6eb');
      ellipse(c,45,76,12,48,'#f2b1c4');ellipse(c,154,77,12,47,'#f2b1c4');
      path(c,'M40 143 Q100 114 162 143',null,'#d8b9bb',8);break;
    case 'cat':
      path(c,'M18 143 L12 18 Q55 20 83 97 L119 97 Q146 21 187 17 L183 143 Q99 115 18 143Z','#f2c5a1');
      path(c,'M30 101 L29 41 L65 102Z','#ed9cac',null);path(c,'M137 102 L171 40 L169 104Z','#ed9cac',null);
      path(c,'M72 130 L82 111 M99 127 L99 107 M126 130 L118 110',null,'#b88361',5);break;
    case 'puppy':
      path(c,'M71 49 Q30 6 16 36 Q-3 100 24 145 Q47 169 59 120 L74 77Z','#b8794c');
      path(c,'M129 49 Q170 6 184 36 Q204 100 176 145 Q153 169 141 120 L126 77Z','#b8794c');
      path(c,'M62 55 Q100 36 138 55',null,'#e8c59b',15);break;
    case 'bear':
      ellipse(c,46,65,36,43,'#bf8b64','#654c55');ellipse(c,154,65,36,43,'#bf8b64','#654c55');
      ellipse(c,46,67,21,26,'#edc4a4');ellipse(c,154,67,21,26,'#edc4a4');
      path(c,'M26 145 Q100 88 174 145',null,'#bf8b64',24);break;
    case 'antlers':
      path(c,'M61 143 L51 74 L28 50 L26 16 M51 74 L64 39 L61 9 M139 143 L149 74 L173 50 L174 16 M149 74 L136 39 L139 9',null,'#754f39',14);
      path(c,'M26 39 L10 30 M63 34 L79 21 M174 39 L190 30 M138 34 L123 21',null,'#754f39',10);
      ellipse(c,48,136,20,12,'#c99764');ellipse(c,152,136,20,12,'#c99764');break;
    case 'dragon':
      path(c,'M17 139 Q10 76 56 12 Q37 81 83 134Z','#b7e18b','#507e57');
      path(c,'M118 134 Q164 81 145 12 Q191 76 184 139Z','#b7e18b','#507e57');
      path(c,'M82 140 L99 98 L117 140Z','#f6cb78','#507e57');
      path(c,'M25 106 L56 95 M143 95 L175 106',null,'#81af6b',5);break;
    case 'unicorn':
      path(c,'M75 128 L102 6 L128 128Z','#ffe4a0','#ac7b9c');
      path(c,'M84 92 L118 107 M90 64 L113 77 M97 35 L107 45',null,'#ce9dcc',5);
      path(c,'M23 145 L18 77 L66 128Z','#fff0f4','#ac7b9c');path(c,'M135 128 L183 77 L176 145Z','#fff0f4','#ac7b9c');
      for(let i=0;i<5;i++)ellipse(c,52+i*24,137,16,15,['#f4a4bb','#b6b0e8','#a8ded2','#f8d587','#f1b1ce'][i]);break;
    case 'crown':
      path(c,'M24 132 L14 42 L63 76 L100 16 L138 76 L186 42 L176 132Z','#ffdc6e','#b68739');
      path(c,'M24 121 L176 121 L176 146 L24 146Z','#efb950','#b68739');
      ellipse(c,100,87,10,16,'#ed7292');ellipse(c,49,103,6,8,'#74cbbb');ellipse(c,151,103,6,8,'#91ade8');
      [14,100,186].forEach((x,i)=>ellipse(c,x,i===1?16:42,7,7,'#fff1b9','#b68739'));break;
    case 'partyhat':
      path(c,'M33 143 L100 14 L169 143Z','#97d6d6','#648f9b');
      path(c,'M58 98 L134 71 L145 95 L46 122Z','#ffe18e',null);
      ellipse(c,100,15,12,12,'#ef9bb8');ellipse(c,89,67,7,7,'#e58dad');ellipse(c,120,122,9,9,'#e58dad');
      path(c,'M28 145 Q102 151 173 145',null,'#f4adbf',12);break;
    case 'frog':
      path(c,'M20 143 Q19 76 99 72 Q180 76 180 143Z','#9ad28e','#598455');
      ellipse(c,54,71,31,33,'#9ad28e','#598455');ellipse(c,146,71,31,33,'#9ad28e','#598455');
      ellipse(c,54,69,18,22,'#fff8e9');ellipse(c,146,69,18,22,'#fff8e9');
      ellipse(c,57,72,8,11,'#35483e');ellipse(c,143,72,8,11,'#35483e');
      path(c,'M81 122 Q101 139 121 122',null,'#598455',4);break;
    case 'bee':
      path(c,'M67 140 Q32 74 47 36 M133 140 Q168 74 153 36',null,'#5e5361',7);
      ellipse(c,47,31,21,22,'#ffdb6f','#5e5361');ellipse(c,153,31,21,22,'#ffdb6f','#5e5361');
      path(c,'M42 145 Q100 120 158 145',null,'#ffdb6f',18);
      path(c,'M77 133 L82 142 M117 133 L112 142',null,'#5e5361',7);break;
    case 'bow':
      path(c,'M95 75 Q19 4 16 45 L17 121 Q24 154 95 94 M105 75 Q181 4 184 45 L183 121 Q176 154 105 94Z','#f3a4bb','#a76381');
      path(c,'M78 94 L49 152 L89 139 L100 104 L112 139 L151 152 L122 94Z','#ee91ad','#a76381');
      ellipse(c,100,85,20,23,'#fac9d5','#a76381');break;
    case 'sunglasses': case 'hearts': case 'stars': case 'rainbowglasses':
      path(c,'M14 66 L5 57 M186 66 L195 57 M86 76 Q100 64 114 76',null,'#6a5679',6);
      if(id==='hearts'){heart(c,53,82,70,'#eea0bf','#a85c85');heart(c,147,82,70,'#eea0bf','#a85c85');}
      else if(id==='stars'){star(c,53,79,43,'#ffd96f','#b58340');star(c,147,79,43,'#ffd96f','#b58340');}
      else {
        const g=c.createLinearGradient(20,60,180,100);['#f997b2','#ffe089','#a2dfca','#98b8ee'].forEach((color,i)=>g.addColorStop(i/3,color));
        const fill=id==='sunglasses'?'#405269':g;
        path(c,'M16 56 Q53 45 87 56 L82 96 Q52 120 23 96Z',fill,id==='sunglasses'?'#353e50':'#9274ac',6);
        path(c,'M113 56 Q147 45 184 56 L177 96 Q148 120 118 96Z',fill,id==='sunglasses'?'#353e50':'#9274ac',6);
      }
      path(c,'M33 66 L47 62 M130 66 L144 62',null,'#ffffffb0',5);break;
    case 'googly':
      ellipse(c,52,83,44,48,'#fffdf2','#8a798d');ellipse(c,148,83,44,48,'#fffdf2','#8a798d');
      ellipse(c,65,95,18,23,'#35455c');ellipse(c,135,73,18,23,'#35455c');
      ellipse(c,69,89,5,7,'white');ellipse(c,139,67,5,7,'white');break;
    case 'pirate':
      path(c,'M8 50 L191 110',null,'#67515f',9);
      path(c,'M109 55 Q146 41 181 65 L175 108 Q146 135 112 105Z','#414457','#292b3b');
      star(c,146,84,18,'#fbe3a0');break;
    case 'pig':
      ellipse(c,100,85,68,49,'#f6b5bd','#b9788e');
      ellipse(c,73,88,13,21,'#c37d92');ellipse(c,127,88,13,21,'#c37d92');
      path(c,'M62 56 Q91 42 116 49',null,'#ffe0de',6);break;
    case 'clown':
      ellipse(c,100,84,56,56,'#ef7077','#bb565e');ellipse(c,81,65,16,12,'#ffd0c8');break;
    case 'whiskers':
      path(c,'M84 65 Q100 58 116 65 L100 83Z','#f39aaa','#93617b');
      path(c,'M100 83 L100 96 M77 100 Q90 112 100 96 Q111 112 124 100 M66 85 L13 72 M65 99 L8 102 M69 114 L20 134 M134 85 L187 72 M135 99 L192 102 M131 114 L180 134',null,'#756474',4);break;
    case 'mustache':
      path(c,'M100 83 Q78 55 57 78 Q26 105 10 65 Q4 120 57 121 Q86 122 100 103 Q114 122 143 121 Q196 120 190 65 Q174 105 143 78 Q122 55 100 83Z','#665060','#483d4c');break;
    case 'blush':
      ellipse(c,36,92,30,21,'#f5a4b29c');ellipse(c,164,92,30,21,'#f5a4b29c');
      heart(c,36,90,37,'#ee7c9e',null);heart(c,164,90,37,'#ee7c9e',null);break;
    case 'astronaut':
      path(c,'M26 116 C-7 61 32 4 100 4 C168 4 207 61 174 116',null,'#d8e8f0',15);
      path(c,'M23 107 L31 144 Q100 165 169 144 L177 107',null,'#b4cadb',15);
      path(c,'M41 41 Q65 18 98 20',null,'#ffffffb0',7);
      path(c,'M13 64 L27 64 L27 103 L13 103Z','#efb3a1','#91a7bc');path(c,'M173 64 L187 64 L187 103 L173 103Z','#efb3a1','#91a7bc');break;
  }
}
export function stickerImage(def) {
  if(cache.has(def.id))return cache.get(def.id);
  const canvas=document.createElement('canvas');canvas.width=480;canvas.height=Math.round(480/def.aspect);
  const c=canvas.getContext('2d');
  if(def.emoji){
    c.textAlign='center';c.textBaseline='middle';c.font='390px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';c.fillText(def.emoji,240,258);
  }else{c.scale(canvas.width/200,canvas.height/160);if(def.design)drawFaceProp(c,def);else drawWear(c,def.id);}
  cache.set(def.id,canvas);return canvas;
}
export function drawSticker(c,def,x,y,width,rotation=0) {
  const asset=stickerImage(def),height=width/def.aspect;
  c.save();c.translate(x,y);c.rotate(rotation);c.drawImage(asset,-width/2,-height/2,width,height);c.restore();
}

const frameCache=new Map();
export function drawFrame(c,frameId,width,height) {
  if(frameId==='none')return;
  const key=frameId+':'+width+'x'+height;
  let frame=frameCache.get(key);
  if(!frame){
    frame=document.createElement('canvas');frame.width=width;frame.height=height;
    const x=frame.getContext('2d'),f=FRAMES.find(f=>f.id===frameId);
    if(!f)return;
    const unit=width/800,border=22*unit;
    x.fillStyle=f.colors[0];
    x.fillRect(0,0,width,border);x.fillRect(0,height-border,width,border);x.fillRect(0,0,border,height);x.fillRect(width-border,0,border,height);
    const stamp=(emoji,px,py,size=40,angle=0)=>{x.save();x.translate(px*width,py*height);x.rotate(angle);x.font=size*unit+'px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(emoji,0,0);x.restore();};
    if(f.vector){
      const col=f.colors[1],u=Math.min(width,height)/600;
      const mark=(id,px,py,size=70,angle=0)=>drawSticker(x,stickerById(id),px*width,py*height,size*u,angle);
      x.strokeStyle=col;x.lineWidth=4*u;x.strokeRect(10*u,10*u,width-20*u,height-20*u);
      if(frameId==='film'){for(let y=10*u;y<height;y+=32*u){x.fillStyle=col;x.fillRect(6*u,y,12*u,18*u);x.fillRect(width-18*u,y,12*u,18*u);}}
      if(frameId==='bubbles'){for(let i=0;i<16;i++)ellipse(x,(i%2?.95:.05)*width,(.06+i*.057)*height,(8+i%3*7)*u,(8+i%3*7)*u,null,col);}
      if(frameId==='hearts'){for(let i=0;i<10;i++)heart(x,(i+.5)*width/10,(i%2?.96:.04)*height,22*u,col,null);}
      if(frameId==='botanical'){[.06,.94].forEach(px=>[.1,.9].forEach(py=>mark('prop-magic-leafcrown',px,py,110,px<.5?-.5:.5)));}
      if(frameId==='butterflies'){[.08,.92].forEach(px=>[.12,.88].forEach(py=>mark('prop-paint-butterfly',px,py,115,px<.5?-.35:.35)));}
      if(frameId==='sports'){for(let i=0;i<12;i++){x.strokeStyle=col;x.lineWidth=5*u;x.beginPath();x.arc((i+.5)*width/12,(i%2?.96:.04)*height,12*u,0,Math.PI*2);x.stroke();}mark('prop-accessories-headphone',.09,.88,100);}
      if(frameId==='neon'){for(let i=0;i<3;i++){x.strokeStyle=['#b9a0ef','#f0a3cc','#8ecfd4'][i];x.lineWidth=3*u;x.strokeRect((6+i*7)*u,(6+i*7)*u,width-(12+i*14)*u,height-(12+i*14)*u);}mark('prop-eyewear-visor',.88,.09,105);}
      if(frameId==='chalk'){x.setLineDash([8*u,6*u]);x.strokeStyle='#e7edd2';x.strokeRect(17*u,17*u,width-34*u,height-34*u);x.setLineDash([]);mark('prop-paint-stars',.1,.12,130);mark('prop-hats-graduate',.9,.89,110);}
      if(frameId==='cherry'){for(let i=0;i<8;i++){let px=(i+.5)*width/8,py=(i%2?.95:.05)*height;ellipse(x,px-6*u,py,8*u,8*u,'#ce7b82');ellipse(x,px+9*u,py+4*u,8*u,8*u,'#da9298');path(x,`M${px-6*u} ${py-6*u} Q${px} ${py-27*u} ${px+9*u} ${py-4*u}`,null,'#799878',2*u);}}
      if(frameId==='clouds'){[.08,.92].forEach(px=>[.09,.91].forEach(py=>mark('prop-eyewear-cloud',px,py,105)));}
      if(frameId==='scrapbook'){for(let i=0;i<4;i++){x.save();x.translate((i%2?.94:.06)*width,(i<2?.055:.945)*height);x.rotate(i%2?-.5:.5);x.fillStyle=col;x.fillRect(-38*u,-10*u,76*u,20*u);x.restore();}mark('prop-paint-rose',.9,.87,100);}
      if(frameId==='festival'){for(let i=0;i<14;i++){const px=(i+.5)*width/14;path(x,`M${px} 0 L${px} ${(22+i%3*13)*u}`,null,col,2*u);star(x,px,(28+i%3*13)*u,9*u,col);}mark('prop-magic-moon',.1,.89,110);}
    }else if(frameId==='instant'){
      x.fillRect(0,height-68*unit,width,68*unit);x.fillStyle='#988e7c';x.textAlign='center';x.font=14*unit+'px Georgia';x.fillText('LITTLE MOMENTS, BIG SMILES',width/2,height-26*unit);
    }else if(frameId==='rainbow'){
      f.colors.forEach((color,i)=>{x.strokeStyle=color;x.lineWidth=5*unit;x.strokeRect((i*5+2)*unit,(i*5+2)*unit,width-(i*10+4)*unit,height-(i*10+4)*unit);});
      stamp('☁️',.08,.10,70);stamp('🌈',.87,.11,85);stamp('🌟',.92,.87,55);stamp('💖',.09,.89,55);
    }else if(frameId==='stars'){
      for(let i=0;i<18;i++){const px=(i+.5)/18;star(x,px*width,(i%2?.96:.045)*height,(10+i%3*4)*unit,i%2?'#ffe9a7':'#fff9e8',null);}
      stamp('🌙',.09,.15,65);stamp('🌟',.9,.85,65);
    }else if(frameId==='birthday'){
      const colors=['#f098b1','#b6d6f1','#a8d9bf','#f6d078'];
      for(let i=0;i<12;i++){x.fillStyle=colors[i%4];x.beginPath();x.moveTo(i*width/12,0);x.lineTo((i+1)*width/12,0);x.lineTo((i+.5)*width/12,52*unit);x.fill();}
      stamp('🎈',.06,.76,80);stamp('🎁',.9,.88,65);stamp('🎂',.5,.94,60);
    }else if(frameId==='candy'){
      x.strokeStyle='#fff4db';x.lineWidth=12*unit;
      for(let i=0;i<width;i+=32*unit){x.beginPath();x.moveTo(i,0);x.lineTo(i+15*unit,border);x.moveTo(i,height-border);x.lineTo(i+15*unit,height);x.stroke();}
      stamp('🍭',.08,.14,75,-.3);stamp('🍩',.91,.87,70);stamp('🍬',.08,.9,60);
    }else if(frameId==='jungle'){
      stamp('🌿',.07,.10,85,-.3);stamp('🌿',.93,.10,85,.3);stamp('🦋',.9,.24,50);stamp('🦕',.09,.88,70);stamp('🍄',.91,.9,65);
    }else if(frameId==='ocean'){
      for(let i=0;i<8;i++){x.strokeStyle='#d4fbff';x.lineWidth=2*unit;ellipse(x,(i%2?.04:.96)*width,(.2+i*.09)*height,(8+i%3*3)*unit,(8+i%3*3)*unit,null,'#d4fbff');}
      stamp('🐠',.09,.88,60);stamp('🐙',.9,.88,70);stamp('🐬',.9,.12,70);
    }else if(frameId==='space'){
      for(let i=0;i<20;i++)star(x,(i+.5)/20*width,(i%2?.97:.03)*height,(4+i%3*2)*unit,'#fff4ae');
      stamp('🚀',.09,.15,75,-.3);stamp('🪐',.89,.12,75);stamp('🛸',.88,.88,80);stamp('🌟',.1,.87,45);
    }else if(frameId==='garden'){
      for(let i=0;i<8;i++)stamp(i%2?'🌸':'🌼',(i+.5)/8,i%2?.96:.04,38);
      stamp('🌻',.07,.84,70);stamp('🦋',.91,.19,55);stamp('🌷',.92,.87,60);
    }else if(frameId==='comic'){
      x.strokeStyle='#433f55';x.lineWidth=5*unit;x.strokeRect(border/2,border/2,width-border,height-border);
      const bubble=(px,py,text)=>{x.fillStyle='#fff9ed';x.strokeStyle='#433f55';x.lineWidth=3*unit;x.beginPath();x.ellipse(px*width,py*height,55*unit,25*unit,-.12,0,Math.PI*2);x.fill();x.stroke();x.fillStyle='#e57666';x.font='bold '+22*unit+'px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(text,px*width,py*height);};
      bubble(.12,.09,'WOW!');bubble(.87,.91,'YAY!');
    }else if(frameId==='arcade'){
      x.fillStyle='#82d5ad';for(let i=0;i<width;i+=24*unit){x.fillRect(i,4*unit,12*unit,12*unit);x.fillRect(i,height-16*unit,12*unit,12*unit);}
      stamp('👾',.08,.12,60);stamp('🎮',.91,.89,65);
    }else if(frameId==='winter'){
      for(let i=0;i<10;i++)stamp('❄️',(i+.5)/10,i%2?.97:.035,28);
      stamp('⛄',.1,.87,75);stamp('🎄',.91,.86,85);
    }
    frameCache.set(key,frame);
    if(frameCache.size>36)frameCache.delete(frameCache.keys().next().value);
  }
  c.drawImage(frame,0,0,width,height);
}

export function facePlacement(def,face,anchor=def.anchor,aspect=4/3) {
  const w=face.width,h=face.height,eyes=face.eyes,angle=face.rotation;
  let x=face.x+w/2,y=face.y+h/2,width=w*1.2;
  if(anchor==='head'){x=eyes.x;y=eyes.y-h*.63;width=w*1.4;}
  if(anchor==='forehead'){x=eyes.x;y=eyes.y-h*.3;width=w*.65;}
  if(anchor==='eyes'){x=eyes.x;y=eyes.y;width=face.eyeDistance*2.75;}
  if(anchor==='leftEye'||anchor==='rightEye'){const sign=anchor==='leftEye'?-1:1;x=eyes.x+sign*face.eyeDistance/2*Math.cos(angle);y=eyes.y+sign*face.eyeDistance/2*Math.sin(angle)*aspect;width=w*.5;}
  if(anchor==='nose'){x=face.nose.x;y=face.nose.y;width=w*(def.id==='whiskers'?1.25:.52);}
  if(anchor==='mouth'){x=face.mouth.x;y=(face.mouth.y+face.nose.y)/2;width=w*.75;}
  if(anchor==='cheeks'){x=eyes.x;y=face.nose.y;width=w*1.2;}
  if(anchor==='leftCheek'||anchor==='rightCheek'){x=face.nose.x+(anchor==='leftCheek'?-1:1)*w*.34;y=face.nose.y+h*.09;width=w*.45;}
  if(anchor==='chin'){x=face.mouth.x;y=face.mouth.y+h*.33;width=w*.95;}
  if(anchor==='neck'){x=face.mouth.x;y=face.y+h*1.22;width=w*1.2;}
  if(anchor==='face'){width=w*1.5;y=eyes.y+h*.25;}
  return {x,y,width:width*(def.anchorScale||1),rotation:angle};
}

export class DecorationScene {
  constructor(onChange=()=>{}) {
    this.aspect=4/3;this.nodes=[];this.frame='none';this.selected=null;this.face=null;this.history=[];this.onChange=onChange;
  }
  snapshot(){return {nodes:this.nodes.map(n=>({...n})),frame:this.frame};}
  remember(){this.history.push(this.snapshot());if(this.history.length>30)this.history.shift();}
  changed(){this.onChange();}
  restore(data){
    this.nodes=(Array.isArray(data?.nodes)?data.nodes:[]).filter(n=>n&&byId.has(n.stickerId)).slice(0,20).map(n=>({
      uid:crypto.randomUUID(),stickerId:n.stickerId,x:clamp(n.x,.0,1,.5),y:clamp(n.y,0,1,.4),
      width:clamp(n.width,.07,.95,.3),rotation:clamp(n.rotation,-Math.PI,Math.PI,0),
      follow:!!n.follow,scale:clamp(n.scale,.35,2.5,1),
      anchor:ANCHORS.some(a=>a[0]===n.anchor)?n.anchor:'default',offsetX:clamp(n.offsetX,-1,1,0),offsetY:clamp(n.offsetY,-1,1,0)
    }));
    this.frame=FRAMES.some(f=>f.id===data?.frame)?data.frame:'none';this.selected=null;
  }
  add(id) {
    if(this.nodes.length>=20)return null;
    const def=byId.get(id);if(!def)return null;
    this.remember();
    const offset=(this.nodes.filter(n=>!n.follow).length%5)*.055;
    const node={uid:crypto.randomUUID(),stickerId:id,x:def.anchor ? .5 : .5+offset,y:def.anchor==='head' ? .23 : def.anchor==='eyes' ? .43 : .56-offset,width:def.anchor ? .35 : .23,rotation:0,follow:!!def.anchor,scale:1,anchor:'default',offsetX:0,offsetY:0};
    this.nodes.push(node);this.selected=node.uid;this.changed();return node;
  }
  get current(){return this.nodes.find(n=>n.uid===this.selected);}
  placement(node){
    const def=byId.get(node.stickerId);
    if(node.follow&&this.face){const p=facePlacement(def,this.face,node.anchor==='default'||!node.anchor?def.anchor:node.anchor,this.aspect),w=this.face.width,ox=node.offsetX||0,oy=node.offsetY||0,a=p.rotation;return {...p,x:p.x+w*(ox*Math.cos(a)-oy*Math.sin(a)),y:p.y+w*this.aspect*(ox*Math.sin(a)+oy*Math.cos(a)),width:p.width*node.scale,rotation:p.rotation+node.rotation};}
    return {x:node.x,y:node.y,width:node.width*(node.follow?node.scale:1),rotation:node.rotation};
  }
  update(values,remember=true){const n=this.current;if(!n)return;if(remember)this.remember();Object.assign(n,values);this.changed();}
  remove(){if(!this.current)return;this.remember();this.nodes=this.nodes.filter(n=>n.uid!==this.selected);this.selected=null;this.changed();}
  clear(){this.remember();this.nodes=[];this.selected=null;this.changed();}
  undo(){const previous=this.history.pop();if(!previous)return;this.nodes=previous.nodes;this.frame=previous.frame;this.selected=null;this.changed();}
  duplicate(){const n=this.current;if(!n||this.nodes.length>=20)return;this.remember();const p=this.placement(n);const copy={...n,uid:crypto.randomUUID(),follow:false,x:Math.min(.93,p.x+.06),y:Math.min(.93,p.y+.06),width:p.width,rotation:p.rotation};this.nodes.push(copy);this.selected=copy.uid;this.changed();}
  bringToFront(){const selected=this.current;if(!selected)return;this.remember();this.nodes=this.nodes.filter(n=>n!==selected);this.nodes.push(selected);this.changed();}
  setFrame(id){if(!FRAMES.some(f=>f.id===id))return;this.remember();this.frame=id;this.changed();}
  hit(x,y) {
    for(const node of [...this.nodes].reverse()){
      const p=this.placement(node),def=byId.get(node.stickerId);
      const dx=x-p.x,dy=(y-p.y)/this.aspect;
      const xx=dx*Math.cos(p.rotation)+dy*Math.sin(p.rotation),yy=-dx*Math.sin(p.rotation)+dy*Math.cos(p.rotation);
      if(Math.abs(xx)<=p.width/2&&Math.abs(yy)<=p.width/def.aspect/2)return node;
    }return null;
  }
  draw(c,width,height,guides=false) {
    for(const node of this.nodes){
      const def=byId.get(node.stickerId),p=this.placement(node);
      drawSticker(c,def,p.x*width,p.y*height,p.width*width,p.rotation);
      if(guides&&node.uid===this.selected){
        c.save();c.translate(p.x*width,p.y*height);c.rotate(p.rotation);
        const w=p.width*width,h=w/def.aspect;
        c.strokeStyle='#fff';c.lineWidth=Math.max(2,width/650);c.setLineDash([width/100,width/180]);c.shadowColor='#34443e';c.shadowBlur=3;
        c.strokeRect(-w/2-4,-h/2-4,w+8,h+8);c.restore();
      }
    }
    drawFrame(c,this.frame,width,height);
  }
}
function clamp(value,min,max,fallback){return Number.isFinite(value)?Math.min(max,Math.max(min,value)):fallback;}
