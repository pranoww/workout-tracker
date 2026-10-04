import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { 
  CameraView, 
  CameraControls, 
  CameraError, 
  useCamera 
} from '../../camera';
import {
  usePoseDetection,
  PoseOverlay
} from '../../pose';
import {
  useRepCounter
} from '../../rep-counter';
import {
  useFormAnalysis,
  FormFeedback,
  FormMetrics
} from '../../form-analysis';

import { useWorkoutExecution, WORKOUT_STATES, SET_STATES } from '../hooks/useWorkoutExecution';
import { getExerciseCapabilities } from '../config/exerciseCapabilities';

// Small rest timer component
function RestTimer({ targetSeconds, onSkip }) {
  const [secondsLeft, setSecondsLeft] = useState(targetSeconds || 60);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const secs = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-[#FF788D]/20">
      <h3 className="text-xl font-bold text-[#606863] mb-4 tracking-wide">REST</h3>
      <div className="text-5xl font-extrabold text-[#1F2421] tracking-tighter mb-6">{mins}:{secs}</div>
      <button 
        onClick={onSkip}
        className="px-6 py-2.5 bg-[#FFDADA] text-[#a7354b] rounded-full font-bold hover:bg-[#ffcdcd] transition-colors"
      >
        {secondsLeft > 0 ? "Skip Rest" : "Start Next Set"}
      </button>
    </div>
  );
}

