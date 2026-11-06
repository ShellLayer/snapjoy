const fs=require('node:fs/promises');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
  const source=path.join(root,'node_modules','@mediapipe','tasks-vision');
  const target=path.join(root,'src','vendor','mediapipe');
  await fs.mkdir(path.join(target,'wasm'),{recursive:true});
  await fs.copyFile(path.join(source,'vision_bundle.mjs'),path.join(target,'vision_bundle.mjs'));
  for(const name of await fs.readdir(path.join(source,'wasm')))await fs.copyFile(path.join(source,'wasm',name),path.join(target,'wasm',name));
  console.log('Copied the pinned MediaPipe runtime; the bundled model and license are retained.');
})().catch(error=>{console.error(error);process.exitCode=1;});
