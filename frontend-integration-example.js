// Ejemplo de integración con frontend (React/Vue/Angular)
// Este archivo muestra cómo integrar la API con el frontend

// ========================================
// CONFIGURACIÓN BASE
// ========================================

const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// ========================================
// SERVICIO DE API
// ========================================

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  // Método base para hacer requests
  async request(endpoint, options = {}) {
    const token = this.getToken();
    
    const config = {
      ...API_CONFIG.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: config
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en la petición');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Obtener token del localStorage
  getToken() {
    return localStorage.getItem('auth_token');
  }

  // Guardar token
  setToken(token) {
    localStorage.setItem('auth_token', token);
  }

  // Eliminar token
  removeToken() {
    localStorage.removeItem('auth_token');
  }

  // ========================================
  // AUTENTICACIÓN
  // ========================================

  async login(email, password) {
    const response = await this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData) {
    return await this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getProfile() {
    return await this.request('/users/profile');
  }

  async logout() {
    this.removeToken();
  }

  // ========================================
  // PRODUCTOS
  // ========================================

  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/products?${queryString}`);
  }

  async getProduct(id) {
    return await this.request(`/products/${id}`);
  }

  async getCategories() {
    return await this.request('/products/categories');
  }

  async createProduct(productData) {
    return await this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(id, productData) {
    return await this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(id) {
    return await this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  // ========================================
  // BÚSQUEDA
  // ========================================

  async searchProducts(query, filters = {}) {
    const params = { q: query, ...filters };
    return await this.request('/search/products', {
      method: 'GET',
      body: JSON.stringify(params)
    });
  }

  async getPopularProducts(limit = 10) {
    return await this.request(`/search/products/popular?limit=${limit}`);
  }

  async getRelatedProducts(productId, limit = 4) {
    return await this.request(`/search/products/${productId}/related?limit=${limit}`);
  }

  async getSearchSuggestions(query) {
    return await this.request(`/search/suggestions?q=${query}`);
  }

  // ========================================
  // CARRITO DE COMPRAS
  // ========================================

  async getCart() {
    return await this.request('/cart');
  }

  async addToCart(productId, quantity = 1) {
    return await this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  }

  async updateCartItem(itemId, quantity) {
    return await this.request(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }

  async removeFromCart(itemId) {
    return await this.request(`/cart/items/${itemId}`, {
      method: 'DELETE'
    });
  }

  async clearCart() {
    return await this.request('/cart/clear', {
      method: 'DELETE'
    });
  }

  // ========================================
  // ÓRDENES
  // ========================================

  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/orders?${queryString}`);
  }

  async getOrder(id) {
    return await this.request(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async updateOrderStatus(id, status) {
    return await this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async cancelOrder(id) {
    return await this.request(`/orders/${id}/cancel`, {
      method: 'PUT'
    });
  }

  // ========================================
  // SUBIDA DE ARCHIVOS
  // ========================================

  async uploadProductImage(productId, file) {
    const formData = new FormData();
    formData.append('image', file);

    return await this.request(`/upload/products/${productId}/image`, {
      method: 'POST',
      headers: {
        // No incluir Content-Type, se establece automáticamente
        Authorization: `Bearer ${this.getToken()}`
      },
      body: formData
    });
  }

  async deleteProductImage(productId) {
    return await this.request(`/upload/products/${productId}/image`, {
      method: 'DELETE'
    });
  }

  // ========================================
  // ADMINISTRACIÓN (solo para admins)
  // ========================================

  async getDashboardStats() {
    return await this.request('/admin/dashboard');
  }

  async getAllUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/admin/users?${queryString}`);
  }

  async updateUserRole(userId, role) {
    return await this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  }

  async getAllOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/admin/orders?${queryString}`);
  }

  async updateOrderStatusAdmin(orderId, status, notes) {
    return await this.request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  }
}

// ========================================
// HOOKS DE REACT (ejemplo)
// ========================================

// Hook para autenticación
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const profile = await apiService.getProfile();
        setUser(profile);
      } catch (error) {
        console.error('Error al obtener perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password);
      const profile = await apiService.getProfile();
      setUser(profile);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  return { user, loading, login, logout };
};

// Hook para productos
export const useProducts = (params = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProducts(params);
        setProducts(response.products);
        setPagination(response.pagination);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(params)]);

  return { products, loading, pagination };
};

// Hook para carrito
export const useCart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCart();
        setCart(response.cart);
      } catch (error) {
        console.error('Error al obtener carrito:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const addToCart = async (productId, quantity) => {
    try {
      await apiService.addToCart(productId, quantity);
      // Refrescar carrito
      const response = await apiService.getCart();
      setCart(response.cart);
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await apiService.removeFromCart(itemId);
      // Refrescar carrito
      const response = await apiService.getCart();
      setCart(response.cart);
    } catch (error) {
      throw error;
    }
  };

  return { cart, loading, addToCart, removeFromCart };
};

// ========================================
// INSTANCIA GLOBAL
// ========================================

const apiService = new ApiService();
export default apiService;

// ========================================
// EJEMPLO DE USO EN COMPONENTE REACT
// ========================================

/*
import React, { useState, useEffect } from 'react';
import apiService, { useAuth, useProducts, useCart } from './apiService';

const ProductList = () => {
  const { products, loading, pagination } = useProducts({ category: 'Chocolate' });
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async () => {
    try {
      const results = await apiService.searchProducts(searchQuery);
      console.log('Resultados de búsqueda:', results);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    }
  };

  if (loading) return <div>Cargando productos...</div>;

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar productos..."
      />
      <button onClick={handleSearch}>Buscar</button>
      
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <button onClick={() => addToCart(product.id, 1)}>
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
*/

