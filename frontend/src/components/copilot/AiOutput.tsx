import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { parseAiText, splitLabel } from '../../utils/aiParse';

function valueTone(v: string): string {
  const s = v.toLowerCase();
  if (/^(critical|severe|very high)\b/.test(s) || s.startsWith('p1')) return 'text-crit';
  if (/^high\b/.test(s) || s.startsWith('p2')) return 'text-high';
  if (/^(moderate|medium)\b/.test(s) || s.startsWith('p3')) return 'text-med';
  return 'text-ink';
}

export function AiOutput({ text, emphasizeSteps }: {text: string;emphasizeSteps?: boolean;}) {
  const sections = useMemo(() => parseAiText(text), [text]);
  const reduce = useReducedMotion();

  if (!sections.length) return <p className="whitespace-pre-wrap text-sm text-ink">{text}</p>;

  return (
    <div className="space-y-6">
      {sections.map((sec, si) =>
      <motion.section
        key={`${sec.title}-${si}`}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: Math.min(si * 0.05, 0.3), ease: [0.23, 1, 0.32, 1] }}>
        
          {sec.title &&
        <h4 className="mb-2.5 flex items-center gap-2 text-xs font-semibold text-ink">
              <span className="h-3 w-[2px] rounded-full bg-accent" aria-hidden />
              {sec.title}
            </h4>
        }
          {sec.paragraphs.map((p, i) =>
        <p key={i} className="mb-2 text-sm leading-relaxed text-ink/90">
              {p}
            </p>
        )}
          {sec.items.length > 0 && (
        sec.ordered || emphasizeSteps ?
        <ol className="relative space-y-2.5">
                {sec.items.map((item, i) =>
          <li key={i} className="flex gap-3">
                    <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded border border-line-strong font-mono text-[10px] text-muted">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-ink/90">{item}</span>
                  </li>
          )}
              </ol> :

        <ul className="space-y-2">
                {sec.items.map((item, i) => {
            const { label, body } = splitLabel(item);
            return label ?
            <li key={i} className="flex items-baseline justify-between gap-4 border-b border-line/70 pb-2 text-sm last:border-0">
                      <span className="text-muted">{label}</span>
                      <span className={twMerge('text-right font-medium', valueTone(body))}>{body}</span>
                    </li> :

            <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink/90">
                      <span className="mt-[9px] h-1 w-1 shrink-0 bg-muted" aria-hidden />
                      {item}
                    </li>;

          })}
              </ul>)
        }
        </motion.section>
      )}
    </div>);

}