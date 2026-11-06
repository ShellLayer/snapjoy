const { app, BrowserWindow, ipcMain, protocol, session, net, shell, dialog, nativeImage, Menu, systemPreferences } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { randomUUID } = require('node:crypto');

const APP_URL = 'lumi://app/';
const isMac = process.platform === 'darwin';
const isTest = !app.isPackaged && process.env.LUMI_TEST === '1';
if (isTest && process.env.LUMI_TEST_DATA) app.setPath('userData', path.resolve(process.env.LUMI_TEST_DATA));
app.setName('拾光相机');
protocol.registerSchemesAsPrivileged([{
  scheme: 'lumi',
  privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true }
}]);

let mainWindow;
let photoDir;
let libraryFile;
let microphoneAllowed = false;
let clearVideoSessions = () => {};
let queue = Promise.resolve();
const sourceDir = path.resolve(__dirname, '../src');
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const trusted = (url) => {
  try { const u = new URL(url); return u.protocol === 'lumi:' && u.host === 'app'; }
  catch { return false; }
};
function serial(task) {
  const work = queue.then(task);
  queue = work.catch(() => {});
  return work;
}
function assertId(id) {
  if (typeof id !== 'string' || !idPattern.test(id)) throw new Error('照片编号无效。');
}
async function readLibrary() {
  try {
    const items = JSON.parse(await fs.readFile(libraryFile, 'utf8'));
    if (!Array.isArray(items)) throw new Error('invalid');
    return items.filter((p) => p && idPattern.test(p.id));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw new Error('相册索引无法读取。请先备份照片文件夹，照片文件仍然保留。');
  }
}
async function writeLibrary(items) {
  const temp = libraryFile + '.tmp';
  await fs.writeFile(temp, JSON.stringify(items, null, 2), 'utf8');
  await fs.rename(temp, libraryFile);
}
const photoPath = (id) => path.join(photoDir, id + '.png');
const mediaPath = (item) => path.join(photoDir, item.id + '.' + (item.kind === 'video' && ['mp4','webm'].includes(item.extension) ? item.extension : 'png'));
const thumbPath = (id) => path.join(photoDir, '.thumbnails', id + '.jpg');
const publicPhoto = (p) => ({ ...p, url: p.kind === 'video' ? 'lumi://app/video/' + p.id + '.' + p.extension : 'lumi://app/photo/' + p.id + '.png', thumbnail: 'lumi://app/thumb/' + p.id + '.jpg' });

