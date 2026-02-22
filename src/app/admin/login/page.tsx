'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        router.replace('/admin/dashboard');
        return;
      }
      setChecking(false);
    }
    checkSession();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-light-espresso/70 text-lg">Loading...</div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/admin/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">&#127864;</span>
          <h1 className="text-3xl font-bold text-dark-espresso">Admin Login</h1>
          <p className="text-light-espresso mt-2">Sign in to manage your reviews</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 shadow-md border border-ivory-mist-dark"
        >
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-espresso mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-ivory-mist-dark focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent text-dark-espresso placeholder-light-espresso/40"
              placeholder="admin@siphappens.com"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-espresso mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-ivory-mist-dark focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent text-dark-espresso placeholder-light-espresso/40"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-espresso text-ivory-mist font-semibold rounded-xl hover:bg-dark-espresso transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
