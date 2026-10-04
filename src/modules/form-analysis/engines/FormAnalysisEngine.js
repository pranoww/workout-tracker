import { QUALITY_STATUS, OVERALL_QUALITY, METRIC_WEIGHTS, METRIC_SCORES } from '../constants/formAnalysis';
import { calculateTorsoAngle } from '../utils/torsoAngle';
import { calculateKneeAlignment, calculateReferenceWidth } from '../utils/kneeAlignment';
import { calculateSquatDepth, calculateReferenceLength } from '../utils/depth';
import { calculateSymmetry } from '../utils/symmetry';
import { POSE_CONFIG } from '../../pose/constants/pose';

export class FormAnalysisEngine {
  constructor(config) {
    if (!config) throw new Error("Form analysis configuration is required.");
    this.config = config;
    
    // We maintain a history of completed rep ROMs for consistency checking
    this.completedRepROMs = [];
    
    this.reset();
  }

  reset() {
    this.samples = [];
    this.isAnalyzing = false;
    this.currentRepNumber = null;
  }

  startRep(repNumber) {
    this.reset();
    this.isAnalyzing = true;
    this.currentRepNumber = repNumber;
  }

  _isValidLandmark(lm) {
    return lm && lm.visibility >= POSE_CONFIG.MIN_LANDMARK_CONFIDENCE;
  }

  _mapLandmarks(landmarksArray) {
    const map = {};
    landmarksArray.forEach(lm => {
      map[lm.id] = lm;
    });
    return map;
  }

  update(pose, timestamp) {
    if (!this.isAnalyzing || !pose || !pose.detected) return;

    if (pose.confidence < POSE_CONFIG.MIN_POSE_CONFIDENCE) return;

    const lm = this._mapLandmarks(pose.landmarks);

    // Collect raw points for the current frame
    const sample = {
      timestamp: timestamp || performance.now(),
      
      lHip: this._isValidLandmark(lm['left_hip']) ? lm['left_hip'] : null,
      rHip: this._isValidLandmark(lm['right_hip']) ? lm['right_hip'] : null,
      
      lKnee: this._isValidLandmark(lm['left_knee']) ? lm['left_knee'] : null,
      rKnee: this._isValidLandmark(lm['right_knee']) ? lm['right_knee'] : null,
      
      lAnkle: this._isValidLandmark(lm['left_ankle']) ? lm['left_ankle'] : null,
      rAnkle: this._isValidLandmark(lm['right_ankle']) ? lm['right_ankle'] : null,
      
      lShoulder: this._isValidLandmark(lm['left_shoulder']) ? lm['left_shoulder'] : null,
      rShoulder: this._isValidLandmark(lm['right_shoulder']) ? lm['right_shoulder'] : null,
      
      lElbow: this._isValidLandmark(lm['left_elbow']) ? lm['left_elbow'] : null,
      rElbow: this._isValidLandmark(lm['right_elbow']) ? lm['right_elbow'] : null,
      
      lWrist: this._isValidLandmark(lm['left_wrist']) ? lm['left_wrist'] : null,
      rWrist: this._isValidLandmark(lm['right_wrist']) ? lm['right_wrist'] : null,
    };

    // Calculate frame-specific metrics
    sample.torsoAngle = calculateTorsoAngle(sample.lShoulder, sample.rShoulder, sample.lHip, sample.rHip);
    
    const torsoLengthLeft = calculateReferenceLength(sample.lShoulder, sample.lHip);
    const torsoLengthRight = calculateReferenceLength(sample.rShoulder, sample.rHip);
    
    const torsoLength = (torsoLengthLeft || torsoLengthRight) ? 
      (((torsoLengthLeft || 0) + (torsoLengthRight || 0)) / ((torsoLengthLeft && torsoLengthRight) ? 2 : 1)) : null;

    sample.lDepth = calculateSquatDepth(sample.lHip, sample.lKnee, torsoLength);
    sample.rDepth = calculateSquatDepth(sample.rHip, sample.rKnee, torsoLength);

    const refWidth = calculateReferenceWidth(sample.lShoulder, sample.rShoulder) || calculateReferenceWidth(sample.lHip, sample.rHip);
    
    sample.lKneeAlign = calculateKneeAlignment(sample.lHip, sample.lKnee, sample.lAnkle, refWidth);
    sample.rKneeAlign = calculateKneeAlignment(sample.rHip, sample.rKnee, sample.rAnkle, refWidth);

    // Pushup specific
    const calculateAngleSafe = (a, b, c) => (a && b && c) ? require('../../rep-counter/utils/angle').calculateAngle(a, b, c) : null;
    sample.lElbowAngle = calculateAngleSafe(sample.lShoulder, sample.lElbow, sample.lWrist);
    sample.rElbowAngle = calculateAngleSafe(sample.rShoulder, sample.rElbow, sample.rWrist);
    
    // Body alignment (shoulder -> hip -> ankle)
    sample.lBodyAlignment = calculateAngleSafe(sample.lShoulder, sample.lHip, sample.lAnkle);
    sample.rBodyAlignment = calculateAngleSafe(sample.rShoulder, sample.rHip, sample.rAnkle);

    this.samples.push(sample);
  }

