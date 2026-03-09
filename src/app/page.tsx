import { createClient } from "@/utils/supabase/server";
import HomeClient from "./HomeClient";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <HomeClient 
      initialUser={user} 
      initialPlan={profile?.plan || "free"} 
    />
  );
}
