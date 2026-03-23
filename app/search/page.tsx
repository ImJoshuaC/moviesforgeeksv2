import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Pagination from "@/app/components/Pagination";

const API_KEY = process.env.API_KEY;
const PREVIEW_LIMIT = 6;
const PAGE_SIZE = 20;
const MAX_PAGES = 20;

type TMDBItem = {
  id: number;
  media_type?: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  poster_path: string | null;
  profile_path: string | null;
  release_date?: string;
  first_air_date?: string;
};

type DbUser = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

// ─── Shared card components ──────────────────────────────────────────────────

function PosterCard({ item, href, title, year }: { item: TMDBItem; href: string; title: string; year?: string }) {
  return (
    <Link href={href}>
      <div className="flex flex-col items-center transform transition-transform duration-300 hover:scale-105">
        <div className="relative w-full">
          {item.poster_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
              alt={title}
              width={300}
              height={450}
              className="w-full h-auto rounded-lg"
            />
          ) : (
            <div className="w-full aspect-2/3 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-white/30 text-xs font-roboto-slab">No Image</span>
            </div>
          )}
        </div>
        <p className="font-roboto-serif text-sm text-center mt-1 leading-tight line-clamp-2">
          {title}
          {year && <span className="text-white/50"> ({year})</span>}
        </p>
      </div>
    </Link>
  );
}

