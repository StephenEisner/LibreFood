# Android Setup for LibreFood on Linux

## ✅ What's Already Done

- ✅ Android Studio installed (`/usr/bin/android-studio`)
- ✅ Android SDK installed (`~/Android/Sdk`)
- ✅ Fish shell configured with Android environment variables
- ✅ ADB (Android Debug Bridge) working

## 🎯 Next Steps: Create Virtual Device

### Step 1: Open Android Studio

```bash
android-studio
```

### Step 2: Open Device Manager

In Android Studio:
1. Click on the **"More Actions"** menu (three dots)
2. Select **"Virtual Device Manager"**
   - OR go to: **Tools → Device Manager**

### Step 3: Create New Device

1. Click **"Create Device"** button
2. **Select Hardware:**
   - Choose: **Pixel 7** (or any recent Pixel)
   - Click **Next**

3. **Select System Image:**
   - Tab: **Recommended**
   - Choose: **Android 14 (API 34)** or **Android 13 (API 33)**
   - Click **Download** if not already installed
   - Click **Next**

4. **Configure AVD:**
   - AVD Name: `Pixel_7_API_34` (or whatever you like)
   - Startup orientation: Portrait
   - Click **Finish**

### Step 4: Test the Emulator

You can start it from Android Studio OR from command line:

```bash
# Start your new emulator
~/Android/Sdk/emulator/emulator -avd Pixel_7_API_34
```

---

## 🚀 Run LibreFood on Android

### After the emulator is running:

```bash
cd ~/LibreFood

# Make sure environment is set (in new Fish terminal):
set -gx ANDROID_HOME $HOME/Android/Sdk
set -gx PATH $PATH $ANDROID_HOME/emulator $ANDROID_HOME/platform-tools

# Run the app
npm run android
```

The app will:
1. Build the Android version
2. Install on the emulator
3. Launch LibreFood with **REAL SQLite database**!

---

## 🎨 What You'll See

LibreFood will open showing:
```
🥗 LibreFood
Evidence-based nutrition tracking
v1.0.0 - Development Build

Database: ✅ Initialized
```

This confirms everything works with real SQLite!

---

## ⚡ Quick Reference Commands

```bash
# List available emulators
~/Android/Sdk/emulator/emulator -list-avds

# Start emulator
~/Android/Sdk/emulator/emulator -avd Pixel_7_API_34

# Check if emulator is running
~/Android/Sdk/platform-tools/adb devices

# Run LibreFood
npm run android

# View logs
npm run android -- --verbose
```

---

## 🐛 Troubleshooting

### "command not found: emulator"

Close and reopen your terminal (Fish shell needs to reload config.fish)

Or manually set in current session:
```fish
set -gx ANDROID_HOME $HOME/Android/Sdk
set -gx PATH $PATH $ANDROID_HOME/emulator $ANDROID_HOME/platform-tools
```

### "No Android devices found"

1. Make sure emulator is running: `~/Android/Sdk/platform-tools/adb devices`
2. Should show: `emulator-5554    device`

### Build fails

```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

### Emulator is slow

1. In Android Studio → Device Manager
2. Edit your device
3. Change Graphics to: **Hardware - GLES 2.0**
4. Increase RAM to: **4GB**

---

## 💡 Pro Tips

**Hot Reload:** After the app is running, press `r` in the Metro terminal to reload

**Fast Refresh:** Code changes auto-reload (like Expo Go but with real database!)

**Multiple Devices:** You can create multiple AVDs for different screen sizes

**Background Running:** Start emulator once, keep it running all day

---

## ✅ Next Steps After Setup

1. **Create the virtual device** (follow steps above)
2. **Start emulator:** `~/Android/Sdk/emulator/emulator -avd Pixel_7_API_34`
3. **Run app:** `npm run android` (from LibreFood directory)
4. **See it work!** Real database, full features

---

## 📊 Expected First Run Time

- **First build:** ~3-5 minutes (downloads dependencies)
- **Subsequent builds:** ~30 seconds
- **Hot reload after changes:** Instant!

---

## 🎉 You're Almost There!

Just need to create the virtual device in Android Studio, then you can test LibreFood with full SQLite support!

**Estimated setup time:** 5-10 minutes
