import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#161616] border-t border-white/10 mt-auto">
      <div className="mx-5 md:mx-10 lg:mx-16 py-10 flex flex-col gap-8">

        {/* Top row: brand + nav */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

          {/* Brand */}
          <div className="flex flex-col gap-1">
            <Link href="/" className="text-white font-jaro text-2xl">
              MoviesForGeeks
            </Link>
            <p className="text-white/40 font-roboto-slab text-sm">
              Your go-to place for movie geeks.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-2 font-roboto-slab text-sm text-white/60">
            <Link href="/films" className="hover:text-white transition-colors">Films</Link>
            <Link href="/shows" className="hover:text-white transition-colors">TV Shows</Link>
            <Link href="/people" className="hover:text-white transition-colors">People</Link>
          </nav>
        </div>

        {/* Bottom row: attribution + copyright */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 font-roboto-slab text-xs text-white/30">
          <p>
            This product uses the{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/60 transition-colors"
            >
              TMDB API
            </a>{" "}
            but is not endorsed or certified by TMDB.
          </p>
          <p>© {new Date().getFullYear()} MoviesForGeeks. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
