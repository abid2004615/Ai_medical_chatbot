import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-background px-4 py-3 text-sm text-gray-900 dark:text-white',
            'placeholder:text-slate-400 dark:placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
