/** @jest-environment node */

import { jest } from '@jest/globals';
import { createResearchUpdatesHandler } from './research-updates.js';

function makeResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

describe('research update API', () => {
  test('rejects methods other than POST', async () => {
    const response = makeResponse();
    await createResearchUpdatesHandler({ apiKey: 'secret' })(
      { method: 'GET' },
      response
    );
    expect(response.statusCode).toBe(405);
  });

  test('requires a valid email and explicit consent', async () => {
    const fetchImpl = jest.fn();
    const handler = createResearchUpdatesHandler({
      apiKey: 'secret',
      fetchImpl,
    });

    const response = makeResponse();
    await handler(
      { method: 'POST', body: { email: 'not-an-email', consent: false } },
      response
    );

    expect(response.statusCode).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test('silently accepts spam-trap submissions without storing them', async () => {
    const fetchImpl = jest.fn();
    const response = makeResponse();
    await createResearchUpdatesHandler({ apiKey: 'secret', fetchImpl })(
      {
        method: 'POST',
        body: {
          email: 'reader@example.com',
          consent: true,
          website: 'bot-filled-this',
        },
      },
      response
    );

    expect(response.statusCode).toBe(200);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test('stores a consenting email through the server-side contact API', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: { record_id: 'person-123' } } }),
      })
      .mockResolvedValueOnce({ ok: true });
    const response = makeResponse();
    await createResearchUpdatesHandler({ apiKey: 'secret', fetchImpl })(
      {
        method: 'POST',
        body: {
          email: 'Reader@Example.com ',
          consent: true,
          website: '',
        },
      },
      response
    );

    expect(response.statusCode).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const [url, request] = fetchImpl.mock.calls[0];
    expect(url).toContain('/v2/objects/people/records?matching_attribute=email_addresses');
    expect(request.method).toBe('PUT');
    expect(request.headers.Authorization).toBe('Bearer secret');
    expect(JSON.parse(request.body)).toEqual({
      data: { values: { email_addresses: ['reader@example.com'] } },
    });

    const [listUrl, listRequest] = fetchImpl.mock.calls[1];
    expect(listUrl).toContain('/v2/lists/suffering_social_research_updates/entries');
    expect(listRequest.method).toBe('PUT');
    expect(JSON.parse(listRequest.body)).toEqual({
      data: {
        parent_record_id: 'person-123',
        parent_object: 'people',
        entry_values: {},
      },
    });
  });

  test('fails honestly when storage is unavailable', async () => {
    const response = makeResponse();
    await createResearchUpdatesHandler({ apiKey: '' })(
      {
        method: 'POST',
        body: { email: 'reader@example.com', consent: true, website: '' },
      },
      response
    );

    expect(response.statusCode).toBe(503);
    expect(response.body).toEqual({ error: 'Please try again later.' });
  });
});
