const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('booth', Object.freeze({
  platform: process.platform,
  listPhotos: () => ipcRenderer.invoke('photos:list'),
  savePhoto: (photo) => ipcRenderer.invoke('photos:save', photo),
  deletePhoto: (id) => ipcRenderer.invoke('photos:delete', id),
  exportPhoto: (id) => ipcRenderer.invoke('photos:export', id),
  showPhoto: (id) => ipcRenderer.invoke('photos:show', id),
  openFolder: () => ipcRenderer.invoke('photos:folder'),
  openCameraSettings: () => ipcRenderer.invoke('camera:settings'),
  requestCameraAccess: () => ipcRenderer.invoke('camera:authorize'),
  beginVideo: payload => ipcRenderer.invoke('videos:begin', payload),
  appendVideo: (id, bytes) => ipcRenderer.invoke('videos:append', id, bytes),
  finishVideo: payload => ipcRenderer.invoke('videos:finish', payload),
  abortVideo: id => ipcRenderer.invoke('videos:abort', id),
  requestMicrophoneAccess: () => ipcRenderer.invoke('microphone:authorize'),
  releaseMicrophone: () => ipcRenderer.invoke('microphone:release'),
  openMicrophoneSettings: () => ipcRenderer.invoke('microphone:settings'),
  windowAction: (action) => ipcRenderer.invoke('window:action', action)
}));
