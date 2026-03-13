import { createClient } from "@/utils/supabase/server";
import HomeClient from "./HomeClient";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (error) {
      console.error("❌ [Main Page] Profile load error:", error.message, error.details);
    }
    profile = data;
  }

  return (
    <HomeClient 
      initialUser={user} 
      initialProfile={profile}
      initialPlan={profile?.plan || "free"} 
    />
  );
}
