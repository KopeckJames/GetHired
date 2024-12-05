import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.server';

if (!ENV.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is required');
}

if (!ENV.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY is required');
}

export const supabase = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

export async function getUserByAccessToken(accessToken: string) {
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }

  return user;
}

export async function getUserById(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }

  return user;
}
