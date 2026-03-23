"use client";

import { useState } from "react";

const CHAR_LIMIT = 400;

export default function BiographyText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  const isLong = text.length > CHAR_LIMIT;
  const displayed = isLong && !expanded ? text.slice(0, CHAR_LIMIT).trimEnd() : text;

  return (
    <p className="text-white/80 text-sm md:text-base font-roboto-serif leading-relaxed whitespace-pre-line">
      {displayed}
      {isLong && !expanded && (
        <>
          {"... "}
          <button
            onClick={() => setExpanded(true)}
            className="text-white/50 hover:text-white transition-colors font-roboto-slab text-sm underline underline-offset-2"
          >
            show more
          </button>
        </>
      )}
      {isLong && expanded && (
        <>
          {" "}
          <button
            onClick={() => setExpanded(false)}
            className="text-white/50 hover:text-white transition-colors font-roboto-slab text-sm underline underline-offset-2"
          >
            show less
          </button>
        </>
      )}
    </p>
  );
}
