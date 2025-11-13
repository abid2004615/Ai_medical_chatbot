/**
 * API Client for communicating with the Flask backend
 */

// ============================================
// TypeScript Interfaces
// ============================================

export interface SendMessageParams {
  message: string
  sessionId: string
  image?: File
  audio?: Blob
}

export interface ApiResponse {
  transcription?: string
  response: string
  audio_url?: string
  input_type: string[]
  error?: string
  severity?: SeverityInfo
  response_time?: number
}

export interface SeverityInfo {
  level: 'EMERGENCY' | 'HIGH' | 'MODERATE' | 'LOW' | 'MINIMAL'
  score: number
  keywords: string[]
  message: string
}

export interface MetricsSummary {
  avg_response_time: number
  avg_accuracy: number
  total_queries: number
  successful_responses: number
  success_rate: number
}

export interface HealthCheckResponse {
  status: 'ok' | 'error'
  message: string
  timestamp: number
  version?: string
}

export enum ErrorType {
  BACKEND_NOT_RUNNING = 'BACKEND_NOT_RUNNING',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN'
}

export class ApiError extends Error {
  public type: ErrorType
  public userMessage: string
  public technicalMessage: string
  public retryable: boolean

  constructor(
    public statusCode: number,
    message: string,
    public originalError?: Error,
    type?: ErrorType
  ) {
    super(message)
    this.name = "ApiError"
    this.technicalMessage = message
    
    // Classify error type if not provided
    this.type = type || this.classifyError(statusCode, message, originalError)
    
    // Set user-friendly message and retryability
    const errorInfo = this.getErrorInfo(this.type)
    this.userMessage = errorInfo.userMessage
    this.retryable = errorInfo.retryable
  }

  private classifyError(statusCode: number, message: string, originalError?: Error): ErrorType {
    // Network errors (fetch failed)
    if (statusCode === 0 || originalError?.name === 'TypeError') {
      const errorMsg = originalError?.message?.toLowerCase() || message.toLowerCase()
      if (errorMsg.includes('failed to fetch') || errorMsg.includes('network request failed')) {
        return ErrorType.BACKEND_NOT_RUNNING
      }
      return ErrorType.NETWORK_ERROR
    }

    // Timeout errors
    if (message.toLowerCase().includes('timeout')) {
      return ErrorType.TIMEOUT
    }

    // Server errors
    if (statusCode >= 500) {
      return ErrorType.SERVER_ERROR
    }

    // Connection refused
    if (message.toLowerCase().includes('connection refused') || 
        message.toLowerCase().includes('econnrefused')) {
      return ErrorType.CONNECTION_REFUSED
    }

    return ErrorType.UNKNOWN
  }

  private getErrorInfo(type: ErrorType): { userMessage: string; retryable: boolean } {
    const ERROR_MESSAGES: Record<ErrorType, { userMessage: string; retryable: boolean }> = {
      [ErrorType.BACKEND_NOT_RUNNING]: {
        userMessage: 'Backend server is not running. Please start the Flask server on port 5000.',
        retryable: false
      },
      [ErrorType.CONNECTION_REFUSED]: {
        userMessage: 'Unable to connect to the medical assistant. Please check your connection.',
        retryable: true
      },
      [ErrorType.TIMEOUT]: {
        userMessage: 'Request timed out. Please try again.',
        retryable: true
      },
      [ErrorType.SERVER_ERROR]: {
        userMessage: 'The server encountered an error. Please try again later.',
        retryable: true
      },
      [ErrorType.NETWORK_ERROR]: {
        userMessage: 'Network error occurred. Please check your internet connection.',
        retryable: true
      },
      [ErrorType.UNKNOWN]: {
        userMessage: 'An unexpected error occurred. Please try again.',
        retryable: true
      }
    }

    return ERROR_MESSAGES[type]
  }
}

// ============================================
// Configuration
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second

// ============================================
// Helper Functions
// ============================================

/**
 * Delay function for retry logic
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Build FormData for multipart requests
 */
