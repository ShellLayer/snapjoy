const {test,expect,_electron:electron}=require('@playwright/test');
const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const {graphicsArgs}=require('../tools/test-graphics.cjs');
const root=path.resolve(__dirname,'..');
async function launch(width=1280,height=720){
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'snapjoy-studio-'));
  const env={...process.env,LUMI_TEST:'1',LUMI_TEST_DATA:dir};delete env.ELECTRON_RUN_AS_NODE;
  const app=await electron.launch({args:[root,'--use-fake-device-for-media-stream',...graphicsArgs],env});
  const page=await app.firstWindow();await expect(page.locator('.effect-card')).toHaveCount(60);
  await page.evaluate(({width,height})=>{
    const get=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia=async options=>{
      const stream=await get(options.video?{...options,video:{...options.video,width:{exact:width},height:{exact:height},frameRate:{ideal:15,max:15}}}:options);
      if(options.audio)window.testAudioTracks=stream.getAudioTracks();
      return stream;
    };
  },{width,height});
  return {app,page,dir};
}
async function close(app){await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().forEach(w=>w.destroy())).catch(()=>{});await app.close();}
async function recordedSeconds(page,seconds){await expect.poll(async()=>{const t=(await page.locator('#recordingTime').textContent()).split(':').map(Number);return t[0]*60+t[1];}).toBeGreaterThanOrEqual(seconds);}
async function activate(page){await page.locator('#startCamera').click();await expect(page.locator('#cameraStatus')).toHaveText('正在取景');}

test('five aspect ratios save their actual dimensions without stretching; focus view expands preview',async()=>{
  const {app,page,dir}=await launch();
  try{
    await activate(page);await page.locator('#timerSelect').selectOption('0');
    await page.locator('#sizeSelect').selectOption('640');
    const cases=[['16:9',640,360],['4:3',640,480],['1:1',640,640],['3:4',480,640],['9:16',360,640]];
    for(let i=0;i<cases.length;i++){
      const [aspect,w,h]=cases[i];await page.locator('#aspectSelect').selectOption(aspect);
      await page.locator('#shutter').click();await expect(page.locator('.recent-photo')).toHaveCount(i+1);
      const photo=(await page.evaluate(()=>window.booth.listPhotos())).photos[0];
      expect([photo.width,photo.height]).toEqual([w,h]);
      const png=await fs.readFile(path.join(dir,'photos',photo.id+'.png'));
      expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([w,h]);
      const rect=await page.locator('#decorationCanvas').boundingBox();expect(rect.width/rect.height).toBeCloseTo(w/h,1);
    }
    await page.locator('#aspectSelect').selectOption('16:9');
    await page.locator('#sizeSelect').selectOption('1920');
    await expect(page.locator('#resolutionLabel')).toContainText('1280 × 720');
    const normal=await page.locator('#viewfinder').boundingBox();
    await page.locator('#focusButton').click();await expect(page.locator('.effects-panel')).toBeHidden();
    const big=await page.locator('#viewfinder').boundingBox();expect(big.width).toBeGreaterThan(normal.width+200);expect(big.height).toBeGreaterThan(normal.height);
    await page.screenshot({path:path.join(root,'test-results','large-viewfinder.png')});
    await page.keyboard.press('Escape');await expect(page.locator('.effects-panel')).toBeVisible();
    // Each renderer must use the same crop. Test an asymmetric image at all ratios.
    const errors=await page.evaluate(async()=>{
      const {EffectRenderer,BasicRenderer}=await import('./effects.js');
      const source=document.createElement('canvas');source.width=800;source.height=600;
      const x=source.getContext('2d');x.fillStyle='#db9977';x.fillRect(0,0,400,600);x.fillStyle='#85c3d5';x.fillRect(400,0,400,600);
      x.fillStyle='#a6ca89';x.fillRect(310,120,55,70);
      return [[320,180],[240,180],[180,180],[180,240],[180,320]].map(([w,h])=>{
        const a=new EffectRenderer(document.createElement('canvas')),b=new BasicRenderer(document.createElement('canvas'));
        a.upload(source);b.upload(source);a.draw(0,1,false,w,h);b.draw(0,1,false,w,h);
        const out=document.createElement('canvas');out.width=w;out.height=h;const c=out.getContext('2d');c.drawImage(a.canvas,0,0);
        const aa=c.getImageData(0,0,w,h).data,bb=b.context.getImageData(0,0,w,h).data;
        let sum=0;for(let i=0;i<aa.length;i++)sum+=Math.abs(aa[i]-bb[i]);return sum/aa.length;
      });
    });
    expect(errors.every(e=>e<1)).toBeTruthy();
  }finally{await close(app);}
});

