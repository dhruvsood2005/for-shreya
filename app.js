import { letters } from './letters.js';

const STORAGE = 'shreya-open-when-drafts-v1';
const OPENED = 'shreya-open-when-opened-v1';
const $ = (selector) => document.querySelector(selector);
const grid = $('#envelope-grid');
const dialog = $('#letter-dialog');
let selected = null;
let studio = false;
let filter = 'all';
let toastTimer;
let overrides = {};
let opened = new Set();
let lastTrigger;

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE) || '{}');
  overrides = validOverrides(saved);
  const ids = JSON.parse(localStorage.getItem(OPENED) || '[]');
  if (Array.isArray(ids)) opened = new Set(ids.filter(id => letters.some(letter => letter.id === id)));
} catch { /* Reading letters works even when browser storage is unavailable. */ }

function validOverrides(input) {
  const result = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return result;
  for (const letter of letters) {
    const value = input[letter.id];
    if (typeof value === 'string' && value.trim() && value.length <= 12000) result[letter.id] = value;
  }
  return result;
}

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function toast(message) {
  clearTimeout(toastTimer);
  const target = dialog.open ? $('#dialog-status') : $('#toast');
  target.textContent = message;
  target.hidden = false;
  toastTimer = setTimeout(() => { target.hidden = true; }, 5500);
}

function renderCards() {
  grid.replaceChildren();
  const palette = [ ['#e7e2d2','#efeadb','#859575'], ['#e2e8d9','#e9eee2','#718363'], ['#efe1d9','#f4e8e0','#ab7861'], ['#e9e7dd','#f0eee5','#8e937d'] ];
  for (const [index, letter] of letters.entries()) {
    if (filter !== 'all' && letter.group !== filter) continue;
    const button = make('button', 'envelope-card');
    button.type = 'button';
    button.dataset.id = letter.id;
    button.setAttribute('aria-label', `Open when ${letter.title}${opened.has(letter.id) ? ', opened before' : ''}`);
    const envelope = make('span', 'mini-envelope');
    const colours = palette[index % palette.length];
    ['--envelope','--flap','--seal'].forEach((key, i) => envelope.style.setProperty(key, colours[i]));
    envelope.append(make('span','card-number',String(index + 1).padStart(2,'0')));
    envelope.append(make('span','card-stamp',index === 14 ? '♥' : '✧'));
    envelope.append(make('span','mini-seal','♡'));
    envelope.setAttribute('aria-hidden','true');
    if (opened.has(letter.id)) envelope.append(make('span','opened-tag','OPENED WITH LOVE'));
    const caption = make('span','card-caption');
    const text = make('span');
    text.append(make('h3','',letter.title),make('p','',letter.subtitle));
    const arrow = make('span','card-arrow','↗');
    arrow.setAttribute('aria-hidden','true');
    caption.append(text, arrow);
    button.append(envelope,caption);
    button.addEventListener('click', () => openLetter(letter.id, button));
    grid.append(button);
  }
  $('#opened-count').textContent = opened.size ? `${opened.size} of 15 opened in this browser` : 'Fifteen little places to find me.';
  $('#filter-status').textContent = `${grid.children.length} letters shown`;
}

function renderLetter() {
  if (!selected) return;
  $('#dialog-title').textContent = selected.title;
  $('#dialog-number').textContent = `LETTER ${String(letters.indexOf(selected)+1).padStart(2,'0')} OF 15 · FOR SHREYA`;
  const body = overrides[selected.id] ?? selected.body;
  const container = $('#letter-body');
  container.replaceChildren(...body.split(/\n\s*\n/).map(paragraph => make('p','',paragraph)));
  $('#edit-body').value = body;
  const hint = $('#personalise-hint');
  hint.replaceChildren(make('strong','','A note for Dhruv'),make('span','',selected.prompt));
  hint.hidden = !studio;
  $('#edit-letter').hidden = !studio;
  $('#letter-editor').hidden = true;
  container.hidden = false;
}

function openLetter(id, trigger) {
  const letter = letters.find(item => item.id === id);
  if (!letter) return;
  selected = letter;
  $('#dialog-status').hidden = true;
  lastTrigger = trigger;
  renderLetter();
  dialog.showModal();
  dialog.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  opened.add(id);
  try { localStorage.setItem(OPENED,JSON.stringify([...opened])); } catch { /* Optional progress only. */ }
  renderCards();
  $('#close-dialog').focus();
}

