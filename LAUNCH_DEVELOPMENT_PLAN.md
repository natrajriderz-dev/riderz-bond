# SUYAVARAA App - Launch Development Plan
**Target Launch Date:** 2 weeks  
**Current Status:** ~60% complete (UI screens built, database schema ready, chat structure in place)  
**Priority:** Safety first, then core features, then monetization

---

## 📊 EXECUTION PHASES

### PHASE 1: SAFETY INFRASTRUCTURE (Days 1-3)
*Without this, the app cannot launch. Fish Trap is non-negotiable.*

#### 1.1 Fish Trap System Architecture
- **Task:** Design quarantine zone logic & decoy profile system
- **Deliverable:** Architecture document + database schema updates
- **Blocks:** Tasks 1.2, 1.3, 1.4
- **Time:** 4 hours
- **Files to create/update:**
  - `src/services/fishTrapService.js` (new)
  - `supabase.js` (update with Fish Trap tables)
  - Database migration for decoy profiles

#### 1.2 Create 20 Decoy Profiles
- **Task:** Generate realistic decoy profile data with photos
- **Deliverable:** Seeded database with 20 decoy accounts
- **Dependencies:** 1.1 (schema ready)
- **Time:** 6 hours
- **Details:**
  - Use UI Avatars or Unsplash for photos
  - Distribute across all 8 tribes
  - Add realistic bios per mode
  - Create Supabase migration file

#### 1.3 Unverified User Quarantine Logic
- **Task:** Hide real profiles from unverified users, show only decoys
- **Deliverable:** Working quarantine in HomeScreen
- **Dependencies:** 1.1, 1.2
- **Time:** 6 hours
- **Files to update:**
  - `src/screens/main/HomeScreen.js`
  - `src/services/profileService.js` (new)

#### 1.4 Basic AI Responder for Decoy Chats
- **Task:** Simple rule-based responses for decoy profile messages
- **Deliverable:** Functional decoy chat with pattern detection
- **Dependencies:** 1.1, 1.3
- **Time:** 8 hours
- **Implementation:**
  - Use DeepSeek API for natural language responses
  - Detect keywords: money, phone, links, dates, emotional manipulation
  - Log red flag patterns
  - Flag suspicious users automatically

---

### PHASE 2: VERIFICATION & TRUST (Days 4-5)
*Users can only access real profiles after verification.*

#### 2.1 Video Verification UI
- **Task:** Build selfie capture, video recording screens
- **Deliverable:** Full verification flow UI
- **Time:** 5 hours
- **Files to create:**
  - `src/screens/auth/VideoVerificationScreen.js` (new)
  - `src/screens/auth/VerificationSuccessScreen.js` (new)
  - `src/components/video/CameraCapture.js` (new)

#### 2.2 Video Face Matching (face-api.js)
- **Task:** Implement face detection & matching against profile photo
- **Deliverable:** Working face comparison, pass/fail logic
- **Dependencies:** 2.1
- **Time:** 8 hours
- **Tech:** face-api.js, React Native WebView or native camera
- **Pass Rate:** 95%+ confidence required

#### 2.3 Admin Verification Queue
- **Task:** Build web dashboard for manual verification review
- **Deliverable:** Admin can approve/reject videos
- **Time:** 6 hours
- **Files to create:**
  - `web-admin/pages/VerificationQueue.js` (new)
  - `src/services/adminService.js` (update)
- **Features:**
  - Pending videos list
  - Approve/Reject with notes
  - Rescan option

#### 2.4 Trust Score System
- **Task:** Calculate & display trust scores on profiles
- **Deliverable:** Green/Yellow/Red badges visible to users
- **Dependencies:** 1.4, 2.3
- **Time:** 6 hours
- **Formula:**
  - Green (8.5+): Verified + no red flags + positive history
  - Yellow (5-8.4): Verified + minor flags under watch
  - Red (<5): Temporary ban, under review
- **Files to update:**
  - `src/services/trustScoreService.js` (new)
  - Profile display components

---

### PHASE 3: CORE MATCHING & MESSAGING (Days 6-7)
*Users can match and chat safely.*

#### 3.1 Matching Algorithm
- **Task:** Build trait-based matching with weighting
- **Deliverable:** Accurate compatibility scoring
- **Time:** 8 hours
- **Weights:**
  - Tribe match: 30%
  - Behavioral compatibility: 30%
  - User preferences: 25%
  - Activity score: 15%
- **Files to create:**
  - `src/services/matchingService.js` (new)
  - Daily job for rescoring

#### 3.2 Real-Time Chat Validation
- **Task:** Ensure Supabase Realtime is working end-to-end
- **Deliverable:** Instant message delivery verified
- **Time:** 4 hours
- **Testing:** Send/receive messages, verify timestamps
- **Files to review:**
  - `src/screens/main/ChatScreen.js`