test('face anchors and offsets persist, track movement at every ratio and legacy scenes still load',async()=>{
  const {app,page}=await launch();
  try{
    await page.locator('[data-panel="stickers"]').click();
    await page.getByRole('button',{name:'添加星星脸颊彩绘',exact:true}).click();
    await page.locator('#anchorSelect').selectOption('leftCheek');await page.locator('#stickerOffsetX').fill('22');await page.locator('#stickerOffsetY').fill('-18');
    const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('lumi:scene:v1')).nodes[0]);
    expect(state.anchor).toBe('leftCheek');expect(state.offsetX).toBe(.22);expect(state.offsetY).toBe(-.18);expect(state.follow).toBe(true);
    await page.reload();await page.locator('[data-panel="stickers"]').click();
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('lumi:scene:v1')).nodes[0].anchor)).toBe('leftCheek');
    const result=await page.evaluate(async()=>{
      const {DecorationScene,ANCHORS,stickerById,STICKERS}=await import('./stickers.js');
      const scene=new DecorationScene(),node=scene.add('prop-paint-stars');
      const face={x:.3,y:.25,width:.3,height:.35,eyes:{x:.46,y:.35},nose:{x:.47,y:.47},mouth:{x:.46,y:.54},eyeDistance:.12,rotation:.18};
      const distances=[];
      for(const aspect of [16/9,4/3,1,3/4,9/16])for(const [anchor] of ANCHORS){
        scene.aspect=aspect;scene.face=face;Object.assign(node,{anchor,offsetX:.22,offsetY:-.18});const before=scene.placement(node);
        scene.face={...face,x:face.x+.1,eyes:{...face.eyes,x:face.eyes.x+.1},nose:{...face.nose,x:face.nose.x+.1},mouth:{...face.mouth,x:face.mouth.x+.1}};
        const after=scene.placement(node);distances.push(after.x-before.x);
        if(!scene.hit(after.x,after.y))throw new Error('Rotated anchor cannot be selected');
      }
      scene.restore({nodes:[{stickerId:'food-7',x:.2,y:.3,width:.2,follow:false}]});
      return {distances,legacy:scene.nodes.length,legacyName:stickerById('food-7').name,emojiInCatalog:STICKERS.some(s=>s.emoji)};
    });
    expect(result.distances.every(d=>Math.abs(d-.1)<.00001)).toBeTruthy();expect(result.legacy).toBe(1);expect(result.legacyName).toBe('棒棒糖');expect(result.emojiInCatalog).toBe(false);
    expect(await page.locator('#lookSelect option').count()).toBe(25);
    await page.locator('#lookSelect').selectOption('8');await expect(page.locator('#placedCount')).toHaveText('3');
  }finally{await close(app);}
});

