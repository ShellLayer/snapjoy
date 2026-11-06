const { test, expect, _electron: electron } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const root = path.resolve(__dirname, '..');
const { graphicsArgs } = require('../tools/test-graphics.cjs');

async function launch(dataDir, fake = true) {
  const env = { ...process.env, LUMI_TEST: '1', LUMI_TEST_DATA: dataDir };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({
    args: [root, ...graphicsArgs, ...(fake ? ['--use-fake-device-for-media-stream'] : [])],
    env, timeout: 30000
  });
  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('.effect-card')).toHaveCount(48);
  return { app, page };
}
async function activate(page) {
  await page.locator('#startCamera').click();
  await expect(page.locator('#cameraStatus')).toHaveText('正在取景');
  await expect(page.locator('#shutter')).toBeEnabled();
}
async function newDataDir() { return fs.mkdtemp(path.join(os.tmpdir(), 'lumi-test-')); }
async function immediate(page) { await page.locator('#timerSelect').selectOption('0'); }

test('camera, every effect, true PNG capture, mirror, local persistence and privacy', async () => {
  const dataDir = await newDataDir();
  let { app, page } = await launch(dataDir);
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  try {
    await expect(page).toHaveTitle('拾光相机 · SnapJoy');
    expect(await page.evaluate(() => window.booth.platform)).toBe(process.platform);
    await expect(page.locator('.titlebar-label')).toHaveText('SNAPJOY');
    await expect(page.locator('#welcome')).toBeVisible();
    expect(await page.locator('#cameraVideo').evaluate((v) => v.srcObject)).toBe(null);
    await page.screenshot({ path: path.join(root, 'test-results', 'welcome.png') });
    await activate(page);
    expect(await page.locator('#cameraVideo').evaluate((v) => v.srcObject.getAudioTracks().length)).toBe(0);
    const effectResults = await page.evaluate(async () => {
      const { EffectRenderer, createSample, EFFECTS } = await import('./effects.js');
      const c = document.createElement('canvas'), out = new EffectRenderer(c);
      out.upload(createSample());
      const hashes = [];
      for (const effect of EFFECTS) {
        out.draw(effect.id, .85, false, 240, 180);
        const pixels = new Uint8Array(240*180*4);
        out.gl.readPixels(0,0,240,180,out.gl.RGBA,out.gl.UNSIGNED_BYTE,pixels);
        let hash = 2166136261, light = 0;
        for (const p of pixels) { hash = Math.imul(hash ^ p, 16777619); light += p; }
        hashes.push({ id:effect.id, hash:hash>>>0, light });
      }
      const mirrorPixels = new Uint8Array(240*180*4), original = new Uint8Array(mirrorPixels.length);
      out.draw(0,1,false,240,180);out.gl.readPixels(0,0,240,180,out.gl.RGBA,out.gl.UNSIGNED_BYTE,original);
      out.draw(0,1,true,240,180);out.gl.readPixels(0,0,240,180,out.gl.RGBA,out.gl.UNSIGNED_BYTE,mirrorPixels);
      let difference=0; for(let y=0;y<180;y++)for(let x=0;x<240;x++)for(let ch=0;ch<3;ch++)difference+=Math.abs(original[(y*240+x)*4+ch]-mirrorPixels[(y*240+239-x)*4+ch]);
      return { hashes, mirrorError: difference/(240*180*3) };
    });
    expect(new Set(effectResults.hashes.map((h) => h.hash)).size).toBe(48);
    expect(effectResults.hashes.every((h) => h.light > 240*180*255)).toBeTruthy();
    expect(effectResults.mirrorError).toBeLessThan(.2);
    await page.getByRole('button', { name: '黑白故事', exact:true }).click();
    await page.locator('#intensity').fill('100');
    await immediate(page);
    await page.locator('#shutter').click();
    await expect(page.locator('.recent-photo')).toHaveCount(1);
    const stored = await page.evaluate(() => window.booth.listPhotos());
    expect(stored.photos[0].effect).toBe('黑白故事');
    const saved = await fs.readFile(path.join(dataDir, 'photos', stored.photos[0].id+'.png'));
    expect(saved.subarray(0,8)).toEqual(Buffer.from([137,80,78,71,13,10,26,10]));
    const check = await page.evaluate(async (photo) => {
      const im = new Image(); im.src=photo.url; await im.decode();
      const c=document.createElement('canvas');c.width=im.width;c.height=im.height;
      const ctx=c.getContext('2d');ctx.drawImage(im,0,0);const d=ctx.getImageData(0,0,c.width,c.height).data;
      let maxColor=0,min=255,max=0;for(let i=0;i<d.length;i+=4){maxColor=Math.max(maxColor,Math.abs(d[i]-d[i+1]),Math.abs(d[i]-d[i+2]));min=Math.min(min,d[i]);max=Math.max(max,d[i]);}
      return { width:im.width, height:im.height, maxColor, contrast:max-min };
    }, stored.photos[0]);
    expect(check.width/check.height).toBeCloseTo(4/3);
    expect(check.maxColor).toBeLessThanOrEqual(1);
    expect(check.contrast).toBeGreaterThan(40);
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#flashOverlay')).opacity === '0');
    await page.locator('.recent-photo img').evaluate((img) => img.decode());
    await page.screenshot({ path: path.join(root, 'test-results', 'camera.png') });
    await page.locator('.recent-photo').click();
    await expect(page.locator('#fullPhoto')).toBeVisible();
    await page.locator('[data-close="photoDialog"]').click();
    await page.locator('#powerButton').click();
    expect(await page.locator('#cameraVideo').evaluate((v) => v.srcObject)).toBe(null);
    await expect(page.locator('#shutter')).toBeDisabled();
    expect(errors).toEqual([]);
    await app.close();
    ({ app, page } = await launch(dataDir));
    await expect(page.locator('.recent-photo')).toHaveCount(1);
    expect(await page.locator('#cameraVideo').evaluate((v) => v.srcObject)).toBe(null);
    await expect(page.getByRole('button', { name:'黑白故事', exact:true })).toHaveAttribute('aria-pressed','true');
    await page.locator('#albumButton').click();
    await expect(page.locator('.album-photo')).toHaveCount(1);
    await expect(page.locator('.album-photo img')).toBeVisible();
  } finally { await app.close(); }
});

