#!/usr/bin/env node

/**
 * Register Device in Backend
 * 
 * This script registers a new device in your backend
 * so that /api/door/upload works
 */

const BACKEND_URL = 'http://localhost:5000';
const DEVICE_ID = '67456789abcdef1234567890';

async function registerDevice() {
  console.log('📝 Registering device in backend...\n');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Device ID: ${DEVICE_ID}\n`);
  
  // Try different registration endpoints
  const endpoints = [
    '/api/device/register',
    '/api/devices/register',
    '/api/register',
    '/api/devices',
  ];
  
  for (const endpoint of endpoints) {
    console.log(`Trying: ${endpoint}`);
    
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: DEVICE_ID,
          name: 'ESP32-CAM Door Camera',
          type: 'camera',
          location: 'Front Door',
        }),
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Success!');
        console.log('   Response:', JSON.stringify(data, null, 2));
        console.log('\n✅ Device registered successfully!');
        console.log('\n📋 Next Step: Restart your dev server with: npm run dev');
        return;
      } else {
        const error = await response.text();
        console.log('   ❌ Failed:', error);
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }
    console.log('');
  }
  
  console.log('❌ Could not find a working registration endpoint.');
  console.log('\n📋 Manual Steps:');
  console.log('1. Check your backend documentation for device registration');
  console.log('2. Register device via Postman or backend admin panel');
  console.log('3. Or contact backend developer for a valid device ID');
}

registerDevice();
