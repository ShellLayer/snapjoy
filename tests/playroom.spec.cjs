const {test,expect,_electron:electron}=require('@playwright/test');
const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const root=path.resolve(__dirname,'..');
async function launch(dataDir){
  const env={...process.env,LUMI_TEST:'1',LUMI_TEST_DATA:dataDir};delete env.ELECTRON_RUN_AS_NODE;
  const app=await electron.launch({args:[root,'--use-fake-device-for-media-stream','--use-angle=swiftshader','--enable-unsafe-swiftshader'],env,timeout:30000});
  const page=await app.firstWindow();await expect(page.locator('.effect-card')).toHaveCount(48);
  return {app,page};
}
async function temp(){return fs.mkdtemp(path.join(os.tmpdir(),'lumi-playroom-'));}
async function activate(page){await page.locator('#startCamera').click();await expect(page.locator('#cameraStatus')).toHaveText('正在取景');}

test('all 96 stickers and 12 frames render distinctly, catalog search and categories work',async()=>{
  const {app,page}=await launch(await temp());
  try{
    const results=await page.evaluate(async()=>{
      const {STICKERS,FRAMES,stickerImage,drawFrame}=await import('./stickers.js');
      const canvas=document.createElement('canvas');canvas.width=160;canvas.height=120;const c=canvas.getContext('2d');
      function hash(){const d=c.getImageData(0,0,160,120).data;let h=2166136261,alpha=0;for(let i=0;i<d.length;i++){h=Math.imul(h^d[i],16777619);if(i%4===3&&d[i]>0)alpha++;}return {hash:h>>>0,alpha};}
      const stickers=STICKERS.map(s=>{c.clearRect(0,0,160,120);c.drawImage(stickerImage(s),0,0,160,120);return {id:s.id,...hash()};});
      const frames=FRAMES.filter(f=>f.id!=='none').map(f=>{c.clearRect(0,0,160,120);drawFrame(c,f.id,160,120);return {id:f.id,...hash()};});
      return {stickers,frames};
    });
    expect(results.stickers).toHaveLength(96);
    expect(new Set(results.stickers.map(s=>s.hash)).size).toBe(96);
    expect(results.stickers.every(s=>s.alpha>100)).toBeTruthy();
    expect(results.frames).toHaveLength(12);
    expect(new Set(results.frames.map(f=>f.hash)).size).toBe(12);
    expect(results.frames.every(f=>f.alpha>100)).toBeTruthy();
    await page.locator('#catalogSearch').fill('大头');
    await expect(page.locator('.effect-card')).toHaveCount(1);
    await page.locator('[data-panel="stickers"]').click();
    await expect(page.locator('.sticker-card')).toHaveCount(96);
    await page.locator('[data-sticker-category="wear"]').click();
    await expect(page.locator('.sticker-card')).toHaveCount(24);
    await page.locator('#catalogSearch').fill('眼镜');
    await expect(page.locator('.sticker-card')).toHaveCount(3);
    await page.locator('#catalogSearch').fill('不存在的东西');
    await expect(page.locator('#noCatalogResults')).toBeVisible();
    await page.locator('[data-panel="frames"]').click();
    await expect(page.locator('.frame-card')).toHaveCount(13);
    await page.locator('[data-panel="stickers"]').click();
    await page.locator('[data-sticker-category="all"]').click();
    await page.screenshot({path:path.join(root,'test-results','stickers-catalog.png')});
  }finally{await app.close();}
});

