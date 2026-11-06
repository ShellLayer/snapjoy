const { chromium } = require('@playwright/test');
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const net = require('node:net');
const root = path.resolve(__dirname, '..');
const config = require('../package.json');
const delay = (ms) => new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
  const userData=await fs.mkdtemp(path.join(os.tmpdir(),'lumi-portable-'));
  const server=net.createServer(); await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=server.address().port;await new Promise(resolve=>server.close(resolve));
  const child=spawn(path.join(root,config.build.directories.output,config.build.portable.artifactName.replace('${version}',config.version)),[
    '--remote-debugging-port='+port,'--user-data-dir='+userData,'--use-angle=swiftshader','--enable-unsafe-swiftshader'
  ],{windowsHide:true,stdio:'ignore'});
  let browser;
  try {
    let endpoint;
    for(let i=0;i<120;i++){
      try { const response=await fetch('http://127.0.0.1:'+port+'/json/version');endpoint=(await response.json()).webSocketDebuggerUrl;break; }catch{await delay(250);}
    }
    if(!endpoint)throw new Error('Portable app did not start');
    browser=await chromium.connectOverCDP(endpoint);
    const pages=browser.contexts().flatMap(context=>context.pages());
    const page=pages.find(p=>p.url().startsWith('lumi://app'));
    if(!page)throw new Error('Local app window not found');
    await page.waitForSelector('.effect-card');
    const result=await page.evaluate(()=>({
      title:document.title,effects:document.querySelectorAll('.effect-card').length,
      cameraOff:document.querySelector('#cameraVideo').srcObject===null,
      startEnabled:!document.querySelector('#startCamera').disabled
    }));
    if(result.title!=='拾光相机 · SnapJoy'||result.effects!==84||!result.cameraOff||!result.startEnabled)throw new Error(JSON.stringify(result));
    await fs.mkdir(path.join(root,'docs',config.version),{recursive:true});
    await fs.writeFile(path.join(root,'docs',config.version,'portable-verification.json'),JSON.stringify({passed:true,version:config.version,...result,checkedAt:new Date().toISOString()},null,2));
    console.log(JSON.stringify({passed:true,portable:true,...result}));
    await page.evaluate(()=>window.booth.windowAction('close')).catch(()=>{});
  }finally{
    await browser?.close().catch(()=>{});
    // The app normally closes its portable wrapper itself after the window closes.
    if(child.exitCode===null) await Promise.race([new Promise(resolve=>child.once('exit',resolve)),delay(5000)]);
    if(child.exitCode===null) child.kill();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
