import type { Metadata } from "next";
import { Container } from "@/components/atoms/Container";
import { SignToTextPanel } from "@/components/organisms/SignToTextPanel";

export const metadata: Metadata = {
  title: "Seña → Texto | SOCITEC",
  description:
    "Usa la cámara para reconocer Hola, Gracias o Te amo en lengua de señas.",
};

export default function SenaATextoPage() {
  return (
    <Container className="py-8 sm:py-12 lg:py-16">
      <header className="mb-8 max-w-3xl space-y-3 sm:mb-10">
        <h1 className="font-bold text-3xl text-foreground sm:text-4xl lg:text-5xl">
          Seña → Texto
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Muestra a la cámara una de las señas que reconoce el modelo: Hola,
          Gracias o Te amo.
        </p>
      </header>

      <SignToTextPanel />
    </Container>
  );
}
