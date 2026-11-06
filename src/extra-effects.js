export const EXTRA_EFFECTS = [
  {id:60,name:'薄荷夜游',en:'Mint night',category:'style',description:'薄荷色灯光与柔和的蓝紫阴影。',css:'hue-rotate(25deg) saturate(.75) contrast(1.1)'},
  {id:61,name:'蜜桃乌龙',en:'Peach tea',category:'style',description:'蜜桃高光，温暖又清透。',css:'sepia(.25) saturate(.8) brightness(1.12)'},
  {id:62,name:'童话森林',en:'Woodland',category:'style',description:'深绿阴影和明亮的金色阳光。',css:'sepia(.3) hue-rotate(25deg) saturate(1.2)'},
  {id:63,name:'海盐蓝调',en:'Sea salt',category:'style',description:'清爽的蓝白色，像海边明信片。',css:'saturate(.55) brightness(1.12) contrast(.95)'},
  {id:64,name:'糖纸闪光',en:'Candy foil',category:'art',description:'流动的虹彩光泽，像透明糖纸。'},
  {id:65,name:'彩纸飘飘',en:'Confetti',category:'art',description:'彩色小纸片轻轻飘落，录下派对时刻。'},
  {id:66,name:'雪花慢舞',en:'Snowfall',category:'art',description:'大大小小的雪花从镜头前飘过。'},
  {id:67,name:'泡泡漫游',en:'Bubbles',category:'art',description:'透明的七彩泡泡慢慢升起来。'},
  {id:68,name:'萤火虫之夜',en:'Fireflies',category:'art',description:'柔和夜色里，一点一点的金色微光。'},
  {id:69,name:'樱花飘落',en:'Petals',category:'art',description:'粉色花瓣悠悠落下，笑容留在春天。'},
  {id:70,name:'水墨丹青',en:'Ink wash',category:'art',description:'墨色轮廓与淡淡宣纸纹理。'},
  {id:71,name:'蓝晒照片',en:'Cyanotype',category:'art',description:'深蓝与奶白，变成一张蓝晒肖像。'},
  {id:72,name:'彩铅排线',en:'Color hatching',category:'art',description:'用细密交叉线条画出彩色肖像。'},
  {id:73,name:'丝网海报',en:'Screen print',category:'art',description:'珊瑚红、奶油黄和蓝绿色的印刷海报。'},
  {id:74,name:'蜂巢拼图',en:'Honeycomb',category:'art',description:'六边形小格子，拼出镜头里的你。'},
  {id:75,name:'拼豆画像',en:'Bead portrait',category:'art',description:'圆圆的彩色拼豆组成你的照片。'},
  {id:76,name:'毛线织画',en:'Knitted',category:'art',description:'把颜色织成一针一针的软毛线。'},
  {id:77,name:'霓虹线稿',en:'Neon tracing',category:'art',description:'暗色画布上，彩色线条勾勒轮廓。'},
  {id:78,name:'玻璃水球',en:'Glass orb',category:'fun',description:'画面中央浮起一颗透明放大水球。'},
  {id:79,name:'波纹隧道',en:'Ripple tunnel',category:'fun',description:'一圈一圈柔软波纹，向镜头外扩散。'},
  {id:80,name:'扇形分身',en:'Fan mirrors',category:'fun',description:'画面折成八瓣，像旋转的花朵。'},
  {id:81,name:'百叶魔镜',en:'Striped mirrors',category:'fun',description:'每一道镜片，都藏着不同方向的你。'},
  {id:82,name:'斜切拼镜',en:'Diagonal tiles',category:'fun',description:'斜着拼起来的小镜子，制造有趣分身。'},
  {id:83,name:'呼吸哈哈镜',en:'Breathing mirror',category:'fun',description:'轻轻鼓起又缩回去，像会呼吸的软糖。'}
];

