"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { glassButtonVariants } from "@/components/atoms/GlassButton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MAIN_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  pathname: string;
}

export function MobileNav({ pathname }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger
        aria-label="Abrir menú de navegación"
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white md:hidden"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent
        className="w-[85%] max-w-xs border-white/10 bg-[#0a0a0f]/95 backdrop-blur-2xl"
        side="right"
      >
        <SheetHeader className="border-white/10 border-b">
          <SheetTitle className="text-white">Navegación</SheetTitle>
          <SheetDescription>Traducción bilateral de señas</SheetDescription>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-4">
          {MAIN_NAV.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col gap-0.5 rounded-xl px-4 py-3 transition-colors",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white",
                )}
                href={link.href}
                key={link.href}
                onClick={() => setIsOpen(false)}
              >
                <span className="font-medium">{link.label}</span>
                <span className="text-gray-500 text-xs">
                  {link.description}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-white/10 border-t p-4">
          <Link
            className={glassButtonVariants({ variant: "ghost" })}
            href="/login"
            onClick={() => setIsOpen(false)}
          >
            Ingresar
          </Link>
          <Link
            className={glassButtonVariants({ variant: "primary" })}
            href="/register"
            onClick={() => setIsOpen(false)}
          >
            Únete a SOCITEC
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
