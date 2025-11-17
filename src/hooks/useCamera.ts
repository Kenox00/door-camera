import { useEffect, useRef, useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { CAMERA_CONFIG, TIMINGS } from '@/lib/config';

export const useCamera = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  
  const { setCameraReady, setError: setGlobalError } = useSessionStore();

  useEffect(() => {
    let mounted = true;

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const startCamera = async () => {
      try {
        if (!mounted) return;
        
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

        if (!mounted) {
          // Component unmounted, stop the stream
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = stream;
          
          // Wait for video to be ready
          await new Promise<void>((resolve, reject) => {
            const onLoadedMetadata = () => {
              video.play()
                .then(() => resolve())
                .catch(reject);
              cleanup();
            };
            
            const onError = () => {
              reject(new Error('Video failed to load'));
              cleanup();
            };
            
            const cleanup = () => {
              video.removeEventListener('loadedmetadata', onLoadedMetadata);
              video.removeEventListener('error', onError);
            };
            
            video.addEventListener('loadedmetadata', onLoadedMetadata);
            video.addEventListener('error', onError);
            
            // If metadata is already loaded, trigger immediately
            if (video.readyState >= 1) {
              onLoadedMetadata();
            }
          });

          if (mounted) {
            setCameraReady(true);
            setIsLoading(false);
          }
        }
      } catch (err) {
        if (!mounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
        console.error('Camera error:', errorMessage);
        setError(errorMessage);
        setGlobalError(errorMessage);
        setCameraReady(false);
        setIsLoading(false);

        // Retry after delay
        if (mounted) {
          retryTimeoutRef.current = window.setTimeout(() => {
            if (mounted) startCamera();
          }, TIMINGS.cameraRetryDelay);
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      stopCamera();
      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [videoRef, setCameraReady, setGlobalError]);

  // Expose retry function
  const retryCamera = () => {
    setIsLoading(true);
    setError(null);
    // Trigger re-mount by clearing and setting the video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // The effect will restart the camera
    window.location.reload();
  };

  return {
    isLoading,
    error,
    retryCamera,
  };
};
