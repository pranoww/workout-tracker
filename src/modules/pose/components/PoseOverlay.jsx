import { SKELETON_CONNECTIONS, POSE_CONFIG } from '../constants/pose';

export default function PoseOverlay({ pose }) {
  if (!pose || !pose.detected || pose.landmarks.length === 0) return null;

  // We only draw if the pose confidence meets the threshold. 
  // (The hook already handles this, but defensive programming is good)
  if (pose.confidence < POSE_CONFIG.MIN_POSE_CONFIDENCE) return null;

  // Map landmarks by ID for easy connection lookups
  const landmarkMap = {};
  pose.landmarks.forEach(lm => {
    landmarkMap[lm.id] = lm;
  });

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
    >
      {/* Draw Connections (Bones) */}
      {SKELETON_CONNECTIONS.map(([id1, id2], idx) => {
        const lm1 = landmarkMap[id1];
        const lm2 = landmarkMap[id2];
        
        // Only draw connection if both landmarks exist and meet visibility threshold
        if (
          !lm1 || !lm2 || 
          lm1.visibility < POSE_CONFIG.MIN_LANDMARK_CONFIDENCE || 
          lm2.visibility < POSE_CONFIG.MIN_LANDMARK_CONFIDENCE
        ) {
          return null;
        }

        return (
          <line
            key={`bone-${idx}`}
            x1={`${lm1.x * 100}`}
            y1={`${lm1.y * 100}`}
            x2={`${lm2.x * 100}`}
            y2={`${lm2.y * 100}`}
            stroke="rgba(0, 255, 127, 0.7)"
            strokeWidth="0.8"
          />
        );
      })}

      {/* Draw Landmarks (Joints) */}
      {pose.landmarks.map((lm, idx) => {
        if (lm.visibility < POSE_CONFIG.MIN_LANDMARK_CONFIDENCE) return null;
        
        return (
          <circle
            key={`joint-${idx}`}
            cx={`${lm.x * 100}`}
            cy={`${lm.y * 100}`}
            r="1"
            fill="white"
            stroke="rgba(0, 255, 127, 0.9)"
            strokeWidth="0.3"
          />
        );
      })}
    </svg>
  );
}
