import { ArrowRight, Camera, Search } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/atoms/Container";

const MODULES = [
  {
    href: "/camara",
    icon: Camera,
    title: "Seña → Texto",
    description:
      "Muestra una seña a la cámara y el modelo LSTM la traduce a texto.",
    accent: "#72004c",
  },
  {
    href: "/traductor",
    icon: Search,
    title: "Texto → Seña",
    description:
      "Busca una palabra en el diccionario y mira el video que enseña su seña.",
    accent: "#006f87",
  },
];

export function ModulesSection() {
  return (
    <section aria-labelledby="modulos-titulo" className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-16">
          <h2
            className="mb-4 font-bold text-2xl text-white sm:text-3xl md:text-5xl"
            id="modulos-titulo"
          >
            Traducción <span className="text-gradient">bilateral</span>
          </h2>
          <p className="text-base text-gray-400 sm:text-lg">
            Dos flujos independientes que comparten el mismo vocabulario.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {MODULES.map((module) => (
            <Link
              className="glass-card group relative flex flex-col gap-4 overflow-hidden p-6 sm:p-8"
              href={module.href}
              key={module.href}
            >
              <div
                className="absolute top-0 right-0 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
                style={{ backgroundColor: module.accent }}
              />
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl sm:h-14 sm:w-14"
                style={{ backgroundColor: `${module.accent}33` }}
              >
                <module.icon
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  style={{ color: module.accent }}
                />
              </div>
              <h3 className="font-bold text-white text-xl sm:text-2xl">
                {module.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {module.description}
              </p>
              <span className="mt-auto inline-flex items-center gap-2 font-medium text-sm text-white">
                Abrir módulo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
