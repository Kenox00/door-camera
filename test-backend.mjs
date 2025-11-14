/**
 * Test Backend Integration
 * 
 * This script tests the camera app's integration with the doorlock-backend:
 * 1. Verifies backend is running
 * 2. Tests device registration
 * 3. Simulates photo upload
 * 4. Verifies Socket.IO connection
 */

import axios from 'axios';
import { io } from 'socket.io-client';
import fs from 'fs';

const BACKEND_URL = process.env.VITE_API_URL || 'http://localhost:5000';
const TEST_DEVICE_ID = '67456789abcdef1234567890';

let authToken = null;

// Helper: Log with color
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
};

// Test 1: Health Check
async function testHealthCheck() {
  log.info('Testing backend health...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`);
    log.success(`Backend is healthy: ${response.data.message}`);
    return true;
  } catch (error) {
    log.error(`Backend health check failed: ${error.message}`);
    return false;
  }
}

// Test 2: Login
async function testLogin() {
  log.info('Testing login...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      username: 'admin',
      password: 'password123',
    });
    authToken = response.data.data.token;
    log.success(`Login successful. Token: ${authToken.slice(0, 20)}...`);
    return true;
  } catch (error) {
    log.error(`Login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 3: Check/Register Device
async function testDeviceRegistration() {
  log.info('Checking device registration...');
  try {
    // Try to get existing devices
    const response = await axios.get(`${BACKEND_URL}/api/device`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    const existingDevice = response.data.data.devices.find(
      (d) => d.espId === TEST_DEVICE_ID
    );
    
    if (existingDevice) {
      log.success(`Device already registered: ${existingDevice.name}`);
      return true;
    }
    
    // Register new device
    log.info('Registering new device...');
    const registerResponse = await axios.post(
      `${BACKEND_URL}/api/device/register`,
      {
        name: 'Camera-1',
        espId: TEST_DEVICE_ID,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    log.success(`Device registered: ${registerResponse.data.data.device.name}`);
    return true;
  } catch (error) {
    log.error(`Device registration failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 4: Upload Image
async function testImageUpload() {
  log.info('Testing image upload...');
  try {
    // Create a dummy image blob
    const buffer = Buffer.from('R0lGODlhAQABAAAAACw=', 'base64'); // 1x1 transparent GIF
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('image', buffer, { filename: 'test.jpg' });
    formData.append('deviceId', TEST_DEVICE_ID);
    
    const response = await axios.post(
      `${BACKEND_URL}/api/door/upload`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );
    
    log.success(`Image uploaded successfully!`);
    log.info(`Log ID: ${response.data.data.log._id}`);
    log.info(`Status: ${response.data.data.log.status}`);
    return response.data.data.log._id;
  } catch (error) {
    log.error(`Image upload failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Test 5: Socket.IO Connection
async function testSocketIO() {
  log.info('Testing Socket.IO connection...');
  
  return new Promise((resolve) => {
    const socket = io(BACKEND_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    
    const timeout = setTimeout(() => {
      log.error('Socket.IO connection timeout');
      socket.disconnect();
      resolve(false);
    }, 5000);
    
    socket.on('connect', () => {
      log.success(`Socket.IO connected: ${socket.id}`);
      clearTimeout(timeout);
      socket.disconnect();
      resolve(true);
    });
    
    socket.on('connect_error', (error) => {
      log.error(`Socket.IO connection error: ${error.message}`);
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

// Main test runner
async function runTests() {
  console.log('\n🚀 Starting Backend Integration Tests\n');
  console.log(`Backend URL: ${BACKEND_URL}\n`);
  
  const results = {
    health: false,
    login: false,
    device: false,
    upload: false,
    socket: false,
  };
  
  // Run tests sequentially
  results.health = await testHealthCheck();
  if (!results.health) {
    log.error('Backend is not running. Please start it first.');
    process.exit(1);
  }
  
  console.log('');
  results.login = await testLogin();
  if (!results.login) {
    log.error('Login failed. Check credentials.');
    process.exit(1);
  }
  
  console.log('');
  results.device = await testDeviceRegistration();
  
  console.log('');
  const logId = await testImageUpload();
  results.upload = !!logId;
  
  console.log('');
  results.socket = await testSocketIO();
  
  // Summary
  console.log('\n📊 Test Summary\n');
  console.log(`✅ Health Check: ${results.health ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Login: ${results.login ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Device Registration: ${results.device ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Image Upload: ${results.upload ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Socket.IO: ${results.socket ? 'PASS' : 'FAIL'}`);
  
  const allPassed = Object.values(results).every((r) => r);
  
  if (allPassed) {
    log.success('\n🎉 All tests passed! Backend integration is working correctly.');
  } else {
    log.error('\n❌ Some tests failed. Please check the errors above.');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runTests().catch((error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
