import type { Metadata } from "next";
import { Container } from "@/components/atoms/Container";
import { SignToTextPanel } from "@/components/organisms/SignToTextPanel";

export const metadata: Metadata = {
  title: "Seña → Texto | SOCITEC",
  description:
    "Reconocimiento de lengua de señas por cámara y traducción a texto.",
};

export default function CamaraPage() {
  return (
    <Container className="py-10 sm:py-14 lg:py-20">
      <header className="mb-8 space-y-3 sm:mb-12">
        <p className="font-medium text-[#7fd6e8] text-sm">
          Bilateral Translation · MVP
        </p>
        <h1 className="font-bold text-3xl text-white sm:text-4xl lg:text-5xl">
          Seña → <span className="text-gradient">Texto</span>
        </h1>
        <p className="max-w-2xl text-gray-400 sm:text-lg">
          Muestra una seña a la cámara y el modelo la traduce a texto.
        </p>
      </header>

      <div className="max-w-2xl">
        <SignToTextPanel />
      </div>
    </Container>
  );
}
