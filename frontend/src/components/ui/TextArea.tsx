import React from 'react';
import { twMerge } from 'tailwind-merge';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
  counter?: {max: number;};
}

export function TextArea({ label, hint, error, counter, className, id, value, ...rest }: TextAreaProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const len = typeof value === 'string' ? value.length : 0;
  return (
    <div className={twMerge('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-xs font-medium text-muted">
          {label}
        </label>
        {counter &&
        <span className={twMerge('font-mono text-2xs tabular', len > counter.max ? 'text-crit' : 'text-faint')}>
            {len}/{counter.max}
          </span>
        }
      </div>
      <textarea
        id={inputId}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
        {...rest}
        className={twMerge(
          'min-h-[96px] w-full resize-y rounded-md border bg-base px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-faint transition-colors duration-150 ease-out focus:outline-none',
          error ? 'border-crit/60 focus:border-crit' : 'border-line-strong focus:border-accent/70'
        )} />
      
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

}