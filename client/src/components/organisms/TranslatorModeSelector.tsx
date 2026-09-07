import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { TRANSLATOR_MODES } from "@/lib/translator-modes";
import { cn } from "@/lib/utils";

interface TranslatorModeSelectorProps {
  className?: string;
}

/** Las dos direcciones de traducción, para que el usuario elija una ruta */
export function TranslatorModeSelector({
  className,
}: TranslatorModeSelectorProps) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-2", className)}>
      {TRANSLATOR_MODES.map((mode) => (
        <Link
          className="glass-card group relative flex flex-col gap-4 overflow-hidden p-6 sm:p-8"
          href={mode.href}
          key={mode.href}
        >
          <div
            className="absolute top-0 right-0 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
            style={{ backgroundColor: mode.accent }}
          />
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl sm:h-14 sm:w-14"
            style={{ backgroundColor: `${mode.accent}33` }}
          >
            <mode.icon
              className="h-6 w-6 sm:h-7 sm:w-7"
              style={{ color: mode.accent }}
            />
          </div>

          <h3 className="font-bold text-white text-xl sm:text-2xl">
            {mode.label}
          </h3>

          <p className="text-gray-400 leading-relaxed">{mode.description}</p>

          <span className="mt-auto inline-flex items-center gap-2 font-medium text-sm text-white">
            Abrir módulo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
    </div>
  );
}
