import { jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/dom';
import { initResearchUpdateForm } from './research-updates.js';

const SUBMISSION_ID = '7b4fe04f-8c34-4f99-912a-794cae92ab91';

function renderForm() {
  document.body.innerHTML = `
    <button data-research-pack-url="https://example.com/paper">Get source</button>
    <form id="research-update-form">
      <input name="email" type="email">
      <input name="consent" type="checkbox" checked>
      <input name="website" type="text" value="">
      <button type="submit">Send me the sources</button>
      <p role="status"></p>
    </form>`;
  const form = document.querySelector('form');
  form.querySelector('[name="email"]').value = 'reader@example.com';
  return form;
}

describe('research pack form', () => {
  beforeEach(() => sessionStorage.clear());

  test('sends an idempotent consent request and unlocks sources after a receipt', async () => {
    const form = renderForm();
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, lead_id: SUBMISSION_ID, receipt_id: SUBMISSION_ID }),
    });
    const openImpl = jest.fn();
    initResearchUpdateForm({
      form, fetchImpl, now: () => 10_000, createId: () => SUBMISSION_ID, openImpl,
    });

    fireEvent.click(document.querySelector('[data-research-pack-url]'));
    expect(form.dataset.pendingUrl).toBe('https://example.com/paper');
    expect(form.querySelector('[name="email"]')).toHaveFocus();
    fireEvent.submit(form);
    await waitFor(() => expect(form.querySelector('[role="status"]')).toHaveTextContent('Sources ready. Choose any source to open it.'));

    expect(fetchImpl).toHaveBeenCalledWith('/api/research-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': SUBMISSION_ID },
      body: JSON.stringify({
        email: 'reader@example.com', consent: true, website: '',
        submission_id: SUBMISSION_ID, started_at: 10_000,
      }),
    });
    expect(openImpl).not.toHaveBeenCalled();
    fireEvent.click(document.querySelector('[data-research-pack-url]'));
    expect(openImpl).toHaveBeenCalledWith('https://example.com/paper', '_blank', 'noopener');
    expect(form.querySelector('[name="email"]')).toHaveValue('');
    expect(sessionStorage.getItem('suffering-research-pack')).toBe('unlocked');
  });

  test('shows a useful failure and keeps the email for another try', async () => {
    const form = renderForm();
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Please try again.' }),
    });
    initResearchUpdateForm({ form, fetchImpl, now: () => 10_000, createId: () => SUBMISSION_ID });
    fireEvent.submit(form);
    await waitFor(() => expect(form.querySelector('[role="status"]')).toHaveTextContent('Please try again.'));
    expect(form.querySelector('[name="email"]')).toHaveValue('reader@example.com');
  });
});
