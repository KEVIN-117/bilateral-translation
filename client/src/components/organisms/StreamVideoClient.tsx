"use client";
import dynamic from 'next/dynamic';
import React from 'react';

// Carga dinámica de StreamVideo sin Server-Side Rendering
// Esto es estrictamente necesario porque MediaPipe requiere acceso
// al objeto `window` del navegador para inicializar WebGL y utilidades de cámara.
export const StreamVideoClient = dynamic(
  () => import('./StreamVideo'),
  { ssr: false }
);
