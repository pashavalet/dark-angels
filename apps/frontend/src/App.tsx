import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './components/layout/AppLayout.js';
import ProtectedRoute from './components/auth/ProtectedRoute.js';
import HomePage from './pages/Home/HomePage.js';
import ToursPage from './pages/Tours/ToursPage.js';
import TourDetailPage from './pages/Tours/TourDetailPage.js';
import ServicesPage from './pages/Services/ServicesPage.js';
import ServiceDetailPage from './pages/Services/ServiceDetailPage.js';
import BlogPage from './pages/Blog/BlogPage.js';
import BlogDetailPage from './pages/Blog/BlogDetailPage.js';
import ContactsPage from './pages/Contacts/ContactsPage.js';
import LoginPage from './pages/Admin/LoginPage.js';
import DashboardPage from './pages/Admin/DashboardPage.js';
import StatsPage from './pages/Admin/StatsPage.js';
import TwoFactorPage from './pages/Admin/TwoFactorPage.js';
import CollectionsPage from './pages/Admin/CollectionsPage.js';
import SettingsPage from './pages/Admin/SettingsPage.js';
import TourAdminListPage from './pages/Admin/TourAdminListPage.js';
import TourEditPage from './pages/Admin/TourEditPage.js';
import ServiceAdminListPage from './pages/Admin/ServiceAdminListPage.js';
import ServiceEditPage from './pages/Admin/ServiceEditPage.js';
import BlogAdminListPage from './pages/Admin/BlogAdminListPage.js';
import BlogEditPage from './pages/Admin/BlogEditPage.js';
import TelegramUsersAdminPage from './pages/Admin/TelegramUsersAdminPage.js';
import TelegramUserPortraitPage from './pages/Admin/TelegramUserPortraitPage.js';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="tours" element={<ToursPage />} />
            <Route path="tours/:id" element={<TourDetailPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/:id" element={<ServiceDetailPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:id" element={<BlogDetailPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="admin/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="admin" element={<DashboardPage />} />
              <Route path="admin/stats" element={<StatsPage />} />
              <Route path="admin/two-factor" element={<TwoFactorPage />} />
              <Route path="admin/collections" element={<CollectionsPage />} />
              <Route path="admin/settings" element={<SettingsPage />} />
              <Route path="admin/tours" element={<TourAdminListPage />} />
              <Route path="admin/tours/new" element={<TourEditPage />} />
              <Route path="admin/tours/:id" element={<TourEditPage />} />
              <Route path="admin/services" element={<ServiceAdminListPage />} />
              <Route path="admin/services/new" element={<ServiceEditPage />} />
              <Route path="admin/services/:id" element={<ServiceEditPage />} />
              <Route path="admin/blog" element={<BlogAdminListPage />} />
              <Route path="admin/blog/new" element={<BlogEditPage />} />
              <Route path="admin/blog/:id" element={<BlogEditPage />} />
              <Route path="admin/telegram-users" element={<TelegramUsersAdminPage />} />
              <Route path="admin/telegram-users/:telegramId" element={<TelegramUserPortraitPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
