'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Infinity, LoaderCircle, LockKeyhole, Mail, Router, ShieldCheck, Signal } from 'lucide-react';

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100';

const primaryButtonClass =
  'flex w-full items-center justify-center gap-2 rounded-lg bg-[#173b72] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#102d58] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none';

const secondaryButtonClass =
  'w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70';

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
    <main className="min-h-screen bg-[#edf4fb] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#0d2341] px-10 py-10 pl-25 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="relative z-10">
            <div className="flex items-center text-4xl font-semibold tracking-normal">
              <span>Telec</span>
              <Infinity className="mx-0.5 mt-2 text-red-400" size={50} strokeWidth={2.5} />
              <span>p</span>
            </div>
            <p className="mt-3 max-w-md text-sm leading-6 text-sky-100">
              Secure access for subscriber accounts, billing operations, plans, payments, and network port assignments.
            </p>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-8 grid grid-cols-3 gap-3">
              {[
                { label: 'Clients', value: 'Live' },
                { label: 'Billing', value: 'Synced' },
                { label: 'Network', value: 'Tracked' },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-white/10 bg-white/8 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.14em] text-sky-200">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold tracking-normal">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-400/20 text-sky-100">
                  <Router size={22} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Operations console</p>
                  <p className="text-xs text-sky-100">Account verification required</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-sky-50">
                <div className="flex items-center gap-3">
                  <Signal size={18} className="text-emerald-300" />
                  <span>Monitor active and inactive connections</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-emerald-300" />
                  <span>OTP protected admin sessions</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-[440px]">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center text-4xl font-semibold tracking-normal text-[#173b72]">
                <span>Telec</span>
                <Infinity className="mx-0.5 mt-2 text-red-500" size={34} strokeWidth={2.5} />
                <span>p</span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-8">
              <div className="mb-7">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-[#173b72]">
                  <LockKeyhole size={24} />
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">Admin Dashboard</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
                  {step === 'forgot' ? 'Reset password' : step === 'otp' ? 'Verify your sign-in' : 'Welcome back'}
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {step === 'forgot'
                    ? 'Use your admin email to receive a reset code.'
                    : step === 'otp'
                      ? 'Enter the verification code sent to your email.'
                      : 'Sign in to manage clients, invoices, payments, plans, and ports.'}
                </p>
              </div>

              {error && (
                <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}
              {message && (
                <p className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </p>
              )}

              {step === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        id="email"
                        type="email"
                        placeholder="admin@telecoop.com"
                        className={`${inputClass} pl-11`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={goToForgotPassword}
                        className="text-sm font-semibold text-sky-700 transition hover:text-[#173b72]"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className={`${inputClass} pl-11`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className={primaryButtonClass}>
                    {loading && <LoaderCircle size={18} className="animate-spin" />}
                    {loading ? 'Sending OTP...' : 'Continue'}
                  </button>
                </form>
              ) : step === 'otp' ? (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <p className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-600">
                    OTP sent to <strong className="text-slate-950">{email}</strong>
                  </p>

                  <div>
                    <label htmlFor="otp" className="mb-2 block text-sm font-semibold text-slate-700">
                      Verification code
                    </label>
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      placeholder="000000"
                      className={`${inputClass} text-center tracking-[0.3em]`}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" disabled={loading} className={primaryButtonClass}>
                    {loading && <LoaderCircle size={18} className="animate-spin" />}
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <button type="button" onClick={goToLogin} className={secondaryButtonClass}>
                    Back to login
                  </button>
                </form>
              ) : (
                <form onSubmit={resetRequested ? handleResetPassword : handleForgotPasswordRequest} className="space-y-4">
                  <div>
                    <label htmlFor="reset-email" className="mb-2 block text-sm font-semibold text-slate-700">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        id="reset-email"
                        type="email"
                        placeholder="admin@telecoop.com"
                        className={`${inputClass} pl-11`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {resetRequested && (
                    <>
                      <div>
                        <label htmlFor="reset-code" className="mb-2 block text-sm font-semibold text-slate-700">
                          Reset code
                        </label>
                        <input
                          id="reset-code"
                          type="text"
                          inputMode="numeric"
                          placeholder="000000"
                          className={`${inputClass} text-center tracking-[0.3em]`}
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-slate-700">
                          New password
                        </label>
                        <input
                          id="new-password"
                          type="password"
                          placeholder="At least 8 characters"
                          className={inputClass}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-slate-700">
                          Confirm new password
                        </label>
                        <input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm new password"
                          className={inputClass}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}

                  <button type="submit" disabled={loading} className={primaryButtonClass}>
                    {loading && <LoaderCircle size={18} className="animate-spin" />}
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
                      className={secondaryButtonClass}
                    >
                      Resend code
                    </button>
                  )}

                  <button type="button" onClick={goToLogin} className={secondaryButtonClass}>
                    Back to login
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
