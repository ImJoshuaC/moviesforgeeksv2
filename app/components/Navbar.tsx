"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Spin as Hamburger } from "hamburger-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { FaUser, FaHeart, FaBookmark, FaSignOutAlt } from "react-icons/fa";

type ProfileData = {
  username: string | null;
  avatar_url: string | null;
};

type AvatarCircleProps = {
  avatarUrl: string | null;
  email: string;
  size: number;
};

type SearchResults = {
  movies: { id: number; title: string; poster_path: string | null; year: string }[];
  shows:  { id: number; title: string; poster_path: string | null; year: string }[];
  people: { id: number; name: string; profile_path: string | null }[];
  users:  { id: string; username: string | null; display_name: string | null; avatar_url: string | null }[];
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
  results,
  onSelectMedia,
  onSelectPerson,
  onSelectUser,
  visible,
}: {
  results: SearchResults;
  onSelectMedia: (type: "movie" | "tv", id: number) => void;
  onSelectPerson: (id: number) => void;
  onSelectUser: (id: string) => void;
  visible: boolean;
}) {
  const hasResults =
    results.movies.length > 0 ||
    results.shows.length > 0 ||
    results.people.length > 0 ||
    results.users.length > 0;

  return (
    <div
      className={`
        absolute left-0 right-0 top-[calc(100%+4px)]
        bg-[#1c1c1c] border border-white/10 rounded-md shadow-xl z-50 overflow-hidden
        transition-all duration-200 ease-out
        ${visible && hasResults
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-1 pointer-events-none"}
      `}
    >
      {results.movies.length > 0 && (
        <div>
          <p className="px-3 pt-2.5 pb-1 text-white/30 font-roboto-slab text-xs uppercase tracking-widest">Films</p>
          {results.movies.map((m) => (
            <button
              key={m.id}
              onMouseDown={(e) => { e.preventDefault(); onSelectMedia("movie", m.id); }}
              className="flex items-center gap-3 w-full px-3 py-2 hover:bg-white/10 transition-colors text-left"
            >
              {m.poster_path
                ? <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} alt={m.title} className="w-8 h-12 object-cover rounded shrink-0" />
                : <div className="w-8 h-12 bg-white/10 rounded shrink-0" />}
              <div className="flex flex-col min-w-0">
                <span className="text-white text-sm font-roboto-slab truncate">{m.title}</span>
                {m.year && <span className="text-white/40 text-xs mt-0.5">{m.year}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {results.shows.length > 0 && (
        <div>
          <p className="px-3 pt-2.5 pb-1 text-white/30 font-roboto-slab text-xs uppercase tracking-widest">Shows</p>
          {results.shows.map((s) => (
            <button
              key={s.id}
              onMouseDown={(e) => { e.preventDefault(); onSelectMedia("tv", s.id); }}
              className="flex items-center gap-3 w-full px-3 py-2 hover:bg-white/10 transition-colors text-left"
            >
              {s.poster_path
                ? <img src={`https://image.tmdb.org/t/p/w92${s.poster_path}`} alt={s.title} className="w-8 h-12 object-cover rounded shrink-0" />
                : <div className="w-8 h-12 bg-white/10 rounded shrink-0" />}
              <div className="flex flex-col min-w-0">
                <span className="text-white text-sm font-roboto-slab truncate">{s.title}</span>
                {s.year && <span className="text-white/40 text-xs mt-0.5">{s.year}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {results.people.length > 0 && (
        <div>
          <p className="px-3 pt-2.5 pb-1 text-white/30 font-roboto-slab text-xs uppercase tracking-widest">People</p>
          {results.people.map((p) => (
            <button
              key={p.id}
              onMouseDown={(e) => { e.preventDefault(); onSelectPerson(p.id); }}
              className="flex items-center gap-3 w-full px-3 py-2 hover:bg-white/10 transition-colors text-left"
            >
              {p.profile_path
                ? <img src={`https://image.tmdb.org/t/p/w92${p.profile_path}`} alt={p.name} className="w-8 h-8 object-cover rounded-full shrink-0" />
                : <div className="w-8 h-8 bg-white/10 rounded-full shrink-0" />}
              <span className="text-white text-sm font-roboto-slab truncate">{p.name}</span>
            </button>
          ))}
        </div>
      )}

      {results.users.length > 0 && (
        <div>
          <p className="px-3 pt-2.5 pb-1 text-white/30 font-roboto-slab text-xs uppercase tracking-widest">Users</p>
          {results.users.map((u) => (
            <button
              key={u.id}
              onMouseDown={(e) => { e.preventDefault(); onSelectUser(u.id); }}
              className="flex items-center gap-3 w-full px-3 py-2 hover:bg-white/10 transition-colors text-left"
            >
              {u.avatar_url
                ? <img src={u.avatar_url} alt={u.username ?? ""} className="w-8 h-8 object-cover rounded-full shrink-0" />
                : <div className="w-8 h-8 bg-[#4ade80] rounded-full shrink-0 flex items-center justify-center text-black text-xs font-bold font-roboto-slab">
                    {(u.display_name ?? u.username ?? "?")[0].toUpperCase()}
                  </div>}
              <div className="flex flex-col min-w-0">
                {u.display_name && <span className="text-white text-sm font-roboto-slab truncate">{u.display_name}</span>}
                {u.username && <span className="text-white/40 text-xs truncate">@{u.username}</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const Navbar = () => {
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [results, setResults] = useState<SearchResults>({ movies: [], shows: [], people: [], users: [] });
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

    const handleProfileUpdated = (e: Event) => {
      const { avatarUrl } = (e as CustomEvent<{ avatarUrl: string }>).detail;
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
    };
    window.addEventListener('profile:updated', handleProfileUpdated);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('profile:updated', handleProfileUpdated);
    };
  }, []);

  // Debounced suggestions fetch
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ movies: [], shows: [], people: [], users: [] });
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data: SearchResults = await res.json();
        setResults(data);
        const hasAny = data.movies.length > 0 || data.shows.length > 0 || data.people.length > 0 || data.users.length > 0;
        setShowSuggestions(hasAny);
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

  const clearSearch = () => {
    setQuery("");
    setResults({ movies: [], shows: [], people: [], users: [] });
    setShowSuggestions(false);
    setOpen(false);
  };

  const handleSelectMedia = (type: "movie" | "tv", id: number) => {
    clearSearch();
    router.push(type === "movie" ? `/films/${id}` : `/shows/${id}`);
  };

  const handleSelectPerson = (id: number) => {
    clearSearch();
    router.push(`/people/${id}`);
  };

  const handleSelectUser = (id: string) => {
    clearSearch();
    router.push(`/users/${id}`);
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
                  onFocus={() => { const has = results.movies.length > 0 || results.shows.length > 0 || results.people.length > 0 || results.users.length > 0; if (has) setShowSuggestions(true); }}
                  className="flex-1 min-w-0 bg-transparent outline-none text-white/50 placeholder-white/50 py-1"
                />
                {query && (
                  <button
                    onMouseDown={(e) => { e.preventDefault(); setQuery(""); setResults({ movies: [], shows: [], people: [], users: [] }); setShowSuggestions(false); }}
                    className="ml-1 text-white/40 hover:text-white/70 transition-colors duration-100 text-lg leading-none"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
              <SuggestionsDropdown
                results={results}
                onSelectMedia={handleSelectMedia}
                onSelectPerson={handleSelectPerson}
                onSelectUser={handleSelectUser}
                visible={showSuggestions}
              />
            </div>
            <a href="../films/" className={`block py-1.5 ${navLinkClass}`}>FILMS</a>
            <a href="../shows/" className={`block py-1.5 ${navLinkClass}`}>TV SHOWS</a>
            <a href="../people/" className={`block py-1.5 ${navLinkClass}`}>PEOPLE</a>
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
                <Link href="/favorites" className={`block py-1.5 ${navLinkClass}`}>MY FAVORITES</Link>
                <Link href="/watchlist" className={`block py-1.5 ${navLinkClass}`}>MY WATCHLIST</Link>
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
          <div ref={searchWrapperRef} className="relative w-52">
            <div className="flex items-center px-5 rounded-2xl bg-[#D9D9D9]/50">
              <input
                type="text"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearch}
                onFocus={() => { const has = results.movies.length > 0 || results.shows.length > 0 || results.people.length > 0 || results.users.length > 0; if (has) setShowSuggestions(true); }}
                className="flex-1 min-w-0 bg-transparent outline-none text-white/50 placeholder-white/50 py-1"
              />
              {query && (
                <button
                  onMouseDown={(e) => { e.preventDefault(); setQuery(""); setResults({ movies: [], shows: [], people: [], users: [] }); setShowSuggestions(false); }}
                  className="shrink-0 ml-1 text-white/40 hover:text-white/70 transition-colors duration-100 text-lg leading-none"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <SuggestionsDropdown
              results={results}
              onSelectMedia={handleSelectMedia}
              onSelectPerson={handleSelectPerson}
              onSelectUser={handleSelectUser}
              visible={showSuggestions}
            />
          </div>

          {/* Avatar + hover dropdown */}
          {user && (
            <div className="relative group">
              <button
                className="flex items-center ring-2 ring-transparent group-hover:ring-[#4ade80]/40 rounded-full transition-all duration-200"
                aria-label="Profile menu"
              >
                <AvatarCircle
                  avatarUrl={profile?.avatar_url ?? null}
                  email={user.email ?? "?"}
                  size={36}
                />
              </button>
              {/* Invisible bridge so hovering between avatar and menu keeps it open */}
              <div className="absolute right-0 top-full h-3 w-full" />
              <div className="
                absolute right-0 top-[calc(100%+12px)] w-56
                bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-50
                font-roboto-slab text-sm overflow-hidden
                opacity-0 translate-y-2 scale-95 pointer-events-none
                group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto
                transition-all duration-200 ease-out origin-top-right
              ">
                {/* User header */}
                <div className="px-4 py-4 border-b border-white/10 bg-white/3">
                  <div className="flex items-center gap-3">
                    <AvatarCircle
                      avatarUrl={profile?.avatar_url ?? null}
                      email={user.email ?? "?"}
                      size={38}
                    />
                    <div className="flex flex-col min-w-0">
                      {profile?.username ? (
                        <span className="text-white text-sm font-semibold truncate">{profile.username}</span>
                      ) : null}
                      <span className="text-white/40 text-xs truncate">{user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Nav links */}
                <div className="py-1.5">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-[#4ade80] hover:bg-white/5 transition-colors duration-150"
                  >
                    <FaUser size={13} className="shrink-0" />
                    <span className="text-xs tracking-widest uppercase">Profile</span>
                  </Link>
                  <Link
                    href="/favorites"
                    className="flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-[#4ade80] hover:bg-white/5 transition-colors duration-150"
                  >
                    <FaHeart size={13} className="shrink-0" />
                    <span className="text-xs tracking-widest uppercase">My Favorites</span>
                  </Link>
                  <Link
                    href="/watchlist"
                    className="flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-[#4ade80] hover:bg-white/5 transition-colors duration-150"
                  >
                    <FaBookmark size={13} className="shrink-0" />
                    <span className="text-xs tracking-widest uppercase">My Watchlist</span>
                  </Link>
                </div>

                {/* Sign out */}
                <div className="border-t border-white/10 py-1.5">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400/80 hover:text-red-400 hover:bg-white/5 transition-colors duration-150"
                  >
                    <FaSignOutAlt size={13} className="shrink-0" />
                    <span className="text-xs tracking-widest uppercase">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