test('stickers drag, resize, rotate, undo and compose into exact PNG; scene persists',async()=>{
  const dataDir=await temp();let {app,page}=await launch(dataDir);
  try{
    await activate(page);
    await page.locator('#timerSelect').selectOption('0');
    await page.locator('[data-panel="stickers"]').click();
    await page.getByRole('button',{name:'添加兔耳朵',exact:true}).click();
    await page.getByRole('button',{name:'添加爱心眼镜',exact:true}).click();
    await expect(page.locator('#placedCount')).toHaveText('2');
    await page.locator('#stickerSize').fill('140');await page.locator('#stickerRotation').fill('20');
    let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lumi:scene:v1')));
    expect(saved.nodes[1].scale).toBe(1.4);
    expect(saved.nodes[1].rotation).toBeCloseTo(20*Math.PI/180);
    const canvas=await page.locator('#decorationCanvas').boundingBox();
    await page.mouse.move(canvas.x+canvas.width*.5,canvas.y+canvas.height*.43);
    await page.mouse.down();await page.mouse.move(canvas.x+canvas.width*.72,canvas.y+canvas.height*.65,{steps:8});await page.mouse.up();
    await expect(page.locator('#followFace')).not.toBeChecked();
    saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lumi:scene:v1')));
    expect(saved.nodes[1].x).toBeCloseTo(.72,1);
    expect(saved.nodes[1].y).toBeCloseTo(.65,1);
    await page.locator('#duplicateSticker').click();await expect(page.locator('#placedCount')).toHaveText('3');
    await page.locator('#undoSticker').click();await expect(page.locator('#placedCount')).toHaveText('2');
    await page.locator('[data-panel="frames"]').click();
    await page.getByRole('button',{name:'彩虹乐园相框',exact:true}).click();
    // Replace the moving fake stream with one fixed canvas frame.
    await page.locator('#cameraVideo').evaluate(async video=>{
      const still=document.createElement('canvas');still.width=video.videoWidth;still.height=video.videoHeight;
      still.getContext('2d').drawImage(video,0,0);
      video.srcObject=still.captureStream(0);await video.play();
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    });
    await page.waitForTimeout(200);
    const expected=await page.evaluate(()=>{
      const preview=document.querySelector('#preview'),overlay=document.querySelector('#decorationCanvas');
      const c=document.createElement('canvas');c.width=preview.width;c.height=preview.height;
      const ctx=c.getContext('2d');ctx.drawImage(preview,0,0);ctx.drawImage(overlay,0,0);
      return c.toDataURL('image/png');
    });
    await page.locator('#shutter').click();
    await expect(page.locator('.recent-photo')).toHaveCount(1);
    const photo=(await page.evaluate(()=>window.booth.listPhotos())).photos[0];
    expect(photo.stickers).toEqual(['兔耳朵','爱心眼镜']);expect(photo.frame).toBe('彩虹乐园');
    const png=await fs.readFile(path.join(dataDir,'photos',photo.id+'.png'));
    await fs.writeFile(path.join(root,'test-results','expected-decoration.png'),Buffer.from(expected.split(',')[1],'base64'));
    await fs.writeFile(path.join(root,'test-results','saved-decoration.png'),png);
    // A boolean assertion avoids dumping megabytes of image data on failure.
    expect(png.equals(Buffer.from(expected.split(',')[1],'base64')),'saved PNG should match the frozen preview composition').toBe(true);
    await app.close();({app,page}=await launch(dataDir));
    await expect(page.locator('.recent-photo')).toHaveCount(1);
    await page.locator('[data-panel="stickers"]').click();await expect(page.locator('#placedCount')).toHaveText('2');
    await page.locator('[data-panel="frames"]').click();
    await expect(page.getByRole('button',{name:'彩虹乐园相框',exact:true})).toHaveAttribute('aria-pressed','true');
    await page.locator('#resetLook').click();
    await expect(page.locator('#placedCount')).toHaveText('0');
  }finally{await app.close();}
});

