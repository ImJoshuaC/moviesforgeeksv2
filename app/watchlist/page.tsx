import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getWatchlist } from "@/app/actions/watchlist";
import CategoryView from "@/app/components/CategoryView";

export default async function WatchlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const watchlist = await getWatchlist();

  const items = watchlist.map((item) => ({
    id: String(item.id),
    title: item.title,
    poster_path: item.poster_path ?? "",
    overview: "",
    date: item.release_year ? String(item.release_year) : "",
    href: `/${item.media_type === "movie" ? "films" : "shows"}/${item.media_id}`,
  }));

  return (
    <div className="min-h-screen bg-[#1c1c1c] px-8 lg:px-16 py-10">
      <p className="text-white/40 font-roboto-serif text-sm mb-8">
        {watchlist.length} {watchlist.length === 1 ? "title" : "titles"} saved
      </p>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-white/40 font-roboto-slab text-lg">Your watchlist is empty.</p>
          <div className="flex gap-4">
            <Link
              href="/films"
              className="px-5 py-2 bg-[#4ade80] text-black font-bold font-roboto-slab text-sm rounded-md hover:bg-[#22c55e] transition-colors"
            >
              Browse Films
            </Link>
            <Link
              href="/shows"
              className="px-5 py-2 border border-white/30 text-white font-roboto-slab text-sm rounded-md hover:border-white/60 transition-colors"
            >
              Browse Shows
            </Link>
          </div>
        </div>
      ) : (
        <CategoryView items={items} label="My Watchlist" />
      )}
    </div>
  );
}
