import { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/authSlice';
import { notificationAPI } from '../../services/api';
import { connectSocket, disconnectSocket } from '../../utils/socket';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingCart, ChefHat,
  Package, Truck, Users, BarChart3, Settings, LogOut,
  Bell, Menu, X, ClipboardList, UserCircle, CreditCard
} from 'lucide-react';

const allNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'staff'] },
  { path: '/orders', label: 'Orders', icon: ShoppingCart, roles: ['admin', 'manager', 'staff'] },
  { path: '/kitchen', label: 'Kitchen', icon: ChefHat, roles: ['admin', 'manager', 'kitchen'] },
  { path: '/menu', label: 'Menu', icon: UtensilsCrossed, roles: ['admin', 'manager', 'staff'] },
  { path: '/inventory', label: 'Inventory', icon: Package, roles: ['admin', 'manager'] },
  { path: '/suppliers', label: 'Suppliers', icon: Truck, roles: ['admin', 'manager'] },
  { path: '/customers', label: 'Customers', icon: Users, roles: ['admin', 'manager', 'staff'] },
  { path: '/payments', label: 'Payments', icon: CreditCard, roles: ['admin', 'manager'] },
  { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'manager'] },
  { path: '/users', label: 'Staff Management', icon: ClipboardList, roles: ['admin'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = allNavItems.filter(item => item.roles.includes(user?.role));

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationAPI.getAll({ limit: 10, isRead: 'false' });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const socket = connectSocket(user?.role);
    const onNewOrder = () => fetchNotifications();
    const onOrderChange = () => fetchNotifications();
    const onPayment = () => fetchNotifications();
    socket.on('new-order', onNewOrder);
    socket.on('order-status-change', onOrderChange);
    socket.on('payment-processed', onPayment);
    return () => {
      socket.off('new-order', onNewOrder);
      socket.off('order-status-change', onOrderChange);
      socket.off('payment-processed', onPayment);
    };
  }, [user?.role]);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      fetchNotifications();
    } catch (e) {}
  };

  return (
    <div className="flex h-screen bg-surface-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-200 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="flex items-center gap-3 px-5 h-16 border-b border-surface-200">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-surface-900">Kennedy Fried Chicken</h1>
            <p className="text-[10px] text-surface-400 uppercase tracking-wider">Point of Sale System</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1">
            <X className="w-5 h-5 text-surface-400" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'}`
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-surface-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-surface-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate">{user?.name}</p>
              <p className="text-xs text-surface-400 capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-surface-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-surface-500 hover:text-surface-700">
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-surface-900">
              {navItems.find(item => location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/'))?.label || 'Restaurant Atiq'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-surface-200 shadow-lg z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                      <h3 className="text-sm font-semibold text-surface-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-brand-600 hover:text-brand-700">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-center text-sm text-surface-400 py-8">No new notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n._id} className="px-4 py-3 border-b border-surface-50 hover:bg-surface-50">
                            <p className="text-sm font-medium text-surface-900">{n.title}</p>
                            <p className="text-xs text-surface-500 mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
