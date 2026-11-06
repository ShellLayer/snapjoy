import { EFFECTS, EffectRenderer, BasicRenderer, createSample } from './effects.js';
import { hydrateIcons, icon } from './icons.js';
import { STICKERS, STICKER_CATEGORIES, FRAMES, DecorationScene, stickerById, stickerImage, drawFrame } from './stickers.js';
import { FaceTracker } from './face-tracker.js';

const $ = (id) => document.getElementById(id);
hydrateIcons();
const api = window.booth;
const isMac = api.platform === 'darwin';
document.documentElement.classList.toggle('platform-mac', isMac);
if (isMac) {
  $('cameraSettings').textContent = '打开 Mac 摄像头设置';
  $('helpCameraSettings').firstChild.textContent = '摄像头打不开？查看 Mac 隐私设置';
  $('deleteRecoveryHint').textContent = '需要时可以从 Mac 废纸篓恢复原图。';
  $('deleteConfirmation').querySelector('p').textContent = '将这张照片移到废纸篓？';
  $('confirmDelete').textContent = '移到废纸篓';
}
const video = $('cameraVideo');
let preview = $('preview');
const sample = createSample();
const thumbCanvas = document.createElement('canvas');
let renderer, thumbRenderer, basicMode = false;
let activeStream = null, cameraRequest = 0, connecting = false, running = false;
let animation = 0, lastFrame = 0, lastThumbnails = 0;
let category = 'all', photos = [], selectedPhotoId = null, captureTask = null;
let panel = 'effects', stickerCategory = 'all', drag = null;
let pendingPhoto = null, toastTimeout, galleryAvailable = true;
const thumbnails = new Map();
const decorationCanvas = $('decorationCanvas');
const decorationContext = decorationCanvas.getContext('2d');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene = new DecorationScene(() => {
  try { localStorage.setItem('lumi:scene:v1', JSON.stringify(scene.snapshot())); } catch {}
  updateDecorControls(); drawDecorations();
});
try { scene.restore(JSON.parse(localStorage.getItem('lumi:scene:v1') || '{}')); } catch {}
const tracker = new FaceTracker((face) => { scene.face = face; updateFaceStatus(); drawDecorations(); }, updateFaceStatus);
const settings = { effect: 0, intensity: 75, mirror: true, timer: 3, mode: 'single', grid: false };
try {
  const saved = JSON.parse(localStorage.getItem('lumi:settings') || '{}');
  if (EFFECTS.some((e) => e.id === saved.effect)) settings.effect = saved.effect;
  if (Number.isFinite(saved.intensity)) settings.intensity = Math.min(100, Math.max(0, saved.intensity));
  if (typeof saved.mirror === 'boolean') settings.mirror = saved.mirror;
  if ([0,3,5,10].includes(saved.timer)) settings.timer = saved.timer;
  if (saved.mode === 'strip') settings.mode = 'strip';
  if (typeof saved.grid === 'boolean') settings.grid = saved.grid;
} catch { /* A corrupt preference must never prevent opening the camera. */ }
const persist = () => { try { localStorage.setItem('lumi:settings', JSON.stringify(settings)); } catch {} };

function initializeRenderers() {
  try {
    renderer = new EffectRenderer(preview);
    thumbRenderer = new EffectRenderer(thumbCanvas);
  } catch {
    basicMode = true;
    const replacement = preview.cloneNode();
    preview.replaceWith(replacement); preview = replacement;
    renderer = new BasicRenderer(preview);
    thumbRenderer = new BasicRenderer(document.createElement('canvas'));
    if (!EFFECTS[settings.effect].css) settings.effect = 0;
    $('effectsPreviewNote').textContent = '兼容模式 · 部分特效需要显卡支持';
    toast('已启用兼容模式，可用 ' + EFFECTS.filter(e=>e.css).length + ' 种效果，贴纸和相框照常使用。', true);
  }
  preview.addEventListener('webglcontextlost', (event) => {
    event.preventDefault(); stopCamera();
    showCameraMessage('特效暂时中断', '显卡连接已重置。请关闭并重新打开拾光相机。', false);
    $('startCamera').disabled = true;
  });
}

