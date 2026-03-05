"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

// Landing Components
import { Nav } from "@/components/landing/Nav";
import { HeroSection } from "@/components/landing/HeroSection";
import { DemoSection } from "@/components/landing/DemoSection";
import { GallerySection } from "@/components/landing/GallerySection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setUser(session.user);
      }
    };
    checkUser();
  }, [supabase]);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("show"); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <Nav isLoggedIn={isLoggedIn} user={user} />
      
      <main>
        <HeroSection isLoggedIn={isLoggedIn} />
        <DemoSection />
        <PricingSection />
        <GallerySection />
        <HowItWorksSection />
        <CTASection isLoggedIn={isLoggedIn} />
      </main>

      <Footer />

      <style jsx global>{`
        .pricing-swiper .swiper-pagination-bullet-active { background: var(--accent) !important; }
        .pricing-swiper .swiper-pagination { bottom: 20px !important; }
        
        @media (max-width: 768px) { 
          .pricing-swiper .swiper-button-next, 
          .pricing-swiper .swiper-button-prev { display: none; } 
        }
      `}</style>
    </>
  );
}
