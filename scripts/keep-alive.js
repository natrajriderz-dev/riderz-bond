const { createClient } = require('@supabase/supabase-js');

// This script pings Supabase to prevent the project from pausing due to inactivity.
// It can be run manually, or scheduled as a cron job or GitHub Action.

const supabaseUrl = process.env.SUPABASE_URL || 'https://mocbhyhccwwbczcqcdwb.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2JoeWhjY3d3YmN6Y3FjZHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3Nzc1OTgsImV4cCI6MjA4NzM1MzU5OH0.Xzo9Yv29oTdjWyqnfedQAfh4vUYxSOVKLF5cKjsYZuk';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase URL or Anon Key is missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function keepAlive() {
  console.log('--- Supabase Keep-Alive Script ---');
  console.log(`Execution Time: ${new Date().toISOString()}`);
  
  try {
    // Making a simple query to the 'users' table to register activity.
    // Replace 'users' with any other existing table if necessary.
    const { data, error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      console.error('Failed to query Supabase:', error.message);
      process.exit(1);
    }

    console.log('Successfully pinged Supabase Database.');
    console.log(`Status: Active (Records found: ${data.length})`);
    process.exit(0);
  } catch (err) {
    console.error('An unexpected error occurred:', err.message);
    process.exit(1);
  }
}

keepAlive();
