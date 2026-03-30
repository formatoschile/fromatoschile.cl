import { readFile } from "fs/promises";
import { ImageResponse } from "next/og";
import { join } from "path";

// import { LogoIcon } from "./icons/LogoIcon";

export interface OpengraphImageProps {
  title?: string;
}

export const OpengraphImage = async (
  props?: OpengraphImageProps
): Promise<ImageResponse> => {
  const { title } = {
    ...{
      title: process.env.SITE_NAME,
    },
    ...props,
  };

  const file = await readFile(
    join(process.cwd(), "./src/fonts/Inter-Bold.ttf")
  );
  const font = Uint8Array.from(file).buffer;

  return new ImageResponse(
    <div className="flex h-full w-full flex-col items-center justify-center bg-black">
      <div className="flex flex-none items-center justify-center border border-neutral-700 h-[160px] w-[160px] rounded-3xl">
        {/* <LogoIcon width="64" height="58" fill="white" /> */}
      </div>
      <p className="mt-12 text-6xl font-bold text-white">{title}</p>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: font,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
};
