import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';
import { Webhook, type WebhookRequiredHeaders } from 'svix';
import getRawBody from 'raw-body';

const DATABASE_URL = process.env.DATABASE_URL!;
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

// Connect to PostgreSQL with SSL
const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
});

client.connect()
  .then(() => console.log('[DB] Connected successfully'))
  .catch((err) => console.error('[DB] Connection error:', err));

// Initialize Svix Webhook verifier
const wh = new Webhook(CLERK_WEBHOOK_SECRET);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[Webhook] Incoming request', req.method, req.url);

  if (req.method !== 'POST') {
    console.log('[Webhook] Invalid method', req.method);
    return res.status(405).send('Method Not Allowed');
  }

  // Get raw body as string for Svix
  let rawBody: string;
  try {
    rawBody = (await getRawBody(req)).toString();
    console.log('[Webhook] Raw body received:', rawBody);
  } catch (err) {
    console.error('[Webhook] Failed to read raw body:', err);
    return res.status(400).send('Bad Request');
  }

  const headers: WebhookRequiredHeaders = {
    'svix-id': req.headers['svix-id'] as string,
    'svix-signature': req.headers['svix-signature'] as string,
    'svix-timestamp': req.headers['svix-timestamp'] as string,
  };

  let event: any;
  try {
    event = wh.verify(rawBody, headers);
    console.log('[Webhook] Signature verified. Event type:', event.type);
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err);
    return res.status(401).send('Unauthorized');
  }

  try {
    switch (event.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = event.data;
        const email = email_addresses[0]?.email_address || '';
        const name = `${first_name || ''} ${last_name || ''}`.trim();

        console.log('[DB] Inserting user:', { id, email, name });
        await client.query(
          `INSERT INTO public.users (clerk_id, email, name) VALUES ($1, $2, $3) ON CONFLICT (clerk_id) DO NOTHING`,
          [id, email, name]
        );
        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name } = event.data;
        const email = email_addresses[0]?.email_address || '';
        const name = `${first_name || ''} ${last_name || ''}`.trim();

        console.log('[DB] Updating user:', { id, email, name });
        await client.query(
          `UPDATE public.users SET email=$1, name=$2, updated_at=NOW() WHERE clerk_id=$3`,
          [email, name, id]
        );
        break;
      }

      case 'user.deleted': {
        const { id } = event.data;
        console.log('[DB] Deleting user:', id);
        await client.query(`DELETE FROM public.users WHERE clerk_id=$1`, [id]);
        break;
      }

      default:
        console.log('[Webhook] Unhandled event type:', event.type);
    }

    console.log('[Webhook] Successfully processed event');
    return res.status(200).send('Webhook processed');
  } catch (err) {
    console.error('[DB] Error handling Clerk webhook:', err);
    return res.status(500).send('Internal Server Error');
  }
}
