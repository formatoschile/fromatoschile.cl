interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Selecciona tu contrato",
    description:
      "Realiza tu compra de forma segura. Accede inmediatamente a tu documento en formato editable (Word/PDF).",
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
      "Realiza tu compra de forma segura. Accede inmediatamente a tu documento en formato editable (Word/PDF).",
  },
];

export const HowItWorks = () => {
  return (
    <section className="bg-primary px-6 py-20 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-condensed text-3xl text-neutral-800 sm:text-4xl">
          Como funziona
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

interface StepCardProps {
  step: Step;
}

const StepCard: React.FC<StepCardProps> = ({ step }) => {
  const { number, title, description } = step;

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <p className="text-sm font-bold text-neutral-800">{number}</p>
      <h3 className="mt-4 text-xl text-neutral-800">{title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-neutral-500">
        {description}
      </p>
    </div>
  );
};
