const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const config = require('../package.json');

(async () => {
  const directory = path.resolve(__dirname, '..', process.argv[2] || config.build.directories.output);
  const names = (await fs.readdir(directory)).filter(name => /\.(exe|dmg|zip)$/.test(name)).sort();
  if (!names.length) throw new Error('No release packages found');
  const lines = await Promise.all(names.map(async name => {
    const hash = createHash('sha256').update(await fs.readFile(path.join(directory, name))).digest('hex');
    return hash + '  ' + name;
  }));
  await fs.writeFile(path.join(directory, 'SHA256SUMS.txt'), lines.join('\n') + '\n');
  console.log('Checksums created for ' + names.length + ' packages.');
})().catch(error => { console.error(error); process.exitCode = 1; });
