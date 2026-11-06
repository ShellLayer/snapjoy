const { _electron: electron } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const root = path.resolve(__dirname, '..');
const config = require('../package.json');
const releaseDir = path.join(root, config.build.directories.output);
const isMac = process.platform === 'darwin';
const executablePath = isMac
  ? path.join(releaseDir,process.arch === 'arm64' ? 'mac-arm64' : 'mac','拾光相机.app','Contents','MacOS','拾光相机')
  : path.join(releaseDir,'win-unpacked','拾光相机.exe');
(async () => {
  const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'lumi-package-'));
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({
    executablePath,
    args: ['--user-data-dir='+userData,'--use-fake-device-for-media-stream','--use-angle=swiftshader','--enable-unsafe-swiftshader'],
    env, timeout:30000
  });
  try {
    const page = await app.firstWindow();
    await page.waitForSelector('.effect-card');
    const initial = await page.evaluate(() => ({
      title:document.title, effects:document.querySelectorAll('.effect-card').length,
      cameraOff:document.querySelector('#cameraVideo').srcObject===null,
      isolated:typeof require==='undefined' && typeof process==='undefined',
      windowAPI:typeof window.booth?.savePhoto==='function'
    }));
    if(initial.title!=='拾光相机 · SnapJoy' || initial.effects!==48 || !initial.cameraOff || !initial.isolated || !initial.windowAPI) throw new Error(JSON.stringify(initial));
    await fs.mkdir(path.join(root,'docs',config.version),{recursive:true});
    // Capture only the catalog so a production photo library never enters test screenshots.
    await page.locator('.effects-panel').screenshot({path:path.join(root,'docs',config.version,'打包版特效面板.png')});
    await page.locator('#startCamera').click();
    await page.waitForFunction(()=>document.querySelector('#cameraStatus').textContent.includes('正在取景'));
    const camera=await page.locator('#cameraVideo').evaluate(v=>({width:v.videoWidth,height:v.videoHeight,audioTracks:v.srcObject.getAudioTracks().length}));
    await page.locator('[data-panel="stickers"]').click();
    const stickers=await page.locator('.sticker-card').count();
    if(stickers!==96)throw new Error('Sticker catalog missing in package');
    await page.getByRole('button',{name:'添加兔耳朵',exact:true}).click();
    await page.waitForFunction(()=>/正在寻找人脸|正在跟随主要人脸|跟随暂不可用/.test(document.querySelector('#faceStatus').textContent),{timeout:20000});
    const trackingStatus=await page.locator('#faceStatus').textContent();
    if(trackingStatus.includes('不可用'))throw new Error('Packaged face tracker failed to load');
    await page.locator('[data-panel="frames"]').click();
    const frames=await page.locator('.frame-card').count()-1;
    if(frames!==12)throw new Error('Frame catalog missing in package');
    await page.locator('#powerButton').click();
    const packaged=await app.evaluate(({app})=>app.isPackaged);
    const appVersion=await app.evaluate(({app})=>app.getVersion());
    if(appVersion!==config.version)throw new Error('Packaged version does not match package.json');
    const result={passed:true,version:config.version,platform:process.platform,arch:process.arch,packaged,...initial,camera,stickers,frames,trackingStatus,testSource:'simulated camera; no photos captured',checkedAt:new Date().toISOString()};
    await fs.writeFile(path.join(root,'docs',config.version,`package-verification-${process.platform}-${process.arch}.json`),JSON.stringify(result,null,2));
    console.log(JSON.stringify(result,null,2));
  } finally { await app.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
