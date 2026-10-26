import type { Metadata } from "next";
import { TextToSignTranslator } from "@/components/organisms/TextToSignTranslator";
import { TranslatorWorkspace } from "@/components/organisms/TranslatorWorkspace";

export const metadata: Metadata = {
  title: "Texto → Seña | SOCITEC",
  description:
    "Busca una palabra y aprende cómo se realiza su seña en LSB boliviana.",
};

export default function TextoASenaPage() {
  return (
    <TranslatorWorkspace direction="text-to-sign">
      <TextToSignTranslator />
    </TranslatorWorkspace>
  );
}
