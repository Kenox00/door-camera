# 📚 WebSocket + REST Integration - Documentation Index

## 🎯 Complete Implementation Guide for ESP32-CAM Door Camera System

This directory contains the **complete implementation** of WebSocket and REST API integration for your Camera App, Backend Server, and Admin Dashboard.

---

## 📖 Documentation Structure

### 1️⃣ Quick Start (Start Here!)

**File**: [`QUICKSTART_WEBSOCKET.md`](QUICKSTART_WEBSOCKET.md)

Get up and running in 5 minutes:
- Installation instructions
- Environment setup
- Testing guide
- Basic usage examples

**Start here if**: You want to see the system working immediately.

---

### 2️⃣ Integration Guide (Technical Details)

**File**: [`WEBSOCKET_REST_INTEGRATION.md`](WEBSOCKET_REST_INTEGRATION.md)

Complete technical integration guide:
- WebSocket event schemas
- REST API endpoints
- Authentication flow
- Step-by-step implementation
- Troubleshooting

**Read this if**: You need to understand how everything connects.

---

### 3️⃣ System Architecture (Big Picture)

**File**: [`SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md)

High-level system design:
- Architecture overview
- Complete event flows
- Data models
- Security considerations
- Deployment guide
- Performance optimization

**Read this if**: You want to understand the overall system design.

---

### 4️⃣ Visual Diagrams (Visual Learners)

**File**: [`DIAGRAMS.md`](DIAGRAMS.md)

ASCII art diagrams:
- Architecture diagrams
- Event flow charts
- Component structure
- State management flows
- Request/response patterns

**Read this if**: You prefer visual explanations.

---

### 5️⃣ Implementation Summary

**File**: [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md)

What was built:
- Files created
- Files modified
- Features implemented
- Code statistics
- Testing checklist

**Read this if**: You want to see what was delivered.

---

## 🗂️ Implementation Files

### Core Implementation

```
src/
├── hooks/
│   └── useWebSocket.ts          ⭐ NEW - WebSocket client hook
│
├── lib/
│   ├── websocketEvents.ts       ⭐ NEW - Event schema
│   └── apiService.ts            ⭐ NEW - REST API service
│
├── store/
│   └── sessionStore.ts          ✏️ UPDATED - Device info & state
│
├── components/
│   ├── CameraView.tsx           ✏️ UPDATED - WebSocket events
│   └── RingButton.tsx           ✏️ UPDATED - Bell event
│
├── pages/
│   └── AdminDashboard.tsx       ⭐ NEW - Monitoring interface
│
└── App.jsx                      ✏️ UPDATED - Global WebSocket
```

---

## 🎓 Learning Path

### For Beginners

1. Start with [`QUICKSTART_WEBSOCKET.md`](QUICKSTART_WEBSOCKET.md)
2. Run the app and test basic features
3. Read [`DIAGRAMS.md`](DIAGRAMS.md) for visual understanding
4. Review code in `src/hooks/useWebSocket.ts`
5. Read [`WEBSOCKET_REST_INTEGRATION.md`](WEBSOCKET_REST_INTEGRATION.md)

### For Experienced Developers

1. Read [`SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md) first
2. Review [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md)
3. Dive into code implementation
4. Reference [`WEBSOCKET_REST_INTEGRATION.md`](WEBSOCKET_REST_INTEGRATION.md) as needed
5. Use [`DIAGRAMS.md`](DIAGRAMS.md) as visual reference

### For Backend Developers

