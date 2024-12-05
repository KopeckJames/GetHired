import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticateWithGoogle } from "~/models/user.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return redirect('/?error=' + encodeURIComponent(error));
  }

  if (!code) {
    return redirect('/?error=' + encodeURIComponent('No authorization code provided'));
  }

  try {
    // Exchange the code for Google user info
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${url.origin}/auth/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const { access_token } = await response.json();

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const googleUser = await userInfoResponse.json();

    // Create or update user in our database
    const { user, token } = await authenticateWithGoogle({
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
    });

    // Set auth cookie
    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}` // 7 days
    );

    // Redirect to home page with success message
    return redirect('/', {
      headers,
    });
  } catch (error) {
    console.error('Auth callback error:', error);
    return redirect(
      '/?error=' + encodeURIComponent('Authentication failed. Please try again.')
    );
  }
}
