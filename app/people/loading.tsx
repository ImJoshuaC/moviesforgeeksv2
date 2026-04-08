// People listing page loading skeleton
export default function Loading() {
  return (
    <div className="w-full bg-[#1c1c1c] animate-pulse">
      <div className="mx-5 md:mx-15 lg:mx-25">
        {[0, 1, 2].map((i) => (
          <div key={i} className="my-5">
            <div className="h-6 w-48 bg-white/10 rounded mb-2" />
            <hr className="border-white/10 mb-3" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 8 }).map((_, j) => (
                <div key={j} className="shrink-0 flex flex-col items-center gap-2">
                  <div className="w-28 h-28 rounded-full bg-white/10" />
                  <div className="w-20 h-3 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
