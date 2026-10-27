"use client";

import { HandMetal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/molecules/MobileNav";
import { TRANSLATOR_MODES } from "@/lib/translator-modes";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050608]/75 backdrop-blur-xl">
      <div className="translator-header mx-auto grid min-h-[76px] w-full max-w-[2200px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-6 xl:px-10 2xl:px-16">
        <Link
          aria-label="SOCITEC, ir al inicio"
          className="group inline-flex min-h-11 items-center gap-2.5 justify-self-start rounded-md pr-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c3d5f1]"
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
          className="translator-glass hidden min-h-12 items-center gap-1 rounded-xl p-1 md:flex md:justify-self-center"
        >
          {TRANSLATOR_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = pathname === mode.href;

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c3d5f1] lg:px-5 ${
                  isActive
                    ? "bg-[#4d6999] text-white"
                    : "text-[#d0d6df] hover:bg-white/10 hover:text-white"
                }`}
                href={mode.href}
                key={mode.direction}
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span>{mode.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-self-end gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-[#edf1f6]">LSB boliviana</p>
            <p className="text-xs text-[#aeb8c7]">Lengua de señas</p>
          </div>
          <MobileNav pathname={pathname} />
        </div>
      </div>
    </header>
  );
}