test('four-shot strip, cancellation, double-click protection and safe deletion', async () => {
  const dataDir = await newDataDir();
  const { app, page } = await launch(dataDir);
  try {
    await activate(page);
    await page.locator('[data-mode="strip"].mode-button').click();
    await immediate(page);
    await page.locator('#shutter').click();
    await expect(page.locator('#burstProgress')).toBeVisible();
    await expect(page.locator('.recent-photo')).toHaveCount(1, {timeout:20000});
    const stored = await page.evaluate(() => window.booth.listPhotos());
    expect(stored.photos[0].mode).toBe('strip');
    expect(stored.photos[0].height).toBeGreaterThan(stored.photos[0].width*2.8);
    const full = await fs.readFile(path.join(dataDir,'photos',stored.photos[0].id+'.png'));
    expect(full.length).toBeGreaterThan(10000);
    await page.locator('[data-mode="single"].mode-button').click();
    await page.locator('#timerSelect').selectOption('3');
    await page.locator('#shutter').click();
    await expect(page.locator('#countdownOverlay')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#countdownOverlay')).toBeHidden();
    await expect(page.locator('#shutter')).toBeEnabled();
    await expect(page.locator('.recent-photo')).toHaveCount(1);
    await immediate(page);
    await page.locator('#shutter').evaluate((b) => { b.click();b.click(); });
    await expect(page.locator('.recent-photo')).toHaveCount(2);
    await page.locator('.recent-photo').first().click();
    await page.locator('#deletePhoto').click();
    await expect(page.locator('#deleteConfirmation')).toBeVisible();
    await page.locator('#cancelDelete').click();
    await expect(page.locator('.recent-photo')).toHaveCount(2);
    await page.locator('#deletePhoto').click();
    await page.locator('#confirmDelete').click();
    await expect(page.locator('.recent-photo')).toHaveCount(1);
    expect((await page.evaluate(() => window.booth.listPhotos())).photos).toHaveLength(1);
    await page.locator('[data-close="photoDialog"]').click();
    await page.locator('.recent-photo').click();
    await page.screenshot({ path:path.join(root,'test-results','strip.png') });
  } finally { await app.close(); }
});

test('permission denial explains recovery and camera startup can be retried', async () => {
  const { app, page } = await launch(await newDataDir());
  try {
    await page.evaluate(() => {
      const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      let first = true;
      navigator.mediaDevices.getUserMedia = (options) => {
        if (first) { first=false;return Promise.reject(new DOMException('Permission denied','NotAllowedError')); }
        return original(options);
      };
    });
    await page.locator('#startCamera').click();
    await expect(page.locator('#welcomeTitle')).toHaveText('需要开启摄像头权限');
    await expect(page.locator('#cameraSettings')).toBeVisible();
    await expect(page.locator('#cameraSettings')).toHaveText(process.platform === 'darwin' ? '打开 Mac 摄像头设置' : '打开 Windows 摄像头设置');
    await expect(page.locator('#shutter')).toBeDisabled();
    await activate(page);
    await page.locator('#powerButton').click();
    await activate(page);
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(980,720));
    const layout = await page.evaluate(() => {
      const panel=document.querySelector('.effects-panel').getBoundingClientRect();
      const shutter=document.querySelector('#shutter').getBoundingClientRect();
      const recent=document.querySelector('.recent-section').getBoundingClientRect();
      return { panelBottom:panel.bottom, shutterBottom:shutter.bottom, recentBottom:recent.bottom, height:innerHeight, scroll:document.documentElement.scrollWidth, width:innerWidth };
    });
    expect(layout.panelBottom).toBeLessThanOrEqual(layout.height);
    expect(layout.shutterBottom).toBeLessThan(layout.height);
    expect(layout.recentBottom).toBeLessThan(layout.height);
    expect(layout.scroll).toBe(layout.width);
    await page.screenshot({path:path.join(root,'test-results','compact.png')});
  } finally { await app.close(); }
});

