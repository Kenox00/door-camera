# 🚀 Quick Start Guide - WebSocket + REST Integration

## ⚡ Get Started in 5 Minutes

### 1️⃣ Install Dependencies

```bash
npm install
```

**New packages installed:**
- `socket.io-client` - WebSocket client
- `axios-retry` - Automatic REST retry logic

### 2️⃣ Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
VITE_DEVICE_ID=camera-001
```

### 3️⃣ Start the App

```bash
npm run dev
```

The app will start with:
- ✅ WebSocket connection to backend
- ✅ Connection status indicator (top-right)
- ✅ Real-time event emitting
- ✅ REST API ready

---

## 📋 What's New

### New Files Created

| File | Purpose |
|------|---------|
| `src/hooks/useWebSocket.ts` | WebSocket client hook with auto-reconnect |
| `src/lib/websocketEvents.ts` | Event schema & TypeScript types |
| `src/lib/apiService.ts` | REST API service with retry logic |
| `src/pages/AdminDashboard.tsx` | Admin monitoring interface |

### Updated Files

| File | Changes |
|------|---------|
| `src/store/sessionStore.ts` | Added device info & WebSocket state |
| `src/components/CameraView.tsx` | WebSocket events + REST calls |
| `src/components/RingButton.tsx` | Emits bell-pressed event |
| `src/App.jsx` | Global WebSocket init + connection indicator |

---

## 🎯 How It Works

### WebSocket Events (Real-time)

**Camera App Emits:**
- `camera-online` - When app connects
- `motion-detected` - When motion is detected
- `bell-pressed` - When doorbell is pressed
- `snapshot` - When snapshot is captured

**Camera App Receives:**
- `backend-command` - Commands from backend
- `admin-action` - Actions from admin dashboard

### REST API Calls

**Endpoints Used:**
- `POST /api/devices/snapshot` - Upload snapshots
- `GET /api/devices/status/:id` - Get device status
- `POST /api/devices/motion` - Notify motion
- `PUT /api/devices/command` - Send commands

---

## 🔧 Testing Without Backend

### Mock Server (Optional)

If you don't have a backend yet, you can test with a mock server:

```bash
# In a separate terminal
npm run mock-server
```

This will start a mock Socket.io server on `http://localhost:3001`.

### Test WebSocket Connection

1. Start the app: `npm run dev`
2. Check top-right corner for connection indicator
3. Open browser console
4. You should see: `✅ WebSocket connected`

### Test Events

**Test Motion Detection:**
- Uncomment the test interval in `CameraView.tsx` (line ~233)
- Motion events will emit every 30 seconds
- Check console for: `📤 Event emitted: motion-detected`

**Test Doorbell:**
- Click the "RING BELL" button
- Check console for: `🔔 Bell press event emitted via WebSocket`

---

## 📱 Using the Components

### CameraView Component

```tsx
import { CameraView } from '@/components/CameraView';
import { useRef } from 'react';

function MyPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  return <CameraView videoRef={videoRef} />;
}
```

**Features:**
- ✅ Automatic device status fetch on mount
- ✅ Snapshot capture and upload
- ✅ Motion detection with WebSocket + REST
- ✅ Admin snapshot request handling

### RingButton Component

```tsx
import { RingButton } from '@/components/RingButton';

function MyPage() {
  const handleRing = async () => {
    console.log('Doorbell pressed!');
    // Your custom logic
  };
  
  return <RingButton onRing={handleRing} />;
}
```

**Features:**
- ✅ Emits `bell-pressed` WebSocket event
- ✅ Updates device state
- ✅ Visual feedback with animations

---

## 🎨 Admin Dashboard

Navigate to `/admin` (or create route in `App.jsx`):

```tsx
import { AdminDashboard } from './pages/AdminDashboard';

<Route path="/admin" element={<AdminDashboard />} />
```

**Dashboard Features:**
- 📹 Real-time device monitoring
- 🚨 Motion alerts
- 🔔 Doorbell notifications
- 📸 Snapshot viewing
- 🎛️ Device control (start/stop recording, request snapshot)

---

## 🔍 Debugging

### Check WebSocket Connection

Open browser console and look for:

```
🔌 Initializing WebSocket connection...
✅ WebSocket connected to: http://localhost:3001
📤 Event emitted: camera-online
```

### Check REST API Calls

Open Network tab in DevTools and look for:

```
POST http://localhost:3001/api/devices/snapshot
GET http://localhost:3001/api/devices/status/camera-001
```

### Common Issues

**WebSocket not connecting:**
- ✅ Check backend is running
- ✅ Verify `VITE_WS_URL` in `.env`
- ✅ Check CORS settings on backend

**REST API failing:**
- ✅ Verify `VITE_API_URL` in `.env`
- ✅ Check backend server is running
- ✅ Verify JWT token (if required)

---

## 📚 Documentation

For detailed information, see:

- **[WEBSOCKET_REST_INTEGRATION.md](WEBSOCKET_REST_INTEGRATION.md)** - Complete integration guide
- **[SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)** - System architecture & communication flow
- **[API.md](API.md)** - API reference (if exists)

---

## 🎓 Code Examples

### Emit WebSocket Event

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';
import { EVENTS } from '@/lib/websocketEvents';

const MyComponent = () => {
  const { emitEvent } = useWebSocket();
  
  const sendEvent = () => {
    emitEvent(EVENTS.MOTION_DETECTED, {
      deviceId: 'camera-001',
      timestamp: Date.now(),
      confidence: 0.85,
    });
  };
};
```

### Make REST API Call

```typescript
import { postSnapshot } from '@/lib/apiService';

const uploadSnapshot = async () => {
  try {
    const result = await postSnapshot({
      deviceId: 'camera-001',
      image: 'data:image/jpeg;base64,...',
      timestamp: Date.now(),
      quality: 80,
    });
    console.log('Snapshot uploaded:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Access Device State

```typescript
import { useSessionStore } from '@/store/sessionStore';

const MyComponent = () => {
  const { deviceInfo, updateDeviceInfo } = useSessionStore();
  
  // Read state
  console.log(deviceInfo.online);    // true/false
  console.log(deviceInfo.motion);    // true/false
  
  // Update state
  updateDeviceInfo({ motion: true });
};
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] App starts without errors
- [ ] Connection indicator shows in top-right
- [ ] WebSocket connects (green indicator)
- [ ] Console shows: `✅ WebSocket connected`
- [ ] No errors in browser console
- [ ] Camera view loads correctly
- [ ] Ring button is clickable

---

## 🚀 Next Steps

1. **Set up backend server**
   - Implement Socket.io event relay
   - Create REST API endpoints
   - Add JWT authentication

2. **Test with real backend**
   - Update `.env` with backend URL
   - Test all WebSocket events
   - Verify REST endpoints

3. **Deploy to production**
   - Build: `npm run build`
   - Deploy to hosting (Vercel/Netlify)
   - Configure production environment variables

---

## 💡 Tips

- **Development**: Use `npm run dev` for hot-reload
- **Production**: Use `npm run build` then `npm run preview`
- **Debugging**: Enable verbose logging in `useWebSocket.ts`
- **Testing**: Use browser DevTools Network & Console tabs

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Review `WEBSOCKET_REST_INTEGRATION.md` for detailed info
3. Verify environment variables in `.env`
4. Check backend server is running and accessible

---

**Ready to Go!** 🎉

Your Camera App is now fully integrated with WebSocket + REST communication!

---

**Last Updated**: November 14, 2025
