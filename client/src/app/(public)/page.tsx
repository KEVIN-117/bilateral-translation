import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StreamVideoClient } from "@/components/organisms/StreamVideoClient";
import StreamVideo from "@/components/organisms/StreamVideo";

export default function Home() {
  return (
    <main
      id="contenido"
      className="mx-auto w-full max-w-full flex-1 px-4 py-8 sm:px-6 sm:py-12"
    >
      <header className="mb-8 space-y-3">
        <p className="text-sm font-medium text-cyan-300">
          Bilateral Translation · MVP
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Un espacio para entendernos
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Traducción entre lengua de señas y texto. Los módulos de traducción
          estarán disponibles próximamente.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="video-title" className="min-w-0">
          <Card className="h-full">
            <CardHeader>
              <h2 id="video-title" className="text-xl font-semibold">
                Señas → Texto
              </h2>
              <p className="text-muted-foreground">
                Área de video y resultado del reconocimiento.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex w-full items-center justify-center rounded-xl border border-dashed border-white/25 bg-black/30 p-4 text-center">
                <StreamVideo />
              </div>
              <div className="rounded-xl border p-4">
                <h3 className="mb-2 font-medium">Texto reconocido</h3>
                <p className="text-sm text-muted-foreground">
                  El resultado de tus señas aparecerá aquí.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
        <section aria-labelledby="text-title" className="min-w-0">
          <Card className="h-full">
            <CardHeader>
              <h2 id="text-title" className="text-xl font-semibold">
                Texto → Señas
              </h2>
              <p className="text-muted-foreground">
                Área de texto y visualización de la seña.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="translation-text" className="block font-medium">
                  Texto para traducir
                </label>
                <Textarea
                  id="translation-text"
                  placeholder="Escribe una palabra…"
                  maxLength={500}
                  className="min-h-28 resize-y"
                  aria-describedby="text-help"
                />
                <p id="text-help" className="text-sm text-muted-foreground">
                  Puedes escribir; la traducción todavía no está conectada.
                </p>
              </div>
              <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-white/25 bg-black/30 p-6 text-center">
                <div className="space-y-2">
                  <h3 className="font-medium">Visualización de la seña</h3>
                  <p className="text-sm text-muted-foreground">
                    Aquí se mostrará el video del diccionario.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
