"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session) {
        router.push("/"); // redirect to homepage
      }
    };

    checkSession();
  }, [router]);

  return <p>Redirecting...</p>;
}
