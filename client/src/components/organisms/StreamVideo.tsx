"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { extractKeypoints } from "@/lib/keypointExtractor";
import { Video, VideoOff, Loader2 } from "lucide-react";
import {
    HolisticLandmarkerResult,
    DrawingUtils,
    FaceLandmarker,
    PoseLandmarker,
    HandLandmarker,
} from "@mediapipe/tasks-vision";
import { GlassButton } from "../atoms/GlassButton";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const SEQUENCE_LENGTH = 30;

export default function StreamVideo() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isLoadingCamera, setIsLoadingCamera] = useState(false);
    const [prediction, setPrediction] = useState<string>("");

    const sequenceRef = useRef<number[][]>([]);
    const workerRef = useRef<Worker | null>(null);
    const isWorkerReadyRef = useRef(false);

    const requestAnimationFrameId = useRef<number | null>(null);
    const lastVideoTimeRef = useRef<number>(-1);
    const lastTimestampMsRef = useRef<number>(-1);
    const streamRef = useRef<MediaStream | null>(null);
    const isPredictingRef = useRef(false);

    useEffect(() => {
        const worker = new Worker(new URL('../../lib/holistic-landmarker.worker.ts', import.meta.url), {
            type: 'module'
        });

        worker.onmessage = (event) => {
            const { type, result, mode } = event.data;

            if (type === 'INIT_DONE') {
                isWorkerReadyRef.current = true;
                console.log("Holistic Worker Inicializado");
            } else if (type === 'DETECT_RESULT') {
                handleDetectionResult(result);

                if (videoRef.current && !videoRef.current.paused) {
                    requestAnimationFrameId.current = requestAnimationFrame(processVideoFrame);
                }
            } else if (type === 'ERROR') {
                console.error("Worker error:", event.data.error);
            }
        };

        worker.postMessage({
            type: 'INIT',
            runningMode: 'VIDEO',
            delegate: 'GPU',
        });

        workerRef.current = worker;

        return () => {
            worker.postMessage({ type: 'CLEANUP' });
            worker.terminate();
        };
    }, []);

    const handleDetectionResult = (result: HolisticLandmarkerResult) => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        ctx.save();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        const drawingUtils = new DrawingUtils(ctx);

        if (result.faceLandmarks && result.faceLandmarks.length > 0) {
            for (const landmarks of result.faceLandmarks) {
                drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
                    color: '#C0C0C070',
                    lineWidth: 1,
                });
            }
        }

        // Pose Landmarks
        if (result.poseLandmarks && result.poseLandmarks.length > 0) {
            for (const landmarks of result.poseLandmarks) {
                drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
                drawingUtils.drawLandmarks(landmarks, { color: '#FF0000', radius: 2, lineWidth: 1 });
            }
        }

        // Left Hand Landmarks
        if (result.leftHandLandmarks && result.leftHandLandmarks.length > 0) {
            for (const landmarks of result.leftHandLandmarks) {
                drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: '#CC0000', lineWidth: 2 });
                drawingUtils.drawLandmarks(landmarks, { color: '#00FF00', radius: 2, lineWidth: 1 });
            }
        }

        // Right Hand Landmarks
        if (result.rightHandLandmarks && result.rightHandLandmarks.length > 0) {
            for (const landmarks of result.rightHandLandmarks) {
                drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: '#00CC00', lineWidth: 2 });
                drawingUtils.drawLandmarks(landmarks, { color: '#FF0000', radius: 2, lineWidth: 1 });
            }
        }
        ctx.restore();

        // Extraer y procesar keypoints
        const keypoints = extractKeypoints(result);
        sequenceRef.current.push(keypoints);

        if (sequenceRef.current.length > SEQUENCE_LENGTH) {
            sequenceRef.current.shift();
        }

        // --- INYECCIÓN DE LA API FRON-3 ---
        if (sequenceRef.current.length === SEQUENCE_LENGTH && !isPredictingRef.current) {
            isPredictingRef.current = true;

            const currentSequence = [...sequenceRef.current];

            fetch("http://localhost:8000/api/v1/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sequence: currentSequence })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.prediction) {
                        setPrediction(`${data.prediction}`);
                    }
                })
                .catch(err => {
                    console.error("Error consultando a FastAPI:", err);
                })
                .finally(() => {
                    isPredictingRef.current = false;
                });
        }
    };

    const processVideoFrame = async () => {
        if (!videoRef.current || !workerRef.current || !isWorkerReadyRef.current) {
            requestAnimationFrameId.current = requestAnimationFrame(processVideoFrame);
            return;
        }

        const video = videoRef.current;

        if (video.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = video.currentTime;

            try {
                const bitmap = await window.createImageBitmap(video);

                const now = performance.now();
                const timestampMs = now > lastTimestampRef.current ? now : lastTimestampRef.current + 1;
                lastTimestampRef.current = timestampMs;

                workerRef.current.postMessage({
                    type: 'DETECT_VIDEO',
                    bitmap: bitmap,
                    timestampMs: timestampMs,
                }, [bitmap]);

                return;
            } catch (error) {
                console.error("Error creando ImageBitmap", error);
            }
        }

        requestAnimationFrameId.current = requestAnimationFrame(processVideoFrame);
    };

    const lastTimestampRef = lastTimestampMsRef; // alias

    const startCamera = async () => {
        setIsLoadingCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadeddata = () => {
                    if (canvasRef.current && videoRef.current) {
                        canvasRef.current.width = videoRef.current.videoWidth;
                        canvasRef.current.height = videoRef.current.videoHeight;
                    }
                    videoRef.current?.play();
                    setIsCameraActive(true);
                    setIsLoadingCamera(false);

                    toast({
                        title: "Cámara Iniciada",
                        description: "Procesando con Web Worker de MediaPipe.",
                    });

                    requestAnimationFrameId.current = requestAnimationFrame(processVideoFrame);
                };
            }
        } catch (error) {
            setIsLoadingCamera(false);
            console.error("Error accediendo a la cámara:", error);
            toast({
                title: "Error de Cámara",
                description: "No se pudo acceder a tu cámara web. Verifica los permisos.",
                variant: "destructive",
            });
        }
    };

    const stopCamera = () => {
        setIsCameraActive(false);
        sequenceRef.current = [];

        if (requestAnimationFrameId.current) {
            cancelAnimationFrame(requestAnimationFrameId.current);
            requestAnimationFrameId.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }

        toast({
            title: "Cámara Detenida",
            description: "Se ha liberado la cámara.",
            type: "success",
        });
    };

    useEffect(() => {
        return () => {
            if (requestAnimationFrameId.current) cancelAnimationFrame(requestAnimationFrameId.current);
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        };
    }, []);

    return (
        <main className="w-full flex flex-col items-center justify-center p-4">
            <div className="bg-black/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-cyan-500/30 p-6 space-y-6 w-full max-w-4xl">



                <section className="flex flex-col items-center justify-center mt-4 w-full">
                    <div className="relative w-full">
                        <div className="bg-black/60 rounded-2xl border border-cyan-400/30 flex justify-center items-center overflow-hidden relative w-full aspect-video shadow-2xl">

                            {/* El video real */}
                            <video
                                ref={videoRef}
                                playsInline
                                muted
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${!isCameraActive ? 'opacity-0' : 'opacity-100'}`}
                            />

                            {/* Canvas donde renderizamos la salida superpuesto al video */}
                            <canvas
                                ref={canvasRef}
                                className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
                            />

                            {!isCameraActive && (
                                <p className="text-sm text-muted-foreground absolute">
                                    La cámara aún no está habilitada.
                                </p>
                            )}
                        </div>

                        <div className="absolute inset-4 pointer-events-none">
                            <div className="relative w-full h-full">
                                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 opacity-80"></div>
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 opacity-80"></div>
                                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 opacity-80"></div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 opacity-80"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Barra de Controles Elegante */}
                <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-4 px-2 bg-black/40 rounded-xl border border-cyan-500/20 p-4 gap-4">

                    <div className="flex items-center space-x-3 text-sm font-medium">
                        <div className={`relative flex items-center justify-center w-3 h-3`}>
                            {isCameraActive && (
                                <div className="absolute w-full h-full rounded-full bg-green-500 animate-ping opacity-75"></div>
                            )}
                            <div className={`relative w-2 h-2 rounded-full ${isCameraActive ? 'bg-green-400' : 'bg-rose-500'}`}></div>
                        </div>
                        <span className={isCameraActive ? "text-green-400" : "text-rose-400"}>
                            {isCameraActive ? "Traduciendo..." : "Cámara apagada"}
                        </span>
                    </div>

                    <Button
                        onClick={isCameraActive ? stopCamera : startCamera}
                        disabled={isLoadingCamera}
                        className={`
                            relative overflow-hidden transition-all duration-300 ease-out flex items-center gap-2 px-6 py-5 rounded-full font-semibold shadow-lg hover:shadow-xl focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none
                            ${isCameraActive
                                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                                : 'bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-[1.02] active:scale-[0.98]'
                            }
                        `}
                        aria-label={isCameraActive ? "Apagar cámara" : "Encender cámara"}
                        aria-pressed={isCameraActive}
                    >
                        {isLoadingCamera ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                                <span>Iniciando...</span>
                            </>
                        ) : isCameraActive ? (
                            <>
                                <VideoOff className="w-5 h-5" aria-hidden="true" />
                                <span>Pausar</span>
                            </>
                        ) : (
                            <>
                                <Video className="w-5 h-5" aria-hidden="true" />
                                <span>Comenzar</span>
                            </>
                        )}
                    </Button>
                </div>

                {/* Prediction Result UI */}
                <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-xl border border-cyan-500/20 w-full max-w-md mx-auto mt-4">
                    <h3 className="text-sm font-semibold text-cyan-300/60 uppercase tracking-wider mb-2">Traducción en Vivo</h3>
                    <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 min-h-[50px] flex items-center justify-center">
                        {prediction || "---"}
                    </p>
                </div>
            </div>
        </main>
    );
}
