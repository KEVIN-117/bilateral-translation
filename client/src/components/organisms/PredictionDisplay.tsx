"use client";

import { AlertTriangle, HandMetal, Loader2, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PredictionStatus } from "@/hooks/use-sign-prediction";
import { getSignByModelAction } from "@/lib/sign-dictionary";
import type {
  PredictionError,
  PredictionResponse,
} from "@/model/prediction.schema";

interface PredictionDisplayProps {
  status: PredictionStatus;
  result: PredictionResponse | null;
  error: PredictionError | null;
}

/** Un fallo de red merece otro ícono que un rechazo del servidor */
function errorIcon(error: PredictionError) {
  if (error.kind === "network" || error.kind === "timeout") {
    return <WifiOff className="h-6 w-6 text-red-400" />;
  }

  return <AlertTriangle className="h-6 w-6 text-amber-400" />;
}

export function PredictionDisplay({
  status,
  result,
  error,
}: PredictionDisplayProps) {
  if (status === "loading") {
    return (
      <output
        aria-live="polite"
        className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/20 p-6 text-center"
      >
        <Loader2 className="h-6 w-6 animate-spin text-[#006f87]" />
        <p className="font-medium text-sm text-white">Analizando la seña…</p>
        <p className="text-gray-500 text-xs">Enviando 30 frames al modelo</p>
      </output>
    );
  }

  if (status === "error" && error) {
    return (
      <output
        aria-live="assertive"
        className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-center"
      >
        {errorIcon(error)}
        <p className="font-medium text-sm text-white">{error.message}</p>
        {error.status ? (
          <p className="text-gray-500 text-xs">HTTP {error.status}</p>
        ) : null}
      </output>
    );
  }

  if (status === "success" && result) {
    // El modelo responde "hello"; el usuario tiene que leer "Hola"
    const sign = getSignByModelAction(result.prediction);
    const confidence = Math.round(result.confidence * 1000) / 10;

    return (
      <output
        aria-live="polite"
        className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/20 p-6 text-center"
      >
        <p className="font-bold text-3xl text-white sm:text-4xl">
          {sign?.word ?? result.prediction}
        </p>

        <Badge
          className="border-[#006f87]/40 bg-[#006f87]/20 text-[#7fd6e8]"
          variant="outline"
        >
          {confidence}% de confianza
        </Badge>

        {sign ? null : (
          <p className="text-gray-500 text-xs">
            El modelo devolvió &quot;{result.prediction}&quot;, que no está en
            el diccionario
          </p>
        )}
      </output>
    );
  }

  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-white/10 border-dashed bg-black/20 p-6 text-center">
      <HandMetal className="h-6 w-6 text-gray-500" />
      <p className="text-gray-400 text-sm">
        Haz una seña frente a la cámara y pulsa Traducir.
      </p>
    </div>
  );
}
