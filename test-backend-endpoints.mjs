#!/usr/bin/env node

/**
 * Test Backend Endpoints
 * 
 * This script tests your backend API to:
 * 1. Verify endpoints exist
 * 2. Check authentication requirements
 * 3. Find valid device IDs
 * 
 * Usage: node test-backend-endpoints.mjs
 */

const BACKEND_URL = 'http://localhost:5000';
const DEVICE_ID = '67456789abcdef1234567890';

console.log('🧪 Testing Backend Endpoints...\n');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Device ID: ${DEVICE_ID}\n`);

// Test 1: GET /api/door/logs
async function testGetLogs() {
  console.log('1️⃣ Testing GET /api/door/logs');
  try {
    const response = await fetch(`${BACKEND_URL}/api/door/logs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Success!');
      console.log('   Response:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('   ❌ Failed');
      console.log('   Error:', error);
    }
  } catch (error) {
    console.log('   ❌ Network Error:', error.message);
  }
  console.log('');
}

// Test 2: POST /api/door/upload with FormData
async function testUploadImage() {
  console.log('2️⃣ Testing POST /api/door/upload');
  try {
    // Create a simple test image blob (1x1 red pixel PNG)
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
    
    const response = await fetch(`${BACKEND_URL}/api/door/upload`, {
      method: 'POST',
      body: formData,
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Success!');
      console.log('   Response:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('   ❌ Failed');
      console.log('   Error:', error);
    }
  } catch (error) {
    console.log('   ❌ Network Error:', error.message);
  }
  console.log('');
}

// Test 3: Check if device exists
async function checkDevice() {
  console.log('3️⃣ Checking if device exists');
  try {
    // Try GET /api/devices
    const response = await fetch(`${BACKEND_URL}/api/devices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Success!');
      console.log('   Devices:', JSON.stringify(data, null, 2));
      
      // Check if our device ID exists
      const devices = data.devices || data.data || [];
      if (Array.isArray(devices)) {
        const ourDevice = devices.find(d => d._id === DEVICE_ID || d.deviceId === DEVICE_ID);
        if (ourDevice) {
          console.log('\n   ✅ Your device exists!');
        } else {
          console.log('\n   ⚠️ Device not found. Available devices:');
          devices.forEach(d => {
            console.log(`      - ${d._id || d.deviceId}`);
          });
        }
      }
    } else {
      console.log('   ❌ Endpoint not available');
    }
  } catch (error) {
    console.log('   ❌ Network Error:', error.message);
  }
  console.log('');
}

// Run all tests
async function runTests() {
  await testGetLogs();
  await testUploadImage();
  await checkDevice();
  
  console.log('✅ Tests complete!\n');
  console.log('📋 Next Steps:');
  console.log('1. If "Device not found", copy a valid device ID from the devices list');
  console.log('2. Update .env file: VITE_DEVICE_ID=<valid-device-id>');
  console.log('3. Restart your dev server: npm run dev');
}

runTests();
