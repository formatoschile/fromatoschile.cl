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
    <section className="section-inset bg-graphite py-20 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 lg:gap-20">
        {/* Left: copy */}
        <div>
          <h2 className="text-4xl font-normal text-white sm:text-5xl">
            Tu Seguridad Legal es Nuestra Prioridad
          </h2>

          <p className="text-primary mt-6 max-w-md text-lg leading-relaxed">
            Trabajamos con un equipo de más de 20 abogados especializados para
            garantizar que cada documento cumpla con los más altos estándares
            legales.
          </p>

          <Link
            href="/todos-los-documentos"
            className="text-primary border-primary mt-8 inline-flex items-center gap-2 border-b pb-1 text-lg font-normal transition-opacity hover:opacity-70"
          >
            Ver Todos los Documentos <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Right: certifications card */}
        <div className="bg-primary text-ink rounded-2xl p-8 sm:p-10">
          <h3 className="text-ink text-4xl leading-[28px] font-normal">
            Certificaciones y Garantias
          </h3>

          <p className="mt-2 text-base text-neutral-600">
            Cumplimos con los más altos estándares de seguridad y calidad
          </p>

          <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {certifications.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckIcon className="text-ink h-5 w-5 shrink-0" />
                <span className="text-base font-normal text-neutral-700">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
