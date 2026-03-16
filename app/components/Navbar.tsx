"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Spin as Hamburger } from "hamburger-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type ProfileData = {
  username: string | null;
  avatar_url: string | null;
};

type AvatarCircleProps = {
  avatarUrl: string | null;
  email: string;
  size: number;
};

function AvatarCircle({ avatarUrl, email, size }: AvatarCircleProps) {
  const initial = email[0].toUpperCase();
  const style = { width: size, height: size };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="Profile"
        style={style}
        className="rounded-full object-cover border border-white/20"
      />
    );
  }

  return (
    <div
      style={style}
      className="rounded-full bg-[#4ade80] flex items-center justify-center text-black font-bold font-roboto-slab select-none"
    >
      <span style={{ fontSize: size * 0.42 }}>{initial}</span>
    </div>
  );
}

export const Navbar = () => {
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profileData }) => setProfile(profileData));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profileData }) => setProfile(profileData));
      } else {
        setProfile(null);
      }
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

  const navLinkClass = "hover:text-[#4ade80] transition-colors duration-150";

  return (
    <nav className="w-full h-auto text-white bg-[#161616]">
      {/* Mobile */}
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
                className="w-full bg-transparent outline-none text-white/50 placeholder-white/50"
              />
            </div>
            <a href="../films/" className={`pt-2 pb-1 ${navLinkClass}`}>FILMS</a>
            <a href="../shows/" className={`py-1 ${navLinkClass}`}>TV SHOWS</a>
            <a href="../people/" className={`pt-1 pb-2 ${navLinkClass}`}>PEOPLE</a>
            {user ? (
              <>
                <div className="flex items-center gap-2 py-1">
                  <AvatarCircle
                    avatarUrl={profile?.avatar_url ?? null}
                    email={user.email ?? "?"}
                    size={28}
                  />
                  <span className="text-white/50 text-sm">
                    {profile?.username ?? user.email}
                  </span>
                </div>
                <Link href="/profile" className={`py-1 ${navLinkClass}`}>PROFILE</Link>
                <button onClick={handleSignOut} className="py-1 text-red-400 hover:text-red-300 transition-colors duration-150">
                  SIGN OUT
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={`py-1 ${navLinkClass}`}>SIGN IN</Link>
                <Link href="/auth/signup" className={`py-1 ${navLinkClass}`}>CREATE ACCOUNT</Link>
              </>
            )}
          </>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between h-full px-8 py-6">
        <h1 className="text-3xl font-jaro">
          <a href="..">MoviesForGeeks</a>
        </h1>
        <div className="flex gap-6 font-roboto-slab text-lg items-center">
          {!user && (
            <>
              <a href="/auth/login" className={navLinkClass}>SIGN IN</a>
              <a href="/auth/signup" className={navLinkClass}>CREATE ACCOUNT</a>
            </>
          )}
          <Link href="/films" className={navLinkClass}>FILMS</Link>
          <Link href="/shows" className={navLinkClass}>TV SHOWS</Link>
          {user && (
            <Link href="/watchlist" className={navLinkClass}>FAVORITES</Link>
          )}
          <div className="px-5 rounded-2xl bg-[#D9D9D9]/50">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-transparent outline-none text-white/50 placeholder-white/50"
            />
          </div>

          {/* Avatar + hover dropdown */}
          {user && (
            <div className="relative group">
              <button className="flex items-center" aria-label="Profile menu">
                <AvatarCircle
                  avatarUrl={profile?.avatar_url ?? null}
                  email={user.email ?? "?"}
                  size={36}
                />
              </button>
              {/* Invisible bridge so hovering between avatar and menu keeps it open */}
              <div className="absolute right-0 top-full h-2 w-full" />
              <div className="
                absolute right-0 top-[calc(100%+8px)] w-40
                bg-[#161616] border border-white/10 rounded-md shadow-lg z-50
                font-roboto-slab text-sm overflow-hidden
                opacity-0 translate-y-1 pointer-events-none
                group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
                transition-all duration-200 ease-out
              ">
                <Link
                  href="/profile"
                  className="block px-4 py-3 text-white hover:bg-white/10 hover:text-[#4ade80] transition-colors duration-150"
                >
                  PROFILE
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-3 text-red-400 hover:bg-white/10 transition-colors duration-150"
                >
                  SIGN OUT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
