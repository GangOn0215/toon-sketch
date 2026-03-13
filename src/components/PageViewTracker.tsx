"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    const track = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("page_views").insert({
        path: pathname,
        user_id: user?.id ?? null,
      });
    };

    track();
  }, [pathname, supabase]);

  return null;
}
