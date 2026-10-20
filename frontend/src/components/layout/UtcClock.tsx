import React, { useEffect, useState } from 'react';
import { fmtClock } from '../../utils/format';

export function UtcClock({ className }: {className?: string;}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <time dateTime={now.toISOString()} className={className}>
      <span className="tabular">{fmtClock(now)}</span> <span className="text-faint">UTC</span>
    </time>);

}