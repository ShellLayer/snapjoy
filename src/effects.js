export const EFFECTS = [
  { id: 0, name: '原片', en: 'Original', category: 'style', description: '不加修饰，就很好看。', css: 'none' },
  { id: 1, name: '复古胶片', en: 'Vintage', category: 'style', description: '暖色、颗粒，像一段旧时光。', css: 'sepia(.45) saturate(.75) contrast(.92)' },
  { id: 2, name: '黑白故事', en: 'Noir', category: 'style', description: '去掉颜色，让情绪自己说话。', css: 'grayscale(1) contrast(1.25)' },
  { id: 3, name: '日落时分', en: 'Golden', category: 'style', description: '把傍晚的暖意，留在脸上。', css: 'sepia(.35) saturate(1.5)' },
  { id: 4, name: '蓝调时刻', en: 'Blue hour', category: 'style', description: '一点清冷，一点电影感。', css: 'saturate(.7) hue-rotate(25deg)' },
  { id: 5, name: '草莓奶昔', en: 'Blush', category: 'style', description: '柔软的粉色，让日常甜一点。', css: 'sepia(.2) hue-rotate(310deg) saturate(.9) brightness(1.1)' },
  { id: 6, name: '褪色日记', en: 'Faded', category: 'style', description: '低对比的温柔，慢慢显影。', css: 'saturate(.65) contrast(.8) brightness(1.15)' },
  { id: 7, name: '霓虹派对', en: 'Neon', category: 'style', description: '青与紫，属于夜晚的颜色。', css: 'hue-rotate(80deg) saturate(2)' },
  { id: 8, name: '热力感应', en: 'Thermal', category: 'style', description: '热成像风格配色，不测量温度。' },
  { id: 9, name: '铅笔速写', en: 'Sketch', category: 'art', description: '沿着光影，画一幅自己的速写。' },
  { id: 10, name: '漫画主角', en: 'Comic', category: 'art', description: '鲜明的色块，今天你是主角。' },
  { id: 11, name: '像素玩家', en: 'Pixel', category: 'art', description: '欢迎来到你的 8-bit 小世界。' },
  { id: 12, name: '鱼眼镜头', en: 'Fisheye', category: 'fun', description: '靠近一点，世界就圆一点。' },
  { id: 13, name: '哈哈镜', en: 'Stretch', category: 'fun', description: '拉宽一点，把严肃暂时放一边。' },
  { id: 14, name: '小小星球', en: 'Pinch', category: 'fun', description: '向中心收拢，变一个迷你的你。' },
  { id: 15, name: '旋转漩涡', en: 'Twirl', category: 'fun', description: '给平凡的画面，拧一点想象。' },
  { id: 16, name: '镜中双生', en: 'Twins', category: 'fun', description: '左右对称，遇见另一个自己。' },
  { id: 17, name: '万花筒', en: 'Kaleido', category: 'fun', description: '光影折叠，拼出新的图案。' },
  { id: 18, name: '彩虹糖', en: 'Rainbow', category: 'style', description: '从头到脚，穿上七彩的糖果色。', css: 'hue-rotate(130deg) saturate(1.6)' },
  { id: 19, name: '棉花糖', en: 'Marshmallow', category: 'style', description: '软软亮亮的粉蓝色，像云朵一样。', css: 'saturate(.6) contrast(.75) brightness(1.25)' },
  { id: 20, name: '薄荷汽水', en: 'Mint', category: 'style', description: '清凉的薄荷绿，咕噜咕噜冒泡。', css: 'hue-rotate(45deg) saturate(.8) brightness(1.1)' },
  { id: 21, name: '紫薯布丁', en: 'Lavender', category: 'style', description: '紫色的小梦境，温柔又神奇。', css: 'hue-rotate(260deg) saturate(.85)' },
  { id: 22, name: '橘子汽水', en: 'Orange', category: 'style', description: '明亮的橙黄，让笑容像小太阳。', css: 'sepia(.65) saturate(1.7) brightness(1.05)' },
  { id: 23, name: '海底世界', en: 'Underwater', category: 'style', description: '蓝蓝的水纹，假装做一条小鱼。', css: 'hue-rotate(155deg) saturate(1.3)' },
  { id: 24, name: '夜光精灵', en: 'Night vision', category: 'style', description: '绿色夜视镜里的探险小队。', css: 'grayscale(1) sepia(1) hue-rotate(65deg) saturate(3)' },
  { id: 25, name: '彩色底片', en: 'Negative', category: 'style', description: '把颜色翻个面，会发现什么呢？', css: 'invert(1)' },
  { id: 26, name: '彩虹轮廓', en: 'Glow lines', category: 'art', description: '像用彩色荧光笔画出你的轮廓。' },
  { id: 27, name: '水彩绘本', en: 'Watercolor', category: 'art', description: '晕开的色彩，变身绘本小主角。' },
  { id: 28, name: '蜡笔涂鸦', en: 'Crayon', category: 'art', description: '带着纸张颗粒的彩色蜡笔画。' },
  { id: 29, name: '波普四格', en: 'Pop art', category: 'art', description: '一张照片，四种大胆的配色。' },
  { id: 30, name: '漫画网点', en: 'Halftone', category: 'art', description: '细小的圆点，拼出复古漫画。' },
  { id: 31, name: '彩色浮雕', en: 'Emboss', category: 'art', description: '光影像从纸面上鼓了起来。' },
  { id: 32, name: '剪纸剧场', en: 'Paper cut', category: 'art', description: '用几块彩纸，剪出你的样子。' },
  { id: 33, name: '彩色玻璃', en: 'Glass tiles', category: 'art', description: '一块一块的小玻璃，拼出你。' },
  { id: 34, name: '小小油画家', en: 'Oil paint', category: 'art', description: '浓厚的色块，给自己画幅肖像。' },
  { id: 35, name: '复古掌机', en: 'Game time', category: 'art', description: '四种绿色，打开掌上游戏机。' },
  { id: 36, name: '水波荡漾', en: 'Ripples', category: 'fun', description: '轻轻一圈水波，像掉进小池塘。' },
  { id: 37, name: '波浪面条', en: 'Wiggle', category: 'fun', description: '左右摇摆，变成一根小面条。' },
  { id: 38, name: '弹弹软糖', en: 'Jelly', category: 'fun', description: '软糖一样上下扭一扭。' },
  { id: 39, name: '四个小伙伴', en: 'Four of me', category: 'fun', description: '四个自己，一起打个招呼。' },
  { id: 40, name: '九宫分身', en: 'Nine of me', category: 'fun', description: '九个自己，排队做表情！' },
  { id: 41, name: '湖面倒影', en: 'Reflection', category: 'fun', description: '上下对称，像在湖边照镜子。' },
  { id: 42, name: '倒立世界', en: 'Upside down', category: 'fun', description: '不用真的倒立，也能头朝下。' },
  { id: 43, name: '镜面隧道', en: 'Mirror tunnel', category: 'fun', description: '一层一层的镜子，有多少个你？' },
  { id: 44, name: '大头娃娃', en: 'Big head', category: 'fun', description: '脸放在上半部，试试大头小身体。' },
  { id: 45, name: '小头外星人', en: 'Tiny head', category: 'fun', description: '脸放在上半部，变个小脑袋。' },
  { id: 46, name: '胖胖圆圆', en: 'Squishy', category: 'fun', description: '整个画面横向鼓起来，圆圆软软。' },
  { id: 47, name: '高个子精灵', en: 'Tall elf', category: 'fun', description: '画面拉得高高的，变身小精灵。' },
  {"id": 48, "name": "蜂蜜奶油", "en": "Honey", "category": "style", "description": "暖蜂蜜高光与柔和阴影。", "css": "sepia(.3) brightness(1.15)"},
  {"id": 49, "name": "青橙电影", "en": "Cinema", "category": "style", "description": "青色阴影与橙色高光。", "css": "contrast(1.15) saturate(1.2)"},
  {"id": 50, "name": "樱花午后", "en": "Sakura", "category": "style", "description": "温柔的粉色和明亮的春日感。", "css": "saturate(.75) brightness(1.15)"},
  {"id": 51, "name": "冰蓝童话", "en": "Ice", "category": "style", "description": "冰蓝色的通透小世界。", "css": "hue-rotate(180deg) saturate(.6)"},
  {"id": 52, "name": "巧克力片", "en": "Cocoa", "category": "style", "description": "温暖巧克力色的老电影。", "css": "sepia(.8) contrast(1.12)"},
  {"id": 53, "name": "月光银盐", "en": "Silver", "category": "style", "description": "冷调的银色黑白照片。", "css": "grayscale(1) contrast(.85)"},
  {"id": 54, "name": "梦幻柔光", "en": "Dream", "category": "style", "description": "明亮的柔光和轻轻的晕影。", "css": "brightness(1.2) contrast(.75)"},
  {"id": 55, "name": "糖果双色", "en": "Duotone", "category": "art", "description": "粉色与蓝色拼成糖果海报。"},
  {"id": 56, "name": "彩色速写", "en": "Color sketch", "category": "art", "description": "用彩色线条勾勒小小艺术家。"},
  {"id": 57, "name": "铬金属", "en": "Chrome", "category": "art", "description": "银蓝金属的闪亮光泽。"},
  {"id": 58, "name": "彩虹光斑", "en": "Prism", "category": "art", "description": "让边缘散开一点彩虹光。"},
  {"id": 59, "name": "星河闪闪", "en": "Stardust", "category": "art", "description": "轻轻闪烁的星点，适合录小视频。"}
];

