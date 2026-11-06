const {test,expect,_electron:electron}=require('@playwright/test');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..');
const {graphicsArgs}=require('../tools/test-graphics.cjs');
async function launch(dir){
  const env={...process.env,LUMI_TEST:'1',LUMI_TEST_DATA:dir};delete env.ELECTRON_RUN_AS_NODE;
  const app=await electron.launch({args:[root,'--use-fake-device-for-media-stream',...graphicsArgs],env,timeout:process.env.CI?90000:30000});
  try{const page=await app.firstWindow();await expect(page.locator('.effect-card')).toHaveCount(84,{timeout:process.env.CI?60000:15000});return {app,page};}
  catch(error){await app.close();throw error;}
}

test('mask cutouts align to both eyes across crops and tilt; new effects animate and return to original at zero strength',async()=>{
  const {app,page}=await launch(await fs.mkdtemp(path.join(os.tmpdir(),'snapjoy-masks-')));
  try{
    const result=await page.evaluate(async()=>{
      const {MASKS}=await import('./masks.js');
      const {stickerImage,facePlacement,DecorationScene}=await import('./stickers.js');
      let maxError=0;const eyes=[];
      for(const def of MASKS){
        const image=stickerImage(def),c=image.getContext('2d');
        eyes.push(...[68,132].map(x=>c.getImageData(Math.round(x/200*image.width),Math.round(104/240*image.height),1,1).data[3]));
        for(const aspect of [16/9,4/3,1,3/4,9/16])for(const angle of [-.6,0,.6]){
          const face={x:.3,y:.2,width:.3,height:.4,eyes:{x:.46,y:.39},eyeDistance:.12,rotation:angle};
          const p=facePlacement(def,face,'face',aspect);
          for(const [x,sign] of [[68,-1],[132,1]]){
            const dx=(x/200-.5)*p.width,dy=(104/240-.5)*p.width/def.aspect;
            const actual={x:p.x+dx*Math.cos(angle)-dy*Math.sin(angle),y:p.y+(dx*Math.sin(angle)+dy*Math.cos(angle))*aspect};
            const target={x:face.eyes.x+sign*face.eyeDistance/2*Math.cos(angle),y:face.eyes.y+sign*face.eyeDistance/2*Math.sin(angle)*aspect};
            maxError=Math.max(maxError,Math.hypot(actual.x-target.x,actual.y-target.y));
          }
        }
      }
      const scene=new DecorationScene();scene.add('mask-cat');for(let i=0;i<19;i++)scene.add('blush');
      const fullCapacityReplace=!!scene.add('mask-fox')&&scene.nodes.length===20;
      scene.undo();const undoRestored=scene.nodes[0].stickerId==='mask-cat'&&scene.nodes.length===20;
      const {EffectRenderer,createSample,EFFECTS}=await import('./effects.js');
      const renderer=new EffectRenderer(document.createElement('canvas'));renderer.upload(createSample());
      const pixels=(id,strength,time)=>{renderer.draw(id,strength,false,120,90,time);const p=new Uint8Array(120*90*4);renderer.gl.readPixels(0,0,120,90,renderer.gl.RGBA,renderer.gl.UNSIGNED_BYTE,p);return p;};
      const original=pixels(0,1,0),neutral=EFFECTS.filter(e=>e.id>=60).every(e=>pixels(e.id,0,1.7).every((v,i)=>v===original[i]));
      const animated=[64,65,66,67,68,69,79,83].map(id=>{const a=pixels(id,1,0),b=pixels(id,1,1.7);return {id,changed:b.some((v,i)=>v!==a[i])};});
      return {count:MASKS.length,eyes,maxError,fullCapacityReplace,undoRestored,neutral,animated,error:renderer.gl.getError()};
    });
    expect(result.count).toBe(32);expect(result.eyes.every(alpha=>alpha===0)).toBe(true);
    expect(result.maxError).toBeLessThan(1e-10);expect(result.fullCapacityReplace).toBe(true);expect(result.undoRestored).toBe(true);
    expect(result.neutral).toBe(true);expect(result.animated.every(e=>e.changed)).toBe(true);expect(result.error).toBe(0);
  }finally{await app.close();}
});