function toast(message, error = false, retry = false) {
  clearTimeout(toastTimeout);
  $('toastText').textContent = message;
  $('toast').classList.toggle('error', error);
  $('toast').hidden = false;
  $('toastRetry').hidden = !retry;
  if (!retry) toastTimeout = setTimeout(() => { $('toast').hidden = true; }, error ? 8000 : 3800);
}
function showCameraMessage(title, description, settingsLink = false) {
  $('welcome').hidden = false;
  $('welcomeTitle').textContent = title;
  $('welcomeDescription').textContent = description;
  $('startCamera').querySelectorAll('span')[1].textContent = '重试摄像头';
  $('cameraSettings').hidden = !settingsLink;
  $('welcomeFootnote').textContent = '照片与画面始终留在本机';
}
function setCameraStatus(label, active) {
  $('cameraStatus').querySelector('span').textContent = label;
  $('cameraStatus').classList.toggle('on', active);
}
function updateControls() {
  const busy = !!captureTask;
  $('shutter').disabled = !running || busy || !galleryAvailable || !!pendingPhoto;
  $('startCamera').disabled = connecting;
  $('powerButton').disabled = !running && !connecting;
  $('cameraSelect').disabled = busy || connecting;
  $('timerSelect').disabled = busy;
  $('mirrorButton').disabled = busy;
  $('intensity').disabled = busy || settings.effect === 0;
  $('intensityValue').textContent = settings.effect === 0 ? '原片' : settings.intensity + '%';
  $('mirrorButton').setAttribute('aria-pressed', String(settings.mirror));
  $('mirrorButton').classList.toggle('selected', settings.mirror);
  $('gridButton').setAttribute('aria-pressed', String(settings.grid));
  $('gridOverlay').hidden = !settings.grid || !running;
  $('previewHud').hidden = !running;
  decorationCanvas.hidden = !running;
  $('activeEffectBadge').textContent = EFFECTS[settings.effect].name;
  $('effectDescription').textContent = EFFECTS[settings.effect].description;
  $('shutterHint').textContent = busy ? '正在留住这一刻…' : settings.mode === 'strip' ? '连拍四张 · 合成照片条' : '按空格键拍照';
  document.querySelectorAll('.mode-button').forEach((button) => {
    button.disabled = busy;
    const active = button.dataset.mode === settings.mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('.effect-card').forEach((button) => {
    button.disabled = busy || (basicMode && !EFFECTS[Number(button.dataset.effect)].css);
    button.classList.toggle('active', Number(button.dataset.effect) === settings.effect);
    button.setAttribute('aria-pressed', String(Number(button.dataset.effect) === settings.effect));
  });
  updateDecorControls();
}

function buildEffects() {
  const grid = $('effectGrid'); grid.replaceChildren(); thumbnails.clear();
  const query = $('catalogSearch').value.trim().toLowerCase();
  EFFECTS.filter((effect) => (category === 'all' || effect.category === category) && (effect.name + ' ' + effect.en).toLowerCase().includes(query)).forEach((effect) => {
    const button = document.createElement('button');
    button.className = 'effect-card';
    button.dataset.effect = effect.id;
    button.title = effect.description;
    button.setAttribute('aria-label', effect.name);
    const thumb = document.createElement('div'); thumb.className = 'effect-thumb';
    const canvas = document.createElement('canvas'); canvas.width = 240; canvas.height = 180;
    canvas.setAttribute('aria-hidden', 'true'); thumb.append(canvas);
    const check = document.createElement('span'); check.className = 'effect-check'; check.innerHTML = icon('check'); thumb.append(check);
    const label = document.createElement('span'); label.className = 'effect-card-label'; label.textContent = effect.name;
    const en = document.createElement('small'); en.textContent = effect.en; label.append(en);
    button.append(thumb, label); grid.append(button);
    thumbnails.set(effect.id, canvas);
    button.addEventListener('click', () => {
      settings.effect = effect.id; persist(); updateControls();
      if (running) renderMain();
    });
  });
  updateControls(); renderThumbnails();
}
function renderThumbnails() {
  if (panel !== 'effects') return;
  const source = running && video.readyState >= 2 ? video : sample;
  thumbRenderer.upload(source);
  const scrollRect = document.querySelector('.effect-scroll').getBoundingClientRect();
  for (const [id, target] of thumbnails) {
    const rect = target.getBoundingClientRect();
    if (running && (rect.bottom < scrollRect.top || rect.top > scrollRect.bottom)) continue;
    thumbRenderer.draw(id, settings.intensity / 100, running && settings.mirror, 240, 180, reduceMotion ? 0 : performance.now()/1000);
    target.getContext('2d').drawImage(thumbRenderer.canvas, 0, 0, 240, 180);
  }
}
function resolution() {
  const width = Math.min(video.videoWidth, video.videoHeight * 4/3, 1920);
  const w = Math.max(4, Math.floor(width / 4) * 4);
  return [w, w * 3 / 4];
}
function renderMain() {
  if (!running || video.readyState < 2) return;
  renderer.upload(video);
  const [width, height] = resolution();
  renderer.draw(settings.effect, settings.intensity / 100, settings.mirror, width, height, reduceMotion ? 0 : performance.now()/1000);
  drawDecorations();
}
function loop(time) {
  if (!running) return;
  if (time - lastFrame >= 32) { renderMain(); lastFrame = time; }
  if (time - lastThumbnails >= 240) { renderThumbnails(); lastThumbnails = time; }
  if (scene.nodes.some(n=>n.follow)) tracker.step(video, settings.mirror, time);
  animation = requestAnimationFrame(loop);
}
async function refreshDevices() {
  try {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput');
    const current = activeStream?.getVideoTracks()[0]?.getSettings().deviceId || $('cameraSelect').value;
    $('cameraSelect').replaceChildren();
    if (!devices.length) $('cameraSelect').add(new Option('系统默认摄像头', ''));
    devices.forEach((d, i) => $('cameraSelect').add(new Option(d.label || '摄像头 ' + (i + 1), d.deviceId)));
    if (devices.some((d) => d.deviceId === current)) $('cameraSelect').value = current;
  } catch { /* Enumeration is optional; default camera still works. */ }
}
function releaseStream() {
  running = false;
  cancelAnimationFrame(animation);
  const previous = activeStream; activeStream = null;
  previous?.getTracks().forEach((track) => track.stop());
  video.srcObject = null;
  tracker.reset();
}
function stopCamera() {
  cameraRequest++;
  connecting = false;
  if (captureTask) captureTask.cancelled = true;
  releaseStream();
  $('welcome').hidden = false;
  $('welcomeTitle').textContent = '歇一会儿，也很好。';
  $('welcomeDescription').textContent = '摄像头已关闭，准备好后再记录下一刻。';
  $('startCamera').querySelectorAll('span')[1].textContent = '开启摄像头';
  $('cameraSettings').hidden = true;
  $('resolutionLabel').textContent = '照片自动保存';
  setCameraStatus('相机已关闭', false); updateControls(); renderThumbnails();
  if (!basicMode) $('effectsPreviewNote').textContent = '开启相机后，实时预览每一种特效';
}
async function startCamera(deviceId = '') {
  const request = ++cameraRequest;
  releaseStream(); connecting = true; updateControls();
  setCameraStatus('正在连接…', false);
  $('startCamera').querySelectorAll('span')[1].textContent = '正在开启…';
  let stream;
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('摄像头服务不可用，请重新打开软件。');
    const authorized = await api.requestCameraAccess();
    if (request !== cameraRequest) return;
    if (!authorized) throw new DOMException('Camera permission denied', 'NotAllowedError');
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30, max: 30 }, ...(deviceId ? { deviceId: { exact: deviceId } } : {}) },
      audio: false
    });
    if (request !== cameraRequest) { stream.getTracks().forEach((t) => t.stop()); return; }
    activeStream = stream; video.srcObject = stream;
    await video.play();
    if (request !== cameraRequest) { stream.getTracks().forEach((t) => t.stop()); return; }
    if (!video.videoWidth || !video.videoHeight) throw new Error('摄像头还没有传来画面，请重试。');
    running = true;
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      if (activeStream !== stream) return;
      stopCamera(); showCameraMessage('摄像头断开了', '重新连接摄像头，然后点击重试。');
      setCameraStatus('相机已断开', false);
    }, { once: true });
    $('welcome').hidden = true;
    $('cameraSettings').hidden = true;
    const [w, h] = resolution(); $('resolutionLabel').textContent = w + ' × ' + h + ' · 本地保存';
    setCameraStatus('正在取景', true);
    if (!basicMode) $('effectsPreviewNote').textContent = '实时预览 · 点击试试不同的自己';
    renderMain(); renderThumbnails(); animation = requestAnimationFrame(loop);
    await refreshDevices();
  } catch (error) {
    stream?.getTracks().forEach((t) => t.stop());
    if (request !== cameraRequest) return;
    releaseStream();
    const messages = {
      NotAllowedError: ['需要开启摄像头权限', isMac
        ? '在系统设置 → 隐私与安全性 → 摄像头中允许拾光相机，然后退出并重新打开软件。'
        : '在 Windows 设置里允许桌面应用访问摄像头，然后回来重试。', true],
      NotFoundError: ['还没找到摄像头', '请连接内置或 USB 摄像头，并确认设备已启用。', false],
      NotReadableError: ['摄像头暂时打不开', '请关闭正在占用摄像头的会议或拍照软件，再试一次。', true],
      OverconstrainedError: ['这台摄像头暂不可用', '请重新选择摄像头，或拔插 USB 摄像头后再试。', false],
      AbortError: ['连接暂时中断了', '请检查摄像头连接，然后点击重试。', false]
    };
    showCameraMessage(...(messages[error.name] || ['摄像头未能开启', error.message || '请检查连接后重试。', false]));
    setCameraStatus('等待连接', false);
  } finally {
    if (request === cameraRequest) { connecting = false; updateControls(); }
  }
}

