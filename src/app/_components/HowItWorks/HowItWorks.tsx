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

interface StepCardProps {
  step: Step;
}

const StepCard: React.FC<StepCardProps> = ({ step }) => {
  const { number, title, description } = step;

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <p
        aria-hidden="true"
        className="text-primary h-px text-6xl leading-[23px] font-bold select-none md:text-[190px]"
      >
        {number}
      </p>
      <h3 className="text-ink mt-4 text-3xl leading-[23px] font-normal">
        {title}
      </h3>
      <p className="mt-4 text-base leading-relaxed text-neutral-500">
        {description}
      </p>
    </div>
  );
};
