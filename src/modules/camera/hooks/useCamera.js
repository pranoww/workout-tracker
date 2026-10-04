import { useState, useEffect, useRef, useCallback } from 'react';
import { CAMERA_STATES, CAMERA_ERROR_MESSAGES } from '../constants/camera';

export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null); // Keep ref for internal cleanups
  const [stream, setStream] = useState(null); // State for rendering
  
  // Check if browser supports mediaDevices
  const isSupported = typeof window !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  const [cameraState, setCameraState] = useState(
    isSupported ? CAMERA_STATES.INITIAL : CAMERA_STATES.UNSUPPORTED
  );
  const [error, setError] = useState(
    isSupported ? null : CAMERA_ERROR_MESSAGES.UnsupportedError
  );
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);

  // Enumerate devices to find video inputs
  const getAvailableCameras = useCallback(async () => {
    if (!isSupported) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      return videoDevices;
    } catch (err) {
      console.warn("Could not enumerate devices:", err);
      return [];
    }
  }, [isSupported]);

  // Helper to completely stop the current stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setCameraState(CAMERA_STATES.INITIAL);
    setCurrentDeviceId(null);
  }, []);

  // Handle device change event
  useEffect(() => {
    if (!isSupported) return;
    
    const handleDeviceChange = () => {
      getAvailableCameras();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [isSupported, getAvailableCameras]);

  // Start the camera
  const startCamera = useCallback(async (deviceId = null) => {
    if (!isSupported) return;

    setCameraState(CAMERA_STATES.REQUESTING);
    setError(null);
    stopStream(); // Ensure any existing stream is stopped

    try {
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // The play() promise handles the actual playback start
        await videoRef.current.play().catch(e => {
            console.warn("Autoplay prevented:", e);
        });
      }

      setCameraState(CAMERA_STATES.GRANTED);
      
      // Update available cameras and current device ID once permission is granted (labels will be visible now)
      const cameras = await getAvailableCameras();
      if (cameras.length > 0) {
        const activeTrack = mediaStream.getVideoTracks()[0];
        const activeDevice = cameras.find(cam => cam.label === activeTrack.label) || cameras[0];
        setCurrentDeviceId(activeDevice.deviceId);
      }
      
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraState(CAMERA_STATES.ERROR);
      stopStream();

      // Map error to friendly message
      const errorName = err.name || 'Default';
      const friendlyMessage = CAMERA_ERROR_MESSAGES[errorName] || CAMERA_ERROR_MESSAGES.Default;
      
      if (errorName === 'NotAllowedError') {
        setCameraState(CAMERA_STATES.DENIED);
      }
      
      setError(friendlyMessage);
    }
  }, [isSupported, stopStream, getAvailableCameras]);

  const stopCamera = useCallback(() => {
    stopStream();
  }, [stopStream]);

  const switchCamera = useCallback(async () => {
    if (availableCameras.length <= 1) return;

    const currentIndex = availableCameras.findIndex(cam => cam.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];

    await startCamera(nextCamera.deviceId);
  }, [availableCameras, currentDeviceId, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    videoRef,
    stream,
    cameraState,
    isActive: cameraState === CAMERA_STATES.GRANTED,
    isLoading: cameraState === CAMERA_STATES.REQUESTING,
    isSupported,
    error,
    startCamera,
    stopCamera,
    switchCamera,
    availableCameras,
    currentDeviceId
  };
}
