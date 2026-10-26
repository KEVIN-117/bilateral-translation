import { HandMetal, Keyboard, Video } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type TranslationDirection = "sign-to-text" | "text-to-sign";

const directions: {
  href: string;
  label: string;
  direction: TranslationDirection;
  icon: typeof Video;
}[] = [
  {
    href: "/traductor/sena-a-texto",
    label: "Seña → texto",
    direction: "sign-to-text",
    icon: Video,
  },
  {
    href: "/traductor/texto-a-sena",
    label: "Texto → seña",
    direction: "text-to-sign",
    icon: Keyboard,
  },
];

export function TranslatorWorkspace({
  direction,
  children,
}: {
  direction: TranslationDirection;
  children: ReactNode;
}) {
  return (
    <div className="translator-workspace relative isolate min-h-dvh overflow-hidden bg-[#050608] text-[#f5f7f9]">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-black focus:outline-2 focus:outline-offset-2 focus:outline-[#9bb8e8]"
        href="#workspace-content"
      >
        Saltar al traductor
      </a>

      <header className="translator-header absolute inset-x-0 top-0 z-40 grid min-h-[76px] grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-white/10 bg-[#050608]/55 px-4 py-3 backdrop-blur-xl sm:px-6 md:h-[76px] md:px-8">
        <Link
          aria-label="SOCITEC, ir al inicio"
          className="group inline-flex min-h-11 items-center gap-2.5 justify-self-start rounded-md pr-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9bb8e8]"
          href="/"
        >
          <HandMetal
            aria-hidden="true"
            className="h-6 w-6 text-[#8da9d5] transition-colors group-hover:text-white"
            strokeWidth={1.8}
          />
          <span className="font-semibold text-[15px] tracking-[0.14em] text-white sm:text-base">
            SOCITEC
          </span>
        </Link>

        <nav
          aria-label="Dirección de traducción"
          className="translator-glass flex min-h-12 items-center gap-1 rounded-xl p-1 max-md:col-span-2 max-md:row-start-2 max-md:w-full md:justify-self-center"
        >
          {directions.map((item) => {
            const isActive = item.direction === direction;
            const Icon = item.icon;

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c3d5f1] sm:px-5 ${
                  isActive
                    ? "bg-[#4d6999] text-white shadow-[0_5px_16px_rgba(25,47,83,0.38)]"
                    : "text-[#d0d6df] hover:bg-white/10 hover:text-white"
                }`}
                href={item.href}
                key={item.direction}
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="justify-self-end text-right">
          <p className="text-sm font-medium text-[#edf1f6]">LSB boliviana</p>
          <p className="hidden text-xs text-[#c3c9d1]/85 sm:block">
            Lengua de señas
          </p>
        </div>
      </header>

      <main
        className="relative min-h-dvh outline-none"
        id="workspace-content"
        tabIndex={-1}
      >
        <h1 className="sr-only">Traductor de LSB boliviana</h1>
        {children}
      </main>
    </div>
  );
}
