import { POSE_STATES } from '../constants/pose';
import { Activity, Loader2, AlertCircle, UserMinus, ShieldAlert } from 'lucide-react';

export default function PoseStatus({ state }) {
  let text = "Pose Detector Ready";
  let icon = null;
  let colorClass = "bg-gray-100 text-gray-700 border-gray-200";

  switch (state) {
    case POSE_STATES.INITIAL:
    case POSE_STATES.READY:
      text = "Pose Detector Ready";
      break;
    case POSE_STATES.LOADING:
      text = "Loading pose model...";
      icon = <Loader2 size={14} className="animate-spin" />;
      colorClass = "bg-blue-50 text-blue-700 border-blue-200";
      break;
    case POSE_STATES.DETECTING:
      text = "Tracking Pose";
      icon = <Activity size={14} />;
      colorClass = "bg-green-50 text-green-700 border-green-200";
      break;
    case POSE_STATES.NO_PERSON:
      text = "No Person Detected";
      icon = <UserMinus size={14} />;
      colorClass = "bg-orange-50 text-orange-700 border-orange-200";
      break;
    case POSE_STATES.LOW_CONFIDENCE:
      text = "Low Confidence";
      icon = <AlertCircle size={14} />;
      colorClass = "bg-orange-50 text-orange-700 border-orange-200";
      break;
    case POSE_STATES.ERROR:
      text = "Model Error";
      icon = <ShieldAlert size={14} />;
      colorClass = "bg-red-50 text-red-700 border-red-200";
      break;
    default:
      break;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm transition-colors ${colorClass}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
}
