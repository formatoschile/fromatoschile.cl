"use client";

import { useEffect } from "react";

import { captureLanding } from "@/lib/attribution/captureLanding";

/**
 * Records the visitor's landing page and campaign parameters once per full
 * page load, for the order's campaign attributes (src/lib/attribution).
 * Renders nothing. Mounted once, in the root layout.
 */
export const CaptureLanding: React.FC = () => {
  useEffect(captureLanding, []);

  return null;
};
