import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tableAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  LayoutGrid,
  Users,
  MapPin,
  Plus,
  Search,
  Filter,
  Armchair,
  CircleDot,
  Clock,
  CheckCircle2,
  Wrench,
  X,
  Eye,
  Edit,
  Trash2,
  RefreshCcw,
} from 'lucide-react';

const statusConfig = {
  available: { label: 'Available', color: 'bg-green-500', lightColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-400', dotColor: 'bg-green-500' },
  occupied: { label: 'Occupied', color: 'bg-red-500', lightColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-400', dotColor: 'bg-red-500' },
  reserved: { label: 'Reserved', color: 'bg-amber-500', lightColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-400', dotColor: 'bg-amber-500' },
  maintenance: { label: 'Maintenance', color: 'bg-gray-400', lightColor: 'bg-gray-50', textColor: 'text-gray-600', borderColor: 'border-gray-300', dotColor: 'bg-gray-400' },
};

const sectionConfig = {
  indoor: { label: 'Indoor', icon: MapPin, color: 'bg-blue-100 text-blue-700' },
  outdoor: { label: 'Outdoor', icon: MapPin, color: 'bg-green-100 text-green-700' },
  private: { label: 'Private', icon: MapPin, color: 'bg-purple-100 text-purple-700' },
  bar: { label: 'Bar', icon: MapPin, color: 'bg-orange-100 text-orange-700' },
};

function TablesPage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [selectedTable, setSelectedTable] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await tableAPI.getAll();
      setTables(response.data || response);
    } catch (error) {
      toast.error('Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      table.tableNumber?.toString().includes(searchTerm) ||
      table.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
    const matchesSection = sectionFilter === 'all' || table.section === sectionFilter;
    return matchesSearch && matchesStatus && matchesSection;
  });

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setShowDetailModal(true);
  };

  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'available').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
    maintenance: tables.filter((t) => t.status === 'maintenance').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading tables...</p>
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
              <LayoutGrid size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Table Management</h1>
              <p className="text-sm text-gray-500">{stats.total} tables total</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchTables}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
            <button
              onClick={() => toast.success('Add table modal coming soon')}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Add Table
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(statusConfig).map(([key, config]) => (
            <div key={key} className={`${config.lightColor} rounded-xl p-4 border ${config.borderColor}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${config.dotColor}`}></div>
                <span className="text-sm font-medium text-gray-600">{config.label}</span>
              </div>
              <span className={`text-2xl font-bold ${config.textColor}`}>{stats[key]}</span>
            </div>
          ))}
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <LayoutGrid size={14} className="text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Total</span>
            </div>
            <span className="text-2xl font-bold text-orange-700">{stats.total}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by table number or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
              />
            </div>
            <div className="flex gap-3">
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
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Sections</option>
                {Object.entries(sectionConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredTables.map((table) => {
            const status = statusConfig[table.status] || statusConfig.available;
            const section = sectionConfig[table.section] || sectionConfig.indoor;

            return (
              <button
                key={table._id}
                onClick={() => handleTableClick(table)}
                className={`bg-white rounded-xl border-2 ${status.borderColor} p-4 hover:shadow-lg transition-all text-left group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl font-bold text-gray-900">{table.tableNumber}</span>
                  <div className={`w-3 h-3 rounded-full ${status.dotColor}`}></div>
                </div>
                {table.name && (
                  <p className="text-sm font-medium text-gray-700 mb-1">{table.name}</p>
                )}
                <div className="flex items-center gap-1.5 mb-2">
                  <Users size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{table.capacity} seats</span>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${section.color}`}>
                  {section.label}
                </span>
                <div className={`mt-3 flex items-center gap-1.5 ${status.textColor}`}>
                  <CircleDot size={12} />
                  <span className="text-xs font-medium">{status.label}</span>
                </div>
                {table.currentOrder && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Current order: </span>
                    <span className="text-xs font-medium text-gray-700">#{table.currentOrder.orderNumber || table.currentOrder._id?.slice(-6)}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {filteredTables.length === 0 && (
          <div className="text-center py-12">
            <LayoutGrid size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No tables found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {showDetailModal && selectedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Table {selectedTable.tableNumber}</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {selectedTable.name && (
                <div>
                  <label className="text-sm text-gray-500">Name</label>
                  <p className="font-medium text-gray-900">{selectedTable.name}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Capacity</label>
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-gray-400" />
                    <p className="font-medium text-gray-900">{selectedTable.capacity} seats</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Section</label>
                  <p className="font-medium text-gray-900 capitalize">{selectedTable.section || 'Indoor'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-3 h-3 rounded-full ${statusConfig[selectedTable.status]?.dotColor || 'bg-gray-400'}`}></div>
                  <span className={`font-medium capitalize ${statusConfig[selectedTable.status]?.textColor || 'text-gray-700'}`}>
                    {statusConfig[selectedTable.status]?.label || selectedTable.status}
                  </span>
                </div>
              </div>

              {selectedTable.currentOrder && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm text-gray-500 mb-2 block">Current Order</label>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">#{selectedTable.currentOrder.orderNumber || selectedTable.currentOrder._id?.slice(-6)}</span>
                    <span className="text-sm text-gray-500">{formatCurrency(selectedTable.currentOrder.total || 0)}</span>
                  </div>
                  {selectedTable.currentOrder.items && (
                    <div className="mt-2 space-y-1">
                      {selectedTable.currentOrder.items.slice(0, 3).map((item, idx) => (
                        <p key={idx} className="text-sm text-gray-600">
                          {item.quantity || item.qty}x {item.name || item.item?.name}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {selectedTable.status === 'available' && (
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
                  <Armchair size={16} />
                  Mark Occupied
                </button>
              )}
              {selectedTable.status === 'occupied' && (
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
                  <CheckCircle2 size={16} />
                  Free Table
                </button>
              )}
              {selectedTable.status === 'maintenance' && (
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
                  <CheckCircle2 size={16} />
                  Set Available
                </button>
              )}
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                <Edit size={16} />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TablesPage;
