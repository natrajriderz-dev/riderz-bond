const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBuckets() {
  console.log('🔍 Checking Buckets in Supabase...');
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    console.error('❌ Error listing buckets:', error.message);
    return;
  }

  console.log('\nFound Buckets:');
  buckets.forEach(b => {
    console.log(`- ${b.name} (Public: ${b.public})`);
  });

  const expectedLower = ['avatars', 'posts', 'verification_media'];
  const expectedUpper = ['AVATARS', 'POSTS', 'VERIFICATION_MEDIA'];

  const foundLower = expectedLower.filter(name => buckets.some(b => b.name === name));
  const foundUpper = expectedUpper.filter(name => buckets.some(b => b.name === name));

  console.log('\nAnalysis:');
  console.log(`✅ Lowercase buckets found: ${foundLower.join(', ') || 'None'}`);
  console.log(`✅ Uppercase buckets found: ${foundUpper.join(', ') || 'None'}`);

  if (foundUpper.length > 0 && foundLower.length === 0) {
    console.warn('\n⚠️  WARNING: Your buckets are UPPERCASE but the app uses lowercase.');
    console.warn('   Uploads WILL FAIL unless you rename the buckets to lowercase');
    console.warn('   or update the application code to use uppercase.');
  }
}

async function testUpload(bucketName) {
  console.log(`\nTesting upload to bucket: "${bucketName}"...`);
  const testFile = Buffer.from('test content');
  const fileName = `test_${Date.now()}.txt`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, testFile, {
      contentType: 'text/plain',
      upsert: true
    });

  if (error) {
    console.error(`❌ Upload to "${bucketName}" FAILED:`, error.message);
    if (error.message.includes('not found')) {
      console.log(`   Suggestion: The bucket "${bucketName}" does not exist.`);
    } else if (error.message.includes('Row-level security policy')) {
      console.log(`   Suggestion: RLS policies are missing or too restrictive.`);
    }
    return false;
  }

  console.log(`✅ Upload to "${bucketName}" SUCCESSFUL!`);
  
  // Clean up
  await supabase.storage.from(bucketName).remove([fileName]);
  return true;
}

async function main() {
  await checkBuckets();
  
  const testBuckets = ['avatars', 'AVATARS', 'posts', 'POSTS', 'verification_media', 'VERIFICATION_MEDIA'];
  
  console.log('\n🚀 Starting Upload Tests...');
  for (const bucket of testBuckets) {
    // Only test if bucket exists to avoid clutter
    const { data: buckets } = await supabase.storage.listBuckets();
    if (buckets && buckets.some(b => b.name === bucket)) {
      await testUpload(bucket);
    }
  }
}

main().catch(console.error);