test('mask picker replaces only the mask, supports undo, and saves an exact composed photo with persistent settings',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'snapjoy-mask-photo-'));
  let {app,page}=await launch(dir);
  try{
    await page.locator('[data-panel="stickers"]').click();
    await page.getByRole('button',{name:'添加兔耳朵',exact:true}).click();
    await page.locator('[data-sticker-category="masks"]').click();
    await expect(page.locator('.sticker-card')).toHaveCount(32);await expect(page.locator('#maskHint')).toBeVisible();
    await page.locator('#catalogSearch').fill('奇幻');await expect(page.locator('.sticker-card')).toHaveCount(16);await page.locator('#catalogSearch').clear();
    await page.getByRole('button',{name:'添加奶油猫咪面具',exact:true}).click();await expect(page.locator('#followFace')).toBeChecked();
    await page.getByRole('button',{name:'添加赤狐面具',exact:true}).click();await expect(page.locator('#placedCount')).toHaveText('2');
    const ids=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lumi:scene:v1')).nodes.map(n=>n.stickerId));
    expect(await ids()).toEqual(['bunny','mask-fox']);
    await page.locator('#undoSticker').click();expect(await ids()).toEqual(['bunny','mask-cat']);
    await page.getByRole('button',{name:'添加奶油猫咪面具',exact:true}).click();await page.locator('#followFace').uncheck();
    await page.locator('#stickerSize').fill('42');await page.locator('#stickerRotation').fill('12');
    await expect(page.locator('#lookSelect option')).toHaveCount(41);
    await page.locator('#startCamera').click();await expect(page.locator('#cameraStatus')).toHaveText('正在取景');
    await page.locator('#sizeSelect').selectOption('640');await page.locator('#aspectSelect').selectOption('4:3');await page.locator('#timerSelect').selectOption('0');
    await page.locator('#cameraVideo').evaluate(async video=>{
      const still=document.createElement('canvas');still.width=video.videoWidth;still.height=video.videoHeight;still.getContext('2d').drawImage(video,0,0);
      const previous=video.srcObject;video.srcObject=still.captureStream(0);previous.getTracks().forEach(t=>t.stop());await video.play();
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    });
    const expected=await page.evaluate(async()=>{
      const {DecorationScene}=await import('./stickers.js');const scene=new DecorationScene();scene.restore(JSON.parse(localStorage.getItem('lumi:scene:v1')));scene.aspect=4/3;
      const preview=document.querySelector('#preview'),c=document.createElement('canvas');c.width=preview.width;c.height=preview.height;
      const overlay=document.createElement('canvas');overlay.width=c.width;overlay.height=c.height;
      scene.draw(overlay.getContext('2d'),c.width,c.height);
      const x=c.getContext('2d');x.drawImage(preview,0,0);x.drawImage(overlay,0,0);return c.toDataURL('image/png');
    });
    await page.locator('#shutter').click();await expect(page.locator('.recent-photo')).toHaveCount(1);
    const photo=(await page.evaluate(()=>window.booth.listPhotos())).photos[0];
    expect(photo.stickers).toEqual(['兔耳朵','奶油猫咪面具']);
    const actual=await fs.readFile(path.join(dir,'photos',photo.id+'.png'));
    expect(actual.equals(Buffer.from(expected.split(',')[1],'base64')),'photo should preserve mask transparency, rotation and composition').toBe(true);
    await app.close();({app,page}=await launch(dir));expect(await ids()).toEqual(['bunny','mask-cat']);
    const node=await page.evaluate(()=>JSON.parse(localStorage.getItem('lumi:scene:v1')).nodes[1]);expect(node.follow).toBe(false);expect(node.width).toBe(.42);expect(node.rotation).toBeCloseTo(12*Math.PI/180);
  }finally{await app.close();}
});
