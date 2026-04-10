# 🪤 SUYAVARAA Fish Trap - Complete Implementation Specification

## API KEY
- Model: DeepSeek Chat
- API Key: `EXPO_PUBLIC_DEEPSEEK_API_KEY` (from environment variables)
- Endpoint: `https://api.deepseek.com/chat/completions`
- Documentation: https://api-docs.deepseek.com/

**IMPORTANT**: Never hardcode API keys. Always use environment variables.

---

## 📋 IMPLEMENTATION OVERVIEW

This specification covers the complete Fish Trap system - SUYAVARAA's proactive scammer interception platform. The system works by:

1. **Quarantine Zone** - Unverified users see both real & decoy profiles but can only send requests to decoys
2. **AI Decoy Chat** - AI responds naturally to unverified users, monitoring behavior
3. **Red Flag Detection** - Pattern analysis detects scammers automatically
4. **Contact Info Scrubbing** - Phone/Instagram hidden silently to catch repeat sharers
5. **Post-Verification Monitoring** - Verified users also interact with decoys to catch bad actors
6. **Admin Dashboard** - Review Fish Trap conversations and ban suspicious users

---

## 🗄️ DATABASE SCHEMA UPDATES

Create migration file: `supabase/migrations/fish_trap_schema.sql`

```sql
-- Decoy Profiles Table
CREATE TABLE IF NOT EXISTS decoy_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  gender VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  bio TEXT,
  profile_photo_url TEXT,
  tribe_id UUID REFERENCES tribes(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_request_sent_at TIMESTAMP,
  request_send_interval INT DEFAULT 172800, -- 2 days in seconds
  characteristics JSONB -- personality traits for response generation
);

-- Fish Trap Interactions (chat with decoys)
CREATE TABLE IF NOT EXISTS fish_trap_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decoy_id UUID NOT NULL REFERENCES decoy_profiles(id) ON DELETE CASCADE,
  request_id UUID UNIQUE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, blocked
  behavior_flags JSONB DEFAULT '[]', -- array of detected red flags
  red_flag_count INT DEFAULT 0,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, decoy_id)
);

-- Fish Trap Messages (monitored conversations)
CREATE TABLE IF NOT EXISTS fish_trap_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id UUID NOT NULL REFERENCES fish_trap_interactions(id) ON DELETE CASCADE,
  sender_type VARCHAR(50) NOT NULL, -- 'user' or 'decoy'
  user_id UUID REFERENCES auth.users(id),
  decoy_id UUID REFERENCES decoy_profiles(id),
  content TEXT NOT NULL, -- original content (for analysis)
  displayed_content TEXT, -- scrubbed content (phone/instagram hidden)
  contains_contact_info BOOLEAN DEFAULT false,
  contact_info_type VARCHAR(50), -- 'phone', 'instagram', 'whatsapp', etc
  red_flags JSONB DEFAULT '{}', -- detected patterns
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contact Info Log (track attempts to share contact details)
CREATE TABLE IF NOT EXISTS contact_info_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_type VARCHAR(50) NOT NULL, -- 'phone', 'instagram', 'whatsapp'
  attempt_count INT DEFAULT 1,
  last_attempt_at TIMESTAMP DEFAULT NOW(),
  is_suspicious BOOLEAN DEFAULT false,
  action_taken VARCHAR(100), -- 'warning', 'temporary_ban', 'permanent_ban'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indices for performance
CREATE INDEX idx_fish_trap_interactions_user ON fish_trap_interactions(user_id);
CREATE INDEX idx_fish_trap_interactions_decoy ON fish_trap_interactions(decoy_id);
CREATE INDEX idx_fish_trap_messages_interaction ON fish_trap_messages(interaction_id);
CREATE INDEX idx_fish_trap_messages_created ON fish_trap_messages(created_at);
CREATE INDEX idx_contact_info_logs_user ON contact_info_logs(user_id);
```

---

## 📂 FILE STRUCTURE TO CREATE

