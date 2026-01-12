"use client";

import { Shows } from "@/app/types/shows";
import ShowsCard from "./ShowsCard";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { CSSProperties } from "react";

type ShowsCarouselProps = {
  results: Shows[];
};

type ArrowProps = {
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
};

function NextArrow({ className, style, onClick }: ArrowProps) {
  return (
    <>
      <IoIosArrowForward
        className={className}
        style={{ ...style, display: "block", color: "white", fontSize: 30 }}
        onClick={onClick}
      />
    </>
  );
}

function PrevArrow({ className, style, onClick }: ArrowProps) {
  return (
    <>
      <IoIosArrowBack
        className={className}
        style={{ ...style, display: "block", color: "white", fontSize: 30 }}
        onClick={onClick}
      />
    </>
  );
}

export default function ShowsCarousel({ results }: ShowsCarouselProps) {
  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    initialSlide: 0,
    swipe: true,
    draggable: true,
    touchMove: true,
    swipeToSlide: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    mobileFirst: true,
    responsive: [
      { breakpoint: 2560, settings: { slidesToShow: 12, slidesToScroll: 1 } },
      { breakpoint: 1440, settings: { slidesToShow: 7, slidesToScroll: 1 } },
      { breakpoint: 1280, settings: { slidesToShow: 6, slidesToScroll: 1 } },
      { breakpoint: 1024, settings: { slidesToShow: 5, slidesToScroll: 1 } },
      { breakpoint: 820, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <div className="w-full px-4">
      <Slider {...settings}>
        {results.map((shows) => (
          <ShowsCard key={shows.id} results={shows} />
        ))}
      </Slider>
    </div>
  );
}

/*
export default function MovieCarousel({ results }: ShowsCarouselProps) {
  return (
    <div className="flex flex-col items-center lg:flex-row lg:items-start lg:justify-center lg:gap-6">
      {results.slice(0, 8).map((shows) => (
        <ShowsCard key={shows.id} results={shows} />
      ))}
    </div>
  );
}
*/
