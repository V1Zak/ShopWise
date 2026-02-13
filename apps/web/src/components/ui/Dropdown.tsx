import { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, children, align = 'left' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {trigger}
      </div>
      {open && (
        <div
          role="menu"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
          className={`absolute top-full mt-2 z-50 min-w-[200px] rounded-xl border border-border bg-surface shadow-2xl py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  label: string;
  active?: boolean;
  onClick: () => void;
  icon?: string;
}

export function DropdownItem({ label, active, onClick, icon }: DropdownItemProps) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
        active
          ? 'bg-primary/15 text-primary font-semibold'
          : 'text-text-muted hover:bg-bg hover:text-text'
      }`}
    >
      {icon && (
        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{icon}</span>
      )}
      <span className="flex-1">{label}</span>
      {active && (
        <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-primary">check</span>
      )}
    </button>
  );
}
