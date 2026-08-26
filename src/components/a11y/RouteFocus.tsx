"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Client-side navigations don't move focus or announce anything to screen
 * reader users by default. Moves focus to `<main>` on every route change
 * (skipping the very first render, so initial page load isn't affected).
 */
export const RouteFocus = () => {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    document.getElementById("main-content")?.focus();
    // oxlint-disable-next-line react/exhaustive-effect-dependencies -- pathname intentionally re-triggers this effect even though its value isn't read
  }, [pathname]);

  return null;
};
