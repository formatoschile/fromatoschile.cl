"use client";

import { useRef } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

import { IconButton } from "@/components/ui/IconButton/IconButton";

const SCROLL_AMOUNT = 340;

interface TemplateCarouselProps {
  heading: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Client shell for the featured-templates rail: horizontal scroll container
 * plus arrow controls. Cards are server-rendered and passed as children so
 * only the scroll behavior ships to the client.
 */
export const TemplateCarousel: React.FC<TemplateCarouselProps> = ({
  heading,
  children,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
  };

  const handleNext = () => {
    scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        {heading}

        <div className="flex items-center gap-3">
          <IconButton
            aria-label="Anterior"
            onClick={handlePrev}
            className="h-11 w-11"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </IconButton>
          <IconButton
            aria-label="Siguiente"
            onClick={handleNext}
            className="h-11 w-11"
          >
            <ArrowRightIcon className="h-5 w-5" />
          </IconButton>
        </div>
      </div>

      <div ref={scrollRef} className="mt-8 flex gap-5 overflow-x-auto pb-4">
        {children}
      </div>
    </>
  );
};
