// src/services/decoyProfileService.js
const { supabase } = require('../../supabase');
const { DECOY_PROFILES_SEED } = require('../../data/decoy_profiles/decoy_seed_data');

class DecoyProfileService {
  /**
   * Seed the database with the initial 20 decoy profiles.
   * Note: This assumes auth users are already handled or that 
   * a system user ID is provided for the 'user_id' requirement.
   */
  async seedDecoys(systemUserId) {
    try {
      console.log('Starting decoy seeding...');
      
      const profilesToInsert = DECOY_PROFILES_SEED.map(profile => ({
        user_id: systemUserId, // Link all decoys to the management account
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        city: profile.city,
        bio: profile.bio,
        profile_photo_url: profile.profile_photo_url,
        is_active: true,
        characteristics: {
          personality: profile.personality,
          red_flag_triggers: profile.red_flag_triggers
        },
        created_at: new Date(),
        updated_at: new Date()
      }));

      const { data, error } = await supabase
        .from('decoy_profiles')
        .insert(profilesToInsert)
        .select();

      if (error) throw error;

      console.log(`Successfully seeded ${data.length} decoy profiles.`);
      return { success: true, count: data.length, profiles: data };

    } catch (error) {
      console.error('Decoy seeding failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get an available decoy for a new unverified user.
   */
  async getRandomDecoy(excludeUserIds = []) {
    try {
      const { data, error } = await supabase
        .from('decoy_profiles')
        .select('*')
        .eq('is_active', true)
        .not('id', 'in', `(${excludeUserIds.join(',')})`);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      // Return a random decoy from the list
      const randomIndex = Math.floor(Math.random() * data.length);
      return data[randomIndex];

    } catch (error) {
      console.error('Error fetching random decoy:', error);
      return null;
    }
  }

  /**
   * Get a specific decoy by ID
   */
  async getDecoyById(decoyId) {
    try {
      const { data, error } = await supabase
        .from('decoy_profiles')
        .select('*')
        .eq('id', decoyId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching decoy ${decoyId}:`, error);
      return null;
    }
  }

  /**
   * Mark a decoy as inactive
   */
  async deactivateDecoy(decoyId) {
    try {
      const { error } = await supabase
        .from('decoy_profiles')
        .update({ is_active: false, updated_at: new Date() })
        .eq('id', decoyId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error(`Error deactivating decoy ${decoyId}:`, error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new DecoyProfileService();
