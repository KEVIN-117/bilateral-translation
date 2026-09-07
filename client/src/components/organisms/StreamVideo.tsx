"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { extractKeypoints } from "@/lib/keypointExtractor";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const SEQUENCE_LENGTH = 30;

export default function StreamVideo() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    const sequenceRef = useRef<number[][]>([]);
    const holisticRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);

    // Inicializar Holistic una sola vez al montar el componente
    useEffect(() => {
        const mpHolistic = require('@mediapipe/holistic');
        const mpDrawing = require('@mediapipe/drawing_utils');

        const win = window as any;
        const Holistic = mpHolistic.Holistic || win.Holistic;
        const FACEMESH_TESSELATION = mpHolistic.FACEMESH_TESSELATION;
        const POSE_CONNECTIONS = mpHolistic.POSE_CONNECTIONS;
        const HAND_CONNECTIONS = mpHolistic.HAND_CONNECTIONS;
        const drawConnectors = mpDrawing.drawConnectors || win.drawConnectors;
        const drawLandmarks = mpDrawing.drawLandmarks || win.drawLandmarks;

        const holistic = new Holistic({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
        });

        holistic.setOptions({
            modelComplexity: 0,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            refineFaceLandmarks: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        holistic.onResults((results: any) => {
            if (!canvasRef.current || !videoRef.current) return;
            const canvasCtx = canvasRef.current.getContext("2d");
            if (!canvasCtx) return;

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            canvasCtx.drawImage(
                results.image,
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
            );

            if (results.faceLandmarks) {
                drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
                    color: "#C0C0C070",
                    lineWidth: 1,
                });
            }
            if (results.poseLandmarks) {
                drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
                    color: "#00FF00",
                    lineWidth: 2,
                });
                drawLandmarks(canvasCtx, results.poseLandmarks, { color: "#FF0000", lineWidth: 1, radius: 2 });
            }
            if (results.leftHandLandmarks) {
                drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
                    color: "#CC0000",
                    lineWidth: 2,
                });
                drawLandmarks(canvasCtx, results.leftHandLandmarks, { color: "#00FF00", lineWidth: 1, radius: 2 });
            }
            if (results.rightHandLandmarks) {
                drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
                    color: "#00CC00",
                    lineWidth: 2,
                });
                drawLandmarks(canvasCtx, results.rightHandLandmarks, { color: "#FF0000", lineWidth: 1, radius: 2 });
            }
            canvasCtx.restore();

            const keypoints = extractKeypoints(results);
            sequenceRef.current.push(keypoints);

            if (sequenceRef.current.length > SEQUENCE_LENGTH) {
                sequenceRef.current.shift();
            }
        });

        holisticRef.current = holistic;

        return () => {
            holistic.close();
        };
    }, []);

    // Controlar el encendido/apagado de la cámara independientemente de Holistic
    useEffect(() => {
        if (!isCameraActive || !videoRef.current || !holisticRef.current) return;

        const mpCamera = require('@mediapipe/camera_utils');
        const Camera = mpCamera.Camera || (window as any).Camera;

        let isActive = true;

        const camera = new Camera(videoRef.current, {
            onFrame: async () => {
                if (!isActive) return; // Evitar enviar frames si la cámara se detuvo
                if (videoRef.current && holisticRef.current) {
                    try {
                        await holisticRef.current.send({ image: videoRef.current });
                    } catch (e) {
                        // Ignorar errores si Holistic se cerró abruptamente
                    }
                }
            },
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
        });

        camera.start();
        cameraRef.current = camera;

        return () => {
            isActive = false; // Interrumpir inmediatamente el bucle onFrame
            if (cameraRef.current) {
                cameraRef.current.stop();
                cameraRef.current = null;
            }
        };
    }, [isCameraActive]);

    const startCamera = () => {
        setIsCameraActive(true);
        toast({
            title: "Cámara Iniciada",
            description: "MediaPipe Holistic está rastreando en tiempo real.",
            type: "success",
        });
    };

    const stopCamera = () => {
        setIsCameraActive(false);
        sequenceRef.current = []; // Reiniciar buffer

        // Limpiar canvas visualmente
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

    return (
        <main className="w-full flex flex-col items-center justify-center p-4">
            <div className="bg-black/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-cyan-500/30 p-6 space-y-6 w-full max-w-4xl">

                {/* Controles Header */}
                <div className="flex justify-center md:flex-row flex-col gap-5">
                    {!isCameraActive ? (
                        <Button onClick={startCamera} className='inline-flex items-center px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-pink-500/25 border border-pink-500/50'>
                            Activar Cámara
                        </Button>
                    ) : (
                        <Button onClick={stopCamera} className='inline-flex items-center px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/25 border border-red-500/50'>
                            Detener Cámara
                        </Button>
                    )}
                </div>

                {/* Área de Cámara y Canvas */}
                <section className="flex flex-col items-center justify-center mt-4 w-full">
                    <div className="relative">
                        <div className="bg-black/60 rounded-xl p-4 border-2 border-dashed border-cyan-400/50 flex justify-center items-center overflow-hidden">

                            {/* Ocultamos el video real ya que dibujaremos todo en el Canvas */}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="hidden"
                            />

                            {/* Renderizamos el Canvas de MediaPipe */}
                            <canvas
                                ref={canvasRef}
                                width={CANVAS_WIDTH}
                                height={CANVAS_HEIGHT}
                                className={`w-full max-w-[640px] h-auto rounded-lg shadow-inner bg-black border border-purple-500/30 transition-opacity duration-300 ${isCameraActive ? 'opacity-100' : 'opacity-50'}`}
                            />

                        </div>

                        {/* Decoración visual de las esquinas */}
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

                <div className="flex justify-center space-x-4 text-sm text-cyan-300/80">
                    <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${isCameraActive ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></div>
                        Cámara {isCameraActive ? 'Activa y Procesando' : 'Inactiva'}
                    </div>
                </div>
            </div>
        </main>
    );
}
