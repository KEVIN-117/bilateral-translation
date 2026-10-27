import { HandMetal } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/atoms/Container";
import { TRANSLATOR_MODES } from "@/lib/translator-modes";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050608]/75">
      <Container className="py-8 sm:py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto] lg:items-start">
          <div>
            <Link
              aria-label="SOCITEC, ir al inicio"
              className="inline-flex min-h-11 items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c3d5f1]"
              href="/"
            >
              <HandMetal
                aria-hidden="true"
                className="h-5 w-5 text-[#8da9d5]"
                strokeWidth={1.8}
              />
              <span className="font-semibold text-sm tracking-[0.14em] text-white">
                SOCITEC · UATF
              </span>
            </Link>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#aeb8c7]">
              Proyecto demostrativo de traducción bilateral en LSB boliviana.
            </p>
          </div>

          <nav aria-label="Traductor" className="flex flex-col items-start">
            <h2 className="mb-2 font-medium text-sm text-[#edf1f6]">
              Traducir
            </h2>
            {TRANSLATOR_MODES.map((mode) => (
              <Link
                className="inline-flex min-h-10 items-center text-sm text-[#aeb8c7] underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c3d5f1]"
                href={mode.href}
                key={mode.direction}
              >
                {mode.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-start">
            <h2 className="mb-2 font-medium text-sm text-[#edf1f6]">
              Contacto
            </h2>
            <a
              className="inline-flex min-h-10 items-center text-sm text-[#aeb8c7] underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c3d5f1]"
              href="mailto:contacto@socitec.uatf.edu.bo"
            >
              contacto@socitec.uatf.edu.bo
            </a>
          </div>
        </div>

        <p className="mt-8 border-t border-white/10 pt-5 text-xs text-[#aeb8c7]">
          © {new Date().getFullYear()} SOCITEC · Universidad Autónoma Tomás
          Frías, Potosí.
        </p>
      </Container>
    </footer>
  );
}
