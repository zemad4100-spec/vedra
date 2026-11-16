import api from './api';

export const cartService = {
  getCart: (sessionId) => api.get('/cart', { headers: { 'X-Session-Id': sessionId } }),
  
  addItem: (data, sessionId) => api.post('/cart/items', data, { headers: { 'X-Session-Id': sessionId } }),
  
  updateItem: (id, quantity, sessionId) => api.put(`/cart/items/${id}`, { quantity }, { headers: { 'X-Session-Id': sessionId } }),
  
  removeItem: (id, sessionId) => api.delete(`/cart/items/${id}`, { headers: { 'X-Session-Id': sessionId } }),
  
  clearCart: (sessionId) => api.delete('/cart/clear', { headers: { 'X-Session-Id': sessionId } }),
};