export function WorkoutExecution({ workoutId }) {
  const {
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
    actions
  } = useWorkoutExecution(workoutId);

  // Determine capabilities
  const capabilities = getExerciseCapabilities(currentExercise?.exercise_name);
  const useCameraTracking = capabilities?.cameraSupported;

  // Initialize Camera logic only if tracking is supported
  const {
    videoRef,
    isActive: isCameraActive,
    isLoading: isCameraLoading,
    error: cameraError,
    startCamera,
    stopCamera,
    switchCamera
  } = useCamera();

  const {
    pose,
    isDetecting,
    startDetection,
    stopDetection
  } = usePoseDetection(videoRef);

  // Initialize Form Analysis
  const {
    latestResult,
    finalizeRep,
    reset: resetForm
  } = useFormAnalysis(useCameraTracking ? currentExercise?.exercise_name.toLowerCase() : null, pose);

  // Initialize Rep Counter
  const {
    reps: trackedReps,
    reset: resetReps
  } = useRepCounter(
    useCameraTracking ? currentExercise?.exercise_name.toLowerCase() : null, 
    pose, 
    (event) => {
      // Pass the rep event to form analysis to calculate score
      finalizeRep(event);
    }
  );

  // Manage camera lifecycle depending on set state
  useEffect(() => {
    if (setState === SET_STATES.TRACKING && useCameraTracking) {
      if (!isCameraActive && !isCameraLoading) {
        startCamera();
      }
      if (isCameraActive && !isDetecting) {
        startDetection();
      }
    } else {
      // If we move away from TRACKING or tracking not supported, stop detection
      if (isDetecting) {
        stopDetection();
      }
      // Stop camera if we enter RESTING or REVIEW to save battery/resources
      // Actually, let's stop it during REVIEW/RESTING, and restart if they go back to TRACKING
      if (isCameraActive && (setState === SET_STATES.REVIEW || setState === SET_STATES.RESTING)) {
        stopCamera();
      }
    }
  }, [setState, useCameraTracking, isCameraActive, isCameraLoading, isDetecting, startCamera, startDetection, stopDetection, stopCamera]);

  // Clean up camera on unmount or workout complete
  useEffect(() => {
    return () => {
      stopDetection();
      stopCamera();
    };
  }, [stopDetection, stopCamera]);

  // Handle starting a set
  const onStartSet = () => {
    resetReps();
    resetForm();
    actions.startSet();
  };

  // Handle clicking "Finish Set"
  const onFinishTracking = () => {
    if (useCameraTracking) {
      // Use the tracked reps and form result
      actions.reviewSet(trackedReps, latestResult);
    } else {
      // For non-camera, default actual reps to target
      actions.reviewSet(currentSet.target_reps, null);
    }
  };

  // UI Renders based on overall state
  if (workoutState === WORKOUT_STATES.LOADING || workoutState === WORKOUT_STATES.COMPLETING) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6fbf5]">
        <div className="w-8 h-8 rounded-full border-[3px] border-[#FFDADA] border-t-[#FF788D] animate-[spin_1s_linear_infinite]" />
      </div>
    );
  }

  if (workoutState === WORKOUT_STATES.ERROR) {
    return (
      <div className="p-8 text-center bg-[#f6fbf5] min-h-screen">
        <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-[#1F2421] mb-6">{error}</p>
        <Link href="/dashboard" className="px-6 py-2 bg-[#FFDADA] rounded-full text-[#a7354b] font-bold">
          Go Back
        </Link>
      </div>
    );
  }

  if (workoutState === WORKOUT_STATES.READY) {
    return (
      <div className="min-h-screen bg-[#f6fbf5] text-[#1F2421] px-4 py-8 max-w-lg mx-auto">
        <h1 className="text-3xl font-extrabold mb-2">{workout.name}</h1>
        <p className="text-[#606863] mb-8 font-medium">Ready to start your workout?</p>
        
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 mb-8">
          <h2 className="font-bold text-lg mb-4">Exercises</h2>
          <div className="space-y-4">
            {workout.exercises.map((ex, idx) => (
              <div key={ex.id} className="flex justify-between items-center pb-4 border-b border-black/5 last:border-0 last:pb-0">
                <div>
                  <div className="font-bold">{ex.exercise_name}</div>
                  <div className="text-xs text-[#606863] mt-1">{ex.sets.length} sets</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={actions.startWorkout}
          className="w-full py-4 bg-[#FF788D] text-white rounded-full font-bold text-lg shadow-sm hover:bg-[#fa657c] transition-colors"
        >
          Start Workout
        </button>
      </div>
    );
  }

  if (workoutState === WORKOUT_STATES.COMPLETED) {
    return (
      <div className="min-h-screen bg-[#165823] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
          <Check size={40} />
        </div>
        <h1 className="text-4xl font-extrabold mb-4">Workout Complete!</h1>
        <p className="text-white/80 font-medium mb-12 max-w-sm">
          Awesome job. Your progress has been saved successfully.
        </p>
        <Link href={`/dashboard/progress?workoutId=${workout.id}`} className="px-8 py-3 bg-white text-[#165823] font-bold rounded-full hover:bg-gray-100 transition-colors">
          View Summary
        </Link>
      </div>
    );
  }

  // ACTIVE WORKOUT EXECUTION
  return (
    <div className="min-h-screen bg-[#f6fbf5] text-[#1F2421] pb-10">
      <nav className="flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-black/5">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <span className="font-bold">{workout.name}</span>
        </div>
        <div className="text-xs font-bold text-[#606863] bg-black/5 px-3 py-1 rounded-full">
          Exercise {activeExerciseIndex + 1} of {workout.exercises.length}
        </div>
      </nav>

      {error && (
        <div className="max-w-4xl mx-auto mt-4 px-4">
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex gap-3 items-start text-sm font-medium">
            <AlertCircle size={20} className="shrink-0" />
            <div className="flex-1">
              {error}
              <div className="mt-2 flex gap-2">
                <button onClick={actions.clearError} className="underline hover:no-underline">Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">
            {currentExercise.exercise_name}
          </h1>
          <div className="text-[#606863] font-medium flex gap-2 items-center text-sm">
            <span>Set {activeSetIndex + 1} of {currentExercise.sets.length}</span>
            <span className="w-1 h-1 rounded-full bg-black/20"></span>
            <span>Target: {currentSet.target_reps} reps</span>
            {currentSet.target_weight_kg > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-black/20"></span>
                <span>{currentSet.target_weight_kg} kg</span>
              </>
            )}
          </div>
        </div>

        {/* READY STATE */}
        {setState === SET_STATES.READY && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 text-center py-12">
            <h2 className="text-xl font-bold mb-6">Ready for Set {activeSetIndex + 1}?</h2>
            <button 
              onClick={onStartSet}
              className="px-8 py-3 bg-[#FF788D] text-white rounded-full font-bold text-lg shadow-sm hover:bg-[#fa657c]"
            >
              Start {useCameraTracking ? "Camera & Tracking" : "Set"}
            </button>
          </div>
        )}

        {/* TRACKING STATE */}
        {setState === SET_STATES.TRACKING && useCameraTracking && (
          <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden flex flex-col">
            <div className="p-4 bg-[#fdfafb] relative">
              <CameraError error={cameraError} onRetry={startCamera} />
              
              <CameraView ref={videoRef} isActive={isCameraActive} isLoading={isCameraLoading}>
                <PoseOverlay pose={pose} />
              </CameraView>

              <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm pointer-events-auto border border-black/5">
                  <div className="text-[10px] uppercase font-bold text-[#606863] tracking-widest mb-0.5">Reps</div>
                  <div className="text-3xl font-extrabold leading-none text-[#1F2421]">
                    {trackedReps} <span className="text-sm font-bold text-[#606863]">/ {currentSet.target_reps}</span>
                  </div>
                </div>
                
                {latestResult && (
                  <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm pointer-events-auto text-right border border-black/5">
                    <div className="text-[10px] uppercase font-bold text-[#606863] tracking-widest mb-0.5">Last Rep</div>
                    <div className="text-xl font-extrabold leading-none text-[#1F2421]">
                      {latestResult.quality} <span className="text-sm font-bold text-[#606863] ml-1">{latestResult.score}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 flex gap-4">
              <CameraControls 
                isActive={isCameraActive}
                isLoading={isCameraLoading}
                availableCamerasCount={0} // Disable camera switching during workout to prevent tracking drops
                onStart={startCamera}
                onStop={stopCamera}
                onSwitch={switchCamera}
              />
              <button 
                onClick={onFinishTracking}
                className="flex-1 py-3 bg-[#165823] text-white rounded-xl font-bold shadow-sm hover:bg-[#0E3B17] transition-colors"
              >
                Finish Set
              </button>
            </div>
            
            {trackedReps >= currentSet.target_reps && (
              <div className="px-6 pb-6 text-center text-[#165823] font-bold">
                Target reached! You can stop or keep going.
              </div>
            )}
          </div>
        )}

        {/* NON-CAMERA TRACKING STATE */}
        {setState === SET_STATES.TRACKING && !useCameraTracking && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#FFF2F2] flex items-center justify-center mx-auto mb-6">
              <div className="w-3 h-3 rounded-full bg-[#FF788D] animate-ping" />
            </div>
            <h2 className="text-xl font-bold mb-2">Set in Progress</h2>
            <p className="text-[#606863] mb-8 font-medium">Perform {currentSet.target_reps} reps</p>
            <button 
              onClick={onFinishTracking}
              className="px-8 py-3 bg-[#165823] text-white rounded-full font-bold text-lg shadow-sm hover:bg-[#0E3B17]"
            >
              Complete Set
            </button>
          </div>
        )}

        {/* REVIEW AND SAVING STATE */}
        {(setState === SET_STATES.REVIEW || setState === SET_STATES.SAVING) && (
          <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 text-center border-b border-black/5">
              <h2 className="text-2xl font-extrabold mb-2">Set Complete</h2>
              
              <div className="flex justify-center items-baseline gap-2 mb-6">
                <input 
                  type="number"
                  value={actualReps}
                  onChange={(e) => actions.reviewSet(parseInt(e.target.value) || 0, formResult)}
                  className="text-4xl font-extrabold text-[#1F2421] w-20 text-center bg-gray-50 rounded-xl p-2 border border-gray-200 outline-none focus:border-[#FF788D]"
                  disabled={setState === SET_STATES.SAVING}
                  min="0"
                />
                <span className="text-xl font-bold text-[#606863]">reps done</span>
              </div>
            </div>

            {useCameraTracking && formResult ? (
              <div className="p-4 sm:p-8 flex flex-col gap-6 bg-[#fdfafb]">
                <div className="text-center">
                  <div className="text-xs uppercase font-bold text-[#606863] tracking-widest mb-1">Overall Form</div>
                  <div className="text-3xl font-extrabold text-[#1F2421]">
                    {formResult.quality} <span className="text-xl font-bold text-[#606863]">/ {formResult.score}</span>
                  </div>
                </div>
                <FormFeedback feedbackList={formResult.feedback} />
                <FormMetrics metrics={formResult.metrics} />
              </div>
            ) : useCameraTracking && !formResult ? (
              <div className="p-8 text-center bg-[#fdfafb]">
                <p className="font-bold text-[#606863]">Form Analysis: Insufficient Data</p>
              </div>
            ) : null}

            <div className="p-6 sm:p-8 bg-white border-t border-black/5 flex gap-4 flex-col sm:flex-row">
              <button 
                onClick={actions.cancelReview}
                disabled={setState === SET_STATES.SAVING}
                className="flex-1 py-3 bg-[#f6fbf5] text-[#1F2421] rounded-xl font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 border border-black/5"
              >
                Back to Tracking
              </button>
              <button 
                onClick={() => actions.saveSet(actualReps)}
                disabled={setState === SET_STATES.SAVING}
                className="flex-1 py-3 bg-[#FF788D] text-white rounded-xl font-bold hover:bg-[#fa657c] transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {setState === SET_STATES.SAVING && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                {setState === SET_STATES.SAVING ? 'Saving...' : 'Save Set'}
              </button>
            </div>
          </div>
        )}

        {/* RESTING STATE */}
        {setState === SET_STATES.RESTING && !isLastSetInWorkout && (
          <RestTimer 
            targetSeconds={currentSet.target_rest_seconds || 60} 
            onSkip={actions.nextSet}
          />
        )}
        
        {/* EXERCISE/WORKOUT COMPLETE CHECK (shows briefly or if last set) */}
        {setState === SET_STATES.RESTING && isLastSetInWorkout && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#165823]/10 text-[#165823] flex items-center justify-center mx-auto mb-6">
              <Check size={32} strokeWidth={3} />
            </div>
            <h2 className="text-xl font-bold mb-2">All Sets Complete</h2>
            <p className="text-[#606863] mb-8 font-medium">You have finished all exercises.</p>
            <button 
              onClick={actions.nextSet} // will trigger handleCompleteWorkout
              className="px-8 py-3 bg-[#165823] text-white rounded-full font-bold text-lg shadow-sm hover:bg-[#0E3B17]"
            >
              Finish Workout
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
