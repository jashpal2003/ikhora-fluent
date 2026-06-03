/**
 * Shared environment configuration for Ikhora Fluent web app.
 * Single source of truth for all environment variable checks.
 */

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000',
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '',
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
}

/**
 * Returns true when Supabase is properly configured with real credentials.
 * Used to toggle between demo mode and production auth flows.
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    env.supabaseUrl &&
    env.supabaseUrl.includes('.supabase.co') &&
    env.supabaseAnonKey &&
    env.supabaseAnonKey !== 'YOUR_ANON_PUBLIC_KEY' &&
    !env.supabaseAnonKey.startsWith('placeholder')
  )
}
