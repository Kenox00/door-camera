# 🎯 Application Flow Diagram

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP STARTS                              │
│                            ↓                                     │
│                  Camera Auto-Initializes                        │
│                   (2 seconds max)                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                      🏠 HOME SCREEN                             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │        ┌─────────────────────────────────┐               │ │
│  │        │  SMART DOOR SECURITY            │               │ │
│  │        └─────────────────────────────────┘               │ │
│  │                                                           │ │
│  │     ╔════════════════════════════════════╗               │ │
│  │     ║                                    ║               │ │
│  │     ║      📹 LIVE CAMERA PREVIEW        ║               │ │
│  │     ║    (1920x1080, rear camera)       ║               │ │
│  │     ║                                    ║               │ │
│  │     ║    [Corner Overlays + Crosshair]  ║               │ │
│  │     ║                                    ║               │ │
│  │     ╚════════════════════════════════════╝               │ │
│  │                                                           │ │
│  │                    ┌─────────┐                           │ │
│  │                    │   🔔    │  ← RING BELL              │ │
│  │                    │  PRESS  │                           │ │
│  │                    └─────────┘                           │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                     [Button Pressed]
                            ↓
        ┌───────────────────────────────────┐
        │  1. Ripple animation              │
        │  2. Capture photo (<200ms)        │
        │  3. Compress image (80% quality)  │
        │  4. Upload to backend             │
        │  5. Receive sessionId             │
        └───────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ⏳ WAITING SCREEN                            │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  [Blurred captured photo background]                     │ │
│  │                                                           │ │
│  │                    ⭕ ← Rotating                          │ │
│  │                  Loading...                               │ │
│  │                                                           │ │
│  │         "Waiting for admin approval..."                  │ │
│  │                                                           │ │
│  │         Session ID: abc123-...                           │ │
│  │                                                           │ │
│  │              • • •  ← Pulsing dots                       │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Backend Polling: GET /api/visitors/status/:sessionId          │
│  Interval: Every 3 seconds                                     │
│  Continues until: status !== 'pending'                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                   [Status Changes]
                            ↓
           ┌────────────────┴────────────────┐
           ↓                                  ↓
┌──────────────────────┐          ┌──────────────────────┐
│  Status: "approved"  │          │  Status: "denied"    │
└──────────────────────┘          └──────────────────────┘
           ↓                                  ↓
┌─────────────────────────┐      ┌─────────────────────────┐
│   ✅ APPROVED SCREEN   │      │   ❌ DENIED SCREEN     │
│  ┌───────────────────┐ │      │  ┌───────────────────┐ │
│  │                   │ │      │  │                   │ │
│  │       ✓✓✓         │ │      │  │       ✗✗✗         │ │
│  │   Checkmark       │ │      │  │    Red Cross      │ │
│  │   Animation       │ │      │  │    Animation      │ │
│  │                   │ │      │  │                   │ │
│  │  "Access Granted" │ │      │  │ "Access Denied"   │ │
│  │                   │ │      │  │                   │ │
│  │   🚪 Door Opens   │ │      │  │   🛡️ Shield       │ │
│  │                   │ │      │  │                   │ │
│  │  [Progress Bar]   │ │      │  │  [Progress Bar]   │ │
│  │  ████████████     │ │      │  │  ████████████     │ │
│  │                   │ │      │  │                   │ │
│  │  Redirecting...   │ │      │  │  Redirecting...   │ │
│  │                   │ │      │  │                   │ │
│  └───────────────────┘ │      │  └───────────────────┘ │
│                         │      │                         │
│  Duration: 5 seconds    │      │  Duration: 5 seconds    │
└─────────────────────────┘      └─────────────────────────┘
           ↓                                  ↓
           └────────────────┬────────────────┘
                            ↓
                  [Auto-Redirect Home]
                            ↓
                  ♻️ LOOP BACK TO HOME
```

---

## Backend Flow

```
┌─────────────────────────────────────────────────────────┐
│               BACKEND MOCK SERVER                       │
│                 (mockServer.js)                         │
└─────────────────────────────────────────────────────────┘

1. POST /api/visitors/capture
   ├─ Receive: { image: base64, timestamp: ISO8601 }
   ├─ Generate: sessionId (UUID v4)
   ├─ Store: { status: 'pending', capturedAt: Date }
   └─ Return: { sessionId, message, timestamp }

2. GET /api/visitors/status/:sessionId
   ├─ Lookup: session by sessionId
   ├─ Check: status (pending/approved/denied)
   └─ Return: { sessionId, status, message, timestamp }

3. Auto-Processing (Background)
   ├─ Check: Every 1 second
   ├─ Find: Sessions older than 10 seconds
   ├─ Update: 70% approved, 30% denied
   └─ Log: Status change

4. Cleanup (Background)
   ├─ Check: Every 60 seconds
   ├─ Find: Sessions older than 5 minutes
   └─ Delete: Old sessions
