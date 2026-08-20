import React, { useState, useEffect } from 'react';
import { supplierAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Search, Plus, Star, Phone, Mail, Edit2, Trash2, X, Building2 } from 'lucide-react';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    categories: '',
    rating: 5,
    notes: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierAPI.getAll();
      setSuppliers(response.data);
    } catch (error) {
      toast.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        categories: formData.categories.split(',').map(c => c.trim()).filter(c => c),
        rating: parseInt(formData.rating)
      };
      if (editingSupplier) {
        await supplierAPI.update(editingSupplier._id, data);
        toast.success('Supplier updated successfully');
      } else {
        await supplierAPI.create(data);
        toast.success('Supplier added successfully');
      }
      setShowModal(false);
      setEditingSupplier(null);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save supplier');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await supplierAPI.delete(id);
      toast.success('Supplier deleted successfully');
      fetchSuppliers();
    } catch (error) {
      toast.error('Failed to delete supplier');
    }
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      categories: (supplier.categories || []).join(', '),
      rating: supplier.rating || 5,
      notes: supplier.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      categories: '',
      rating: 5,
      notes: ''
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
        <span className="ml-1 text-sm text-gray-500">({rating})</span>
      </div>
    );
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm)
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Suppliers Management</h1>
        <button
          onClick={() => { resetForm(); setEditingSupplier(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading suppliers...</div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No suppliers found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map(supplier => (
            <div key={supplier._id} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{supplier.name}</h3>
                    <p className="text-sm text-gray-500">{supplier.contactPerson}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(supplier)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier._id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} /> {supplier.phone}
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={14} /> {supplier.email}
                  </div>
                )}
              </div>

              {supplier.categories && supplier.categories.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {supplier.categories.map((cat, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                {renderStars(supplier.rating || 0)}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingSupplier(null); }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categories (comma separated)</label>
                <input
                  type="text"
                  value={formData.categories}
                  onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                  placeholder="e.g. Vegetables, Meat, Dairy"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1"
                    >
                      <Star
                        size={24}
                        className={star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingSupplier(null); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingSupplier ? 'Update' : 'Add'} Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;