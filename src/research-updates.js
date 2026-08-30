const UNLOCK_KEY = 'suffering-research-pack';

export function initResearchUpdateForm({
  form = document.querySelector('#research-update-form'),
  fetchImpl,
  now = Date.now,
  createId = () => crypto.randomUUID(),
  openImpl = window.open.bind(window),
} = {}) {
  if (!form || form.dataset.ready === 'true') return;

  fetchImpl ||= window.fetch.bind(window);
  form.dataset.ready = 'true';
  form.dataset.startedAt = String(now());
  const submit = form.querySelector('button[type="submit"]');
  const status = form.querySelector('[role="status"]');
  const email = form.querySelector('[name="email"]');
  let pendingTrigger;

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-research-pack-url]');
    if (!trigger || !form.isConnected) return;
    event.preventDefault();
    const url = trigger.dataset.researchPackUrl;
    if (sessionStorage.getItem(UNLOCK_KEY) === 'unlocked') {
      openImpl(url, '_blank', 'noopener');
      return;
    }

    pendingTrigger = trigger;
    form.dataset.pendingUrl = url;
    form.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    email.focus({ preventScroll: true });
    status.textContent = 'Enter your email to open this source.';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const fields = new FormData(form);
    const submissionId = createId();
    const payload = {
      email: String(fields.get('email') || '').trim(),
      consent: fields.get('consent') === 'on',
      website: String(fields.get('website') || ''),
      submission_id: submissionId,
      started_at: Number(form.dataset.startedAt),
    };

    submit.disabled = true;
    status.textContent = 'Preparing the sources...';

    try {
      const response = await fetchImpl('/api/research-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': submissionId,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (
        !response.ok ||
        result.receipt_id !== submissionId ||
        result.lead_id !== submissionId
      ) {
        throw new Error(result.error || 'Please try again.');
      }

      sessionStorage.setItem(UNLOCK_KEY, 'unlocked');
      form.reset();
      form.dataset.startedAt = String(now());
      delete form.dataset.pendingUrl;
      status.textContent = 'Sources ready. Choose any source to open it.';
      pendingTrigger?.focus({ preventScroll: true });
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
