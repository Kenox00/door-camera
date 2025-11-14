#!/usr/bin/env node

/**
 * Check the actual response format from backend upload
 */

import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const JWT = envContent.match(/VITE_JWT_TOKEN=(.+)/)?.[1];
const DEVICE_ID = envContent.match(/VITE_DEVICE_ID=(.+)/)?.[1];

console.log('Testing upload to see actual response structure...\n');

// Create test image
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

const response = await fetch('http://localhost:5000/api/door/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${JWT}`,
  },
  body: formData,
});

const data = await response.json();

console.log('📦 Full Response Structure:');
console.log(JSON.stringify(data, null, 2));

console.log('\n🔍 Checking for _id field:');
console.log('data._id:', data._id);
console.log('data.data:', data.data);
console.log('data.data?._id:', data.data?._id);
console.log('data.data?.log?._id:', data.data?.log?._id);
console.log('data.data?.visitor?._id:', data.data?.visitor?._id);
