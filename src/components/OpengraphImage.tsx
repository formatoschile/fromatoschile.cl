import { ImageResponse } from "next/og";

import { env } from "@/lib/utils/env";

export interface OpengraphImageProps {
  title?: string;
}

export const OpengraphImage = async (
  props?: OpengraphImageProps
): Promise<ImageResponse> => {
  const title = props?.title ?? env.SITE_NAME;

  return new ImageResponse(
    <div className="flex h-full w-full flex-col items-center justify-center bg-black">
      <p className="text-6xl font-bold text-white">{title}</p>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
};
