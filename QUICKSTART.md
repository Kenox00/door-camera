# 🚀 Quick Start Guide

## Complete Installation & Testing

### Step 1: Install Dependencies

```powershell
npm install
```

This installs:
- React 19 + Vite 7
- TypeScript
- Tailwind CSS v4 (Beta)
- React Router v7
- Zustand + React Query
- Framer Motion
- Axios + Compressor.js

### Step 2: Start Mock Backend

Open **Terminal 1**:

```powershell
# Install Express (if not already installed)
npm install express cors

# Start mock server
npm run mock-server
```

You should see:
```
🚀 Smart Door Camera Mock Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Running on: http://localhost:3000
   
   Endpoints:
   POST   /api/visitors/capture
   GET    /api/visitors/status/:sessionId
   ...
   
   Auto-approval: 10 seconds (70% approve, 30% deny)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 3: Start Frontend

Open **Terminal 2**:

```powershell
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   https://localhost:5173/
➜  Network: https://192.168.x.x:5173/
```

### Step 4: Open in Browser

1. Open **Chrome** or **Edge**
2. Navigate to: `https://localhost:5173`
3. Accept SSL warning (self-signed certificate)
4. **Grant camera permissions** when prompted
5. Camera should start automatically!

---

## ✅ Test the Complete Flow

### Test 1: Camera Preview
- ✅ Camera starts automatically
- ✅ Shows rear camera view (environment facing)
- ✅ Cyan corner overlays visible
- ✅ Crosshair in center
- ✅ "SMART DOOR SECURITY" header

### Test 2: Capture & Upload
1. Press **RING BELL** button
2. Watch for:
   - ✅ Ripple animation
   - ✅ Button disabled for 3 seconds
   - ✅ Text changes to "PROCESSING..."
3. Automatic redirect to **Waiting Screen**

### Test 3: Waiting Screen
- ✅ Blurred background (your captured photo)
- ✅ Rotating cyan loader
- ✅ "Waiting for Approval" message
- ✅ Session ID displayed
- ✅ Backend polling every 3 seconds

**Check backend terminal** - you should see:
```
📸 [12:34:56] New capture: abc123-...
📊 [12:34:59] Status check: abc123-... - pending
📊 [12:35:02] Status check: abc123-... - pending
```

### Test 4: Approval/Denial (After 10 Seconds)

**If Approved (70% chance):**
- ✅ Green checkmark animation
- ✅ "Access Granted" message
- ✅ Door opening animation
- ✅ Progress bar fills (green)
- ✅ Auto-redirect to home in 5 seconds

**If Denied (30% chance):**
- ✅ Red X animation
- ✅ "Access Denied" message
- ✅ Shield icon animation
- ✅ Progress bar fills (red)
- ✅ Auto-redirect to home in 5 seconds

---

## 📱 Test on Phone/Tablet

### Find Your Computer's IP

```powershell
ipconfig
```

Look for: **IPv4 Address** (e.g., `192.168.1.100`)

### Access from Mobile

1. **Ensure phone is on same WiFi network**
2. Open browser on phone (Chrome/Safari)
3. Navigate to: `https://192.168.1.100:5173`
4. Accept SSL warning
5. Grant camera permissions
6. Test RING BELL button!

---

## 🎯 Manual Backend Testing

While app is running, test manual approval/denial:

### List All Sessions
```powershell
curl http://localhost:3000/api/visitors
```

### Manually Approve a Session
```powershell
# Replace {sessionId} with actual ID from /api/visitors
curl -X POST http://localhost:3000/api/visitors/{sessionId}/approve
```

### Manually Deny a Session
```powershell
curl -X POST http://localhost:3000/api/visitors/{sessionId}/deny
```

---

## 🔍 Troubleshooting

### Camera Not Starting

**Check Permissions:**
- Chrome: `chrome://settings/content/camera`
- Edge: `edge://settings/content/camera`

