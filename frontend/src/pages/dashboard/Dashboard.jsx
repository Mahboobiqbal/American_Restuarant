import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { formatCurrency, orderStatusColors } from '../../utils/helpers';
import {
  TrendingUp, ShoppingCart, Clock, CheckCircle, AlertTriangle,
  ArrowUpRight, UtensilsCrossed, DollarSign
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await orderAPI.getDashboard();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stats) return <div className="text-center text-surface-500 py-8">Failed to load dashboard</div>;

  const statCards = [
    { label: "Today's Revenue", value: formatCurrency(stats.today.revenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: "Today's Orders", value: stats.today.orders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Orders', value: stats.today.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Completed Orders', value: stats.today.completed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Monthly Revenue', value: formatCurrency(stats.monthly.revenue), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Monthly Orders', value: stats.monthly.orders, icon: UtensilsCrossed, color: 'text-brand-600', bg: 'bg-brand-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name}. Here's today's overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">{card.label}</p>
                <p className="text-2xl font-bold text-surface-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Items */}
        <div className="card">
          <div className="px-5 py-4 border-b border-surface-100">
            <h3 className="text-sm font-semibold text-surface-900">Popular Items This Month</h3>
          </div>
          <div className="p-5">
            {stats.popularItems.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-3">
                {stats.popularItems.map((item, i) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-surface-400 w-5">{i + 1}</span>
                      <span className="text-sm font-medium text-surface-900">{item._id}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-surface-500">{item.count} orders</span>
                      <span className="font-medium text-surface-900">{formatCurrency(item.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="card">
          <div className="px-5 py-4 border-b border-surface-100">
            <h3 className="text-sm font-semibold text-surface-900">Today's Order Status</h3>
          </div>
          <div className="p-5">
            {stats.statusBreakdown.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-4">No orders today</p>
            ) : (
              <div className="space-y-3">
                {stats.statusBreakdown.map((s) => (
                  <div key={s._id} className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${orderStatusColors[s._id] || 'bg-gray-100 text-gray-700'}`}>
                      {s._id}
                    </span>
                    <span className="text-sm font-semibold text-surface-900">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Low Stock Alerts */}
        <div className="card">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-900">Low Stock Alerts</h3>
            {stats.lowStockItems.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-amber-600">
                <AlertTriangle className="w-3 h-3" />
                {stats.lowStockItems.length} items
              </span>
            )}
          </div>
          <div className="p-5">
            {stats.lowStockItems.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-4">All items are well stocked</p>
            ) : (
              <div className="space-y-2">
                {stats.lowStockItems.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-surface-900">{item.name}</p>
                      <p className="text-xs text-surface-500">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">{item.quantity} {item.unit}</p>
                      <p className="text-xs text-surface-400">Min: {item.minQuantity}</p>
                    </div>
                  </div>
                ))}
                {stats.lowStockItems.length > 5 && (
                  <Link to="/inventory" className="block text-center text-xs text-brand-600 hover:text-brand-700 pt-2">
                    View all {stats.lowStockItems.length} items
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
