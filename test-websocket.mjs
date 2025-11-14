#!/usr/bin/env node

/**
 * Test WebSocket Connection with JWT
 * 
 * This script verifies that:
 * 1. JWT token is valid
 * 2. WebSocket can connect with JWT
 * 3. Camera app can authenticate
 */

import { io } from 'socket.io-client';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const JWT = envContent.match(/VITE_JWT_TOKEN=(.+)/)?.[1];
const WS_URL = envContent.match(/VITE_WS_URL=(.+)/)?.[1] || 'http://localhost:5000';

console.log('🧪 Testing WebSocket Connection...\n');
console.log(`WebSocket URL: ${WS_URL}`);
console.log(`JWT Token: ${JWT ? JWT.substring(0, 20) + '...' : 'NOT FOUND'}\n`);

if (!JWT) {
  console.error('❌ No JWT token found in .env file!');
  console.log('Run: node setup-backend.mjs to create a user and get JWT token');
  process.exit(1);
}

// Create socket connection
const socket = io(WS_URL, {
  auth: {
    token: JWT,
  },
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('✅ WebSocket connected successfully!');
  console.log('   Socket ID:', socket.id);
  console.log('\n📡 Testing event emission...');
  
  // Test emitting an event
  socket.emit('bell-pressed', {
    deviceId: 'camera-001',
    timestamp: Date.now(),
    pressedBy: 'visitor',
  });
  
  console.log('✅ Event emitted: bell-pressed\n');
  
  setTimeout(() => {
    console.log('✅ WebSocket test complete!');
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.error('❌ WebSocket connection error:', error.message);
  console.error('   Full error:', error);
  console.error('   Error data:', error.data);
  
  if (error.message.includes('Authentication') || error.message.includes('authentication')) {
    console.log('\n💡 Troubleshooting:');
    console.log('1. JWT token might be expired. Run: node setup-backend.mjs');
    console.log('2. Check if backend is running on', WS_URL);
    console.log('3. Verify backend accepts JWT authentication');
    console.log('4. Check backend socket.js authentication middleware');
  }
  
  process.exit(1);
});

socket.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Connection timeout - backend not responding');
  socket.disconnect();
  process.exit(1);
}, 10000);
