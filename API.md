# 📡 API Documentation

Complete backend API specification for the Smart Door Camera system.

---

## Base Configuration

```typescript
// Default Configuration
BASE_URL: http://localhost:3000
CONTENT_TYPE: application/json
MAX_BODY_SIZE: 50MB (for base64 images)
CORS: Enabled for all origins (configure for production)
```

---

## Authentication

⚠️ **Note:** This implementation does not include authentication. For production:
- Add JWT tokens
- Implement API keys
- Use OAuth 2.0
- Add rate limiting

---

## Endpoints

### 1. Capture Visitor

**Endpoint:** `POST /api/visitors/capture`

**Description:** Captures a visitor photo and creates a new session.

**Request:**

```typescript
interface CaptureRequest {
  image: string;      // Base64 encoded image (data:image/jpeg;base64,...)
  timestamp: string;  // ISO 8601 timestamp
}
```

**Example:**

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQAB...",
  "timestamp": "2025-11-14T12:34:56.789Z"
}
```

**Response:** `200 OK`

```typescript
interface CaptureResponse {
  sessionId: string;    // UUID v4
  message: string;      // Success message
  timestamp: string;    // Server timestamp
}
```

**Example:**

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Visitor captured successfully",
  "timestamp": "2025-11-14T12:34:56.789Z"
}
```

**Error Responses:**

```json
// 400 Bad Request - Missing image
{
  "error": "Image data is required"
}

// 413 Payload Too Large - Image > 50MB
{
  "error": "Request entity too large"
}

// 500 Internal Server Error
{
  "error": "Internal server error",
  "message": "Error details..."
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/visitors/capture \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,...",
    "timestamp": "2025-11-14T12:34:56.789Z"
  }'
```

---

### 2. Get Visitor Status

**Endpoint:** `GET /api/visitors/status/:sessionId`

**Description:** Checks the approval status of a visitor session.

**Parameters:**

- `sessionId` (path parameter) - UUID of the session

**Request:**

```
GET /api/visitors/status/550e8400-e29b-41d4-a716-446655440000
```

**Response:** `200 OK`

```typescript
interface StatusResponse {
  sessionId: string;
  status: 'pending' | 'approved' | 'denied';
  message?: string;     // Optional status message
  timestamp: string;    // Server timestamp
}
```

**Example (Pending):**

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Waiting for admin approval...",
  "timestamp": "2025-11-14T12:34:59.123Z"
}
```

**Example (Approved):**

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "approved",
  "message": "Access granted - Door opening",
  "timestamp": "2025-11-14T12:35:10.456Z"
}
```

**Example (Denied):**

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "denied",
  "message": "Access denied - Please contact property owner",
  "timestamp": "2025-11-14T12:35:10.456Z"
}
```

**Error Responses:**

```json
// 404 Not Found - Invalid session
{
  "error": "Session not found",
  "sessionId": "invalid-uuid"
}
```

**cURL Example:**

```bash
curl http://localhost:3000/api/visitors/status/550e8400-e29b-41d4-a716-446655440000
```

---

## Admin Endpoints (Optional)

### 3. Approve Visitor

**Endpoint:** `POST /api/visitors/:sessionId/approve`

**Description:** Manually approve a visitor session.

**Request:**

```
POST /api/visitors/550e8400-e29b-41d4-a716-446655440000/approve
```

**Response:** `200 OK`

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "approved",
  "message": "Access granted"
}
```

---

### 4. Deny Visitor

**Endpoint:** `POST /api/visitors/:sessionId/deny`

**Description:** Manually deny a visitor session.

**Request:**

```
POST /api/visitors/550e8400-e29b-41d4-a716-446655440000/deny
```