1. Read [`WEBSOCKET_REST_INTEGRATION.md`](WEBSOCKET_REST_INTEGRATION.md)
2. Focus on event schemas in `src/lib/websocketEvents.ts`
3. Review REST API endpoints in `src/lib/apiService.ts`
4. Check authentication flow in [`SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md)
5. Implement backend to match the specs

---

## 🔍 Quick Reference

### WebSocket Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `camera-online` | Camera → Backend | Device connected |
| `motion-detected` | Camera → Backend | Motion alert |
| `bell-pressed` | Camera → Backend | Doorbell pressed |
| `snapshot` | Camera → Backend | Image captured |
| `backend-command` | Backend → Camera | Execute command |
| `admin-action` | Backend → Camera | Admin action |

See [`websocketEvents.ts`](src/lib/websocketEvents.ts) for full schema.

### REST API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/devices/snapshot` | Upload snapshot |
| GET | `/api/devices/status/:id` | Get device status |
| PUT | `/api/devices/command` | Send command |
| POST | `/api/devices/motion` | Notify motion |

See [`apiService.ts`](src/lib/apiService.ts) for implementation.

### Key Files to Understand

1. **`src/hooks/useWebSocket.ts`** - WebSocket client logic
2. **`src/lib/websocketEvents.ts`** - Event definitions
3. **`src/lib/apiService.ts`** - REST API methods
4. **`src/store/sessionStore.ts`** - State management
5. **`src/components/CameraView.tsx`** - Main camera component

---

## 🎯 Use Cases

### Scenario 1: I want to emit a WebSocket event

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';
import { EVENTS } from '@/lib/websocketEvents';

const { emitEvent } = useWebSocket();

emitEvent(EVENTS.MOTION_DETECTED, {
  deviceId: 'camera-001',
  timestamp: Date.now(),
  confidence: 0.85,
});
```

**Documentation**: [`WEBSOCKET_REST_INTEGRATION.md#emitting-events`](WEBSOCKET_REST_INTEGRATION.md)

### Scenario 2: I want to make a REST API call

```typescript
import { postSnapshot } from '@/lib/apiService';

await postSnapshot({
  deviceId: 'camera-001',
  image: 'data:image/jpeg;base64,...',
  timestamp: Date.now(),
});
```

**Documentation**: [`WEBSOCKET_REST_INTEGRATION.md#rest-api`](WEBSOCKET_REST_INTEGRATION.md)

### Scenario 3: I want to listen for events in admin dashboard

```typescript
import { useWebSocket } from '../hooks/useWebSocket';
import { EVENTS } from '../lib/websocketEvents';

const { socket } = useWebSocket();

useEffect(() => {
  socket?.on(EVENTS.MOTION_DETECTED, (data) => {
    console.log('Motion detected:', data);
  });
  
  return () => socket?.off(EVENTS.MOTION_DETECTED);
}, [socket]);
```

**Documentation**: [`AdminDashboard.tsx`](src/pages/AdminDashboard.tsx)

### Scenario 4: I want to access device state

```typescript
import { useSessionStore } from '@/store/sessionStore';

const { deviceInfo, updateDeviceInfo } = useSessionStore();

// Read state
console.log(deviceInfo.online);

// Update state
updateDeviceInfo({ motion: true });
```

**Documentation**: [`SYSTEM_ARCHITECTURE.md#state-management`](SYSTEM_ARCHITECTURE.md)

---

## 🐛 Troubleshooting

### Issue: WebSocket not connecting

**Solution**: Check [`WEBSOCKET_REST_INTEGRATION.md#troubleshooting`](WEBSOCKET_REST_INTEGRATION.md)

Common fixes:
- Verify `VITE_WS_URL` in `.env`
- Check backend is running
- Verify JWT token

### Issue: REST API calls failing

**Solution**: Check [`WEBSOCKET_REST_INTEGRATION.md#troubleshooting`](WEBSOCKET_REST_INTEGRATION.md)

Common fixes:
- Verify `VITE_API_URL` in `.env`
- Check CORS settings
- Verify JWT token

### Issue: Events not being received

**Solution**: Check [`SYSTEM_ARCHITECTURE.md#debugging`](SYSTEM_ARCHITECTURE.md)

Common fixes:
- Verify event names match exactly
- Check socket listeners are registered
- Verify backend is relaying events

---

## 📊 System Status

| Component | Status | Documentation |
|-----------|--------|---------------|
| WebSocket Client | ✅ Complete | [`useWebSocket.ts`](src/hooks/useWebSocket.ts) |
| REST API Client | ✅ Complete | [`apiService.ts`](src/lib/apiService.ts) |
| Event Schema | ✅ Complete | [`websocketEvents.ts`](src/lib/websocketEvents.ts) |
| State Management | ✅ Complete | [`sessionStore.ts`](src/store/sessionStore.ts) |
| Camera Component | ✅ Complete | [`CameraView.tsx`](src/components/CameraView.tsx) |
| Ring Button | ✅ Complete | [`RingButton.tsx`](src/components/RingButton.tsx) |
| Admin Dashboard | ✅ Complete | [`AdminDashboard.tsx`](src/pages/AdminDashboard.tsx) |
| Documentation | ✅ Complete | This index |

---

## 🚀 Getting Started

### Option 1: Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your backend URLs
# (Open .env and set VITE_WS_URL and VITE_API_URL)

# 4. Start the app
npm run dev

# 5. Open browser and check connection indicator
```

**Guide**: [`QUICKSTART_WEBSOCKET.md`](QUICKSTART_WEBSOCKET.md)

### Option 2: Detailed Setup (15 minutes)

1. Read [`SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md)
2. Follow [`WEBSOCKET_REST_INTEGRATION.md`](WEBSOCKET_REST_INTEGRATION.md)
3. Review code in implementation files
4. Test with backend (or mock server)

