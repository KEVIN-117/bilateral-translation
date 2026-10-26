import {
  HolisticLandmarker,
  type HolisticLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { BaseWorker } from "./base-worker";

type WorkerMessage = {
  type: string;
  bitmap?: ImageBitmap;
  timestampMs?: number;
  [key: string]: unknown;
};

class HolisticLandmarkerWorker extends BaseWorker<HolisticLandmarker> {
  protected async initializeTask(data?: WorkerMessage): Promise<void> {
    const vision = await this.getVisionFileset();
    this.taskInstance = await HolisticLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          (this.currentOptions.modelAssetPath as string | undefined) ??
          "https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/1/holistic_landmarker.task",
        delegate:
          (this.currentOptions.delegate as "GPU" | "CPU" | undefined) ?? "GPU",
      },
      runningMode:
        (data?.runningMode as "VIDEO" | "IMAGE" | undefined) ?? "VIDEO",
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

  protected async updateOptions(
    options: Record<string, unknown>,
  ): Promise<void> {
    await this.taskInstance?.setOptions({
      runningMode:
        (options.runningMode as "VIDEO" | "IMAGE" | undefined) ?? "VIDEO",
    });
  }

  protected async handleCustomMessage(data: WorkerMessage): Promise<void> {
    if (data.type !== "DETECT_VIDEO") return;

    const bitmap = data.bitmap;
    try {
      if (
        !this.taskInstance ||
        !bitmap ||
        typeof data.timestampMs !== "number"
      ) {
        throw new Error(
          "El detector aún no está listo para analizar fotogramas.",
        );
      }

      const startedAt = performance.now();
      const result: HolisticLandmarkerResult = this.taskInstance.detectForVideo(
        bitmap,
        data.timestampMs,
      );
      self.postMessage({
        type: "DETECT_RESULT",
        result,
        inferenceTime: performance.now() - startedAt,
      });
    } catch (error) {
      self.postMessage({
        type: "DETECT_ERROR",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      bitmap?.close();
    }
  }
}

new HolisticLandmarkerWorker();
