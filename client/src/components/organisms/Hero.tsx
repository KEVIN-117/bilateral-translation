import { ArrowRight, BookOpen, Camera, HandMetal } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/atoms/Container";

const modeLinkClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c3d5f1]";

export function Hero() {
  return (
    <section
      aria-labelledby="home-title"
      className="relative isolate overflow-hidden"
    >
      <Container className="relative z-10">
        <div className="grid min-h-[min(780px,calc(100svh-76px))] items-center gap-10 py-12 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#8da9d5]/25 bg-[#8da9d5]/[0.08] px-3 py-1.5 text-sm font-medium text-[#c3d5f1]">
              <HandMetal aria-hidden="true" className="h-4 w-4" />
              LSB boliviana
            </div>

            <h1
              className="max-w-[13ch] text-balance font-semibold text-4xl leading-[1.08] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl xl:text-7xl"
              id="home-title"
            >
              Una seña también puede abrir una conversación.
            </h1>

            <p className="mt-6 max-w-[58ch] text-base leading-7 text-[#c3c9d1] sm:text-lg sm:leading-8">
              Explora las dos direcciones del traductor: muestra una seña a la
              cámara o escribe una palabra para ver su video en lengua de señas.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className={`${modeLinkClass} bg-[#4d6999] text-white shadow-[0_8px_24px_rgba(25,47,83,0.28)] hover:bg-[#5c79aa]`}
                href="/traductor/sena-a-texto"
              >
                <Camera aria-hidden="true" className="h-5 w-5" />
                Abrir cámara
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                className={`${modeLinkClass} translator-glass text-[#edf1f6] hover:bg-white/10`}
                href="/traductor/texto-a-sena"
              >
                <BookOpen aria-hidden="true" className="h-5 w-5" />
                Explorar el diccionario
              </Link>
            </div>

            <p className="mt-6 max-w-[58ch] text-sm leading-6 text-[#aeb8c7]">
              El reconocimiento por cámara identifica Hola, Gracias y Te amo. El
              diccionario incluye diez señas con videos de referencia.
            </p>
          </div>

          <aside
            aria-label="Opciones de traducción disponibles"
            className="translator-glass relative overflow-hidden rounded-2xl p-5 sm:rounded-3xl sm:p-8"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#8da9d5]/10 blur-3xl"
            />
            <div className="relative">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#aeb8c7] uppercase">
                Traducción en dos direcciones
              </p>
              <h2 className="mt-3 max-w-[18ch] text-2xl font-semibold leading-tight text-white sm:text-3xl">
                Elige cómo quieres comunicarte.
              </h2>

              <div className="mt-7 space-y-3">
                <Link
                  className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-[#8da9d5]/30 bg-[#8da9d5]/[0.1] p-4 transition-colors hover:bg-[#8da9d5]/[0.16] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c3d5f1]"
                  href="/traductor/sena-a-texto"
                >
                  <span className="flex items-center gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#8da9d5]/15 text-[#c3d5f1]">
                      <Camera aria-hidden="true" className="size-5" />
                    </span>
                    <span>
                      <span className="block font-semibold text-white">
                        Seña a texto
                      </span>
                      <span className="mt-1 block text-sm text-[#c3c9d1]">
                        Usa la cámara para traducir
                      </span>
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-5 shrink-0 text-[#c3d5f1] transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition-colors hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c3d5f1]"
                  href="/traductor/texto-a-sena"
                >
                  <span className="flex items-center gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/[0.07] text-[#dce4ef]">
                      <BookOpen aria-hidden="true" className="size-5" />
                    </span>
                    <span>
                      <span className="block font-semibold text-white">
                        Texto a seña
                      </span>
                      <span className="mt-1 block text-sm text-[#c3c9d1]">
                        Consulta el diccionario visual
                      </span>
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-5 shrink-0 text-[#aeb8c7] transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-sm text-[#c3c9d1]">
                <span className="inline-flex items-center gap-2">
                  <HandMetal
                    aria-hidden="true"
                    className="size-4 text-[#c3d5f1]"
                  />
                  3 señas reconocidas por cámara
                </span>
                <span>10 entradas en el diccionario</span>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
