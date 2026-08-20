import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Search, Plus, Minus, Trash2, ShoppingBag, User, Phone, MessageSquare, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { menuAPI, tableAPI, orderAPI, categoryAPI } from '../../services/api';

const TAX_RATE = 0.08;
const SERVICE_CHARGE_RATE = 0.05;

const CreateOrder = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [orderType, setOrderType] = useState('dine-in');
  const [selectedTable, setSelectedTable] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('normal');
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuData, tableData, catData] = await Promise.all([
        menuAPI.getAll(),
        tableAPI.getAll(),
        categoryAPI.getAll()
      ]);
      setMenuItems(menuData.filter((item) => item.isAvailable));
      setTables(tableData.filter((table) => table.status === 'available'));
      setCategories(catData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item) => {
    const existing = cart.find((c) => c._id === item._id);
    if (existing) {
      setCart(cart.map((c) => (c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((c) => c._id !== itemId));
  };

  const updateQuantity = (itemId, delta) => {
    setCart(
      cart
        .map((c) => (c._id === itemId ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const updateSpecialInstructions = (itemId, instructions) => {
    setSpecialInstructions({ ...specialInstructions, [itemId]: instructions });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const serviceCharge = subtotal * SERVICE_CHARGE_RATE;
  const total = subtotal + tax + serviceCharge;

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error('Please add items to the cart');
      return;
    }
    if (orderType === 'dine-in' && !selectedTable) {
      toast.error('Please select a table');
      return;
    }

    try {
      setSubmitting(true);
      const orderData = {
        orderType,
        tableNumber: orderType === 'dine-in' ? selectedTable : undefined,
        customerName,
        customerPhone,
        items: cart.map((item) => ({
          menuItem: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          specialInstructions: specialInstructions[item._id] || ''
        })),
        subtotal,
        tax,
        serviceCharge,
        total,
        notes,
        priority
      };
      await orderAPI.create(orderData);
      toast.success('Order created successfully');
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Order</h1>
          <p className="text-gray-500 mt-1">Place a new order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-3">Order Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                <div className="flex gap-2">
                  {['dine-in', 'takeaway', 'delivery'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        orderType === type
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {orderType === 'dine-in' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Table</label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select table</option>
                    {tables.map((table) => (
                      <option key={table._id} value={table.number}>
                        Table {table.number} ({table.capacity} seats)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-1"><User size={14} /> Customer Name</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-1"><Phone size={14} /> Customer Phone</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-3">Menu Items</h2>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredMenuItems.map((item) => (
                <button
                  key={item._id}
                  onClick={() => addToCart(item)}
                  className="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                  <div className="text-blue-600 font-semibold text-sm mt-1">${item.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-1"><MessageSquare size={14} /> Order Notes</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Additional notes for this order..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShoppingBag size={20} />
              Cart ({cart.length} items)
            </h2>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No items in cart</p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item._id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                          <div className="text-blue-600 text-sm">${item.price.toFixed(2)}</div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={specialInstructions[item._id] || ''}
                        onChange={(e) => updateSpecialInstructions(item._id, e.target.value)}
                        placeholder="Special instructions..."
                        className="w-full mt-2 text-xs border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Service ({(SERVICE_CHARGE_RATE * 100).toFixed(0)}%)</span>
                    <span>${serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || cart.length === 0}
                  className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Creating Order...' : 'Create Order'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
