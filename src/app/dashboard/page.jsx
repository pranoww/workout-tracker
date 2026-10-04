"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  ChevronRight,
  Eye,
  Flame,
  LayoutGrid,
  Pause,
  Play,
  Zap
} from "lucide-react";

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

export default function WorkoutSession() {
  const [activeTab, setActiveTab] = useState("Workouts");
  const [activeFilter, setActiveFilter] = useState("All (6)");
  
  const filters = ["All (6)", "Lower Body (1)", "Upper Body & Arms (4)", "Cardio (1)"];
  
  return (
    <div className="min-h-screen bg-[#f6fbf5] text-[#1F2421] pb-32 font-sans selection:bg-[#FFDADA] selection:text-[#a7354b] overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-black/5 bg-[#f6fbf5]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="w-8 h-8 rounded-lg bg-[#FF788D] flex items-center justify-center text-white"
          >
            <LayoutGrid size={18} strokeWidth={2.5} />
          </motion.div>
          <span className="font-bold text-lg tracking-tight text-[#FF788D]">PulseFit</span>
        </div>
        
        <div className="hidden md:flex items-center gap-1 bg-[#FFF2F2] p-1 rounded-full border border-[#FFDADA]/50 shadow-sm">
          {["Workouts", "Routines", "History"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? "bg-[#FFDADA] text-[#a7354b] shadow-sm"
                  : "text-[#606863] hover:text-[#1F2421]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 bg-white border border-black/5 rounded-full shadow-sm text-sm font-semibold">
            <div className="flex items-center gap-1 text-[#a7354b]">
              <Flame size={16} fill="currentColor" />
              <span>7 <span className="font-medium text-[#606863] text-xs">d streak</span></span>
            </div>
            <div className="w-[1px] h-4 bg-black/10"></div>
            <div className="flex items-center gap-1 text-[#165823]">
              <Zap size={16} fill="currentColor" />
              <span>540 <span className="font-medium text-[#606863] text-xs">kcal</span></span>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="text-[#606863] hover:text-[#1F2421] transition-colors">
            <Bell size={20} />
          </motion.button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-9 h-9 rounded-full bg-[#FFDADA] border border-[#FF788D]/20 overflow-hidden relative cursor-pointer shadow-sm">
            <Image src="https://i.pravatar.cc/150?img=47" alt="User" fill className="object-cover" />
          </motion.div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-1 sm:mb-2 text-[#1F2421]">Today's Workout Session</h1>
            <p className="text-[#606863] text-sm sm:text-base font-medium">
              6 structured exercises planned • Follow cues and track reps
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {filters.map(filter => (
              <motion.button
                key={filter}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm ${
                  activeFilter === filter
                    ? "bg-[#FF788D] text-white"
                    : "bg-[#FFF2F2] text-[#574143] hover:bg-[#FFDADA]"
                }`}
              >
                {filter}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Grid - Made responsive and cards smaller */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          
          {/* Card 1: Squats */}
          <motion.div variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 12px 24px -4px rgba(255,120,141,0.15)" }} className="bg-[#FFF2F2] border border-[#FF788D]/20 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-shadow duration-300">
            <div className="relative h-40 bg-[#fdfafb] overflow-hidden group">
              <Image src="/screen.png" alt="Squats" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-[#1F2421] flex items-center gap-1.5 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#165823]"></div>
                Form Guide
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#606863]">Lower Body • Legs</span>
                <span className="bg-[#165823]/10 text-[#165823] px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide flex items-center gap-1">
                  <Check size={10} strokeWidth={3} /> Completed
                </span>
              </div>
              <h3 className="text-lg font-bold mb-3">Squats</h3>
              
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div className="bg-white rounded-lg p-2 border border-[#FF788D]/10">
                  <div className="text-[9px] font-bold text-[#606863] uppercase tracking-wide mb-0.5">Sets & Reps</div>
                  <div className="text-sm font-bold text-[#1F2421]">4 × 12</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-[#FF788D]/10">
                  <div className="text-[9px] font-bold text-[#606863] uppercase tracking-wide mb-0.5">Volume</div>
                  <div className="text-sm font-bold text-[#165823]">48 Total</div>
                </div>
              </div>

              <div className="mt-auto">
                <div className="bg-[#165823]/10 rounded-lg p-2 px-3 flex items-center justify-between mb-3 border border-[#165823]/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#165823]">
                    <Check size={14} strokeWidth={3} /> 4/4 Sets
                  </div>
                  <span className="text-[10px] font-bold text-[#165823]">100% Target</span>
                </div>
                <motion.button whileTap={{ scale: 0.96 }} className="w-full py-2.5 bg-[#FFDADA] hover:bg-[#ffcdcd] transition-colors text-[#574143] text-sm font-bold rounded-full flex items-center justify-center gap-2">
                  <Eye size={16} /> View Summary
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Push-ups */}
          <motion.div variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 16px 32px -4px rgba(255,120,141,0.2)" }} className="bg-[#FFF2F2] border-[1.5px] border-[#FF788D]/50 rounded-2xl overflow-hidden shadow-md flex flex-col relative transition-shadow duration-300">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF788D] z-10"></div>
            <div className="relative h-40 bg-[#fdfafb] overflow-hidden group">
              <Image src="/screen2.png" alt="Push-ups" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-[#1F2421] flex items-center gap-1.5 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF788D] animate-pulse"></div>
                Active Set
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#606863]">Chest & Triceps</span>
                <span className="bg-[#FFDADA] text-[#a7354b] px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide">
                  Set 2 of 3
                </span>
              </div>
              <h3 className="text-lg font-bold mb-3">Push-ups</h3>
              
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div className="bg-white rounded-lg p-2 border border-[#FF788D]/10">
                  <div className="text-[9px] font-bold text-[#606863] uppercase tracking-wide mb-0.5">Target</div>
                  <div className="text-sm font-bold text-[#1F2421]">3 × 15</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-[#FF788D]/10">
                  <div className="text-[9px] font-bold text-[#606863] uppercase tracking-wide mb-0.5">Previous</div>
                  <div className="text-sm font-bold text-[#1F2421]">15 Done</div>
                </div>
              </div>

              <div className="mt-auto">
                <div className="bg-white rounded-lg p-2.5 flex items-center justify-between mb-3 border border-[#FF788D]/30 shadow-sm">
                  <div>
                    <div className="text-[9px] font-bold text-[#606863] uppercase tracking-wide mb-0.5">Current Reps</div>
                    <div className="font-extrabold text-xl flex items-baseline gap-1 text-[#1F2421]">
                      11 <span className="text-xs font-semibold text-[#606863]">/ 15</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <motion.button whileTap={{ scale: 0.9 }} className="w-7 h-7 rounded-full bg-[#FFDADA] hover:bg-[#ffcdcd] text-[#a7354b] flex items-center justify-center font-bold transition-colors">−</motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} className="w-7 h-7 rounded-full bg-[#FFDADA] hover:bg-[#ffcdcd] text-[#a7354b] flex items-center justify-center font-bold transition-colors">+</motion.button>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.96 }} className="w-full py-2.5 bg-[#165823] hover:bg-[#0E3B17] transition-colors text-white text-sm font-bold rounded-full flex items-center justify-center gap-2 shadow-md">
                  <Check size={16} strokeWidth={3} /> Complete Set 2
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Front Raise */}
          <motion.div variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 12px 24px -4px rgba(255,120,141,0.15)" }} className="bg-[#FFF2F2] border border-[#FF788D]/20 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-shadow duration-300">
            <div className="relative h-40 bg-[#fdfafb] overflow-hidden group">
              <Image src="/screen3.png" alt="Front Raise" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-[#1F2421] flex items-center gap-1.5 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF788D]"></div>
                Movement Guide
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#606863]">Anterior Delts</span>
                <span className="bg-[#FFDADA]/50 text-[#574143] px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide">
                  3 Planned
                </span>
              </div>
              <h3 className="text-lg font-bold mb-3">Front Raise</h3>
              
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div className="bg-white rounded-lg p-2 border border-[#FF788D]/10">
                  <div className="text-[9px] font-bold text-[#606863] uppercase tracking-wide mb-0.5">Load</div>
                  <div className="text-sm font-bold text-[#1F2421]">15 lbs</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-[#FF788D]/10">
                  <div className="text-[9px] font-bold text-[#606863] uppercase tracking-wide mb-0.5">Target</div>
                  <div className="text-sm font-bold text-[#1F2421]">10 Reps</div>
                </div>
              </div>

              <div className="mt-auto">
                <div className="bg-[#FFDADA]/30 rounded-lg p-2.5 flex gap-2 mb-3 border border-[#FFDADA]">
                  <div className="text-[#FF788D] shrink-0 mt-0.5">
                    <Zap size={14} fill="currentColor" />
                  </div>
                  <p className="text-[11px] font-medium text-[#574143] leading-snug">
                    Keep core braced, slight elbow bend at top.
                  </p>
                </div>
                <motion.button whileTap={{ scale: 0.96 }} className="w-full py-2.5 bg-[#FF788D] hover:bg-[#fa657c] transition-colors text-white text-sm font-bold rounded-full flex items-center justify-center gap-1.5 shadow-sm">
                  <Play size={14} fill="currentColor" /> Start Exercise
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Side Raise */}
          <motion.div variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 12px 24px -4px rgba(255,120,141,0.15)" }} className="bg-[#FFF2F2] border border-[#FF788D]/20 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-shadow duration-300">
            <div className="relative h-40 bg-[#fdfafb] overflow-hidden group">
              <Image src="/screen4.png" alt="Side Raise" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-[#1F2421] flex items-center gap-1.5 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF788D]"></div>
                Form Guide
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#606863]">Lateral Delts</span>
                <span className="bg-[#FFDADA]/50 text-[#574143] px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide">
                  3 Planned
                </span>
              </div>
              <h3 className="text-lg font-bold mb-3">Side Raise</h3>
              
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div className="bg-white rounded-lg p-2 border border-[#FF788D]/10">
                  <div className="text-[9px] font-bold text-[#606863] uppercase tracking-wide mb-0.5">Dumbbells</div>
                  <div className="text-sm font-bold text-[#1F2421]">12.5 lbs</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-[#FF788D]/10">
                  <div className="text-[9px] font-bold text-[#606863] uppercase tracking-wide mb-0.5">Tempo</div>
                  <div className="text-sm font-bold text-[#1F2421]">2-0-2</div>
                </div>
              </div>

              <div className="mt-auto">
                <div className="bg-white rounded-lg p-2.5 flex items-center justify-between mb-3 border border-[#FF788D]/10">
                  <span className="text-[10px] font-bold text-[#606863] uppercase tracking-wide">Progress</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map(i => (
                      <motion.div 
                        key={i} 
                        initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i*0.1 }}
                        className={`w-3.5 h-3.5 rounded-full border-2 ${i === 1 ? 'bg-[#FF788D] border-[#FF788D]' : 'border-[#FFDADA] bg-transparent'}`}
                      />
                    ))}
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.96 }} className="w-full py-2.5 bg-[#FF788D] hover:bg-[#fa657c] transition-colors text-white text-sm font-bold rounded-full flex items-center justify-center gap-1.5 shadow-sm">
                  <Play size={14} fill="currentColor" /> Start Exercise
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Card 5: Overhead Press */}
          <motion.div variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 12px 24px -4px rgba(255,120,141,0.15)" }} className="bg-[#FFF2F2] border border-[#FF788D]/20 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-shadow duration-300">
            <div className="relative h-40 bg-[#fdfafb] overflow-hidden group">
              <Image src="/screen5.png" alt="Overhead Press" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#606863]">Shoulders</span>
                <span className="bg-[#FFDADA]/50 text-[#574143] px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide">
                  4 Target
                </span>
              </div>
              <h3 className="text-lg font-bold mb-3">Overhead Press</h3>
              
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div className="bg-white rounded-lg p-2 border border-[#FF788D]/10">
                  <div className="text-[9px] font-bold text-[#606863] uppercase tracking-wide mb-0.5">Barbell</div>
                  <div className="text-sm font-bold text-[#1F2421]">45 lbs</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-[#FF788D]/10">
                  <div className="text-[9px] font-bold text-[#606863] uppercase tracking-wide mb-0.5">Sets & Reps</div>
                  <div className="text-sm font-bold text-[#1F2421]">4 × 8</div>
                </div>
              </div>

              <div className="mt-auto">
                <div className="bg-white rounded-lg p-2.5 flex items-center justify-between mb-3 border border-[#FF788D]/10">
                  <span className="text-[10px] font-bold text-[#606863] uppercase tracking-wide">Rest</span>
                  <span className="text-xs font-bold text-[#1F2421]">90s</span>
                </div>
                <motion.button whileTap={{ scale: 0.96 }} className="w-full py-2.5 bg-[#FF788D] hover:bg-[#fa657c] transition-colors text-white text-sm font-bold rounded-full flex items-center justify-center gap-1.5 shadow-sm">
                  <Play size={14} fill="currentColor" /> Start
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Card 6: Jumping Jacks */}
          <motion.div variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 12px 24px -4px rgba(255,120,141,0.15)" }} className="bg-[#FFF2F2] border border-[#FF788D]/20 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-shadow duration-300">
            <div className="relative h-40 bg-[#fdfafb] overflow-hidden group">
              <Image src="/screen6.png" alt="Jumping Jacks" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#606863] flex items-center gap-1">
                  Cardio <div className="w-1.5 h-1.5 rounded-full bg-[#165823]"></div>
                </span>
                <span className="bg-[#165823] text-white px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide">
                  Round 2 / 3
                </span>
              </div>
              <h3 className="text-lg font-bold mb-3">Jumping Jacks</h3>
              
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div className="bg-white rounded-lg p-2 border border-[#FF788D]/10">
                  <div className="text-[9px] font-bold text-[#606863] uppercase tracking-wide mb-0.5">Duration</div>
                  <div className="text-sm font-bold text-[#1F2421]">3 × 60s</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-[#FF788D]/10">
                  <div className="text-[9px] font-bold text-[#606863] uppercase tracking-wide mb-0.5">Est. Burn</div>
                  <div className="text-sm font-bold text-[#165823]">45 kcal</div>
                </div>
              </div>

              <div className="mt-auto">
                <div className="bg-white rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2 mb-3 border border-[#FF788D]/20">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full border-[2.5px] border-[#FFDADA] border-t-[#FF788D] animate-[spin_2s_linear_infinite] flex items-center justify-center"></div>
                    <div>
                      <div className="text-[10px] font-bold text-[#1F2421]">00:42 <span className="font-medium text-[9px] text-[#606863]">rem</span></div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <motion.button whileTap={{ scale: 0.9 }} className="px-2 py-1 rounded-full bg-[#FFDADA] text-[#a7354b] text-[10px] font-bold hover:bg-[#ffcdcd] transition-colors"><Pause size={10} fill="currentColor" /></motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} className="px-2 py-1 rounded-full bg-[#FFDADA] text-[#a7354b] text-[10px] font-bold hover:bg-[#ffcdcd] transition-colors">+15s</motion.button>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.96 }} className="w-full py-2.5 bg-[#165823] hover:bg-[#0E3B17] transition-colors text-white text-sm font-bold rounded-full flex items-center justify-center gap-1.5 shadow-md">
                  <Check size={14} strokeWidth={3} /> Complete
                </motion.button>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <motion.div 
          initial={{ y: 150, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.6 }}
          className="bg-white/95 backdrop-blur-xl pointer-events-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-full shadow-[0_12px_32px_-4px_rgba(31,36,33,0.12),0_4px_12px_rgba(255,120,141,0.06)] border border-[#FF788D]/10 flex items-center gap-4 sm:gap-6"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#165823] animate-pulse"></div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-[#1F2421] leading-tight">Circuit Active</div>
              <div className="text-[10px] sm:text-xs font-medium text-[#606863]">Exercise 2 of 6</div>
            </div>
          </div>
          <div className="w-[1px] h-6 bg-black/10"></div>
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FFDADA] flex items-center justify-center text-[#a7354b] hover:bg-[#ffcdcd] transition-colors">
              <Pause size={16} fill="currentColor" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#165823] hover:bg-[#0E3B17] transition-colors text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md">
              Finish <span className="hidden sm:inline">Session</span> <ChevronRight size={14} strokeWidth={3} />
            </motion.button>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
