/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MONGODB_URI: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_CLIENT_SECRET: string;
  readonly VITE_JWT_SECRET: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string;
  readonly VITE_ANTHROPIC_API_KEY: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_NODE_ENV: string;
  readonly VITE_PORT: string;
  readonly VITE_APP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