export const extraTransforms = `
if(u_effect==74){
  vec2 st=uv*vec2(35.,35./u_aspect);float row=floor(st.y/.8660254);
  vec2 a=vec2(floor(st.x-mod(row,2.)*.5)+.5+mod(row,2.)*.5,(row+.5)*.8660254);
  float otherRow=row+(st.y-a.y>0.?1.:-1.);
  vec2 b=vec2(floor(st.x-mod(otherRow,2.)*.5)+.5+mod(otherRow,2.)*.5,(otherRow+.5)*.8660254);
  vec2 center=distance(st,a)<distance(st,b)?a:b;q=mix(uv,center/vec2(35.,35./u_aspect),s);
}
if(u_effect==75 || u_effect==76){vec2 grid=vec2(80.,80./u_aspect);q=mix(uv,(floor(uv*grid)+.5)/grid,s);}
if(u_effect==78){float inside=1.-smoothstep(.61,.69,r);q=mix(uv,.5+(uv-.5)*(.61+.23*r*r),inside*s);}
if(u_effect==79){q+=p/max(r,.001)/vec2(u_aspect,1.)*sin(r*42.-u_time*1.5)*.025*s*(1.-smoothstep(.2,1.5,r));}
if(u_effect==80){float a=atan(p.y,p.x)+.15;float sector=.78539816;a=abs(mod(a,sector)-sector*.5);vec2 kp=vec2(cos(a),sin(a))*r;q=mix(uv,kp/vec2(2.*u_aspect,2.)+.5,s);}
if(u_effect==81){float band=floor(uv.y*7.);vec2 tile=vec2(mod(band,2.)<1.?uv.x:1.-uv.x,fract(uv.y*7.)*.7+.15);q=mix(uv,tile,s);}
if(u_effect==82){vec2 st=vec2(uv.x+uv.y*.45,uv.y-uv.x*.2);vec2 tile=abs(fract(st*2.8)*2.-1.);q=mix(uv,tile,s);}
if(u_effect==83){float breath=.5+.5*sin(u_time*1.7);float fall=1.-smoothstep(.0,1.1,r);q=.5+(uv-.5)*(1.-.48*s*fall*breath);}
`;

