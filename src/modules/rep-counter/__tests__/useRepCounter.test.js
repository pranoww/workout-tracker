import { renderHook, act } from '@testing-library/react';
import { useRepCounter } from '../hooks/useRepCounter';
import { MOVEMENT_STATES } from '../constants/repCounter';

describe('useRepCounter hook', () => {
  let onRepCompleted;
  
  beforeEach(() => {
    onRepCompleted = vi.fn();
  });

  const createPose = (angle) => {
    const rad = (180 - angle) * (Math.PI / 180);
    const ankleY = 1 + Math.cos(rad);
    const ankleX = Math.sin(rad);

    return {
      detected: true,
      confidence: 0.9,
      timestamp: performance.now(),
      landmarks: [
        { id: 'left_hip', x: 0, y: 0, visibility: 0.9 },
        { id: 'left_knee', x: 0, y: 1, visibility: 0.9 },
        { id: 'left_ankle', x: ankleX, y: ankleY, visibility: 0.9 },
        { id: 'right_hip', x: 0, y: 0, visibility: 0.9 },
        { id: 'right_knee', x: 0, y: 1, visibility: 0.9 },
        { id: 'right_ankle', x: ankleX, y: ankleY, visibility: 0.9 }
      ]
    };
  };

  it('initializes correctly with exercise', () => {
    const { result } = renderHook(() => useRepCounter('squat', null, onRepCompleted));
    expect(result.current.exercise).toBe('squat');
    expect(result.current.reps).toBe(0);
    expect(result.current.state).toBe(MOVEMENT_STATES.IDLE);
  });

  it('handles unknown exercise config gracefully', () => {
    const { result } = renderHook(() => useRepCounter('invalid_exercise', null, onRepCompleted));
    expect(result.current.exercise).toBe('invalid_exercise');
    expect(result.current.state).toBe(MOVEMENT_STATES.IDLE);
    
    // Passing a pose shouldn't crash
    const { rerender } = renderHook(
      ({ pose }) => useRepCounter('invalid_exercise', pose, onRepCompleted),
      { initialProps: { pose: createPose(160) } }
    );
    expect(() => rerender({ pose: createPose(160) })).not.toThrow();
  });

  it('processes pose updates and calls onRepCompleted', () => {
    const { result, rerender } = renderHook(
      ({ pose }) => useRepCounter('squat', pose, onRepCompleted),
      { initialProps: { pose: null } }
    );

    // Initial state
    expect(result.current.state).toBe(MOVEMENT_STATES.IDLE);

    // Provide enough frames to satisfy the 150ms stateTransitionStabilityMs requirement
    act(() => rerender({ pose: { ...createPose(160), timestamp: 1000 } }));
    act(() => rerender({ pose: { ...createPose(160), timestamp: 1200 } })); // STANDING

    act(() => rerender({ pose: { ...createPose(130), timestamp: 1500 } }));
    act(() => rerender({ pose: { ...createPose(130), timestamp: 1700 } })); // DESCENDING

    act(() => rerender({ pose: { ...createPose(80), timestamp: 2000 } }));
    act(() => rerender({ pose: { ...createPose(80), timestamp: 2200 } })); // BOTTOM

    act(() => rerender({ pose: { ...createPose(120), timestamp: 2500 } }));
    act(() => rerender({ pose: { ...createPose(120), timestamp: 2700 } })); // ASCENDING

    act(() => rerender({ pose: { ...createPose(160), timestamp: 3000 } }));
    act(() => rerender({ pose: { ...createPose(160), timestamp: 3200 } })); // STANDING -> REP

    expect(result.current.reps).toBe(1);
    expect(result.current.state).toBe(MOVEMENT_STATES.STANDING);
    expect(onRepCompleted).toHaveBeenCalledTimes(1);
  });

  it('reset() clears state', () => {
    const { result, rerender } = renderHook(
      ({ pose }) => useRepCounter('squat', pose, onRepCompleted),
      { initialProps: { pose: null } }
    );

    // Fast-forward to one rep
    act(() => rerender({ pose: { ...createPose(160), timestamp: 1000 } }));
    act(() => rerender({ pose: { ...createPose(160), timestamp: 1200 } }));
    
    act(() => rerender({ pose: { ...createPose(130), timestamp: 1500 } }));
    act(() => rerender({ pose: { ...createPose(130), timestamp: 1700 } }));
    
    act(() => rerender({ pose: { ...createPose(80), timestamp: 2000 } }));
    act(() => rerender({ pose: { ...createPose(80), timestamp: 2200 } }));
    
    act(() => rerender({ pose: { ...createPose(120), timestamp: 2500 } }));
    act(() => rerender({ pose: { ...createPose(120), timestamp: 2700 } }));
    
    act(() => rerender({ pose: { ...createPose(160), timestamp: 3000 } }));
    act(() => rerender({ pose: { ...createPose(160), timestamp: 3200 } }));

    expect(result.current.reps).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.reps).toBe(0);
    expect(result.current.state).toBe(MOVEMENT_STATES.IDLE);
  });
});
