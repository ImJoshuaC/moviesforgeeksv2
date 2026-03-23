"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#161616] flex items-center justify-center">
      <div className="text-center flex flex-col gap-4 px-4">
        <h1 className="text-white text-3xl font-roboto-slab font-black uppercase">
          Something went wrong
        </h1>
        <p className="text-white/60 font-roboto-serif text-sm">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="mx-auto px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-roboto-slab text-sm uppercase rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
