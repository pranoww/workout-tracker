import { renderHook, act } from '@testing-library/react';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { POSE_STATES, POSE_CONFIG } from '../constants/pose';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';

// Mock dependencies
vi.mock('@tensorflow-models/pose-detection', () => ({
  SupportedModels: { BlazePose: 'BlazePose' },
  createDetector: vi.fn()
}));

vi.mock('@tensorflow/tfjs-core', () => ({
  ready: vi.fn().mockResolvedValue(true)
}));

describe('usePoseDetection hook', () => {
  let mockVideoRef;
  let mockDetector;

  beforeEach(() => {
    mockVideoRef = {
      current: {
        readyState: 4,
        videoWidth: 640,
        videoHeight: 480
      }
    };

    mockDetector = {
      estimatePoses: vi.fn().mockResolvedValue([]),
      dispose: vi.fn()
    };

    poseDetection.createDetector.mockResolvedValue(mockDetector);

    // Mock requestAnimationFrame and cancelAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      // Don't actually loop in tests to avoid infinite hangs, just call once if needed, 
      // or we can manually step. For these tests, we just want to verify it was called.
      return 123;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => usePoseDetection(mockVideoRef));
    expect(result.current.poseState).toBe(POSE_STATES.INITIAL);
    expect(result.current.pose).toBeNull();
    expect(result.current.isReady).toBe(false);
    expect(result.current.isDetecting).toBe(false);
  });

  it('loads the model and transitions to ready state', async () => {
    const { result } = renderHook(() => usePoseDetection(mockVideoRef));
    
    await act(async () => {
      await result.current.initModel();
    });

    expect(tf.ready).toHaveBeenCalled();
    expect(poseDetection.createDetector).toHaveBeenCalled();
    expect(result.current.poseState).toBe(POSE_STATES.READY);
    expect(result.current.isReady).toBe(true);
  });

  it('starts detection successfully', async () => {
    const { result } = renderHook(() => usePoseDetection(mockVideoRef));
    
    // Mock valid pose to stay in DETECTING state
    mockDetector.estimatePoses.mockResolvedValue([
        {
            score: 0.9,
            keypoints: [
                { name: 'nose', x: 320, y: 240, score: 0.99 }
            ]
        }
    ]);

    // Let the first frame run and schedule the next
    window.requestAnimationFrame.mockImplementationOnce((cb) => {
        cb();
        return 123;
    });

    await act(async () => {
      await result.current.startDetection();
    });

    expect(result.current.isDetecting).toBe(true);
    expect(result.current.poseState).toBe(POSE_STATES.DETECTING);
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('handles no person detected properly', async () => {
    const { result } = renderHook(() => usePoseDetection(mockVideoRef));
    
    // Fake the loop by manually calling the detectFrame logic 
    // Since requestAnimationFrame is mocked to just return an ID, detectFrame won't auto-loop in the test unless we invoke it.
    // To test the state update, we can just start detection and see if it sets NO_PERSON when estimatePoses returns [].
    
    // We need requestAnimationFrame to actually execute the callback once so detectFrame runs.
    window.requestAnimationFrame.mockImplementationOnce((cb) => {
        cb();
        return 123;
    });

    await act(async () => {
      await result.current.startDetection();
    });

    expect(mockDetector.estimatePoses).toHaveBeenCalled();
    expect(result.current.poseState).toBe(POSE_STATES.NO_PERSON);
    expect(result.current.pose).toEqual({
        detected: false,
        confidence: 0,
        landmarks: [],
        timestamp: expect.any(Number)
    });
  });

  it('normalizes landmarks for valid pose', async () => {
    const { result } = renderHook(() => usePoseDetection(mockVideoRef));
    
    mockDetector.estimatePoses.mockResolvedValue([
        {
            score: 0.9,
            keypoints: [
                { name: 'nose', x: 320, y: 240, score: 0.99 }
            ]
        }
    ]);

    window.requestAnimationFrame.mockImplementationOnce((cb) => {
        cb();
        return 123;
    });

    await act(async () => {
      await result.current.startDetection();
    });

    expect(result.current.poseState).toBe(POSE_STATES.DETECTING);
    expect(result.current.pose.detected).toBe(true);
    expect(result.current.pose.confidence).toBe(0.9);
    // 320/640 = 0.5, 240/480 = 0.5
    expect(result.current.pose.landmarks[0]).toEqual({
        id: 'nose',
        x: 0.5,
        y: 0.5,
        z: 0,
        visibility: 0.99
    });
  });

  it('handles low confidence correctly', async () => {
    const { result } = renderHook(() => usePoseDetection(mockVideoRef));
    
    mockDetector.estimatePoses.mockResolvedValue([
        {
            score: POSE_CONFIG.MIN_POSE_CONFIDENCE - 0.1, // Below threshold
            keypoints: [
                { name: 'nose', x: 320, y: 240, score: 0.99 }
            ]
        }
    ]);

    window.requestAnimationFrame.mockImplementationOnce((cb) => {
        cb();
        return 123;
    });

    await act(async () => {
      await result.current.startDetection();
    });

    expect(result.current.poseState).toBe(POSE_STATES.LOW_CONFIDENCE);
    // Low confidence clears landmarks
    expect(result.current.pose.landmarks).toHaveLength(0);
  });

  it('stops detection and cleans up state', async () => {
    const { result } = renderHook(() => usePoseDetection(mockVideoRef));
    
    await act(async () => {
      await result.current.startDetection();
    });

    act(() => {
      result.current.stopDetection();
    });

    expect(result.current.isDetecting).toBe(false);
    expect(result.current.poseState).toBe(POSE_STATES.READY);
    expect(result.current.pose).toBeNull();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
});
