interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-bold transition-colors rounded-lg';
  const variants = {
    primary: 'bg-primary hover:bg-emerald-400 text-text-inv shadow-[0_0_15px_rgba(19,236,128,0.3)]',
    secondary: 'bg-surface-active hover:bg-surface-active/80 text-text border border-border',
    ghost: 'text-text-muted hover:text-text hover:bg-surface-active',
    icon: 'text-text-muted hover:text-text hover:bg-surface-active rounded-full',
  };
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