test('offline face worker loads bundled model, locates a face and mirrors landmarks',async()=>{
  const {app,page}=await launch(await temp());
  try{
    const portrait='data:image/jpeg;base64,'+(await fs.readFile(path.join(__dirname,'fixtures','portrait.jpg'))).toString('base64');
    const result=await page.evaluate(async(src)=>{
      const {estimateFace}=await import('./face-tracker.js');
      const worker=new Worker(new URL('./face-worker.js',location.href),{type:'module'});
      const messages=[];
      try{
        await new Promise((resolve,reject)=>{
          const timeout=setTimeout(()=>reject(new Error('worker init timed out')),20000);
          worker.onmessage=({data})=>{messages.push(data.type);if(data.type==='ready'){clearTimeout(timeout);resolve();}if(data.type==='error'){clearTimeout(timeout);reject(new Error(data.message));}};
          worker.onerror=e=>reject(new Error(e.message));worker.postMessage({type:'init'});
        });
        const img=new Image();img.src=src;await img.decode();
        const c=document.createElement('canvas');c.width=320;c.height=240;const ctx=c.getContext('2d');
        async function detect(mirror,time){
          ctx.save();if(mirror){ctx.translate(320,0);ctx.scale(-1,1);}ctx.drawImage(img,0,0,320,240);ctx.restore();
          const bitmap=await createImageBitmap(c);
          const data=await new Promise((resolve,reject)=>{
            const timeout=setTimeout(()=>reject(new Error('worker detect timed out')),15000);
            worker.onmessage=({data})=>{clearTimeout(timeout);if(data.type==='error')reject(new Error(data.message));else resolve(data);};
            worker.postMessage({type:'frame',bitmap,timestamp:time,generation:0},[bitmap]);
          });
          return {count:data.detections.length,face:estimateFace(data.detections,320,240)};
        }
        return {original:await detect(false,100),mirrored:await detect(true,200),messages};
      }finally{worker.terminate();}
    },portrait);
    expect(result.original.count).toBeGreaterThan(0);expect(result.mirrored.count).toBeGreaterThan(0);
    expect(result.original.face.eyeDistance).toBeGreaterThan(.02);
    expect(result.original.face.nose.x+result.mirrored.face.nose.x).toBeCloseTo(1,1);
    expect(result.original.face.nose.y).toBeCloseTo(result.mirrored.face.nose.y,1);
  }finally{await app.close();}
});

test('four-shot strips include decorations in every panel, random look and compact editor remain usable',async()=>{
  const {app,page}=await launch(await temp());
  try{
    await activate(page);
    await page.locator('[data-panel="stickers"]').click();
    await page.getByRole('button',{name:'添加小猪鼻子',exact:true}).click();
    await page.locator('#followFace').uncheck();
    await page.locator('[data-panel="frames"]').click();
    await page.getByRole('button',{name:'彩虹乐园相框',exact:true}).click();
    await page.locator('[data-mode="strip"].mode-button').click();await page.locator('#timerSelect').selectOption('0');
    await page.locator('#shutter').click();
    await expect(page.locator('.recent-photo')).toHaveCount(1,{timeout:25000});
    const check=await page.evaluate(async()=>{
      const photo=(await window.booth.listPhotos()).photos[0];
      const im=new Image();im.src=photo.url;await im.decode();
      const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);
      const width=1440,height=1080,border=Math.max(20,Math.round(width*.035));
      const edges=Array.from({length:4},(_,i)=>Array.from(ctx.getImageData(border+5,border+i*(height+border)+5,1,1).data));
      return {photo,edges};
    });
    expect(check.photo.stickers).toEqual(['小猪鼻子']);
    for(const pixel of check.edges)expect(pixel[0]).toBeGreaterThan(pixel[1]);
    await page.locator('#randomLook').click();
    expect(Number(await page.locator('#placedCount').textContent())).toBeGreaterThan(0);
    await page.locator('[data-panel="stickers"]').click();
    await page.getByRole('button',{name:'添加小皇冠',exact:true}).click();
    await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(980,720));
    const editor=await page.locator('#stickerEditor').boundingBox();
    const scroll=await page.locator('.effect-scroll').boundingBox();
    expect(editor.y+editor.height).toBeLessThan(720);expect(scroll.height).toBeGreaterThan(70);
    await page.screenshot({path:path.join(root,'test-results','playroom-compact.png')});
  }finally{await app.close();}
});
