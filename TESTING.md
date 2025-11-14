# 🧪 Testing & Deployment Guide

## Quick Start

```powershell
# Install dependencies
npm install

# Create .env file
Copy-Item .env.example .env

# Run development server
npm run dev
```

Access at: `https://localhost:5173`

---

## 🧪 Testing Instructions

### 1. Camera Preview Test

**Steps:**
1. Open app in Chrome/Edge browser
2. Grant camera permissions when prompted
3. Camera should start automatically within 2 seconds

**Expected Behavior:**
- ✅ Rear camera activates (shows environment)
- ✅ Corner overlays visible (cyan borders)
- ✅ Crosshair in center
- ✅ "SMART DOOR SECURITY" header at top
- ✅ RING BELL button at bottom

**Troubleshooting:**
- If camera doesn't start, check browser console
- Ensure you're using HTTPS (camera API requires secure context)
- Try different browser (Chrome recommended)

---

### 2. Photo Capture Test

**Steps:**
1. Press "RING BELL" button
2. Watch for ripple animation
3. Button should be disabled for 3 seconds

**Expected Behavior:**
- ✅ Button shows ripple effect
- ✅ Text changes to "PROCESSING..."
- ✅ Camera captures photo instantly
- ✅ Navigates to "Waiting" screen
- ✅ Blurred background shows captured photo

**Check via Console:**
```javascript
// Open DevTools Console
// Check if photo was stored
console.log(useSessionStore.getState().lastCapturedPhoto);
// Should show base64 string starting with "data:image/jpeg;base64,..."
```

---

### 3. Mock Backend Server Test

Since you need a backend, here's a simple mock server:

**Create `mockServer.js` in project root:**

```javascript
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const sessions = new Map();

// Capture endpoint
app.post('/api/visitors/capture', (req, res) => {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, { 
    status: 'pending',
    capturedAt: new Date().toISOString()
  });
  
  console.log(`📸 New capture: ${sessionId}`);
  
  res.json({ 
    sessionId, 
    message: 'Visitor captured successfully', 
    timestamp: new Date().toISOString() 
  });
});

// Status endpoint
app.get('/api/visitors/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  console.log(`📊 Status check: ${sessionId} - ${session.status}`);
  
  res.json({ 
    sessionId, 
    status: session.status,
    message: session.status === 'pending' 
      ? 'Waiting for admin approval...' 
      : session.status === 'approved'
        ? 'Access granted'
        : 'Access denied',
    timestamp: new Date().toISOString() 
  });
});

// Auto-approve after 10 seconds (for testing)
setInterval(() => {
  sessions.forEach((session, sessionId) => {
    if (session.status === 'pending') {
      const elapsed = Date.now() - new Date(session.capturedAt).getTime();
      if (elapsed > 10000) { // 10 seconds
        session.status = Math.random() > 0.3 ? 'approved' : 'denied';
        console.log(`✅ Auto-processed: ${sessionId} - ${session.status}`);
      }
    }
  });
}, 1000);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Mock backend running on http://localhost:${PORT}`);
  console.log('   POST /api/visitors/capture');
  console.log('   GET  /api/visitors/status/:sessionId');
});
```

**Install & Run:**
```powershell
# Install Express
npm install express cors

# Run mock server
node mockServer.js
```

**Update `.env`:**
```env
VITE_API_URL=http://localhost:3000
```

---

### 4. Admin Approval Flow Test

**Scenario A: Approved**

1. Press RING BELL
2. Wait screen appears with rotating loader
3. After 10 seconds (mock auto-approval)
4. Green checkmark animation
5. "Access Granted" message
6. Door opening animation
7. Progress bar fills
8. Auto-redirect to home after 5 seconds

**Scenario B: Denied**

1. Press RING BELL
2. Wait screen appears
3. After 10 seconds (30% chance in mock)
4. Red X animation
5. "Access Denied" message
6. Shield icon
7. Progress bar fills (red)
8. Auto-redirect to home after 5 seconds

---

### 5. Camera Recovery Test

**Simulate camera failure:**

```javascript
// Open DevTools Console on Home page
// Get video element
const video = document.querySelector('video');

// Stop camera stream
video.srcObject.getTracks()[0].stop();

