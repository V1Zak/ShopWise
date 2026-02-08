import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPage } from '@/pages/SettingsPage';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  avatarUrl: undefined,
  createdAt: '2026-01-01',
};

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/store/auth-store', () => ({
  useAuthStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) => {
      const state = {
        user: mockUser,
        logout: mockLogout,
      };
      return selector(state);
    },
    { setState: vi.fn() },
  ),
}));

vi.mock('@/lib/supabase', () => {
  const mockEq = vi.fn().mockResolvedValue({ error: null });
  return {
    supabase: {
      from: () => ({
        update: vi.fn().mockReturnValue({ eq: mockEq }),
        delete: vi.fn().mockReturnValue({ eq: mockEq }),
      }),
      storage: {
        from: () => ({
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://storage.test/avatar.jpg' } }),
        }),
      },
      auth: {
        updateUser: vi.fn().mockResolvedValue({ error: null }),
      },
    },
  };
});

function renderSettings() {
  return render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>,
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays user profile info', () => {
    renderSettings();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('displays initials when no avatar', () => {
    renderSettings();
    expect(screen.getByText('TU')).toBeInTheDocument();
  });

  it('renders Save Changes button as enabled', () => {
    renderSettings();
    const saveBtn = screen.getByText('Save Changes');
    expect(saveBtn).not.toBeDisabled();
  });

  it('renders Change Password button as enabled', () => {
    renderSettings();
    const updateBtn = screen.getByRole('button', { name: /Update/i });
    expect(updateBtn).not.toBeDisabled();
  });

  it('opens Change Password modal on click', () => {
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: /Update/i }));
    // Modal title is an h2; the section label is a p — both say "Change Password"
    const headings = screen.getAllByText('Change Password');
    expect(headings.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByPlaceholderText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repeat your password')).toBeInTheDocument();
  });

  it('validates short password in Change Password modal', async () => {
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: /Update/i }));
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'short' } });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { target: { value: 'short' } });
    fireEvent.click(screen.getByText('Update Password'));
    expect(await screen.findByText('Password must be at least 8 characters.')).toBeInTheDocument();
  });

  it('validates mismatched passwords', async () => {
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: /Update/i }));
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { target: { value: 'different123' } });
    fireEvent.click(screen.getByText('Update Password'));
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('closes Change Password modal with Cancel', () => {
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: /Update/i }));
    expect(screen.getByPlaceholderText('At least 8 characters')).toBeInTheDocument();
    const cancelButtons = screen.getAllByText('Cancel');
    fireEvent.click(cancelButtons[cancelButtons.length - 1]);
    expect(screen.queryByPlaceholderText('At least 8 characters')).not.toBeInTheDocument();
  });

  it('shows delete confirmation flow', () => {
    renderSettings();
    const deleteBtn = screen.getByText('Delete');
    fireEvent.click(deleteBtn);
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('can cancel delete confirmation', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Delete'));
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
  });

  it('renders Sign Out button', () => {
    renderSettings();
    // "Sign Out" appears as both a label <p> and a <button>
    const signOutButton = screen.getByRole('button', { name: /Sign Out/i });
    expect(signOutButton).toBeInTheDocument();
  });

  it('handles sign out', async () => {
    renderSettings();
    const signOutButton = screen.getByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutButton);
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });
  });

  it('renders notification toggles', () => {
    renderSettings();
    expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    expect(screen.getByText('Weekly Email Digest')).toBeInTheDocument();
    expect(screen.getByText('Price Alerts')).toBeInTheDocument();
    expect(screen.getByText('List Reminders')).toBeInTheDocument();
  });

  it('renders currency selector', () => {
    renderSettings();
    expect(screen.getByDisplayValue('USD ($)')).toBeInTheDocument();
  });

  it('has a hidden file input for avatar upload', () => {
    renderSettings();
    const fileInput = document.querySelector('input[type="file"][accept="image/*"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveClass('hidden');
  });
});
