import React from 'react';
import { QUALITY_STATUS } from '../constants/formAnalysis';

export default function FormMetrics({ metrics }) {
  if (!metrics) return null;

  const getMetricLabel = (key) => {
    const labels = {
      depth: "Squat Depth",
      kneeAlignment: "Knee Alignment",
      torso: "Torso Angle",
      symmetry: "Symmetry",
      romConsistency: "ROM Consistency"
    };
    return labels[key] || key;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case QUALITY_STATUS.GOOD: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case QUALITY_STATUS.MINOR_DEVIATION: return 'text-orange-600 bg-orange-50 border-orange-100';
      case QUALITY_STATUS.POOR: return 'text-red-600 bg-red-50 border-red-100';
      case QUALITY_STATUS.UNCERTAIN:
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const formatValue = (val, key) => {
    if (val === null || val === undefined) return 'N/A';
    if (key === 'torso') return `${Math.round(val)}°`;
    if (key === 'depth' || key === 'kneeAlignment' || key === 'symmetry' || key === 'romConsistency') {
      return (val * 100).toFixed(1) + '%';
    }
    return val.toString();
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
      {Object.entries(metrics).map(([key, data]) => (
        <div key={key} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{getMetricLabel(key)}</div>
          
          <div className="flex flex-col gap-1.5 mt-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block w-max uppercase ${getStatusColor(data.status)}`}>
              {data.status.replace('_', ' ')}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              Val: {formatValue(data.value, key)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
