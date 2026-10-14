import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { letters } from '../dist/letters.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'google-sites');
let html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'dist/style.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'scripts/recipient.js'), 'utf8');

// Keep the original design, but omit the private writing desk from her version.
html = html.replace(/  <div class="draft-notice"[^\n]+\n/, '')
  .replace('<button id="studio-toggle" aria-pressed="false">Personalise</button>', '')
  .replace(/    <section class="studio-panel"[\s\S]*?<\/section>\n/, '')
  .replace(/<div class="personalise-hint"[^>]*><\/div>/, '')
  .replace(/      <form id="letter-editor"[\s\S]*?<\/form>\n/, '')
  .replace('<button class="text-button" id="edit-letter" hidden>Edit this letter ↗</button>', '')
  .replace(/      <p class="dialog-status"[^>]*><\/p>\n/, '')
  .replace(/  <div class="toast"[^>]*><\/div>\n/, '')
  .replace(/  <link rel="icon"[^>]+>\n/, '')
  .replace('  <link rel="stylesheet" href="./style.css">', `<style>${css}\n.letter-media{margin-top:28px}.letter-media img,.letter-media video{display:block;width:100%;max-height:420px;object-fit:contain;background:#eee9da;border:8px solid #f4f0e4}.letter-media audio{width:100%}.letter-media figcaption{margin-top:9px;font:19px var(--hand);color:var(--muted);text-align:center}</style>`);

const recipientLetters = letters.map(({ prompt, ...letter }) => ({ ...letter, media: letter.media || [] }));
const data = JSON.stringify(recipientLetters).replace(/</g, '\\u003c');
html = html.replace('  <script type="module" src="./app.js"></script>', `<script>const letters = ${data};\n${app}</script>`);

if (/chatgpt|our chat|PRIVATE DRAFT|studio-toggle|\.\/app\.js|\.\/style\.css/i.test(html)) {
  throw new Error('Recipient build contains authoring controls or external project assets.');
}
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'for-shreya.html'), html);
const escaped = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
fs.writeFileSync(path.join(output, 'copy.html'), `<!doctype html><meta charset="utf-8"><title>Google Sites embed source</title><label for="source">Full-page embed source</label><textarea id="source" style="display:block;width:95vw;height:85vh">${escaped}</textarea>`);
console.log(`Built Google Sites embed: ${Buffer.byteLength(html)} bytes, ${letters.length} letters. No authoring UI. Draft memory placeholders remain pending personalisation.`);
