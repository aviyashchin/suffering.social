import crypto from 'node:crypto';

const SIGNALS_ENDPOINT = 'https://signals.subconscious.ai/api/signals/lead';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readHeader(headers, name) {
  if (headers instanceof Headers) return headers.get(name) || '';
  const value = headers?.[name] ?? headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value || '';
}

function parseBody(body) {
  if (typeof body !== 'string') return body || {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function deploymentEnvironment() {
  if (process.env.VERCEL_ENV === 'production') return 'production';
  if (process.env.VERCEL_ENV === 'preview') return 'preview';
  return 'development';
}

function allowedOrigin(originValue, headers) {
  if (!originValue) return true;
  try {
    const origin = new URL(originValue);
    const requestHost = String(
      readHeader(headers, 'x-forwarded-host') || readHeader(headers, 'host')
    )
      .split(',')[0]
      .trim()
      .toLowerCase();
    return (
      origin.hostname === 'www.suffering.social' ||
      origin.hostname === 'suffering.social' ||
      (requestHost && origin.host.toLowerCase() === requestHost)
    );
  } catch {
    return false;
  }
}

export function createResearchUpdatesHandler({
  secret = process.env.SIGNALS_LEAD_SECRET?.trim() || '',
  endpoint = process.env.SIGNALS_LEAD_URL || SIGNALS_ENDPOINT,
  fetchImpl = fetch,
  now = Date.now,
  environment = deploymentEnvironment(),
} = {}) {
  return async function researchUpdatesHandler(request, response) {
    if (request.method !== 'POST') {
      response.status(405).json({ error: 'Method not allowed.' });
      return;
    }

    if (!String(readHeader(request.headers, 'content-type')).toLowerCase().startsWith('application/json')) {
      response.status(415).json({ error: 'Content-Type must be application/json.' });
      return;
    }
    if (!allowedOrigin(readHeader(request.headers, 'origin'), request.headers)) {
      response.status(403).json({ error: 'Request origin rejected.' });
      return;
    }
    if (Buffer.byteLength(typeof request.body === 'string' ? request.body : JSON.stringify(request.body || {})) > 16_384) {
      response.status(413).json({ error: 'Request too large.' });
      return;
    }

    const body = parseBody(request.body);
    const email = String(body.email || '').trim().toLowerCase();
    const consent = body.consent === true;
    const website = String(body.website || '').trim();
    const submissionId = String(body.submission_id || '');
    const startedAt = Number(body.started_at);
    const timestamp = now();

    if (website) {
      response.status(200).json({ ok: true });
      return;
    }

    const elapsed = timestamp - startedAt;
    const idempotencyKey = readHeader(request.headers, 'idempotency-key');
    if (
      !consent ||
      email.length > 254 ||
      !EMAIL_PATTERN.test(email) ||
      !UUID_PATTERN.test(submissionId) ||
      idempotencyKey !== submissionId ||
      !Number.isFinite(elapsed) ||
      elapsed < 800 ||
      elapsed > 86_400_000
    ) {
      response.status(400).json({ error: 'Check your email and permission, then try again.' });
      return;
    }

    if (!secret) {
      response.status(503).json({ error: 'Please try again later.' });
      return;
    }

    const occurredAt = new Date(timestamp).toISOString();
    const payload = JSON.stringify({
      schema_version: 1,
      event_id: submissionId,
      occurred_at: occurredAt,
      site_key: 'suffering_social',
      environment,
      canonical_host: 'www.suffering.social',
      email,
      form_name: 'research_pack',
      properties: {
        title: 'Suffering.social research pack',
        summary: 'Requested the source pack and major research updates',
      },
    });
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${occurredAt}.${submissionId}.${payload}`)
      .digest('hex');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    try {
      const upstream = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-signals-event-id': submissionId,
          'x-signals-timestamp': occurredAt,
          'x-signals-signature': `sha256=${signature}`,
        },
        body: payload,
        signal: controller.signal,
      });
      const receipt = await upstream.json().catch(() => ({}));
      if (
        (upstream.status !== 201 && upstream.status !== 202) ||
        receipt.receipt_id !== submissionId
      ) {
        response.status(502).json({ error: 'Please try again later.' });
        return;
      }

      response.status(upstream.status).json({
        ok: true,
        lead_id: submissionId,
        receipt_id: submissionId,
      });
    } catch {
      response.status(502).json({ error: 'Please try again later.' });
    } finally {
      clearTimeout(timeout);
    }
  };
}

export default createResearchUpdatesHandler();
