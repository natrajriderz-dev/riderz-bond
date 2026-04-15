const { AppState } = require('react-native');
require('react-native-url-polyfill/auto');
const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const { createClient } = require('@supabase/supabase-js');

const DEFAULT_SUPABASE_URL = 'https://mocbhyhccwwbczcqcdwb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2JoeWhjY3d3YmN6Y3FjZHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3Nzc1OTgsImV4cCI6MjA4NzM1MzU5OH0.Xzo9Yv29oTdjWyqnfedQAfh4vUYxSOVKLF5cKjsYZuk';

// Expo inlines EXPO_PUBLIC_* variables at build time. Keep a fallback so preview
// builds still work, but surface clearly when a deployment forgot to set env vars.
const envSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const envSupabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = envSupabaseUrl || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = envSupabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY;
const usingFallbackConfig = !envSupabaseUrl || !envSupabaseAnonKey;
const supabaseProjectHost = supabaseUrl.replace(/^https?:\/\//, '');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Supabase credentials not found in environment');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey ? 'SET' : 'MISSING');
}

if (usingFallbackConfig) {
  console.warn(
    `[Supabase] Using bundled fallback config for ${supabaseProjectHost}. ` +
    'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in EAS/Vercel to avoid deployment drift.'
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

module.exports = {
  supabase,
  supabaseConfig: {
    url: supabaseUrl,
    projectHost: supabaseProjectHost,
    usingFallbackConfig,
  },
};
