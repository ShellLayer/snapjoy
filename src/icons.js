const paths = {
  video: '<rect x="3" y="5" width="12" height="14" rx="3"/><path d="m15 9 6-4v14l-6-4Z"/>',
  camera: '<path d="M14 5h-4L8.5 8H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-3.5L14 5Z"/><circle cx="12" cy="14" r="3.5"/><path d="M17.5 10.5h.01"/>',
  minus: '<path d="M5 12h14"/>',
  square: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
  x: '<path d="m6 6 12 12M6 18 18 6"/>',
  shield: '<path d="M12 3 4 6v5c0 5 8 10 8 10s8-5 8-10V6l-8-3Z"/><path d="m8.5 11.5 2.5 2.5 4.5-5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 1.8-2.5 2-2.5 4M12 17h.01"/>',
  images: '<rect x="6" y="3" width="15" height="15" rx="2"/><path d="M17 21H5a2 2 0 0 1-2-2V7M6 14l4-4 4 4 3-2 4 4"/><circle cx="16" cy="7.5" r="1"/>',
  'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  'arrow-up-right': '<path d="M6 18 18 6M6 6h12v12"/>',
  webcam: '<rect x="3" y="4" width="18" height="13" rx="4"/><circle cx="12" cy="10.5" r="3"/><path d="M12 17v4m-5 0h10"/>',
  grid: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m6-18v18M3 9h18M3 15h18"/>',
  power: '<path d="M12 2v10m-6-7a9 9 0 1 0 12 0"/>',
  film: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M6 8h12M6 15h12M3 5h.01M3 12h.01M3 19h.01M21 5h.01M21 12h.01M21 19h.01"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v5l3 2M9 2h6m2 4 2-2"/>',
  mirror: '<path d="M12 3v2m0 3v2m0 4v2m0 3v2M8 5 3 18h5V5Zm8 0 5 13h-5V5Z"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14a4 4 0 0 0 8 0M8 9h.01M16 9h.01"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Zm7-2v4m-2-2h4"/>',
  'chevron-left': '<path d="m15 5-7 7 7 7"/>',
  'chevron-right': '<path d="m9 5 7 7-7 7"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  check: '<path d="m5 12 4 4L19 6"/>'
};
export function icon(name) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || paths.camera) + '</svg>';
}
export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
}