function closeLetter() { dialog.close(); }
dialog.addEventListener('close', () => {
  document.body.style.overflow = '';
  const freshTrigger = selected ? grid.querySelector(`[data-id="${selected.id}"]`) : null;
  (lastTrigger?.isConnected ? lastTrigger : freshTrigger || $('#final-letter')).focus();
});
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) closeLetter(); } });
$('#close-dialog').addEventListener('click', closeLetter);
$('#close-letter-bottom').addEventListener('click', closeLetter);
$('#final-letter').addEventListener('click', event => openLetter('howmuchiloveyou',event.currentTarget));

for (const button of document.querySelectorAll('.filter')) {
  button.addEventListener('click', () => {
    filter = button.dataset.filter;
    for (const item of document.querySelectorAll('.filter')) {
      const active = item === button;
      item.classList.toggle('active',active);
      item.setAttribute('aria-pressed',String(active));
    }
    renderCards();
  });
}

function setStudio(enabled) {
  studio = enabled;
  $('#studio-panel').hidden = !enabled;
  $('#draft-notice').hidden = enabled;
  $('#studio-toggle').setAttribute('aria-pressed',String(enabled));
  $('#studio-toggle').textContent = enabled ? 'Preview' : 'Personalise';
  if (enabled) $('#studio-panel').scrollIntoView({behavior:'smooth',block:'start'});
  if (dialog.open) renderLetter();
}
$('#studio-toggle').addEventListener('click', () => setStudio(!studio));
$('#notice-edit').addEventListener('click', () => setStudio(true));
$('#studio-close').addEventListener('click', () => setStudio(false));
$('#edit-letter').addEventListener('click', () => {
  $('#letter-editor').hidden = false;
  $('#letter-body').hidden = true;
  $('#edit-letter').hidden = true;
  $('#edit-body').focus();
});
$('#cancel-edit').addEventListener('click', renderLetter);
$('#letter-editor').addEventListener('submit', event => {
  event.preventDefault();
  const body = $('#edit-body').value.trim();
  if (!body) { toast('Write a little something before saving.'); return; }
  overrides[selected.id] = body;
  let persisted = true;
  try { localStorage.setItem(STORAGE,JSON.stringify(overrides)); } catch { persisted = false; }
  renderLetter();
  $('#edit-letter').focus();
  toast(persisted ? 'Saved in this browser. Download your edits when you’re ready to publish.' : 'Kept for this session only. Download your edits now to keep them.');
});

$('#export-drafts').addEventListener('click', () => {
  const content = {schemaVersion:1,recipient:'Shreya',sender:'Dhruv',birthday:'2026-10-20',exportedAt:new Date().toISOString(),letters:letters.map(letter => ({id:letter.id,title:`Open when ${letter.title}`,body:overrides[letter.id] ?? letter.body}))};
  const blob = new Blob([JSON.stringify(content,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const link = make('a');
  link.href = url; link.download = 'Shreya-open-when-my-edits.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url),1000);
  toast('Send the downloaded file in our chat to publish your personalised letters.');
});

$('#import-drafts').addEventListener('change', async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (file.size > 2000000) throw new Error('Please use the JSON file downloaded from this site (under 2 MB).');
    const content = JSON.parse(await file.text());
    if (content.schemaVersion !== 1 || !Array.isArray(content.letters)) throw new Error('That is not a recognised letter export.');
    const next = validOverrides(Object.fromEntries(content.letters.filter(item=>item && typeof item.id === 'string').map(item=>[item.id,item.body])));
    if (Object.keys(next).length !== letters.length || content.letters.length !== letters.length) throw new Error('The export must contain all 15 letters with valid text.');
    if (Object.keys(overrides).length && !window.confirm('Replace the letter edits saved in this browser with this file? Download your current edits first if you want to keep them.')) return;
    localStorage.setItem(STORAGE,JSON.stringify(next));
    overrides = next;
    toast('Imported all 15 letters into this browser. The shared Site has not changed yet.');
  } catch (error) { toast(error.message || 'Could not import this file. Your existing edits are unchanged.'); }
  finally { event.target.value = ''; }
});
renderCards();