function handle(channel, fn) {
  ipcMain.handle(channel, async (event, ...args) => {
    if (event.sender !== mainWindow?.webContents || !trusted(event.senderFrame?.url) || event.senderFrame !== event.sender.mainFrame) {
      throw new Error('不允许的请求来源。');
    }
    return fn(...args);
  });
}
function setupHandlers() {
  clearVideoSessions = require('./video-store.cjs')({handle,serial,directory:photoDir,readLibrary,writeLibrary,publicPhoto,nativeImage});
  handle('photos:list', () => serial(async () => {
    const items = await readLibrary();
    const existing = await Promise.all(items.map(async (p) => {
      try { await fs.access(mediaPath(p)); return publicPhoto(p); }
      catch { return null; }
    }));
    return { photos: existing.filter(Boolean), folder: photoDir };
  }));
  handle('photos:save', (payload) => serial(async () => {
    if (!payload || typeof payload.data !== 'string' || payload.data.length > 60 * 1024 * 1024 || !payload.data.startsWith('data:image/png;base64,')) {
      throw new Error('照片格式或大小不正确。');
    }
    const buffer = Buffer.from(payload.data.slice(22), 'base64');
    if (!buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error('照片格式不正确。');
    const img = nativeImage.createFromBuffer(buffer);
    const size = img.getSize();
    if (img.isEmpty() || size.width > 10000 || size.height > 10000) throw new Error('无法读取这张照片。');
    const items = await readLibrary();
    const photo = {
      id: randomUUID(), createdAt: new Date().toISOString(),
      effect: typeof payload.effect === 'string' ? payload.effect.slice(0, 40) : '原片',
      stickers: Array.isArray(payload.stickers) ? payload.stickers.filter(s=>typeof s==='string').slice(0,20).map(s=>s.slice(0,40)) : [],
      frame: typeof payload.frame === 'string' ? payload.frame.slice(0,40) : '',
      mode: payload.mode === 'strip' ? 'strip' : 'single',
      width: size.width, height: size.height
    };
    await fs.mkdir(path.join(photoDir, '.thumbnails'), { recursive: true });
    try {
      await fs.writeFile(photoPath(photo.id), buffer, { flag: 'wx' });
      await fs.writeFile(thumbPath(photo.id), img.resize({ width: 360 }).toJPEG(85), { flag: 'wx' });
      await writeLibrary([photo, ...items]);
    } catch (error) {
      await fs.rm(photoPath(photo.id), { force: true }).catch(() => {});
      await fs.rm(thumbPath(photo.id), { force: true }).catch(() => {});
      throw new Error('照片未保存成功，请检查磁盘空间与照片文件夹权限。');
    }
    return publicPhoto(photo);
  }));
  handle('photos:delete', (id) => serial(async () => {
    assertId(id);
    const items = await readLibrary();
    const item = items.find(p => p.id === id);
    if (!item) throw new Error('作品不存在。');
    try { await fs.access(mediaPath(item)); await shell.trashItem(mediaPath(item)); }
    catch (error) { if (error.code !== 'ENOENT') throw new Error('无法移到' + (isMac ? '废纸篓' : '回收站') + '，照片仍保留在相册中。'); }
    await writeLibrary(items.filter((p) => p.id !== id));
    await fs.rm(thumbPath(id), { force: true }).catch(() => {});
    return true;
  }));
  handle('photos:export', async (id) => {
    assertId(id);
    const item = (await readLibrary()).find(p=>p.id===id);
    if (!item) throw new Error('作品不存在。');
    const extension = item.kind==='video' ? item.extension : 'png';
    const chosen = await dialog.showSaveDialog(mainWindow, {
      title: '另存作品',
      defaultPath: path.join(app.getPath('pictures'), '拾光-' + id.slice(0, 8) + '.' + extension),
      filters: [{ name: item.kind==='video' ? '视频' : 'PNG 图片', extensions: [extension] }]
    });
    if (chosen.canceled || !chosen.filePath) return false;
    await fs.copyFile(mediaPath(item), chosen.filePath);
    return true;
  });
  handle('photos:show', async (id) => { assertId(id); const item=(await readLibrary()).find(p=>p.id===id); if(item)shell.showItemInFolder(mediaPath(item)); });
  handle('photos:folder', async () => {
    await fs.mkdir(photoDir, { recursive: true });
    const error = await shell.openPath(photoDir);
    if (error) throw new Error(error);
  });
  handle('microphone:authorize', async () => {
    microphoneAllowed = false;
    if (isMac && !app.commandLine.hasSwitch('use-fake-device-for-media-stream')) {
      const status = systemPreferences.getMediaAccessStatus('microphone');
      if (status === 'denied' || status === 'restricted') return false;
      if (status !== 'granted' && !await systemPreferences.askForMediaAccess('microphone')) return false;
    }
    microphoneAllowed = true;
    return true;
  });
  handle('microphone:release', () => { microphoneAllowed = false; });
  handle('microphone:settings', () => shell.openExternal(isMac
    ? 'x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone'
    : 'ms-settings:privacy-microphone'));
  handle('camera:authorize', async () => {
    // A fake Chromium camera needs no system device or macOS privacy prompt.
    if (!isMac || app.commandLine.hasSwitch('use-fake-device-for-media-stream')) return true;
    const status = systemPreferences.getMediaAccessStatus('camera');
    if (status === 'granted') return true;
    if (status === 'denied' || status === 'restricted') return false;
    return systemPreferences.askForMediaAccess('camera');
  });
  handle('camera:settings', () => shell.openExternal(isMac
    ? 'x-apple.systempreferences:com.apple.preference.security?Privacy_Camera'
    : 'ms-settings:privacy-webcam'));
  handle('window:action', (action) => {
    if (action === 'minimize') mainWindow.minimize();
    if (action === 'maximize') mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
    if (action === 'close') mainWindow.close();
  });
}

function setupProtocol() {
  protocol.handle('lumi', async (request) => {
    try {
      const u = new URL(request.url);
      if (u.host !== 'app' || request.method !== 'GET') return new Response('Forbidden', { status: 403 });
      const pathname = decodeURIComponent(u.pathname);
      const media = /^\/(photo|thumb|video)\/([0-9a-f-]+)\.(png|jpg|mp4|webm)$/.exec(pathname);
      if (media) {
        assertId(media[2]);
        const file = media[1] === 'photo' ? photoPath(media[2]) : media[1] === 'thumb' ? thumbPath(media[2]) : path.join(photoDir,media[2]+'.'+media[3]);
        return net.fetch(pathToFileURL(file).toString(), {headers: request.headers});
      }
      const filename = pathname === '/' ? 'index.html' : pathname.slice(1);
      const target = path.resolve(sourceDir, filename);
      if (!target.startsWith(sourceDir + path.sep)) return new Response('Forbidden', { status: 403 });
      return net.fetch(pathToFileURL(target).toString());
    } catch { return new Response('Not found', { status: 404 }); }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1480, height: 960, minWidth: 980, minHeight: 720,
    show: false, backgroundColor: '#f6f3ed', frame: isMac,
    ...(isMac ? { titleBarStyle: 'hidden', trafficLightPosition: { x: 16, y: 8 } } : {}),
    title: '拾光相机 · SnapJoy',
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
      backgroundThrottling: false, webSecurity: true, devTools: !app.isPackaged
    }
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => { if (!trusted(url)) event.preventDefault(); });
  mainWindow.webContents.on('will-prevent-unload', (event) => {
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'question', title: '还有一个瞬间没保存',
      message: '正在拍摄或有照片、视频尚未保存，仍要关闭吗？',
      detail: '请先停止录像并保存；强制关闭会中断当前作品。',
      buttons: ['继续拍摄 / 保存', '仍然关闭'], defaultId: 0, cancelId: 0
    });
    if (choice === 1) event.preventDefault();
  });
  mainWindow.once('ready-to-show', () => { if (!isTest) mainWindow.show(); });
  mainWindow.on('closed', () => { microphoneAllowed = false; clearVideoSessions(); mainWindow = null; });
  mainWindow.loadURL(APP_URL);
}

