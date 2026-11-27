import Image from "next/image";
import Link from "next/link";

export const HomeHero: React.FC = () => {
  return (
    <section className="mx-auto flex w-full max-w-[1666px] shrink-0 flex-col items-center justify-center px-4 pt-24 pb-8 lg:h-[615px] lg:px-12 lg:pt-20 lg:pb-0">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-neutral-300 sm:aspect-[4/3] lg:aspect-auto lg:h-full">
        <Image
          src="/images/home-hero.png"
          alt="Profesionales revisando documentos legales"
          fill
          priority
          sizes="(max-width: 1666px) 100vw, 1666px"
          className="object-cover object-top"
        />

        {/* Darkening overlay for text legibility */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent to-[55%] lg:from-black/50 lg:to-[37.5%]" />

        {/* Headline — top-left */}
        <h1 className="text-ink absolute top-8 left-6 max-w-full text-4xl leading-[1.1] font-normal sm:top-12 sm:left-12 sm:text-[80px] sm:leading-[76px] lg:max-w-1/2">
          Contratos legales listos para usar
        </h1>

        {/* Subtitle + CTA — stacked on mobile/tablet, side by side from lg */}
        <div className="absolute inset-x-6 bottom-8 flex flex-col items-start gap-5 sm:inset-x-12 sm:bottom-10 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-[36ch] text-base text-white sm:text-lg">
            Plantillas legales redactadas por profesionales. Descarga inmediata
            y listas para firmar.
          </p>

          <Link
            href="/todos-los-documentos"
            className="text-ink shrink-0 rounded-lg bg-white px-8 py-4 text-sm font-normal tracking-wide shadow-sm transition-all hover:scale-105 hover:brightness-95"
          >
            VER CONTRATOS
          </Link>
        </div>
      </div>
    </section>
  );
};
