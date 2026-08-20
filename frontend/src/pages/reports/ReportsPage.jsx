import React, { useState, useEffect } from 'react';
import { orderAPI, paymentAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Calendar, TrendingUp, ShoppingCart, DollarSign, CreditCard, RefreshCw, Download } from 'lucide-react';

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [paymentBreakdown, setPaymentBreakdown] = useState([]);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const [salesRes, paymentRes] = await Promise.all([
        orderAPI.getSalesReport({
          from: dateRange.from,
          to: dateRange.to
        }),
        paymentAPI.getReport({
          from: dateRange.from,
          to: dateRange.to
        }).catch(() => ({ data: [] }))
      ]);
      setReportData(salesRes.data);
      setPaymentBreakdown(paymentRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const calculateSummary = () => {
    if (!reportData) return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    const totalRevenue = reportData.dailySales?.reduce((sum, day) => sum + day.revenue, 0) || 0;
    const totalOrders = reportData.dailySales?.reduce((sum, day) => sum + day.orders, 0) || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return { totalRevenue, totalOrders, avgOrderValue };
  };

  const summary = calculateSummary();

  const getPaymentMethodColor = (method) => {
    const colors = {
      cash: 'bg-green-100 text-green-800',
      card: 'bg-blue-100 text-blue-800',
      credit: 'bg-purple-100 text-purple-800',
      debit: 'bg-orange-100 text-orange-800',
      online: 'bg-indigo-100 text-indigo-800'
    };
    return colors[method?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <button
          onClick={fetchReport}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-400" />
            <span className="font-medium text-gray-700">Date Range:</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">From:</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateChange('from', e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">To:</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateChange('to', e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Generate Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading report data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign size={24} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-800">{summary.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCart size={24} className="text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Average Order Value</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.avgOrderValue)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp size={24} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-5 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Sales by Day</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData?.dailySales?.length > 0 ? (
                      reportData.dailySales.map((day, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-5 py-3 text-sm text-gray-900">{formatDate(day.date || day._id)}</td>
                          <td className="px-5 py-3 text-sm font-medium text-gray-900">{formatCurrency(day.revenue)}</td>
                          <td className="px-5 py-3 text-sm text-gray-500">{day.orders}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-5 py-8 text-center text-gray-500">
                          No sales data available for this period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-5 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Payment Methods</h2>
              </div>
              <div className="p-5">
                {paymentBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    {paymentBreakdown.map((payment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentMethodColor(payment.method || payment._id)}`}>
                            {payment.method || payment._id || 'Unknown'}
                          </span>
                          <span className="text-sm text-gray-500">{payment.count || 0} transactions</span>
                        </div>
                        <span className="font-semibold text-gray-800">{formatCurrency(payment.total || 0)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No payment data available for this period</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {reportData?.monthlySales && reportData.monthlySales.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
              <div className="px-5 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Sales by Month</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.monthlySales.map((month, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-5 py-3 text-sm text-gray-900">{month._id || month.month}</td>
                        <td className="px-5 py-3 text-sm font-medium text-gray-900">{formatCurrency(month.revenue)}</td>
                        <td className="px-5 py-3 text-sm text-gray-500">{month.orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsPage;