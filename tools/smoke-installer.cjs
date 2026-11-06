// Run only on an ephemeral Windows CI runner: verify the actual NSIS installer.
const {spawn}=require('node:child_process');
const { _electron:electron }=require('@playwright/test');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const config=require('../package.json');
const {graphicsArgs}=require('./test-graphics.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
 if(process.platform!=='win32'||!process.env.CI)throw new Error('Installer verification runs only in Windows CI');
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'snapjoy-install-'));
 const installer=path.join(root,config.build.directories.output,`SnapJoy-${config.version}-Windows-Setup.exe`);
 await new Promise((resolve,reject)=>{
  // NSIS requires /D to be the final argument; Node supplies it without a shell.
  const process=spawn(installer,['/S','/D='+directory],{windowsHide:true,stdio:'ignore'});
  process.once('error',reject);process.once('exit',code=>code===0?resolve():reject(new Error('Installer exit '+code)));
 });
 const executablePath=path.join(directory,'拾光相机.exe');await fs.access(executablePath);
 const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 const app=await electron.launch({executablePath,args:['--user-data-dir='+path.join(directory,'verification-data'),...graphicsArgs],env,timeout:90000});
 try{
  const page=await app.firstWindow();await page.waitForSelector('.effect-card');
  const result=await page.evaluate(()=>({title:document.title,effects:document.querySelectorAll('.effect-card').length,cameraOff:!document.querySelector('#cameraVideo').srcObject,videoMode:!!document.querySelector('[data-mode="video"]')}));
  const version=await app.evaluate(({app})=>app.getVersion());
  if(version!==config.version||result.effects!==60||!result.cameraOff||!result.videoMode)throw new Error('Installed app is incomplete');
  const output={passed:true,version,installer:true,...result,checkedAt:new Date().toISOString()};
  const folder=path.join(root,'docs',config.version);await fs.mkdir(folder,{recursive:true});await fs.writeFile(path.join(folder,'installer-verification.json'),JSON.stringify(output,null,2));console.log(JSON.stringify(output));
 }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
