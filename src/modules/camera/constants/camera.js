export const CAMERA_STATES = {
  INITIAL: "INITIAL",
  REQUESTING: "REQUESTING",
  GRANTED: "GRANTED",
  DENIED: "DENIED",
  ERROR: "ERROR",
  UNSUPPORTED: "UNSUPPORTED",
};

export const CAMERA_ERROR_MESSAGES = {
  NotFoundError: "No camera was found on your device.",
  NotReadableError: "The camera is currently unavailable or being used by another application.",
  NotAllowedError: "Camera permission was denied. Please allow camera access in your browser settings.",
  OverconstrainedError: "The requested camera configuration is not supported by your device.",
  SecurityError: "Camera access is blocked by security settings. Ensure you are using HTTPS.",
  UnsupportedError: "Camera access is not supported in this browser.",
  Default: "Unable to access the camera due to an unknown error."
};
