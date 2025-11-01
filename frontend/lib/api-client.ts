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
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = "ApiError"
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
}

// ============================================
// Export singleton instance
// ============================================

export const apiClient = new ApiClient()
