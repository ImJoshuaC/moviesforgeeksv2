const API_KEY = process.env.API_KEY;

export default async function SpecificFilmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const filmId = (await params).id;

  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${filmId}?api_key=${API_KEY}&language=en-US`
  );
  const filmData = await res.json();
  console.log(filmData);

  return (
    <div>
      <h1>{filmData.title}</h1>
      <p>{filmData.overview}</p>
    </div>
  );
}
