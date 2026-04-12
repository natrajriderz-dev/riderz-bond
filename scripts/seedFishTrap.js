// ============================================
// Suyavaraa Fish Trap - Database Seeder Script
// ============================================
// Seeds decoy profiles and runs initial setup for Fish Trap system

const { supabase } = require('../../supabase');
const { seedDecoyProfiles } = require('../data/decoy_profiles/decoy_seed_data');

async function seedFishTrapData() {
  try {
    console.log('🌱 Starting Fish Trap database seeding...');

    // Seed decoy profiles
    const profileResult = await seedDecoyProfiles(supabase);
    if (profileResult.success) {
      console.log(`✅ Seeded ${profileResult.count} decoy profiles`);
    } else {
      console.error('❌ Failed to seed decoy profiles:', profileResult.error);
      return false;
    }

    // Run auto decoy requests to get things started
    console.log('📤 Sending initial decoy requests...');
    const { default: fishTrapService } = await import('../services/fishTrapService.js');
    const requestResult = await fishTrapService.sendAutoDecoyRequests();

    if (requestResult.success) {
      console.log(`✅ Sent ${requestResult.requestsSent} initial decoy requests`);
    } else {
      console.error('❌ Failed to send initial requests:', requestResult.error);
    }

    console.log('🎉 Fish Trap seeding completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Fish Trap seeding failed:', error);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  seedFishTrapData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedFishTrapData };