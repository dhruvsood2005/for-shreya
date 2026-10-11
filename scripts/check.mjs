import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { letters } from '../dist/letters.js';

assert.equal(letters.length,15,'Exactly 15 letters');
assert.equal(new Set(letters.map(letter=>letter.id)).size,15,'Unique letter IDs');
for(const letter of letters){
  assert.ok(letter.title && letter.body && letter.subtitle && letter.prompt,`${letter.id}: complete content`);
  assert.ok(['us','comfort','smile'].includes(letter.group));
  assert.ok(!letter.title.includes('next birthday'));
}
const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
for(const id of ['letter-dialog','envelope-grid','studio-toggle','export-drafts','import-drafts','edit-body']) assert.ok(html.includes(`id="${id}"`),id);
assert.equal((html.match(/<h1\b/g)||[]).length,1);
for(const filename of ['dist/app.js','dist/letters.js']){
  const result=spawnSync(process.execPath,['--check',filename],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
}
for(const file of ['style.css','app.js','letters.js','heart.svg']) await access(new URL(`../dist/${file}`,import.meta.url));
const manifest=JSON.parse(await readFile(new URL('../.openai/hosting.json',import.meta.url),'utf8'));
assert.ok(manifest.project_id);
assert.equal(manifest.static.directory,'dist');
console.log('PASS: 15 letters, category integrity, required controls, local assets, JavaScript syntax and hosting manifest.');
