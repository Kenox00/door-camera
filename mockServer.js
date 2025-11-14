import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-memory session storage
const sessions = new Map();
const devices = new Map();

// Initialize some test devices
devices.set('camera-001', {
  deviceId: 'camera-001',
  name: 'Front Door Camera',
  online: true,
  lastSeen: new Date().toISOString(),
  batteryLevel: 85
});
devices.set('67456789abcdef1234567890', {
  deviceId: '67456789abcdef1234567890',
  name: 'ESP32 Camera',
  online: true,
  lastSeen: new Date().toISOString(),
  batteryLevel: 75
});

// Capture endpoint
app.post('/api/visitors/capture', (req, res) => {
  const { image } = req.body;
  
  if (!image) {
    return res.status(400).json({ error: 'Image data is required' });
  }
  
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, { 
    status: 'pending',
    capturedAt: new Date().toISOString(),
    image: image.substring(0, 100) + '...', // Store preview only
  });
  
  console.log(`📸 [${new Date().toLocaleTimeString()}] New capture: ${sessionId}`);
  
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
    return res.status(404).json({ 
      error: 'Session not found',
      sessionId 
    });
  }
  
  console.log(`📊 [${new Date().toLocaleTimeString()}] Status check: ${sessionId} - ${session.status}`);
  
  res.json({ 
    sessionId, 
    status: session.status,
    message: getStatusMessage(session.status),
    timestamp: new Date().toISOString() 
  });
});

// Manual approval endpoint (for testing)
app.post('/api/visitors/:sessionId/approve', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  session.status = 'approved';
  console.log(`✅ [${new Date().toLocaleTimeString()}] Manually approved: ${sessionId}`);
  
  res.json({ 
    sessionId, 
    status: 'approved',
    message: 'Access granted' 
  });
});

// Manual denial endpoint (for testing)
app.post('/api/visitors/:sessionId/deny', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  session.status = 'denied';
  console.log(`❌ [${new Date().toLocaleTimeString()}] Manually denied: ${sessionId}`);
  
  res.json({ 
    sessionId, 
    status: 'denied',
    message: 'Access denied' 
  });
});

// List all sessions (for testing)
app.get('/api/visitors', (req, res) => {
  const allSessions = Array.from(sessions.entries()).map(([id, data]) => ({
    sessionId: id,
    ...data,
    image: undefined, // Don't return image data
  }));
  
  res.json({ 
    sessions: allSessions,
    total: allSessions.length 
  });
});

// Helper function
function getStatusMessage(status) {
  switch (status) {
    case 'pending':
      return 'Waiting for admin approval...';
    case 'approved':
      return 'Access granted - Door opening';
    case 'denied':
      return 'Access denied - Please contact property owner';
    default:
      return 'Unknown status';
  }
}

// Auto-approve/deny sessions after 10 seconds (for testing)
setInterval(() => {
  sessions.forEach((session, sessionId) => {
    if (session.status === 'pending') {
      const elapsed = Date.now() - new Date(session.capturedAt).getTime();
      
      if (elapsed > 10000) { // 10 seconds
        // 70% approval rate, 30% denial
        session.status = Math.random() > 0.3 ? 'approved' : 'denied';
        console.log(`⚡ [${new Date().toLocaleTimeString()}] Auto-processed: ${sessionId} - ${session.status.toUpperCase()}`);
      }
    }
  });
}, 1000);

// Clean up old sessions (after 5 minutes)
setInterval(() => {
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  
  sessions.forEach((session, sessionId) => {
    const sessionTime = new Date(session.capturedAt).getTime();
    if (sessionTime < fiveMinutesAgo) {
      sessions.delete(sessionId);
      console.log(`🧹 [${new Date().toLocaleTimeString()}] Cleaned up old session: ${sessionId}`);
    }
  });
}, 60000); // Check every minute

// ========================================
// NEW ESP32 + WEBSOCKET ENDPOINTS
// ========================================

