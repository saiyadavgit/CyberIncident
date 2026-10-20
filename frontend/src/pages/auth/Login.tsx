import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowRightIcon, EyeIcon, EyeOffIcon, AlertOctagonIcon } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/api';
import { ROLE_HOME, ROLE_LABEL } from '../../utils/roles';
import type { Role } from '../../types/auth';

const DEMO_ACCOUNTS: {identifier: string;role: Role;name: string;}[] = [
{ identifier: 'mchen', role: 'ANALYST', name: 'Maya Chen' },
{ identifier: 'dokafor', role: 'ADMIN', name: 'Daniel Okafor' },
{ identifier: 'lferreira', role: 'EMPLOYEE', name: 'Lucas Ferreira' }];


export function LoginPage() {
  const { login, demoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {from?: string;registered?: boolean;identifier?: string;} | null;
  const [identifier, setIdentifier] = useState(state?.identifier ?? '');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useLayoutEffect(() => {
    if (!formRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-field]', { opacity: 0, y: 12, duration: 0.8, stagger: 0.06, ease: 'expo.out', delay: 0.35 });
    }, formRef);
    return () => ctx.revert();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Enter your username or email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await login({ identifier, password });
      const from = state?.from && state.from !== '/login' ? state.from : ROLE_HOME[user.role];
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Sign-in failed.'));
      setLoading(false);
    }
  };

  return (
    <AuthLayout scene>
      <form ref={formRef} onSubmit={submit} noValidate className="space-y-6">
        <div data-field>
          <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="mt-1.5 text-sm text-muted">Access is scoped to your role. All sessions are audited.</p>
        </div>

        {state?.registered && !error &&
        <p data-field className="rounded-md border border-ok/30 bg-ok/[0.06] px-3 py-2 text-sm text-ok">
            Account created. Sign in to continue.
          </p>
        }

        {error &&
        <div role="alert" className="flex items-start gap-2.5 rounded-md border border-crit/40 bg-crit/[0.07] px-3 py-2.5 text-sm text-ink">
            <AlertOctagonIcon className="mt-0.5 h-4 w-4 shrink-0 text-crit" aria-hidden />
            {error}
          </div>
        }

        <div data-field>
          <TextField
            label="Username or email"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoFocus />
          
        </div>
        <div data-field>
          <TextField
            label="Password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            trailing={
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Hide password' : 'Show password'}
              className="rounded p-2 text-faint hover:text-ink">
              
                {show ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            } />
          
        </div>

        <div data-field>
          <Button type="submit" variant="primary" loading={loading} className="h-11 w-full">
            Sign in
            {!loading && <ArrowRightIcon className="h-4 w-4" aria-hidden />}
          </Button>
          <p className="mt-4 text-center text-sm text-muted">
            New to Bastion?{' '}
            <Link to="/register" className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-accent">
              Create an account
            </Link>
          </p>
        </div>

        {demoMode &&
        <div data-field className="border-t border-line pt-5">
            <p className="text-xs text-faint">Demo environment — pick an account, any password works.</p>
            <ul className="mt-3 divide-y divide-line rounded-md border border-line">
              {DEMO_ACCOUNTS.map((a) =>
            <li key={a.identifier}>
                  <button
                type="button"
                onClick={() => {
                  setIdentifier(a.identifier);
                  setPassword('demo-password');
                  setError(null);
                }}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors duration-150 ease-out hover:bg-raised">
                
                    <span className="text-ink">{a.name}</span>
                    <span className="font-mono text-2xs text-muted">{ROLE_LABEL[a.role]}</span>
                  </button>
                </li>
            )}
            </ul>
          </div>
        }
      </form>
    </AuthLayout>);

}