import { notFound } from "next/navigation";
import { Movie } from "@/app/types/movie";
import CategoryView, { CategoryItem } from "@/app/components/CategoryView";
import Pagination from "@/app/components/Pagination";

const API_KEY = process.env.API_KEY;
const MAX_PAGES = 20;

type CategoryConfig = {
  label: string;
  fetchUrl: (page: number) => string;
};

const FILM_CATEGORIES: Record<string, CategoryConfig> = {
  trending: {
    label: "Trending Today",
    fetchUrl: (page) =>
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}&language=en-US&page=${page}`,
  },
  "coming-soon": {
    label: "Coming Soon",
    fetchUrl: (page) =>
      `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=${page}`,
  },
  popular: {
    label: "Popular Movies",
    fetchUrl: (page) =>
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`,
  },
  "top-rated": {
    label: "Top Rated Movies",
    fetchUrl: (page) =>
      `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`,
  },
  "now-playing": {
    label: "Now Playing",
    fetchUrl: (page) =>
      `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=${page}`,
  },
};

export default async function FilmCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { category } = await params;
  const { page: pageParam } = await searchParams;

  const config = FILM_CATEGORIES[category];
  if (!config) notFound();

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const data = await fetch(config.fetchUrl(currentPage)).then((r) => r.json());
  const movies: Movie[] = data.results ?? [];
  const totalPages = Math.min(data.total_pages ?? 1, MAX_PAGES);

  const items: CategoryItem[] = movies.map((m) => ({
    id: String(m.id),
    title: m.title,
    poster_path: m.poster_path,
    overview: m.overview,
    date: m.release_date,
    href: `/films/${m.id}`,
  }));

  return (
    <div className="w-full bg-[#1c1c1c] min-h-screen">
      <div className="mx-5 md:mx-10 lg:mx-16 py-8">
        <CategoryView items={items} label={config.label} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/films/category/${category}`}
        />
      </div>
    </div>
  );
}
