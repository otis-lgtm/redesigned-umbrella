import { CATEGORY_LABELS } from './questions.js';

const BAR_COLORS = [
  '#4f46e5', // indigo
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#a855f7', // purple
];

export function renderResults(results, onRetake) {
  renderScoreHero(results);
  renderGauge(results);
  renderSummary(results);
  renderCategoryChart(results.categories);
  wireActions(onRetake, results);
}

/* ─── Score hero with count-up animation ───────────────────── */
function renderScoreHero(results) {
  const numEl    = document.getElementById('score-number');
  const classEl  = document.getElementById('score-classification');
  const pctEl    = document.getElementById('score-percentile');
  const { iq, percentile, classification } = results;

  // Classification badge
  classEl.textContent = classification.label;
  classEl.style.color = classification.color;
  classEl.style.background = classification.bg;
  classEl.style.border = `1px solid ${classification.color}40`;

  // Percentile text
  pctEl.textContent = `You scored higher than ${percentile}% of test takers`;

  // Count-up animation
  const start = 70;
  const duration = 1500;
  const startTime = performance.now();

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function tick(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const value = Math.round(start + easeOutCubic(t) * (iq - start));
    numEl.textContent = value;
    numEl.style.color = classification.color;
    if (t < 1) requestAnimationFrame(tick);
  }

  numEl.textContent = start;
  numEl.style.color = classification.color;
  requestAnimationFrame(tick);
}

/* ─── SVG semicircle gauge ──────────────────────────────────── */
function renderGauge(results) {
  const container = document.getElementById('score-gauge');
  const { iq, classification } = results;

  // Semicircle: center (100,100), radius 80
  // Arc: M 20,100 A 80,80 0 0 1 180,100
  // Full arc length = π × 80 ≈ 251.3
  const R = 80;
  const CX = 100, CY = 100;
  const ARC_LEN = Math.PI * R;
  const pct = Math.max(0, Math.min(1, (iq - 70) / (160 - 70)));

  container.innerHTML = `
    <svg class="gauge-svg" viewBox="0 0 200 110" aria-hidden="true">
      <!-- Track -->
      <path
        d="M ${CX - R},${CY} A ${R},${R} 0 0 1 ${CX + R},${CY}"
        class="gauge-track"
      />
      <!-- Fill (animated via CSS transition on stroke-dasharray) -->
      <path
        id="gauge-fill-path"
        d="M ${CX - R},${CY} A ${R},${R} 0 0 1 ${CX + R},${CY}"
        class="gauge-fill"
        stroke="${classification.color}"
        stroke-dasharray="0 ${ARC_LEN.toFixed(1)}"
      />
      <!-- Scale labels -->
      <text class="gauge-scale-min" x="${CX - R - 4}" y="${CY + 18}" text-anchor="middle">70</text>
      <text class="gauge-scale-max" x="${CX + R + 4}" y="${CY + 18}" text-anchor="middle">160</text>
      <!-- IQ label below arc -->
      <text class="gauge-label-iq" x="${CX}" y="${CY + 22}" text-anchor="middle">IQ Score</text>
    </svg>`;

  // Trigger transition after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const fillPath = document.getElementById('gauge-fill-path');
      if (fillPath) {
        const filled = (pct * ARC_LEN).toFixed(1);
        fillPath.setAttribute('stroke-dasharray', `${filled} ${ARC_LEN.toFixed(1)}`);
      }
    });
  });
}

/* ─── Summary stats row ─────────────────────────────────────── */
function renderSummary(results) {
  const container = document.getElementById('result-summary');
  if (!container) return;

  const timeMins = Math.floor(results.timeTakenSec / 60);
  const timeSecs = results.timeTakenSec % 60;
  const timeStr  = `${timeMins}:${String(timeSecs).padStart(2, '0')}`;

  container.innerHTML = `
    <div class="summary-stat">
      <div class="summary-stat-num">${results.correctTotal}/${results.totalQuestions}</div>
      <div class="summary-stat-label">Correct</div>
    </div>
    <div class="summary-stat">
      <div class="summary-stat-num">${timeStr}</div>
      <div class="summary-stat-label">Time Taken</div>
    </div>
    <div class="summary-stat">
      <div class="summary-stat-num">${results.iq}</div>
      <div class="summary-stat-label">IQ Score</div>
    </div>`;
}

/* ─── Category bar chart ────────────────────────────────────── */
function renderCategoryChart(categories) {
  const container = document.getElementById('chart-bars');
  container.innerHTML = '';

  categories.forEach((cat, i) => {
    const color = BAR_COLORS[i % BAR_COLORS.length];
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <span class="bar-label">${CATEGORY_LABELS[cat.category]}</span>
      <div class="bar-track">
        <div class="bar-fill" style="background:${color}; width:0%" data-target="${cat.percentage}"></div>
      </div>
      <span class="bar-pct">${cat.percentage}%</span>`;
    container.appendChild(row);
  });

  // Animate bars
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.target + '%';
      });
    });
  });
}

/* ─── Action buttons ────────────────────────────────────────── */
function wireActions(onRetake, results) {
  const retakeBtn = document.getElementById('btn-retake');
  if (retakeBtn) {
    retakeBtn.onclick = () => onRetake();
  }

  const shareBtn = document.getElementById('btn-share');
  if (shareBtn) {
    shareBtn.onclick = () => shareResult(results);
  }
}

function shareResult(results) {
  const text = `I just scored ${results.iq} on an IQ test — ${results.classification.label}! I scored higher than ${results.percentile}% of test takers.`;

  if (navigator.share) {
    navigator.share({ title: 'My IQ Score', text }).catch(() => {});
    return;
  }

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('Result copied to clipboard!')).catch(() => showToast(text));
    return;
  }

  showToast(text);
}

function showToast(message) {
  let toast = document.getElementById('share-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'share-toast';
    toast.className = 'share-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}
