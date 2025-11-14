import { useEffect, useRef, useState, useCallback } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { CAMERA_CONFIG, TIMINGS } from '@/lib/config';

export const useCamera = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  
  const { setCameraReady, setError: setGlobalError } = useSessionStore();

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setGlobalError(null);

      // Stop existing stream
      stopCamera();

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: CAMERA_CONFIG.facingMode,
          width: CAMERA_CONFIG.width,
          height: CAMERA_CONFIG.height,
          frameRate: CAMERA_CONFIG.frameRate,
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              resolve();
            };
          }
        });

        setCameraReady(true);
        setIsLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      setGlobalError(errorMessage);
      setCameraReady(false);
      setIsLoading(false);

      // Retry after delay
      retryTimeoutRef.current = setTimeout(() => {
        startCamera();
      }, TIMINGS.cameraRetryDelay);
    }
  }, [setCameraReady, setGlobalError, stopCamera]);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [startCamera, stopCamera]);

  // Monitor stream health
  useEffect(() => {
    const checkStream = () => {
      if (streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (!videoTrack || videoTrack.readyState === 'ended') {
          console.warn('Camera stream ended, restarting...');
          startCamera();
        }
      }
    };

    const interval = setInterval(checkStream, 5000);
    return () => clearInterval(interval);
  }, [startCamera]);

  return {
    isLoading,
    error,
    retryCamera: startCamera,
  };
};
