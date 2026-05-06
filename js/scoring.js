import { CATEGORIES, CATEGORY_LABELS } from './questions.js';

const WEIGHTS = { 1: 1.0, 2: 1.5, 3: 2.0 };

// Max raw: 10 diff-1 × 1.0 + 10 diff-2 × 1.5 + 10 diff-3 × 2.0 = 45
const MAX_RAW = 45.0;

const IQ_SCALE = [
  { raw: 0,     iq: 70  },
  { raw: 11.25, iq: 85  },
  { raw: 22.5,  iq: 100 },
  { raw: 33.75, iq: 115 },
  { raw: 40.5,  iq: 130 },
  { raw: 45.0,  iq: 145 },
];

const PERCENTILE_TABLE = [
  { iq: 70,  pct: 2  },
  { iq: 75,  pct: 5  },
  { iq: 80,  pct: 9  },
  { iq: 85,  pct: 16 },
  { iq: 90,  pct: 25 },
  { iq: 95,  pct: 37 },
  { iq: 100, pct: 50 },
  { iq: 105, pct: 63 },
  { iq: 110, pct: 75 },
  { iq: 115, pct: 84 },
  { iq: 120, pct: 91 },
  { iq: 125, pct: 95 },
  { iq: 130, pct: 98 },
  { iq: 135, pct: 99 },
  { iq: 145, pct: 99 },
];

function computeRawScore(answers) {
  return answers.reduce((sum, a) => sum + (a.correct ? WEIGHTS[a.difficulty] : 0), 0);
}

function rawToIQ(raw) {
  const clamped = Math.max(0, Math.min(MAX_RAW, raw));
  for (let i = 1; i < IQ_SCALE.length; i++) {
    if (clamped <= IQ_SCALE[i].raw) {
      const t = (clamped - IQ_SCALE[i - 1].raw) / (IQ_SCALE[i].raw - IQ_SCALE[i - 1].raw);
      return Math.round(IQ_SCALE[i - 1].iq + t * (IQ_SCALE[i].iq - IQ_SCALE[i - 1].iq));
    }
  }
  return 145;
}

function iqToPercentile(iq) {
  const clamped = Math.max(70, Math.min(145, iq));
  for (let i = 1; i < PERCENTILE_TABLE.length; i++) {
    if (clamped <= PERCENTILE_TABLE[i].iq) {
      const t = (clamped - PERCENTILE_TABLE[i - 1].iq) / (PERCENTILE_TABLE[i].iq - PERCENTILE_TABLE[i - 1].iq);
      return Math.round(PERCENTILE_TABLE[i - 1].pct + t * (PERCENTILE_TABLE[i].pct - PERCENTILE_TABLE[i - 1].pct));
    }
  }
  return 99;
}

function iqToClassification(iq) {
  if (iq < 80)  return { label: 'Below Average',  color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
  if (iq < 90)  return { label: 'Low Average',     color: '#f97316', bg: 'rgba(249,115,22,0.15)' };
  if (iq < 110) return { label: 'Average',         color: '#eab308', bg: 'rgba(234,179,8,0.15)'  };
  if (iq < 120) return { label: 'Above Average',   color: '#22c55e', bg: 'rgba(34,197,94,0.15)'  };
  if (iq < 130) return { label: 'Superior',        color: '#06b6d4', bg: 'rgba(6,182,212,0.15)'  };
  return              { label: 'Very Superior',    color: '#a855f7', bg: 'rgba(168,85,247,0.15)' };
}

function categoryBreakdown(answers) {
  const cats = Object.values(CATEGORIES);
  return cats.map(cat => {
    const catAnswers = answers.filter(a => a.category === cat);
    const earned = catAnswers.reduce((s, a) => s + (a.correct ? WEIGHTS[a.difficulty] : 0), 0);
    const maxPossible = catAnswers.reduce((s, a) => s + WEIGHTS[a.difficulty], 0);
    const percentage = maxPossible > 0 ? Math.round((earned / maxPossible) * 100) : 0;
    const correctCount = catAnswers.filter(a => a.correct).length;
    return {
      category: cat,
      label: CATEGORY_LABELS[cat],
      percentage,
      correct: correctCount,
      total: catAnswers.length,
    };
  });
}

export function computeResults(session) {
  const rawScore      = computeRawScore(session.answers);
  const iq            = rawToIQ(rawScore);
  const percentile    = iqToPercentile(iq);
  const classification = iqToClassification(iq);
  const categories    = categoryBreakdown(session.answers);
  const correctTotal  = session.answers.filter(a => a.correct).length;
  const timeTakenSec  = Math.round((session.endTime - session.startTime) / 1000);

  return {
    iq,
    rawScore,
    percentile,
    classification,
    categories,
    correctTotal,
    totalQuestions: session.answers.length,
    timeTakenSec,
    timedOut: session.timedOut,
  };
}
