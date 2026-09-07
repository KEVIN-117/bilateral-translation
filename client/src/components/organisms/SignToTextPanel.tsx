import { Cpu } from "lucide-react";
import { GlassButton } from "@/components/atoms/GlassButton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import StreamVideo from "./StreamVideo";

export function SignToTextPanel() {
  return (
    <div className="">
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
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
