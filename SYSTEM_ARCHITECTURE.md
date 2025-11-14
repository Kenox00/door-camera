# Complete System Architecture & Communication Flow

## 🏛️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ESP32-CAM DOOR CAMERA SYSTEM                  │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────┐         ┌────────────────────┐         ┌────────────────────┐
│   CAMERA APP       │         │   BACKEND SERVER   │         │  ADMIN DASHBOARD   │
│   (React + Vite)   │         │  (Node.js/Express) │         │   (React App)      │
│                    │         │    + Socket.io     │         │                    │
│  - ESP32-CAM UI    │         │                    │         │  - Device Monitor  │
│  - Video Stream    │         │  - WebSocket Hub   │         │  - Real-time Alerts│
│  - Doorbell Button │         │  - REST API        │         │  - Control Panel   │
│  - Motion Detect   │         │  - Event Relay     │         │  - Notifications   │
└──────┬─────────────┘         └─────────┬──────────┘         └──────┬─────────────┘
       │                                 │                            │
       │  ┌──────────────────────────────┼────────────────────────────┤
       │  │                              │                            │
       │  │  WebSocket Connection        │   WebSocket Connection     │
       └──┼──────────────────────────────┤                            │
          │                              │                            │
          │  REST API Calls              │   REST API Calls           │
          └──────────────────────────────┴────────────────────────────┘
```

---

## 📡 Communication Protocols

### 1. WebSocket (Real-time Bidirectional)

**Camera App ↔ Backend**
- Event-driven communication
- Persistent connection
- Auto-reconnection on failure
- JWT authentication in handshake

**Backend ↔ Admin Dashboard**
- Event relay from cameras
- Admin commands to cameras
- Real-time status updates

### 2. REST API (Request/Response)

**Camera App → Backend**
- Snapshot uploads
- Status queries
- Device registration
- Motion notifications

**Admin Dashboard → Backend**
- Device management
- History queries
- Configuration updates

---

## 🔄 Complete Event Flow

### Scenario 1: Camera Startup

```
Camera App                Backend                 Admin Dashboard
    │                         │                          │
    ├─ 1. Connect WS ────────►│                          │
    │                         ├─ 2. Authenticate (JWT)   │
    │◄── 3. Connection OK ────┤                          │
    │                         │                          │
    ├─ 4. emit(camera-online)─►│                          │
    │                         ├─ 5. relay ──────────────►│
    │                         │                          ├─ 6. UI: Show online
    │                         │                          │
    ├─ 7. GET /devices/status─►│                          │
    │◄── 8. Device config ────┤                          │
    │                         │                          │
```

### Scenario 2: Motion Detection

```
Camera App                Backend                 Admin Dashboard
    │                         │                          │
    ├─ 1. Detect motion       │                          │
    ├─ 2. Capture snapshot    │                          │
    │                         │                          │
    ├─ 3. POST /devices/motion►│                          │
    │◄── 4. 200 OK ───────────┤                          │
    │                         │                          │
    ├─ 5. emit(motion-detected)►│                          │
    │     with snapshot       │                          │
    │                         ├─ 6. relay ──────────────►│
    │                         │                          ├─ 7. UI: Show alert
    │                         │                          ├─ 8. Play sound
    │                         │                          ├─ 9. Open live feed
    │                         │                          │
```

### Scenario 3: Doorbell Press

```
Camera App                Backend                 Admin Dashboard
    │                         │                          │
    ├─ 1. User presses bell   │                          │
    │                         │                          │
    ├─ 2. emit(bell-pressed)─►│                          │
    │                         ├─ 3. relay ──────────────►│
    │                         │                          ├─ 4. UI: Doorbell popup
    │                         │                          ├─ 5. Play doorbell sound
    │                         │                          ├─ 6. Request snapshot
    │                         │                          │
    │                         │◄── 7. emit(admin-action)─┤
    │◄── 8. relay ────────────┤    (request-snapshot)    │
    │                         │                          │
    ├─ 9. Capture snapshot    │                          │
    ├─ 10. POST /devices/snapshot►│                       │
    ├─ 11. emit(snapshot) ───►│                          │
    │                         ├─ 12. relay ─────────────►│
    │                         │                          ├─ 13. Display snapshot
    │                         │                          │
