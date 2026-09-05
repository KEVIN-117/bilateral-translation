import { Navbar } from "@/components/organisms/Navbar";
import { Hero } from "@/components/organisms/Hero";
import { AboutSection } from "@/components/organisms/AboutSection";
import { Footer } from "@/components/organisms/Footer";

export default function Home() {
  return (
    <>
      <main className="flex-grow">
        <Hero />
        <AboutSection />
      </main>
      <Footer />
    </>
  );
}