#### 3.3 Message Encryption at Rest
- **Task:** Encrypt messages before storing in database
- **Deliverable:** All messages encrypted with user-specific keys
- **Time:** 6 hours
- **Method:** AES-256 with Supabase Vault
- **Files to update:**
  - `src/services/encryptionService.js` (new)
  - ChatScreen, message storage

#### 3.4 Read Receipts & Typing
- **Task:** Add read indicators & typing status
- **Deliverable:** Visual feedback for message reads & typing
- **Time:** 4 hours
- **Files to update:**
  - ChatScreen
  - MessageBubble component

---

### PHASE 4: CONTENT SAFETY (Days 8-9)
*Moderate ALL user-generated content.*

#### 4.1 Content Moderation AI (IMPRESS Posts)
- **Task:** Screen posts for NSFW, hate speech, violence
- **Deliverable:** TensorFlow.js NSFW detection working
- **Time:** 6 hours
- **Tech:** TensorFlow.js built-in NSFW model
- **Files to create:**
  - `src/services/contentModerationService.js` (new)
- **Flow:** Upload → AI screen → Queue if flagged → Admin review

#### 4.2 Chat Profanity Filter
- **Task:** Filter bad words in real-time chat
- **Deliverable:** Swear words replaced or blocked
- **Time:** 3 hours
- **Files to update:**
  - ChatScreen
  - Message validation

---

### PHASE 5: MONETIZATION (Days 10-11)
*Can't launch without revenue gating.*

#### 5.1 Payment Gateway (Razorpay)
- **Task:** Integrate Razorpay for subscriptions
- **Deliverable:** Working payment flow for Premium & Matrimony Plus
- **Time:** 8 hours
- **Files to create:**
  - `src/services/paymentService.js` (new)
  - `src/screens/main/PremiumScreen.js` (update)
  - Payment confirmation screen
- **Plans:**
  - SUYAVARAA Premium: ₹299/month
  - SUYAVARAA Matrimony Plus: ₹499/month

#### 5.2 Premium Feature Gating
- **Task:** Lock features behind paywall
- **Deliverable:** Non-premium users see lock icons
- **Time:** 5 hours
- **Features to gate:**
  - Unlimited likes
  - 3 tribes (free = 1)
  - Suyamvaram creation
  - Hybrid mode
  - Advanced filters

#### 5.3 Subscription Management
- **Task:** Manage active subscriptions, cancellations, renewals
- **Deliverable:** User can view/cancel subscriptions
- **Time:** 4 hours

---

### PHASE 6: MATRIMONY MODE (Days 12-13)
*Second mode enables full market reach.*

#### 6.1 Matrimony Data Schema
- **Task:** Create matrimony-specific profile fields
- **Deliverable:** Database schema ready
- **Time:** 3 hours
- **Fields:** Education, occupation, family background, marriage timeline, income range

#### 6.2 Mode Toggle & UI
- **Task:** Build mode switcher in onboarding & settings
- **Deliverable:** Seamless switching between Dating/Matrimony
- **Time:** 5 hours
- **Files to update:**
  - OnboardingStack
  - Settings screen
  - Home screen (different UI per mode)

#### 6.3 Matrimony Matching UI
- **Task:** Browse-style profiles instead of swipe
- **Deliverable:** Matrimony home feed working
- **Time:** 6 hours
- **Files to create:**
  - `src/screens/main/MatrimonyHomeScreen.js` (refactor existing)

---

### PHASE 7: ADMIN CONTROLS (Days 14)
*Must have before any users sign up.*

#### 7.1 Comprehensive Admin Dashboard
- **Task:** Build full admin web app (Next.js)
- **Deliverable:** Admin can ban users, review Fish Trap, approve verifications
- **Time:** 8 hours
- **Pages:**
  - User Management (search, ban, trust score)
  - Fish Trap Review Queue (conversations, red flags)
  - Verification Queue (approve videos)
  - Suyamvaram Review (challenge submissions)
  - Analytics (DAU, matches, messages)
- **Files to create:**
  - `web-admin/pages/Dashboard.js` (new)
  - `web-admin/pages/UserManagement.js` (new)
  - `web-admin/pages/FishTrapQueue.js` (new)
  - `web-admin/services/adminApi.js` (new)

#### 7.2 Admin API Endpoints
- **Task:** Create Node.js API for all admin actions
- **Deliverable:** Secure endpoints for ban, approve, review
- **Time:** 6 hours
- **Endpoints:**
  - `/admin/user/:id/ban` (POST)
  - `/admin/verification/:id/approve` (POST)
  - `/admin/fish-trap/:conversationId/review` (GET)
  - `/admin/suyamvaram/:challengeId/verify` (POST)

---

### PHASE 8: POLISH & QA (Days 15-16)
*Find & fix bugs before launch.*

#### 8.1 Error Handling & Recovery
- **Task:** Add error boundaries, retry logic, offline support
- **Deliverable:** App gracefully handles all error states
- **Time:** 6 hours
- **Focus:**
  - Network timeouts → retry with backoff
  - Auth expiry → silent refresh
  - Database errors → user-friendly messages
  - Photo upload failures → allow retry

