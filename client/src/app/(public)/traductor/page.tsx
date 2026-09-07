import type { Metadata } from "next";
import { Container } from "@/components/atoms/Container";
import { TranslatorModeSelector } from "@/components/organisms/TranslatorModeSelector";

export const metadata: Metadata = {
  title: "Traductor | SOCITEC",
  description:
    "Elige la dirección de la traducción: de seña a texto o de texto a seña.",
};

export default function TraductorPage() {
  return (
    <Container className="py-10 sm:py-14 lg:py-20">
      <header className="mb-8 space-y-3 sm:mb-12">
        <p className="font-medium text-[#7fd6e8] text-sm">
          Bilateral Translation · MVP
        </p>
        <h1 className="font-bold text-3xl text-white sm:text-4xl lg:text-5xl">
          <span className="text-gradient">Traductor</span> de señas
        </h1>
        <p className="max-w-2xl text-gray-400 sm:text-lg">
          Elige en qué dirección quieres traducir.
        </p>
      </header>

      <TranslatorModeSelector className="max-w-5xl" />
    </Container>
  );
}
