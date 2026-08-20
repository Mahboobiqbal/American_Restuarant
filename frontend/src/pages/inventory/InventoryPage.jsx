import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Search, Plus, RefreshCw, AlertTriangle, X, Package, Filter, Edit2, Trash2 } from 'lucide-react';

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'kg',
    minQuantity: '',
    costPerUnit: '',
    supplier: '',
    lastRestocked: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getAll();
      setItems(response.data);
      const uniqueCategories = [...new Set(response.data.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      toast.error('Failed to fetch inventory items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.create({
        ...formData,
        quantity: parseFloat(formData.quantity),
        minQuantity: parseFloat(formData.minQuantity),
        costPerUnit: parseFloat(formData.costPerUnit)
      });
      toast.success('Item added successfully');
      setShowAddModal(false);
      resetForm();
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item');
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.restock(selectedItem._id, { quantity: parseFloat(restockQuantity) });
      toast.success('Item restocked successfully');
      setShowRestockModal(false);
      setSelectedItem(null);
      setRestockQuantity('');
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restock item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await inventoryAPI.delete(id);
      toast.success('Item deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: '',
      unit: 'kg',
      minQuantity: '',
      costPerUnit: '',
      supplier: '',
      lastRestocked: new Date().toISOString().split('T')[0]
    });
  };

  const openRestockModal = (item) => {
    setSelectedItem(item);
    setRestockQuantity('');
    setShowRestockModal(true);
  };

  const isLowStock = (item) => item.quantity <= item.minQuantity;

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesLowStock = !lowStockFilter || isLowStock(item);
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockFilter}
              onChange={(e) => setLowStockFilter(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded"
            />
            <span className="flex items-center gap-1 text-sm">
              <AlertTriangle size={16} className="text-red-500" /> Low Stock Only
            </span>
          </label>
          <button onClick={fetchItems} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost/Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Restocked</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr
                    key={item._id}
                    className={`${isLowStock(item) ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isLowStock(item) && <AlertTriangle size={16} className="text-red-500" />}
                        <span className={`font-medium ${isLowStock(item) ? 'text-red-700' : 'text-gray-900'}`}>
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={isLowStock(item) ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.minQuantity} {item.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.costPerUnit)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.supplier || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.lastRestocked)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openRestockModal(item)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Restock"
                        >
                          <RefreshCw size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Inventory Item</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="ml">ml</option>
                    <option value="pcs">pcs</option>
                    <option value="dozen">dozen</option>
                    <option value="pack">pack</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Per Unit</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.costPerUnit}
                    onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Restocked</label>
                <input
                  type="date"
                  value={formData.lastRestocked}
                  onChange={(e) => setFormData({ ...formData, lastRestocked: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRestockModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Restock Item</h2>
              <button onClick={() => setShowRestockModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedItem.name}</p>
              <p className="text-sm text-gray-500">Current stock: {selectedItem.quantity} {selectedItem.unit}</p>
            </div>
            <form onSubmit={handleRestock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Add</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;