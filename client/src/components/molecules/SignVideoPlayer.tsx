"use client";

import { Cpu, VideoOff } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { SignEntry } from "@/model/sign.schema";

interface SignVideoPlayerProps {
  entry: SignEntry;
}

/**
 Reproductor de la seña encontrada
  El padre lo monta con `key={entry.id}`: al cambiar de seña el componente se
  reinicia y vuelve a intentar la carga del nuevo archivo
 */
export function SignVideoPlayer({ entry }: SignVideoPlayerProps) {
  const [hasVideoError, setHasVideoError] = useState(false);

  return (
    <article className="glass-card overflow-hidden p-0">
      <div className="relative aspect-video w-full bg-black/40">
        {hasVideoError ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <VideoOff className="h-8 w-8 text-gray-500" />
            <p className="font-heading text-sm font-medium text-white">
              Video no disponible todavía
            </p>
            <p className="text-sm text-gray-400">
              La seña existe en el diccionario, pero falta el archivo{" "}
              <code className="text-gray-300">{entry.videoUrl}</code>.
            </p>
          </div>
        ) : (
          <video
            autoPlay
            className="h-full w-full object-contain"
            controls
            key={entry.videoUrl}
            loop
            muted
            onError={() => setHasVideoError(true)}
            playsInline
            preload="metadata"
          >
            <source src={entry.videoUrl} type="video/mp4" />
          </video>
        )}
      </div>

      <div className="flex flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold text-white">{entry.word}</h2>

          {entry.modelAction ? (
            <Badge
              className="gap-1.5 border-[#006f87]/40 bg-[#006f87]/20 text-[#7fd6e8]"
              variant="outline"
            >
              <Cpu className="h-3 w-3" />
              Traducida por el modelo
            </Badge>
          ) : null}
        </div>

        <p className="leading-relaxed text-gray-400">{entry.description}</p>
      </div>
    </article>
  );
}
