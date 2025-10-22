# Next Steps - Android Setup

## Current Status
✅ Android SDK configured in Fish shell
✅ Android package identifier added to app.json
✅ All code committed and ready

## What to Do Next

### 1. Create Android Virtual Device (5 minutes)

Open Android Studio:
```bash
android-studio
```

Then:
1. Click **"More Actions"** → **"Virtual Device Manager"**
2. Click **"Create Device"**
3. Select **Pixel 7** → Next
4. Choose **Android 14 (API 34)** → Download (if needed) → Next
5. Name it `Pixel_7_API_34` → Finish

### 2. Start the Emulator

```bash
~/Android/Sdk/emulator/emulator -avd Pixel_7_API_34
```

### 3. Run LibreFood

Once the emulator shows the Android home screen:

```bash
cd ~/LibreFood
npm run android
```

The app will build (~3-5 min first time), install, and launch with **real SQLite database**!

---

## Verification

After the app launches, you should see:
```
🥗 LibreFood
Evidence-based nutrition tracking
v1.0.0 - Development Build

Database: ✅ Initialized
```

This confirms everything is working with real SQLite!

---

## Quick Reference

```bash
# List AVDs
~/Android/Sdk/emulator/emulator -list-avds

# Check if emulator is running
~/Android/Sdk/platform-tools/adb devices

# Run app
npm run android

# View detailed logs
npm run android -- --verbose
```

---

**Next development tasks:** See TODO.md for Phase 1 remaining work (calculations, onboarding flow)
