/**
 * API Service Layer for E-Shop
 * Integrates directly with the Express / MongoDB Backend.
 * Includes graceful resilient fallback to mock dataset if backend is unreachable.
 */

import { PRODUCTS, CATEGORIES } from '../data/products.js';

// Normalize API_BASE_URL: ensure https protocol, no trailing slash, and ends with /api
function getNormalizedApiUrl() {
  let url = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (!url) return 'http://localhost:5000/api';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
}

const API_BASE_URL = getNormalizedApiUrl();
const TOKEN_KEY = 'eshop_auth_token';

// Helper to delay for mock fallback
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Universal Request Wrapper
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
    ...options,
    headers,
    credentials: 'include' // Sends HttpOnly cookie
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON response from ${cleanEndpoint}, received: ${contentType || 'non-json'}`);
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.errors = data.errors;
    throw err;
  }

  return data;
}

export const apiService = {
  /**
   * Fetch list of products with filtering, search, sorting and pagination
   */
  async getProducts(params = {}) {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      minRating,
      inStockOnly,
      sortBy = 'featured',
      page = 1,
      limit = 12
    } = params;

    try {
      const queryParams = new URLSearchParams();
      if (category && category !== 'all') queryParams.append('category', category);
      if (search && search.trim()) queryParams.append('search', search.trim());
      if (minPrice !== undefined && minPrice !== '') queryParams.append('minPrice', minPrice);
      if (maxPrice !== undefined && maxPrice !== '') queryParams.append('maxPrice', maxPrice);
      if (minRating) queryParams.append('minRating', minRating);
      if (inStockOnly) queryParams.append('inStockOnly', 'true');
      if (sortBy) queryParams.append('sortBy', sortBy);
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);

      const res = await apiRequest(`/products?${queryParams.toString()}`);
      return {
        success: true,
        data: res.data,
        pagination: res.pagination
      };
    } catch (networkErr) {
      console.warn('[API Service] Backend unreachable, falling back to local dataset:', networkErr.message);
      await delay(80);

      let filtered = [...PRODUCTS];

      if (search && search.trim()) {
        const q = search.toLowerCase().trim();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q)
        );
      }

      if (category && category !== 'all') {
        const catLower = category.toLowerCase();
        filtered = filtered.filter(
          (p) => p.categorySlug === catLower || p.category.toLowerCase() === catLower
        );
      }

      if (minPrice !== undefined && minPrice !== '') {
        filtered = filtered.filter((p) => p.price >= Number(minPrice));
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        filtered = filtered.filter((p) => p.price <= Number(maxPrice));
      }
      if (minRating) {
        filtered = filtered.filter((p) => p.rating >= Number(minRating));
      }
      if (inStockOnly) {
        filtered = filtered.filter((p) => p.inStock);
      }

      switch (sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
        case 'featured':
        default:
          filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }

      const total = filtered.length;
      const startIndex = (page - 1) * limit;
      const paginatedItems = filtered.slice(startIndex, startIndex + limit);

      return {
        success: true,
        data: paginatedItems,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit)
        }
      };
    }
  },

  /**
   * Fetch single product by ID
   */
  async getProductById(id) {
    try {
      const res = await apiRequest(`/products/${id}`);
      return {
        success: true,
        data: res.data
      };
    } catch (networkErr) {
      if (networkErr.status === 404) {
        throw new Error(`Product with ID "${id}" was not found.`);
      }
      console.warn('[API Service] Backend unreachable for product, using mock fallback:', networkErr.message);
      await delay(80);
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) {
        throw new Error(`Product with ID "${id}" was not found.`);
      }
      return {
        success: true,
        data: product
      };
    }
  },

  /**
   * Fetch all categories
   */
  async getCategories() {
    try {
      const res = await apiRequest('/categories');
      return {
        success: true,
        data: res.data
      };
    } catch (networkErr) {
      console.warn('[API Service] Backend unreachable for categories, using mock fallback:', networkErr.message);
      await delay(60);
      return {
        success: true,
        data: CATEGORIES
      };
    }
  },

  /**
   * Fetch featured products for the home page
   */
  async getFeaturedProducts(limit = 4) {
    try {
      const res = await apiRequest(`/products/featured?limit=${limit}`);
      return {
        success: true,
        data: res.data
      };
    } catch (networkErr) {
      console.warn('[API Service] Backend unreachable for featured products, using mock fallback');
      await delay(80);
      const featured = PRODUCTS.filter((p) => p.isFeatured).slice(0, limit);
      return {
        success: true,
        data: featured
      };
    }
  },

  /**
   * Fetch trending / new arrivals
   */
  async getTrendingProducts(limit = 4) {
    try {
      const res = await apiRequest(`/products/trending?limit=${limit}`);
      return {
        success: true,
        data: res.data
      };
    } catch (networkErr) {
      console.warn('[API Service] Backend unreachable for trending products, using mock fallback');
      await delay(80);
      const trending = PRODUCTS.filter((p) => p.isTrending || p.isNew).slice(0, limit);
      return {
        success: true,
        data: trending
      };
    }
  },

  /**
   * Fetch related products for product details page
   */
  async getRelatedProducts(category, currentId, limit = 4) {
    try {
      const res = await apiRequest(
        `/products/related?category=${encodeURIComponent(category)}&currentId=${encodeURIComponent(currentId)}&limit=${limit}`
      );
      return {
        success: true,
        data: res.data
      };
    } catch (networkErr) {
      console.warn('[API Service] Backend unreachable for related products, using mock fallback');
      await delay(80);
      const related = PRODUCTS.filter(
        (p) => p.category === category && p.id !== currentId
      ).slice(0, limit);

      if (related.length < limit) {
        const others = PRODUCTS.filter(
          (p) => p.id !== currentId && !related.some((r) => r.id === p.id)
        ).slice(0, limit - related.length);
        return { success: true, data: [...related, ...others] };
      }

      return {
        success: true,
        data: related
      };
    }
  },

  /**
   * Customer Authentication: Login
   */
  async login(email, password) {
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (res.token) {
        localStorage.setItem(TOKEN_KEY, res.token);
      }

      return {
        success: true,
        user: res.user || res.data?.user,
        token: res.token || res.data?.token
      };
    } catch (err) {
      if (err.status) {
        throw new Error(err.message || 'Invalid credentials');
      }
      console.warn('[API Service] Backend offline during login, using simulated fallback');
      await delay(150);
      if (!email || !password) throw new Error('Please provide both email and password.');
      if (password.length < 6) throw new Error('Password must be at least 6 characters.');
      return {
        success: true,
        user: {
          id: 'usr-101',
          name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          email: email.toLowerCase(),
          phone: '+1 (555) 392-8172',
          role: 'customer'
        },
        token: 'mock-jwt-token-eshop-2026'
      };
    }
  },

  /**
   * Customer Authentication: Register
   */
  async register(name, email, password) {
    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });

      if (res.token) {
        localStorage.setItem(TOKEN_KEY, res.token);
      }

      return {
        success: true,
        user: res.user || res.data?.user,
        token: res.token || res.data?.token
      };
    } catch (err) {
      if (err.status) {
        throw new Error(err.message || 'Registration failed');
      }
      console.warn('[API Service] Backend offline during register, using simulated fallback');
      await delay(180);
      if (!name || !email || !password) throw new Error('All registration fields are required.');
      return {
        success: true,
        user: {
          id: `usr-${Date.now()}`,
          name,
          email: email.toLowerCase(),
          phone: '',
          role: 'customer'
        },
        token: `mock-jwt-token-${Date.now()}`
      };
    }
  },

  /**
   * Customer Authentication: Logout
   */
  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  /**
   * Customer Profile Management
   */
  async updateProfile(profileData) {
    try {
      const res = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      return { success: true, user: res.data?.user || res.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async addAddress(addressData) {
    try {
      const res = await apiRequest('/auth/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData)
      });
      return { success: true, user: res.data?.user || res.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async deleteAddress(addressId) {
    try {
      const res = await apiRequest(`/auth/addresses/${addressId}`, {
        method: 'DELETE'
      });
      return { success: true, user: res.data?.user || res.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async updateAddress(addressId, addressData) {
    try {
      const res = await apiRequest(`/auth/addresses/${addressId}`, {
        method: 'PUT',
        body: JSON.stringify(addressData)
      });
      return { success: true, user: res.data?.user || res.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Orders
   */
  async createOrder(orderData) {
    try {
      const res = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      // Synchronize in local storage for instant offline viewing
      try {
        const existingOrders = JSON.parse(localStorage.getItem('eshop_orders') || '[]');
        existingOrders.unshift(res.data);
        localStorage.setItem('eshop_orders', JSON.stringify(existingOrders));
      } catch {
        // ignore
      }

      return {
        success: true,
        data: res.data
      };
    } catch (networkErr) {
      if (networkErr.status) {
        throw new Error(networkErr.message || 'Failed to place order.');
      }
      console.warn('[API Service] Backend offline during checkout, using local fallback');
      await delay(200);
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const newOrder = {
        ...orderData,
        id: orderId,
        createdAt: new Date().toISOString(),
        status: 'Processing',
        estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        trackingNumber: `TRK-USPS-${Math.floor(10000000 + Math.random() * 90000000)}`
      };

      try {
        const existingOrders = JSON.parse(localStorage.getItem('eshop_orders') || '[]');
        existingOrders.unshift(newOrder);
        localStorage.setItem('eshop_orders', JSON.stringify(existingOrders));
      } catch {
        // ignore
      }

      return {
        success: true,
        data: newOrder
      };
    }
  },

  async getOrderById(id) {
    try {
      const res = await apiRequest(`/orders/${id}`);
      return {
        success: true,
        data: res.data
      };
    } catch (networkErr) {
      if (networkErr.status === 404) {
        throw new Error(`Order #${id} was not found.`);
      }
      console.warn('[API Service] Backend offline for order details, checking localStorage fallback');
      await delay(100);
      try {
        const orders = JSON.parse(localStorage.getItem('eshop_orders') || '[]');
        const found = orders.find((o) => o.id === id);
        if (found) return { success: true, data: found };
      } catch {
        // fallback
      }
      throw new Error(`Order #${id} was not found.`);
    }
  },

  /**
   * Reviews
   */
  async getProductReviews(productId) {
    try {
      const res = await apiRequest(`/products/${productId}/reviews`);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: true, data: [] };
    }
  },

  async submitReview(productId, reviewData) {
    const res = await apiRequest(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
    return { success: true, data: res.data };
  }
};
