const { _electron: electron } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const config = require('../package.json');

(async () => {
  const candidates = process.platform === 'darwin' ? [
    [],
    ['--use-gl=angle', '--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader'],
    ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    ['--use-gl=angle', '--use-angle=gl'],
    ['--use-gl=angle', '--use-angle=metal']
  ] : [['--use-angle=swiftshader', '--enable-unsafe-swiftshader']];
  for (const args of candidates) {
    const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'snapjoy-gl-'));
    const env = { ...process.env, LUMI_TEST: '1', LUMI_TEST_DATA: dataDir };
    delete env.ELECTRON_RUN_AS_NODE;
    const app = await electron.launch({ args: [path.resolve(__dirname, '..'), ...args], env });
    try {
      const page = await app.firstWindow();
      const result = await page.evaluate(() => {
        const gl = document.createElement('canvas').getContext('webgl');
        const gl2 = document.createElement('canvas').getContext('webgl2');
        return { webgl: !!gl, webgl2: !!gl2, renderer: gl?.getParameter(gl.RENDERER) };
      });
      console.log(JSON.stringify({ args, ...result }));
      if (result.webgl && result.webgl2) {
        if (process.env.GITHUB_ENV) await fs.appendFile(process.env.GITHUB_ENV, 'SNAPJOY_TEST_GL_ARGS=' + JSON.stringify(args) + '\n');
        const directory = path.resolve(__dirname, '..', 'docs', config.version);
        await fs.mkdir(directory, { recursive: true });
        await fs.writeFile(path.join(directory, `graphics-${process.platform}-${process.arch}.json`), JSON.stringify({ args, ...result }, null, 2));
        return;
      }
    } finally { await app.close(); }
  }
  throw new Error('No working WebGL 1 + WebGL 2 backend available');
})().catch(error => { console.error(error); process.exitCode = 1; });
