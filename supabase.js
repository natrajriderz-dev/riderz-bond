const { AppState } = require('react-native');
require('react-native-url-polyfill/auto');
const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const { createClient } = require('@supabase/supabase-js');

// Load from environment variables (Expo loads these from .env)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mocbhyhccwwbczcqcdwb.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2JoeWhjY3d3YmN6Y3FjZHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3Nzc1OTgsImV4cCI6MjA4NzM1MzU5OH0.Xzo9Yv29oTdjWyqnfedQAfh4vUYxSOVKLF5cKjsYZuk';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Supabase credentials not found in environment');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey ? 'SET' : 'MISSING');
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

module.exports = { supabase };
