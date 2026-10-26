"use client";

import { Cpu, VideoOff } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { SignEntry } from "@/model/sign.schema";

interface SignVideoPlayerProps {
  entry: SignEntry;
  immersive?: boolean;
}

/**
 Reproductor de la seña encontrada
  El padre lo monta con `key={entry.id}`: al cambiar de seña el componente se
  reinicia y vuelve a intentar la carga del nuevo archivo
 */
export function SignVideoPlayer({
  entry,
  immersive = false,
}: SignVideoPlayerProps) {
  const [hasVideoError, setHasVideoError] = useState(false);

  return (
    <article
      aria-label={`Video de la seña ${entry.word}`}
      className={
        immersive
          ? "absolute inset-0"
          : "translator-glass overflow-hidden rounded-2xl"
      }
    >
      <div
        className={
          immersive
            ? "absolute inset-0 flex items-center justify-center bg-[#050608]"
            : "relative aspect-video w-full bg-black/40"
        }
      >
        {hasVideoError ? (
          <div
            className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
            role="alert"
          >
            <VideoOff aria-hidden="true" className="h-8 w-8 text-[#c3c9d1]" />
            <p className="font-heading text-sm font-medium text-white">
              Video no disponible todavía
            </p>
            <p className="text-sm text-[#d0d6df]">
              La seña existe en el diccionario, pero falta el archivo{" "}
              <code className="text-gray-300">{entry.videoUrl}</code>.
            </p>
          </div>
        ) : (
          <video
            autoPlay
            aria-label={`Reproducción de la seña ${entry.word}`}
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

      <div
        className={
          immersive
            ? "translator-glass translator-panel absolute bottom-20 right-5 z-20 w-[min(24rem,calc(100%-2.5rem))] rounded-2xl p-5 max-md:bottom-20 max-md:left-4 max-md:right-4 max-md:w-auto 2xl:bottom-10 2xl:right-10"
            : "flex flex-col gap-3 p-6"
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold text-white">{entry.word}</h2>

          {entry.modelAction ? (
            <Badge
              className="gap-1.5 border-[#8da9d5]/40 bg-[#4d6999]/25 text-[#e3edff]"
              variant="outline"
            >
              <Cpu className="h-3 w-3" />
              Reconocida en Seña → texto
            </Badge>
          ) : null}
        </div>

        <p className="leading-relaxed text-[#e0e5eb]">{entry.description}</p>
      </div>
    </article>
  );
}
