# Form Analysis (Phase 26)

## Overview
Phase 26 introduces an independent **Form Analysis Engine** to evaluate the quality of performed exercises based on local `NormalizedPose` data (provided by Phase 24). It operates securely in the browser and does not send any video or pose frames to a backend server.

## Architecture
Form analysis is completely decoupled from rep counting (Phase 25).
- **Phase 25 (Rep Counter)** determines *whether* a rep happened.
- **Phase 26 (Form Analysis)** determines *how good* that rep was.

A poor-quality rep is still counted. Form analysis only evaluates metrics; it does not dictate the state machine of the movement.

## Supported Exercises
- **Squat**

## Required Landmarks
The Form Analysis Engine expects full-body visibility. The following landmarks are heavily used:
- `left_hip`, `right_hip`
- `left_knee`, `right_knee`
- `left_ankle`, `right_ankle`
- `left_shoulder`, `right_shoulder`

## Metrics Evaluated
1. **Squat Depth**: Analyzes the vertical distance between the hip and the knee. (Calculates if the squat reached parallel or below).
2. **Knee Alignment**: Analyzes frontal varus/valgus offset relative to a normalized body width.
3. **Torso Angle**: Analyzes forward lean relative to a perfect vertical axis.
4. **Symmetry**: Compares the difference in depth/range of motion between the left and right legs.
5. **ROM Consistency**: Compares the current rep's range of motion against previously completed reps in the session.

## Score Calculation
- The score is out of 100.
- Weighted sum of metrics: Depth (30%), Knee Alignment (25%), Torso (20%), Symmetry (15%), ROM Consistency (10%).
- If a metric cannot be calculated due to low confidence or occlusion, it is safely excluded from the denominator. This ensures the score isn't artificially penalized by a noisy frame.
- If less than 3 valid frames are collected during a rep, the engine returns `INSUFFICIENT_DATA`.

## Confidence & Camera View Limitations
The application requires a minimum pose confidence (e.g., 0.5) to consider a frame valid.
**Note on Camera View**: Metrics like frontal knee alignment rely on specific camera orientations (frontal). In a side-view orientation, this metric will be heavily skewed. The engine is designed to return `NOT_AVAILABLE` or `UNCERTAIN` for metrics that cannot be safely computed, rather than providing false precision. 

## No AI / Backend
- **No Gemini / Jev**: The form engine is completely deterministic and built using vector math and engineering heuristics.
- **No Medical Claims**: Feedback generated (e.g., "Good depth", "Keep knees aligned") is intended for engineering heuristics and fitness tracking, *not* as medical diagnostic advice.
- **Local Only**: All processing stays local within the browser environment.