```

---

## Data Flow Architecture

```
┌─────────────────┐
│   Browser       │
│   (Camera)      │
└────────┬────────┘
         │ 1. Video Stream
         ↓
┌─────────────────────────────────────────┐
│   useCamera Hook                        │
│   • getUserMedia()                      │
│   • Auto-start                          │
│   • Auto-recovery                       │
└────────┬────────────────────────────────┘
         │ 2. videoRef
         ↓
┌─────────────────────────────────────────┐
│   CameraView Component                  │
│   • Display video                       │
│   • Show overlays                       │
└─────────────────────────────────────────┘
         │ 3. User presses button
         ↓
┌─────────────────────────────────────────┐
│   useCapture Hook                       │
│   • Draw canvas                         │
│   • Compress image                      │
│   • Convert to base64                   │
└────────┬────────────────────────────────┘
         │ 4. base64 image
         ↓
┌─────────────────────────────────────────┐
│   API Client (axios)                    │
│   POST /api/visitors/capture            │
└────────┬────────────────────────────────┘
         │ 5. sessionId
         ↓
┌─────────────────────────────────────────┐
│   Zustand Store                         │
│   • setSessionId()                      │
│   • setLastCapturedPhoto()              │
└────────┬────────────────────────────────┘
         │ 6. Navigate to /waiting
         ↓
┌─────────────────────────────────────────┐
│   React Query (useQuery)                │
│   • Poll every 3 seconds                │
│   • GET /api/visitors/status/:id        │
│   • Auto-refetch                        │
└────────┬────────────────────────────────┘
         │ 7. status change detected
         ↓
┌─────────────────────────────────────────┐
│   React Router                          │
│   • Navigate to /approved or /denied    │
└────────┬────────────────────────────────┘
         │ 8. After 5 seconds
         ↓
┌─────────────────────────────────────────┐
│   Clear Session & Return Home           │
│   • clearSession()                      │
│   • navigate('/')                       │
└─────────────────────────────────────────┘
```

---

## State Management Flow

```
┌─────────────────────────────────────────────┐
│         Zustand Global Store                │
│        (src/store/sessionStore.ts)          │
├─────────────────────────────────────────────┤
│  STATE:                                     │
│  • sessionId: string | null                 │
│  • lastCapturedPhoto: string | null         │
│  • connectionStatus: 'online' | 'offline'   │
│  • cameraReady: boolean                     │
│  • error: string | null                     │
│                                             │
│  ACTIONS:                                   │
│  • setSessionId(id)                         │
│  • setLastCapturedPhoto(photo)              │
│  • setConnectionStatus(status)              │
│  • setCameraReady(ready)                    │
│  • setError(error)                          │
│  • clearSession()                           │
└─────────────────────────────────────────────┘
         ↓ Used by ↓
┌────────────────────────────────────┐
│  All components access via:        │
│  const { sessionId } =             │
│    useSessionStore()               │
└────────────────────────────────────┘
```

---

## Error Handling Flow

```
Camera Error
    ↓
useCamera detects
    ↓
Show error overlay
    ↓
Auto-retry after 2s
    ↓
Success? → Continue
Failed? → Retry again

Network Error
    ↓
Axios interceptor
    ↓
setConnectionStatus('offline')
    ↓
Show red banner
    ↓
React Query retries (3x)
    ↓
Success? → Continue
Failed? → Show error

Capture Error
    ↓
Try/catch in useCapture
    ↓
setError(message)
    ↓
Show error overlay
    ↓
User can retry
```

---

## Performance Optimizations

```
1. Image Compression
   Before: 4-8 MB
   After: 200-800 KB
   Savings: 80-90%

2. Lazy Loading
   • React.lazy() for routes
   • Code splitting by page

3. Memoization
   • useCallback for functions
   • useMemo for expensive calcs

4. Polling Optimization
   • Only when on waiting screen
   • Stops when status changes
   • 3-second interval (balanced)

5. Camera Optimization
   • No unnecessary restarts
   • Efficient canvas usage
   • Minimal re-renders
```

---

## Security Flow

```
1. HTTPS Required
   • Camera API mandate
   • Vite dev server uses HTTPS
   • Self-signed cert in dev

2. No Persistence
   • Photos in memory only
   • No localStorage
   • Auto-clear on redirect

3. Permission Handling
   • Graceful error messages
   • Retry mechanisms
   • Clear instructions

4. Input Validation (Backend)
   • Image format check
   • Size limits (50MB max)
   • Base64 validation
```

---

## Technology Stack Flow

```
User Browser
    ↓
React 19 (UI)
    ↓
React Router 7 (Navigation)
    ↓
Zustand (State)
    ↓
React Query (Server State)
    ↓
Axios (HTTP)
    ↓
Express Server (Backend)
    ↓
In-Memory Store (Mock DB)

Styling:
React → Tailwind CSS v4 → CSS Variables

Animations:
React → Framer Motion → GPU-accelerated

Camera:
Browser → navigator.mediaDevices → Video Element
```

---

**This is the complete flow of the Smart Door Camera Application! 🎉**
