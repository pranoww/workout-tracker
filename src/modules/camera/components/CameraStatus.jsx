import { CAMERA_STATES } from '../constants/camera';
import { ShieldAlert, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';

export default function CameraStatus({ state }) {
  let text = "Ready";
  let icon = null;
  let colorClass = "bg-gray-100 text-gray-700 border-gray-200";

  switch (state) {
    case CAMERA_STATES.INITIAL:
      text = "Camera is ready to start.";
      icon = null;
      break;
    case CAMERA_STATES.REQUESTING:
      text = "Requesting camera access...";
      icon = <Loader2 size={14} className="animate-spin" />;
      colorClass = "bg-blue-50 text-blue-700 border-blue-200";
      break;
    case CAMERA_STATES.GRANTED:
      text = "Camera active.";
      icon = <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>;
      colorClass = "bg-green-50 text-green-700 border-green-200";
      break;
    case CAMERA_STATES.DENIED:
      text = "Camera access denied.";
      icon = <ShieldOff size={14} />;
      colorClass = "bg-red-50 text-red-700 border-red-200";
      break;
    case CAMERA_STATES.ERROR:
    case CAMERA_STATES.UNSUPPORTED:
      text = "Camera unavailable.";
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