---

## 📞 Support

### Documentation

- **Technical Questions**: See [`WEBSOCKET_REST_INTEGRATION.md`](WEBSOCKET_REST_INTEGRATION.md)
- **Architecture Questions**: See [`SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md)
- **Quick Help**: See [`QUICKSTART_WEBSOCKET.md`](QUICKSTART_WEBSOCKET.md)
- **Visual Help**: See [`DIAGRAMS.md`](DIAGRAMS.md)

### Code Examples

All documentation includes code examples. Key files:
- [`useWebSocket.ts`](src/hooks/useWebSocket.ts) - Hook implementation
- [`apiService.ts`](src/lib/apiService.ts) - API methods
- [`AdminDashboard.tsx`](src/pages/AdminDashboard.tsx) - Event listening
- [`CameraView.tsx`](src/components/CameraView.tsx) - Event emission

---

## 🎓 Additional Resources

### TypeScript Types

All TypeScript interfaces are defined in:
- [`websocketEvents.ts`](src/lib/websocketEvents.ts) - Event payloads
- [`apiService.ts`](src/lib/apiService.ts) - API types
- [`sessionStore.ts`](src/store/sessionStore.ts) - Store types

### Environment Variables

Required variables documented in:
- [`.env.example`](.env.example)
- [`QUICKSTART_WEBSOCKET.md`](QUICKSTART_WEBSOCKET.md)

### Testing

Testing guidelines in:
- [`WEBSOCKET_REST_INTEGRATION.md#testing`](WEBSOCKET_REST_INTEGRATION.md)
- [`IMPLEMENTATION_SUMMARY.md#testing`](IMPLEMENTATION_SUMMARY.md)

---

## ✅ Checklist for Success

- [ ] Read [`QUICKSTART_WEBSOCKET.md`](QUICKSTART_WEBSOCKET.md)
- [ ] Install dependencies: `npm install`
- [ ] Configure `.env` file
- [ ] Start app: `npm run dev`
- [ ] Verify connection indicator shows
- [ ] Check browser console for WebSocket connection
- [ ] Review [`SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md)
- [ ] Read [`WEBSOCKET_REST_INTEGRATION.md`](WEBSOCKET_REST_INTEGRATION.md)
- [ ] Understand event flows in [`DIAGRAMS.md`](DIAGRAMS.md)
- [ ] Implement backend or use mock server
- [ ] Test all events end-to-end

---

## 🎉 You're Ready!

The Camera App is **fully implemented** with comprehensive documentation. Choose your learning path above and start building!

### Quick Links

- 🚀 [Quick Start](QUICKSTART_WEBSOCKET.md)
- 🔧 [Integration Guide](WEBSOCKET_REST_INTEGRATION.md)
- 🏗️ [System Architecture](SYSTEM_ARCHITECTURE.md)
- 📊 [Visual Diagrams](DIAGRAMS.md)
- ✅ [Implementation Summary](IMPLEMENTATION_SUMMARY.md)

---

**Last Updated**: November 14, 2025  
**Version**: 1.0.0  
**Status**: ✅ Complete & Production Ready
