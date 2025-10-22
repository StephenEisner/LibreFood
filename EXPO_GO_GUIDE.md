# Testing with Expo Go (No Apple Developer Account Needed)

## 🚀 Quick Start - Test in 2 Minutes!

### Step 1: Switch to Demo Mode
```bash
# Temporarily rename files to use demo version
mv App.tsx App.production.tsx
mv App.demo.tsx App.tsx
```

### Step 2: Start Expo
```bash
npm start
```

### Step 3: Open on Your iPhone
1. Download **Expo Go** from the App Store (free)
2. Open Expo Go app
3. Scan the QR code shown in your terminal
4. LibreFood will load with demo data!

---

## ✨ What You'll See

The demo app shows:
- ✅ User profile (demo data)
- ✅ Current weight tracking
- ✅ Weight history (last 7 days)
- ✅ All UI working perfectly
- ⚠️ Data stored in memory only (resets on reload)

---

## 🔄 Switch Back to Production Mode

When done testing:
```bash
mv App.tsx App.demo.tsx
mv App.production.tsx App.tsx
```

---

## 💡 Why Demo Mode?

**Expo Go Limitations:**
- ❌ Doesn't support `expo-sqlite` (native module)
- ❌ Can't use custom native code

**Demo Mode Solutions:**
- ✅ Uses in-memory mock database
- ✅ Shows all UI components working
- ✅ Demonstrates app flow and design
- ✅ Perfect for quick testing without builds

---

## 🎯 What Works in Demo Mode

| Feature | Expo Go Demo | Development Build |
|---------|--------------|-------------------|
| UI/UX | ✅ Yes | ✅ Yes |
| User Profile | ✅ Mock Data | ✅ Real SQLite |
| Weight Tracking | ✅ Mock Data | ✅ Real SQLite |
| Data Persistence | ❌ Memory Only | ✅ Real Database |
| Offline Mode | ❌ | ✅ Yes |
| Full Features | ❌ Limited | ✅ Complete |

---

## 📱 Full Testing Options Comparison

### Option 1: Expo Go (Easiest - 2 min)
```bash
# Switch to demo mode
mv App.tsx App.production.tsx
mv App.demo.tsx App.tsx
npm start
# Scan QR code with Expo Go app
```
**Pros:**
- ✅ No build needed
- ✅ Instant testing (2 minutes)
- ✅ No Apple account needed
- ✅ See UI/UX working

**Cons:**
- ❌ Mock data only
- ❌ No real database
- ❌ Data doesn't persist

---

### Option 2: iOS Simulator (Best for Development)
```bash
# Requires macOS with Xcode
npm run ios
```
**Pros:**
- ✅ Full SQLite support
- ✅ Real database
- ✅ Fast iteration
- ✅ No phone needed

**Cons:**
- ❌ Requires macOS
- ❌ Requires Xcode (~15GB)

---

### Option 3: Development Build (Most Realistic)
```bash
npx eas-cli login
npm run build:dev:ios
# Wait ~20 min, install on iPhone
```
**Pros:**
- ✅ Real device testing
- ✅ Full SQLite support
- ✅ Real database
- ✅ Only needs FREE Apple ID

**Cons:**
- ⏰ 20 minute build time
- 📅 Expires after 30 days

---

## 🎬 Recommended Testing Flow

1. **Start with Expo Go** (2 min)
   - Test UI/UX
   - Verify design
   - Check navigation

2. **Then iOS Simulator** (if you have Mac)
   - Test with real database
   - Verify data persistence
   - Test full features

3. **Finally Development Build** (when ready)
   - Test on real device
   - Final validation before production

---

## 🔧 Quick Commands

**Switch to Demo Mode:**
```bash
mv App.tsx App.production.tsx && mv App.demo.tsx App.tsx
npm start
```

**Switch Back:**
```bash
mv App.tsx App.demo.tsx && mv App.production.tsx App.tsx
npm start
```

**Or use symbolic links (better):**
```bash
# Use demo
ln -sf App.demo.tsx App.tsx

# Use production
ln -sf App.production.tsx App.tsx
```

---

## 💾 Demo Data

The demo mode includes:
- **User Profile:**
  - Height: 175 cm
  - Sex: Male
  - Activity: Moderate
  - Goal: Lose Weight
  - Target: 75 kg

- **Weight History:**
  - Last 7 days of weight entries
  - Shows gradual weight loss (80kg → 77.9kg)

---

## 🎨 What the Demo Shows

```
┌─────────────────────────────┐
│     🥗 LibreFood            │
│   Demo Mode (Expo Go)       │
│                             │
│  Database Status            │
│  ✅ Mock (In-Memory)        │
│                             │
│  User Profile               │
│  Height: 175 cm             │
│  Sex: male                  │
│  Activity: moderate         │
│  Goal: lose weight          │
│                             │
│  Current Weight             │
│     77.9 kg                 │
│                             │
│  Weight History             │
│  2025-10-22    77.9 kg      │
│  2025-10-21    78.2 kg      │
│  2025-10-20    78.5 kg      │
│  ...                        │
│                             │
│  [Reset Demo Data]          │
│                             │
│  💡 For Full Features:      │
│  Build development client   │
└─────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Can't connect to Metro bundler
- Ensure phone and computer on same Wi-Fi
- Try restarting: `npm start` then press `r`

### Demo not loading
- Check you renamed the files correctly
- Verify App.tsx points to demo version
- Try: `npm start --clear`

### Want real database in Expo Go
- Not possible - Expo Go doesn't support native modules
- Must use Development Build or iOS Simulator

---

## ✅ You're Ready!

Run these commands:
```bash
mv App.tsx App.production.tsx
mv App.demo.tsx App.tsx
npm start
```

Then scan the QR code with Expo Go and see LibreFood running on your iPhone! 📱

---

**Switch back when done:**
```bash
mv App.tsx App.demo.tsx
mv App.production.tsx App.tsx
```
