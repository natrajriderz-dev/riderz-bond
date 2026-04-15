const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars. Required: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const args = process.argv.slice(2);
const shouldExecute = args.includes('--execute');

// Default: required app buckets. Override with --buckets=avatars,posts,verification_media
const bucketsArg = args.find((arg) => arg.startsWith('--buckets='));
const bucketNames = bucketsArg
  ? bucketsArg.replace('--buckets=', '').split(',').map((s) => s.trim()).filter(Boolean)
  : ['avatars', 'posts', 'verification_media'];

// Default junk patterns. Extend with --extra-patterns=foo,bar
const extraPatternsArg = args.find((arg) => arg.startsWith('--extra-patterns='));
const extraPatterns = extraPatternsArg
  ? extraPatternsArg.replace('--extra-patterns=', '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  : [];

const junkPatterns = [
  'google antigravity',
  'antigravity',
  'tmp',
  'temp',
  'sample',
  'test',
  'dummy',
  'unwanted',
  ...extraPatterns,
];

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function isJunkObject(objectName) {
  const normalized = objectName.toLowerCase();
  return junkPatterns.some((pattern) => normalized.includes(pattern));
}

async function listAllObjects(bucket, prefix = '') {
  const all = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit, offset, sortBy: { column: 'name', order: 'asc' } });

    if (error) {
      throw new Error(`Failed listing bucket "${bucket}": ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const item of data) {
      if (!item.id) {
        // Folder marker
        const nestedPrefix = prefix ? `${prefix}/${item.name}` : item.name;
        const nested = await listAllObjects(bucket, nestedPrefix);
        all.push(...nested);
      } else {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
        all.push(fullPath);
      }
    }

    if (data.length < limit) {
      break;
    }
    offset += limit;
  }

  return all;
}

async function removeInChunks(bucket, paths, chunkSize = 100) {
  for (let i = 0; i < paths.length; i += chunkSize) {
    const chunk = paths.slice(i, i + chunkSize);
    const { error } = await supabase.storage.from(bucket).remove(chunk);
    if (error) {
      throw new Error(`Failed deleting from bucket "${bucket}": ${error.message}`);
    }
  }
}

async function main() {
  console.log('Supabase storage junk cleanup');
  console.log(`Mode: ${shouldExecute ? 'EXECUTE (deletes objects)' : 'DRY RUN (no deletion)'}`);
  console.log(`Buckets: ${bucketNames.join(', ')}`);
  console.log(`Patterns: ${junkPatterns.join(', ')}`);

  let totalJunk = 0;

  for (const bucket of bucketNames) {
    console.log(`\nScanning bucket: ${bucket}`);
    const allObjects = await listAllObjects(bucket);
    const junkObjects = allObjects.filter(isJunkObject);

    console.log(`Total objects found: ${allObjects.length}`);
    console.log(`Junk matches: ${junkObjects.length}`);

    if (junkObjects.length > 0) {
      junkObjects.forEach((path) => console.log(`  - ${path}`));
    }

    totalJunk += junkObjects.length;

    if (shouldExecute && junkObjects.length > 0) {
      await removeInChunks(bucket, junkObjects);
      console.log(`Deleted ${junkObjects.length} object(s) from ${bucket}`);
    }
  }

  if (!shouldExecute) {
    console.log(`\nDry run complete. ${totalJunk} junk object(s) would be deleted.`);
    console.log('Run again with --execute to apply deletions.');
  } else {
    console.log(`\nCleanup complete. Deleted ${totalJunk} junk object(s).`);
  }
}

main().catch((err) => {
  console.error(`Cleanup failed: ${err.message}`);
  process.exit(1);
});