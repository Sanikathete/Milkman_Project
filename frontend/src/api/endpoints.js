import apiClient from './client'

export const authApi = {
  register: (payload) => apiClient.post('/auth/register/', payload),
  login: (payload) => apiClient.post('/auth/login/', payload),
}

export const catalogApi = {
  getCategories: () => apiClient.get('/categories/'),
  getProducts: (params = {}) => apiClient.get('/products/', { params }),
  getProduct: (id) => apiClient.get(`/products/${id}/`),
  createCategory: (payload) => apiClient.post('/categories/', payload),
  updateCategory: (id, payload) => apiClient.patch(`/categories/${id}/`, payload),
  deleteCategory: (id) => apiClient.delete(`/categories/${id}/`),
  createProduct: (payload) => apiClient.post('/products/', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProduct: (id, payload) => apiClient.patch(`/products/${id}/`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteProduct: (id) => apiClient.delete(`/products/${id}/`),
}

export const subscriptionApi = {
  getSubscriptions: (params = {}) => apiClient.get('/subscriptions/', { params }),
  getSubscription: (id) => apiClient.get(`/subscriptions/${id}/`),
  getAllSubscriptions: (params = {}) => apiClient.get('/subscriptions/admin/all/', { params }),
  createSubscription: (payload) => apiClient.post('/subscriptions/', payload),
}

export const orderApi = {
  getOrders: (params = {}) => apiClient.get('/orders/', { params }),
  getOrder: (id) => apiClient.get(`/orders/${id}/`),
  getAllOrders: (params = {}) => apiClient.get('/orders/admin/all/', { params }),
  createOrder: (payload) => apiClient.post('/orders/', payload),
}

export const paymentApi = {
  paySubscription: (payload) => apiClient.post('/payment/', payload),
  payOrder: (payload) => apiClient.post('/payment/', payload),
}

export const userApi = {
  getUsers: () => apiClient.get('/users/'),
}
