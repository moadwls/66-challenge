# App Store Submission Guide

## Prerequisites

1. **Apple Developer Account** ($99/year)
   - Sign up at: https://developer.apple.com/programs/enroll/
   
2. **Mac with Xcode** (free from Mac App Store)
   - Xcode 15+ recommended
   
3. **App Icons** (required)
   - 1024x1024 PNG (App Store listing)
   - See icon sizes below

---

## Step 1: Setup on Your Mac

```bash
# Navigate to project
cd ~/Downloads/66-challenge-final

# Install dependencies
npm install

# Initialize Capacitor iOS
npx cap add ios

# Build the app
npm run build

# Sync with iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

---

## Step 2: App Icons

Create these icon sizes and add to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`:

| Size | Filename | Purpose |
|------|----------|---------|
| 20x20 | AppIcon-20x20@1x.png | iPad Notifications |
| 40x40 | AppIcon-20x20@2x.png | iPad Notifications @2x |
| 60x60 | AppIcon-20x20@3x.png | iPhone Notifications |
| 29x29 | AppIcon-29x29@1x.png | Settings |
| 58x58 | AppIcon-29x29@2x.png | Settings @2x |
| 87x87 | AppIcon-29x29@3x.png | Settings @3x |
| 40x40 | AppIcon-40x40@1x.png | Spotlight |
| 80x80 | AppIcon-40x40@2x.png | Spotlight @2x |
| 120x120 | AppIcon-40x40@3x.png | Spotlight @3x |
| 60x60 | AppIcon-60x60@1x.png | iPhone App |
| 120x120 | AppIcon-60x60@2x.png | iPhone App @2x |
| 180x180 | AppIcon-60x60@3x.png | iPhone App @3x |
| 76x76 | AppIcon-76x76@1x.png | iPad App |
| 152x152 | AppIcon-76x76@2x.png | iPad App @2x |
| 167x167 | AppIcon-83.5x83.5@2x.png | iPad Pro |
| 1024x1024 | AppIcon-1024x1024@1x.png | App Store |

**Easy way:** Use https://appicon.co/ - upload your 1024x1024 logo and it generates all sizes.

---

## Step 3: Configure in Xcode

1. **Open** `ios/App/App.xcworkspace` in Xcode

2. **Select** the `App` target → General tab

3. **Set Bundle Identifier:** `com.the66challenge.app`

4. **Set Version:** `1.0.0`

5. **Set Build:** `1`

6. **Select Team:** Your Apple Developer team

7. **Signing:** Let Xcode manage signing automatically

---

## Step 4: Test on Device

1. Connect your iPhone via USB
2. Select your device in Xcode toolbar
3. Click Play button (⌘R)
4. Trust the developer certificate on your phone:
   - Settings → General → Device Management

---

## Step 5: Create App Store Listing

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:

**App Information:**
- Name: `66 Challenge`
- Primary Language: English
- Bundle ID: `com.the66challenge.app`
- SKU: `66challenge001`

**App Description:**
```
Build unbreakable discipline with the 66 Challenge.

Science shows it takes 66 days to form a lasting habit. This app helps you stay accountable with:

• Choose your difficulty (3, 6, or 8 daily habits)
• Track your progress with visual streaks
• Connect with friends for accountability
• See who's winning on the leaderboard
• Earn badges for milestones
• Document your journey with progress photos

Join thousands building better habits, one day at a time.

Start your 66-day transformation today.
```

**Keywords:**
```
habit tracker, 66 days, discipline, daily habits, streak, challenge, accountability, fitness, productivity, self improvement
```

**Support URL:** `https://66-challenge.vercel.app/privacy`
**Privacy Policy URL:** `https://66-challenge.vercel.app/privacy`

---

## Step 6: Screenshots

Required sizes:
- 6.7" iPhone (1290 x 2796 px) - iPhone 15 Pro Max
- 6.5" iPhone (1284 x 2778 px) - iPhone 14 Plus
- 5.5" iPhone (1242 x 2208 px) - iPhone 8 Plus

Take screenshots of:
1. Landing page
2. Daily habits checklist
3. Progress/streaks
4. Leaderboard
5. Badges

**Tip:** Use iPhone Simulator in Xcode to capture screenshots.

---

## Step 7: Archive & Upload

1. In Xcode: **Product → Archive**
2. Wait for build to complete
3. Click **Distribute App**
4. Select **App Store Connect**
5. Click **Upload**

---

## Step 8: Submit for Review

1. Go to App Store Connect
2. Select your app
3. Click "+ Version or Platform" → iOS
4. Add screenshots
5. Fill in What's New: `Initial release`
6. Click **Add for Review**
7. Click **Submit to App Review**

---

## Timeline

| Step | Time |
|------|------|
| Apple Developer enrollment | 1-2 days |
| Build & Test | 1 day |
| Screenshots & listing | 1 day |
| Apple Review | 1-3 days |
| **Total** | **4-7 days** |

---

## Common Issues

**"Provisioning profile" error:**
- Xcode → Preferences → Accounts → Download Manual Profiles

**"Untrusted Developer" on device:**
- Settings → General → Device Management → Trust

**Build fails:**
- Run `npx cap sync ios` again
- Clean build: Xcode → Product → Clean Build Folder

---

## Need Help?

Contact: the66challenge@gmail.com