if (!isTest && !app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => {
    if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); }
  });
  app.whenReady().then(() => {
    photoDir = isTest ? path.join(app.getPath('userData'), 'photos') : path.join(app.getPath('pictures'), '拾光相机');
    libraryFile = path.join(photoDir, '.library.json');
    Menu.setApplicationMenu(isMac ? Menu.buildFromTemplate([
      { role: 'appMenu' }, { role: 'editMenu' }, { role: 'windowMenu' }
    ]) : null);
    session.defaultSession.setPermissionRequestHandler((contents, permission, callback, details) => {
      callback(contents === mainWindow?.webContents && trusted(details.requestingUrl) &&
        permission === 'media' && details.mediaTypes?.length > 0 && details.mediaTypes.every((type) => type === 'video' || (type === 'audio' && microphoneAllowed)));
    });
    session.defaultSession.setPermissionCheckHandler((contents, permission, origin, details) =>
      contents === mainWindow?.webContents && permission === 'media' &&
      trusted(origin || details.securityOrigin) && (details.mediaType === 'video' || (details.mediaType === 'audio' && microphoneAllowed))
    );
    setupProtocol();
    setupHandlers();
    createWindow();
  }).catch((error) => {
    dialog.showErrorBox('拾光相机无法启动', error.message);
    app.quit();
  });
  app.on('activate', () => {
    if (app.isReady() && BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  app.on('window-all-closed', () => { if (!isMac) app.quit(); });
}
