const {_electron:electron}=require('@playwright/test');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const config=require('../package.json');
const {graphicsArgs}=require('./test-graphics.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'snapjoy-mask-preview-'));
  const env={...process.env,LUMI_TEST:'1',LUMI_TEST_DATA:dir};delete env.ELECTRON_RUN_AS_NODE;
  const app=await electron.launch({args:[root,'--use-fake-device-for-media-stream',...graphicsArgs],env});
  const out=path.join(root,'docs',config.version);await fs.mkdir(out,{recursive:true});
  try{
    const page=await app.firstWindow();await page.waitForSelector('.effect-card');
    const sheets=await page.evaluate(async()=>{
      const {MASKS}=await import('./masks.js');const {stickerImage}=await import('./stickers.js');
      const {EffectRenderer,EFFECTS,createSample}=await import('./effects.js');
      const canvas=document.createElement('canvas'),x=canvas.getContext('2d');
      const base=(w,h,title,subtitle)=>{canvas.width=w;canvas.height=h;x.fillStyle='#f5f0e9';x.fillRect(0,0,w,h);x.textAlign='left';x.fillStyle='#4d5c50';x.font='bold 31px "Microsoft YaHei"';x.fillText(title,28,48);x.font='15px "Microsoft YaHei"';x.fillStyle='#8b827c';x.fillText(subtitle,28,80);};
      base(1456,1280,'SnapJoy · 32 款原创面具','动物伙伴 × 奇幻角色  /  眼部镂空 · 自动贴脸 · 可手动微调');
      MASKS.forEach((def,i)=>{
        const px=24+i%8*177,py=108+Math.floor(i/8)*286;
        x.fillStyle='#fffcf6';x.beginPath();x.roundRect(px,py,166,274,13);x.fill();
        x.drawImage(stickerImage(def),px+8,py+14,150,180);
        x.fillStyle='#796681';x.font='bold 14px "Microsoft YaHei"';x.textAlign='center';x.fillText(def.name,px+83,py+225);
        x.fillStyle='#a09391';x.font='12px "Microsoft YaHei"';x.fillText(def.mask.theme==='animal'?'动物变装':'奇幻舞会',px+83,py+248);
      });
      const masks=canvas.toDataURL('image/png');
      base(1456,952,'SnapJoy · 24 种新增实时特效','动态氛围 × 艺术画风 × 搞怪变形  /  所有效果可调强度、拍照和录制视频');
      const renderer=new EffectRenderer(document.createElement('canvas'));renderer.upload(createSample());
      EFFECTS.filter(e=>e.id>=60).forEach((def,i)=>{
        const px=24+i%6*237,py=110+Math.floor(i/6)*207;
        renderer.draw(def.id,.9,false,222,166,2);x.drawImage(renderer.canvas,px,py);
        x.fillStyle='#5b6854';x.textAlign='center';x.font='14px "Microsoft YaHei"';x.fillText(def.name,px+111,py+189);
      });
      return {masks,effects:canvas.toDataURL('image/png')};
    });
    for(const [key,name] of [['masks','原创面具总览.png'],['effects','新增特效总览.png']])await fs.writeFile(path.join(out,name),Buffer.from(sheets[key].split(',')[1],'base64'));
    const portrait='data:image/jpeg;base64,'+(await fs.readFile(path.join(root,'tests','fixtures','portrait.jpg'))).toString('base64');
    await page.evaluate(async src=>{
      const img=new Image();img.src=src;await img.decode();
      navigator.mediaDevices.getUserMedia=async()=>{
        const c=document.createElement('canvas');c.width=1280;c.height=960;const x=c.getContext('2d');
        const draw=()=>x.drawImage(img,0,0,img.width,img.width*.75,0,0,1280,960);draw();
        const interval=setInterval(draw,100),stream=c.captureStream(10);stream.getVideoTracks()[0].addEventListener('ended',()=>clearInterval(interval));return stream;
      };
    },portrait);
    await page.locator('#startCamera').click();
    await page.waitForFunction(()=>document.querySelector('#cameraStatus').textContent==='正在取景');
    await page.locator('#aspectSelect').selectOption('4:3');
    await page.locator('[data-panel="stickers"]').click();await page.locator('[data-sticker-category="masks"]').click();
    await page.getByRole('button',{name:'添加赤狐面具',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('#faceStatus').textContent.includes('正在跟随主要人脸'),null,{timeout:65000});
    await page.evaluate(()=>{document.querySelector('#cameraStatus span').textContent='公开测试图片 · 人脸跟随演示';document.querySelector('#cameraSelect').options[0].text='MediaPipe 测试图片';});
    await page.screenshot({path:path.join(out,'面具摄影棚.png')});
    console.log('Saved mask catalog, effect catalog and face-tracking preview to '+out);
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
