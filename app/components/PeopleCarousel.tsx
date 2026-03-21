"use client";

import { Person } from "@/app/types/person";
import PersonCard from "./PersonCard";
import Carousel from "./Carousel";

type PeopleCarouselProps = {
  results: Person[];
};

export default function PeopleCarousel({ results }: PeopleCarouselProps) {
  return (
    <Carousel
      items={results}
      renderItem={(person) => <PersonCard results={person} />}
      getKey={(person, index) => `${person.id}-${index}`}
    />
  );
}
