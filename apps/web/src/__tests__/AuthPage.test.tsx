import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthPage } from '@/pages/AuthPage';

// The AuthPage uses destructuring: const { login, signUp, ... } = useAuthStore()
// Zustand's useAuthStore(selector) and useAuthStore() both need to work
const mockStore = {
  login: vi.fn(),
  signUp: vi.fn(),
  loginWithGoogle: vi.fn(),
  loginWithApple: vi.fn(),
  error: null as string | null,
  clearError: vi.fn(),
};

vi.mock('@/store/auth-store', () => ({
  useAuthStore: Object.assign(
    (selector?: (s: typeof mockStore) => unknown) => {
      if (typeof selector === 'function') return selector(mockStore);
      return mockStore;
    },
    { setState: vi.fn(), getState: () => mockStore },
  ),
}));

function renderAuthPage() {
  return render(
    <MemoryRouter initialEntries={['/auth']}>
      <AuthPage />
    </MemoryRouter>,
  );
}

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.error = null;
  });

  it('renders create account form by default', () => {
    renderAuthPage();
    expect(screen.getByText('Create an account')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('toggles to sign in mode', () => {
    renderAuthPage();
    fireEvent.click(screen.getByText('Sign in'));
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('renders Terms of Service as a button, not a link', () => {
    renderAuthPage();
    const termsBtn = screen.getByText('Terms of Service');
    expect(termsBtn.tagName).toBe('BUTTON');
    expect(termsBtn).not.toHaveAttribute('href');
  });

  it('renders Privacy Policy as a button, not a link', () => {
    renderAuthPage();
    const privacyBtn = screen.getByText('Privacy Policy');
    expect(privacyBtn.tagName).toBe('BUTTON');
    expect(privacyBtn).not.toHaveAttribute('href');
  });

  it('opens Terms of Service modal on click', () => {
    renderAuthPage();
    fireEvent.click(screen.getByText('Terms of Service'));
    expect(screen.getByText(/By using ShopWise, you agree/)).toBeInTheDocument();
  });

  it('opens Privacy Policy modal on click', () => {
    renderAuthPage();
    fireEvent.click(screen.getByText('Privacy Policy'));
    expect(screen.getByText(/ShopWise collects only the data/)).toBeInTheDocument();
  });

  it('closes Terms modal with Close button', () => {
    renderAuthPage();
    fireEvent.click(screen.getByText('Terms of Service'));
    expect(screen.getByText(/By using ShopWise/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByText(/By using ShopWise, you agree/)).not.toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    renderAuthPage();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
  });

  it('renders social login buttons', () => {
    renderAuthPage();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByText('Continue with Apple')).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    renderAuthPage();
    const passwordInput = screen.getByPlaceholderText('Create a password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = passwordInput.parentElement?.querySelector('button');
    if (toggleBtn) {
      fireEvent.click(toggleBtn);
      expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});
