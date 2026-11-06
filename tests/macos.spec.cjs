const { test, expect, _electron: electron } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

test('macOS has native menus, camera privacy routing and Dock window recreation', async () => {
  test.skip(process.platform !== 'darwin', 'Native macOS integration');
  const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'snapjoy-mac-'));
  const env = { ...process.env, LUMI_TEST: '1', LUMI_TEST_DATA: dataDir };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({ args: [path.resolve(__dirname, '..')], env });
  try {
    const page = await app.firstWindow();
    await expect(page.locator('.effect-card')).toHaveCount(60);
    await expect(page.locator('html')).toHaveClass(/platform-mac/);
    await expect(page.locator('.window-actions')).toBeHidden();
    await expect(page.locator('#helpCameraSettings')).toContainText('Mac 隐私设置');
    const menus = await app.evaluate(({ Menu }) => Menu.getApplicationMenu().items.map(item => item.role));
    expect(menus).toEqual(['appmenu', 'editmenu', 'windowmenu']);
    await app.evaluate(({ shell, systemPreferences }) => {
      globalThis.macTest = { opened: [], requests: [] };
      shell.openExternal = async url => { globalThis.macTest.opened.push(url); };
      systemPreferences.getMediaAccessStatus = () => 'denied';
      systemPreferences.askForMediaAccess = async kind => { globalThis.macTest.requests.push(kind); return false; };
    });
    await page.locator('#helpCameraSettings').evaluate(button => button.click());
    expect(await app.evaluate(() => globalThis.macTest.opened)).toEqual(['x-apple.systempreferences:com.apple.preference.security?Privacy_Camera']);
    await page.locator('#startCamera').click();
    await expect(page.locator('#welcomeTitle')).toHaveText('需要开启摄像头权限');
    await expect(page.locator('#welcomeDescription')).toContainText('隐私与安全性');
    expect(await app.evaluate(() => globalThis.macTest.requests)).toEqual([]);
    await app.evaluate(({ systemPreferences }) => { systemPreferences.getMediaAccessStatus = () => 'not-determined'; });
    expect(await page.evaluate(() => window.booth.requestCameraAccess())).toBe(false);
    expect(await app.evaluate(() => globalThis.macTest.requests)).toEqual(['camera']);
    await app.evaluate(({ systemPreferences }) => { systemPreferences.getMediaAccessStatus = () => 'granted'; });
    expect(await page.evaluate(() => window.booth.requestCameraAccess())).toBe(true);
    expect(await app.evaluate(() => globalThis.macTest.requests)).toEqual(['camera']);
    await app.evaluate(({systemPreferences})=>{systemPreferences.getMediaAccessStatus=()=> 'denied';});
    expect(await page.evaluate(()=>window.booth.requestMicrophoneAccess())).toBe(false);
    await page.locator('#helpMicrophoneSettings').evaluate(button=>button.click());
    expect((await app.evaluate(()=>globalThis.macTest.opened)).at(-1)).toBe('x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone');
    await app.evaluate(({systemPreferences})=>{systemPreferences.getMediaAccessStatus=()=> 'not-determined';});
    expect(await page.evaluate(()=>window.booth.requestMicrophoneAccess())).toBe(false);
    expect((await app.evaluate(()=>globalThis.macTest.requests)).at(-1)).toBe('microphone');
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
    await expect.poll(() => app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().length)).toBe(0);
    const nextWindow = app.waitForEvent('window');
    await app.evaluate(({ app }) => app.emit('activate'));
    const restored = await nextWindow;
    await expect(restored).toHaveTitle('拾光相机 · SnapJoy');
    expect(await restored.locator('#cameraVideo').evaluate(video => video.srcObject)).toBe(null);
  } finally { await app.close(); }
});
