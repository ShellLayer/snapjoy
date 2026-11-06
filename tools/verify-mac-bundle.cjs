const fs = require('node:fs/promises');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const config = require('../package.json');

(async () => {
  if (process.platform !== 'darwin') throw new Error('Run this check on macOS');
  const appPath = path.resolve(__dirname, '..', config.build.directories.output,
    process.arch === 'arm64' ? 'mac-arm64' : 'mac', '拾光相机.app');
  const plist = path.join(appPath, 'Contents', 'Info.plist');
  const read = key => execFileSync('/usr/libexec/PlistBuddy', ['-c', 'Print :' + key, plist], { encoding: 'utf8' }).trim();
  const version = read('CFBundleShortVersionString');
  const cameraDescription = read('NSCameraUsageDescription');
  if (version !== config.version || !cameraDescription.includes('摄像头')) throw new Error('Bundle metadata incomplete');
  if (read('LSMinimumSystemVersion') !== '13.0') throw new Error('Unexpected minimum macOS version');
  execFileSync('/usr/bin/codesign', ['--verify', '--deep', '--strict', '--verbose=2', appPath]);
  const architecture = execFileSync('/usr/bin/lipo', ['-archs', path.join(appPath, 'Contents', 'MacOS', '拾光相机')], { encoding: 'utf8' }).trim();
  if (architecture !== (process.arch === 'x64' ? 'x86_64' : 'arm64')) throw new Error('Unexpected app architecture: ' + architecture);
  const translated = process.arch === 'x64' && execFileSync('/usr/sbin/sysctl', ['-in', 'sysctl.proc_translated'], { encoding: 'utf8' }).trim() === '1';
  const output = { passed: true, platform: 'darwin', arch: process.arch, translated, version, minimumMacOS: '13.0', cameraDescription,
    signature: 'ad-hoc', notarized: false, architecture, checkedAt: new Date().toISOString() };
  const directory = path.resolve(__dirname, '..', 'docs', config.version);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, `bundle-verification-darwin-${process.arch}.json`), JSON.stringify(output, null, 2));
  console.log(JSON.stringify(output, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
