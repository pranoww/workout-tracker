"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Zap,
  Activity,
  Target,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { getFitnessMetrics } from "@/api/profile";
import { getWorkouts } from "@/api/workouts";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsData, workoutsData] = await Promise.all([
          getFitnessMetrics().catch(() => null), // might be 404 if profile not created
          getWorkouts().catch(() => [])
        ]);
        
        setMetrics(metricsData);
        setWorkouts(workoutsData || []);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a7354b]"></div>
      </div>
    );
  }

  const pendingWorkouts = workouts.filter(w => w.status === "pending" || w.status === "in_progress");
  const completedWorkouts = workouts.filter(w => w.status === "completed");

  return (
    <div className="text-[#1F2421] font-sans overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      
      {/* Welcome / Metrics Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="md:col-span-2 bg-[#FFF2F2] rounded-3xl p-6 border border-[#FFDADA] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Welcome back!</h2>
          <p className="text-[#a7354b] font-medium mb-6">Ready to crush your goals today?</p>
          
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/dashboard/exercises" 
              className="bg-white text-[#1F2421] px-5 py-2.5 rounded-full font-bold shadow-sm border border-black/5 hover:bg-zinc-50 transition flex items-center gap-2"
            >
              Browse Exercises
            </Link>
            <Link 
              href="/dashboard/exercises" 
              className="bg-[#165823] text-white px-5 py-2.5 rounded-full font-bold shadow-sm hover:bg-[#0E3B17] transition flex items-center gap-2"
            >
              <Plus size={18} /> Create Workout
            </Link>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity size={18} className="text-[#FF788D]" /> 
            Fitness Snapshot
          </h3>
          {metrics ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">BMI</p>
                <p className="text-xl font-extrabold">{metrics.bmi}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">BMR</p>
                <p className="text-xl font-extrabold">{metrics.bmr} <span className="text-xs font-medium text-zinc-400">kcal</span></p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">TDEE</p>
                <p className="text-xl font-extrabold">{metrics.tdee} <span className="text-xs font-medium text-zinc-400">kcal</span></p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Target</p>
                <p className="text-xl font-extrabold text-[#165823]">{metrics.calorie_target} <span className="text-xs font-medium text-zinc-400">kcal</span></p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-zinc-500 mb-4">Complete your profile to unlock fitness metrics.</p>
              <Link href="/dashboard/profile" className="text-sm font-bold text-[#FF788D] hover:underline">
                Setup Profile
              </Link>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Workouts Section */}
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Your Workouts</h2>
        </div>

        {pendingWorkouts.length === 0 && completedWorkouts.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-black/5 shadow-sm text-center flex flex-col items-center">
            <Target size={48} className="text-zinc-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">No workouts yet</h3>
            <p className="text-zinc-500 max-w-md mx-auto mb-6">Create your first workout plan and start tracking your progress using our AI-powered camera.</p>
            <Link 
              href="/dashboard/exercises" 
              className="bg-[#FF788D] text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-[#a7354b] transition flex items-center gap-2"
            >
              <Plus size={20} /> Create Your First Workout
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingWorkouts.map(workout => (
              <motion.div key={workout.id} variants={itemVariants} className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm flex flex-col hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-[#FFF2F2] text-[#a7354b] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {workout.status.replace("_", " ")}
                  </span>
                  <span className="text-xs font-bold text-zinc-400">
                    {new Date(workout.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold mb-2">{workout.name}</h3>
                <p className="text-sm text-zinc-500 font-medium mb-6 flex-1">
                  {workout.exercises.length} exercises planned
                </p>
                <Link 
                  href={`/workout/${workout.id}`}
                  className="bg-[#1F2421] text-white w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition"
                >
                  <Play size={18} /> Resume Workout
                </Link>
              </motion.div>
            ))}

            {completedWorkouts.map(workout => (
              <motion.div key={workout.id} variants={itemVariants} className="bg-zinc-50 opacity-80 rounded-3xl p-6 border border-zinc-200 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-[#165823]/10 text-[#165823] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                    <CheckCircle2 size={12} /> Completed
                  </span>
                  <span className="text-xs font-bold text-zinc-400">
                    {workout.completed_at ? new Date(workout.completed_at).toLocaleDateString() : ""}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold mb-2 text-zinc-700">{workout.name}</h3>
                <p className="text-sm text-zinc-500 font-medium mb-6 flex-1">
                  {workout.exercises.length} exercises completed
                </p>
                <Link 
                  href={`/dashboard/progress?workoutId=${workout.id}`}
                  className="bg-white text-zinc-700 border border-zinc-200 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-100 transition"
                >
                  View Summary
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

    </div>
  );
}