**Enable HTTPS:**
- Camera API requires secure context
- Vite automatically uses HTTPS in dev mode

**Try Different Browser:**
- Chrome/Edge recommended
- Safari works on iOS
- Firefox should work

### Backend Connection Error

**Check `.env` file:**
```env
VITE_API_URL=http://localhost:3000
```

**Verify mock server is running:**
```powershell
# Should show:
# 🚀 Smart Door Camera Mock Backend Server
```

**Test backend directly:**
```powershell
curl http://localhost:3000/api/visitors
```

### Styles Not Loading

**Clear cache and rebuild:**
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

**Check Tailwind import:**
- Open `src/index.css`
- First line should be: `@import "tailwindcss";`

### TypeScript Errors

```powershell
# Ensure TypeScript is installed
npm install -D typescript
```

---

## 🎨 Customize the App

### Change Colors

Edit `src/index.css`:

```css
@theme {
  --color-navy: #1A1A2E;      /* Change background */
  --color-cyan: #00D9FF;      /* Change accent */
}
```

### Change Approval Time

Edit `mockServer.js`:

```javascript
if (elapsed > 5000) { // Change from 10000 to 5000 (5 seconds)
```

### Change Camera Settings

Edit `src/lib/config.ts`:

```typescript
export const CAMERA_CONFIG = {
  facingMode: 'user', // Change to 'user' for front camera
  width: { ideal: 1280 }, // Lower for faster performance
  height: { ideal: 720 },
};
```

---

## 📦 Build for Production

### 1. Build

```powershell
npm run build
```

Output in `dist/` folder

### 2. Preview Build

```powershell
npm run preview
```

### 3. Deploy

**Vercel (Recommended):**
```powershell
npm install -g vercel
vercel
```

**Netlify:**
```powershell
npm install -g netlify-cli
netlify deploy --prod
```

**Your Server:**
- Copy `dist/` folder to server
- Serve with nginx/apache
- Ensure HTTPS is enabled

---

## 📚 Project Structure

```
door-camera/
├── src/
│   ├── components/       # UI Components
│   │   ├── CameraView.tsx
│   │   ├── RingButton.tsx
│   │   └── StatusOverlay.tsx
│   ├── hooks/            # Custom Hooks
│   │   ├── useCamera.ts
│   │   └── useCapture.ts
│   ├── pages/            # Route Pages
│   │   ├── Home.tsx
│   │   ├── Waiting.tsx
│   │   ├── Approved.tsx
│   │   └── Denied.tsx
│   ├── lib/              # Utilities
│   │   ├── api.ts
│   │   ├── config.ts
│   │   └── utils.ts
│   ├── store/            # State Management
│   │   └── sessionStore.ts
│   ├── App.jsx           # Router Setup
│   ├── main.jsx          # Entry Point
│   └── index.css         # Tailwind Styles
├── public/
│   └── manifest.json     # PWA Config
├── mockServer.js         # Test Backend
├── package.json
├── vite.config.js
├── tsconfig.json
├── .env                  # Environment Variables
├── README.md             # Full Documentation
├── TESTING.md            # Testing Guide
└── QUICKSTART.md         # This file
```

---

## 🆘 Need Help?

1. **Check console** (F12) for errors
2. **Check network tab** for API issues
3. **Verify mock server** is running
4. **Read TESTING.md** for detailed tests
5. **Read README.md** for full docs

---

## ✅ Success Checklist

Before going to production:

- [ ] Camera starts automatically
- [ ] RING BELL captures and uploads photo
- [ ] Waiting screen polls backend
- [ ] Approval flow works correctly
- [ ] Denial flow works correctly
- [ ] Camera recovers from failures
- [ ] Tested on target device
- [ ] Backend is deployed
- [ ] HTTPS is enabled
- [ ] Performance is acceptable

---

**You're all set! 🎉**

Press RING BELL and watch the magic happen! 🚪📸
