import { cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const src = resolve('public');
const out = resolve('dist');
await mkdir(out, { recursive: true });
await cp(src, out, { recursive: true });
const apiBase = (process.env.MEDIA_BACKEND_URL || '').replace(/\/$/, '');
await writeFile(resolve(out, 'config.js'), `window.MEDIADROP_API_BASE = ${JSON.stringify(apiBase)};\n`);
console.log(`Built frontend with backend: ${apiBase || '(same origin)'}`);