test('silent video records the composed frame, pauses, plays, seeks, exports and deletes',async()=>{
  const {app,page,dir}=await launch();
  try{
    await activate(page);await page.locator('#sizeSelect').selectOption('640');
    await page.locator('[data-panel="frames"]').click();await page.getByRole('button',{name:'彩虹乐园相框',exact:true}).click();
    await page.locator('[data-mode="video"].mode-button').click();await expect(page.locator('#recordAudio')).not.toBeChecked();
    await page.evaluate(()=>{
      window.recordTimes={};
      for(const name of ['start','pause','resume','stop']){const fn=MediaRecorder.prototype[name];MediaRecorder.prototype[name]=function(...args){window.recordTimes[name]=performance.now();return fn.apply(this,args);};}
    });
    await page.locator('#shutter').click();await expect(page.locator('#recordingState')).toHaveText('录制中');
    await recordedSeconds(page,2);
    await page.locator('#pauseRecording').click();await expect(page.locator('#recordingState')).toHaveText('已暂停');
    const paused=await page.locator('#recordingTime').textContent();await page.waitForTimeout(1100);await expect(page.locator('#recordingTime')).toHaveText(paused);
    await page.locator('#pauseRecording').click();await expect(page.locator('#recordingState')).toHaveText('录制中');
    await recordedSeconds(page,3);
    await page.locator('#shutter').click();await expect(page.locator('.recent-photo')).toHaveCount(1,{timeout:30000});
    const item=(await page.evaluate(()=>window.booth.listPhotos())).photos[0];
    expect(item.kind).toBe('video');expect(item.audio).toBe(false);expect(item.frame).toBe('彩虹乐园');expect(item.duration).toBeGreaterThanOrEqual(3);const measured=await page.evaluate(()=>{const t=window.recordTimes;return (t.stop-t.start-(t.resume-t.pause))/1000;});expect(Math.abs(item.duration-measured)).toBeLessThan(.2);
    const content=await fs.readFile(path.join(dir,'photos',item.id+'.'+item.extension));expect(content.length).toBeGreaterThan(4000);
    await fs.writeFile(path.join(root,'test-results','recorded-silent.'+item.extension),content);
    const ranges=await page.evaluate(async url=>{
      const read=async range=>{const r=await fetch(url,{headers:{Range:range}});return {status:r.status,range:r.headers.get('content-range'),length:r.headers.get('content-length'),bytes:Array.from(new Uint8Array(await r.arrayBuffer()))};};
      return {prefix:await read('bytes=0-31'),suffix:await read('bytes=-16'),invalid:await read('bytes=999999999-')};
    },item.url);
    expect(ranges.prefix).toEqual({status:206,range:'bytes 0-31/'+content.length,length:'32',bytes:Array.from(content.subarray(0,32))});
    expect(ranges.suffix.status).toBe(206);expect(ranges.suffix.bytes).toEqual(Array.from(content.subarray(-16)));expect(ranges.invalid.status).toBe(416);
    await page.locator('.recent-photo').click();await expect(page.locator('#fullVideo')).toBeVisible();
    const playback=await page.locator('#fullVideo').evaluate(async video=>{
      await video.play();await new Promise(resolve=>setTimeout(resolve,350));
      const c=document.createElement('canvas');c.width=video.videoWidth;c.height=video.videoHeight;const x=c.getContext('2d');x.drawImage(video,0,0);
      const corner=Array.from(x.getImageData(2,2,1,1).data),stream=video.captureStream();
      const ranges=value=>Array.from({length:value.length},(_,i)=>[value.start(i),value.end(i)]);
      const result={width:video.videoWidth,height:video.videoHeight,time:video.currentTime,duration:video.duration,seekable:ranges(video.seekable),buffered:ranges(video.buffered),audio:stream.getAudioTracks().length,corner};stream.getTracks().forEach(t=>t.stop());video.pause();
      await new Promise((resolve,reject)=>{video.addEventListener('seeked',resolve,{once:true});video.addEventListener('error',()=>reject(new Error('seek failed')),{once:true});video.currentTime=1;});result.seek=video.currentTime;return result;
    });
    console.log('Recorded playback verification',JSON.stringify({format:item.extension,recordedDuration:item.duration,...playback}));
    expect([playback.width,playback.height]).toEqual([640,360]);expect(playback.time).toBeGreaterThan(0);expect(playback.seek).toBeCloseTo(1);expect(playback.audio).toBe(0);expect(playback.corner[0]).toBeGreaterThan(playback.corner[1]+40);
    const exportPath=path.join(dir,'export.'+item.extension);await app.evaluate(({dialog},filePath)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath});},exportPath);
    await page.locator('#exportPhoto').click();await expect(page.locator('#toastText')).toHaveText('作品已另存。');expect((await fs.readFile(exportPath)).equals(content)).toBe(true);
    await page.locator('#deletePhoto').click();await page.locator('#confirmDelete').click();await expect(page.locator('.recent-photo')).toHaveCount(0);
  }finally{await close(app);}
});

