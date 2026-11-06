const { _electron: electron } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const root = path.resolve(__dirname, '..');
const config = require('../package.json');
const { graphicsArgs, packageArch } = require('./test-graphics.cjs');
const releaseDir = path.join(root, config.build.directories.output);
const isMac = process.platform === 'darwin';
const executablePath = isMac
  ? path.join(releaseDir,packageArch === 'arm64' ? 'mac-arm64' : 'mac','拾光相机.app','Contents','MacOS','拾光相机')
  : path.join(releaseDir,'win-unpacked','拾光相机.exe');
(async () => {
  const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'lumi-package-'));
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({
    executablePath,
    args: ['--user-data-dir='+userData,'--use-fake-device-for-media-stream',...graphicsArgs],
    env, timeout:process.env.CI ? 90000 : 30000
  });
  try {
    const page = await app.firstWindow();
    await page.waitForSelector('.effect-card');
    const initial = await page.evaluate(() => ({
      title:document.title, effects:document.querySelectorAll('.effect-card').length,
      cameraOff:document.querySelector('#cameraVideo').srcObject===null,
      isolated:typeof require==='undefined' && typeof process==='undefined',
      windowAPI:typeof window.booth?.savePhoto==='function' && typeof window.booth?.beginVideo==='function',
      aspects:document.querySelector('#aspectSelect').options.length,
      microphoneOff:!document.querySelector('#recordAudio').checked
    }));
    if(initial.title!=='拾光相机 · SnapJoy' || initial.effects!==60 || !initial.cameraOff || !initial.isolated || !initial.windowAPI) throw new Error(JSON.stringify(initial));
    await fs.mkdir(path.join(root,'docs',config.version),{recursive:true});
    // Capture only the catalog so a production photo library never enters test screenshots.
    await page.locator('.effects-panel').screenshot({path:path.join(root,'docs',config.version,'打包版特效面板.png')});
    await page.locator('#startCamera').click();
    await page.waitForFunction(()=>document.querySelector('#cameraStatus').textContent.includes('正在取景'));
    const camera=await page.locator('#cameraVideo').evaluate(v=>({width:v.videoWidth,height:v.videoHeight,audioTracks:v.srcObject.getAudioTracks().length}));
    await page.locator('[data-panel="stickers"]').click();
    const stickers=await page.locator('.sticker-card').count();
    if(stickers!==120)throw new Error('Sticker catalog missing in package');
    await page.getByRole('button',{name:'添加兔耳朵',exact:true}).click();
    await page.waitForFunction(()=>/正在寻找人脸|正在跟随主要人脸|跟随暂不可用/.test(document.querySelector('#faceStatus').textContent),null,{timeout:65000});
    const trackingStatus=await page.locator('#faceStatus').textContent();
    if(trackingStatus.includes('不可用'))throw new Error('Packaged face tracker failed to load: '+await page.locator('#faceStatus').getAttribute('title'));
    await page.locator('[data-panel="frames"]').click();
    const frames=await page.locator('.frame-card').count()-1;
    if(frames!==24)throw new Error('Frame catalog missing in package');
    let recordedVideo=null;
    if(process.env.CI){
      // The runner's Pictures directory is ephemeral; never record into a local
      // user's library when this verification script is run on their computer.
      await page.locator('#resetLook').click();
      await page.locator('#sizeSelect').selectOption('640');
      await page.locator('[data-mode="video"].mode-button').click();
      await page.locator('#shutter').click();
      await page.waitForFunction(()=>document.querySelector('#recordingState').textContent==='录制中');
      await page.waitForFunction(()=>Number(document.querySelector('#recordingTime').textContent.split(':')[1])>=2);
      await page.locator('#shutter').click();
      await page.waitForFunction(()=>document.querySelector('#recordingHud').hidden,null,{timeout:45000});
      const items=await page.evaluate(()=>window.booth.listPhotos());
      recordedVideo=items.photos.find(p=>p.kind==='video');
      if(!recordedVideo||recordedVideo.bytes<1000||recordedVideo.audio)throw new Error('Packaged video did not save correctly');
      await page.locator('[data-photo-id="'+recordedVideo.id+'"]').click();
      await page.waitForFunction(()=>document.querySelector('#fullVideo').readyState>=2,null,{timeout:30000});
      await page.locator('[data-close="photoDialog"]').click();
      recordedVideo={width:recordedVideo.width,height:recordedVideo.height,format:recordedVideo.extension,bytes:recordedVideo.bytes,playable:true};
    }
    await page.locator('#powerButton').click();
    const packaged=await app.evaluate(({app})=>app.isPackaged);
    const appVersion=await app.evaluate(({app})=>app.getVersion());
    if(appVersion!==config.version)throw new Error('Packaged version does not match package.json');
    const appArch=await app.evaluate(()=>process.arch);
    if(appArch!==packageArch)throw new Error('Packaged architecture differs from the requested target');
    const result={passed:true,version:config.version,platform:process.platform,arch:appArch,testHostArch:process.arch,translated:isMac&&process.arch==='arm64'&&appArch==='x64',packaged,...initial,camera,stickers,frames,trackingStatus,recordedVideo,testSource:'simulated camera; short silent video only on ephemeral CI runner',checkedAt:new Date().toISOString()};
    await fs.writeFile(path.join(root,'docs',config.version,`package-verification-${process.platform}-${packageArch}.json`),JSON.stringify(result,null,2));
    console.log(JSON.stringify(result,null,2));
  } finally { await app.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
