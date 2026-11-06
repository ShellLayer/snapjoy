const {_electron:electron}=require('@playwright/test');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..');
const config=require('../package.json');
(async()=>{
  const userData=await fs.mkdtemp(path.join(os.tmpdir(),'lumi-preview-'));
  const env={...process.env,LUMI_TEST:'1',LUMI_TEST_DATA:userData};delete env.ELECTRON_RUN_AS_NODE;
  const app=await electron.launch({args:[root,'--use-fake-device-for-media-stream','--use-angle=swiftshader','--enable-unsafe-swiftshader'],env});
  try{
    const page=await app.firstWindow();await page.waitForSelector('.effect-card');
    await page.locator('[data-panel="stickers"]').click();
    await fs.mkdir(path.join(root,'docs',config.version),{recursive:true});
    await page.screenshot({path:path.join(root,'docs',config.version,'贴纸选择.png')});
    const src='data:image/jpeg;base64,'+(await fs.readFile(path.join(root,'tests','fixtures','portrait.jpg'))).toString('base64');
    await page.evaluate(async src=>{
      const img=new Image();img.src=src;await img.decode();
      navigator.mediaDevices.getUserMedia=async()=>{
        const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=960;const c=canvas.getContext('2d');
        const cw=img.width,ch=Math.min(img.height,cw*.75);
        const paint=()=>{c.fillStyle='#e7dfd0';c.fillRect(0,0,1280,960);c.drawImage(img,0,0,cw,ch,192,144,896,672);};
        paint();setInterval(paint,100);return canvas.captureStream(10);
      };
    },src);
    await page.locator('#startCamera').click();
    await page.waitForFunction(()=>document.querySelector('#cameraStatus').textContent.includes('正在取景'));
    await page.getByRole('button',{name:'添加兔耳朵',exact:true}).click();
    await page.getByRole('button',{name:'添加爱心眼镜',exact:true}).click();
    await page.locator('[data-panel="frames"]').click();
    await page.getByRole('button',{name:'彩虹乐园相框',exact:true}).click();
    await page.locator('[data-panel="stickers"]').click();
    await page.waitForFunction(()=>document.querySelector('#faceStatus').textContent.includes('正在跟随主要人脸'),{timeout:20000});
    await page.locator('#decorationCanvas').click({position:{x:8,y:100}});
    await page.evaluate(()=>{
      document.querySelector('#cameraStatus span').textContent='本地测试图片演示';
      document.querySelector('#cameraSelect').options[0].text='MediaPipe 公开测试图片';
    });
    await page.screenshot({path:path.join(root,'docs',config.version,'跟随贴纸演示.png')});
    await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(980,720));
    await page.getByRole('button',{name:'添加小皇冠',exact:true}).click();
    await page.screenshot({path:path.join(root,'docs',config.version,'小窗口贴纸编辑.png')});
    console.log('Saved catalog, live tracking, and compact layout previews.');
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