function wait(ms, task) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const tick = () => {
      if (task.cancelled || !running) return reject(new Error('cancelled'));
      if (performance.now() - start >= ms) return resolve();
      setTimeout(tick, Math.min(50, ms));
    };
    tick();
  });
}
async function countdown(seconds, label, task) {
  $('countdownLabel').textContent = label;
  for (let n = seconds; n > 0; n--) {
    $('countdownOverlay').hidden = false;
    $('countdownNumber').textContent = n;
    $('countdownNumber').classList.remove('pulse');
    void $('countdownNumber').offsetWidth;
    $('countdownNumber').classList.add('pulse');
    await wait(1000, task);
  }
  $('countdownOverlay').hidden = true;
}
function captureFrame() {
  if (!running || video.readyState < 2) throw new Error('摄像头画面已中断，请重试。');
  renderMain();
  const canvas = document.createElement('canvas');
  canvas.width = preview.width; canvas.height = preview.height;
  const context = canvas.getContext('2d');
  context.drawImage(preview, 0, 0);
  // Use the same already-composited layer shown in the viewfinder. Capture mode
  // hides editing guides before this frame is rendered.
  context.drawImage(decorationCanvas, 0, 0);
  $('flashOverlay').classList.remove('flash');
  void $('flashOverlay').offsetWidth;
  $('flashOverlay').classList.add('flash');
  return canvas;
}
function makeStrip(frames) {
  const width = frames[0].width, height = frames[0].height;
  const border = Math.max(20, Math.round(width * .035));
  const footer = Math.round(width * .17);
  const strip = document.createElement('canvas');
  strip.width = width + 2 * border;
  strip.height = height * 4 + border * 5 + footer;
  const c = strip.getContext('2d');
  c.fillStyle = '#f6f1e5'; c.fillRect(0, 0, strip.width, strip.height);
  frames.forEach((frame, i) => c.drawImage(frame, border, border + i * (height + border)));
  const y = strip.height - footer * .63;
  c.textAlign = 'center'; c.fillStyle = '#526047';
  c.font = Math.round(width * .05) + 'px Georgia'; c.fillText('SNAPJOY', strip.width/2, y);
  c.fillStyle = '#92977f'; c.font = Math.round(width * .022) + 'px Segoe UI';
  c.fillText(new Intl.DateTimeFormat('zh-CN', { year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date()) + '  ·  LITTLE MOMENTS, BIG MEMORIES', strip.width/2, y + width*.046);
  return strip;
}
async function savePending() {
  if (!pendingPhoto) return;
  $('toastRetry').disabled = true;
  try {
    const result = await api.savePhoto(pendingPhoto);
    photos.unshift(result); pendingPhoto = null; galleryAvailable = true;
    renderGallery(); toast('已保存到本地相册，留住一个好时光。');
  } catch (error) {
    toast('保存未成功，照片暂留在窗口中。请检查磁盘空间后重试。', true, true);
  } finally { $('toastRetry').disabled = false; updateControls(); }
}
async function capture() {
  if (!running || captureTask || pendingPhoto || !galleryAvailable || document.querySelector('dialog[open]')) return;
  const task = { cancelled: false }; captureTask = task;
  updateControls(); $('cancelCapture').hidden = false;
  const count = settings.mode === 'strip' ? 4 : 1;
  $('burstProgress').hidden = count === 1;
  $('burstProgress').innerHTML = '<i></i>'.repeat(count);
  const frames = [];
  try {
    for (let i = 0; i < count; i++) {
      const seconds = i === 0 ? settings.timer : Math.max(1, settings.timer);
      await countdown(seconds, count > 1 ? '第 ' + (i+1) + ' / 4 张 · 换个表情吧' : '准备好，留住这一刻', task);
      if (task.cancelled || !running) throw new Error('cancelled');
      frames.push(captureFrame());
      $('burstProgress').children[i].classList.add('done');
      if (i < count - 1) await wait(320, task);
    }
    const output = count > 1 ? makeStrip(frames) : frames[0];
    pendingPhoto = {
      data: output.toDataURL('image/png'), effect: EFFECTS[settings.effect].name, mode: settings.mode,
      stickers: scene.nodes.map(n=>stickerById(n.stickerId).name),
      frame: scene.frame==='none' ? '' : FRAMES.find(f=>f.id===scene.frame).name
    };
    $('cancelCapture').hidden = true;
    await savePending();
  } catch (error) {
    toast(error.message === 'cancelled' ? '已取消拍摄。' : error.message, error.message !== 'cancelled');
  } finally {
    $('countdownOverlay').hidden = true; $('cancelCapture').hidden = true; $('burstProgress').hidden = true;
    captureTask = null; updateControls();
  }
}

function photoDate(photo, withTime = false) {
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', ...(withTime ? {hour:'2-digit', minute:'2-digit'} : {}) }).format(new Date(photo.createdAt));
}
function createPhotoButton(photo, album = false) {
  const button = document.createElement('button'); button.className = album ? 'album-photo' : 'recent-photo';
  button.dataset.mode = photo.mode; button.dataset.photoId = photo.id;
  button.setAttribute('aria-label', '查看' + photo.effect + '照片，' + photoDate(photo, true));
  const img = document.createElement('img'); img.src = photo.thumbnail; img.alt = photo.effect; img.loading = 'lazy';
  img.addEventListener('error', () => { if (img.src !== photo.url) img.src = photo.url; }, { once: true });
  button.append(img);
  if (album) {
    const title = document.createElement('p'); title.textContent = photo.effect + (photo.mode === 'strip' ? ' · 四连拍' : '') + (photo.stickers?.length ? ' · 贴纸' : '');
    const date = document.createElement('small'); date.textContent = photoDate(photo, true) + '  /  ' + photo.width + ' × ' + photo.height;
    button.append(title, date);
  } else {
    const date = document.createElement('span'); date.textContent = photoDate(photo) + ' · ' + photo.effect; button.append(date);
  }
  button.addEventListener('click', () => showPhoto(photo.id));
  return button;
}
function renderGallery() {
  $('recentCount').textContent = photos.length;
  $('albumCount').textContent = photos.length;
  $('dialogPhotoCount').textContent = photos.length;
  $('emptyGallery').hidden = photos.length > 0;
  $('albumEmpty').hidden = photos.length > 0;
  $('recentPhotos').replaceChildren(...photos.slice(0, 10).map((p) => createPhotoButton(p)));
  if ($('albumDialog').open) $('albumGrid').replaceChildren(...photos.map((p) => createPhotoButton(p, true)));
}
async function loadGallery() {
  try {
    const result = await api.listPhotos(); photos = result.photos; galleryAvailable = true;
    $('folderButton').title = result.folder;
    renderGallery();
  } catch (error) {
    galleryAvailable = false;
    toast(error.message.replace(/^Error invoking remote method '[^']+': (Error: )?/, ''), true);
  }
  updateControls();
}
function showPhoto(id) {
  const photo = photos.find((p) => p.id === id); if (!photo) return;
  selectedPhotoId = id;
  $('fullPhoto').src = photo.url;
  $('photoInfo').textContent = photo.effect + (photo.stickers?.length ? ' · '+photo.stickers.length+' 张贴纸' : '') + (photo.frame ? ' · '+photo.frame : '') + '  ·  ' + photoDate(photo, true) + '  ·  ' + photo.width + ' × ' + photo.height;
  $('deleteConfirmation').hidden = true;
  $('previousPhoto').disabled = photos.indexOf(photo) === 0;
  $('nextPhoto').disabled = photos.indexOf(photo) === photos.length - 1;
  if (!$('photoDialog').open) $('photoDialog').showModal();
}
function movePhoto(direction) {
  const index = photos.findIndex((p) => p.id === selectedPhotoId);
  if (photos[index + direction]) showPhoto(photos[index + direction].id);
}
async function safeAction(action) {
  try { return await action(); } catch (error) { toast('操作未完成：' + error.message.replace(/^Error invoking remote method '[^']+': (Error: )?/, ''), true); }
}

$('startCamera').addEventListener('click', () => startCamera($('cameraSelect').value));
$('powerButton').addEventListener('click', stopCamera);
$('cameraSelect').addEventListener('change', () => { if (running) startCamera($('cameraSelect').value); });
$('shutter').addEventListener('click', capture);
$('cancelCapture').addEventListener('click', () => { if (captureTask) captureTask.cancelled = true; });
$('toastRetry').addEventListener('click', savePending);
$('intensity').value = settings.intensity;
$('intensity').addEventListener('input', (e) => {
  settings.intensity = Number(e.target.value); updateControls(); renderThumbnails();
  if (running) renderMain();
  persist();
});
$('timerSelect').value = settings.timer;
$('timerSelect').addEventListener('change', (e) => { settings.timer = Number(e.target.value); persist(); });
$('mirrorButton').addEventListener('click', () => { settings.mirror = !settings.mirror; tracker.reset(); persist(); updateControls(); renderThumbnails(); if (running) renderMain(); });
$('gridButton').addEventListener('click', () => { settings.grid = !settings.grid; persist(); updateControls(); });
document.querySelectorAll('.mode-button').forEach((button) => button.addEventListener('click', () => { settings.mode = button.dataset.mode; persist(); updateControls(); }));
document.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => {
  category = button.dataset.category;
  document.querySelectorAll('[data-category]').forEach((b) => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  buildEffects();
  updateCatalogEmpty();
}));
$('albumButton').addEventListener('click', async () => { await loadGallery(); $('albumDialog').showModal(); renderGallery(); });
$('helpButton').addEventListener('click', () => $('helpDialog').showModal());
document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => $(button.dataset.close).close()));
document.querySelectorAll('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
  const r = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
}));
document.querySelectorAll('[data-window]').forEach((button) => button.addEventListener('click', () => api.windowAction(button.dataset.window)));
['folderButton','albumFolder'].forEach((id) => $(id).addEventListener('click', () => safeAction(() => api.openFolder())));
['cameraSettings','helpCameraSettings'].forEach((id) => $(id).addEventListener('click', () => safeAction(() => api.openCameraSettings())));
$('previousPhoto').addEventListener('click', () => movePhoto(-1));
$('nextPhoto').addEventListener('click', () => movePhoto(1));
$('showPhoto').addEventListener('click', () => safeAction(() => api.showPhoto(selectedPhotoId)));
$('exportPhoto').addEventListener('click', async () => {
  $('exportPhoto').disabled = true;
  const exported = await safeAction(() => api.exportPhoto(selectedPhotoId));
  if (exported) toast('照片已另存。');
  $('exportPhoto').disabled = false;
});
$('deletePhoto').addEventListener('click', () => { $('deleteConfirmation').hidden = false; $('cancelDelete').focus(); });
$('cancelDelete').addEventListener('click', () => { $('deleteConfirmation').hidden = true; $('deletePhoto').focus(); });
$('confirmDelete').addEventListener('click', async () => {
  $('confirmDelete').disabled = true;
  const deletingId = selectedPhotoId;
  const deleted = await safeAction(() => api.deletePhoto(deletingId));
  if (deleted) {
    const index = photos.findIndex((p) => p.id === deletingId);
    photos = photos.filter((p) => p.id !== deletingId); renderGallery();
    if (selectedPhotoId === deletingId) {
      if (photos.length) showPhoto(photos[Math.min(index, photos.length - 1)].id);
      else $('photoDialog').close();
    }
    toast(isMac ? '已移到废纸篓。' : '已移到回收站。');
  }
  $('confirmDelete').disabled = false;
});
$('photoDialog').addEventListener('cancel', (event) => {
  if (!$('deleteConfirmation').hidden) { event.preventDefault(); $('deleteConfirmation').hidden = true; }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && captureTask) { captureTask.cancelled = true; event.preventDefault(); return; }
  if (event.repeat || /INPUT|SELECT|TEXTAREA/.test(event.target.tagName)) return;
  if (!document.querySelector('dialog[open]') && !captureTask && panel === 'stickers') {
    if (event.key === 'Delete' && scene.current) { event.preventDefault(); scene.remove(); return; }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); scene.undo(); return; }
  }
  if (event.code === 'Space' && running && !document.querySelector('dialog[open]')) { event.preventDefault(); capture(); }
  if ($('photoDialog').open && $('deleteConfirmation').hidden) {
    if (event.key === 'ArrowLeft') movePhoto(-1);
    if (event.key === 'ArrowRight') movePhoto(1);
  }
});
window.addEventListener('beforeunload', (event) => {
  if (pendingPhoto || captureTask) { event.preventDefault(); event.returnValue = false; }
});
window.addEventListener('unload', () => { releaseStream(); tracker.close(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && captureTask) captureTask.cancelled = true; });
navigator.mediaDevices?.addEventListener('devicechange', refreshDevices);
document.querySelector('.brand').addEventListener('click', (event) => event.preventDefault());
// Keep the composition guides over the image, excluding any letterboxing.
new ResizeObserver(() => {
  const width = $('viewfinder').clientWidth, height = $('viewfinder').clientHeight;
  const displayedWidth = Math.min(width, height * 4/3), displayedHeight = displayedWidth * 3/4;
  $('gridOverlay').style.left = (width-displayedWidth)/2 + 'px';
  $('gridOverlay').style.right = (width-displayedWidth)/2 + 'px';
  $('gridOverlay').style.top = (height-displayedHeight)/2 + 'px';
  $('gridOverlay').style.bottom = (height-displayedHeight)/2 + 'px';
  decorationCanvas.style.width = displayedWidth + 'px';
  decorationCanvas.style.height = displayedHeight + 'px';
  decorationCanvas.style.left = (width-displayedWidth)/2 + 'px';
  decorationCanvas.style.top = (height-displayedHeight)/2 + 'px';
}).observe($('viewfinder'));

