# Testing Checklist - Login to Matrimony Flow

## ✅ Completed Fixes
- [x] Database migration applied (notification_tokens, verification_requests, contact_info_logs tables)
- [x] 20 decoy profiles seeded
- [x] Fixed `interaction_id` → `conversation_id` in fishTrapService and aiResponderService  
- [x] Fixed duplicate module.exports in notificationService
- [x] Fixed JSX syntax error in LandingScreen (missing LinearGradient closing tag)
- [x] Module system standardized to CommonJS everywhere

## 📋 Test Flow - Login → Dating → Matrimony

### Step 1: Start the App
```bash
cd /home/natzridz/suyavaraa
npm run web
```
- Opens at `http://localhost:8081`
- Wait for "Logs for your project will appear below" message
- Browser shows app loaded when page becomes interactive

### Step 2: Login Test
**Location:** LandingScreen → LoginScreen
**What to test:**
- [ ] Landing page displays with logo "SUYA"
- [ ] "Login" button navigates to LoginScreen
- [ ] Phone/Email input works
- [ ] OTP/Password flow completes
- [ ] Redirects to Home after login

**Expected Flow:**
```
LandingScreen 
  → LoginScreen 
    → OTP Entry 
      → Home (Dating mode by default)
```

### Step 3: Dating App Home
**Location:** HomeScreen / DatingHome
**What to test:**
- [ ] Profile cards display with swipe cards
- [ ] Mode indicator shows "Dating 💘" at top
- [ ] Bottom navigation appears: Home, Matches, IMPRESS, Suyamvaram, Tribes, Profile
- [ ] Swipe/Like functionality works
- [ ] No "column does not exist" errors in console

**Expected UI Components:**
- Profile cards with photo
- Like/Pass buttons
- Tribe badge
- Fish Trap check (if in quarantine, decoy profiles appear)

### Step 4: Switch to Matrimony Mode
**Location:** Profile Tab → Mode Settings
**What to test:**
- [ ] Tap Profile icon (bottom right / top)
- [ ] Matrimony mode option appears in menu
- [ ] Click "Matrimony 💍" to switch
- [ ] May prompt for Premium if not upgraded
- [ ] Mode switches successfully
- [ ] UI updates (colors change, navigation label changes)

**Expected Changes:**
- Header colors: Pink → Gold
- Mode badge: "Dating 💘" → "Matrimony 💍"
- Tab label: "Tribes" → "Zones"

### Step 5: Check Tribes/Zones Page
**Location:** Navigation → Tribes/Zones Tab
**What to test:**
- [ ] Tab shows as "Tribes" in Dating mode
- [ ] Tab shows as "Zones" in Matrimony mode
- [ ] 8 tribe/zone cards display (Adventurer, Nomad, Foodie, etc.)
- [ ] Can tap any tribe/zone card
- [ ] Inside tribe page shows profiles from that tribe
- [ ] Can select up to 3 tribes/zones in profile

**Expected Tribes (Dating Mode):**
1. 🧗 Adventurer Tribe
2. ✈️ Nomad Tribe
3. 🍜 Foodie Tribe
4. ⚡ Athlete Tribe
5. 🎨 Creative Tribe
6. 🌱 Eco-Conscious Tribe
7. 📚 Intellectual Tribe
8. 🌙 Nightlife Tribe

**Expected Zones (Matrimony Mode):**
1. 🗺️ Explorer Zone
2. ✈️ Traveller Zone
3. 🍴 Culinary Zone
4. 🏃 Active Living Zone
5. 🎭 Cultural Zone
6. 🌍 Eco-Warrior Zone
7. 🧠 Scholar Zone
8. 🎉 Modern Lifestyle Zone

## 🐛 Common Issues to Watch For

### Issue 1: "Column does not exist" errors
**Fix:** ✅ Already applied (conversation_id in fish_trap_messages)
**If still occurs:** Check Supabase SQL Editor for table structure

### Issue 2: Mode switch doesn't save
**Expected:** Uses AsyncStorage to persist userMode
**If broken:** Check ProfileStack.js switchMode function

### Issue 3: Tribes/Zones not displaying
**Check:**
- User has selected a tribe during onboarding
- Profile data loaded from AsyncStorage correctly
- TribesScreen.js rendering logic

### Issue 4: Premium prompt on matrimony switch
**Expected:** Free users see upgrade prompt
**OK if:** Shows "Premium Required" alert with "Upgrade Now" button

## 📊 Success Criteria

✅ **Pass** if:
1. Login completes successfully
2. Dating home displays profiles
3. Mode switch works (shows UI update)
4. Matrimony home displays
5. Tribes/Zones page shows all 8 options
6. No console errors about missing columns
7. Tap tribes to see filtered profiles

❌ **Fail** if:
1. Any "SyntaxError" in console
2. Any "Cannot find module" errors
3. "Column does not exist" database errors
4. App freezes or crashes
5. Navigation doesn't work

## 🔍 Debug Commands (if issues occur)

Open browser console (F12) and run:
```javascript
// Check current mode
localStorage.getItem('userMode')

// Check user data loaded
localStorage.getItem('userData')

// Check premium status
localStorage.getItem('isPremium')

// Check selected tribes
localStorage.getItem('selectedTribes')
```

Check React Native debugger:
```bash
# In another terminal
npx react-native-debugger
```

## 📝 After Testing

Record any errors with:
1. Exact error message
2. Stack trace from console
3. Steps to reproduce
4. Current screen/tab

Then run: 
```bash
npm run web 2>&1 | tee /tmp/app-debug.log
```
To capture full build output for analysis.

---

**App Version:** TrekRiderz (Suyavaraa)  
**Database:** Supabase (22 tables + migrations)  
**Testing Date:** Mar 23, 2026  
**Module System:** CommonJS (standardized)
