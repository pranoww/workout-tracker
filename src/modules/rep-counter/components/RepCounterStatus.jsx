import React from 'react';
import { MOVEMENT_STATES } from '../constants/repCounter';
import { Activity, CheckCircle } from 'lucide-react';

export default function RepCounterStatus({ reps, state, exercise }) {
  if (!exercise || exercise === 'unknown') return null;

  const getStatusColor = () => {
    switch (state) {
      case MOVEMENT_STATES.IDLE:
        return 'bg-gray-100 text-gray-500 border-gray-200';
      case MOVEMENT_STATES.STANDING:
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case MOVEMENT_STATES.DESCENDING:
        return 'bg-orange-50 text-orange-600 border-orange-200';
      case MOVEMENT_STATES.BOTTOM:
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case MOVEMENT_STATES.ASCENDING:
        return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold capitalize transition-colors ${getStatusColor()}`}>
        <Activity size={16} className={state !== MOVEMENT_STATES.IDLE ? 'animate-pulse' : ''} />
        {state.toLowerCase()}
      </div>
      
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#165823] text-white border-2 border-[#165823] shadow-sm">
        <CheckCircle size={18} />
        <span className="font-bold">{reps}</span>
        <span className="text-sm font-medium opacity-80 uppercase tracking-wider">{exercise}</span>
      </div>
    </div>
  );
}
