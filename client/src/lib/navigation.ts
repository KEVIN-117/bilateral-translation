export interface NavLink {
  href: string;
  label: string;
  description: string;
}

export const MAIN_NAV: NavLink[] = [
  {
    href: "/",
    label: "Inicio",
    description: "Presentación del proyecto",
  },
  {
    href: "/camara",
    label: "Seña → Texto",
    description: "Reconocimiento por cámara",
  },
  {
    href: "/traductor",
    label: "Texto → Seña",
    description: "Diccionario de señas",
  },
];
