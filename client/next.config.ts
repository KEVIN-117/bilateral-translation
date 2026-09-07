import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // En desarrollo Next bloquea las peticiones cross-origin a /_next/*. Sin esto,
  // al abrir la app desde un tunel o desde la IP de la red local el HTML llega
  // pero los chunks no, React nunca hidrata y ningun boton responde
  allowedDevOrigins: [
    '192.168.1.7',
    '*.lhr.life',
    '*.serveo.net',
    '*.trycloudflare.com',
    '*.ngrok-free.app',
    '*.ngrok.io',
    '*.loca.lt',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
