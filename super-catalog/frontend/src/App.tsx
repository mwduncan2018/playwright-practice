import { Route, Routes } from 'react-router';

import { Layout } from './components/Layout';
import { RequireAdmin } from './components/RequireAdmin';
import AccountPage from './pages/AccountPage';
import ActivityPage from './pages/ActivityPage';
import CategoriesPage from './pages/CategoriesPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ProductFormPage from './pages/ProductFormPage';
import ProductsPage from './pages/ProductsPage';
import SupplierDetailsPage from './pages/SupplierDetailsPage';
import SupplierFormPage from './pages/SupplierFormPage';
import SuppliersPage from './pages/SuppliersPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<RequireAdmin><ProductFormPage /></RequireAdmin>} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="products/:id/edit" element={<RequireAdmin><ProductFormPage /></RequireAdmin>} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="suppliers/new" element={<RequireAdmin><SupplierFormPage /></RequireAdmin>} />
        <Route path="suppliers/:id" element={<SupplierDetailsPage />} />
        <Route path="suppliers/:id/edit" element={<RequireAdmin><SupplierFormPage /></RequireAdmin>} />
        <Route path="activity" element={<RequireAdmin><ActivityPage /></RequireAdmin>} />
        <Route path="account" element={<AccountPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
