const path = require('node:path');
const { spawnSync } = require('node:child_process');
const args = [path.resolve(__dirname, '../node_modules/@playwright/test/cli.js'), 'test', 'tests/studio.spec.cjs', '--max-failures=0'];
// Pass an optional test pattern as one argument; never interpolate it into a shell.
if (process.env.SNAPJOY_TEST_PATTERN) args.push('--grep', process.env.SNAPJOY_TEST_PATTERN);
const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