  finalizeRep(repEvent) {
    if (!this.isAnalyzing) return null;
    
    this.isAnalyzing = false;
    
    // Default fallback if we didn't get enough samples
    if (this.samples.length < 3) {
      return this._createInsufficientDataResult(repEvent);
    }

    // Process collected samples to find peak values or averages
    const metrics = this._aggregateMetrics();
    
    // Evaluate metrics using configuration
    const evaluated = this._evaluateMetrics(metrics);
    
    // Calculate final score
    const { score, quality } = this._calculateScore(evaluated);
    
    // Generate feedback
    const feedback = this._generateFeedback(evaluated);

    // Save ROM for next rep consistency checking (using depth as a proxy for ROM here)
    if (metrics.depth.value !== null) {
      this.completedRepROMs.push(metrics.depth.value);
    }

    const result = {
      repNumber: this.currentRepNumber || repEvent?.repNumber || 0,
      exercise: this.config.name,
      quality,
      score,
      metrics: evaluated,
      feedback
    };

    this.reset();
    return result;
  }

  _aggregateMetrics() {
    let maxDepth = null; // actually max numeric value since larger means deeper
    let maxTorsoAngle = null;
    let maxKneeDeviation = null;
    let maxSymmetryDiff = null;
    
    let minElbowAngle = null;
    let worstBodyAlignment = null; // We want to find the maximum deviation from 180 degrees

    this.samples.forEach(s => {
      // Depth
      const avgDepth = (s.lDepth !== null && s.rDepth !== null) ? (s.lDepth + s.rDepth) / 2 : (s.lDepth || s.rDepth);
      if (avgDepth !== null) {
        if (maxDepth === null || avgDepth > maxDepth) maxDepth = avgDepth;
      }

      // Torso
      if (s.torsoAngle !== null) {
        if (maxTorsoAngle === null || s.torsoAngle > maxTorsoAngle) maxTorsoAngle = s.torsoAngle;
      }

      // Knee Alignment
      const avgKneeAlign = (s.lKneeAlign !== null && s.rKneeAlign !== null) ? (s.lKneeAlign + s.rKneeAlign) / 2 : (s.lKneeAlign || s.rKneeAlign);
      if (avgKneeAlign !== null) {
        if (maxKneeDeviation === null || avgKneeAlign > maxKneeDeviation) maxKneeDeviation = avgKneeAlign;
      }

      // Symmetry (difference between left and right depth)
      if (s.lDepth !== null && s.rDepth !== null) {
        const sym = calculateSymmetry(s.lDepth, s.rDepth, Math.abs(maxDepth || 1));
        if (sym !== null) {
          if (maxSymmetryDiff === null || sym > maxSymmetryDiff) maxSymmetryDiff = sym;
        }
      }

      // Elbow Angle (min across samples)
      const avgElbowAngle = (s.lElbowAngle !== null && s.rElbowAngle !== null) ? Math.min(s.lElbowAngle, s.rElbowAngle) : (s.lElbowAngle || s.rElbowAngle);
      if (avgElbowAngle !== null) {
        if (minElbowAngle === null || avgElbowAngle < minElbowAngle) minElbowAngle = avgElbowAngle;
      }
      
      // Body Alignment (min across samples - most sagging/piking)
      const avgBodyAlignment = (s.lBodyAlignment !== null && s.rBodyAlignment !== null) ? (s.lBodyAlignment + s.rBodyAlignment) / 2 : (s.lBodyAlignment || s.rBodyAlignment);
      if (avgBodyAlignment !== null) {
        if (worstBodyAlignment === null || Math.abs(180 - avgBodyAlignment) > Math.abs(180 - worstBodyAlignment)) {
          worstBodyAlignment = avgBodyAlignment;
        }
      }
    });

    // ROM Consistency
    let romConsistency = null;
    if (maxDepth !== null && this.completedRepROMs.length > 0) {
      const avgPrevROM = this.completedRepROMs.reduce((a, b) => a + b, 0) / this.completedRepROMs.length;
      if (avgPrevROM > 0.05) { // avoid division by zero or near zero
        romConsistency = Math.abs(maxDepth - avgPrevROM) / Math.abs(avgPrevROM);
      }
    }

    return {
      depth: { value: maxDepth },
      torso: { value: maxTorsoAngle },
      kneeAlignment: { value: maxKneeDeviation },
      symmetry: { value: maxSymmetryDiff },
      romConsistency: { value: romConsistency, isBaseline: this.completedRepROMs.length === 0 },
      elbowAngle: { value: minElbowAngle },
      bodyAlignment: { value: worstBodyAlignment }
    };
  }

