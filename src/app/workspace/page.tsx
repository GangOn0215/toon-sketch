import { createClient } from "@/utils/supabase/server";
import WorkspaceClient from "./WorkspaceClient";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("credits, plan")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <WorkspaceClient 
      initialUser={user} 
      initialPlan={profile?.plan || "free"} 
      initialCredits={profile?.credits || 0}
    />
  );
}
