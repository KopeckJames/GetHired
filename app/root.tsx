import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import "~/styles/tailwind.css";
import { NotificationProvider } from "~/context/NotificationContext";
import { ApplicationProvider } from "~/context/ApplicationContext";
import { AuthProvider } from "~/context/AuthContext";
import Layout from "~/components/Layout";
import { getPublicEnv, validatePublicEnv } from "~/utils/env.server";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useEffect } from "react";
import Alert from "~/components/Alert";
import { verifyToken } from "~/models/user.server";
import { serializeUser } from "~/types/user";

export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: "/favicon.ico",
    type: "image/x-icon",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  validatePublicEnv();
  const env = getPublicEnv();

  // Get token from cookie
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(cookie => {
      const [name, value] = cookie.split('=');
      return [name, decodeURIComponent(value)];
    })
  );
  
  const token = cookies.auth_token;
  let user = null;
  let isAuthenticated = false;

  if (token) {
    try {
      const verifiedUser = await verifyToken(token);
      if (verifiedUser) {
        user = serializeUser(verifiedUser);
        isAuthenticated = true;
      }
    } catch (error) {
      console.error('Error verifying token:', error);
    }
  }

  return json({
    ENV: env,
    user,
    isAuthenticated
  });
}

export default function App() {
  const { ENV, user, isAuthenticated } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  // Clear error from URL after displaying
  useEffect(() => {
    if (error) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [error]);

  // Initialize ENV in window before rendering auth provider
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.ENV = ENV;
    }
  }, [ENV]);

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Track and manage your job applications with GetHired!" />
        <meta name="theme-color" content="#000000" />
        <title>GetHired! - Job Application Tracker</title>
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-white text-slate-900 antialiased">
        <AuthProvider initialUser={user} initialAuthState={isAuthenticated}>
          <NotificationProvider>
            <ApplicationProvider>
              <Layout>
                {error && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <Alert variant="error" onClose={() => {
                      const newUrl = new URL(window.location.href);
                      newUrl.searchParams.delete('error');
                      window.history.replaceState({}, '', newUrl.toString());
                    }}>
                      {decodeURIComponent(error)}
                    </Alert>
                  </div>
                )}
                <Outlet />
              </Layout>
            </ApplicationProvider>
          </NotificationProvider>
        </AuthProvider>
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}

// Error boundary
export function ErrorBoundary({ error }: { error: Error | null }) {
  const errorMessage = error?.message || "An unexpected error occurred";
  
  return (
    <html lang="en" className="h-full">
      <head>
        <title>Error - GetHired!</title>
        <Meta />
        <Links />
      </head>
      <body className="flex h-full flex-col items-center justify-center bg-white text-slate-900">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">Oops! Something went wrong</h1>
          <p className="text-lg text-slate-600">
            {errorMessage}
          </p>
          <div>
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700"
            >
              Go back home →
            </a>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
