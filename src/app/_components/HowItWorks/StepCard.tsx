export interface Step {
  number: string;
  title: string;
  description: string;
}

interface StepCardProps {
  step: Step;
}

export const StepCard: React.FC<StepCardProps> = ({ step }) => {
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