function buildFormData(params: SendMessageParams): FormData {
  const formData = new FormData()

  if (params.message) {
    formData.append("message", params.message)
  }

  if (params.sessionId) {
    formData.append("session_id", params.sessionId)
  }

  if (params.image) {
    formData.append("image", params.image)
  }

  if (params.audio) {
    formData.append("audio", params.audio, "voice_input.wav")
  }

  return formData
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get or create session ID from sessionStorage
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return generateSessionId()

  let sessionId = sessionStorage.getItem("chat_session_id")
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem("chat_session_id", sessionId)
  }
  return sessionId
}

// ============================================
// API Client Class
// ============================================

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Fetch with retry logic and exponential backoff
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries: number = MAX_RETRIES
  ): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`[API] Request attempt ${i + 1}/${retries}:`, url)

        const response = await fetch(url, options)

        // If successful, return response
        if (response.ok) {
          console.log(`[API] Success:`, response.status)
          return response
        }

        // If server error and retries remaining, retry
        if (response.status >= 500 && i < retries - 1) {
          const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, i)
          console.log(`[API] Server error, retrying in ${retryDelay}ms...`)
          await delay(retryDelay)
          continue
        }

        // Otherwise, throw error
        const errorText = await response.text()
        throw new ApiError(response.status, errorText)
      } catch (error) {
        // If last retry, throw error
        if (i === retries - 1) {
          console.error(`[API] All retries failed:`, error)
          if (error instanceof ApiError) {
            throw error
          }
          throw new ApiError(0, "Network error", error as Error)
        }

        // Otherwise, retry with exponential backoff
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, i)
        console.log(`[API] Network error, retrying in ${retryDelay}ms...`)
        await delay(retryDelay)
      }
    }

    throw new ApiError(0, "Max retries exceeded")
  }

  /**
   * Send a message to the backend API
   */
  async sendMessage(params: SendMessageParams): Promise<ApiResponse> {
    const formData = buildFormData(params)
    const url = `${this.baseUrl}/api/process`

    const response = await this.fetchWithRetry(url, {
      method: "POST",
      body: formData,
    })

    const data = await response.json()
    return data as ApiResponse
  }

  /**
   * Upload an image with optional text message
   */
  async uploadImage(file: File, message?: string): Promise<ApiResponse> {
    const sessionId = getSessionId()
    return this.sendMessage({
      message: message || "",
      sessionId,
      image: file,
    })
  }

  /**
   * Send voice recording with optional text message
   */
  async sendVoice(audioBlob: Blob, message?: string): Promise<ApiResponse> {
    const sessionId = getSessionId()
    return this.sendMessage({
      message: message || "",
      sessionId,
      audio: audioBlob,
    })
  }

  /**
   * Check backend health status
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    const url = `${this.baseUrl}/api/health`
    
    try {
      const response = await fetch(url, {
        method: "GET",
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })

      if (response.ok) {
        const data = await response.json()
        return data as HealthCheckResponse
      }

      return {
        status: 'error',
        message: `Health check failed with status ${response.status}`,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('[API] Health check failed:', error)
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Health check failed',
        timestamp: Date.now()
      }
    }
  }

  /**
   * Check if backend is available
   */
  async isBackendAvailable(): Promise<boolean> {
    const health = await this.checkHealth()
    return health.status === 'ok'
  }

  /**
   * Get ML metrics summary
   */
  async getMetrics(): Promise<MetricsSummary> {
    const url = `${this.baseUrl}/api/metrics`
    
    try {
      const response = await fetch(url)
      if (response.ok) {
        return await response.json()
      }
      throw new Error('Failed to fetch metrics')
    } catch (error) {
      console.error('[API] Failed to fetch metrics:', error)
      throw error
    }
  }

  /**
   * Get health trends for a session
   */
  async getHealthTrends(sessionId: string): Promise<any> {
    const url = `${this.baseUrl}/api/health-trends/${sessionId}`
    
    try {
      const response = await fetch(url)
      if (response.ok) {
        return await response.json()
      }
      throw new Error('Failed to fetch health trends')
    } catch (error) {
      console.error('[API] Failed to fetch health trends:', error)
      throw error
    }
  }
}

// ============================================
// Export singleton instance
// ============================================

export const apiClient = new ApiClient()