function drawDecorations() {
  if (!running) return;
  if (decorationCanvas.width !== preview.width || decorationCanvas.height !== preview.height) {
    decorationCanvas.width = preview.width; decorationCanvas.height = preview.height;
  }
  decorationContext.clearRect(0,0,decorationCanvas.width,decorationCanvas.height);
  scene.draw(decorationContext,decorationCanvas.width,decorationCanvas.height,panel === 'stickers' && !captureTask);
}
function updateFaceStatus() {
  $('faceStatus').title = tracker.lastError || '';
  if (!scene.nodes.some(n=>n.follow)) { $('faceStatus').textContent=''; return; }
  $('faceStatus').textContent = !running ? '开启摄像头后，头饰可跟着你动。' :
    tracker.status==='loading' || tracker.status==='idle' ? '正在准备本地人脸跟随…' :
    tracker.status==='error' ? '跟随暂不可用，仍可拖动贴纸手动摆放。' :
    scene.face ? '● 正在跟随主要人脸 · 全程本地处理' :
    '正在寻找人脸 · 贴纸暂固定，可拖动改为手动';
}
function updateDecorControls() {
  const busy=!!captureTask,n=scene.current;
  for(const id of ['randomLook','resetLook','undoSticker','clearStickers','removeSticker','stickerSize','stickerRotation','followFace','duplicateSticker','frontSticker'])$(id).disabled=busy;
  $('undoSticker').disabled=busy||!scene.history.length;
  $('clearStickers').disabled=busy||!scene.nodes.length;
  $('placedCount').textContent=scene.nodes.length;
  $('stickerEditor').hidden=!n;
  $('stickerHint').hidden=!!n;
  if(n){
    $('selectedStickerName').textContent=stickerById(n.stickerId).name;
    $('stickerSize').min=n.follow?'35':'7';$('stickerSize').max=n.follow?'250':'95';
    $('stickerSize').value=Math.round((n.follow?n.scale:n.width)*100);
    $('stickerSizeValue').textContent=$('stickerSize').value+'%';
    $('stickerRotation').value=Math.round(n.rotation*180/Math.PI);
    $('stickerRotationValue').textContent=$('stickerRotation').value+'°';
    $('followFace').checked=n.follow;
  }
  $('selectedFrameName').textContent='当前：'+FRAMES.find(f=>f.id===scene.frame).name;
  document.querySelectorAll('.sticker-card').forEach(button=>{
    button.disabled=busy;
    const count=scene.nodes.filter(n=>n.stickerId===button.dataset.sticker).length;
    button.classList.toggle('placed',count>0);
    button.querySelector('.sticker-count').textContent=count||'';
  });
  document.querySelectorAll('.frame-card').forEach(button=>{
    button.disabled=busy;button.classList.toggle('active',button.dataset.frame===scene.frame);
    button.setAttribute('aria-pressed',String(button.dataset.frame===scene.frame));
  });
  updateFaceStatus();
}
function updateCatalogEmpty() {
  const id=panel==='effects'?'effectGrid':panel==='stickers'?'stickerGrid':'frameGrid';
  $('noCatalogResults').hidden=$(id).children.length>0;
}
function buildStickers() {
  const query=$('catalogSearch').value.trim().toLowerCase();
  $('stickerGrid').replaceChildren();
  for(const def of STICKERS.filter(s=>(stickerCategory==='all'||s.category===stickerCategory)&&(s.name+' '+s.id).toLowerCase().includes(query))){
    const button=document.createElement('button');button.className='sticker-card';button.dataset.sticker=def.id;
    button.title=def.name+(def.anchor?' · 默认跟随人脸':' · 可拖动摆放');button.setAttribute('aria-label','添加'+def.name);
    const canvas=document.createElement('canvas');canvas.width=150;canvas.height=120;
    const asset=stickerImage(def),c=canvas.getContext('2d');
    const size=Math.min(125,104*def.aspect),height=size/def.aspect;c.drawImage(asset,(150-size)/2,(120-height)/2,size,height);
    const label=document.createElement('span');label.textContent=def.name;
    const count=document.createElement('b');count.className='sticker-count';
    button.append(canvas,label,count);
    if(def.anchor){const badge=document.createElement('i');badge.textContent='跟随';button.append(badge);}
    button.addEventListener('click',()=>{if(captureTask)return;if(!scene.add(def.id))toast('最多同时叠加 20 张贴纸，先移除一张再试。');});
    $('stickerGrid').append(button);
  }
  updateDecorControls();updateCatalogEmpty();
}
function buildFrames() {
  const query=$('catalogSearch').value.trim();
  $('frameGrid').replaceChildren();
  for(const frame of FRAMES.filter(f=>f.name.includes(query))){
    const button=document.createElement('button');button.className='frame-card';button.dataset.frame=frame.id;
    button.setAttribute('aria-label',frame.name+'相框');
    const canvas=document.createElement('canvas');canvas.width=240;canvas.height=180;
    const c=canvas.getContext('2d');c.drawImage(sample,0,0,240,180);drawFrame(c,frame.id,240,180);
    const label=document.createElement('span');label.textContent=frame.name;button.append(canvas,label);
    button.addEventListener('click',()=>{if(!captureTask)scene.setFrame(frame.id);});
    $('frameGrid').append(button);
  }
  updateDecorControls();updateCatalogEmpty();
}
function switchPanel(next) {
  panel=next;$('catalogSearch').value='';
  $('catalogSearch').placeholder=next==='effects'?'搜索特效，例如：大头':next==='stickers'?'搜索贴纸，例如：兔、眼镜':'搜索相框，例如：生日';
  document.querySelectorAll('[data-panel]').forEach(b=>{b.classList.toggle('active',b.dataset.panel===next);b.setAttribute('aria-pressed',String(b.dataset.panel===next));});
  for(const [id,show] of [['effectTabs',next==='effects'],['stickerTabs',next==='stickers'],['effectGrid',next==='effects'],['stickerGrid',next==='stickers'],['frameGrid',next==='frames'],['effectSettings',next==='effects'],['stickerSettings',next==='stickers'],['frameSettings',next==='frames']])$(id).hidden=!show;
  document.querySelector('.effect-scroll').scrollTop=0;
  if(next==='effects')buildEffects();else if(next==='stickers')buildStickers();else buildFrames();
  updateCatalogEmpty();drawDecorations();
}
document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>switchPanel(b.dataset.panel)));
$('catalogSearch').addEventListener('input',()=>{if(panel==='effects')buildEffects();else if(panel==='stickers')buildStickers();else buildFrames();updateCatalogEmpty();});
for(const [id,name] of STICKER_CATEGORIES){
  const button=document.createElement('button');button.dataset.stickerCategory=id;button.textContent=name;
  button.classList.toggle('active',id==='all');button.setAttribute('aria-pressed',String(id==='all'));
  button.addEventListener('click',()=>{
    stickerCategory=id;document.querySelectorAll('[data-sticker-category]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
    buildStickers();
  });$('stickerTabs').append(button);
}
$('stickerSize').addEventListener('input',()=>{if(!captureTask&&scene.current)scene.update(scene.current.follow?{scale:Number($('stickerSize').value)/100}:{width:Number($('stickerSize').value)/100});});
$('stickerRotation').addEventListener('input',()=>{if(!captureTask)scene.update({rotation:Number($('stickerRotation').value)*Math.PI/180});});
$('followFace').addEventListener('change',()=>{
  if(captureTask||!scene.current)return;
  const follow=$('followFace').checked,p=scene.placement(scene.current);
  scene.update(follow?{follow:true,scale:1,rotation:0}:{follow:false,x:p.x,y:p.y,width:Math.min(.95,p.width),rotation:p.rotation});
});
for(const [id,method] of [['removeSticker','remove'],['clearStickers','clear'],['undoSticker','undo'],['duplicateSticker','duplicate'],['frontSticker','bringToFront']])$(id).addEventListener('click',()=>{if(!captureTask)scene[method]();});
$('resetLook').addEventListener('click',()=>{
  if(captureTask)return;
  scene.remember();scene.nodes=[];scene.frame='none';scene.selected=null;scene.changed();
  settings.effect=0;settings.intensity=75;$('intensity').value=75;persist();updateControls();renderThumbnails();if(running)renderMain();
  toast('已恢复原片，可以重新搭配啦。');
});
const looks=[
  {effect:19,frame:'candy',stickers:['bunny','blush','food-7']},
  {effect:21,frame:'stars',stickers:['unicorn','magic-4','magic-8']},
  {effect:20,frame:'jungle',stickers:['frog','nature-0','nature-10']},
  {effect:3,frame:'birthday',stickers:['partyhat','stars','party-0','food-9']},
  {effect:4,frame:'space',stickers:['astronaut','toys-0','toys-1']},
  {effect:18,frame:'rainbow',stickers:['rainbowglasses','magic-0','magic-5']},
  {effect:27,frame:'garden',stickers:['cat','whiskers','nature-9']},
  {effect:10,frame:'comic',stickers:['crown','sunglasses','party-4']},
  {effect:22,frame:'candy',stickers:['bear','food-5','food-6']},
  {effect:6,frame:'winter',stickers:['antlers','party-8','party-9']},
  {effect:23,frame:'ocean',stickers:['hearts','nature-4','nature-6']},
  {effect:35,frame:'arcade',stickers:['googly','toys-6','toys-10']}
];
$('randomLook').addEventListener('click',()=>{
  if(captureTask)return;
  const options=looks.filter(l=>!basicMode||EFFECTS[l.effect].css);
  const look=options[Math.floor(Math.random()*options.length)];
  const previous=scene.snapshot(),history=scene.history.slice();
  scene.nodes=[];scene.frame=look.frame;
  look.stickers.forEach((id,index)=>{const node=scene.add(id);if(!stickerById(id).anchor){node.x=index%2?.85:.14;node.y=.76+(index%2)*.08;node.width=.17;}});
  scene.selected=null;scene.history=[...history,previous].slice(-30);scene.changed();
  settings.effect=look.effect;settings.intensity=85;$('intensity').value=85;persist();updateControls();
  renderThumbnails();if(running)renderMain();toast('新造型准备好啦！贴纸可以继续自由搭配。');
});
const point=(event)=>{const r=decorationCanvas.getBoundingClientRect();return {x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height};};
decorationCanvas.addEventListener('pointerdown',(event)=>{
  if(!running||captureTask||event.button!==0)return;
  const start=point(event),node=scene.hit(start.x,start.y);
  scene.selected=node?.uid||null;
  if(node){const placement=scene.placement(node);drag={start,node,placement,moved:false};decorationCanvas.setPointerCapture(event.pointerId);if(panel!=='stickers')switchPanel('stickers');}
  updateDecorControls();drawDecorations();
});
decorationCanvas.addEventListener('pointermove',(event)=>{
  if(!drag||captureTask)return;
  const now=point(event),dx=now.x-drag.start.x,dy=now.y-drag.start.y;
  if(!drag.moved&&Math.hypot(dx,dy)<.008)return;
  if(!drag.moved){scene.remember();drag.moved=true;}
  Object.assign(drag.node,{follow:false,x:Math.min(1,Math.max(0,drag.placement.x+dx)),y:Math.min(1,Math.max(0,drag.placement.y+dy)),width:Math.min(.95,drag.placement.width),rotation:drag.placement.rotation,scale:1});
  updateDecorControls();drawDecorations();
});
for(const eventName of ['pointerup','pointercancel','lostpointercapture'])decorationCanvas.addEventListener(eventName,()=>{if(drag?.moved)scene.changed();drag=null;});
$('effectTotal').textContent=EFFECTS.length;$('stickerTotal').textContent=STICKERS.length;$('frameTotal').textContent=FRAMES.length-1;
initializeRenderers(); buildEffects(); loadGallery(); updateDecorControls();
