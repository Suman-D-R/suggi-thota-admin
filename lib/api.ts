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
  getAll: async (params?: { includeInactive?: boolean; storeId?: string }) => {
    const queryParams: any = {}
    if (params?.includeInactive !== undefined) queryParams.includeInactive = params.includeInactive.toString()
    if (params?.storeId) queryParams.storeId = params.storeId
    const response = await apiClient.get('/hero-banners', {
      params: queryParams,
    })
    return response.data
  },

  // Get active hero banners
  getActive: async (storeId?: string) => {
    const params = storeId ? { storeId } : undefined
    const response = await apiClient.get('/hero-banners/active', { params })
    return response.data
  },

  // Get banners by store ID
  getByStore: async (storeId: string, includeInactive?: boolean) => {
    const params: any = {}
    if (includeInactive !== undefined) params.includeInactive = includeInactive.toString()
    const response = await apiClient.get(`/hero-banners/store/${storeId}`, { params })
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


// Store API
export const storeAPI = {
  // Get all stores
  getAll: async (params?: { isActive?: boolean }) => {
    const queryParams: any = {}
    if (params?.isActive !== undefined) queryParams.isActive = params.isActive.toString()
    const response = await apiClient.get('/stores', { params: queryParams })
    return response.data
  },

  // Get store by ID
  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`/stores/${id}`)
      return response.data
    } catch (error: any) {
      // Re-throw with more context
      if (error.response) {
        throw error
      }
      throw new Error(`Failed to fetch store: ${error.message}`)
    }
  },

  // Create store
  create: async (storeData: any) => {
    const response = await apiClient.post('/stores', storeData)
    return response.data
  },

  // Update store
  update: async (id: string, storeData: any) => {
    const response = await apiClient.put(`/stores/${id}`, storeData)
    return response.data
  },

  // Delete store
  delete: async (id: string) => {
    const response = await apiClient.delete(`/stores/${id}`)
    return response.data
  },
}

// Store Product API
export const storeProductAPI = {
  // Get all store products
  getAll: async (params?: { storeId?: string; productId?: string; page?: number; limit?: number }) => {
    const queryParams: any = {}
    if (params?.storeId) queryParams.storeId = params.storeId
    if (params?.productId) queryParams.productId = params.productId
    if (params?.page !== undefined) queryParams.page = params.page.toString()
    if (params?.limit !== undefined) queryParams.limit = params.limit.toString()
    const response = await apiClient.get('/store-products', { params: queryParams })
    return response.data
  },

  // Get store products by store ID
  getByStore: async (storeId: string) => {
    const response = await apiClient.get(`/store-products/store/${storeId}`)
    return response.data
  },

  // Get store product by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/store-products/${id}`)
    return response.data
  },

  // Create store product
  create: async (storeProductData: any) => {
    const response = await apiClient.post('/store-products', storeProductData)
    return response.data
  },

  // Update store product
  update: async (id: string, storeProductData: any) => {
    const response = await apiClient.put(`/store-products/${id}`, storeProductData)
    return response.data
  },

  // Delete store product
  delete: async (id: string) => {
    const response = await apiClient.delete(`/store-products/${id}`)
    return response.data
  },
}

// Inventory Batch API
export const inventoryBatchAPI = {
  // Get all inventory batches
  getAll: async (params?: { storeId?: string; productId?: string; page?: number; limit?: number }) => {
    const queryParams: any = {}
    if (params?.storeId) queryParams.storeId = params.storeId
    if (params?.productId) queryParams.productId = params.productId
    if (params?.page !== undefined) queryParams.page = params.page.toString()
    if (params?.limit !== undefined) queryParams.limit = params.limit.toString()
    const response = await apiClient.get('/inventory-batches', { params: queryParams })
    return response.data
  },

  // Get batches by store and product
  getByStoreAndProduct: async (storeId: string, productId: string) => {
    const response = await apiClient.get(`/inventory-batches/store/${storeId}/product/${productId}`)
    return response.data
  },

  // Get inventory batch by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/inventory-batches/${id}`)
    return response.data
  },

  // Create inventory batch (GRN)
  create: async (batchData: any) => {
    const response = await apiClient.post('/inventory-batches', batchData)
    return response.data
  },

  // Update inventory batch
  update: async (id: string, batchData: any) => {
    const response = await apiClient.put(`/inventory-batches/${id}`, batchData)
    return response.data
  },

  // Delete inventory batch
  delete: async (id: string) => {
    const response = await apiClient.delete(`/inventory-batches/${id}`)
    return response.data
  },
}

