/** @jest-environment node */

import crypto from 'node:crypto';
import { jest } from '@jest/globals';
import { createResearchUpdatesHandler } from './research-updates.js';

const SUBMISSION_ID = '7b4fe04f-8c34-4f99-912a-794cae92ab91';
const NOW = Date.parse('2026-08-29T12:00:00.000Z');

function makeResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function validRequest(overrides = {}) {
  return {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'idempotency-key': SUBMISSION_ID,
    },
    body: {
      email: 'Reader@Example.com ',
      consent: true,
      website: '',
      submission_id: SUBMISSION_ID,
      started_at: NOW - 1_000,
      ...overrides,
    },
  };
}

describe('research pack API', () => {
  test('rejects methods other than POST', async () => {
    const response = makeResponse();
    await createResearchUpdatesHandler({ secret: 'secret' })({ method: 'GET' }, response);
    expect(response.statusCode).toBe(405);
  });

  test('requires valid consent, timing, and idempotency data', async () => {
    const fetchImpl = jest.fn();
    const handler = createResearchUpdatesHandler({ secret: 'secret', fetchImpl, now: () => NOW });
    const response = makeResponse();
    await handler(validRequest({ email: 'not-an-email', consent: false, started_at: NOW - 100 }), response);
    expect(response.statusCode).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test('rejects cross-site and oversized requests before forwarding', async () => {
    const fetchImpl = jest.fn();
    const handler = createResearchUpdatesHandler({ secret: 'secret', fetchImpl, now: () => NOW });
    const crossSiteResponse = makeResponse();
    await handler({
      ...validRequest(),
      headers: {
        ...validRequest().headers,
        origin: 'https://attacker.example',
        host: 'www.suffering.social',
      },
    }, crossSiteResponse);
    expect(crossSiteResponse.statusCode).toBe(403);

    const oversizedResponse = makeResponse();
    await handler({
      ...validRequest(),
      body: JSON.stringify({ payload: 'x'.repeat(17_000) }),
    }, oversizedResponse);
    expect(oversizedResponse.statusCode).toBe(413);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test('silently accepts spam-trap submissions without forwarding them', async () => {
    const fetchImpl = jest.fn();
    const response = makeResponse();
    await createResearchUpdatesHandler({ secret: 'secret', fetchImpl })(validRequest({ website: 'bot-filled-this' }), response);
    expect(response.statusCode).toBe(200);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test('signs an exact Signals lead envelope and returns its durable receipt', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      status: 201,
      json: async () => ({ ok: true, lead_id: 'lead-123', receipt_id: SUBMISSION_ID }),
    });
    const response = makeResponse();
    await createResearchUpdatesHandler({
      secret: 'secret', fetchImpl, now: () => NOW, environment: 'production',
    })(validRequest(), response);

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ ok: true, lead_id: SUBMISSION_ID, receipt_id: SUBMISSION_ID });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, request] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://signals.subconscious.ai/api/signals/lead');
    expect(request.method).toBe('POST');
    expect(request.headers['x-signals-event-id']).toBe(SUBMISSION_ID);
    expect(request.headers['x-signals-timestamp']).toBe('2026-08-29T12:00:00.000Z');
    const envelope = JSON.parse(request.body);
    expect(envelope).toEqual({
      schema_version: 1,
      event_id: SUBMISSION_ID,
      occurred_at: '2026-08-29T12:00:00.000Z',
      site_key: 'suffering_social',
      environment: 'production',
      canonical_host: 'www.suffering.social',
      email: 'reader@example.com',
      form_name: 'research_pack',
      properties: {
        title: 'Suffering.social research pack',
        summary: 'Requested the source pack and major research updates',
      },
    });
    const expectedSignature = crypto
      .createHmac('sha256', 'secret')
      .update(`${envelope.occurred_at}.${SUBMISSION_ID}.${request.body}`)
      .digest('hex');
    expect(request.headers['x-signals-signature']).toBe(`sha256=${expectedSignature}`);
  });

  test('fails closed when Signals does not return the matching receipt', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      status: 201,
      json: async () => ({ ok: true, receipt_id: 'wrong-id' }),
    });
    const response = makeResponse();
    await createResearchUpdatesHandler({ secret: 'secret', fetchImpl, now: () => NOW })(validRequest(), response);
    expect(response.statusCode).toBe(502);
    expect(response.body).toEqual({ error: 'Please try again later.' });
  });

  test('fails honestly when Signals is not configured', async () => {
    const response = makeResponse();
    await createResearchUpdatesHandler({ secret: '', now: () => NOW })(validRequest(), response);
    expect(response.statusCode).toBe(503);
    expect(response.body).toEqual({ error: 'Please try again later.' });
  });
});
