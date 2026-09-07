import { ArrowRight, Code, Cpu, Database, Network } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/atoms/Container";
import { glassButtonVariants } from "@/components/atoms/GlassButton";

const CircuitPattern = () => (
  <svg
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full opacity-10 mix-blend-screen"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern
        id="circuit-board"
        width="120"
        height="120"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 10 10 L 30 10 L 40 20 L 40 40 M 60 10 L 80 10 L 90 20 L 90 40 M 10 60 L 30 60 L 40 70 L 40 90 M 60 60 L 80 60 L 90 70 L 90 90 M 40 20 L 60 20 M 40 70 L 60 70"
          stroke="#72004c"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 110 50 L 90 50 L 80 40 L 80 20 M 110 110 L 90 110 L 80 100 L 80 80 M 50 50 L 30 50 L 20 40 L 20 20 M 50 110 L 30 110 L 20 100 L 20 80"
          stroke="#006f87"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="10" r="2.5" fill="#72004c" />
        <circle cx="60" cy="10" r="2.5" fill="#72004c" />
        <circle cx="40" cy="40" r="2.5" fill="#72004c" />
        <circle cx="90" cy="40" r="2.5" fill="#72004c" />
        <circle cx="110" cy="50" r="2.5" fill="#006f87" />
        <circle cx="80" cy="20" r="2.5" fill="#006f87" />
        <circle cx="50" cy="50" r="2.5" fill="#006f87" />
        <circle cx="20" cy="20" r="2.5" fill="#006f87" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#circuit-board)" />
  </svg>
);

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden py-12 sm:py-16 md:min-h-[calc(100svh-5rem)]">
      <CircuitPattern />

      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[280px] sm:w-[400px] md:w-[600px] h-[280px] sm:h-[400px] md:h-[600px] bg-[#72004c] rounded-full blur-[100px] md:blur-[150px] opacity-20 mix-blend-screen animate-pulse pointer-events-none" />
      <div
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[280px] sm:w-[400px] md:w-[600px] h-[280px] sm:h-[400px] md:h-[600px] bg-[#006f87] rounded-full blur-[100px] md:blur-[150px] opacity-20 mix-blend-screen animate-pulse pointer-events-none"
        style={{ animationDelay: "2s" }}
      />

      <Container className="relative z-10">
        <div className="mx-auto max-w-4xl space-y-6 text-center sm:space-y-8">
          {/* Logo Sociedad */}
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#72004c] to-[#006f87] rounded-full blur-xl opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <Image
                src="/logosociedad.png"
                alt="Logo SOCITEC"
                width={500}
                height={500}
                className="relative z-10 h-auto w-40 drop-shadow-2xl transition-transform duration-500 hover:scale-105 sm:w-56 md:w-72"
                sizes="(max-width: 640px) 10rem, (max-width: 768px) 14rem, 18rem"
                priority
              />
            </div>
          </div>

          <div className="glass inline-flex items-center gap-2 rounded-full border-[#72004c]/30 px-4 py-2 text-center font-medium text-white/90 text-xs sm:gap-3 sm:px-5 sm:text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#72004c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#72004c]"></span>
            </span>
            Sociedad Científica de Ingeniería de Sistemas y Tecnología
          </div>

          <h1 className="text-balance font-extrabold text-3xl text-white leading-[1.1] tracking-tighter sm:text-5xl md:text-7xl lg:text-8xl">
            Ingeniería que{" "}
            <span className="text-gradient-purple block md:inline">
              transforma.
            </span>
            <br className="hidden md:block" /> Ciencia que{" "}
            <span className="text-gradient-blue block md:inline">
              trasciende.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl font-light text-base text-gray-400 leading-relaxed sm:text-lg md:text-xl">
            Un espacio de encuentro para la innovación, la investigación y la
            formación académica de excelencia en la Universidad Autónoma Tomás
            Frías.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row sm:gap-4 sm:pt-4">
            <Link
              className={glassButtonVariants({
                variant: "primary",
                size: "lg",
                className: "group w-full sm:w-auto",
              })}
              href="/traductor"
            >
              Traducir texto
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              className={glassButtonVariants({
                variant: "secondary",
                size: "lg",
                className: "w-full sm:w-auto",
              })}
              href="/camara"
            >
              Probar la cámara
            </Link>
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 pt-10 sm:gap-4 sm:pt-16 md:grid-cols-4 md:gap-6">
            <div className="glass-card group flex flex-col items-center gap-2 p-4 sm:gap-3 sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#72004c]/20 transition-transform group-hover:scale-110 sm:h-12 sm:w-12">
                <Code className="text-[#72004c] w-6 h-6" />
              </div>
              <span className="font-medium text-gray-300 text-xs sm:text-sm">
                Software
              </span>
            </div>
            <div className="glass-card group flex flex-col items-center gap-2 p-4 sm:gap-3 sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006f87]/20 transition-transform group-hover:scale-110 sm:h-12 sm:w-12">
                <Database className="text-[#006f87] w-6 h-6" />
              </div>
              <span className="font-medium text-gray-300 text-xs sm:text-sm">
                Datos
              </span>
            </div>
            <div className="glass-card group flex flex-col items-center gap-2 p-4 sm:gap-3 sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#72004c]/20 transition-transform group-hover:scale-110 sm:h-12 sm:w-12">
                <Network className="text-[#72004c] w-6 h-6" />
              </div>
              <span className="font-medium text-gray-300 text-xs sm:text-sm">
                Redes
              </span>
            </div>
            <div className="glass-card group flex flex-col items-center gap-2 p-4 sm:gap-3 sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006f87]/20 transition-transform group-hover:scale-110 sm:h-12 sm:w-12">
                <Cpu className="text-[#006f87] w-6 h-6" />
              </div>
              <span className="font-medium text-gray-300 text-xs sm:text-sm">
                Arquitectura
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
