import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { createThreatScene, supportsWebGL, type ThreatSceneHandle, type TopologyNode } from './threatScene';
import { SeverityBadge } from '../ui/SeverityBadge';
import { StatusBadge } from '../ui/StatusBadge';
import { incidentCode } from '../../utils/format';
import type { Incident } from '../../types/incident';

interface ThreatTopologyProps {
  mode: 'live' | 'ambient';
  incidents?: Incident[];
  interactive?: boolean;
  onSelect?: (incidentId: number) => void;
  className?: string;
  label?: string;
}

export function ThreatTopology({ mode, incidents, interactive = mode === 'live', onSelect, className, label }: ThreatTopologyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ThreatSceneHandle | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const [hover, setHover] = useState<{node: TopologyNode;x: number;y: number;} | null>(null);
  const [webgl] = useState(() => supportsWebGL());

  const nodes = useMemo<TopologyNode[]>(
    () => (incidents ?? []).map((i) => ({ id: i.id, title: i.title, severity: i.severity, status: i.status, type: i.type })),
    [incidents]
  );
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  useEffect(() => {
    if (!webgl || !containerRef.current || !labelRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const handle = createThreatScene(containerRef.current, labelRef.current, {
      mode,
      interactive,
      reducedMotion: reduced,
      onHover: (node, x, y) => setHover(node ? { node, x, y } : null),
      onSelect: (node) => onSelectRef.current?.(node.id)
    });
    handle.setNodes(nodesRef.current);
    handleRef.current = handle;
    return () => {
      handle.dispose();
      handleRef.current = null;
    };
  }, [mode, interactive, webgl]);

  useEffect(() => {
    handleRef.current?.setNodes(nodes);
  }, [nodes]);

  if (!webgl) {
    return (
      <div className={twMerge('flex items-center justify-center hairline-grid', className)}>
        <p className="font-mono text-xs text-faint">3D topology unavailable on this device</p>
      </div>);

  }

  return (
    <div className={twMerge('relative overflow-hidden', className)} role="img" aria-label={label ?? 'Threat topology visualization'}>
      <div ref={containerRef} className="absolute inset-0" />
      <div ref={labelRef} className="pointer-events-none absolute inset-0" aria-hidden />
      <AnimatePresence>
        {hover &&
        <motion.div
          key={hover.node.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="pointer-events-none absolute z-10 w-64 rounded-lg border border-line-strong bg-surface/95 p-3 shadow-xl shadow-black/50"
          style={{ left: Math.min(hover.x + 16, (containerRef.current?.clientWidth ?? 400) - 272), top: Math.max(hover.y - 20, 8) }}>
          
            <p className="font-mono text-2xs text-faint">{incidentCode(hover.node.id)}</p>
            <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-ink">{hover.node.title}</p>
            <div className="mt-2.5 flex items-center justify-between">
              <SeverityBadge severity={hover.node.severity} />
              <StatusBadge status={hover.node.status} showTrack={false} />
            </div>
            <p className="mt-2 border-t border-line pt-2 text-2xs text-faint">Click to open incident</p>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}