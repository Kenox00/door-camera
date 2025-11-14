# Backend Integration Guide

## Overview
The camera app has been updated to integrate with your doorlock-backend API.

## Key Changes

### 1. API Endpoints
- **Upload**: `POST /api/door/upload` (multipart/form-data)
- **Logs**: `GET /api/door/logs` (requires auth token)
- **Real-time**: Socket.IO connection for instant updates

### 2. Upload Flow
```
Camera → Capture Photo → Upload to /api/door/upload
                        ↓
                  Returns log with _id
                        ↓
          Store _id as sessionId in state
                        ↓
        Navigate to Waiting screen
```

### 3. Real-time Updates (Socket.IO)
The waiting screen listens for these events:
- `access_granted` - When admin approves via `/api/command/open`
- `access_denied` - When admin denies via `/api/command/deny`

### 4. Device Registration
**IMPORTANT**: Before using the camera app, register the device in your backend:

```bash
# Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Register device
curl -X POST http://localhost:5000/api/device/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Camera-1","espId":"67456789abcdef1234567890"}'
```

Copy the returned device `_id` and update `.env`:
```env
VITE_DEVICE_ID=your_device_id_here
```

## Testing the Integration

### Step 1: Start Backend
```bash
cd ../doorlock-backend
npm run dev
```

### Step 2: Start Camera App
```bash
npm run dev
```

### Step 3: Test Flow
1. Open camera app: `https://localhost:5173`
2. Click ring button to capture photo
3. Backend receives upload and stores log
4. Wait screen listens for Socket.IO events
5. Admin approves/denies via backend dashboard or API
6. Camera app receives event and navigates to result screen

## Response Structure

### Upload Response
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "log": {
      "_id": "507f1f77bcf86cd799439011",
      "imageUrl": "https://cloudinary.com/...",
      "status": "pending",
      "timestamp": "2023-11-14T...",
      "deviceId": "67456789abcdef1234567890"
    }
  }
}
```

### Socket.IO Events
```javascript
// When admin grants access
socket.on('access_granted', (data) => {
  // data._id matches the log ID
  // data.status = 'granted'
});

// When admin denies access
socket.on('access_denied', (data) => {
  // data._id matches the log ID
  // data.status = 'denied'
});
```

## Configuration

### Environment Variables (`.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_DEVICE_ID=67456789abcdef1234567890
```

### API Config (`src/lib/config.ts`)
```typescript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  uploadEndpoint: '/api/door/upload',
  deviceId: import.meta.env.VITE_DEVICE_ID || '67456789abcdef1234567890',
  socketPath: '/socket.io',
};
```

## Files Modified

1. **`src/lib/api.ts`** - Changed to multipart upload with FormData
2. **`src/lib/config.ts`** - Updated endpoints to match backend
3. **`src/hooks/useCapture.ts`** - Updated to use new upload function
4. **`src/hooks/useSocketIO.ts`** - NEW: Socket.IO client hook
5. **`src/pages/Waiting.tsx`** - Changed from polling to Socket.IO events
6. **`.env`** - Added device ID configuration

## Troubleshooting

### Upload Fails
- Check if deviceId is registered in backend
- Verify backend is running on port 5000
- Check CORS settings in backend

### Socket.IO Not Connecting
- Check backend Socket.IO server is running
- Verify `socketPath: '/socket.io'` matches backend config
- Check browser console for connection errors

### No Status Updates
- Verify Socket.IO connection is established
- Check backend emits `access_granted`/`access_denied` events
- Ensure log `_id` matches the sessionId in camera app

### HTTPS/Camera Issues
- Camera requires HTTPS for non-localhost access
- Accept self-signed certificate in browser
- Use `https://localhost:5173` not `http://`

## Next Steps

1. ✅ Register device in backend
2. ✅ Update `.env` with device ID
3. ✅ Start both servers (backend + camera app)
4. ✅ Test photo upload flow
5. ✅ Test approval/denial via backend API
6. ✅ Verify Socket.IO events trigger navigation

## Production Deployment

For production:
1. Use valid HTTPS certificate (Let's Encrypt)
2. Update `VITE_API_URL` to production backend URL
3. Ensure Socket.IO works through any proxies/load balancers
4. Register production devices in backend
5. Build camera app: `npm run build`
6. Deploy `dist/` folder to web server
