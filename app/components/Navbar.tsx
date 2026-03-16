"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Spin as Hamburger } from "hamburger-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export const Navbar = () => {
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Get the current session on mount
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // Listen for sign in / sign out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <nav className="w-full h-auto text-white bg-[#161616]">
      {/*Mobile Device */}
      <div className="lg:hidden flex flex-col items-center px-8 pt-3 font-roboto-slab text-md">
        <h1 className="text-3xl font-jaro">
          <a href="..">MoviesForGeeks</a>
        </h1>
        <Hamburger toggled={isOpen} toggle={setOpen} size={20} />
        {isOpen && (
          <>
            <div className="px-3 rounded-2xl bg-[#D9D9D9]/50">
              <input
                type="text"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="
                w-full
                bg-transparent
                outline-none
                text-white/50
                placeholder-white/50
              "
              />
            </div>
            <a href="../films/" className="pt-2 pb-1">
              FILMS
            </a>
            <a href="../shows/" className="py-1">
              TV SHOWS
            </a>
            <a href="../people/" className="pt-1 pb-2">
              PEOPLE
            </a>
            {user ? (
              <>
                <span className="text-white/50 text-sm py-1">{user.email}</span>
                <button onClick={handleSignOut} className="py-1 text-red-400 hover:text-red-300">
                  SIGN OUT
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="py-1">SIGN IN</Link>
                <Link href="/auth/signup" className="py-1">CREATE ACCOUNT</Link>
              </>
            )}
          </>
        )}
      </div>
      {/*Desktop Device */}
      <div className="hidden lg:flex items-center justify-between h-full px-8 py-6">
        <h1 className="text-3xl font-jaro">
          <a href="..">MoviesForGeeks</a>
        </h1>
        <div className="flex gap-6 font-roboto-slab text-lg">
          {user ? (
            <>
              <span className="text-white/50 text-sm self-center">{user.email}</span>
              <button onClick={handleSignOut} className="text-red-400 hover:text-red-300">
                SIGN OUT
              </button>
            </>
          ) : (
            <>
              <a href="/auth/login">SIGN IN</a>
              <a href="/auth/signup">CREATE ACCOUNT</a>
            </>
          )}
          <Link href="/films">FILMS</Link>
          <Link href="/shows">TV SHOWS</Link>
          {user && (
            <Link href="/watchlist">FAVORITES</Link>
          )}
          <div className="px-5 rounded-2xl bg-[#D9D9D9]/50">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="
                w-full
                bg-transparent
                outline-none
                text-white/50
                placeholder-white/50
              "
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

/*
color - 161616
<div className="flex items-center justify-between h-full px-8">
        <h1 className="text-lg font-semibold">MOVIESFORGEEKS</h1>
        <div className="flex gap-6">
          <a href="../movies/">Movies</a>
          <a href="../shows/">TV Shows</a>
          <a href="../people/">People</a>
          <input placeholder="Search" className="px-5 bg-amber-800 rounded" />
        </div>
      </div>
      
*/
