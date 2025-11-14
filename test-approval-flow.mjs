#!/usr/bin/env node

/**
 * Test Complete Approval Flow
 * 
 * This script simulates the complete flow:
 * 1. Upload visitor photo
 * 2. Listen for access_granted event
 * 3. Verify the event data structure
 */

import { io } from 'socket.io-client';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const JWT = envContent.match(/VITE_JWT_TOKEN=(.+)/)?.[1];
const DEVICE_ID = envContent.match(/VITE_DEVICE_ID=(.+)/)?.[1];
const WS_URL = 'http://localhost:5000';

console.log('🧪 Testing Complete Approval Flow...\n');

// Step 1: Upload a test image
console.log('1️⃣ Uploading test visitor photo...');

const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
const binaryString = atob(base64Image);
const bytes = new Uint8Array(binaryString.length);
for (let i = 0; i < binaryString.length; i++) {
  bytes[i] = binaryString.charCodeAt(i);
}
const blob = new Blob([bytes], { type: 'image/png' });

const formData = new FormData();
formData.append('image', blob, 'test.png');
formData.append('deviceId', DEVICE_ID);

try {
  const uploadResponse = await fetch(`${WS_URL}/api/door/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JWT}`,
    },
    body: formData,
  });

  const uploadData = await uploadResponse.json();
  
  if (!uploadData.success) {
    console.error('❌ Upload failed:', uploadData);
    process.exit(1);
  }

  const visitorLogId = uploadData.data.visitorLogId;
  console.log('✅ Photo uploaded successfully!');
  console.log('   Visitor Log ID:', visitorLogId);
  console.log('   Status:', uploadData.data.status);
  console.log('   Device:', uploadData.data.deviceName);

  // Step 2: Connect WebSocket and listen for approval
  console.log('\n2️⃣ Connecting WebSocket to listen for approval...');
  
  const socket = io(WS_URL, {
    auth: { token: JWT },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected!');
    console.log('\n3️⃣ Waiting for admin to approve/deny the request...');
    console.log('   👉 Go to admin dashboard and approve visitor ID:', visitorLogId);
    console.log('   📍 Listening for events: access_granted, access_denied\n');
  });

  socket.on('access_granted', (data) => {
    console.log('✅ ACCESS GRANTED event received!');
    console.log('   Data structure:', JSON.stringify(data, null, 2));
    console.log('   Visitor ID match:', data.visitorId === visitorLogId || data._id === visitorLogId);
    
    if (data.visitorId === visitorLogId || data._id === visitorLogId) {
      console.log('\n🎉 SUCCESS! Complete flow works:');
      console.log('   1. ✅ Photo uploaded');
      console.log('   2. ✅ WebSocket connected');
      console.log('   3. ✅ Admin approved');
      console.log('   4. ✅ Camera received approval event');
    } else {
      console.log('\n⚠️ Event received but visitor ID mismatch');
      console.log('   Expected:', visitorLogId);
      console.log('   Received:', data.visitorId || data._id);
    }
    
    socket.disconnect();
    process.exit(0);
  });

  socket.on('access_denied', (data) => {
    console.log('❌ ACCESS DENIED event received!');
    console.log('   Data structure:', JSON.stringify(data, null, 2));
    console.log('   Visitor ID match:', data.visitorId === visitorLogId || data._id === visitorLogId);
    
    if (data.visitorId === visitorLogId || data._id === visitorLogId) {
      console.log('\n🔴 Request denied but flow works:');
      console.log('   1. ✅ Photo uploaded');
      console.log('   2. ✅ WebSocket connected');
      console.log('   3. ✅ Admin denied');
      console.log('   4. ✅ Camera received denial event');
    } else {
      console.log('\n⚠️ Event received but visitor ID mismatch');
      console.log('   Expected:', visitorLogId);
      console.log('   Received:', data.visitorId || data._id);
    }
    
    socket.disconnect();
    process.exit(0);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection error:', error.message);
    process.exit(1);
  });

  // Timeout after 2 minutes
  setTimeout(() => {
    console.log('\n⏱️ Timeout - No response received within 2 minutes');
    console.log('   The visitor is still pending approval in the admin dashboard');
    socket.disconnect();
    process.exit(0);
  }, 120000);

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}
