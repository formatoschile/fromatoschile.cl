import { CheckIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const certifications = [
  "Cumplimiento RGPD",
  "Abogados Colegiados",
  "Pago Seguro SSL",
  "ISO 9001",
];

export const SecuritySection = () => {
  return (
    <section className="bg-graphite px-6 py-20 text-white lg:px-16">
      <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 lg:gap-20">
        {/* Left: copy */}
        <div>
          <h2 className="font-condensed text-4xl leading-tight text-white sm:text-5xl">
            <span className="font-bold">Tu Seguridad Legal</span>{" "}
            <span className="font-normal">es</span>
            <br />
            <span className="font-light">Nuestra Prioridad</span>
          </h2>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/70">
            Trabajamos con un equipo de más de 20 abogados especializados para
            garantizar que cada documento cumpla con los más altos estándares
            legales.
          </p>

          <Link
            href="/todos-los-documentos"
            className="mt-8 inline-flex items-center gap-2 text-sm text-white underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            Ver Todos los Documentos <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Right: certifications card */}
        <div className="rounded-2xl bg-primary p-8 text-neutral-800 sm:p-10">
          <h3 className="font-condensed text-2xl text-neutral-800 sm:text-3xl">
            Certificaciones y Garantias
          </h3>

          <p className="mt-2 text-sm text-neutral-600">
            Cumplimos con los más altos estándares de seguridad y calidad
          </p>

          <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {certifications.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckIcon className="h-5 w-5 shrink-0 text-neutral-900" />
                <span className="text-sm text-neutral-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