// Order API
export const orderAPI = {
  // Get all orders (admin)
  getAll: async (params?: {
    page?: number
    limit?: number
    status?: string
    storeId?: string
    startDate?: string
    endDate?: string
  }) => {
    const queryParams: any = {}
    if (params?.page !== undefined) queryParams.page = params.page.toString()
    if (params?.limit !== undefined) queryParams.limit = params.limit.toString()
    if (params?.status) queryParams.status = params.status
    if (params?.storeId) queryParams.storeId = params.storeId
    if (params?.startDate) queryParams.startDate = params.startDate
    if (params?.endDate) queryParams.endDate = params.endDate
    const response = await apiClient.get('/orders', { params: queryParams })
    return response.data
  },

  // Get order by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`)
    return response.data
  },

  // Update order status
  updateStatus: async (id: string, status: string, cancelReason?: string) => {
    const payload: any = { status };
    if (cancelReason) {
      payload.cancelReason = cancelReason;
    }
    const response = await apiClient.put(`/orders/${id}/status`, payload)
    return response.data
  },

  // Assign delivery partner
  assignDeliveryPartner: async (id: string, deliveryPartnerId: string) => {
    const response = await apiClient.post(`/orders/${id}/assign-delivery-partner`, { deliveryPartnerId })
    return response.data
  },

  // Collect COD payment
  collectPayment: async (id: string, notes?: string) => {
    const response = await apiClient.post(`/orders/${id}/collect-payment`, { notes })
    return response.data
  },
}

// User API
export const userAPI = {
  // Get all users (admin)
  getAll: async (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    const queryParams: any = {}
    if (params?.page !== undefined) queryParams.page = params.page.toString()
    if (params?.limit !== undefined) queryParams.limit = params.limit.toString()
    if (params?.search) queryParams.search = params.search
    if (params?.role) queryParams.role = params.role
    const response = await apiClient.get('/users/admin/users', { params: queryParams })
    return response.data
  },

  // Get user by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  },

  // Update user role
  updateRole: async (userId: string, role: string) => {
    const response = await apiClient.put(`/users/admin/users/${userId}/role`, { role })
    return response.data
  },

  // Block/Unblock user
  toggleBlock: async (userId: string, isBlocked: boolean) => {
    const response = await apiClient.put(`/users/admin/users/${userId}/block`, { isBlocked })
    return response.data
  },
}

// Delivery Agent API
export const deliveryAgentAPI = {
  // Create delivery agent
  create: async (agentData: {
    name: string
    phone: string
    email?: string
    password: string
    storeId: string
  }) => {
    const response = await apiClient.post('/deliveries/agents', agentData)
    return response.data
  },

  // Get all delivery agents
  getAll: async (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) => {
    const queryParams: any = {}
    if (params?.page !== undefined) queryParams.page = params.page.toString()
    if (params?.limit !== undefined) queryParams.limit = params.limit.toString()
    if (params?.search) queryParams.search = params.search
    if (params?.isActive !== undefined) queryParams.isActive = params.isActive.toString()
    const response = await apiClient.get('/deliveries/agents', { params: queryParams })
    return response.data
  },

  // Get delivery agent by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/deliveries/agents/${id}`)
    return response.data
  },

  // Update delivery agent
  update: async (id: string, agentData: { name?: string; email?: string; isActive?: boolean }) => {
    const response = await apiClient.put(`/deliveries/agents/${id}`, agentData)
    return response.data
  },

  // Delete delivery agent
  delete: async (id: string) => {
    const response = await apiClient.delete(`/deliveries/agents/${id}`)
    return response.data
  },
}

