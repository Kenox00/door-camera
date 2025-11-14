# WebSocket + REST Integration Guide

## 📋 Overview

This document explains the complete WebSocket and REST API integration for the ESP32-CAM Door Camera system. The system consists of three main components:

1. **Camera App** (React + Vite) - ESP32-CAM interface
2. **Backend Server** - Node.js/Express with Socket.io
3. **Admin Dashboard** - Real-time monitoring interface

---

## 🏗️ Architecture

```
┌─────────────────┐        WebSocket + REST       ┌─────────────────┐
│   Camera App    │◄──────────────────────────────►│  Backend Server │
│   (ESP32-CAM)   │                                │   (Node.js)     │
└─────────────────┘                                └────────┬────────┘
                                                            │
                                                    WebSocket Events
                                                            │
                                                            ▼
                                                   ┌─────────────────┐
                                                   │ Admin Dashboard │
                                                   │   (React App)   │
                                                   └─────────────────┘
```

---

## 📁 File Structure

```
src/
├── hooks/
│   ├── useWebSocket.ts          ✅ NEW - WebSocket client hook
│   ├── useCamera.ts              (existing)
│   └── useCapture.ts             (existing)
├── lib/
│   ├── websocketEvents.ts       ✅ NEW - Event schema & types
│   ├── apiService.ts            ✅ NEW - REST API utilities
│   ├── api.ts                    (existing)
│   ├── config.ts                 (existing)
│   └── utils.ts                  (existing)
├── store/
│   └── sessionStore.ts          ✅ UPDATED - Added device info & WebSocket state
├── components/
│   ├── CameraView.tsx           ✅ UPDATED - Added WebSocket events & REST calls
│   └── RingButton.tsx           ✅ UPDATED - Emits bell-pressed event
├── pages/
│   ├── AdminDashboard.tsx       ✅ NEW - Admin monitoring interface
│   ├── Home.tsx                  (existing)
│   ├── Waiting.tsx               (existing)
│   ├── Approved.tsx              (existing)
│   └── Denied.tsx                (existing)
└── App.jsx                      ✅ UPDATED - Global WebSocket init + indicator
```

---

## 🔌 WebSocket Events

### Events Emitted by Camera App

| Event | Payload | Description |
|-------|---------|-------------|
| `camera-online` | `CameraOnlinePayload` | Emitted when camera connects to backend |
| `motion-detected` | `MotionDetectedPayload` | Sent when motion is detected with snapshot |
| `bell-pressed` | `BellPressedPayload` | Triggered when doorbell button is pressed |
| `snapshot` | `SnapshotPayload` | Sent when snapshot is captured |

### Events Received by Camera App

| Event | Payload | Description |
|-------|---------|-------------|
| `backend-command` | `BackendCommandPayload` | Commands from backend (start/stop recording, etc.) |
| `admin-action` | `AdminActionPayload` | Actions from admin (approve/deny, request snapshot) |

### Event Flow Diagram

```
Camera App                Backend                Admin Dashboard
    │                        │                           │
    ├─ camera-online ───────►│                           │
    │                        ├─ relay ─────────────────►│
    │                        │                           │
    ├─ motion-detected ─────►│                           │
    │                        ├─ relay ─────────────────►│
    │                        │                           │
    ├─ bell-pressed ────────►│                           │
    │                        ├─ relay ─────────────────►│
    │                        │                           │
    │◄── backend-command ────┤                           │
    │                        │◄── admin-action ──────────┤
    │                        │                           │
```

---

## 🌐 REST API Endpoints

### Camera App → Backend

| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| `POST` | `/api/devices/snapshot` | Upload snapshot | `SnapshotData` |
| `GET` | `/api/devices/status/:id` | Get device status | - |
| `PUT` | `/api/devices/command` | Send command to device | `CommandData` |
| `POST` | `/api/devices/register` | Register new device | Device info |
| `POST` | `/api/devices/motion` | Notify motion detection | Motion data |
| `GET` | `/api/devices/history/:id` | Get device history | - |

### Example REST Calls

```typescript
// Upload snapshot
await postSnapshot({
  deviceId: 'camera-001',
  image: 'data:image/jpeg;base64,...',
  timestamp: Date.now(),
  quality: 80,
});

// Get device status
const status = await getDeviceStatus('camera-001');

// Send command
await sendCommand({
  command: 'start-recording',
  deviceId: 'camera-001',
  parameters: { duration: 60 },
});
```

---

## 🔐 Authentication

### JWT Token in WebSocket Handshake

```typescript
const socket = io(wsUrl, {
  auth: {
    token: jwt, // JWT token from store
  },
});
```

### JWT in REST API Headers

```typescript
api.interceptors.request.use((config) => {
  const { jwt } = useSessionStore.getState();
  config.headers.Authorization = `Bearer ${jwt}`;
  return config;
});
```

---

## 🎯 Implementation Guide

### Step 1: Install Dependencies

```bash
npm install socket.io-client axios axios-retry
```

### Step 2: Configure Environment Variables

