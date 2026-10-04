"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Trophy, Zap, Clock, CheckCircle2, Dumbbell, Activity } from "lucide-react";
import { getWorkoutProgress } from "@/api/progress";
import { getWorkouts } from "@/api/workouts";

function ProgressContent() {
  const searchParams = useSearchParams();
  const workoutId = searchParams.get("workoutId");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (workoutId) {
          const data = await getWorkoutProgress(workoutId);
          setSummary(data);
        } else {
          const workouts = await getWorkouts();
          setHistory(workouts.filter(w => w.status === "completed").sort((a,b) => new Date(b.completed_at) - new Date(a.completed_at)));
        }
      } catch (err) {
        setError("Failed to load progress data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [workoutId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#a7354b]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (workoutId && summary) {
    return (
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#1F2421] font-bold mb-6 transition">
          <ChevronLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFF2F2] rounded-bl-full -mr-16 -mt-16 opacity-50 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-[#FFDADA] text-[#a7354b] rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Trophy size={40} />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">Workout Complete!</h1>
            <p className="text-zinc-500 font-bold">
              {summary.completed_at ? new Date(summary.completed_at).toLocaleString() : "Recently"}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
            <div className="bg-zinc-50 rounded-2xl p-4 border border-black/5 text-center">
              <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1 tracking-widest flex items-center justify-center gap-1"><CheckCircle2 size={12}/> Sets</div>
              <div className="text-2xl font-black text-[#1F2421]">{summary.completed_sets} <span className="text-sm text-zinc-400">/ {summary.total_sets}</span></div>
            </div>
            <div className="bg-zinc-50 rounded-2xl p-4 border border-black/5 text-center">
              <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1 tracking-widest flex items-center justify-center gap-1"><Zap size={12}/> Reps</div>
              <div className="text-2xl font-black text-[#1F2421]">{summary.total_actual_reps}</div>
            </div>
            <div className="bg-zinc-50 rounded-2xl p-4 border border-black/5 text-center">
              <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1 tracking-widest flex items-center justify-center gap-1"><Dumbbell size={12}/> Volume</div>
              <div className="text-2xl font-black text-[#1F2421]">{summary.total_volume_kg} <span className="text-sm text-zinc-400">kg</span></div>
            </div>
            <div className="bg-zinc-50 rounded-2xl p-4 border border-black/5 text-center">
              <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1 tracking-widest flex items-center justify-center gap-1"><Activity size={12}/> Score</div>
              <div className="text-2xl font-black text-[#1F2421]">{Math.round(summary.rep_completion_percentage)}%</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 bg-[#FF788D] rounded-xl flex items-center justify-center text-white">
          <Calendar size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Workout History</h1>
          <p className="text-zinc-500 font-medium">Your completed sessions</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-black/5 shadow-sm text-center flex flex-col items-center">
          <Clock size={48} className="text-zinc-300 mb-4" />
          <h3 className="text-xl font-bold mb-2">No history yet</h3>
          <p className="text-zinc-500 mb-6">Complete a workout to see it here.</p>
          <Link href="/dashboard/exercises" className="px-6 py-3 bg-[#165823] text-white font-bold rounded-xl">
            Start a Workout
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(w => (
            <Link 
              key={w.id} 
              href={`/dashboard/progress?workoutId=${w.id}`}
              className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-[#FF788D] transition">{w.name}</h3>
                <div className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(w.completed_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm font-bold">
                <div className="bg-[#FFF2F2] text-[#a7354b] px-3 py-1 rounded-full">
                  {w.exercises.length} Exercises
                </div>
                <ChevronRight className="text-zinc-300 group-hover:text-[#FF788D] transition" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProgressPage() {
  return (
    <div className="text-[#1F2421] font-sans p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#a7354b] mx-auto mt-20"></div>}>
        <ProgressContent />
      </Suspense>
    </div>
  );
}
