// Cache busting: node tools/stamp.js
// Adds ?v=<hash> to the CSS, vendor and module links in index.html and to
// relative imports inside js/, so browsers fetch fresh files after a release.
// Leaves CNAME and every other file alone.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const files = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(js|css)$/.test(f)) files.push(p);
  }
})(path.join(root, 'js'));
files.push(path.join(root, 'css/styles.css'));

const hash = crypto.createHash('sha1');
for (const f of files.sort()) hash.update(fs.readFileSync(f, 'utf8').replace(/\?v=[\w.-]+/g, ''));
const v = hash.digest('hex').slice(0, 8);

const html = path.join(root, 'index.html');
fs.writeFileSync(html, fs.readFileSync(html, 'utf8').replace(/((?:css|js|vendor)\/[\w./-]+\.(?:css|js))(\?v=[\w.-]+)?/g, `$1?v=${v}`));
for (const f of files.filter(f => f.endsWith('.js'))) {
  const src = fs.readFileSync(f, 'utf8');
  const out = src.replace(/(from\s+['"])(\.{1,2}\/[^'"?]+\.js)(\?v=[\w.-]+)?(['"])/g, `$1$2?v=${v}$4`);
  if (out !== src) fs.writeFileSync(f, out);
}
console.log('Stamped version ' + v);
