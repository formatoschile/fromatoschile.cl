import type { Step } from "./StepCard";
import { StepCard } from "./StepCard";

const steps: Step[] = [
  {
    number: "01",
    title: "Selecciona tu contrato",
    description:
      "Explora nuestra biblioteca de documentos legales y elige la plantilla que se ajusta a lo que necesitas.",
  },
  {
    number: "02",
    title: "Descarga",
    description:
      "Realiza tu compra de forma segura. Accede inmediatamente a tu documento en formato editable (Word/PDF).",
  },
  {
    number: "03",
    title: "Usa y personaliza",
    description:
      "Edita el documento con tus datos y úsalo de inmediato, respaldado por abogados colegiados.",
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="section-inset bg-primary py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-ink text-4xl font-normal sm:text-5xl">
          Cómo funciona
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <StepCard key={step.number} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
};
