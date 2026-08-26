import { ImageResponse } from "next/og";

import { env } from "@/env";

export interface OpengraphImageProps {
  title?: string;
}

export const OpengraphImage = async (
  props?: OpengraphImageProps
): Promise<ImageResponse> => {
  const title = props?.title ?? env.SITE_NAME;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "black",
      }}
    >
      <p style={{ fontSize: 60, fontWeight: 700, color: "white" }}>{title}</p>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
};
