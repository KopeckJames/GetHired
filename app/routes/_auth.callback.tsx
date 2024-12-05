import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { supabase } from "~/utils/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const error_description = url.searchParams.get('error_description');
  const next = url.searchParams.get('next') || '/';

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, error_description);
    return redirect(`/?error=${encodeURIComponent(error_description || 'Authentication failed')}`);
  }

  if (!code) {
    console.error('No code provided in callback');
    return redirect('/?error=missing_code');
  }

  try {
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (sessionError) {
      console.error('Error exchanging code for session:', sessionError);
      return redirect(`/?error=${encodeURIComponent(sessionError.message)}`);
    }

    if (!data.session) {
      console.error('No session data received');
      return redirect('/?error=no_session');
    }

    // Set the access token in a cookie
    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      `access_token=${data.session.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}` // 1 week
    );

    // Set refresh token if available
    if (data.session.refresh_token) {
      headers.append(
        'Set-Cookie',
        `refresh_token=${data.session.refresh_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}` // 30 days
      );
    }

    // Store user metadata if needed
    if (data.session.user) {
      const { email, user_metadata } = data.session.user;
      console.log('User authenticated:', email, user_metadata);
      
      // You could store additional user data in your database here
      // await storeUserData(data.session.user);
    }

    return redirect(next, {
      headers,
    });
  } catch (error) {
    console.error('Error in auth callback:', error);
    return redirect('/?error=auth_error');
  }
}

// This route doesn't need a component since it just handles the redirect
export default function AuthCallback() {
  return null;
}
