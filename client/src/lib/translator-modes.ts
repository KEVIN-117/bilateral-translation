import { BookOpen, Camera, type LucideIcon } from "lucide-react";

export interface TranslatorMode {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

export const TRANSLATOR_MODES: TranslatorMode[] = [
  {
    href: "/traductor/sena-a-texto",
    label: "Seña → Texto",
    description:
      "Muestra una seña a la cámara y el modelo la reconoce y la traduce a texto.",
    icon: Camera,
    accent: "#72004c",
  },
  {
    href: "/traductor/texto-a-sena",
    label: "Texto → Seña",
    description:
      "Escribe una palabra y reproduce el video del diccionario que enseña su seña.",
    icon: BookOpen,
    accent: "#006f87",
  },
];
