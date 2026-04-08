// Film category page loading skeleton
export default function Loading() {
  return (
    <div className="w-full bg-[#1c1c1c] min-h-screen animate-pulse">
      <div className="mx-5 md:mx-10 lg:mx-16 py-8">
        <div className="h-8 w-56 bg-white/10 rounded mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="w-full aspect-[2/3] bg-white/10 rounded-lg" />
              <div className="h-3 w-3/4 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
