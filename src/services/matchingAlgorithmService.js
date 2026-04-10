const { supabase } = require('../../supabase');
const trustScoreService = require('./trustScoreService');

class MatchingAlgorithmService {
  /**
   * Get match score between two users based on shared traits, distance, and trust.
   * Score range: 0.0 to 1.0 (weighted)
   */
  async calculateMatchScore(userA_id, userB_id) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id, city, trust_score, 
          user_profiles(interests, religion, education, occupation)
        `)
        .in('id', [userA_id, userB_id]);

      if (error || users.length < 2) throw new Error('Could not find both users');

      const userA = users.find(u => u.id === userA_id);
      const userB = users.find(u => u.id === userB_id);

      let score = 0;
      let weights = 0;

      // 1. Interests Overlap (Weight: 40%)
      const interestsA = userA.user_profiles?.[0]?.interests || [];
      const interestsB = userB.user_profiles?.[0]?.interests || [];
      const overlap = interestsA.filter(i => interestsB.includes(i));
      const interestScore = (overlap.length / Math.max(1, Math.min(interestsA.length, interestsB.length)));
      score += interestScore * 0.4;
      weights += 0.4;

      // 2. City Match (Weight: 20%)
      const cityMatch = (userA.city === userB.city) ? 1.0 : 0.2;
      score += cityMatch * 0.2;
      weights += 0.2;

      // 3. Trust Score Compatibility (Weight: 20%)
      // Users with similar trust levels match better
      const trustDiff = Math.abs((userA.trust_score || 50) - (userB.trust_score || 50));
      const trustMatch = 1.0 - (trustDiff / 100);
      score += trustMatch * 0.2;
      weights += 0.2;

      // 4. Verification Match (Weight: 20%)
      // Verified users prefer other verified users
      const verA = userA.is_verified || false;
      const verB = userB.is_verified || false;
      const verMatch = (verA === verB) ? 1.0 : 0.5;
      score += verMatch * 0.2;
      weights += 0.2;

      return score / weights; // Normalize just in case

    } catch (error) {
      console.error('Match calculation failed:', error);
      return 0.5; // Neutral match if error
    }
  }

  /**
   * Rank a list of profiles for a specific user
   */
  async rankProfiles(userId, profiles) {
    const scoredProfiles = await Promise.all(
      profiles.map(async (profile) => {
        const score = await this.calculateMatchScore(userId, profile.id);
        return { ...profile, match_score: score };
      })
    );

    // Sort descending by score
    return scoredProfiles.sort((a, b) => b.match_score - a.match_score);
  }
}

module.exports = new MatchingAlgorithmService();
