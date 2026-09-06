import type { Metadata } from "next";
import { Footer } from "@/components/organisms/Footer";
import { TextToSignTranslator } from "@/components/organisms/TextToSignTranslator";

export const metadata: Metadata = {
  title: "Traductor de señas | SOCITEC",
  description:
    "Busca una palabra y aprende cómo se realiza su seña en lengua de señas.",
};

export default function TraductorPage() {
  return (
    <>
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto max-w-4xl px-6">
          <header className="mb-12 text-center">
            <h1 className="mb-4 text-3xl font-bold text-white md:text-5xl">
              Traductor <span className="text-gradient">Texto → Seña</span>
            </h1>
            <p className="text-lg text-gray-400">
              Escribe la palabra que quieras aprender y reproduce el video de su
              seña.
            </p>
          </header>

          <TextToSignTranslator />
        </div>
      </main>
      <Footer />
    </>
  );
}