const vertexSource = [
  'attribute vec2 a_position;',
  'varying vec2 v_uv;',
  'void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}'
].join('\n');
const fragmentSource = [
  'precision mediump float;',
  'varying vec2 v_uv;',
  'uniform sampler2D u_image;',
  'uniform vec2 u_crop;',
  'uniform vec2 u_texel;',
  'uniform float u_mirror;',
  'uniform float u_strength;',
  'uniform int u_effect;',
  'uniform float u_time;',
  'uniform float u_aspect;',
  'vec3 sampleAt(vec2 uv){uv.x=mix(uv.x,1.-uv.x,u_mirror);return texture2D(u_image,(clamp(uv,0.,1.)-.5)*u_crop+.5).rgb;}',
  'float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}',
  'float random(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
  'vec3 rainbow(float t){return .5+.5*cos(6.28318*(t+vec3(0.,.333,.667)));}',
  'void main(){',
  'vec2 uv=v_uv; vec2 q=uv; float s=u_strength;',
  'vec2 p=(uv-.5)*2.;p.x*=u_aspect;float r=length(p);',
  'if(u_effect==11){float cells=mix(150.,32.,s);q=mix(uv,(floor(uv*vec2(cells,cells*.75))+.5)/vec2(cells,cells*.75),s);}',
  'if(u_effect==12){p*=1.-.62*s*(1.-smoothstep(0.,1.3,r));q=p/vec2(2.*u_aspect,2.)+.5;}',
  'if(u_effect==13){p.x*=1.-.66*s*exp(-3.*p.y*p.y);p.y*=1.+.16*s;q=p/vec2(2.*u_aspect,2.)+.5;}',
  'if(u_effect==14){p*=1.+1.3*s*(1.-smoothstep(0.,1.1,r));q=p/vec2(2.*u_aspect,2.)+.5;}',
  'if(u_effect==15){float a=3.6*s*pow(max(0.,1.-r/1.3),2.);p=mat2(cos(a),-sin(a),sin(a),cos(a))*p;q=p/vec2(2.*u_aspect,2.)+.5;}',
  'if(u_effect==16){q.x=mix(uv.x,abs(uv.x-.5)+.5,s);}',
  'if(u_effect==17){float a=atan(p.y,p.x);float sector=1.04719755;a=abs(mod(a,sector)-sector*.5);vec2 kp=vec2(cos(a),sin(a))*r;q=mix(uv,kp/vec2(2.*u_aspect,2.)+.5,s);}',
  'if(u_effect==23){q.x+=sin(uv.y*24.+u_time)*.008*s;}',
  'if(u_effect==29){q=mix(uv,fract(uv*2.),s);}',
  'if(u_effect==33){vec2 cells=vec2(40.,30.);q=mix(uv,(floor(uv*cells)+.5)/cells,s);}',
  'if(u_effect==35){q=mix(uv,(floor(uv*vec2(160.,120.))+.5)/vec2(160.,120.),s);}',
  'if(u_effect==36){q+=normalize(p+vec2(.0001))*sin(r*27.-u_time*1.8)*.025*s;}',
  'if(u_effect==37){q.x+=sin(uv.y*19.+u_time)*.085*s;}',
  'if(u_effect==38){q.y+=sin(uv.x*16.+u_time*1.1)*.085*s;}',
  'if(u_effect==39){q=mix(uv,fract(uv*2.),s);}',
  'if(u_effect==40){q=mix(uv,fract(uv*3.),s);}',
  'if(u_effect==41){q.y=mix(uv.y,abs(uv.y-.5)+.5,s);}',
  'if(u_effect==42){q.y=mix(uv.y,1.-uv.y,s);}',
  'if(u_effect==43){vec2 tile=abs(fract((uv-.5)*3.+.5)*2.-1.);q=mix(uv,tile,s);}',
  'if(u_effect==44 || u_effect==45){vec2 center=vec2(.5,.66);vec2 d=(uv-center)*vec2(u_aspect,1.);float fall=1.-smoothstep(0.,.43,length(d));float amt=u_effect==44?-.65:.9;q=center+(uv-center)*(1.+amt*s*fall);}',
  'if(u_effect==46){q.x=.5+(uv.x-.5)*(1.-.45*s);}',
  'if(u_effect==47){q.y=.5+(uv.y-.5)*(1.-.45*s);}',
  'vec3 c=sampleAt(q);vec3 outColor=c;float y=lum(c);',
  'if(u_effect==1){outColor=vec3(dot(c,vec3(.393,.769,.189)),dot(c,vec3(.349,.686,.168)),dot(c,vec3(.272,.534,.131)));outColor=mix(c,outColor,.55);outColor=(outColor-.5)*.9+.53;outColor+=vec3(.035,.005,-.025);outColor+=(random(uv*900.)-.5)*.065;outColor*=1.-.20*smoothstep(.25,.85,distance(uv,vec2(.5)));}',
  'if(u_effect==2){outColor=vec3(clamp((y-.5)*1.3+.5,0.,1.));}',
  'if(u_effect==3){outColor=c*vec3(1.16,1.02,.78)+vec3(.035,.012,0.);outColor=mix(vec3(lum(outColor)),outColor,1.12);}',
  'if(u_effect==4){outColor=c*vec3(.82,1.03,1.15)+vec3(.0,.015,.045);outColor=mix(vec3(lum(outColor)),outColor,.85);}',
  'if(u_effect==5){outColor=mix(c,vec3(1.,.66,.75),.17);outColor=(outColor-.5)*.88+.55;}',
  'if(u_effect==6){outColor=mix(vec3(y),c,.7)*.8+vec3(.16,.15,.12);}',
  'if(u_effect==7){outColor=mix(vec3(.05,.85,.91),vec3(.96,.13,.85),smoothstep(.18,.8,y));outColor*=.35+y;outColor=mix(outColor,c,.16);}',
  'if(u_effect==8){outColor=clamp(vec3(1.5-abs(4.*y-3.),1.5-abs(4.*y-2.),1.5-abs(4.*y-1.)),0.,1.);}',
  'if(u_effect==18){outColor=mix(c,rainbow(uv.x*.7+uv.y*.3)*(.3+y),.68);}',
  'if(u_effect==19){outColor=mix(c,vec3(.94,.82,1.),.25)*.77+.19;}',
  'if(u_effect==20){outColor=mix(c,vec3(.48,.94,.76),.24);outColor=outColor*vec3(.91,1.12,1.04)+.03;}',
  'if(u_effect==21){outColor=mix(c,vec3(.72,.48,.91),.32);outColor.b+=.08;}',
  'if(u_effect==22){outColor=c*vec3(1.3,1.07,.58)+vec3(.05,.02,0.);}',
  'if(u_effect==23){float water=sin(uv.x*31.+sin(uv.y*20.)+u_time)*.025;outColor=c*vec3(.48,1.02,1.18)+vec3(0.,.04,.09)+water;}',
  'if(u_effect==24){outColor=vec3(.12,1.,.23)*pow(y,.75);outColor*=.94+.06*sin(uv.y*600.);}',
  'if(u_effect==25){outColor=1.-c;}',
  'if(u_effect>=26 && u_effect<=34){',
  'vec2 dd=u_texel*2.;vec3 a=sampleAt(q-dd),b=sampleAt(q+dd);float edge=length(b-a);',
  'if(u_effect==26){outColor=rainbow(uv.x*.4+uv.y*.6)*clamp(edge*4.+.07,0.,1.);}',
  'if(u_effect==27){vec3 soft=(c+sampleAt(q+vec2(dd.x,0.))+sampleAt(q-vec2(dd.x,0.))+sampleAt(q+vec2(0.,dd.y))+sampleAt(q-vec2(0.,dd.y)))/5.;outColor=floor(soft*9.+.5)/9.*.83+.14;outColor-=edge*.22;}',
  'if(u_effect==28){float grain=random(floor(uv*700.));outColor=floor(c*7.)/7.;outColor+=vec3((grain-.5)*.20);outColor=mix(outColor,vec3(.97,.94,.85),.16+step(.91,grain)*.3);}',
  'if(u_effect==29){vec2 tile=floor(uv*2.);vec3 color=rainbow((tile.x+tile.y*2.)*.25);outColor=mix(color*.45,1.-color*.65,smoothstep(.25,.7,y));}',
  'if(u_effect==30){vec2 dotuv=fract(uv*vec2(100.,75.))-.5;float dotMask=smoothstep(.38,.43,length(dotuv));outColor=c*(1.-dotMask*.85);}',
  'if(u_effect==31){outColor=vec3(.5)+(b-a)*3.;outColor=mix(outColor,c,.25);}',
  'if(u_effect==32){outColor=y<.25?vec3(.16,.24,.42):(y<.48?vec3(.22,.63,.65):(y<.7?vec3(.98,.53,.40):vec3(1.,.88,.55)));}',
  'if(u_effect==33){vec2 tile=abs(fract(uv*vec2(40.,30.))-.5);float border=smoothstep(.44,.49,max(tile.x,tile.y));outColor=mix(c*1.18,vec3(.17,.19,.22),border*.8);}',
  'if(u_effect==34){vec3 paint=(c*2.+a+b)/4.;outColor=floor(paint*6.+.5)/6.;outColor=mix(vec3(lum(outColor)),outColor,1.3);outColor*=.95+.05*sin((uv.x+uv.y)*400.);}',
  '}',
  'if(u_effect==35){outColor=y<.25?vec3(.06,.22,.06):(y<.5?vec3(.19,.38,.19):(y<.75?vec3(.55,.67,.06):vec3(.70,.80,.30)));}',
  'if(u_effect==9 || u_effect==10){',
  'vec2 d=u_texel*1.5;float tl=lum(sampleAt(q+vec2(-d.x,d.y)));float tc=lum(sampleAt(q+vec2(0.,d.y)));float tr=lum(sampleAt(q+d));',
  'float ml=lum(sampleAt(q-vec2(d.x,0.)));float mr=lum(sampleAt(q+vec2(d.x,0.)));',
  'float bl=lum(sampleAt(q-d));float bc=lum(sampleAt(q-vec2(0.,d.y)));float br=lum(sampleAt(q+vec2(d.x,-d.y)));',
  'float gx=-tl-2.*ml-bl+tr+2.*mr+br;float gy=-bl-2.*bc-br+tl+2.*tc+tr;float edge=length(vec2(gx,gy));',
  'if(u_effect==9){float shade=1.-clamp(edge*2.3,0.,.95);outColor=vec3(shade)*vec3(.98,.97,.92);outColor*=.84+.16*y;}',
  'else{outColor=floor(c*5.+.5)/5.;outColor=mix(outColor,vec3(.08,.09,.10),smoothstep(.18,.5,edge));}',
  '}',
  'if((u_effect>0 && u_effect<11) || (u_effect>=18 && u_effect<=35))outColor=mix(c,outColor,s);',
  "if(u_effect==48){outColor=c*vec3(1.08,1.03,.91)+vec3(.08,.055,.02);}",
  "if(u_effect==49){outColor=mix(c*vec3(.71,1.12,1.18),c*vec3(1.21,1.03,.78),smoothstep(.1,.85,y));outColor=(outColor-.5)*1.1+.5;}",
  "if(u_effect==50){outColor=c*.85+vec3(.16,.095,.12);}",
  "if(u_effect==51){outColor=mix(vec3(y),c,.58)*vec3(.87,1.03,1.17)+.045;}",
  "if(u_effect==52){outColor=vec3(y)*vec3(1.06,.84,.69);outColor=pow(outColor,vec3(.93));}",
  "if(u_effect==53){outColor=vec3(y*.88+.08)*vec3(.96,1.,1.06);}",
  "if(u_effect==54){outColor=c*.7+.24;outColor*=1.-.12*smoothstep(.2,.8,length(uv-.5));}",
  "if(u_effect==55){outColor=mix(vec3(.33,.48,.76),vec3(1.,.73,.78),smoothstep(.08,.92,y));}",
  "if(u_effect==56){vec2 d=u_texel*2.;float e=length(sampleAt(q+d)-sampleAt(q-d));outColor=mix(vec3(.98,.95,.87),c*.7,clamp(e*5.,0.,1.));}",
  "if(u_effect==57){outColor=vec3(.58,.7,.84)*(.55+.45*cos(y*18.))+c*.2;}",
  "if(u_effect==58){float d=.012*length(uv-.5);outColor=vec3(sampleAt(q+vec2(d,0.)).r,c.g,sampleAt(q-vec2(d,0.)).b)+vec3(.03,.01,.04);}",
  "if(u_effect==59){vec2 tile=floor(uv*vec2(36.,36./u_aspect));vec2 f=fract(uv*vec2(36.,36./u_aspect))-.5;float spark=step(.95,random(tile))*max(0.,1.-length(f)*7.)*(.5+.5*sin(u_time*2.+random(tile)*30.));outColor=c*.94+vec3(.6,.45,.8)*spark;}",
  'if(u_effect>=48)outColor=mix(c,outColor,s);',
  'gl_FragColor=vec4(clamp(outColor,0.,1.),1.);',
  '}'
].join('\n');

