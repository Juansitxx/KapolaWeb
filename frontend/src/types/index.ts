// Tipos TypeScript para la aplicación

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'cliente' | 'admin';
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category?: string;
  active: boolean;
  createdAt: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  createdAt: string;
}

export interface Cart {
  id: number;
  userId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  userId: number;
  createdAt: string;
  total: number;
  status: 'pendiente' | 'confirmada' | 'en_proceso' | 'enviada' | 'entregada' | 'cancelada';
  paymentMethod?: string;
  items: OrderItem[];
  user?: User;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: Pagination;
}

export interface SearchFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
