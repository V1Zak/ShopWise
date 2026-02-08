import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signUp, loginWithGoogle, loginWithApple, error, clearError } = useAuthStore();

  // Handle OAuth error params in URL (e.g. ?error=access_denied&error_description=...)
  useEffect(() => {
    const errorParam = searchParams.get('error_description') || searchParams.get('error');
    if (errorParam) {
      useAuthStore.setState({ error: decodeURIComponent(errorParam) });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch {
      // error is set in the store
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch {
      // error is set in the store
    }
  };

  const handleAppleLogin = async () => {
    try {
      await loginWithApple();
    } catch {
      // error is set in the store
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-hidden">
      {/* Left Side: Visual Hero */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between p-12 bg-surface-dark overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-background-dark/90 via-background-dark/40 to-transparent" />

        {/* Logo */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20 backdrop-blur-sm text-primary">
            <span className="material-symbols-outlined text-[28px]">nutrition</span>
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight">ShopWise</h2>
        </div>

        {/* Testimonial */}
        <div className="relative z-20 max-w-lg">
          <blockquote className="space-y-4">
            <p className="text-2xl font-medium leading-relaxed text-white">
              "The most efficient way to track market prices and manage household inventory. We've cut our waste by 30%."
            </p>
            <footer className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">person</span>
              </div>
              <div>
                <div className="font-semibold text-white">Alex Chen</div>
                <div className="text-sm text-gray-400">Head Chef & Home Economist</div>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex w-full lg:w-1/2 xl:w-5/12 flex-col items-center justify-center px-6 py-12 lg:px-12 bg-background-dark">
        <div className="w-full max-w-[440px] flex flex-col gap-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-4 self-center">
            <span className="material-symbols-outlined text-primary text-3xl">nutrition</span>
            <h2 className="text-white text-xl font-bold">ShopWise</h2>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-slate-400">
              {isSignUp
                ? 'Start tracking prices and optimizing your grocery spending today.'
                : 'Sign in to continue managing your groceries.'}
            </p>
          </div>

          {/* Social Login */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogleLogin}
              className="relative flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-700 bg-surface-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-green focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark"
            >
              <span className="material-symbols-outlined text-[20px]">public</span>
              Continue with Google
            </button>
            <button
              onClick={handleAppleLogin}
              className="relative flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-700 bg-surface-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-green focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark"
            >
              <span className="material-symbols-outlined text-[20px]">smartphone</span>
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background-dark px-2 text-slate-400">Or continue with email</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
              <button onClick={clearError} className="ml-auto text-red-400 hover:text-red-300">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-white" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-slate-600 bg-surface-dark px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-white" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-slate-600 bg-surface-dark px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-10"
                  placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-slate-400 mt-1">Must be at least 8 characters long.</p>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background-dark transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark shadow-[0_0_15px_rgba(19,236,128,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Terms */}
          <p className="text-center text-sm text-slate-400">
            By clicking continue, you agree to our{' '}
            <a className="underline underline-offset-4 hover:text-primary transition-colors" href="#">Terms of Service</a>
            {' '}and{' '}
            <a className="underline underline-offset-4 hover:text-primary transition-colors" href="#">Privacy Policy</a>.
          </p>

          {/* Toggle */}
          <div className="text-center text-sm">
            <span className="text-slate-300">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-semibold text-primary hover:text-primary/80 ml-1"
            >
              {isSignUp ? 'Sign in' : 'Create account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
