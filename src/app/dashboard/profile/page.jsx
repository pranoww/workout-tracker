"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProfile, createProfile, updateProfile } from "@/api/profile";
import { 
  User, 
  Activity, 
  Target, 
  Dumbbell, 
  Calendar,
  Save,
  ArrowRight,
  Edit2,
  AlertCircle
} from "lucide-react";

const GENDERS = ["male", "female", "other"];
const FITNESS_LEVELS = ["beginner", "intermediate", "advanced"];
const EXPERIENCES = ["none", "less_than_1_year", "1_to_3_years", "more_than_3_years"];
const ACTIVITY_LEVELS = ["sedentary", "lightly_active", "moderately_active", "very_active", "super_active"];
const GOALS = ["weight_loss", "muscle_gain", "endurance", "general_fitness"];
const EQUIPMENT = ["home_gym", "full_gym"];

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("view"); // 'view', 'setup', 'edit'
  
  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    height_cm: "",
    weight_kg: "",
    fitness_level: "beginner",
    training_experience: "none",
    activity_level: "sedentary",
    goal: "general_fitness",
    training_days_per_week: 3,
    session_duration_minutes: 45,
    equipment: "home_gym"
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data);
        const mappedData = { ...data };
        if (Array.isArray(mappedData.equipment)) {
          mappedData.equipment = mappedData.equipment.length > 0 ? mappedData.equipment[0] : "home_gym";
        }
        setFormData(mappedData);
        setMode("view");
      })
      .catch((err) => {
        if (err.status === 404) {
          setMode("setup");
        } else {
          setError(err.message || "Failed to load profile");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    getProfile()
      .then((data) => {
        setProfile(data);
        const mappedData = { ...data };
        if (Array.isArray(mappedData.equipment)) {
          mappedData.equipment = mappedData.equipment.length > 0 ? mappedData.equipment[0] : "home_gym";
        }
        setFormData(mappedData);
        setMode("view");
      })
      .catch((err) => {
        if (err.status === 404) {
          setMode("setup");
        } else {
          setError(err.message || "Failed to load profile");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let parsedValue = value;
    if (type === "number") {
      parsedValue = value === "" ? "" : Number(value);
    }
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // Clean data to send only correct types
      const payload = {
        ...formData,
        age: Number(formData.age),
        height_cm: Number(formData.height_cm),
        weight_kg: Number(formData.weight_kg),
        training_days_per_week: Number(formData.training_days_per_week),
        session_duration_minutes: Number(formData.session_duration_minutes),
        equipment: Array.isArray(formData.equipment) ? formData.equipment : [formData.equipment],
      };

      let updatedData;
      if (mode === "setup") {
        updatedData = await createProfile(payload);
      } else if (mode === "edit") {
        // Send only changed fields could be implemented here,
        // but for simplicity and safety we'll send the full payload or compute diff
        const changedFields = {};
        for (const key in payload) {
          if (JSON.stringify(payload[key]) !== JSON.stringify(profile[key])) {
            changedFields[key] = payload[key];
          }
        }
        
        if (Object.keys(changedFields).length === 0) {
          setMode("view");
          setSaving(false);
          return;
        }
        
        updatedData = await updateProfile(changedFields);
      }

      setProfile(updatedData);
      
      const mappedData = { ...updatedData };
      if (Array.isArray(mappedData.equipment)) {
        mappedData.equipment = mappedData.equipment.length > 0 ? mappedData.equipment[0] : "home_gym";
      }
      setFormData(mappedData);
      
      setMode("view");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6fbf5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a7354b]"></div>
      </div>
    );
  }

  if (error && mode === "view") {
    return (
      <div className="min-h-screen bg-[#f6fbf5] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-[#1F2421] mb-2">Oops! Something went wrong</h2>
        <p className="text-zinc-600 mb-6">{error}</p>
        <button 
          onClick={handleRetry}
          className="px-6 py-3 bg-[#165823] text-white font-bold rounded-xl shadow-md hover:bg-[#0E3B17] transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const renderField = (label, name, type = "text", options = null) => {
    if (options) {
      return (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-zinc-700 capitalize">
            {label.replace(/_/g, " ")}
          </label>
          <select
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            disabled={mode === "view"}
            className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none transition focus:border-[#FF788D] focus:ring-2 focus:ring-[#FFDADA] disabled:bg-zinc-50 disabled:text-zinc-500 appearance-none"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-zinc-700 capitalize">
          {label.replace(/_/g, " ")}
        </label>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          disabled={mode === "view"}
          min={type === "number" ? 0 : undefined}
          required
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none transition focus:border-[#FF788D] focus:ring-2 focus:ring-[#FFDADA] disabled:bg-zinc-50 disabled:text-zinc-500"
        />
      </div>
    );
  };

  return (
    <div className="text-[#1F2421] font-sans">

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-zinc-100 relative overflow-hidden"
        >
          {/* Background decorative blob */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-[#FFDADA]/50 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                {mode === "setup" ? "Set up your profile" : mode === "edit" ? "Edit Profile" : "Your Fitness Profile"}
              </h1>
              <p className="text-zinc-500 font-medium">
                {mode === "setup" 
                  ? "Let's personalize your experience with some quick details." 
                  : "Manage your personal statistics and goals."}
              </p>
            </div>
            {mode === "view" && (
              <button
                onClick={() => setMode("edit")}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-full shadow-sm text-sm font-semibold text-[#1F2421] hover:bg-zinc-50 transition"
              >
                <Edit2 size={16} /> Edit
              </button>
            )}
          </div>

          <AnimatePresence>
            {error && mode !== "view" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 border border-red-100"
              >
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            {saveSuccess && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-[#FFF2F2] text-[#a7354b] rounded-xl flex items-center gap-3 border border-[#FFDADA]"
              >
                <Target size={20} className="shrink-0" />
                <span className="text-sm font-bold">Profile updated successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
            
            {/* Section: Basic Info */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <User size={18} className="text-[#FF788D]" />
                <h3 className="text-lg font-bold text-[#1F2421]">Basic Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {renderField("Age (years)", "age", "number")}
                {renderField("Gender", "gender", "text", GENDERS)}
                {renderField("Height (cm)", "height_cm", "number")}
                {renderField("Weight (kg)", "weight_kg", "number")}
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            {/* Section: Fitness Level */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={18} className="text-[#FF788D]" />
                <h3 className="text-lg font-bold text-[#1F2421]">Experience & Activity</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {renderField("Fitness Level", "fitness_level", "text", FITNESS_LEVELS)}
                {renderField("Training Experience", "training_experience", "text", EXPERIENCES)}
                <div className="sm:col-span-2">
                  {renderField("Daily Activity Level", "activity_level", "text", ACTIVITY_LEVELS)}
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            {/* Section: Goals & Training */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Target size={18} className="text-[#FF788D]" />
                <h3 className="text-lg font-bold text-[#1F2421]">Goals & Training</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  {renderField("Primary Goal", "goal", "text", GOALS)}
                </div>
                {renderField("Training Days/Week", "training_days_per_week", "number")}
                {renderField("Session Duration (min)", "session_duration_minutes", "number")}
                <div className="sm:col-span-2">
                  {renderField("Available Equipment", "equipment", "text", EQUIPMENT)}
                </div>
              </div>
            </div>

            {/* Actions */}
            {(mode === "setup" || mode === "edit") && (
              <div className="pt-6 flex items-center justify-end gap-4 border-t border-zinc-100">
                {mode === "edit" && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(profile);
                      setMode("view");
                      setError(null);
                    }}
                    className="px-6 py-3 rounded-xl font-bold text-zinc-600 hover:bg-zinc-100 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-[#165823] text-white font-bold rounded-xl shadow-md hover:bg-[#0E3B17] transition disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : mode === "setup" ? (
                    <>Complete Setup <ArrowRight size={18} /></>
                  ) : (
                    <>Save Changes <Save size={18} /></>
                  )}
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </main>
    </div>
  );
}
