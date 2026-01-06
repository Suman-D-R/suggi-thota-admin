// Authentication utility functions
import axios from 'axios'

const TOKEN_KEY = 'auth_token'
const TOKEN_EXPIRY_KEY = 'auth_token_expiry'
const REFRESH_TOKEN_KEY = 'refresh_token'
const REMEMBERED_EMAIL_KEY = 'remembered_email'
const REMEMBERED_PASSWORD_KEY = 'remembered_password'

// API base URL - can be overridden with environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export interface AuthToken {
  token: string
  expiresAt: number // timestamp in milliseconds
}

export interface LoginResponse {
  success: boolean
  token?: string
  error?: string
  user?: {
    id: string
    name: string
    email: string
    phone: string
    role: string
    isVerified: boolean
  }
}

/**
 * Store authentication token
 */
export function setAuthToken(token: string, expiresInSeconds: number = 3600): void {
  const expiresAt = Date.now() + expiresInSeconds * 1000
  if (typeof window !== 'undefined') {
    // Store in localStorage
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString())
    
    // Also set cookie for middleware to check
    const expiryDate = new Date(expiresAt)
    document.cookie = `auth_token=${token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`
  }
}

/**
 * Store refresh token
 */
export function setRefreshToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  }
}

/**
 * Get authentication token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Check if token exists and is valid (not expired)
 */
export function isTokenValid(): boolean {
  if (typeof window === 'undefined') return false
  
  const token = getAuthToken()
  if (!token) return false

  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!expiryStr) return false

  const expiresAt = parseInt(expiryStr, 10)
  const now = Date.now()

  return now < expiresAt
}

/**
 * Remove authentication token
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    // Also clear cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

/**
 * Save remembered credentials (email and password)
 * Note: Storing password in localStorage is for convenience only
 */
export function saveRememberedCredentials(email: string, password: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
    localStorage.setItem(REMEMBERED_PASSWORD_KEY, password)
  }
}

/**
 * Get remembered credentials
 */
export function getRememberedCredentials(): { email: string; password: string } | null {
  if (typeof window === 'undefined') return null
  
  const email = localStorage.getItem(REMEMBERED_EMAIL_KEY)
  const password = localStorage.getItem(REMEMBERED_PASSWORD_KEY)
  
  if (email && password) {
    return { email, password }
  }
  
  return null
}

/**
 * Clear remembered credentials
 */
export function clearRememberedCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REMEMBERED_EMAIL_KEY)
    localStorage.removeItem(REMEMBERED_PASSWORD_KEY)
  }
}

/**
 * Logout function - clears tokens and optionally calls backend
 */
export async function logout(): Promise<void> {
  try {
    // Optionally call backend logout API (non-blocking)
    const token = getAuthToken()
    if (token) {
      try {
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )
      } catch (error) {
        // Ignore errors from backend logout - we'll clear tokens anyway
        console.warn('Backend logout failed, clearing tokens locally')
      }
    }
  } catch (error) {
    // Ignore errors - we'll clear tokens anyway
  } finally {
    // Always clear tokens and credentials from client
    clearAuthToken()
    clearRememberedCredentials()
  }
}

/**
 * Admin login API call
 */
export async function adminLogin(loginId: string, password: string): Promise<LoginResponse> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/admin/login`,
      {
        loginId,
        password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.data.success && response.data.data) {
      const { user, tokens } = response.data.data
      
      // Store access token (15 minutes expiry)
      setAuthToken(tokens.accessToken, 15 * 60)
      
      // Store refresh token
      setRefreshToken(tokens.refreshToken)

      return {
        success: true,
        token: tokens.accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
      }
    }

    return {
      success: false,
      error: response.data.message || 'Login failed',
    }
  } catch (error: any) {
    // Handle axios errors
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        error: error.response.data?.message || 'Login failed. Please check your credentials.',
      }
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        error: 'Unable to connect to server. Please check your connection.',
      }
    } else {
      // Something else happened
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      }
    }
  }
}

