import { TRANSLATOR_MODES, type TranslatorMode } from "@/lib/translator-modes";

export interface NavLink {
  href: string;
  label: string;
  /** Sub-opciones desplegables */
  children?: TranslatorMode[];
}

export const MAIN_NAV: NavLink[] = [
  { href: "/", label: "Inicio" },
  { href: "/#mision", label: "Nuestra Misión" },
  { href: "/traductor", label: "Traductor", children: TRANSLATOR_MODES },
  { href: "/#blog", label: "Artículos" },
  { href: "/#contacto", label: "Contacto" },
];
