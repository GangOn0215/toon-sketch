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

  return (
    <GalleryClient 
      initialUser={user} 
      initialProfile={profile} 
      initialCharacters={characters || []} 
    />
  );
}
