import { MOVEMENT_STATES } from '../constants/repCounter';
import { calculateAngle } from '../utils/angle';
import { POSE_CONFIG } from '../../pose/constants/pose'; // to reuse MIN_LANDMARK_CONFIDENCE

export class RepCounterEngine {
  constructor(config, onRepCompleted) {
    if (!config) throw new Error("Exercise configuration is required.");
    this.config = config;
    this.onRepCompleted = onRepCompleted || (() => {});
    
    this.reset();
  }

  reset() {
    this.reps = 0;
    this.state = MOVEMENT_STATES.IDLE;
    
    // Internal tracking variables
    this.lastRepAt = null;
    this.lastRepDurationMs = null;
    
    this.repStartTimestamp = null;
    this.lastValidTimestamp = null;
    
    // For temporal stability (holding a condition for N ms)
    this.conditionStartTimestamp = null;
    this.candidateState = null;
    
    // Minimum/Maximum tracking for movement range validation
    this.minAngleInCurrentRep = null;
    this.maxAngleInCurrentRep = null;
  }

  getSnapshot() {
    return {
      exercise: this.config.name,
      reps: this.reps,
      state: this.state,
      lastRepAt: this.lastRepAt,
      lastRepDurationMs: this.lastRepDurationMs
    };
  }

  processFrame(normalizedPose) {
    if (!normalizedPose) return this.getSnapshot();
    
    const timestamp = normalizedPose.timestamp || performance.now();

    // 1. Check pose confidence
    if (!normalizedPose.detected || normalizedPose.confidence < POSE_CONFIG.MIN_POSE_CONFIDENCE) {
      this._handleInvalidFrame(timestamp);
      return this.getSnapshot();
    }

    // 2. Extract and validate required landmarks
    const landmarks = this._mapLandmarks(normalizedPose.landmarks);
    
    // 3. Calculate primary metric (squat = knee angle)
    const angle = this._calculatePrimaryMetric(landmarks);

    if (angle === null) {
      this._handleInvalidFrame(timestamp);
      return this.getSnapshot();
    }

    // Frame is valid
    this.lastValidTimestamp = timestamp;

    // Track min/max angles for range validation
    if (this.state !== MOVEMENT_STATES.IDLE) {
      if (this.minAngleInCurrentRep === null || angle < this.minAngleInCurrentRep) {
        this.minAngleInCurrentRep = angle;
      }
      if (this.maxAngleInCurrentRep === null || angle > this.maxAngleInCurrentRep) {
        this.maxAngleInCurrentRep = angle;
      }
    }

    // 4. State Machine processing
    this._processStateMachine(angle, timestamp, normalizedPose.confidence);

    return this.getSnapshot();
  }

  _handleInvalidFrame(timestamp) {
    if (this.lastValidTimestamp !== null) {
      const gap = timestamp - this.lastValidTimestamp;
      if (gap > this.config.maxInvalidFrameGapMs) {
        // Reset state if we lost tracking for too long
        this.state = MOVEMENT_STATES.IDLE;
        this._resetConditionTracking();
      }
    }
  }

  _mapLandmarks(landmarksArray) {
    const map = {};
    landmarksArray.forEach(lm => {
      map[lm.id] = lm;
    });
    return map;
  }

  _calculatePrimaryMetric(landmarks) {
    if (this.config.calculatePrimaryMetric) {
      return this.config.calculatePrimaryMetric(landmarks);
    }
    
    // Default fallback (original squat logic)
    // We need hip, knee, ankle
    const lHip = landmarks['left_hip'];
    const lKnee = landmarks['left_knee'];
    const lAnkle = landmarks['left_ankle'];
    
    const rHip = landmarks['right_hip'];
    const rKnee = landmarks['right_knee'];
    const rAnkle = landmarks['right_ankle'];

    const leftValid = this._isLandmarkValid(lHip) && this._isLandmarkValid(lKnee) && this._isLandmarkValid(lAnkle);
    const rightValid = this._isLandmarkValid(rHip) && this._isLandmarkValid(rKnee) && this._isLandmarkValid(rAnkle);

    let leftAngle = null;
    let rightAngle = null;

    if (leftValid) {
      leftAngle = calculateAngle(lHip, lKnee, lAnkle);
    }
    if (rightValid) {
      rightAngle = calculateAngle(rHip, rKnee, rAnkle);
    }

    if (leftAngle !== null && rightAngle !== null) {
      return (leftAngle + rightAngle) / 2;
    } else if (leftAngle !== null) {
      return leftAngle;
    } else if (rightAngle !== null) {
      return rightAngle;
    }

    return null;
  }