test('audio is opt-in and released after recording; camera interruption saves the video',async()=>{
  const {app,page}=await launch();
  try{
    expect(await page.evaluate(async()=>{try{await navigator.mediaDevices.getUserMedia({audio:true});return false;}catch{return true;}})).toBe(true);
    await activate(page);await page.locator('#sizeSelect').selectOption('640');await page.locator('[data-mode="video"].mode-button').click();await page.locator('#recordAudio').check();
    await page.locator('#shutter').click();await expect(page.locator('#recordingState')).toHaveText('录制中');
    expect(await page.evaluate(()=>window.testAudioTracks.length)).toBe(1);
    await recordedSeconds(page,2);
    await page.locator('#cameraVideo').evaluate(v=>v.srcObject.getVideoTracks()[0].dispatchEvent(new Event('ended')));
    await expect(page.locator('.recent-photo')).toHaveCount(1,{timeout:30000});await expect(page.locator('#welcomeTitle')).toHaveText('摄像头断开了');
    expect(await page.evaluate(()=>window.testAudioTracks.every(t=>t.readyState==='ended'))).toBe(true);
    const video=(await page.evaluate(()=>window.booth.listPhotos())).photos[0];expect(video.audio).toBe(true);
    await page.locator('.recent-photo').click();
    const tracks=await page.locator('#fullVideo').evaluate(async v=>{await v.play();await new Promise(r=>setTimeout(r,200));const stream=v.captureStream();const count=stream.getAudioTracks().length;stream.getTracks().forEach(t=>t.stop());v.pause();return count;});expect(tracks).toBe(1);
  }finally{await close(app);}
});

test('recording save failure is retryable and malformed or unsolicited writes are rejected',async()=>{
  const {app,page,dir}=await launch();
  try{
    const invalid=await page.evaluate(async()=>{const values=[];for(const action of [()=>window.booth.beginVideo({extension:'exe',width:100,height:100}),()=>window.booth.beginVideo({extension:'mp4',width:9000,height:100}),()=>window.booth.appendVideo('../escape',new ArrayBuffer(10)),()=>window.booth.finishVideo({id:'no-session'})]){try{await action();values.push(false);}catch{values.push(true);}}return values;});expect(invalid).toEqual([true,true,true,true]);
    await activate(page);await page.locator('#sizeSelect').selectOption('640');await page.locator('[data-mode="video"].mode-button').click();
    await page.locator('#shutter').click();await recordedSeconds(page,2);
    const blocked=path.join(dir,'photos','.library.json.tmp');await fs.mkdir(blocked);
    await page.locator('#shutter').click();await expect(page.locator('#toastRetry')).toBeVisible();await expect(page.locator('#shutter')).toBeDisabled();
    await fs.rmdir(blocked);await page.locator('#toastRetry').click();await expect(page.locator('.recent-photo')).toHaveCount(1);await expect(page.locator('#shutter')).toBeEnabled();
    await page.locator('#shutter').click();await expect(page.locator('#recordingState')).toHaveText('录制中');await recordedSeconds(page,1);await page.keyboard.press('Escape');await expect(page.locator('.recent-photo')).toHaveCount(2);
  }finally{await close(app);}
});

test('full HD encoding produces a decodable file and microphone denial leaves recording available',async()=>{
  const {app,page}=await launch(1920,1080);
  try{
    await activate(page);await page.locator('[data-mode="video"].mode-button').click();
    await page.locator('#recordAudio').check();
    await page.evaluate(()=>{const get=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=options=>options.audio?Promise.reject(new DOMException('Denied','NotAllowedError')):get(options);});
    await page.locator('#shutter').click();await expect(page.locator('#toastText')).toContainText('麦克风权限未开启');await expect(page.locator('#shutter')).toBeEnabled();
    await page.locator('#recordAudio').uncheck();await page.locator('#shutter').click();await recordedSeconds(page,2);await page.locator('#shutter').click();await expect(page.locator('.recent-photo')).toHaveCount(1,{timeout:30000});
    const video=(await page.evaluate(()=>window.booth.listPhotos())).photos[0];expect([video.width,video.height]).toEqual([1920,1080]);
    await page.locator('.recent-photo').click();await expect.poll(()=>page.locator('#fullVideo').evaluate(v=>v.readyState)).toBeGreaterThanOrEqual(2);
    expect(await page.locator('#fullVideo').evaluate(v=>[v.videoWidth,v.videoHeight])).toEqual([1920,1080]);
  }finally{await close(app);}
});

