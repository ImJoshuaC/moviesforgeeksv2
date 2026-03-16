import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getWatchlist } from "@/app/actions/watchlist";

export default async function WatchlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const watchlist = await getWatchlist();

  return (
    <div className="min-h-screen bg-[#1c1c1c] px-8 lg:px-16 py-10">
      <h1 className="text-white text-3xl md:text-4xl font-roboto-slab font-bold uppercase mb-2">
        My Watchlist
      </h1>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {watchlist.map((item) => (
            <Link
              key={item.id}
              href={`/${item.media_type === "movie" ? "films" : "shows"}/${item.media_id}`}
              className="group flex flex-col gap-2"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                {item.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <span className="text-white/30 text-xs font-roboto-slab">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 text-white/70 font-roboto-slab text-xs px-2 py-0.5 rounded uppercase">
                  {item.media_type === "movie" ? "Film" : "Show"}
                </div>
              </div>
              <p className="text-white text-sm font-roboto-slab leading-tight group-hover:text-[#4ade80] transition-colors">
                {item.title}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
