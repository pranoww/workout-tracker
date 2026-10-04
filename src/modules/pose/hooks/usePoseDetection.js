import { useState, useEffect, useRef, useCallback } from 'react';
import { getDetector, disposeDetector } from '../services/poseDetector';
import { normalizePose } from '../utils/normalizeLandmarks';
import { POSE_CONFIG, POSE_STATES } from '../constants/pose';

export function usePoseDetection(videoRef) {
  const [poseState, setPoseState] = useState(POSE_STATES.INITIAL);
  const [normalizedPose, setNormalizedPose] = useState(null);
  const [error, setError] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const detectorRef = useRef(null);
  const requestRef = useRef(null);
  const lastProcessTimeRef = useRef(0);
  const isDetectingRef = useRef(false);

  // Sync state with ref for render values
  useEffect(() => {
    setIsDetecting(isDetectingRef.current);
  }, [poseState]); // Piggyback on poseState changes to update render state if needed, but better to update explicitly.

  // Initialize the model
  const initModel = useCallback(async () => {
    if (detectorRef.current) return;
    
    setPoseState(POSE_STATES.LOADING);
    setError(null);
    try {
      const detector = await getDetector();
      detectorRef.current = detector;
      setPoseState(POSE_STATES.READY);
    } catch (err) {
      console.error("Pose initialization failed:", err);
      setPoseState(POSE_STATES.ERROR);
      setError("Failed to load pose detection model.");
    }
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isDetectingRef.current = false;
      setIsDetecting(false);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      disposeDetector();
      detectorRef.current = null;
    };
  }, []);

  const detectFrameRef = useRef(null);

  const detectFrame = useCallback(async () => {
    if (!isDetectingRef.current || !detectorRef.current || !videoRef.current) return;

    const video = videoRef.current;
    
    // Check if video is ready
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      requestRef.current = requestAnimationFrame(() => {
        if (detectFrameRef.current) detectFrameRef.current();
      });
      return;
    }

    const now = performance.now();
    const minFrameTime = 1000 / POSE_CONFIG.TARGET_FPS;

    if (now - lastProcessTimeRef.current >= minFrameTime) {
      try {
        // TFJS detectPoses handles the inference
        const poses = await detectorRef.current.estimatePoses(video, {
          flipHorizontal: false // Mirrored video is visually flipped in CSS, we keep raw coords here
        });

        const rawPose = poses.length > 0 ? poses[0] : null;
        const normalized = normalizePose(rawPose, video.videoWidth, video.videoHeight);
        
        setNormalizedPose(normalized);

        // Update semantic state
        if (!normalized.detected) {
          setPoseState(POSE_STATES.NO_PERSON);
        } else if (normalized.confidence < POSE_CONFIG.MIN_POSE_CONFIDENCE) {
          setPoseState(POSE_STATES.LOW_CONFIDENCE);
        } else {
          setPoseState(POSE_STATES.DETECTING);
        }

        lastProcessTimeRef.current = now;
      } catch (err) {
        console.warn("Pose detection frame error:", err);
      }
    }

    // Schedule next frame
    if (isDetectingRef.current) {
      requestRef.current = requestAnimationFrame(() => {
        if (detectFrameRef.current) detectFrameRef.current();
      });
    }
  }, [videoRef]);

  useEffect(() => {
    detectFrameRef.current = detectFrame;
  }, [detectFrame]);

  const startDetection = useCallback(async () => {
    if (!detectorRef.current) {
      await initModel();
    }
    
    if (detectorRef.current && !isDetectingRef.current) {
      isDetectingRef.current = true;
      setIsDetecting(true);
      setPoseState(POSE_STATES.DETECTING);
      detectFrameRef.current();
    }
  }, [initModel]);

  const stopDetection = useCallback(() => {
    isDetectingRef.current = false;
    setIsDetecting(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    setPoseState(POSE_STATES.READY);
    setNormalizedPose(null);
  }, []);

  return {
    poseState,
    pose: normalizedPose,
    error,
    isReady: poseState !== POSE_STATES.INITIAL && poseState !== POSE_STATES.LOADING && poseState !== POSE_STATES.ERROR,
    isDetecting,
    startDetection,
    stopDetection,
    initModel
  };
}
