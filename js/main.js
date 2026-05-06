import { showView } from './router.js';
import {
  initSession,
  submitAnswer,
  getCurrentQuestion,
  getTotalQuestions,
  getSession,
  finalizeSession,
} from './engine.js';
import { Timer, formatTime } from './timer.js';
import { computeResults } from './scoring.js';
import { renderResults } from './results.js';
import { CATEGORY_LABELS } from './questions.js';

const TOTAL = 30;
let timer = null;

/* ─── Landing ─────────────────────────────────────────────── */
document.getElementById('btn-start-landing').addEventListener('click', () => {
  showView('view-instructions');
});

/* ─── Instructions ────────────────────────────────────────── */
document.getElementById('btn-begin-test').addEventListener('click', () => {
  startTest();
});
document.getElementById('btn-back-landing').addEventListener('click', () => {
  showView('view-landing');
});

/* ─── Test lifecycle ──────────────────────────────────────── */
function startTest() {
  initSession();
  showView('view-test');
  renderQuestion();
  startTimer();
}

function startTimer() {
  timer = new Timer({
    totalSeconds: 20 * 60,
    onTick: (s) => {
      document.getElementById('timer-display').textContent = formatTime(s);
    },
    onWarning: () => {
      const el = document.getElementById('timer-display');
      el.classList.remove('danger', 'flash');
      el.classList.add('warning');
    },
    onDanger: () => {
      const el = document.getElementById('timer-display');
      el.classList.remove('warning');
      el.classList.add('danger', 'flash');
    },
    onExpire: () => {
      finalizeSession(true);
      endTest();
    },
  });
  timer.start();
}

function renderQuestion() {
  const q = getCurrentQuestion();
  const session = getSession();
  const idx = session.currentIndex; // 0-based, before answer submitted
  const total = getTotalQuestions();

  // Progress bar
  document.getElementById('progress-fill').style.width = `${(idx / total) * 100}%`;
  document.getElementById('progress-label').textContent = `Question ${idx + 1} of ${total}`;

  // Category + number
  document.getElementById('question-category').textContent = CATEGORY_LABELS[q.category];
  document.getElementById('question-number').textContent = `Q${idx + 1}`;

  // Difficulty dots
  const dotsEl = document.getElementById('question-difficulty');
  dotsEl.innerHTML = [1, 2, 3].map(d =>
    `<span class="diff-dot${d <= q.difficulty ? ' active' : ''}"></span>`
  ).join('');

  // Question text
  document.getElementById('question-text').textContent = q.question;

  // Visual
  const visualEl = document.getElementById('question-visual');
  if (q.visual) {
    visualEl.innerHTML = q.visual;
    visualEl.style.display = 'block';
  } else {
    visualEl.innerHTML = '';
    visualEl.style.display = 'none';
  }

  // Answer options
  const optionsEl = document.getElementById('answer-options');
  optionsEl.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-option';
    btn.textContent = opt;
    btn.setAttribute('data-letter', letters[i]);
    btn.addEventListener('click', () => handleAnswer(i));
    optionsEl.appendChild(btn);
  });

  // Entrance animation
  const card = document.getElementById('question-card');
  card.classList.remove('exiting');
  card.classList.add('entering');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => card.classList.remove('entering'));
  });
}

function handleAnswer(selectedIndex) {
  // Disable all options immediately
  const buttons = document.querySelectorAll('.answer-option');
  buttons.forEach(b => { b.disabled = true; });
  buttons[selectedIndex].classList.add('selected');

  setTimeout(() => {
    const { isLast } = submitAnswer(selectedIndex);
    if (isLast) {
      if (timer) timer.stop();
      endTest();
    } else {
      // Exit animation then render next
      const card = document.getElementById('question-card');
      card.classList.add('exiting');
      setTimeout(() => {
        card.classList.remove('exiting');
        renderQuestion();
      }, 200);
    }
  }, 320);
}

function endTest() {
  if (timer) timer.stop();
  const session = getSession();
  if (!session.completed) finalizeSession(false);
  const results = computeResults(session);
  showView('view-results');
  renderResults(results, retakeTest);
}

function retakeTest() {
  // Reset timer display
  const timerEl = document.getElementById('timer-display');
  timerEl.className = 'timer-display';
  timerEl.textContent = '20:00';
  showView('view-landing');
}
