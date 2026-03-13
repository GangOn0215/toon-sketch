import { createClient } from "@/utils/supabase/server";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { PricingSection } from "@/components/landing/PricingSection";

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Nav
        isLoggedIn={!!user}
        user={user}
        profile={profile}
        credits={profile?.credits}
      />
      <div style={{ paddingTop: "80px" }}>
        <PricingSection />
      </div>
      <Footer />
    </div>
  );
}
