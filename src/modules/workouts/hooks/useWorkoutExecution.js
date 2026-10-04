import { useState, useCallback, useEffect } from 'react';
import { getWorkout, startWorkout, completeWorkout, completeWorkoutSet, skipWorkoutSet } from '../../../api/workouts';

export const WORKOUT_STATES = {
  LOADING: 'loading',
  READY: 'ready',
  ACTIVE: 'active',
  COMPLETING: 'completing',
  COMPLETED: 'completed',
  ERROR: 'error'
};

export const SET_STATES = {
  READY: 'ready',
  TRACKING: 'tracking',
  REVIEW: 'review',
  SAVING: 'saving',
  COMPLETED: 'completed',
  RESTING: 'resting'
};

export function useWorkoutExecution(workoutId) {
  const [workoutState, setWorkoutState] = useState(WORKOUT_STATES.LOADING);
  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState(null);

  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  
  const [setState, setSetState] = useState(SET_STATES.READY);
  
  const [actualReps, setActualReps] = useState(0);
  const [formResult, setFormResult] = useState(null);

  const findNextIncompleteSet = (workoutData) => {
    if (!workoutData || !workoutData.exercises) return;
    
    for (let eIdx = 0; eIdx < workoutData.exercises.length; eIdx++) {
      const exercise = workoutData.exercises[eIdx];
      for (let sIdx = 0; sIdx < exercise.sets.length; sIdx++) {
        const set = exercise.sets[sIdx];
        if (set.execution_status === 'pending' || set.execution_status === 'in_progress') {
          setActiveExerciseIndex(eIdx);
          setActiveSetIndex(sIdx);
          setSetState(SET_STATES.READY);
          return;
        }
      }
    }
    // If all completed
    setWorkoutState(WORKOUT_STATES.ACTIVE); // Let the UI handle completing workout
  };

  useEffect(() => {
    let mounted = true;
    const fetchWorkout = async () => {
      try {
        setWorkoutState(WORKOUT_STATES.LOADING);
        const data = await getWorkout(workoutId);
        if (mounted) {
          setWorkout(data);
          // Auto-start if it's already active on backend
          if (data.status === 'active') {
            setWorkoutState(WORKOUT_STATES.ACTIVE);
            findNextIncompleteSet(data);
          } else if (data.status === 'completed') {
            setWorkoutState(WORKOUT_STATES.COMPLETED);
          } else {
            setWorkoutState(WORKOUT_STATES.READY);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load workout');
          setWorkoutState(WORKOUT_STATES.ERROR);
        }
      }
    };

    fetchWorkout();
    return () => { mounted = false; };
  }, [workoutId]);


  const handleStartWorkout = async () => {
    try {
      setWorkoutState(WORKOUT_STATES.LOADING);
      const data = await startWorkout(workoutId);
      setWorkout(data);
      setWorkoutState(WORKOUT_STATES.ACTIVE);
      findNextIncompleteSet(data);
    } catch (err) {
      setError(err.message || 'Failed to start workout');
      setWorkoutState(WORKOUT_STATES.ERROR);
    }
  };

  const handleStartSet = () => {
    setSetState(SET_STATES.TRACKING);
    setActualReps(0);
    setFormResult(null);
  };

  const handleReviewSet = (reps, latestFormResult) => {
    setActualReps(reps);
    setFormResult(latestFormResult);
    setSetState(SET_STATES.REVIEW);
  };

  const handleSaveSet = async (overrideReps) => {
    if (!workout) return;
    const currentExercise = workout.exercises[activeExerciseIndex];
    const currentSet = currentExercise.sets[activeSetIndex];
    
    const finalReps = overrideReps !== undefined ? overrideReps : actualReps;
    
    setSetState(SET_STATES.SAVING);
    try {
      const updatedSet = await completeWorkoutSet(
        workout.id, 
        currentExercise.id, 
        currentSet.id, 
        {
          actual_reps: finalReps,
          actual_weight_kg: currentSet.target_weight_kg || 0 
        }
      );
      
      // Update local workout state
      const updatedWorkout = { ...workout };
      updatedWorkout.exercises[activeExerciseIndex].sets[activeSetIndex] = updatedSet;
      setWorkout(updatedWorkout);
      
      setSetState(SET_STATES.RESTING);
    } catch (err) {
      setError(err.message || 'Failed to save set');
      setSetState(SET_STATES.REVIEW); // Keep review state on error
    }
  };

  const handleNextSet = () => {
    if (!workout) return;
    const currentExercise = workout.exercises[activeExerciseIndex];
    
    if (activeSetIndex < currentExercise.sets.length - 1) {
      setActiveSetIndex(prev => prev + 1);
      setSetState(SET_STATES.READY);
    } else {
      // Go to next exercise if exists
      if (activeExerciseIndex < workout.exercises.length - 1) {
        setActiveExerciseIndex(prev => prev + 1);
        setActiveSetIndex(0);
        setSetState(SET_STATES.READY);
      } else {
        // Workout complete
        handleCompleteWorkout();
      }
    }
  };

  const handleCompleteWorkout = async () => {
    setWorkoutState(WORKOUT_STATES.COMPLETING);
    try {
      const data = await completeWorkout(workoutId);
      setWorkout(data);
      setWorkoutState(WORKOUT_STATES.COMPLETED);
    } catch (err) {
      setError(err.message || 'Failed to complete workout');
      setWorkoutState(WORKOUT_STATES.ACTIVE); // Revert to active so user can try again
    }
  };
  
  const currentExercise = workout?.exercises?.[activeExerciseIndex];
  const currentSet = currentExercise?.sets?.[activeSetIndex];
  const isLastSetInWorkout = workout && 
    activeExerciseIndex === workout.exercises.length - 1 && 
    activeSetIndex === currentExercise?.sets?.length - 1;

  return {
    workout,
    workoutState,
    setState,
    activeExerciseIndex,
    activeSetIndex,
    currentExercise,
    currentSet,
    error,
    actualReps,
    formResult,
    isLastSetInWorkout,
    actions: {
      startWorkout: handleStartWorkout,
      startSet: handleStartSet,
      reviewSet: handleReviewSet,
      saveSet: handleSaveSet,
      nextSet: handleNextSet,
      completeWorkout: handleCompleteWorkout,
      cancelReview: () => setSetState(SET_STATES.TRACKING),
      clearError: () => setError(null)
    }
  };
}
