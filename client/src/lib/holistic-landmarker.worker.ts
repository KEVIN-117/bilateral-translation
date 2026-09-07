import { HolisticLandmarker } from '@mediapipe/tasks-vision';
import { BaseWorker } from './base-worker';

class HolisticLandmarkerWorker extends BaseWorker<HolisticLandmarker> {
  protected async initializeTask(data: any): Promise<void> {
    const vision = await this.getVisionFileset();

    this.taskInstance = await HolisticLandmarker.createFromOptions(vision, {
      baseOptions: {
        // Point to the official task model if not provided
        modelAssetPath: this.currentOptions.modelAssetPath || 'https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/1/holistic_landmarker.task',
        delegate: this.currentOptions.delegate || 'GPU',
      },
      runningMode: data?.runningMode || 'VIDEO',
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minFaceSuppressionThreshold: 0.5,
      minHandLandmarksConfidence: 0.5,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minPoseSuppressionThreshold: 0.5,
      outputFaceBlendshapes: false,
    });
  }

  protected async updateOptions(data: any): Promise<void> {
    if (this.taskInstance) {
      await this.taskInstance.setOptions({
        runningMode: data.runningMode || this.currentOptions.runningMode || 'VIDEO',
      });
    }
  }

  protected async handleCustomMessage(data: any): Promise<void> {
    const { type, ...rest } = data;

    if (type === 'DETECT_VIDEO' && this.taskInstance) {
      try {
        const startTimeMs = performance.now();
        // rest.bitmap is an ImageBitmap transferred from the main thread
        const result = this.taskInstance.detectForVideo(rest.bitmap, rest.timestampMs);
        
        self.postMessage({
          type: 'DETECT_RESULT',
          result,
          mode: 'VIDEO',
          inferenceTime: performance.now() - startTimeMs,
        });
        
        // We must close the bitmap to free memory since we took ownership
        if (rest.bitmap && typeof rest.bitmap.close === 'function') {
           rest.bitmap.close();
        }
      } catch (e) {
        console.warn('Video detection error', e);
      }
    } else if (type === 'CLEANUP') {
      this.taskInstance?.close();
      this.taskInstance = undefined;
    }
  }
}

new HolisticLandmarkerWorker();
