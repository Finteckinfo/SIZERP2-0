import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';
import crypto from 'crypto';

// Ensure this matches your Clerk webhook secret
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;
const DATABASE_URL = process.env.DATABASE_URL!;

const client = new Client({ connectionString: DATABASE_URL });
client.connect();

function verifyClerkSignature(req: VercelRequest) {
  const signature = req.headers['clerk-signature'] as string;
  const payload = JSON.stringify(req.body);

  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', CLERK_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  if (!verifyClerkSignature(req)) {
    return res.status(401).send('Unauthorized');
  }

  const event = req.body;

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
