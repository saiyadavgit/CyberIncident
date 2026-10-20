import React from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { SeverityBadge } from '../ui/SeverityBadge';
import { StatusBadge } from '../ui/StatusBadge';
import { SEVERITY_META, TYPE_META, isOpen } from '../../utils/incidentMeta';
import { incidentCode, relTime } from '../../utils/format';
import type { Incident } from '../../types/incident';

interface IncidentTableProps {
  incidents: Incident[];
  people?: 'assignee' | 'reporter' | 'both';
  selectedId?: number | null;
  onSelect?: (incident: Incident) => void;
  hrefFor?: (incident: Incident) => string;
  renderActions?: (incident: Incident) => React.ReactNode;
  dense?: boolean;
}

export function IncidentTable({
  incidents,
  people = 'assignee',
  selectedId,
  onSelect,
  hrefFor = (i) => `/incidents/${i.id}`,
  renderActions,
  dense
}: IncidentTableProps) {
  const rowPad = dense ? 'py-2.5' : 'py-3.5';
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr className="text-2xs text-faint">
            <th scope="col" className="w-1 border-b border-line p-0" />
            <th scope="col" className="border-b border-line px-3 py-2.5 font-medium">Incident</th>
            <th scope="col" className="border-b border-line px-3 py-2.5 font-medium">Severity</th>
            <th scope="col" className="border-b border-line px-3 py-2.5 font-medium">Status</th>
            {(people === 'reporter' || people === 'both') && <th scope="col" className="border-b border-line px-3 py-2.5 font-medium">Reporter</th>}
            {(people === 'assignee' || people === 'both') && <th scope="col" className="border-b border-line px-3 py-2.5 font-medium">Owner</th>}
            <th scope="col" className="border-b border-line px-3 py-2.5 text-right font-medium">Reported</th>
            {renderActions && <th scope="col" className="border-b border-line px-3 py-2.5"><span className="sr-only">Actions</span></th>}
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc) => {
            const selected = selectedId === inc.id;
            const open = isOpen(inc.status);
            return (
              <tr
                key={inc.id}
                onClick={onSelect ? () => onSelect(inc) : undefined}
                className={twMerge(
                  'group transition-colors duration-100 ease-out',
                  onSelect ? 'cursor-pointer' : '',
                  selected ? 'bg-raised' : 'hover:bg-raised/50'
                )}>
                
                <td className="border-b border-line p-0">
                  <span
                    className={twMerge('block h-full min-h-[44px] w-[3px]', open ? SEVERITY_META[inc.severity].bg : 'bg-transparent')}
                    aria-hidden />
                  
                </td>
                <td className={twMerge('max-w-[420px] border-b border-line px-3', rowPad)}>
                  <div className="flex items-baseline gap-3">
                    <span className="w-[72px] shrink-0 font-mono text-2xs text-faint">{incidentCode(inc.id)}</span>
                    <div className="min-w-0 flex-1">
                    {onSelect ?
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(inc);
                        }}
                        className={twMerge('block w-full truncate text-left font-medium', open ? 'text-ink' : 'text-muted')}>
                        
                        {inc.title}
                      </button> :

                      <Link to={hrefFor(inc)} className={twMerge('block truncate font-medium hover:underline', open ? 'text-ink' : 'text-muted')}>
                        {inc.title}
                      </Link>
                      }
                    <p className="mt-0.5 text-2xs text-faint">{TYPE_META[inc.type].label}</p>
                    </div>
                  </div>
                </td>
                <td className={twMerge('whitespace-nowrap border-b border-line px-3', rowPad)}>
                  <SeverityBadge severity={inc.severity} />
                </td>
                <td className={twMerge('whitespace-nowrap border-b border-line px-3', rowPad)}>
                  <StatusBadge status={inc.status} />
                </td>
                {(people === 'reporter' || people === 'both') &&
                <td className={twMerge('whitespace-nowrap border-b border-line px-3 text-muted', rowPad)}>{inc.reporter?.name ?? '—'}</td>
                }
                {(people === 'assignee' || people === 'both') &&
                <td className={twMerge('whitespace-nowrap border-b border-line px-3', rowPad)}>
                    {inc.assignee ?
                  <span className="text-muted">{inc.assignee.name}</span> :
                  open ?
                  <span className="font-mono text-2xs text-high">Unassigned</span> :

                  <span className="text-faint">—</span>
                  }
                  </td>
                }
                <td className={twMerge('whitespace-nowrap border-b border-line px-3 text-right font-mono text-2xs text-muted', rowPad)}>
                  {relTime(inc.createdAt)}
                </td>
                {renderActions &&
                <td className={twMerge('whitespace-nowrap border-b border-line px-3 text-right', rowPad)} onClick={(e) => e.stopPropagation()}>
                    {renderActions(inc)}
                  </td>
                }
              </tr>);

          })}
        </tbody>
      </table>
    </div>);

}