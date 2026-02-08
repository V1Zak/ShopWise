interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-bold transition-colors rounded-lg';
  const variants = {
    primary: 'bg-primary hover:bg-emerald-400 text-background-dark shadow-[0_0_15px_rgba(19,236,128,0.3)]',
    secondary: 'bg-accent-green hover:bg-[#2d5c45] text-white border border-border-dark',
    ghost: 'text-text-secondary hover:text-white hover:bg-accent-green',
    icon: 'text-text-secondary hover:text-white hover:bg-accent-green rounded-full',
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
