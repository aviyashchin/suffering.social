const CONTACTS_ENDPOINT =
  'https://api.attio.com/v2/objects/people/records?matching_attribute=email_addresses';
const RESEARCH_UPDATES_LIST_ENDPOINT =
  'https://api.attio.com/v2/lists/suffering_social_research_updates/entries';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function createResearchUpdatesHandler({
  apiKey = process.env.CONTACTS_API_KEY || process.env.ATTIO_API_KEY || '',
  fetchImpl = fetch,
} = {}) {
  return async function researchUpdatesHandler(request, response) {
    if (request.method !== 'POST') {
      response.status(405).json({ error: 'Method not allowed.' });
      return;
    }

    const body = parseBody(request.body);
    const email = String(body.email || '').trim().toLowerCase();
    const consent = body.consent === true;
    const website = String(body.website || '').trim();

    if (website) {
      response.status(200).json({ ok: true });
      return;
    }

    if (!consent || email.length > 254 || !EMAIL_PATTERN.test(email)) {
      response.status(400).json({ error: 'Enter a valid email and check the permission box.' });
      return;
    }

    if (!apiKey) {
      response.status(503).json({ error: 'Please try again later.' });
      return;
    }

    try {
      const upstream = await fetchImpl(CONTACTS_ENDPOINT, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: { values: { email_addresses: [email] } },
        }),
      });

      if (!upstream.ok) {
        response.status(502).json({ error: 'Please try again later.' });
        return;
      }

      const contact = await upstream.json();
      const recordId = contact?.data?.id?.record_id;
      if (!recordId) {
        response.status(502).json({ error: 'Please try again later.' });
        return;
      }

      const listEntry = await fetchImpl(RESEARCH_UPDATES_LIST_ENDPOINT, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            parent_record_id: recordId,
            parent_object: 'people',
            entry_values: {},
          },
        }),
      });
      if (!listEntry.ok) {
        response.status(502).json({ error: 'Please try again later.' });
        return;
      }

      response.status(200).json({ ok: true });
    } catch {
      response.status(502).json({ error: 'Please try again later.' });
    }
  };
}

function parseBody(body) {
  if (typeof body !== 'string') return body || {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

export default createResearchUpdatesHandler();
