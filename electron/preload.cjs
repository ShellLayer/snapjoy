const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('booth', Object.freeze({
  listPhotos: () => ipcRenderer.invoke('photos:list'),
  savePhoto: (photo) => ipcRenderer.invoke('photos:save', photo),
  deletePhoto: (id) => ipcRenderer.invoke('photos:delete', id),
  exportPhoto: (id) => ipcRenderer.invoke('photos:export', id),
  showPhoto: (id) => ipcRenderer.invoke('photos:show', id),
  openFolder: () => ipcRenderer.invoke('photos:folder'),
  openCameraSettings: () => ipcRenderer.invoke('camera:settings'),
  windowAction: (action) => ipcRenderer.invoke('window:action', action)
}));
