import axios from 'axios';

const api = axios.create({
  // ✅ الرابط الثابت (ngrok)
  baseURL: 'https://kilogram-parabola-showing.ngrok-free.dev/api',
});

// ✅ Interceptor للطلبات (بيضيف التوكن + هيدر ngrok)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // ✅ الهيدر ده بيعدي صفحة تحذير ngrok
  config.headers['ngrok-skip-browser-warning'] = '1';
  
  return config;
});

// ✅ Interceptor للردود (بيعالج 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ✅ خدمات التقارير
export const reportService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllOrders: (status = '') => api.get('/admin/orders', { params: { status } }),
  updateOrderStatus: (orderId, newStatus, notes = '') =>
    api.put(`/admin/orders/${orderId}/status`, { newStatus, notes }),
};

export default api;