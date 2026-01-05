"use client";

import { useState } from "react";
import { Spin as Hamburger } from "hamburger-react";

export const Navbar = () => {
  const [isOpen, setOpen] = useState(false);

  return (
    <nav className="w-full h-auto text-white bg-[#161616]">
      {/*Mobile Device */}
      <div className="lg:hidden flex flex-col items-center px-8 pt-3 font-roboto-slab text-md">
        <h1 className="text-3xl font-jaro">
          <a href="..">MoviesForGeeks</a>
        </h1>
        <Hamburger toggled={isOpen} toggle={setOpen} size={20} />
        {isOpen && (
          <>
            <div className="px-3 rounded-2xl bg-[#D9D9D9]/50">
              <input
                type="text"
                placeholder="Search"
                className="
                w-full
                bg-transparent
                outline-none
                text-white/50
                placeholder-white/50
              "
              />
            </div>
            <a href="../films/" className="pt-2 pb-1">
              FILMS
            </a>
            <a href="../shows/" className="py-1">
              TV SHOWS
            </a>
            <a href="../people/" className="pt-1 pb-2">
              PEOPLE
            </a>
          </>
        )}
      </div>
      {/*Desktop Device */}
      <div className="hidden lg:flex items-center justify-between h-full px-8 py-6">
        <h1 className="text-3xl font-jaro">MoviesForGeeks</h1>
        <div className="flex gap-6 font-roboto-slab text-lg">
          <a href="../films/">FILMS</a>
          <a href="../shows/">TV SHOWS</a>
          <a href="../people/">PEOPLE</a>
          <div className="px-5 rounded-2xl bg-[#D9D9D9]/50">
            <input
              type="text"
              placeholder="Search"
              className="
                w-full
                bg-transparent
                outline-none
                text-white/50
                placeholder-white/50
              "
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

/*
color - 161616
<div className="flex items-center justify-between h-full px-8">
        <h1 className="text-lg font-semibold">MOVIESFORGEEKS</h1>
        <div className="flex gap-6">
          <a href="../movies/">Movies</a>
          <a href="../shows/">TV Shows</a>
          <a href="../people/">People</a>
          <input placeholder="Search" className="px-5 bg-amber-800 rounded" />
        </div>
      </div>
      
*/
