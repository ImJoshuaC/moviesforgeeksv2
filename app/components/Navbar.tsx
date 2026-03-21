"use client";

import { useState, useEffect, useRef } from "react";
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

type Suggestion = {
  id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string;
  year: string;
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

function SuggestionsDropdown({
  suggestions,
  onSelect,
  visible,
}: {
  suggestions: Suggestion[];
  onSelect: (s: Suggestion) => void;
  visible: boolean;
}) {
  return (
    <div
      className={`
        absolute left-0 right-0 top-[calc(100%+4px)]
        bg-[#1c1c1c] border border-white/10 rounded-md shadow-xl z-50 overflow-hidden
        transition-all duration-200 ease-out
        ${visible && suggestions.length > 0
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-1 pointer-events-none"}
      `}
    >
      {suggestions.map((s, i) => (
        <button
          key={s.id}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(s);
          }}
          style={{
            animation: visible ? `suggestion-item-in 180ms ease-out both` : "none",
            animationDelay: visible ? `${i * 45}ms` : "0ms",
          }}
          className="flex items-center gap-3 w-full px-3 py-2 hover:bg-white/10 transition-colors duration-100 text-left"
        >
          <img
            src={`https://image.tmdb.org/t/p/w92${s.poster_path}`}
            alt={s.title}
            className="w-8 h-12 object-cover rounded shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-white text-sm font-roboto-slab truncate">{s.title}</span>
            {s.year && <span className="text-white/40 text-xs mt-0.5">{s.year}</span>}
          </div>
        </button>
      ))}
    </div>
  );
}

export const Navbar = () => {
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const mobileSearchWrapperRef = useRef<HTMLDivElement>(null);
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

  // Debounced suggestions fetch
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target as Node) &&
        mobileSearchWrapperRef.current &&
        !mobileSearchWrapperRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectSuggestion = (s: Suggestion) => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setOpen(false);
    router.push(s.media_type === "movie" ? `/films/${s.id}` : `/shows/${s.id}`);
  };

  const navLinkClass = "hover:text-[#4ade80] transition-colors duration-150";

  return (
    <nav className="w-full h-auto text-white bg-[#161616]">
      {/* Mobile */}
      <div className="lg:hidden flex flex-col items-center px-8 pt-3 font-roboto-slab text-md">
        <h1 className="text-3xl font-jaro">
          <a href="/">MoviesForGeeks</a>
        </h1>
        <Hamburger toggled={isOpen} toggle={setOpen} size={20} />
        {isOpen && (
          <div className="flex flex-col items-center w-full" style={{ animation: "mobile-drawer-in 200ms ease-out both" }}>
            <div ref={mobileSearchWrapperRef} className="relative w-48 mt-2 mb-1">
              <div className="flex items-center px-3 rounded-2xl bg-[#D9D9D9]/50">
                <input
                  type="text"
                  placeholder="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="flex-1 min-w-0 bg-transparent outline-none text-white/50 placeholder-white/50 py-1"
                />
                {query && (
                  <button
                    onMouseDown={(e) => { e.preventDefault(); setQuery(""); setSuggestions([]); setShowSuggestions(false); }}
                    className="ml-1 text-white/40 hover:text-white/70 transition-colors duration-100 text-lg leading-none"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
              <SuggestionsDropdown
                suggestions={suggestions}
                onSelect={handleSelectSuggestion}
                visible={showSuggestions}
              />
            </div>
            <a href="../films/" className={`block py-1.5 ${navLinkClass}`}>FILMS</a>
            <a href="../shows/" className={`block py-1.5 ${navLinkClass}`}>TV SHOWS</a>
            <a href="../people/" className={`block py-1.5 ${navLinkClass}`}>PEOPLE</a>
            <Link href="/watchlist" className={`block py-1.5 ${navLinkClass}`}>FAVORITES</Link>
            {user ? (
              <div className="flex flex-col items-center w-full border-t border-white/10 mt-2 pt-2 gap-1">
                <div className="flex items-center gap-2 py-1">
                  <AvatarCircle
                    avatarUrl={profile?.avatar_url ?? null}
                    email={user.email ?? "?"}
                    size={28}
                  />
                  {profile?.username && (
                    <span className="text-white/50 text-sm">{profile.username}</span>
                  )}
                </div>
                <Link href="/profile" className={`block py-1.5 ${navLinkClass}`}>PROFILE</Link>
                <button onClick={handleSignOut} className="block py-1.5 text-red-400 hover:text-red-300 transition-colors duration-150">
                  SIGN OUT
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full border-t border-white/10 mt-2 pt-2 gap-1">
                <Link href="/auth/login" className={`block py-1.5 ${navLinkClass}`}>SIGN IN</Link>
                <Link href="/auth/signup" className={`block py-1.5 ${navLinkClass}`}>CREATE ACCOUNT</Link>
              </div>
            )}
            <div className="pb-3" />
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between h-full px-8 py-6">
        <h1 className="text-3xl font-jaro">
          <a href="/">MoviesForGeeks</a>
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
          <Link href="/people" className={navLinkClass}>PEOPLE</Link>
          {user && (
            <Link href="/watchlist" className={navLinkClass}>FAVORITES</Link>
          )}
          <div ref={searchWrapperRef} className="relative">
            <div className="flex items-center px-5 rounded-2xl bg-[#D9D9D9]/50">
              <input
                type="text"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearch}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="bg-transparent outline-none text-white/50 placeholder-white/50 py-1"
              />
              {query && (
                <button
                  onMouseDown={(e) => { e.preventDefault(); setQuery(""); setSuggestions([]); setShowSuggestions(false); }}
                  className="ml-1 text-white/40 hover:text-white/70 transition-colors duration-100 text-lg leading-none"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <SuggestionsDropdown
              suggestions={suggestions}
              onSelect={handleSelectSuggestion}
              visible={showSuggestions}
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
