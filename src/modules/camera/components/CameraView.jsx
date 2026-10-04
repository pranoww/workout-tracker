import { forwardRef } from 'react';
import { Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const CameraView = forwardRef(({ isActive, isLoading, children }, ref) => {
  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[4/3] sm:aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border-2 border-black/5">
      {/* Fallback View when inactive */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-[#fdfafb] z-10">
          {isLoading ? (
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#FF788D] animate-[spin_1s_linear_infinite]" />
              <span className="font-semibold text-sm">Accessing camera...</span>
            </motion.div>
          ) : (
            <>
              <Camera size={48} className="opacity-20 mb-3" />
              <p className="font-medium">Camera is inactive</p>
            </>
          )}
        </div>
      )}

      {/* Video Element */}
      <video
        ref={ref}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Overlays */}
      {isActive && children}
    </div>
  );
});

CameraView.displayName = 'CameraView';

export default CameraView;