#### 8.2 Data Security & Encryption
- **Task:** Ensure all sensitive data is encrypted
- **Deliverable:** PII encrypted, passwords hashed, payment data protected
- **Time:** 5 hours
- **Checklist:**
  - No passwords stored (Supabase Auth handles it)
  - All chats encrypted at rest
  - Payment tokens never stored
  - PII masked in logs

#### 8.3 Comprehensive Flow Testing
- **Task:** Test all critical user journeys end-to-end
- **Deliverable:** Video test recordings of each flow
- **Time:** 8 hours
- **Flows to test:**
  1. Sign up → Fish Trap quarantine → Verification → Profile complete
  2. Dating mode: Swipe → Like → Match → Chat
  3. Matrimony mode: Browse → Interest → Request → Chat
  4. Suyamvaram: Create challenge → Get applicants → Review → Award badge
  5. Admin: Ban user, review verification, manage Fish Trap
  6. Payment: Subscribe → Premium features unlock

#### 8.4 Final Bug Fixes
- **Task:** Triage & fix all blocking bugs
- **Deliverable:** Zero P0 bugs, minimal P1
- **Time:** 6 hours

---

## 📋 DEPENDENCIES & BLOCKERS

```
PHASE 1 (Safety)
├─ 1.1 Architecture
│  ├─ 1.2 Decoy Profiles
│  ├─ 1.3 Quarantine Logic ← Blocks Phase 3
│  └─ 1.4 AI Responder ← Blocks Admin Dashboard

PHASE 2 (Verification)
├─ 2.1 Verification UI
│  ├─ 2.2 Face Matching
│  ├─ 2.3 Admin Queue
│  └─ 2.4 Trust Score ← Blocks Profile Display (all screens)

PHASE 3 (Matching & Chat) ← Needs 1.3, 2.4
├─ 3.1 Matching Algorithm
├─ 3.2 Real-time Chat
├─ 3.3 Message Encryption
└─ 3.4 Read Receipts

PHASE 4 (Content) ← Independent
├─ 4.1 IMPRESS Moderation
└─ 4.2 Chat Filter

PHASE 5 (Money) ← Independent
├─ 5.1 Razorpay Integration
├─ 5.2 Feature Gating
└─ 5.3 Subscription Mgmt

PHASE 6 (Matrimony) ← Needs 5 (premium gating)
├─ 6.1 Schema
├─ 6.2 Mode Toggle
└─ 6.3 Matrimony UI

PHASE 7 (Admin) ← Needs 1.4, 2.3, 5.1
└─ 7.1 & 7.2

PHASE 8 (QA) ← Needs 1-7
└─ 8.1-8.4
```

---

## 🎯 CRITICAL SUCCESS FACTORS

1. **Fish Trap MUST be airtight**
   - Zero unverified users can see real profiles
   - Decoy chats feel 100% human
   - Red flag detection catches scammers

2. **Verification MUST work**
   - >95% accuracy on face matching
   - Admin queue prevents bad actors
   - Trust scores are visible & trusted

3. **Chat MUST be real-time & private**
   - Messages arrive instantly
   - All messages encrypted at rest
   - No sensitive data in logs

4. **Admin MUST be ready**
   - Before ANY beta users
   - Full control: ban, verify, review
   - Dashboard working flawlessly

5. **Payment MUST not fail**
   - Razorpay tested with real transactions
   - Premium features instantly unlock
   - Subscription renewal automatic

---

## 📊 ESTIMATED TIMELINE

| Phase | Days | Total | Critical Path |
|-------|------|-------|--------|
| 1. Safety | 3 | 24 hrs | **YES** |
| 2. Verification | 2 | 21 hrs | **YES** |
| 3. Matching & Chat | 2 | 22 hrs | **YES** |
| 4. Content | 1 | 9 hrs | No (parallel possible) |
| 5. Monetization | 2 | 17 hrs | **YES** |
| 6. Matrimony | 2 | 14 hrs | No (after 5) |
| 7. Admin | 1 | 14 hrs | **YES** |
| 8. QA | 2 | 25 hrs | **YES** |
| **TOTAL** | **14 days** | **150 hrs** | |

**1 developer @ 8 hrs/day = ~19 days**  
**2 developers in parallel = ~10 days** (critical path)

---

## 🚀 NEXT STEPS

1. ✅ Review & approve this plan
2. Start PHASE 1 TASK 1.1 (Fish Trap Architecture)
3. Execute tasks sequentially, updating status as you go
4. Each task should be: **Design → Implement → Test → Merge**

Ready to begin? Start with which task?

---

## 🔗 REFERENCE DOCUMENTS
- [Product Document](./tmp_details/SUYAVARAA_Product_Document.txt)
- [Complete Flow Document](./tmp_details/SUYAVARAA_Complete_Flow_Document.txt)
- [API Schema](./supabase_sql/suyamvaram_schema.sql)
