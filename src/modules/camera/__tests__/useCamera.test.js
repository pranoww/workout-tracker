import { renderHook, act } from '@testing-library/react';
import { useCamera } from '../hooks/useCamera';
import { CAMERA_STATES, CAMERA_ERROR_MESSAGES } from '../constants/camera';

// Mock matchMedia if needed
window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};

describe('useCamera hook', () => {
  let mockGetUserMedia;
  let mockEnumerateDevices;
  let mockStream;
  let mockTrack;

  beforeEach(() => {
    mockTrack = {
      stop: vi.fn(),
      label: 'Test Camera'
    };

    mockStream = {
      getTracks: vi.fn().mockReturnValue([mockTrack]),
      getVideoTracks: vi.fn().mockReturnValue([mockTrack])
    };

    mockGetUserMedia = vi.fn().mockResolvedValue(mockStream);
    mockEnumerateDevices = vi.fn().mockResolvedValue([
      { kind: 'videoinput', deviceId: 'cam1', label: 'Test Camera' },
      { kind: 'videoinput', deviceId: 'cam2', label: 'Second Camera' }
    ]);

    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: mockGetUserMedia,
        enumerateDevices: mockEnumerateDevices,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      },
      configurable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useCamera());
    expect(result.current.cameraState).toBe(CAMERA_STATES.INITIAL);
    expect(result.current.isActive).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('starts camera successfully', async () => {
    const { result } = renderHook(() => useCamera());
    
    // Mock the video ref assignment
    result.current.videoRef.current = {
      play: vi.fn().mockResolvedValue(undefined)
    };

    await act(async () => {
      await result.current.startCamera();
    });

    expect(mockGetUserMedia).toHaveBeenCalledWith({ video: { facingMode: 'user' }, audio: false });
    expect(result.current.cameraState).toBe(CAMERA_STATES.GRANTED);
    expect(result.current.isActive).toBe(true);
    expect(result.current.stream).toBe(mockStream);
  });

  it('handles permission denied', async () => {
    const { result } = renderHook(() => useCamera());
    
    const error = new Error('NotAllowedError');
    error.name = 'NotAllowedError';
    mockGetUserMedia.mockRejectedValueOnce(error);

    await act(async () => {
      await result.current.startCamera();
    });

    expect(result.current.cameraState).toBe(CAMERA_STATES.DENIED);
    expect(result.current.isActive).toBe(false);
    expect(result.current.error).toBe(CAMERA_ERROR_MESSAGES.NotAllowedError);
  });

  it('stops camera and cleans up stream', async () => {
    const { result } = renderHook(() => useCamera());
    
    result.current.videoRef.current = {
      play: vi.fn().mockResolvedValue(undefined),
      srcObject: null
    };

    await act(async () => {
      await result.current.startCamera();
    });

    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.stopCamera();
    });

    expect(mockTrack.stop).toHaveBeenCalled();
    expect(result.current.cameraState).toBe(CAMERA_STATES.INITIAL);
    expect(result.current.isActive).toBe(false);
    expect(result.current.stream).toBeNull();
  });

  it('cleans up on unmount', async () => {
    const { result, unmount } = renderHook(() => useCamera());
    
    result.current.videoRef.current = {
      play: vi.fn().mockResolvedValue(undefined)
    };

    await act(async () => {
      await result.current.startCamera();
    });

    unmount();
    expect(mockTrack.stop).toHaveBeenCalled();
  });
  
  it('switches camera correctly', async () => {
    const { result } = renderHook(() => useCamera());
    result.current.videoRef.current = {
        play: vi.fn().mockResolvedValue(undefined)
    };

    await act(async () => {
      await result.current.startCamera();
    });
    
    // First call has 1 getTracks call when startCamera completes, but then switchCamera will call stopStream which calls getTracks again.
    
    await act(async () => {
        await result.current.switchCamera();
    });
    
    expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
    // The switch should explicitly request the deviceId
    expect(mockGetUserMedia).toHaveBeenLastCalledWith({ video: { deviceId: { exact: 'cam2' } }, audio: false });
  });
});
