import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MyPageClient from "./MyPageClient";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  return (
    <MyPageClient initialUser={user} />
  );
}
