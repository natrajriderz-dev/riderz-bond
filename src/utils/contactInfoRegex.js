// ============================================
// Suyavaraa Contact Info Detection & Scrubbing
// ============================================
// Detects and silently hides phone numbers, Instagram handles,
// and other contact information in messages and bios

const CONTACT_INFO_PATTERNS = {
  // Indian phone numbers - comprehensive patterns
  phone: {
    patterns: [
      // +91 XXXXXXXXXX
      /(\+91|91)\s?\d{10}/g,
      // 0XXXXXXXXXX
      /0\d{10}/g,
      // XXXXXXXXXX (standalone 10 digits)
      /\b\d{10}\b/g,
      // XXX-XXX-XXXX
      /\d{3}-\d{3}-\d{4}/g,
      // (XXX) XXX-XXXX
      /\(\d{3}\)\s?\d{3}-\d{4}/g,
      // XXX XXX XXXX
      /\d{3}\s\d{3}\s\d{4}/g
    ],
    replacement: '[contact info hidden]',
    type: 'phone',
    severity: 'high'
  },

  // Instagram handles
  instagram: {
    patterns: [
      // @username
      /@\w{1,30}/g,
      // username.insta
      /\w{1,30}\.insta/gi,
      // username_instagram
      /\w{1,30}_instagram/gi,
      // instagram.com/username
      /instagram\.com\/\w{1,30}/gi,
      // insta.com/username
      /insta\.com\/\w{1,30}/gi,
      // ig: @username
      /ig:\s*@\w{1,30}/gi,
      // follow me on ig
      /(follow.*ig|ig.*follow)/gi
    ],
    replacement: '[contact info hidden]',
    type: 'instagram',
    severity: 'high'
  },

  // WhatsApp links and references
  whatsapp: {
    patterns: [
      // wa.me/91XXXXXXXXXX
      /wa\.me\/\d{10,12}/gi,
      // whatsapp me at
      /whatsapp.*(?:me|at|on)/gi,
      // msg me on whatsapp
      /msg.*whatsapp/gi,
      // text me on whatsapp
      /text.*whatsapp/gi,
      // +91 in whatsapp context
      /(?:whatsapp|wa).*(\+91|91)\d{10}/gi
    ],
    replacement: '[contact info hidden]',
    type: 'whatsapp',
    severity: 'high'
  },

  // Email addresses
  email: {
    patterns: [
      // standard email regex
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    ],
    replacement: '[contact info hidden]',
    type: 'email',
    severity: 'medium'
  },

  // Other social media
  socialMedia: {
    patterns: [
      // Twitter handles
      /@\w{1,15}(?:\s|$)/g,
      // Facebook profiles
      /facebook\.com\/\w+/gi,
      // LinkedIn profiles
      /linkedin\.com\/in\/\w+/gi,
      // Snapchat
      /snapchat.*@\w+/gi
    ],
    replacement: '[contact info hidden]',
    type: 'social_media',
    severity: 'medium'
  }
};

// Function to scrub contact info from text
function scrubContactInfo(text, options = {}) {
  const {
    hideAll = true, // If false, only log but don't hide
    logDetections = true
  } = options;

  let scrubbedText = text;
  const detections = [];

  // Process each pattern type
  for (const [type, config] of Object.entries(CONTACT_INFO_PATTERNS)) {
    for (const pattern of config.patterns) {
      const matches = text.match(pattern);
      if (matches) {
        detections.push({
          type: config.type,
          severity: config.severity,
          matches: matches,
          count: matches.length
        });

        if (hideAll) {
          // Replace all matches with placeholder
          scrubbedText = scrubbedText.replace(pattern, config.replacement);
        }
      }
    }
  }

  return {
    originalText: text,
    scrubbedText: hideAll ? scrubbedText : text,
    detections,
    hasContactInfo: detections.length > 0,
    totalDetections: detections.reduce((sum, d) => sum + d.count, 0)
  };
}

// Function to check if text contains contact info (without scrubbing)
function containsContactInfo(text) {
  const result = scrubContactInfo(text, { hideAll: false });
  return {
    hasContactInfo: result.hasContactInfo,
    detections: result.detections,
    types: result.detections.map(d => d.type)
  };
}

// Function to get contact info summary for logging
function getContactInfoSummary(text) {
  const result = scrubContactInfo(text, { hideAll: false });

  if (!result.hasContactInfo) {
    return null;
  }

  return {
    total_attempts: result.totalDetections,
    types_detected: [...new Set(result.detections.map(d => d.type))],
    severity_breakdown: result.detections.reduce((acc, d) => {
      acc[d.severity] = (acc[d.severity] || 0) + d.count;
      return acc;
    }, {}),
    examples: result.detections.slice(0, 3).map(d => ({
      type: d.type,
      count: d.count,
      severity: d.severity
    }))
  };
}

// Function to determine if user is a repeat offender
function isRepeatOffender(contactLogs = []) {
  const recentLogs = contactLogs.filter(log =>
    new Date(log.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
  );

  const totalAttempts = recentLogs.reduce((sum, log) => sum + log.attempt_count, 0);

  // Thresholds for repeat offender detection
  if (totalAttempts >= 10) return { isRepeat: true, level: 'severe', recommendedAction: 'permanent_ban' };
  if (totalAttempts >= 5) return { isRepeat: true, level: 'moderate', recommendedAction: 'temporary_ban' };
  if (totalAttempts >= 3) return { isRepeat: true, level: 'minor', recommendedAction: 'warning' };

  return { isRepeat: false, level: 'none', recommendedAction: 'monitor' };
}

// Export all functions
module.exports = {
  CONTACT_INFO_PATTERNS,
  scrubContactInfo,
  containsContactInfo,
  getContactInfoSummary,
  isRepeatOffender
};
