import { Camera, Cpu } from "lucide-react";
import { GlassButton } from "@/components/atoms/GlassButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/** Issue que implementa la captura de cámara y el envío de frames */
const CAMERA_ISSUE = "FRON-2";

export function SignToTextPanel() {
  return (
    <section aria-labelledby="camara-titulo" className="min-w-0">
      <Card className="h-full bg-white/5 ring-white/10 backdrop-blur-md">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2
              className="font-bold text-white text-xl sm:text-2xl"
              id="camara-titulo"
            >
              Seña → Texto
            </h2>
            <Badge
              className="border-white/15 bg-white/5 text-gray-300"
              variant="outline"
            >
              {CAMERA_ISSUE}
            </Badge>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Área de video y resultado del reconocimiento.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex aspect-video items-center justify-center rounded-xl border border-white/15 border-dashed bg-black/30 p-4 text-center sm:p-6">
            <div className="space-y-3">
              <Camera className="mx-auto h-8 w-8 text-gray-500" />
              <p className="font-medium text-white">Vista de la cámara</p>
              <p className="mx-auto max-w-xs text-gray-400 text-sm">
                El módulo de captura llega en el issue {CAMERA_ISSUE}.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-medium text-white">
              <Cpu className="h-4 w-4 text-[#006f87]" />
              Texto reconocido
            </h3>
            <p className="text-gray-400 text-sm">
              El resultado de tus señas aparecerá aquí.
            </p>
          </div>

          <GlassButton className="w-full sm:w-auto" disabled type="button">
            Iniciar cámara
          </GlassButton>
        </CardContent>
      </Card>
    </section>
  );
}
