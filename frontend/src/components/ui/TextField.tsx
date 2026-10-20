import React from 'react';
import { twMerge } from 'tailwind-merge';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  trailing?: React.ReactNode;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
{ label, hint, error, trailing, className, id, ...rest },
ref)
{
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className={twMerge('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-xs font-medium text-muted">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...rest}
          className={twMerge(
            'h-10 w-full rounded-md border bg-base px-3 text-sm text-ink placeholder:text-faint transition-colors duration-150 ease-out focus:outline-none',
            error ? 'border-crit/60 focus:border-crit' : 'border-line-strong focus:border-accent/70',
            trailing ? 'pr-10' : ''
          )} />
        
        {trailing && <div className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error ?
      <p id={`${inputId}-err`} className="text-xs text-crit">
          {error}
        </p> :
      hint ?
      <p id={`${inputId}-hint`} className="text-xs text-faint">
          {hint}
        </p> :
      null}
    </div>);

});