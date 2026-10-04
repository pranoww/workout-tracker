"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { 
  CameraView, 
  CameraControls, 
  CameraStatus, 
  CameraError, 
  useCamera 
} from "@/modules/camera";
import {
  usePoseDetection,
  PoseOverlay,
  PoseStatus
} from "@/modules/pose";
import {
  useRepCounter,
  RepCounterStatus
} from "@/modules/rep-counter";

import {
  useFormAnalysis,
  FormAnalysisStatus,
  FormFeedback,
  FormMetrics
} from "@/modules/form-analysis";

export default function CameraPage() {
  const {
    videoRef,
    cameraState,
    isActive,
    isLoading,
    error,
    startCamera,
    stopCamera,
    switchCamera,
    availableCameras
  } = useCamera();

  const {
    poseState,
    pose,
    isDetecting,
    startDetection,
    stopDetection
  } = usePoseDetection(videoRef);

  // Initialize form analysis hook
  const {
    isAnalyzing,
    latestResult,
    finalizeRep
  } = useFormAnalysis('squat', pose);

  // Initialize rep counter with 'squat' for Phase 25 testing
  const {
    reps,
    state: repState,
    exercise: repExercise
  } = useRepCounter('squat', pose, (event) => {
    // Phase 25 emits event, Phase 26 finalizes rep analysis
    finalizeRep(event);
  });

  // Automatically start pose detection when camera becomes active
  useEffect(() => {
    if (isActive && !isDetecting) {
      startDetection();
    } else if (!isActive && isDetecting) {
      stopDetection();
    }
  }, [isActive, isDetecting, startDetection, stopDetection]);

  return (
    <div className="min-h-screen bg-[#f6fbf5] text-[#1F2421] pb-10 font-sans selection:bg-[#FFDADA] selection:text-[#a7354b]">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-black/5 bg-[#f6fbf5]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <span className="font-bold text-lg tracking-tight">Camera Foundation</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden flex flex-col"
        >
          {/* Header Area */}
          <div className="p-6 sm:p-8 border-b border-black/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <h1 className="text-2xl font-extrabold tracking-tight">Workout Camera</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <CameraStatus state={cameraState} />
                <PoseStatus state={poseState} />
                <RepCounterStatus reps={reps} state={repState} exercise={repExercise} />
                <FormAnalysisStatus latestResult={latestResult} isAnalyzing={isAnalyzing} />
              </div>
            </div>
            <p className="text-[#606863] text-sm font-medium">
              Position yourself clearly in the frame. Make sure your full body is visible for future pose detection.
            </p>
          </div>

          {/* Camera Area */}
          <div className="p-4 sm:p-8 bg-[#fdfafb]">
            <CameraError error={error} onRetry={() => startCamera()} />
            
            <CameraView 
              ref={videoRef} 
              isActive={isActive} 
              isLoading={isLoading} 
            >
              <PoseOverlay pose={pose} />
            </CameraView>

            <CameraControls 
              isActive={isActive}
              isLoading={isLoading}
              availableCamerasCount={availableCameras.length}
              onStart={() => startCamera()}
              onStop={stopCamera}
              onSwitch={switchCamera}
            />
          </div>
          
          {/* Form Analysis Feedback Area */}
          {latestResult && (
            <div className="p-4 sm:p-8 bg-white border-t border-black/5 flex flex-col gap-6">
              <FormFeedback feedbackList={latestResult.feedback} />
              <FormMetrics metrics={latestResult.metrics} />
            </div>
          )}
          
          {/* Privacy Note */}
          <div className="p-4 sm:px-8 sm:py-6 bg-white border-t border-black/5 text-center sm:text-left">
            <p className="text-xs text-[#606863] font-medium flex items-center justify-center sm:justify-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#165823]"></span>
              Your privacy is protected. Video frames are processed locally on your device and are never uploaded or saved.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