test('storage failure preserves an unsaved photo for retry; invalid payloads rejected', async () => {
  const dataDir = await newDataDir();
  const { app, page } = await launch(dataDir);
  try {
    await activate(page); await immediate(page);
    await fs.writeFile(path.join(dataDir,'photos'),'blocked');
    await page.locator('#shutter').click();
    await expect(page.locator('#toastRetry')).toBeVisible();
    await expect(page.locator('#shutter')).toBeDisabled();
    await fs.unlink(path.join(dataDir,'photos'));
    await page.locator('#toastRetry').click();
    await expect(page.locator('.recent-photo')).toHaveCount(1);
    await expect(page.locator('#shutter')).toBeEnabled();
    const validation = await page.evaluate(async () => {
      const result=[];
      for(const action of [
        ()=>window.booth.savePhoto({data:'not-an-image'}),
        ()=>window.booth.deletePhoto('../outside'),
        ()=>window.booth.showPhoto('anything')
      ]) { try{await action();result.push(false);}catch{result.push(true);} }
      return result;
    });
    expect(validation).toEqual([true,true,true]);
    const original = (await page.evaluate(() => window.booth.listPhotos())).photos[0];
    const exportPath = path.join(dataDir,'exported.png');
    await app.evaluate(({ dialog }, filePath) => {
      dialog.showSaveDialog = async () => ({ canceled:false, filePath });
    }, exportPath);
    await page.locator('.recent-photo').click();
    await page.locator('#exportPhoto').click();
    await expect(page.locator('#toastText')).toHaveText('照片已另存。');
    expect(await fs.readFile(exportPath)).toEqual(await fs.readFile(path.join(dataDir,'photos',original.id+'.png')));
  } finally { await app.close(); }
});

test('GPU fallback still photographs; missing or disconnected camera cannot leave stale capture active', async () => {
  const { app, page } = await launch(await newDataDir());
  try {
    await page.addInitScript(() => {
      const getContext=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(type,...args) {
        if(type === 'webgl') return null;
        return getContext.call(this,type,...args);
      };
    });
    await page.reload();
    await expect(page.locator('#effectsPreviewNote')).toContainText('兼容模式');
    await expect(page.getByRole('button',{name:'鱼眼镜头',exact:true})).toBeDisabled();
    await page.evaluate(() => {
      const original=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      let first=true;
      navigator.mediaDevices.getUserMedia=(options)=>{
        if(first){first=false;return Promise.reject(new DOMException('No camera','NotFoundError'));}
        return original(options);
      };
    });
    await page.locator('#startCamera').click();
    await expect(page.locator('#welcomeTitle')).toHaveText('还没找到摄像头');
    await expect(page.locator('#shutter')).toBeDisabled();
    await activate(page);
    await page.getByRole('button',{name:'日落时分',exact:true}).click();
    await immediate(page);
    await page.keyboard.press('Space');
    await expect(page.locator('.recent-photo')).toHaveCount(1);
    await page.locator('[data-panel="stickers"]').click();
    await page.getByRole('button',{name:'添加小猪鼻子',exact:true}).click();
    await page.locator('#followFace').uncheck();
    await page.locator('#shutter').click();
    await expect(page.locator('.recent-photo')).toHaveCount(2);
    expect((await page.evaluate(()=>window.booth.listPhotos())).photos[0].stickers).toEqual(['小猪鼻子']);
    await page.locator('#cameraVideo').evaluate((video)=>video.srcObject.getVideoTracks()[0].dispatchEvent(new Event('ended')));
    await expect(page.locator('#welcomeTitle')).toHaveText('摄像头断开了');
    await expect(page.locator('#shutter')).toBeDisabled();
    expect(await page.locator('#cameraVideo').evaluate((v)=>v.srcObject)).toBe(null);
  } finally { await app.close(); }
});
