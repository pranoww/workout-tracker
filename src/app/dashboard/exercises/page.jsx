"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Dumbbell, Search, ChevronRight, Activity } from "lucide-react";
import { getExercises } from "@/api/exercises";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  
  useEffect(() => {
    const fetchEx = async () => {
      try {
        setLoading(true);
        const data = await getExercises({ category: category || undefined });
        setExercises(data);
      } catch (err) {
        setError("Failed to load exercises");
      } finally {
        setLoading(false);
      }
    };
    fetchEx();
  }, [category]);

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(search.toLowerCase()) || 
    (ex.muscle_group && ex.muscle_group.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="text-[#1F2421] font-sans p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Exercise Catalog</h1>
        <p className="text-zinc-500 font-medium">Browse exercises and get personalized recommendations.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input 
            type="text" 
            placeholder="Search exercises..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-[#FFDADA] focus:border-[#FF788D] transition"
          />
        </div>
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 bg-white border border-black/5 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-[#FFDADA] focus:border-[#FF788D] transition sm:w-48"
        >
          <option value="">All Categories</option>
          <option value="strength">Strength</option>
          <option value="cardio">Cardio</option>
          <option value="flexibility">Flexibility</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#a7354b]"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExercises.map(ex => (
            <Link 
              key={ex.id}
              href={`/dashboard/exercises/${ex.id}`}
              className="group bg-white p-5 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFF2F2] text-[#FF788D] rounded-xl flex items-center justify-center">
                  <Dumbbell size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{ex.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                    <span className="uppercase tracking-wide">{ex.category}</span>
                    {ex.muscle_group && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                        <span className="capitalize">{ex.muscle_group.replace('_', ' ')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="text-zinc-300 group-hover:text-[#FF788D] transition" />
            </Link>
          ))}
          {filteredExercises.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-500">
              No exercises found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
