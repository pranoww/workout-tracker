import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormAnalysis } from '../hooks/useFormAnalysis';

describe('useFormAnalysis hook', () => {
  const createPose = () => ({
    detected: true,
    confidence: 0.9,
    timestamp: performance.now(),
    landmarks: [
      { id: 'left_shoulder', x: 0.4, y: 0.2, visibility: 0.9 },
      { id: 'right_shoulder', x: 0.6, y: 0.2, visibility: 0.9 },
      { id: 'left_hip', x: 0.4, y: 0.5, visibility: 0.9 },
      { id: 'right_hip', x: 0.6, y: 0.5, visibility: 0.9 },
      { id: 'left_knee', x: 0.4, y: 0.7, visibility: 0.9 },
      { id: 'right_knee', x: 0.6, y: 0.7, visibility: 0.9 },
      { id: 'left_ankle', x: 0.4, y: 0.9, visibility: 0.9 },
      { id: 'right_ankle', x: 0.6, y: 0.9, visibility: 0.9 },
    ]
  });

  it('initializes correctly with exercise', async () => {
    const { result } = renderHook(() => useFormAnalysis('squat', null));
    
    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(true);
    });
    expect(result.current.latestResult).toBeNull();
    expect(result.current.results).toEqual([]);
  });

  it('processes pose updates and finalizes rep', () => {
    const { result, rerender } = renderHook(
      ({ pose }) => useFormAnalysis('squat', pose),
      { initialProps: { pose: null } }
    );

    // Feed frames
    act(() => rerender({ pose: createPose() }));
    act(() => rerender({ pose: createPose() }));
    act(() => rerender({ pose: createPose() }));

    act(() => {
      result.current.finalizeRep({ repNumber: 1 });
    });

    expect(result.current.latestResult).not.toBeNull();
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].repNumber).toBe(1);
    
    // Engine should automatically start tracking rep 2
    expect(result.current.isAnalyzing).toBe(true);
  });

  it('handles unknown exercise config gracefully', async () => {
    const { result } = renderHook(() => useFormAnalysis('invalid_exercise', null));
    
    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });
  });
});
