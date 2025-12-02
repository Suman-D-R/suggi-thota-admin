// API utility functions
import axios from 'axios'
import { getAuthToken } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Product API
export const productAPI = {
  // Get all products with pagination and filters
  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    isActive?: boolean
    isOutOfStock?: boolean
  }) => {
    // Convert params to query string format, ensuring booleans are strings
    const queryParams: any = {}
    if (params) {
      if (params.page !== undefined) queryParams.page = params.page.toString()
      if (params.limit !== undefined) queryParams.limit = params.limit.toString()
      if (params.search) queryParams.search = params.search
      if (params.category) queryParams.category = params.category
      if (params.isActive !== undefined) queryParams.isActive = params.isActive.toString()
      if (params.isOutOfStock !== undefined) queryParams.isOutOfStock = params.isOutOfStock.toString()
    }
    const response = await apiClient.get('/products', { params: queryParams })
    return response.data
  },

  // Get product by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },

  // Create product
  create: async (productData: FormData) => {
    const response = await apiClient.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Update product
  update: async (id: string, productData: FormData) => {
    const response = await apiClient.put(`/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Delete product (soft delete - sets isActive to false)
  delete: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`)
    return response.data
  },

  // Hard delete product (permanent deletion)
  hardDelete: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}/hard`)
    return response.data
  },
}

// Category API
export const categoryAPI = {
  // Get all categories
  getAll: async (includeInactive?: boolean) => {
    const response = await apiClient.get('/categories', {
      params: { includeInactive },
    })
    return response.data
  },

  // Get main categories
  getMain: async () => {
    const response = await apiClient.get('/categories/main')
    return response.data
  },

  // Get subcategories by parent
  getSubcategories: async (parentId: string) => {
    const response = await apiClient.get(`/categories/${parentId}/subcategories`)
    return response.data
  },

  // Get category by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/categories/${id}`)
    return response.data
  },

  // Create category
  create: async (categoryData: any) => {
    // If FormData, use multipart/form-data header (same pattern as products)
    const isFormData = categoryData instanceof FormData
    const config = isFormData
      ? {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      : {}
    const response = await apiClient.post('/categories', categoryData, config)
    return response.data
  },

  // Update category
  update: async (id: string, categoryData: any) => {
    // If FormData, use multipart/form-data header (same pattern as products)
    const isFormData = categoryData instanceof FormData
    const config = isFormData
      ? {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      : {}
    const response = await apiClient.put(`/categories/${id}`, categoryData, config)
    return response.data
  },

  // Delete category (soft delete)
  delete: async (id: string) => {
    const response = await apiClient.delete(`/categories/${id}`)
    return response.data
  },

  // Hard delete category (permanent)
  hardDelete: async (id: string) => {
    const response = await apiClient.delete(`/categories/${id}/hard`)
    return response.data
  },
}

// Hero Banner API
export const heroBannerAPI = {
  // Get all hero banners
  getAll: async (includeInactive?: boolean) => {
    const response = await apiClient.get('/hero-banners', {
      params: { includeInactive },
    })
    return response.data
  },

  // Get active hero banners
  getActive: async () => {
    const response = await apiClient.get('/hero-banners/active')
    return response.data
  },

  // Get hero banner by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/hero-banners/${id}`)
    return response.data
  },

  // Create hero banner
  create: async (bannerData: FormData) => {
    const response = await apiClient.post('/hero-banners', bannerData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Update hero banner
  update: async (id: string, bannerData: FormData) => {
    const response = await apiClient.put(`/hero-banners/${id}`, bannerData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Delete hero banner (soft delete - sets isActive to false)
  delete: async (id: string) => {
    const response = await apiClient.delete(`/hero-banners/${id}`)
    return response.data
  },

  // Hard delete hero banner (permanent deletion)
  hardDelete: async (id: string) => {
    const response = await apiClient.delete(`/hero-banners/${id}/hard`)
    return response.data
  },
}

