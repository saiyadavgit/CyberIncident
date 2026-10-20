import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  className?: string;
  duration?: number;
}

/** GSAP-driven counter that tweens from the previous value; respects reduced motion. */
export function AnimatedNumber({ value, decimals = 0, className, duration = 1.1 }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef({ v: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const render = () => {
      el.textContent = current.current.v.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    };
    if (reduce) {
      current.current.v = value;
      render();
      return;
    }
    const tween = gsap.to(current.current, { v: value, duration, ease: 'expo.out', onUpdate: render });
    return () => {
      tween.kill();
    };
  }, [value, decimals, duration]);

  return (
    <span ref={ref} className={className}>
      {current.current.v.toFixed(decimals)}
    </span>);

}