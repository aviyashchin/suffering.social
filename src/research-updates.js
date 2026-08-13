export function initResearchUpdateForm({
  form = document.querySelector('#research-update-form'),
  fetchImpl,
} = {}) {
  if (!form || form.dataset.ready === 'true') return;

  fetchImpl ||= window.fetch.bind(window);
  form.dataset.ready = 'true';
  const submit = form.querySelector('button[type="submit"]');
  const status = form.querySelector('[role="status"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const fields = new FormData(form);
    const payload = {
      email: String(fields.get('email') || '').trim(),
      consent: fields.get('consent') === 'on',
      website: String(fields.get('website') || ''),
    };

    submit.disabled = true;
    status.textContent = 'Saving your email...';

    try {
      const response = await fetchImpl('/api/research-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Please try again.');

      form.reset();
      status.textContent = 'You are on the list.';
    } catch (error) {
      status.textContent = error.message || 'Please try again.';
    } finally {
      submit.disabled = false;
    }
  });
}

if (typeof document !== 'undefined') {
  initResearchUpdateForm();
}
