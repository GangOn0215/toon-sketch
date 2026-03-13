import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MyPageClient from "./MyPageClient";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const { data: characters } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const isPro = profile?.plan === "pro" || profile?.plan === "premium";
  const isStandard = profile?.plan === "standard";
  const maskedCharacters = (characters || []).map((char) => {
    let expired = false;
    if (!isPro) {
      if (!isStandard) {
        expired = true;
      } else {
        const diff = (Date.now() - new Date(char.created_at).getTime()) / (1000 * 60 * 60 * 24);
        expired = diff > 7;
      }
    }
    return expired ? { ...char, image_url: null, thumbnail_url: null, _expired: true } : char;
  });

  const { data: logs } = await supabase
    .from("credit_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <MyPageClient
      initialUser={user}
      initialProfile={profile}
      initialCharacters={maskedCharacters}
      initialLogs={logs || []}
    />
  );
}
