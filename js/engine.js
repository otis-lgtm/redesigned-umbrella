import { QUESTIONS, CATEGORIES } from './questions.js';

let session = null;

/* Interleave questions by category so each test feels varied:
   pos 0: numseq[0], pos 1: matrix[0], pos 2: verbal[0], ... */
function buildQuestionOrder() {
  const byCategory = {};
  Object.values(CATEGORIES).forEach(cat => { byCategory[cat] = []; });
  QUESTIONS.forEach(q => byCategory[q.category].push(q));

  // Fisher-Yates shuffle within each category
  Object.values(byCategory).forEach(arr => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  });

  const cats = Object.keys(byCategory);
  const maxLen = Math.max(...cats.map(c => byCategory[c].length));
  const result = [];
  for (let i = 0; i < maxLen; i++) {
    cats.forEach(cat => {
      if (byCategory[cat][i]) result.push(byCategory[cat][i]);
    });
  }
  return result;
}

export function initSession() {
  session = {
    questions: buildQuestionOrder(),
    currentIndex: 0,
    answers: [],
    startTime: new Date(),
    endTime: null,
    timedOut: false,
    completed: false,
  };
  return session;
}

export function getSession() {
  return session;
}

export function getCurrentQuestion() {
  return session.questions[session.currentIndex];
}

export function getTotalQuestions() {
  return session.questions.length;
}

export function submitAnswer(selectedIndex) {
  const q = session.questions[session.currentIndex];
  const correct = selectedIndex === q.correct;
  session.answers.push({
    questionId: q.id,
    category: q.category,
    difficulty: q.difficulty,
    selectedIndex,
    correct,
  });
  session.currentIndex++;
  const isLast = session.currentIndex >= session.questions.length;
  if (isLast) finalizeSession(false);
  return { correct, isLast };
}

export function finalizeSession(timedOut = false) {
  if (session.completed) return;
  session.endTime = new Date();
  session.timedOut = timedOut;
  session.completed = true;

  // Fill unanswered questions as incorrect (for timed-out sessions)
  while (session.answers.length < session.questions.length) {
    const q = session.questions[session.answers.length];
    session.answers.push({
      questionId: q.id,
      category: q.category,
      difficulty: q.difficulty,
      selectedIndex: null,
      correct: false,
    });
  }
}