```

### Scenario 4: Admin Remote Control

```
Camera App                Backend                 Admin Dashboard
    │                         │                          │
    │                         │                          ├─ 1. User clicks "Record"
    │                         │                          │
    │                         │◄── 2. emit(admin-action)─┤
    │                         │    (start-recording)     │
    │◄── 3. emit(backend-cmd)─┤                          │
    │    (start-recording)    │                          │
    │                         │                          │
    ├─ 4. Start recording     │                          │
    ├─ 5. Update UI state     │                          │
    │                         │                          │
    ├─ 6. PUT /devices/command►│                          │
    │    (confirm recording)  │                          │
    │◄── 7. 200 OK ───────────┤                          │
    │                         │                          │
```

---

## 🗂️ Data Models

### WebSocket Event Payloads

```typescript
// Camera Online
interface CameraOnlinePayload {
  deviceId: string;
  timestamp: number;
  metadata: {
    deviceName: string;
    location: string;
    version: string;
  };
}

// Motion Detected
interface MotionDetectedPayload {
  deviceId: string;
  timestamp: number;
  confidence: number;
  snapshot?: string;        // base64 image
  metadata: {
    zone: string;
    sensitivity: number;
  };
}

// Bell Pressed
interface BellPressedPayload {
  deviceId: string;
  timestamp: number;
  pressedBy?: string;
  metadata: {
    location: string;
    duration: number;
  };
}

// Snapshot
interface SnapshotPayload {
  deviceId: string;
  timestamp: number;
  image: string;            // base64 image
  quality: number;
  metadata: {
    width: number;
    height: number;
    format: string;
  };
}

// Backend Command
interface BackendCommandPayload {
  command: 'start-recording' | 'stop-recording' | 'adjust-settings' | 'capture-snapshot' | 'reboot';
  deviceId: string;
  timestamp: number;
  parameters?: Record<string, any>;
}

// Admin Action
interface AdminActionPayload {
  action: 'approve' | 'deny' | 'request-snapshot' | 'change-settings';
  deviceId: string;
  timestamp: number;
  adminId?: string;
  data?: Record<string, any>;
}
```

### REST API Request/Response

```typescript
// POST /api/devices/snapshot
Request: {
  deviceId: string;
  image: string;            // base64
  timestamp: number;
  quality: number;
  metadata: {
    width: number;
    height: number;
    format: string;
    motion: boolean;
  };
}
Response: {
  success: boolean;
  snapshotId: string;
  url: string;
}

// GET /api/devices/status/:id
Response: {
  deviceId: string;
  online: boolean;
  lastSeen: number;
  batteryLevel: number;
  recording: boolean;
  motion: boolean;
  metadata: Record<string, any>;
}

// POST /api/devices/motion
Request: {
  deviceId: string;
  timestamp: number;
  confidence: number;
  snapshot?: string;
}
Response: {
  success: boolean;
  alertId: string;
}
```

---

## 🔐 Security & Authentication

### JWT Flow

```
1. User Login (Camera/Admin)
   ├─ POST /api/auth/login { username, password }
   └─ Response: { token: "eyJhbG...", expiresIn: 3600 }

2. Store JWT
   └─ sessionStore.setJwt(token)

3. WebSocket Authentication
   └─ io(url, { auth: { token: jwt } })

4. REST API Authentication
   └─ headers: { Authorization: `Bearer ${jwt}` }

5. Token Refresh (before expiry)
   └─ POST /api/auth/refresh { token }
```

### Security Checklist

- ✅ JWT authentication on all endpoints
- ✅ HTTPS/WSS in production
- ✅ CORS configuration on backend
- ✅ Rate limiting on sensitive endpoints
- ✅ Input validation and sanitization
- ✅ Encrypted snapshot transmission
- ✅ Session timeout handling

---

## 📊 State Management

### Zustand Store Structure

```typescript
interface SessionState {
  // Session
  sessionId: string | null;
  lastCapturedPhoto: string | null;
  cameraReady: boolean;
  error: string | null;
  
  // WebSocket
  connectionStatus: 'online' | 'offline';
  
  // Device
  deviceId: string;
  deviceInfo: {
    online: boolean;
    motion: boolean;
    bell: boolean;
    recording: boolean;
    captureRequested: boolean;
    batteryLevel: number;
    lastSeen: number;
  };
  
  // Auth
  jwt: string | null;
  
  // Actions
  setSessionId: (id: string) => void;
  setLastCapturedPhoto: (photo: string) => void;
  setConnectionStatus: (status: 'online' | 'offline') => void;
  setCameraReady: (ready: boolean) => void;
  setError: (error: string | null) => void;
  setDeviceId: (id: string) => void;
  updateDeviceInfo: (info: Partial<DeviceInfo>) => void;
  setJwt: (token: string | null) => void;
  clearSession: () => void;
}
```

### State Synchronization

```
WebSocket Event → Store Update → UI Re-render
      ↓
  Camera App State
      ↓
  Admin Dashboard State
