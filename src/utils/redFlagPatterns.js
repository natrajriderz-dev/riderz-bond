// ============================================
// Suyavaraa Red Flag Detection Patterns
// ============================================
// Comprehensive regex patterns and scoring system
// for detecting scammer behavior in Fish Trap conversations

const RED_FLAG_PATTERNS = {
  // Financial pressure patterns
  moneyRequest: {
    patterns: [
      /need.*money/i,
      /send.*money/i,
      /transfer.*money/i,
      /payment.*required/i,
      /medical.*emergency/i,
      /help.*pay/i,
      /financial.*trouble/i,
      /urgent.*cash/i,
      /lend.*me/i,
      /borrow.*money/i
    ],
    severity: 'high',
    points: 5,
    description: 'Direct or indirect requests for money'
  },

  // Love-bombing patterns (too fast emotional escalation)
  loveBombing: {
    patterns: [
      /love.*you.*day.*one/i,
      /thinking.*you.*day.*one/i,
      /miss.*you.*already/i,
      /destiny.*together/i,
      /soul.*mate/i,
      /meant.*be.*together/i,
      /can't.*stop.*thinking.*you/i,
      /dream.*about.*you/i,
      /future.*together/i,
      /marry.*me/i
    ],
    severity: 'high',
    points: 4,
    description: 'Excessive emotional intimacy too early'
  },

  // Contact info seeking patterns
  contactSeeking: {
    patterns: [
      /whatsapp.*number/i,
      /phone.*number/i,
      /call.*me/i,
      /what's.*your.*number/i,
      /give.*me.*number/i,
      /share.*contact/i,
      /let's.*talk.*phone/i,
      /voice.*call/i,
      /video.*call/i,
      /message.*me.*directly/i
    ],
    severity: 'medium',
    points: 3,
    description: 'Pushing for phone/WhatsApp contact early'
  },

  // Urgency and pressure patterns
  urgencyPressure: {
    patterns: [
      /hurry.*up/i,
      /quickly/i,
      /soon/i,
      /don't.*wait/i,
      /now/i,
      /immediately/i,
      /before.*too.*late/i,
      /limited.*time/i,
      /act.*fast/i,
      /urgent/i
    ],
    severity: 'medium',
    points: 2,
    description: 'Creating false urgency or pressure'
  },

  // Grooming language patterns
  grooming: {
    patterns: [
      /worried.*about.*you/i,
      /concerned.*about.*you/i,
      /troubled/i,
      /need.*your.*help/i,
      /only.*you.*can.*help/i,
      /trust.*me/i,
      /secret.*between.*us/i,
      /don't.*tell.*anyone/i,
      /special.*connection/i,
      /understand.*me.*better/i
    ],
    severity: 'high',
    points: 4,
    description: 'Manipulative grooming language'
  },

  // Location data harvesting
  locationHarvesting: {
    patterns: [
      /where.*do.*you.*live/i,
      /what's.*your.*address/i,
      /city.*house/i,
      /home.*location/i,
      /neighborhood/i,
      /area.*live/i,
      /close.*to/i,
      /nearby/i,
      /distance.*between/i,
      /how.*far/i
    ],
    severity: 'medium',
    points: 2,
    description: 'Probing for location information'
  },

  // Personal data harvesting
  dataHarvesting: {
    patterns: [
      /full.*name/i,
      /date.*of.*birth/i,
      /passport/i,
      /aadhar/i,
      /social.*security/i,
      /bank.*details/i,
      /account.*number/i,
      /credit.*card/i,
      /id.*number/i,
      /personal.*information/i
    ],
    severity: 'high',
    points: 5,
    description: 'Requesting sensitive personal information'
  },

  // Copy-paste script detection
  copyPasteScript: {
    patterns: [
      /hello.*my.*name.*is/i,
      /nice.*to.*meet.*you/i,
      /how.*are.*you.*doing/i,
      /tell.*me.*about.*yourself/i,
      /what.*do.*you.*do/i,
      /where.*are.*you.*from/i,
      /age.*you/i,
      /married/i,
      /single/i
    ],
    severity: 'low',
    points: 1,
    description: 'Generic conversation starters (potential script)'
  },

  // Emotional manipulation
  emotionalManipulation: {
    patterns: [
      /feel.*alone/i,
      /lonely/i,
      /depressed/i,
      /sad/i,
      /heartbroken/i,
      /need.*someone/i,
      /tired.*being.*alone/i,
      /looking.*for.*love/i,
      /ready.*for.*relationship/i,
      /serious.*relationship/i
    ],
    severity: 'low',
    points: 1,
    description: 'Playing on emotions (common in scams)'
  }
};

// Scoring thresholds for automatic actions
const SCORING_THRESHOLDS = {
  WARNING: 3,      // Send warning, continue monitoring
  TEMPORARY_BAN: 8, // Temporary ban, admin review
  PERMANENT_BAN: 12 // Permanent ban, high confidence scammer
};

// Function to detect red flags in a message
function detectRedFlags(message) {
  const detectedFlags = [];
  let totalScore = 0;

  for (const [flagName, flagConfig] of Object.entries(RED_FLAG_PATTERNS)) {
    for (const pattern of flagConfig.patterns) {
      if (pattern.test(message)) {
        detectedFlags.push({
          name: flagName,
          severity: flagConfig.severity,
          points: flagConfig.points,
          description: flagConfig.description,
          matched: true
        });
        totalScore += flagConfig.points;
        break; // Only count each flag type once per message
      }
    }
  }

  return {
    flags: detectedFlags,
    totalScore,
    action: getRecommendedAction(totalScore),
    severity: getOverallSeverity(detectedFlags)
  };
}

// Get recommended action based on score
function getRecommendedAction(score) {
  if (score >= SCORING_THRESHOLDS.PERMANENT_BAN) {
    return 'permanent_ban';
  } else if (score >= SCORING_THRESHOLDS.TEMPORARY_BAN) {
    return 'temporary_ban';
  } else if (score >= SCORING_THRESHOLDS.WARNING) {
    return 'warning';
  }
  return 'monitor';
}

// Get overall severity level
function getOverallSeverity(flags) {
  if (flags.some(flag => flag.severity === 'high')) {
    return 'high';
  } else if (flags.some(flag => flag.severity === 'medium')) {
    return 'medium';
  } else if (flags.length > 0) {
    return 'low';
  }
  return 'none';
}

// Function to check for duplicate messages (copy-paste detection)
function detectDuplicateMessage(message, previousMessages = []) {
  // Simple hash-based detection
  const messageHash = simpleHash(message.toLowerCase().trim());

  for (const prevMsg of previousMessages) {
    const prevHash = simpleHash(prevMsg.toLowerCase().trim());
    if (messageHash === prevHash && message.length > 20) {
      return {
        isDuplicate: true,
        similarity: 1.0,
        originalMessage: prevMsg
      };
    }
  }

  return { isDuplicate: false, similarity: 0 };
}

// Simple hash function for duplicate detection
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

// Export all functions
module.exports = {
  RED_FLAG_PATTERNS,
  SCORING_THRESHOLDS,
  detectRedFlags,
  detectDuplicateMessage
};
