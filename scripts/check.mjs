import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { letters } from '../dist/letters.js';

const expectedBodyHashes = {
  missme: '16acb763d1fe629ebb3d8c723b502cd0579d2a2e27046533c4beefcfdb1bcd2b',
  sad: '9c8ae936bdc1362d2b47b4f6ad6a47155036338d1e4ffed80bff188d79dabd74',
  cantsleep: '60a49c07c91a9deec6a2f0bb495692c758ffb3d9671853d10f6639d841a34384',
  reassurance: '941abd1646e0bec4b3b88699865aa3b76c227398ce0ef711c6543db63590583b',
  argument: 'ddc1eee99cad2be70b7f4d49d138324004a5ecc5ded48fea9dc80f826a18243b',
  laugh: '2e4e2eb7a97536714b863128e3c53340eeaa944dc137306ccce8f9c4bd574311',
  stressed: 'd2e26425ffc619c864641fd31d6f6dce61a9b30b4fa41b063b722b77efe694d7',
  alone: '93ea8360eef6bb011be1a9513cada0c564ee73fb9ae4f2017694c4c82ade23b4',
  motivation: 'ff88e3778beb7626e98adf9c5b8d5b4bb395797167b4fc159aeea4a3144e3409',
  rememberus: 'd958f29e55fa898e6885d1d92b2ca8da300d758394c386919a609c077f0c5132',
  hearmyvoice: 'f316b5627ffd6eba9d531bd0f64b7ae72fc888569bd67823695707e3431a9ce5',
  favouritememory: 'e27c417013f725f4a76fa3e68017d437e25173ebe81effd7d461a4d929d9cb8c',
  future: 'eb9a3ffce87b01ec5667181c9859a6e717c25dd571493da5f69a933324bbd469',
  togetheragain: 'ca3eb7d820eecc728cdd9b8714e2c72582adffecf0c0530233cb6811860a50d0',
  howmuchiloveyou: '584c9af861bd85639e1af751c73cd426e78f9368e218affa179f598892498531'
};

assert.equal(letters.length, 15, 'Exactly 15 letters');
assert.equal(new Set(letters.map(letter => letter.id)).size, 15, 'Unique letter IDs');

for (const letter of letters) {
  assert.ok(letter.title && letter.body && letter.photo, `${letter.id}: complete content`);
  const hash = crypto.createHash('sha256').update(letter.body).digest('hex');
  assert.equal(hash, expectedBodyHashes[letter.id], `${letter.id}: current Google Sites wording must remain unchanged`);
  await access(new URL(`../dist/media/${letter.photo}`, import.meta.url));
}

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const missionHtml = await readFile(new URL('../dist/mission.html', import.meta.url), 'utf8');
for (const id of ['letter-dialog', 'letter-grid', 'dialog-image', 'letter-body', 'audio-wrap']) {
  assert.ok(html.includes(`id="${id}"`), id);
}
for (const text of [
  '20 OCTOBER · FOR MY FAVOURITE WEIRDO',
  'Until I can <em>hold you again</em>',
  'Happy 21st birthday, my love. ♡',
  'I wish I could be beside you today, annoying you, making you roll your eyes, and pulling you into the longest hug.',
  'Since San Diego put an ocean between us,',
  'On 8 January, you won’t be a face on my screen anymore.',
  'Always yours, Dhruv',
  'One of the days I wish I could live again.',
  'One of those days I wish never ended. I miss you',
  'My passenger princess, making the car rides my favourite part.',
  'To my weird birb lady. <em>All my love, always.</em>',
  'For my weird birb lady'
]) assert.ok(html.includes(text), `Preserved page text: ${text}`);

assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.ok(!/PRIVATE DRAFT|Personalise|writing desk/i.test(html), 'No authoring controls in recipient site');

for (const text of [
  'What did you once react to like you had discovered a giant insect in the sand at The Entrance?',
  'Who permanently owns the passenger seat?',
  'Where will we finally see each other again?',
  'You passed, weirdo.',
  'I knew my nine year old could do it.'
]) assert.ok(missionHtml.includes(text), `Mission copy: ${text}`);
assert.ok(!missionHtml.includes('8 January'), 'Mission question does not reveal the date');

for (const filename of ['dist/app.js', 'dist/letters.js', 'dist/mission.js']) {
  const result = spawnSync(process.execPath, ['--check', filename], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}

for (const file of ['style.css', 'app.js', 'letters.js', 'mission.html', 'mission.css', 'mission.js', 'heart.svg', 'media/birthday-message.m4a']) {
  await access(new URL(`../dist/${file}`, import.meta.url));
}
const audio = await stat(new URL('../dist/media/birthday-message.m4a', import.meta.url));
assert.ok(audio.size > 1000, 'Birthday voice memo is present');
const photos = (await readdir(new URL('../dist/media/', import.meta.url))).filter(name => /\.(jpe?g|png)$/i.test(name));
assert.equal(photos.length, 20, '15 paired photos and 5 gallery copies');

const manifest = JSON.parse(await readFile(new URL('../.openai/hosting.json', import.meta.url), 'utf8'));
assert.ok(manifest.project_id);
assert.equal(manifest.static.directory, 'dist');

console.log('PASS: exact 15-letter copy, page text, 20 photo assets, audio, JavaScript syntax and hosting manifest.');
