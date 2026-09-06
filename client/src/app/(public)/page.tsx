import { AboutSection } from "@/components/organisms/AboutSection";
import { Hero } from "@/components/organisms/Hero";
import { ModulesSection } from "@/components/organisms/ModulesSection";

export default function Home() {
  return (
    <>
      <Hero />
      <ModulesSection />
      <AboutSection />
    </>
  );
}
