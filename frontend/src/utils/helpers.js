export const formatCurrency = (amount, symbol = 'Rs.') => {
  return `${symbol}${Number(amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
};

export const orderStatusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  ready: 'bg-emerald-100 text-emerald-700',
  served: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const paymentStatusColors = {
  unpaid: 'bg-red-100 text-red-700',
  partial: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  refunded: 'bg-purple-100 text-purple-700',
};

export const tableStatusColors = {
  available: 'bg-emerald-100 text-emerald-700',
  occupied: 'bg-red-100 text-red-700',
  reserved: 'bg-amber-100 text-amber-700',
  maintenance: 'bg-gray-100 text-gray-700',
};

export const roleColors = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  kitchen: 'bg-orange-100 text-orange-700',
  staff: 'bg-green-100 text-green-700',
};

export const formatElapsedTime = (date) => {
  if (!date) return '0m';
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    preparing: 'bg-orange-100 text-orange-700 border-orange-200',
    ready: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    served: 'bg-purple-100 text-purple-700 border-purple-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};
