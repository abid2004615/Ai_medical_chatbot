import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium rounded-2xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-dark-background disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:scale-[1.02] hover:brightness-95 dark:hover:brightness-110',
        secondary: 'bg-white dark:bg-dark-surface text-primary border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-surface-light',
        ghost: 'bg-transparent text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-dark-surface',
        danger: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
}

export function Button({ className, variant, size, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </button>
  );
}
