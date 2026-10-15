const form = document.querySelector('#mission-form');
const counter = document.querySelector('#counter');
const success = document.querySelector('#success');

const normalize = value => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const validators = {
  toe: answer => answer.includes('toe') || answer.includes('foot'),
  passenger: answer => answer.includes('shreya') || answer.includes('passenger princess') || answer === 'me' || answer === 'i do' || answer.includes('my seat'),
  japan: answer => answer.includes('japan') || answer.includes('tokyo')
};

const messages = {
  toe: 'Think about your dramatic reaction to one very normal body part.',
  passenger: 'The title comes with snacks and control of the music.',
  japan: 'The place where the distance finally ends.'
};

for (const input of form.querySelectorAll('input')) {
  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    input.closest('.question').classList.remove('shake');
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  let correct = 0;
  let firstIncorrect;

  for (const question of form.querySelectorAll('.question')) {
    const key = question.dataset.question;
    const input = question.querySelector('input');
    const feedback = question.querySelector('.feedback');
    const isCorrect = validators[key](normalize(input.value));

    question.classList.toggle('correct', isCorrect);
    input.setAttribute('aria-invalid', String(!isCorrect));
    feedback.textContent = isCorrect ? 'Correct ♡' : messages[key];

    if (isCorrect) {
      correct += 1;
    } else {
      firstIncorrect ||= input;
      question.classList.remove('shake');
      void question.offsetWidth;
      question.classList.add('shake');
    }
  }

  counter.textContent = `${correct} / 3`;

  if (correct === 3) {
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    success.querySelector('a').focus({ preventScroll: true });
  } else {
    firstIncorrect?.focus();
  }
});
