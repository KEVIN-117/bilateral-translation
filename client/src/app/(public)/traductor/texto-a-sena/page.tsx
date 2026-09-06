import type { Metadata } from "next";
import { Container } from "@/components/atoms/Container";
import { TextToSignTranslator } from "@/components/organisms/TextToSignTranslator";

export const metadata: Metadata = {
  title: "Texto → Seña | SOCITEC",
  description:
    "Busca una palabra y aprende cómo se realiza su seña en lengua de señas.",
};

export default function TextoASenaPage() {
  return (
    <Container className="py-10 sm:py-14 lg:py-20">
      <header className="mb-8 space-y-3 sm:mb-12">
        <p className="font-medium text-[#7fd6e8] text-sm">
          Bilateral Translation · MVP
        </p>
        <h1 className="font-bold text-3xl text-white sm:text-4xl lg:text-5xl">
          Texto → <span className="text-gradient">Seña</span>
        </h1>
        <p className="max-w-2xl text-gray-400 sm:text-lg">
          Escribe la palabra que quieras aprender y reproduce el video de su
          seña.
        </p>
      </header>

      <div className="max-w-3xl">
        <TextToSignTranslator />
      </div>
    </Container>
  );
}
