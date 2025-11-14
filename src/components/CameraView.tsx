import { motion } from 'framer-motion';
import { useCamera } from '@/hooks/useCamera';
import { AlertCircle, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useSessionStore } from '@/store/sessionStore';
import { EVENTS, MotionDetectedPayload, SnapshotPayload } from '@/lib/websocketEvents';
import { 
  postSnapshot, 
  getDeviceStatus, 
  notifyMotionDetected,
  type SnapshotData 
} from '@/lib/apiService';

interface CameraViewProps {
  className?: string;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const CameraView: React.FC<CameraViewProps> = ({ className, videoRef }) => {
  const { isLoading, error, retryCamera } = useCamera(videoRef);
  const { emitEvent, isConnected } = useWebSocket();
  const { 
    deviceId, 
    deviceInfo, 
    updateDeviceInfo, 
    setLastCapturedPhoto,
    setError: setStoreError 
  } = useSessionStore();
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [motionDetected, setMotionDetected] = useState(false);
  const motionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMotionTimeRef = useRef<number>(0);
  const MOTION_COOLDOWN = 5000; // 5 seconds between motion detections

  /**
   * Fetch device status on component mount
   */
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getDeviceStatus(deviceId);
        updateDeviceInfo({
          online: status.online,
          recording: status.recording,
          motion: status.motion,
          batteryLevel: status.batteryLevel,
        });
      } catch (err) {
        console.error('Failed to fetch device status:', err);
      }
    };

    fetchStatus();
  }, [deviceId, updateDeviceInfo]);

  /**
   * Handle capture snapshot request from admin
   */
  useEffect(() => {
    if (deviceInfo.captureRequested) {
      handleCaptureSnapshot();
      updateDeviceInfo({ captureRequested: false });
    }
  }, [deviceInfo.captureRequested]);

  /**
   * Capture snapshot from video stream
   */
  const captureSnapshot = useCallback((): string | null => {
    if (!videoRef.current || videoRef.current.readyState !== 4) {
      console.warn('Video not ready for capture');
      return null;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      return base64Image;
    } catch (err) {
      console.error('Error capturing snapshot:', err);
      return null;
    }
  }, [videoRef]);

  /**
   * Handle snapshot capture and upload
   */
  const handleCaptureSnapshot = useCallback(async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    try {
      const snapshot = captureSnapshot();
      if (!snapshot) {
        throw new Error('Failed to capture snapshot');
      }

      // Store locally
      setLastCapturedPhoto(snapshot);

      // Prepare snapshot data
      const snapshotData: SnapshotData = {
        deviceId,
        image: snapshot,
        timestamp: Date.now(),
        quality: 80,
        metadata: {
          width: videoRef.current?.videoWidth,
          height: videoRef.current?.videoHeight,
          format: 'image/jpeg',
          motion: motionDetected,
        },
      };

      // Upload to backend via REST
      await postSnapshot(snapshotData);

      // Emit WebSocket event
      const wsPayload: SnapshotPayload = {
        deviceId,
        timestamp: snapshotData.timestamp,
        image: snapshot,
        quality: 80,
        metadata: snapshotData.metadata,
      };
      emitEvent(EVENTS.SNAPSHOT, wsPayload);

      console.log('✅ Snapshot captured and uploaded successfully');
    } catch (err) {
      console.error('❌ Failed to capture/upload snapshot:', err);
      setStoreError('Failed to capture snapshot');
    } finally {
      setIsCapturing(false);
    }
  }, [
    isCapturing,
    captureSnapshot,
    deviceId,
    motionDetected,
    videoRef,
    setLastCapturedPhoto,
    emitEvent,
    setStoreError,
  ]);

  /**
   * Handle motion detection
   */
  const handleMotionDetection = useCallback(async () => {
    const now = Date.now();
    
    // Prevent spam - cooldown period
    if (now - lastMotionTimeRef.current < MOTION_COOLDOWN) {
      return;
    }
    
    lastMotionTimeRef.current = now;
    setMotionDetected(true);
    updateDeviceInfo({ motion: true });

    // Clear existing timeout
    if (motionTimeoutRef.current) {
      clearTimeout(motionTimeoutRef.current);
    }

    // Reset motion flag after 3 seconds
    motionTimeoutRef.current = setTimeout(() => {
      setMotionDetected(false);
      updateDeviceInfo({ motion: false });
    }, 3000);

    try {
      // Capture snapshot on motion
      const snapshot = captureSnapshot();

      // Prepare motion data
      const motionData = {
        deviceId,
        timestamp: now,
        confidence: 0.85,
        snapshot: snapshot || undefined,
      };

      // Notify backend via REST
      await notifyMotionDetected(motionData);

      // Emit WebSocket event
      const wsPayload: MotionDetectedPayload = {
        deviceId,
        timestamp: now,
        confidence: 0.85,
        snapshot,
        metadata: {
          zone: 'front-door',
          sensitivity: 75,
        },
      };
      emitEvent(EVENTS.MOTION_DETECTED, wsPayload);

      console.log('✅ Motion detected and reported');
    } catch (err) {
      console.error('❌ Failed to report motion:', err);
    }
  }, [
    deviceId,
    captureSnapshot,
    emitEvent,
    updateDeviceInfo,
    MOTION_COOLDOWN,
  ]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (motionTimeoutRef.current) {
        clearTimeout(motionTimeoutRef.current);
      }
    };
  }, []);

  // Expose motion detection function for external triggers
  // You can call this from a motion detection algorithm or button
  useEffect(() => {
    // Example: Simulate motion detection every 30 seconds (remove in production)
    // const interval = setInterval(handleMotionDetection, 30000);
    // return () => clearInterval(interval);
  }, [handleMotionDetection]);

  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} // Mirror effect
      />

      {/* Loading overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[var(--color-navy)] flex flex-col items-center justify-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Camera className="w-16 h-16 text-[var(--color-cyan)]" />
          </motion.div>
          <p className="text-white text-lg font-medium">Initializing camera...</p>
        </motion.div>
      )}

      {/* Error overlay */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 bg-[var(--color-navy)] flex flex-col items-center justify-center gap-6 p-8"
        >
          <div className="bg-red-500/20 p-6 rounded-full">
            <AlertCircle className="w-16 h-16 text-red-400" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-white text-xl font-semibold">Camera Error</h3>
            <p className="text-gray-300 text-sm max-w-md">{error}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={retryCamera}
            className="px-8 py-3 bg-[var(--color-cyan)] text-[var(--color-navy)] font-semibold rounded-xl"
          >
            Retry
          </motion.button>
        </motion.div>
      )}

      {/* Camera frame overlay */}
      {!isLoading && !error && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Corner decorations */}
          <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-[var(--color-cyan)] rounded-tl-2xl" />
          <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-[var(--color-cyan)] rounded-tr-2xl" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-[var(--color-cyan)] rounded-bl-2xl" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-[var(--color-cyan)] rounded-br-2xl" />
          
          {/* Center crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative w-24 h-24">
              <div className="absolute top-0 left-1/2 w-0.5 h-8 bg-[var(--color-cyan)]/50 -translate-x-1/2" />
              <div className="absolute bottom-0 left-1/2 w-0.5 h-8 bg-[var(--color-cyan)]/50 -translate-x-1/2" />
              <div className="absolute left-0 top-1/2 w-8 h-0.5 bg-[var(--color-cyan)]/50 -translate-y-1/2" />
              <div className="absolute right-0 top-1/2 w-8 h-0.5 bg-[var(--color-cyan)]/50 -translate-y-1/2" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
