import { lazy, Suspense } from "react";
import { useLenis } from "@/hooks/useLenis";
import { NavHeader } from "@/components/NavHeader";
import { Hero } from "@/sections/Hero";
import { QuickLinks } from "@/sections/QuickLinks";
import { Works } from "@/sections/Works";
import { About, Experience } from "@/sections/About";
import { Skills } from "@/sections/Skills";
import { TechStackTicker } from "@/sections/TechStackTicker";
import { ContactForm, ContactGlobeCard } from "@/sections/Contact";
import { Footer } from "@/sections/Footer";

const AuroraCanvas = lazy(() => import("@/components/AuroraCanvas"));

function App() {
  useLenis();

  return (
    <div className="relative min-h-screen">
      {/* Aurora Background */}
      <Suspense fallback={null}>
        <AuroraCanvas />
      </Suspense>

      {/* Navigation */}
      <NavHeader />

      {/* Main Content - Bento Grid */}
      <main className="relative z-10 px-4 md:px-8 lg:px-10 py-6 md:py-10">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-auto">
          {/* Main Hero & Context */}
          <Hero />
          <QuickLinks />
          <Experience />
          <Skills />

          {/* Core Content */}
          <Works />
          <About />
          <ContactForm />

          {/* Social/Location & Footer */}
          <ContactGlobeCard />
          <TechStackTicker />
          <Footer />
        </div>
      </main>
    </div>
  );
}

export default App;
