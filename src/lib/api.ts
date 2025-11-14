import axios from 'axios';
import { API_CONFIG } from './config';

export const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
});

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    visitorLogId: string; // Backend returns visitorLogId
    imageUrl: string;
    deviceName: string;
    status: 'pending' | 'granted' | 'denied';
    timestamp: string;
  };
  timestamp: string;
}

export interface LogResponse {
  success: boolean;
  data: {
    logs: Array<{
      _id: string;
      imageUrl: string;
      status: 'pending' | 'granted' | 'denied';
      timestamp: string;
      deviceId: string;
    }>;
  };
}

/**
 * Upload visitor image to backend
 * Converts base64 to blob and sends as multipart/form-data
 */
export const uploadVisitorImage = async (imageData: string): Promise<UploadResponse> => {
  console.log('📤 Starting upload to:', API_CONFIG.baseURL + API_CONFIG.uploadEndpoint);
  console.log('📦 Device ID:', API_CONFIG.deviceId);
  
  // Convert base64 to blob
  const base64Data = imageData.split(',')[1];
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/jpeg' });
  
  console.log('🖼️ Image blob size:', blob.size, 'bytes');

  // Create FormData
  const formData = new FormData();
  formData.append('image', blob, 'visitor.jpg');
  formData.append('deviceId', API_CONFIG.deviceId);
  
  console.log('📨 Sending request...');

  try {
    const response = await api.post<UploadResponse>(API_CONFIG.uploadEndpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Upload successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('URL:', error.config?.url);
    }
    throw error;
  }
};

/**
 * Get specific log by ID
 */
export const getLogById = async (logId: string): Promise<LogResponse> => {
  const response = await api.get<LogResponse>(`${API_CONFIG.logsEndpoint}/${logId}`);
  return response.data;
};
