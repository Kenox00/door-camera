#!/usr/bin/env node

/**
 * Test Image Upload with JWT Token
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = 'http://localhost:5000';

// Read JWT from .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const jwtMatch = envContent.match(/VITE_JWT_TOKEN=(.*)/);
const JWT = jwtMatch ? jwtMatch[1].trim() : null;

console.log('🧪 Testing Image Upload...\n');

// Test with different device ID formats
const testCases = [
  { name: 'Original deviceId', deviceId: '67456789abcdef1234567890' },
  { name: 'Uppercase espId', deviceId: '67456789ABCDEF1234567890' },
  { name: 'MongoDB ID', deviceId: '69178ce6931f3dc29c3e57ed' },
];

async function testUpload(deviceId, testName) {
  console.log(`📤 Testing: ${testName}`);
  console.log(`   Device ID: ${deviceId}`);
  
  try {
    // Create a simple 1x1 red pixel PNG
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
    const binaryString = atob(base64Image);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/png' });
    
    const formData = new FormData();
    formData.append('image', blob, 'test.png');
    formData.append('deviceId', deviceId);
    
    const response = await fetch(`${BACKEND_URL}/api/door/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JWT}`,
      },
      body: formData,
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ SUCCESS!');
      console.log('   Response:', JSON.stringify(data, null, 2));
      return true;
    } else {
      const error = await response.json();
      console.log('   ❌ Failed:', error.message);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    return false;
  }
}

async function runTests() {
  if (!JWT) {
    console.log('❌ No JWT token found in .env file');
    console.log('Run: node setup-backend.mjs first');
    return;
  }
  
  console.log('🔑 JWT Token found\n');
  
  for (const testCase of testCases) {
    await testUpload(testCase.deviceId, testCase.name);
    console.log('');
  }
  
  console.log('✅ Tests complete!');
}

runTests();
