const { supabase } = require('../../supabase');
const { aiResponderService } = require('./aiResponderService');

class ModerationService {
  constructor() {
    // Simple local profanity list for real-time performance
    this.profanityList = ['badword1', 'badword2', 'idiot', 'scam', 'fake']; // Placeholder, expand as needed
  }

  /**
   * Screen text for profanity and NSFW content
   */
  async screenText(text, userId) {
    try {
      // 1. Local check (Fast)
      const containsProfanity = this.profanityList.some(word => 
        text.toLowerCase().includes(word)
      );

      if (containsProfanity) {
        return { safe: false, reason: 'profanity', scrubbed: this.scrubText(text) };
      }

      // 2. AI check (DeepSeek) for context-based moderation
      const prompt = `Moderation Task: Analyze the following text for NSFW content, scams, harassment, or toxic behavior. Reply with only 'SAFE' or 'UNSAFE: [reason]'.\n\nText: "${text}"`;
      
      const response = await aiResponderService.generateRawResponse(prompt);
      
      if (response && response.toUpperCase().startsWith('UNSAFE')) {
        const reason = response.split(':')[1]?.trim() || 'policy_violation';
        return { safe: false, reason, scrubbed: '[Content blocked]' };
      }

      return { safe: true };

    } catch (error) {
      console.error('Moderation error:', error);
      return { safe: true }; // Fail-safe: allow if moderation service is down
    }
  }

  /**
   * Replace profanity with asterisks
   */
  scrubText(text) {
    let scrubbed = text;
    this.profanityList.forEach(word => {
      const regex = new RegExp(word, 'gi');
      scrubbed = scrubbed.replace(regex, '***');
    });
    return scrubbed;
  }

  /**
   * Report content/user
   */
  async reportContent(reporterId, targetId, contentType, contentId, reason) {
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: reporterId,
          target_id: targetId,
          content_type: contentType,
          content_id: contentId,
          reason,
          status: 'pending',
          created_at: new Date()
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Report error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ModerationService();
