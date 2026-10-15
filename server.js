const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const {
  WA_TOKEN,
  WA_PHONE_ID,
  WHATSAPP_TO,
  API_KEY,
  ALLOWED_ORIGIN,
  PORT = 3000
} = process.env;

if (!WA_TOKEN || !WA_PHONE_ID || !WHATSAPP_TO) {
  console.warn('Warning: WA_TOKEN, WA_PHONE_ID or WHATSAPP_TO not set. The server will still start for local testing but sending will fail until these are provided.');
}

const app = express();
app.use(helmet());
app.use(bodyParser.json({ limit: '64kb' }));

// CORS: allow the configured origin (if present) to make browser requests.
if (ALLOWED_ORIGIN) app.use(cors({ origin: ALLOWED_ORIGIN }));

// Basic rate limiter for /notify
const limiter = rateLimit({ windowMs: 60_000, max: 30 });
app.use('/notify', limiter);

function isRequestAllowed(req) {
  const key = req.get('X-API-Key');
  if (API_KEY && key && key === API_KEY) return true;

  // Allow requests from configured ALLOWED_ORIGIN
  const origin = req.get('Origin') || req.get('Referer') || '';
  if (ALLOWED_ORIGIN && origin.startsWith(ALLOWED_ORIGIN)) return true;

  // In non-production without API_KEY, allow local testing
  if (process.env.NODE_ENV !== 'production' && !API_KEY) return true;

  return false;
}

app.post('/notify', async (req, res) => {
  try {
    if (!isRequestAllowed(req)) {
      return res.status(401).json({ error: 'Unauthorized (invalid API key or origin)' });
    }

    const t = req.body || {};
    const id = t.id || 'unknown';
    const name = t.name || '-';
    const email = t.email || '-';
    const title = t.title || '-';
    const desc = t.desc || '-';
    const p = t.p || '-';
    const at = t.at ? new Date(Number(t.at)).toLocaleString() : '-';

    const text = `New Support Ticket\nID: ${id}\nName: ${name}\nEmail: ${email}\nTitle: ${title}\nPriority: P${p}\nDetails: ${desc}\nLogged: ${at}`;

    if (!WA_TOKEN || !WA_PHONE_ID || !WHATSAPP_TO) {
      return res.status(500).json({ error: 'WhatsApp settings not configured on server (WA_TOKEN / WA_PHONE_ID / WHATSAPP_TO).' });
    }

    const url = `https://graph.facebook.com/v16.0/${WA_PHONE_ID}/messages`;
    const body = {
      messaging_product: 'whatsapp',
      to: WHATSAPP_TO,
      type: 'text',
      text: { body: text }
    };

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const j = await r.json();
    if (!r.ok) {
      console.error('WhatsApp API error', j);
      return res.status(500).json({ error: j });
    }

    return res.json({ ok: true, result: j });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'send-failed' });
  }
});

app.get('/', (req, res) => res.send('NovaTech WhatsApp notify service'));

app.listen(PORT, () => console.log(`notify server listening on ${PORT}`));
