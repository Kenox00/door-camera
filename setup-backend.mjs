#!/usr/bin/env node

/**
 * Complete Backend Setup Script
 * 
 * This script will:
 * 1. Register a new user (or use existing)
 * 2. Login to get JWT token
 * 3. Register the device
 * 4. Save token to .env file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = 'http://localhost:5000';
const DEVICE_ID = '67456789abcdef1234567890';

// Test user credentials
const TEST_USER = {
  username: 'cameraapp',
  email: 'camera-app@test.com',
  password: 'TestPassword123!',
  name: 'Camera App User',
};

let jwt = null;

console.log('🚀 Setting up backend for camera app...\n');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Device ID: ${DEVICE_ID}\n`);

// Step 1: Register User
async function registerUser() {
  console.log('1️⃣ Registering user...');
  console.log(`   Email: ${TEST_USER.email}`);
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER),
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ User registered successfully!');
      
      // Try to extract token from registration response
      if (data.token || data.data?.token) {
        jwt = data.token || data.data.token;
        console.log('   🔑 JWT token received from registration');
      }
      
      return true;
    } else {
      const error = await response.json();
      
      // User might already exist - that's ok
      if (error.message?.includes('already') || error.message?.includes('exists')) {
        console.log('   ⚠️ User already exists (this is ok)');
        return true;
      }
      
      console.log('   ❌ Failed:', error.message);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Network Error:', error.message);
    return false;
  }
}

// Step 2: Login
async function loginUser() {
  console.log('\n2️⃣ Logging in...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
      }),
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Login successful!');
      
      // Extract token
      jwt = data.token || data.data?.token || data.accessToken || data.data?.accessToken;
      
      if (jwt) {
        console.log('   🔑 JWT token received');
        console.log('   Token preview:', jwt.substring(0, 20) + '...');
        return true;
      } else {
        console.log('   ❌ No token in response');
        console.log('   Response:', JSON.stringify(data, null, 2));
        return false;
      }
    } else {
      const error = await response.json();
      console.log('   ❌ Failed:', error.message);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Network Error:', error.message);
    return false;
  }
}

// Step 3: Register Device
async function registerDevice() {
  console.log('\n3️⃣ Registering device...');
  
  if (!jwt) {
    console.log('   ❌ No JWT token available');
    return false;
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/device/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        espId: DEVICE_ID,
        deviceId: DEVICE_ID,
        name: 'ESP32-CAM Door Camera',
        type: 'camera',
        location: 'Front Door',
        description: 'Smart doorbell camera with visitor detection',
      }),
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Device registered successfully!');
      console.log('   Response:', JSON.stringify(data, null, 2));
      return true;
    } else {
      const error = await response.json();
      
      // Device might already exist - that's ok
      if (error.message?.includes('already') || error.message?.includes('exists')) {
        console.log('   ⚠️ Device already registered (this is ok)');
        return true;
      }
      
      console.log('   ❌ Failed:', error.message);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Network Error:', error.message);
    return false;
  }
}

// Step 4: Save token to .env
function saveTokenToEnv() {
  console.log('\n4️⃣ Saving JWT token to .env file...');
  
  if (!jwt) {
    console.log('   ❌ No JWT token to save');
    return false;
  }
  
  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    // Read existing .env
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add JWT token
    if (envContent.includes('VITE_JWT_TOKEN=')) {
      envContent = envContent.replace(
        /VITE_JWT_TOKEN=.*/,
        `VITE_JWT_TOKEN=${jwt}`
      );
    } else {
      envContent += `\n# JWT Token for authenticated requests\nVITE_JWT_TOKEN=${jwt}\n`;
    }
    
    // Write back to .env
    fs.writeFileSync(envPath, envContent);
    
    console.log('   ✅ JWT token saved to .env');
    return true;
  } catch (error) {
    console.log('   ❌ Failed to save:', error.message);
    return false;
  }
}

// Step 5: Verify setup
async function verifySetup() {
  console.log('\n5️⃣ Verifying setup...');
  
  try {
    // Test GET /api/door/logs with token
    const response = await fetch(`${BACKEND_URL}/api/door/logs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ API access verified!');
      console.log('   Logs:', data.data?.logs?.length || 0, 'entries');
      return true;
    } else {
      const error = await response.json();
      console.log('   ⚠️ API test failed:', error.message);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Network Error:', error.message);
    return false;
  }
}

// Run all steps
async function setup() {
  const step1 = await registerUser();
  if (!step1) {
    console.log('\n❌ Setup failed at user registration');
    return;
  }
  
  const step2 = await loginUser();
  if (!step2) {
    console.log('\n❌ Setup failed at login');
    return;
  }
  
  const step3 = await registerDevice();
  if (!step3) {
    console.log('\n⚠️ Device registration failed, but continuing...');
  }
  
  const step4 = saveTokenToEnv();
  if (!step4) {
    console.log('\n⚠️ Failed to save token to .env');
  }
  
  await verifySetup();
  
  console.log('\n✅ Setup complete!\n');
  console.log('📋 Next Steps:');
  console.log('1. Restart your dev server: npm run dev');
  console.log('2. Press the bell button to test image upload');
  console.log('3. Check browser console for upload success');
  console.log('\n💡 User Credentials (for testing):');
  console.log(`   Email: ${TEST_USER.email}`);
  console.log(`   Password: ${TEST_USER.password}`);
}

setup();