function PersonCard({ item }: { item: TMDBItem }) {
  const name = item.name ?? "Unknown";
  return (
    <Link href={`/people/${item.id}`}>
      <div className="flex flex-col items-center gap-2 transform transition-transform duration-300 hover:scale-105">
        {item.profile_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w185${item.profile_path}`}
            alt={name}
            width={185}
            height={278}
            className="w-full h-auto rounded-lg"
          />
        ) : (
          <div className="w-full aspect-2/3 bg-white/10 rounded-lg flex items-center justify-center">
            <span className="text-white/30 text-2xl font-roboto-slab">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <p className="font-roboto-slab text-sm text-center leading-tight line-clamp-2">{name}</p>
      </div>
    </Link>
  );
}

function UserCard({ user }: { user: DbUser }) {
  const displayName = user.display_name ?? user.username ?? "User";
  return (
    <Link href={`/users/${user.id}`}>
      <div className="flex flex-col items-center gap-2 transform transition-transform duration-300 hover:scale-105">
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={displayName}
            width={120}
            height={120}
            className="w-full aspect-square object-cover rounded-full"
          />
        ) : (
          <div className="w-full aspect-square bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-white/60 text-2xl font-roboto-slab">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="text-center">
          <p className="font-roboto-slab text-sm leading-tight">{displayName}</p>
          {user.username && (
            <p className="font-roboto-serif text-white/40 text-xs">@{user.username}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function SectionHeader({
  label,
  total,
  seeAllHref,
}: {
  label: string;
  total?: number;
  seeAllHref?: string;
}) {
  return (
    <>
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-roboto-slab text-lg uppercase text-white/80">
          {label}
          {total !== undefined && (
            <span className="text-white/40 text-sm font-normal ml-2">({total.toLocaleString()})</span>
          )}
        </h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="font-roboto-serif text-sm text-white/50 hover:text-white transition-colors"
          >
            See all →
          </Link>
        )}
      </div>
      <hr className="border-white/10 mb-4" />
    </>
  );
}

const GRID = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  const { q, type, page: pageParam } = await searchParams;

  if (!q) {
    return (
      <div className="mx-5 md:mx-15 lg:mx-25 my-10 text-white">
        <h1 className="font-roboto-slab text-2xl uppercase mb-2">Search</h1>
        <hr />
        <p className="font-roboto-serif text-white/60 mt-8 text-center">
          Enter a search term to get started.
        </p>
      </div>
    );
  }

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const encodedQ = encodeURIComponent(q);

  // ── Filtered view (type param present) ──────────────────────────────────────
  if (type === "movie" || type === "show" || type === "person") {
    const endpointMap = {
      movie: `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${encodedQ}&page=${currentPage}&include_adult=false`,
      show: `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=en-US&query=${encodedQ}&page=${currentPage}&include_adult=false`,
      person: `https://api.themoviedb.org/3/search/person?api_key=${API_KEY}&language=en-US&query=${encodedQ}&page=${currentPage}&include_adult=false`,
    };

    const res = await fetch(endpointMap[type]);
    const data = res.ok ? await res.json() : { results: [], total_pages: 1, total_results: 0 };
    const items: TMDBItem[] = data.results ?? [];
    const totalPages = Math.min(data.total_pages ?? 1, MAX_PAGES);
    const totalResults: number = data.total_results ?? 0;
    const labelMap = { movie: "Movies", show: "Shows", person: "People" };
    const basePath = `/search?q=${encodedQ}&type=${type}`;

    return (
      <div className="mx-5 md:mx-15 lg:mx-25 my-10 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Link href={`/search?q=${encodedQ}`} className="font-roboto-serif text-white/40 hover:text-white text-sm transition-colors">
            ← All results
          </Link>
        </div>
        <h1 className="font-roboto-slab text-xl md:text-2xl uppercase mb-2">
          {labelMap[type]} for &ldquo;{q}&rdquo;
        </h1>
        <hr className="border-white/20 mb-8" />

        {items.length === 0 ? (
          <p className="font-roboto-serif text-white/60 mt-8 text-center">No results found.</p>
        ) : (
          <>
            <SectionHeader label={labelMap[type]} total={totalResults} />
            <div className={GRID}>
              {type === "person"
                ? items.map((item) => <PersonCard key={item.id} item={item} />)
                : items.map((item) => {
                    const title = (type === "movie" ? item.title : item.name) ?? "Unknown";
                    const year = (type === "movie" ? item.release_date : item.first_air_date)?.slice(0, 4);
                    const href = type === "movie" ? `/films/${item.id}` : `/shows/${item.id}`;
                    return <PosterCard key={item.id} item={item} href={href} title={title} year={year} />;
                  })}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />
          </>
        )}
      </div>
    );
  }

  if (type === "user") {
    const skip = (currentPage - 1) * PAGE_SIZE;
    const [userResults, totalUsers] = await Promise.all([
      prisma.profile.findMany({
        where: {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { display_name: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, username: true, display_name: true, avatar_url: true },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.profile.count({
        where: {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { display_name: { contains: q, mode: "insensitive" } },
          ],
        },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));
    const basePath = `/search?q=${encodedQ}&type=user`;

    return (
      <div className="mx-5 md:mx-15 lg:mx-25 my-10 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Link href={`/search?q=${encodedQ}`} className="font-roboto-serif text-white/40 hover:text-white text-sm transition-colors">
            ← All results
          </Link>
        </div>
        <h1 className="font-roboto-slab text-xl md:text-2xl uppercase mb-2">
          Users for &ldquo;{q}&rdquo;
        </h1>
        <hr className="border-white/20 mb-8" />

        {userResults.length === 0 ? (
          <p className="font-roboto-serif text-white/60 mt-8 text-center">No users found.</p>
        ) : (
          <>
            <SectionHeader label="Users" total={totalUsers} />
            <div className={GRID}>
              {userResults.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />
          </>
        )}
      </div>
    );
  }

  // ── Overview (no type param) ─────────────────────────────────────────────────
  const [tmdbRes, dbUsers] = await Promise.all([
    fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=en-US&query=${encodedQ}&page=1&include_adult=false`
    ),
    prisma.profile.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { display_name: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, username: true, display_name: true, avatar_url: true },
      take: PREVIEW_LIMIT,
    }),
  ]);

  const tmdbData = tmdbRes.ok ? await tmdbRes.json() : { results: [], total_results: 0 };
  const tmdbResults: TMDBItem[] = tmdbData.results ?? [];

  const movies = tmdbResults.filter((r) => r.media_type === "movie");
  const shows = tmdbResults.filter((r) => r.media_type === "tv");
  const people = tmdbResults.filter((r) => r.media_type === "person");
  const tmdbTotal: number = tmdbData.total_results ?? 0;

  const hasResults =
    movies.length > 0 || shows.length > 0 || people.length > 0 || dbUsers.length > 0;

  return (
    <div className="mx-5 md:mx-15 lg:mx-25 my-10 text-white">
      <h1 className="font-roboto-slab text-xl md:text-2xl uppercase mb-2">
        Search results for &ldquo;{q}&rdquo;
      </h1>
      <hr className="border-white/20" />

      {!hasResults ? (
        <p className="font-roboto-serif text-white/60 mt-8 text-center">
          No results found for &ldquo;{q}&rdquo;.
        </p>
      ) : (
        <div className="flex flex-col gap-10 mt-8">
          {/* Movies */}
          {movies.length > 0 && (
            <section>
              <SectionHeader
                label="Movies"
                total={tmdbTotal > 0 ? undefined : undefined}
                seeAllHref={movies.length >= PREVIEW_LIMIT ? `/search?q=${encodedQ}&type=movie` : undefined}
              />
              <div className={GRID}>
                {movies.slice(0, PREVIEW_LIMIT).map((item) => {
                  const title = item.title ?? item.name ?? "Unknown";
                  const year = item.release_date?.slice(0, 4);
                  return <PosterCard key={item.id} item={item} href={`/films/${item.id}`} title={title} year={year} />;
                })}
              </div>
            </section>
          )}

          {/* Shows */}
          {shows.length > 0 && (
            <section>
              <SectionHeader
                label="Shows"
                seeAllHref={shows.length >= PREVIEW_LIMIT ? `/search?q=${encodedQ}&type=show` : undefined}
              />
              <div className={GRID}>
                {shows.slice(0, PREVIEW_LIMIT).map((item) => {
                  const title = item.name ?? item.title ?? "Unknown";
                  const year = item.first_air_date?.slice(0, 4);
                  return <PosterCard key={item.id} item={item} href={`/shows/${item.id}`} title={title} year={year} />;
                })}
              </div>
            </section>
          )}

          {/* People */}
          {people.length > 0 && (
            <section>
              <SectionHeader
                label="People"
                seeAllHref={people.length >= PREVIEW_LIMIT ? `/search?q=${encodedQ}&type=person` : undefined}
              />
              <div className={GRID}>
                {people.slice(0, PREVIEW_LIMIT).map((item) => (
                  <PersonCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Users */}
          {dbUsers.length > 0 && (
            <section>
              <SectionHeader
                label="Users"
                seeAllHref={dbUsers.length >= PREVIEW_LIMIT ? `/search?q=${encodedQ}&type=user` : undefined}
              />
              <div className={GRID}>
                {dbUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
