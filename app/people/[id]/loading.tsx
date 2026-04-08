// Person detail page loading skeleton
export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-[#1c1c1c] animate-pulse">
      <div className="bg-gradient-to-b from-black/60 to-[#1c1c1c]">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-8 pb-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Photo */}
            <div className="shrink-0 w-48 md:w-64 mx-auto md:mx-0 aspect-[2/3] bg-white/10 rounded-lg" />
            {/* Info */}
            <div className="flex flex-col gap-4 flex-1">
              <div className="h-10 w-1/2 bg-white/10 rounded" />
              <div className="h-4 w-1/3 bg-white/10 rounded" />
              <div className="h-4 w-1/4 bg-white/10 rounded" />
              <div className="space-y-2 mt-4">
                <div className="h-4 w-full bg-white/10 rounded" />
                <div className="h-4 w-full bg-white/10 rounded" />
                <div className="h-4 w-full bg-white/10 rounded" />
                <div className="h-4 w-3/4 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filmography */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pb-12 flex flex-col gap-8">
        {[0, 1].map((i) => (
          <div key={i}>
            <div className="h-6 w-32 bg-white/10 rounded mb-2" />
            <hr className="border-white/10 mb-3" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="shrink-0 w-32 md:w-36 aspect-[2/3] bg-white/10 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
