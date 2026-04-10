// ============================================
// Suyavaraa Contact Info Scrubbing Service
// ============================================
// Silently detects and hides contact information in messages and profiles
// Logs attempts for admin monitoring and repeat offender detection

const { supabase } = require('../../supabase');
const { scrubContactInfo, getContactInfoSummary, isRepeatOffender } = require('../utils/contactInfoRegex');

class ContactInfoScrubbingService {
  constructor() {
    this.maxLogsPerUser = 100; // Limit log entries per user
  }

  // Scrub contact info from message content
  async scrubMessage(message, userId, options = {}) {
    const {
      saveToDatabase = true,
      interactionId = null,
      isDecoyChat = false
    } = options;

    // Apply scrubbing
    const scrubResult = scrubContactInfo(message, { hideAll: true });

    // If contact info was found, log it
    if (scrubResult.hasContactInfo && saveToDatabase) {
      await this.logContactAttempt(userId, scrubResult.detections, {
        interactionId,
        isDecoyChat,
        originalMessage: message
      });
    }

    return {
      originalMessage: message,
      scrubbedMessage: scrubResult.scrubbedText,
      wasModified: scrubResult.hasContactInfo,
      detections: scrubResult.detections
    };
  }

  // Scrub contact info from user profile/bio
  async scrubProfileText(text, userId) {
    if (!text) return { scrubbedText: text, wasModified: false };

    const scrubResult = scrubContactInfo(text, { hideAll: true });

    if (scrubResult.hasContactInfo) {
      // Log profile contact info attempts (more serious)
      await this.logContactAttempt(userId, scrubResult.detections, {
        context: 'profile_bio',
        originalMessage: text
      });
    }

    return {
      scrubbedText: scrubResult.scrubbedText,
      wasModified: scrubResult.hasContactInfo,
      detections: scrubResult.detections
    };
  }

  // Check if text contains contact info without scrubbing
  async checkForContactInfo(text, userId) {
    const result = scrubContactInfo(text, { hideAll: false });

    if (result.hasContactInfo) {
      // Log the detection
      await this.logContactAttempt(userId, result.detections, {
        context: 'detection_only',
        originalMessage: text
      });
    }

    return result;
  }

  // Log contact info attempt to database
  async logContactAttempt(userId, detections, metadata = {}) {
    try {
      const summary = getContactInfoSummary(detections.map(d => d.type).join(' '));

      // Insert log entry
      const { error } = await supabase
        .from('contact_info_logs')
        .insert({
          user_id: userId,
          contact_type: detections[0]?.type || 'unknown',
          attempt_count: detections.reduce((sum, d) => sum + d.count, 0),
          is_suspicious: this.isSuspiciousAttempt(detections),
          action_taken: await this.determineAction(userId, detections),
          metadata: {
            ...metadata,
            detections_summary: summary,
            total_detections: detections.length
          }
        });

      if (error) {
        console.error('Error logging contact info attempt:', error);
      }

      // Check if user is repeat offender
      const contactLogs = await this.getUserContactLogs(userId);
      const repeatStatus = isRepeatOffender(contactLogs);

      if (repeatStatus.isRepeat) {
        await this.handleRepeatOffender(userId, repeatStatus);
      }

    } catch (error) {
      console.error('Error in logContactAttempt:', error);
    }
  }

  // Determine if attempt is suspicious
  isSuspiciousAttempt(detections) {
    // High severity detections are suspicious
    return detections.some(d => d.severity === 'high');
  }

  // Determine action based on attempt
  async determineAction(userId, detections) {
    const contactLogs = await this.getUserContactLogs(userId);
    const repeatStatus = isRepeatOffender(contactLogs);

    // If repeat offender, escalate
    if (repeatStatus.isRepeat) {
      return repeatStatus.recommendedAction;
    }

    // Single attempt - just monitor
    return 'monitor';
  }

  // Handle repeat offenders
  async handleRepeatOffender(userId, repeatStatus) {
    try {
      const action = repeatStatus.recommendedAction;

      switch (action) {
        case 'warning':
          // Could send in-app warning
          console.log(`User ${userId} flagged for contact info sharing - warning level`);
          break;

        case 'temporary_ban':
          // Temporary ban
          await this.applyTemporaryBan(userId, 'Repeat contact info sharing');
          break;

        case 'permanent_ban':
          // Permanent ban
          await this.applyPermanentBan(userId, 'Severe repeat contact info sharing');
          break;
      }

      // Update log with action taken
      await supabase
        .from('contact_info_logs')
        .update({ action_taken: action })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

    } catch (error) {
      console.error('Error handling repeat offender:', error);
    }
  }

  // Get user's contact info logs
  async getUserContactLogs(userId, days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from('contact_info_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error getting user contact logs:', error);
      return [];
    }
  }

  // Apply temporary ban
  async applyTemporaryBan(userId, reason) {
    try {
      // Update user status
      await supabase
        .from('users')
        .update({
          is_banned: true,
          ban_reason: reason,
          ban_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          updated_at: new Date()
        })
        .eq('id', userId);

      console.log(`Applied temporary ban to user ${userId}: ${reason}`);
    } catch (error) {
      console.error('Error applying temporary ban:', error);
    }
  }

  // Apply permanent ban
  async applyPermanentBan(userId, reason) {
    try {
      await supabase
        .from('users')
        .update({
          is_banned: true,
          ban_reason: reason,
          ban_expires_at: null, // Permanent
          updated_at: new Date()
        })
        .eq('id', userId);

      console.log(`Applied permanent ban to user ${userId}: ${reason}`);
    } catch (error) {
      console.error('Error applying permanent ban:', error);
    }
  }

  // Clean up old logs (keep only recent entries)
  async cleanupOldLogs() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep 90 days

      const { error } = await supabase
        .from('contact_info_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) {
        console.error('Error cleaning up old contact logs:', error);
      }
    } catch (error) {
      console.error('Error in cleanupOldLogs:', error);
    }
  }

  // Get contact info statistics for admin dashboard
  async getContactInfoStats() {
    try {
      const { data, error } = await supabase
        .rpc('get_contact_info_stats'); // Would need to create this function

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting contact info stats:', error);
      return null;
    }
  }
}

// Export singleton instance
module.exports = new ContactInfoScrubbingService();