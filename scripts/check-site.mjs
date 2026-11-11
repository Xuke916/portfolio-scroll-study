import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
function filesIn(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const absolute = path.join(dir, entry.name);
    assert.ok(!entry.isSymbolicLink(), 'Website files must not be symbolic links');
    return entry.isDirectory() ? filesIn(absolute) : [absolute];
  });
}
const files = filesIn(dist);
assert.ok(fs.existsSync(path.join(dist, '.nojekyll')));
const banned = /(?:^|\/)(?:node_modules|\.git|\.env(?:\..*)?|credentials[^/]*)(?:\/|$)|\.(?:docx?|mkv|pem|key|log)$/i;
for (const absolute of files) {
  const relative = path.relative(dist, absolute).replaceAll('\\', '/');
  assert.ok(!banned.test(relative), `Private/development file in website: ${relative}`);
  assert.ok(fs.statSync(absolute).size < 100 * 1024 * 1024, `File is too large for normal GitHub storage: ${relative}`);
  if (/\.(?:html|css|js|json|svg)$/.test(relative)) {
    const text = fs.readFileSync(absolute, 'utf8');
    assert.ok(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{20,}|\bgithub_pat_[A-Za-z0-9_]{20,}|\bAKIA[A-Z0-9]{16}\b/.test(text), `Potential credential in ${relative}`);
    assert.ok(!/(?:C:|E:)[\\/]|file:\/\//.test(text), `Local machine path in ${relative}`);
  }
}
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'https://example.github.io/portfolio-scroll-study/', runScripts: 'outside-only' });
const { window } = dom;
window.eval(fs.readFileSync(path.join(dist, 'content.js'), 'utf8'));
window.eval(fs.readFileSync(path.join(dist, 'moneyball.js'), 'utf8'));
window.eval(fs.readFileSync(path.join(dist, 'poro.js'), 'utf8'));
const caseContainer = window.document.createElement('div');
caseContainer.innerHTML = window.MoneyBallCaseStudy.render({ footer: '', pagination: '' });
window.document.body.append(caseContainer);
const poroContainer=window.document.createElement('div');
poroContainer.innerHTML=window.PoroCaseStudy.render({pagination:''});
window.document.body.append(poroContainer);
const assetPaths = new Set();
function checkReference(value, from = 'index.html') {
  if (!value || /^(?:#|data:|https?:|mailto:|tel:|blob:)/.test(value)) return;
  assert.ok(!value.startsWith('/'), `Root-relative resource breaks repository Pages: ${value}`);
  const clean = decodeURIComponent(value.split(/[?#]/)[0]);
  if (!clean) return;
  const absolute = path.resolve(dist, path.dirname(from), clean);
  assert.ok(absolute.startsWith(dist + path.sep), `Resource escapes website directory: ${value}`);
  assert.ok(fs.existsSync(absolute) && fs.statSync(absolute).isFile(), `Missing resource: ${value}`);
  assetPaths.add(path.relative(dist, absolute));
}
for (const el of window.document.querySelectorAll('script[src],img[src],video[src],source[src],link[href]')) checkReference(el.getAttribute('src') || el.getAttribute('href'));
for (const el of window.document.querySelectorAll('[data-motion-src],[data-poro-image]')) checkReference(el.dataset.motionSrc || el.dataset.poroImage);
for (const el of window.document.querySelectorAll('video[poster]')) checkReference(el.getAttribute('poster'));
for (const el of window.document.querySelectorAll('img[srcset]')) for(const candidate of el.getAttribute('srcset').split(',')) checkReference(candidate.trim().split(/\s+/)[0]);
function contentAssets(value) {
  if (typeof value === 'string' && value.startsWith('assets/')) checkReference(value);
  else if (Array.isArray(value)) value.forEach(contentAssets);
  else if (value && typeof value === 'object') Object.values(value).forEach(contentAssets);
}
contentAssets(window.PORTFOLIO_CONTENT);
for (const absolute of files.filter(file => file.endsWith('.css'))) {
  const relative = path.relative(dist, absolute);
  for (const match of fs.readFileSync(absolute, 'utf8').matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)) checkReference(match[1], relative);
}
const videoCount = window.document.querySelectorAll('video,source[src$=".mp4"],source[src$=".webm"]').length;
window.close();
for (const absolute of files.filter(file => file.endsWith('.js'))) {
  const syntax = spawnSync(process.execPath, ['--check', absolute], { stdio: 'inherit' });
  assert.equal(syntax.status, 0, `JavaScript syntax: ${path.basename(absolute)}`);
}
console.log(`PASS ${files.length} deployable files, ${assetPaths.size} local resource references, repository-subpath compatibility; video elements: ${videoCount}`);
for (const test of ['check-scroll.cjs', 'check-responsive.cjs', 'check-fluid.cjs', 'check-helmet.cjs', 'check-moneyball.cjs', 'check-poro.cjs']) {
  const result = spawnSync(process.execPath, [path.join(root, 'tests', test)], { cwd: root, stdio: 'inherit' });
  assert.equal(result.status, 0, test);
}
console.log('PASS all portfolio publication checks');
