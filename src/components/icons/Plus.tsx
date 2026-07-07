interface PlusIconProps {
  className?: string;
}

export const PlusIcon: React.FC<PlusIconProps> = ({
  className = "size-18 stroke-current",
}) => (
  <svg
    className={className}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 9H18" stroke="black" />
    <path d="M9 0L9 18" stroke="black" />
  </svg>
);
