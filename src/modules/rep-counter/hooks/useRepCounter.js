import { useState, useEffect, useRef, useCallback } from 'react';
import { RepCounterEngine } from '../engines/RepCounterEngine';
import { squatConfig } from '../exercises/squat';
import { lungeConfig } from '../exercises/lunge';
import { pushupConfig } from '../exercises/pushup';
import { MOVEMENT_STATES } from '../constants/repCounter';

// Extensible map of supported exercises
const EXERCISE_CONFIGS = {
  squat: squatConfig,
  lunge: lungeConfig,
  push_up: pushupConfig
};

export function useRepCounter(exerciseId, pose, onRepCompleted) {
  const [snapshot, setSnapshot] = useState({
    exercise: exerciseId || 'unknown',
    reps: 0,
    state: MOVEMENT_STATES.IDLE,
    lastRepAt: null,
    lastRepDurationMs: null
  });

  const engineRef = useRef(null);
  
  // To avoid stale closures in the callback without causing re-instantiation
  const onRepCompletedRef = useRef(onRepCompleted);
  useEffect(() => {
    onRepCompletedRef.current = onRepCompleted;
  }, [onRepCompleted]);

  // Initialize or re-initialize engine when exercise changes
  useEffect(() => {
    if (!exerciseId || !EXERCISE_CONFIGS[exerciseId]) {
      engineRef.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSnapshot(prev => ({ ...prev, exercise: exerciseId, state: MOVEMENT_STATES.IDLE }));
      return;
    }

    const config = EXERCISE_CONFIGS[exerciseId];
    engineRef.current = new RepCounterEngine(config, (event) => {
      if (onRepCompletedRef.current) {
        onRepCompletedRef.current(event);
      }
    });
    setSnapshot(engineRef.current.getSnapshot());
  }, [exerciseId]);

  // Process pose frames
  useEffect(() => {
    if (!engineRef.current || !pose) return;

    // The engine processes the frame synchronously and deterministically
    const newSnapshot = engineRef.current.processFrame(pose);
    
    setSnapshot(prev => {
      // Only update state if something changed to avoid excessive re-renders
      if (
        prev.reps !== newSnapshot.reps ||
        prev.state !== newSnapshot.state ||
        prev.lastRepAt !== newSnapshot.lastRepAt ||
        prev.exercise !== newSnapshot.exercise
      ) {
        return newSnapshot;
      }
      return prev;
    });
  }, [pose]); // Runs every time pose object changes

  const reset = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.reset();
      setSnapshot(engineRef.current.getSnapshot());
    }
  }, []);

  return {
    ...snapshot,
    reset
  };
}
