import { useState, useEffect, useRef, useCallback } from 'react';
import { FormAnalysisEngine } from '../engines/FormAnalysisEngine';
import { squatFormConfig } from '../exercises/squat';
import { lungeFormConfig } from '../exercises/lunge';
import { pushupFormConfig } from '../exercises/pushup';

const EXERCISE_CONFIGS = {
  squat: squatFormConfig,
  lunge: lungeFormConfig,
  push_up: pushupFormConfig
};

export function useFormAnalysis(exerciseId, pose) {
  const [sessionResults, setSessionResults] = useState([]);
  const [latestResult, setLatestResult] = useState(null);
  
  const engineRef = useRef(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize or re-initialize engine when exercise changes
  useEffect(() => {
    if (!exerciseId || !EXERCISE_CONFIGS[exerciseId]) {
      engineRef.current = null;
      setTimeout(() => setIsAnalyzing(false), 0);
      return;
    }

    const config = EXERCISE_CONFIGS[exerciseId];
    engineRef.current = new FormAnalysisEngine(config);
    // Start tracking for the first rep
    engineRef.current.startRep(1);
    
    setTimeout(() => {
      setSessionResults([]);
      setLatestResult(null);
      setIsAnalyzing(true);
    }, 0);
  }, [exerciseId]);

  // Feed pose frames to the engine
  useEffect(() => {
    if (!engineRef.current || !pose) return;
    engineRef.current.update(pose);
  }, [pose]);

  const finalizeRep = useCallback((repEvent) => {
    if (!engineRef.current) return;
    
    const result = engineRef.current.finalizeRep(repEvent);
    
    if (result) {
      setLatestResult(result);
      setSessionResults(prev => [...prev, result]);
      
      // Start tracking the next rep immediately
      const nextRepNumber = (repEvent?.repNumber || sessionResults.length + 1) + 1;
      engineRef.current.startRep(nextRepNumber);
      setIsAnalyzing(true);
    }
  }, [sessionResults.length]);

  const reset = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.reset();
      engineRef.current.startRep(1);
      setIsAnalyzing(true);
    }
    setSessionResults([]);
    setLatestResult(null);
  }, []);

  return {
    isAnalyzing,
    latestResult,
    results: sessionResults,
    finalizeRep,
    reset
  };
}
