import { FilesetResolver } from '@mediapipe/tasks-vision';

export abstract class BaseWorker<T> {
  protected taskInstance: T | undefined;
  protected isInitializing = false;
  protected currentOptions: any = {};
  protected basePath = '/';
  protected isProcessing = false;

  constructor() {
    self.onmessage = this.handleMessage.bind(this);
  }

  protected async handleMessage(event: MessageEvent) {
    const { type } = event.data;

    while (this.isProcessing) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    this.isProcessing = true;

    try {
      if (type === 'INIT') {
        const { modelAssetPath, delegate, baseUrl, ...rest } = event.data;
        this.basePath = baseUrl || 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
        this.currentOptions = { modelAssetPath, delegate, ...rest };

        await this.initializeBase(event.data);
        self.postMessage({ type: 'INIT_DONE' });
      } else if (type === 'SET_OPTIONS') {
        const { type: _type, ...optionsToUpdate } = event.data;
        Object.assign(this.currentOptions, optionsToUpdate);
        await this.updateOptions(optionsToUpdate);
        self.postMessage({ type: 'OPTIONS_UPDATED' });
      } else if (type === 'CLEANUP') {
        if (this.taskInstance) {
          (this.taskInstance as any).close?.();
          this.taskInstance = undefined;
        }
        self.postMessage({ type: 'CLEANUP_DONE' });
      } else {
        await this.handleCustomMessage(event.data);
      }
    } catch (error: any) {
      console.error('Worker Error:', error);
      self.postMessage({ type: 'ERROR', error: error?.message || String(error) });
    } finally {
      this.isProcessing = false;
    }
  }

  private async initializeBase(data: any) {
    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      if (this.taskInstance) {
        (this.taskInstance as any).close?.();
        this.taskInstance = undefined;
      }
      await this.initializeTask(data);
    } catch (error: any) {
      if (this.currentOptions.delegate === 'GPU') {
        console.warn('Worker GPU delegate initialization failed, falling back to CPU:', error);
        this.currentOptions.delegate = 'CPU';
        self.postMessage({ type: 'DELEGATE_FALLBACK' });
        if (this.taskInstance) {
          try {
            (this.taskInstance as any).close?.();
          } catch (_) {}
          this.taskInstance = undefined;
        }
        await this.initializeTask(data);
      } else {
        throw error;
      }
    } finally {
      this.isInitializing = false;
    }
  }

  protected async getVisionFileset() {
    // Usamos el CDN para evitar problemas de bundler con los archivos wasm
    const wasmPath = this.basePath;
    const fileset = await FilesetResolver.forVisionTasks(wasmPath);
    return fileset;
  }

  protected updateOptions(_?: any): Promise<void> {
    return Promise.resolve();
  }

  protected abstract initializeTask(data?: any): Promise<void>;
  protected abstract handleCustomMessage(data: any): Promise<void>;
}
