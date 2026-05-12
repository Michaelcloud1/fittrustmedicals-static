// src/lib/api.ts
// Enhanced API client with better error handling and typing
import axios, { AxiosResponse } from 'axios';

// Get backend URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

// Create axios instance for API calls (with /api prefix for backend routes)
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Create health check client (without /api prefix - health endpoint is at /api/health)
const healthClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - adds auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (DEBUG_MODE) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handles responses and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (DEBUG_MODE) {
      console.log('✅ API Response:', {
        status: response.status,
        url: `${response.config.baseURL}${response.config.url}`,
        data: response.data
      });
    }

    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      if (DEBUG_MODE || process.env.NEXT_PUBLIC_SHOW_API_ERRORS === 'true') {
        console.error('❌ API Error Response:', {
          status,
          message,
          url: `${error.config?.baseURL}${error.config?.url}`,
          data: error.response.data
        });
      }

      if (status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }

      if (status === 403) {
        console.warn('⚠️ Access forbidden - insufficient permissions');
      }

      if (status >= 500) {
        console.error('💥 Server error - please try again later');
      }

    } else if (error.request) {
      console.error('🌐 Network Error:', {
        message: 'No response from server',
        baseURL: API_BASE_URL,
        fullURL: `${API_BASE_URL}/api`
      });
    } else {
      console.error('🚨 Unexpected Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// EXPORTED: Response wrapper type
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  status?: string;
  timestamp?: string;
  service?: string;
  uptime?: number;
}

// Product types
interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  stock: number;
  category?: string;
  imageUrls: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Pre-built API methods
export const apiMethods = {
  products: {
    getHomepage: async (filters?: {
      category?: string;
      search?: string;
      active?: boolean;
      limit?: number;
      offset?: number;
    }): Promise<ApiResponse<Product[]>> => {
      const response = await apiClient.get('/admin/products/list', { params: filters });
      return response.data;
    },

    getAll: async (filters?: {
      category?: string;
      search?: string;
      active?: boolean;
      limit?: number;
      offset?: number;
    }): Promise<ApiResponse<Product[]>> => {
      const response = await apiClient.get('/admin/products/list', { params: filters });
      return response.data;
    },

    getById: async (id: string): Promise<ApiResponse<Product>> => {
      const response = await apiClient.get(`/admin/products/${id}`);
      return response.data;
    },

    getBySlug: async (slug: string): Promise<ApiResponse<Product>> => {
      const response = await apiClient.get(`/admin/products/slug/${slug}`);
      return response.data;
    },

    create: async (productData: Partial<Product>): Promise<ApiResponse<Product>> => {
      const response = await apiClient.post('/admin/products', productData);
      return response.data;
    },

    update: async (id: string, updateData: Partial<Product>): Promise<ApiResponse<Product>> => {
      const response = await apiClient.put(`/admin/products/${id}`, updateData);
      return response.data;
    },

    delete: async (id: string): Promise<ApiResponse> => {
      const response = await apiClient.delete(`/admin/products/${id}`);
      return response.data;
    },

    bulkUpload: async (file: File): Promise<ApiResponse> => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/admin/products/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });
      
      return response.data;
    }
  },

  auth: {
    login: async (credentials: { email: string; password: string }): Promise<ApiResponse<{ token: string; user: any }>> => {
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.data.success && response.data.data?.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', response.data.data.token);
        }
      }
      
      return response.data;
    },

    register: async (userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }): Promise<ApiResponse<{ token: string; user: any }>> => {
      const response = await apiClient.post('/users', userData);
      return response.data;
    },

    logout: async (): Promise<ApiResponse> => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
        }
        
        return { success: true, message: 'Logged out successfully' };
      } catch (error) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
        }
        throw error;
      }
    },

    getProfile: async (): Promise<ApiResponse<any>> => {
      const response = await apiClient.get('/users/profile');
      return response.data;
    }
  },

  users: {
    getAll: async (): Promise<ApiResponse<any[]>> => {
      const response = await apiClient.get('/users');
      return response.data;
    },

    getById: async (id: string): Promise<ApiResponse<any>> => {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    },

    update: async (id: string, updateData: any): Promise<ApiResponse<any>> => {
      const response = await apiClient.put(`/users/${id}`, updateData);
      return response.data;
    },

    delete: async (id: string): Promise<ApiResponse> => {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    },

    getStats: async (): Promise<ApiResponse<any>> => {
      const response = await apiClient.get('/users/stats/overview');
      return response.data;
    }
  },

  upload: {
    image: async (file: File, folder: string = 'products'): Promise<ApiResponse<{ url: string; filename: string }>> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      
      const response = await apiClient.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });
      
      return response.data;
    }
  },

  // FIXED: Health check endpoint - now correctly calls /api/health
  health: {
    check: async (): Promise<ApiResponse> => {
      try {
        // Try with /api/health first (most NestJS apps have global prefix)
        const response = await healthClient.get('/api/health');
        return response.data;
      } catch (error: any) {
        // Fallback to /health if /api/health fails
        try {
          const fallbackResponse = await healthClient.get('/health');
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error('Health check failed:', error);
          // Return a fallback response instead of throwing
          return {
            success: false,
            status: 'error',
            message: 'Backend connection failed',
            timestamp: new Date().toISOString()
          };
        }
      }
    }
  }
};

// NEW: Simple fetch wrapper for components that need basic fetch
export async function fetchProducts() {
  try {
    const response = await apiMethods.products.getHomepage();
    return {
      success: true,
      products: response.data || [],
      source: 'api'
    };
  } catch (error) {
    console.error('fetchProducts error:', error);
    // Return mock data as fallback
    return {
      success: true,
      products: [
        {
          id: '1',
          name: 'Digital Blood Pressure Monitor',
          price: 25000,
          originalPrice: 30000,
          category: 'Diagnostic',
          description: 'Professional-grade digital blood pressure monitor.',
          image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600',
          stock: 50,
          status: 'active',
          isPromotional: true,
          discountPercentage: 17,
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          salesCount: 150,
          rating: 4.5,
          reviewCount: 45,
        },
        {
          id: '2',
          name: 'Surgical Face Masks (Pack of 50)',
          price: 3500,
          category: 'PPE',
          description: '3-ply disposable surgical masks.',
          image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600',
          stock: 200,
          status: 'active',
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          salesCount: 500,
          rating: 4.2,
          reviewCount: 89,
        }
      ],
      source: 'mock-fallback'
    };
  }
}

// NEW: Create product wrapper
export async function createProduct(productData: any) {
  try {
    const response = await apiMethods.products.create(productData);
    return response;
  } catch (error) {
    console.error('createProduct error:', error);
    throw error;
  }
}

// Export alias for compatibility
export const api = apiMethods;

// Export default client
export default apiClient;

// Export base URL
export { API_BASE_URL };

// Helper function to test all endpoints
export const testEndpoints = async () => {
  try {
    console.log('🧪 Testing API endpoints...');
    
    const health = await apiMethods.health.check();
    console.log('✅ Health:', health);
    
    const products = await apiMethods.products.getHomepage();
    console.log('✅ Products:', products);
    
    return true;
  } catch (error) {
    console.error('❌ Endpoint test failed:', error);
    return false;
  }
};