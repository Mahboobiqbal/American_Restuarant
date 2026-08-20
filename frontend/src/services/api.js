import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
  getUsers: (params) => API.get('/auth/users', { params }),
  createUser: (data) => API.post('/auth/users', data),
  updateUser: (id, data) => API.put(`/auth/users/${id}`, data),
  deleteUser: (id) => API.delete(`/auth/users/${id}`),
};

export const categoryAPI = {
  getAll: (params) => API.get('/categories', { params }),
  getOne: (id) => API.get(`/categories/${id}`),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};

export const menuAPI = {
  getAll: (params) => API.get('/menu', { params }),
  getOne: (id) => API.get(`/menu/${id}`),
  create: (data) => API.post('/menu', data),
  update: (id, data) => API.put(`/menu/${id}`, data),
  delete: (id) => API.delete(`/menu/${id}`),
};

export const tableAPI = {
  getAll: (params) => API.get('/tables', { params }),
  getOne: (id) => API.get(`/tables/${id}`),
  create: (data) => API.post('/tables', data),
  update: (id, data) => API.put(`/tables/${id}`, data),
  updateStatus: (id, data) => API.put(`/tables/${id}/status`, data),
  delete: (id) => API.delete(`/tables/${id}`),
};

export const orderAPI = {
  getAll: (params) => API.get('/orders', { params }),
  getOne: (id) => API.get(`/orders/${id}`),
  create: (data) => API.post('/orders', data),
  updateStatus: (id, data) => API.put(`/orders/${id}/status`, data),
  updateItemStatus: (id, itemId, data) => API.put(`/orders/${id}/items/${itemId}/status`, data),
  cancel: (id) => API.put(`/orders/${id}/cancel`),
  getKitchen: () => API.get('/orders/kitchen'),
  getDashboard: () => API.get('/orders/dashboard'),
  getSalesReport: (params) => API.get('/orders/reports/sales', { params }),
};

export const paymentAPI = {
  getAll: (params) => API.get('/payments', { params }),
  process: (data) => API.post('/payments', data),
  getSummary: () => API.get('/payments/summary'),
};

export const inventoryAPI = {
  getAll: (params) => API.get('/inventory', { params }),
  getOne: (id) => API.get(`/inventory/${id}`),
  create: (data) => API.post('/inventory', data),
  update: (id, data) => API.put(`/inventory/${id}`, data),
  restock: (id, data) => API.put(`/inventory/${id}/restock`, data),
  delete: (id) => API.delete(`/inventory/${id}`),
  getCategories: () => API.get('/inventory/categories'),
};

export const supplierAPI = {
  getAll: (params) => API.get('/suppliers', { params }),
  getOne: (id) => API.get(`/suppliers/${id}`),
  create: (data) => API.post('/suppliers', data),
  update: (id, data) => API.put(`/suppliers/${id}`, data),
  delete: (id) => API.delete(`/suppliers/${id}`),
};

export const customerAPI = {
  getAll: (params) => API.get('/customers', { params }),
  getOne: (id) => API.get(`/customers/${id}`),
  create: (data) => API.post('/customers', data),
  update: (id, data) => API.put(`/customers/${id}`, data),
  delete: (id) => API.delete(`/customers/${id}`),
};

export const reservationAPI = {
  getAll: (params) => API.get('/reservations', { params }),
  create: (data) => API.post('/reservations', data),
  update: (id, data) => API.put(`/reservations/${id}`, data),
  delete: (id) => API.delete(`/reservations/${id}`),
};

export const notificationAPI = {
  getAll: (params) => API.get('/notifications', { params }),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
  delete: (id) => API.delete(`/notifications/${id}`),
};

export const settingsAPI = {
  get: () => API.get('/settings'),
  update: (data) => API.put('/settings', data),
};

export const auditAPI = {
  getAll: (params) => API.get('/audit', { params }),
};

export default API;
