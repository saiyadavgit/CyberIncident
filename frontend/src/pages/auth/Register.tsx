import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertOctagonIcon } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/api';
import { ROLE_HOME } from '../../utils/roles';

interface FormState {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirm: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.fullName.trim()) e.fullName = 'Enter your full name.';
  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(f.username)) e.username = '3–32 characters: letters, numbers, . _ -';
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid work email.';
  if (f.password.length < 8) e.password = 'Use at least 8 characters.';
  if (f.confirm !== f.password) e.confirm = 'Passwords do not match.';
  return e;
}

function strength(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ fullName: '', username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...form, [k]: e.target.value };
    setForm(next);
    if (touched) setErrors(validate(next));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    setServerError(null);
    try {
      const res = await register({ fullName: form.fullName.trim(), username: form.username.trim(), email: form.email.trim(), password: form.password });
      if (res.signedIn && res.user) {
        navigate(ROLE_HOME[res.user.role], { replace: true });
      } else {
        toast.success('Account created');
        navigate('/login', { replace: true, state: { registered: true, identifier: form.username.trim() } });
      }
    } catch (err) {
      setServerError(getErrorMessage(err, 'Registration failed.'));
      setLoading(false);
    }
  };

  const s = strength(form.password);
  const strengthTone = ['bg-line-strong', 'bg-crit', 'bg-high', 'bg-med', 'bg-ok'][s];

  return (
    <AuthLayout scene={false}>
      <form onSubmit={submit} noValidate className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Create your account</h2>
          <p className="mt-1.5 text-sm text-muted">New accounts start with employee access. An administrator can grant analyst or admin roles.</p>
        </div>
        {serverError &&
        <div role="alert" className="flex items-start gap-2.5 rounded-md border border-crit/40 bg-crit/[0.07] px-3 py-2.5 text-sm text-ink">
            <AlertOctagonIcon className="mt-0.5 h-4 w-4 shrink-0 text-crit" aria-hidden />
            {serverError}
          </div>
        }
        <TextField label="Full name" autoComplete="name" value={form.fullName} onChange={set('fullName')} error={errors.fullName} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField label="Username" autoComplete="username" value={form.username} onChange={set('username')} error={errors.username} />
          <TextField label="Work email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        </div>
        <div>
          <TextField label="Password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} />
          <div className="mt-2 flex gap-1" aria-hidden>
            {[1, 2, 3, 4].map((n) =>
            <span key={n} className={`h-1 flex-1 rounded-full transition-colors duration-200 ease-out ${n <= s ? strengthTone : 'bg-line-strong'}`} />
            )}
          </div>
        </div>
        <TextField label="Confirm password" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Button type="submit" variant="primary" loading={loading} className="h-11 w-full">
          Create account
        </Button>
        <p className="text-center text-sm text-muted">
          Already have access?{' '}
          <Link to="/login" className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-accent">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>);

}