export class EffectRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    if (!this.gl) throw new Error('此电脑无法启用实时特效，请更新显卡驱动后重试。');
    const gl = this.gl;
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program); this.program = program;
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    this.uniforms = Object.fromEntries(['u_crop','u_texel','u_mirror','u_strength','u_effect','u_time','u_aspect'].map((key) => [key, gl.getUniformLocation(program, key)]));
    const texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  }
  upload(source) {
    const gl = this.gl;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    const width = source.videoWidth || source.width;
    const height = source.videoHeight || source.height;
    this.sourceRatio = width / height;
    gl.uniform2f(this.uniforms.u_texel, 1 / width, 1 / height);
  }
  draw(effect, strength, mirror, width = this.canvas.width, height = this.canvas.height, time = 0) {
    const gl = this.gl;
    if (this.canvas.width !== width || this.canvas.height !== height) { this.canvas.width = width; this.canvas.height = height; }
    const ratio=this.sourceRatio||4/3,target=width/height;
    gl.uniform2f(this.uniforms.u_crop,ratio>target?target/ratio:1,ratio<target?ratio/target:1);
    gl.uniform1f(this.uniforms.u_aspect,target);
    gl.viewport(0, 0, width, height);
    gl.uniform1i(this.uniforms.u_effect, effect);
    gl.uniform1f(this.uniforms.u_strength, strength);
    gl.uniform1f(this.uniforms.u_mirror, mirror ? 1 : 0);
    gl.uniform1f(this.uniforms.u_time, time);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

export class BasicRenderer {
  constructor(canvas) { this.canvas = canvas; this.context = canvas.getContext('2d', { alpha: false }); }
  upload(source) { this.source = source; }
  draw(effect, strength, mirror, width = this.canvas.width, height = this.canvas.height) {
    if (!this.source) return;
    if (this.canvas.width !== width || this.canvas.height !== height) { this.canvas.width = width; this.canvas.height = height; }
    const c = this.context, source = this.source;
    const sw = source.videoWidth || source.width, sh = source.videoHeight || source.height;
    const ratio = width / height, cw = Math.min(sw, sh * ratio), ch = cw / ratio;
    c.save();
    if (mirror) { c.translate(width, 0); c.scale(-1, 1); }
    const paint = () => c.drawImage(source, (sw-cw)/2, (sh-ch)/2, cw, ch, 0, 0, width, height);
    c.filter = 'none'; paint();
    if (effect !== 0 && EFFECTS[effect].css) { c.filter = EFFECTS[effect].css; c.globalAlpha = strength; paint(); }
    c.restore();
  }
}

// A bundled illustration makes the effect picker useful before camera access.
export function createSample() {
  const canvas = document.createElement('canvas'); canvas.width = 480; canvas.height = 360;
  const c = canvas.getContext('2d');
  const gradient = c.createLinearGradient(0, 0, 480, 360);
  gradient.addColorStop(0, '#b9c8b0'); gradient.addColorStop(1, '#e4dfbb');
  c.fillStyle = gradient; c.fillRect(0, 0, 480, 360);
  c.fillStyle = '#f1e6c2'; c.beginPath(); c.roundRect(265, 38, 145, 240, [75,75,0,0]); c.fill();
  c.strokeStyle = '#c6be96'; c.lineWidth = 5; c.beginPath(); c.moveTo(338, 40); c.lineTo(338, 278); c.moveTo(265, 144); c.lineTo(410, 144); c.stroke();
  c.fillStyle = '#d8a57a'; c.fillRect(0, 286, 480, 74);
  c.fillStyle = '#bb8f69'; c.beginPath(); c.ellipse(200, 310, 98, 14, 0, 0, Math.PI*2); c.fill();
  c.strokeStyle = '#557548'; c.lineWidth = 6; c.beginPath(); c.moveTo(193, 247); c.bezierCurveTo(185, 170, 220, 150, 209, 100); c.stroke();
  c.fillStyle = '#5b7949'; c.beginPath(); c.ellipse(178, 187, 35, 12, .6, 0, Math.PI*2); c.fill(); c.beginPath(); c.ellipse(222, 163, 30, 11, -.6, 0, Math.PI*2); c.fill();
  c.fillStyle = '#bd6949';
  for (let i=0; i<8; i++) { const a=i*Math.PI/4;c.beginPath();c.ellipse(211+Math.cos(a)*31,101+Math.sin(a)*31,26,13,a,0,Math.PI*2);c.fill(); }
  c.fillStyle = '#e3b954'; c.beginPath(); c.arc(211,101,21,0,Math.PI*2);c.fill();
  c.fillStyle = '#f2ebce'; c.beginPath(); c.moveTo(157,229);c.lineTo(231,229);c.bezierCurveTo(222,259,249,291,219,307);c.lineTo(169,307);c.bezierCurveTo(140,291,167,256,157,229);c.fill();
  c.strokeStyle='#d0c8aa'; c.lineWidth=2; for(let x=173;x<224;x+=12){c.beginPath();c.moveTo(x,235);c.lineTo(x-3,300);c.stroke();}
  c.fillStyle='#dde1ca';c.beginPath();c.roundRect(304,270,55,38,6);c.fill();c.strokeStyle='#dde1ca';c.lineWidth=6;c.beginPath();c.arc(360,287,10,-Math.PI/2,Math.PI/2);c.stroke();
  return canvas;
}
