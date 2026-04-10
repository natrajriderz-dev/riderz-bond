# 🗄️ DATABASE MIGRATION GUIDE

**Status:** ✅ Migrations fixed and ready to apply  
**Last Updated:** March 23, 2026

---

## 📋 MIGRATION FILES

All migrations have been corrected and are located in `supabase/migrations/`:

1. **fish_trap_schema.sql** (103 lines) - ✅ FIXED
   - Creates `tribes` table (was missing)
   - Creates `decoy_profiles` table
   - Creates `fish_trap_interactions` table
   - Creates `fish_trap_messages` table
   - Sets up indices and RLS policies
   - **Changes:** Added tribes table creation, removed duplicate contact_info_logs

2. **notification_tokens.sql** (43 lines) - ✅ OK
   - Creates `notification_tokens` table
   - Sets up push token storage with RLS

3. **trust_and_verification.sql** (49 lines) - ✅ OK
   - Adds trust_score and is_verified columns to users
   - Creates `verification_requests` table
   - Creates `contact_info_logs` table (unified definition)

4. **seed_decoys_data.sql** (27 lines) - ✅ OK
   - Seeds 20 authentic decoy profiles
   - Provides personality traits for AI response generation

---

## 🚀 HOW TO APPLY MIGRATIONS

### Option 1: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Navigate to project
cd /home/natzridz/bond-app

# Link to your Supabase project
supabase link --project-ref <your-project-ref>

# Apply all pending migrations
supabase migration up

# Or run specific migration
supabase migration up --file supabase/migrations/fish_trap_schema.sql
```

### Option 2: Manual - Supabase Dashboard

1. **Log in** to Supabase console (https://app.supabase.com)
2. **Open** your project → SQL Editor
3. **For each migration file:**
   - Click "New Query"
   - Copy entire contents of SQL file
   - Execute query
   - **Apply in this order:**
     1. fish_trap_schema.sql
     2. notification_tokens.sql
     3. trust_and_verification.sql
     4. seed_decoys_data.sql

### Option 3: Using PostgreSQL Client

```bash
# Using psql
psql -h <hostname> -U <username> -d <database> < supabase/migrations/fish_trap_schema.sql
psql -h <hostname> -U <username> -d <database> < supabase/migrations/notification_tokens.sql
psql -h <hostname> -U <username> -d <database> < supabase/migrations/trust_and_verification.sql
psql -h <hostname> -U <username> -d <database> < supabase/migrations/seed_decoys_data.sql
```

---

## ✅ VERIFICATION CHECKLIST

After running migrations, verify everything succeeded:

### Check Tables Exist

Run in Supabase SQL Editor:

```sql
-- Should show all Fish Trap tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%fish_trap%';

-- Should show:
-- - fish_trap_interactions
-- - fish_trap_messages
-- - decoy_profiles
-- - tribes
-- - notification_tokens
-- - verification_requests
-- - contact_info_logs
```

### Check Decoy Profiles Seeded

```sql
SELECT COUNT(*) as decoy_count FROM decoy_profiles;
-- Should return: 20
```

### Check Column Structure

```sql
-- Verify interaction_id column exists in fish_trap_messages
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'fish_trap_messages' AND column_name = 'interaction_id';

-- Should return: interaction_id
```

### Check RLS Policies

```sql
-- Verify RLS policies exist
SELECT policyname FROM pg_policies 
WHERE tablename = 'fish_trap_interactions';

-- Should show RLS policies for admin access
```

---

## 🔧 MIGRATION CHANGES MADE

### Fixed Issues

1. **Added Missing Tribes Table** ✅
   ```sql
   CREATE TABLE IF NOT EXISTS tribes (
     id UUID PRIMARY KEY,
     name VARCHAR(100) NOT NULL UNIQUE,
     description TEXT,
     icon_url TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Removed Duplicate contact_info_logs** ✅
   - Was defined in both fish_trap_schema.sql and trust_and_verification.sql
   - Now only defined in trust_and_verification.sql (unified schema)

3. **Fixed Foreign Key References** ✅
   - All tables now reference existing tables
   - Correct ON DELETE CASCADE policies

4. **Cleaned Up RLS Policies** ✅
   - Removed duplicate RLS policy definitions
   - Consistent admin-only access pattern

---

## 📊 SCHEMA OVERVIEW

### Tables Created

| Table | Purpose | Records |
|-------|---------|---------|
| `tribes` | Categories for profiles | ~8 (manual) |
| `decoy_profiles` | AI-powered decoy profiles | 20 (seeded) |
| `fish_trap_interactions` | User-decoy conversations | Dynamic |
| `fish_trap_messages` | Messages in decoy chats | Dynamic |
| `notification_tokens` | Push notification tokens | Dynamic |
| `verification_requests` | Video verification queue | Dynamic |
| `contact_info_logs` | Contact info attempt tracking | Dynamic |

### Indices Created

```
idx_fish_trap_interactions_user    -- Fast user lookups
idx_fish_trap_interactions_decoy   -- Fast decoy lookups
idx_fish_trap_messages_interaction -- Fast message lookups
idx_fish_trap_messages_created     -- Time-based queries
```

---

## 🐛 TROUBLESHOOTING

### Error: "relation does not exist"

**Cause:** Migration didn't run successfully  
**Solution:** 
1. Check all prerequisite tables exist
2. Verify migration order (fish_trap_schema first)
3. Check for error messages in Supabase logs

### Error: "column does not exist"

**Cause:** Services trying to use columns that weren't created  
**Solution:**
1. Run `trust_and_verification.sql` to ensure user table columns exist
2. Verify column names match service code

### Error: "duplicate key value"

**Cause:** Migrations run multiple times  
**Solution:**
1. Migrations use `IF NOT EXISTS` - safe to run multiple times
2. If constraint error, check seed data for duplicates

### Error: "permission denied"

**Cause:** RLS policies blocking access  
**Solution:**
1. Verify user has admin role in JWT
2. Check RLS policies allow access
3. May need to temporarily disable RLS for setup

---

## ✨ NEXT STEPS

After migrations complete:

1. **Verify in Code** 
   - Services should initialize without errors
   - No "column does not exist" errors

2. **Test Fish Trap System**
   - Unverified users should see decoy profiles
   - Messages should record without errors
   - AI responder should activate

3. **Test Notifications**
   - Push tokens should save to notification_tokens table
   - Database entries should appear

4. **Run Integration Tests**
   - Full app launch sequence
   - Auth → Profile → Chat flow

---

## 📞 SUPPORT

If migrations fail:

1. Check error messages in Supabase dashboard
2. Verify project has sufficient permissions
3. Ensure auth.users table exists (Supabase creates this automatically)
4. Run migrations in exact order specified

