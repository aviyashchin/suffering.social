import { jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/dom';
import { initResearchUpdateForm } from './research-updates.js';

function renderForm() {
  document.body.innerHTML = `
    <form id="research-update-form">
      <input name="email" type="email">
      <input name="consent" type="checkbox" checked>
      <input name="website" type="text" value="">
      <button type="submit">Send me updates</button>
      <p role="status"></p>
    </form>
  `;
  const form = document.querySelector('form');
  form.querySelector('[name="email"]').value = 'reader@example.com';
  return form;
}

describe('research update form', () => {
  test('submits only email, consent, and the spam trap', async () => {
    const form = renderForm();
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    initResearchUpdateForm({ form, fetchImpl });

    fireEvent.submit(form);
    await waitFor(() => {
      expect(form.querySelector('[role="status"]')).toHaveTextContent(
        'You are on the list.'
      );
    });

    expect(fetchImpl).toHaveBeenCalledWith('/api/research-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'reader@example.com',
        consent: true,
        website: '',
      }),
    });
    expect(form.querySelector('[name="email"]')).toHaveValue('');
  });

  test('shows a useful failure and keeps the email for another try', async () => {
    const form = renderForm();
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Please try again.' }),
    });
    initResearchUpdateForm({ form, fetchImpl });

    fireEvent.submit(form);
    await waitFor(() => {
      expect(form.querySelector('[role="status"]')).toHaveTextContent(
        'Please try again.'
      );
    });

    expect(form.querySelector('[name="email"]')).toHaveValue(
      'reader@example.com'
    );
  });
});
