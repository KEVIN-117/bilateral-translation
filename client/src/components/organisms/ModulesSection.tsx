import { Container } from "@/components/atoms/Container";
import { TranslatorModeSelector } from "@/components/organisms/TranslatorModeSelector";

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

        <TranslatorModeSelector className="mx-auto max-w-5xl" />
      </Container>
    </section>
  );
}
