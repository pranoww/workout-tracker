import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CameraError({ error, onRetry }) {
  if (!error) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3 w-full max-w-md mx-auto my-4 shadow-sm"
    >
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
        <AlertTriangle size={20} strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="text-red-800 font-bold text-sm mb-1">Camera Issue</h3>
        <p className="text-red-600 text-xs sm:text-sm">{error}</p>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-700 rounded-full text-xs font-bold hover:bg-red-50 transition-colors shadow-sm"
        >
          <RefreshCcw size={14} /> Retry
        </button>
      )}
    </motion.div>
  );
}
