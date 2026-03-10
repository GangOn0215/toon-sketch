"use client";

import { useEffect, useState, useMemo } from "react";
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

interface HomeClientProps {
  initialUser: any;
  initialProfile: any;
  initialPlan: string;
}

export default function HomeClient({ initialUser, initialProfile, initialPlan }: HomeClientProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!initialUser);
  const [user, setUser] = useState<any>(initialUser);
  const [profile, setProfile] = useState<any>(initialProfile);
  const [plan, setPlan] = useState(initialPlan);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUser(session.user);
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profileData) {
          setProfile(profileData);
          setPlan(profileData.plan || "free");
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setProfile(null);
        setPlan("free");
      }
    });

    return () => subscription.unsubscribe();
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
      <Nav 
        isLoggedIn={isLoggedIn} 
        user={{ ...user, plan }} 
        profile={profile} 
        credits={profile?.credits} 
        onTopupClick={() => {
          const pricingSection = document.getElementById("pricing");
          if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: "smooth" });
          } else {
            window.location.href = "/#pricing";
          }
        }}
      />
      
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
