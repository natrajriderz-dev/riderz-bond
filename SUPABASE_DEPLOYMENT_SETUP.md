# Supabase Deployment Setup

This repo already contains a working client in [supabase.js](/home/natzridz/suyavaraa/supabase.js), but deployments should still set environment variables explicitly so web and mobile point at the same project.

## Required environment variables

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Copy [.env.example](/home/natzridz/suyavaraa/.env.example) to `.env.local` for local work.

## EAS builds

Set the same public variables in your EAS project before building preview or production apps.

Example:

```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value https://your-project-ref.supabase.co --scope project
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your-public-anon-key --scope project
```

After updating env vars, rebuild the app. Existing builds will keep the old inlined values.

## Vercel web deployments

Set the same two variables in the Vercel project settings for every environment you use:

- Production
- Preview
- Development

Redeploy after changing them.

## Storage buckets required by onboarding

The onboarding flow uploads media and expects these buckets to exist:

- `avatars`
- `posts`
- `verification_media`

See [SUPABASE_STORAGE_BUCKETS.md](/home/natzridz/suyavaraa/SUPABASE_STORAGE_BUCKETS.md) for the bucket list and [fix_storage_buckets.sql](/home/natzridz/suyavaraa/fix_storage_buckets.sql) for related checks/guidance.

## Important admin dashboard note

The static admin dashboard should not perform privileged admin actions directly from the browser using Supabase client keys.

Safe approach:

- browser dashboard -> secure backend / Supabase Edge Function
- secure backend -> Supabase service role

Unsafe approach:

- browser dashboard -> service role key

Never ship the service role key to Vercel client-side code.
