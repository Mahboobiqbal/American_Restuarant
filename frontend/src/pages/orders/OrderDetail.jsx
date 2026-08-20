import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  ChevronRight,
  AlertTriangle,
  Printer
} from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI, paymentAPI } from '../../services/api';
import { orderStatusColors } from '../../utils/helpers';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await orderAPI.getOne(id);
      setOrder(data);
    } catch (error) {
      toast.error('Failed to load order');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await orderAPI.updateStatus(id, { status: newStatus });
      setOrder({ ...order, status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      setUpdating(true);
      await orderAPI.cancel(id);
      setOrder({ ...order, status: 'cancelled' });
      toast.success('Order cancelled');
    } catch (error) {
      toast.error('Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  const processPayment = async () => {
    try {
      setUpdating(true);
      await paymentAPI.process({
        orderId: id,
        amount: order.total,
        method: paymentMethod
      });
      setOrder({ ...order, paymentStatus: 'paid', paymentMethod });
      setShowPaymentModal(false);
      toast.success('Payment processed successfully');
    } catch (error) {
      toast.error('Failed to process payment');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusActions = () => {
    const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'];
    const currentIndex = statusFlow.indexOf(order?.status);
    const actions = [];

    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];
      const labels = {
        confirmed: 'Confirm Order',
        preparing: 'Start Preparing',
        ready: 'Mark Ready',
        served: 'Mark Served',
        completed: 'Complete Order'
      };
      actions.push({ status: nextStatus, label: labels[nextStatus] });
    }

    return actions;
  };

  const getStatusBadge = (status) => {
    const colors = orderStatusColors[status] || 'bg-gray-100 text-gray-700';
    return `px-3 py-1 rounded-full text-sm font-medium ${colors}`;
  };

  const getPaymentBadge = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700'
    };
    return `px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Loading order...</p>
      </div>
    );
  }

  if (!order) return null;

  const statusActions = getStatusActions();

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
          <p className="text-gray-500 mt-1">
            {order.orderType} order • {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={getStatusBadge(order.status)}>{order.status}</span>
          <span className={getPaymentBadge(order.paymentStatus)}>{order.paymentStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-3">Order Items</h2>
            <div className="divide-y divide-gray-200">
              {order.items?.map((item, index) => (
                <div key={index} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      {item.specialInstructions && (
                        <div className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          {item.specialInstructions}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900 font-medium">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold mb-2">Order Notes</h2>
              <p className="text-gray-600">{order.notes}</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-3">Order Progress</h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'].map((status, index) => (
                <div key={status} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      order.status === status
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'].indexOf(order.status) > index
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'].indexOf(order.status) > index ? (
                      <CheckCircle size={14} />
                    ) : (
                      <Clock size={14} />
                    )}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                  {index < 5 && <ChevronRight size={14} className="text-gray-300 mx-1" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span>${order.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Service (5%)</span>
                <span>${order.serviceCharge?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
                <span>Total</span>
                <span>${order.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-3">Payment</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className={getPaymentBadge(order.paymentStatus)}>{order.paymentStatus}</span>
              </div>
              {order.paymentStatus !== 'paid' && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CreditCard size={18} />
                  Process Payment
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-3">Actions</h2>
            <div className="space-y-2">
              {statusActions.map((action) => (
                <button
                  key={action.status}
                  onClick={() => updateStatus(action.status)}
                  disabled={updating}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                >
                  {action.label}
                </button>
              ))}
              {order.status !== 'cancelled' && order.status !== 'completed' && (
                <button
                  onClick={cancelOrder}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors"
                >
                  <XCircle size={18} />
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Process Payment</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {['cash', 'card'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        paymentMethod === method
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600">Amount to pay</div>
                <div className="text-2xl font-bold text-gray-900">${order.total?.toFixed(2)}</div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  disabled={updating}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                >
                  {updating ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
