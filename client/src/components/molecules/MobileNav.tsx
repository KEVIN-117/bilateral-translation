"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TRANSLATOR_MODES } from "@/lib/translator-modes";

interface MobileNavProps {
  pathname: string;
}

export function MobileNav({ pathname }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger
        aria-label="Abrir menú de traducción"
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#d0d6df] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c3d5f1] md:hidden"
      >
        <Menu aria-hidden="true" className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent
        className="w-[88%] max-w-sm border-white/10 bg-[#0c121b]/95 text-white backdrop-blur-2xl"
        side="right"
      >
        <SheetHeader className="border-white/10 border-b text-left">
          <SheetTitle className="text-white">Traductor</SheetTitle>
          <SheetDescription className="text-[#aeb8c7]">
            LSB boliviana · elige una dirección
          </SheetDescription>
        </SheetHeader>

        <nav
          aria-label="Dirección de traducción"
          className="flex flex-col gap-2 px-4"
        >
          {TRANSLATOR_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = pathname === mode.href;

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-16 items-center gap-3 rounded-xl border px-4 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c3d5f1] ${
                  isActive
                    ? "border-[#8da9d5]/35 bg-[#4d6999]/25 text-white"
                    : "border-white/10 text-[#d0d6df] hover:bg-white/5 hover:text-white"
                }`}
                href={mode.href}
                key={mode.direction}
                onClick={() => setIsOpen(false)}
              >
                <Icon
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-[#8da9d5]"
                />
                <span className="flex flex-col gap-1">
                  <span className="font-medium">{mode.label}</span>
                  <span className="text-xs leading-relaxed text-[#aeb8c7]">
                    {mode.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
