"use client";

import {
  DrawingUtils,
  FaceLandmarker,
  HandLandmarker,
  type HolisticLandmarkerResult,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import {
  AlertCircle,
  Camera,
  CameraOff,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { extractKeypoints } from "@/lib/keypointExtractor";
import { getSignByModelAction } from "@/lib/sign-dictionary";

const SEQUENCE_LENGTH = 30;
const PREDICTION_INTERVAL_MS = 1_500;
const WORKER_TIMEOUT_MS = 30_000;
const ML_API_URL = (
  process.env.NEXT_PUBLIC_ML_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

type WorkerStatus = "loading" | "ready" | "error";
type Prediction = { action: string; confidence: number };

function getCameraErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "El navegador bloqueó la cámara. Permite el acceso en la barra de direcciones y vuelve a intentarlo.";
  }
  if (error instanceof DOMException && error.name === "NotFoundError") {
    return "No encontramos una cámara conectada a este dispositivo.";
  }
  if (error instanceof DOMException && error.name === "NotReadableError") {
    return "La cámara está ocupada por otra aplicación. Ciérrala y vuelve a intentarlo.";
  }
  return "No se pudo iniciar la cámara. Comprueba los permisos y que la página use HTTPS.";
}

export default function StreamVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const workerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const predictionControllerRef = useRef<AbortController | null>(null);
  const sequenceRef = useRef<number[][]>([]);
  const lastVideoTimeRef = useRef(-1);
  const lastTimestampRef = useRef(-1);
  const nextPredictionAtRef = useRef(0);
  const predictionFailuresRef = useRef(0);
  const isPredictingRef = useRef(false);
  const workerReadyRef = useRef(false);
  const processVideoFrameRef = useRef<() => Promise<void>>(async () => {});
  const cameraActiveRef = useRef(false);

  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>("loading");
  const [workerMessage, setWorkerMessage] = useState(
    "Cargando el detector de señas…",
  );
  const [workerRestartKey, setWorkerRestartKey] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [frameError, setFrameError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [predictionMessage, setPredictionMessage] = useState(
    "Activa la cámara para comenzar.",
  );

  const cancelAnimationFrame = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    cameraActiveRef.current = false;
    setIsCameraActive(false);
    setIsLoadingCamera(false);
    setCameraError(null);
    setFrameError(null);
    sequenceRef.current = [];
    lastVideoTimeRef.current = -1;
    isPredictingRef.current = false;
    nextPredictionAtRef.current = 0;
    predictionFailuresRef.current = 0;
    setPrediction(null);
    setPredictionMessage("Activa la cámara para comenzar.");

    predictionControllerRef.current?.abort();
    predictionControllerRef.current = null;
    cancelAnimationFrame();

    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;

    const context = canvasRef.current?.getContext("2d");
    if (context && canvasRef.current) {
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
    }
  }, [cancelAnimationFrame]);

  const runPrediction = useCallback(async () => {
    if (
      !cameraActiveRef.current ||
      isPredictingRef.current ||
      sequenceRef.current.length < SEQUENCE_LENGTH
    )
      return;

    const now = performance.now();
    if (now < nextPredictionAtRef.current) return;

    isPredictingRef.current = true;
    nextPredictionAtRef.current = now + PREDICTION_INTERVAL_MS;
    setPredictionMessage("Analizando la seña…");

    const controller = new AbortController();
    predictionControllerRef.current = controller;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15_000);

    try {
      const response = await fetch(`${ML_API_URL}/api/v1/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sequence: sequenceRef.current.map((frame) => [...frame]),
        }),
        signal: controller.signal,
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const detail =
          typeof body?.detail === "string"
            ? body.detail
            : `Error del servicio (${response.status}).`;
        throw new Error(detail);
      }
      if (
        typeof body?.prediction !== "string" ||
        typeof body?.confidence !== "number"
      ) {
        throw new Error(
          "El servicio devolvió una respuesta que no reconocemos.",
        );
      }

      if (!cameraActiveRef.current) return;
      const nextPrediction = {
        action: body.prediction,
        confidence: body.confidence,
      };
      setPrediction(nextPrediction);
      predictionFailuresRef.current = 0;
      nextPredictionAtRef.current = performance.now() + PREDICTION_INTERVAL_MS;
      setPredictionMessage("Seña reconocida.");
    } catch (error) {
      if (!cameraActiveRef.current || (controller.signal.aborted && !timedOut))
        return;
      const message = timedOut
        ? "El servicio tardó demasiado. Se volverá a intentar mientras la cámara siga activa."
        : error instanceof Error && error.message
          ? error.message
          : "No se pudo conectar con el servicio de traducción.";
      predictionFailuresRef.current += 1;
      const backoff = Math.min(
        30_000,
        PREDICTION_INTERVAL_MS * 2 ** (predictionFailuresRef.current - 1),
      );
      nextPredictionAtRef.current = performance.now() + backoff;
      setPredictionMessage(message);
    } finally {
      window.clearTimeout(timeout);
      if (predictionControllerRef.current === controller) {
        predictionControllerRef.current = null;
      }
      isPredictingRef.current = false;
    }
  }, []);

  const handleDetectionResult = useCallback(
    (result: HolisticLandmarkerResult) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context)
        throw new Error("No se pudo preparar el área de cámara.");

      context.save();
      context.clearRect(0, 0, canvas.width, canvas.height);
      const drawing = new DrawingUtils(context);

      for (const landmarks of result.faceLandmarks ?? []) {
        drawing.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          {
            color: "rgba(194, 218, 224, 0.18)",
            lineWidth: 1,
          },
        );
      }
      for (const landmarks of result.poseLandmarks ?? []) {
        drawing.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
          color: "#7fd6e8",
          lineWidth: 2,
        });
        drawing.drawLandmarks(landmarks, {
          color: "#f3fbfc",
          radius: 2,
          lineWidth: 1,
        });
      }
      for (const landmarks of result.leftHandLandmarks ?? []) {
        drawing.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
          color: "#b4e8f0",
          lineWidth: 2,
        });
        drawing.drawLandmarks(landmarks, {
          color: "#f3fbfc",
          radius: 2,
          lineWidth: 1,
        });
      }
      for (const landmarks of result.rightHandLandmarks ?? []) {
        drawing.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
          color: "#b4e8f0",
          lineWidth: 2,
        });
        drawing.drawLandmarks(landmarks, {
          color: "#f3fbfc",
          radius: 2,
          lineWidth: 1,
        });
      }
      context.restore();

      sequenceRef.current.push(extractKeypoints(result));
      if (sequenceRef.current.length > SEQUENCE_LENGTH)
        sequenceRef.current.shift();
      void runPrediction();
    },
    [runPrediction],
  );

  const scheduleNextFrame = useCallback(() => {
    if (!cameraActiveRef.current || animationFrameRef.current !== null) return;
    animationFrameRef.current = window.requestAnimationFrame(() => {
      void processVideoFrameRef.current();
    });
  }, []);

  const processVideoFrame = useCallback(async () => {
    animationFrameRef.current = null;
    const video = videoRef.current;
    const worker = workerRef.current;
    if (
      !cameraActiveRef.current ||
      !video ||
      !worker ||
      !workerReadyRef.current
    )
      return;

    if (
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      video.currentTime === lastVideoTimeRef.current
    ) {
      scheduleNextFrame();
      return;
    }

    lastVideoTimeRef.current = video.currentTime;
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(video);
      const timestampMs = Math.max(
        performance.now(),
        lastTimestampRef.current + 1,
      );
      lastTimestampRef.current = timestampMs;
      worker.postMessage({ type: "DETECT_VIDEO", bitmap, timestampMs }, [
        bitmap,
      ]);
      bitmap = null;
    } catch {
      bitmap?.close();
      setFrameError("No se pudo leer un fotograma. Intentando continuar…");
      scheduleNextFrame();
    }
  }, [scheduleNextFrame]);
  processVideoFrameRef.current = processVideoFrame;

  useEffect(() => {
    let disposed = false;
    workerReadyRef.current = false;
    setWorkerStatus("loading");
    setWorkerMessage(
      workerRestartKey === 0
        ? "Cargando el detector de señas…"
        : "Volviendo a cargar el detector…",
    );

    const worker = new Worker(
      new URL("../../lib/holistic-landmarker.worker.ts", import.meta.url),
      {
        type: "module",
      },
    );
    workerRef.current = worker;

    workerTimeoutRef.current = setTimeout(() => {
      if (disposed || workerReadyRef.current) return;
      setWorkerStatus("error");
      setWorkerMessage(
        "El detector no respondió. Revisa tu conexión y vuelve a cargarlo.",
      );
    }, WORKER_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent) => {
      const { type, result, error } = event.data;
      if (type === "INIT_DONE") {
        workerReadyRef.current = true;
        setWorkerStatus("ready");
        setWorkerMessage("Detector listo para usar.");
        if (workerTimeoutRef.current) clearTimeout(workerTimeoutRef.current);
      } else if (type === "DELEGATE_FALLBACK") {
        setWorkerMessage(
          "Detector listo en modo compatible con este dispositivo.",
        );
      } else if (type === "DETECT_RESULT") {
        if (!cameraActiveRef.current) return;
        try {
          handleDetectionResult(result as HolisticLandmarkerResult);
          setFrameError(null);
        } catch {
          setFrameError(
            "El detector no pudo procesar este fotograma. Intentando continuar…",
          );
        } finally {
          scheduleNextFrame();
        }
      } else if (type === "DETECT_ERROR") {
        if (!cameraActiveRef.current) return;
        setFrameError(
          "El detector tuvo un problema con un fotograma. Intentando continuar…",
        );
        scheduleNextFrame();
      } else if (type === "ERROR") {
        workerReadyRef.current = false;
        setWorkerStatus("error");
        setWorkerMessage(
          typeof error === "string" ? error : "No se pudo iniciar el detector.",
        );
        stopCamera();
      }
    };

    worker.onerror = () => {
      workerReadyRef.current = false;
      setWorkerStatus("error");
      setWorkerMessage(
        "El detector se detuvo de forma inesperada. Vuelve a cargarlo.",
      );
      stopCamera();
    };

    worker.postMessage({ type: "INIT", runningMode: "VIDEO", delegate: "GPU" });

    return () => {
      disposed = true;
      if (workerTimeoutRef.current) clearTimeout(workerTimeoutRef.current);
      stopCamera();
      worker.postMessage({ type: "CLEANUP" });
      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;
      workerReadyRef.current = false;
    };
  }, [handleDetectionResult, scheduleNextFrame, stopCamera, workerRestartKey]);

  const startCamera = useCallback(async () => {
    if (workerStatus !== "ready" || isLoadingCamera || cameraActiveRef.current)
      return;
    setCameraError(null);
    setIsLoadingCamera(true);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Este navegador no permite usar la cámara aquí. Abre la página con HTTPS o en localhost.",
      );
      setIsLoadingCamera(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      const video = videoRef.current;
      if (!video || !workerRef.current || !workerReadyRef.current) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        setIsLoadingCamera(false);
        return;
      }

      streamRef.current = stream;
      video.srcObject = stream;
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        await new Promise<void>((resolve, reject) => {
          const onLoaded = () => {
            video.removeEventListener("error", onError);
            resolve();
          };
          const onError = () => {
            video.removeEventListener("loadeddata", onLoaded);
            reject(new Error("No se pudo leer la cámara."));
          };
          video.addEventListener("loadeddata", onLoaded, { once: true });
          video.addEventListener("error", onError, { once: true });
        });
      }
      await video.play();

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      sequenceRef.current = [];
      lastVideoTimeRef.current = -1;
      nextPredictionAtRef.current = performance.now();
      cameraActiveRef.current = true;
      setIsCameraActive(true);
      setPrediction(null);
      setPredictionMessage("Haz una seña clara dentro del encuadre.");
      scheduleNextFrame();
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      setCameraError(getCameraErrorMessage(error));
    } finally {
      setIsLoadingCamera(false);
    }
  }, [isLoadingCamera, scheduleNextFrame, workerStatus]);

  const recognizedSign = prediction
    ? getSignByModelAction(prediction.action)
    : null;
  const recognizedWord = recognizedSign?.word ?? prediction?.action ?? null;

  return (
    <div className="grid w-full items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.75fr)]">
      <section aria-labelledby="vista-camara-titulo" className="min-w-0">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              className="text-lg font-semibold text-foreground"
              id="vista-camara-titulo"
            >
              Vista de cámara
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Mantén las manos y el rostro dentro del encuadre.
            </p>
          </div>
          <output
            aria-live="polite"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${isCameraActive ? "bg-emerald-400" : "bg-muted-foreground/60"}`}
            />
            {isCameraActive
              ? "Cámara activa"
              : isLoadingCamera
                ? "Iniciando cámara…"
                : "Cámara apagada"}
          </output>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
          <video
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            ref={videoRef}
            tabIndex={-1}
          />
          <canvas
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover ${isCameraActive ? "opacity-100" : "opacity-0"}`}
            ref={canvasRef}
            tabIndex={-1}
          />
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <Camera className="h-8 w-8 text-secondary" aria-hidden="true" />
              <p className="max-w-sm text-sm text-foreground">
                La imagen se mostrará aquí cuando actives la cámara.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {workerStatus === "loading" ? (
            <output className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle
                aria-hidden="true"
                className="h-4 w-4 motion-safe:animate-spin"
              />
              Preparando el detector…
            </output>
          ) : workerStatus === "error" ? (
            <div
              className="flex min-w-0 items-start gap-2 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span>{workerMessage}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              El video se analiza en tu navegador; la predicción se consulta al
              servicio.
            </p>
          )}

          {workerStatus === "error" ? (
            <Button
              className="min-h-11 shrink-0"
              onClick={() => setWorkerRestartKey((key) => key + 1)}
              type="button"
              variant="outline"
            >
              <RotateCcw aria-hidden="true" />
              Reintentar detector
            </Button>
          ) : (
            <Button
              className="min-h-11 shrink-0"
              disabled={workerStatus !== "ready" || isLoadingCamera}
              onClick={isCameraActive ? stopCamera : startCamera}
              type="button"
              variant={isCameraActive ? "outline" : "default"}
              aria-pressed={isCameraActive}
            >
              {isLoadingCamera ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="motion-safe:animate-spin"
                />
              ) : isCameraActive ? (
                <CameraOff aria-hidden="true" />
              ) : (
                <Camera aria-hidden="true" />
              )}
              {isLoadingCamera
                ? "Conectando…"
                : isCameraActive
                  ? "Detener cámara"
                  : "Activar cámara"}
            </Button>
          )}
        </div>

        {(cameraError || frameError) && (
          <p
            className="mt-3 flex items-start gap-2 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <span>{cameraError ?? frameError}</span>
          </p>
        )}
      </section>

      <aside
        aria-labelledby="resultado-titulo"
        className="min-w-0 rounded-2xl border border-white/10 bg-card p-5 sm:p-6"
      >
        <h2
          className="text-lg font-semibold text-foreground"
          id="resultado-titulo"
        >
          Resultado
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          El modelo reconoce tres señas por ahora.
        </p>
        <div className="mt-6 min-h-36 rounded-xl bg-white/[0.035] px-4 py-5">
          <p className="text-xs font-medium text-muted-foreground">
            Última seña reconocida
          </p>
          <output
            aria-atomic="true"
            aria-live="polite"
            className="mt-3 block min-h-10 break-words text-3xl font-semibold leading-tight text-foreground"
          >
            {recognizedWord ?? "Esperando una seña"}
          </output>
          {prediction && (
            <p className="mt-2 text-sm text-muted-foreground">
              {Math.round(prediction.confidence * 1000) / 10}% de confianza del
              modelo
            </p>
          )}
        </div>
        <output
          aria-live="polite"
          className="mt-4 block min-h-10 text-sm text-muted-foreground"
        >
          {predictionMessage}
        </output>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Disponibles: Hola, Gracias y Te amo. El resultado se actualiza
          mientras mantienes la cámara activa.
        </p>
      </aside>
    </div>
  );
}