// Expected: Camera should restart automatically after 2 seconds
```

**Expected Behavior:**
- ✅ "Reconnecting camera..." overlay appears
- ✅ Camera restarts within 2 seconds
- ✅ No manual intervention needed

---

### 6. Offline Mode Test

**Steps:**
1. Open DevTools
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Observe status banner

**Expected Behavior:**
- ✅ Red "No Connection" banner at top
- ✅ Icon shows WiFi off symbol
- ✅ Re-enable network → banner disappears

---

### 7. Network Polling Test

**Monitor polling requests:**
```javascript
// In waiting screen, check Network tab
// Should see requests to /api/visitors/status/:sessionId every 3 seconds
```

**Expected Behavior:**
- ✅ Polls every 3000ms
- ✅ Stops polling after status changes
- ✅ Redirects immediately on status change

---

## 📱 Phone/Tablet Deployment

### Option 1: Local Network Testing

**1. Find Your Computer's IP:**
```powershell
ipconfig
# Look for: IPv4 Address (e.g., 192.168.1.100)
```

**2. Ensure Vite is Configured:**
Already done in `vite.config.js`:
```javascript
server: {
  https: true,
  host: true, // Exposes on network
}
```

**3. Run Dev Server:**
```powershell
npm run dev
```

**4. Access from Phone:**
- Open browser (Chrome/Safari)
- Go to: `https://192.168.1.100:5173`
- Accept SSL warning (self-signed certificate)
- Grant camera permissions
- Test RING BELL functionality

**Troubleshooting:**
- Ensure phone and computer are on same WiFi network
- Check firewall allows incoming connections on port 5173
- Try disabling Windows Firewall temporarily:
  ```powershell
  Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
  ```

---

### Option 2: Production Build & Deploy

**1. Build for Production:**
```powershell
npm run build
```

**2. Test Production Build Locally:**
```powershell
npm run preview
```

**3. Deploy to Vercel (Recommended):**

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: door-camera
# - Directory: ./
# - Build command: npm run build
# - Output directory: dist
```

**Configure Vercel:**
- Add environment variable: `VITE_API_URL` (your backend URL)
- Enable HTTPS (automatic)
- Set custom domain (optional)

**4. Deploy to Netlify:**

```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Build directory: dist
```

**5. Deploy to Your Own Server:**

```powershell
# Build
npm run build

# Copy dist/ folder to server
# Serve with nginx/apache
```

**Nginx Config Example:**
```nginx
server {
    listen 443 ssl;
    server_name door-camera.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/door-camera/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

### Option 3: Kiosk Mode (Tablet Mount)

**For Android Tablet:**

1. Install Chrome browser
2. Go to Settings → Apps → Chrome
3. Enable "Open in fullscreen"
4. Add to home screen:
   - Open your deployed app
   - Menu → Add to Home Screen
5. Launch from home screen → runs in fullscreen

**For iPad:**

1. Open Safari
2. Navigate to your app
3. Tap Share → Add to Home Screen
4. Launch app → fullscreen mode
5. Enable Guided Access:
   - Settings → Accessibility → Guided Access
   - Lock to single app

---

## 🔍 Debugging Tips

### Camera Not Working

**Check Browser Support:**
```javascript
// In console
console.log('getUserMedia supported:', 
  navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
```

**Check Permissions:**
- Chrome: `chrome://settings/content/camera`
- Edge: `edge://settings/content/camera`

**Force HTTPS:**
- Camera API only works in secure contexts
- Use `https://` or `localhost`

### Tailwind Styles Not Loading

```powershell
# Clear cache and rebuild
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

### TypeScript Errors

```powershell
# Check TypeScript installation
npm list typescript

# Reinstall if missing
npm install -D typescript
```

---

## 🎯 Performance Optimization

### 1. Image Compression

Already configured in `src/lib/config.ts`:
```typescript
export const COMPRESSION_CONFIG = {
  quality: 0.8,        // Adjust 0.1-1.0
  maxWidth: 1920,      // Lower for faster upload
  maxHeight: 1080,
  mimeType: 'image/jpeg',
};
```

### 2. Polling Interval

Adjust in `src/lib/config.ts`:
```typescript
export const API_CONFIG = {
  pollInterval: 3000, // Increase to reduce server load
};
```

### 3. Camera Resolution

Lower resolution for faster capture:
```typescript
export const CAMERA_CONFIG = {
  width: { ideal: 1280 },  // Lower from 1920
  height: { ideal: 720 },  // Lower from 1080
};
```

---

## ✅ Checklist Before Production

- [ ] Backend API is deployed and accessible
- [ ] `.env` points to production backend URL
- [ ] HTTPS is enabled (required for camera)
- [ ] Tested on target device (phone/tablet)
- [ ] Camera permissions granted
- [ ] Fullscreen/kiosk mode configured
- [ ] Auto-restart on crash (PM2/systemd)
- [ ] Network monitoring enabled
- [ ] Error logging configured

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Camera not starting | Enable HTTPS, check permissions |
| Black screen | Verify `facingMode` is correct |
| Capture fails | Check browser console for errors |
| Polling stops | Check network connectivity |
| Styles broken | Verify Tailwind import in `index.css` |
| TypeScript errors | Run `npm install -D typescript` |

---

## 📞 Support

For issues:
1. Check browser console (F12)
2. Check network tab for API errors
3. Verify backend is running
4. Test mock server first
5. Check README troubleshooting section

**Happy Deploying! 🚀**
