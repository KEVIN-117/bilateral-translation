"use client";

import { Cpu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { glassButtonVariants } from "@/components/atoms/GlassButton";
import { MobileNav } from "@/components/molecules/MobileNav";
import { MAIN_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="absolute inset-0 border-white/10 border-b bg-black/20 backdrop-blur-xl" />

      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 md:h-20 lg:px-8">
        <Link className="group flex shrink-0 items-center gap-2" href="/">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#72004c] to-[#006f87] p-px transition-all group-hover:shadow-[0_0_20px_rgba(114,0,76,0.5)] md:h-10 md:w-10">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-black/50 backdrop-blur-sm">
              <Cpu className="h-4 w-4 text-white md:h-5 md:w-5" />
            </div>
          </div>
          <span className="font-bold font-heading text-lg text-white tracking-wider md:text-xl">
            SOCITEC
          </span>
        </Link>

        <nav
          aria-label="Principal"
          className="hidden md:flex md:items-center md:gap-6 lg:gap-8"
        >
          {MAIN_NAV.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "font-medium text-sm transition-colors",
                  isActive ? "text-white" : "text-gray-300 hover:text-white",
                )}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <Link
            className={glassButtonVariants({
              variant: "ghost",
              className: "hidden md:inline-flex",
            })}
            href="/login"
          >
            Ingresar
          </Link>
          <Link
            className={glassButtonVariants({
              variant: "primary",
              className: "hidden sm:inline-flex",
            })}
            href="/register"
          >
            Únete a SOCITEC
          </Link>

          <MobileNav pathname={pathname} />
        </div>
      </div>
    </header>
  );
}
