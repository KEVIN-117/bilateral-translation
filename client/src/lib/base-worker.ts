import { FilesetResolver } from "@mediapipe/tasks-vision";

type WorkerMessage = {
  type: string;
  [key: string]: unknown;
};

export abstract class BaseWorker<T> {
  protected taskInstance: T | undefined;
  protected currentOptions: Record<string, unknown> = {};
  protected basePath =
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";

  constructor() {
    self.onmessage = (event: MessageEvent<WorkerMessage>) => {
      void this.handleMessage(event);
    };
  }

  protected async handleMessage(event: MessageEvent<WorkerMessage>) {
    const { type } = event.data;

    try {
      if (type === "INIT") {
        const { modelAssetPath, delegate, baseUrl, ...options } = event.data;
        this.basePath = typeof baseUrl === "string" ? baseUrl : this.basePath;
        this.currentOptions = { modelAssetPath, delegate, ...options };
        await this.initializeBase(event.data);
        self.postMessage({ type: "INIT_DONE" });
      } else if (type === "SET_OPTIONS") {
        const { type: _type, ...options } = event.data;
        Object.assign(this.currentOptions, options);
        await this.updateOptions(options);
        self.postMessage({ type: "OPTIONS_UPDATED" });
      } else if (type === "CLEANUP") {
        this.closeTask();
        self.postMessage({ type: "CLEANUP_DONE" });
      } else {
        await this.handleCustomMessage(event.data);
      }
    } catch (error) {
      self.postMessage({
        type: "ERROR",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async initializeBase(data: WorkerMessage) {
    this.closeTask();

    try {
      await this.initializeTask(data);
    } catch (error) {
      if (this.currentOptions.delegate !== "GPU") throw error;

      this.currentOptions.delegate = "CPU";
      self.postMessage({ type: "DELEGATE_FALLBACK" });
      this.closeTask();
      await this.initializeTask(data);
    }
  }

  private closeTask() {
    (this.taskInstance as { close?: () => void } | undefined)?.close?.();
    this.taskInstance = undefined;
  }

  protected async getVisionFileset() {
    return FilesetResolver.forVisionTasks(this.basePath);
  }

  protected updateOptions(_options?: Record<string, unknown>): Promise<void> {
    return Promise.resolve();
  }

  protected abstract initializeTask(data?: WorkerMessage): Promise<void>;
  protected abstract handleCustomMessage(data: WorkerMessage): Promise<void>;
}