  _isLandmarkValid(lm) {
    return lm && lm.visibility >= POSE_CONFIG.MIN_LANDMARK_CONFIDENCE;
  }

  _resetConditionTracking() {
    this.conditionStartTimestamp = null;
    this.candidateState = null;
  }

  _tryTransition(targetState, conditionMet, timestamp) {
    if (!conditionMet) {
      // Condition not met, reset stability timer if we were aiming for this state
      if (this.candidateState === targetState) {
        this._resetConditionTracking();
      }
      return false;
    }

    if (this.candidateState !== targetState) {
      // Start tracking the condition
      this.candidateState = targetState;
      this.conditionStartTimestamp = timestamp;
      
      // If no stability required, transition immediately
      if (this.config.stateTransitionStabilityMs <= 0) {
        this.state = targetState;
        this._resetConditionTracking();
        return true;
      }
      return false;
    }

    // We are already tracking this candidate. Check stability duration.
    const duration = timestamp - this.conditionStartTimestamp;
    if (duration >= this.config.stateTransitionStabilityMs) {
      this.state = targetState;
      this._resetConditionTracking();
      return true;
    }

    return false;
  }

  _processStateMachine(angle, timestamp, poseConfidence) {
    switch (this.state) {
      case MOVEMENT_STATES.IDLE:
        // Need to establish a clear standing state first
        if (this._tryTransition(MOVEMENT_STATES.STANDING, angle >= this.config.standingThreshold, timestamp)) {
          // Successfully established standing
        }
        break;

      case MOVEMENT_STATES.STANDING:
        if (this._tryTransition(MOVEMENT_STATES.DESCENDING, angle <= this.config.startDescendingThreshold, timestamp)) {
          this.repStartTimestamp = timestamp;
          this.minAngleInCurrentRep = angle;
          this.maxAngleInCurrentRep = angle;
        }
        break;

      case MOVEMENT_STATES.DESCENDING:
        // Transition to BOTTOM if angle goes below bottomThreshold
        if (this._tryTransition(MOVEMENT_STATES.BOTTOM, angle <= this.config.bottomThreshold, timestamp)) {
          // Reached bottom
        } else if (this._tryTransition(MOVEMENT_STATES.STANDING, angle >= this.config.standingThreshold, timestamp)) {
           // User aborted and stood back up, reset rep tracking silently
           this.repStartTimestamp = null;
        }
        break;

      case MOVEMENT_STATES.BOTTOM:
        if (this._tryTransition(MOVEMENT_STATES.ASCENDING, angle >= this.config.startAscendingThreshold, timestamp)) {
           // Started coming back up
        }
        break;

      case MOVEMENT_STATES.ASCENDING:
        if (this._tryTransition(MOVEMENT_STATES.STANDING, angle >= this.config.standingThreshold, timestamp)) {
          // User returned to standing. Evaluate if the rep counts.
          this._evaluateRepCompletion(timestamp, poseConfidence);
        } else if (this._tryTransition(MOVEMENT_STATES.BOTTOM, angle <= this.config.bottomThreshold, timestamp)) {
          // User aborted ascension and went back down
        }
        break;
    }
  }

  _evaluateRepCompletion(timestamp, poseConfidence) {
    if (!this.repStartTimestamp) {
      this.state = MOVEMENT_STATES.IDLE;
      return;
    }

    const durationMs = timestamp - this.repStartTimestamp;
    const movementRange = this.maxAngleInCurrentRep - this.minAngleInCurrentRep;

    // Validation 1: Duration
    if (durationMs < this.config.minRepDurationMs) {
       console.warn(`Rep rejected: duration ${durationMs}ms is too fast.`);
       this.repStartTimestamp = null;
       return;
    }

    // Validation 2: Range of motion
    if (movementRange < this.config.minMovementRange) {
       console.warn(`Rep rejected: movement range ${movementRange.toFixed(1)} is too small.`);
       this.repStartTimestamp = null;
       return;
    }

    // Passed validation!
    this.reps += 1;
    this.lastRepAt = timestamp;
    this.lastRepDurationMs = durationMs;
    this.repStartTimestamp = null; // Ready for next rep
    
    // Emit event
    this.onRepCompleted({
      type: "rep_completed",
      exercise: this.config.name,
      repNumber: this.reps,
      timestamp: timestamp,
      durationMs: durationMs,
      confidence: poseConfidence
    });
  }
}
