/**
 * Admin Setup Script
 * 
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node scripts/setup-admin.js admin@example.com
 * 
 * This script safely updates a user's role to 'admin' using the Supabase Service Role key.
 * It never exposes keys in logs or git.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const targetEmail = process.argv[2];
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!targetEmail) {
  console.error('Error: Please provide the target email address.');
  console.error('Usage: node scripts/setup-admin.js <email>');
  process.exit(1);
}

if (!supabaseUrl) {
  console.error('Error: VITE_SUPABASE_URL is not set.');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.log(`
[Note] SUPABASE_SERVICE_ROLE_KEY is not defined in the environment.
To make '${targetEmail}' an administrator, run the following SQL command in your Supabase SQL Editor:

UPDATE public.profiles
SET role = 'admin'
WHERE email = '${targetEmail}';
  `);
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function promote() {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .ilike('email', targetEmail)
    .select();

  if (error) {
    console.error('Failed to promote user:', error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log(`No user profile found with email '${targetEmail}'. Please ensure the user has signed up first.`);
  } else {
    console.log(`Success: User '${targetEmail}' has been granted Administrator privileges.`);
  }
}

promote().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
