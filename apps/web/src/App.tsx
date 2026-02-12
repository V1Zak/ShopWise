import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { ActiveShoppingListPage } from './pages/ActiveShoppingListPage';
import { ItemCatalogPage } from './pages/ItemCatalogPage';
import { ShoppingHistoryPage } from './pages/ShoppingHistoryPage';
import { SpendingAnalyticsPage } from './pages/SpendingAnalyticsPage';
import { PostShopBriefingPage } from './pages/PostShopBriefingPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAuthStore } from './store/auth-store';

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/list/:id" element={<ActiveShoppingListPage />} />
            <Route path="/catalog" element={<ItemCatalogPage />} />
            <Route path="/history" element={<ShoppingHistoryPage />} />
            <Route path="/analytics" element={<SpendingAnalyticsPage />} />
            <Route path="/briefing/:id" element={<PostShopBriefingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
