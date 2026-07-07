import Image from "next/image";
import Link from "next/link";

export const HomeHero = () => {
  return (
    <section className="mx-auto flex w-full max-w-[1666px] shrink-0 flex-col items-center justify-center px-4 pt-24 pb-8 lg:h-[515px] lg:px-[97.5px] lg:pt-[80px] lg:pb-0">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-300 sm:aspect-[21/9] lg:aspect-auto lg:h-full">
        <Image
          src="/images/home-hero.png"
          alt="Profesionales revisando documentos legales"
          fill
          priority
          sizes="(max-width: 1666px) 100vw, 1666px"
          className="object-cover"
        />

        {/* Darkening overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent to-[37.5%]" />

        {/* Headline — top-left */}
        <h1 className="absolute left-6 top-8 max-w-[10ch] font-condensed text-4xl font-medium leading-[1.1] text-[#363636] sm:left-12 sm:top-12 sm:text-[60px] sm:leading-[66px]">
          Contratos legales listos para usar
        </h1>

        {/* Subtitle — bottom-left */}
        <p className="absolute bottom-8 left-6 max-w-[36ch] text-sm text-white sm:bottom-10 sm:left-12 sm:text-base">
          Plantillas legales redactadas por profesionales. Descarga inmediata y
          listas para firmar.
        </p>

        {/* CTA — bottom-right */}
        <Link
          href="/todos-los-documentos"
          className="absolute bottom-8 right-6 rounded-lg bg-white px-8 py-4 text-sm font-medium tracking-wide text-neutral-800 shadow-sm transition-all hover:scale-105 hover:brightness-95 sm:bottom-10 sm:right-12"
        >
          VER CONTRATOS
        </Link>
      </div>
    </section>
  );
};
