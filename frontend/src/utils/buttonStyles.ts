import { twMerge } from 'tailwind-merge';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-accent/90 font-semibold',
  secondary: 'bg-raised text-ink border border-line-strong hover:border-faint hover:bg-raised/70',
  ghost: 'text-muted hover:text-ink hover:bg-raised',
  danger: 'bg-crit/10 text-crit border border-crit/40 hover:bg-crit/20'
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2'
};

export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md', className?: string): string {
  return twMerge(
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-md transition-[transform,background-color,border-color,color] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className
  );
}