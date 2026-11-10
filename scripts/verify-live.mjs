import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const base = new URL(process.argv[2] || 'https://xuke916.github.io/portfolio-scroll-study/');
assert.ok(base.protocol === 'https:' || ['127.0.0.1', 'localhost'].includes(base.hostname), 'Use HTTPS for the deployed site');
if (!base.pathname.endsWith('/')) base.pathname += '/';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function list(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? list(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
const files = list(dist).filter(file => path.basename(file) !== '.nojekyll');
const queue = [...files];
const failures = [];
let verified = 0;
async function worker() {
  while (queue.length) {
    const file = queue.shift();
    const relative = path.relative(dist, file).replaceAll('\\', '/');
    const url = new URL(relative, base);
    const expected = hash(fs.readFileSync(file));
    let error;
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
        assert.equal(response.status, 200, `HTTP ${response.status}`);
        const bytes = Buffer.from(await response.arrayBuffer());
        assert.equal(hash(bytes), expected, 'Live content differs from the checked source');
        error = null;
        verified++;
        break;
      } catch (caught) {
        error = caught;
        if (attempt < 5) await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    if (error) failures.push(`${relative}: ${error.message}`);
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
assert.equal(failures.length, 0, failures.join('\n'));
console.log(`PASS ${verified} live files returned HTTP 200 and match the checked source byte for byte: ${base}`);
