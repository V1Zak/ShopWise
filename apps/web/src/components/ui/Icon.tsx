interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export function Icon({ name, className = '', size }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={size ? { fontSize: size } : undefined}
    >
      {name}
    </span>
  );
}
