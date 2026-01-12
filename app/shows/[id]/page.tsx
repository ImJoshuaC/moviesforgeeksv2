import Image from "next/image";

const API_KEY = process.env.API_KEY;

export default async function SpecificShowsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const showId = (await params).id;

  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${showId}?api_key=${API_KEY}&language=en-US`
  );
  const showData = await res.json();

  const creditsRes = await fetch(
    `https://api.themoviedb.org/3/tv/${showId}/credits?api_key=${API_KEY}&language=en-US`
  );
  const creditsData = await creditsRes.json();

  return (
    <div className="relative w-full min-h-screen">
      {/* Backdrop Image */}
      <Image
        src={`https://image.tmdb.org/t/p/w1280${showData.backdrop_path}`}
        alt={showData.name ?? "Show Poster"}
        fill
        priority
        className="object-cover z-0"
        quality={90}
        sizes="100vw"
      />
      {/* Overlay for dimming if needed */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      {/* Content goes on top of backdrop but below navbar */}
      <div className="relative z-20 p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10">
            {/* Poster Image */}
            <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-start">
              <Image
                src={`https://image.tmdb.org/t/p/w500${showData.poster_path}`}
                alt={showData.name ?? "Show Poster"}
                width={50}
                height={75}
                quality={90}
                sizes="100vw"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>

            {/* Content Section */}
            <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 flex-1">
              {/* Title and Rating */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-roboto-slab font-black uppercase [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
                  {showData.name}
                </h1>
                <div
                  className={`rounded-full px-3 py-1.5 flex items-center justify-center min-w-[50px] sm:self-auto ${
                    showData.vote_average >= 6.5
                      ? "bg-green-600"
                      : showData.vote_average >= 5.0
                      ? "bg-yellow-500"
                      : "bg-red-600"
                  }`}
                >
                  <p
                    className={`text-white text-base md:text-lg font-roboto-slab font-bold [text-shadow:_-1px_-1px_0_rgb(0_0_0_/_80%),_1px_-1px_0_rgb(0_0_0_/_80%),_-1px_1px_0_rgb(0_0_0_/_80%),_1px_1px_0_rgb(0_0_0_/_80%)]`}
                  >
                    {showData.vote_average.toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Show Info */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 md:gap-4">
                <p className="text-white text-sm md:text-base font-roboto-serif">
                  <span className="font-bold">First Air Date:</span>{" "}
                  {showData.first_air_date || "N/A"}
                </p>
                <p className="text-white text-sm md:text-base font-roboto-serif">
                  <span className="font-bold">Last Air Date:</span>{" "}
                  {showData.last_air_date || "N/A"}
                </p>
                <p className="text-white text-sm md:text-base font-roboto-serif">
                  <span className="font-bold">Seasons:</span>{" "}
                  {showData.number_of_seasons || "N/A"}
                </p>
                <p className="text-white text-sm md:text-base font-roboto-serif">
                  <span className="font-bold">Genre:</span>{" "}
                  {showData.genres.map((genres: any) => genres.name).join(", ")}
                </p>
              </div>

              {/* Synopsis */}
              <div className="mt-2">
                <h2 className="text-white text-lg md:text-xl lg:text-2xl font-roboto-slab font-bold mb-2 md:mb-3 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]">
                  Synopsis
                </h2>
                <p className="text-white text-sm md:text-base lg:text-lg font-roboto-serif font-normal leading-relaxed [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]">
                  {showData.overview || "No synopsis available."}
                </p>
              </div>
            </div>
          </div>
          <>
            <h1 className="font-roboto-slab text-xl md:text-2xl uppercase">
              Cast
            </h1>
            <hr></hr>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {creditsData.cast
                ?.filter(
                  (member: any) =>
                    member &&
                    member.character &&
                    member.character.trim().length > 0
                )
                .map((member: any) => (
                  <div
                    key={member.cast_id ?? `${member.id}-${member.credit_id}`}
                    className="flex flex-col items-center text-center gap-2 bg-black/30 p-3 rounded-lg"
                  >
                    <div className="w-24 h-24 relative overflow-hidden rounded-full bg-black/40">
                      {member.profile_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                          alt={member.name ?? "Cast member"}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-white font-roboto-slab text-sm md:text-base">
                        {member.name}
                      </p>
                      <p className="text-white/80 font-roboto-serif text-xs md:text-sm">
                        {member.character}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </>
        </div>
      </div>
    </div>
  );
}
