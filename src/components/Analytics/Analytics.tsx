import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { CaptureLanding } from "./CaptureLanding";

export const Analytics: React.FC = () => {
  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
      <CaptureLanding />
    </>
  );
};
