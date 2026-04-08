// Films listing page loading skeleton
export default function Loading() {
  return (
    <div className="w-full bg-[#1c1c1c] animate-pulse">
      {/* Top10Hero placeholder */}
      <div className="w-full h-[420px] md:h-[560px] bg-white/5" />

      {/* Carousel rows */}
      <div className="mx-5 md:mx-15 lg:mx-25">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="my-5">
            <div className="h-6 w-48 bg-white/10 rounded mb-2" />
            <hr className="border-white/10 mb-3" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="shrink-0 w-32 md:w-40 aspect-[2/3] bg-white/10 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
