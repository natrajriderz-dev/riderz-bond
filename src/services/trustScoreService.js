// src/services/trustScoreService.js
const { supabase } = require('../../supabase');

class TrustScoreService {
  /**
   * Calculate trust score for a user based on multiple factors.
   * Score range: 0 to 100
   */
  async calculateTrustScore(userId) {
    try {
      let score = 50; // Base score

      const { data: user, error } = await supabase
        .from('users')
        .select('is_verified, created_at, trust_score')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // 1. Verification status (+30)
      if (user.is_verified) score += 30;

      // 2. Account age (up to +10)
      const accountAgeDays = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (24 * 3600 * 1000));
      score += Math.min(10, Math.floor(accountAgeDays / 30)); // +1 per month

      // 3. Behavioral flags (Fish Trap)
      const { data: fishTrap } = await supabase
        .from('fish_trap_interactions')
        .select('red_flag_count')
        .eq('user_id', userId);

      if (fishTrap && fishTrap.length > 0) {
        const totalRedFlags = fishTrap.reduce((sum, item) => sum + (item.red_flag_count || 0), 0);
        score -= (totalRedFlags * 10); // Serious penalty for red flags
      }

      // 4. Contact info sharing attempts
      const { count: contactViolations } = await supabase
        .from('contact_info_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_suspicious', true);

      score -= (contactViolations * 5);

      // Ensure score stays within 0-100
      const finalScore = Math.max(0, Math.min(100, score));

      // Update user's trust score in DB
      await supabase
        .from('users')
        .update({ trust_score: finalScore, updated_at: new Date() })
        .eq('id', userId);

      return finalScore;

    } catch (error) {
      console.error('Error calculating trust score:', error);
      return 50; // Fallback to base score
    }
  }

  /**
   * Get badge color/level for a score
   */
  getTrustLevel(score) {
    if (score >= 85) return { level: 'Green', color: '#10B981', label: 'Highly Trusted' };
    if (score >= 50) return { level: 'Yellow', color: '#F59E0B', label: 'Monitor' };
    return { level: 'Red', color: '#EF4444', label: 'Restricted' };
  }
}

module.exports = new TrustScoreService();
