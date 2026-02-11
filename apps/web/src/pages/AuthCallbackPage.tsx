import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize().then(() => {
      navigate('/', { replace: true });
    });
  }, [initialize, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-text-muted text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}