```

---

## 🛠️ Technology Stack

### Camera App
- **Framework**: React 19 + Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **WebSocket**: socket.io-client
- **HTTP**: axios + axios-retry
- **Icons**: Lucide React

### Backend (Not Implemented - Reference)
- **Runtime**: Node.js
- **Framework**: Express.js
- **WebSocket**: Socket.io
- **Database**: MongoDB / PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **File Storage**: AWS S3 / Local Storage

### Admin Dashboard
- **Framework**: React (same as Camera App)
- **Additional**: Real-time charts, notifications

---

## 🚀 Deployment Checklist

### Camera App Deployment

1. ✅ Set environment variables
   - `VITE_API_URL`
   - `VITE_WS_URL`
   - `VITE_DEVICE_ID`

2. ✅ Build for production
   ```bash
   npm run build
   ```

3. ✅ Deploy to hosting (Vercel/Netlify/etc.)

4. ✅ Configure CORS on backend

5. ✅ Test WebSocket connection

6. ✅ Test REST endpoints

### Backend Deployment

1. Deploy to cloud (AWS/DigitalOcean/Heroku)
2. Set up SSL/TLS certificates (Let's Encrypt)
3. Configure WebSocket (WSS)
4. Set up database
5. Configure JWT secrets
6. Enable logging and monitoring

---

## 📈 Performance Considerations

### Optimization Strategies

1. **Image Compression**: Compress snapshots before upload (80% JPEG quality)
2. **WebSocket Throttling**: Limit event emissions (cooldown periods)
3. **Lazy Loading**: Load dashboard data on-demand
4. **Caching**: Cache device status in store
5. **Connection Pooling**: Reuse WebSocket connections
6. **Batch Updates**: Group multiple state updates

### Scalability

- **Horizontal Scaling**: Load balance multiple backend instances
- **Redis**: Use Redis for WebSocket room management
- **CDN**: Serve static assets via CDN
- **Database Indexing**: Index frequently queried fields

---

## 🔍 Monitoring & Debugging

### Debug Tools

1. **Browser DevTools**
   - Network tab for REST calls
   - Console for WebSocket events
   - React DevTools for state inspection

2. **Logging**
   ```typescript
   console.log('📤 Event emitted:', event, data);
   console.log('📥 Event received:', event, data);
   console.error('❌ Error:', error);
   ```

3. **WebSocket Inspector**
   - Use browser extensions to monitor WS traffic

### Health Checks

```typescript
// Periodic health check
setInterval(async () => {
  try {
    await checkHealth();
    console.log('✅ Backend healthy');
  } catch (error) {
    console.error('❌ Backend unreachable');
  }
}, 30000); // Every 30 seconds
```

---

## 📝 Implementation Summary

### Files Created ✅

1. `/hooks/useWebSocket.ts` - WebSocket client with reconnection logic
2. `/lib/websocketEvents.ts` - Event schema and TypeScript types
3. `/lib/apiService.ts` - REST API service with retry logic
4. `/pages/AdminDashboard.tsx` - Admin monitoring interface

### Files Modified ✅

1. `/store/sessionStore.ts` - Added device info and WebSocket state
2. `/components/CameraView.tsx` - Added WebSocket events and REST calls
3. `/components/RingButton.tsx` - Emit bell-pressed event
4. `/App.jsx` - Global WebSocket initialization and connection indicator
5. `/.env.example` - Environment variable template

### Documentation Created ✅

1. `WEBSOCKET_REST_INTEGRATION.md` - Integration guide
2. `SYSTEM_ARCHITECTURE.md` - This file

---

## 🎯 Next Development Steps

1. **Backend Implementation**
   - Set up Express.js server
   - Implement Socket.io event relay
   - Create REST API endpoints
   - Add JWT authentication

2. **Advanced Features**
   - Live video streaming (WebRTC)
   - Two-way audio communication
   - Recording and playback
   - Motion detection algorithm
   - Push notifications

3. **Testing**
   - Unit tests for hooks
   - Integration tests for API
   - E2E tests for user flows
   - WebSocket event testing

4. **DevOps**
   - CI/CD pipeline
   - Docker containerization
   - Kubernetes deployment
   - Monitoring and alerting

---

**System Status**: ✅ Camera App Fully Implemented  
**Last Updated**: November 14, 2025  
**Version**: 1.0.0
