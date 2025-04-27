"use client";

import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  const signInWithApple = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Sign in to Kids Story App</h1>

      <button
        onClick={signInWithGoogle}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Sign in with Google
      </button>

      <button
        onClick={signInWithApple}
        className="bg-black text-white font-bold py-2 px-4 rounded mt-4"
      >
        Sign in with Apple 🍎
      </button>
    </main>
  );
}
