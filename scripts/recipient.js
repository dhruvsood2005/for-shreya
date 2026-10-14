const $ = selector => document.querySelector(selector);
const grid = $('#envelope-grid');
const dialog = $('#letter-dialog');
let filter = 'all';
let selected;
let lastTrigger;
let opened = new Set();
try {
  const saved = JSON.parse(localStorage.getItem('shreya-opened') || '[]');
  if (Array.isArray(saved)) opened = new Set(saved.filter(id => letters.some(letter => letter.id === id)));
} catch { /* The letters also work when iframe storage is blocked. */ }

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderCards() {
  grid.replaceChildren();
  const palette = [['#e7e2d2','#efeadb','#859575'],['#e2e8d9','#e9eee2','#718363'],['#efe1d9','#f4e8e0','#ab7861'],['#e9e7dd','#f0eee5','#8e937d']];
  for (const [index, letter] of letters.entries()) {
    if (filter !== 'all' && letter.group !== filter) continue;
    const button = make('button', 'envelope-card');
    button.type = 'button';
    button.dataset.id = letter.id;
    button.setAttribute('aria-label', `Open when ${letter.title}`);
    const envelope = make('span', 'mini-envelope');
    ['--envelope','--flap','--seal'].forEach((key, i) => envelope.style.setProperty(key, palette[index % palette.length][i]));
    envelope.append(make('span','card-number',String(index + 1).padStart(2,'0')), make('span','card-stamp',index === 14 ? '♥' : '✧'), make('span','mini-seal','♡'));
    envelope.setAttribute('aria-hidden', 'true');
    if (opened.has(letter.id)) envelope.append(make('span','opened-tag','OPENED WITH LOVE'));
    const caption = make('span','card-caption');
    const text = make('span');
    text.append(make('h3','',letter.title),make('p','',letter.subtitle));
    const arrow = make('span','card-arrow','↗');
    arrow.setAttribute('aria-hidden','true');
    caption.append(text,arrow);
    button.append(envelope,caption);
    button.addEventListener('click', () => openLetter(letter, button));
    grid.append(button);
  }
  $('#opened-count').textContent = opened.size ? `${opened.size} of 15 opened with love` : 'Fifteen little places to find me.';
  $('#filter-status').textContent = `${grid.children.length} letters shown`;
}

function openLetter(letter, trigger) {
  selected = letter;
  lastTrigger = trigger;
  $('#dialog-title').textContent = letter.title;
  $('#dialog-number').textContent = `LETTER ${String(letters.indexOf(letter) + 1).padStart(2,'0')} OF 15 · FOR SHREYA`;
  const body = $('#letter-body');
  body.replaceChildren(...letter.body.split(/\n\s*\n/).map(paragraph => make('p','',paragraph)));
  // Media is optional, so no empty placeholders appear before photos are supplied.
  for (const item of letter.media || []) {
    if (!['image','video','audio'].includes(item.type) || !/^(https:\/\/|data:(image|audio|video)\/)/.test(item.src)) continue;
    const figure = make('figure','letter-media');
    const media = make(item.type === 'image' ? 'img' : item.type);
    media.src = item.src;
    if (item.type === 'image') { media.alt = item.alt || ''; media.loading = 'lazy'; }
    else { media.controls = true; media.preload = 'metadata'; }
    figure.append(media);
    if (item.caption) figure.append(make('figcaption','',item.caption));
    body.append(figure);
  }
  dialog.showModal();
  dialog.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  opened.add(letter.id);
  try { localStorage.setItem('shreya-opened', JSON.stringify([...opened])); } catch { /* Optional progress only. */ }
  renderCards();
  $('#close-dialog').focus();
}

function closeLetter() { dialog.close(); }
dialog.addEventListener('close', () => {
  document.body.style.overflow = '';
  const card = selected ? grid.querySelector(`[data-id="${selected.id}"]`) : null;
  (lastTrigger?.isConnected ? lastTrigger : card || $('#final-letter')).focus();
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeLetter();
});
$('#close-dialog').addEventListener('click', closeLetter);
$('#close-letter-bottom').addEventListener('click', closeLetter);
$('#final-letter').addEventListener('click', event => openLetter(letters.find(letter => letter.id === 'howmuchiloveyou'), event.currentTarget));
for (const button of document.querySelectorAll('.filter')) {
  button.addEventListener('click', () => {
    filter = button.dataset.filter;
    for (const item of document.querySelectorAll('.filter')) {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    }
    renderCards();
  });
}
renderCards();
