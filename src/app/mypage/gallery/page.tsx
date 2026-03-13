import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import GalleryClient from "./GalleryClient";

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: characters } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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

  return (
    <GalleryClient
      initialUser={user}
      initialProfile={profile}
      initialCharacters={maskedCharacters}
    />
  );
}
