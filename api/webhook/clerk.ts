import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';
import { Webhook, type WebhookRequiredHeaders } from 'svix';

const DATABASE_URL = process.env.DATABASE_URL!;
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

const client = new Client({ connectionString: DATABASE_URL });
client.connect();

// Initialize Svix Webhook verifier
const wh = new Webhook(CLERK_WEBHOOK_SECRET);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const headers: WebhookRequiredHeaders = {
    'svix-id': req.headers['svix-id'] as string,
    'svix-signature': req.headers['svix-signature'] as string,
    'svix-timestamp': req.headers['svix-timestamp'] as string,
  };

  let event: any;

  try {
    // Svix verifies the signature and returns the parsed event
    event = wh.verify(req.body, headers);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(401).send('Unauthorized');
  }

  try {
    switch (event.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = event.data;
        const email = email_addresses[0]?.email_address || '';
        const name = `${first_name || ''} ${last_name || ''}`.trim();

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

        await client.query(
          `UPDATE public.users SET email=$1, name=$2, updated_at=NOW() WHERE clerk_id=$3`,
          [email, name, id]
        );
        break;
      }

      case 'user.deleted': {
        const { id } = event.data;
        await client.query(`DELETE FROM public.users WHERE clerk_id=$1`, [id]);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return res.status(200).send('Webhook processed');
  } catch (err) {
    console.error('Error handling Clerk webhook:', err);
    return res.status(500).send('Internal Server Error');
  }
}