// Device status endpoint
app.get('/devices/status/:id', (req, res) => {
  const { id } = req.params;
  const device = devices.get(id);
  
  if (!device) {
    console.log(`❌ [${new Date().toLocaleTimeString()}] Device not found: ${id}`);
    return res.status(404).json({
      success: false,
      message: 'Device not found',
      timestamp: new Date().toISOString()
    });
  }
  
  console.log(`📱 [${new Date().toLocaleTimeString()}] Device status requested: ${id}`);
  
  res.json({
    success: true,
    data: {
      device: {
        ...device,
        lastSeen: new Date().toISOString()
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Door upload endpoint (ESP32 image upload)
app.post('/api/door/upload', upload.single('image'), (req, res) => {
  const deviceId = req.body.deviceId || req.headers['x-device-id'];
  
  if (!deviceId) {
    console.log(`❌ [${new Date().toLocaleTimeString()}] Upload failed: No device ID`);
    return res.status(400).json({
      success: false,
      message: 'Device ID is required',
      timestamp: new Date().toISOString()
    });
  }
  
  const device = devices.get(deviceId);
  if (!device) {
    console.log(`❌ [${new Date().toLocaleTimeString()}] Upload failed: Device not found - ${deviceId}`);
    return res.status(404).json({
      success: false,
      message: 'Device not found',
      timestamp: new Date().toISOString()
    });
  }
  
  const sessionId = crypto.randomUUID();
  const imageUrl = `/uploads/${sessionId}.jpg`; // Mock URL
  
  sessions.set(sessionId, {
    _id: sessionId,
    sessionId,
    imageUrl,
    status: 'pending',
    timestamp: new Date().toISOString(),
    capturedAt: new Date().toISOString(),
    deviceId,
    image: req.file ? `data:image/jpeg;base64,${req.file.buffer.toString('base64').substring(0, 100)}...` : null
  });
  
  console.log(`📸 [${new Date().toLocaleTimeString()}] Image uploaded - Device: ${deviceId}, Session: ${sessionId}`);
  
  // Emit socket event
  io.emit('snapshot', {
    deviceId,
    sessionId,
    imageUrl,
    timestamp: new Date().toISOString()
  });
  
  res.json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      log: {
        _id: sessionId,
        imageUrl,
        status: 'pending',
        timestamp: new Date().toISOString(),
        deviceId
      }
    },
    timestamp: new Date().toISOString()
  });
});

// ========================================
// WEBSOCKET CONNECTION HANDLING
// ========================================

io.on('connection', (socket) => {
  console.log(`🔌 [${new Date().toLocaleTimeString()}] WebSocket client connected: ${socket.id}`);
  
  // Handle camera-online event
  socket.on('camera-online', (data) => {
    console.log(`📹 [${new Date().toLocaleTimeString()}] Camera online:`, data);
    const device = devices.get(data.deviceId);
    if (device) {
      device.online = true;
      device.lastSeen = new Date().toISOString();
    }
  });
  
  // Handle motion-detected event
  socket.on('motion-detected', (data) => {
    console.log(`🚨 [${new Date().toLocaleTimeString()}] Motion detected:`, data);
  });
  
  // Handle bell-pressed event
  socket.on('bell-pressed', (data) => {
    console.log(`🔔 [${new Date().toLocaleTimeString()}] Bell pressed:`, data);
  });
  
  // Handle snapshot event
  socket.on('snapshot', (data) => {
    console.log(`📸 [${new Date().toLocaleTimeString()}] Snapshot received:`, data);
  });
  
  // Send backend-command example (for testing)
  setTimeout(() => {
    socket.emit('backend-command', {
      command: 'capture',
      timestamp: Date.now(),
      parameters: {}
    });
  }, 5000);
  
  socket.on('disconnect', () => {
    console.log(`🔌 [${new Date().toLocaleTimeString()}] WebSocket client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log('\n🚀 Smart Door Camera Mock Backend Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   HTTP Server: http://localhost:${PORT}`);
  console.log(`   WebSocket:   ws://localhost:${PORT}`);
  console.log('   ');
  console.log('   REST API Endpoints:');
  console.log('   POST   /api/visitors/capture');
  console.log('   GET    /api/visitors/status/:sessionId');
  console.log('   POST   /api/visitors/:sessionId/approve');
  console.log('   POST   /api/visitors/:sessionId/deny');
  console.log('   GET    /api/visitors');
  console.log('   POST   /api/door/upload (multipart/form-data)');
  console.log('   GET    /devices/status/:id');
  console.log('   ');
  console.log('   WebSocket Events:');
  console.log('   camera-online, motion-detected, bell-pressed, snapshot');
  console.log('   backend-command, admin-action');
  console.log('   ');
  console.log('   Auto-approval: 10 seconds (70% approve, 30% deny)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});