test('high-resolution camera frames encode playable video at all five aspect ratios',async()=>{
  const {app,page}=await launch();
  try{
    const results=await page.evaluate(async()=>{
      const {outputSize,ASPECTS}=await import('./capture-settings.js');
      const {BoothRecorder}=await import('./recorder.js');
      const source=document.createElement('canvas');source.width=320;source.height=180;
      const x=source.getContext('2d'),results=[];
      const photoSquare=outputSize(3840,2160,1,3840);
      let unsafeRejected=false;try{await window.booth.beginVideo({extension:'mp4',width:1920,height:1920});}catch{unsafeRejected=true;}
      for(const aspect of ['16:9','4:3','1:1','3:4','9:16']){
        const [width,height]=outputSize(3840,2160,ASPECTS[aspect],1920,1920*1080);
        let saved,failed;const done=new Promise((resolve,reject)=>{saved=resolve;failed=reject;});
        const recorder=new BoothRecorder(window.booth,()=>{},saved,failed);
        x.fillStyle='#d58b62';x.fillRect(0,0,320,180);
        await recorder.start({width,height,microphone:false,metadata:{},paint:(c,w,h)=>c.drawImage(source,0,0,w,h)});
        let frame=0;const timer=setInterval(()=>{x.fillStyle=frame++%2?'#7aa793':'#d58b62';x.fillRect(0,0,320,180);recorder.paint(source,{draw(){}});},100);
        await new Promise(resolve=>setTimeout(resolve,2400));clearInterval(timer);recorder.stop();
        const item=await done,video=document.createElement('video');
        await new Promise((resolve,reject)=>{
          const timeout=setTimeout(()=>reject(new Error('High-resolution video did not decode: '+aspect)),20000);
          video.onloadeddata=()=>{clearTimeout(timeout);resolve();};
          video.onerror=()=>{clearTimeout(timeout);reject(new Error('High-resolution video decode failed: '+aspect));};
          video.src=item.url;video.load();
        });
        results.push({aspect,width:video.videoWidth,height:video.videoHeight,format:item.extension,bytes:item.bytes});
        video.removeAttribute('src');video.load();
      }
      return {photoSquare,unsafeRejected,videos:results};
    });
    expect(results.photoSquare).toEqual([2160,2160]);expect(results.unsafeRejected).toBe(true);
    expect(results.videos.map(v=>[v.width,v.height])).toEqual([[1920,1080],[1662,1246],[1440,1440],[1246,1662],[1080,1920]]);
    expect(results.videos.every(v=>v.bytes>1000)).toBe(true);
    console.log('High-resolution video verification',JSON.stringify(results));
  }finally{await close(app);}
});

test('a failed video chunk is retried in order without losing the video header',async()=>{
  const {app,page}=await launch();
  try{
    await activate(page);await page.locator('#sizeSelect').selectOption('640');await page.locator('[data-mode="video"].mode-button').click();
    await app.evaluate(()=>{
      const files=process.getBuiltinModule('fs').promises,original=files.appendFile;let first=true;
      files.appendFile=async(...args)=>{if(first&&String(args[0]).includes('.recordings')){first=false;globalThis.chunkFaultUsed=true;await original(args[0],Buffer.from(args[1]).subarray(0,32));throw new Error('Simulated partial write interruption');}return original(...args);};
    });
    await page.locator('#shutter').click();await expect.poll(()=>app.evaluate(()=>globalThis.chunkFaultUsed)).toBe(true);await expect(page.locator('.recent-photo')).toHaveCount(1,{timeout:30000});
    await page.locator('.recent-photo').click();await expect.poll(()=>page.locator('#fullVideo').evaluate(v=>v.readyState)).toBeGreaterThanOrEqual(2);
    expect(await page.locator('#fullVideo').evaluate(v=>v.videoWidth)).toBe(640);
  }finally{await close(app);}
});
