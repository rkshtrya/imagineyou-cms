"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email ?? "");
    });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    location.reload(); // or redirect to /login
  };

  return (
    <nav className="flex justify-between items-center p-4 border-b">
      <div className="text-gray-600">👋 {userEmail}</div>
      <button
        onClick={signOut}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Sign Out
      </button>
    </nav>
  );
}
