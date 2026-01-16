# RemindAI n8n Production Deployment Guide

This guide explains how to deploy the RemindAI n8n workflows for production use.

## 1. Import Workflow
1. Open your n8n instance.
2. Click on **Workflows** -> **Add Workflow** -> **Import from File**.
3. Select `n8n-production-workflow.json` from the project root.

## 2. Environment Variables
Ensure your n8n instance has access to the following environment variables (set these in your n8n host or via n8n's internal environment variable management):

| Variable | Description |
| :--- | :--- |
| `BACKEND_URL` | The public URL of your RemindAI Next.js backend (e.g., `https://api.remindai.com`) |
| `API_SECRET` | The secret key used for backend authentication (must match `API_SECRET` in your backend `.env`) |
| `TELEGRAM_BOT_TOKEN` | Your Telegram Bot Token from @BotFather |
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |
| `TWILIO_WHATSAPP_NUMBER` | Your Twilio WhatsApp Sandbox or Production number |

## 3. Webhook Configuration
After importing the workflow, you must configure the webhooks in your respective platforms:

### Telegram
Run the following command (replace placeholders):
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TELEGRAM_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://<YOUR_N8N_URL>/webhook/telegram-inbound", "secret_token": "<YOUR_TELEGRAM_SECRET_TOKEN>"}'
```
*Note: The `secret_token` should match `TELEGRAM_SECRET_TOKEN` in your backend `.env`.*

### WhatsApp (Twilio)
1. Go to your Twilio Console -> Messaging -> Try it Out -> WhatsApp Sandbox (or your production sender).
2. Set the "When a message comes in" URL to: `https://<YOUR_N8N_URL>/webhook/whatsapp-inbound`.
3. Set the method to `POST`.

## 4. Testing
1. Send a message to your Telegram or WhatsApp bot.
2. Check the n8n execution log to ensure the workflow is triggered.
3. Verify that the reminder is correctly saved in the backend database.

## 5. Security Notes
- The production workflow uses `x-api-secret` headers for all backend calls.
- Twilio requests are validated using the `x-twilio-signature` header (handled by the backend).
- Telegram requests are validated using the `secret_token` (handled by the backend).
