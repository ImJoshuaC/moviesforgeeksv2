import { NextRequest, NextResponse } from "next/server";

type TMDBResult = {
  id: number;
  media_type: string;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const API_KEY = process.env.API_KEY;
  const url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(q)}&page=1`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return NextResponse.json([]);

  const data = await res.json();
  const results: TMDBResult[] = data.results ?? [];

  const suggestions = results
    .filter(
      (r) =>
        (r.media_type === "movie" || r.media_type === "tv") &&
        r.poster_path
    )
    .slice(0, 4)
    .map((r) => ({
      id: r.id,
      media_type: r.media_type,
      title: r.title ?? r.name ?? "Unknown",
      poster_path: r.poster_path,
      year: (r.release_date ?? r.first_air_date ?? "").slice(0, 4),
    }));

  return NextResponse.json(suggestions);
}
