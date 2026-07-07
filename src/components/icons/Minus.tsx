interface MinusIconProps {
  className?: string;
}

export const MinusIcon: React.FC<MinusIconProps> = ({
  className = "w-18 h-2 stroke-current",
}) => (
  <svg
    className={className}
    viewBox="0 0 18 2"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 1.005H18" stroke="black" />
  </svg>
);
