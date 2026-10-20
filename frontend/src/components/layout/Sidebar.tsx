import React from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOutIcon, XIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../../hooks/useAuth';
import { navGroups } from '../../data/navigation';
import { ROLE_LABEL } from '../../utils/roles';
import { BrandMark } from './BrandMark';
import { Avatar } from '../ui/Avatar';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function SidebarContent({ variant, onNavigate }: {variant: 'desktop' | 'mobile';onNavigate?: () => void;}) {
  const { user, logout } = useAuth();
  const groups = navGroups.
  map((g) => ({ ...g, items: g.items.filter((i) => user && i.roles.includes(user.role)) })).
  filter((g) => g.items.length);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-5">
        <BrandMark />
      </div>
      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 pb-6 pt-4">
        {groups.map((group) =>
        <div key={group.label} className="mb-6">
            <p className="mb-2 px-2 text-2xs font-medium text-faint">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) =>
            <li key={item.to}>
                  <NavLink
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                twMerge(
                  'relative flex h-9 items-center gap-3 rounded-md px-2.5 text-sm transition-colors duration-150 ease-out',
                  isActive ? 'bg-raised text-ink' : 'text-muted hover:bg-raised/60 hover:text-ink'
                )
                }>
                
                    {({ isActive }) =>
                <>
                        {isActive &&
                  <motion.span
                    layoutId={`nav-active-${variant}`}
                    className="absolute -left-3 top-1.5 h-6 w-[2px] rounded-full bg-accent"
                    transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }} />

                  }
                        <item.icon className={twMerge('h-4 w-4', isActive ? 'text-accent' : '')} aria-hidden />
                        <span className="truncate">{item.label}</span>
                      </>
                }
                  </NavLink>
                </li>
            )}
            </ul>
          </div>
        )}
      </nav>
      {user &&
      <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <Avatar name={user.fullName} className="h-8 w-8" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{user.fullName}</p>
              <p className="truncate font-mono text-2xs text-faint">{ROLE_LABEL[user.role]}</p>
            </div>
            <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
            className="rounded-md p-2 text-faint transition-colors duration-150 ease-out hover:bg-raised hover:text-ink">
            
              <LogOutIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      }
    </div>);

}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-line bg-surface lg:block">
        <SidebarContent variant="desktop" />
      </aside>
      <AnimatePresence>
        {open &&
        <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
            className="absolute inset-0 bg-base/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose} />
          
            <motion.aside
            className="absolute inset-y-0 left-0 w-[272px] border-r border-line bg-surface"
            initial={{ x: -272 }}
            animate={{ x: 0 }}
            exit={{ x: -272 }}
            transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}>
            
              <button type="button" onClick={onClose} aria-label="Close navigation" className="absolute right-3 top-3.5 rounded p-1.5 text-faint hover:text-ink">
                <XIcon className="h-4 w-4" />
              </button>
              <SidebarContent variant="mobile" onNavigate={onClose} />
            </motion.aside>
          </div>
        }
      </AnimatePresence>
    </>);

}