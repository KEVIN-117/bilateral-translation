import { Camera, Cpu } from "lucide-react";
import { GlassButton } from "@/components/atoms/GlassButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import StreamVideo from "./StreamVideo";

export function SignToTextPanel() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-10">
      <section aria-labelledby="camara-titulo" className="min-w-0">
        <Card className="h-full bg-white/5 ring-white/10 backdrop-blur-md">
          <CardHeader className="gap-3">
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <h2
                className="font-bold text-white text-xl sm:text-2xl"
                id="camara-titulo"
              >
                Seña → Texto
              </h2>
            </div>
            <p className="text-center text-gray-400 text-sm sm:text-base lg:text-left">
              Área de video y resultado del reconocimiento.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex aspect-video items-center justify-center rounded-xl border border-white/15 border-dashed bg-black/30 p-4 text-center sm:p-6">
              <StreamVideo />
            </div>

            <GlassButton className="w-full" disabled type="button">
              Iniciar cámara
            </GlassButton>
          </CardContent>
        </Card>
      </section>

      <aside className="glass-card flex flex-col gap-4 p-5 sm:p-6">
        <h2 className="flex items-center justify-center gap-2 font-heading font-medium text-gray-400 text-sm uppercase tracking-wide lg:justify-start">
          <Cpu className="h-4 w-4 text-[#006f87]" />
          Texto reconocido
        </h2>

        <div className="flex min-h-32 items-center justify-center rounded-xl border border-white/10 border-dashed bg-black/20 p-4 text-center">
          <p className="text-gray-400 text-sm">
            El resultado de tus señas aparecerá aquí.
          </p>
        </div>
      </aside>
    </div>
  );
}
