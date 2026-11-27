"use client";

import { useCaptureLanding } from "./useCaptureLanding";

/**
 * Records the visitor's landing page and campaign parameters for the order's
 * campaign attributes, following advertising consent (useCaptureLanding).
 * Renders nothing. Mounted once, in the root layout.
 */
export const CaptureLanding: React.FC = () => {
  useCaptureLanding();

  return null;
};
