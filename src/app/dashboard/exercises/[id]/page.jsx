"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Dumbbell, Zap, Clock, Activity, Play } from "lucide-react";
import { getExercise } from "@/api/exercises";
import { createExerciseRecommendation } from "@/api/recommendations";
import { createWorkout, addExerciseToWorkout, addSetToWorkoutExercise } from "@/api/workouts";

export default function ExerciseDetailPage({ params }) {
  const unwrappedParams = use(params);
  const exerciseId = unwrappedParams.id;
  const router = useRouter();

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [recommendation, setRecommendation] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState(null);

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchEx = async () => {
      try {
        const data = await getExercise(exerciseId);
        setExercise(data);
      } catch (err) {
        setError("Failed to load exercise details.");
      } finally {
        setLoading(false);
      }
    };
    fetchEx();
  }, [exerciseId]);

  const handleGetRecommendation = async () => {
    try {
      setRecLoading(true);
      setRecError(null);
      const data = await createExerciseRecommendation(exerciseId);
      setRecommendation(data);
    } catch (err) {
      if (err.status === 404) {
        setRecError("Profile not found. Please complete your profile setup first.");
      } else {
        setRecError(err.message || "Failed to generate recommendation. Make sure you have set up your profile.");
      }
    } finally {
      setRecLoading(false);
    }
  };

  const handleStartWorkout = async () => {
    if (!recommendation || !exercise) return;
    try {
      setCreating(true);
      // 1. Create Workout
      const workout = await createWorkout({ name: `Quick Workout: ${exercise.name}` });
      
      // 2. Add Exercise
      const workoutEx = await addExerciseToWorkout(workout.id, {
        exercise_id: exercise.id,
        order_index: 0
      });

      // 3. Add Sets
      const setsPromises = [];
      for (let i = 1; i <= recommendation.sets; i++) {
        setsPromises.push(
          addSetToWorkoutExercise(workout.id, workoutEx.id, {
            set_number: i,
            target_reps: recommendation.reps,
            target_weight_kg: recommendation.suggested_weight_kg,
            target_rest_seconds: recommendation.rest_seconds
          })
        );
      }
      await Promise.all(setsPromises);

      // 4. Redirect to execution
      router.push(`/workout/${workout.id}`);
    } catch (err) {
      setRecError(err.message || "Failed to create workout.");
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#a7354b]"></div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="p-8 text-center text-red-600">
        {error || "Exercise not found."}
      </div>
    );
  }

  return (
    <div className="text-[#1F2421] font-sans p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <Link href="/dashboard/exercises" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#1F2421] font-bold mb-6 transition">
        <ChevronLeft size={20} /> Back to Catalog
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFF2F2] rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none" />
        
        <div className="flex items-start gap-4 sm:gap-6 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-[#FFDADA] text-[#a7354b] rounded-2xl flex items-center justify-center shadow-inner">
            <Dumbbell size={32} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">{exercise.name}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm font-bold text-zinc-500 uppercase tracking-wide">
              <span className="bg-zinc-100 px-3 py-1 rounded-full">{exercise.category}</span>
              {exercise.muscle_group && <span className="bg-zinc-100 px-3 py-1 rounded-full">{exercise.muscle_group.replace('_', ' ')}</span>}
              <span className="bg-zinc-100 px-3 py-1 rounded-full">{exercise.difficulty}</span>
            </div>
          </div>
        </div>

        {exercise.description && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">Description</h3>
            <p className="text-zinc-600 leading-relaxed">{exercise.description}</p>
          </div>
        )}

        {exercise.instructions && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-2">Instructions</h3>
            <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{exercise.instructions}</p>
          </div>
        )}
      </div>

      <div className="bg-[#FFF2F2] rounded-3xl p-6 sm:p-8 border border-[#FFDADA] shadow-sm">
        <h2 className="text-2xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
          <Zap size={24} className="text-[#FF788D]" /> AI Recommendation
        </h2>
        <p className="text-zinc-600 font-medium mb-6">
          Get personalized sets, reps, and weight based on your profile and past performance.
        </p>

        {!recommendation ? (
          <button 
            onClick={handleGetRecommendation}
            disabled={recLoading}
            className="bg-[#165823] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#0E3B17] transition disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {recLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              "Generate Recommendation"
            )}
          </button>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm text-center">
                <div className="text-xs uppercase font-bold text-zinc-500 mb-1 tracking-wide">Sets</div>
                <div className="text-2xl font-black text-[#1F2421]">{recommendation.sets}</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm text-center">
                <div className="text-xs uppercase font-bold text-zinc-500 mb-1 tracking-wide">Reps</div>
                <div className="text-2xl font-black text-[#1F2421]">{recommendation.reps}</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm text-center">
                <div className="text-xs uppercase font-bold text-zinc-500 mb-1 tracking-wide">Weight</div>
                <div className="text-2xl font-black text-[#1F2421]">{recommendation.suggested_weight_kg || 'BW'} <span className="text-xs font-bold text-zinc-400">{recommendation.suggested_weight_kg ? 'kg' : ''}</span></div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm text-center">
                <div className="text-xs uppercase font-bold text-zinc-500 mb-1 tracking-wide flex items-center justify-center gap-1"><Clock size={12}/> Rest</div>
                <div className="text-2xl font-black text-[#1F2421]">{recommendation.rest_seconds} <span className="text-xs font-bold text-zinc-400">s</span></div>
              </div>
            </div>

            <button 
              onClick={handleStartWorkout}
              disabled={creating}
              className="bg-[#FF788D] text-white w-full py-4 rounded-2xl font-extrabold text-lg shadow-lg hover:bg-[#a7354b] hover:-translate-y-1 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none"
            >
              {creating ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
              ) : (
                <><Play fill="currentColor" size={20} /> Start Workout Now</>
              )}
            </button>
          </div>
        )}

        {recError && (
          <div className="mt-4 text-sm font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
            {recError}
          </div>
        )}
      </div>
    </div>
  );
}
