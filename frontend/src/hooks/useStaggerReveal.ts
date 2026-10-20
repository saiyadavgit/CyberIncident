import { useLayoutEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';

/** One-time GSAP entrance for [data-reveal] children once `ready` becomes true. */
export function useStaggerReveal<T extends HTMLElement>(ready: boolean): RefObject<T> {
  const ref = useRef<T>(null);
  const done = useRef(false);
  useLayoutEffect(() => {
    if (!ready || done.current || !ref.current) return;
    done.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-reveal]', { opacity: 0, y: 14, duration: 0.7, ease: 'expo.out', stagger: 0.07, clearProps: 'transform,opacity' });
    }, ref);
    return () => ctx.revert();
  }, [ready]);
  return ref;
}