"use client";

import {
  DrawingUtils,
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
import { getSignByModelAction } from "@/lib/sign-dictionary";

const SEQUENCE_LENGTH = 30;
const MAX_DETECTION_FPS = 20;
const DETECTION_INTERVAL_MS = 1_000 / MAX_DETECTION_FPS;
const PREDICTION_INTERVAL_MS = 750;
const STABILITY_WINDOW = 3;
const WORKER_TIMEOUT_MS = 30_000;
const ML_API_URL = (
  process.env.NEXT_PUBLIC_ML_API_URL ?? "/api/ml/api/v1"
).replace(/\/$/, "");

type WorkerStatus = "loading" | "ready" | "error";
type Prediction = { action: string; confidence: number };
type PredictionSample = Prediction & { receivedAt: number };
type RuntimeMetrics = {
  cameraFps: number | null;
  cameraResolution: string | null;
  trackingFps: number | null;
  inferenceMs: number | null;
  keypointsMs: number | null;
  workerRoundTripMs: number | null;
  canvasMs: number | null;
  apiMs: number | null;
  uiUpdateMs: number | null;
};
type ZoomRange = { min: number; max: number; step: number; value: number };
type CameraZoomCapabilities = MediaTrackCapabilities & {
  zoom?: { min: number; max: number; step?: number };
};
type CameraZoomConstraint = MediaTrackConstraintSet & { zoom?: number };
type DisplayLandmarks = Pick<
  HolisticLandmarkerResult,
  "poseLandmarks" | "leftHandLandmarks" | "rightHandLandmarks"
>;

const initialMetrics: RuntimeMetrics = {
  cameraFps: null,
  cameraResolution: null,
  trackingFps: null,
  inferenceMs: null,
  keypointsMs: null,
  workerRoundTripMs: null,
  canvasMs: null,
  apiMs: null,
  uiUpdateMs: null,
};

function smoothMetric(previous: number | null, next: number) {
  return previous === null ? next : previous * 0.75 + next * 0.25;
}

function formatMetric(value: number | null, suffix = " ms") {
  return value === null ? "—" : `${Math.round(value)}${suffix}`;
}

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
  const sequenceRef = useRef<Float32Array[]>([]);
  const predictionSamplesRef = useRef<PredictionSample[]>([]);
  const lastVideoTimeRef = useRef(-1);
  const lastTimestampRef = useRef(-1);
  const lastDetectionAtRef = useRef(0);
  const lastDetectionSentAtRef = useRef(0);
  const lastDetectionResultAtRef = useRef(0);
  const predictionUpdateStartedAtRef = useRef(0);
  const lastMetricsPublishAtRef = useRef(0);
  const metricsRef = useRef<RuntimeMetrics>({ ...initialMetrics });
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
  const [zoomRange, setZoomRange] = useState<ZoomRange | null>(null);
  const [metrics, setMetrics] = useState<RuntimeMetrics>({ ...initialMetrics });

  const publishMetrics = useCallback((force = false) => {
    const now = performance.now();
    if (!force && now - lastMetricsPublishAtRef.current < 500) return;
    lastMetricsPublishAtRef.current = now;
    setMetrics((current) => ({ ...current, ...metricsRef.current }));
  }, []);

  useEffect(() => {
    if (!prediction || predictionUpdateStartedAtRef.current === 0) return;
    metricsRef.current.uiUpdateMs =
      performance.now() - predictionUpdateStartedAtRef.current;
    publishMetrics(true);
    predictionUpdateStartedAtRef.current = 0;
  }, [prediction, publishMetrics]);

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
    predictionSamplesRef.current = [];
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
    setZoomRange(null);
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
    const apiStartedAt = performance.now();
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15_000);

    try {
      const response = await fetch(`${ML_API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sequence: sequenceRef.current.map((frame) => Array.from(frame)),
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

      metricsRef.current.apiMs = smoothMetric(
        metricsRef.current.apiMs,
        performance.now() - apiStartedAt,
      );
      publishMetrics();

      if (!cameraActiveRef.current) return;
      const sampleReceivedAt = performance.now();
      predictionSamplesRef.current = predictionSamplesRef.current.filter(
        (item) => sampleReceivedAt - item.receivedAt <= 5_000,
      );
      const sample = {
        action: body.prediction,
        confidence: body.confidence,
        receivedAt: sampleReceivedAt,
      };
      predictionSamplesRef.current.push(sample);
      if (predictionSamplesRef.current.length > STABILITY_WINDOW) {
        predictionSamplesRef.current.shift();
      }
      const matchingSamples = predictionSamplesRef.current.filter(
        (item) => item.action === sample.action,
      );
      if (matchingSamples.length >= 2) {
        const stablePrediction = {
          action: sample.action,
          confidence:
            matchingSamples.reduce(
              (total, item) => total + item.confidence,
              0,
            ) / matchingSamples.length,
        };
        predictionUpdateStartedAtRef.current = performance.now();
        setPrediction(stablePrediction);
        setPredictionMessage(
          stablePrediction.confidence < 0.5
            ? "Seña consistente, pero con confianza baja. Repite despacio y mantén las manos visibles."
            : "Seña reconocida de forma consistente.",
        );
      } else {
        setPredictionMessage("Confirmando la seña…");
      }
      predictionFailuresRef.current = 0;
      nextPredictionAtRef.current = performance.now() + PREDICTION_INTERVAL_MS;
    } catch (error) {
      if (!cameraActiveRef.current || (controller.signal.aborted && !timedOut))
        return;
      const message = timedOut
        ? "El servicio tardó demasiado. Se volverá a intentar mientras la cámara siga activa."
        : error instanceof Error && error.message
          ? error.message
          : "No se pudo conectar con el servicio de traducción.";
      predictionFailuresRef.current += 1;
      metricsRef.current.apiMs = smoothMetric(
        metricsRef.current.apiMs,
        performance.now() - apiStartedAt,
      );
      publishMetrics();
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
  }, [publishMetrics]);

  const handleDetectionResult = useCallback(
    (result: DisplayLandmarks, keypoints: Float32Array) => {
      const canvasStartedAt = performance.now();
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context)
        throw new Error("No se pudo preparar el área de cámara.");

      context.save();
      context.clearRect(0, 0, canvas.width, canvas.height);
      const drawing = new DrawingUtils(context);

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
      metricsRef.current.canvasMs = smoothMetric(
        metricsRef.current.canvasMs,
        performance.now() - canvasStartedAt,
      );

      sequenceRef.current.push(keypoints);
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

    if (
      performance.now() - lastDetectionAtRef.current <
      DETECTION_INTERVAL_MS
    ) {
      scheduleNextFrame();
      return;
    }

    lastVideoTimeRef.current = video.currentTime;
    lastDetectionAtRef.current = performance.now();
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(video);
      const timestampMs = Math.max(
        performance.now(),
        lastTimestampRef.current + 1,
      );
      lastTimestampRef.current = timestampMs;
      lastDetectionSentAtRef.current = performance.now();
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
      const { type, landmarks, keypoints, inferenceMs, keypointsMs, error } =
        event.data;
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
          if (!(keypoints instanceof Float32Array)) {
            throw new Error("El detector devolvió puntos clave no válidos.");
          }
          const resultAt = performance.now();
          if (lastDetectionResultAtRef.current > 0) {
            metricsRef.current.trackingFps = smoothMetric(
              metricsRef.current.trackingFps,
              1_000 / (resultAt - lastDetectionResultAtRef.current),
            );
          }
          lastDetectionResultAtRef.current = resultAt;
          metricsRef.current.workerRoundTripMs = smoothMetric(
            metricsRef.current.workerRoundTripMs,
            resultAt - lastDetectionSentAtRef.current,
          );
          if (typeof inferenceMs === "number") {
            metricsRef.current.inferenceMs = smoothMetric(
              metricsRef.current.inferenceMs,
              inferenceMs,
            );
          }
          if (typeof keypointsMs === "number") {
            metricsRef.current.keypointsMs = smoothMetric(
              metricsRef.current.keypointsMs,
              keypointsMs,
            );
          }
          handleDetectionResult(landmarks as DisplayLandmarks, keypoints);
          publishMetrics();
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
  }, [
    handleDetectionResult,
    publishMetrics,
    scheduleNextFrame,
    stopCamera,
    workerRestartKey,
  ]);

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
      const cameraTrack = stream.getVideoTracks()[0];
      const zoomCapabilities = cameraTrack?.getCapabilities() as
        | CameraZoomCapabilities
        | undefined;
      const zoom = zoomCapabilities?.zoom;
      if (cameraTrack && zoom && zoom.max > zoom.min) {
        const widestZoom = zoom.min;
        try {
          await cameraTrack.applyConstraints({
            advanced: [{ zoom: widestZoom } as CameraZoomConstraint],
          });
          setZoomRange({
            min: zoom.min,
            max: zoom.max,
            step: zoom.step || 0.1,
            value: widestZoom,
          });
        } catch {
          // Some browsers expose zoom capabilities but reject runtime changes.
          setZoomRange(null);
        }
      } else {
        setZoomRange(null);
      }
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
      const cameraSettings = cameraTrack?.getSettings();
      metricsRef.current.cameraFps = cameraSettings?.frameRate ?? null;
      metricsRef.current.cameraResolution =
        video.videoWidth && video.videoHeight
          ? `${video.videoWidth} × ${video.videoHeight}`
          : null;
      predictionSamplesRef.current = [];
      lastDetectionResultAtRef.current = 0;
      publishMetrics(true);
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
  }, [isLoadingCamera, publishMetrics, scheduleNextFrame, workerStatus]);

  const handleZoomChange = useCallback(async (value: number) => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;

    setZoomRange((current) => (current ? { ...current, value } : current));
    try {
      await track.applyConstraints({
        advanced: [{ zoom: value } as CameraZoomConstraint],
      });
    } catch {
      setZoomRange(null);
    }
  }, []);

  const recognizedSign = prediction
    ? getSignByModelAction(prediction.action)
    : null;
  const recognizedWord = recognizedSign?.word ?? prediction?.action ?? null;

  const cameraStatus = isCameraActive
    ? "Cámara activa"
    : isLoadingCamera
      ? "Iniciando cámara…"
      : "Cámara apagada";

  return (
    <section
      aria-label="Traductor de seña a texto"
      className="relative min-h-dvh w-full overflow-hidden bg-[#050608]"
    >
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#050608]">
        <video
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${isCameraActive ? "opacity-100" : "opacity-0"}`}
          muted
          playsInline
          ref={videoRef}
          tabIndex={-1}
        />
        <canvas
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${isCameraActive ? "opacity-100" : "opacity-0"}`}
          ref={canvasRef}
          tabIndex={-1}
        />

        {!isCameraActive && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 pb-24 pt-36 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-[#121a25]/80 text-[#c3c9d1] shadow-[0_14px_34px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <Camera className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="max-w-lg text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Activa la cámara para empezar
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-[#d4d9e1]">
              La imagen ocupará esta pantalla. El detector necesita ver tus
              manos y tu rostro.
            </p>
          </div>
        )}
      </div>

      <aside
        aria-labelledby="encuadre-titulo"
        className="translator-glass translator-panel absolute left-6 top-24 z-20 hidden w-[19rem] rounded-2xl p-5 xl:block 2xl:left-10 2xl:top-28"
      >
        <h2 className="text-lg font-semibold text-white" id="encuadre-titulo">
          Encuadre
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#e0e5eb]">
          Mantén las manos y el rostro dentro de la imagen para que el detector
          pueda seguir la seña.
        </p>
        <div className="mt-5 border-t border-white/15 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#c3c9d1]">
            El modelo reconoce
          </h3>
          <ul
            className="mt-3 flex flex-wrap gap-2"
            aria-label="Señas reconocidas"
          >
            {["Hola", "Gracias", "Te amo"].map((word) => (
              <li
                className="rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white"
                key={word}
              >
                {word}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-[#d0d6df]">
            Los fotogramas se analizan en el navegador; el servicio recibe
            puntos clave para la predicción.
          </p>
        </div>
      </aside>

      <aside
        aria-labelledby="resultado-titulo"
        className="translator-glass translator-panel absolute right-6 top-24 z-20 w-[min(23rem,calc(100%-3rem))] rounded-2xl p-5 sm:p-6 max-xl:right-5 max-xl:top-24 max-md:left-4 max-md:right-4 max-md:top-auto max-md:bottom-24 max-md:w-auto max-md:p-4 2xl:right-10 2xl:top-28"
      >
        <div className="flex items-center justify-between gap-3">
          <h2
            className="text-lg font-semibold text-white"
            id="resultado-titulo"
          >
            Resultado
          </h2>
        </div>

        <div className="mt-5 min-h-32 rounded-xl bg-black/25 px-4 py-5 sm:min-h-40 sm:px-5 sm:py-6">
          <p className="text-sm font-medium text-[#d8dee6]">
            Última seña reconocida
          </p>
          <output
            aria-atomic="true"
            aria-label={
              prediction && prediction.confidence < 0.5
                ? `${recognizedWord ?? "Seña"}, confianza baja`
                : undefined
            }
            aria-live="polite"
            className="mt-3 block min-h-10 break-words text-3xl font-semibold leading-tight text-white sm:text-4xl"
          >
            {recognizedWord ?? "Esperando una seña"}
          </output>
          {prediction && (
            <p className="mt-3 text-sm text-[#d0d6df]">
              {Math.round(prediction.confidence * 1000) / 10}% de confianza del
              modelo
            </p>
          )}
        </div>

        <p
          aria-live="off"
          className="mt-4 min-h-5 text-sm leading-relaxed text-[#e0e5eb]"
        >
          {predictionMessage}
        </p>

        <details className="mt-4 border-t border-white/15 pt-3">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-[#e0e5eb] underline decoration-white/40 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c3d5f1]">
            Diagnóstico de rendimiento
          </summary>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-[#d0d6df]">
            <div>
              <dt>Cámara</dt>
              <dd className="font-medium text-white">
                {metrics.cameraResolution ?? "—"}
                {metrics.cameraFps
                  ? ` · ${Math.round(metrics.cameraFps)} fps`
                  : ""}
              </dd>
            </div>
            <div>
              <dt>Seguimiento</dt>
              <dd className="font-medium text-white">
                {formatMetric(metrics.trackingFps, " fps")}
              </dd>
            </div>
            <div>
              <dt>Inferencia del modelo</dt>
              <dd className="font-medium text-white">
                {formatMetric(metrics.inferenceMs)}
              </dd>
            </div>
            <div>
              <dt>Preparación de puntos</dt>
              <dd className="font-medium text-white">
                {formatMetric(metrics.keypointsMs)}
              </dd>
            </div>
            <div>
              <dt>Worker → pantalla</dt>
              <dd className="font-medium text-white">
                {formatMetric(metrics.workerRoundTripMs)}
              </dd>
            </div>
            <div>
              <dt>Dibujo</dt>
              <dd className="font-medium text-white">
                {formatMetric(metrics.canvasMs)}
              </dd>
            </div>
            <div>
              <dt>API (ida y vuelta)</dt>
              <dd className="font-medium text-white">
                {formatMetric(metrics.apiMs)}
              </dd>
            </div>
            <div>
              <dt>Actualización de interfaz</dt>
              <dd className="font-medium text-white">
                {formatMetric(metrics.uiUpdateMs)}
              </dd>
            </div>
          </dl>
        </details>

        <div className="mt-4 border-t border-white/15 pt-3 xl:hidden">
          <p className="text-sm leading-relaxed text-[#e0e5eb]">
            Mantén las manos y el rostro dentro de la imagen.
          </p>
          <p className="mt-2 text-xs font-medium text-[#c3c9d1]">
            Reconoce: Hola · Gracias · Te amo
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[#d0d6df]">
            Los fotogramas se analizan aquí; el servicio recibe puntos clave
            para la predicción.
          </p>
        </div>
      </aside>

      <div className="absolute inset-x-0 bottom-5 z-30 flex justify-center px-4 max-md:bottom-4">
        <div className="translator-glass translator-controls flex w-fit max-w-full flex-wrap items-center justify-center gap-3 rounded-2xl p-2.5 sm:gap-4 sm:px-4">
          {workerStatus === "loading" ? (
            <output className="inline-flex min-h-11 items-center gap-2 px-2 text-sm text-white">
              <LoaderCircle
                aria-hidden="true"
                className="h-4 w-4 motion-safe:animate-spin"
              />
              Preparando el detector…
            </output>
          ) : workerStatus === "error" ? (
            <div
              className="flex max-w-xs items-start gap-2 px-2 text-sm text-[#f3d5dc] sm:max-w-md"
              role="alert"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span>{workerMessage}</span>
            </div>
          ) : (
            <output
              aria-live="polite"
              className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-medium text-white"
            >
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full ${isCameraActive ? "bg-emerald-400" : "bg-[#c3c9d1]"}`}
              />
              {cameraStatus}
            </output>
          )}

          <span
            aria-hidden="true"
            className="hidden h-8 w-px bg-white/20 sm:block"
          />

          {isCameraActive && zoomRange && (
            <label className="flex min-h-11 min-w-36 items-center gap-2 px-1 text-xs text-white sm:min-w-48 sm:text-sm">
              <span className="shrink-0">Encuadre</span>
              <input
                aria-label="Alejar o acercar la cámara"
                className="min-w-16 flex-1 accent-[#9bb8e8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c3d5f1]"
                max={zoomRange.max}
                min={zoomRange.min}
                onChange={(event) =>
                  void handleZoomChange(Number(event.currentTarget.value))
                }
                step={zoomRange.step}
                type="range"
                value={zoomRange.value}
              />
              <output className="min-w-10 text-right tabular-nums">
                {zoomRange.value.toFixed(1)}×
              </output>
            </label>
          )}

          {workerStatus === "error" ? (
            <Button
              className="min-h-11 shrink-0 bg-[#4d6999] px-4 text-white hover:bg-[#5c79aa] focus-visible:ring-[#c3d5f1]"
              onClick={() => setWorkerRestartKey((key) => key + 1)}
              type="button"
            >
              <RotateCcw aria-hidden="true" />
              Reintentar detector
            </Button>
          ) : (
            <Button
              className="min-h-11 shrink-0 bg-[#4d6999] px-5 text-white hover:bg-[#5c79aa] focus-visible:ring-[#c3d5f1] disabled:bg-[#435775] disabled:text-white/80"
              disabled={workerStatus !== "ready" || isLoadingCamera}
              onClick={isCameraActive ? stopCamera : startCamera}
              type="button"
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
          <div
            className="translator-glass absolute bottom-full mb-3 w-[min(32rem,calc(100vw-2rem))] rounded-xl p-3 text-sm text-[#ffe2e7]"
            role="alert"
          >
            <div className="flex items-start gap-2">
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span>{cameraError ?? frameError}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
