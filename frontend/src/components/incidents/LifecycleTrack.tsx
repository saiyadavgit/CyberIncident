import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { twMerge } from 'tailwind-merge';
import { LIFECYCLE, STATUS_META, isOpen } from '../../utils/incidentMeta';
import type { IncidentStatus } from '../../types/incident';

export function LifecycleTrack({ status, className }: {status: IncidentStatus;className?: string;}) {
  const idx = LIFECYCLE.indexOf(status);
  const fillRef = useRef<HTMLDivElement>(null);
  const open = isOpen(status);
  const pct = idx / (LIFECYCLE.length - 1) * 100;

  useEffect(() => {
    if (!fillRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fillRef.current.style.width = `${pct}%`;
      return;
    }
    const tween = gsap.to(fillRef.current, { width: `${pct}%`, duration: 1.2, ease: 'expo.out', delay: 0.15 });
    return () => {
      tween.kill();
    };
  }, [pct]);

  return (
    <div className={twMerge('w-full', className)}>
      <ol className="relative grid grid-cols-6" aria-label="Incident lifecycle">
        <li role="presentation" className="absolute left-[8.33%] right-[8.33%] top-[7px] h-px bg-line-strong" aria-hidden>
          <div ref={fillRef} className={twMerge('h-px', open ? 'bg-accent' : 'bg-ok')} style={{ width: 0 }} />
        </li>
        {LIFECYCLE.map((s, i) => {
          const done = i < idx;
          const current = i === idx;
          return (
            <li key={s} className="relative flex flex-col items-center text-center" aria-current={current ? 'step' : undefined}>
              <span
                className={twMerge(
                  'relative z-10 flex h-[15px] w-[15px] items-center justify-center rounded-full border',
                  current ?
                  open ?
                  'border-accent bg-base' :
                  'border-ok bg-base' :
                  done ?
                  open ?
                  'border-accent/60 bg-accent/60' :
                  'border-ok/60 bg-ok/60' :
                  'border-line-strong bg-base'
                )}>
                
                {current && <span className={twMerge('h-[7px] w-[7px] rounded-full', open ? 'bg-accent' : 'bg-ok')} />}
                {current && open && <span className="absolute inset-0 animate-ping2 rounded-full border border-accent/60" aria-hidden />}
              </span>
              <span className={twMerge('mt-2 font-mono text-[10px] sm:text-2xs', current ? 'text-ink' : done ? 'text-muted' : 'text-faint')}>
                {STATUS_META[s].label}
              </span>
            </li>);

        })}
      </ol>
    </div>);

}