import { letters } from './letters.js';

const grid = document.querySelector('#letter-grid');
const dialog = document.querySelector('#letter-dialog');
const dialogImage = document.querySelector('#dialog-image');
const dialogTitle = document.querySelector('#dialog-title');
const dialogNumber = document.querySelector('#dialog-number');
const letterBody = document.querySelector('#letter-body');
const audioWrap = document.querySelector('#audio-wrap');
let lastTrigger = null;

function paragraph(text) {
  const node = document.createElement('p');
  node.textContent = text;
  return node;
}

function renderLetters() {
  const fragment = document.createDocumentFragment();

  letters.forEach((letter, index) => {
    const button = document.createElement('button');
    button.className = `letter-card ${index === 0 || index === 9 || index === 14 ? 'letter-card-featured' : ''}`;
    button.type = 'button';
    button.setAttribute('aria-label', `Open when ${letter.title}`);

    const media = document.createElement('span');
    media.className = 'card-photo';
    const image = document.createElement('img');
    image.src = `./media/${letter.photo}`;
    image.alt = `A memory for “Open when ${letter.title}”`;
    media.append(image);

    const copy = document.createElement('span');
    copy.className = 'card-copy';
    copy.innerHTML = `<small>${String(index + 1).padStart(2, '0')} / 15</small><span>Open when</span><strong>${letter.title}</strong><i aria-hidden="true">↗</i>`;
    button.append(media, copy);
    button.addEventListener('click', () => openLetter(letter, index, button));
    fragment.append(button);
  });

  grid.append(fragment);
}

function openLetter(letter, index, trigger) {
  lastTrigger = trigger;
  dialogTitle.textContent = `Open when ${letter.title}`;
  dialogNumber.textContent = `LETTER ${String(index + 1).padStart(2, '0')} OF 15 · FOR MY SHREYA`;
  dialogImage.src = `./media/${letter.photo}`;
  dialogImage.alt = `A memory for “Open when ${letter.title}”`;
  letterBody.replaceChildren(...letter.body.split(/\n\s*\n/).map(paragraph));
  audioWrap.hidden = letter.id !== 'hearmyvoice';
  dialog.showModal();
  dialog.scrollTop = 0;
  document.body.classList.add('dialog-open');
  document.querySelector('#close-dialog').focus();
}

function closeLetter() {
  const audio = audioWrap.querySelector('audio');
  audio.pause();
  dialog.close();
}

document.querySelector('#close-dialog').addEventListener('click', closeLetter);
document.querySelector('#close-letter-bottom').addEventListener('click', closeLetter);
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeLetter();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  lastTrigger?.focus();
});

renderLetters();
