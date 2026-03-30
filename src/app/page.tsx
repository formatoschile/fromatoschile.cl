import { HomeHero } from "./_components/HomeHero/HomeHero";

export const metadata = {
  title: "formatos.cl",
  description: "El mejor e-commerce de contractos de Chile",
  openGraph: {
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
    </>
  );
}
