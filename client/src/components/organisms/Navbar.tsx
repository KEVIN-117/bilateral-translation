"use client";

import { ChevronDown, Cpu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { glassButtonVariants } from "@/components/atoms/GlassButton";
import { MobileNav } from "@/components/molecules/MobileNav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MAIN_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const linkClass = (isActive: boolean) =>
  cn(
    "font-medium text-sm transition-colors",
    isActive ? "text-white" : "text-gray-300 hover:text-white",
  );

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="absolute inset-0 border-white/10 border-b bg-black/20 backdrop-blur-xl" />

      <div className="relative mx-auto grid h-16 w-full max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 md:h-20 lg:px-8">
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
          className="hidden justify-center gap-6 md:flex md:items-center lg:gap-8"
        >
          {MAIN_NAV.map((link) => {
            if (!link.children) {
              const isActive = pathname === link.href;

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={linkClass(isActive)}
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              );
            }

            const isSectionActive = pathname.startsWith(link.href);

            return (
              <DropdownMenu key={link.href}>
                <DropdownMenuTrigger
                  className={cn(
                    linkClass(isSectionActive),
                    "flex items-center gap-1",
                  )}
                >
                  {link.label}
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="center"
                  className="w-72 border-white/10 bg-[#0a0a0f]/95 backdrop-blur-2xl"
                >
                  {link.children.map((mode) => (
                    <DropdownMenuItem
                      className="gap-3 px-3 py-2.5"
                      key={mode.href}
                      render={<Link href={mode.href} />}
                    >
                      <mode.icon
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: mode.accent }}
                      />
                      <span className="flex flex-col gap-0.5">
                        <span className="font-medium text-white">
                          {mode.label}
                        </span>
                        <span className="text-gray-400 text-xs leading-snug">
                          {mode.description}
                        </span>
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2 md:gap-3">
          <Link
            className={glassButtonVariants({
              variant: "ghost",
              size: "sm",
              className: "hidden md:inline-flex",
            })}
            href="/login"
          >
            Ingresar
          </Link>
          <Link
            className={glassButtonVariants({
              variant: "primary",
              size: "sm",
              className: "hidden md:inline-flex",
            })}
            href="/register"
          >
            Registrarse
          </Link>

          <MobileNav pathname={pathname} />
        </div>
      </div>
    </header>
  );
}
