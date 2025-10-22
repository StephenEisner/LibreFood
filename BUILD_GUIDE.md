# LibreFood - Build Guide for iOS

## 📱 Building and Installing on Your iPhone

This guide walks you through creating a development build of LibreFood and installing it on your iPhone.

---

## Prerequisites

- **iPhone** (running iOS 13 or later)
- **Expo account** (free) - Create at https://expo.dev/signup if you don't have one
- **Internet connection** for the build process

---

## Step-by-Step Build Process

### 1. Login to Expo Account

```bash
npx eas-cli login
```

Enter your Expo credentials when prompted.

To verify you're logged in:
```bash
npx eas-cli whoami
```

---

### 2. Configure EAS Build

```bash
npx eas-cli build:configure
```

This will:
- Link your project to your Expo account
- Verify the `eas.json` configuration
- Set up your project for builds

---

### 3. Start the iOS Development Build

```bash
npm run build:dev:ios
```

Or use the full command:
```bash
npx eas-cli build --profile development --platform ios
```

---

### 4. Answer the Setup Prompts

During your **first build**, EAS will ask several questions:

#### Apple App Identifier
```
? Would you like to automatically create an Apple App Identifier?
→ Yes
```

#### Apple Distribution Certificate
```
? Generate a new Apple Distribution Certificate?
→ Yes
```

#### Apple Provisioning Profile
```
? Generate a new Apple Provisioning Profile?
→ Yes
```

EAS will handle all the Apple Developer setup for you automatically.

---

### 5. Wait for the Build

The build process takes approximately **15-20 minutes**.

You'll see:
```
✔ Build queued
...
✔ Build in progress
...
✔ Build finished
```

---

### 6. Install on Your iPhone

When the build completes, you'll see installation options:

```
✔ Build finished

🎉 Build completed successfully!

Install on your device:
https://expo.dev/artifacts/eas/[build-id].ipa

Or use QR code to open in Expo Orbit:
[QR CODE]
```

#### Installation Options:

**Option A: Direct Download (Recommended for first install)**
1. Open the provided link **on your iPhone**
2. Tap "Install" or "Add to Home Screen"
3. Go to **Settings → General → VPN & Device Management**
4. Trust the developer certificate
5. Open LibreFood from your home screen

**Option B: Via QR Code with Expo Orbit**
1. Install "Expo Orbit" from the App Store
2. Scan the QR code with your camera
3. Follow the installation prompts

---

### 7. Register Your Device (First Time Only)

If prompted to register your device:
1. Click the registration link sent by Expo
2. Follow the Apple UDID registration process
3. Wait for the profile to be created (~2 minutes)
4. Rebuild if necessary: `npm run build:dev:ios`

---

## Running the Development Server

After the app is installed on your iPhone:

### Start the Metro bundler:
```bash
npm start
```

### Connect your iPhone:
1. Make sure your iPhone and computer are on the **same Wi-Fi network**
2. Open the LibreFood app on your iPhone
3. The app will automatically connect to the dev server
4. Or scan the QR code shown in the terminal

---

## What You'll See on First Launch

The app will display:
```
🥗 LibreFood
Evidence-based nutrition tracking
v1.0.0 - Development Build

Database: ✅ Initialized
```

This confirms:
- ✅ Native iOS build successful
- ✅ TypeScript compilation working
- ✅ expo-sqlite properly configured
- ✅ Database initialization functional

---

## Troubleshooting

### Build Failed: Apple Developer Account

If you see Apple Developer account errors:
```bash
npx eas-cli credentials
```
Follow prompts to set up credentials.

### Build Failed: Bundle Identifier Conflict

If the bundle ID `com.librefood.app` is taken:
1. Edit `app.json`
2. Change `ios.bundleIdentifier` to something unique (e.g., `com.yourname.librefood`)
3. Rebuild

### App Won't Install

- Make sure your device is registered (check build logs)
- Try downloading the `.ipa` file again
- Verify you trusted the certificate in Settings

### Can't Connect to Dev Server

- Ensure iPhone and computer are on same Wi-Fi
- Try scanning the QR code again
- Restart the Metro bundler: `npm start`

### Build Expired (after 30 days)

Development builds expire after 30 days. Simply rebuild:
```bash
npm run build:dev:ios
```

---

## Build Profiles

We have three build profiles configured in `eas.json`:

### Development (`npm run build:dev:ios`)
- **Purpose:** Daily development and testing
- **Includes:** Expo Dev Client for hot reload
- **Distribution:** Internal (ad-hoc)
- **Expiration:** 30 days
- **Best for:** Active development

### Preview (`npm run build:preview:ios`)
- **Purpose:** Testing before production
- **Includes:** Production configuration, internal distribution
- **Distribution:** Internal
- **Best for:** Beta testing

### Production (`npm run build:prod:ios`)
- **Purpose:** App Store release
- **Distribution:** App Store
- **Best for:** Public release

---

## Useful Commands

```bash
# Check build status
npx eas-cli build:list

# View build details
npx eas-cli build:view [build-id]

# Cancel a build
npx eas-cli build:cancel

# Check credentials
npx eas-cli credentials

# View all devices
npx eas-cli device:list
```

---

## Next Steps After Successful Build

Once you've confirmed the app works on your iPhone:

1. ✅ Database initialization verified
2. ⏭️ Continue with Phase 1 development:
   - User CRUD operations
   - Body metrics tracking
   - TDEE calculations
   - Onboarding flow

---

## Support

- **Expo Docs:** https://docs.expo.dev/build/setup/
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **LibreFood Issues:** Open an issue in this repository

---

**Estimated Total Time:**
- First build: ~20-25 minutes (setup + build)
- Subsequent builds: ~10-15 minutes (cached dependencies)

**Cost:** Free on Expo's free tier (includes build minutes)
