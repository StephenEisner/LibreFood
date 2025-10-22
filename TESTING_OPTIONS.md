# LibreFood - Complete Testing Options Guide

## 🎯 Your Testing Options Based on What You Have

### ✅ Option 1: Expo Go on iPhone (Easiest - 2 min, Demo Mode Only)
**What you need:** Just your iPhone
**Cost:** Free

```bash
# Switch to demo mode
mv App.tsx App.production.tsx
mv App.demo.tsx App.tsx

# Start server
npm start

# Scan QR code with Expo Go app on iPhone
```

**Pros:**
- ✅ Instant - no build needed
- ✅ See the UI/UX working
- ✅ Test on real device

**Cons:**
- ❌ Mock data only (no real SQLite)
- ❌ Data doesn't persist

---

### ✅ Option 2: iOS Simulator on Mac (Best for Development)
**What you need:** Your Apple laptop + Xcode
**Cost:** Free

```bash
# Install Xcode from App Store (if not installed)
# Then install command line tools:
xcode-select --install

# Run in simulator (uses REAL SQLite database)
npm run ios
```

**Pros:**
- ✅ Real SQLite database (no mock!)
- ✅ Fast - instant builds
- ✅ Hot reload works perfectly
- ✅ All features work
- ✅ No Apple account needed

**Cons:**
- ❌ Requires macOS
- ❌ Xcode is large (~15GB download)

**This is the best option if you have a Mac!**

---

### ✅ Option 3: Android Emulator on Linux (Great Alternative!)
**What you need:** Your Linux machine + Android Studio
**Cost:** Free

```bash
# Install Android Studio
# Set up Android emulator (from Android Studio)

# Run on Android emulator
npm run android
```

**Pros:**
- ✅ Works on Linux!
- ✅ Real SQLite database
- ✅ Fast development
- ✅ No Google account needed for testing

**Cons:**
- ❌ Requires Android Studio setup
- ❌ Tests Android version, not iOS

---

### ⚠️ Option 4: EAS Development Build (Real iPhone, Real Database)
**What you need:** iPhone + FREE Apple ID
**Cost:** Free (no paid developer account needed!)

```bash
npx eas-cli login
npm run build:dev:ios

# Wait ~20 minutes
# Install on iPhone from provided link
```

**Pros:**
- ✅ Real device + real database
- ✅ Only needs FREE Apple ID
- ✅ Most realistic testing
- ✅ All features work

**Cons:**
- ⏰ 20 minute build time
- 📅 Build expires after 30 days
- 🔄 Must rebuild to test changes

---

## 🖥️ Linux Build Options

### Android Testing on Linux (Recommended!)

**Step 1: Install Android Studio**
```bash
# Download from: https://developer.android.com/studio
# Or on Ubuntu/Debian:
sudo snap install android-studio --classic
```

**Step 2: Set up Android SDK**
```bash
# Open Android Studio
# Go to Tools → SDK Manager
# Install:
# - Android SDK Platform 34
# - Android SDK Build-Tools
# - Android Emulator
```

**Step 3: Create Virtual Device**
```bash
# In Android Studio:
# Tools → Device Manager → Create Device
# Select: Pixel 7
# System Image: Android 14 (API 34)
```

**Step 4: Run LibreFood**
```bash
cd /home/se/LibreFood
npm run android
```

The app will build and launch in the emulator with **full SQLite support**!

---

### Web Testing on Linux (Limited Support)
```bash
npm run web
```

**Note:** This works but has limitations:
- ❌ No SQLite (uses IndexedDB instead)
- ❌ Some React Native features don't work
- ✅ Good for UI/UX testing only

---

## 📊 Comparison Table

| Option | Platform | Database | Time | Best For |
|--------|----------|----------|------|----------|
| **Expo Go** | iPhone | Mock | 2 min | Quick UI test |
| **iOS Simulator** | Mac | Real SQLite | Instant | Mac development |
| **Android Emulator** | Linux | Real SQLite | ~5 min | Linux development |
| **EAS Build** | iPhone | Real SQLite | 20 min | Final iOS testing |
| **Web** | Any | IndexedDB | Instant | UI/UX only |

---

## 🎯 Recommended Testing Strategy

### If you have a Mac (Apple laptop):
```bash
1. Use iOS Simulator (npm run ios)
   - Real database
   - Fast iteration
   - Perfect for development
```

### If you're on Linux:
```bash
1. Set up Android Emulator
   - Real database
   - Good for development
2. Use Expo Go for quick iPhone tests (demo mode)
3. Do EAS Build when you want final iPhone validation
```

---

## 🚀 Quick Start for Each Option

### Mac (iOS Simulator):
```bash
# One-time setup
xcode-select --install

# Every time
npm run ios
```

### Linux (Android Emulator):
```bash
# One-time setup
# 1. Install Android Studio
# 2. Create virtual device
# 3. Add to PATH:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Every time
npm run android
```

### iPhone with Expo Go (Demo):
```bash
# Switch to demo
mv App.tsx App.production.tsx
mv App.demo.tsx App.tsx

# Start
npm start

# Scan QR with Expo Go app

# Switch back when done
mv App.tsx App.demo.tsx
mv App.production.tsx App.tsx
```

---

## ❓ Which Should You Use?

**Answer these questions:**

1. **Do you have a Mac?**
   - YES → Use iOS Simulator (Option 2) ⭐ BEST CHOICE
   - NO → Continue to question 2

2. **Are you on Linux?**
   - YES → Use Android Emulator (Option 3) ⭐ BEST FOR LINUX
   - NO → Continue to question 3

3. **Need to test on real iPhone quickly?**
   - YES → Use Expo Go Demo (Option 1)
   - Want full features → Use EAS Build (Option 4)

---

## 💡 Pro Tips

**For Mac Users:**
- iOS Simulator is hands-down the best option
- You get real SQLite + fast iteration
- No build time, instant testing

**For Linux Users:**
- Android Emulator works great
- React Native apps work on both iOS & Android
- Test on Android, deploy to both platforms

**For Quick iPhone Tests:**
- Expo Go (demo mode) is perfect
- See the UI working in 2 minutes
- Then do full build later when ready

---

## 🐛 Troubleshooting

### iOS Simulator not working?
```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

### Android Emulator not starting?
```bash
# Check emulator is in PATH
which emulator

# List available devices
emulator -list-avds

# Start manually
emulator -avd Pixel_7_API_34
```

### Expo Go not connecting?
- Ensure phone and computer on same Wi-Fi
- Try restarting: `npm start` then press `r`
- Try tunnel mode: `npm start --tunnel`

---

## ✅ Next Steps

Choose your option and run it!

**Mac users:** `npm run ios`
**Linux users:** Set up Android Studio, then `npm run android`
**Quick test:** Use Expo Go with demo mode

All options work great - pick what fits your setup! 🚀
