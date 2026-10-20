import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../utils/api';
import { ThreatTopology } from '../viz/ThreatTopology';
import { BrandMark } from './BrandMark';
import { UtcClock } from './UtcClock';

interface AuthLayoutProps {
  children: React.ReactNode;
  /** Render the ambient 3D network (login). Register uses the lighter static grid. */
  scene?: boolean;
}

export function AuthLayout({ children, scene = true }: AuthLayoutProps) {
  const heroRef = useRef<HTMLElement>(null);
  const { demoMode } = useAuth();

  useLayoutEffect(() => {
    if (!heroRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.from('[data-reveal]', { yPercent: 110, duration: 1.2, stagger: 0.09, delay: 0.25 }).
      from('[data-fade]', { opacity: 0, y: 10, duration: 0.9, stagger: 0.08 }, '-=0.8').
      from('[data-rule]', { scaleX: 0, transformOrigin: 'left center', duration: 1.1 }, '-=0.9');
    }, heroRef);
    return () => ctx.revert();
  }, []);

  let apiHost = API_BASE_URL;
  try {
    apiHost = new URL(API_BASE_URL).host;
  } catch {

    /* keep raw */}

  return (
    <div className="grid min-h-screen w-full bg-base text-ink lg:grid-cols-[1.4fr_1fr]">
      <section ref={heroRef} className="relative hidden overflow-hidden border-r border-line lg:block">
        {scene ?
        <ThreatTopology mode="ambient" className="absolute inset-0" label="Ambient network topology with active threat signals" /> :

        <div className="absolute inset-0 hairline-grid opacity-50" aria-hidden />
        }
        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center justify-between">
            <BrandMark />
            <UtcClock className="font-mono text-2xs text-muted" />
          </div>
          <div>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight xl:text-[64px]">
              <span className="block overflow-hidden pb-1">
                <span data-reveal className="block">
                  Every signal.
                </span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span data-reveal className="block text-muted">
                  One line of defense.
                </span>
              </span>
            </h1>
            <p data-fade className="mt-6 max-w-md text-base leading-relaxed text-muted">
              Incident intake, triage, investigation and AI-advised response for your security operations team — on one command surface.
            </p>
            <div data-rule className="mt-10 h-px w-full bg-line-strong" />
            <dl data-fade className="mt-5 grid grid-cols-3 gap-6 font-mono text-2xs">
              <div>
                <dt className="text-faint">Session</dt>
                <dd className="mt-1 text-ink">JWT · Bearer</dd>
              </div>
              <div>
                <dt className="text-faint">Access</dt>
                <dd className="mt-1 text-ink">Role-based</dd>
              </div>
              <div>
                <dt className="text-faint">Endpoint</dt>
                <dd className="mt-1 truncate text-ink">{demoMode ? 'Demo environment' : apiHost}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <BrandMark className="mb-10 lg:hidden" />
          {children}
        </div>
      </section>
    </div>);

}