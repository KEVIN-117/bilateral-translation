import { Cpu } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/atoms/Container";
import { MAIN_NAV } from "@/lib/navigation";

export function Footer() {
  return (
    <footer
      className="relative z-10 mt-16 border-white/10 border-t bg-[#040406]/80 sm:mt-24"
      id="contacto"
    >
      <Container className="py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#72004c] to-[#006f87] p-[1px]">
                <div className="w-full h-full rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <Cpu className="text-white w-4 h-4" />
                </div>
              </div>
              <span className="font-heading font-bold text-lg tracking-wider text-white">
                SOCITEC
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Sociedad Científica de Ingeniería de Sistemas y Tecnología.
              Universidad Autónoma "Tomás Frías", Potosí, Bolivia.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 font-heading">
              Enlaces
            </h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              {MAIN_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    className="transition-colors hover:text-white"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  className="transition-colors hover:text-white"
                  href="/#mision"
                >
                  Misión y Visión
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 font-heading">
              Contacto
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Av. Las Banderas 222</li>
              <li>Ciudadela Universitaria, Bloque 3</li>
              <li>Villa Imperial de Potosí</li>
              <li className="break-all">
                <a
                  href="mailto:contacto@socitec.uatf.edu.bo"
                  className="transition-colors hover:text-white"
                >
                  contacto@socitec.uatf.edu.bo
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-white/10 border-t pt-8 text-center text-gray-500 text-xs sm:mt-12 md:flex-row md:gap-0 md:text-left">
          <p>
            &copy; {new Date().getFullYear()} SOCITEC UATF. Todos los derechos
            reservados.
          </p>
          <div className="space-x-4">
            <a href="#" className="hover:text-white transition-colors">
              Privacidad
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Términos
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
