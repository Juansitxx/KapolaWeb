import axios from 'axios';
import { 
  User, 
  Product, 
  Cart, 
  Order, 
  AuthResponse, 
  ProductsResponse, 
  OrdersResponse,
  SearchFilters 
} from '../types';

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicio de autenticación
export const authService = {
  // Login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/users/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  // Registro
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/users/register', { name, email, password });
    return response.data;
  },

  // Obtener perfil
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('auth_token');
  },

  // Verificar si está autenticado
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  }
};

// Servicio de productos
export const productService = {
  // Obtener productos
  getProducts: async (params?: SearchFilters): Promise<ProductsResponse> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Obtener producto por ID
  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Obtener categorías
  getCategories: async (): Promise<{ categories: string[] }> => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  // Buscar productos
  searchProducts: async (filters: SearchFilters): Promise<ProductsResponse> => {
    const response = await api.get('/search/products', { params: filters });
    return response.data;
  },

  // Obtener productos populares
  getPopularProducts: async (limit: number = 10): Promise<{ products: Product[] }> => {
    const response = await api.get(`/search/products/popular?limit=${limit}`);
    return response.data;
  },

  // Obtener productos relacionados
  getRelatedProducts: async (productId: number, limit: number = 4): Promise<{ products: Product[] }> => {
    const response = await api.get(`/search/products/${productId}/related?limit=${limit}`);
    return response.data;
  },

  // Obtener sugerencias de búsqueda
  getSearchSuggestions: async (query: string): Promise<{ suggestions: Array<{ type: string; value: string }> }> => {
    const response = await api.get(`/search/suggestions?q=${query}`);
    return response.data;
  }
};

// Servicio de carrito
export const cartService = {
  // Obtener carrito
  getCart: async (): Promise<{ cart: Cart }> => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Agregar al carrito
  addToCart: async (productId: number, quantity: number = 1): Promise<{ message: string }> => {
    const response = await api.post('/cart/add', { productId, quantity });
    return response.data;
  },

  // Actualizar cantidad en carrito
  updateCartItem: async (itemId: number, quantity: number): Promise<{ message: string }> => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  // Eliminar del carrito
  removeFromCart: async (itemId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  // Limpiar carrito
  clearCart: async (): Promise<{ message: string }> => {
    const response = await api.delete('/cart/clear');
    return response.data;
  }
};

// Servicio de órdenes
export const orderService = {
  // Obtener órdenes
  getOrders: async (params?: { page?: number; limit?: number; status?: string }): Promise<OrdersResponse> => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Obtener orden por ID
  getOrder: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Crear orden
  createOrder: async (items: Array<{ productId: number; quantity: number }>, paymentMethod: string): Promise<{ message: string; order: Order }> => {
    const response = await api.post('/orders', { items, paymentMethod });
    return response.data;
  },

  // Actualizar estado de orden
  updateOrderStatus: async (id: number, status: string): Promise<{ message: string; order: Order }> => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Cancelar orden
  cancelOrder: async (id: number): Promise<{ message: string; order: Order }> => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  }
};

// Servicio de administración
export const adminService = {
  // Obtener estadísticas del dashboard
  getDashboardStats: async (): Promise<any> => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Obtener todos los usuarios
  getUsers: async (params?: { page?: number; limit?: number; role?: string; search?: string }): Promise<any> => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Actualizar rol de usuario
  updateUserRole: async (userId: number, role: string): Promise<any> => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Obtener todas las órdenes
  getAllOrders: async (params?: any): Promise<any> => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  // Actualizar estado de orden (admin)
  updateOrderStatusAdmin: async (orderId: number, status: string, notes?: string): Promise<any> => {
    const response = await api.put(`/admin/orders/${orderId}/status`, { status, notes });
    return response.data;
  },

  // ============ GESTIÓN DE PRODUCTOS (ADMIN) ============
  
  // Obtener todos los productos (admin)
  getProducts: async (params?: { page?: number; limit?: number; category?: string; active?: boolean; search?: string }): Promise<any> => {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  // Crear producto (admin)
  createProduct: async (productData: {
    name: string;
    description?: string;
    price: number;
    stock?: number;
    imageUrl?: string;
    category?: string;
    active?: boolean;
  }): Promise<any> => {
    const response = await api.post('/admin/products', productData);
    return response.data;
  },

  // Actualizar producto (admin)
  updateProduct: async (productId: number, productData: {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    imageUrl?: string;
    category?: string;
    active?: boolean;
  }): Promise<any> => {
    const response = await api.put(`/admin/products/${productId}`, productData);
    return response.data;
  },

  // Eliminar producto (admin)
  deleteProduct: async (productId: number): Promise<any> => {
    const response = await api.delete(`/admin/products/${productId}`);
    return response.data;
  },

  // Subir imagen de producto (admin)
  uploadProductImage: async (productId: number, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post(`/upload/products/${productId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default api;
