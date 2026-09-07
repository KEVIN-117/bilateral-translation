"use client";

import { ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { glassButtonVariants } from "@/components/atoms/GlassButton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MAIN_NAV, type NavLink } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  pathname: string;
}

const itemClass = (isActive: boolean) =>
  cn(
    "rounded-xl px-4 py-3 font-medium transition-colors",
    isActive
      ? "bg-white/10 text-white"
      : "text-gray-300 hover:bg-white/5 hover:text-white",
  );

interface MobileNavGroupProps {
  link: NavLink;
  pathname: string;
  onNavigate: () => void;
}

/**
  Grupo desplegable del menu
 */
function MobileNavGroup({ link, pathname, onNavigate }: MobileNavGroupProps) {
  const isSectionActive = pathname.startsWith(link.href);
  const [isExpanded, setIsExpanded] = useState(isSectionActive);

  return (
    <Collapsible onOpenChange={setIsExpanded} open={isExpanded}>
      <CollapsibleTrigger
        className={cn(
          itemClass(isSectionActive),
          "group flex w-full items-center justify-between",
        )}
      >
        {link.label}
        <ChevronDown className="h-4 w-4 transition-transform group-data-[panel-open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="flex flex-col gap-1 py-1 pl-3">
        {link.children?.map((mode) => (
          <Link
            aria-current={pathname === mode.href ? "page" : undefined}
            className={cn(
              "flex items-start gap-3 rounded-xl px-4 py-3 transition-colors",
              pathname === mode.href
                ? "bg-white/10 text-white"
                : "text-gray-300 hover:bg-white/5 hover:text-white",
            )}
            href={mode.href}
            key={mode.href}
            onClick={onNavigate}
          >
            <mode.icon
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: mode.accent }}
            />
            <span className="flex flex-col gap-0.5">
              <span className="font-medium text-sm">{mode.label}</span>
              <span className="text-gray-500 text-xs leading-snug">
                {mode.description}
              </span>
            </span>
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function MobileNav({ pathname }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger
        aria-label="Abrir menú de navegación"
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white md:hidden"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent
        className="w-[85%] max-w-xs overflow-y-auto border-white/10 bg-[#0a0a0f]/95 backdrop-blur-2xl"
        side="right"
      >
        <SheetHeader className="border-white/10 border-b">
          <SheetTitle className="text-white">Navegación</SheetTitle>
          <SheetDescription>Traducción bilateral de señas</SheetDescription>
        </SheetHeader>

        <nav aria-label="Principal" className="flex flex-col gap-1 px-4">
          {MAIN_NAV.map((link) => {
            if (!link.children) {
              const isActive = pathname === link.href;

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={itemClass(isActive)}
                  href={link.href}
                  key={link.href}
                  onClick={close}
                >
                  {link.label}
                </Link>
              );
            }

            return (
              <MobileNavGroup
                key={`${link.href}-${pathname}`}
                link={link}
                onNavigate={close}
                pathname={pathname}
              />
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-white/10 border-t p-4">
          <Link
            className={glassButtonVariants({ variant: "ghost" })}
            href="/login"
            onClick={close}
          >
            Ingresar
          </Link>
          <Link
            className={glassButtonVariants({ variant: "primary" })}
            href="/register"
            onClick={close}
          >
            Registrarse
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