Create `.env` file (copy from `.env.example`):

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
VITE_DEVICE_ID=camera-001
```

### Step 3: Initialize WebSocket in App.jsx

The WebSocket is initialized globally in `App.jsx`:

```jsx
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  const { isConnected, reconnecting } = useWebSocket({
    autoConnect: true,
    reconnectionAttempts: 5,
  });
  
  // ... rest of app
}
```

### Step 4: Use WebSocket in Components

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';
import { EVENTS } from '@/lib/websocketEvents';

const MyComponent = () => {
  const { emitEvent, isConnected } = useWebSocket();
  
  const handleEvent = () => {
    emitEvent(EVENTS.MOTION_DETECTED, {
      deviceId: 'camera-001',
      timestamp: Date.now(),
    });
  };
};
```

### Step 5: Make REST API Calls

```typescript
import { postSnapshot, getDeviceStatus } from '@/lib/apiService';

const handleCapture = async () => {
  const snapshot = captureSnapshot();
  await postSnapshot({
    deviceId: 'camera-001',
    image: snapshot,
    timestamp: Date.now(),
  });
};
```

---

## 🎨 Admin Dashboard Integration

### Subscribing to Events

```typescript
import { useWebSocket } from '../hooks/useWebSocket';
import { EVENTS } from '../lib/websocketEvents';

const AdminDashboard = () => {
  const { socket } = useWebSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    socket.on(EVENTS.MOTION_DETECTED, (data) => {
      // Show motion alert in UI
      showMotionAlert(data);
    });
    
    socket.on(EVENTS.BELL_PRESSED, (data) => {
      // Show doorbell notification
      showDoorbellNotification(data);
    });
    
    return () => {
      socket.off(EVENTS.MOTION_DETECTED);
      socket.off(EVENTS.BELL_PRESSED);
    };
  }, [socket]);
};
```

### UI Updates on Events

| Event | UI Action |
|-------|-----------|
| `camera-online` | Show device online indicator (green dot) |
| `motion-detected` | Trigger live feed modal, play alert sound |
| `bell-pressed` | Show doorbell notification, initiate video call |
| `snapshot` | Display snapshot thumbnail in timeline |

---

## 🔄 State Management

### Device Info in Store

```typescript
const { deviceInfo, updateDeviceInfo } = useSessionStore();

// Update device state
updateDeviceInfo({
  online: true,
  motion: true,
  bell: false,
  recording: true,
});

// Access device state
console.log(deviceInfo.online);   // true
console.log(deviceInfo.motion);   // true
```

### Connection Status

```typescript
const { connectionStatus } = useSessionStore();

// 'online' | 'offline'
```

---

## 🚀 Running the System

### 1. Start Backend Server

```bash
cd backend
npm install
npm start
```

### 2. Start Camera App

```bash
npm install
npm run dev
```

### 3. Start Admin Dashboard

```bash
# If separate app
cd admin-dashboard
npm install
npm run dev
```

---

## 🔧 Troubleshooting

### WebSocket Not Connecting

1. Check backend server is running
2. Verify `VITE_WS_URL` in `.env`
3. Check JWT token is valid
4. Check browser console for errors

### REST API Failing

1. Verify `VITE_API_URL` in `.env`
2. Check CORS settings on backend
3. Verify JWT token in headers
4. Check network tab in browser dev tools

### Events Not Receiving

1. Ensure WebSocket is connected
2. Check event names match exactly
3. Verify backend is relaying events
4. Check socket listeners are registered

---

## 📊 Communication Flow Summary

### Camera App → Backend → Dashboard

1. **Camera connects**: Emits `camera-online` → Backend relays to dashboard
2. **Motion detected**: 
   - Camera captures snapshot
   - POST to `/api/devices/motion` (REST)
   - Emits `motion-detected` (WebSocket)
   - Backend relays to dashboard
3. **Bell pressed**: Emits `bell-pressed` → Backend relays to dashboard
4. **Admin requests snapshot**: 
   - Dashboard emits `admin-action`
   - Backend relays to camera
   - Camera captures and uploads
   - Emits `snapshot` back to dashboard

---

## 🎯 Best Practices

1. **Error Handling**: Always wrap WebSocket emits in try-catch
2. **Reconnection**: Let socket.io handle auto-reconnect (configured in hook)
3. **Event Schema**: Always use constants from `websocketEvents.ts`
4. **JWT Management**: Store JWT in Zustand with persistence
5. **Retry Logic**: Use axios-retry for REST calls (configured in apiService)
6. **State Updates**: Update store immediately on events for responsive UI
7. **Cleanup**: Always remove socket listeners in useEffect cleanup

---

## 📝 Next Steps

1. Implement authentication flow (login/JWT generation)
2. Add backend relay logic for WebSocket events
3. Implement motion detection algorithm
4. Add video streaming support
5. Implement notification system
6. Add recording functionality
7. Create admin user management

---

## 🔗 Related Files

- [`/hooks/useWebSocket.ts`](src/hooks/useWebSocket.ts) - WebSocket hook
- [`/lib/apiService.ts`](src/lib/apiService.ts) - REST API service
- [`/lib/websocketEvents.ts`](src/lib/websocketEvents.ts) - Event types
- [`/store/sessionStore.ts`](src/store/sessionStore.ts) - State management
- [`/components/CameraView.tsx`](src/components/CameraView.tsx) - Camera component
- [`/pages/AdminDashboard.tsx`](src/pages/AdminDashboard.tsx) - Admin UI

---

**Last Updated**: November 14, 2025