**Response:** `200 OK`

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "denied",
  "message": "Access denied"
}
```

---

### 5. List All Sessions

**Endpoint:** `GET /api/visitors`

**Description:** Returns all visitor sessions.

**Response:** `200 OK`

```json
{
  "sessions": [
    {
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "pending",
      "capturedAt": "2025-11-14T12:34:56.789Z"
    },
    {
      "sessionId": "660e8400-e29b-41d4-a716-446655440001",
      "status": "approved",
      "capturedAt": "2025-11-14T12:30:15.123Z"
    }
  ],
  "total": 2
}
```

---

## Polling Behavior

The frontend polls the status endpoint at regular intervals:

**Configuration:**
```typescript
POLL_INTERVAL: 3000ms (3 seconds)
MAX_RETRIES: Infinite (until status changes)
RETRY_DELAY: 3000ms
```

**Flow:**
1. Capture photo → Get sessionId
2. Start polling: `GET /api/visitors/status/:sessionId`
3. Poll every 3 seconds
4. Stop when status !== 'pending'
5. Redirect based on final status

---

## Database Schema (Reference)

```typescript
interface VisitorSession {
  sessionId: string;           // UUID v4
  image: string;               // Base64 or URL to stored image
  status: 'pending' | 'approved' | 'denied';
  capturedAt: Date;            // Timestamp when captured
  processedAt?: Date;          // Timestamp when approved/denied
  processedBy?: string;        // Admin user ID
  ipAddress?: string;          // Visitor IP
  deviceInfo?: string;         // User agent
}
```

**Recommended Storage:**
- MongoDB (document store)
- PostgreSQL (relational)
- Firebase Firestore (real-time)
- Supabase (PostgreSQL + real-time)

---

## Image Handling

### Frontend Compression

Images are compressed before upload:

```typescript
// Configuration
COMPRESSION_CONFIG = {
  quality: 0.8,         // 80% quality
  maxWidth: 1920,       // Max width in pixels
  maxHeight: 1080,      // Max height in pixels
  mimeType: 'image/jpeg'
}
```

**Typical Image Size:**
- Before: 4-8 MB
- After: 200-800 KB

### Backend Storage Options

**Option 1: Database (Small Scale)**
```javascript
// Store base64 in database
sessions.set(sessionId, { 
  image: req.body.image,  // base64 string
  status: 'pending' 
});
```

**Option 2: Cloud Storage (Production)**
```javascript
// Upload to S3/Google Cloud Storage
const imageUrl = await uploadToS3(base64Image);
sessions.set(sessionId, { 
  imageUrl: imageUrl,
  status: 'pending' 
});
```

**Option 3: File System**
```javascript
// Save to disk
const buffer = Buffer.from(base64Image.split(',')[1], 'base64');
fs.writeFileSync(`./uploads/${sessionId}.jpg`, buffer);
```

---

## Security Recommendations

### 1. Authentication

```typescript
// Add JWT middleware
app.use('/api/visitors', authenticateJWT);

// Or API key
const apiKey = req.headers['x-api-key'];
if (apiKey !== process.env.API_KEY) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### 2. Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});

app.use('/api/visitors', limiter);
```

### 3. Input Validation

```javascript
// Validate image format
if (!req.body.image.startsWith('data:image/jpeg;base64,')) {
  return res.status(400).json({ error: 'Invalid image format' });
}

// Validate image size
const sizeInBytes = Buffer.from(
  req.body.image.split(',')[1], 
  'base64'
).length;

if (sizeInBytes > 50 * 1024 * 1024) { // 50MB
  return res.status(413).json({ error: 'Image too large' });
}
```

### 4. HTTPS Only

```javascript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (!req.secure) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});
```

### 5. CORS Configuration

```javascript
// Production CORS
app.use(cors({
  origin: 'https://your-door-camera.com',
  credentials: true
}));
```

---

## WebSocket Alternative (Real-Time)

For instant updates without polling:

### Server (Socket.io)

```javascript
import { Server } from 'socket.io';

const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  socket.on('subscribe', (sessionId) => {
    socket.join(sessionId);
  });
});

// Emit status change
io.to(sessionId).emit('status-update', { 
  status: 'approved' 
});
```

### Client

```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');
socket.emit('subscribe', sessionId);
socket.on('status-update', (data) => {
  if (data.status === 'approved') {
    navigate('/approved');
  }
});
```

---

## Testing the API

### 1. Unit Tests (Jest)

```javascript
describe('POST /api/visitors/capture', () => {
  it('should create a new session', async () => {
    const response = await request(app)
      .post('/api/visitors/capture')
      .send({ 
        image: 'data:image/jpeg;base64,/9j/4AA...',
        timestamp: new Date().toISOString()
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('sessionId');
  });
});
```

### 2. Integration Tests

```javascript
describe('Complete Flow', () => {
  it('should capture, approve, and redirect', async () => {
    // Capture
    const capture = await api.post('/api/visitors/capture', {...});
    const { sessionId } = capture.data;
    
    // Approve
    await api.post(`/api/visitors/${sessionId}/approve`);
    
    // Check status
    const status = await api.get(`/api/visitors/status/${sessionId}`);
    expect(status.data.status).toBe('approved');
  });
});
```

---

## Monitoring

### Key Metrics

- **Capture Success Rate**: % of successful captures
- **Average Approval Time**: Time from capture to decision
- **API Response Time**: Latency of status checks
- **Error Rate**: Failed requests / total requests

### Logging

```javascript
// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Log errors
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
```

---

## Production Checklist

- [ ] Authentication implemented
- [ ] Rate limiting configured
- [ ] Input validation added
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Error handling comprehensive
- [ ] Logging implemented
- [ ] Monitoring set up
- [ ] Database backups configured
- [ ] Image storage optimized
- [ ] Load balancing considered
- [ ] API documentation updated

---

**API documentation complete! 🚀**

For implementation examples, see `mockServer.js` in the project root.