export const extraColors = `
if(u_effect==60){outColor=mix(vec3(.12,.13,.28),vec3(.7,1.,.84),pow(y,.8))*.72+c*.28;}
if(u_effect==61){outColor=pow(c,vec3(.87,.95,1.03))*vec3(1.06,.98,.93)+vec3(.025,.01,.025);}
if(u_effect==62){outColor=mix(c*vec3(.69,.94,.76)+vec3(.015,.035,.015),c*vec3(1.12,1.08,.76)+.02,smoothstep(.25,.9,y));}
if(u_effect==63){outColor=mix(vec3(y),c,.54)*vec3(.88,1.02,1.1)+vec3(.07,.07,.075);}
if(u_effect==64){float wave=sin(uv.x*10.+uv.y*7.+u_time*.5);vec3 sheen=rainbow(wave*.16+uv.y*.3);outColor=c*.88+sheen*.18*(.5+.5*sin(uv.x*22.-uv.y*16.+u_time));}
if(u_effect>=65 && u_effect<=69){
  if(u_effect==68)outColor=c*vec3(.55,.62,.8)+vec3(.025,.018,.025);
  for(int i=0;i<20;i++){
    float fi=float(i);float h=random(vec2(fi+2.,7.));float h2=random(vec2(fi+5.,19.));
    float speed=.035+h2*.055;float yy=fract(h+u_time*speed);
    vec2 center=vec2(fract(h2+.025*sin(u_time*.5+fi)),yy);
    if(u_effect==65 || u_effect==66 || u_effect==69)center.y=1.-yy;
    if(u_effect==68)center=vec2(fract(h2+.055*sin(u_time*.4+fi)),fract(h+.05*cos(u_time*.6+fi)));
    vec2 d=(uv-center)*vec2(u_aspect,1.);float rad=.008+h*.014;
    if(u_effect==65){float a=u_time*(.4+h)+fi;d=mat2(cos(a),-sin(a),sin(a),cos(a))*d;float m=(1.-smoothstep(rad*.5,rad*.7,abs(d.x)))*(1.-smoothstep(rad,rad*1.2,abs(d.y)));outColor=mix(outColor,rainbow(h)*.7+.25,m*.88);}
    if(u_effect==66){float dot=1.-smoothstep(rad*.35,rad,length(d));float cross=(1.-smoothstep(rad*.12,rad*.23,min(abs(d.x),abs(d.y))))*(1.-smoothstep(rad*.7,rad,max(abs(d.x),abs(d.y))));outColor=mix(outColor,vec3(.92,.98,1.),max(dot*.7,cross)*.75);}
    if(u_effect==67){float rr=rad*2.6;float ring=(1.-smoothstep(.001,.004,abs(length(d)-rr)));float shine=(1.-smoothstep(.0,.009,length(d-vec2(-rr*.35,rr*.7))));outColor=mix(outColor,rainbow(h+atan(d.y,d.x)*.1)*.45+.55,ring*.6);outColor+=shine*.35;}
    if(u_effect==68){float glow=exp(-dot(d,d)/(rad*rad*1.7))*(.55+.45*sin(u_time*1.4+fi));outColor+=vec3(.65,.7,.25)*glow;}
    if(u_effect==69){float a=fi+u_time*.4;d=mat2(cos(a),-sin(a),sin(a),cos(a))*d;float petal=1.-smoothstep(.75,1.,length(d/vec2(rad*.65,rad)));outColor=mix(outColor,vec3(1.,.73+h*.12,.83),petal*.82);}
  }
}
if(u_effect>=70 && u_effect<=77){
  vec2 dd=u_texel*2.;vec3 dx=sampleAt(q+vec2(dd.x,0.))-sampleAt(q-vec2(dd.x,0.));
  vec3 dy=sampleAt(q+vec2(0.,dd.y))-sampleAt(q-vec2(0.,dd.y));float edge=length(dx)+length(dy);
  if(u_effect==70){float paper=.96+(random(floor(uv*700.))-.5)*.04;float ink=pow(y,.65)*.76+.17-clamp(edge*1.2,0.,.7);outColor=vec3(ink)*vec3(1.,.98,.92)*paper;}
  if(u_effect==71){outColor=mix(vec3(.055,.16,.4),vec3(.96,.95,.85),smoothstep(.12,.92,y));outColor-=(random(floor(uv*600.))-.5)*.045;}
  if(u_effect==72){float hatch=step(.76,fract((uv.x+uv.y)*160.))*step(y,.72);float cross=step(.79,fract((uv.x-uv.y)*130.))*step(y,.38);outColor=mix(vec3(.98,.94,.85),c*.8+.1,.65);outColor*=1.-.43*max(hatch,cross);outColor-=clamp(edge,0.,.4)*.35;}
  if(u_effect==73){outColor=y<.3?vec3(.16,.35,.43):(y<.58?vec3(.87,.44,.4):vec3(.98,.87,.64));float dots=step(.9,random(floor(uv*500.)));outColor=mix(outColor,vec3(.98,.94,.85),dots*.18);}
  if(u_effect==74){vec2 d=(uv-q)*vec2(35.,35./u_aspect);float border=smoothstep(.43,.5,max(abs(d.x),abs(d.x)*.5+abs(d.y)*.866));outColor=mix(c*1.08,vec3(.96,.89,.72),border*.75);}
  if(u_effect==75){vec2 f=fract(uv*vec2(80.,80./u_aspect))-.5;float bead=1.-smoothstep(.39,.47,length(f));float hole=1.-smoothstep(.06,.12,length(f));float shine=1.-smoothstep(.01,.19,length(f-vec2(-.14,.16)));outColor=mix(vec3(.9,.87,.8),floor(c*8.+.5)/8.,bead);outColor=mix(outColor,vec3(.35,.33,.32),hole*.65);outColor+=shine*.17;}
  if(u_effect==76){vec2 f=fract(uv*vec2(80.,80./u_aspect))-.5;float stitch=1.-smoothstep(.07,.16,abs(abs(f.x)-(.35-f.y*.36)));outColor=(floor(c*10.+.5)/10.)*(.68+.32*stitch)+vec3(.045,.03,.025);}
  if(u_effect==77){outColor=c*.075+rainbow(uv.x*.35+uv.y*.55)*clamp(edge*4.,0.,1.);}
}
if(u_effect==78){float ring=1.-smoothstep(.0,.027,abs(r-.66));outColor+=vec3(.6,.8,.9)*ring*.35*s;}
`;
