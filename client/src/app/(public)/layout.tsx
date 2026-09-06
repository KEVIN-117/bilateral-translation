import Link from "next/link";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:p-4">
        Saltar al contenido
      </a>
      <header className="border-b bg-black/20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <Link href="/" className="font-heading text-lg font-semibold">
            Bilateral Translation
          </Link>
          <span className="text-sm text-muted-foreground">
            SOCITEC · Prototipo
          </span>
        </div>
      </header>
      {children}
    </>
  );
}