```
src/
├── services/
│   ├── fishTrapService.js          ← Main orchestrator
│   ├── decoyProfileService.js       ← Decoy profile management
│   ├── aiResponderService.js        ← DeepSeek API integration for AI responses
│   ├── redFlagDetectorService.js    ← Pattern detection & analysis
│   ├── contactInfoScrubbingService.js ← Phone/Instagram detection & hiding
│   └── trustScoreService.js         ← Trust score calculation
├── components/
│   └── modals/
│       └── UnverifiedRequestModal.js ← "Only verified users..." popup
├── utils/
│   ├── redFlagPatterns.js           ← All regex patterns & detection rules
│   └── contactInfoRegex.js          ← Phone/Instagram patterns
└── jobs/
    └── decoyRequestScheduler.js     ← Background job for auto-sending requests

data/
├── sample_chat_images/              ← Sample scam screenshots for training
│   ├── romance_scam_1.jpg
│   ├── phishing_example_1.jpg
│   └── [create more samples]
└── decoy_profiles/
    └── decoy_seed_data.json         ← 20 decoy profile definitions

web-admin/
└── pages/
    └── FishTrapDashboard.js         ← Admin view of Fish Trap conversations
```

---

## 🤖 AI RESPONDER - RED FLAG DETECTION

### DeepSeek Integration

```javascript
// Example usage in aiResponderService.js
const generateDecoyResponse = async (conversationHistory, userMessage) => {
  // 1. Analyze user message for red flags FIRST
  const flags = analyzeRedFlags(userMessage);
  
  // 2. Call DeepSeek to generate response
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer sk-a542414e350747efb43363692c59f898`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a safety AI pretending to be a real person named ${decoyName}. 
            Your personality: ${decoyPersonality}
            IMPORTANT: Be natural but probing. Ask about their intentions, what they do for work, 
            relationship goals. If they ask for money or share contact info, respond casually 
            but note it down for safety review.`
        },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 150
    })
  });
  
  return response.data.choices[0].message.content;
};
```

### Red Flag Patterns to Detect

```javascript
const RED_FLAGS = {
  // Financial pressure
  moneyRequest: /need|send.*money|transfer|payment|help.*pay|medical|emergency/i,
  
  // Quick intimacy escalation
  loveBombing: /love|miss you|thinking of you.*day.*one|destiny|soul.*mate/i,
  
  // Contact info seeking
  phoneRequest: /whatsapp|phone|call me|message me|what's.*number/i,
  
  // Urgency & pressure
  urgency: /hurry|quickly|soon|don't.*wait|now|immediately/i,
  
  // Copy-paste detection
  duplicateMessage: /detected via message hash comparison/,
  
  // Grooming language
  emotionalManipulation: /worried about you|concerned|troubled|need your help|only you/i,
  
  // Location checking
  locationScout: /where.*live|address|city.*house|home.*location/i,
  
  // Personal data harvesting
  dataHarvesting: /full name|date of birth|passport|aadhar|social security/i,
};
```

---

## 📊 CONTACT INFO SCRUBBING

### Pattern Detection

```javascript
// contactInfoRegex.js

const PHONE_PATTERNS = {
  // Indian phone numbers
  indian: /(\+91|91|0)?[6-9]\d{9}/g,
  
  // International format
  international: /\+\d{1,3}\s?\d{4,14}/g,
};

const INSTAGRAM_PATTERNS = {
  // @username
  direct: /@[\w._]+/g,
  
  // username.insta
  variant: /[\w._]+\.insta/g,
  
  // insta.com/username
  url: /insta(?:gram)?\.(?:com|in)\/[\w._]+/gi,
};

const WHATSAPP_PATTERNS = {
  // wa.me links
  link: /wa\.me\/[\d+]+/gi,
  
  // WhatsApp contact
  mention: /whatsapp.*?(\+\d{1,3}\d{4,14})/gi,
};

export const scrubText = (text) => {
  let scrubbed = text;
  let detections = [];
  
  // Replace phone numbers
  const phoneMatches = text.match(PHONE_PATTERNS.indian);
  if (phoneMatches) {
    scrubbed = scrubbed.replace(PHONE_PATTERNS.indian, '[contact info hidden]');
    detections.push({ type: 'phone', count: phoneMatches.length });
  }
  
  // Replace Instagram
  const instaMatches = text.match(INSTAGRAM_PATTERNS.direct);
  if (instaMatches) {
    scrubbed = scrubbed.replace(INSTAGRAM_PATTERNS.direct, '[contact info hidden]');
    detections.push({ type: 'instagram', count: instaMatches.length });
  }
  
  return { scrubbed, detections };
};
```

