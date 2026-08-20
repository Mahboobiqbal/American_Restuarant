import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/auth/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import MenuPage from './pages/menu/MenuPage';
import OrdersPage from './pages/orders/OrdersPage';
import CreateOrder from './pages/orders/CreateOrder';
import OrderDetail from './pages/orders/OrderDetail';
import TablesPage from './pages/tables/TablesPage';
import KitchenDisplay from './pages/kitchen/KitchenDisplay';
import InventoryPage from './pages/inventory/InventoryPage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import CustomersPage from './pages/customers/CustomersPage';
import ReservationsPage from './pages/reservations/ReservationsPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import UsersPage from './pages/users/UsersPage';

function ProtectedRoute({ children, roles }) {
  const { user, token } = useSelector((state) => state.auth);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={
          user?.role === 'kitchen' ? <KitchenDisplay /> : <Dashboard />
        } />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/new" element={<CreateOrder />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="tables" element={<TablesPage />} />
        <Route path="kitchen" element={<KitchenDisplay />} />
        <Route path="inventory" element={
          <ProtectedRoute roles={['admin', 'manager']}><InventoryPage /></ProtectedRoute>
        } />
        <Route path="suppliers" element={
          <ProtectedRoute roles={['admin', 'manager']}><SuppliersPage /></ProtectedRoute>
        } />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="reports" element={
          <ProtectedRoute roles={['admin', 'manager']}><ReportsPage /></ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute roles={['admin']}><SettingsPage /></ProtectedRoute>
        } />
        <Route path="users" element={
          <ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
