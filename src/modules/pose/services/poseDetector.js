let poseDetection = null;
let tf = null;

let detectorInstance = null;
let isInitializing = false;
let initPromise = null;

/**
 * Initializes and returns the pose detector singleton.
 * Uses BlazePose which provides 3D landmarks aligned with our mappings.
 */
export async function getDetector() {
  if (detectorInstance) {
    return detectorInstance;
  }

  if (isInitializing) {
    return initPromise;
  }

  isInitializing = true;
  initPromise = (async () => {
    try {
      if (!poseDetection) {
        poseDetection = await import('@tensorflow-models/pose-detection');
        await import('@tensorflow/tfjs-backend-webgl');
        await import('@tensorflow/tfjs-backend-cpu');
        tf = await import('@tensorflow/tfjs-core');
      }

      // Ensure backend is set
      await tf.ready();
      
      const model = poseDetection.SupportedModels.BlazePose;
      const detectorConfig = {
        runtime: 'tfjs',
        enableSmoothing: true,
        modelType: 'lite' // lite is fast enough for browsers and maintains solid accuracy
      };

      detectorInstance = await poseDetection.createDetector(model, detectorConfig);
      return detectorInstance;
    } catch (error) {
      console.error("Failed to initialize pose detector", error);
      throw error;
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}

/**
 * Closes the detector and frees up memory.
 */
export function disposeDetector() {
  if (detectorInstance) {
    try {
      detectorInstance.dispose();
    } catch (e) {
      console.warn("Error disposing detector", e);
    }
    detectorInstance = null;
  }
}
