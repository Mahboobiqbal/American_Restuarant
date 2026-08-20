import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationAPI, tableAPI } from '../../services/api';
import { formatDate, formatTime } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  Search,
  Plus,
  Phone,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  UserCheck,
  X,
  Filter,
  ChevronDown,
  Calendar,
  TableProperties,
  RefreshCcw,
} from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', dotColor: 'bg-yellow-500', borderColor: 'border-yellow-300' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-500', borderColor: 'border-blue-300' },
  seated: { label: 'Seated', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500', borderColor: 'border-green-300' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-700', dotColor: 'bg-gray-500', borderColor: 'border-gray-300' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500', borderColor: 'border-red-300' },
  'no-show': { label: 'No Show', color: 'bg-orange-100 text-orange-700', dotColor: 'bg-orange-500', borderColor: 'border-orange-300' },
};

function ReservationsPage() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    tableId: '',
    date: '',
    time: '',
    partySize: 2,
    specialRequests: '',
  });

  useEffect(() => {
    fetchReservations();
    fetchTables();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await reservationAPI.getAll();
      setReservations(response.data || response);
    } catch (error) {
      toast.error('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await tableAPI.getAll();
      setTables(response.data || response);
    } catch (error) {
      console.error('Failed to fetch tables');
    }
  };

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone?.includes(searchTerm) ||
      r.table?.tableNumber?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesDate = !dateFilter || r.date?.startsWith(dateFilter);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    try {
      await reservationAPI.create(formData);
      toast.success('Reservation created successfully');
      setShowCreateModal(false);
      setFormData({
        customerName: '',
        phone: '',
        email: '',
        tableId: '',
        date: '',
        time: '',
        partySize: 2,
        specialRequests: '',
      });
      fetchReservations();
    } catch (error) {
      toast.error('Failed to create reservation');
    }
  };

  const handleStatusUpdate = async (reservationId, status) => {
    try {
      await reservationAPI.updateStatus(reservationId, { status });
      toast.success(`Reservation ${status}`);
      fetchReservations();
    } catch (error) {
      toast.error('Failed to update reservation status');
    }
  };

  const handleViewReservation = async (reservationId) => {
    try {
      const response = await reservationAPI.getById(reservationId);
      setSelectedReservation(response.data || response);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Failed to fetch reservation details');
    }
  };

  const getAvailableTables = () => {
    return tables.filter((t) => t.status === 'available');
  };

  const stats = {
    total: reservations.length,
    today: reservations.filter((r) => r.date === new Date().toISOString().split('T')[0]).length,
    pending: reservations.filter((r) => r.status === 'pending').length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    seated: reservations.filter((r) => r.status === 'seated').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading reservations...</p>
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
              <CalendarDays size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Reservations</h1>
              <p className="text-sm text-gray-500">{stats.total} total reservations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchReservations}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              New Reservation
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <CalendarDays size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Calendar size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-xl font-bold text-gray-900">{stats.today}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Clock size={18} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Confirmed</p>
                <p className="text-xl font-bold text-gray-900">{stats.confirmed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <UserCheck size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Seated</p>
                <p className="text-xl font-bold text-gray-900">{stats.seated}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, phone, or table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Status</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Table</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Party Size</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReservations.map((reservation) => {
                  const status = statusConfig[reservation.status] || statusConfig.pending;

                  return (
                    <tr key={reservation._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{reservation.customerName}</p>
                          {reservation.phone && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                              <Phone size={12} />
                              {reservation.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TableProperties size={14} className="text-gray-400" />
                          <span className="font-medium text-gray-900">
                            Table {reservation.table?.tableNumber || reservation.tableNumber || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{formatDate(reservation.date)}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {formatTime(reservation.time)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          <Users size={13} />
                          {reservation.partySize}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}></div>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleViewReservation(reservation._id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Search size={14} />
                          </button>
                          {reservation.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(reservation._id, 'confirmed')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Confirm"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          {reservation.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusUpdate(reservation._id, 'seated')}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Seat"
                            >
                              <UserCheck size={14} />
                            </button>
                          )}
                          {reservation.status === 'seated' && (
                            <button
                              onClick={() => handleStatusUpdate(reservation._id, 'completed')}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Complete"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          {['pending', 'confirmed'].includes(reservation.status) && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(reservation._id, 'cancelled')}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <XCircle size={14} />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(reservation._id, 'no-show')}
                                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="No Show"
                              >
                                <NoSign size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredReservations.length === 0 && (
            <div className="text-center py-12">
              <CalendarDays size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No reservations found</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters or create a new reservation</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">New Reservation</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table *</label>
                <select
                  required
                  value={formData.tableId}
                  onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                >
                  <option value="">Select a table</option>
                  {getAvailableTables().map((table) => (
                    <option key={table._id} value={table._id}>
                      Table {table.tableNumber} - {table.capacity} seats ({table.section})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Party Size *</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, partySize: Math.max(1, formData.partySize - 1) })}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-medium"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-lg font-bold text-gray-900">{formData.partySize}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, partySize: Math.min(20, formData.partySize + 1) })}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm resize-none"
                  placeholder="Any special requests or notes..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                  Create Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Reservation Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users size={20} className="text-orange-700" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selectedReservation.customerName}</p>
                  {selectedReservation.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone size={12} />
                      {selectedReservation.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedReservation.date)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Time</p>
                  <p className="font-medium text-gray-900">{formatTime(selectedReservation.time)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Table</p>
                  <p className="font-medium text-gray-900">
                    Table {selectedReservation.table?.tableNumber || selectedReservation.tableNumber || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Party Size</p>
                  <p className="font-medium text-gray-900">{selectedReservation.partySize} guests</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
                {(() => {
                  const status = statusConfig[selectedReservation.status] || statusConfig.pending;
                  return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}></div>
                      {status.label}
                    </span>
                  );
                })()}
              </div>

              {selectedReservation.specialRequests && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-600 font-medium mb-1">Special Requests</p>
                  <p className="text-sm text-amber-800">{selectedReservation.specialRequests}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                Close
              </button>
              {selectedReservation.status === 'pending' && (
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedReservation._id, 'confirmed');
                    setShowDetailModal(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  <CheckCircle2 size={16} />
                  Confirm
                </button>
              )}
              {selectedReservation.status === 'confirmed' && (
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedReservation._id, 'seated');
                    setShowDetailModal(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  <UserCheck size={16} />
                  Seat Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReservationsPage;