---

## 🎯 KEY FEATURES TO IMPLEMENT

### 1. Quarantine Logic
- On signup, user is automatically unverified
- HomeScreen checks verification status
- If unverified: show both real & decoy profiles
- Real profile request → popup (not disabled button)
- Decoy profile request → allowed (sent to Fish Trap interaction)

### 2. Auto-Decoy Requests
- Background job runs every 6 hours
- Finds unverified users without active decoy chats
- Randomly assigns a decoy from different tribes
- Sends "Hey, noticed you liked..." request
- Tracks last_request_sent_at on decoy profile

### 3. Post-Verification Monitoring
- Verified users still see decoys in feed
- If they match with decoys, AI monitors them
- Red flag detection continues
- Helps identify bad actors among verified users

### 4. Admin Dashboard
- View all Fish Trap conversations
- See detected red flags
- Ban users directly
- Export conversation logs
- Analytics: scammer patterns, blocked users, etc

---

## 🔄 IMPLEMENTATION WORKFLOW FOR CREW

1. **Setup & Schema** (30 min)
   - Create database migration
   - Test schema with sample data

2. **Core Services** (2 hours)
   - fishTrapService.js - orchestrator
   - redFlagDetectorService.js - pattern detection
   - contactInfoScrubbingService.js - text processing

3. **AI Integration** (1.5 hours)
   - aiResponderService.js - DeepSeek integration
   - Test with sample conversations

4. **Home Screen Integration** (1 hour)
   - Query both real & decoy profiles
   - Show popup for unverified users
   - Allow requests only to decoys

5. **Background Job** (45 min)
   - decoyRequestScheduler.js
   - Test send 2-day interval logic

6. **Chat Monitoring** (1 hour)
   - Hook into ChatScreen
   - Log messages, detect flags, scrub content
   - Store in fish_trap_messages

7. **Testing** (1 hour)
   - Test quarantine logic
   - Test red flag detection
   - Test contact info scrubbing

---

## ✅ DEFINITION OF DONE

- [ ] Database schema created & tested
- [ ] All services implemented & tested
- [ ] Quarantine logic working (unverified users only see decoys for requests)
- [ ] Auto-decoy requests sending every 2 days
- [ ] AI responder generating natural responses
- [ ] Red flags detected accurately
- [ ] Contact info being scrubbed silently
- [ ] Post-verification monitoring active
- [ ] Admin can view & manage Fish Trap conversations
- [ ] E2E test: unverified user → decoy chat → red flag detected → user banned

---

## 📝 NOTES FOR CREW AGENTS

- This is the **foundation** of SUYAVARAA's safety system
- **Zero tolerance for bugs** - safety is non-negotiable
- Test extensively with sample chat images in `/data/sample_chat_images/`
- All AI responses should feel human (test with team first)
- Red flag detection must be accurate (false positives OK, false negatives NOT OK)
- Keep code modular - services should be independently testable

---

## 🚀 START WITH CREW

Run:
```bash
cd /home/natzridz/bond-app
./scripts/dev.sh crew "Implement complete Fish Trap quarantine system with AI monitoring, red flag detection, and contact info scrubbing as per FISH_TRAP_IMPLEMENTATION_SPEC.md" src/services/fishTrapService.js
```

This will trigger CrewAI to:
1. Read this spec
2. Create all required files
3. Implement all services
4. Generate tests
5. Create database migration

Monitor progress and approve changes as they're made.
