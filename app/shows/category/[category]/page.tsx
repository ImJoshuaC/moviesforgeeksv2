import { notFound } from "next/navigation";
import { Shows } from "@/app/types/shows";
import CategoryView, { CategoryItem } from "@/app/components/CategoryView";
import Pagination from "@/app/components/Pagination";

const API_KEY = process.env.API_KEY;
const MAX_PAGES = 20;

type CategoryConfig = {
  label: string;
  endpoint: string;
};

const SHOW_CATEGORIES: Record<string, CategoryConfig> = {
  popular: { label: "Popular Shows", endpoint: "popular" },
  "airing-today": { label: "Airing Today", endpoint: "airing_today" },
  "on-the-air": { label: "On The Air", endpoint: "on_the_air" },
  "top-rated": { label: "Top Rated Shows", endpoint: "top_rated" },
};

export default async function ShowCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { category } = await params;
  const { page: pageParam } = await searchParams;

  const config = SHOW_CATEGORIES[category];
  if (!config) notFound();

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const data = await fetch(
    `https://api.themoviedb.org/3/tv/${config.endpoint}?api_key=${API_KEY}&language=en-US&page=${currentPage}`
  ).then((r) => r.json());

  const shows: Shows[] = data.results ?? [];
  const totalPages = Math.min(data.total_pages ?? 1, MAX_PAGES);

  const items: CategoryItem[] = shows.map((s) => ({
    id: String(s.id),
    title: s.name,
    poster_path: s.poster_path,
    overview: s.overview,
    date: s.first_air_date,
    href: `/shows/${s.id}`,
  }));

  return (
    <div className="w-full bg-[#1c1c1c] min-h-screen">
      <div className="mx-5 md:mx-10 lg:mx-16 py-8">
        <CategoryView items={items} label={config.label} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/shows/category/${category}`}
        />
      </div>
    </div>
  );
}
