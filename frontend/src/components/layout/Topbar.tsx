import React, { useEffect, useState } from 'react';
import { MenuIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../../hooks/useAuth';
import { checkHealth } from '../../services/healthService';
import { ROLE_LABEL } from '../../utils/roles';
import { BrandMark } from './BrandMark';
import { UtcClock } from './UtcClock';

type Health = 'checking' | 'up' | 'down';

export function Topbar({ onMenu }: {onMenu: () => void;}) {
  const { user, demoMode } = useAuth();
  const [health, setHealth] = useState<Health>('checking');
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      const start = performance.now();
      try {
        const ok = await checkHealth();
        if (!cancelled) {
          setHealth(ok ? 'up' : 'down');
          setLatency(Math.round(performance.now() - start));
        }
      } catch {
        if (!cancelled) {
          setHealth('down');
          setLatency(null);
        }
      }
    };
    void probe();
    const t = setInterval(probe, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [demoMode]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-base/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button type="button" onClick={onMenu} aria-label="Open navigation" className="-ml-1 rounded-md p-2 text-muted hover:bg-raised hover:text-ink lg:hidden">
        <MenuIcon className="h-5 w-5" />
      </button>
      <BrandMark withWordmark={false} className="lg:hidden" />

      <div className="ml-auto flex items-center gap-4 font-mono text-2xs text-muted sm:gap-6">
        {demoMode &&
        <span className="hidden rounded border border-med/40 px-2 py-0.5 text-med sm:inline" title="Previewing with in-browser demo data. Disable demoMode to use the live backend.">
            Demo data
          </span>
        }
        <span className="flex items-center gap-2" aria-live="polite">
          <span className="relative flex h-2 w-2">
            {health === 'up' && <span className="absolute inset-0 animate-ping2 rounded-full bg-ok" />}
            <span
              className={twMerge(
                'relative h-2 w-2 rounded-full',
                health === 'up' ? 'bg-ok' : health === 'down' ? 'bg-crit' : 'bg-faint'
              )} />
            
          </span>
          <span className="hidden sm:inline">
            {health === 'up' ? 'API nominal' : health === 'down' ? 'API unreachable' : 'Checking API'}
          </span>
          {health === 'up' && latency !== null && <span className="hidden text-faint md:inline tabular">{latency}ms</span>}
        </span>
        <UtcClock className="hidden text-ink md:inline" />
        {user && <span className="rounded border border-line-strong px-2 py-0.5 text-ink">{ROLE_LABEL[user.role]}</span>}
      </div>
    </header>);

}