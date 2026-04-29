'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Infinity } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'login' | 'otp' | 'forgot'>('login');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetRequested, setResetRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function clearFeedback() {
    setError('');
    setMessage('');
  }

  function resetForgotPasswordState() {
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setResetRequested(false);
  }

  function goToLogin() {
    setStep('login');
    setOtp('');
    setLoading(false);
    resetForgotPasswordState();
    clearFeedback();
  }

  function goToForgotPassword() {
    setStep('forgot');
    setOtp('');
    setPassword('');
    setLoading(false);
    resetForgotPasswordState();
    clearFeedback();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    clearFeedback();

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
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
    clearFeedback();

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || 'Invalid OTP');
      return;
    }

    const login = await signIn('credentials', {
      email: email.trim(),
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

  async function handleForgotPasswordRequest(e: React.FormEvent) {
    e.preventDefault();
    await requestForgotPasswordCode();
  }

  async function requestForgotPasswordCode() {
    setLoading(true);
    clearFeedback();

    const res = await fetch('/api/auth/forgot-password/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Unable to send reset code');
      return;
    }

    setResetRequested(true);
    setMessage(data.message || 'If an account exists for this email, a reset code has been sent.');
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    clearFeedback();

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/auth/forgot-password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        code: resetCode.trim(),
        password: newPassword,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Unable to reset password');
      return;
    }

    setPassword('');
    resetForgotPasswordState();
    setStep('login');
    setMessage('Password reset successful. You can now sign in with your new password.');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center text-5xl mb-4">
            <span className="text-indigo-900">Telec</span>
            <Infinity className="text-red-500 mt-3 scale-y-150" size={40} strokeWidth={2.5} />
            <span className="text-indigo-900">p</span>
          </div>
          <h2 className="text-2xl text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-600 mt-2">Sign in to manage your ISP</p>
        </div>

        {step === 'login' ? (
          <form onSubmit={handleLogin}>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {message && <p className="text-green-600 text-sm mb-2">{message}</p>}

            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
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
              id="password"
              type="password"
              placeholder="Password"
              className="w-full border p-2 mb-3 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="mb-4 text-right">
              <button
                type="button"
                onClick={goToForgotPassword}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white p-2 rounded disabled:opacity-70"
            >
              {loading ? 'Sending OTP...' : 'Login'}
            </button>
          </form>
        ) : step === 'otp' ? (
          <form onSubmit={handleVerifyOtp}>
            <p className="text-sm text-gray-500 mb-2">
              OTP sent to <strong>{email}</strong>
            </p>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <label htmlFor="otp" className="sr-only">
              OTP
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder="6-digit OTP"
              className="w-full border p-2 mb-4 text-center tracking-widest rounded"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white p-2 rounded disabled:opacity-70"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={goToLogin}
              className="mt-3 w-full border border-indigo-200 text-indigo-700 p-2 rounded"
            >
              Back to login
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Reset your password</h3>
              <p className="text-sm text-gray-600 mt-1">
                Enter your admin email and we&apos;ll send you a 6-digit reset code.
              </p>
            </div>

            <form onSubmit={resetRequested ? handleResetPassword : handleForgotPasswordRequest}>
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              {message && <p className="text-green-600 text-sm mb-2">{message}</p>}

              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                placeholder="Email"
                className="w-full border p-2 mb-3 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {resetRequested && (
                <>
                  <label htmlFor="reset-code" className="block text-sm font-medium text-gray-700 mb-1">
                    Reset code
                  </label>
                  <input
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit code"
                    className="w-full border p-2 mb-3 rounded text-center tracking-[0.3em]"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                  />

                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    placeholder="At least 8 characters"
                    className="w-full border p-2 mb-3 rounded"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />

                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full border p-2 mb-4 rounded"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white p-2 rounded disabled:opacity-70"
              >
                {loading
                  ? resetRequested
                    ? 'Resetting password...'
                    : 'Sending reset code...'
                  : resetRequested
                    ? 'Reset password'
                    : 'Send reset code'}
              </button>

              {resetRequested && (
                <button
                  type="button"
                  onClick={() => void requestForgotPasswordCode()}
                  disabled={loading}
                  className="mt-3 w-full border border-indigo-200 text-indigo-700 p-2 rounded disabled:opacity-70"
                >
                  Resend code
                </button>
              )}

              <button
                type="button"
                onClick={goToLogin}
                className="mt-3 w-full border border-gray-200 text-gray-700 p-2 rounded"
              >
                Back to login
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
