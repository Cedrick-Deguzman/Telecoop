'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Infinity } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Invalid email or password');
      return;
    }

    setStep('otp');
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || 'Invalid OTP');
      return;
    }

    const login = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (login?.error) {
      setError('Authentication failed');
    } else {
      window.location.href = '/dashboard';
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center text-5xl mb-4">
            <span className="text-indigo-900">Telec</span>
            <Infinity className="text-red-500 mt-3 scale-y-150" size={40} strokeWidth={2.5} />
            <span className="text-indigo-900">p</span>
          </div>
          <h2 className="text-2xl text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-600 mt-2">Sign in to manage your ISP</p>
        </div>

        {/* Login / OTP */}
        {step === 'login' ? (
          <form onSubmit={handleLogin}>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              className="w-full border p-2 mb-3 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              className="w-full border p-2 mb-4 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="w-full bg-indigo-600 text-white p-2 rounded">
              {loading ? 'Sending OTP...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <p className="text-sm text-gray-500 mb-2">
              OTP sent to <strong>{email}</strong>
            </p>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <input
              type="text"
              placeholder="6-digit OTP"
              className="w-full border p-2 mb-4 text-center tracking-widest rounded"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <button className="w-full bg-indigo-600 text-white p-2 rounded">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
