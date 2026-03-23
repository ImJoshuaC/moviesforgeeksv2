"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex-1 bg-[#1c1c1c] flex items-center justify-center px-8 overflow-hidden">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-bold text-white font-roboto-slab mb-1">
          CREATE ACCOUNT
        </h1>
        <p className="text-white/60 text-sm font-roboto-slab mb-6">
          or{" "}
          <a href="/auth/login" className="text-[#4ade80] hover:underline">
            sign in
          </a>
        </p>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#2a2a2a] border border-white/20 rounded-md px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/50 font-roboto-slab"
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-[#2a2a2a] border border-white/20 rounded-md px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/50 font-roboto-slab"
          />

          {error && (
            <p className="text-red-400 text-sm font-roboto-slab">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold py-3 rounded-md transition-colors font-roboto-slab disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
