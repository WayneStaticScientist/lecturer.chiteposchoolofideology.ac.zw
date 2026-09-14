'use client';

import React, { useState } from 'react';
import { loginUser } from '../../services/api';
import { useRouter } from 'next/navigation';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser({ email, password });

      // Verify the user is a lecturer from the login response
      if (res.user?.role !== 'lecturer') {
        setError('Access denied. This portal is for lecturers only.');
        setLoading(false);
        return;
      }

      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-primary -z-10 rounded-b-[40%]" />

      <div className="w-full max-w-md shadow-2xl p-8 bg-white rounded-3xl border border-gray-100">
        <div className="flex flex-col gap-4 pb-6 items-center text-center">
          <img
            src="/android-chrome-512x512.png"
            alt="Logo"
            className="w-20 h-20 object-contain drop-shadow-md"
          />
          <div>
            <h2 className="text-3xl font-bold text-primary">
              Lecturer Portal
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Sign in with your lecturer credentials.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-5 border border-red-100">
            <AlertCircle size={18} className="flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="lecturer@example.com"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 py-3 px-6 rounded-xl font-bold text-white bg-primary shadow-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={20} className="animate-spin" /> Signing in...</>
            ) : (
              <><LogIn size={20} /> Sign In</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
