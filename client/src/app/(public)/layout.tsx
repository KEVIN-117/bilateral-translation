import { Footer } from "@/components/organisms/Footer";
import { Navbar } from "@/components/organisms/Navbar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="translator-workspace relative isolate min-h-dvh overflow-hidden bg-[#050608] text-[#f5f7f9]">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-medium focus:text-black"
        href="#contenido"
      >
        Saltar al contenido
      </a>

      <Navbar />

      <main className="flex-1 pt-[76px]" id="contenido">
        {children}
      </main>

      <Footer />
    </div>
  );
}
