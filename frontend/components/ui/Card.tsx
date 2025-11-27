import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-6 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/5 transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: CardProps) {
  return (
    <h3 className={cn('text-xl font-semibold text-slate-800 dark:text-white', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('text-slate-600 dark:text-gray-300', className)} {...props}>
      {children}
    </div>
  );
}
