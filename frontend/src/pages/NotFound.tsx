import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLE_HOME } from '../utils/roles';
import { BrandMark } from '../components/layout/BrandMark';

export function NotFoundPage() {
  const { user } = useAuth();
  return (
    <main className="relative flex min-h-screen w-full flex-col bg-base px-6 py-8 text-ink sm:px-10">
      <div className="absolute inset-0 hairline-grid opacity-40" aria-hidden />
      <BrandMark className="relative" />
      <div className="relative m-auto max-w-lg text-center">
        <p className="font-mono text-sm text-accent">404 · route not resolved</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">This page isn’t on the map.</h1>
        <p className="mt-3 text-muted">The address may be mistyped, or the resource was moved. Nothing has been logged against your session.</p>
        <Link
          to={user ? ROLE_HOME[user.role] : '/login'}
          className="mt-8 inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-accent-ink transition-transform duration-150 ease-out active:scale-[0.97]">
          
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          {user ? 'Back to command center' : 'Go to sign in'}
        </Link>
      </div>
    </main>);

}