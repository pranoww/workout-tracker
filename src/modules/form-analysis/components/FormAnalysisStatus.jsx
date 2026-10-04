import React from 'react';
import { OVERALL_QUALITY } from '../constants/formAnalysis';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

export default function FormAnalysisStatus({ latestResult, isAnalyzing }) {
  if (!latestResult) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-gray-50 text-gray-500 border-gray-200 text-sm font-semibold transition-colors">
        <Shield size={16} className={isAnalyzing ? 'animate-pulse' : ''} />
        {isAnalyzing ? 'Analyzing form...' : 'Awaiting form data...'}
      </div>
    );
  }

  const { quality, score } = latestResult;

  let colors = 'bg-gray-50 text-gray-600 border-gray-200';
  let Icon = Shield;
  let label = 'Unknown';

  if (quality === OVERALL_QUALITY.GOOD) {
    colors = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    Icon = ShieldCheck;
    label = 'Good Form';
  } else if (quality === OVERALL_QUALITY.FAIR) {
    colors = 'bg-blue-50 text-blue-700 border-blue-200';
    Icon = ShieldCheck;
    label = 'Fair Form';
  } else if (quality === OVERALL_QUALITY.NEEDS_IMPROVEMENT) {
    colors = 'bg-orange-50 text-orange-700 border-orange-200';
    Icon = ShieldAlert;
    label = 'Needs Improvement';
  } else if (quality === OVERALL_QUALITY.POOR) {
    colors = 'bg-red-50 text-red-700 border-red-200';
    Icon = ShieldAlert;
    label = 'Poor Form';
  } else if (quality === OVERALL_QUALITY.INSUFFICIENT_DATA) {
    colors = 'bg-gray-100 text-gray-500 border-gray-300';
    Icon = Shield;
    label = 'Insufficient Data';
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold transition-colors ${colors}`}>
      <Icon size={16} />
      <span>{label}</span>
      {quality !== OVERALL_QUALITY.INSUFFICIENT_DATA && (
        <span className="ml-1 opacity-75">({score}/100)</span>
      )}
    </div>
  );
}
