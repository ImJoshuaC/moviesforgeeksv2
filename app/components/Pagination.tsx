import Link from "next/link";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

type Props = {
  currentPage: number;
  totalPages: number;
  basePath: string;
};

function pageHref(basePath: string, page: number) {
  return `${basePath}?page=${page}`;
}

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}

export default function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null;

  const pageNumbers = buildPageNumbers(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-center gap-1 py-8 flex-wrap">
      {/* Previous */}
      {hasPrev ? (
        <Link
          href={pageHref(basePath, currentPage - 1)}
          className="flex items-center gap-1 px-3 py-2 rounded font-roboto-serif text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <IoIosArrowBack size={14} />
          Prev
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded font-roboto-serif text-sm text-white/20 cursor-not-allowed">
          <IoIosArrowBack size={14} />
          Prev
        </span>
      )}

      {/* Page numbers */}
      {pageNumbers.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-white/30 font-roboto-serif text-sm select-none">
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(basePath, p)}
            className={`min-w-[36px] text-center px-2 py-2 rounded font-roboto-serif text-sm transition-colors ${
              p === currentPage
                ? "bg-white/15 text-white font-semibold"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      {hasNext ? (
        <Link
          href={pageHref(basePath, currentPage + 1)}
          className="flex items-center gap-1 px-3 py-2 rounded font-roboto-serif text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          Next
          <IoIosArrowForward size={14} />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded font-roboto-serif text-sm text-white/20 cursor-not-allowed">
          Next
          <IoIosArrowForward size={14} />
        </span>
      )}
    </div>
  );
}
