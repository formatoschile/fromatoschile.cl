import Image from "next/image";

export const LegalGuidance = () => {
  return (
    <section className="bg-white px-6 py-16 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="bg-primary relative overflow-hidden rounded-3xl px-8 py-16 sm:px-14 lg:px-20 lg:py-24">
          {/* Decorative RK monogram */}
          <Image
            src="/logo/rk_logo_white.png"
            alt=""
            aria-hidden="true"
            width={260}
            height={131}
            className="pointer-events-none absolute right-6 bottom-6 w-48 opacity-70 select-none sm:w-72"
          />

          <div className="relative max-w-2xl">
            <h2 className="text-ink text-4xl leading-[1.1] font-normal sm:text-5xl sm:leading-[53px]">
              ¿Necesitas orientación legal personalizada?
            </h2>

            <p className="mt-8 text-lg text-neutral-700">
              Los documentos disponibles en Formatos Chile han sido
              desarrollados y revisados con apoyo de abogados, para que puedas
              acceder a formatos claros, prácticos y actualizados conforme a la
              normativa chilena. Sin embargo, si tu situación requiere una
              revisión especifica, una estrategia legal o la intervención
              directa de un abogado, puedes solicitar asesoría personalizada con
              nuestro estudio jurídico asociado:{" "}
              <strong className="font-bold">RK Abogados</strong>
            </p>

            <p className="mt-6 text-lg font-bold text-neutral-700">
              RK Abogados es un estudio jurídico independiente que colabora con
              Formatos Chile en el desarrollo y revisión de documentos legales.
              Si necesitas atención personalizada, podrás contactarlos
              directamente a través de su página web.
            </p>

            <a
              href="https://www.rkabogados.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink mt-8 inline-block rounded-md bg-white px-6 py-3 text-sm font-normal tracking-wide uppercase shadow-sm transition-colors hover:bg-neutral-100"
            >
              Habla con RK Abogados
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
