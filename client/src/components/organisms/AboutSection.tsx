import { Lightbulb, ShieldCheck } from "lucide-react";
import { Container } from "@/components/atoms/Container";

export function AboutSection() {
  return (
    <section className="relative py-16 sm:py-24" id="mision">
      <Container className="relative z-10">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-16">
          <h2 className="mb-4 font-bold text-2xl text-white sm:mb-6 sm:text-3xl md:text-5xl">
            Nuestra <span className="text-gradient">Esencia</span>
          </h2>
          <p className="text-base text-gray-400 sm:text-lg">
            Inspirados por nuestro emblema, representamos la fusión del
            pensamiento lógico y la tecnología digital, impulsando el desarrollo
            social y tecnológico de Potosí.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:gap-8">
          {/* Left Hemisphere (Purple) */}
          <div className="glass-card group relative overflow-hidden p-6 sm:p-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#72004c] opacity-20 blur-3xl rounded-full group-hover:opacity-40 transition-opacity" />
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#72004c]/20 sm:mb-6 sm:h-14 sm:w-14">
              <Lightbulb className="text-[#72004c] w-7 h-7" />
            </div>
            <h3 className="mb-3 font-bold text-white text-xl sm:mb-4 sm:text-2xl">
              Creatividad y Lógica
            </h3>
            <p className="mb-4 text-gray-400 text-sm leading-relaxed sm:mb-6 sm:text-base">
              El hemisferio izquierdo de nuestro emblema, en tono burdeo,
              simboliza la creatividad, el diseño UX/UI y el pensamiento
              abstracto. Innovamos para resolver desafíos de desarrollo de
              software con estructura y originalidad.
            </p>
          </div>

          {/* Right Hemisphere (Blue) */}
          <div className="glass-card group relative overflow-hidden p-6 sm:p-10">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#006f87] opacity-20 blur-3xl rounded-full group-hover:opacity-40 transition-opacity" />
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#006f87]/20 sm:mb-6 sm:h-14 sm:w-14">
              <ShieldCheck className="text-[#006f87] w-7 h-7" />
            </div>
            <h3 className="mb-3 font-bold text-white text-xl sm:mb-4 sm:text-2xl">
              Enfoque Técnico
            </h3>
            <p className="mb-4 text-gray-400 text-sm leading-relaxed sm:mb-6 sm:text-base">
              El hemisferio derecho, en azul petróleo, representa la solidez
              técnica: redes, arquitectura de servidores y DevOps. Nos basamos
              en la precisión y confianza para construir sistemas distribuidos
              escalables.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
