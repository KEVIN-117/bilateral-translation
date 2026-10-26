import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Traductor | SOCITEC",
  description:
    "Elige la dirección de la traducción: de seña a texto o de texto a seña.",
};

export default function TraductorPage() {
  redirect("/traductor/sena-a-texto");
}
