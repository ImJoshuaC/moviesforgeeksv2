// Root loading — covers the home page
export default function Loading() {
  return (
    <div className="w-full bg-[#1c1c1c] animate-pulse">
      {/* Hero placeholder */}
      <div className="w-full h-[420px] md:h-[560px] bg-white/5" />

      {/* Carousel rows */}
      <div className="mx-5 md:mx-10 lg:mx-16 my-8 flex flex-col gap-8">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="h-6 w-48 bg-white/10 rounded mb-3" />
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
