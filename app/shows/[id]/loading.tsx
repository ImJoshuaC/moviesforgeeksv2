// Show detail page loading skeleton
export default function Loading() {
  return (
    <div className="relative w-full min-h-screen bg-[#161616] animate-pulse">
      {/* Backdrop placeholder */}
      <div className="absolute inset-0 bg-white/5" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/75 to-[#161616]" />

      <div className="relative z-20 px-2 py-4 md:px-3 md:py-6 lg:px-4 lg:py-8">
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
            {/* Left column */}
            <div className="flex flex-col gap-10">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Poster */}
                <div className="shrink-0 w-56 md:w-72 mx-auto md:mx-0 aspect-[2/3] bg-white/10 rounded-xl" />
                {/* Info */}
                <div className="flex flex-col gap-4 flex-1">
                  <div className="h-10 w-3/4 bg-white/10 rounded" />
                  <div className="h-4 w-1/2 bg-white/10 rounded" />
                  <div className="h-8 w-32 bg-white/10 rounded" />
                  <div className="flex gap-3">
                    <div className="h-10 w-28 bg-white/10 rounded-lg" />
                    <div className="h-10 w-28 bg-white/10 rounded-lg" />
                    <div className="h-10 w-28 bg-white/10 rounded-lg" />
                  </div>
                  <div className="h-4 w-40 bg-white/10 rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-white/10 rounded" />
                    <div className="h-4 w-full bg-white/10 rounded" />
                    <div className="h-4 w-2/3 bg-white/10 rounded" />
                  </div>
                </div>
              </div>
              {/* Cast row */}
              <div>
                <div className="h-6 w-16 bg-white/10 rounded mb-2" />
                <hr className="border-white/10 mb-3" />
                <div className="flex gap-3 overflow-hidden">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="shrink-0 w-24 flex flex-col gap-2">
                      <div className="w-24 h-24 rounded-full bg-white/10" />
                      <div className="h-3 w-20 bg-white/10 rounded mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Right column (reviews) */}
            <div className="h-96 bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
