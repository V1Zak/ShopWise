import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { images } from '@/assets/imageAssets';

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [policyModal, setPolicyModal] = useState<'terms' | 'privacy' | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signUp, loginWithGoogle, loginWithApple, error, clearError } = useAuthStore();

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
      if (activeTab === 'signup') {
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
    try { await loginWithGoogle(); } catch { /* error in store */ }
  };

  const handleAppleLogin = async () => {
    try { await loginWithApple(); } catch { /* error in store */ }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      {/* Left: Food Hero */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between overflow-hidden">
        <img
          src={images.authHero}
          alt="Fresh vegetables"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {/* Logo */}
        <div className="relative z-20 p-12 flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/15 backdrop-blur-sm text-white">
            <span aria-hidden="true" className="material-symbols-outlined text-[28px]">nutrition</span>
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight">ShopWise</h2>
        </div>

        {/* Bottom content */}
        <div className="relative z-20 p-12 max-w-lg">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium mb-6">
            <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-primary">verified</span>
            Farm to Table Guarantee
          </div>

          <blockquote className="space-y-4">
            <p className="text-2xl font-medium leading-relaxed text-white">
              "The most efficient way to track market prices and manage household inventory. We've cut our waste by 30%."
            </p>
            <footer className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center">
                <span aria-hidden="true" className="material-symbols-outlined text-primary text-xl">person</span>
              </div>
              <div>
                <div className="font-semibold text-white">Alex Chen</div>
                <div className="text-sm text-white/70">Head Chef & Home Economist</div>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex w-full lg:w-1/2 xl:w-5/12 flex-col items-center justify-center px-6 py-12 lg:px-12 bg-bg">
        <div className="w-full max-w-[440px] flex flex-col gap-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-2 self-center">
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-3xl">nutrition</span>
            <h2 className="text-text text-xl font-bold">ShopWise</h2>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-text mb-2">
              {activeTab === 'signup' ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-text-muted">
              {activeTab === 'signup'
                ? 'Start tracking prices and optimizing your grocery spending today.'
                : 'Sign in to continue managing your groceries.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg bg-surface border border-border p-1">
            <button
              onClick={() => { setActiveTab('signin'); clearError(); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'signin'
                  ? 'bg-surface-active text-text shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); clearError(); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'signup'
                  ? 'bg-surface-active text-text shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Social Login */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogleLogin}
              className="relative flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-active focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button
              onClick={handleAppleLogin}
              className="relative flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-active focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-bg px-2 text-text-muted">Or continue with email</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
              <button onClick={clearError} className="ml-auto text-danger hover:text-danger/80">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-text" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-text" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={activeTab === 'signup' ? 'new-password' : 'current-password'}
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-10"
                  placeholder={activeTab === 'signup' ? 'Create a password' : 'Enter your password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              {activeTab === 'signup' && (
                <p className="text-xs text-text-muted mt-1">Must be at least 8 characters long.</p>
              )}
            </div>

            {/* Remember me / Forgot password */}
            {activeTab === 'signin' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary"
                  />
                  <span className="text-sm text-text-muted">Remember me</span>
                </label>
                <button type="button" className="text-sm text-primary hover:text-primary/80 font-medium">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-text-inv transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg shadow-[0_0_15px_rgba(var(--color-primary)/0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Please wait...' : activeTab === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Terms */}
          <p className="text-center text-sm text-text-muted">
            By clicking continue, you agree to our{' '}
            <button onClick={() => setPolicyModal('terms')} className="underline underline-offset-4 hover:text-primary transition-colors">Terms of Service</button>
            {' '}and{' '}
            <button onClick={() => setPolicyModal('privacy')} className="underline underline-offset-4 hover:text-primary transition-colors">Privacy Policy</button>.
          </p>
        </div>
      </div>

      {/* Policy Modal */}
      {policyModal && (
        <PolicyModal type={policyModal} onClose={() => setPolicyModal(null)} />
      )}
    </div>
  );
}

function PolicyModal({ type, onClose }: { type: 'terms' | 'privacy'; onClose: () => void }) {
  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy';
  const content = type === 'terms'
    ? 'By using ShopWise, you agree to use the service responsibly. We provide the platform "as is" without warranty. You retain ownership of your data and can delete your account at any time. We reserve the right to modify these terms with reasonable notice. For questions, contact us through the app.'
    : 'ShopWise collects only the data necessary to provide our service: your email, shopping lists, and product data. We do not sell your personal information to third parties. Your data is stored securely using industry-standard encryption. You can export or delete your data at any time from Settings. We use cookies only for authentication purposes.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-xl border border-border bg-bg shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold text-text">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-text-muted hover:bg-surface-active hover:text-text transition-colors">
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-text-muted leading-relaxed">{content}</p>
        </div>
        <div className="px-5 pb-5 flex justify-end">
          <button onClick={onClose} className="bg-primary hover:bg-primary/90 text-text-inv px-5 py-2 rounded-lg text-sm font-bold transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
