import { Video, VideoOff, SwitchCamera } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CameraControls({ 
  isActive, 
  isLoading, 
  availableCamerasCount, 
  onStart, 
  onStop, 
  onSwitch 
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
      {!isActive ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading}
          onClick={onStart}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-md transition-colors ${
            isLoading 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-[#165823] text-white hover:bg-[#0E3B17]'
          }`}
        >
          <Video size={18} />
          {isLoading ? 'Starting...' : 'Start Camera'}
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStop}
          className="flex items-center gap-2 px-6 py-3 bg-[#FFDADA] text-[#a7354b] hover:bg-[#ffcdcd] rounded-full font-bold shadow-md transition-colors"
        >
          <VideoOff size={18} /> Stop Camera
        </motion.button>
      )}

      {isActive && availableCamerasCount > 1 && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSwitch}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full font-bold shadow-sm transition-colors"
        >
          <SwitchCamera size={18} /> Switch Camera
        </motion.button>
      )}
    </div>
  );
}
