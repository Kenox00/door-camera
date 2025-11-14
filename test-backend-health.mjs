#!/usr/bin/env node

/**
 * Quick Backend Health Check
 */

const BACKEND_URL = 'http://localhost:5000';

console.log('🏥 Checking backend health...\n');

// Test 1: Basic connectivity
console.log('1️⃣ Testing basic connectivity...');
try {
  const response = await fetch(`${BACKEND_URL}/api/door/logs`);
  console.log(`   Status: ${response.status} ${response.statusText}`);
  
  if (response.status === 401) {
    console.log('   ✅ Backend is running and requires authentication');
  } else {
    console.log('   ⚠️ Unexpected status code');
  }
} catch (error) {
  console.log('   ❌ Backend not reachable:', error.message);
  console.log('\n💡 Make sure backend is running:');
  console.log('   cd doorlock-backend');
  console.log('   npm start');
  process.exit(1);
}

console.log('\n✅ Backend is running and accessible!');
