import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { getSocket } from '../../utils/socket';
import { formatElapsedTime, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  Clock,
  AlertTriangle,
  ChevronRight,
  ChefHat,
  Flame,
  CheckCircle2,
  RotateCcw,
  UtensilsCrossed,
  Timer,
  Bell,
  Star,
  User,
  Hash,
} from 'lucide-react';

const statusConfig = {
  new: {
    label: 'New',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-700',
    icon: Bell,
  },
  preparing: {
    label: 'Preparing',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-700',
    icon: ChefHat,
  },
  ready: {
    label: 'Ready',
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    borderColor: 'border-green-500',
    textColor: 'text-green-700',
    icon: CheckCircle2,
  },
};

const priorityConfig = {
  high: { label: 'URGENT', color: 'bg-red-500 text-white', textColor: 'text-red-600', bgColor: 'bg-red-50' },
  medium: { label: 'MEDIUM', color: 'bg-amber-500 text-white', textColor: 'text-amber-600', bgColor: 'bg-amber-50' },
  low: { label: 'LOW', color: 'bg-gray-400 text-white', textColor: 'text-gray-600', bgColor: 'bg-gray-50' },
};

function KitchenDisplay() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState({ new: [], preparing: [], ready: [] });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const fetchOrders = useCallback(async () => {
    try {
      const response = await orderAPI.getKitchen();
      const data = response.data || response;
      setOrders({
        new: data.new || data.pending || [],
        preparing: data.preparing || [],
        ready: data.ready || [],
      });
    } catch (error) {
      toast.error('Failed to fetch kitchen orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const socket = getSocket();

    if (socket) {
      socket.on('new-order', () => {
        fetchOrders();
        toast.success('New order received!', { icon: '🔔' });
      });

      socket.on('order-status-change', () => {
        fetchOrders();
      });

      return () => {
        socket.off('new-order');
        socket.off('order-status-change');
      };
    }
  }, [fetchOrders]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const advanceOrder = async (orderId, currentStatus) => {
    const nextStatus = {
      new: 'preparing',
      preparing: 'ready',
      ready: 'served',
    };

    const status = nextStatus[currentStatus];
    if (!status) return;

    try {
      await orderAPI.updateStatus(orderId, { status });
      toast.success(`Order moved to ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getUrgencyClass = (order) => {
    if (order.priority === 'high') return 'ring-2 ring-red-500 animate-pulse';
    if (order.estimatedTime && currentTime - new Date(order.createdAt).getTime() > order.estimatedTime * 60 * 1000) {
      return 'ring-2 ring-orange-500';
    }
    return '';
  };

  const OrderCard = ({ order, status }) => {
    const config = statusConfig[status];
    const priority = priorityConfig[order.priority] || priorityConfig.low;
    const createdTime = new Date(order.createdAt).getTime();
    const elapsed = Math.floor((currentTime - createdTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const Icon = config.icon;

    return (
      <div className={`bg-white rounded-xl border-l-4 ${config.borderColor} shadow-md p-4 mb-3 transition-all hover:shadow-lg ${getUrgencyClass(order)}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center`}>
              <Icon size={16} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Hash size={14} className="text-gray-400" />
                <span className="font-bold text-gray-900">#{order.orderNumber || order._id?.slice(-6)}</span>
              </div>
              <span className="text-xs text-gray-500">{order.orderType || 'Dine-in'}</span>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priority.color}`}>
            {priority.label}
          </span>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <User size={12} className="text-gray-400" />
            <span className="text-sm text-gray-600 font-medium">
              {order.customer?.name || order.customerName || `Table ${order.table?.tableNumber || order.tableNumber || 'N/A'}`}
            </span>
          </div>
          {order.table && (
            <span className="text-xs text-gray-500">Table {order.table.tableNumber}</span>
          )}
        </div>

        <div className="space-y-1.5 mb-3">
          {(order.items || []).slice(0, 4).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                  {item.quantity || item.qty}
                </span>
                <span className="text-gray-800 truncate max-w-[150px]">{item.name || item.item?.name}</span>
              </div>
              {item.notes && (
                <span className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                  {item.notes}
                </span>
              )}
            </div>
          ))}
          {(order.items || []).length > 4 && (
            <span className="text-xs text-gray-500">+{order.items.length - 4} more items</span>
          )}
        </div>

        {order.specialInstructions && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
            <div className="flex items-center gap-1 mb-1">
              <Flame size={12} className="text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">Special Instructions</span>
            </div>
            <p className="text-xs text-amber-800">{order.specialInstructions}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Timer size={14} className={minutes > 15 ? 'text-red-500' : 'text-gray-400'} />
            <span className={`text-sm font-medium ${minutes > 15 ? 'text-red-600' : 'text-gray-600'}`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
          {status !== 'ready' && (
            <button
              onClick={() => advanceOrder(order._id, status)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors ${
                status === 'new' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {status === 'new' ? 'Start Preparing' : 'Mark Ready'}
              <ChevronRight size={14} />
            </button>
          )}
          {status === 'ready' && (
            <button
              onClick={() => advanceOrder(order._id, status)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-green-500 hover:bg-green-600 transition-colors"
            >
              <CheckCircle2 size={14} />
              Served
            </button>
          )}
        </div>
      </div>
    );
  };

  const StatusColumn = ({ title, status, items }) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div className="flex-1 min-w-[300px]">
        <div className={`${config.lightColor} rounded-t-xl px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Icon size={18} className={config.textColor} />
            <h2 className={`font-bold text-lg ${config.textColor}`}>{title}</h2>
          </div>
          <span className={`${config.color} text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[28px] text-center`}>
            {items.length}
          </span>
        </div>
        <div className="bg-gray-50 rounded-b-xl p-3 min-h-[400px] max-h-[calc(100vh-280px)] overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <UtensilsCrossed size={32} className="mb-2" />
              <span className="text-sm">No orders</span>
            </div>
          ) : (
            items
              .sort((a, b) => {
                if (a.priority === 'high' && b.priority !== 'high') return -1;
                if (b.priority === 'high' && a.priority !== 'high') return 1;
                return new Date(a.createdAt) - new Date(b.createdAt);
              })
              .map((order) => (
                <OrderCard key={order._id} order={order} status={status} />
              ))
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading kitchen display...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <ChefHat size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Kitchen Display</h1>
              <p className="text-sm text-gray-500">Real-time order management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} />
              <span className="font-medium">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              <RotateCcw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex gap-6 overflow-x-auto pb-4">
          <StatusColumn title="New Orders" status="new" items={orders.new} />
          <StatusColumn title="Preparing" status="preparing" items={orders.preparing} />
          <StatusColumn title="Ready" status="ready" items={orders.ready} />
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500" />
            <span>Urgent orders pulse red</span>
          </div>
          <div className="flex items-center gap-2">
            <Star size={14} className="text-amber-500" />
            <span>High priority shown first</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KitchenDisplay;
