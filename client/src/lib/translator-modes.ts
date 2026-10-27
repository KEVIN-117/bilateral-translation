import { BookOpen, Camera, type LucideIcon } from "lucide-react";

export type TranslatorDirection = "sign-to-text" | "text-to-sign";

export interface TranslatorMode {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  direction: TranslatorDirection;
}

export const TRANSLATOR_MODES: TranslatorMode[] = [
  {
    href: "/traductor/sena-a-texto",
    label: "Seña → texto",
    description:
      "Muestra una seña a la cámara y el modelo la reconoce y la traduce a texto.",
    icon: Camera,
    accent: "#8da9d5",
    direction: "sign-to-text",
  },
  {
    href: "/traductor/texto-a-sena",
    label: "Texto → seña",
    description:
      "Escribe una palabra y reproduce el video del diccionario que enseña su seña.",
    icon: BookOpen,
    accent: "#8da9d5",
    direction: "text-to-sign",
  },
];
