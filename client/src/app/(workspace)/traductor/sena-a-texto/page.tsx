import type { Metadata } from "next";
import { SignToTextPanel } from "@/components/organisms/SignToTextPanel";
import { TranslatorWorkspace } from "@/components/organisms/TranslatorWorkspace";

export const metadata: Metadata = {
  title: "Seña → Texto | SOCITEC",
  description:
    "Usa la cámara para reconocer Hola, Gracias o Te amo en lengua de señas.",
};

export default function SenaATextoPage() {
  return (
    <TranslatorWorkspace direction="sign-to-text">
      <SignToTextPanel />
    </TranslatorWorkspace>
  );
}
