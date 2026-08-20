import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Save, Store, Clock, FileText, AlertTriangle, Loader2 } from 'lucide-react';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    currency: 'USD',
    taxRate: '',
    serviceChargeRate: '',
    openingTime: '09:00',
    closingTime: '22:00',
    invoicePrefix: 'INV-',
    lowStockThreshold: '10'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.get();
      if (response.data) {
        setFormData({
          restaurantName: response.data.restaurantName || '',
          tagline: response.data.tagline || '',
          phone: response.data.phone || '',
          email: response.data.email || '',
          address: response.data.address || '',
          currency: response.data.currency || 'USD',
          taxRate: response.data.taxRate || '',
          serviceChargeRate: response.data.serviceChargeRate || '',
          openingTime: response.data.openingTime || '09:00',
          closingTime: response.data.closingTime || '22:00',
          invoicePrefix: response.data.invoicePrefix || 'INV-',
          lowStockThreshold: response.data.lowStockThreshold || '10'
        });
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsAPI.update({
        ...formData,
        taxRate: parseFloat(formData.taxRate) || 0,
        serviceChargeRate: parseFloat(formData.serviceChargeRate) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 10
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Restaurant Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <Store size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Restaurant Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
              <input
                type="text"
                required
                value={formData.restaurantName}
                onChange={(e) => handleChange('restaurantName', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter restaurant name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Authentic Italian Cuisine"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+1 234 567 890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="info@restaurant.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Full restaurant address"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <DollarSign size={20} className="text-green-600" />
            <h2 className="text-lg font-semibold text-gray-800">Financial Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="PKR">PKR - Pakistani Rupee</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="AED">AED - UAE Dirham</option>
                <option value="SAR">SAR - Saudi Riyal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.taxRate}
                onChange={(e) => handleChange('taxRate', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Charge (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.serviceChargeRate}
                onChange={(e) => handleChange('serviceChargeRate', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 5"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <Clock size={20} className="text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-800">Operating Hours</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
              <input
                type="time"
                value={formData.openingTime}
                onChange={(e) => handleChange('openingTime', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
              <input
                type="time"
                value={formData.closingTime}
                onChange={(e) => handleChange('closingTime', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <FileText size={20} className="text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">Invoice & Inventory Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="INV-"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
              <input
                type="number"
                min="1"
                value={formData.lowStockThreshold}
                onChange={(e) => handleChange('lowStockThreshold', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
              <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this quantity</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={20} /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;