import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const Analytics = () => {
  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
    </>
  );
};
