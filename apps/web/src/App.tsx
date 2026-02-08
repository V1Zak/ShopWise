import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ActiveShoppingListPage } from './pages/ActiveShoppingListPage';
import { ItemCatalogPage } from './pages/ItemCatalogPage';
import { ShoppingHistoryPage } from './pages/ShoppingHistoryPage';
import { SpendingAnalyticsPage } from './pages/SpendingAnalyticsPage';
import { PostShopBriefingPage } from './pages/PostShopBriefingPage';

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/list/:id" element={<ActiveShoppingListPage />} />
        <Route path="/catalog" element={<ItemCatalogPage />} />
        <Route path="/history" element={<ShoppingHistoryPage />} />
        <Route path="/analytics" element={<SpendingAnalyticsPage />} />
        <Route path="/briefing/:id" element={<PostShopBriefingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
