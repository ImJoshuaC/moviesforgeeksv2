import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type TMDBResult = {
  id: number;
  media_type: string;
  title?: string;
  name?: string;
  poster_path: string | null;
  profile_path: string | null;
  release_date?: string;
  first_air_date?: string;
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ movies: [], shows: [], people: [], users: [] });
  }

  const API_KEY = process.env.API_KEY;
  const tmdbUrl = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(q)}&page=1`;

  const [tmdbRes, dbUsers] = await Promise.all([
    fetch(tmdbUrl, { next: { revalidate: 60 } }),
    prisma.profile.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { display_name: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, username: true, display_name: true, avatar_url: true },
      take: 4,
    }),
  ]);

  if (!tmdbRes.ok) return NextResponse.json({ movies: [], shows: [], people: [], users: [] });

  const tmdbData = await tmdbRes.json();
  const results: TMDBResult[] = tmdbData.results ?? [];

  const movies = results
    .filter((r) => r.media_type === "movie" && r.poster_path)
    .slice(0, 3)
    .map((r) => ({
      id: r.id,
      title: r.title ?? "Unknown",
      poster_path: r.poster_path,
      year: (r.release_date ?? "").slice(0, 4),
    }));

  const shows = results
    .filter((r) => r.media_type === "tv" && r.poster_path)
    .slice(0, 3)
    .map((r) => ({
      id: r.id,
      title: r.name ?? "Unknown",
      poster_path: r.poster_path,
      year: (r.first_air_date ?? "").slice(0, 4),
    }));

  const people = results
    .filter((r) => r.media_type === "person")
    .slice(0, 3)
    .map((r) => ({
      id: r.id,
      name: r.name ?? "Unknown",
      profile_path: r.profile_path,
    }));

  const users = dbUsers.map((u) => ({
    id: u.id,
    username: u.username,
    display_name: u.display_name,
    avatar_url: u.avatar_url,
  }));

  return NextResponse.json({ movies, shows, people, users });
}
