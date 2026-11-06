export const ASPECTS = { '4:3': 4/3, '16:9': 16/9, '1:1': 1, '3:4': 3/4, '9:16': 9/16 };

// All renderers and landmark detection use this same centered, unstretched crop.
export function cropRect(width, height, aspect) {
  const w = Math.min(width, height * aspect), h = w / aspect;
  return { x: (width-w)/2, y: (height-h)/2, width: w, height: h };
}
export function outputSize(width, height, aspect, limit = 0) {
  const crop = cropRect(width, height, aspect);
  const scale = Math.min(1, limit > 0 ? limit / Math.max(crop.width, crop.height) : 1);
  // Even dimensions are required by common video encoders; never invent detail.
  return [Math.max(2, Math.floor(crop.width*scale/2)*2), Math.max(2, Math.floor(crop.height*scale/2)*2)];
}
