const VIEWS = ['view-landing', 'view-instructions', 'view-test', 'view-results'];

export function showView(id) {
  VIEWS.forEach(v => {
    const el = document.getElementById(v);
    if (el) el.classList.toggle('view--active', v === id);
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.dispatchEvent(new CustomEvent('viewchange', { detail: { view: id } }));
}
