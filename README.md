# WhatsApp Cloud Notify (NovaTech)

This small service accepts POST /notify from your website and forwards a formatted ticket message to WhatsApp using the WhatsApp Cloud API (Meta Graph API).

Files added on this branch:
- server.js — Express service that posts to WhatsApp Cloud
- package.json
- .env.example

Important: Do NOT commit real credentials. Copy `.env.example` to `.env` and fill the values before running.

.env example

  WA_TOKEN=
  WA_PHONE_ID=
  WHATSAPP_TO=27602305447
  API_KEY=api_Ky8f3N9pQ2vZ6sT1bL0wXrU5yH7mC4q
  ALLOWED_ORIGIN=
  PORT=3000

Notes
- WHATSAPP_TO: E.164 without '+' (e.g. 27602305447)
- WA_PHONE_ID: the phone-number-id from the WhatsApp Cloud API setup
- WA_TOKEN: the page access token (long-lived recommended for servers)
- API_KEY: optional shared secret. The server accepts requests if X-API-Key matches or if the request Origin/Referer starts with ALLOWED_ORIGIN.

Run locally
1. Copy `.env.example` to `.env` and set WA_TOKEN and WA_PHONE_ID and (optionally) API_KEY and ALLOWED_ORIGIN.
2. npm install
3. npm start

Test with curl

curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -H "X-API-Key: api_Ky8f3N9pQ2vZ6sT1bL0wXrU5yH7mC4q" \
  -d '{"id":"NT-0001","name":"Test","email":"a@b.com","title":"X","desc":"details","p":3,"at":1630000000000}'

Deployment
- Deploy to Render, Railway, Heroku, or similar. Set environment variables in the host UI (WA_TOKEN, WA_PHONE_ID, WHATSAPP_TO, API_KEY).
- Use HTTPS in production.

Security
- Do not expose API_KEY in public frontend bundles.
- Use ALLOWED_ORIGIN to whitelist your website origin so browser requests from the site are accepted without embedding the key.
- Enable rate-limiting and logging.
- Obtain explicit opt-in from recipients before sending WhatsApp messages.