  _evaluateMetrics(metrics) {
    const evaluated = {};

    for (const [key, metric] of Object.entries(metrics)) {
      if (key === 'romConsistency' && metric.isBaseline) {
        evaluated[key] = {
          value: null,
          status: QUALITY_STATUS.GOOD, // Don't penalize first rep
          message: "Baseline established"
        };
        continue;
      }

      const conf = this.config[key];
      if (!conf) continue;

      const status = conf.evaluate(metric.value);
      evaluated[key] = {
        value: metric.value,
        status,
        message: status === QUALITY_STATUS.UNCERTAIN ? "Not enough data" : conf.messages[status]
      };
    }

    return evaluated;
  }

  _calculateScore(evaluatedMetrics) {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [key, evalData] of Object.entries(evaluatedMetrics)) {
      if (evalData.status !== QUALITY_STATUS.UNCERTAIN && evalData.status !== QUALITY_STATUS.NOT_AVAILABLE) {
        const weight = METRIC_WEIGHTS[key] || 0;
        const metricScore = METRIC_SCORES[evalData.status] || 0;
        
        totalScore += metricScore * weight;
        totalWeight += weight;
      }
    }

    if (totalWeight === 0) {
      return { score: 0, quality: OVERALL_QUALITY.INSUFFICIENT_DATA };
    }

    // Renormalize score based on available metrics
    const normalizedScore = Math.round(totalScore / totalWeight);

    let quality = OVERALL_QUALITY.POOR;
    if (normalizedScore >= 85) quality = OVERALL_QUALITY.GOOD;
    else if (normalizedScore >= 70) quality = OVERALL_QUALITY.FAIR;
    else if (normalizedScore >= 50) quality = OVERALL_QUALITY.NEEDS_IMPROVEMENT;

    return { score: normalizedScore, quality };
  }

  _generateFeedback(evaluatedMetrics) {
    const feedback = [];
    
    // We prioritize feedback: Poor > Minor Deviation > Good
    // So we sort them or just collect them
    for (const [key, evalData] of Object.entries(evaluatedMetrics)) {
      if (evalData.message && evalData.status !== QUALITY_STATUS.UNCERTAIN) {
        // Skip "Baseline established" or Good messages to avoid cluttering, unless it's all good?
        // Actually, the requirements show we want to return useful feedback.
        feedback.push({
          metric: key,
          status: evalData.status,
          message: evalData.message
        });
      }
    }

    // Sort: POOR first, then MINOR_DEVIATION, then GOOD
    const statusRank = {
      [QUALITY_STATUS.POOR]: 1,
      [QUALITY_STATUS.MINOR_DEVIATION]: 2,
      [QUALITY_STATUS.GOOD]: 3
    };

    feedback.sort((a, b) => (statusRank[a.status] || 99) - (statusRank[b.status] || 99));

    return feedback.map(f => f.message);
  }

  _createInsufficientDataResult(repEvent) {
    return {
      repNumber: this.currentRepNumber || repEvent?.repNumber || 0,
      exercise: this.config.name,
      quality: OVERALL_QUALITY.INSUFFICIENT_DATA,
      score: 0,
      metrics: {
        depth: { status: QUALITY_STATUS.UNCERTAIN },
        kneeAlignment: { status: QUALITY_STATUS.UNCERTAIN },
        torso: { status: QUALITY_STATUS.UNCERTAIN },
        symmetry: { status: QUALITY_STATUS.UNCERTAIN },
        romConsistency: { status: QUALITY_STATUS.UNCERTAIN },
        elbowAngle: { status: QUALITY_STATUS.UNCERTAIN },
        bodyAlignment: { status: QUALITY_STATUS.UNCERTAIN }
      },
      feedback: ["Unable to analyze form due to poor visibility."]
    };
  }
}
